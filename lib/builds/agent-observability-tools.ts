import type { Data, Tool } from './engine';

type Row = { [key: string]: Data };
const rows = (value: Data): Row[] => {
  if (!Array.isArray(value) || value.some(item => !item || typeof item !== 'object' || Array.isArray(item))) {
    throw Error('Connect a list of records, with named fields on every record.');
  }
  return value as Row[];
};
const field = (row: Row, key: string): Data => {
  if (!Object.hasOwn(row, key)) throw Error(`A record is missing its ${key} field.`);
  return row[key];
};
const number = (value: Data, label: string): number => {
  if (typeof value !== 'number' || !Number.isFinite(value)) throw Error(`${label} needs a finite number.`);
  return value;
};
const identity = (value: Data): string => {
  if (typeof value !== 'string' || !value.length) throw Error('Each record needs a nonempty text identifier.');
  return value;
};
const unique = (records: Row[], key: string): Map<string, Row> => {
  const result = new Map<string, Row>();
  for (const row of records) {
    const id = identity(field(row, key));
    if (result.has(id)) throw Error(`The ${key} ${id} occurs more than once. Select one run or evaluator version first.`);
    result.set(id, row);
  }
  return result;
};
const label = (value: Data): number => {
  if (value !== -1 && value !== 0 && value !== 1) throw Error('Labels use 1 for supported, 0 for unsupported and -1 for uncertain.');
  return value;
};
const strings = (value: Data): string[] => {
  if (!Array.isArray(value) || value.some(v => typeof v !== 'string')) throw Error('Tool names need a list of strings.');
  return value as string[];
};

