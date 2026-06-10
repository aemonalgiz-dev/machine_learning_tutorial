// Client functions for the page on learning the metric itself.
//
// Every number here is computed by the API: the pair loss, the two towers'
// gradients, the training on pairs, the comparison against a classifier's
// layer and against the pixels, the margin sweep and the run without
// different-kind pairs. The browser draws.
//
// Almost every request is fixed, and several of them train two small
// networks the first time they are asked, so each is cached in a module-level
// promise and every widget that wants the same study shares one request. The
// margin sweep is cached per setting for the same reason. A request that fails
// is forgotten, so the next visit tries again rather than inheriting the
// failure.

import { getJson, postJson } from "@/lib/api";

const BASE = "/concepts/learning-the-metric-itself";

export type SpaceName = "pixels" | "classifier_all_four" | "classifier_three" | "pairs";

export interface KindFigure {
  kind: string;
  in_training: boolean;
  nearest_same_kind: number | null;
  ten_nearest_same_kind: number;
  within_over_across: number | null;
  n_pictures: number;
  n_counted: number;
  nearest_count: number;
}

export interface KindCount {
  kind: string;
  nearest_count: number;
  n_pictures: number;
}

export interface SeenKindsReading {
  space: SpaceName;
  title: string;
  kinds: KindCount[];
}

export interface SpaceReading {
  space: SpaceName;
  title: string;
  width: number;
  kinds: KindFigure[];
}

export interface Comparison {
  held_back: string;
  seed: number;
  training_kinds: string[];
  n_training_pictures: number;
  n_evaluation_pictures: number;
  margin: number;
  spaces: SpaceReading[];
  seen_kinds_only: SeenKindsReading[];
  classifier_accuracy: number;
  pair_loss_first_epoch: number;
  pair_loss_last_epoch: number;
}

export type ComparisonName =
  | "main"
  | "seed-1"
  | "seed-2"
  | "without-cross"
  | "without-disc"
  | "without-square";

const COMPARISON_PATHS: Record<ComparisonName, string> = {
  main: `${BASE}/comparison`,
  "seed-1": `${BASE}/comparison/seed-1`,
  "seed-2": `${BASE}/comparison/seed-2`,
  "without-cross": `${BASE}/comparison/without-cross`,
  "without-disc": `${BASE}/comparison/without-disc`,
  "without-square": `${BASE}/comparison/without-square`,
};

// One cache for every keyed request on this page, so each of them forgets a
// failure the same way.
function remembered<T>(
  cache: Map<string, Promise<T>>,
  key: string,
  load: () => Promise<T>,
): Promise<T> {
  let promise = cache.get(key);
  if (!promise) {
    promise = load();
    cache.set(key, promise);
    promise.catch(() => cache.delete(key));
  }
  return promise;
}

const comparisons = new Map<string, Promise<Comparison>>();

export function fetchComparison(name: ComparisonName = "main"): Promise<Comparison> {
  return remembered(comparisons, name, () =>
    getJson<Comparison>(COMPARISON_PATHS[name]),
  );
}

export interface SpherePoint {
  kind: string;
  in_training: boolean;
  x: number;
  y: number;
  z: number;
  neighbours: number[];
}

export interface SphereSpace {
  space: SpaceName;
  title: string;
  width: number;
  kept_share: number;
  points: SpherePoint[];
}

export interface SphereAnswer {
  held_back: string;
  seed: number;
  kinds: string[];
  grey_levels: number;
  levels: number[][][];
  darkest: number;
  brightest: number;
  spaces: SphereSpace[];
}

const fixed = new Map<string, Promise<unknown>>();

function fixedAnswer<T>(path: string): Promise<T> {
  return remembered(fixed, path, () => getJson<unknown>(path)) as Promise<T>;
}

export function fetchSphere(): Promise<SphereAnswer> {
  return fixedAnswer<SphereAnswer>(`${BASE}/sphere`);
}

export interface GridPicture {
  kind: string;
  rows: number[][];
  darkest: number;
  brightest: number;
}

export interface WorkedPair {
  title: string;
  same_kind: boolean;
  first: GridPicture;
  second: GridPicture;
  first_position: number[];
  second_position: number[];
  gap: number[];
  distance: number;
  loss: number;
  loss_if_same: number;
  loss_if_different: number;
  slope_on_first: number[];
  pixel_distance: number;
}

