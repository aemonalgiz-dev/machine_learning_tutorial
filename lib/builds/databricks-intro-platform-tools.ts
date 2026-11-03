import type { Data, Tool } from "./engine";

type Row = Record<string, Data>;
type Session = { saved: Row[]; preview: Row[] | null };
const clone = <T extends Data>(value: T): T => JSON.parse(JSON.stringify(value)) as T;
const record = (value: Data): Row => {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw Error("Connect a record with named fields.");
  return value;
};
const text = (value: Data): string => {
  if (typeof value !== "string" || !value.trim()) throw Error("Use nonempty text for each name and location.");
  return value;
};
const rows = (value: Data): Row[] => {
  if (!Array.isArray(value)) throw Error("Connect a list of records.");
  return value.map(record);
};
const session = (value: Data): Session => {
  const state = record(value);
  if (!Object.hasOwn(state, "preview")) throw Error("The session needs a preview field; null means no live preview.");
  return { saved: rows(state.saved), preview: state.preview === null ? null : rows(state.preview) };
};
const tool = (title: string, why: string, inputs: string[], run: Tool["run"]): Tool => ({ title, why, inputs, run });

/** Local teaching models only. These components never contact a cloud service. */
export const databricksIntroPlatformTools: Record<string, Tool> = {
  dbxIntroResolveDataset: tool("Find the requested dataset",
    "Look up the requested name in the supplied directory. Keep its name with its location; missing or repeated directory names stop this teaching workflow.",
    ["Requested input name", "Dataset directory"], ([requested, directory]) => {
      const name = text(requested);
      const entries = rows(directory).map(entry => ({ name: text(entry.name), location: text(entry.location) }));
      if (new Set(entries.map(entry => entry.name)).size !== entries.length) throw Error("Dataset names must be distinct in this directory.");
      const match = entries.find(entry => entry.name === name);
      if (!match) throw Error("The requested dataset is missing from the directory.");
      return clone(match);
    }),
  dbxIntroManifest: tool("Describe the processing step",
    "Keep the program, resolved input and requested output together. The teaching policy requires a separate output name so the source is not overwritten. This describes work; it does not execute it.",
    ["Program name", "Resolved input dataset", "Output name"], ([program, resolved, target]) => {
      const input = record(resolved);
      const name = text(input.name), location = text(input.location), outputName = text(target);
      if (name === outputName) throw Error("Use a separate output name under this workshop's no-overwrite policy.");
      return { program: text(program), input: { name, location }, output: { name: outputName } };
    }),
  dbxWorkspaceOpen: tool("Open the teaching session",
    "Begin with saved records and no process-local preview. Opening the session does not change the saved records.",
    ["Saved table records"], ([saved]) => ({ saved: clone(rows(saved)), preview: null })),
  dbxWorkspacePreview: tool("Put the calculated rows in memory",
    "Attach the supplied program result as a live preview. This leaves the saved table unchanged. The result rows are provided, not calculated by this component.",
    ["Earlier session state", "Calculated preview rows"], ([state, preview]) => ({ ...clone(session(state)), preview: clone(rows(preview)) })),
  dbxWorkspaceSavePreview: tool("Save the preview records",
    "Copy the live preview into the teaching model's saved table. An empty preview is a valid empty result; a missing preview cannot be saved.",
    ["Session with a live preview"], ([state]) => {
      const current = clone(session(state));
      if (current.preview === null) throw Error("There is no live preview to save. Run the preview before saving it.");
      return { saved: clone(current.preview), preview: current.preview };
    }),
  dbxWorkspaceRestart: tool("Restart the teaching process",
    "Start with fresh process memory: clear the live preview and retain the saved table. This is a declared local model, not a complete Databricks restart simulation.",
    ["Earlier session state"], ([state]) => ({ saved: clone(session(state).saved), preview: null })),
};
