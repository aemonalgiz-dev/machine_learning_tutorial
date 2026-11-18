import type { Data, Tool } from "./engine";

type Row = Record<string, Data>;
const clone = <T extends Data>(value: T): T => JSON.parse(JSON.stringify(value)) as T;
const row = (value: Data): Row => {
  if (value === null || typeof value !== "object" || Array.isArray(value)) throw Error("Connect a record with named fields.");
  return value;
};
const list = (value: Data): Data[] => {
  if (!Array.isArray(value)) throw Error("Connect a list.");
  return value;
};
const text = (value: Data): string => {
  if (typeof value !== "string") throw Error("Connect text.");
  return value;
};
const boolean = (value: Data): boolean => {
  if (typeof value !== "boolean") throw Error("Connect a true-or-false check.");
  return value;
};
const flags = (value: Data): boolean[] => Array.isArray(value) ? value.map(boolean) : [boolean(value)];
const field = (value: Data, name: Data): Data => {
  const record = row(value), key = text(name);
  if (!Object.hasOwn(record, key)) throw Error("That field is absent. Check presence or supply the declared default first.");
  return record[key];
};
const tool = (title: string, why: string, inputs: string[], run: Tool["run"]): Tool => ({ title, why, inputs, run });
const validIntegerText = (value: Data): value is string =>
  typeof value === "string" && /^[+-]?\d+$/.test(value.trim()) && Number.isSafeInteger(Number(value.trim()));

