import type { Data, Tool } from './engine';

type Row = Record<string, Data>;
const rows = (value: Data): Row[] => {
  if (!Array.isArray(value) || value.some(row => row === null || typeof row !== 'object' || Array.isArray(row))) throw Error('Connect a list of named records.');
  return value as Row[];
};
const field = (row: Row, key: string): Data => {
  if (!Object.hasOwn(row, key)) throw Error(`The record has no ${key} field.`);
  return row[key];
};
const number = (value: Data): number => {
  if (typeof value !== 'number' || !Number.isFinite(value)) throw Error('Use a finite number.');
  return value;
};
const key = (value: Data): string => {
  if (value !== null && typeof value !== 'string' && typeof value !== 'number') throw Error('This key must be text, a number or null.');
  return JSON.stringify(value);
};
const rowKey = (row: Row): string => JSON.stringify(Object.keys(row).sort().map(name => [name, row[name]]));
const add = (row: Row, name: string, value: Data): Row => {
  if (!name || Object.hasOwn(row, name)) throw Error('Choose a new output field name.');
  return { ...row, [name]: value };
};
const instant = (value: Data): number => {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(value)) throw Error('Use a UTC timestamp in YYYY-MM-DD HH:MM:SS format.');
  const ms = Date.parse(value.replace(' ', 'T') + 'Z');
  if (!Number.isFinite(ms) || new Date(ms).toISOString().slice(0,19).replace('T',' ') !== value) throw Error('Use a valid UTC date and time.');
  return ms;
};

