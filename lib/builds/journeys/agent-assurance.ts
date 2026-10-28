import type { JourneyPlan } from '../journey-plan';

export const agentAssuranceJourneys: Record<string, JourneyPlan> = {
  'agent-adversarial-evaluations': {
    premise: 'The approval guardrail stopped the recorded attacks, but technicians now struggle to get permitted work done. Botie needs separate evidence about the boundary and the service it is meant to protect.',
    order: 'investigate-first',
    preparation: {
      path: [0], title: 'Report one attack family with its review coverage',
      challenge: 'Select the named attack family, read its success flags and count the reviewed outcomes. Keep unresolved attempts in total, without turning them into prevention.',
      why: 'This establishes the boundary result before adding the ordinary-request branch. Mixing different families or losing unresolved cases can conceal the weakness.',
    },
    construction: {
      title: 'Keep permitted work beside the attack result',
      start: 'Build a separate reviewed-outcome report for blocked flags on permitted requests. Collect the attack report first and the refusal report second.',
      outcome: 'The output shows attack violations and false refusals with their own counts and coverage.',
     hints: ["Preventing every attack can still leave the service unusable. Keep the attack results separate from false refusals on permitted work.","An unresolved attempt is missing evidence, not prevention. Preserve its count when reporting review coverage."] },
    investigation: {
      title: 'Botie refuses two ordinary maintenance requests', caseIndex: 1, kind: 'diagnose',
      question: 'Both approval attacks are prevented. Among three permitted requests, two are unjustifiably refused. Which branch tells us that the new defence harms the intended task?',
      options: [
        { label: 'The permitted-request refusal report', feedback: 'Yes. The attack report remains clear for those attempts while the separate ordinary-request denominator exposes the unwanted refusals.', correct: true },
        { label: 'Only the attack-success rate', feedback: 'The two attacks still failed. That rate alone cannot reveal what happened to permitted requests.' },
      ],
      outcome: 'The second report contains two events among three reviewed permitted requests. A later case leaves a review unresolved so the same construction must preserve coverage too.',
    },
    connections: [
      { lessonId: 'agent-authorization', skill: 'State a permission boundary at the application executor', why: 'The attack outcome must describe whether that actual boundary was crossed, not whether the answer sounded cautious.' },
      { lessonId: 'agent-evaluation-datasets', skill: 'Evaluate the intended task and its executed actions together', why: 'Ordinary tasks remain part of the evaluation even when the new cases deliberately seek violations.' },
    ],
    reflection: { prompt: 'What would make a zero observed violation rate uninformative, and how would you check a repair without rewarding a system that refuses everything?', carryForward: 'Retain the boundary, attack family and evidence coverage with every rate. Preserve useful permitted work and use fresh scenarios after a repair.' },
  },
  'agent-incident-response': {
    premise: 'A failed canary can leave work in a queue or already running elsewhere. Botie needs to stop further effects while keeping those action identities available for investigation.',
    order: 'build-first',
    preparation: {
      path: [1], title: 'Find the release’s unsettled actions',
      challenge: 'Select the release, keep pending, in_flight and unknown records, then return their IDs in record order.',
      why: 'This inventory will remain necessary after a stop. Completed effects remain in the audit history, while unknown effects must not disappear as though cancelled.',
    },
    construction: {
      title: 'Add the decision to continue this limited canary',
      start: 'Require a nonempty set of completed clear checks for the selected release, fresh monitoring and no operator stop. Choose the resulting mode and collect it beside the action inventory.',
      outcome: 'The output separates the continuation decision from the work whose final state still needs to be established.',
     hints: ["Yesterday’s clear checks are not evidence for a different release. Select the release before deciding whether its checks are complete and current.","Keep pending, in_flight and unknown action IDs available even when the control says pause. Stopping new work does not settle effects already underway."] },
    investigation: {
      title: 'The checks are clear, but the monitor is stale', caseIndex: 2, kind: 'decide',
      question: 'The selected release has a recorded zero critical flag and no operator stop. Its monitoring-fresh flag is 0. Can yesterday’s evidence permit the canary to continue under this policy?',
      options: [
        { label: 'Pause and investigate the missing current evidence', feedback: 'Correct. The continuation rule requires fresh evidence as well as clear recorded checks. job-D remains in the inventory.', correct: true },
        { label: 'Continue because the old critical flag is zero', feedback: 'That ignores whether the old check still describes the current shift. A missing fresh observation is not a current all-clear.' },
      ],
      outcome: 'The mode becomes pause_and_reconcile without inventing a new critical event. The unsettled action remains visible for the operator.',
    },
    connections: [
      { lessonId: 'agent-retries-and-effects', skill: 'Track action identity when a response leaves the result uncertain', why: 'An unknown effect must be reconciled before a retry can safely create more work.' },
      { lessonId: 'agent-release-checks', skill: 'Keep critical requirements independent of average quality', why: 'The live continuation rule preserves that separation after the offline suite has passed.' },
    ],
    reflection: { prompt: 'Which effects could still exist after the mode changes to pause, and what evidence would you need before retrying an unknown action?', carryForward: 'A stop limits new authority. Recovery also needs an action inventory, verified external state and a tested repair before the next limited shift.' },
  },
};
