import type { Data, Tool } from "./engine";

type Row = Record<string, Data>;
const array = (value: Data): Data[] => { if (!Array.isArray(value)) throw Error("Connect a list."); return value; };
const rows = (value: Data): Row[] => array(value).map(value => { if (!value || typeof value !== "object" || Array.isArray(value)) throw Error("Each row needs named fields."); return value; });
const text = (value: Data): string => { if (typeof value !== "string" || !value) throw Error("Use nonempty text."); return value; };
const number = (value: Data): number => { if (typeof value !== "number" || !Number.isFinite(value)) throw Error("Use a finite number."); return value; };
const integer = (value: Data, minimum = 0): number => { const n = number(value); if (!Number.isInteger(n) || n < minimum) throw Error(`Use a whole number of at least ${minimum}.`); return n; };
const strings = (value: Data) => array(value).map(text);
const field = (row: Row, name: string): Data => { if (!Object.hasOwn(row, name)) throw Error(`The row has no ${name} field.`); return row[name]; };
const clone = <T extends Data>(value: T): T => JSON.parse(JSON.stringify(value)) as T;
const canonical = (value: Data): string => JSON.stringify(value, (_, item) => item && typeof item === "object" && !Array.isArray(item) ? Object.fromEntries(Object.keys(item).sort().map(key => [key, item[key]])) : item);
const compareText = (a: string, b: string) => { const left = [...a], right = [...b]; for (let i=0; i<Math.min(left.length,right.length); i++) { const difference=left[i].codePointAt(0)!-right[i].codePointAt(0)!; if (difference) return difference; } return left.length-right.length; };
const ordered = (values: Row[], key: string) => [...values].sort((a, b) => compareText(text(field(a, key)), text(field(b, key))));
const tool = (title: string, why: string, inputs: string[], run: Tool["run"]): Tool => ({ title, why, inputs, run });

