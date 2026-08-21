// The kernel-ridge page's endpoints: one set of points fitted through a
// kernel with plain ridge regression beside it and every intermediate the
// page reads, the Gram matrix laid out on its own, one kernel refitted at a
// ladder of penalties, the linear-kernel control fitted two right ways and
// the one recorded wrong way, and the two fits timed as the data grows.

import { ApiError, Point, getJson, postJson } from "@/lib/api";

export { ApiError };

export type KernelRidgePoint = Point;

export interface LinearKernelChoice {
  name: "linear";
}

export interface PolynomialKernelChoice {
  name: "polynomial";
  degree: number;
}

export interface RadialKernelChoice {
  name: "rbf";
  gamma: number;
}

export interface SigmoidKernelChoice {
  name: "sigmoid";
  gamma: number;
  constant: number;
}

export type KernelChoice =
  | LinearKernelChoice
  | PolynomialKernelChoice
  | RadialKernelChoice
  | SigmoidKernelChoice;

export type KernelName = KernelChoice["name"];

// What one fit hands back. The dual weights arrive one per point in the
// order the points were sent, beside each row's residual divided by the
// penalty, which the dual's optimality condition says is the same number;
// dual_residual_gap is the largest difference between the two columns.
// implied_slope is only ever a number under the linear kernel, where a
// slope exists to report. The Gram eigenvalues describe the matrix before
// the penalty is added and condition_number the system after.
export interface KernelRidgeFit {
  curve: Point[];
  ridge_curve: Point[];
  dual_weights: number[];
  fitted: number[];
  residuals: number[];
  residuals_over_penalty: number[];
  dual_residual_gap: number;
  max_abs_dual_weight: number;
  feature_mean: number;
  target_mean: number;
  implied_slope: number | null;
  ridge_slope: number;
  ridge_intercept: number;
  r_squared: number;
  ridge_r_squared: number;
  largest_gap: number;
  prediction_at_query: number;
  ridge_at_query: number;
  n_training_rows: number;
  gram_smallest_eigenvalue: number;
  gram_largest_eigenvalue: number;
  condition_number: number;
}

export interface CurveRange {
  from: number;
  to: number;
}

export async function fitKernelRidge(
  points: Point[],
  kernel: KernelChoice,
  penalty: number,
  queryX: number,
  range?: CurveRange,
): Promise<KernelRidgeFit> {
  return postJson<KernelRidgeFit>("/concepts/kernel-ridge/fit", {
    points,
    kernel,
    penalty,
    query_x: queryX,
    ...(range ? { curve_from: range.from, curve_to: range.to } : {}),
  });
}

// The one table the model reads, on the centred rows. eigenvalues are
// ascending, so the first is the smallest, and zero_eigenvalues counts how
// many are zero to within rounding.
export interface GramMatrix {
  centred_x: number[];
  matrix: number[][];
  eigenvalues: number[];
  zero_eigenvalues: number;
  symmetric: boolean;
}

export async function fetchGram(points: Point[], kernel: KernelChoice): Promise<GramMatrix> {
  return postJson<GramMatrix>("/concepts/kernel-ridge/gram", { points, kernel });
}

export interface PenaltyStep {
  penalty: number;
  r_squared: number;
  max_abs_dual_weight: number;
  condition_number: number;
  rows_passed_through: number;
  farthest_from_mean: number;
  curve: Point[];
}

export interface PenaltySweep {
  target_mean: number;
  steps: PenaltyStep[];
}

export async function sweepPenalties(
  points: Point[],
  kernel: KernelChoice,
  penalties: number[],
): Promise<PenaltySweep> {
  return postJson<PenaltySweep>("/concepts/kernel-ridge/penalty-sweep", {
    points,
    kernel,
    penalties,
  });
}

export interface ControlLine {
  slope: number;
  intercept: number;
  at_mean: number;
  curve: Point[];
}

// Three lines through one set of points. ridge and kernel_ridge are the two
// correct fits and coincide; target_only centred the target and not the
// inputs, and misses the mean point.
export interface CentringControl {
  mean: Point;
  ridge: ControlLine;
  kernel_ridge: ControlLine;
  target_only: ControlLine;
}

export async function fitCentringControl(points: Point[], penalty: number): Promise<CentringControl> {
  return postJson<CentringControl>("/concepts/kernel-ridge/centring", { points, penalty });
}

// One size, timed. Milliseconds, the median of the repeats, including the
// library's own boundary checks. kernel_model_numbers is how many numbers
// the fitted kernel model keeps, ridge_model_numbers how many ridge keeps.
export interface CostPoint {
  rows: number;
  features: number;
  kernel_fit_ms: number;
  ridge_fit_ms: number;
  kernel_predict_ms: number;
  ridge_predict_ms: number;
  kernel_model_numbers: number;
  ridge_model_numbers: number;
}

export interface CostSweep {
  repeats: number;
  queries: number;
  by_rows: CostPoint[];
  by_features: CostPoint[];
}

// The timing runs once per API process and is the same answer for every
// reader, so one page-load asks once.
let costPromise: Promise<CostSweep> | null = null;

export function fetchCost(): Promise<CostSweep> {
  if (!costPromise) {
    costPromise = getJson<CostSweep>("/concepts/kernel-ridge/cost").catch((error) => {
      costPromise = null;
      throw error;
    });
  }
  return costPromise;
}
