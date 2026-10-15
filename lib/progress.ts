// Completion records, cached separately for guests and signed-in accounts.
//
// A quiz records itself when its last card is answered and a set of problems
// when every coding challenge has passed its output check. A lesson records how
// many of those it holds when it opens, and counts as finished once every one
// of them has been. The home page and the section pages read the same record
// to mark lessons off and to fill the progress bars.
//
// accounts.ts handles synchronization. Importing guest progress is explicit,
// so a shared browser never silently merges different people's records.

import { useSyncExternalStore } from "react";

const KEY = "oop_ml.progress.v1";
let accountId: string | null = null;
const storageKey = () => accountId ? `${KEY}:account:${accountId}` : KEY;

export interface Progress {
  // Lesson path, such as /concepts/k-means, to the ids of the sections on it
  // that have been finished.
  done: Record<string, string[]>;
  // Lesson path to how many sections it holds that can be finished at all.
  required: Record<string, number>;
}

const EMPTY: Progress = { done: {}, required: {} };

// The snapshot has to be the same object between reads that change nothing,
// or useSyncExternalStore sees a new value every render and loops.
let cached: Progress | null = null;
const listeners = new Set<() => void>();
const changes = new Set<() => void>();
const scopes = new Set<() => void>();

export function normalised(parsed: unknown): Progress {
  if (!parsed || typeof parsed !== "object") return EMPTY;
  const raw = parsed as Partial<Progress>;
  const validLesson = (key: string) => /^\/(concepts|primers)\/[a-z0-9][a-z0-9-]{0,140}$/.test(key);
  const done: Record<string, string[]> = {};
  const required: Record<string, number> = {};
  if (raw.done && typeof raw.done === "object") for (const [key, value] of Object.entries(raw.done).slice(0, 512)) {
    if (validLesson(key) && Array.isArray(value)) done[key] = [...new Set(value.filter(
      (id): id is string => typeof id === "string" && /^[a-z0-9][a-z0-9-]{0,159}$/.test(id),
    ))].slice(0, 128).sort();
  }
  if (raw.required && typeof raw.required === "object") for (const [key, value] of Object.entries(raw.required).slice(0, 512)) {
    if (validLesson(key) && Number.isInteger(value) && value >= 0 && value <= 128) required[key] = value;
  }
  return { done, required };
}

export function readProgress(): Progress {
  if (cached) return cached;
  try {
    const stored = window.localStorage.getItem(storageKey());
    cached = stored ? normalised(JSON.parse(stored)) : EMPTY;
  } catch {
    cached = EMPTY;
  }
  return cached;
}

function write(next: Progress, local = true) {
  cached = next;
  try {
    window.localStorage.setItem(storageKey(), JSON.stringify(next));
  } catch {
    // Private windows and blocked storage still get a working page; the
    // record simply does not outlive it.
  }
  listeners.forEach((listener) => listener());
  if (local) changes.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  // Another tab finishing a quiz shows up here too.
  const onStorage = (event: StorageEvent) => {
    if (event.key === storageKey() || event.key === null) {
      cached = null;
      listener();
      changes.forEach((changed) => changed());
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

const noProgress = () => EMPTY;

export function useProgress(): Progress {
  return useSyncExternalStore(subscribe, readProgress, noProgress);
}

export function markFinished(lesson: string, sectionId: string, expectedAccount = accountId) {
  if (expectedAccount !== accountId) return;
  const current = readProgress();
  const already = current.done[lesson] ?? [];
  if (already.includes(sectionId)) return;
  write({
    ...current,
    done: { ...current.done, [lesson]: [...already, sectionId] },
  });
  // instrumentation-client.ts counts the first finish of each section.
  try {
    window.dispatchEvent(new CustomEvent("fitlab:finished", { detail: { section: sectionId } }));
  } catch {
    // Counting is never allowed to stop progress from being recorded.
  }
}

// Called by a lesson when it opens, so that the home and section pages know
// how much of it there is to finish. Written only when the count changes, so
// opening a lesson twice does not notify anyone of nothing.
export function declareRequired(lesson: string, count: number) {
  const current = readProgress();
  if (current.required[lesson] === count) return;
  write({ ...current, required: { ...current.required, [lesson]: count } });
}

export function isFinished(progress: Progress, lesson: string, sectionId: string): boolean {
  return progress.done[lesson]?.includes(sectionId) ?? false;
}

export function lessonFinished(progress: Progress, lesson: string): boolean {
  const required = progress.required[lesson];
  if (required === undefined || required === 0) return false;
  return (progress.done[lesson]?.length ?? 0) >= required;
}

export function lessonStarted(progress: Progress, lesson: string): boolean {
  return (progress.done[lesson]?.length ?? 0) > 0;
}

export function finishedCount(progress: Progress, lessons: string[]): number {
  return lessons.filter((lesson) => lessonFinished(progress, lesson)).length;
}

export const getProgressAccount = () => accountId;

export function setProgressAccount(id: string | null) {
  if (id === accountId) return;
  accountId = id;
  cached = null;
  scopes.forEach(listener => listener());
  listeners.forEach(listener => listener());
}

export function useProgressAccount() {
  return useSyncExternalStore((listener) => {
    scopes.add(listener);
    return () => { scopes.delete(listener); };
  }, getProgressAccount, () => null);
}

export function onProgressChange(listener: () => void) {
  changes.add(listener);
  return () => { changes.delete(listener); };
}

export function guestProgress(): Progress {
  try { return normalised(JSON.parse(window.localStorage.getItem(KEY) ?? "null")); }
  catch { return EMPTY; }
}

export function mergeProgress(left: Progress, right: Progress): Progress {
  const done = { ...left.done };
  for (const [lesson, sections] of Object.entries(right.done)) {
    done[lesson] = [...new Set([...(done[lesson] ?? []), ...sections])].sort();
  }
  return { done, required: { ...left.required, ...right.required } };
}

export function receiveProgress(remote: unknown, expectedAccount: string) {
  if (expectedAccount !== accountId) return;
  write(mergeProgress(normalised(remote), readProgress()), false);
}

export function importGuestProgress() {
  if (accountId) write(mergeProgress(guestProgress(), readProgress()));
}
