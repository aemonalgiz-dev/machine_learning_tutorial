import { part, view } from './authoring.mjs';
export { history, source, before, example, construction, sample, s, op, c } from './authoring.mjs';
export { question as q, claim as tf } from './gap-authoring.mjs';

const workshopHints = {
  'design-from-decisions': ['The duration list includes pumps we are deferring. What should their contribution to scheduled minutes be?', 'Multiply each duration by its 0-or-1 decision, then collect the assigned minutes with Add a list. A dot product would perform the same calculation.'],
  'design-without-a-model': ['Keep inspection cost and missed-fault cost on separate branches until each is calculated.', 'Subtract each decision from 1. Multiplying that result by the fault labels marks only faulty pumps we deferred.', 'Multiply each branch by its cost, add the contributions, and total the list. An inspection still costs something when the pump is healthy.'],
  'design-information-boundaries': ['An early event can still arrive late. Check both timestamps against the decision time.', 'Threshold gate checks whether its first input is at least its second. Put decision time first and the timestamps second.', 'Multiply the two masks. A record needs both flags to be 1.'],
  'design-pipeline-capacity': ['A stage has a worker count and a rate per worker. First find the rate for the whole stage.', 'Multiply the aligned lists, then use Smallest value. Adding rates would pretend a request can skip the other stages.'],
  'design-queues-and-bursts': ['The queue must remember unfinished requests from the preceding interval. Queue over time performs that recurrence.', 'Connect arrivals and service capacities to their named ports. The output is a backlog for every interval; find its Largest value.'],
  'design-memory-budget': ['Give parameters and activations separate branches. Each needs a count multiplied by bytes per item.', 'Add parameter bytes, batch activation bytes, and fixed runtime bytes. All three allocations use the same unit.', 'Subtract the total from the memory limit. Keep a negative answer when the batch is too large.'],
  'design-edge-or-cloud': ['The upload term converts bytes into seconds. Which input is bytes per second?', 'Divide payload by effective bandwidth, then add network overhead and remote compute time.', 'Subtract local time last. A positive answer means this remote estimate takes longer.'],
  'design-feasible-tradeoffs': ['Each candidate must pass both limits. Keep a separate comparison for latency and misses.', 'Put each maximum in the first input of a Threshold gate and the measurements in the second. Multiply the two masks.'],
  'design-sensitive-assumptions': ['Avoided misses produce a benefit; additional inspections create a cost. Calculate them separately.', 'Multiply avoided misses by the list of miss-cost scenarios, then subtract extra inspections times inspection cost. Leave the result as a list so we can compare assumptions.'],
  'design-prototype-experiments': ['Choose an entry uses zero-based positions. The small-batch times are positions 0 and 1; the large-batch times are 2 and 3.', 'For each batch size, subtract original-format time from smaller-format time.', 'Subtract the small-batch effect from the large-batch effect. Check the sign on the case where the effects are equal.'],
  'design-fallbacks': ['A fresh record can still be invalid. Form a use-model mask that requires both conditions.', 'Threshold gate can compare maximum age against each record age. Multiply its output by validity.', 'Choose by a mask takes the use-model mask, proposed model actions, and review actions in that order. A zero must select review, not silently defer.'],
  'design-inspection-review': ['The fault fixture and load trace are separate branches. Start by deciding which inputs belong to each requirement.', 'Count labels times one minus decisions for missed faults. Separately feed arrivals and capacities through Queue over time and Largest value.', 'Compare each result with its own limit, then multiply the two pass flags. Try the busy-shift and quiet-but-inaccurate cases to check both branches.'],
};

export const chapter = (...args) => part(...args);
export const table = (title, explanation, columns, records, caption) => view(title, explanation, [], {
  kind: 'table', rowHeading: columns[0], columns: columns.slice(1),
  records: records.map(([label, ...cells]) => ({ label, cells })), caption,
});
export const flow = (title, explanation, rows, caption) => view(title, explanation, [], {
  kind: 'flow', rows: rows.map(([label, ...items]) => ({ label, items })), caption,
});
export function designLesson(section, record) {
  const { checkpointAfter, checkpoint, ...rest } = record;
  const parts = record.parts.map((entry, i) => ({ ...entry, title: `${i + 1}. ${entry.title}` }));
  return { ...rest, section, parts, build: { ...record.build, hints: workshopHints[record.id] }, checkpoints: [{
    after: parts[checkpointAfter - 1].title,
    title: `Questions on Parts 1 to ${checkpointAfter}`,
    questions: checkpoint,
  }] };
}
export function challenge(title, task, starter, solution, output, hints, tests, presentation = {}) {
  return { title, question: presentation.question ?? title, task, starter, solution, output, hints,
    tests: tests.map(([name, code]) => ({ name, code })) };
}
