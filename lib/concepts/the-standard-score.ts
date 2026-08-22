// Client functions for the standard score page.
//
// Every number here is computed by the API from the library. The orchard
// endpoint hands back the twenty-four trees with what each column taught and
// what it became; the column endpoint standardises whatever the playground is
// holding and reports both promises and both invariances; the nursery endpoint
// carries every intermediate of the five-sapling sum, which is where the page's
// hand-worked numbers are pinned; the neighbours endpoint answers the same nearest-trees question twice,
// once in the recorded units and once in standard scores; the models endpoint
// scores six model families leave-one-out under three readings of the columns;
// the hold-out endpoint measures four held-out trees against the training rows
// and against themselves; and the limits endpoint carries the degenerate
// readings the closing part rests on.

import { getJson, postJson } from "@/lib/api";

const PREFIX = "/concepts/the-standard-score";

export interface ColumnSummary {
  name: string;
  values: number[];
  mean: number;
  deviation: number;
  scores: number[];
  smallest: number;
  largest: number;
}

export interface Orchard {
  yields: number[];
  girth: ColumnSummary;
  water: ColumnSummary;
  spread_ratio: number;
  squared_spread_ratio: number;
  correlation: number;
  standardised_covariance: number;
}

let orchardRequest: Promise<Orchard> | null = null;

// Four widgets want the same twenty-four trees, so the request is made once
// and shared rather than repeated on every mount.
export function fetchOrchard(): Promise<Orchard> {
  orchardRequest ??= getJson<Orchard>(`${PREFIX}/orchard`);
  return orchardRequest;
}

export interface ColumnReading {
  mean: number;
  deviation: number;
  scores: number[];
  score_mean: number;
  score_variance: number;
  sample_score_variance: number;
  shifted_largest_gap: number | null;
  stretched_largest_gap: number | null;
}

export function standardiseColumn(values: number[]): Promise<ColumnReading> {
  return postJson<ColumnReading>(`${PREFIX}/column`, { values });
}

export interface NeighbourRow {
  tree: number;
  distance: number;
  girth_share: number;
  girth: number;
  water: number;
  borne: number;
}

export interface NeighbourReading {
  reading: string;
  neighbours: NeighbourRow[];
  predicted: number;
  error: number;
}

export interface NeighbourAnswer {
  tree: number;
  k: number;
  girth: number;
  water: number;
  borne: number;
  readings: NeighbourReading[];
}

export function fetchNeighbours(
  tree: number,
  k: number,
): Promise<NeighbourAnswer> {
  return postJson<NeighbourAnswer>(`${PREFIX}/neighbours`, { tree, k });
}

export interface FamilyScores {
  family: string;
  recorded: number;
  inside: number;
  outside: number;
  leak: number;
  moved: boolean;
}

export interface NamedCoefficient {
  name: string;
  value: number;
}

export interface CoefficientReading {
  reading: string;
  coefficients: NamedCoefficient[];
  intercept: number;
  fitted_score: number;
}

export interface TreeReading {
  reading: string;
  root_column: string;
  root_threshold: number;
  depth: number;
  leaves: number;
  fitted_score: number;
}

export interface ModelComparison {
  scores: FamilyScores[];
  water_alone_three: number;
  water_alone_five: number;
  girth_alone_three: number;
  least_squares: CoefficientReading[];
  ridge_penalty_one: CoefficientReading[];
  translated_back: NamedCoefficient[];
  trees: TreeReading[];
  tree_largest_prediction_gap: number;
  tree_threshold_translated: number;
  least_squares_score_gap: number;
}

let modelsRequest: Promise<ModelComparison> | null = null;

export function fetchModels(): Promise<ModelComparison> {
  modelsRequest ??= getJson<ModelComparison>(`${PREFIX}/models`);
  return modelsRequest;
}

export interface HeldOutReading {
  reading: string;
  girth_mean: number;
  girth_deviation: number;
  water_mean: number;
  water_deviation: number;
  girth_scores: number[];
  water_scores: number[];
  predicted: number[];
  largest_error: number;
}

export interface HoldOut {
  held_out: number[];
  borne: number[];
  water: number[];
  girth: number[];
  readings: HeldOutReading[];
}

export function fetchHoldOut(): Promise<HoldOut> {
  return getJson<HoldOut>(`${PREFIX}/hold-out`);
}

export interface ShareWithin {
  column: string;
  within_one: number;
  within_two: number;
  within_three: number;
}

export interface MistypedReading {
  before_mean: number;
  before_deviation: number;
  after_mean: number;
  after_deviation: number;
  mistyped_score: number;
  widest_real_score_before: number;
  widest_real_score_after: number;
  others_lowest_after: number;
  others_highest_after: number;
  others_span_before: number;
  others_span_after: number;
}

export interface ShapeReading {
  column: string;
  skew_before: number;
  skew_after: number;
  order_kept: boolean;
  largest_score: number;
  share_within_one: number;
  share_within_two: number;
}

export interface Limits {
  tiny_deviation: number;
  tiny_scores: number[];
  constant_defined: boolean;
  single_row_defined: boolean;
  mistyped: MistypedReading;
  shares: ShareWithin[];
  normal_within_one: number;
  normal_within_two: number;
  normal_within_three: number;
  chebyshev_within_two: number;
  skewed: ShapeReading;
  girth_shape: ShapeReading;
}

let limitsRequest: Promise<Limits> | null = null;

export function fetchLimits(): Promise<Limits> {
  limitsRequest ??= getJson<Limits>(`${PREFIX}/limits`);
  return limitsRequest;
}
