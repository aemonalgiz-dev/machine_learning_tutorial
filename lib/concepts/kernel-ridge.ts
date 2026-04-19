// The kernel-ridge page's endpoints: one set of points fitted through a
// kernel with plain ridge regression beside it, and the linear-kernel control
// fitted two right ways and the one recorded wrong way.

import { ApiError, postJson } from "@/lib/api";

export { ApiError };

export interface KernelRidgePoint {
  x: number;
  y: number;
}

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
// order the points were sent, and implied_slope is only ever a number under
// the linear kernel, where a slope exists to report.
export interface KernelRidgeFit {
  curve: KernelRidgePoint[];
  ridge_curve: KernelRidgePoint[];
  dual_weights: number[];
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
}

export interface ControlLine {
  slope: number;
  intercept: number;
  at_mean: number;
  curve: KernelRidgePoint[];
}

// Three lines through one set of points. ridge and kernel_ridge are the two
// correct fits and coincide; target_only centred the target and not the
// inputs, and misses the mean point.
export interface CentringControl {
  mean: KernelRidgePoint;
  ridge: ControlLine;
  kernel_ridge: ControlLine;
  target_only: ControlLine;
}

export async function fitKernelRidge(
  points: KernelRidgePoint[],
  kernel: KernelChoice,
  penalty: number,
  queryX: number,
): Promise<KernelRidgeFit> {
  return postJson<KernelRidgeFit>("/concepts/kernel-ridge/fit", {
    points,
    kernel,
    penalty,
    query_x: queryX,
  });
}

export async function fitCentringControl(
  points: KernelRidgePoint[],
  penalty: number,
): Promise<CentringControl> {
  return postJson<CentringControl>("/concepts/kernel-ridge/centring", {
    points,
    penalty,
  });
}
