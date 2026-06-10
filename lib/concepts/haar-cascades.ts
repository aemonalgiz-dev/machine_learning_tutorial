// The Haar cascades page's endpoints: a picture accumulated into a table of
// running totals with one box read off it, what that read costs against adding
// the pixels up, the five cell layouts and how many features a window admits,
// the fitted detector stage by stage, one sweep over a scene with everything it
// cost, the same detector on three scenes that differ in how much target they
// hold, and the same targets relit and turned.
//
// Everything here is measured by the API; the widgets only draw it.

import { getJson, postJson } from "@/lib/api";

export interface PictureGrid {
  height: number;
  width: number;
  rows: number[][];
}

export interface Position {
  top: number;
  left: number;
}

export interface Box {
  top: number;
  left: number;
  height: number;
  width: number;
  n_pixels: number;
}

export interface SignedBox {
  top: number;
  left: number;
  height: number;
  width: number;
  sign: number;
}

// One entry of the table of running totals, and whether it is added or taken
// away. Four of these answer any box at all.
export interface CornerReading {
  row: number;
  column: number;
  sign: number;
  value: number;
}

export interface Agreement {
  picture_height: number;
  picture_width: number;
  n_rectangles: number;
  n_agreeing: number;
  largest_gap: number;
}

// from_the_table is the four corners added with their signs; from_the_pixels
// is every pixel inside the box added up. The two numbers are the claim and
// its check.
export interface IntegralReading {
  picture: PictureGrid;
  table: number[][];
  rectangle: Box;
  corners: CornerReading[];
  from_the_table: number;
  from_the_pixels: number;
  n_lookups: number;
  agreement: Agreement;
}

export type PictureName = "counted" | "workbench";

export async function readABox(
  picture: PictureName,
  top: number,
  left: number,
  height: number,
  width: number,
): Promise<IntegralReading> {
  return postJson<IntegralReading>("/concepts/haar-cascades/integral-image", {
    picture,
    top,
    left,
    height,
    width,
  });
}

export interface BoxCost {
  height: number;
  width: number;
  n_pixels: number;
  n_lookups: number;
}

export interface ReadingCost {
  boxes: BoxCost[];
  side: number;
  repetitions: number;
  times_larger: number;
  table_ratio: number;
  pixel_ratio: number;
  table_small_microseconds: number;
  table_large_microseconds: number;
  pixel_small_microseconds: number;
  pixel_large_microseconds: number;
  build_microseconds: number;
  reads_to_repay_the_table: number;
}

export interface ArrangementShape {
  label: string;
  reads: string;
  rows_of_cells: number;
  columns_of_cells: number;
  signs: number[][];
  sign_total: number;
  balanced: boolean;
}

export interface WorkedReading {
  label: string;
  arrangement: string;
  picture: PictureGrid;
  cells: SignedBox[];
  value: number;
}

export interface LevelReading {
  arrangement: string;
  on_dim: number;
  on_bright: number;
  balanced: boolean;
}

export interface WindowCount {
  side: number;
  n_pixels: number;
  n_features: number;
  features_per_pixel: number;
}

// The two ways of adding a feature's cells up. plain and compensated arrive as
// text, because the difference between them is in the last bit and a browser
// would round it away.
export interface RoundingFinding {
  n_values: number;
  n_disagreeing: number;
  largest_gap: number;
  plain: string;
  compensated: string;
  threshold: string;
  plain_votes_yes: boolean;
  compensated_votes_yes: boolean;
}

export interface Arrangements {
  arrangements: ArrangementShape[];
  worked: WorkedReading[];
  level: LevelReading[];
  counts: WindowCount[];
  doubling_factor: number;
  rounding: RoundingFinding;
}

export interface RuleReading {
  arrangement: string;
  top: number;
  left: number;
  cell_height: number;
  cell_width: number;
  threshold: number;
  direction: string;
  voice: number;
  cells: SignedBox[];
}

