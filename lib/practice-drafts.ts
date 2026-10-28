import type { Exercise } from "./exercises";
import { getProgressAccount } from "./progress";

export interface PracticeDraft {
  code: string;
  solved: boolean;
  hintsShown: number;
}
const currentDrafts = new Map<string, PracticeDraft>();

function fingerprint(value: string): string {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index++) hash = Math.imul(hash ^ value.charCodeAt(index), 16777619);
  return (hash >>> 0).toString(36);
}

export function draftKey(lesson: string, problem: Exercise): string {
  const account = getProgressAccount();
  const prefix = account ? `oop_ml.code.v1:account:${account}` : "oop_ml.code.v1";
  return `${prefix}:${lesson}:${fingerprint(problem.title + problem.starter + problem.output)}`;
}

export function readDraft(key: string, problem: Exercise): PracticeDraft {
  const fallback = { code: problem.starter, solved: false, hintsShown: 0 };
  return currentDrafts.get(key) ?? fallback;
}

/** Only the authenticated account's pre-backend draft format may migrate. */
export function readLegacyAccountDraft(key: string, problem: Exercise, account: string): PracticeDraft | null {
  if (!key.startsWith(`oop_ml.code.v1:account:${account}:`)) return null;
  try {
    const stored = localStorage.getItem(key);
    if (!stored) return null;
    const parsed = JSON.parse(stored);
    if (!parsed || typeof parsed.code !== "string" || parsed.code.length > 100_000) return null;
    return {
      code: parsed.code,
      solved: parsed.solved === true,
      hintsShown: Number.isInteger(parsed.hintsShown) ? Math.min(Math.max(0, parsed.hintsShown), problem.hints?.length ?? 0) : 0,
    };
  } catch { return null; }
}

export function writeDraft(key: string, draft: PracticeDraft): boolean {
  currentDrafts.set(key, draft);
  return true;
}
