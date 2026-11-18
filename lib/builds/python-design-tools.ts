import type { Data, Settings, Tool } from "./engine";

const values = (value: Data): Data[] => {
  if (!Array.isArray(value)) throw Error("Connect a list.");
  return value;
};
const record = (value: Data): Record<string, Data> => {
  if (value === null || typeof value !== "object" || Array.isArray(value)) throw Error("Connect a named record.");
  return value;
};
const number = (value: Data): number => {
  if (typeof value !== "number" || !Number.isFinite(value)) throw Error("Connect a finite number; text, missing values and flags are different inputs.");
  return value;
};
const vector = (value: Data): number[] => values(value).map(number);
const flags = (value: Data): number[] => values(value).map(item => {
  if (item !== 0 && item !== 1) throw Error("Use one 0-or-1 decision per item.");
  return item;
});
const field = (settings: Settings, key = "field"): string => {
  const name = settings[key];
  if (typeof name !== "string" || !name.trim()) throw Error("Give the field a name.");
  return name;
};
const aligned = (first: Data[], second: Data[]) => {
  if (first.length !== second.length) throw Error("Keep one matching entry on each side.");
};
const size = (value: Data): number => {
  const count = number(value);
  if (!Number.isInteger(count) || count < 0 || count > 64) throw Error("This workshop accepts a whole-number count from 0 to 64.");
  return count;
};
const setting = (key: string, label: string, initial: string) => ({ key, label, initial });
const tool = (title: string, why: string, inputs: string[], run: Tool["run"], settings?: Tool["settings"]): Tool => ({ title, why, inputs, run, ...(settings ? { settings } : {}) });

// Preserve sharing inside a private copy so the defaults experiment can reveal
// aliases without changing any input, source fixture or earlier trace value.
function cloneAliases(value: Data, seen = new Map<object, Data>()): Data {
  if (value === null || typeof value !== "object") return value;
  const existing = seen.get(value);
  if (existing !== undefined) return existing;
  if (Array.isArray(value)) {
    const copy: Data[] = [];
    seen.set(value, copy);
    for (const item of value) copy.push(cloneAliases(item, seen));
    return copy;
  }
  const copy: Record<string, Data> = {};
  seen.set(value, copy);
  for (const [key, item] of Object.entries(value)) Object.defineProperty(copy, key, {
    value: cloneAliases(item, seen), enumerable: true, writable: true, configurable: true,
  });
  return copy;
}

