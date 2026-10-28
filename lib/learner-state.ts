"use client";

import { useCallback, useMemo, useSyncExternalStore, type Dispatch, type SetStateAction } from "react";
import { getProgressAccount, useProgressAccount } from "./progress";
import { reconcileLearnerValue } from "./learner-reconcile";

// Records contain authored work, not credentials or executable server-side code.
// Revisions prevent a stale device from silently writing over a newer server revision.
export interface SavedRecord { key: string; value: unknown; revision: number; mutationId: string; updatedAt?: string }
interface Entry extends SavedRecord { dirty: boolean; conflict?: SavedRecord; recovery?: SavedRecord; legacyKeys?: string[]; legacyOnly?: boolean }
export class LearnerStorageLimit extends Error {}
function checkLimit(response: Response) {
  if (response.status === 413 || response.status === 422) throw new LearnerStorageLimit("This activity could not sync because its data is invalid or a storage limit was reached. Download your saved work before clearing or shortening it.");
}
const PREFIX = "fitlab.learning.v1:";
const preference = (key: string) => key.startsWith("preferences:");
const cache = new Map<string, Entry>();
const hydratedAccounts = new Set<string>();
const listeners = new Set<() => void>();
const changes = new Set<() => void>();
let version = 0;
let storageFailed = false;
const address = (key: string, account: string | null) => `${PREFIX}${account ?? "guest"}:${key}`;
const uuid = () => crypto.randomUUID();
const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);

function conforms(value: unknown, initial: unknown): boolean {
  if (initial === null || initial === undefined) return true;
  // Initial array items are examples, not a schema: movable workshop pieces,
  // variable-size datasets and optional fields can legitimately differ.
  if (Array.isArray(initial)) return Array.isArray(value);
  if (typeof initial === "object") return !!value && typeof value === "object" && !Array.isArray(value) &&
    Object.entries(initial).every(([key, child]) => conforms((value as Record<string, unknown>)[key], child));
  return typeof value === typeof initial && (typeof value !== "number" || Number.isFinite(value));
}

export function fingerprint(value: unknown) {
  let hash = 2166136261;
  for (const character of JSON.stringify(value)) hash = Math.imul(hash ^ character.charCodeAt(0), 16777619);
  return (hash >>> 0).toString(16);
}

function validRecord(raw: unknown): raw is SavedRecord {
  if (!raw || typeof raw !== "object") return false;
  const row = raw as SavedRecord;
  return /^[a-z][A-Za-z0-9:./_-]{0,511}$/.test(row.key) && Number.isInteger(row.revision) && row.revision >= 0 && typeof row.mutationId === "string" && "value" in row;
}

function read(key: string, account: string | null): Entry | undefined {
  const id = address(key, account);
  // Preferences may remain on this browser. Learning records are read only
  // from this visit's memory or the authenticated backend, never a guest cache.
  if (preference(key) && !cache.has(id)) try {
    const value = JSON.parse(localStorage.getItem(id) ?? "null");
    if (validRecord(value) && value.key === key) cache.set(id, value as Entry);
  } catch { /* A missing or damaged cache never prevents learning. */ }
  return cache.get(id);
}

function announce(local = false) {
  version++;
  listeners.forEach(listener => listener());
  if (local) changes.forEach(listener => listener());
}

function save(entry: Entry, account: string | null, local = false) {
  const id = address(entry.key, account);
  cache.set(id, entry);
  if (preference(entry.key)) try { localStorage.setItem(id, JSON.stringify(entry)); }
  catch { storageFailed = true; }
  announce(local);
}

function entries(account: string | null): Entry[] {
  const prefix = address("", account);
  return [...cache.entries()].filter(([id]) => id.startsWith(prefix)).map(([, value]) => value);
}

function retireLegacy(keys: string[]) {
  for (const key of keys) try { localStorage.removeItem(key); } catch { /* No new browser copy is written. */ }
}

