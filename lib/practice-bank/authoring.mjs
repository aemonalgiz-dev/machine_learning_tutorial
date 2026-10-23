export const VARIANTS = 24;
export const VERSION = 1;
export const s = source => ({ source });
export const op = (name, ...inputs) => ({ op: name, inputs });
export const configured = (name, settings, ...inputs) => ({ op: name, settings, inputs });
export const c = value => configured('constant', { value });
export const sum = xs => xs.reduce((a, b) => a + b, 0);
export const mean = xs => sum(xs) / xs.length;
export const dot = (a, b) => sum(a.map((v, i) => v * b[i]));
export const seq = (seed, length = 4 + seed % 4, offset = 0) => Array.from({ length }, (_, i) => ((seed * 17 + i * 11 + i * i) % 31) - 10 + offset);
export const norm = a => Math.sqrt(dot(a, a));
export const probabilities = seed => { const v = seq(seed, 3 + seed % 3, 12); const total = sum(v); return v.map(x => x / total); };
export const softmax = xs => { const ex = xs.map(x => Math.exp(x - Math.max(...xs))); return ex.map(x => x / sum(ex)); };
export const centred = x => op('subtract', x, op('mean', x));
export const populationVariance = x => op('mean', op('square', centred(x)));
export const pythonData = value => 'json.loads(' + JSON.stringify(JSON.stringify(value)) + ')';
// The starter editor should show ordinary, readable Python data. Test payloads
// can use compact JSON transport, but learners should not decode escaped text.
export function pythonLiteral(value, depth = 0) {
    if (value === null)
        return 'None';
    if (typeof value === 'boolean')
        return value ? 'True' : 'False';
    if (typeof value !== 'object')
        return JSON.stringify(value);
    const indent = '    '.repeat(depth), child = '    '.repeat(depth + 1);
    if (Array.isArray(value)) {
        const items = value.map(v => pythonLiteral(v, depth + 1));
        const compact = '[' + items.join(', ') + ']';
        return !compact.includes('\n') && compact.length <= 68 ? compact : '[\n' + items.map(v => child + v).join(',\n') + '\n' + indent + ']';
    }
    return '{\n' + Object.entries(value).map(([key, v]) => child + JSON.stringify(key) + ': ' + pythonLiteral(v, depth + 1)).join(',\n') + '\n' + indent + '}';
}
export const canonical = value => JSON.stringify(value, (_, v) => typeof v === 'number' ? Number(v.toFixed(8)) : v && typeof v === 'object' && !Array.isArray(v) ? Object.fromEntries(Object.keys(v).sort().map(k => [k, v[k]])) : v);
export function family(record) {
    if (!record.id || !record.python || !record.recipe || !record.contract || !record.explain)
        throw Error('Incomplete practice family: ' + record.id);
    return { ...record, language: record.sql ? 'sql' : 'python' };
}
export function labels(data) { return Object.fromEntries(Object.keys(data).map(k => [k, k.replaceAll('_', ' ')])); }
