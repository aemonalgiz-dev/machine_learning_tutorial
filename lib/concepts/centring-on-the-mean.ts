// Client functions for the centring on the mean page.
//
// Every number here is computed by the API. The origin endpoint measures any
// list of people from a chosen origin and reports the longest direction and a
// line through that origin, beside what the same two methods find on centred
// columns; the crowd endpoint holds everything the page measures on its own
// eleven people, fetched once and shared by every widget that asks; and the
// clock endpoint centres times of day by the ordinary mean and by the circular
// one.

import { Point, getJson, postJson } from "@/lib/api";

const BASE = "/concepts/centring-on-the-mean";

export interface Arrow {
  dx: number;
  dy: number;
  angle_degrees: number;
}

export interface DirectionReport {
  arrow: Arrow;
  share: number;
}

export interface LineReport {
  slope: number;
  intercept: number;
  r_squared: number;
}

export interface OriginView {
  origin: Point;
  centre: Point;
  uncentred: DirectionReport;
  centred: DirectionReport;
  mean_direction: Arrow | null;
  uncentred_against_mean: number | null;
  uncentred_against_centred: number;
  second_moment_total: number;
  variance_total: number;
  location_total: number;
  refit_gap: number;
  through_origin: LineReport;
  with_intercept: LineReport;
  centred_through_origin: LineReport;
}

export async function viewFromOrigin(
  points: Point[],
  heightOrigin: number,
  weightOrigin: number,
): Promise<OriginView> {
  return postJson<OriginView>(`${BASE}/origin`, {
    points,
    height_origin: heightOrigin,
    weight_origin: weightOrigin,
  });
}

export interface CentringReport {
  height_centre: number;
  weight_centre: number;
  height_spread: number;
  centred_heights: number[];
  centred_weights: number[];
  height_mean_after: number;
  weight_mean_after: number;
  height_variance_before: number;
  height_variance_after: number;
  largest_gap_change: number;
  standardized_gap: number;
}

export interface SweepRow {
  height_origin: number;
  uncentred_angle: number;
  uncentred_share: number;
  centred_angle: number;
}

export interface RidgeRow {
  penalty: number;
  slope_with_intercept: number;
  intercept: number;
  slope_centred_through_origin: number;
  slope_raw_through_origin: number;
  r_squared_raw_through_origin: number;
}

export interface LinesReport {
  least_squares: LineReport;
  through_origin: LineReport;
  centred_through_origin: LineReport;
  centred_with_intercept: LineReport;
  ridges: RidgeRow[];
}

export interface WalkCheckpoint {
  passes: number;
  slope: number;
  level: number;
}

export interface WalkReport {
  reading: "raw" | "centred";
  curvatures: number[];
  condition_number: number;
  ones_cosine: number;
  learning_rate: number;
  passes: number;
  converged: boolean;
  slope: number;
  level: number;
  target_slope: number;
  target_level: number;
  checkpoints: WalkCheckpoint[];
}

export interface PolynomialRow {
  reading: "raw" | "centred";
  correlation: number;
  condition_number: number;
  linear_coefficient: number;
  square_coefficient: number;
  intercept: number;
  r_squared: number;
}

export interface PairCosine {
  first: number;
  second: number;
  value: number;
}

export interface VoteRow {
  rule: "straight-line" | "angle";
  raw_accuracy: number;
  centred_accuracy: number;
}

export interface AnglesReport {
  raw_cosines: number[][];
  centred_cosines: number[][];
  smallest_raw: PairCosine;
  smallest_centred: PairCosine;
  column_cosine_raw: number;
  column_cosine_centred: number;
  correlation: number;
  votes: VoteRow[];
}

export interface InvarianceReport {
  distance_gap: number;
  kmeans_inertia_raw: number;
  kmeans_inertia_centred: number;
  kmeans_same_groups: boolean;
  tree_threshold_raw: number;
  tree_threshold_centred: number;
  tree_feature: string;
  tree_predictions_agree: boolean;
  slope_gap: number;
  standardized_gap: number;
}

export interface FoldReport {
  held_out_heights: number[];
  training_mean: number;
  by_training: number[];
  by_training_mean: number;
  own_mean: number;
  by_own: number[];
}

export interface CrowdMeasurements {
  centring: CentringReport;
  sweep: SweepRow[];
  lines: LinesReport;
  walks: WalkReport[];
  polynomial: PolynomialRow[];
  angles: AnglesReport;
  invariance: InvarianceReport;
  fold: FoldReport;
}

// The crowd is fixed, so every widget asking about it shares one request.
let crowdCache: Promise<CrowdMeasurements> | null = null;

export function fetchCrowdMeasurements(): Promise<CrowdMeasurements> {
  if (!crowdCache) {
    crowdCache = getJson<CrowdMeasurements>(`${BASE}/crowd`).catch((error) => {
      crowdCache = null;
      throw error;
    });
  }
  return crowdCache;
}

export interface ClockView {
  hours: number[];
  arithmetic_centre: number;
  arithmetic_offsets: number[];
  circular_centre: number | null;
  circular_offsets: number[] | null;
  resultant_length: number;
}

export async function centreTimes(hours: number[]): Promise<ClockView> {
  return postJson<ClockView>(`${BASE}/clock`, { hours });
}
