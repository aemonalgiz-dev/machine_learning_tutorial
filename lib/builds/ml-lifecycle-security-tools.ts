import type { Data, Tool } from './engine';

type Row = Record<string, Data>;
const array = (value: Data): Data[] => { if (!Array.isArray(value)) throw Error('Connect a list.'); return value; };
const number = (value: Data): number => { if (typeof value !== 'number' || !Number.isFinite(value)) throw Error('Use finite numerical values.'); return value; };
const vector = (value: Data) => array(value).map(number);
const records = (value: Data): Row[] => array(value).map(item => {
  if (item === null || Array.isArray(item) || typeof item !== 'object') throw Error('Connect records with named fields.');
  return item;
});
const flags = (value: Data) => array(value).map(item => { if (item !== 0 && item !== 1) throw Error('Use aligned 0-or-1 flags.'); return item; });
const aligned = (...values: Data[][]) => { if (values.some(value => value.length !== values[0].length)) throw Error('The lists must describe the same examples in the same order.'); };

export const mlLifecycleSecurityTools: Record<string, Tool> = {
  lifecycleSourceAllowed: {
    title: 'Check the recorded source against the release policy', inputs: ['Training records', 'Approved source IDs'],
    why: 'Returns a flag for each source ID present in the supplied approved set. Source IDs are already resolved fixture evidence; a real pipeline must authenticate provenance outside attacker-controlled records.',
    run: ([input, approved]) => { const allowed = array(approved); if (!allowed.every(x => typeof x === 'string')) throw Error('Approved source IDs must be text.'); return records(input).map(row => Number(typeof row.source === 'string' && allowed.includes(row.source))); },
  },
  lifecycleLabelReviewed: {
    title: 'Require a completed label review', inputs: ['Training records'],
    why: "Returns 1 only when a record carries the exact Boolean reviewed=true. Missing, false or text flags do not count as completed review. Review is supplied evidence, not proof that a label is correct.",
    run: ([input]) => records(input).map(row => Number(row.reviewed === true)),
  },
  lifecycleRecordIds: {
    title: 'Keep training record identities', inputs: ['Training records'],
    why: 'Reads a distinct nonempty ID from each record, keeping incoming order so selected labels can be traced back to the same records.',
    run: ([input]) => { const ids = records(input).map(row => row.id); if (!ids.every(id => typeof id === 'string' && id.length > 0) || new Set(ids).size !== ids.length) throw Error('Each record needs a distinct nonempty ID.'); return ids; },
  },
  lifecycleTrainingTargets: {
    title: 'Read the aligned training targets', inputs: ['Training records'],
    why: 'Reads each finite numerical target in record order. Filtering targets must use the same mask as filtering their record identities.',
    run: ([input]) => records(input).map(row => number(row.target)),
  },
  lifecycleMeanOrNull: {
    title: 'Report a mean only when evidence remains', inputs: ['Accepted numerical values'],
    why: 'Returns their arithmetic mean, or null for an empty list. No accepted evidence is not a measured mean of zero.',
    run: ([input]) => { const values = vector(input); return values.length ? values.reduce((a,b) => a+b,0) / values.length : null; },
  },
  lifecycleMatches: {
    title: 'Compare aligned class labels', inputs: ['Reference labels', 'Predicted labels'],
    why: "Returns 1 for an exact matching label and 0 otherwise, keeping one flag per example. The labels in this exercise are already adjudicated fixtures.",
    run: ([first, second]) => { const a = array(first), b = array(second); aligned(a,b); if (![...a,...b].every(x => typeof x === 'string' || typeof x === 'number' && Number.isFinite(x))) throw Error('Use text or finite numerical class labels.'); return a.map((value,i) => Number(value === b[i])); },
  },
  lifecycleEligiblePairs: {
    title: 'Select clean-correct, non-target, label-preserving pairs', inputs: ['True labels', 'Clean predictions', 'Target class', 'Label-preserving review flags'],
    why: "Keep an example only if the original prediction was correct, its true class differs from the target, and the edit left that true class unchanged. These are the examples used to calculate the conditional failure rate.",
    run: ([truth, clean, target, preserved]) => { const y = array(truth), p = array(clean), valid = flags(preserved); aligned(y,p,valid); return y.map((value,i) => Number(value !== target && p[i] === value && valid[i] === 1)); },
  },
  lifecycleTargetHits: {
    title: 'Check whether changed inputs reached the target class', inputs: ['Predictions on changed inputs', 'Target class'],
    why: 'Marks target-class predictions. Combine with eligibility before calculating a conditional targeted-failure rate.',
    run: ([predictions, target]) => array(predictions).map(value => Number(value === target)),
  },
  lifecycleConditionalRate: {
    title: 'Keep the failure count beside its denominator', inputs: ['Eligible-pair flags', 'Target-hit flags'],
    why: "Count target predictions only for the reviewed eligible pairs. Return the eligible count and target-hit count with their ratio. When there are no eligible pairs, return null for the rate.",
    run: ([eligibleInput, hitInput]) => { const eligible = flags(eligibleInput), hit = flags(hitInput); aligned(eligible,hit); const n = eligible.reduce<number>((a,b) => a+b,0), successes = eligible.reduce<number>((a,b,i) => a+b*hit[i],0); return { eligible:n, successes, rate:n ? successes/n : null }; },
  },
  lifecycleFixedCoordinates: {
    title: 'Check coordinates outside the stated control', inputs: ['Original input', 'Changed input', 'Mutable-coordinate flags'],
    why: "Returns 1 only when every coordinate marked 0 remains exactly unchanged. This finite-vector fixture models one declared attacker capability, not a general perceptual constraint.",
    run: ([original, changed, mutableInput]) => { const a=vector(original), b=vector(changed), mutable=flags(mutableInput); aligned(a,b,mutable); return Number(a.every((value,i) => mutable[i] === 1 || value === b[i])); },
  },
  lifecycleWithinBounds: {
    title: 'Check the allowed input domain', inputs: ['Changed input', 'Public lower and upper bounds'],
    why: "Returns 1 when every changed coordinate lies inside the supplied inclusive interval. Domain bounds are separate from the permitted change size.",
    run: ([input, boundsInput]) => { const values=vector(input), bounds=vector(boundsInput); if (bounds.length!==2 || bounds[0]>bounds[1]) throw Error('Supply ordered [lower,upper] domain bounds.'); return Number(values.every(x => x>=bounds[0] && x<=bounds[1])); },
  },
  lifecycleTrialReport: {
    title: 'Separate an observed failure from an out-of-scope trial', inputs: ['In-scope flag', 'Original prediction', 'Changed prediction', 'Reviewed true label'],
    why: 'Reports correctness before and after the change. A new within-scope error counts only if the original was correct; an out-of-scope or originally wrong trial has observed_failure=null.',
    run: ([scope, clean, changed, truth]) => { if (scope!==0 && scope!==1) throw Error('Connect a 0-or-1 scope flag.'); const cleanCorrect=clean===truth, changedCorrect=changed===truth; return { within_scope:scope===1, clean_correct:cleanCorrect, changed_correct:changedCorrect, observed_failure:scope===1 && cleanCorrect ? !changedCorrect : null }; },
  },
  lifecyclePublicLabel: {
    title: 'Return only the permitted prediction fields', inputs: ['Admission flag', 'Internal model score', 'Label cutoff'],
    why: 'Returns an allowed flag and the thresholded label for an admitted request, withholding the internal confidence score. Denied requests receive no prediction. Reduced detail alone cannot prevent model extraction.',
    run: ([admitted, score, cutoff]): Data => {
      if (admitted!==0 && admitted!==1) throw Error('Connect a 0-or-1 admission flag.');
      if (admitted===0) return { allowed:false };
      return { allowed:true, label:Number(number(score)>=number(cutoff)) };
    },
  },
};
