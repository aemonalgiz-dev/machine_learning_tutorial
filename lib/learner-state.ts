"use client";

import { useCallback, useMemo, useSyncExternalStore, type Dispatch, type SetStateAction } from "react";
import { getProgressAccount, useProgressAccount } from "./progress";

// Records contain authored work, not credentials or executable server-side code.
// Revisions make a conflicting device edit explicit instead of choosing a winner.
export interface SavedRecord { key: string; value: unknown; revision: number; mutationId: string; updatedAt?: string }
interface Entry extends SavedRecord { dirty: boolean; conflict?: SavedRecord }
export class LearnerStorageLimit extends Error {}
function checkLimit(response: Response) {
  if (response.status === 413 || response.status === 422) throw new LearnerStorageLimit("This activity could not sync because its data is invalid or a storage limit was reached. Download your saved work before clearing or shortening it.");
}
const PREFIX = "fitlab.learning.v1:";
const cache = new Map<string, Entry>();
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
  if (!cache.has(id)) try {
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
  try { localStorage.setItem(id, JSON.stringify(entry)); }
  catch { storageFailed = true; }
  announce(local);
}

function entries(account: string | null): Entry[] {
  const prefix = address("", account);
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const id = localStorage.key(i);
      if (id?.startsWith(prefix)) read(id.slice(prefix.length), account);
    }
  } catch { /* In-memory saves still sync while this tab stays open. */ }
  return [...cache.entries()].filter(([id]) => id.startsWith(prefix)).map(([, value]) => value);
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
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
    const current = read(key, account);
    const previous = current && conforms(current.value, fallback) && (!validate || validate(current.value)) ? current.value as T : fallback;
    const next = typeof update === "function" ? (update as (value: T) => T)(previous) : update;
    if (same(previous, next)) return;
    save({ ...current, key, value: next, revision: current?.revision ?? 0, mutationId: uuid(), dirty: true }, account, true);
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
    // Keep an unsent local edit; the server will arbitrate simultaneous tabs.
    if (!cache.get(event.key)?.dirty) cache.delete(event.key);
    announce(true);
  };
  window.addEventListener("storage", storage);
  return () => window.removeEventListener("storage", storage);
}

export async function syncLearnerState(account: string, active: () => boolean, request: (path: string, init?: RequestInit) => Promise<Response>) {
  const headers = { "Content-Type": "application/json", "X-FitLab-Account": account };
  const response = await request("learner-state", { headers });
  if (!response.ok) throw new Error("Could not load saved work");
  const result = await response.json();
  if (!active()) return;
  if (!Array.isArray(result.records) || !result.records.every(validRecord)) throw new Error("Invalid saved work");
  for (const remote of result.records as SavedRecord[]) {
    const local = read(remote.key, account);
    if (!local?.dirty) {
      if (!same(local, { ...remote, dirty: false })) save({ ...remote, dirty: false }, account);
    } else if (same(local.value, remote.value)) {
      save({ ...remote, dirty: false }, account);
    } else if (remote.revision !== local.revision) {
      save({ ...local, conflict: remote }, account);
    }
  }
  for (const pending of entries(account)) {
    if (!active()) return;
    const local = read(pending.key, account)!;
    if (!local.dirty || local.conflict) continue;
    const sent = { key: local.key, value: local.value, revision: local.revision, mutationId: local.mutationId };
    const reply = await request("learner-state", { method: "PUT", headers, body: JSON.stringify(sent) });
    checkLimit(reply);
    const remote = await reply.json();
    if (!active()) return;
    const current = read(sent.key, account)!;
    if (reply.status === 409 && validRecord(remote.current)) {
      save({ ...current, conflict: remote.current }, account);
      continue;
    }
    if (!reply.ok || !validRecord(remote) || remote.key !== sent.key) throw new Error("Could not save work");
    save(current.mutationId === sent.mutationId
      ? { ...remote, dirty: false }
      : { ...current, revision: remote.revision }, account);
  }
}

export function hasPendingLearnerState(account: string) {
  return entries(account).some(entry => entry.dirty && !entry.conflict);
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

export function migrateLearnerRecord(key: string, value: unknown, account = getProgressAccount()) {
  if (!read(key, account)) save({ key, value, revision: 0, mutationId: uuid(), dirty: true }, account, true);
}

export function exportLearnerWork() {
  return entries(getProgressAccount()).map(({ key, value, conflict }) => ({ key, value, ...(conflict ? { otherDevice: conflict.value } : {}) }));
}
