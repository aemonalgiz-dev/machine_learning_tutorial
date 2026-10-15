import type { FreshJourneyCase } from '../journey-fresh';

export const agentObservabilityFreshCases: Record<string, FreshJourneyCase> = {
  'agent-tracing': {
    name: 'The overnight export begins with someone else’s request',
    prompt: 'The export mixes pump-9 and pump-7. Measure only pump-7’s request duration, keeping the overlapping manual and equipment calls out of any sum.',
    data: {
      wanted: 'pump-7',
      spans: [
        { id: 'other', parent: null, start: 0, end: 5000, trace: 'pump-9' },
        { id: 'manual', parent: 'request', start: 240, end: 700, trace: 'pump-7' },
        { id: 'request', parent: null, start: 200, end: 1000, trace: 'pump-7' },
        { id: 'equipment', parent: 'request', start: 260, end: 850, trace: 'pump-7' },
      ],
    },
    expected: 800,
    why: 'The correct root is neither the first record nor the longest duration. Selecting the trace before selecting its root preserves the question’s meaning.',
  },
  'agent-langfuse': {
    name: 'A new rubric has scored only one of the new version’s runs',
    prompt: 'Report prompt version 5 using grounded-v3. Older-rubric results are present, and one selected run is still unscored. Keep a low fractional score distinct from missing evaluation.',
    data: {
      runs: [{ traceId: 'night-A', promptVersion: 5 }, { traceId: 'night-B', promptVersion: 5 }, { traceId: 'night-C', promptVersion: 4 }],
      scores: [
        { traceId: 'night-A', rubric: 'grounded-v2', value: 1 },
        { traceId: 'night-B', rubric: 'grounded-v2', value: 1 },
        { traceId: 'night-C', rubric: 'grounded-v3', value: 1 },
        { traceId: 'night-A', rubric: 'grounded-v3', value: 0.25 },
      ],
      version: 5, rubric: 'grounded-v3',
    },
    expected: [0.25, 0.5],
    why: 'Only one of the two selected runs has a grounded-v3 score. The other version’s successful run and the old rubric must not inflate the report.',
  },
  'agent-evaluation-datasets': {
    name: 'A shift includes restraint, a wrong label and a hidden write',
    prompt: 'Check four maintenance cases. The no-action clarification is valid, while a correct label with an unapproved call must still fail. Return the share passing both checks.',
    data: { cases: [
      { id: 'clarify', expected: 'clarify', outcome: 'clarify', allowed: [], calls: [] },
      { id: 'old-manual', expected: 'abstain', outcome: 'answer', allowed: ['search_manual'], calls: ['search_manual'] },
      { id: 'inspection', expected: 'request_approval', outcome: 'request_approval', allowed: ['propose_job'], calls: ['propose_job', 'create_job'] },
      { id: 'current-manual', expected: 'answer', outcome: 'answer', allowed: ['search_manual'], calls: ['search_manual'] },
    ] },
    expected: 0.5,
    why: 'Two different failures need two checks. Empty calls are appropriate for the clarification case, while a matching outcome cannot excuse a forbidden write.',
  },
  'agent-model-judges': {
    name: 'The calibration batch agrees on both acceptance and rejection',
    prompt: 'Every recorded label is settled and stable in this batch. Return the review queue using the same rule, even when the correct queue is empty.',
    data: { rows: [
      { id: 'restart-condition-kept', human: 1, judge: 1, reversed: 1 },
      { id: 'restart-condition-lost', human: 0, judge: 0, reversed: 0 },
      { id: 'wrong-equipment-advice', human: 0, judge: 0, reversed: 0 },
    ] },
    expected: [],
    why: 'Stable agreement on an unsupported label is still agreement. The queue detects disagreement or uncertainty, not every answer that the evaluator rejects. Agreement still merits occasional independent audits.',
  },
  'agent-release-checks': {
    name: 'The repaired candidate reaches the budget exactly',
    prompt: 'Pair this new three-case shift. Require the supplied positive mean gain and an inclusive latency limit, with no critical failures. Decide whether the repaired candidate passes this fixture policy.',
    data: {
      baseline: [{ caseId: 'manual', score: 0.5 }, { caseId: 'approval', score: 0.8 }, { caseId: 'missing', score: 0.4 }],
      candidate: [
        { caseId: 'missing', score: 0.65, latency: 900, critical: 0 },
        { caseId: 'manual', score: 0.75, latency: 650, critical: 0 },
        { caseId: 'approval', score: 0.9, latency: 800, critical: 0 },
      ],
      gain: 0.15, limit: 900,
    },
    expected: 1,
    why: 'The largest time equals the allowed limit, the mean paired improvement exceeds the minimum, and no critical failure is recorded. The decision is conditional on these cases and this policy.',
  },
};
