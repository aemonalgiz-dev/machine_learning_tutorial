// The people every widget on the Hebbian page shares.
//
// The measured four are the PCA page's own, placed so the mean is (170, 68)
// and the deviations are exactly ten and five, and every one of them lies on
// one of the two eigen directions, which is why the rule's fixed point is
// exact on them. The crowd is the classification pages' crowd with its labels
// stripped. The ideal case hugs one diagonal so the second direction carries
// almost nothing. The circle is eight people evenly round the mean, so the two
// eigenvalues tie and no direction is the answer.

import { Point } from "@/lib/api";

export const WORKED_PEOPLE: Point[] = [
  { x: 180, y: 78 },
  { x: 160, y: 58 },
  { x: 175, y: 63 },
  { x: 165, y: 73 },
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
  { x: 152, y: 51 },
  { x: 155, y: 52 },
  { x: 158, y: 56.5 },
  { x: 161, y: 58.5 },
  { x: 164, y: 62 },
  { x: 167, y: 66 },
  { x: 170, y: 67 },
  { x: 173, y: 71.5 },
  { x: 176, y: 73.5 },
  { x: 179, y: 77 },
  { x: 182, y: 81 },
  { x: 185, y: 82 },
  { x: 188, y: 86.5 },
  { x: 191, y: 88.5 },
  { x: 194, y: 92 },
];

export const CIRCLE: Point[] = [
  { x: 180.0, y: 68.0 },
  { x: 177.0711, y: 75.0711 },
  { x: 170.0, y: 78.0 },
  { x: 162.9289, y: 75.0711 },
  { x: 160.0, y: 68.0 },
  { x: 162.9289, y: 60.9289 },
  { x: 170.0, y: 58.0 },
  { x: 177.0711, y: 60.9289 },
];

export type PeopleKey = "four" | "crowd" | "ideal" | "circle";

export const PEOPLE: Record<PeopleKey, Point[]> = {
  four: WORKED_PEOPLE,
  crowd: CROWD,
  ideal: IDEAL_CASE,
  circle: CIRCLE,
};

export const PEOPLE_LABEL: Record<PeopleKey, string> = {
  four: "the measured four",
  crowd: "the crowd",
  ideal: "an ideal case",
  circle: "the circle",
};

export const FIRST = "#6366f1";
export const SECOND = "#f59e0b";
export const RULE = "#10b981";
export const TROUBLE = "#f43f5e";
