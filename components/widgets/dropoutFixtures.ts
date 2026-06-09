// What every dropout widget on the page shares.
//
// The worked row is four units holding 1, 2, 3 and 4 at a drop probability
// of one half under seed 10, whose first draw keeps the first and third. The
// worked block is that row three times over, so the draw's independence
// across rows is visible at a glance, and the rectified block is three rows
// with the exact zeros a rectified layer hands upward, which is where reading
// a mask off the outputs goes wrong. The crowd is the bagging pages' tangled
// crowd, twenty-five people with the middle mixed on purpose, re-exported
// from the widget that first drew it so both pages draw the same people.

export { ADULT, CHILD, TANGLED_CROWD } from "./BootstrapMachine";

export const WORKED_VALUES = [1, 2, 3, 4];
export const WORKED_PROBABILITY = 0.5;
export const WORKED_SEED = 10;
export const DRAW_COUNT = 400;

export const WORKED_BLOCK: number[][] = [
  [1, 2, 3, 4],
  [1, 2, 3, 4],
  [1, 2, 3, 4],
];

export const RECTIFIED_BLOCK: number[][] = [
  [0, 2, 0, 4],
  [3, 0, 0, 1],
  [0, 0, 5, 0],
];

// The blame the block widget sends back by default, one unit of slope at
// every output except where the reader asks for a graded one.
export const GRADED_ARRIVING: number[][] = [
  [1, 2, 3, 4],
  [1, 2, 3, 4],
  [1, 2, 3, 4],
];

export const UNIT_FILLS = [
  "fill-indigo-600",
  "fill-amber-500",
  "fill-emerald-600",
  "fill-rose-500",
  "fill-sky-500",
  "fill-violet-500",
  "fill-orange-500",
  "fill-teal-600",
];

export const UNIT_STROKES = [
  "stroke-indigo-600",
  "stroke-amber-500",
  "stroke-emerald-600",
  "stroke-rose-500",
  "stroke-sky-500",
  "stroke-violet-500",
  "stroke-orange-500",
  "stroke-teal-600",
];

export const BUTTON_CLASS =
  "rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100 disabled:opacity-40 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700";

export const ACCENT_BUTTON_CLASS =
  "rounded-md border border-indigo-300 bg-indigo-50 px-3 py-1.5 text-sm font-medium text-indigo-700 transition hover:bg-indigo-100 dark:border-indigo-700 dark:bg-indigo-950 dark:text-indigo-200 dark:hover:bg-indigo-900";

export function formatValue(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(2);
}
