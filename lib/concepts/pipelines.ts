// The pipelines page's endpoints: one chain followed through one fit and one
// predict with its configuration read back, the leak measured over a family
// of thirty seeds, a degree and a penalty searched through the chain, the two
// orders of the steps compared, and every edge in the last part's table.

import { Point, getJson, postJson } from "@/lib/api";

// A refusal by name and in the library's own words.
export interface Refusal {
  error: string;
  detail: string;
}

export interface LearnedScaling {
  name: string;
  mean: number;
  standard_deviation: number;
}

// One step of the fitted chain: the columns it read, the columns it produced,
// and what it learned, which is empty for the expansion and one centre and
// spread per column for the standardizer.
export interface StepReport {
  name: string;
  reads: string[];
  produces: string[];
  learned: LearnedScaling[];
}

export interface HeldOutPerson {
  index: number;
  height: number;
  weight: number;
  standardized_height: number;
  predicted_weight: number;
}

export interface NamedValue {
  name: string;
  value: number;
}

export interface FoldReport {
  fold: number;
  n_training: number;
  n_held_out: number;
  r2_score: number;
  gap_to_fresh_fit: number;
}

// Everything one fit learned, and every check on the configuration
// afterwards: the four booleans read off the one object, the refit gap to a
// fresh chain, the refusal a broken refit met and how far the predictions
// moved, and the same object handed to every fold.
export interface ChainAnatomy {
  n_training: number;
  n_held_out: number;
  degree: number;
  penalty: number;
  steps: StepReport[];
  held_out: HeldOutPerson[];
  held_out_r2: number;
  training_r2: number;
  alone: Refusal;
  coefficients: NamedValue[];
  intercept: number;
  mean_before_predict: number;
  mean_after_predict: number;
  configuration_model_fitted: boolean;
  configuration_steps_fitted: boolean[];
  fitted_model_fitted: boolean;
  fitted_parts_are_separate: boolean;
  refit_gap: number;
  failed_refit: Refusal;
  still_fitted_after_failed_refit: boolean;
  predictions_after_failed_refit_gap: number;
  n_folds: number;
  fold_seed: number;
  folds: FoldReport[];
  mean_fold_r2: number;
  configuration_fitted_after_folds: boolean;
  pipeline_fitted_after_folds: boolean;
  no_steps_gap: number;
}

const anatomyCache = new Map<string, Promise<ChainAnatomy>>();

// Several widgets follow the same chain on the same people, so one request
// serves them all; a failed request is forgotten so a retry can succeed.
export function fetchAnatomy(
  points: Point[],
  heldOut: number[],
  degree: number,
  penalty: number,
  folds: number,
  seed: number,
): Promise<ChainAnatomy> {
  const key = JSON.stringify([points, heldOut, degree, penalty, folds, seed]);
  const cached = anatomyCache.get(key);
  if (cached) return cached;
  const request = postJson<ChainAnatomy>("/concepts/pipelines/anatomy", {
    points,
    held_out: heldOut,
    degree,
    penalty,
    n_folds: folds,
    seed,
  }).catch((error) => {
    anatomyCache.delete(key);
    throw error;
  });
  anatomyCache.set(key, request);
  return request;
}

// One transformer's two arrangements, seed by seed and then summarised.
// outside_scores are the mean held-out R squared when the transformer was
// fitted on every row before the folds were dealt, inside_scores when it was
// refitted inside each fold, seeds_flattered counts the seeds on which the
// outside arrangement scored higher, and largest_gap is the largest
// single-seed gap in size.
export interface ArrangementGap {
  outside_scores: number[];
  inside_scores: number[];
  mean_outside: number;
  mean_inside: number;
  flattered_by: number;
  seeds_flattered: number;
  largest_gap: number;
}

// scaling is the standardizer, which never reads the target, and selection is
// a column chosen by its correlation with a target of pure noise. The two
// booleans describe the one pipeline object that was handed to every fold.
export interface LeakMeasurement {
  n_rows: number;
  first_seed: number;
  n_seeds: number;
  n_folds: number;
  n_neighbours: number;
  n_noise_columns: number;
  training_share: number;
  scaling: ArrangementGap;
  selection: ArrangementGap;
  pipeline_fitted_after_folds: boolean;
  configuration_fitted_after_folds: boolean;
}

const leakCache = new Map<string, Promise<LeakMeasurement>>();

export function measureLeak(
  rowCount: number,
  firstSeed: number,
): Promise<LeakMeasurement> {
  const key = `${rowCount}|${firstSeed}`;
  const cached = leakCache.get(key);
  if (cached) return cached;
  const request = postJson<LeakMeasurement>("/concepts/pipelines/leak", {
    n_rows: rowCount,
    seed: firstSeed,
  }).catch((error) => {
    leakCache.delete(key);
    throw error;
  });
  leakCache.set(key, request);
  return request;
}

// One candidate of the search, a whole chain at one degree and one penalty.
export interface SearchCell {
  degree: number;
  penalty: number;
  score: number;
}

// Every candidate scored, the winner, and the two refusals the page quotes:
// the ridge model asked for a degree it does not have, and a misspelt chain
// field met at construction.
export interface ChainSearch {
  cells: SearchCell[];
  best_degree: number;
  best_penalty: number;
  best_score: number;
  score_spread: number;
  n_candidates: number;
  n_folds: number;
  n_fits: number;
  model_hyperparameters: string[];
  chain_hyperparameters: string[];
  degree_on_model: Refusal;
  misspelt_field: Refusal;
}

export function searchChain(
  points: Point[],
  degrees: number[],
  penalties: number[],
  folds: number,
  seed: number,
): Promise<ChainSearch> {
  return postJson<ChainSearch>("/concepts/pipelines/search", {
    points,
    degrees,
    penalties,
    n_folds: folds,
    seed,
  });
}

export interface OrderAtPenalty {
  penalty: number;
  expand_then_scale_score: number;
  scale_then_expand_score: number;
  held_out_gap: number;
}

// One column as the model met it under one order of the steps.
export interface ColumnAsSeen {
  name: string;
  mean: number;
  standard_deviation: number;
  coefficient: number;
}

export interface StepOrder {
  degree: number;
  sweep: OrderAtPenalty[];
  shown_penalty: number;
  expand_then_scale_columns: ColumnAsSeen[];
  scale_then_expand_columns: ColumnAsSeen[];
  least_squares_gap: number;
}

export function compareOrders(
  points: Point[],
  penalties: number[],
  heldOut: number[],
  degree: number,
  folds: number,
  seed: number,
): Promise<StepOrder> {
  return postJson<StepOrder>("/concepts/pipelines/order", {
    points,
    penalties,
    held_out: heldOut,
    degree,
    n_folds: folds,
    seed,
  });
}

// One edge put to the chain. accepted carries the answer, refused a typed
// refusal by name, and escaped a bare failure the page reports as documented
// rather than defended.
export interface ContractProbe {
  edge: string;
  outcome: "accepted" | "refused" | "escaped";
  result: string | null;
  error: string | null;
  detail: string | null;
}

export interface ChainContracts {
  probes: ContractProbe[];
}

let contractsCache: Promise<ChainContracts> | null = null;

export function fetchChainContracts(): Promise<ChainContracts> {
  if (!contractsCache) {
    contractsCache = getJson<ChainContracts>(
      "/concepts/pipelines/contracts",
    ).catch((error) => {
      contractsCache = null;
      throw error;
    });
  }
  return contractsCache;
}
