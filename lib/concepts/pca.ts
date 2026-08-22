// Client functions for the principal component analysis page.
//
// Every number here is computed by the API. The direction endpoint projects
// the cloud onto an arbitrary direction the reader chose, which is the
// arithmetic the fitted components are the best case of; the analysis,
// scaling, regression and body-measurement endpoints are the library's own
// fits, read out in the shapes the widgets draw.

import { Point, postJson, getJson } from "@/lib/api";

export interface ProjectedRow {
  x: number;
  y: number;
  deviation_x: number;
  deviation_y: number;
  contribution_x: number;
  contribution_y: number;
  score: number;
  unit_score: number;
  foot: Point;
  squared_residual: number;
}

export interface Arrow {
  dx: number;
  dy: number;
}

export interface CovarianceEntries {
  var_x: number;
  cov: number;
  var_y: number;
}

export interface DirectionView {
  pivot: Point;
  unit: Arrow;
  vector: Arrow;
  rows: ProjectedRow[];
  score_mean: number;
  score_variance: number;
  score_second_moment: number;
  unit_score_variance: number;
  total_squared_residual: number;
  retained_sum_squares: number;
  total_sum_squares: number;
  covariance: CovarianceEntries;
  transformed: Arrow;
  transformed_length: number;
  angle_between_degrees: number;
}

export interface DirectionOptions {
  centre?: boolean;
  length?: number;
}

export async function projectOntoDirection(
  points: Point[],
  angleDegrees: number,
  options: DirectionOptions = {},
): Promise<DirectionView> {
  return postJson<DirectionView>("/concepts/pca/direction", {
    points,
    angle_degrees: angleDegrees,
    ...(options.centre === undefined ? {} : { centre: options.centre }),
    ...(options.length === undefined ? {} : { length: options.length }),
  });
}

export interface ComponentReport {
  dx: number;
  dy: number;
  variance: number;
  share: number;
}

export interface Scores {
  first: number;
  second: number;
}

export interface StandardizedReport {
  components: ComponentReport[];
  correlation: number;
  scale_x: number;
  scale_y: number;
}

export interface FullAnalysis {
  mean: Point;
  components: ComponentReport[];
  reconstructions: Point[];
  deviations: Point[];
  scores: Scores[];
  scatter: number[][];
  covariance: number[][];
  sample_covariance: number[][];
  scatter_eigenvalues: number[];
  cumulative_shares: number[];
  reconstruction_error_one: number;
  standardized: StandardizedReport;
}

export async function analyseFully(points: Point[]): Promise<FullAnalysis> {
  return postJson<FullAnalysis>("/concepts/pca/analyze", { points });
}

export interface UnitVariant {
  unit: string;
  factor: number;
  covariance: number[][];
  components: ComponentReport[];
}

export interface UnitScaling {
  variants: UnitVariant[];
}

export async function rescaleUnits(points: Point[]): Promise<UnitScaling> {
  return postJson<UnitScaling>("/concepts/pca/unit-scaling", { points });
}

export interface FittedLine {
  slope: number;
  intercept: number;
  residual_sum: number;
}

export interface VersusRegression {
  mean: Point;
  weight_on_height: FittedLine;
  height_on_weight: FittedLine;
  first_component: Arrow;
  perpendicular_residual_sum: number;
}

export async function compareWithRegression(
  points: Point[],
): Promise<VersusRegression> {
  return postJson<VersusRegression>("/concepts/pca/versus-regression", {
    points,
  });
}

export interface BodyComponent {
  name: string;
  variance: number;
  share: number;
  cumulative_share: number;
  loadings: Record<string, number>;
}

export interface BodyMeasurements {
  names: string[];
  rows: number[][];
  correlation: number[][];
  components: BodyComponent[];
  reconstruction_errors: number[];
}

// The dataset is fixed, so two widgets asking for it share one request.
let bodyCache: Promise<BodyMeasurements> | null = null;

export function fetchBodyMeasurements(): Promise<BodyMeasurements> {
  if (!bodyCache) {
    bodyCache = getJson<BodyMeasurements>("/concepts/pca/body-measurements").catch((error) => {
      bodyCache = null;
      throw error;
    });
  }
  return bodyCache;
}
