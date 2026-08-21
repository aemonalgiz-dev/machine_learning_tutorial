// The two crowds the held-out evaluation page's widgets share.
//
// The throw is the polynomial page's fifteen noisy measurements of a thrown
// ball, height against time, which every regression widget on the page
// splits, folds and scores. The overlapping crowd is the twelve people the
// classifier pages judge, six children and six adults measured by height and
// weight, which the classifier folding widget deals plain and stratified.

import { LabelledPoint, Point } from "@/lib/api";

export const NOISY_THROW: Point[] = [
  { x: 0.0, y: 0.7 },
  { x: 0.29, y: 5.2 },
  { x: 0.57, y: 9.5 },
  { x: 0.86, y: 13.0 },
  { x: 1.14, y: 16.9 },
  { x: 1.43, y: 18.1 },
  { x: 1.71, y: 19.4 },
  { x: 2.0, y: 21.0 },
  { x: 2.29, y: 19.6 },
  { x: 2.57, y: 19.1 },
  { x: 2.86, y: 16.8 },
  { x: 3.14, y: 13.6 },
  { x: 3.43, y: 11.1 },
  { x: 3.71, y: 6.2 },
  { x: 4.0, y: 1.2 },
];

export const OVERLAPPING_CROWD: LabelledPoint[] = [
  { x: 118, y: 24, label: 0 },
  { x: 120, y: 25, label: 0 },
  { x: 122, y: 28, label: 0 },
  { x: 125, y: 31, label: 0 },
  { x: 140, y: 45, label: 0 },
  { x: 168, y: 66, label: 0 },
  { x: 150, y: 50, label: 1 },
  { x: 159, y: 57, label: 1 },
  { x: 162, y: 61, label: 1 },
  { x: 178, y: 78, label: 1 },
  { x: 180, y: 80, label: 1 },
  { x: 183, y: 83, label: 1 },
];

// The seed the page's fixed deal uses, shared by every widget that deals.
export const PAGE_SEED = 4;

// One colour per fold, spaced round the hue circle so fifteen stay apart.
export function foldColour(fold: number, foldCount: number): string {
  return `hsl(${Math.round((fold * 360) / foldCount)}, 62%, 48%)`;
}

// Scores plunge far below zero at a wild degree, where three decimals would
// only be noise on a ruin.
export function formatScore(value: number | null, digits = 3): string {
  if (value === null) return "undefined";
  if (value < -10) return value.toFixed(0);
  return value.toFixed(digits);
}
