import type { Data, Tool } from "./engine";

type Row = Record<string, Data>;
const list = (value: Data): Data[] => {
  if (!Array.isArray(value)) throw Error("Connect a list.");
  return value;
};
const record = (value: Data): Row => {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw Error("Use a record with named fields.");
  return value;
};
const text = (value: Data): string => {
  if (typeof value !== "string" || !value.trim()) throw Error("Use nonempty text for an identity.");
  return value;
};
const texts = (value: Data): string[] => list(value).map(text);
const copy = <T extends Data>(value: T): T => JSON.parse(JSON.stringify(value)) as T;
const tool = (title: string, why: string, inputs: string[], run: Tool["run"]): Tool => ({ title, why, inputs, run });

function taskReadiness(input: Data, completedInput: Data): Data[] {
  const tasks = list(input).map(record);
  const ids = tasks.map(task => text(task.id));
  if (new Set(ids).size !== ids.length) throw Error("Every task needs a distinct ID.");
  const dependencies = new Map(tasks.map(task => [text(task.id), texts(task.dependsOn)]));
  for (const required of dependencies.values()) {
    if (new Set(required).size !== required.length) throw Error("List each dependency once.");
    if (required.some(id => !dependencies.has(id))) throw Error("A dependency names an unknown task.");
  }
  const visited = new Set<string>(), visiting = new Set<string>();
  const visit = (id: string) => {
    if (visiting.has(id)) throw Error("Task dependencies contain a cycle.");
    if (visited.has(id)) return;
    visiting.add(id);
    for (const dependency of dependencies.get(id)!) visit(dependency);
    visiting.delete(id);
    visited.add(id);
  };
  ids.forEach(visit);
  const completed = texts(completedInput);
  const done = new Set(completed);
  if (done.size !== completed.length) throw Error("List each completed task once.");
  if (completed.some(id => !dependencies.has(id))) throw Error("A completed ID names an unknown task.");
  for (const id of completed) {
    if (dependencies.get(id)!.some(dependency => !done.has(dependency))) throw Error("A completed task is missing a completed prerequisite.");
  }
  return ids.map(id => {
    const waitingFor = dependencies.get(id)!.filter(dependency => !done.has(dependency));
    return { id, complete: done.has(id), ready: !done.has(id) && waitingFor.length === 0, waitingFor };
  });
}

function runRecord(input: Data): Row {
  const run = record(input);
  text(run.runId);
  const parameters = record(run.parameters), metrics = record(run.metrics), dataset = record(run.dataset);
  for (const [key, value] of Object.entries(parameters)) {
    text(key);
    if (!(typeof value === "string" || typeof value === "boolean" || (typeof value === "number" && Number.isFinite(value)))) throw Error("Use finite scalar parameter values.");
  }
  for (const [key, value] of Object.entries(metrics)) {
    text(key);
    if (typeof value !== "number" || !Number.isFinite(value)) throw Error("Use finite numerical metrics.");
  }
  text(dataset.table);
  if (typeof dataset.version !== "number" || !Number.isInteger(dataset.version) || dataset.version < 0) throw Error("Use a nonnegative whole table version.");
  return run;
}

/** Local models of successful task prerequisites and run ownership, not service clients. */
export const databricksIntroWorkflowTools: Record<string, Tool> = {
  dbxTaskReadiness: tool(
    "Check each task's prerequisites",
    "Inspect an acyclic task plan and a consistent set of completed successes. Keep each task beside the prerequisites it is still waiting for. This model uses all-prerequisites-successful only.",
    ["Tasks with dependency IDs", "Successfully completed task IDs"],
    ([tasks, completed]) => taskReadiness(tasks, completed),
  ),
  dbxReadyTaskIds: tool(
    "List tasks ready to start",
    "From the inspected readiness records, return IDs marked ready in their original plan order. A completed task must not start again.",
    ["Inspected task readiness"],
    ([input]) => list(input).map(record).filter(row => {
      if (typeof row.ready !== "boolean" || typeof row.complete !== "boolean") throw Error("Inspect each task's prerequisites first.");
      if (row.ready && (row.complete || texts(row.waitingFor).length)) throw Error("A ready task must be unfinished with no missing prerequisites.");
      return row.ready;
    }).map(row => text(row.id)),
  ),
  dbxPickIntroRun: tool(
    "Find the requested run",
    "Select one attempt by its exact run ID. Keep its parameters, numerical measurements and input table identity together. A missing or repeated ID stops the lookup.",
    ["Run records", "Requested run ID"],
    ([input, requested]) => {
      const runs = list(input).map(runRecord), id = text(requested);
      if (new Set(runs.map(run => run.runId)).size !== runs.length) throw Error("Run IDs must be distinct.");
      const matches = runs.filter(run => run.runId === id);
      if (matches.length !== 1) throw Error("The requested run is missing.");
      return copy(matches[0]);
    },
  ),
  dbxAttachIntroArtifacts: tool(
    "Attach that run's saved outputs",
    "Match output ownership to the selected run ID, then return a fresh manifest. A reused filename does not establish ownership. This inspects supplied metadata without opening any files.",
    ["Selected run record", "Output records with run IDs"],
    ([input, artifactInput]) => {
      const run = runRecord(input), artifacts = list(artifactInput).map(record);
      for (const artifact of artifacts) { text(artifact.runId); text(artifact.path); }
      const paths = artifacts.filter(artifact => artifact.runId === run.runId).map(artifact => text(artifact.path));
      if (new Set(paths).size !== paths.length) throw Error("List a run's saved output path only once.");
      return { runId: run.runId, parameters: copy(run.parameters), metrics: copy(run.metrics), dataset: copy(run.dataset), artifacts: paths };
    },
  ),
};
