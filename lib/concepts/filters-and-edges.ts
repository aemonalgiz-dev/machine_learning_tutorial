// The filters-and-edges page's endpoints.
//
// The scene endpoint hands back the three shared pictures and what a change of
// lighting did to them, which is the page's opening claim measured rather than
// asserted. The field endpoint sweeps one operator across one of those pictures
// under one border rule and answers all four maps, which is everything the
// playground draws. The hand-sweep endpoint takes the shared six by six picture
// through one sweep and returns the window, the values read and the products
// summed behind every answer, so a widget can lay the arithmetic out without
// doing any of it.
//
// Three more sit beside those and take no input at all, so each is fetched once
// per page load and shared by whichever widgets want it. The borders endpoint
// runs all four border rules over that same small picture. The operators
// endpoint compares the four sets of weights on a clean step, on the scene's
// diagonal bar and across a straight edge drawn at every angle, and times a
// sweep. The thresholds endpoint scores every threshold on the magnitude
// against which pixels really lie on a boundary.

import { ApiError, getJson, postJson } from "@/lib/api";

export type Grid = number[][];

export type OperatorName =
  | "central_difference"
  | "prewitt"
  | "sobel"
  | "scharr";

export type EdgeRuleName = "extend" | "wrap" | "pad_with_zero" | "keep_valid";

export type SceneName = "workbench" | "without_ramp" | "relit" | "hand";

// One brightness threshold against one picture. `wrongly_labelled` counts the
// pixels it puts on the wrong side of the line, against which pixels actually
// belong to a shape.
export interface ThresholdReading {
  threshold: number;
  kept: number;
  wrongly_labelled: number;
}

// What a change of lighting did. The two pairs of bounds bracket every
// threshold that labels each picture perfectly, so they say between them
// whether one number can serve both. The magnitude bounds say what happened to
// the length of the gradient and `largest_direction_move` what happened to its
// angle, in radians.
export interface LightingReading {
  scale: number;
  shift: number;
  n_pixels: number;
  n_shape_pixels: number;
  mean_brightness_move: number;
  largest_brightness_move: number;
  brightest_ground: number;
  darkest_shape: number;
  relit_brightest_ground: number;
  relit_darkest_shape: number;
  threshold: number;
  scene_reading: ThresholdReading;
  relit_reading: ThresholdReading;
  n_disagreeing: number;
  share_disagreeing: number;
  magnitude_ratio_low: number;
  magnitude_ratio_high: number;
  largest_direction_move: number;
  n_sharp_pixels: number;
  largest_direction_move_where_sharp: number;
}

export interface Scene {
  height: number;
  width: number;
  scene: Grid;
  without_ramp: Grid;
  relit: Grid;
  darkest: number;
  brightest: number;
  ramp_across: number;
  ramp_per_column: number;
  lighting: LightingReading;
}

// The two rates of change and the length and angle they make together.
// `direction` is in radians from pointing right, turning towards pointing down,
// and `edge_direction` is that turned by a right angle.
export interface GradientMaps {
  scene: SceneName;
  scene_label: string;
  operator: OperatorName;
  operator_label: string;
  edge_rule: EdgeRuleName;
  edge_rule_label: string;
  picture: Grid;
  height: number;
  width: number;
  answer_height: number;
  answer_width: number;
  horizontal: Grid;
  vertical: Grid;
  magnitude: Grid;
  direction: Grid;
  edge_direction: Grid;
  largest_magnitude: number;
  largest_rate: number;
}

export interface FieldRequest {
  scene?: SceneName;
  operator?: OperatorName;
  edge_rule?: EdgeRuleName;
}

// One window of the hand-worked sweep. `top` and `left` are where the window's
// first pixel sits and are negative where it begins outside the picture.
export interface SweepCell {
  row: number;
  column: number;
  top: number;
  left: number;
  patch: Grid;
  products: Grid;
  answer: number;
}

export interface HandSweep {
  operator: OperatorName;
  operator_label: string;
  edge_rule: EdgeRuleName;
  edge_rule_label: string;
  reversed_weights: boolean;
  weights: Grid;
  positive_weight_total: number;
  weight_total: number;
  picture: Grid;
  padded: Grid;
  pad_rows: number;
  pad_columns: number;
  answer: Grid;
  answer_height: number;
  answer_width: number;
  cells: SweepCell[];
}

export interface HandSweepRequest {
  operator?: OperatorName;
  edge_rule?: EdgeRuleName;
  vertical?: boolean;
  reversed_weights?: boolean;
}

