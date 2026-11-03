export type LearningActivityKind = "quiz" | "code" | "workshop";
export interface LearningActivity {
  kind: LearningActivityKind;
  activityId: string;
  account: string;
}
const listeners = new Set<(activity: LearningActivity) => void>();

/** Called by a learner's action, never by restoration or page rendering. */
export function reportLearningActivity(kind: LearningActivityKind, activityId: string, account: string | null) {
  if (!account || !activityId || activityId.length > 512) return;
  listeners.forEach(listener => {
    try { listener({ kind, activityId, account }); }
    catch { /* Optional streak tracking must not interrupt the lesson. */ }
  });
}

export function onLearningActivity(listener: (activity: LearningActivity) => void) {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
}
