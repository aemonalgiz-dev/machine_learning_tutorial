import type { Data, Settings, Tool } from "./engine";

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
const tool = (title: string, why: string, inputs: string[], run: Tool["run"], settings?: Tool["settings"]): Tool => ({ title, why, inputs, run, ...(settings ? { settings } : {}) });
const validIntegerText = (value: Data): value is string =>
  typeof value === "string" && /^[+-]?\d+$/.test(value.trim()) && Number.isSafeInteger(Number(value.trim()));
const option = (key: string, label: string, initial: string, options?: string[]) => ({ key, label, initial, ...(options ? { options } : {}) });
const settingText = (settings: Settings, key: string): string => text(settings[key]);

function privateCopy(value: Data, seen = new Map<object, Data>()): Data {
  if (value === null || typeof value !== "object") return value;
  const existing = seen.get(value);
  if (existing !== undefined) return existing;
  if (Array.isArray(value)) {
    const copy: Data[] = [];
    seen.set(value, copy);
    for (const item of value) copy.push(privateCopy(item, seen));
    return copy;
  }
  const copy: Row = {};
  seen.set(value, copy);
  for (const [key, item] of Object.entries(value)) Object.defineProperty(copy, key, {
    value: privateCopy(item, seen), enumerable: true, writable: true, configurable: true,
  });
  return copy;
}

