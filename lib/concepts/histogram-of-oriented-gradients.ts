// Client functions for the page about describing a patch by its edge directions.
//
// Every number here is computed by the API on the workbench scene and on four
// small drawn patches: the describe endpoint counts every pixel's direction
// into its own cell and finishes the answer, the hand-worked endpoint takes a
// six by six patch all the way through on paper, the vote-sharing endpoint
// turns a ramp through a bucket boundary under both ways of voting, the
// lighting endpoint relights the scene and measures what moved at each stage,
// the turning endpoint does the same for a quarter turn at six bucket counts,
// the range endpoint puts a bright thing beside its opposite, the size
// endpoint does the arithmetic that says how long an answer is, and the
// inside-one-cell endpoint moves a small square about and reports what a cell
// can and cannot see.

import { getJson, postJson } from "@/lib/api";

const BASE = "/concepts/histogram-of-oriented-gradients";

export type PictureName =
  | "scene"
  | "scene_relit"
  | "scene_turned"
  | "scene_inverted"
  | "upright_edge"
  | "bar"
  | "bar_inverted"
  | "even";

export type AngleRangeName = "unsigned" | "signed";
export type VoteSharingName = "whole_to_nearest" | "split_between_neighbours";
export type NormalisationName =
  | "none"
  | "l1"
  | "l1_square_root"
  | "l2"
  | "l2_clipped";

export interface DescribeSettings {
  picture?: PictureName;
  cell_side?: number;
  n_buckets?: number;
  angle_range?: AngleRangeName;
  vote_sharing?: VoteSharingName;
  block_normalisation?: NormalisationName;
}

export interface DescribeView {
  picture: PictureName;
  picture_label: string;
  picture_description: string;
  height: number;
  width: number;
  n_pixels: number;
  pixels: number[][];
  cell_side: number;
  n_cell_rows: number;
  n_cell_columns: number;
  n_buckets: number;
  range_span_degrees: number;
  bucket_span_degrees: number;
  bucket_centre_degrees: number[];
  signed: boolean;
  cells: number[][][];
  cell_weights: number[][];
  fullest_bucket: number[][];
  total_weight: number;
  heaviest_cell_weight: number;
  n_values: number;
  description_length: number;
  largest_entry: number;
  entries_above_the_clip_limit: number;
  clip_limit: number;
  n_block_rows: number;
  n_block_columns: number;
  cells_in_the_answer: number;
  distance_from_the_scene: number | null;
}

export async function describePatch(
  settings: DescribeSettings,
): Promise<DescribeView> {
  return postJson<DescribeView>(`${BASE}/describe`, settings);
}

export interface GradientReading {
  row: number;
  column: number;
  brightness: number;
  across: number;
  down: number;
  magnitude: number;
  direction_degrees: number;
}

export interface HandWorkedView {
  pixels: number[][];
  readings: GradientReading[];
  cell_side: number;
  n_cell_rows: number;
  n_cell_columns: number;
  bucket_centre_degrees: number[];
  cells: number[][][];
  cells_whole_vote: number[][][];
  total_weight: number;
  weight_per_cell: number;
  unnormalised: number[];
  unnormalised_length: number;
  normalised: number[];
  clipped: number[];
  clip_limit: number;
  entries_above_the_limit: number;
  n_values: number;
}

let handWorkedPromise: Promise<HandWorkedView> | null = null;

export async function fetchHandWorked(): Promise<HandWorkedView> {
  if (!handWorkedPromise) {
    handWorkedPromise = getJson<HandWorkedView>(`${BASE}/hand-worked`);
  }
  return handWorkedPromise;
}

export interface SharingStep {
  degrees: number;
  whole: number[];
  shared: number[];
}

export interface SharingView {
  bucket_centre_degrees: number[];
  bucket_span_degrees: number;
  steps: SharingStep[];
  before_degrees: number;
  after_degrees: number;
  moved_whole: number;
  moved_shared: number;
  ratio: number;
  whole_before: number[];
  whole_after: number[];
  shared_before: number[];
  shared_after: number[];
  upright_edge_whole: number[];
  upright_edge_shared: number[];
}

