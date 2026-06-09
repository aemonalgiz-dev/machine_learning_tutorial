// The people every k-means widget on the page shares.
//
// The eight are two tight clumps whose group means are whole numbers, (121, 26)
// and (181, 80), so the page can sum the inertia of 64 by hand. The crowd is
// the classification pages' crowd with its labels stripped away, which is
// what an unsupervised method sees, and at two groups it has three valleys
// for the loop to rest in. The ideal case is sixteen people in two clumps
// that every seeding finds. The rest are built to fail in a particular way:
// two long bands the method cuts across, two crescents no straight line
// separates, a small tight group beside a large loose one, and the eight
// with one stray person added.

import { Point } from "@/lib/api";

export const WORKED_PEOPLE: Point[] = [
  { x: 118, y: 24 },
  { x: 120, y: 25 },
  { x: 122, y: 28 },
  { x: 124, y: 27 },
  { x: 178, y: 78 },
  { x: 180, y: 80 },
  { x: 182, y: 83 },
  { x: 184, y: 79 },
];

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

export const IDEAL_CASE: Point[] = [
  { x: 118, y: 23 },
  { x: 120, y: 26 },
  { x: 122, y: 24 },
  { x: 124, y: 29 },
  { x: 126, y: 27 },
  { x: 128, y: 31 },
  { x: 121, y: 30 },
  { x: 125, y: 25 },
  { x: 174, y: 74 },
  { x: 176, y: 78 },
  { x: 178, y: 76 },
  { x: 180, y: 81 },
  { x: 182, y: 79 },
  { x: 184, y: 83 },
  { x: 177, y: 82 },
  { x: 181, y: 77 },
];

// Eleven heights, seven centimetres apart, and two bands fourteen kilograms
// apart along the whole run, so each band is far longer than the gap between
// them.
const BAND_HEIGHTS = [120, 127, 134, 141, 148, 155, 162, 169, 176, 183, 190];
export const TWO_BANDS: Point[] = [
  ...BAND_HEIGHTS.map((height) => ({ x: height, y: Math.round((25 + 0.6 * (height - 120)) * 10) / 10 })),
  ...BAND_HEIGHTS.map((height) => ({ x: height, y: Math.round((39 + 0.6 * (height - 120)) * 10) / 10 })),
];

export const TWO_CRESCENTS: Point[] = [
  { x: 173, y: 58 },
  { x: 171, y: 67 },
  { x: 167, y: 74 },
  { x: 160, y: 80 },
  { x: 152, y: 83 },
  { x: 144, y: 83 },
  { x: 136, y: 80 },
  { x: 129, y: 74 },
  { x: 125, y: 67 },
  { x: 123, y: 58 },
  { x: 148, y: 46 },
  { x: 150, y: 37 },
  { x: 154, y: 29 },
  { x: 160, y: 24 },
  { x: 169, y: 21 },
  { x: 177, y: 21 },
  { x: 186, y: 24 },
  { x: 192, y: 29 },
  { x: 196, y: 37 },
  { x: 198, y: 45 },
];

// Twenty people spread loosely, and five packed tightly just to their right.
export const UNEQUAL_GROUPS: Point[] = [
  { x: 136, y: 48 },
  { x: 139, y: 61 },
  { x: 141, y: 52 },
  { x: 143, y: 44 },
  { x: 145, y: 66 },
  { x: 147, y: 57 },
  { x: 149, y: 49 },
  { x: 150, y: 62 },
  { x: 152, y: 54 },
  { x: 154, y: 45 },
  { x: 155, y: 68 },
  { x: 157, y: 59 },
  { x: 158, y: 50 },
  { x: 160, y: 64 },
  { x: 162, y: 55 },
  { x: 163, y: 47 },
  { x: 165, y: 60 },
  { x: 164, y: 69 },
  { x: 146, y: 43 },
  { x: 138, y: 55 },
  { x: 176, y: 56 },
  { x: 178, y: 60 },
  { x: 180, y: 58 },
  { x: 177, y: 59 },
  { x: 179, y: 57 },
];

export const STRAY: Point = { x: 196, y: 14 };
export const WITH_A_STRAY: Point[] = [...WORKED_PEOPLE, STRAY];

export function randomClumps(): Point[] {
  const around = (centreX: number, centreY: number, count: number): Point[] =>
    Array.from({ length: count }, () => ({
      x: Math.round(centreX + (Math.random() - 0.5) * 44),
      y: Math.round(centreY + (Math.random() - 0.5) * 38),
    }));
  const cornerX = 125 + Math.random() * 15;
  const cornerY = 30 + Math.random() * 12;
  return [...around(cornerX, cornerY, 14), ...around(cornerX + 32, cornerY + 26, 14)];
}

// One colour per group, in the order the fit numbers them, and a grey for a
// person in no group at all.
export const GROUP_COLOURS = ["#6366f1", "#f59e0b", "#10b981", "#f43f5e", "#0ea5e9", "#8b5cf6"];
export const NO_GROUP = "#94a3b8";

export function groupColour(label: number | undefined): string {
  if (label === undefined || label < 0) return NO_GROUP;
  return GROUP_COLOURS[label % GROUP_COLOURS.length];
}
