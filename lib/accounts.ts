"use client";

import { useSyncExternalStore } from "react";
import { onProgressChange, readProgress, receiveProgress, setProgressAccount } from "./progress";
import { hasPendingLearnerState, LearnerStorageLimit, listenForLearnerStorage, onLearnerChange, syncLearnerState } from "./learner-state";

export interface AccountUser { id: string; name: string; email: string | null }
interface AccountState {
  status: "checking" | "ready" | "unavailable";
  enabled: boolean;
  registrationEnabled: boolean;
  user: AccountUser | null;
  sync: "idle" | "saving" | "saved" | "error";
  syncMessage: string | null;
  /** The current identity's first saved-work sync has settled, including offline fallback. */
  learnerStateReady: boolean;
}
const initial: AccountState = { status: "checking", enabled: false, registrationEnabled: false, user: null, sync: "idle", syncMessage: null, learnerStateReady: false };
let state = initial;
const listeners = new Set<() => void>();
let generation = 0;
let sending = false;
let checking: Promise<void> | null = null;
let timer: ReturnType<typeof setTimeout> | undefined;
let stopped = true;
let signingOut = false;
const AUTH_EVENT = "fitlab.account.changed";
const SESSION_CACHE = "fitlab.account.last";

function update(next: Partial<AccountState>) {
  state = { ...state, ...next };
  listeners.forEach(listener => listener());
}

export function useAccount() {
  return useSyncExternalStore(listener => {
    listeners.add(listener);
    return () => { listeners.delete(listener); };
  }, () => state, () => initial);
}

function request(path: string, init?: RequestInit) {
  return fetch(`/account-api/${path}`, {
    ...init, cache: "no-store", credentials: "same-origin", signal: AbortSignal.timeout(15000),
  });
}

export function refreshAccount(): Promise<void> {
  if (checking) return checking;
  const started = generation;
  checking = (async () => {
    try {
      const response = await request("session");
      if (!response.ok) throw new Error("Session unavailable");
      const result = await response.json();
      if (stopped || started !== generation || signingOut) return;
      const user: AccountUser | null = result.user ?? null;
      if (user && (typeof user.id !== "string" || typeof user.name !== "string")) throw new Error("Invalid session");
      if (state.user?.id !== user?.id) {
        generation++;
        setProgressAccount(user?.id ?? null);
      }
      try {
        if (user) sessionStorage.setItem(SESSION_CACHE, JSON.stringify(user));
        else sessionStorage.removeItem(SESSION_CACHE);
      } catch { /* Account caches still work for this page. */ }
      update({ status: "ready", enabled: result.enabled === true, registrationEnabled: result.registrationEnabled === true, user, sync: user ? state.sync : "idle",
        learnerStateReady: !user || (state.user?.id === user.id && state.learnerStateReady) });
      if (user) scheduleSync();
    } catch {
      if (!stopped && started === generation) update({ status: "unavailable", sync: state.user ? "error" : "idle", learnerStateReady: true });
    } finally { checking = null; }
  })();
  return checking;
}

function scheduleSync(delay = 400) {
  clearTimeout(timer);
  if (!stopped && !signingOut && state.user) timer = setTimeout(() => { void syncProgress(); }, delay);
}

export async function syncProgress() {
  if (sending) { scheduleSync(1000); return; }
  const user = state.user;
  if (stopped || signingOut || !user) return;
  if (state.status !== "ready") { await refreshAccount(); return; }
  const started = generation;
  sending = true;
  update({ sync: "saving", syncMessage: null });
  const snapshot = JSON.stringify(readProgress());
  try {
    const response = await request("progress", {
      method: "PUT", headers: { "Content-Type": "application/json", "X-FitLab-Account": user.id },
      body: snapshot,
    });
    if (stopped || started !== generation) return;
    if (response.status === 401 || response.status === 409) {
      update({ sync: "error" });
      await refreshAccount();
      return;
    }
    if (!response.ok) throw new Error("Sync failed");
    const remote = await response.json();
    if (stopped || started !== generation) return;
    let changed = JSON.stringify(readProgress()) !== snapshot;
    receiveProgress(remote, user.id);
    await syncLearnerState(user.id, () => !stopped && started === generation && !signingOut, request);
    if (stopped || started !== generation) return;
    changed ||= hasPendingLearnerState(user.id);
    update({ sync: changed ? "saving" : "saved", learnerStateReady: true });
    if (changed) scheduleSync();
  } catch (error) {
    if (!stopped && started === generation) {
      update({ sync: "error", syncMessage: error instanceof LearnerStorageLimit ? error.message : null, learnerStateReady: true });
      scheduleSync(30000);
    }
  } finally { sending = false; }
}

export async function signOut(): Promise<boolean> {
  const user = state.user;
  if (!user || signingOut) return false;
  signingOut = true;
  generation++;
  clearTimeout(timer);
  try {
    const response = await request("auth/logout", {
      method: "POST", headers: { "X-FitLab-Account": user.id },
    });
    if (!response.ok) throw new Error("Sign out failed");
    const result = await response.json();
    setProgressAccount(null);
    try { sessionStorage.removeItem(SESSION_CACHE); } catch { /* Optional browser cache. */ }
    update({ user: null, sync: "idle", status: "ready", syncMessage: null, learnerStateReady: true });
    try { localStorage.setItem(AUTH_EVENT, String(Date.now())); } catch { /* storage may be blocked */ }
    if (typeof result.redirect === "string" && result.redirect.startsWith("https://")) window.location.assign(result.redirect);
    return true;
  } catch {
    update({ sync: "error" });
    return false;
  } finally { signingOut = false; scheduleSync(30000); }
}

export function startAccountSync() {
  stopped = false;
  // A verified identity cached in this tab can restore offline work after a
  // reload. It grants no authority: uploads wait for a fresh session response.
  if (state.status === "checking" && !state.user) try {
    const previous = JSON.parse(sessionStorage.getItem(SESSION_CACHE) ?? "null") as AccountUser | null;
    if (previous && typeof previous.id === "string" && typeof previous.name === "string") {
      setProgressAccount(previous.id);
      update({ user: previous, enabled: true });
    }
  } catch { /* A corrupt identity hint is ignored. */ }
  // React development mode remounts effects while the first check is in flight.
  void (checking ?? Promise.resolve()).then(() => { if (!stopped) void refreshAccount(); });
  const edited = () => { if (state.user) update({ sync: "saving" }); scheduleSync(); };
  const unlisten = onProgressChange(edited);
  const unlistenWork = onLearnerChange(edited);
  const unlistenStorage = listenForLearnerStorage();
  const refresh = () => { void refreshAccount(); };
  const storage = (event: StorageEvent) => { if (event.key === AUTH_EVENT || event.key === null) refresh(); };
  window.addEventListener("focus", refresh);
  window.addEventListener("online", refresh);
  window.addEventListener("storage", storage);
  const interval = setInterval(refresh, 60000);
  return () => {
    stopped = true;
    generation++;
    clearTimeout(timer);
    clearInterval(interval);
    unlisten();
    unlistenWork();
    unlistenStorage();
    window.removeEventListener("focus", refresh);
    window.removeEventListener("online", refresh);
    window.removeEventListener("storage", storage);
  };
}
