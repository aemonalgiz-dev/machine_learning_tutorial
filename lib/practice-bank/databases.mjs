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
        contract: "The SQLite database contains items(id, group_name, value) and a one-row limits(cutoff) table. Read cutoff from that table and return only IDs whose value is strictly greater. The result has one id column, with rows ordered by id ascending. Keep both tables unchanged.",
        workshopContract: 'rows contains records with id, group and value, already ordered by id. Keep records whose value is strictly above the supplied cutoff, then return a one-column table containing their IDs. Here we build the filtering and projection operations that the SQL query performs.',
        workshopHints: ['Keep rows above a threshold compares a named field. Set that field to value.', 'Read the id column from the retained records, then make a single-column result table.'],
        question: "Which record IDs are above the limit stored for this batch?", explain: 'Read the threshold from limits, use a strict comparison, and return IDs in the requested order. Equality does not pass.',
        hints: [
  "Find the current threshold in limits rather than typing a number from this case into the query. Equality with the limit must not pass.",
  "A scalar subquery supplies the one cutoff value inside WHERE. Select id and finish with ORDER BY id."
],
        data: n => ({ rows: records(n), cutoff: records(n)[n % records(n).length].value }), solve: d => d.rows.filter(r => r.value > d.cutoff).map(r => [r.id]),
        python: 'return [[r["id"]] for r in data["rows"] if r["value"]>data["cutoff"]]',
        sql: { setup: sqlSetup, solution: 'SELECT id FROM items WHERE value > (SELECT cutoff FROM limits) ORDER BY id;' },
        recipe: op('pbColumnRows', column(configured('pbAbove', { field: 'value' }, s('rows'), s('cutoff')), 'id')) }),
    family({ id: 'sql-total-value', title: 'Return a total without dropping repeated values', group, lesson: '/concepts/sql-aggregates',
        intro: 'Several inspection records may have the same measured value. Botie must include every record in the total rather than treating repeated measurements as duplicates.',
        contract: 'Use SQLite items(id, group_name, value). Return one column named total with one row containing SUM(value). There is at least one row; do not change the table.',
        workshopContract: 'rows contains records with id, group and value. Include every value, including repeats, in a single sum. Return that sum as a one-cell result table, matching the shape of the SQL aggregate.',
        workshopHints: ['Read the value column without removing duplicate values.', 'Add the list, then make a one-cell result table.'],
        question: "What total includes every recorded measurement, even when values repeat?", explain: 'SUM includes every qualifying row. DISTINCT would change the question by discarding repeated measured values.',
        hints: [
  "Repeated measurements can be separate records. Add every row’s value rather than choosing distinct numbers.",
  "Use SUM(value) AS total. With no GROUP BY, this returns the requested single-row aggregate."
],
        data: n => ({ rows: records(n).map((r, i) => ({ ...r, value: i % 2 === 0 ? 10 + n : r.value })) }), solve: d => [[sum(d.rows.map(r => r.value))]],
        python: 'return [[sum(r["value"] for r in data["rows"])]]',
        sql: { setup: sqlSetup, solution: 'SELECT SUM(value) AS total FROM items;' },
        recipe: op('pbSingleCell', op('total', column(s('rows'), 'value'))) }),
    family({ id: 'sql-group-totals', title: 'Keep each site’s subtotal beside its name', group, lesson: '/concepts/sql-group-by',
        intro: 'A combined total hides how much work came from each site. Botie needs a subtotal for every group that is actually present.',
        contract: "The SQLite database contains items(id, group_name, value). Return two columns: group_name, then the sum of value for that group. Emit one row per group actually present and order rows by group_name ascending. Do not add absent groups or change stored rows.",
        workshopContract: 'rows contains records with id, group and value. Add values separately within each group. Return rows containing the group name and its total, sorted by group name. The group field corresponds to group_name in the SQL table.',
        workshopHints: ['Keep each group label attached to its value.', 'Add values by group creates sorted group/total rows. A single total would merge the sites.'],
        question: 'Which rows report each present group’s subtotal?', explain: 'Grouping combines values within each site. Ordering makes the output predictable without changing which rows contributed.',
        hints: [
  "A subtotal must combine only rows with the same group_name. Keep that group label beside its result.",
  "Use GROUP BY group_name and SUM(value), then ORDER BY group_name for the display order."
],
        data: n => ({ rows: records(n) }), solve: d => { const groups = {}; for (const r of d.rows)
            groups[r.group] = (groups[r.group] ?? 0) + r.value; return Object.keys(groups).sort().map(k => [k, groups[k]]); },
        python: 'answer={}\nfor r in data["rows"]:\n    answer[r["group"]]=answer.get(r["group"],0)+r["value"]\nreturn [[key,answer[key]] for key in sorted(answer)]',
        sql: { setup: sqlSetup, solution: 'SELECT group_name, SUM(value) AS total FROM items GROUP BY group_name ORDER BY group_name;' }, recipe: op('pbGroups', s('rows')) }),
    family({ id: 'document-projection', title: 'Return only the fields the caller needs', group, lesson: '/concepts/nosql-document-queries',
        intro: "The caller needs each record’s ID and measured value. Leave the internal note out of the returned records while preserving every input record’s place in the list.",
        contract: 'rows is an ordered list of records containing id, value and internal_note. Return new records containing only id and value, preserving input order. Do not mutate the originals.',
        question: "Which records keep only the requested ID and measured value?", explain: 'Projection selects fields; it neither filters rows nor makes a permission decision. Actual access checks must happen before this teaching operation.',
        hints: [
  "This request removes fields, not rows. Each source record still needs one corresponding result record.",
  "Build a new dictionary with only id and value for each row, in the original order. Do not remove keys from the source dictionary."
],
        data: n => ({ rows: records(n).map(r => ({ id: r.id, value: r.value, internal_note: 'review-' + (n + r.id) })) }), solve: d => d.rows.map(r => ({ id: r.id, value: r.value })),
        python: 'return [{"id":r["id"],"value":r["value"]} for r in data["rows"]]', recipe: configured('pbProject', { fields: 'id,value' }, s('rows')) }),
    family({ id: 'latest-record-version', title: 'Choose revisions by version, not arrival order', group, lesson: '/concepts/nosql-streams-projections',
        intro: 'Record updates arrived out of order. Botie must keep each record’s highest revision even when an older update appears at the end of the batch.',
        contract: "rows contains records with id, version and value. Versions are unique within each ID. Keep the complete record with the highest version for each ID, including its value, then return those records in ascending alphabetical ID order. Leave the supplied records unchanged.",
        question: "Which complete record has the highest version for each ID?", explain: 'Arrival order does not establish revision order. Compare the version field within each ID before sorting the final IDs.',
        hints: [
  "List position says when a record arrived, while version says which revision it represents. Compare versions separately within each ID.",
  "Keep one best record per ID in a dictionary, replacing it only for a greater version. Build the final list from sorted IDs."
],
        data: n => ({ rows: [{ id: 'a', version: 3 + n, value: n + 4 }, { id: 'b', version: 2 + n, value: 9 + n }, { id: 'a', version: 1 + n, value: 30 + n }, { id: 'b', version: 4 + n, value: 7 + n }].slice(n % 2).concat(n % 2 ? [{ id: 'a', version: 3 + n, value: n + 4 }] : []) }),
        solve: d => { const chosen = {}; for (const r of d.rows)
            if (!chosen[r.id] || r.version > chosen[r.id].version)
                chosen[r.id] = r; return Object.keys(chosen).sort().map(k => chosen[k]); },
        python: 'chosen={}\nfor r in data["rows"]:\n    if r["id"] not in chosen or r["version"]>chosen[r["id"]]["version"]:\n        chosen[r["id"]]=dict(r)\nreturn [chosen[key] for key in sorted(chosen)]', recipe: op('pbLatest', s('rows')) }),
    family({ id: 'cache-lifetime', title: 'Do not serve a record whose lifetime just ended', group, lesson: '/concepts/nosql-cache-expiry',
        intro: 'Botie is checking cached records at a particular instant. The equality case matters: an expiry equal to the current time is already expired.',
        contract: 'Return IDs of records with expires strictly greater than now, in input order. These numeric times use the same unit. This is an offline expiry calculation, not a distributed cache guarantee.',
        question: 'Which cached IDs are still live at this time?', explain: 'Use the expiry comparison on each record. A matching key does not extend the lifetime of its cached value.',
        hints: [
  "A record is usable only before its expiry. If expires equals now, its allowed interval has ended.",
  "Filter with expires > now, then return the surviving IDs in their original order. A set or sort would change this contract."
],
        data: n => ({ rows: Array.from({ length: 4 + n % 3 }, (_, i) => ({ id: 'cache-' + (n * 10 + i), expires: 100 + n + (i - 2) * 5 })), now: 100 + n }),
        solve: d => d.rows.filter(r => r.expires > d.now).map(r => r.id),
        python: 'return [r["id"] for r in data["rows"] if r["expires"]>data["now"]]', recipe: column(op('pbLive', s('rows'), s('now')), 'id') }),
    family({ id: 'directed-neighbours', title: 'Follow the arrows in the permitted direction', group, lesson: '/concepts/graph-pattern-matching',
        intro: 'Botie follows outgoing links from a selected node. A link pointing into the node is not an outgoing neighbour, and repeated links should not duplicate the result.',
        contract: "edges is a list of records with from and to fields; start is a list containing one node name. Follow only edges whose from equals that start name. Return the distinct to names as a sorted list, excluding the start itself even if a self-loop exists.",
        question: 'Which nodes can be reached along one outgoing edge?', explain: 'Inspect the from field before accepting a destination. Remove duplicate destinations and the starting node as the task requires.',
        hints: [
  "An incoming arrow does not lead outward from the start. Inspect from before collecting to.",
  "Use a set for destination names so repeated edges do not repeat a node. Remove the start itself, then sort the names for the result."
],
        data: graph,
        solve: d => [...new Set(d.edges.filter(e => d.start.includes(e.from) && !d.start.includes(e.to)).map(e => e.to))].sort(),
        python: 'return sorted({e["to"] for e in data["edges"] if e["from"] in data["start"] and e["to"] not in data["start"]})', recipe: op('pbExcept', op('pbExpand', s('edges'), s('start')), s('start')) }),
    family({ id: 'second-graph-frontier', title: 'Find nodes first discovered two steps away', group, lesson: '/concepts/graph-traversal-cycles',
        intro: 'Botie has visited a start node and its immediate neighbours. Find the next frontier without rediscovering nodes through a cycle or a shortcut.',
        contract: "edges contains directed from/to records and start is a one-name list. Return a sorted list of distinct nodes first reachable after exactly two outgoing links. Exclude the start and every node reachable in one link, even if another two-link route reaches it.",
        question: 'Which nodes are first discovered at distance two?', explain: 'Expand the first frontier, then subtract every node already visited. A two-edge walk does not imply shortest distance two when a shortcut exists.',
        hints: [
  "Find every node one outgoing link from the start. Those nodes form the first frontier, the group to expand next.",
  "Follow outgoing edges from that group. Some targets may already be the start or a direct neighbour because of a cycle or shortcut.",
  "Remove the start and all direct neighbours before sorting the distinct remaining names."
],
        data: graph,
        solve: d => { const first = new Set(d.edges.filter(e => d.start.includes(e.from)).map(e => e.to)); return [...new Set(d.edges.filter(e => first.has(e.from)).map(e => e.to).filter(x => !first.has(x) && !d.start.includes(x)))].sort(); },
        python: 'first={e["to"] for e in data["edges"] if e["from"] in data["start"]}\nsecond={e["to"] for e in data["edges"] if e["from"] in first}\nreturn sorted(second-first-set(data["start"]))',
        recipe: op('pbExcept', op('pbExpand', s('edges'), op('pbExpand', s('edges'), s('start'))), op('pbUnion', s('start'), op('pbExpand', s('edges'), s('start')))) }),
];