export interface WorkedPairAnswer {
  margin: number;
  width: number;
  pairs: WorkedPair[];
}

export function fetchWorkedPairs(): Promise<WorkedPairAnswer> {
  return fixedAnswer<WorkedPairAnswer>(`${BASE}/worked-pair`);
}

export interface PairLossRequest {
  first: number[];
  second: number[];
  same_kind: boolean;
  margin: number;
}

export interface PairLossAnswer {
  distance: number;
  loss: number;
  loss_if_same: number;
  loss_if_different: number;
  beyond_margin: boolean;
  slope_on_first: number[];
  slope_on_second: number[];
  direction_defined: boolean;
}

export function measurePairLoss(request: PairLossRequest): Promise<PairLossAnswer> {
  return postJson<PairLossAnswer>(`${BASE}/pair-loss`, request);
}

export interface CheckedPair {
  same_kind: boolean;
  first_kind: string;
  second_kind: string;
  distance: number;
  loss: number;
}

export interface SharedWeightRow {
  layer: string;
  parameter: string;
  first_tower: number;
  second_tower: number;
  both: number;
  finite_difference: number;
  gap_to_both: number;
  gap_to_first_tower: number;
}

export interface SharedWeightsAnswer {
  margin: number;
  nudge: number;
  pairs: CheckedPair[];
  mean_loss: number;
  rows: SharedWeightRow[];
  largest_gap_to_both: number;
  position_biases_cancel_exactly: boolean;
  largest_position_bias_slope_one_tower: number;
}

export function fetchSharedWeights(): Promise<SharedWeightsAnswer> {
  return fixedAnswer<SharedWeightsAnswer>(`${BASE}/shared-weights`);
}

export type RateRule = "scaled" | "fixed";

export const MARGINS = [0.5, 1, 2, 4] as const;

export const MARGIN_SEEDS = [0, 1, 2] as const;

export interface MarginAnswer {
  margin: number;
  rate: number;
  rate_rule: RateRule;
  seed: number;
  losses: number[];
  spread_epochs: number[];
  spreads: number[];
  start_spread: number;
  final_loss: number | null;
  diverged: boolean;
  mean_within: number;
  mean_across: number;
  beyond_margin: number;
  kinds: KindFigure[];
}

const margins = new Map<string, Promise<MarginAnswer>>();

export function fetchMargin(
  margin: number,
  rule: RateRule,
  seed: number = 0,
): Promise<MarginAnswer> {
  return remembered(margins, `${margin}|${rule}|${seed}`, () =>
    getJson<MarginAnswer>(
      `${BASE}/margin?margin=${margin}&rate_rule=${rule}&seed=${seed}`,
    ),
  );
}

export interface CollapseAnswer {
  margin: number;
  start_spread: number;
  spread_epochs: number[];
  spreads_without: number[];
  spreads_with: number[];
  losses_without: number[];
  losses_with: number[];
  kinds_without: KindFigure[];
  kinds_with: KindFigure[];
}

export function fetchCollapse(): Promise<CollapseAnswer> {
  return fixedAnswer<CollapseAnswer>(`${BASE}/without-different-kinds`);
}

export interface GrowthRow {
  pictures: number;
  pairs: number;
}

export interface CostAnswer {
  n_training_pictures: number;
  all_pairs: number;
  same_kind_pairs: number;
  different_kind_pairs: number;
  batch_pictures: number;
  pairs_per_batch: number;
  same_kind_per_batch: number;
  steps_per_epoch: number;
  epochs: number;
  pair_evaluations: number;
  distinct_pairs_met: number;
  share_of_pairs_met: number;
  margin: number;
  beyond_margin_training: number;
  beyond_margin_held_out: number;
  pair_seconds: number;
  classifier_seconds: number;
  growth: GrowthRow[];
}

export function fetchCost(): Promise<CostAnswer> {
  return fixedAnswer<CostAnswer>(`${BASE}/cost`);
}

export interface WiderAnswer {
  held_back: string;
  seed: number;
  narrow_width: number;
  wide_width: number;
  narrow: KindFigure[];
  wide: KindFigure[];
  wide_final_loss: number;
}

export function fetchWider(): Promise<WiderAnswer> {
  return fixedAnswer<WiderAnswer>(`${BASE}/wider-positions`);
}
