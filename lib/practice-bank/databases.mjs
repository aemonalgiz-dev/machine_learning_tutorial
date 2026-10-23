import { family, s, op, configured, sum, seq } from './authoring.mjs';
const group = 'Databases';
const records = n => seq(n, 4 + n % 5, 15).map((value, i) => ({ id: i + 1, group: ['east', 'west', 'north'][(n + i) % 3], value }));
const sqlSetup = d => 'CREATE TABLE items (id INTEGER PRIMARY KEY, group_name TEXT NOT NULL, value INTEGER NOT NULL);\n' + d.rows.map(r => 'INSERT INTO items VALUES (' + r.id + ", '" + r.group + "', " + r.value + ');').join('\n') + '\nCREATE TABLE limits(cutoff INTEGER NOT NULL); INSERT INTO limits VALUES (' + (d.cutoff ?? 0) + ');';
const column = (x, key) => configured('pbColumn', { field: key }, x);
// Vary graph structure as well as labels: cycles, shortcuts, isolated starts,
// duplicate edges, and frontiers of different sizes all occur in the cases.
function graph(n) {
    const names = Array.from({ length: 4 + n % 5 }, (_, i) => 'node-' + n + '-' + i);
    const edges = [];
    for (let i = 0; i < names.length; i++)
        for (let j = 0; j < names.length; j++) {
            if ((n * 7 + i * 11 + j * 13 + i * j) % 7 < 2)
                edges.push({ from: names[i], to: names[j] });
        }
    const start = [names[n % names.length]];
    if (n % 8 === 0)
        return { edges: edges.filter(e => e.from !== start[0]), start };
    edges.push({ from: start[0], to: start[0] });
    if (edges.length && n % 3 === 0)
        edges.push({ ...edges[0] });
    return { edges, start };
}
export const databases = [
    family({ id: 'sql-filter-rows', title: 'Find records above this batch’s limit', group, lesson: '/concepts/sql-subqueries',
        intro: 'The inspection threshold is stored beside the records. Botie needs the IDs above the current limit even when the next batch changes that limit.',
        contract: 'SQLite tables: items(id, group_name, value) and a one-row limits(cutoff). Return a single id column where value is strictly greater than cutoff, ordered by id. Do not change either table.',
        workshopContract: 'rows contains records with id, group and value, already ordered by id. Keep records whose value is strictly above the supplied cutoff, then return a one-column table containing their IDs. Here we build the filtering and projection operations that the SQL query performs.',
        workshopHints: ['Keep rows above a threshold compares a named field. Set that field to value.', 'Read the id column from the retained records, then make a single-column result table.'],
        question: 'Which result table contains exactly the IDs above the current cutoff?', explain: 'Read the threshold from limits, use a strict comparison, and return IDs in the requested order. Equality does not pass.',
        hints: ['A scalar subquery can read the one-row limits table.', 'Use ORDER BY id so result order is deliberate.'],
        data: n => ({ rows: records(n), cutoff: records(n)[n % records(n).length].value }), solve: d => d.rows.filter(r => r.value > d.cutoff).map(r => [r.id]),
        python: 'return [[r["id"]] for r in data["rows"] if r["value"]>data["cutoff"]]',
        sql: { setup: sqlSetup, solution: 'SELECT id FROM items WHERE value > (SELECT cutoff FROM limits) ORDER BY id;' },
        recipe: op('pbColumnRows', column(configured('pbAbove', { field: 'value' }, s('rows'), s('cutoff')), 'id')) }),
    family({ id: 'sql-total-value', title: 'Return a total without dropping repeated values', group, lesson: '/concepts/sql-aggregates',
        intro: 'Several inspection records may have the same measured value. Botie must include every record in the total rather than treating repeated measurements as duplicates.',
        contract: 'Use SQLite items(id, group_name, value). Return one column named total with one row containing SUM(value). There is at least one row; do not change the table.',
        workshopContract: 'rows contains records with id, group and value. Include every value, including repeats, in a single sum. Return that sum as a one-cell result table, matching the shape of the SQL aggregate.',
        workshopHints: ['Read the value column without removing duplicate values.', 'Add the list, then make a one-cell result table.'],
        question: 'What one-row aggregate should the query return?', explain: 'SUM includes every qualifying row. DISTINCT would change the question by discarding repeated measured values.',
        hints: ['Aggregate the value column.', 'Use SUM(value), not SUM(DISTINCT value).'],
        data: n => ({ rows: records(n).map((r, i) => ({ ...r, value: i % 2 === 0 ? 10 + n : r.value })) }), solve: d => [[sum(d.rows.map(r => r.value))]],
        python: 'return [[sum(r["value"] for r in data["rows"])]]',
        sql: { setup: sqlSetup, solution: 'SELECT SUM(value) AS total FROM items;' },
        recipe: op('pbSingleCell', op('total', column(s('rows'), 'value'))) }),
    family({ id: 'sql-group-totals', title: 'Keep each site’s subtotal beside its name', group, lesson: '/concepts/sql-group-by',
        intro: 'A combined total hides how much work came from each site. Botie needs a subtotal for every group that is actually present.',
        contract: 'Use SQLite items(id, group_name, value). Return group_name and SUM(value), grouped by group_name and ordered by group_name ascending. Do not create absent groups or change the table.',
        workshopContract: 'rows contains records with id, group and value. Add values separately within each group. Return rows containing the group name and its total, sorted by group name. The group field corresponds to group_name in the SQL table.',
        workshopHints: ['Keep each group label attached to its value.', 'Add values by group creates sorted group/total rows. A single total would merge the sites.'],
        question: 'Which rows report each present group’s subtotal?', explain: 'Grouping combines values within each site. Ordering makes the output predictable without changing which rows contributed.',
        hints: ['Group by the same site name you display.', 'Order the grouped output by group_name.'],
        data: n => ({ rows: records(n) }), solve: d => { const groups = {}; for (const r of d.rows)
            groups[r.group] = (groups[r.group] ?? 0) + r.value; return Object.keys(groups).sort().map(k => [k, groups[k]]); },
        python: 'answer={}\nfor r in data["rows"]:\n    answer[r["group"]]=answer.get(r["group"],0)+r["value"]\nreturn [[key,answer[key]] for key in sorted(answer)]',
        sql: { setup: sqlSetup, solution: 'SELECT group_name, SUM(value) AS total FROM items GROUP BY group_name ORDER BY group_name;' }, recipe: op('pbGroups', s('rows')) }),
    family({ id: 'document-projection', title: 'Return only the fields the caller needs', group, lesson: '/concepts/nosql-document-queries',
        intro: 'Botie has internal records containing fields the caller did not request. Keep the requested ID and measured value without returning the internal note.',
        contract: 'rows is an ordered list of records containing id, value and internal_note. Return new records containing only id and value, preserving input order. Do not mutate the originals.',
        question: 'Which projected records preserve the requested fields and order?', explain: 'Projection selects fields; it neither filters rows nor makes a permission decision. Actual access checks must happen before this teaching operation.',
        hints: ['Build a new record with only the two requested keys.', 'Preserve row order and leave the inputs untouched.'],
        data: n => ({ rows: records(n).map(r => ({ id: r.id, value: r.value, internal_note: 'review-' + (n + r.id) })) }), solve: d => d.rows.map(r => ({ id: r.id, value: r.value })),
        python: 'return [{"id":r["id"],"value":r["value"]} for r in data["rows"]]', recipe: configured('pbProject', { fields: 'id,value' }, s('rows')) }),
    family({ id: 'latest-record-version', title: 'Choose revisions by version, not arrival order', group, lesson: '/concepts/nosql-streams-projections',
        intro: 'Record updates arrived out of order. Botie must keep each record’s highest revision even when an older update appears at the end of the batch.',
        contract: 'Each record has id, version and value. Revisions within an ID are unique. Return the full highest-version record for each ID, sorted lexicographically by ID.',
        question: 'Which records belong in the latest-version projection?', explain: 'Arrival order does not establish revision order. Compare the version field within each ID before sorting the final IDs.',
        hints: ['Keep the best version seen for each ID.', 'A later list position must not overwrite a higher version with a lower one.'],
        data: n => ({ rows: [{ id: 'a', version: 3 + n, value: n + 4 }, { id: 'b', version: 2 + n, value: 9 + n }, { id: 'a', version: 1 + n, value: 30 + n }, { id: 'b', version: 4 + n, value: 7 + n }].slice(n % 2).concat(n % 2 ? [{ id: 'a', version: 3 + n, value: n + 4 }] : []) }),
        solve: d => { const chosen = {}; for (const r of d.rows)
            if (!chosen[r.id] || r.version > chosen[r.id].version)
                chosen[r.id] = r; return Object.keys(chosen).sort().map(k => chosen[k]); },
        python: 'chosen={}\nfor r in data["rows"]:\n    if r["id"] not in chosen or r["version"]>chosen[r["id"]]["version"]:\n        chosen[r["id"]]=dict(r)\nreturn [chosen[key] for key in sorted(chosen)]', recipe: op('pbLatest', s('rows')) }),
    family({ id: 'cache-lifetime', title: 'Do not serve a record whose lifetime just ended', group, lesson: '/concepts/nosql-cache-expiry',
        intro: 'Botie is checking cached records at a particular instant. The equality case matters: an expiry equal to the current time is already expired.',
        contract: 'Return IDs of records with expires strictly greater than now, in input order. These numeric times use the same unit. This is an offline expiry calculation, not a distributed cache guarantee.',
        question: 'Which cached IDs are still live at this time?', explain: 'Use the expiry comparison on each record. A matching key does not extend the lifetime of its cached value.',
        hints: ['Compare expiry with the current time.', 'Keep IDs only after filtering live records.'],
        data: n => ({ rows: Array.from({ length: 4 + n % 3 }, (_, i) => ({ id: 'cache-' + (n * 10 + i), expires: 100 + n + (i - 2) * 5 })), now: 100 + n }),
        solve: d => d.rows.filter(r => r.expires > d.now).map(r => r.id),
        python: 'return [r["id"] for r in data["rows"] if r["expires"]>data["now"]]', recipe: column(op('pbLive', s('rows'), s('now')), 'id') }),
    family({ id: 'directed-neighbours', title: 'Follow the arrows in the permitted direction', group, lesson: '/concepts/graph-pattern-matching',
        intro: 'Botie follows outgoing links from a selected node. A link pointing into the node is not an outgoing neighbour, and repeated links should not duplicate the result.',
        contract: 'edges contains from/to records; start is a one-name list. Return sorted unique outgoing neighbours excluding the start node itself.',
        question: 'Which nodes can be reached along one outgoing edge?', explain: 'Inspect the from field before accepting a destination. Remove duplicate destinations and the starting node as the task requires.',
        hints: ['Select edges whose source is the start node.', 'Deduplicate destinations and remove the start.'],
        data: graph,
        solve: d => [...new Set(d.edges.filter(e => d.start.includes(e.from) && !d.start.includes(e.to)).map(e => e.to))].sort(),
        python: 'return sorted({e["to"] for e in data["edges"] if e["from"] in data["start"] and e["to"] not in data["start"]})', recipe: op('pbExcept', op('pbExpand', s('edges'), s('start')), s('start')) }),
    family({ id: 'second-graph-frontier', title: 'Find nodes first discovered two steps away', group, lesson: '/concepts/graph-traversal-cycles',
        intro: 'Botie has visited a start node and its immediate neighbours. Find the next frontier without rediscovering nodes through a cycle or a shortcut.',
        contract: 'Use directed outgoing edges. Return sorted unique nodes whose shortest distance from the one start node is exactly two. Exclude the start and all one-hop neighbours.',
        question: 'Which nodes are first discovered at distance two?', explain: 'Expand the first frontier, then subtract every node already visited. A two-edge walk does not imply shortest distance two when a shortcut exists.',
        hints: ['Collect immediate neighbours first.', 'Remove both the start and the first frontier from the second expansion.'],
        data: graph,
        solve: d => { const first = new Set(d.edges.filter(e => d.start.includes(e.from)).map(e => e.to)); return [...new Set(d.edges.filter(e => first.has(e.from)).map(e => e.to).filter(x => !first.has(x) && !d.start.includes(x)))].sort(); },
        python: 'first={e["to"] for e in data["edges"] if e["from"] in data["start"]}\nsecond={e["to"] for e in data["edges"] if e["from"] in first}\nreturn sorted(second-first-set(data["start"]))',
        recipe: op('pbExcept', op('pbExpand', s('edges'), op('pbExpand', s('edges'), s('start'))), op('pbUnion', s('start'), op('pbExpand', s('edges'), s('start')))) }),
];
