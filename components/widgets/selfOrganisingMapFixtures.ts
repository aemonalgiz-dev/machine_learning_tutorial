// The people and the colours every widget on the map page shares.
//
// The crowd is the running example, eleven people measured by height and
// weight with their labels taken away. The arch is the ideal case for a map,
// eighteen people along a shape a chain of cells can follow and no straight
// line can. The two clumps are the eight people the k-means page summed by
// hand, kept here because a map draped over them has a resting place that can
// be checked against a mean. The hand-placed chain is three cells at round
// numbers, which is what makes one presentation reproducible with a
// calculator.

import { Point } from "@/lib/api";

export const CROWD: Point[] = [
  { x: 147, y: 41 },
  { x: 156, y: 53 },
  { x: 145, y: 57 },
  { x: 159, y: 57 },
  { x: 162, y: 61 },
  { x: 120, y: 25 },
  { x: 122, y: 28 },
  { x: 118, y: 24 },
  { x: 180, y: 80 },
  { x: 183, y: 83 },
  { x: 178, y: 78 },
];

export const ARCH: Point[] = [
  { x: 108, y: 30 },
  { x: 110, y: 39 },
  { x: 112, y: 51 },
  { x: 116, y: 57 },
  { x: 120, y: 68 },
  { x: 126, y: 71 },
  { x: 132, y: 79 },
  { x: 138, y: 80 },
  { x: 147, y: 85 },
  { x: 153, y: 82 },
  { x: 160, y: 82 },
  { x: 168, y: 76 },
  { x: 176, y: 75 },
  { x: 180, y: 65 },
  { x: 187, y: 60 },
  { x: 188, y: 48 },
  { x: 192, y: 41 },
  { x: 193, y: 30 },
];

export const TWO_CLUMPS: Point[] = [
  { x: 118, y: 24 },
  { x: 120, y: 25 },
  { x: 122, y: 28 },
  { x: 124, y: 27 },
  { x: 178, y: 78 },
  { x: 180, y: 80 },
  { x: 182, y: 83 },
  { x: 184, y: 79 },
];

export const HAND_PLACED_CHAIN: Point[] = [
  { x: 120, y: 30 },
  { x: 150, y: 50 },
  { x: 180, y: 70 },
];

export const PRESENTED_PERSON: Point = { x: 156, y: 53 };

export const DOMAIN = { xMin: 100, xMax: 200, yMin: 10, yMax: 100 };

export const EPOCHS = 100;

// A colour for each place on the grid rather than a palette cycled by index,
// so the colours carry the arrangement. The hue runs along the columns from
// indigo and the shade darkens down the rows, which means two cells that are
// neighbours on the grid always wear neighbouring colours whatever the fit did
// with them.
export function cellColour(
  row: number,
  column: number,
  width: number,
  height: number,
): string {
  const hue = (230 + (300 * column) / width) % 360;
  const lightness = height > 1 ? 60 - (22 * row) / (height - 1) : 50;
  return `hsl(${hue.toFixed(0)} 65% ${lightness.toFixed(0)}%)`;
}

// Eighteen people scattered across the same window the rest of the page uses,
// so a reader can watch a fresh crowd rather than only the fixed ones.
export function randomCrowd(howMany = 18): Point[] {
  return Array.from({ length: howMany }, () => ({
    x: Math.round(DOMAIN.xMin + Math.random() * (DOMAIN.xMax - DOMAIN.xMin)),
    y: Math.round(DOMAIN.yMin + Math.random() * (DOMAIN.yMax - DOMAIN.yMin)),
  }));
}

export const STAT_CLASS = "rounded-lg bg-slate-100 px-3 py-2 dark:bg-slate-800";

export const BUTTON_CLASS =
  "rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700";

export const SLIDER_LABEL_CLASS =
  "flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300";
