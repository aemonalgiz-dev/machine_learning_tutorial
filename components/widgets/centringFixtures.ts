// The people every centring widget on the page shares.
//
// The crowd is the classification pages' crowd, eleven people by height in
// centimetres and weight in kilograms, five children and six adults, labelled
// here because the angle widget colours them. The measured four are the
// principal component page's four, placed so their mean is (170, 68) and every
// sum the page works by hand comes out whole. The ideal case is sixteen people
// close to one straight line, and a random crowd is drawn fresh on each press.

import { LabelledPoint, Point } from "@/lib/api";

export const CROWD: LabelledPoint[] = [
  { x: 147, y: 41, label: 0 },
  { x: 156, y: 53, label: 1 },
  { x: 145, y: 57, label: 0 },
  { x: 159, y: 57, label: 1 },
  { x: 162, y: 61, label: 1 },
  { x: 120, y: 25, label: 0 },
  { x: 122, y: 28, label: 0 },
  { x: 118, y: 24, label: 0 },
  { x: 180, y: 80, label: 1 },
  { x: 183, y: 83, label: 1 },
  { x: 178, y: 78, label: 1 },
];

export const CROWD_POINTS: Point[] = CROWD.map(({ x, y }) => ({ x, y }));

export const MEASURED_FOUR: Point[] = [
  { x: 180, y: 78 },
  { x: 160, y: 58 },
  { x: 175, y: 63 },
  { x: 165, y: 73 },
];

// Sixteen people four centimetres apart, each within a couple of kilograms of
// one straight line, so a line explains nearly all of their weight.
export const IDEAL_CASE: Point[] = [
  130, 134, 138, 142, 146, 150, 154, 158, 162, 166, 170, 174, 178, 182, 186, 190,
].map((height, index) => ({
  x: height,
  y: [36, 38, 44, 44, 49, 54, 56, 61, 62, 69, 71, 74, 79, 81, 87, 88][index],
}));

export function randomCrowd(): Point[] {
  return Array.from({ length: 16 }, () => {
    const height = Math.round(120 + Math.random() * 70);
    const noise = (Math.random() + Math.random() + Math.random() - 1.5) * 12;
    return { x: height, y: Math.max(20, Math.round(0.9 * height - 82 + noise)) };
  });
}

// Bedtimes as hours after midnight, for the clock in the last part.
export const TWO_BEDTIMES = [23, 1];
export const A_WEEK_OF_BEDTIMES = [22.5, 23, 23.5, 0, 0.5, 1, 23];
export const OPPOSITE_TIMES = [6, 18];

export const CHILD = "#f59e0b";
export const ADULT = "#6366f1";
export const RAW = "#f43f5e";
export const CENTRED = "#10b981";
export const MEAN = "#0ea5e9";
