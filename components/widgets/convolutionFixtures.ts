// The pictures, the kernels and the shading every convolution widget shares.
//
// Several widgets on the convolution page draw the same eight by eight picture
// and the same nine weights, so they are written down once here rather than
// copied into each. The page works the square under the vertical edge kernel
// by hand throughout, and every other picture and kernel is here so that a
// reader can put the same claim to something else.

import { Grid } from "@/lib/concepts/convolution";

// Turn a drawing into a grid, a hash being a lit cell and anything else dark.
function drawn(rows: string[]): Grid {
  return rows.map((row) => Array.from(row, (cell) => (cell === "#" ? 1 : 0)));
}

// A four by four square in the middle, whose left edge the page works by hand.
export const SQUARE: Grid = drawn([
  "........",
  "........",
  "..####..",
  "..####..",
  "..####..",
  "..####..",
  "........",
  "........",
]);

// A two-column stroke, which is the picture the shifting section moves.
export const BAR: Grid = drawn([
  "...##...",
  "...##...",
  "...##...",
  "...##...",
  "...##...",
  "...##...",
  "...##...",
  "...##...",
]);

export const DIAGONAL: Grid = drawn([
  "#.......",
  ".#......",
  "..#.....",
  "...#....",
  "....#...",
  ".....#..",
  "......#.",
  ".......#",
]);

export const BLANK: Grid = drawn([
  "........",
  "........",
  "........",
  "........",
  "........",
  "........",
  "........",
  "........",
]);

export interface PicturePreset {
  name: string;
  cells: Grid;
}

export const PICTURE_PRESETS: PicturePreset[] = [
  { name: "A square", cells: SQUARE },
  { name: "A bar", cells: BAR },
  { name: "A diagonal", cells: DIAGONAL },
  { name: "Clear", cells: BLANK },
];

export interface KernelPreset {
  name: string;
  weights: Grid;
}

const NINTH = 1 / 9;

// The two edge kernels are Sobel's, and the vertical one is the kernel the
// page works by hand. Blur and sharpen are the ones a reader will have met in
// an image editor, and identity is there to show a kernel that changes
// nothing.
export const VERTICAL_EDGE: Grid = [
  [-1, 0, 1],
  [-2, 0, 2],
  [-1, 0, 1],
];

export const HORIZONTAL_EDGE: Grid = [
  [-1, -2, -1],
  [0, 0, 0],
  [1, 2, 1],
];

export const BLUR: Grid = [
  [NINTH, NINTH, NINTH],
  [NINTH, NINTH, NINTH],
  [NINTH, NINTH, NINTH],
];

export const SHARPEN: Grid = [
  [0, -1, 0],
  [-1, 5, -1],
  [0, -1, 0],
];

export const IDENTITY_KERNEL: Grid = [
  [0, 0, 0],
  [0, 1, 0],
  [0, 0, 0],
];

export const KERNEL_PRESETS: KernelPreset[] = [
  { name: "Vertical edge", weights: VERTICAL_EDGE },
  { name: "Horizontal edge", weights: HORIZONTAL_EDGE },
  { name: "Blur", weights: BLUR },
  { name: "Sharpen", weights: SHARPEN },
  { name: "Identity", weights: IDENTITY_KERNEL },
];

// Short enough to sit inside a cell: whole numbers plainly, anything else to
// two places, and a value too small to show at that width as a dot.
export function formatValue(value: number): string {
  if (Number.isInteger(value)) return String(value);
  if (Math.abs(value) < 0.005) return "0";
  return value.toFixed(2);
}

// Indigo for a positive answer and amber for a negative one, at a strength
// proportional to the cell's share of the largest magnitude on the map.
export function answerShade(value: number, largest: number): string {
  if (largest === 0 || value === 0) return "transparent";
  const strength = 0.15 + 0.75 * (Math.abs(value) / largest);
  return value > 0
    ? `rgba(79, 70, 229, ${strength.toFixed(3)})`
    : `rgba(245, 158, 11, ${strength.toFixed(3)})`;
}

export function largestMagnitude(grid: Grid): number {
  return Math.max(0, ...grid.flat().map((value) => Math.abs(value)));
}

export function sameGrid(first: Grid, second: Grid): boolean {
  return first.every((row, rowIndex) =>
    row.every((value, columnIndex) => value === second[rowIndex][columnIndex]),
  );
}
