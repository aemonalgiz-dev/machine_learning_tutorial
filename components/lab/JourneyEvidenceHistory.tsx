"use client";

import { journeyAttemptHistory, journeyStatus, type JourneyProgress } from "@/lib/journey-progress";

export function JourneyEvidenceHistory({ record }: { record: JourneyProgress }) {
  const attempts = journeyAttemptHistory(record);
  const status = journeyStatus(record);
  if (!attempts.length || !status) return null;
  return <details className="mb-5 rounded-xl border border-line bg-surface p-4" data-testid="journey-evidence">
    <summary className="cursor-pointer text-sm font-semibold">Your tested work: {status.label.toLowerCase()}</summary>
    <p className="mt-3 text-sm leading-7 text-muted">{status.detail} A fresh attempt starts with an empty floor and keeps these earlier results.</p>
    <ul className="mt-3 space-y-2 text-sm">
      {attempts.map(attempt => <li key={`${attempt.kind}:${attempt.attemptId}`}>
        {attempt.kind === "built" ? "Construction" : "Changed example"} passed {attempt.supported ? "with Botie's help" : "independently"}.
        <time className="ml-2 text-xs text-muted" dateTime={new Date(attempt.at).toISOString()}>{new Date(attempt.at).toLocaleDateString()}</time>
      </li>)}
    </ul>
  </details>;
}