/** Old unowned guest work must not reappear after reload or sign-in. */
export function discardLegacyGuestLearning() {
  const keys: string[] = [];
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key) continue;
      const guestRecord = key.startsWith(`${PREFIX}guest:`) && !preference(key.slice(`${PREFIX}guest:`.length));
      if (guestRecord || key === "oop_ml.progress.v1" || key === "fitlab.neuron-lab.code.v1" ||
        key.startsWith("fitlab-construction-v1:") || /^oop_ml\.code\.v1:\/(concepts|primers)\//.test(key)) keys.push(key);
    }
  } catch { return; }
  retireLegacy(keys);
}

/** Called only after a complete read for the authenticated account. */
function migrateAccountCache(account: string, remote: Map<string, SavedRecord>) {
  const prefix = address("", account);
  const legacy: { storageKey: string; entry: Entry }[] = [];
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const storageKey = localStorage.key(i);
      if (!storageKey?.startsWith(prefix)) continue;
      const key = storageKey.slice(prefix.length);
      if (preference(key)) continue;
      try {
        const entry: unknown = JSON.parse(localStorage.getItem(storageKey) ?? "null");
        if (validRecord(entry) && entry.key === key) legacy.push({ storageKey, entry: entry as Entry });
      } catch { /* A damaged old record cannot replace account work. */ }
    }
  } catch { return; }
  for (const { storageKey, entry } of legacy) {
    const current = read(entry.key, account), server = remote.get(entry.key);
    // New edits made during this visit take priority over an old cache.
    if (current?.dirty) {
      save({ ...current, legacyKeys: [...new Set([...(current.legacyKeys ?? []), storageKey])] }, account);
    } else if (!server) {
      // An absent key can use a conditional create. Existing server work is
      // authoritative because an old cache has no trustworthy widget schema.
      save({ key: entry.key, value: entry.value, revision: 0,
        mutationId: uuid(), dirty: true, legacyKeys: [storageKey], legacyOnly: true }, account);
    } else {
      // On an ambiguous version, keep the server as current. Retain the old
      // value in this visit's downloadable recovery data before retiring it.
      if (current && !same(entry.value, server.value)) save({ ...current, recovery: entry }, account);
      retireLegacy([storageKey]);
    }
  }
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
}