let sharingPromise: Promise<SharingView> | null = null;

export async function fetchVoteSharing(): Promise<SharingView> {
  if (!sharingPromise) {
    sharingPromise = getJson<SharingView>(`${BASE}/vote-sharing`);
  }
  return sharingPromise;
}

export interface LightingRow {
  rule: NormalisationName;
  rule_label: string;
  description_length: number;
  moved_by_the_shift: number;
  moved_by_the_scale: number;
  moved_by_both: number;
  first_block_sum: number;
  first_block_length: number;
}

export interface LightingView {
  scale: number;
  shift: number;
  n_pixels: number;
  pixel_length: number;
  pixel_moved: number;
  pixel_share_moved: number;
  n_pixels_changed: number;
  largest_direction_difference_degrees: number;
  smallest_magnitude_ratio: number;
  largest_magnitude_ratio: number;
  rows: LightingRow[];
}

export async function fetchLighting(
  scale: number,
  shift: number,
): Promise<LightingView> {
  return postJson<LightingView>(`${BASE}/lighting`, { scale, shift });
}

export interface TurningRow {
  n_buckets: number;
  bucket_span_degrees: number;
  whole_buckets_in_a_quarter_turn: boolean;
  n_values: number;
  description_length: number;
  moved_by_turning: number;
  moved_by_relighting: number;
  turned_share: number;
}

export interface TurningRuleRow {
  rule: NormalisationName;
  rule_label: string;
  description_length: number;
  moved_by_turning: number;
  turned_share: number;
}

export interface TurningView {
  rows: TurningRow[];
  rules: TurningRuleRow[];
}

let turningPromise: Promise<TurningView> | null = null;

export async function fetchTurning(): Promise<TurningView> {
  if (!turningPromise) {
    turningPromise = getJson<TurningView>(`${BASE}/turning`);
  }
  return turningPromise;
}

export interface RangeRow {
  picture: PictureName;
  picture_label: string;
  shares: number[];
  bucket_centre_degrees: number[];
  occupied_buckets: number[];
}

export interface RangePair {
  angle_range: AngleRangeName;
  n_buckets: number;
  here: RangeRow;
  inverted: RangeRow;
  distance: number;
  description_length: number;
}

export interface RangeView {
  bar: RangePair[];
  scene: RangePair[];
}

let rangePromise: Promise<RangeView> | null = null;

export async function fetchRangeChoice(): Promise<RangeView> {
  if (!rangePromise) {
    rangePromise = getJson<RangeView>(`${BASE}/range-choice`);
  }
  return rangePromise;
}

export interface SizeSettings {
  height?: number;
  width?: number;
  cell_side?: number;
  cells_per_block_side?: number;
  block_stride_in_cells?: number;
  n_buckets?: number;
}

export interface SizeView {
  height: number;
  width: number;
  n_pixels: number;
  cell_side: number;
  cells_per_block_side: number;
  block_stride_in_cells: number;
  n_buckets: number;
  n_cell_rows: number;
  n_cell_columns: number;
  n_cells: number;
  n_block_rows: number;
  n_block_columns: number;
  n_blocks: number;
  n_values: number;
  cells_in_the_answer: number;
  repetition: number;
  numbers_per_pixel: number;
  coverage: number[][];
  uncovered: number;
}

export async function fetchSize(settings: SizeSettings): Promise<SizeView> {
  return postJson<SizeView>(`${BASE}/size`, settings);
}

export interface InsideOneCellView {
  here: number[][];
  moved_inside: number[][];
  moved_across: number[][];
  cell_side: number;
  description_length: number;
  pixels_moved_inside: number;
  pixels_moved_across: number;
  description_moved_inside: number;
  description_moved_across: number;
  counts_moved_inside: number;
}

let insidePromise: Promise<InsideOneCellView> | null = null;

export async function fetchInsideOneCell(): Promise<InsideOneCellView> {
  if (!insidePromise) {
    insidePromise = getJson<InsideOneCellView>(`${BASE}/inside-one-cell`);
  }
  return insidePromise;
}
