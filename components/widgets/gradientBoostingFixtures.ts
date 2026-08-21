// The throws the gradient boosting page's widgets share.
//
// The full throw is the polynomial page's fifteen noisy measurements of a
// thrown ball, height against time, the running example every regression
// page fits. The three readings are the pencil set the page works two rounds
// on by hand. The ideal case is the same throw measured almost cleanly, so a
// hundred rounds of stumps trace it to three nines. The sixty measurements
// are the same throw taken more often, which the rate, depth and stopping
// sections read their held-out curves off, since fifteen points hold out
// only four and two of those fall before the first training time.

import { Point } from "@/lib/api";
import { NOISY_THROW } from "./heldOutEvaluationFixtures";

export { NOISY_THROW };

export const THREE_READINGS: Point[] = [
  { x: 1, y: 2 },
  { x: 2, y: 6 },
  { x: 3, y: 10 },
];

export const IDEAL_THROW: Point[] = [
  { x: 0.0, y: 0.3 },
  { x: 0.29, y: 5.2 },
  { x: 0.57, y: 10.2 },
  { x: 0.86, y: 13.3 },
  { x: 1.14, y: 16.6 },
  { x: 1.43, y: 18.2 },
  { x: 1.71, y: 20.0 },
  { x: 2.0, y: 20.7 },
  { x: 2.29, y: 19.9 },
  { x: 2.57, y: 19.4 },
  { x: 2.86, y: 17.0 },
  { x: 3.14, y: 14.2 },
  { x: 3.43, y: 11.2 },
  { x: 3.71, y: 6.4 },
  { x: 4.0, y: 1.9 },
];

export const SIXTY_THROW: Point[] = [
  { x: 0.11, y: 1.7 },
  { x: 0.16, y: 3.2 },
  { x: 0.25, y: 5.1 },
  { x: 0.33, y: 4.6 },
  { x: 0.46, y: 6.5 },
  { x: 0.54, y: 9.7 },
  { x: 0.58, y: 9.3 },
  { x: 0.59, y: 10.4 },
  { x: 0.64, y: 11.9 },
  { x: 0.77, y: 10.0 },
  { x: 0.77, y: 12.9 },
  { x: 0.81, y: 14.8 },
  { x: 1.04, y: 15.1 },
  { x: 1.05, y: 14.4 },
  { x: 1.11, y: 17.3 },
  { x: 1.12, y: 16.6 },
  { x: 1.21, y: 18.4 },
  { x: 1.25, y: 16.8 },
  { x: 1.32, y: 15.6 },
  { x: 1.61, y: 19.3 },
  { x: 1.64, y: 19.0 },
  { x: 1.69, y: 21.0 },
  { x: 1.81, y: 20.4 },
  { x: 1.84, y: 17.8 },
  { x: 1.89, y: 18.5 },
  { x: 1.94, y: 21.7 },
  { x: 2.04, y: 21.4 },
  { x: 2.04, y: 19.4 },
  { x: 2.05, y: 20.4 },
  { x: 2.06, y: 21.1 },
  { x: 2.11, y: 21.1 },
  { x: 2.15, y: 21.7 },
  { x: 2.16, y: 20.7 },
  { x: 2.2, y: 20.1 },
  { x: 2.37, y: 19.5 },
  { x: 2.45, y: 21.2 },
  { x: 2.49, y: 16.0 },
  { x: 2.57, y: 18.8 },
  { x: 2.73, y: 18.1 },
  { x: 2.9, y: 14.7 },
  { x: 3.0, y: 16.4 },
  { x: 3.01, y: 14.8 },
  { x: 3.01, y: 17.1 },
  { x: 3.11, y: 14.6 },
  { x: 3.15, y: 15.4 },
  { x: 3.15, y: 16.2 },
  { x: 3.21, y: 14.3 },
  { x: 3.28, y: 11.6 },
  { x: 3.31, y: 10.2 },
  { x: 3.36, y: 14.5 },
  { x: 3.41, y: 11.1 },
  { x: 3.42, y: 10.1 },
  { x: 3.45, y: 10.9 },
  { x: 3.51, y: 9.5 },
  { x: 3.67, y: 8.7 },
  { x: 3.79, y: 5.5 },
  { x: 3.8, y: 5.3 },
  { x: 3.85, y: 3.3 },
  { x: 3.88, y: 4.5 },
  { x: 3.92, y: 1.6 },
];

// The window every throw is drawn in, height against time.
export const THROW_DOMAIN = { xMin: 0, xMax: 4, yMin: -2, yMax: 26 };

// A fresh throw with the same physics and a launch speed drawn at random,
// fifteen readings across the four seconds with measurement noise on each.
export function randomThrow(): Point[] {
  const launch = 17 + Math.random() * 5;
  return Array.from({ length: 15 }, (_, index) => {
    const time = Math.round(((index * 4) / 14) * 100) / 100;
    const noise = (Math.random() - 0.5) * 9;
    const height = Math.max(
      THROW_DOMAIN.yMin,
      Math.min(THROW_DOMAIN.yMax, launch * time - 4.9 * time * time + noise),
    );
    return { x: time, y: Math.round(height * 10) / 10 };
  });
}

// One colour per committee or configuration, kept apart on the hue circle.
export const BOOSTING_COLOUR = "#6366f1";
export const BAGGING_COLOUR = "#10b981";
export const STUMPS_COLOUR = "#f59e0b";
export const SERIES_COLOURS = ["#6366f1", "#10b981", "#f59e0b", "#ef4444", "#0ea5e9", "#a855f7"];
