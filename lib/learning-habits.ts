"use client";

import { useSyncExternalStore } from "react";
import { onAccountUpdate, readAccount } from "./accounts";
import { getProgressAccount } from "./progress";
import { onLearningActivity, type LearningActivity } from "./learning-activity";

export interface LearningStreakSnapshot {
  currentDays: number;
  longestDays: number;
  activeToday: boolean;
  today: string;
  lastActiveDate: string | null;
  timezone: string;
  recentDays: { date: string; active: boolean }[];
}
export interface LearningPreferences {
  remindersEnabled: boolean;
  timezone: string;
  timezoneSet: boolean;
  reminderHour: number;
  emailVerified: boolean;
  deliveryAvailable: boolean;
}
export type LearningPreferenceInput = Pick<LearningPreferences, "remindersEnabled" | "timezone" | "reminderHour">;
interface HabitsState {
  accountId: string | null;
  ready: boolean;
  status: "idle" | "loading" | "ready" | "error" | "unavailable";
  error: string | null;
  streak: LearningStreakSnapshot | null;
  preferences: LearningPreferences | null;
  saving: boolean;
}
const initial: HabitsState = { accountId: null, ready: false, status: "idle", error: null, streak: null, preferences: null, saving: false };
let state = initial;
const listeners = new Set<() => void>();
let users = 0, generation = 0;
let revision = 0;
let loading: Promise<void> | null = null;
let loadingOwner: string | null = null;
let draining = false;
let stop: (() => void) | null = null;
type PendingActivity = LearningActivity & { eventId: string; timezone?: string };
const pending: PendingActivity[] = [];
const publish = (value: Partial<HabitsState>) => { state = { ...state, ...value }; listeners.forEach(listener => listener()); };
const subscribe = (listener: () => void) => { listeners.add(listener); return () => { listeners.delete(listener); }; };
const day = (value: unknown): value is string => typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value);
const count = (value: unknown): value is number => Number.isSafeInteger(value) && Number(value) >= 0;
const zone = (value: unknown): value is string => {
  // The server validates its IANA database. A browser with older time-zone
  // data must still be able to display a newer server-recognised name.
  return typeof value === "string" && value.length <= 64 && /^[A-Za-z0-9_.+-]+(?:\/[A-Za-z0-9_.+-]+)*$/.test(value);
};
export function browserLearningTimezone() {
  try { const value = Intl.DateTimeFormat().resolvedOptions().timeZone; return zone(value) ? value : "UTC"; } catch { return "UTC"; }
}
function streakValue(raw: unknown): LearningStreakSnapshot {
  const row = raw as LearningStreakSnapshot;
  if (!row || !count(row.currentDays) || !count(row.longestDays) || typeof row.activeToday !== "boolean" || !day(row.today) ||
    row.lastActiveDate !== null && !day(row.lastActiveDate) || !zone(row.timezone) || !Array.isArray(row.recentDays) || row.recentDays.length > 31 ||
    row.recentDays.some(item => !item || !day(item.date) || typeof item.active !== "boolean")) throw new Error("Your streak could not be read. Try again.");
  return row;
}
function preferencesValue(raw: unknown): LearningPreferences {
  const row = raw as LearningPreferences;
  if (!row || typeof row.remindersEnabled !== "boolean" || typeof row.timezoneSet !== "boolean" || !zone(row.timezone) ||
    !Number.isInteger(row.reminderHour) || row.reminderHour < 0 || row.reminderHour > 23 ||
    typeof row.emailVerified !== "boolean" || typeof row.deliveryAvailable !== "boolean") throw new Error("Your reminder settings could not be read. Try again.");
  return row;
}
class HabitsUnavailable extends Error {}
function owns(account: string, started: number) { return generation === started && readAccount().user?.id === account && getProgressAccount() === account; }
async function request(path: string, account: string, init: RequestInit = {}) {
  const response = await fetch(`/account-api/${path}`, { ...init, cache: "no-store", credentials: "same-origin", signal: AbortSignal.timeout(15_000),
    headers: { "X-FitLab-Account": account, ...(init.body ? { "Content-Type": "application/json" } : {}), ...init.headers } });
  if (response.status === 404 || response.status === 501) throw new HabitsUnavailable("Streak tracking is not available yet.");
  if (!response.ok) {
    let detail = "Your streak or reminder settings could not sync. Try again.";
    try { const body = await response.json(); if (typeof body.detail === "string" && body.detail.length < 300) detail = body.detail; } catch { /* Keep the plain fallback. */ }
    throw new Error(detail);
  }
  const result = await response.json();
  if (result.account !== account) throw new Error("Your account changed. Try again.");
  return result;
}
export async function refreshLearningHabits(): Promise<void> {
  const account = readAccount();
  if (!account.user || account.status !== "ready" || getProgressAccount() !== account.user.id) return;
  const owner = account.user.id, started = generation;
  const requestedRevision = revision;
  if (loading && loadingOwner === owner) return loading;
  publish({ accountId: owner, status: state.streak ? state.status : "loading", error: null });
  loadingOwner = owner;
  let again = false;
  const operation = (async () => {
    try {
      const [activity, settings] = await Promise.all([request("streak", owner), request("learning-preferences", owner)]);
      if (!owns(owner, started)) return;
      if (requestedRevision !== revision) { again = true; return; }
      publish({ ready: true, status: "ready", streak: streakValue(activity.streak), preferences: preferencesValue(settings.preferences), error: null });
    } catch (error) {
      if (owns(owner, started) && requestedRevision !== revision) { again = true; return; }
      if (owns(owner, started)) publish({ ready: true, status: error instanceof HabitsUnavailable ? "unavailable" : "error", error: error instanceof Error ? error.message : "Your streak could not sync. Try again." });
    }
  })();
  loading = operation;
  try { await operation; } finally {
    if (loading === operation) {
      loading = null; loadingOwner = null;
      if (again && owns(owner, started)) void refreshLearningHabits();
    }
  }
}
async function savePreferences(value: LearningPreferenceInput): Promise<boolean> {
  const account = readAccount();
  if (!account.user || account.status !== "ready" || getProgressAccount() !== account.user.id || state.saving) return false;
  const owner = account.user.id, started = generation;
  publish({ saving: true, error: null });
  try {
    const result = await request("learning-preferences", owner, { method: "PUT", body: JSON.stringify(value) });
    if (!owns(owner, started)) return false;
    revision++;
    publish({ preferences: preferencesValue(result.preferences), saving: false });
    await refreshLearningHabits();
    return owns(owner, started);
  } catch (error) {
    if (owns(owner, started)) publish({ saving: false, error: error instanceof Error ? error.message : "Your reminder settings could not save. Try again." });
    return false;
  }
}
async function drain() {
  if (draining || !pending.length) return;
  draining = true;
  const drainGeneration = generation;
  try {
    while (pending.length) {
      const item = pending[0], started = generation;
      if (!owns(item.account, started) || readAccount().status !== "ready") return;
      try {
        const result = await request("activity", item.account, { method: "POST", body: JSON.stringify({ eventId: item.eventId, kind: item.kind, activityId: item.activityId, timezone: item.timezone }) });
        if (!owns(item.account, started)) return;
        if (pending[0] === item) pending.shift();
        revision++;
        publish({ ready: true, status: "ready", streak: streakValue(result.streak), error: null });
        // First activity can set the previously unset time zone. Read that choice back.
        if (!state.preferences?.timezoneSet) void refreshLearningHabits();
      } catch (error) {
        if (owns(item.account, started)) publish({ status: error instanceof HabitsUnavailable ? "unavailable" : "error", error: error instanceof HabitsUnavailable ? error.message : "Your learning activity has not synced for your streak yet. Keep this tab open while it retries." });
        return;
      }
    }
  } finally {
    draining = false;
    if (generation !== drainGeneration && pending.length) void drain();
  }
}
function receive(activity: LearningActivity) {
  const account = readAccount();
  if (account.status === "checking" || account.user?.id !== activity.account || getProgressAccount() !== activity.account) return;
  // Bounded, visit-only retry queue. No activity or streak history goes into browser storage.
  if (pending.length >= 64) pending.splice(1, pending.length - 1);
  pending.push({ ...activity, eventId: crypto.randomUUID(), timezone: browserLearningTimezone() });
  void drain();
}
function accountChanged() {
  const account = readAccount(), owner = account.user?.id ?? null;
  if (state.accountId !== owner) {
    generation++;
    pending.length = 0;
    loading = null; loadingOwner = null;
    state = { ...initial, accountId: owner, ready: !owner && account.status !== "checking" };
    listeners.forEach(listener => listener());
    if (owner && account.status === "ready") void refreshLearningHabits();
  } else if (owner && account.status === "ready" && state.status === "idle") void refreshLearningHabits();
  else if (!owner && account.status !== "checking" && !state.ready) publish({ ready: true });
  if (owner && account.status === "ready" && pending.length) void drain();
}
/** One account-scoped observer for the app; UI hooks only read its snapshot. */
export function startLearningHabits() {
  users++;
  if (users === 1) {
    const account = onAccountUpdate(accountChanged), activity = onLearningActivity(receive);
    const retry = () => { void refreshLearningHabits().then(drain); };
    const focus = () => { if (document.visibilityState === "visible") retry(); };
    const timer = setInterval(retry, 60_000);
    window.addEventListener("online", retry);
    document.addEventListener("visibilitychange", focus);
    accountChanged();
    stop = () => { account(); activity(); clearInterval(timer); window.removeEventListener("online", retry); document.removeEventListener("visibilitychange", focus); };
  }
  return () => { users--; if (!users) { stop?.(); stop = null; generation++; pending.length = 0; loading = null; loadingOwner = null; state = initial; } };
}
export function useLearningHabits() {
  const snapshot = useSyncExternalStore(subscribe, () => state, () => initial);
  return { ...snapshot, savePreferences, refresh: retryLearningHabits };
}

async function retryLearningHabits() { await refreshLearningHabits(); await drain(); }
