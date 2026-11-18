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
  pyProjectReadKey: {
    title: 'Look up one name', inputs: ['Name', 'Lookup record'],
    why: 'Retrieve the value stored under the supplied name. For example, the name recording retrieves its list of saved readings.',
    run: ([key, values]) => {
      const lookup = record(values);
      if (typeof key !== 'string' || !Object.hasOwn(lookup, key)) throw Error('The supplied name needs a lookup entry.');
      return lookup[key];
    },
  },
  pyProjectFlatten: {
    title: 'Combine lists', inputs: ['Lists'],
    why: 'Join the supplied lists in order. Keep every entry, including repeated readings.',
    run: ([value]) => entries(value).flatMap(entries),
  },
  pyProjectUnique: {
    title: 'Keep distinct names', inputs: ['Names'],
    why: 'Retain the first occurrence of each text name. Later repeated names do not create another dependency.',
    run: ([value]) => { const names = entries(value); if (!names.every(item => typeof item === 'string')) throw Error('Connect text names.'); return [...new Set(names)]; },
  },
  pyProjectParseInteger: {
    title: 'Read whole-number settings', inputs: ['Setting text or list'],
    why: 'Turn whole-number text such as "12" into a number. Use null when a value cannot be read. With a list, check each entry in order. This small parser is separate from Python and Pydantic.',
    run: ([value]) => {
      const parse = (item: Data) => {
        if (typeof item === 'number') return Number.isSafeInteger(item) ? item : null;
        if (typeof item !== 'string' || !/^[+-]?\d+$/.test(item)) return null;
        const result = Number(item);
        return Number.isSafeInteger(result) ? result : null;
      };
      return Array.isArray(value) ? value.map(parse) : parse(value);
    },
  },
  pyProjectInRange: {
    title: 'Check the allowed range', inputs: ['Numbers', 'Minimum', 'Maximum'],
    why: 'Mark numbers inside the allowed range, including both ends. Check list entries in order. An unreadable value, shown as null, fails this check.',
    run: ([value, low, high]) => {
      if (typeof low !== 'number' || typeof high !== 'number' || !Number.isFinite(low) || !Number.isFinite(high) || low > high) throw Error('Supply a finite, ordered numerical range.');
      const inside = (item: Data) => typeof item === 'number' && Number.isFinite(item) && item >= low && item <= high;
      return Array.isArray(value) ? value.map(inside) : inside(value);
    },
  },
  pyProjectNot: {
    title: 'Reverse the keep decisions', inputs: ['Decisions'],
    why: 'Change true to false and false to true at each position. Use this after an acceptance check to find the rejected entries.',
    run: ([value]) => flags(value).map(item => !item),
  },
  pyProjectTextMatch: {
    title: 'Match a text value', inputs: ['Text values'],
    settings: [{ key: 'value', label: 'Text to match', initial: 'passed' }],
    why: 'Mark each entry whose text exactly matches the configured value. Other entries receive false, keeping the same order.',
    run: ([value], settings) => entries(value).map(item => item === String(settings.value)),
  },
  pyProjectAtLeast: {
    title: 'Check the alert limit', inputs: ['Readings', 'Limit'],
    why: 'Mark each reading at or above the supplied limit. Keep the decisions in reading order so they can select the corresponding records.',
    run: ([value, limit]) => {
      if (typeof limit !== 'number' || !Number.isFinite(limit)) throw Error('Supply a finite numerical limit.');
      return entries(value).map(item => {
        if (typeof item !== 'number' || !Number.isFinite(item)) throw Error('Every reading needs a finite number.');
        return item >= limit;
      });
    },
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
