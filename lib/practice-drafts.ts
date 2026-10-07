import type { Exercise } from "./exercises";

export interface PracticeDraft {
  code: string;
  solved: boolean;
  hintsShown: number;
}

function fingerprint(value: string): string {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index++) hash = Math.imul(hash ^ value.charCodeAt(index), 16777619);
  return (hash >>> 0).toString(36);
}

export function draftKey(lesson: string, problem: Exercise): string {
  return `oop_ml.code.v1:${lesson}:${fingerprint(problem.title + problem.starter + problem.output)}`;
}

export function readDraft(key: string, problem: Exercise): PracticeDraft {
  const fallback = { code: problem.starter, solved: false, hintsShown: 0 };
  try {
    const stored = localStorage.getItem(key);
    if (!stored) return fallback;
    const parsed = JSON.parse(stored);
    if (!parsed || typeof parsed.code !== "string" || parsed.code.length > 100_000) return fallback;
    return {
      code: parsed.code,
      solved: parsed.solved === true,
      hintsShown: Number.isInteger(parsed.hintsShown) ? Math.min(Math.max(0, parsed.hintsShown), problem.hints?.length ?? 0) : 0,
    };
  } catch { return fallback; }
}

export function writeDraft(key: string, draft: PracticeDraft): boolean {
  try { localStorage.setItem(key, JSON.stringify(draft)); return true; }
  catch { return false; }
}
