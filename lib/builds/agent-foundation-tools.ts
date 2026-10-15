import type { Data, Tool } from './engine';

const record = (value: Data): value is Record<string, Data> => value !== null && typeof value === 'object' && !Array.isArray(value);
function same(first: Data, second: Data): boolean {
  if (Array.isArray(first) && Array.isArray(second)) return first.length === second.length && first.every((value, i) => same(value, second[i]));
  if (record(first) && record(second)) return Object.keys(first).length === Object.keys(second).length && Object.keys(first).every(key => Object.hasOwn(second, key) && same(first[key], second[key]));
  return first === second;
}
function text(value: Data): string {
  if (typeof value !== 'string') throw Error('Connect text to this input.');
  return value;
}
function list(value: Data): Data[] {
  if (!Array.isArray(value)) throw Error('Connect a list to this input.');
  return value;
}
function flag(value: Data): boolean {
  if (typeof value !== 'boolean') throw Error('Use a true or false result from a check.');
  return value;
}

/** Small data operations. None calls a model, executes a proposed tool, or grants permission. */
export const agentFoundationTools: Record<string, Tool> = {
  agentJoinText: {
    title: 'Join two text blocks', why: 'Keep both blocks in order, separated by one newline.', inputs: ['First text', 'Second text'],
    run: ([first, second]) => `${text(first)}\n${text(second)}`,
  },
  agentQuoteField: {
    title: 'Label a value as JSON', why: 'Encode one named data field. Quotes and newlines stay inside its value. This is formatting, not a security boundary for a model.', inputs: ['Data value'],
    settings: [{ key: 'label', label: 'Field name', initial: 'question' }],
    run: ([value], settings) => JSON.stringify({ [String(settings.label)]: value }),
  },
  agentMessage: {
    title: 'Make a role message', why: 'Attach a role to one text block. Only application-owned instructions belong in the system role.', inputs: ['Message text'],
    settings: [{ key: 'role', label: 'Role', initial: 'user', options: ['system', 'user'] }],
    run: ([value], settings) => {
      if (!['system', 'user'].includes(String(settings.role))) throw Error('Choose system or user.');
      return { role: String(settings.role), content: text(value) };
    },
  },
  agentPair: {
    title: 'Keep two results in order', why: 'Return a two-item list. Each item retains its own structure and meaning.', inputs: ['First result', 'Second result'],
    run: ([first, second]) => [first, second],
  },
  agentField: {
    title: 'Read a record field', why: 'Read the named field of a record. A missing field returns null so a following check can reject it.', inputs: ['Record'],
    settings: [{ key: 'field', label: 'Field name', initial: 'asset' }],
    run: ([value], settings) => record(value) && Object.hasOwn(value, String(settings.field)) ? value[String(settings.field)] : null,
  },
  agentExactFields: {
    title: 'Check exact field names', why: 'True only when the record has every listed field and no extra field. Field values need separate checks.', inputs: ['Record', 'Required field names'],
    run: ([value, names]) => {
      const keys = list(names);
      if (!keys.every(key => typeof key === 'string') || new Set(keys).size !== keys.length) throw Error('Use distinct text field names.');
      return record(value) && Object.keys(value).length === keys.length && keys.every(key => Object.hasOwn(value, String(key)));
    },
  },
  agentIsText: {
    title: 'Check nonempty text', why: 'True for a string containing at least one non-whitespace character. This says nothing about whether its claim is correct.', inputs: ['Value'],
    run: ([value]) => typeof value === 'string' && value.trim().length > 0,
  },
  agentMember: {
    title: 'Check membership', why: 'True when a matching value occurs in the supplied list. The application decides which list is authoritative.', inputs: ['Value', 'Allowed values'],
    run: ([value, allowed]) => list(allowed).some(entry => same(value, entry)),
  },
  agentAnd: {
    title: 'Require both checks', why: 'True only when both connected checks return true.', inputs: ['First check', 'Second check'],
    run: ([first, second]) => { const a = flag(first), b = flag(second); return a && b; },
  },
  agentEqual: {
    title: 'Compare complete values', why: 'Compare text, flags, lists or complete records, including their field values. Record field order does not matter.', inputs: ['First value', 'Second value'],
    run: ([first, second]) => same(first, second),
  },
  agentChoose: {
    title: 'Choose from a check', why: 'Return the true-branch value when the check is true, otherwise the false-branch value. This selects data; it does not execute an external action.', inputs: ['Check', 'If true', 'If false'],
    run: ([check, yes, no]) => flag(check) ? yes : no,
  },
  agentText: {
    title: 'Text value', why: 'Supply a fixed text label or instruction chosen by the builder.', inputs: [],
    settings: [{ key: 'value', label: 'Text', initial: 'continue' }], run: (_, settings) => String(settings.value),
  },
  agentLess: {
    title: 'Check below a limit', why: 'True only when the first finite number is strictly below the second.', inputs: ['Current value', 'Limit'],
    run: ([first, second]) => {
      if (typeof first !== 'number' || typeof second !== 'number' || !Number.isFinite(first) || !Number.isFinite(second)) throw Error('Use finite numbers.');
      return first < second;
    },
  },
  agentFilterRecords: {
    title: 'Keep permitted records', why: 'Keep records whose selected field occurs in the allowed list, preserving input order. The input list must already be ranked if rank matters.', inputs: ['Records', 'Allowed field values'],
    settings: [{ key: 'field', label: 'Field to match', initial: 'asset' }],
    run: ([rows, allowed], settings) => {
      const records = list(rows), values = list(allowed);
      if (!records.every(record)) throw Error('Use a list of records.');
      return records.filter(row => Object.hasOwn(row, String(settings.field)) && values.some(value => same(value, row[String(settings.field)])));
    },
  },
  agentBudgetPrefix: {
    title: 'Take a prefix within budget', why: 'Keep complete records in order until the next record would exceed the budget. Stops there, even if a later record is smaller. Costs are supplied counts, not a tokenizer.', inputs: ['Ordered records', 'Available budget'],
    settings: [{ key: 'field', label: 'Cost field', initial: 'tokens' }],
    run: ([rows, budget], settings) => {
      const records = list(rows);
      if (typeof budget !== 'number' || !Number.isSafeInteger(budget) || budget < 0) throw Error('Use a nonnegative whole-number budget.');
      const field = String(settings.field);
      if (!records.every(row => record(row) && typeof row[field] === 'number' && Number.isSafeInteger(row[field]) && Number(row[field]) >= 0)) throw Error('Each record needs a nonnegative whole-number cost.');
      const selected: Data[] = []; let used = 0;
      for (const row of records as Record<string, Data>[]) {
        const cost = Number(row[field]);
        if (used + cost > budget) break;
        selected.push(row); used += cost;
      }
      return selected;
    },
  },
  agentPluck: {
    title: 'Read a field from every record', why: 'Keep one named field from each record in the same order. Missing fields return null.', inputs: ['Records'],
    settings: [{ key: 'field', label: 'Field name', initial: 'id' }],
    run: ([rows], settings) => list(rows).map(row => record(row) && Object.hasOwn(row, String(settings.field)) ? row[String(settings.field)] : null),
  },
};