/** A read-only view for the learning map. Opening a map never creates progress. */
export function useLearnerRecords(prefix: string) {
  const account = useProgressAccount();
  const revision = useSyncExternalStore(subscribe, () => version, () => 0);
  const hydrated = useSyncExternalStore(subscribe, () => true, () => false);
  return useMemo(() => !hydrated ? [] : entries(account).filter(entry => entry.key.startsWith(prefix)),
    // Every local or remote record change advances the store's revision.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [account, prefix, revision, hydrated]);
}

function rebaseCurrent(local: Entry, remote: SavedRecord): Entry {
  // Keep the learner's unsent edit as their current work. Retain the displaced
  // server value locally for recovery, without requiring a save-slot chooser.
  return { key: local.key, value: reconcileLearnerValue(local.key, local.value, remote.value), revision: remote.revision,
    mutationId: uuid(), dirty: true, recovery: remote };
}

// Defaults are read once per mounted record. Setters write immediately, so
// navigation/unmount does not lose the last edit and mounting cannot upload defaults.
export function useLearnerState<T>(key: string, initial: T | (() => T), options?: {
  validate?: (value: unknown) => boolean;
}): [T, Dispatch<SetStateAction<T>>] {
  const account = useProgressAccount();
  // A content revision belongs in the key. A fresh inline defaults object must
  // not change the server snapshot or setter on every render.
  const configuration = useMemo(() => ({ fallback: typeof initial === "function" ? (initial as () => T)() : initial, validate: options?.validate }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [key]);
  const { fallback, validate } = configuration;
  const get = () => {
    const entry = read(key, account);
    if (entry) return (conforms(entry.value, fallback) && (!validate || validate(entry.value))) ? entry.value as T : fallback;
    return fallback;
  };
  const value = useSyncExternalStore(subscribe, get, () => fallback);
  const setValue = useCallback<Dispatch<SetStateAction<T>>>((update) => {
    if (getProgressAccount() !== account) return; // An old async execution belongs to its old account.
    if (account && !preference(key) && !hydratedAccounts.has(account)) return;
    const current = read(key, account);
    const previous = current && conforms(current.value, fallback) && (!validate || validate(current.value)) ? current.value as T : fallback;
    const next = typeof update === "function" ? (update as (value: T) => T)(previous) : update;
    if (same(previous, next)) return;
    save({ ...current, key, value: next, revision: current?.revision ?? 0, mutationId: uuid(), dirty: true, legacyOnly: false }, account, true);
  }, [key, account, fallback, validate]);
  return [value, setValue];
}

// Multiple fields of one activity share one revision and one atomic save.
export function useLearnerRecord<T extends object>(key: string, initial: T | (() => T), validate?: (value: unknown) => boolean) {
  const [value, set] = useLearnerState(key, initial, { validate });
  const keys = JSON.stringify(Object.keys(value));
  const setters = useMemo(() => Object.fromEntries((JSON.parse(keys) as (keyof T)[]).map(name => [name,
    (update: SetStateAction<T[typeof name]>) => set(previous => ({
      ...previous, [name]: typeof update === "function" ? (update as (old: T[typeof name]) => T[typeof name])(previous[name]) : update,
    })),
  ])) as { [K in keyof T]: Dispatch<SetStateAction<T[K]>> }, [keys, set]);
  return { value, set, setters };
}

export function useLearnerField<T extends object, K extends keyof T>(record: { value: T; setters: { [P in keyof T]: Dispatch<SetStateAction<T[P]>> } }, name: K): [T[K], Dispatch<SetStateAction<T[K]>>] {
  return [record.value[name], record.setters[name]];
}

export function onLearnerChange(listener: () => void) {
  changes.add(listener);
  return () => { changes.delete(listener); };
}

export function listenForLearnerStorage() {
  const storage = (event: StorageEvent) => {
    if (!event.key?.startsWith(PREFIX)) return;
    const account = getProgressAccount(), prefix = address("", account);
    if (!event.key.startsWith(prefix) || !preference(event.key.slice(prefix.length))) return;
    // Keep an unsent local edit; the server will arbitrate simultaneous tabs.
    if (!cache.get(event.key)?.dirty) cache.delete(event.key);
    announce(true);
  };
  window.addEventListener("storage", storage);
  return () => window.removeEventListener("storage", storage);
}

export async function syncLearnerState(account: string, active: () => boolean, request: (path: string, init?: RequestInit) => Promise<Response>) {
  const headers = { "Content-Type": "application/json", "X-FitLab-Account": account };
  let cursor: string | null = null;
  const visited = new Set<string>();
  const received = new Map<string, SavedRecord>();
  do {
    if (!active()) return;
    const response = await request("learner-state?limit=128" + (cursor ? "&after=" + encodeURIComponent(cursor) : ""), { headers });
    if (!response.ok) throw new Error("Could not load saved work");
    const result = await response.json();
    if (!active()) return;
    if (!Array.isArray(result.records) || !result.records.every(validRecord)) throw new Error("Invalid saved work");
    for (const remote of result.records as SavedRecord[]) {
      if (received.has(remote.key)) throw new Error("Duplicate saved-work record");
      received.set(remote.key, remote);
    }
    const next = result.nextCursor ?? null;
    if (next !== null && (typeof next !== "string" || !/^[a-z][A-Za-z0-9:./_-]{0,511}$/.test(next) || visited.has(next) || visited.size >= 256)) throw new Error("Invalid saved-work page cursor");
    if (next !== null) visited.add(next);
    cursor = next;
  } while (cursor !== null);
  if (!active()) return;
  for (const remote of received.values()) {
      const local = read(remote.key, account);
      if (!local?.dirty) {
        const next = { ...remote, dirty: false, ...(local?.recovery ? { recovery: local.recovery } : {}) };
        if (!same(local, next)) save(next, account);
      } else if (same(local.value, remote.value)) {
        save({ ...remote, dirty: false, ...(local.recovery ? { recovery: local.recovery } : {}) }, account);
        retireLegacy(local.legacyKeys ?? []);
      } else if (remote.revision !== local.revision) {
        if (local.legacyOnly) {
          save({ ...remote, dirty: false, recovery: local }, account);
          retireLegacy(local.legacyKeys ?? []);
        } else save({ ...rebaseCurrent(local, remote), ...(local.legacyKeys ? { legacyKeys: local.legacyKeys } : {}) }, account);
      }
  }
  migrateAccountCache(account, received);
  if (!hydratedAccounts.has(account)) {
    hydratedAccounts.add(account);
    announce();
  }
  for (const pending of entries(account)) {
    if (!active()) return;
    let local = read(pending.key, account)!;
    if (!local.dirty) continue;
    // Upgrade unresolved conflicts left by the earlier version of the site.
    if (local.conflict) { local = rebaseCurrent(local, local.conflict); save(local, account); }
    const sent = { key: local.key, value: local.value, revision: local.revision, mutationId: local.mutationId };
    const reply = await request("learner-state", { method: "PUT", headers, body: JSON.stringify(sent) });
    checkLimit(reply);
    const remote = await reply.json();
    if (!active()) return;
    const current = read(sent.key, account)!;
    if (reply.status === 409 && validRecord(remote.current)) {
      if (remote.current.key !== sent.key) throw new Error("Invalid saved work");
      if (current.legacyOnly) {
        save({ ...remote.current, dirty: false, recovery: current }, account);
        retireLegacy(current.legacyKeys ?? []);
      } else save({ ...rebaseCurrent(current, remote.current), ...(current.legacyKeys ? { legacyKeys: current.legacyKeys } : {}) }, account);
      continue;
    }
    if (!reply.ok || !validRecord(remote) || remote.key !== sent.key) throw new Error("Could not save work");
    save(current.mutationId === sent.mutationId
      ? { ...remote, dirty: false, ...(current.recovery ? { recovery: current.recovery } : {}) }
      : { ...current, revision: remote.revision }, account);
    retireLegacy(current.legacyKeys ?? []);
  }
}

export function hasPendingLearnerState(account: string) {
  return entries(account).some(entry => entry.dirty);
}

/** Account edits require a complete authoritative read, not an offline hint. */
export function useLearnerHydrated() {
  const account = useProgressAccount();
  return useSyncExternalStore(subscribe, () => !account || hydratedAccounts.has(account), () => false);
}

export function useLearnerStorageStatus() {
  useProgressAccount();
  useSyncExternalStore(subscribe, () => version, () => 0);
  const account = getProgressAccount();
  return { storageFailed, conflicts: typeof window === "undefined" ? [] : entries(account).filter(entry => entry.conflict) };
}

export function resolveLearnerConflict(key: string, choice: "local" | "remote") {
  const account = getProgressAccount();
  const entry = read(key, account);
  if (!entry?.conflict) return;
  const remote = entry.conflict;
  save(choice === "remote" ? { ...remote, dirty: false } : {
    key, value: entry.value, revision: remote.revision, mutationId: uuid(), dirty: true,
  }, account, true);
}

export function hasGuestWork() { return entries(null).length > 0; }

export function importGuestWork() {
  const account = getProgressAccount();
  if (!account) return;
  for (const guest of entries(null)) {
    // Existing account work always wins. The guest copy remains available.
    if (!read(guest.key, account)) save({ key: guest.key, value: guest.value, revision: 0, mutationId: uuid(), dirty: true }, account, true);
  }
}

export function migrateLearnerRecord(key: string, value: unknown, account = getProgressAccount(), legacyKeys: string[] = []) {
  if (!preference(key) && (!account || !hydratedAccounts.has(account))) return;
  if (!read(key, account)) save({ key, value, revision: 0, mutationId: uuid(), dirty: true,
    ...(legacyKeys.length ? { legacyKeys, legacyOnly: true } : {}) }, account, true);
  else {
    const existing = read(key, account)!;
    if (existing.dirty && legacyKeys.some(source => !existing.legacyKeys?.includes(source))) {
      save({ ...existing, legacyKeys: [...new Set([...(existing.legacyKeys ?? []), ...legacyKeys])] }, account);
    } else if (!existing.dirty) {
      if (legacyKeys.length && !same(existing.value, value)) save({ ...existing,
        recovery: { key, value, revision: 0, mutationId: uuid() } }, account);
      retireLegacy(legacyKeys);
    }
  }
}

export function exportLearnerWork() {
  return entries(getProgressAccount()).map(({ key, value, conflict, recovery }) => ({ key, value,
    ...(conflict || recovery ? { previousDeviceCopy: (conflict ?? recovery)!.value } : {}) }));
}
