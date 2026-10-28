import type { JourneyProgress, JourneyAttemptEvidence, JourneyEvidence } from "./journey-progress";

function evidence(value: unknown): value is JourneyEvidence {
  if (!value || typeof value !== "object") return false;
  const row = value as JourneyEvidence;
  return typeof row.at === "number" && Number.isFinite(row.at) && row.at > 0 && typeof row.supported === "boolean" &&
    (row.attemptId === undefined || typeof row.attemptId === "string");
}

function journey(value: unknown): value is JourneyProgress {
  if (!value || typeof value !== "object") return false;
  const row = value as JourneyProgress;
  return typeof row.id === "string" && (row.built === null || evidence(row.built)) && (row.transferred === null || evidence(row.transferred)) &&
    (row.exploredAt === null || typeof row.exploredAt === "number" && Number.isFinite(row.exploredAt)) &&
    (row.attempts === undefined || Array.isArray(row.attempts) && row.attempts.every(attempt => evidence(attempt) &&
      typeof attempt.attemptId === "string" && (attempt.kind === "built" || attempt.kind === "transferred")));
}

/** Drafts remain atomic. Evidence of successful learning survives either device. */
export function reconcileLearnerValue(key: string, local: unknown, remote: unknown): unknown {
  if (!key.startsWith("journey-progress:") || !journey(local) || !journey(remote) || local.id !== remote.id) return local;
  const attempts = new Map<string, JourneyAttemptEvidence>();
  for (const record of [remote, local]) {
    const saved = [...(record.attempts ?? [])];
    for (const kind of ["built", "transferred"] as const) {
      const result = record[kind];
      if (result) saved.push({ ...result, kind, attemptId: result.attemptId ?? `legacy:${kind}` });
    }
    for (const attempt of saved) {
      const id = `${attempt.kind}:${attempt.attemptId}`, previous = attempts.get(id);
      attempts.set(id, { ...attempt, at: Math.max(attempt.at, previous?.at ?? 0), supported: attempt.supported || Boolean(previous?.supported) });
    }
  }
  return { ...local, exploredAt: local.exploredAt ?? remote.exploredAt, built: local.built ?? remote.built,
    transferred: local.transferred ?? remote.transferred, attempts: [...attempts.values()].sort((a, b) => a.at - b.at) };
}
