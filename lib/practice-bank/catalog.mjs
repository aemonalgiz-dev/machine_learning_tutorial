import { maths } from './maths.mjs';
import { models } from './models.mjs';
import { media, sequences } from './media-sequences.mjs';
import { databases } from './databases.mjs';
import { agents } from './agents.mjs';
import { VARIANTS, VERSION, labels, pythonData, pythonLiteral, canonical } from './authoring.mjs';
import { distractors } from './distractors.mjs';
export const families = [...maths, ...models, ...media, ...sequences, ...databases, ...agents];
const byId = new Map(families.map(f => [f.id, f]));
if (byId.size !== families.length)
    throw Error('Repeated practice family ID.');
export const modes = ['quiz', 'code', 'workshop'];
export const metadata = f => ({ id: f.id, title: f.title, group: f.group, lesson: f.lesson, intro: f.intro, variants: VARIANTS, language: f.language });
export const catalog = { version: VERSION, variants: VARIANTS, total: families.length * VARIANTS * modes.length, families: families.map(metadata) };
export const activityId = (family, variant, mode) => family + '--' + String(variant + 1).padStart(2, '0') + '--' + mode;
export function parseActivity(id) {
    const match = /^([a-z][a-z0-9-]*)--(\d{2})--(quiz|code|workshop)$/.exec(id);
    if (!match)
        return null;
    const family = byId.get(match[1]), variant = Number(match[2]) - 1;
    return family && variant >= 0 && variant < VARIANTS ? { family, variant, mode: match[3] } : null;
}
export function fixtures(family, variant) {
    const cases=[variant, variant + 101, variant + 202, variant + 303].map((seed, index) => {
        const data = family.data(seed);
        return { name: ['The current batch', 'A changed batch', 'Another size or boundary', 'A fresh independent batch'][index], data, expected: family.solve(data) };
    });
    // Boolean policies and empty graph frontiers can coincide by chance.
    // Include a different expected result so a constant answer cannot pass.
    if(new Set(cases.map(entry=>canonical(entry.expected))).size===1){
        for(let offset=404;offset<468;offset++){
            const data=family.data(variant+offset),expected=family.solve(data);
            if(canonical(expected)!==canonical(cases[0].expected)){
                cases[3]={name:'A different outcome',data,expected};
                return cases;
            }
        }
        throw Error('Practice needs contrasting test outcomes: '+family.id);
    }
    return cases;
}
const comparison = `def _bank_close(actual, expected):
    if isinstance(expected, bool) or expected is None or isinstance(expected, str):
        return type(actual) is type(expected) and actual == expected
    if isinstance(expected, (int,float)):
        return isinstance(actual, (int,float,np.integer,np.floating)) and not isinstance(actual,(bool,np.bool_)) and math.isclose(float(actual),float(expected),rel_tol=1e-8,abs_tol=1e-8)
    if isinstance(expected, list):
        return isinstance(actual, (list,tuple,np.ndarray)) and len(actual)==len(expected) and all(_bank_close(a,b) for a,b in zip(actual,expected))
    return isinstance(actual,dict) and set(actual)==set(expected) and all(_bank_close(actual[k],expected[k]) for k in expected)
`;
function exercise(family, variant, cases) {
    const title = family.title + ' · case ' + (variant + 1), sample = cases[0];
    if (family.sql) {
        return { title, question: family.question, language: 'sql', sql: { setup: family.sql.setup(sample.data),
                tables: [{ name: 'items', columns: ['id', 'group_name', 'value'], rows: sample.data.rows.map(r => [r.id, r.group, r.value]) },
                    ...(sample.data.cutoff !== undefined ? [{ name: 'limits', columns: ['cutoff'], rows: [[sample.data.cutoff]] }] : [])],
                expectedTable: { columns: family.id === 'sql-filter-rows' ? ['id'] : family.id === 'sql-total-value' ? ['total'] : ['group_name', 'total'], rows: sample.expected } },
            task: [family.intro, family.contract, 'Write a reusable query against the supplied tables. The tests load changed records into a fresh SQLite database.'],
            starter: '-- Read the starting tables, then write your SELECT query.\nSELECT 0;\n', solution: family.sql.solution,
            output: canonical(sample.expected), hints: family.hints,
            tests: [...cases.slice(1).map(entry => ({ name: entry.name, code: 'assert [list(r) for r in query_rows(sql, ' + JSON.stringify(family.sql.setup(entry.data)) + ')] == ' + pythonData(entry.expected) + ', "The query failed on changed records"' })),
                { name: 'The source records remain unchanged', code: 'assert [list(r) for r in db.execute("SELECT id,group_name,value FROM items ORDER BY id").fetchall()] == ' + pythonData(sample.data.rows.map(r => [r.id, r.group, r.value])) }] };
    }
    const preamble = 'import json\nimport numpy as np\n\n';
    const call = '\ndata = ' + pythonLiteral(sample.data) + '\nprint(json.dumps(solve(data), sort_keys=True))\n';
    return { title, question: family.question, task: [family.intro, family.contract,
            'Complete solve(data) using the data in the starter program. Return ordinary Python values; use .tolist() for a NumPy array. Keep the input data unchanged.',
            'The print call displays your result. Tests also call your function on further inputs.'],
        starter: preamble + 'def solve(data):\n    raise NotImplementedError("Work through the calculation here")\n' + call,
        solution: preamble + 'def solve(data):\n' + family.python.split('\n').map(line => '    ' + line).join('\n') + '\n' + call,
        output: canonical(sample.expected), hints: family.hints,
        tests: cases.map(entry => ({ name: entry.name + ' and unchanged inputs', code: 'import copy, math, json\nimport numpy as np\n' + comparison +
                '\n_case = ' + pythonData(entry.data) + '\n_before = copy.deepcopy(_case)\n_actual = solve(_case)\n_expected = ' + pythonData(entry.expected) +
                '\nassert _bank_close(_actual,_expected), f"Expected {_expected!r}; received {_actual!r}"\nassert _case == _before, "Keep the input data unchanged"' })) };
}
function altered(value, offset) {
    if (typeof value === 'number')
        return value + offset;
    if (typeof value === 'boolean')
        return !value;
    if (typeof value === 'string')
        return value + ' (changed)';
    if (Array.isArray(value))
        return value.length ? value.map((v, i) => i === 0 ? altered(v, offset) : v) : [offset];
    if (value && typeof value === 'object') {
        const keys = Object.keys(value);
        return { ...value, [keys[0]]: altered(value[keys[0]], offset) };
    }
    return offset;
}
function quiz(family, sample) {
    const mistakes = family.mistakes ?? distractors[family.id];
    const candidates = [sample.expected, ...(mistakes?.(sample.data, sample.expected) ?? [])];
    if (typeof sample.expected === 'boolean')
        candidates.push(!sample.expected);
    let options = [...new Set(candidates.map(canonical))].slice(0, 4);
    // Boundary cases can collapse several misconception results into one. Keep
    // fewer choices rather than add obviously impossible answers to fill space.
    if (options.length < 2)
        options = [...options, canonical(altered(sample.expected, 1))];
    const data=family.sql?{items:sample.data.rows.map(r=>({id:r.id,group_name:r.group,value:r.value})),...(sample.data.cutoff!==undefined?{limits:[{cutoff:sample.data.cutoff}]}:{})}:sample.data;
    return [{ kind: 'choice', given: { description: family.contract, data: JSON.stringify(data, null, 2) }, prompt: family.question,
            options, answer: 0, because: family.explain }];
}
export function getActivity(id) {
    const parsed = parseActivity(id);
    if (!parsed)
        return null;
    const { family, variant, mode } = parsed, cases = fixtures(family, variant);
    const common = { id, family: metadata(family), variant, mode };
    if (mode === 'quiz')
        return { ...common, quiz: quiz(family, cases[0]) };
    if (mode === 'code')
        return { ...common, exercise: exercise(family, variant, cases) };
    return { ...common, build: { id: 'bank-' + family.id + '-' + (variant + 1), draftVersion: VERSION,
            title: family.title + ' · case ' + (variant + 1), problem: family.intro,
            challenge: (family.workshopContract??family.contract) + ' Build a construction that works on all four batches. The source values can change; the operation should not need rewiring for each batch.',
            why: family.explain, sources: labels(cases[0].data), cases, recipe: family.recipe, hints: family.workshopHints??family.hints,
            limitation: 'These invented fixtures check the stated calculation. They do not establish that a trained model generalises or that a remote service enforces these rules.',
            extras: ['mean', 'total', 'count', 'subtract', 'multiply', 'gate'].filter(key => !JSON.stringify(family.recipe).includes('"' + key + '"')) } };
}
