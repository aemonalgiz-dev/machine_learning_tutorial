// Client functions for the image alignment page.
//
// Every number here is computed by the API. The align endpoint takes the move
// a reader plants and the settings they choose, and answers both pictures,
// their keypoints, the matches and the recovered move; the five fixed
// endpoints answer the arithmetic the page works through on pictures that
// never change, so their promises are cached at module level and shared
// between the widgets that need them.

import { getJson, postJson } from "@/lib/api";

export type MethodName = "orb" | "sift";

export interface AlignedKeypoint {
  row: number;
  column: number;
  strength: number;
  angle_degrees: number;
  scale: number;
}

export interface Move {
  scale: number;
  angle_degrees: number;
  row_shift: number;
  column_shift: number;
}

export interface MatchReport {
  first: number;
  second: number;
  distance: number;
  ratio: number;
  inlier: boolean;
  right: boolean;
}

export interface AlignSettings {
  method?: MethodName;
  angle_degrees?: number;
  scale?: number;
  row_shift?: number;
  column_shift?: number;
  maximum_ratio?: number;
  inlier_distance?: number;
  limit?: number;
}

export interface Alignment {
  height: number;
  width: number;
  first: number[][];
  second: number[][];
  aligned: number[][];
  first_keypoints: AlignedKeypoint[];
  second_keypoints: AlignedKeypoint[];
  matches: MatchReport[];
  n_matches: number;
  n_right: number;
  n_inliers: number;
  n_outliers: number;
  inliers_right: number;
  inliers_wrong: number;
  outliers_right: number;
  outliers_wrong: number;
  truth: Move;
  estimate: Move | null;
  mean_residual: number | null;
  angle_gap_degrees: number | null;
  difference_before: number;
  difference_after: number | null;
  refusal: string | null;
}

const PREFIX = "/concepts/image-alignment";

export async function alignPictures(settings: AlignSettings): Promise<Alignment> {
  return postJson<Alignment>(`${PREFIX}/align`, settings);
}

export interface TurnCostRow {
  row: number;
  column: number;
  turned_row: number;
  turned_column: number;
  patch_distance: number;
  patch_nearest_other: number;
  binary_bits: number;
  binary_nearest_other: number;
  histogram_distance: number;
  histogram_nearest_other: number;
}

export interface TurnCost {
  size: number;
  bar: number[][];
  turned: number[][];
  rows: TurnCostRow[];
  patch_side: number;
  pair_count: number;
}

export interface OrientedCorner {
  row: number;
  column: number;
  patch: number[][];
  moment_right: number;
  moment_down: number;
  centroid_angle_degrees: number;
  gradient_angle_degrees: number;
  votes: number[];
  fullest_bin: number;
}

export interface Orientation {
  size: number;
  bar: number[][];
  radius: number;
  bins: number;
  corners: OrientedCorner[];
}

export interface PairOffsets {
  first_row: number;
  first_column: number;
  second_row: number;
  second_column: number;
}

export interface DescribedCorner {
  row: number;
  column: number;
  angle_degrees: number;
  pairs: PairOffsets[];
  bits: boolean[];
  histogram: number[];
}

export interface Description {
  size: number;
  bar: number[][];
  turned: number[][];
  before: DescribedCorner;
  after: DescribedCorner;
  hamming: number;
  histogram_distance: number;
  cells: number;
  cell_side: number;
  direction_bins: number;
  pair_count: number;
  patch_side: number;
}

export interface Proposal {
  first_match: number;
  second_match: number;
  n_agreeing: number;
  angle_degrees: number;
  scale: number;
  both_right: boolean;
}

export interface Ransac {
  n_matches: number;
  n_pairs: number;
  proposals: Proposal[];
  winner: number;
  agreement_counts: number[];
  truth: Move;
  estimate: Move;
}

export interface PyramidRow {
  levels: number;
  factor: number;
  n_first_keypoints: number;
  n_second_keypoints: number;
  n_matches: number;
  n_right: number;
  n_inliers: number;
  recovered: boolean;
  estimate: Move | null;
}

export interface PyramidReport {
  truth: Move;
  rows: PyramidRow[];
}

let turnCostPromise: Promise<TurnCost> | null = null;
let orientationPromise: Promise<Orientation> | null = null;
let descriptionPromise: Promise<Description> | null = null;
let ransacPromise: Promise<Ransac> | null = null;
let pyramidPromise: Promise<PyramidReport> | null = null;

export function turnCost(): Promise<TurnCost> {
  turnCostPromise ??= getJson<TurnCost>(`${PREFIX}/turn-cost`);
  return turnCostPromise;
}

export function orientation(): Promise<Orientation> {
  orientationPromise ??= getJson<Orientation>(`${PREFIX}/orientation`);
  return orientationPromise;
}

export function description(): Promise<Description> {
  descriptionPromise ??= getJson<Description>(`${PREFIX}/describe`);
  return descriptionPromise;
}

export function ransac(): Promise<Ransac> {
  ransacPromise ??= getJson<Ransac>(`${PREFIX}/ransac`);
  return ransacPromise;
}

export function pyramidReport(): Promise<PyramidReport> {
  pyramidPromise ??= getJson<PyramidReport>(`${PREFIX}/pyramid`);
  return pyramidPromise;
}
