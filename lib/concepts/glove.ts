// The GloVe page's endpoints.
//
// Two things the reader varies, a fit and a table, and five fixed measurements
// the API computes once and caches. The fixed ones are shared here through a
// module-level promise, so a page that opens several sections at once still
// asks for each of them exactly once.

import { getJson, postJson } from "@/lib/api";

export { ApiError } from "@/lib/api";

export type WeightingName = "harmonic" | "uniform";
export type StepRuleName = "accumulating" | "released";
export type TextChoice = "one-sentence" | "two-sentences" | "corpus";

export const WEIGHTING_LABELS: Record<WeightingName, string> = {
  harmonic: "one over the distance",
  uniform: "one full count",
};

export const STEP_RULE_LABELS: Record<StepRuleName, string> = {
  accumulating: "accumulating from zero",
  released: "as released",
};

// A word near another, with which half of the corpus it came from, so a widget
// can colour a neighbour that crossed over or a word both halves use.
export interface Neighbour {
  word: string;
  similarity: number;
  topic: string;
}

// --- One fit, on request -----------------------------------------------------

// total is the summed pair terms as they were computed during the pass, with
// the parameters moving between one pair and the next, so it is not the
// objective at any one set of parameters; objective_at_rest is.
export interface PassReport {
  pass_number: number;
  total: number;
  mean_per_pair: number;
}

export interface GloveFit {
  n_sentences: number;
  n_occurrences: number;
  n_words: number;
  n_pairs: number;
  n_cells: number;
  zero_share: number;
  passes: PassReport[];
  objective_at_rest: number;
  within_topic: number;
  across_topic: number;
  gap: number;
  neighbours: Neighbour[];
  coordinates: number[];
  numbers_kept: number;
  smallest_divisor: number;
  largest_divisor: number;
  seconds: number;
}

export interface FitOptions {
  window?: number;
  dimension?: number;
  epochs?: number;
  learningRate?: number;
  maximumCount?: number;
  weightingExponent?: number;
  weighting?: WeightingName;
  stepRule?: StepRuleName;
  randomSeed?: number;
  word?: string;
  nNeighbours?: number;
}

export async function fitGlove(options: FitOptions = {}): Promise<GloveFit> {
  const body: Record<string, unknown> = {};
  if (options.window !== undefined) body.window = options.window;
  if (options.dimension !== undefined) body.dimension = options.dimension;
  if (options.epochs !== undefined) body.epochs = options.epochs;
  if (options.learningRate !== undefined) body.learning_rate = options.learningRate;
  if (options.maximumCount !== undefined) body.maximum_count = options.maximumCount;
  if (options.weightingExponent !== undefined)
    body.weighting_exponent = options.weightingExponent;
  if (options.weighting !== undefined) body.weighting = options.weighting;
  if (options.stepRule !== undefined) body.step_rule = options.stepRule;
  if (options.randomSeed !== undefined) body.random_seed = options.randomSeed;
  if (options.word !== undefined) body.word = options.word;
  if (options.nNeighbours !== undefined) body.n_neighbours = options.nNeighbours;
  return postJson<GloveFit>("/concepts/glove/fit", body);
}

// --- The table, built once ---------------------------------------------------

export interface CountedPair {
  word: string;
  context: string;
  count: number;
  logarithm: number;
}

// below_one counts the cells whose logarithm is negative, which is the quantity
// the reach silently decides on short sentences.
export interface CountTable {
  words: string[];
  topics: string[];
  occurrences: number[];
  table: number[][];
  n_cells: number;
  n_nonzero: number;
  zero_share: number;
  total: number;
  largest: number;
  smallest: number;
  below_one: number;
  below_one_share: number;
  mean_logarithm: number;
  largest_pairs: CountedPair[];
  n_sentences: number;
  n_occurrences: number;
}

export async function fetchCountTable(
  text: TextChoice,
  window: number,
  weighting: WeightingName,
): Promise<CountTable> {
  return postJson<CountTable>("/concepts/glove/table", {
    text,
    window,
    weighting,
  });
}

// --- The ratio the method argues from ----------------------------------------

// ratio is null where the second word never met the probe, since the quantity
// is a division by zero and not a very large number.
export interface ProbeRow {
  probe: string;
  topic: string;
  first_probability: number;
  second_probability: number;
  ratio: number | null;
  verdict: string;
}

