import type { FreshJourneyCase } from '../journey-fresh';

export const agentFoundationFreshCases: Record<string, FreshJourneyCase> = {
  'agent-prompts': {
    name: 'The service ticket contains a line break',
    prompt: 'Botie receives a multiline manual with quoted text. Keep the instruction message unchanged and encode the complete manual inside its JSON data field. Return the two messages in system, user order.',
    data: { task: 'Explain the supplied source.', format: 'Include its ID.', question: 'Which part should P-3 check?', manual: 'M3: inspect the "seal".\nRecord the finding.' },
    expected: [{ role: 'system', content: 'Explain the supplied source.\nInclude its ID.' }, { role: 'user', content: '{"question":"Which part should P-3 check?"}\n{"manual":"M3: inspect the \\"seal\\".\\nRecord the finding."}' }],
    why: 'JSON encoding retains the embedded quote and line break within one field. Neither creates a new message role or another instruction block.',
  },
  'agent-structured-outputs': {
    name: 'The model adds an unexpected approval field',
    prompt: 'The response still names a known pump and contains a textual diagnosis, but it now includes approved=true. Apply the exact two-field response contract and return the two independent flags.',
    data: { response: { asset: 'P-3', diagnosis: 'inspect the seal', approved: true }, fields: ['asset', 'diagnosis'], registry: ['P-3', 'P-4'] },
    expected: [false, true],
    why: 'The extra field violates the schema, while asset membership remains true. A model-supplied approved field also cannot grant application approval.',
  },
  'agent-tool-contracts': {
    name: 'A permitted asset still needs approval',
    prompt: 'The caller may access P-4 and the request has no previous receipt. The exact inspection has not been approved. Decide whether the service may create it.',
    data: { request: { request_id: 'new-4', asset: 'P-4', minutes: 15 }, allowed: ['P-4'], approved: false, prior: null, empty: null },
    expected: 'deny',
    why: 'Membership establishes resource permission but does not replace approval for this particular action. The new-request branch must remain behind both checks.',
  },
  'agent-context': {
    name: 'A longer answer leaves room for only one passage',
    prompt: 'Botie needs more room for a detailed answer. Apply the increased output reserve, remove the restricted passage, then select the ordered prefix of permitted excerpts.',
    data: { chunks: [{ id: 'private', asset: 'P-9', tokens: 1, text: 'Restricted record.' }, { id: 'seal', asset: 'P-2', tokens: 4, text: 'Inspect the seal.' }, { id: 'bearing', asset: 'P-2', tokens: 3, text: 'Inspect the bearing.' }], allowed: ['P-2'], window: 20, reserved: 8, output: 7 },
    expected: ['seal'],
    why: 'Only five tokens remain for evidence. The first permitted excerpt fits, but adding the next would exceed the allowance. Removing restricted text does not remove the answer reserve.',
  },
  'agent-loops': {
    name: 'This request has no tool allowance',
    prompt: 'Botie proposes a tool before any tool has run, but this request is configured with a tool-attempt limit of zero. The previous status is ok. Decide the next branch.',
    data: { action: 'tool', used: 0, limit: 0, status: 'ok' },
    expected: 'handoff',
    why: 'A strict below-limit comparison fails at equality even at zero. Checking only for a prior error would incorrectly allow this tool.',
  },
};
