import type { Data, Tool } from "./engine";
import { list, scalar, map, vector } from "./tools";

function dimension(value: Data): number {
  const count = scalar(value);
  if (!Number.isInteger(count) || count < 1 || count > 50) throw Error("Use a whole-number dimension from 1 to 50 for this small workshop.");
  return count;
}

function readings(value: Data): (number | null)[] {
  const entries = list(value);
  if (!entries.every(entry => entry === null || typeof entry === "number" && Number.isFinite(entry))) throw Error("Supply readings as finite numbers, using a blank for a missing value.");
  return entries as (number | null)[];
}

function categories(value: Data): (number | string)[] {
  const entries = list(value);
  if (!entries.every(entry => typeof entry === "string" || typeof entry === "number" && Number.isFinite(entry))) throw Error("Category entries must be names or finite numerical IDs.");
  return entries as (number | string)[];
}

export const FOUNDATION_TOOLS: Record<string, Tool> = {
  fillGrid: {
    title: "Fill a rectangular sheet", why: "Creates the requested rows and columns, placing the same supplied value at every position. The filled values are references, not recorded observations.", inputs: ["Rows", "Columns", "Fill value"],
    run: ([rows, columns, value]) => {
      const height = dimension(rows), width = dimension(columns), fill = scalar(value);
      if (!Number.isFinite(fill)) throw Error("Use a finite fill value.");
      return Array.from({ length: height }, () => Array(width).fill(fill));
    },
  },
  reshapeRows: {
    title: "Group a sequence into rows", why: "Groups consecutive entries into equally sized rows without changing their order. Every entry must belong to a complete row.", inputs: ["Flat sequence", "Entries per row"],
    run: ([value, widthValue]) => {
      const values = vector(value), width = dimension(widthValue);
      if (!values.length || values.length % width !== 0) throw Error("The sequence must contain a whole number of nonempty rows at that width.");
      return Array.from({ length: values.length / width }, (_, row) => values.slice(row * width, (row + 1) * width));
    },
  },
  matches: {
    title: "Match one category", why: "Asks whether each item matches one reference category. It produces a column of one-or-zero decisions in the original item order.", inputs: ["Items", "One reference category"],
    run: ([items, reference]) => {
      const values = categories(items);
      if (typeof reference !== "string" && !(typeof reference === "number" && Number.isFinite(reference))) throw Error("Choose one category from the vocabulary before comparing it with the items.");
      return values.map(value => Number(value === reference));
    },
  },
  observed: {
    title: "Keep observed readings", why: "Removes missing entries while preserving recorded numbers, including zero. The result can supply a training-only replacement reference.", inputs: ["Readings with possible blanks"],
    run: ([value]) => {
      const observed = readings(value).filter((entry): entry is number => entry !== null);
      if (!observed.length) throw Error("There are no observed readings. A replacement mean cannot be learned from this list.");
      return observed;
    },
  },
  fillMissing: {
    title: "Fill missing readings", why: "Uses the supplied reference only at missing entries. Every observed reading remains unchanged.", inputs: ["Report with possible blanks", "Replacement reference"],
    run: ([value, replacement]) => {
      const reference = scalar(replacement);
      if (!Number.isFinite(reference)) throw Error("The replacement reference must be a finite number.");
      return readings(value).map(entry => entry === null ? reference : entry);
    },
  },
  membership: {
    title: "Compare category membership", why: "Creates one row per incoming item and one column per reference category. A matching cell is one; every other cell is zero. Reference categories must be distinct.", inputs: ["Items", "Reference categories"],
    run: ([items, reference]) => {
      const values = categories(items), vocabulary = categories(reference);
      if (!vocabulary.length || new Set(vocabulary).size !== vocabulary.length) throw Error("Supply a nonempty reference list with no repeated categories.");
      return values.map(value => vocabulary.map(entry => Number(value === entry)));
    },
  },
  sin: { title: "Sine of an angle", why: "Reads the vertical coordinate on a unit circle. Angles must be in radians.", inputs: ["Angle in radians"], run: ([value]) => map(value, Math.sin) },
  cos: { title: "Cosine of an angle", why: "Reads the horizontal coordinate on a unit circle. Together with sine it distinguishes positions around a repeating cycle.", inputs: ["Angle in radians"], run: ([value]) => map(value, Math.cos) },
};
