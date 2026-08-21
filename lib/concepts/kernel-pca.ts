// Client functions for the kernel principal components page.
//
// Every number here is computed by the API. The analyze endpoint is the
// playground's, a cloud decomposed through a kernel with ordinary PCA's
// answer beside it; gram-route is PCA written with inner products, both
// routes on one cloud; lifted is every intermediate of one kernel fit; sweep
// runs the radial reach across a list of gammas; edges runs the failure
// contracts live and reports what came back.

import { Point, getJson, postJson } from "@/lib/api";

export { ApiError } from "@/lib/api";
export type { Point } from "@/lib/api";

export type KernelName = "linear" | "polynomial" | "rbf";

export interface KernelComponentDocument {
  name: string;
  raw_eigenvalue: number;
  variance: number;
  share: number;
  cumulative_share: number;
  row_coefficients: number[];
}

export interface PlaneCoordinates {
  first: number;
  second: number;
}

export interface OrdinaryComponentDocument {
  variance: number;
  share: number;
}

export interface OrdinaryDecomposition {
  components: OrdinaryComponentDocument[];
  coordinates: PlaneCoordinates[];
}

export interface KernelPcaAnalysis {
  n_rows: number;
  total_variance: number;
  components: KernelComponentDocument[];
  coordinates: PlaneCoordinates[];
  first_row_kernel_values: number[];
  ordinary: OrdinaryDecomposition;
}

const plain = (points: Point[]) => points.map((point) => ({ x: point.x, y: point.y }));

export async function analyzeThroughKernel(
  points: Point[],
  kernel: KernelName,
  gamma: number,
): Promise<KernelPcaAnalysis> {
  return postJson<KernelPcaAnalysis>("/concepts/kernel-pca/analyze", {
    points: plain(points),
    kernel,
    gamma,
  });
}

export interface GramRoute {
  n_rows: number;
  divisor: number;
  uncentred_gram: number[][];
  centred_gram: number[][];
  uncentred_top_eigenvalue: number;
  uncentred_top_share: number;
  uncentred_top_eigenvector: number[];
  uncentred_eigenvalues: number[];
  scatter_matrix: number[][];
  scatter_eigenvalues: number[];
  gram_eigenvalues: number[];
  total_variance: number;
  components: KernelComponentDocument[];
  coordinates: PlaneCoordinates[];
  ordinary_variances: number[];
  ordinary_shares: number[];
  ordinary_coordinates: PlaneCoordinates[];
  largest_coordinate_gap: number;
  coefficient_squared_lengths: number[];
  coefficient_dot_products: number[][];
  kernel_metric_products: number[][];
  first_row_centred_against_training: number[];
}

export async function fetchGramRoute(points: Point[]): Promise<GramRoute> {
  return postJson<GramRoute>("/concepts/kernel-pca/gram-route", { points: plain(points) });
}

export interface Lifted {
  n_rows: number;
  divisor: number;
  reach: number;
  uncentred_kernel: number[][];
  centred_kernel: number[][];
  raw_eigenvalues: number[];
  most_negative_eigenvalue: number;
  negative_count: number;
  rank: number;
  total_variance: number;
  components: KernelComponentDocument[];
  coordinates: number[][];
  lifted_squared_deviations: number[];
  kept_squared: number[];
  total_kept_share: number;
  largest_coefficient_dot_product: number;
  largest_kernel_metric_gap: number;
  median_squared_distance: number;
  order_reversals_along_x: number;
  first_axis_gap: number | null;
  ordinary_coordinates: PlaneCoordinates[];
  ordinary_order_reversals_along_x: number;
}

export interface LiftedOptions {
  nComponents?: number;
  innerCount?: number;
}

export async function fetchLifted(
  points: Point[],
  kernel: KernelName,
  gamma: number,
  options: LiftedOptions = {},
): Promise<Lifted> {
  return postJson<Lifted>("/concepts/kernel-pca/lifted", {
    points: plain(points),
    kernel,
    gamma,
    ...(options.nComponents === undefined ? {} : { n_components: options.nComponents }),
    ...(options.innerCount === undefined ? {} : { inner_count: options.innerCount }),
  });
}

export interface SweepEntry {
  gamma: number;
  reach: number;
  first_share: number;
  second_share: number;
  cumulative_two: number;
  total_variance: number;
  rank: number;
  order_reversals_along_x: number;
  first_axis_gap: number | null;
}

export interface Sweep {
  entries: SweepEntry[];
  median_squared_distance: number;
}

export async function fetchSweep(
  points: Point[],
  gammas: number[],
  innerCount?: number,
): Promise<Sweep> {
  return postJson<Sweep>("/concepts/kernel-pca/sweep", {
    points: plain(points),
    gammas,
    ...(innerCount === undefined ? {} : { inner_count: innerCount }),
  });
}

export interface EdgeOutcome {
  edge: string;
  accepted: boolean;
  detail: string;
  figure: number | null;
}

export interface Edges {
  outcomes: EdgeOutcome[];
}

export async function fetchEdges(): Promise<Edges> {
  return getJson<Edges>("/concepts/kernel-pca/edges");
}
