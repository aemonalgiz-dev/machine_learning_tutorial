// What every normalisation widget on the page shares.
//
// The whole-number four is the block the prose works digit for digit, four
// rows of two readings whose column means and deviations are whole, 8 and 9
// then 6 and 3, and whose first row is whole across as well, a mean of 4, a
// deviation of 3 and a root mean square of 5. The three-feature block has
// whole column statistics too, 8, 6 and 10 over 3, 2 and 5, and is the one
// the row layers' backward pass is shown on, because a row of two readings
// leaves nothing for a centring layer to pass down. The crowd is the
// classification pages' tangled crowd, re-exported from the widget that first
// drew it so every page draws the same people; twenty of them are the most
// the playground's grid can hold.

import { LabelledPoint } from "@/lib/api";

export { ADULT, CHILD, TANGLED_CROWD } from "./BootstrapMachine";
import { TANGLED_CROWD } from "./BootstrapMachine";

export const WORKED_BLOCK: number[][] = [
  [1, 7],
  [1, 9],
  [7, 1],
  [23, 7],
];

export const THREE_FEATURES: number[][] = [
  [5, 4, 3],
  [7, 4, 9],
  [7, 8, 11],
  [13, 8, 17],
];

export const PLAYGROUND_MAX_ROWS = 20;

// The first twenty of the crowd, height in centimetres and weight in
// kilograms, which is a batch the way a real one is: two features in
// different units, read down the rows.
export const TWENTY_OF_THE_CROWD: number[][] = TANGLED_CROWD.slice(
  0,
  PLAYGROUND_MAX_ROWS,
).map((person: LabelledPoint) => [person.x, person.y]);

// Sixteen people drawn in the crowd's range, heights between 115 and 185
// centimetres with a weight that follows the height and wanders around it.
export function randomPeople(count = 16): number[][] {
  const people: number[][] = [];
  for (let index = 0; index < count; index += 1) {
    const height = Math.round(115 + Math.random() * 70);
    const weight = Math.round(0.85 * (height - 100) + (Math.random() - 0.5) * 24);
    people.push([height, Math.max(20, weight)]);
  }
  return people;
}

export const BUTTON_CLASS =
  "rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100 disabled:opacity-40 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700";

export const ACTIVE_BUTTON_CLASS =
  "rounded-md border border-indigo-600 bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white transition dark:border-indigo-500 dark:bg-indigo-500";

export const ARRANGEMENT_COLOURS: Record<string, string> = {
  none: "#64748b",
  batch: "#6366f1",
  layer: "#f59e0b",
  rms: "#10b981",
  weight: "#e11d48",
};

export function formatSigned(value: number, digits = 4): string {
  const rounded = value.toFixed(digits);
  return rounded === (-0).toFixed(digits) ? (0).toFixed(digits) : rounded;
}

// A tiny figure printed as it would be read aloud, 2.1e-10 rather than
// 2.0848836546e-10, and a plain figure printed to four places.
export function formatMagnitude(value: number): string {
  if (value === 0) return "0";
  if (Math.abs(value) < 1e-3) return value.toExponential(1).replace("e-", "e−");
  return value.toFixed(4);
}
