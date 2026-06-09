// The people every PCA widget on the page shares.
//
// The measured four are placed so every number the page works by hand comes
// out clean, mean (170, 68) and deviations of exactly ten and five. The
// crowd is the classification pages' crowd with its labels stripped away,
// which is what an unsupervised method sees. The arc is a curve no straight
// axis follows, and the split crowd is two groups that differ along the
// short direction of their cloud rather than the long one.

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

// One person far from everyone, to be switched on and off.
export const OUTLIER: Point = { x: 195, y: 30 };

// Twelve people along a bend, so their one-dimensional pattern is a curve.
export const ARC: Point[] = [
  { x: 120, y: 80 },
  { x: 128, y: 62 },
  { x: 136, y: 49 },
  { x: 144, y: 40 },
  { x: 152, y: 35 },
  { x: 160, y: 33 },
  { x: 168, y: 35 },
  { x: 176, y: 40 },
  { x: 184, y: 49 },
  { x: 192, y: 62 },
  { x: 200, y: 80 },
  { x: 156, y: 33 },
];

// Two groups whose difference runs across the cloud's short axis. Most of
// the spread is along height; what separates the groups is weight for a
// given height.
export const SPLIT_CROWD: { point: Point; group: number }[] = [
  { point: { x: 130, y: 36 }, group: 0 },
  { point: { x: 140, y: 42 }, group: 0 },
  { point: { x: 150, y: 48 }, group: 0 },
  { point: { x: 160, y: 54 }, group: 0 },
  { point: { x: 170, y: 60 }, group: 0 },
  { point: { x: 180, y: 66 }, group: 0 },
  { point: { x: 190, y: 72 }, group: 0 },
  { point: { x: 135, y: 46 }, group: 1 },
  { point: { x: 145, y: 52 }, group: 1 },
  { point: { x: 155, y: 58 }, group: 1 },
  { point: { x: 165, y: 64 }, group: 1 },
  { point: { x: 175, y: 70 }, group: 1 },
  { point: { x: 185, y: 76 }, group: 1 },
  { point: { x: 195, y: 82 }, group: 1 },
];

export const FIRST = "#6366f1";
export const SECOND = "#f59e0b";
export const KEPT = "#10b981";
export const LOST = "#f43f5e";
