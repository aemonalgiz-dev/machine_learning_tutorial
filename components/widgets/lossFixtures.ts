// The people every loss-functions widget shares.
//
// The measured four are the PCA page's four, placed so their mean is
// (170, 68) and a line of slope 0.6 through that point misses them by minus
// four, four, eight and minus eight kilograms, which is the batch the page
// works by hand. The ideal fifteen are the line page's ideal case, fifteen
// people lying close to one line, and the mistyped person is one of them
// with 72.5 kilograms entered as 27.5. The scored crowd is sixteen people
// whose adult-or-child label a stated rule on height gets entirely right.

import { Point } from "@/lib/api";
import { YesOrNo } from "@/lib/concepts/loss-functions";

export const MEASURED_FOUR: Point[] = [
  { x: 180, y: 78 },
  { x: 160, y: 58 },
  { x: 175, y: 63 },
  { x: 165, y: 73 },
];

// The line the page works the measured four under: through the mean point
// (170, 68) with slope 0.6, so weight = 0.6 * height − 34.
export const WORKED_SLOPE = 0.6;
export const WORKED_INTERCEPT = 68 - WORKED_SLOPE * 170;

// The knee the page's batches use, in kilograms.
export const WORKED_KNEE = 5;

export const IDEAL_FIFTEEN: Point[] = [
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

// The ninth of the ideal fifteen with their weight's digits swapped.
export const MISTYPED_PERSON: Point = { x: 176, y: 27.5 };

export function randomPeople(): Point[] {
  const slope = 0.35 + Math.random() * 0.55;
  const intercept = -40 + (Math.random() - 0.5) * 12;
  return Array.from({ length: 15 }, (_, index) => {
    const x = 152 + index * 3;
    const noise = (Math.random() - 0.5) * 20;
    const y = Math.min(100, Math.max(40, slope * x + intercept + noise));
    return { x, y: Math.round(y * 10) / 10 };
  });
}

export interface ScoredPerson {
  height: number;
  label: YesOrNo;
}

// Sixteen people, children below 152 centimetres and adults above, scored
// by the rule score = (height − 152) / 5, which calls every one correctly.
export const SCORED_CROWD: ScoredPerson[] = [
  { height: 112, label: 0 },
  { height: 118, label: 0 },
  { height: 124, label: 0 },
  { height: 130, label: 0 },
  { height: 135, label: 0 },
  { height: 140, label: 0 },
  { height: 144, label: 0 },
  { height: 148, label: 0 },
  { height: 156, label: 1 },
  { height: 160, label: 1 },
  { height: 165, label: 1 },
  { height: 170, label: 1 },
  { height: 174, label: 1 },
  { height: 178, label: 1 },
  { height: 183, label: 1 },
  { height: 188, label: 1 },
];

export const SCORE_BOUNDARY = 152;
export const SCORE_SCALE = 5;

// The adult the page mislabels, 178 centimetres, the fourteenth person.
export const MISLABELLED_INDEX = 13;

export function scoreOf(height: number, scale: number = SCORE_SCALE): number {
  return (height - SCORE_BOUNDARY) / scale;
}

export const INDIGO = "#6366f1";
export const AMBER = "#f59e0b";
export const GREEN = "#10b981";
export const ROSE = "#f43f5e";
export const SKY = "#0ea5e9";
export const SLATE = "#64748b";

// Four decimals at most, whole numbers shown whole, and a proper minus sign.
export function show(value: number | undefined | null, digits = 4): string {
  if (value === undefined || value === null) return "…";
  const rounded = Number(value.toFixed(digits));
  const text = Number.isInteger(rounded)
    ? String(rounded)
    : rounded.toFixed(digits).replace(/0+$/, "");
  return text.replace("-", "−");
}
