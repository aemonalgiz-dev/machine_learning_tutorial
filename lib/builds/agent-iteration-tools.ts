import type { Data, Tool } from './engine';

function row(value: Data, label: string): Record<string, Data> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw Error(`${label} needs named fields.`);
  return value;
}
function text(value: Data, label: string): string {
  if (typeof value !== 'string' || !value.trim()) throw Error(`${label} needs nonempty text.`);
  return value;
}
function whole(value: Data, label: string): number {
  if (typeof value !== 'number' || !Number.isSafeInteger(value) || value < 0) throw Error(`${label} needs a nonnegative whole number.`);
  return value;
}
function flag(value: Data, label: string): boolean {
  if (typeof value !== 'boolean') throw Error(`${label} must be true or false.`);
  return value;
}
function rows(value: Data): Record<string, Data>[] {
  if (!Array.isArray(value)) throw Error('Connect a list of records.');
  return value.map(entry => row(entry, 'Record'));
}
function indexed(value: Data): Map<string, Record<string, Data>> {
  const result = new Map<string, Record<string, Data>>();
  for (const entry of rows(value)) {
    const id = text(entry.id, 'Record ID');
    if (result.has(id)) throw Error('Record IDs must be unique.');
    result.set(id, entry);
  }
  return result;
}

export const agentIterationTools: Record<string, Tool> = {
  aiApprovedEvidence: {
    title: 'Keep approved manual records', why: 'An available document is not necessarily approved for answering this maintenance request.', inputs: ['Manual records'],
    run: ([input]) => rows(input).filter(r => flag(r.approved, 'Approved')),
  },
  aiAssetEvidence: {
    title: 'Match the requested asset', why: 'Evidence for P8 cannot answer a question about P7 just because both are pumps.', inputs: ['Approved records', 'Requested asset'],
    run: ([input, asset]) => { const wanted = text(asset, 'Asset'); return rows(input).filter(r => text(r.asset, 'Record asset') === wanted); },
  },
  aiNextStep: {
    title: 'Choose answer, lookup or handoff', why: 'Use available matching evidence. Otherwise spend a remaining lookup, or hand off when none remain.', inputs: ['Matching evidence', 'Lookups remaining'],
    run: ([input, remaining]) => { const evidence = rows(input), budget = whole(remaining, 'Lookups remaining'); return evidence.length ? 'answer from evidence' : budget > 0 ? 'request manual lookup' : 'hand off'; },
  },
  aiDemonstrations: {
    title: 'Choose development examples for this job', why: 'Keep matching examples from the development pool. Held-out cases must stay out of prompt selection.', inputs: ['Example pool', 'Requested kind'],
    run: ([input, kind]) => {
      const wanted = text(kind, 'Kind');
      return [...indexed(input).values()].filter(r => {
        if (r.split !== 'development' && r.split !== 'held-out') throw Error('Declare development or held-out for each example.');
        text(r.kind, 'Example kind'); whole(r.tokens, 'Recorded example tokens'); text(r.input, 'Example input'); text(r.output, 'Example output');
        return r.split === 'development' && r.kind === wanted;
      });
    },
  },
  aiExampleBudget: {
    title: 'Fit examples into the reserved space', why: 'Scan in the supplied order, add each example that fits, and deduct its recorded cost before considering the next.', inputs: ['Eligible examples', 'Tokens reserved for examples'],
    run: ([input, limit]) => {
      let remaining = whole(limit, 'Example allowance'); const selected: string[] = [];
      for (const r of indexed(input).values()) {
        const cost = whole(r.tokens, 'Recorded example tokens');
        if (cost <= remaining) { selected.push(text(r.id, 'Example ID')); remaining -= cost; }
      }
      return { selected, remaining };
    },
  },
  aiJoinContracts: {
    title: 'Match observed calls to test cases', why: 'Join by case ID, preserving a missing run. Array position cannot identify the request that produced a tool call.', inputs: ['Expected calls', 'Observed calls'],
    run: ([planned, observed]) => {
      const expected = indexed(planned), actual = indexed(observed);
      for (const id of actual.keys()) if (!expected.has(id)) throw Error('An observed call has no declared test case.');
      return [...expected].map(([id, r]) => {
        text(r.tool, 'Expected tool'); text(r.asset, 'Expected asset');
        const run = actual.get(id);
        if (!run) return { id, passed: null };
        return { id, passed: text(run.tool, 'Observed tool') === r.tool && text(run.asset, 'Observed asset') === r.asset };
      });
    },
  },
  aiContractSummary: {
    title: 'Count passes, failures and missing runs', why: 'A test that did not run cannot count as a passing contract.', inputs: ['Matched test outcomes'],
    run: ([input]) => {
      const result = { passed: 0, failed: 0, missing: 0 };
      for (const r of indexed(input).values()) {
        if (r.passed === null) result.missing++;
        else if (flag(r.passed, 'Test outcome')) result.passed++;
        else result.failed++;
      }
      return result;
    },
  },
  aiFailedRuns: {
    title: 'Keep the failed task reviews', why: 'Review labels describe the whole task. Successful tasks do not belong in this failure inventory.', inputs: ['Reviewed runs'],
    run: ([input]) => [...indexed(input).values()].filter(r => !flag(r.passed, 'Task passed')),
  },
  aiErrorGroups: {
    title: 'Group the first observed failures', why: 'Count reviewed failure locations and retain IDs whose traces do not yet establish a location.', inputs: ['Failed task reviews'],
    run: ([input]) => {
      const counts = { evidence: 0, decision: 0, execution: 0 }; const unresolved: string[] = [];
      for (const r of indexed(input).values()) {
        if (r.stage === null) unresolved.push(text(r.id, 'Run ID'));
        else if (r.stage === 'evidence' || r.stage === 'decision' || r.stage === 'execution') counts[r.stage]++;
        else throw Error('Use evidence, decision, execution, or null for an unresolved review.');
      }
      return { counts, unresolved };
    },
  },
  aiChangedFactors: {
    title: 'Compare the experiment settings', why: 'Record every changed setting before attributing an outcome to the prompt examples.', inputs: ['Baseline settings', 'Candidate settings'],
    run: ([before, after]) => {
      const a = row(before, 'Baseline settings'), b = row(after, 'Candidate settings');
      const keys = [...new Set([...Object.keys(a), ...Object.keys(b)])].sort();
      for (const key of keys) { if (Object.hasOwn(a, key)) text(a[key], 'Setting version'); if (Object.hasOwn(b, key)) text(b[key], 'Setting version'); }
      return keys.filter(key => !Object.hasOwn(a, key) || !Object.hasOwn(b, key) || a[key] !== b[key]);
    },
  },
  aiPairOutcomes: {
    title: 'Pair task results by case ID', why: 'The same tasks must appear on both sides, even when their result files arrive in a different order.', inputs: ['Baseline outcomes', 'Candidate outcomes'],
    run: ([before, after]) => {
      const a = indexed(before), b = indexed(after);
      if (!a.size || a.size !== b.size || [...a.keys()].some(id => !b.has(id))) throw Error('Use the same nonempty set of case IDs.');
      return [...a].map(([id, r]) => ({ id, before: flag(r.passed, 'Baseline pass'), after: flag(b.get(id)!.passed, 'Candidate pass') }));
    },
  },
  aiAblationReport: {
    title: 'Report the isolated change and its tradeoffs', why: 'Show regressions even when improvements outnumber them. A comparison with several changed factors cannot isolate examples.', inputs: ['Changed setting names', 'Paired outcomes'],
    run: ([changes, input]) => {
      if (!Array.isArray(changes) || changes.some(v => typeof v !== 'string')) throw Error('Connect the changed setting names.');
      const improved: string[] = [], regressed: string[] = [], unchanged: string[] = [];
      for (const r of indexed(input).values()) {
        const a = flag(r.before, 'Before'), b = flag(r.after, 'After'), id = text(r.id, 'Case ID');
        (a === b ? unchanged : b ? improved : regressed).push(id);
      }
      return { isolated: changes.length === 1 && changes[0] === 'examples', improved, regressed, unchanged };
    },
  },
  aiCandidateCoverage: {
    title: 'Keep every required case in the report', why: 'A missing result stays visible instead of shrinking the release test set.', inputs: ['Required case IDs', 'Candidate results'],
    run: ([input, results]) => {
      if (!Array.isArray(input)) throw Error('Supply the required case IDs.');
      const ids = input.map(v => text(v, 'Required case ID')), actual = indexed(results);
      if (new Set(ids).size !== ids.length) throw Error('Required case IDs must be unique.');
      for (const id of actual.keys()) if (!ids.includes(id)) throw Error('A result is outside this required case set.');
      return ids.map(id => actual.get(id) ?? { id, missing: true });
    },
  },
  aiTrialDecision: {
    title: 'Check the candidate before a limited trial', why: 'Every required task needs a passing result, no observed critical violation, and latency within the declared limit.', inputs: ['Required candidate results', 'Maximum milliseconds per case'],
    run: ([input, maximum]) => {
      const limit = whole(maximum, 'Latency limit'), records = [...indexed(input).values()], reasons: string[] = [];
      if (!records.length) reasons.push('no required cases');
      for (const r of records) {
        const id = text(r.id, 'Case ID');
        if (r.missing === true) { reasons.push(`${id}: missing`); continue; }
        if (!flag(r.passed, 'Task passed')) reasons.push(`${id}: task failed`);
        if (flag(r.critical, 'Critical violation')) reasons.push(`${id}: critical violation`);
        if (whole(r.ms, 'Observed milliseconds') > limit) reasons.push(`${id}: too slow`);
      }
      return { decision: reasons.length ? 'hold' : 'eligible for limited trial', reasons };
    },
  },
};
