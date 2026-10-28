import type { Data, Tool } from './engine';

type Row = Record<string, Data>;
const record = (value: Data): Row => {
  if (value === null || Array.isArray(value) || typeof value !== 'object') throw Error('Connect a record with named fields.');
  return value;
};
const list = (value: Data): Data[] => { if (!Array.isArray(value)) throw Error('Connect a list.'); return value; };
const finite = (value: Data): number => { if (typeof value !== 'number' || !Number.isFinite(value)) throw Error('Use a finite number, without converting text or flags.'); return value; };
const inspection = (value: Data) => list(value).map(item => {
  const row = record(item);
  if (!['missing', 'null', 'number', 'other'].includes(String(row.kind))) throw Error('Connect the field inspection result.');
  return row;
});
const search = (value: Data, version: number, field: string, countField: string): Data => {
  const row = record(value);
  if (row.version !== version) return null;
  const count = Object.hasOwn(row, countField) ? row[countField] : 3;
  if (Object.keys(row).some(key => !['version', field, countField].includes(key)) || typeof row[field] !== 'string' || !(row[field] as string).trim() || typeof count !== 'number' || !Number.isSafeInteger(count) || count < 1 || count > 20) return { error: 'invalid_request' };
  return { query: (row[field] as string).trim(), count };
};

export const modelToolContractsTools: Record<string, Tool> = {
  contractInspectField: {
    title: 'Distinguish absent, null and numerical fields', inputs: ['Request records', 'Field name'],
    why: 'Reports a state beside each supplied value. Missing keys and explicit null remain different; zero is a number and text is not converted.',
    run: ([input, name]) => {
      if (typeof name !== 'string' || !name) throw Error('Supply the field name as text.');
      return list(input).map(item => { const row = record(item); if (!Object.hasOwn(row, name)) return { kind: 'missing', value: null }; const value = row[name]; return { kind: value === null ? 'null' : typeof value === 'number' && Number.isFinite(value) ? 'number' : 'other', value }; });
    },
  },
  contractFieldActions: {
    title: 'Choose the optional-number policy', inputs: ['Field inspections'],
    why: 'A supplied number is kept, an absent optional field uses the declared default, and explicit null or another type is rejected by this contract.',
    run: ([input]) => inspection(input).map(row => row.kind === 'number' ? 'keep' : row.kind === 'missing' ? 'default' : 'reject'),
  },
  contractResolveFields: {
    title: 'Fill only absent optional numbers', inputs: ['Field inspections', 'Declared numerical default'],
    why: 'Returns the supplied number or the default for a missing field. Rejected entries remain null in the diagnostic output; they must not reach the model as accepted measurements.',
    run: ([input, fallback]) => { const value = finite(fallback); return inspection(input).map(row => row.kind === 'number' ? finite(row.value) : row.kind === 'missing' ? value : null); },
  },
  contractLegacySearch: {
    title: 'Adapt version 1 search requests', inputs: ['Versioned request'],
    why: 'For version 1, validates text and optional limit, then returns query and count. Another version returns null so version selection can choose its own adapter.',
    run: ([input]) => search(input, 1, 'text', 'limit'),
  },
  contractCurrentSearch: {
    title: 'Adapt version 2 search requests', inputs: ['Versioned request'],
    why: 'For version 2, validates query and optional count. Count defaults to 3 and must be an integer from 1 to 20. This workshop supports exactly these two explicit versions.',
    run: ([input]) => search(input, 2, 'query', 'count'),
  },
  contractSelectSearch: {
    title: 'Select the declared version adapter', inputs: ['Original request', 'Version 1 result', 'Version 2 result'],
    why: 'Selects by the request’s version, never by whichever field happens to be present. Unsupported versions produce a visible error result rather than guessing.',
    run: ([input, legacy, current]) => { const row = record(input); return row.version === 1 ? legacy ?? { error: 'missing_adapter' } : row.version === 2 ? current ?? { error: 'missing_adapter' } : { error: 'unsupported_version' }; },
  },
  contractTemperatureScale: {
    title: 'Read the temperature conversion scale', inputs: ['Declared unit: C or F'],
    why: 'Celsius uses scale 1. Fahrenheit uses scale 5/9, followed by its separate offset. Unit names belong to the service contract, not a guess based on the value.',
    run: ([unit]) => { if (unit === 'C') return 1; if (unit === 'F') return 5 / 9; throw Error('This contract supports only C and F.'); },
  },
  contractTemperatureOffset: {
    title: 'Read the temperature conversion offset', inputs: ['Declared unit: C or F'],
    why: 'Supplies the offset needed after scaling into Celsius. Apply conversion before the stored training centre; the lesson works through the complete Fahrenheit calculation.',
    run: ([unit]) => { if (unit === 'C') return 0; if (unit === 'F') return -160 / 9; throw Error('This contract supports only C and F.'); },
  },
  contractOutcomeKinds: {
    title: 'Classify the structured tool outcome', inputs: ['Outcome codes'],
    why: 'Keeps success, permanent failure, transient failure and an unknown operation outcome separate. These fixture codes are an application policy, not a universal mapping from HTTP status alone.',
    run: ([input]) => list(input).map(value => value === 'ok' ? 'success' : value === 'rate_limited' || value === 'unavailable' ? 'transient' : value === 'outcome_unknown' ? 'unknown_outcome' : 'permanent'),
  },
  contractRetryActions: {
    title: 'Decide whether repeating is permitted', inputs: ['Outcome classifications', 'Safe-to-repeat flags', 'Attempts remaining'],
    why: 'A known transient failure is retried only with a trusted safe-to-repeat flag and remaining attempts. Unknown operation outcomes require reconciliation; permanent failures stop.',
    run: ([input, flagInput, remaining]) => {
      const kinds = list(input), flags = list(flagInput), left = finite(remaining);
      if (flags.length !== kinds.length || !flags.every(value => value === 0 || value === 1) || !Number.isSafeInteger(left) || left < 0) throw Error('Align 0-or-1 repeat flags with outcomes and supply nonnegative remaining attempts.');
      return kinds.map((kind, index) => kind === 'success' ? 'done' : kind === 'unknown_outcome' ? 'reconcile' : kind === 'transient' && flags[index] === 1 && left > 0 ? 'retry' : 'stop');
    },
  },
  contractClose: {
    title: 'Check a numerical contract', inputs: ['Actual result', 'Expected result', 'Absolute tolerance'],
    why: 'Compares two finite scalar results using a declared absolute error bound. Choosing a tolerance does not establish whether the expected result itself is correct.',
    run: ([actual, expected, tolerance]) => { const a = finite(actual), b = finite(expected), t = finite(tolerance); if (t < 0) throw Error('Tolerance must be nonnegative.'); return Math.abs(a - b) <= t; },
  },
};