export interface RatioReport {
  first_word: string;
  second_word: string;
  rows: ProbeRow[];
  n_shared: number;
  n_only_first: number;
  n_only_second: number;
  n_neither: number;
}

export async function fetchRatios(
  firstWord: string,
  secondWord: string,
): Promise<RatioReport> {
  return postJson<RatioReport>("/concepts/glove/ratios", {
    first_word: firstWord,
    second_word: secondWord,
  });
}

// --- The weighting, and what the cap does ------------------------------------

export interface CurvePoint {
  count: number;
  weight: number;
}

export interface WeightedPair {
  word: string;
  context: string;
  count: number;
  weight: number;
  at_the_cap: boolean;
}

// top_pair_share and top_ten_share are the shares of the summed weights the
// largest one and the largest ten pairs carry, which is what a cap moves and a
// weight proportional to the count does not.
export interface WeightingReport {
  maximum_count: number;
  weighting_exponent: number;
  curve: CurvePoint[];
  pairs: WeightedPair[];
  n_pairs: number;
  n_at_the_cap: number;
  largest_count: number;
  largest_weight: number;
  smallest_weight: number;
  top_pair_share: number;
  top_ten_share: number;
  below_one_share_of_weight: number;
  proportional_top_ten_share: number;
  alike_top_ten_share: number;
}

export async function fetchWeighting(
  maximumCount: number,
  weightingExponent: number,
): Promise<WeightingReport> {
  return postJson<WeightingReport>("/concepts/glove/weighting", {
    maximum_count: maximumCount,
    weighting_exponent: weightingExponent,
  });
}

// --- The two step rules ------------------------------------------------------

export interface RuleReport {
  step_rule: StepRuleName;
  totals: number[];
  first_total: number;
  final_total: number;
  objective_at_rest: number;
  smallest_divisor: number;
  largest_divisor: number;
  within_topic: number;
  across_topic: number;
}

export interface StepRules {
  window: number;
  dimension: number;
  epochs: number;
  learning_rate: number;
  reports: RuleReport[];
  published_window: number;
  published_dimension: number;
  published_reports: RuleReport[];
}

let stepRulesPromise: Promise<StepRules> | null = null;

export function fetchStepRules(): Promise<StepRules> {
  if (!stepRulesPromise)
    stepRulesPromise = getJson<StepRules>("/concepts/glove/step-rules");
  return stepRulesPromise;
}

// --- What the reach decides --------------------------------------------------

// mean_dot_product is the mean of the fitted dot products over the pairs that
// co-occurred, which is where a negative mean logarithm ends up once the two
// offsets have failed to absorb it.
export interface WindowRow {
  window: number;
  n_pairs: number;
  below_one: number;
  below_one_share: number;
  mean_logarithm: number;
  within_topic: number;
  across_topic: number;
  gap: number;
  gaps_by_seed: number[];
  mean_word_bias: number;
  mean_dot_product: number;
}

export interface WindowSweep {
  seeds: number[];
  rows: WindowRow[];
}

let windowsPromise: Promise<WindowSweep> | null = null;

export function fetchWindowSweep(): Promise<WindowSweep> {
  if (!windowsPromise) windowsPromise = getJson<WindowSweep>("/concepts/glove/windows");
  return windowsPromise;
}

// --- What one pass over a table costs ----------------------------------------

// ordered_positions is how many neighbour readings a pass over the text makes
// and nonzero_pairs how many terms a pass over the table has.
export interface GrowthRow {
  copies: number;
  n_sentences: number;
  n_occurrences: number;
  n_words: number;
  nonzero_pairs: number;
  ordered_positions: number;
}

export interface CostReport {
  growth: GrowthRow[];
  n_cells: number;
  zero_share: number;
  numbers_per_word_rows: number;
  numbers_per_word_vectors: number;
  numbers_in_all_rows: number;
  numbers_in_all_vectors: number;
  table_seconds: number;
  fit_seconds: number;
  rows_within_topic: number;
  rows_across_topic: number;
  rows_gap: number;
  rows_same_topic_share: number;
  fitted_within_topic: number;
  fitted_across_topic: number;
  fitted_gap: number;
  fitted_same_topic_share: number;
  rows_neighbours: Neighbour[];
  fitted_neighbours: Neighbour[];
  compared_word: string;
}

let costPromise: Promise<CostReport> | null = null;

export function fetchCostReport(): Promise<CostReport> {
  if (!costPromise) costPromise = getJson<CostReport>("/concepts/glove/cost");
  return costPromise;
}