/** Inspectable local operations. These do not execute Python, Pydantic, files or a static checker. */
export const pythonValidationTools: Record<string, Tool> = {
  pyValidationCheckBatch: tool("Check each reading",
    "Return ready or reject beside each incoming value. Choose whether this save accepts any finite number or only numbers above zero.",
    ["Incoming readings"], ([input], settings) => list(input).map(value =>
      typeof value === "number" && Number.isFinite(value) && (settings.rule !== "positive numbers" || value > 0) ? "ready" : "reject"),
    [option("rule", "Accept", "numbers", ["numbers", "positive numbers"])]),
  pyValidationAppendCheckedBatch: tool("Append a complete batch",
    "Append the incoming list only when every reading is ready. If any reading is rejected, return the saved list unchanged.",
    ["Saved readings", "Incoming readings", "Checks for incoming readings"], ([saved, incoming, checks]) => {
      const previous = list(saved), batch = list(incoming), decisions = list(checks);
      if (batch.length !== decisions.length || decisions.some(value => value !== "ready" && value !== "reject")) throw Error("Connect one ready-or-reject result for each incoming reading.");
      return decisions.every(value => value === "ready") ? [...clone(previous), ...clone(batch)] : clone(previous);
    }),
  pyValidationCheckRequestField: tool("Check one request field",
    "Choose the field, whether it must be supplied, and the values it allows. A valid request continues; a rejected request becomes a short error message.",
    ["Request"], ([input], settings) => {
      if (typeof input === "string") return input;
      const request = row(input), key = settingText(settings, "field"), rule = settingText(settings, "value");
      if (!Object.hasOwn(request, key)) return settings.presence === "required" ? `${key} is missing` : clone(request);
      const value = request[key];
      const valid = rule === "text or null" ? value === null || typeof value === "string"
        : rule === "text" ? typeof value === "string" : typeof value === "number" && Number.isSafeInteger(value);
      return valid ? clone(request) : `${key} must be ${rule}`;
    }, [option("field", "Field", "note"), option("presence", "Presence", "required", ["required", "may be absent"]), option("value", "Allowed value", "text or null", ["text or null", "text", "a whole number"])]),
  pyValidationDefaultCopies: tool("Default missing copies",
    "Add the chosen copies value only when the request has no copies key. Keep an explicit zero or null exactly as supplied. An earlier rejection continues unchanged.",
    ["Checked request"], ([input], settings) => {
      if (typeof input === "string") return input;
      const request = row(input);
      return Object.hasOwn(request, "copies") ? clone(request) : { ...clone(request), copies: settings.copies };
    }, [{ key: "copies", label: "Copies when absent", initial: 1, min: 0, max: 20, step: 1 }]),
  pyValidationCheckBounds: tool("Check the capture interval",
    "Both endpoints must be finite numbers. Choose increasing order to reject a lower endpoint that equals or exceeds the upper endpoint.",
    ["Lower and upper endpoints"], ([input], settings) => {
      const bounds = row(input), { lower, upper } = bounds;
      if (typeof lower !== "number" || !Number.isFinite(lower) || typeof upper !== "number" || !Number.isFinite(upper)) return "Endpoints must be numbers";
      if (settings.order === "increasing" && lower >= upper) return "Lower must be below upper";
      return { lower, upper };
    }, [option("order", "Endpoint order", "either order", ["either order", "increasing"])]),
  pyValidationCheckCaptureCount: tool("Check the capture count",
    "Accept a whole-number count from 1 through the selected maximum. Text and booleans do not count as numerical inputs.",
    ["Requested count"], ([input], settings) => {
      const maximum = settings.maximum;
      if (typeof maximum !== "number" || !Number.isSafeInteger(maximum) || maximum < 1) throw Error("Choose a positive whole-number maximum.");
      return typeof input === "number" && Number.isSafeInteger(input) && input >= 1 && input <= maximum ? input : `Count must be from 1 through ${maximum}`;
    }, [{ key: "maximum", label: "Largest count", initial: 20, min: 1, max: 100, step: 1 }]),
  pyValidationPrepareCapture: tool("Prepare the capture",
    "Combine a checked interval and checked count. Return a rejection message if either check failed.",
    ["Checked interval", "Checked count"], ([bounds, count]) => typeof bounds === "string" ? bounds
      : typeof count === "string" ? count : { ...clone(row(bounds)), count: clone(count) }),
  pyValidationReadCountText: tool("Read whole numbers",
    "Convert each decimal text field to a number. Leave unreadable text in its original position so the next operation can report it.",
    ["Count fields as text"], ([input]) => list(input).map(value => {
      text(value);
      return validIntegerText(value) ? Number(value.trim()) : value;
    })),
  pyValidationRejectNegativeCounts: tool("Reject negative counts",
    "Keep zero and positive parsed counts. Mark a negative count as rejected without changing the positions of later fields.",
    ["Parsed fields"], ([input]) => list(input).map(value => typeof value === "number" && value < 0 ? "negative count" : clone(value))),
  pyValidationSummarizeCounts: tool("Separate values from errors",
    "Collect numerical counts in values. Put the original zero-based position of each remaining text field in rejected.",
    ["Checked fields"], ([input]) => {
      const fields = list(input);
      return { values: fields.filter(value => typeof value === "number"), rejected: fields.flatMap((value, index) => typeof value === "number" ? [] : [index]) };
    }),
  pyValidationDraftRecord: tool("Copy the report",
    "An outer-only copy still shares its tag list. Copy nested values as well when the draft must own its later edits.",
    ["Original report"], ([input], settings) => {
      const original = row(privateCopy(row(input)));
      return { original, draft: settings.depth === "nested values too" ? privateCopy(original) : { ...original } };
    }, [option("depth", "Copy", "outer record only", ["outer record only", "nested values too"])]),
  pyValidationEditDraftTags: tool("Add a tag to the draft",
    "Append the cleaned tag to the draft's list. A shared list also changes the displayed original, revealing an outer-only copy. The workshop's actual source stays untouched.",
    ["Original and draft", "New tag"], ([input, tag]) => {
      const state = row(privateCopy(row(input))), cleaned = text(tag).trim();
      if (!cleaned) throw Error("Use a nonempty tag.");
      list(row(state.draft).tags).push(cleaned);
      return state;
    }),
  pyValidationCompareDraftTags: tool("Compare the two tag lists",
    "Show the original tags beside the draft tags after the edit.",
    ["Edited draft and original"], ([input]) => {
      const state = row(input);
      return { original: clone(list(row(state.original).tags)), draft: clone(list(row(state.draft).tags)) };
    }),
  pyValidationOpenBuffer: tool("Open the text buffer",
    "Keep the supplied lines in an open in-memory teaching buffer. No file is opened.",
    ["Lines as text"], ([input]) => ({ lines: text(input).split("\n"), values: [], closed: false, error: null })),
  pyValidationReadBuffer: tool("Read the number lines",
    "Read signed whole numbers, ignoring blank lines. A bad line becomes an error outcome that can still reach the closing operation.",
    ["Open buffer"], ([input]) => {
      const state = row(input);
      if (state.closed !== false) throw Error("Open the buffer before reading.");
      const lines = list(state.lines), bad = lines.findIndex(value => text(value).trim() !== "" && !validIntegerText(value));
      return { ...clone(state), values: bad < 0 ? lines.filter(value => text(value).trim() !== "").map(value => Number(text(value).trim())) : [], error: bad < 0 ? null : `Line ${bad + 1} is not a whole number` };
    }),
  pyValidationCloseBuffer: tool("Close the buffer",
    "Choose whether closing happens after every read or only after success. Keep a read error visible instead of inventing a total.",
    ["Read outcome"], ([input], settings): Data => {
      const state = row(input), closed = settings.when === "after every read" || state.error === null;
      return state.error === null
        ? { total: list(state.values).reduce<number>((total, value) => total + Number(value), 0), closed }
        : { error: clone(state.error), closed };
    }, [option("when", "Close", "only after success", ["only after success", "after every read"])]),
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
