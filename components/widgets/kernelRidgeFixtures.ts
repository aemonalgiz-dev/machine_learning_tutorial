// The people and the throws every kernel-ridge widget shares.
//
// The three people are placed one centimetre apart with weights six kilograms
// apart, so that centred they are minus one, nought and one against minus
// six, nought and six, and every number the page works by hand comes out
// whole: a ridge slope of four, dual weights of minus two, nought and two.
// The crowd is the line page's fifteen people, heights three centimetres
// apart along a line with a wobble, which is where a radial kernel meets
// units it was not tuned for. The throw is the polynomial page's fifteen
// noisy measurements of a thrown ball, the running example every regression
// page fits, and the ideal case is the same throw measured almost cleanly.

import { Point } from "@/lib/api";
import { IDEAL_THROW, NOISY_THROW, randomThrow } from "./gradientBoostingFixtures";

export { IDEAL_THROW, NOISY_THROW, randomThrow };

export const THREE_PEOPLE: Point[] = [
  { x: 169, y: 64 },
  { x: 170, y: 70 },
  { x: 171, y: 76 },
];

export const CROWD: Point[] = [
  { x: 152, y: 51 },
  { x: 155, y: 61 },
  { x: 158, y: 56 },
  { x: 161, y: 66 },
  { x: 164, y: 62 },
  { x: 167, y: 71 },
  { x: 170, y: 66 },
  { x: 173, y: 76 },
  { x: 176, y: 71 },
  { x: 179, y: 81 },
  { x: 182, y: 75 },
  { x: 185, y: 86 },
  { x: 188, y: 81 },
  { x: 191, y: 91 },
  { x: 194, y: 86 },
];

export type DatasetName = "three" | "crowd" | "throw" | "ideal" | "random";

export const DATASET_LABELS: Record<DatasetName, string> = {
  three: "Three people",
  crowd: "The crowd",
  throw: "The thrown ball",
  ideal: "An Ideal Case",
  random: "A random throw",
};

// Which x each dataset is asked about by default, and what its axes are
// called, since the throw is height against time and the crowd is weight
// against height.
export const DATASET_QUERY: Record<Exclude<DatasetName, "random">, number> = {
  three: 170.5,
  crowd: 175,
  throw: 2.0,
  ideal: 2.0,
};

export function axisLabels(dataset: DatasetName): { x: string; y: string } {
  return dataset === "three" || dataset === "crowd"
    ? { x: "height, cm", y: "weight, kg" }
    : { x: "time, s", y: "height, m" };
}

export function pointsFor(dataset: DatasetName): Point[] {
  switch (dataset) {
    case "three":
      return THREE_PEOPLE;
    case "crowd":
      return CROWD;
    case "throw":
      return NOISY_THROW;
    case "ideal":
      return IDEAL_THROW;
    case "random":
      return randomThrow();
  }
}

export const KERNEL_COLOUR = "#6366f1";
export const RIDGE_COLOUR = "#94a3b8";
export const MEAN_COLOUR = "#f59e0b";
export const WRONG_COLOUR = "#f43f5e";
export const SECOND_COLOUR = "#10b981";

export const BUTTON_CLASS =
  "rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700";

export const ACTIVE_CLASS =
  "rounded-md border border-indigo-400 bg-indigo-50 px-3 py-1.5 text-sm font-medium text-indigo-700 dark:border-indigo-600 dark:bg-indigo-950 dark:text-indigo-300";

export interface Bounds {
  xMin: number;
  xMax: number;
  yMin: number;
  yMax: number;
}

// The drawn window covers the points and every curve handed in, with a
// little room, so a radial curve drifting back to the mean past the data
// stays visible and a polynomial running away is at least seen leaving.
export function boundsOf(points: Point[], curves: Point[][], yCap?: number): Bounds {
  const xs = points.map((point) => point.x);
  const ys = points.map((point) => point.y);
  for (const curve of curves) {
    for (const sample of curve) {
      xs.push(sample.x);
      if (yCap === undefined || Math.abs(sample.y) <= yCap) ys.push(sample.y);
    }
  }
  const xMin = Math.min(...xs);
  const xMax = Math.max(...xs);
  const yMin = Math.min(...ys);
  const yMax = Math.max(...ys);
  const yPad = 0.08 * (yMax - yMin || 1);
  return { xMin, xMax, yMin: yMin - yPad, yMax: yMax + yPad };
}

export interface Frame {
  width: number;
  height: number;
  left: number;
  right: number;
  top: number;
  bottom: number;
}

export function scalesOf(bounds: Bounds, frame: Frame) {
  const plotWidth = frame.width - frame.left - frame.right;
  const plotHeight = frame.height - frame.top - frame.bottom;
  const spanX = bounds.xMax - bounds.xMin || 1;
  const spanY = bounds.yMax - bounds.yMin || 1;
  const plotX = (value: number) => frame.left + ((value - bounds.xMin) / spanX) * plotWidth;
  const plotY = (value: number) => frame.top + (1 - (value - bounds.yMin) / spanY) * plotHeight;
  const pathOf = (samples: Point[]) =>
    samples.map((sample, index) => `${index === 0 ? "M" : "L"}${plotX(sample.x).toFixed(1)},${plotY(sample.y).toFixed(1)}`).join(" ");
  return { plotX, plotY, pathOf, plotWidth, plotHeight };
}

// A score far below zero is a ruin, and decimals on a ruin are noise.
export function formatScore(value: number | null, digits = 3): string {
  if (value === null) return "…";
  if (value < -10) return value.toFixed(0);
  return value.toFixed(digits);
}

// Penalties and gammas are chosen on a log slider, and shown to three
// figures, since 0.001 and 0.000316 both matter and neither fits toFixed.
export function formatSmall(value: number): string {
  return value >= 100 ? value.toFixed(0) : value.toPrecision(3);
}
