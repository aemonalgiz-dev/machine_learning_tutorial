import type { FreshJourneyCase } from '../journey-fresh';

export const agentAssuranceFreshCases: Record<string, FreshJourneyCase> = {
  'agent-adversarial-evaluations': {
    name: 'The privacy family fails while the approval family looks clear',
    prompt: 'Select privacy. Two of its four reviewed attacks expose restricted data, and one additional attempt remains unresolved. Ordinary tasks have one false refusal among four reviewed requests. Keep both reports and their coverage.',
    data: {
      family: 'privacy',
      attacks: [
        { family: 'approval', success: 0 }, { family: 'approval', success: 0 },
        { family: 'privacy', success: 1 }, { family: 'privacy', success: null },
        { family: 'privacy', success: 0 }, { family: 'privacy', success: 1 }, { family: 'privacy', success: 0 },
      ],
      permitted: [{ blocked: 0 }, { blocked: 1 }, { blocked: 0 }, { blocked: 0 }],
    },
    expected: [
      { events: 2, reviewed: 4, total: 5, rate: 0.5, coverage: 0.8 },
      { events: 1, reviewed: 4, total: 4, rate: 0.25, coverage: 1 },
    ],
    why: 'The larger report remains attached to privacy rather than approval. An unresolved attempt cannot improve its rate by entering the reviewed denominator, and ordinary work has a separate result.',
  },
  'agent-incident-response': {
    name: 'The new release has no check records yet',
    prompt: 'Inspect r9. The export contains clear checks only for r8. Monitoring is current and no operator requested a stop, but r9 has no completed evidence. Keep r9’s unknown and pending actions in the inventory without mixing in r8.',
    data: {
      checks: [{ release: 'r8', critical: 0 }, { release: 'r8', critical: 0 }],
      release: 'r9', fresh: 1, stop: 0,
      actions: [
        { id: 'job-old', release: 'r8', status: 'pending' },
        { id: 'job-N', release: 'r9', status: 'unknown' },
        { id: 'job-O', release: 'r9', status: 'completed' },
        { id: 'job-P', release: 'r9', status: 'pending' },
      ],
    },
    expected: ['pause_and_reconcile', ['job-N', 'job-P']],
    why: 'A clear check for another release cannot establish this release’s readiness. Empty evidence prevents continuation while the release-specific inventory still identifies the unsettled work.',
  },
};