/** Small record operations used to inspect the maintenance assistant's recorded runs. */
export const agentObservabilityTools: Record<string, Tool> = {
  agentObsFilter: {
    title: 'Keep matching records',
    why: 'Keeps records whose named field exactly matches the supplied value. Missing fields are an error; an empty match is an empty list.',
    inputs: ['Records', 'Required field value'],
    settings: [{ key: 'field', label: 'Field to match', initial: 'trace' }],
    run: ([data, wanted], settings) => rows(data).filter(row => field(row, String(settings.field)) === wanted),
  },
  agentObsColumn: {
    title: 'Read a record field',
    why: 'Reads the configured field from each record, preserving order and reporting missing fields.',
    inputs: ['Records'],
    settings: [{ key: 'field', label: 'Field name', initial: 'id' }],
    run: ([data], settings) => rows(data).map(row => field(row, String(settings.field))),
  },
  agentObsRoot: {
    title: 'Find the request span',
    why: 'Selects the one record whose parent is null. Use this after selecting one trace. Multiple roots or a missing root need investigation.',
    inputs: ['One trace’s span records'],
    run: ([data]) => {
      const found = rows(data).filter(row => field(row, 'parent') === null);
      if (found.length !== 1) throw Error('Select one complete trace with exactly one root span.');
      return found;
    },
  },
  agentObsDurations: {
    title: 'Measure span durations',
    why: 'Subtracts start from end for each span in the same clock and unit. Does not add overlapping intervals.',
    inputs: ['Span records with start and end'],
    run: ([data]) => rows(data).map(row => {
      const start = number(field(row, 'start'), 'Start time');
      const end = number(field(row, 'end'), 'End time');
      if (end < start) throw Error('A span ends before it starts. Check the recorded clock and unit.');
      return end - start;
    }),
  },
  agentObsJoinScores: {
    title: 'Attach scores by trace ID',
    why: 'Links one selected evaluator’s trace-level score to each run by traceId. A missing score stays null. Extra scores do not create runs; duplicate score IDs need a version filter.',
    inputs: ['Run records', 'One evaluator version’s scores'],
    run: ([runs, scores]) => {
      const runRows = rows(runs);
      unique(runRows, 'traceId');
      const byId = unique(rows(scores), 'traceId');
      return runRows.map(row => {
        const score = byId.get(identity(field(row, 'traceId')));
        const value = score ? number(field(score, 'value'), 'Score') : null;
        if (value !== null && (value < 0 || value > 1)) throw Error('This workshop expects scores between zero and one.');
        return { ...row, score: value };
      });
    },
  },
  agentObsScored: {
    title: 'Keep scored runs',
    why: 'Keeps records with a numeric score. A score of zero is retained; null means the evaluator has not supplied a result.',
    inputs: ['Runs with attached score fields'],
    run: ([data]) => rows(data).filter(row => {
      const score = field(row, 'score');
      if (score === null) return false;
      number(score, 'Score');
      return true;
    }),
  },
  agentObsMeanScore: {
    title: 'Average available scores',
    why: 'Averages numeric score fields while leaving null unscored. Returns null if none are scored. Pair this with coverage before interpreting it.',
    inputs: ['Runs with attached score fields'],
    run: ([data]) => {
      const values = rows(data).map(row => field(row, 'score')).filter(value => value !== null).map(value => number(value, 'Score'));
      return values.length ? values.reduce((a, b) => a + b, 0) / values.length : null;
    },
  },
  agentObsOutcome: {
    title: 'Check the expected outcome',
    why: 'Compares each recorded outcome with that case’s expected outcome, returning one 0-or-1 decision per case. This exact label check cannot assess free-text factuality.',
    inputs: ['Cases with outcome and expected fields'],
    run: ([data]) => rows(data).map(row => Number(identity(field(row, 'outcome')) === identity(field(row, 'expected')))),
  },
  agentObsAllowedTools: {
    title: 'Check the permitted tool calls',
    why: 'Requires every recorded call name to belong to its case’s allowed list. An empty call list passes this permission check, but may still fail the outcome check.',
    inputs: ['Cases with calls and allowed fields'],
    run: ([data]) => rows(data).map(row => {
      const allowed = new Set(strings(field(row, 'allowed')));
      return Number(strings(field(row, 'calls')).every(call => allowed.has(call)));
    }),
  },
  agentObsDisagreement: {
    title: 'Flag disputed judgements',
    why: 'Returns 1 when the two configured labels differ or either is uncertain (-1). Agreement does not prove the labels are true.',
    inputs: ['Records with judgement labels'],
    settings: [{ key: 'first', label: 'First label field', initial: 'human' }, { key: 'second', label: 'Second label field', initial: 'judge' }],
    run: ([data], settings) => rows(data).map(row => {
      const a = label(field(row, String(settings.first)));
      const b = label(field(row, String(settings.second)));
      return Number(a === -1 || b === -1 || a !== b);
    }),
  },
  agentObsPairRuns: {
    title: 'Pair the release cases',
    why: 'Matches baseline and candidate records by caseId. Requires the same nonempty case set with no duplicates. Retains candidate latency and critical-failure flags beside the paired scores.',
    inputs: ['Baseline records', 'Candidate records'],
    run: ([baseline, candidate]) => {
      const before = unique(rows(baseline), 'caseId'), after = unique(rows(candidate), 'caseId');
      if (!before.size || before.size !== after.size || [...before.keys()].some(id => !after.has(id))) {
        throw Error('Run both versions on the same nonempty set of case IDs.');
      }
      return [...before].map(([caseId, old]) => {
        const current = after.get(caseId)!;
        const baselineScore = number(field(old, 'score'), 'Baseline score');
        const candidateScore = number(field(current, 'score'), 'Candidate score');
        const latency = number(field(current, 'latency'), 'Candidate latency');
        const critical = field(current, 'critical');
        if (baselineScore < 0 || baselineScore > 1 || candidateScore < 0 || candidateScore > 1 || latency < 0 || (critical !== 0 && critical !== 1)) {
          throw Error('Scores need [0,1], latency needs nonnegative milliseconds, and critical needs 0 or 1.');
        }
        return { caseId, baseline: baselineScore, candidate: candidateScore, latency, critical };
      });
    },
  },
};