// What one border rule answers on the small picture. `invented_at` names the
// columns of the middle row where a sharp change is reported and the picture
// holds none.
export interface BorderReading {
  edge_rule: EdgeRuleName;
  label: string;
  answer_height: number;
  answer_width: number;
  averaged: Grid;
  magnitude: Grid;
  averaged_middle_row: number[];
  magnitude_middle_row: number[];
  invented_at: number[];
  note: string;
}

export interface Borders {
  picture: Grid;
  height: number;
  width: number;
  real_edge_between: number[];
  readings: BorderReading[];
}

export interface AngleReading {
  degrees: number;
  reported: number;
  error: number;
}

// One operator across every drawn angle, on an edge spread over a couple of
// pixels and on a hard one-pixel step. The two orderings are not the same.
export interface OperatorSweep {
  blurred: AngleReading[];
  blurred_mean_error: number;
  blurred_worst_error: number;
  hard_mean_error: number;
  hard_worst_error: number;
}

export interface OperatorReading {
  operator: OperatorName;
  label: string;
  note: string;
  weights: Grid;
  n_rows: number;
  n_columns: number;
  positive_weight_total: number;
  weight_total: number;
  clean_step_answer: number;
  clean_step_direction: number;
  clean_step_edge_direction: number;
  bar_angle: number;
  bar_angle_error: number;
  bar_magnitude: number;
  sweep: OperatorSweep;
}

export interface CostReading {
  side: number;
  n_pixels: number;
  seconds_per_sweep: number;
  nanoseconds_per_pixel: number;
  n_multiplies: number;
  n_additions: number;
}

export interface Operators {
  angles: number[];
  blur_width: number;
  readings: OperatorReading[];
  bar_angle_spread: number;
  bar_magnitude_ratio: number;
  bar_true_angle: number;
  costs: CostReading[];
  n_operations_per_pixel: number;
  n_operations_for_scene: number;
}

// One threshold on the magnitude, scored against what is really there. A
// threshold that did the job would answer zero to both `flat_kept` and
// `edge_lost`, and none of them does.
export interface ThresholdRow {
  threshold: number;
  kept: number;
  flat_kept: number;
  edge_kept: number;
  edge_lost: number;
  faint_kept: number;
  faint_lost: number;
  n_wrong: number;
}

export interface Thresholds {
  noise_level: number;
  height: number;
  width: number;
  magnitude: Grid;
  clean_magnitude: Grid;
  largest_magnitude: number;
  n_pixels: number;
  n_edge_pixels: number;
  n_flat_pixels: number;
  n_faint_pixels: number;
  faint_below: number;
  clean_flat_low: number;
  clean_flat_high: number;
  noisy_flat_low: number;
  noisy_flat_high: number;
  rows: ThresholdRow[];
  best_threshold: number;
  best_wrong: number;
  lowest_clean_threshold: number;
  highest_clean_threshold: number;
}

const BASE = "/concepts/filters-and-edges";

// Several widgets want the same fixed answer, so one page load makes one
// request for each and every later caller waits on that same promise.
function once<T>(path: string): () => Promise<T> {
  let pending: Promise<T> | null = null;
  return () => {
    if (pending) return pending;
    pending = getJson<T>(path).catch((error) => {
      pending = null;
      throw error;
    });
    return pending;
  };
}

export const readScene = once<Scene>(`${BASE}/scene`);
export const readBorders = once<Borders>(`${BASE}/borders`);
export const readOperators = once<Operators>(`${BASE}/operators`);
export const readThresholds = once<Thresholds>(`${BASE}/thresholds`);

// The two posted endpoints are cached on their request, because a reader
// flicking between four operators and four border rules would otherwise ask
// for the same sixteen answers over and over.
const fieldCache = new Map<string, Promise<GradientMaps>>();

export async function sweepField(
  request: FieldRequest = {},
): Promise<GradientMaps> {
  const key = JSON.stringify(request);
  const cached = fieldCache.get(key);
  if (cached) return cached;
  const pending = postJson<GradientMaps>(`${BASE}/field`, request).catch(
    (error) => {
      fieldCache.delete(key);
      throw error;
    },
  );
  fieldCache.set(key, pending);
  return pending;
}

const handCache = new Map<string, Promise<HandSweep>>();

export async function sweepByHand(
  request: HandSweepRequest = {},
): Promise<HandSweep> {
  const key = JSON.stringify(request);
  const cached = handCache.get(key);
  if (cached) return cached;
  const pending = postJson<HandSweep>(`${BASE}/hand-sweep`, request).catch(
    (error) => {
      handCache.delete(key);
      throw error;
    },
  );
  handCache.set(key, pending);
  return pending;
}

// Every widget on this page shows a failure the same way, so the wording lives
// here rather than being retyped eight times.
export function messageFor(error: unknown): string {
  return error instanceof ApiError ? error.message : "Something went wrong.";
}
