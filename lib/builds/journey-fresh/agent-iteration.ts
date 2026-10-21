import type { FreshJourneyCase } from '../journey-fresh';

export const agentIterationFreshCases: Record<string, FreshJourneyCase> = {
  'agent-introduction': {
    name: 'The needed evidence is already available at the limit',
    prompt: 'No lookups remain, but an approved P12 record is already present beside an unapproved P12 draft. Predict the next step before running the controller.',
    data: { manuals: [{ asset: 'P12', approved: false }, { asset: 'P12', approved: true }], asset: 'P12', remaining: 0 },
    expected: 'answer from evidence',
    why: 'The lookup allowance controls further lookups. It does not forbid using evidence already available for the requested asset.',
  },
  'agent-prompt-examples': {
    name: 'The relevant pool contains only a held-out case',
    prompt: 'A booking demonstration is reserved for the held-out assessment. The development example teaches manual lookup instead. Predict the selected IDs and remaining space.',
    data: { pool: [{ id: 'fresh-A', kind: 'booking', split: 'held-out', tokens: 12, input: 'Can I book P12?', output: 'Approval needed.' }, { id: 'fresh-B', kind: 'manual', split: 'development', tokens: 8, input: 'P12 revision?', output: 'Ask for the label.' }], kind: 'booking', limit: 100 },
    expected: { selected: [], remaining: 100 },
    why: 'An empty eligible pool is honest. Neither spare space nor a matching held-out answer makes that answer eligible for the prompt.',
  },
  'agent-framework-tests': {
    name: 'The asset matches but the operation changes',
    prompt: 'Case X expects a read of P12. The recorded call creates a job for P12 instead. Case Y never returns. Predict the contract report.',
    data: { expected: [{ id: 'X', tool: 'read_manual', asset: 'P12' }, { id: 'Y', tool: 'read_manual', asset: 'P13' }], observed: [{ id: 'X', tool: 'create_job', asset: 'P12' }] },
    expected: { passed: 0, failed: 1, missing: 1 },
    why: 'Matching the asset does not make a different operation acceptable. Missing Y stays separate from the observed failure of X.',
  },
  'agent-error-analysis': {
    name: 'Every failed trace needs another observation',
    prompt: 'Two tasks fail, but neither trace contains enough evidence to locate the divergence. A third task succeeds. Predict the known counts and unresolved queue.',
    data: { reviews: [{ id: 'u2', passed: false, stage: null }, { id: 'ok', passed: true, stage: null }, { id: 'u1', passed: false, stage: null }] },
    expected: { counts: { evidence: 0, decision: 0, execution: 0 }, unresolved: ['u2', 'u1'] },
    why: 'Zero located failures does not mean zero failed tasks. The unresolved queue preserves the work needed to diagnose them.',
  },
  'agent-ablation-experiments': {
    name: 'Nothing in the manifest changes',
    prompt: 'The declared configuration is identical, but one recorded task improves and one remains failed. Predict the report and decide what evidence this gives about the examples.',
    data: { baseline: { model: 'M2', examples: 'e4' }, candidate: { model: 'M2', examples: 'e4' }, before: [{ id: 'x', passed: false }, { id: 'y', passed: false }], after: [{ id: 'y', passed: false }, { id: 'x', passed: true }] },
    expected: { isolated: false, improved: ['x'], regressed: [], unchanged: ['y'] },
    why: 'No declared example change occurred. Run variation or an unrecorded condition needs investigation; the changed outcome cannot be credited to a new example set.',
  },
  'agent-iteration-project': {
    name: 'A failed case also exceeds the response limit',
    prompt: 'The historical question passes at the exact latency limit. The current-manual question fails and takes longer. Predict every reason to hold, in required-case order.',
    data: { required: ['historical', 'current'], results: [{ id: 'current', passed: false, critical: false, ms: 901 }, { id: 'historical', passed: true, critical: false, ms: 900 }], maximum: 900 },
    expected: { decision: 'hold', reasons: ['current: task failed', 'current: too slow'] },
    why: 'The historical request meets the inclusive limit. The current request has two independent failures, and the report preserves both.',
  },
};