export const pythonDesignTools: Record<string, Tool> = {
  pyDesignReadHouses: tool("Read greenhouse names", "Read house from each row. The names stay in the same order as the temperature readings.", ["Greenhouse records"], ([input]) => values(input).map(item => {
    const name = record(item).house;
    if (typeof name !== "string" || !name.trim()) throw Error("Each record needs a greenhouse name in house.");
    return name;
  })),
  pyDesignReadCelsius: tool("Read temperatures in Celsius", "Read temperature_c from each row without changing its value. The _c ending identifies Celsius; this reader does not convert units.", ["Greenhouse records"], ([input]) => values(input).map(item => {
    const row = record(item);
    if (!Object.hasOwn(row, "temperature_c")) throw Error("A greenhouse record is missing temperature_c.");
    return row.temperature_c;
  })),
  pyDesignFahrenheitRows: tool("Attach names to Fahrenheit readings", "Pair each greenhouse name with its converted reading. Return house and temperature_f so the report identifies both the greenhouse and its unit.", ["Greenhouse names", "Fahrenheit readings"], ([labels, input]) => {
    const names = values(labels), readings = vector(input);
    aligned(names, readings);
    return names.map((house, index) => {
      if (typeof house !== "string" || !house.trim()) throw Error("Each reading needs a greenhouse name.");
      return { house, temperature_f: readings[index] };
    });
  }),
  pyDesignAtOrAbove: tool("Keep readings at or above the limit", "Keep every reading that reaches the limit, including an exact match. The output contains the readings themselves, in their original order.", ["Temperature readings", "Alert limit"], ([input, limit]) => {
    const threshold = number(limit);
    return vector(input).filter(value => value >= threshold);
  }),
  pyDesignAlertSummary: tool("Collect the alert summary", "Keep the alert count and total temperature above the limit together. count is a number of readings; excess_c is a temperature difference in Celsius.", ["Alert count", "Total excess in Celsius"], ([count, excess]) => ({ count: number(count), excess_c: number(excess) })),
  pyDesignDailyCounts: tool("Collect morning and evening counts", "Keep the two report counts separate and label which time each count describes.", ["Morning alert count", "Evening alert count"], ([morning, evening]) => ({ morning: number(morning), evening: number(evening) })),
  pyDesignKeepNumbers: tool("Keep numerical readings", "Keep actual finite numbers, including zero and repeated readings. Text such as \"20\", true, false and null are left out. This is a check that runs; a Python type hint does not perform it.", ["Incoming values"], ([input]) => values(input).filter(value => typeof value === "number" && Number.isFinite(value))),
  pyDesignMissingLimits: tool("Fill only missing alert limits", "Use the shared default when a row has no limit field. Keep a supplied zero. Keep null, which means the alert is disabled and corresponds to None in Python.", ["Greenhouse settings", "Default limit in Celsius"], ([input, fallback]) => {
    const defaultLimit = number(fallback);
    return values(input).map(item => {
      const row = record(item);
      const limit = Object.hasOwn(row, "limit") ? row.limit : defaultLimit;
      return limit === null ? null : number(limit);
    });
  }),
  pyDesignAlertStatuses: tool("Check each greenhouse's alert", "Compare each temperature with its matching limit. Return alert when it reaches the limit, below limit otherwise, and disabled for a null limit.", ["Celsius readings", "Resolved limits"], ([input, limits]) => {
    const readings = vector(input), thresholds = values(limits);
    aligned(readings, thresholds);
    return readings.map((value, index) => thresholds[index] === null ? "disabled" : value >= number(thresholds[index]) ? "alert" : "below limit");
  }),
  pyDesignNoteLists: tool("Create the notes lists", "A new list for each report keeps their notes independent. Reusing one list lets a note added through one report appear in the others too. Choose how the lists are created before attaching them to reports.", ["Greenhouse names"], ([input], settings) => {
    const houses = values(input);
    if (settings.ownership === "A new list for each report") return houses.map(() => []);
    if (settings.ownership === "Reuse one list") {
      const shared: Data[] = [];
      return houses.map(() => shared);
    }
    throw Error("Choose whether reports receive new notes lists or reuse one list.");
  }, [{ key: "ownership", label: "Notes lists", initial: "Reuse one list", options: ["Reuse one list", "A new list for each report"] }]),
  pyDesignNoteReports: tool("Attach notes to their reports", "Give each greenhouse its corresponding notes list. A report has a house name and tags, the list of its notes. Any sharing between supplied lists is retained so you can test its effect.", ["Greenhouse names", "Notes lists"], ([input, notes]) => {
    const houses = values(input), lists = values(notes);
    aligned(houses, lists);
    if (houses.some(house => typeof house !== "string" || !house.trim()) || new Set(houses).size !== houses.length) throw Error("Use a different nonempty name for each greenhouse report.");
    return houses.map((house, index) => ({ house, tags: values(lists[index]) }));
  }),
  pyDesignAddHouseNote: tool("Add a note to one greenhouse", "Find the named greenhouse and append its note. Shared notes lists expose the same update in other reports. The workshop makes a private copy first so testing does not change any source data.", ["Reports", "Greenhouse to update", "Note"], ([input, house, note]) => {
    if (typeof house !== "string" || !house.trim()) throw Error("Name the greenhouse that should receive the note.");
    if (typeof note !== "string" || !note.trim()) throw Error("Supply a nonempty note.");
    const rows = values(cloneAliases(input)).map(record);
    const matches = rows.filter(row => row.house === house);
    if (matches.length !== 1) throw Error("The greenhouse name must identify exactly one report.");
    values(matches[0].tags).push(note);
    return rows;
  }),
  pyDesignColumn: tool("Read a named column", "Read the same explicitly named field from each record, preserving row order. Missing fields stop this operation.", ["Records"], ([input], settings) => {
    const key = field(settings);
    return values(input).map(item => {
      const row = record(item);
      if (!Object.hasOwn(row, key)) throw Error(`A record has no ${key} field.`);
      return row[key];
    });
  }, [setting("field", "Field", "temperature_c")]),
  pyDesignField: tool("Read one named field", "Choose one field from a configuration record without relying on its position.", ["Record"], ([input], settings) => {
    const row = record(input), key = field(settings);
    if (!Object.hasOwn(row, key)) throw Error(`The record has no ${key} field.`);
    return row[key];
  }, [setting("field", "Field", "scale")]),
  pyDesignScale: tool("Scale each value", "Multiply each numerical entry by the supplied scale, retaining order.", ["Values", "Scale"], ([input, scale]) => vector(input).map(value => value * number(scale))),
  pyDesignOffset: tool("Add an offset to each value", "Add the supplied numerical offset to every entry after any scaling.", ["Values", "Offset"], ([input, offset]) => vector(input).map(value => value + number(offset))),
  pyDesignDifferences: tool("Subtract one reference", "Subtract the same reference from each value without combining observations.", ["Values", "Reference"], ([input, reference]) => vector(input).map(value => value - number(reference))),
  pyDesignAtLeast: tool("Check each value against a limit", "Return 1 when a value is at least the supplied limit, including equality; return 0 otherwise.", ["Values", "Inclusive limit"], ([input, limit]) => vector(input).map(value => Number(value >= number(limit)))),
  pyDesignMask: tool("Keep the selected items", "Keep the entries marked 1, including repeated entries, in their original order.", ["Items", "0-or-1 decisions"], ([input, decisions]) => {
    const items = values(input), keep = flags(decisions);
    aligned(items, keep);
    return items.filter((_, index) => keep[index] === 1);
  }),
  pyDesignInvert: tool("Reverse the decisions", "Exchange 0 and 1 so the rejected entries can follow a separate branch.", ["0-or-1 decisions"], ([input]) => flags(input).map(value => 1 - value)),
  pyDesignNumberFlags: tool("Check for finite numerical values", "Check actual values: numbers pass, while booleans, strings, null and nonfinite numbers do not. This is a runtime check, not Python type analysis.", ["Values to inspect"], ([input]) => values(input).map(value => Number(typeof value === "number" && Number.isFinite(value)))),
  pyDesignCount: tool("Count the items", "Count observations without discarding a zero or an empty string.", ["Items"], ([input]) => values(input).length),
  pyDesignSum: tool("Add the numerical entries", "Add a list of finite numbers. An empty list contributes zero.", ["Numbers"], ([input]) => vector(input).reduce((total, value) => total + value, 0)),
  pyDesignNamedRows: tool("Keep names with their values", "Pair each name with its matching value under two explicit field names.", ["Names", "Matching values"], ([labels, input], settings) => {
    const names = values(labels), entries = values(input), labelKey = field(settings, "nameField"), valueKey = field(settings, "valueField");
    aligned(names, entries);
    if (labelKey === valueKey) throw Error("Use different names for the label and value fields.");
    if (names.some(name => typeof name !== "string" || !name.trim())) throw Error("Each row needs a nonempty text name.");
    return names.map((name, index) => ({ [labelKey]: name, [valueKey]: entries[index] }));
  }, [setting("nameField", "Name field", "house"), setting("valueField", "Value field", "temperature_f")]),
  pyDesignRecordPair: tool("Name two results", "Return two independently calculated results under distinct field names.", ["First result", "Second result"], ([first, second], settings) => {
    const firstKey = field(settings, "firstField"), secondKey = field(settings, "secondField");
    if (firstKey === secondKey) throw Error("The two results need different field names.");
    return { [firstKey]: first, [secondKey]: second };
  }, [setting("firstField", "First field", "count"), setting("secondField", "Second field", "excess_c")]),
  pyDesignMissingDefault: tool("Default only an absent field", "Read a field when its key exists. Use the supplied default only for an absent key, preserving an explicit null or zero.", ["Records", "Default for an absent key"], ([input, fallback], settings) => {
    const key = field(settings);
    return values(input).map(item => {
      const row = record(item);
      return Object.hasOwn(row, key) ? row[key] : fallback;
    });
  }, [setting("field", "Optional field", "limit")]),
  pyDesignAtLeastEach: tool("Apply each optional limit", "Compare matching numerical readings and limits. A null limit disables that row's alert; zero remains a numerical limit.", ["Readings", "Matching limits or null"], ([input, limits]) => {
    const readings = vector(input), references = values(limits);
    aligned(readings, references);
    return readings.map((value, index) => references[index] === null ? 0 : Number(value >= number(references[index])));
  }),
  pyDesignFreshLists: tool("Create a separate list per item", "Allocate an independent empty list for each item. This models calling a default factory separately for each instance.", ["Number of items"], ([count]) => Array.from({ length: size(count) }, () => [])),
  pyDesignRepeatList: tool("Reuse one list at every position", "Repeat references to the same list. A later mutation will be visible through every alias; this deliberately contrasts with independent defaults.", ["Number of items", "Shared list"], ([count, initial]) => Array.from({ length: size(count) }, () => values(initial))),
  pyDesignAttachLists: tool("Attach a list to each record", "Attach each supplied list to its matching record. This preserves any sharing between those lists so the next operation can expose it.", ["Records", "One list per record"], ([input, containers], settings) => {
    const rows = values(input).map(record), lists = values(containers);
    aligned(rows, lists);
    const key = field(settings);
    return rows.map((row, index) => ({ ...row, [key]: values(lists[index]) }));
  }, [setting("field", "List field", "tags")]),
  pyDesignAppendRowList: tool("Add a note to one record", "Append to one selected record's list in an isolated copy. If that list was shared, the other aliases show the same added note. Inputs remain unchanged.", ["Records", "Record index", "Note"], ([input, position, note], settings) => {
    const rows = values(input), index = number(position), key = field(settings);
    if (!Number.isInteger(index) || index < 0 || index >= rows.length) throw Error("Choose an existing record index, starting at zero.");
    if (typeof note !== "string" || !note.trim()) throw Error("Use a nonempty text note.");
    const copy = values(cloneAliases(rows));
    values(record(copy[index])[key]).push(note);
    return copy;
  }, [setting("field", "List field", "tags")]),
};
