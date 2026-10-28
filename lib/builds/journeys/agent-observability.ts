import type { JourneyPlan } from '../journey-plan';

export const agentObservabilityJourneys: Record<string, JourneyPlan> = {
  'agent-tracing': {
    premise: "The maintenance answer was slow. A span records one operation’s start and finish; a trace groups the operations for one request. Find the technician’s request span so another request or an overlapping child call cannot supply the waiting time.",
    order: 'investigate-first',
    preparation: {
      path: [0, 0, 0], title: 'Separate one technician’s trace from the export',
      challenge: 'Use the requested trace ID to keep its span records. Keep both the request and its child operations for now.',
      why: 'The same export can contain several technicians. Measuring a root before selecting its trace can answer the wrong person’s question.',
    },
    construction: { title: 'Measure the interval the technician waited', start: 'Find the single request span inside the selected trace, measure its duration, and return that one value.', outcome: 'The construction reports the chosen request’s elapsed milliseconds even when child work overlaps.' , hints: ["Select the requested trace before finding its root request. Otherwise another technician’s request may look like a valid root.","Measure the root’s end against its start. Adding child durations can count overlapping or nested work more than once."] },
    investigation: {
      title: 'The manual and equipment lookups run together', caseIndex: 1, kind: 'diagnose',
      question: 'The request spans 0–900 ms, while child spans cover 50–350, 100–500 and 500–850 ms. Why would adding the child durations overstate this request’s wait?',
      options: [
        { label: 'Some of the child intervals overlap in wall-clock time', feedback: 'Yes. The lookups share part of the same elapsed interval. Measure the request’s start and end for its complete wait.', correct: true },
        { label: 'The longest child always measures the whole request', feedback: 'The request also contains other work. Its elapsed duration is not necessarily the longest child duration.' },
      ],
      outcome: 'The root duration is 900 ms. Adding every child produces a different quantity, and nesting could introduce further double counting.',
    },
    connections: [
      { lessonId: 'agent-loops', skill: 'Identify each bounded attempt and stopping condition', why: 'A retry or extra model call should remain visible in the execution record.' },
      { lessonId: 'agent-mcp', skill: 'Follow a request across the tool-service boundary', why: 'Trace context connects remote work to the request that caused it.' },
    ],
    reflection: { prompt: 'Which connection prevents another technician’s root span from changing your answer, and why can sibling durations overlap?', carryForward: 'Preserve request identity and causal context before aggregating timings. A trace is evidence of recorded operations, not a guarantee of answer quality.' },
  },
  'agent-langfuse': {
    premise: 'Botie has versioned maintenance runs and evaluation results. A favourable score means little if it belongs to the wrong trace or ignores the runs that never received a judgement.',
    order: 'build-first',
    preparation: { path: [0, 0, 0], title: 'Attach one rubric’s judgement to each run', challenge: 'Select the requested rubric revision and join its scores to the run records by traceId. Preserve a missing score as null.', why: 'Scoring can finish out of order. Identity, rather than row position, determines which answer received each judgement.' },
    construction: { title: 'Read the version’s score beside its coverage', start: 'Keep the requested prompt revision, then calculate the mean available score and the fraction of its runs that were scored.', outcome: 'The paired result retains missing evaluations in the coverage denominator without changing them into zero scores.' , hints: ["A score must join to the run it evaluated, using traceId. Arrival order is not evidence that two rows belong together.","Select the requested rubric revision before joining scores, then select the prompt revision. Keep unscored runs for coverage even though the available-score mean excludes them."] },
    investigation: {
      title: 'One request never reaches the evaluator', caseIndex: 1, kind: 'compare',
      question: 'Prompt 3 has runs A, B and C. A scores 0, B scores 1, and C has no judgement. What should change compared with a version where all runs were scored?',
      options: [
        { label: 'Report the available-score mean and reduced coverage separately', feedback: 'Correct. C remains a run in the denominator for coverage, while the available-score mean uses A and B.', correct: true },
        { label: 'Drop C entirely and report full coverage', feedback: 'That conceals the missing evaluation. It can make failures that prevent scoring disappear from the report.' },
        { label: 'Treat A as missing because its score is zero', feedback: 'Zero is a completed judgement. Only an absent score is unscored in these records.' },
      ],
      outcome: 'The mean remains 0.5 and coverage becomes two thirds. Investigate why C is unscored before interpreting the version comparison.',
    },
    connections: [
      { lessonId: 'agent-tracing', skill: 'Identify the request behind an observation', why: 'Trace IDs let the score refer back to the execution being judged.' },
      { lessonId: 'agent-prompts', skill: 'Keep the instructions and task boundaries explicit', why: 'A prompt revision identifies the instructions actually used in a run.' },
    ],
    reflection: { prompt: 'Why does a low score belong in the mean while a missing score needs a coverage report, and what would make two rubric revisions incomparable?', carryForward: 'Keep run identity, prompt revision and evaluator revision attached to scores. Missing evaluation is a distinct state that a mean alone cannot explain.' },
  },
  'agent-evaluation-datasets': {
    premise: 'The technician asked about an inspection. Botie’s response can sound right while his tool calls do something the case forbids. The evaluator must inspect both.',
    order: 'investigate-first',
    preparation: { path: [0, 1], title: 'Read each case’s permission boundary', challenge: 'Produce one flag per recorded case indicating whether every executed call name is in that case’s allowed list.', why: 'A correct outcome label cannot undo an unapproved action. This branch isolates the permission check before combining it with the task result.' },
    construction: { title: 'Require the outcome and the permitted route', start: 'Calculate outcome-match flags, combine them with the aligned permission flags, and average only after both requirements have been applied per case.', outcome: 'The fraction describes cases satisfying both contracts, including cases that must abstain or ask for approval.' , hints: ["Inspect what happened as well as the label returned. A correct request_approval label cannot excuse an executed create_job call.","Combine outcome matching and permission flags for each case first. Average those joint results only after the flags remain aligned by case."] },
    investigation: {
      title: 'Botie asks for approval after already creating the job', caseIndex: 1, kind: 'diagnose',
      question: 'The approval-missing case returns request_approval, as required, but calls create_job even though only search_manual and propose_job are permitted. Which part of the earlier outcome-only test is missing?',
      options: [
        { label: 'A check on executed actions for each case', feedback: 'Yes. The final label matches while the trajectory violates the case’s action boundary.', correct: true },
        { label: 'A longer reference answer', feedback: 'More answer text does not check the side effect. The evaluator needs the recorded tool calls and their permissions.' },
      ],
      outcome: 'The approval case fails despite its correct label. Both branches must remain connected when a later case uses permitted tools but produces the wrong outcome.',
    },
    connections: [
      { lessonId: 'agent-langfuse', skill: 'Attach results to identified runs and cases', why: 'Each contract must be checked against the execution of that same maintenance task.' },
      { lessonId: 'agent-human-approval', skill: 'Separate a proposed action from an authorised write', why: 'The evaluation checks whether that approval boundary survived the agent’s actual trajectory.' },
    ],
    reflection: { prompt: 'Which failures can a tool-name allowlist detect, and which still require inspecting arguments, order or the resulting state?', carryForward: 'Evaluate a task’s outcome and actions together. Be explicit about the part of correctness each deterministic check leaves untested.' },
  },
  'agent-model-judges': {
    premise: 'Some maintenance answers need semantic review. Botie has recorded human and model labels, and needs uncertain or disputed cases to remain visible instead of disappearing into an average.',
    order: 'build-first',
    preparation: { path: [1, 0, 0], title: 'Find disagreement with the human reference', challenge: 'Compare the human and judge fields in each record, flagging either uncertainty or unequal labels.', why: 'This checks one source of disagreement. The repeated judgement may reveal a separate issue even when the first judge result agrees with the human.' },
    construction: { title: 'Keep every reason for review attached to the case', start: "Keep the cases needing review because a label is uncertain, the human and judge disagree, or changing evidence order changes the judge’s label. Return their IDs in the original case order.", outcome: 'The review list names cases with disputed or uncertain labels without claiming which label is correct.' , hints: ["Matching labels are not enough when the matching label means uncertain. That case still needs review.","Keep a case if any review reason holds. Build a mask from those reasons, then apply it to the aligned IDs."] },
    investigation: {
      title: 'Everyone writes uncertain', caseIndex: 2, kind: 'decide',
      question: 'For conflicting-manuals, the human, judge and reordered-evidence judge all return −1, meaning uncertain. Should matching labels remove this case from review?',
      options: [
        { label: 'No, agreement on uncertainty still leaves the answer unresolved', feedback: 'Correct. Matching numbers do not establish a supported answer when the number explicitly means uncertain.', correct: true },
        { label: 'Yes, any agreement is sufficient', feedback: 'That would hide the unresolved evidence. The record has no settled supported or unsupported judgement.' },
      ],
      outcome: 'The review queue retains conflicting-manuals and missing-page. A separate case where only the reordered judgement changes must also remain detectable.',
    },
    connections: [
      { lessonId: 'agent-evaluation-datasets', skill: 'Keep expected behaviour separate from the output being tested', why: 'Human reference labels and the judge’s input need a defined evidence boundary.' },
      { lessonId: 'agent-prompts', skill: 'Specify an operation rather than a vague quality request', why: 'A judge needs a rubric with meaningful label boundaries and uncertainty behaviour.' },
    ],
    reflection: { prompt: 'Why does the queue flag a problem without supplying a corrected verdict, and what can still be wrong when every available label agrees?', carryForward: 'Use model judgements as fallible evidence. Preserve uncertainty and inspect the evaluator as well as the agent.' },
  },
  'agent-release-checks': {
    premise: 'The new maintenance assistant improves average answers, but Botie must still respect approval requirements and the technician’s waiting budget. A release decision needs all of those requirements.',
    order: 'investigate-first',
    preparation: { path: [0, 0, 0], title: 'Compare each maintenance case with itself', challenge: 'Pair baseline and candidate records by case ID, subtract their aligned scores and calculate the mean paired change.', why: 'This is evidence about answer quality. It deliberately leaves the critical-action and latency requirements for separate branches.' },
    construction: { title: 'Keep release requirements independent until the final gate', start: 'Compare the paired mean gain with its minimum, the largest candidate latency with its limit, and the largest critical flag with zero. Return 1 only when every branch passes.', outcome: 'Improved average scores cannot override a critical action or an exceeded timing budget.' , hints: ["A better average answer does not compensate for a critical unapproved action. Keep that branch as a hard requirement.","Join shared case IDs before calculating the mean change. Compare latency and quality with their own limits, then require every branch to pass."] },
    investigation: {
      title: 'The score improves while approval is bypassed', caseIndex: 1, kind: 'decide',
      question: 'Both answer scores improve, but one candidate record has critical=1 for an unapproved job creation. The policy permits no critical failures. What should happen?',
      options: [
        { label: 'Block this candidate under the supplied policy', feedback: 'Yes. The critical-action requirement is independent of average score improvement.', correct: true },
        { label: 'Pass it because both scores improved', feedback: 'That would let one metric erase a requirement the policy explicitly treats as non-negotiable.' },
      ],
      outcome: 'The quality branch still passes, but the final result is 0. The timing and quality-regression cases check the other branches before the next shift.',
    },
    connections: [
      { lessonId: 'agent-evaluation-datasets', skill: 'Define task contracts and retain failed cases', why: 'The release comparison uses the same case identities and preserves critical trajectory failures.' },
      { lessonId: 'agent-model-judges', skill: 'Know what an evaluation score can establish', why: 'A favourable semantic judgement cannot replace permission checks or settle every uncertainty.' },
    ],
    reflection: { prompt: 'Which input could change the release decision without changing any answer score, and why does a pass on these cases still require observation after rollout?', carryForward: 'Version the system and evaluator, compare matched cases, and keep release policy explicit. Fresh failures should become replayable cases before claiming a repair.' },
  },
};
