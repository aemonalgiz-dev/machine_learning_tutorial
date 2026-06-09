// What every neuron widget on the page shares.
//
// The two inputs are a person's height and weight in standard units, so the
// window is three deviations each way about the crowd's means. The worked
// neuron has weights (2, -1) and a bias of one half, and the two people it is
// asked about sit one deviation from the mean in each measurement: a tall
// heavy person at (1, 1), whom every bend scores at 1.5, and a short heavy
// person at (-1, 1), whom every bend scores at -2.5, the rectifier's dead
// side. The colours are the classification pages' two, amber for a child and
// indigo for an adult, and the same two for the negative and positive sides
// of a surface.

import {
  ActivationName,
  Lattice,
  PlanePoint,
} from "@/lib/concepts/neurons-and-activations";

export const WINDOW = { low: -3, high: 3 };

// Twenty-five cells across the window, so the lattice steps by a quarter and
// both worked people are cells of it.
export const LATTICE: Lattice = {
  first_input_low: WINDOW.low,
  first_input_high: WINDOW.high,
  second_input_low: WINDOW.low,
  second_input_high: WINDOW.high,
  cells: 25,
};

export const WORKED_WEIGHTS: [number, number] = [2, -1];
export const WORKED_BIAS = 0.5;
export const TALL_HEAVY: PlanePoint = { first_input: 1, second_input: 1 };
export const SHORT_HEAVY: PlanePoint = { first_input: -1, second_input: 1 };

// The sliders' reach, wide enough to hold the fitted neuron's 2.55.
export const PARAMETER_RANGE = { min: -4, max: 4, step: 0.05 };

// The range the API samples every bend over.
export const CURVE_RANGE = { low: -6, high: 6 };

export const ACTIVATION_LABELS: Record<ActivationName, string> = {
  identity: "Identity",
  rectified_linear: "ReLU",
  sigmoid: "Sigmoid",
  hyperbolic_tangent: "tanh",
};

export const ACTIVATION_STROKES: Record<ActivationName, string> = {
  identity: "text-slate-400 dark:text-slate-500",
  rectified_linear: "text-indigo-600 dark:text-indigo-400",
  sigmoid: "text-amber-500",
  hyperbolic_tangent: "text-emerald-600 dark:text-emerald-400",
};

export const ACTIVATION_SWATCHES: Record<ActivationName, string> = {
  identity: "bg-slate-400 dark:bg-slate-500",
  rectified_linear: "bg-indigo-600 dark:bg-indigo-400",
  sigmoid: "bg-amber-500",
  hyperbolic_tangent: "bg-emerald-600 dark:bg-emerald-400",
};

export const CHILD = "#f59e0b";
export const ADULT = "#6366f1";

// Indigo for a positive output, amber for a negative one.
export const POSITIVE_FILL = "rgb(79 70 229)";
export const NEGATIVE_FILL = "rgb(217 119 6)";

export const BUTTON_CLASS =
  "rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700";

export const SELECTED_BUTTON_CLASS =
  "rounded-md border border-indigo-600 bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-indigo-700 dark:border-indigo-500 dark:bg-indigo-500 dark:hover:bg-indigo-400";

// A number with the real minus sign, which is what the page's prose uses.
export function signed(value: number, decimals: number): string {
  return (value < 0 ? "−" : "") + Math.abs(value).toFixed(decimals);
}

// Where a standardised measurement sits along one side of a panel, given the
// panel's plot rectangle.
export function planeX(
  value: number,
  plot: { left: number; width: number },
): number {
  return (
    plot.left + ((value - WINDOW.low) / (WINDOW.high - WINDOW.low)) * plot.width
  );
}

export function planeY(
  value: number,
  plot: { top: number; height: number },
): number {
  return (
    plot.top +
    (1 - (value - WINDOW.low) / (WINDOW.high - WINDOW.low)) * plot.height
  );
}

// Where the lattice's index-th cell sits along one side of the window.
export function latticeValue(index: number, cells: number): number {
  return WINDOW.low + (index / (cells - 1)) * (WINDOW.high - WINDOW.low);
}
