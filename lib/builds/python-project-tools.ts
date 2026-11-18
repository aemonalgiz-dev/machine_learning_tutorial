import type { Data, Tool } from './engine';

function entries(value: Data): Data[] {
  if (!Array.isArray(value)) throw Error('Connect a list of entries.');
  return value;
}
function record(value: Data): Record<string, Data> {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) throw Error('Connect one named record.');
  return value;
}
function flags(value: Data): boolean[] {
  const result = entries(value);
  if (!result.every(item => typeof item === 'boolean')) throw Error('Connect a list of true-or-false decisions.');
  return result as boolean[];
}
function aligned(left: Data[], right: Data[]) {
  if (left.length !== right.length) throw Error('The two lists must describe the same positions.');
}
function equal(left: Data, right: Data): boolean {
  if (Array.isArray(left) && Array.isArray(right)) return left.length === right.length && left.every((item, index) => equal(item, right[index]));
  if (left !== null && right !== null && typeof left === 'object' && typeof right === 'object' && !Array.isArray(left) && !Array.isArray(right)) {
    const keys = Object.keys(left);
    return keys.length === Object.keys(right).length && keys.every(key => Object.hasOwn(right, key) && equal(left[key], right[key]));
  }
  return left === right;
}
const field = [{ key: 'field', label: 'Field name', initial: 'name' }];

export const pythonProjectTools: Record<string, Tool> = {
  pyProjectMismatch: {
    title: 'Compare actual with expected', inputs: ['Actual results', 'Expected results'],
    why: 'Return true at positions whose actual result differs from its independent expectation. Lists and named records are compared by their contents.',
    run: ([left, right]) => { const a = entries(left), b = entries(right); aligned(a, b); return a.map((item, index) => !equal(item, b[index])); },
  },
  pyProjectKeep: {
    title: 'Keep flagged entries', inputs: ['Entries', 'Keep decisions'],
    why: 'Keep an entry only where its aligned decision is true, retaining the original order.',
    run: ([values, decisions]) => { const rows = entries(values), keep = flags(decisions); aligned(rows, keep); return rows.filter((_, index) => keep[index]); },
  },
  pyProjectField: {
    title: 'Read a field from every record', inputs: ['Records'], settings: field,
    why: 'Read the configured field from each record, preserving row order. A missing field stops this operation instead of guessing a replacement.',
    run: ([value], settings) => entries(value).map(item => { const row = record(item), key = String(settings.field); if (!Object.hasOwn(row, key)) throw Error(`The record is missing ${key}.`); return row[key]; }),
  },
  pyProjectLookup: {
    title: 'Look up each supplied key', inputs: ['Keys', 'Lookup record'],
    why: 'Retrieve one value for each key from a named lookup record. The lookup is supplied as an input, rather than hidden inside the calculation.',
    run: ([keys, values]) => { const lookup = record(values); return entries(keys).map(key => { if (typeof key !== 'string' || !Object.hasOwn(lookup, key)) throw Error('Every requested key needs a supplied lookup entry.'); return lookup[key]; }); },
  },
  pyProjectFlatten: {
    title: 'Combine dependency lists', inputs: ['Lists'],
    why: 'Join lists in their original order without changing or interpreting their entries.',
    run: ([value]) => entries(value).flatMap(entries),
  },
  pyProjectUnique: {
    title: 'Keep distinct names', inputs: ['Names'],
    why: 'Retain the first occurrence of each text name. Later repeated names do not create another dependency.',
    run: ([value]) => { const names = entries(value); if (!names.every(item => typeof item === 'string')) throw Error('Connect text names.'); return [...new Set(names)]; },
  },
  pyProjectParseInteger: {
    title: 'Parse an integer setting', inputs: ['Setting text'],
    why: 'Accept a whole-number value or decimal integer text. Return null for anything else so a later range check can reject it. This is a small teaching parser, not Python or Pydantic.',
    run: ([value]) => { if (typeof value === 'number') return Number.isSafeInteger(value) ? value : null; if (typeof value !== 'string' || !/^[+-]?\d+$/.test(value)) return null; const result = Number(value); return Number.isSafeInteger(result) ? result : null; },
  },
  pyProjectInRange: {
    title: 'Require an inclusive range', inputs: ['Parsed value', 'Minimum', 'Maximum'],
    why: 'Return true only for a numerical value inside both limits. A missing or unparsed value returns false.',
    run: ([value, low, high]) => { if (typeof low !== 'number' || typeof high !== 'number' || low > high) throw Error('Supply an ordered numerical range.'); return typeof value === 'number' && Number.isFinite(value) && value >= low && value <= high; },
  },
  pyProjectSeverityMask: {
    title: 'Choose event severity', inputs: ['Events', 'Minimum level'],
    why: 'Compare each event level with DEBUG, INFO, WARNING, ERROR or CRITICAL. This models a severity decision, not the complete Python logging configuration.',
    run: ([value, minimum]) => {
      const levels = ['DEBUG', 'INFO', 'WARNING', 'ERROR', 'CRITICAL'];
      if (typeof minimum !== 'string' || !levels.includes(minimum)) throw Error('Supply a recognized minimum level.');
      return entries(value).map(item => { const level = record(item).level; if (typeof level !== 'string' || !levels.includes(level)) throw Error('Every event needs a recognized level.'); return levels.indexOf(level) >= levels.indexOf(minimum); });
    },
  },
  pyProjectSelectFields: {
    title: 'Select fields for a record', inputs: ['Records', 'Allowed field names'],
    why: 'Produce new records containing only the explicitly requested existing fields. Do not connect private fields to an output merely because they exist in the input.',
    run: ([value, names]) => { const keys = entries(names); if (!keys.every(key => typeof key === 'string') || new Set(keys).size !== keys.length) throw Error('Supply distinct text field names.'); return entries(value).map(item => { const row = record(item); return Object.fromEntries(keys.map(key => { if (typeof key !== 'string' || !Object.hasOwn(row, key)) throw Error('An allowed field is absent.'); return [key, row[key]]; })); }); },
  },
  pyProjectAnd: {
    title: 'Require both decisions', inputs: ['First decisions', 'Second decisions'],
    why: 'A position passes only when both aligned Boolean decisions are true.',
    run: ([left, right]) => { const a = flags(left), b = flags(right); aligned(a, b); return a.map((item, index) => item && b[index]); },
  },
  pyProjectAll: {
    title: 'Require a nonempty passing set', inputs: ['Decisions'],
    why: 'Return true only when at least one check is present and every decision is true. An empty check list cannot authorize this workshop release.',
    run: ([value]) => { const decisions = flags(value); return decisions.length > 0 && decisions.every(Boolean); },
  },
  pyProjectArgMax: {
    title: 'Find the largest cost position', inputs: ['Costs'],
    why: 'Return the position of the largest finite numerical cost. Equal costs retain their first position.',
    run: ([value]) => { const costs = entries(value); if (!costs.length || !costs.every(item => typeof item === 'number' && Number.isFinite(item))) throw Error('Connect a nonempty list of finite costs.'); return costs.reduce<number>((best, item, index) => (item as number) > (costs[best] as number) ? index : best, 0); },
  },
  pyProjectAt: {
    title: 'Retrieve one named position', inputs: ['Entries', 'Position'],
    why: 'Retrieve the entry at one zero-based position. A position is different from the cost or score stored there.',
    run: ([value, index]) => { const items = entries(value); if (typeof index !== 'number' || !Number.isInteger(index) || index < 0 || index >= items.length) throw Error('Supply an existing zero-based position.'); return items[index]; },
  },
};
