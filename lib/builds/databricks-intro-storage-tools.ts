import type { Data, Tool } from "./engine";

type Row = Record<string, Data>;
const list = (value: Data): Data[] => {
  if (!Array.isArray(value)) throw Error("Connect a list.");
  return value;
};
const object = (value: Data): Row => {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw Error("Connect a record with named fields.");
  return value;
};
const text = (value: Data): string => {
  if (typeof value !== "string" || !value) throw Error("Use nonempty text.");
  return value;
};
const versionNumber = (value: Data): number => {
  if (typeof value !== "number" || !Number.isInteger(value) || value < 0) throw Error("A version must be a nonnegative whole number.");
  return value;
};
const identifier = (value: Data): string => {
  const name = text(value);
  if (!/^[a-z_][a-z0-9_]*$/.test(name)) throw Error("Use simple lowercase names in this teaching model.");
  return name;
};
const fullName = (value: Data): string => {
  const name = text(value), parts = name.split(".");
  if (parts.length !== 3) throw Error("A registered name needs catalog.schema.table.");
  parts.forEach(identifier);
  return name;
};
const clone = <T extends Data>(value: T): T => JSON.parse(JSON.stringify(value)) as T;
const records = (value: Data): Row[] => list(value).map(object);
const tool = (title: string, why: string, inputs: string[], run: Tool["run"]): Tool => ({ title, why, inputs, run });

/** Inspectable local records only: no Delta protocol, Unity Catalog or cloud API. */
export const databricksIntroStorageTools: Record<string, Tool> = {
  dbxCommittedFileKeys: tool(
    "Select a committed file list",
    "Choose the requested version from the supplied reconstructed manifests. A version's file list names its active data files; it does not contain the data itself. This component does not replay a real Delta log.",
    ["Retained version manifests", "Requested version"],
    ([input, requested]) => {
      const version = versionNumber(requested), manifests = records(input), seen = new Set<number>();
      let selected: string[] | undefined;
      for (const manifest of manifests) {
        const current = versionNumber(manifest.version);
        if (seen.has(current)) throw Error("Each retained version must appear exactly once.");
        seen.add(current);
        const keys = list(manifest.files).map(text);
        if (new Set(keys).size !== keys.length) throw Error("A committed file list must not repeat an object key.");
        if (current === version) selected = keys;
      }
      if (!selected) throw Error("The requested version is not retained.");
      return [...selected];
    },
  ),
  dbxReadNamedFiles: tool(
    "Read only the named files",
    "Read keys in the supplied manifest order and copy each file's records. Ignore other stored objects, including an uncommitted file. Missing or repeated file identities stop the local read.",
    ["Committed object keys", "Stored files and their records"],
    ([selected, input]) => {
      const keys = list(selected).map(text);
      if (new Set(keys).size !== keys.length) throw Error("Do not read the same object key twice.");
      const files = new Map<string, Row[]>();
      for (const file of records(input)) {
        const key = text(file.key);
        if (files.has(key)) throw Error("Stored object keys must be unique.");
        files.set(key, records(file.rows));
      }
      return keys.flatMap(key => {
        const found = files.get(key);
        if (!found) throw Error(`The committed object ${key} is unavailable.`);
        return clone(found);
      });
    },
  ),
  dbxResolveTableName: tool(
    "Resolve a table name",
    "Fill the missing catalog and schema from the declared session context. One supplied name uses both defaults, two use the current catalog, and three are already fully qualified. Inputs are name parts, not SQL text.",
    ["Requested name parts", "Current catalog", "Current schema"],
    ([input, currentCatalog, currentSchema]) => {
      const parts = list(input).map(identifier);
      if (parts.length === 1) return [identifier(currentCatalog), identifier(currentSchema), ...parts].join(".");
      if (parts.length === 2) return [identifier(currentCatalog), ...parts].join(".");
      if (parts.length === 3) return parts.join(".");
      throw Error("Supply one, two or three table-name parts.");
    },
  ),
  dbxFindTable: tool(
    "Find the registered table",
    "Look up one exact fully qualified name in the local registry. An unknown catalog, schema or table fails instead of searching another department for a matching short name.",
    ["Registered table records", "Fully qualified table name"],
    ([input, requested]) => {
      const name = fullName(requested), registry = records(input), names = new Set<string>();
      let selected: Row | undefined;
      for (const entry of registry) {
        const registered = fullName(entry.name);
        if (names.has(registered)) throw Error("Registered table names must be unique.");
        names.add(registered);
        records(entry.rows);
        const readers = list(entry.readers).map(text);
        if (new Set(readers).size !== readers.length) throw Error("Each table's reader list must contain distinct identities.");
        if (registered === name) selected = entry;
      }
      if (!selected) throw Error(`No registered table has the name ${name}.`);
      return clone(selected);
    },
  ),
  dbxReadRegisteredTable: tool(
    "Read as the named principal",
    "Keep the resolved table name beside copied records, after checking the declared reader list. This exercise assumes namespace and cloud access were already configured; it does not reproduce Unity Catalog's complete permission model.",
    ["Resolved table record", "Verified principal identity"],
    ([input, principal]) => {
      const entry = object(input), name = fullName(entry.name), identity = text(principal);
      if (!list(entry.readers).map(text).includes(identity)) throw Error("The named principal is not a reader of this table in the local model.");
      return { name, rows: clone(records(entry.rows)) };
    },
  ),
};
