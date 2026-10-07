// What the reader has finished, kept in their own browser.
//
// A quiz records itself when its last card is answered and a set of problems
// when its last problem is checked or its solution shown. A lesson records how
// many of those it holds when it opens, and counts as finished once every one
// of them has been. The home page and the section pages read the same record
// to mark lessons off and to fill the progress bars.
//
// Nothing leaves the browser. There is no account and no server, so the record
// is whatever this browser remembers, and clearing the site's data clears it.
// That is the right trade for a course with no sign-in: a reader loses nothing
// they could not get back by reading again, and the site never asks who they
// are.

import { useSyncExternalStore } from "react";

const KEY = "oop_ml.progress.v1";

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

function normalised(parsed: unknown): Progress {
  if (!parsed || typeof parsed !== "object") return EMPTY;
  const raw = parsed as Partial<Progress>;
  return {
    done: raw.done && typeof raw.done === "object" ? raw.done : {},
    required: raw.required && typeof raw.required === "object" ? raw.required : {},
  };
}

function read(): Progress {
  if (cached) return cached;
  try {
    const stored = window.localStorage.getItem(KEY);
    cached = stored ? normalised(JSON.parse(stored)) : EMPTY;
  } catch {
    cached = EMPTY;
  }
  return cached;
}

function write(next: Progress) {
  cached = next;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // Private windows and blocked storage still get a working page; the
    // record simply does not outlive it.
  }
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  // Another tab finishing a quiz shows up here too.
  const onStorage = (event: StorageEvent) => {
    if (event.key === KEY) {
      cached = null;
      listener();
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
  return useSyncExternalStore(subscribe, read, noProgress);
}

export function markFinished(lesson: string, sectionId: string) {
  const current = read();
  const already = current.done[lesson] ?? [];
  if (already.includes(sectionId)) return;
  write({
    ...current,
    done: { ...current.done, [lesson]: [...already, sectionId] },
  });
}

// Called by a lesson when it opens, so that the home and section pages know
// how much of it there is to finish. Written only when the count changes, so
// opening a lesson twice does not notify anyone of nothing.
export function declareRequired(lesson: string, count: number) {
  const current = read();
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