/** Small, deterministic semantic models. No Spark, Databricks, network or credentials. */
export const databricksTools: Record<string, Tool> = {
  dbxEmptyPlan: tool("Start a transformation plan", "Create an empty list of instructions. No input rows are read by this component.", [], () => []),
  dbxWherePlan: tool("Plan a numerical filter", "Append a field comparison to the plan. Rows will be checked only when Execute the plan receives them.", ["Earlier plan", "Field name", "Minimum value"], ([plan, name, minimum]) => [...clone(rows(plan)), { kind: "filter", field: text(name), minimum: number(minimum) }]),
  dbxSelectPlan: tool("Plan the output columns", "Append a projection: keep the supplied named columns in their supplied order. This does not mutate the input table.", ["Earlier plan", "Output column names"], ([plan, columns]) => {
    const names = strings(columns); if (new Set(names).size !== names.length) throw Error("Use distinct output column names.");
    return [...clone(rows(plan)), { kind: "select", columns: names }];
  }),
  dbxExecutePlan: tool("Execute the plan on these rows", "Run the saved filter and column-selection instructions on the supplied rows. Building the plan does not read the table; this component gives those instructions their data.", ["Transformation plan", "Input records"], ([plan, input]) => {
    let result = clone(rows(input));
    for (const step of rows(plan)) {
      if (step.kind === "filter") result = result.filter(row => { const value = field(row, text(step.field)); return value !== null && number(value) >= number(step.minimum); });
      else if (step.kind === "select") result = result.map(row => Object.fromEntries(strings(step.columns).map(name => [name, field(row, name)])));
      else throw Error("The teaching plan supports only filter and select instructions.");
    }
    return result;
  }),
  dbxSaltRows: tool("Split one hot key into partial groups", "Preserve the original key and add a routing key. Consecutive occurrences of the supplied hot key cycle through salt groups. Other keys use salt zero. Final aggregates must still combine the original keys.", ["Records", "Original key field", "Hot key", "Salt groups"], ([input, name, hot, count]) => {
    const key = text(name), hotKey = text(hot), n = integer(count, 1); let next = 0;
    return rows(input).map(row => ({ ...clone(row), routingKey: `${text(field(row, key))}#${field(row, key) === hotKey ? next++ % n : 0}` }));
  }),
  dbxBucketRows: tool("Route matching keys together", "Sum Unicode character codes in each routing key and take the remainder by worker count. This declared toy hash makes routing visible; it is not Spark's hash function.", ["Records with routing keys", "Worker count"], ([input, count]) => {
    const n = integer(count, 1); if (n > 64) throw Error("Use at most 64 teaching workers.");
    const result: Data[][] = Array.from({ length: n }, () => []);
    for (const row of rows(input)) { let hash = 0; for (const character of text(row.routingKey)) hash += character.codePointAt(0)!; result[hash % n].push(clone(row)); }
    return result;
  }),
  dbxPartitionSizes: tool("Count each worker's records", "Keep one count for every worker, including empty workers. An idle worker cannot finish a different worker's unsplit hot group.", ["Worker partitions"], ([partitions]) => array(partitions).map(part => array(part).length)),
  dbxSnapshot: tool("Open a committed table version", "Read the exact saved table version requested. A missing or repeated version stops the read. This workshop stores complete copies; Delta reconstructs a table version from its transaction log.", ["Table history", "Required version"], ([history, version]) => {
    const requested = integer(version), found = rows(history).filter(commit => integer(commit.version) === requested);
    if (found.length !== 1) throw Error("The requested version must exist exactly once in the retained history.");
    return clone(rows(found[0].rows));
  }),
  dbxColumn: tool("Read a named numerical column", "Extract the finite numerical values from a table, retaining row order. Null is missing, so this particular calculation refuses it instead of silently changing the denominator.", ["Records", "Field name"], ([input, name]) => rows(input).map(row => number(field(row, text(name))))),
  dbxMeanOrMissing: tool("Mean or an explicit missing result", "Return the mean of the supplied finite numbers, or null when there are no observations. An empty snapshot must not silently become a mean of zero.", ["Numerical observations"], ([input]) => { const values = array(input).map(number); return values.length ? values.reduce((a,b) => a+b, 0) / values.length : null; }),
  dbxNewFiles: tool("Keep files absent from the checkpoint", "Compare immutable file identities with the committed checkpoint and suppress identical repeated discoveries in this batch. Conflicting contents under one file identity stop this model.", ["Discovered files", "Committed file identities"], ([input, checkpoint]) => {
    const seen = new Set(strings(checkpoint)), observed = new Map<string, string>(), result: Row[] = [];
    for (const file of rows(input)) {
      const name = text(file.file), content = canonical(rows(file.rows));
      if (observed.has(name) && observed.get(name) !== content) throw Error("One immutable file identity has conflicting contents.");
      observed.set(name, content);
      if (!seen.has(name)) { result.push(clone(file)); seen.add(name); }
    }
    return result;
  }),
  dbxCommitFiles: tool("Commit accepted rows and file progress", "Add the accepted rows and record the same file identities in one new state. A real data sink must commit both updates together so a retry cannot add the rows twice.", ["New files", "Earlier output records", "Earlier file checkpoint"], ([input, previous, checkpoint]) => {
    const files = rows(input), ids = strings(checkpoint), names = files.map(file => text(file.file));
    if (new Set(names).size !== names.length || names.some(name => ids.includes(name))) throw Error("Filter completed or repeated files before committing.");
    return { rows: [...clone(rows(previous)), ...files.flatMap(file => clone(rows(file.rows)))], checkpoint: [...ids, ...names] };
  }),
  dbxLatestChanges: tool("Choose the last change per entity", "Use a source sequence number, not arrival order. Equal sequence numbers with conflicting contents are ambiguous and must be repaired upstream.", ["Change records", "Entity key field"], ([input, name]) => {
    const key = text(name), latest = new Map<string, Row>(), versions = new Map<string, string>();
    for (const row of rows(input)) {
      const id = text(field(row, key)), seq = integer(row.seq), old = latest.get(id);
      if (typeof row.deleted !== "boolean") throw Error("Every change needs a deleted boolean.");
      const version = JSON.stringify([id, seq]), content = canonical(row);
      if (versions.has(version) && versions.get(version) !== content) throw Error("Conflicting changes have the same sequence number.");
      versions.set(version, content);
      if (old && seq === old.seq && canonical(old) !== canonical(row)) throw Error("Conflicting changes have the same sequence number.");
      if (!old || seq > number(old.seq)) latest.set(id, clone(row));
    }
    return ordered([...latest.values()], key);
  }),
  dbxMergeVersions: tool("Merge changes while retaining deletion versions", "Update an entity only when the incoming sequence is newer. Keep deletion markers with their sequences so an older update cannot recreate a deleted record.", ["Stored entity state", "One latest change per entity", "Entity key field"], ([previous, updates, name]) => {
    const key = text(name), state = new Map<string, Row>();
    for (const row of rows(previous)) { const id = text(field(row, key)); if (state.has(id)) throw Error("Stored entity keys must be unique."); integer(row.seq); if (typeof row.deleted !== "boolean") throw Error("Stored rows need deleted flags."); state.set(id, clone(row)); }
    const seen = new Set<string>();
    for (const row of rows(updates)) {
      const id = text(field(row, key)), seq = integer(row.seq), old = state.get(id);
      if (seen.has(id)) throw Error("Choose one latest source change per entity first."); seen.add(id);
      if (typeof row.deleted !== "boolean") throw Error("Changes need deleted flags.");
      if (old && seq === old.seq && canonical(old) !== canonical(row)) throw Error("Stored and incoming rows disagree at the same sequence.");
      if (!old || seq > number(old.seq)) state.set(id, clone(row));
    }
    return ordered([...state.values()], key);
  }),
  dbxActiveRows: tool("Hide deleted rows from the consumer", "Remove logical deletion markers from the visible result while the previous state component still retains them. This is a read view, not physical erasure.", ["Versioned entity state"], ([input]) => clone(rows(input).filter(row => row.deleted === false))),
  dbxExpectation: tool("Evaluate a row expectation", "Attach a pass flag to each complete row. Null or a value below the numerical minimum fails this predicate. No row is dropped here.", ["Records", "Checked field", "Minimum value"], ([input, name, minimum]) => rows(input).map(row => { const value = field(row, text(name)); return { row: clone(row), passed: value !== null && number(value) >= number(minimum) }; })),
  dbxQualityPublication: tool("Apply warn, drop or fail policy", "Warn keeps all candidate rows; drop publishes passing rows; fail preserves the earlier published snapshot if any row fails. The returned counts describe this teaching evaluation, not a guarantee about which platform metrics survive a failed update.", ["Rows with expectation flags", "Policy: warn, drop or fail", "Earlier published snapshot"], ([checked, policy, previous]) => {
    const checkedRows = rows(checked), mode = text(policy); if (!["warn", "drop", "fail"].includes(mode)) throw Error("Choose warn, drop or fail.");
    if (checkedRows.some(row => typeof row.passed !== "boolean")) throw Error("Evaluate the expectation before choosing a policy.");
    const valid = checkedRows.filter(row => row.passed), failed = checkedRows.length - valid.length, stopped = mode === "fail" && failed > 0;
    return { status: stopped ? "failed" : "published", rows: stopped ? clone(rows(previous)) : (mode === "drop" ? valid : checkedRows).map(row => clone(field(row, "row"))), passed: valid.length, failed };
  }),
  dbxComparableRuns: tool("Keep validation runs using the same evidence", "Match validation table identity, its own version and the split before comparing MAE. Different training tables remain eligible when they were assessed against this same evidence. Test-set scores are excluded.", ["Run records", "Validation table version", "Validation split identity", "Validation table identity"], ([input, version, split, table]) => {
    const requiredVersion = integer(version), requiredSplit = text(split), requiredTable = text(table);
    return clone(rows(input).filter(row => row.role === "validation" && row.validationTable === requiredTable && row.validationVersion === requiredVersion && row.split === requiredSplit));
  }),
  dbxBestRun: tool("Choose the smallest validation MAE", "Select the lowest finite MAE among comparable runs. Exact ties use run ID order for repeatability. This selection does not replace a final untouched assessment.", ["Comparable validation runs"], ([input]) => {
    const candidates = rows(input); if (!candidates.length) throw Error("No comparable validation run is available.");
    for (const candidate of candidates) { if (number(candidate.mae) < 0) throw Error("MAE must be nonnegative."); text(candidate.runId); }
    return clone([...candidates].sort((a, b) => number(a.mae) - number(b.mae) || compareText(text(a.runId), text(b.runId)))[0]);
  }),
  dbxRunManifest: tool("Keep the artifact attached to its data identities", "Return the chosen run ID and model URI with both training and validation table identities, their versions and the assessment split. A version number belongs to one table; it is not a global dataset identity.", ["Chosen run"], ([input]) => {
    if (!input || typeof input !== "object" || Array.isArray(input)) throw Error("Connect one selected run record.");
    return { runId: text(input.runId), modelUri: text(input.modelUri), trainingTable: text(input.trainingTable), trainingVersion: integer(input.trainingVersion), validationTable: text(input.validationTable), validationVersion: integer(input.validationVersion), split: text(input.split) };
  }),
  dbxReadRequirements: tool("List the table read requirements", "For catalog.schema.table, require USE CATALOG on the catalog, USE SCHEMA on the schema, and SELECT on the table. Other Unity Catalog privileges and administrative bypasses are outside this model.", ["Three-part table name"], ([name]) => {
    const parts = text(name).split("."); if (parts.length !== 3 || parts.some(part => !/^[A-Za-z_][A-Za-z0-9_]*$/.test(part))) throw Error("Use catalog.schema.table with simple names.");
    return [{ object: parts[0], privilege: "USE CATALOG" }, { object: parts.slice(0, 2).join("."), privilege: "USE SCHEMA" }, { object: parts.join("."), privilege: "SELECT" }];
  }),
  dbxCheckGrants: tool("Check each requirement for the actual principal", "Accept only explicit grants matching the required object and privilege, for the supplied authenticated principal or established group identities. This does not infer group membership or inherited grants.", ["Read requirements", "Explicit grant records", "Verified principal and group identities"], ([requirements, grants, principals]) => {
    const allowed = new Set(strings(principals)), evidence = rows(grants);
    return rows(requirements).map(required => ({ requirement: `${text(required.privilege)} ${text(required.object)}`, allowed: evidence.some(grant => allowed.has(text(grant.principal)) && grant.object === required.object && grant.privilege === required.privilege) }));
  }),
  dbxAccessDecision: tool("Require every read privilege", "Return permission only if every explicit requirement passed. Keep the missing requirements visible so a failure can be diagnosed without granting broad administrator access.", ["Checked requirements"], ([input]) => {
    const checks = rows(input); if (!checks.length || checks.some(row => typeof row.allowed !== "boolean")) throw Error("Connect the checked read requirements.");
    const missing = checks.filter(row => !row.allowed).map(row => text(row.requirement)); return { allow: missing.length === 0, missing };
  }),
  dbxHistoricalCandidates: tool("Keep features published by each prediction", "Match entity keys and keep published timestamps no later than the prediction, within the supplied age limit. Each prediction keeps its own candidate list and original position.", ["Immutable published feature history", "Prediction rows", "Maximum feature age in minutes"], ([history, predictions, age]) => {
    const values = rows(history), maximum = number(age); if (maximum < 0) throw Error("The age limit must be nonnegative.");
    const versions = new Map<string, string>();
    for (const value of values) { const key = JSON.stringify([text(value.pump), number(value.publishedAt)]), content = canonical(field(value, "value")); if (versions.has(key) && versions.get(key) !== content) throw Error("One feature key/timestamp has conflicting values."); versions.set(key, content); }
    return rows(predictions).map(prediction => { const at = number(prediction.at), pump = text(prediction.pump); return { pump, at, candidates: clone(values.filter(value => value.pump === pump && number(value.publishedAt) <= at && at - number(value.publishedAt) <= maximum)) }; });
  }),
  dbxLatestFeature: tool("Select the most recent available feature", "For each prediction, return the candidate with the greatest published timestamp or null when none exists. Conflicting values at one entity/timestamp stop the model instead of selecting an arbitrary row.", ["Candidate list for every prediction"], ([input]) => rows(input).map(prediction => {
    const candidates = rows(prediction.candidates).sort((a, b) => number(b.publishedAt) - number(a.publishedAt));
    const newest = candidates[0]; if (newest && candidates.some(value => value.publishedAt === newest.publishedAt && value.value !== newest.value)) throw Error("One feature key/timestamp has conflicting values.");
    return { pump: text(prediction.pump), at: number(prediction.at), temperature: newest ? field(newest, "value") : null };
  })),
};