/** Inspectable local operations. These do not execute Python, Pydantic, files or a static checker. */
export const pythonValidationTools: Record<string, Tool> = {
  pyValidationNumberFlags: tool("Check numeric representations",
    "Return one flag per input. Actual finite numbers pass; strings, booleans and null do not.",
    ["Values"], ([values]) => list(values).map(value => typeof value === "number" && Number.isFinite(value))),
  pyValidationPositiveFlags: tool("Check positive values",
    "Return one flag per input. A value must be an actual finite number above zero.",
    ["Values"], ([values]) => list(values).map(value => typeof value === "number" && Number.isFinite(value) && value > 0)),
  pyValidationMaskAnd: tool("Require both checks per item",
    "Combine aligned flag lists. The item passes only when both of its flags are true.",
    ["First item checks", "Second item checks"], ([left, right]) => {
      const a = flags(left), b = flags(right);
      if (a.length !== b.length) throw Error("Both flag lists must describe the same number of items.");
      return a.map((value, index) => value && b[index]);
    }),
  pyValidationGateWrite: tool("Plan an all-or-nothing write",
    "Plan writes only after every item passes. A rejected batch returns no writes and identifies zero-based bad positions. Nothing is actually saved.",
    ["Checks for every value", "Values to write"], ([checks, values]) => {
      const accepted = flags(checks), input = list(values);
      if (accepted.length !== input.length) throw Error("Each value needs its own validation flag.");
      const badPositions = accepted.flatMap((ok, index) => ok ? [] : [index]);
      return { status: badPositions.length ? "rejected" : "accepted", writes: badPositions.length ? [] : clone(input), badPositions };
    }),
  pyValidationPresence: tool("Check required field presence",
    "Check whether every named key exists. A present null value counts as present; its allowed value needs a separate check.",
    ["Input record", "Required field names"], ([record, names]) => list(names).map(name => Object.hasOwn(row(record), text(name)))),
  pyValidationDefaultField: tool("Default an absent field",
    "Copy the record and supply one field only if its key is absent. An explicit null is preserved.",
    ["Input record", "Field name", "Default for omission"], ([record, name, fallback]) => {
      const result = clone(row(record)), key = text(name);
      return Object.hasOwn(result, key) ? result : { ...result, [key]: clone(fallback) };
    }),
  pyValidationNullableText: tool("Check required nullable text",
    "Accept a present text or null field. A missing field fails, even though null is allowed.",
    ["Input record", "Field name"], ([record, name]) => {
      const input = row(record), key = text(name);
      return Object.hasOwn(input, key) && (input[key] === null || typeof input[key] === "string");
    }),
  pyValidationAll: tool("Require every supplied check",
    "Combine two checks or lists of checks into one decision. An empty list of requirements adds no restriction.",
    ["First checks", "Other checks"], ([left, right]) => [...flags(left), ...flags(right)].every(Boolean)),
  pyValidationReport: tool("Return the accepted record",
    "Keep a record only when all connected checks pass. This visible decision is a local teaching format, not a Pydantic result.",
    ["Candidate record", "All checks pass"], ([record, ok]) => ({ accepted: boolean(ok), record: boolean(ok) ? clone(row(record)) : null })),
  pyValidationGetField: tool("Read a named field",
    "Read the named value. Missing keys stop this operation instead of quietly becoming null.",
    ["Record", "Field name"], ([record, name]) => clone(field(record, name))),
  pyValidationKnownFields: tool("Reject unknown field names",
    "Check every supplied key against the declared allowed names. A misspelled extra key fails this check.",
    ["Record", "Allowed field names"], ([record, names]) => {
      const allowed = new Set(list(names).map(text));
      return Object.keys(row(record)).every(name => allowed.has(name));
    }),
  pyValidationOrdered: tool("Check lower before upper",
    "Both endpoints must be finite numbers, and the lower endpoint must be smaller than the upper endpoint.",
    ["Lower endpoint", "Upper endpoint"], ([lower, upper]) => typeof lower === "number" && Number.isFinite(lower) && typeof upper === "number" && Number.isFinite(upper) && lower < upper),
  pyValidationBoundedInteger: tool("Check a bounded positive integer",
    "Accept a whole number above zero and at most the supplied limit. Text and booleans are rejected.",
    ["Requested count", "Maximum count"], ([value, maximum]) => {
      if (typeof maximum !== "number" || !Number.isInteger(maximum) || maximum < 1) throw Error("The declared maximum must be a positive whole number.");
      return typeof value === "number" && Number.isInteger(value) && value > 0 && value <= maximum;
    }),
  pyValidationParseIntegers: tool("Read decimal whole-number text",
    "Parse each small decimal string, with an optional sign and surrounding spaces. Preserve invalid positions as outcomes. This declared grammar is narrower than Python int().",
    ["Text fields"], ([values]) => list(values).map<Data>((value, position): Data => validIntegerText(value)
      ? { ok: true, value: Number(value.trim()), position }
      : { ok: false, code: "invalid_integer", position })),
  pyValidationNonnegativeOutcomes: tool("Reject negative parsed counts",
    "Keep conversion failures. Turn a successfully parsed negative count into a rejected outcome at its original position. Zero is allowed.",
    ["Parse outcomes"], ([outcomes]) => list(outcomes).map(value => {
      const outcome = row(value);
      if (outcome.ok === true && typeof outcome.value === "number" && outcome.value < 0) {
        return { ok: false, code: "negative_count", position: clone(outcome.position) };
      }
      return clone(outcome);
    })),
  pyValidationSuccessfulValues: tool("Collect successful values",
    "Keep the values from successful parse outcomes, in input order.",
    ["Parse outcomes"], ([outcomes]) => list(outcomes).map(row).filter(outcome => outcome.ok === true).map(outcome => clone(outcome.value))),
  pyValidationFailurePositions: tool("Collect rejected positions",
    "Keep the zero-based positions of failed parse outcomes, in input order.",
    ["Parse outcomes"], ([outcomes]) => list(outcomes).map(row).filter(outcome => outcome.ok === false).map(outcome => clone(outcome.position))),
  pyValidationParseReport: tool("Keep values beside rejected positions",
    "Return the successful values and the positions needing correction. A rejected field is never replaced by an invented zero.",
    ["Successful values", "Rejected positions"], ([values, rejected]) => ({ values: clone(list(values)), rejected: clone(list(rejected)) })),
  pyValidationAppend: tool("Append into a new list",
    "Copy the list and add the new item. The connected source remains unchanged.",
    ["Earlier list", "Item to add"], ([values, item]) => [...clone(list(values)), clone(item)]),
  pyValidationPutField: tool("Replace a field in a new record",
    "Deep-copy the record, then set the named field. This tool's explicit copy policy also separates nested lists.",
    ["Original record", "Field name", "New field value"], ([record, name, value]) => {
      return { ...clone(row(record)), [text(name)]: clone(value) };
    }),
  pyValidationCopiesReport: tool("Compare original and edited records",
    "Keep both records visible so the checks can establish what changed and what was preserved.",
    ["Original record", "Edited record"], ([original, edited]) => ({ original: clone(row(original)), edited: clone(row(edited)) })),
  pyValidationOpenResource: tool("Open the teaching resource",
    "Start an inspectable resource-lifetime record. No file or external connection is opened.",
    ["Resource name"], ([name]) => ({ name: text(name), events: ["open"], closed: false, values: [], error: null })),
  pyValidationReadResource: tool("Read the resource's decimal fields",
    "Record a read attempt. Invalid decimal text becomes an error outcome that can still travel through cleanup. No Python exception or filesystem operation is simulated.",
    ["Open resource state", "Text fields"], ([state, input]) => {
      const current = clone(row(state));
      if (current.closed !== false) throw Error("Read requires an open resource state.");
      const values = list(input), ok = values.every(validIntegerText);
      return { ...current, events: [...list(current.events), "read"], values: ok ? values.map(value => Number(text(value).trim())) : [], error: ok ? null : "invalid_reading" };
    }),
  pyValidationCloseResource: tool("Close after the read outcome",
    "Record cleanup for a successful or failed read. The earlier error outcome remains visible.",
    ["Resource state after reading"], ([state]) => {
      const current = clone(row(state));
      if (current.closed !== false) throw Error("This resource is already closed.");
      return { ...current, events: [...list(current.events), "close"], closed: true };
    }),
  pyValidationResourceReport: tool("Inspect the resource lifetime",
    "Return the event order, final closed flag, parsed values and any read error.",
    ["Resource state"], ([state]) => {
      const current = row(state);
      return { events: clone(list(current.events)), closed: boolean(current.closed), values: clone(list(current.values)), error: clone(current.error) };
    }),
};