export interface StageReading {
  number: number;
  n_rules: number;
  total_voice: number;
  demanded_share: number;
  lowest_positive_confidence: number;
  was_lowered: boolean;
  negatives_reaching: number;
  negatives_rejected: number;
  negatives_surviving: number;
  positives_kept: number;
  rejection_share: number;
  rules: RuleReading[];
}

export interface HeldOutReading {
  n_backgrounds: number;
  backgrounds_through_each_stage: number[];
  background_shares: number[];
  n_targets: number;
  targets_through_each_stage: number[];
  accuracy: number;
  recall: number;
  precision: number;
}

export interface Detector {
  window_side: number;
  n_targets: number;
  n_backgrounds: number;
  n_candidate_features: number;
  n_available_features: number;
  n_stages: number;
  n_rules: number;
  stages: StageReading[];
  held_out: HeldOutReading;
  example_target: PictureGrid;
  example_background: PictureGrid;
}

export interface StageReach {
  number: number;
  n_rules: number;
  windows_reaching: number;
  share_of_all_windows: number;
  evaluations: number;
}

// survivors holds the positions that reached the second stage and the third,
// in that order, since every window reaches the first.
export interface Sweep {
  scene: PictureGrid;
  window_side: number;
  planted: Position[];
  windows_examined: number;
  stages: StageReach[];
  survivors: Position[][];
  accepted: Position[];
  n_accepted: number;
  accepted_near_a_target: number;
  rule_evaluations: number;
  flat_evaluations: number;
  searched_bank: number;
  exhaustive_bank: number;
  saving_over_flat: number;
  saving_over_searched_bank: number;
  saving_over_exhaustive_bank: number;
  rules_per_window: number;
}

export interface SceneCost {
  label: string;
  description: string;
  scene: PictureGrid;
  windows_examined: number;
  windows_reaching: number[];
  n_accepted: number;
  accepted_share: number;
  rule_evaluations: number;
  flat_evaluations: number;
  saving_over_flat: number;
  rules_per_window: number;
}

export interface Scenes {
  scenes: SceneCost[];
  most_rules_per_window: number;
}

export interface PoseReading {
  label: string;
  description: string;
  n_shown: number;
  n_found: number;
  share_found: number;
  example: PictureGrid;
}

export interface SignFlip {
  arrangement: string;
  on_the_target: number;
  on_the_relit_target: number;
  threshold: number;
  direction: string;
  votes_yes_on_the_target: boolean;
  votes_yes_on_the_relit_target: boolean;
  cells: SignedBox[];
}

export interface Poses {
  poses: PoseReading[];
  sign_flip: SignFlip;
}

// Each of these is one fixed request that several widgets want, so the promise
// is kept at module level and the fit behind it is paid for once.
let readingCostPromise: Promise<ReadingCost> | null = null;
let arrangementsPromise: Promise<Arrangements> | null = null;
let detectorPromise: Promise<Detector> | null = null;
let sweepPromise: Promise<Sweep> | null = null;
let scenesPromise: Promise<Scenes> | null = null;
let posesPromise: Promise<Poses> | null = null;

export function fetchReadingCost(): Promise<ReadingCost> {
  readingCostPromise ??= getJson<ReadingCost>(
    "/concepts/haar-cascades/reading-cost",
  );
  return readingCostPromise;
}

export function fetchArrangements(): Promise<Arrangements> {
  arrangementsPromise ??= getJson<Arrangements>(
    "/concepts/haar-cascades/arrangements",
  );
  return arrangementsPromise;
}

export function fetchDetector(): Promise<Detector> {
  detectorPromise ??= getJson<Detector>("/concepts/haar-cascades/detector");
  return detectorPromise;
}

export function fetchSweep(): Promise<Sweep> {
  sweepPromise ??= getJson<Sweep>("/concepts/haar-cascades/scan");
  return sweepPromise;
}

export function fetchScenes(): Promise<Scenes> {
  scenesPromise ??= getJson<Scenes>("/concepts/haar-cascades/scenes");
  return scenesPromise;
}

export function fetchPoses(): Promise<Poses> {
  posesPromise ??= getJson<Poses>("/concepts/haar-cascades/poses");
  return posesPromise;
}