/** Relational operations for the visible workshop. SQL itself runs in SQLite. */
export const sqlAnalysisTools: Record<string, Tool> = {
  saText: { title: 'Set a text value', why: 'Supply a fixed text value for a comparison. The SQL exercise writes this as a quoted literal.', inputs: [], settings: [{ key: 'value', label: 'Text', initial: 'closed' }], run: (_, settings) => String(settings.value) },
  saScalar: {
    title: 'Read the one-row result', why: "Read one named value from a one-row result so another comparison can use it. This single value is called a scalar. An unavailable aggregate stays null.", inputs: ['Subquery result'], settings: [{ key: 'field', label: 'Result field', initial: 'mean_minutes' }],
    run: ([value], settings) => { const input = rows(value); if (input.length > 1) throw Error('This comparison needs at most one result row.'); return input.length ? field(input[0], String(settings.field)) : null; },
  },
  saExists: {
    title: 'Keep rows by existence of a match', why: 'Keep each left row once when a right key matches, or when no key matches. Null never equals null here. Multiple right matches do not multiply the left row.', inputs: ['Outer rows', 'Possible matching rows'],
    settings: [{ key: 'leftKey', label: 'Outer key', initial: 'asset_id' }, { key: 'rightKey', label: 'Matching key', initial: 'asset_id' }, { key: 'mode', label: 'Keep rows', initial: 'without match', options: ['with match', 'without match'] }],
    run: ([left, right], settings) => {
      if (!['with match','without match'].includes(String(settings.mode))) throw Error('Choose whether a matching row is required.');
      const values = new Set(rows(right).map(row => field(row, String(settings.rightKey))).filter(value => value !== null).map(key));
      return rows(left).filter(row => { const value = field(row, String(settings.leftKey)); const found = value !== null && values.has(key(value)); return found === (settings.mode === 'with match'); });
    },
  },
  saUnionAll: {
    title: 'Append compatible result rows', why: 'Append both inputs without removing duplicates, like UNION ALL. The teaching records must use the same column names.', inputs: ['First result', 'Second result'],
    run: ([left, right]) => { const all = [...rows(left), ...rows(right)]; const columns = all.length ? Object.keys(all[0]).sort().join('\u0000') : ''; if (all.some(row => Object.keys(row).sort().join('\u0000') !== columns)) throw Error('Choose matching output columns before combining results.'); return all; },
  },
  saExcept: {
    title: 'Remove rows found in another result', why: 'Keep distinct complete rows from the first input that are absent from the second, like EXCEPT. Nulls in the same result positions compare as duplicates.', inputs: ['Candidate result', 'Result to remove'],
    run: ([left, right]) => { const candidates = rows(left), removed = rows(right), all = [...candidates, ...removed]; const columns = all.length ? Object.keys(all[0]).sort().join('\u0000') : ''; if (all.some(row => Object.keys(row).sort().join('\u0000') !== columns)) throw Error('Choose matching output columns before comparing results.'); const blocked = new Set(removed.map(rowKey)); const seen = new Set<string>(); return candidates.filter(row => { const k = rowKey(row); if (blocked.has(k) || seen.has(k)) return false; seen.add(k); return true; }); },
  },
  saSeed: {
    title: 'Start from one hierarchy node', why: 'Create the anchor row for a recursive walk, including its zero depth and a path used to detect repeated nodes.', inputs: ['Root node ID'],
    run: ([root]) => { if (!Number.isSafeInteger(root) || number(root) < 0) throw Error('Use a nonnegative integer node ID.'); return [{ node_id: root, depth: 0, path: [root] }]; },
  },
  saWalk: {
    title: 'Repeat a bounded relation expansion', why: 'Expand parent-to-child edges from the anchor. Each new row carries its path; an already visited path node is skipped. A depth bound limits exploration, and a separate teaching cap prevents huge outputs.', inputs: ['Anchor rows', 'Edges with parent_id and child_id', 'Maximum depth'],
    run: ([anchors, edges, bound]) => {
      const limit = number(bound); if (!Number.isInteger(limit) || limit < 0 || limit > 20) throw Error('Choose an integer depth from zero to twenty.');
      const links = rows(edges); links.forEach(row => { for (const name of ['parent_id','child_id']) if (!Number.isSafeInteger(field(row,name)) || number(field(row,name)) < 0) throw Error('Hierarchy IDs must be nonnegative integers.'); });
      const queue: Row[] = rows(anchors).map(row => { if (!Number.isSafeInteger(row.node_id) || row.depth !== 0 || !Array.isArray(row.path) || row.path.length !== 1 || row.path[0] !== row.node_id) throw Error('Connect a hierarchy anchor row.'); return { ...row, path: [...row.path] }; });
      const result: Row[] = [];
      while (queue.length) {
        const row = queue.shift()!; result.push(row); if (result.length > 500) throw Error('This walk exceeds the teaching limit. Narrow its scope or depth.');
        if (number(row.depth) >= limit) continue;
        for (const edge of links) if (edge.parent_id === row.node_id && !(row.path as Data[]).includes(edge.child_id)) { if (result.length + queue.length >= 500) throw Error('This walk exceeds the teaching limit. Narrow its scope or depth.'); queue.push({ node_id: edge.child_id, depth: number(row.depth) + 1, path: [...row.path as Data[], edge.child_id] }); }
      }
      return result;
    },
  },
  saRowNumber: {
    title: 'Number rows inside each partition', why: 'Assign row_number starting at one for each partition in the order supplied. Connect a deliberate sort first; this component cannot guess which reading is latest.', inputs: ['Ordered rows'], settings: [{ key: 'partition', label: 'Partition field', initial: 'asset_id' }, { key: 'output', label: 'Number field', initial: 'rn' }],
    run: ([input], settings) => { const counts = new Map<string,number>(); return rows(input).map(row => { const k = key(field(row,String(settings.partition))); const count = (counts.get(k) ?? 0) + 1; counts.set(k,count); return add(row,String(settings.output),count); }); },
  },
  saRowFrame: {
    title: 'Sum a trailing row frame', why: 'For each already ordered partition, sum the current row and the requested number of preceding rows. Null values are ignored; an all-null frame returns null. Row distance is not elapsed time.', inputs: ['Ordered rows', 'Number of preceding rows'], settings: [{ key: 'partition', label: 'Partition field', initial: 'asset_id' }, { key: 'field', label: 'Value field', initial: 'amount' }, { key: 'output', label: 'Sum field', initial: 'frame_total' }],
    run: ([input, preceding], settings) => { const n = number(preceding); if (!Number.isInteger(n) || n < 0 || n > 100) throw Error('Choose a nonnegative whole number of preceding rows up to 100.'); const windows = new Map<string,Data[]>(); return rows(input).map(row => { const k = key(field(row,String(settings.partition))), value = field(row,String(settings.field)); if (value !== null) number(value); const window = windows.get(k) ?? []; window.push(value); while (window.length > n + 1) window.shift(); windows.set(k,window); const known = window.filter(v => v !== null) as number[]; return add(row,String(settings.output),known.length ? known.reduce((a,b)=>a+b,0) : null); }); },
  },
  saDay: {
    title: 'Read the UTC calendar day', why: 'Append the date of a normalized UTC timestamp. Named-zone business days need their own explicit conversion policy.', inputs: ['Timestamped rows'], settings: [{ key: 'field', label: 'Timestamp field', initial: 'occurred_at' }, { key: 'output', label: 'Day field', initial: 'day' }],
    run: ([input],settings) => rows(input).map(row => { const value=field(row,String(settings.field)); instant(value); return add(row,String(settings.output),(value as string).slice(0,10)); }),
  },
  saFillNull: {
    title: 'Replace a missing result deliberately', why: 'Replace null in a named field with a supplied value. Use this only after deciding that absence has the stated meaning, such as zero events on a calendar day.', inputs: ['Rows', 'Replacement value'], settings: [{ key: 'field', label: 'Field', initial: 'n' }],
    run: ([input,replacement],settings) => rows(input).map(row=>({ ...row, [String(settings.field)]:field(row,String(settings.field)) === null ? replacement : field(row,String(settings.field)) })),
  },
  saNormaliseText: {
    title: 'Normalise an ASCII identifier', why: 'Trim ordinary surrounding spaces and lowercase A through Z. This deliberately matches SQLite default trim/lower for this identifier policy; it does not perform general Unicode normalization.', inputs: ['Text records'], settings: [{ key: 'field', label: 'Source field', initial: 'code' }, { key: 'output', label: 'Normalised field', initial: 'normalised' }],
    run: ([input],settings) => rows(input).map(row => { const value=field(row,String(settings.field)); if(value!==null&&typeof value!=='string')throw Error('Use text identifiers or null.'); const normalised=value===null?null:(value as string).replace(/^ +| +$/g,'').replace(/[A-Z]/g,char=>char.toLowerCase()); return add(row,String(settings.output),normalised); }),
  },
  saLiteralPrefix: {
    title: 'Keep a literal text prefix', why: 'Keep rows beginning with exactly this prefix. An underscore is a literal character here, unlike its wildcard role in SQL LIKE.', inputs: ['Rows', 'Literal prefix'], settings: [{key:'field',label:'Text field',initial:'normalised'}],
    run: ([input,prefix],settings) => { if(typeof prefix!=='string')throw Error('Use a text prefix.'); return rows(input).filter(row=>{const value=field(row,String(settings.field));if(value!==null&&typeof value!=='string')throw Error('Use text or null.');return typeof value==='string'&&value.startsWith(prefix);}); },
  },
  saJsonNumber: {
    title: 'Read a numeric JSON property', why: 'Parse each JSON text and copy a top-level numeric property. Invalid JSON, missing values, null, booleans and numeric-looking text produce null. This is a declared extraction policy, not a generic SQL parser.', inputs: ['JSON records'], settings: [{key:'field',label:'JSON text field',initial:'payload'},{key:'property',label:'Top-level property',initial:'temperature'},{key:'output',label:'Numeric field',initial:'temperature'}],
    run: ([input],settings) => rows(input).map(row=>{const value=field(row,String(settings.field));let result:Data=null;if(typeof value==='string'){try{const parsed:unknown=JSON.parse(value);if(parsed&&typeof parsed==='object'&&!Array.isArray(parsed)){const found=(parsed as Record<string,unknown>)[String(settings.property)];if(typeof found==='number'&&Number.isFinite(found))result=found;}}catch{/* Invalid input follows the explicitly taught null route. */}}return add(row,String(settings.output),result);}),
  },
  saAvailableHistory: {
    title: 'Keep history available at the decision', why: 'Keep joined events within the lookback, strictly before the decision, and available no later than that decision. It expects the named cutoff and prefixed event fields produced by the preceding join.', inputs: ['Joined decisions and events', 'Lookback hours'],
    run: ([input,hours]) => {const duration=number(hours);if(duration<=0)throw Error('Use a positive lookback in hours.');return rows(input).filter(row=>{const cutoff=instant(field(row,'cutoff')),event=field(row,'e_event_at'),available=field(row,'e_available_at');if(event===null||available===null)return false;const t=instant(event),a=instant(available);return t>=cutoff-duration*3600000&&t<cutoff&&a<=cutoff;});},
  },
};
