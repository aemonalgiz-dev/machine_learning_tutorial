// The kernel-pca page's endpoint: a cloud decomposed through a kernel, with
// ordinary PCA's answer on the same cloud beside it for contrast.

import { Point, postJson } from "@/lib/api";

export { ApiError } from "@/lib/api";
export type { Point } from "@/lib/api";

export type KernelName = "linear" | "polynomial" | "rbf";

export interface KernelComponentDocument {
  name: string;
  raw_eigenvalue: number;
  variance: number;
  share: number;
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

export async function analyzeThroughKernel(
  points: Point[],
  kernel: KernelName,
  gamma: number,
): Promise<KernelPcaAnalysis> {
  return postJson<KernelPcaAnalysis>("/concepts/kernel-pca/analyze", {
    points: points.map((point) => ({ x: point.x, y: point.y })),
    kernel,
    gamma,
  });
}
