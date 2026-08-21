// The crowds the judging-a-classifier page's widgets share.
//
// The twelve are the classifier pages' people, six children and six adults
// measured by height and weight, with one child built like an adult and one
// adult built like a child, so that a boundary drawn from the two measurements
// fills all four cells of the table. The rare crowd is thirty people of whom
// four are adults, two of them child-sized, which is where accuracy alone
// misleads. The ideal case is nineteen people who separate cleanly but for
// one pair. The three-class crowd is the multiclass page's thirteen with three
// people added who confuse the classes with one another.

import { LabelledPoint } from "@/lib/api";

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

export const RARE_CROWD: LabelledPoint[] = [
  { x: 110, y: 20, label: 0 },
  { x: 113, y: 21, label: 0 },
  { x: 115, y: 22, label: 0 },
  { x: 118, y: 24, label: 0 },
  { x: 120, y: 25, label: 0 },
  { x: 121, y: 27, label: 0 },
  { x: 122, y: 28, label: 0 },
  { x: 124, y: 29, label: 0 },
  { x: 125, y: 31, label: 0 },
  { x: 127, y: 32, label: 0 },
  { x: 128, y: 34, label: 0 },
  { x: 130, y: 35, label: 0 },
  { x: 131, y: 37, label: 0 },
  { x: 133, y: 38, label: 0 },
  { x: 134, y: 40, label: 0 },
  { x: 136, y: 41, label: 0 },
  { x: 137, y: 42, label: 0 },
  { x: 139, y: 44, label: 0 },
  { x: 140, y: 45, label: 0 },
  { x: 142, y: 46, label: 0 },
  { x: 144, y: 47, label: 0 },
  { x: 145, y: 48, label: 0 },
  { x: 147, y: 49, label: 0 },
  { x: 149, y: 51, label: 0 },
  { x: 152, y: 52, label: 0 },
  { x: 155, y: 54, label: 0 },
  { x: 150, y: 50, label: 1 },
  { x: 156, y: 53, label: 1 },
  { x: 178, y: 78, label: 1 },
  { x: 183, y: 83, label: 1 },
];

export const IDEAL_CROWD: LabelledPoint[] = [
  { x: 112, y: 21, label: 0 },
  { x: 116, y: 23, label: 0 },
  { x: 119, y: 25, label: 0 },
  { x: 123, y: 28, label: 0 },
  { x: 126, y: 30, label: 0 },
  { x: 129, y: 33, label: 0 },
  { x: 133, y: 36, label: 0 },
  { x: 137, y: 40, label: 0 },
  { x: 142, y: 44, label: 0 },
  { x: 150, y: 49, label: 0 },
  { x: 158, y: 56, label: 1 },
  { x: 163, y: 61, label: 1 },
  { x: 167, y: 66, label: 1 },
  { x: 171, y: 70, label: 1 },
  { x: 175, y: 74, label: 1 },
  { x: 179, y: 78, label: 1 },
  { x: 183, y: 82, label: 1 },
  { x: 187, y: 85, label: 1 },
  { x: 147, y: 46, label: 1 },
];

// One person, their two measurements, and which of three classes they are.
export interface ClassedPoint {
  x: number;
  y: number;
  label: number;
}

export const CLASS_NAMES = ["child", "teenager", "adult"];

export const THREE_CLASS_CROWD: ClassedPoint[] = [
  { x: 118, y: 24, label: 0 },
  { x: 120, y: 25, label: 0 },
  { x: 122, y: 28, label: 0 },
  { x: 125, y: 31, label: 0 },
  { x: 145, y: 57, label: 1 },
  { x: 147, y: 41, label: 1 },
  { x: 156, y: 53, label: 1 },
  { x: 159, y: 57, label: 1 },
  { x: 162, y: 61, label: 1 },
  { x: 178, y: 78, label: 2 },
  { x: 180, y: 80, label: 2 },
  { x: 183, y: 83, label: 2 },
  { x: 186, y: 77, label: 2 },
  { x: 172, y: 70, label: 1 },
  { x: 160, y: 58, label: 2 },
  { x: 141, y: 40, label: 0 },
];

// A fresh crowd of twenty, children around 125 centimetres and 30
// kilograms and adults around 172 and 72, spread widely enough that the
// two groups can overlap.
export function randomCrowd(): LabelledPoint[] {
  const around = (
    centreX: number,
    centreY: number,
    label: number,
    count: number,
  ): LabelledPoint[] =>
    Array.from({ length: count }, () => {
      const stretch = (Math.random() + Math.random() + Math.random() - 1.5) / 1.5;
      const wobble = (Math.random() - 0.5) * 8;
      return {
        x: Math.round(centreX + stretch * 22),
        y: Math.round(centreY + stretch * 22 + wobble),
        label,
      };
    });
  return [...around(125, 30, 0, 10), ...around(172, 72, 1, 10)];
}

// The window every scatter on the page draws inside.
export const DOMAIN = { xMin: 105, xMax: 195, yMin: 15, yMax: 95 };

export const INDIGO = "#6366f1";
export const AMBER = "#f59e0b";
export const EMERALD = "#10b981";
export const ROSE = "#f43f5e";

export type Cell = "truePositive" | "trueNegative" | "falsePositive" | "falseNegative";

export const CELL_COLOUR: Record<Cell, string> = {
  truePositive: INDIGO,
  trueNegative: EMERALD,
  falsePositive: AMBER,
  falseNegative: ROSE,
};

export const CELL_TITLE: Record<Cell, string> = {
  truePositive: "called adult, is adult",
  trueNegative: "called child, is child",
  falsePositive: "called adult, is child",
  falseNegative: "called child, is adult",
};

export function cellOf(label: number, prediction: number): Cell {
  if (label === 1) return prediction === 1 ? "truePositive" : "falseNegative";
  return prediction === 1 ? "falsePositive" : "trueNegative";
}

export function rate(value: number | null, digits = 4): string {
  return value === null ? "undefined" : value.toFixed(digits);
}

export const BUTTON_CLASS =
  "rounded px-2 py-0.5 text-xs font-medium transition";

export function buttonClass(active: boolean): string {
  return (
    BUTTON_CLASS +
    " " +
    (active
      ? "bg-indigo-600 text-white"
      : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800")
  );
}
