// The people every widget on the grid-search page shares.
//
// The twelve are placed so the fold the page works by hand comes out clean:
// under the page's seeds the second fold judges the people at 153, 165 and
// 171 centimetres, whose weights average exactly 62, and their two nearest
// searched neighbours predict 52.5, 61.5 and 71. The ideal case is the line
// page's fifteen people lying almost exactly on one line, and the random
// crowd is fifteen people drawn fresh each time along a line with a
// person-to-person wobble.

import { Point } from "@/lib/api";

export const TWELVE_PEOPLE: Point[] = [
  { x: 150, y: 50 },
  { x: 153, y: 52 },
  { x: 157, y: 55 },
  { x: 159, y: 57 },
  { x: 162, y: 61 },
  { x: 165, y: 63 },
  { x: 168, y: 66 },
  { x: 171, y: 71 },
  { x: 174, y: 72 },
  { x: 177, y: 76 },
  { x: 180, y: 78 },
  { x: 183, y: 82 },
];

export const IDEAL_CASE: Point[] = [
  { x: 152, y: 54.2 },
  { x: 155, y: 55.4 },
  { x: 158, y: 58.7 },
  { x: 161, y: 60.5 },
  { x: 164, y: 63.2 },
  { x: 167, y: 66.2 },
  { x: 170, y: 67.4 },
  { x: 173, y: 70.7 },
  { x: 176, y: 72.5 },
  { x: 179, y: 75.2 },
  { x: 182, y: 78.2 },
  { x: 185, y: 79.4 },
  { x: 188, y: 82.7 },
  { x: 191, y: 84.5 },
  { x: 194, y: 87.2 },
];

// Fifteen people along a line with a wobble, heights three centimetres
// apart so no two people share a height and the neighbour ties stay away.
export function randomCrowd(): Point[] {
  const slope = 0.6 + Math.random() * 0.4;
  const intercept = -50 + (Math.random() - 0.5) * 10;
  return Array.from({ length: 15 }, (_, index) => {
    const height = 150 + index * 3;
    const wobble = (Math.random() - 0.5) * 8;
    const weight = Math.round((slope * height + intercept + wobble) * 10) / 10;
    return { x: height, y: weight };
  });
}

export type CrowdName = "twelve" | "ideal" | "random";

export const BUTTON_CLASS =
  "rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700";

export const ACTIVE_CLASS =
  "rounded-md border border-indigo-400 bg-indigo-50 px-3 py-1.5 text-sm font-medium text-indigo-700 dark:border-indigo-600 dark:bg-indigo-950 dark:text-indigo-300";

// A score far below zero is a ruin, and decimals on a ruin are noise.
export function formatScore(value: number | null, digits = 4): string {
  if (value === null) return "…";
  if (value < -10) return value.toFixed(0);
  return value.toFixed(digits);
}
