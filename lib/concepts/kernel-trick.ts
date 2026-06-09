// The kernel-trick page's endpoints: one classifier that reads its data only
// through inner products, fitted under whichever kernel the reader picks,
// with everything the page quotes carried back beside the answer.

import { LabelledPoint, RegionGrid, getJson, postJson } from "@/lib/api";

export { ApiError } from "@/lib/api";
export type { LabelledPoint, RegionGrid } from "@/lib/api";

export type KernelChoice =
  | { name: "linear" }
  | { name: "polynomial"; degree?: number; constant?: number }
  | { name: "rbf"; gamma?: number }
  | { name: "sigmoid"; gamma?: number; constant?: number };

// What one fit of the classifier reports about itself. The decision values
// are signed distances in the implied space's units; the squashed values
// are those through a logistic, and the page says why that is not a
// probability.
export interface FitSummary {
  accuracy: number;
  n_support_vectors: number;
  support_share: number;
  support_positions: number[];
  at_the_cap: number;
  epochs_run: number;
  converged: boolean;
  decision_values: number[];
  squashed: number[];
}

export interface ClassifyAnswer {
  fit: FitSummary;
  regions: RegionGrid;
  kernel_description: string;
  held_out_accuracy: number;
}

export async function classifyClinic(
  points: LabelledPoint[],
  kernel: KernelChoice,
  capacity = 1,
): Promise<ClassifyAnswer> {
  return postJson<ClassifyAnswer>("/concepts/kernel-trick/classify", {
    points,
    kernel,
    capacity,
  });
}

export interface LiftedPoint {
  u: number;
  v: number;
  w: number;
  label: number;
}

export interface ClinicLift {
  points: LiftedPoint[];
  plane: { a: number; b: number; c: number; d: number };
  lifted: FitSummary;
  kernel: FitSummary;
  multiplier_gap: number;
  decision_gap: number;
}

export async function liftClinic(points: LabelledPoint[]): Promise<ClinicLift> {
  return postJson<ClinicLift>("/concepts/kernel-trick/lift", { points });
}

export interface ColumnCount {
  n_features: number;
  degree: number;
  with_lower_terms: number;
  pure: number;
}

export interface IdentityCheck {
  dot_product: number;
  phi_a: number[];
  phi_b: number[];
  lifted_product: number;
  kernel_value: number;
  column_counts: ColumnCount[];
}

export async function checkIdentity(
  a: [number, number],
  b: [number, number],
): Promise<IdentityCheck> {
  return postJson<IdentityCheck>("/concepts/kernel-trick/identity", { a, b });
}

export interface ClinicGram {
  kernel_description: string;
  values: number[][];
  eigenvalues: number[];
  smallest_eigenvalue: number;
  largest_eigenvalue: number;
  n_negative_eigenvalues: number;
  symmetric: boolean;
  ridge_accepts: boolean;
  ridge_refusal: string | null;
  classifier: FitSummary;
}

export async function fetchClinicGram(
  points: LabelledPoint[],
  kernel: KernelChoice,
): Promise<ClinicGram> {
  return postJson<ClinicGram>("/concepts/kernel-trick/gram", { points, kernel });
}

export interface Segment {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export interface MarginFit {
  fit: FitSummary;
  weights: number[];
  offset: number;
  width: number;
  boundary: Segment;
  upper_edge: Segment;
  lower_edge: Segment;
}

export async function fetchMargin(
  points: LabelledPoint[],
  capacity: number,
): Promise<MarginFit> {
  return postJson<MarginFit>("/concepts/kernel-trick/margin", {
    points,
    capacity,
  });
}

export interface SweepEntry {
  value: number;
  fit: FitSummary;
  held_out_accuracy: number;
  regions: RegionGrid;
}

export interface Sweep {
  held_out: LabelledPoint[];
  entries: SweepEntry[];
}

export async function sweepGamma(points: LabelledPoint[]): Promise<Sweep> {
  return postJson<Sweep>("/concepts/kernel-trick/gamma-sweep", { points });
}

export async function sweepCapacity(
  points: LabelledPoint[],
  kernel: KernelChoice,
): Promise<Sweep> {
  return postJson<Sweep>("/concepts/kernel-trick/capacity-sweep", {
    points,
    kernel,
  });
}

export interface RefitResult {
  kept_positions: number[];
  fit: FitSummary;
  regions: RegionGrid;
  gap: number;
}

export interface SupportOnly {
  full: FitSummary;
  full_regions: RegionGrid;
  support_only: RefitResult | null;
  dropped_non_support: RefitResult | null;
  dropped_support: RefitResult | null;
}

export async function refitOnSupport(
  points: LabelledPoint[],
  kernel: KernelChoice,
): Promise<SupportOnly> {
  return postJson<SupportOnly>("/concepts/kernel-trick/support-only", {
    points,
    kernel,
  });
}

export interface InterceptEntry {
  capacity: number;
  crossing: number;
  multipliers: number[];
  epochs_run: number;
}

export interface InterceptCost {
  inputs: number[];
  labels: number[];
  entries: InterceptEntry[];
}

export async function fetchInterceptCost(): Promise<InterceptCost> {
  return getJson<InterceptCost>("/concepts/kernel-trick/intercept-cost");
}

export interface SimilarityCurve {
  label: string;
  values: number[];
}

export interface KernelSimilarity {
  positions: number[];
  reference: number;
  curves: SimilarityCurve[];
}

export async function traceSimilarity(): Promise<KernelSimilarity> {
  return postJson<KernelSimilarity>("/concepts/kernel-trick/similarity-curve", {});
}
