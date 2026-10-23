import type { FreshJourneyCase } from "../journey-fresh";

export const GRAPH_DATABASE_FRESH: Record<string, FreshJourneyCase> = {
  "graph-database-models": {
    name: "A second dependency arrives beside a repeated record",
    prompt: "Pump R1 now depends on both S4 and S2. A second edge repeats S4, R8 depends on R1, and a NEAR edge points to S9. Predict the distinct, sorted resources that R1 directly requires.",
    data: {
      graph: {
        nodes: ["R1", "R8", "S4", "S2", "S9"].map((id) => ({ id, kind: "Asset" })),
        edges: [
          { id: "d1", source: "R1", target: "S4", type: "DEPENDS_ON" },
          { id: "d2", source: "R1", target: "S2", type: "DEPENDS_ON" },
          { id: "repeat", source: "R1", target: "S4", type: "DEPENDS_ON" },
          { id: "incoming", source: "R8", target: "R1", type: "DEPENDS_ON" },
          { id: "nearby", source: "R1", target: "S9", type: "NEAR" },
        ],
      },
      asset: "R1",
    },
    expected: ["S2", "S4"],
    why: "R8 depends on the pump, so it does not answer what the pump requires. The NEAR edge describes another relationship, and repeated dependency records still name the same resource.",
  },
  "graph-database-identity": {
    name: "Two source systems both resend a renamed asset",
    prompt: "The north:plant system resends local key A, and the north system resends local key plant:A. Each pair has changed its display name. Predict the repeated structured IDs without merging the two identities at the colon.",
    data: {
      records: [
        { system: "north:plant", external_id: "A", name: "Feed pump" },
        { system: "north", external_id: "plant:A", name: "Feed pump" },
        { system: "north:plant", external_id: "A", name: "Pump by the door" },
        { system: "north", external_id: "plant:A", name: "Transfer pump" },
        { system: "south", external_id: "A", name: "Feed pump" },
      ],
    },
    expected: ['["north","plant:A"]', '["north:plant","A"]'],
    why: "Each source/key pair repeats within its own system. A structured pair retains the boundary between fields, even when the field values themselves contain a colon.",
  },
  "graph-pattern-matching": {
    name: "One technician completed two inspections",
    prompt: "R4 has three inspections. Two were performed by T3 and one by T4. R5 has a separate inspection by T8, while a direct R4-to-T9 CARRIED_OUT_BY edge skips the inspection. Predict the technicians reached by the required two-step pattern from R4.",
    data: {
      graph: {
        nodes: [
          ...["R4", "R5"].map((id) => ({ id, kind: "Asset" })),
          ...["I7", "I8", "I9", "I10"].map((id) => ({ id, kind: "Inspection" })),
          ...["T3", "T4", "T8", "T9"].map((id) => ({ id, kind: "Technician" })),
        ],
        edges: [
          { id: "h7", source: "R4", target: "I7", type: "HAS_INSPECTION" },
          { id: "h8", source: "R4", target: "I8", type: "HAS_INSPECTION" },
          { id: "h9", source: "R4", target: "I9", type: "HAS_INSPECTION" },
          { id: "h10", source: "R5", target: "I10", type: "HAS_INSPECTION" },
          { id: "t7", source: "I7", target: "T3", type: "CARRIED_OUT_BY" },
          { id: "t8", source: "I8", target: "T3", type: "CARRIED_OUT_BY" },
          { id: "t9", source: "I9", target: "T4", type: "CARRIED_OUT_BY" },
          { id: "t10", source: "I10", target: "T8", type: "CARRIED_OUT_BY" },
          { id: "shortcut", source: "R4", target: "T9", type: "CARRIED_OUT_BY" },
        ],
      },
      asset: "R4",
    },
    expected: ["T3", "T4"],
    why: "The second step starts at each inspection bound by the first. T3 is reached twice but appears once in the requested technician set. Neither another asset's inspection nor the shortcut matches that pattern.",
  },
  "graph-filtering-aggregation": {
    name: "Two completed inspections share a duplicated link",
    prompt: "R2 has closed inspections I6 and I7, with two edges to I6. R1 has an open inspection and a mistyped link to a Technician marked closed. R0 is isolated. Predict the grouped counts of distinct closed Inspection nodes, including only assets with a qualifying match.",
    data: {
      graph: {
        nodes: [
          { id: "R2", kind: "Asset" }, { id: "R1", kind: "Asset" }, { id: "R0", kind: "Asset" },
          { id: "I6", kind: "Inspection", status: "closed" },
          { id: "I7", kind: "Inspection", status: "closed" },
          { id: "I8", kind: "Inspection", status: "open" },
          { id: "T9", kind: "Technician", status: "closed" },
        ],
        edges: [
          { id: "a", source: "R2", target: "I6", type: "HAS_INSPECTION" },
          { id: "copy", source: "R2", target: "I6", type: "HAS_INSPECTION" },
          { id: "b", source: "R2", target: "I7", type: "HAS_INSPECTION" },
          { id: "c", source: "R1", target: "I8", type: "HAS_INSPECTION" },
          { id: "mistyped", source: "R1", target: "T9", type: "HAS_INSPECTION" },
        ],
      },
    },
    expected: [{ origin: "R2", n: 2 }],
    why: "R2 has two completed inspection identities despite three matching edges. R1 has no qualifying Inspection node, and required matching drops both R1 and the isolated R0 from this report.",
  },
  "graph-optional-patterns": {
    name: "A shared inspection counts within each asset",
    prompt: "R1 and R2 both link to closed inspection I4. R1's link is duplicated. R3 has only an open inspection and a Technician marked closed. Predict a count for every registered asset, keeping each asset's own inspection set.",
    data: {
      graph: {
        nodes: [
          { id: "R3", kind: "Asset" }, { id: "R2", kind: "Asset" }, { id: "R1", kind: "Asset" },
          { id: "I4", kind: "Inspection", status: "closed" },
          { id: "I5", kind: "Inspection", status: "open" },
          { id: "T4", kind: "Technician", status: "closed" },
        ],
        edges: [
          { id: "a", source: "R1", target: "I4", type: "HAS_INSPECTION" },
          { id: "b", source: "R2", target: "I4", type: "HAS_INSPECTION" },
          { id: "copy", source: "R1", target: "I4", type: "HAS_INSPECTION" },
          { id: "open", source: "R3", target: "I5", type: "HAS_INSPECTION" },
          { id: "bad-kind", source: "R3", target: "T4", type: "HAS_INSPECTION" },
        ],
      },
    },
    expected: [{ origin: "R1", n: 1 }, { origin: "R2", n: 1 }, { origin: "R3", n: 0 }],
    why: "Deduplicating origin/inspection pairs preserves I4 once for each asset it belongs to. Optional matching keeps R3 visible after its nonqualifying edges are excluded.",
  },
  "graph-traversal-cycles": {
    name: "Two branches rejoin before a deeper cycle",
    prompt: "From R1, dependency branches reach S1 and S2, then rejoin at S3. S3 depends on S4, and S4 loops back to S1. A NEAR edge reaches S9. With a maximum of two dependency hops, predict the distinct reached IDs excluding R1.",
    data: {
      graph: {
        nodes: ["R1", "S1", "S2", "S3", "S4", "S9"].map((id) => ({ id, kind: "Asset" })),
        edges: [
          { id: "a", source: "R1", target: "S1", type: "DEPENDS_ON" },
          { id: "b", source: "R1", target: "S2", type: "DEPENDS_ON" },
          { id: "c", source: "S1", target: "S3", type: "DEPENDS_ON" },
          { id: "d", source: "S2", target: "S3", type: "DEPENDS_ON" },
          { id: "e", source: "S3", target: "S4", type: "DEPENDS_ON" },
          { id: "loop", source: "S4", target: "S1", type: "DEPENDS_ON" },
          { id: "near", source: "R1", target: "S9", type: "NEAR" },
        ],
      },
      start: "R1", depth: 2,
    },
    expected: ["S1", "S2", "S3"],
    why: "Both branches reach S3 at depth two, so it appears once. S4 needs a third dependency hop. The nearby resource is outside the requested edge type regardless of its distance on the drawing.",
  },
  "graph-shortest-paths": {
    name: "A zero-cost transfer returns to the starting point",
    prompt: "The direct R-to-T route takes eight minutes. R-to-A and A-to-R take zero, A-to-B takes two, and B-to-T takes one. A zero-cost NEAR edge also connects R to T. Predict the least travel time using ROUTE edges only.",
    data: {
      graph: {
        nodes: ["R", "A", "B", "T"].map((id) => ({ id, kind: "Location" })),
        edges: [
          { id: "direct", source: "R", target: "T", type: "ROUTE", minutes: 8 },
          { id: "transfer", source: "R", target: "A", type: "ROUTE", minutes: 0 },
          { id: "back", source: "A", target: "R", type: "ROUTE", minutes: 0 },
          { id: "ab", source: "A", target: "B", type: "ROUTE", minutes: 2 },
          { id: "bt", source: "B", target: "T", type: "ROUTE", minutes: 1 },
          { id: "near", source: "R", target: "T", type: "NEAR", minutes: 0 },
        ],
      },
      start: "R", target: "T",
    },
    expected: 3,
    why: "The zero-cost cycle cannot improve an already known zero cost. The valid route through A and B improves the direct route, while NEAR is not a travel connection.",
  },
  "graph-constraints-indexes": {
    name: "A duplicate key appears more than twice",
    prompt: "The unvalidated batch repeats A9 three times and __proto__ twice. It also contains a NULL ID, a numeric ID and a record without an ID. Predict the sorted duplicate list and the count of unusable IDs.",
    data: { nodes: [{ id: "A9" }, { id: "__proto__" }, { id: "A9" }, { id: null }, { id: 0 }, {}, { id: "__proto__" }, { id: "A9" }, { id: "B1" }] },
    expected: [["A9", "__proto__"], 3],
    why: "The duplicate report names each repeated usable ID once. Special-looking text is still an identity value; NULL, a number and an absent field each fail the separate nonempty-text requirement.",
  },
  "graph-safe-updates": {
    name: "Revision zero is valid but a numeric-looking string is not",
    prompt: "W is at revision three, X at zero, Y at six and Z at eight. The requests include approvals for W and X, a repeated X request, a string revision for Y, a stale revision for Z and a missing node. Predict the eligible target IDs without treating this preflight as a committed update.",
    data: {
      graph: {
        nodes: [{ id: "W", revision: 3 }, { id: "X", revision: 0 }, { id: "Y", revision: 6 }, { id: "Z", revision: 8 }],
        edges: [],
      },
      requests: [
        { id: "X", expected_revision: 0, approved: true },
        { id: "Y", expected_revision: "6", approved: true },
        { id: "Z", expected_revision: 7, approved: true },
        { id: "missing", expected_revision: 0, approved: true },
        { id: "W", expected_revision: 3, approved: true },
        { id: "X", expected_revision: 0, approved: true },
      ],
    },
    expected: ["W", "X"],
    why: "Zero is a valid integer revision. A matching string is not the required numeric revision, stale and absent records fail comparison, and repeated eligible requests produce one target ID each.",
  },
  "graph-imports": {
    name: "A rejected row is repaired within the batch",
    prompt: "The batch replays stored edge base with reordered property keys, then changes its minutes. Edge late first names a missing endpoint and then a valid one. Edge new is delivered twice unchanged. Predict the IDs staged as ready and inspect why the other rows were omitted.",
    data: {
      graph: {
        nodes: ["R9", "S7", "S8"].map((id) => ({ id, kind: "Asset" })),
        edges: [{ id: "base", source: "R9", target: "S7", type: "ROUTE", minutes: 4, note: { shift: "night", checked: true } }],
      },
      batch: [
        { id: "base", source: "R9", target: "S7", type: "ROUTE", note: { checked: true, shift: "night" }, minutes: 4 },
        { id: "base", source: "R9", target: "S7", type: "ROUTE", minutes: 5, note: { shift: "night", checked: true } },
        { id: "late", source: "R9", target: "missing", type: "DEPENDS_ON" },
        { id: "late", source: "R9", target: "S8", type: "DEPENDS_ON" },
        { id: "new", source: "S8", target: "S7", type: "DEPENDS_ON" },
        { id: "new", source: "S8", target: "S7", type: "DEPENDS_ON" },
      ],
    },
    expected: ["late", "new"],
    why: "Property order does not change a payload, but changing minutes does. The dangling late row was never admitted, so its corrected version can be staged. The repeated new row adds no second relationship.",
  },
  "graph-query-performance": {
    name: "An isolated starting asset still costs a scan",
    prompt: "There are five DEPENDS_ON edges: two leave R1, one leaves R2 and two leave R3. The request contains R1, isolated R4 and R1 again. One additional NEAR edge leaves R4. Predict full-scan candidate checks first and outgoing-adjacency candidates second after selecting the dependency type.",
    data: {
      graph: {
        nodes: ["R1", "R2", "R3", "R4", "S1", "S2"].map((id) => ({ id, kind: "Asset" })),
        edges: [
          { id: "a", source: "R1", target: "S1", type: "DEPENDS_ON" },
          { id: "b", source: "R1", target: "S2", type: "DEPENDS_ON" },
          { id: "c", source: "R2", target: "S1", type: "DEPENDS_ON" },
          { id: "d", source: "R3", target: "S1", type: "DEPENDS_ON" },
          { id: "e", source: "R3", target: "S2", type: "DEPENDS_ON" },
          { id: "near", source: "R4", target: "S2", type: "NEAR" },
        ],
      },
      starts: ["R1", "R4", "R1"],
    },
    expected: [10, 2],
    why: "The declared scan strategy checks all five typed edges for each of two distinct starts. Adjacency access has two outgoing dependency candidates for R1 and none for R4. These counts exclude building the adjacency structure and are not latency measurements.",
  },
  "graph-rdf-sparql": {
    name: "A familiar local name belongs to another vocabulary",
    prompt: "Find resources depending on S8 using https://perceptronlab.example/dependsOn. R2 has that resource link twice. R3 uses https://vendor.example/dependsOn, R4 uses a literal that looks like the S8 IRI, and R5 has the requested resource link. Predict the distinct subject IRIs.",
    data: {
      triples: [
        { s: "https://perceptronlab.example/R2", p: "https://perceptronlab.example/dependsOn", o: "https://perceptronlab.example/S8", kind: "iri" },
        { s: "https://perceptronlab.example/R3", p: "https://vendor.example/dependsOn", o: "https://perceptronlab.example/S8", kind: "iri" },
        { s: "https://perceptronlab.example/R4", p: "https://perceptronlab.example/dependsOn", o: "https://perceptronlab.example/S8", kind: "literal" },
        { s: "https://perceptronlab.example/R2", p: "https://perceptronlab.example/dependsOn", o: "https://perceptronlab.example/S8", kind: "iri" },
        { s: "https://perceptronlab.example/R5", p: "https://perceptronlab.example/dependsOn", o: "https://perceptronlab.example/S8", kind: "iri" },
      ],
      target: "https://perceptronlab.example/S8",
    },
    expected: ["https://perceptronlab.example/R2", "https://perceptronlab.example/R5"],
    why: "The expanded predicate IRI identifies the relation, so matching its local spelling alone would admit the vendor predicate incorrectly. The literal does not become a resource link, and a repeated triple contributes no new subject.",
  },
  "graph-provenance": {
    name: "One claim starts as another expires",
    prompt: "At hour twelve, use sources log-C and inspection-D. Q1 expires exactly at twelve; Q2 becomes available then; Q3 is already available and disagrees with Q2. Q4 is from another source, and Q5 arrives at thirteen. Predict the eligible claim IDs while retaining any disagreement.",
    data: {
      claims: [
        { id: "Q1", subject: "R8", statement: "needs inspection", source: "log-C", observed_at: 7, valid_until: 12 },
        { id: "Q2", subject: "R8", statement: "inspection current", source: "inspection-D", observed_at: 12, valid_until: null },
        { id: "Q3", subject: "R8", statement: "needs inspection", source: "log-C", observed_at: 11, valid_until: 15 },
        { id: "Q4", subject: "R8", statement: "inspection current", source: "unreviewed-E", observed_at: 9, valid_until: null },
        { id: "Q5", subject: "R8", statement: "inspection current", source: "log-C", observed_at: 13, valid_until: null },
      ],
      allowed: ["log-C", "inspection-D"], at: 12,
    },
    expected: ["Q2", "Q3"],
    why: "Availability includes the starting hour, while expiry excludes its ending hour. Both permitted surviving claims remain visible for review; the filter does not decide which conflicting statement is true.",
  },
  "graph-ml-retrieval": {
    name: "A permitted document sits beyond a forbidden detour",
    prompt: "For amber tenant asset R6 at hour ten, allow one dependency hop. Its own manual and S6's manual are available. Another amber manual is reachable only through a violet asset, S7 is two dependency hops away, and a future manual is dated eleven. Predict eligible Document IDs, inspecting scope before traversal.",
    data: {
      graph: {
        nodes: [
          { id: "R6", kind: "Asset", tenant: "amber" },
          { id: "S6", kind: "Asset", tenant: "amber" },
          { id: "S7", kind: "Asset", tenant: "amber" },
          { id: "X6", kind: "Asset", tenant: "violet" },
          { id: "D-own", kind: "Document", tenant: "amber", available_at: 10 },
          { id: "D-supply", kind: "Document", tenant: "amber", available_at: 4 },
          { id: "D-detour", kind: "Document", tenant: "amber", available_at: 2 },
          { id: "D-deep", kind: "Document", tenant: "amber", available_at: 3 },
          { id: "D-future", kind: "Document", tenant: "amber", available_at: 11 },
          { id: "N-label", kind: "Note", tenant: "amber", available_at: 1 },
        ],
        edges: [
          { id: "dep1", source: "R6", target: "S6", type: "DEPENDS_ON" },
          { id: "dep2", source: "S6", target: "S7", type: "DEPENDS_ON" },
          { id: "cross", source: "R6", target: "X6", type: "DEPENDS_ON" },
          { id: "own", source: "R6", target: "D-own", type: "HAS_MANUAL" },
          { id: "supply", source: "S6", target: "D-supply", type: "HAS_MANUAL" },
          { id: "detour", source: "X6", target: "D-detour", type: "HAS_MANUAL" },
          { id: "deep", source: "S7", target: "D-deep", type: "HAS_MANUAL" },
          { id: "future", source: "S6", target: "D-future", type: "HAS_MANUAL" },
          { id: "wrong-kind", source: "R6", target: "N-label", type: "HAS_MANUAL" },
        ],
      },
      start: "R6", tenant: "amber", at: 10, depth: 1,
    },
    expected: ["D-own", "D-supply"],
    why: "The own manual is available exactly at the decision hour. S6 is within one dependency hop. Pruning the violet node removes the detour before traversal; depth, document kind and availability independently exclude the other records. This browser model does not enforce production authorization.",
  },
};
