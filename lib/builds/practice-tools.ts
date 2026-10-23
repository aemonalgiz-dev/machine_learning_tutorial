import type { Data, Tool } from "./engine";
const list = (x: Data): Data[] => { if (!Array.isArray(x))
    throw Error("Connect a list."); return x; };
const num = (x: Data) => { if (typeof x !== "number" || !Number.isFinite(x))
    throw Error("Connect a finite number."); return x; };
const vec = (x: Data) => list(x).map(num);
const row = (x: Data): Record<string, Data> => { if (!x || typeof x !== "object" || Array.isArray(x))
    throw Error("Connect a record."); return x; };
const rows = (x: Data) => list(x).map(row);
const strings = (x: Data) => list(x).map(v => { if (typeof v !== "string")
    throw Error("Connect names."); return v; });
const tool = (title: string, why: string, inputs: string[], run: Tool["run"]): Tool => ({ title, why, inputs, run });
const field = [{ key: "field", label: "Field", initial: "value" }];
export const practiceTools: Record<string, Tool> = {
    pbColumnRows: tool("Make a single-column result table", "Keep one supplied value in each result row.", ["Values"], ([a]) => list(a).map(v => [v])),
    pbSingleCell: tool("Make a one-cell result table", "Represent one aggregate as a table with one row and one column.", ["Value"], ([a]) => [[a]]),
    pbEqual: tool("Compare matching entries", "Return 1 for each equal pair, preserving row order.", ["First list", "Second list"], ([a, b]) => { const x = list(a), y = list(b); if (x.length !== y.length)
        throw Error("Lists need the same length."); return x.map((v, i) => Number(v === y[i])); }),
    pbRatio: tool("Divide with a zero-count rule", "Return zero when the count denominator is zero; otherwise divide. Use only when this rule matches the task.", ["Numerator", "Count denominator"], ([a, b]) => num(b) === 0 ? 0 : num(a) / num(b)),
    pbStandardise: tool("Scale centred readings", "Divide centred values by their population spread. A zero spread produces zeros.", ["Centred readings", "Population standard deviation"], ([a, b]) => vec(a).map(x => num(b) === 0 ? 0 : x / num(b))),
    pbPowers: tool("Discount by position", "Build powers from exponent zero through count minus one.", ["Discount factor", "Count"], ([a, b]) => { const n = num(b); if (!Number.isInteger(n) || n < 0 || n > 100)
        throw Error("Use a count from 0 to 100."); return Array.from({ length: n }, (_, i) => num(a) ** i); }),
    pbLast: tool("Read the latest observation", "Keep the last value in a nonempty time-ordered series.", ["History"], ([x]) => { const v = list(x); if (!v.length)
        throw Error("History is empty."); return v[v.length - 1]; }),
    pbWindows: tool("Slide a complete window", "Build overlapping windows without padding or reversing their entries.", ["Values", "Width"], ([x, w]) => { const v = list(x), n = num(w); if (!Number.isInteger(n) || n < 1 || n > v.length)
        throw Error("Choose a valid window width."); return Array.from({ length: v.length - n + 1 }, (_, i) => v.slice(i, i + n)); }),
    pbPairWindows: tool("Split into adjacent pairs", "Keep nonoverlapping pairs; the input length must be even.", ["Values"], ([x]) => { const v = vec(x); if (v.length % 2)
        throw Error("Use an even count."); return Array.from({ length: v.length / 2 }, (_, i) => v.slice(i * 2, i * 2 + 2)); }),
    pbRowMax: tool("Choose the largest in each row", "Produce one maximum for every nonempty row.", ["Rows"], ([x]) => list(x).map(r => {const values=vec(r);if(!values.length)throw Error("Each row needs at least one value.");return Math.max(...values);})),
    pbQueue: tool("Carry unfinished work", "At each step, add arrivals, use that step's capacity, and carry the nonnegative remainder.", ["Arrivals", "Capacities"], ([a, b]) => { const x = vec(a), y = vec(b); if (x.length !== y.length)
        throw Error("Match each step with a capacity."); let q = 0; return x.map((v, i) => q = Math.max(0, q + v - y[i])); }),
    pbAbove: { ...tool("Keep rows above a threshold", "Compare the named numeric field strictly, preserving source order.", ["Rows", "Threshold"], ([a, b], settings) => rows(a).filter(r => num(r[String(settings.field)]) > num(b))), settings: field },
    pbColumn: { ...tool("Read a named column", "Return one field value per row, preserving duplicates and order.", ["Rows"], ([a], settings) => rows(a).map(r => { const key = String(settings.field); if (!Object.hasOwn(r,key))
            throw Error("Missing field: " + key); return r[key]; })), settings: field },
    pbProject: { ...tool("Keep selected fields", "Project these fields without adding missing values or changing row order.", ["Rows"], ([a], settings) => { const keys = String(settings.fields).split(",").map(x => x.trim()); return rows(a).map(r => Object.fromEntries(keys.map(k => { if (!Object.hasOwn(r,k))
            throw Error("Missing field: " + k); return [k, r[k]]; }))); }), settings: [{ key: "fields", label: "Comma-separated fields", initial: "id,value" }] },
    pbGroups: tool("Add values by group", "Return group/value pairs sorted by group name.", ["Rows"], ([a]) => { const out = new Map<string, number>(); for (const r of rows(a)) {
        const k = String(r.group);
        out.set(k, (out.get(k) ?? 0) + num(r.value));
    } return [...out.keys()].sort().map(k => [k, out.get(k)!]); }),
    pbLatest: tool("Choose the latest revision", "For each ID keep the greatest revision; return records in sorted ID order. Revisions per ID must be unique.", ["Versioned records"], ([a]) => { const map = new Map<string, Record<string, Data>>(); for (const r of rows(a)) {
        const k = String(r.id);
        if (!map.has(k) || num(r.version) > num(map.get(k)!.version))
            map.set(k, r);
    } return [...map.keys()].sort().map(k => map.get(k)!); }),
    pbLive: tool("Remove expired records", "Keep records whose expiry is strictly later than the current time.", ["Records", "Current time"], ([a, b]) => rows(a).filter(r => num(r.expires) > num(b))),
    pbExpand: tool("Follow outgoing edges", "Collect unique immediate destinations from the supplied frontier in sorted order.", ["Directed edges", "Frontier nodes"], ([a, b]) => { const start = strings(b); return [...new Set(rows(a).filter(e => start.includes(String(e.from))).map(e => String(e.to)))].sort(); }),
    pbExcept: tool("Remove already visited names", "Keep first-list names not in the second, deduplicate and sort.", ["Candidate names", "Visited names"], ([a, b]) => [...new Set(strings(a).filter(x => !strings(b).includes(x)))].sort()),
    pbUnion: tool("Combine visited nodes", "Deduplicate names from both lists and sort.", ["First names", "Second names"], ([a, b]) => [...new Set([...strings(a), ...strings(b)])].sort()),
    pbStrings: tool("Keep matching requested names", "Return requested names that appear in the allowed list, preserving request order without duplicates.", ["Allowed names", "Requested names"], ([a, b]) => [...new Set(strings(b).filter(x => strings(a).includes(x)))]),
    pbObjectMatch: tool("Compare required record fields", "All listed fields must exist and match exactly.", ["First record", "Second record", "Required fields"], ([a, b, c]) => strings(c).every(k => Object.hasOwn(row(a), k) && Object.hasOwn(row(b), k) && JSON.stringify(row(a)[k]) === JSON.stringify(row(b)[k]))),
    pbAnd: tool("Require both checks", "Both inputs must be true; truthy text does not grant permission.", ["First check", "Second check"], ([a, b]) => a === true && b === true),
    pbFuture: tool("Check a future expiry", "Return true only if expiry is strictly later than the current time.", ["Expiry", "Current time"], ([a, b]) => num(a) > num(b)),
    pbScope: tool("Require the named scope", "Check for an exact operation name among current grants.", ["Granted scopes", "Required scope"], ([a, b]) => strings(a).includes(String(b))),
    pbTenant: tool("Select this tenant's records", "Use exact tenant equality while retaining source order.", ["Records", "Authenticated tenant"], ([a, b]) => rows(a).filter(r => r.tenant === b)),
    pbReviewed: tool("Keep reviewed records", "Accept only the Boolean true in the reviewed field.", ["Records"], ([a]) => rows(a).filter(r => r.reviewed === true)),
    pbViolations: tool("Find effects outside policy", "Return observed disallowed effects in order, including repeated effects.", ["Allowed effects", "Observed effects"], ([a, b]) => strings(b).filter(x => !strings(a).includes(x))),
    pbReceipt: tool("Reconcile an action ID", "A missing receipt is new; an identical payload is already applied; reusing the ID with different content is a conflict.", ["Proposed action", "Receipts"], ([a, b]) => { const p = row(a), old = rows(b).find(r => r.id === p.id); return !old ? "new action" : old.target === p.target && old.value === p.value ? "already applied" : "idempotency conflict"; }),
};
