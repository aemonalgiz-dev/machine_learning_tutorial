// The grid-search page's endpoints: every neighbour count cross-validated on
// the reader's people with a quarter held out to judge the winner, two copies
// of one setting through one search to show the folds are pinned, a search
// space built from a name the reader typed, a two-dial grid of degree and
// penalty, the same search run on pure noise to measure how flattering the
// winner is, and a second layer of folds round the whole search.

import { Point, postJson } from "@/lib/api";

// One setting, its cross-validated score, the folds behind it and the score
// it earns on the very rows it was fitted to. fold_predictions are per fold,
// each in that fold's own row order.
export interface CandidateScore {
  n_neighbours: number;
  score: number;
  fold_scores: number[];
  fold_predictions: number[][];
  training_score: number;
}

// fold_members names, per fold, the positions of the people it judges, in
// the order the fold's predictions come back in. same_rows_score is the
// winner refitted on the searched rows and scored on those same rows.
export interface SearchOutcome {
  held_out_indices: number[];
  fold_members: number[][];
  fold_of: (number | null)[];
  candidates: CandidateScore[];
  n_candidates: number;
  n_fits: number;
  ranked_n_neighbours: number[];
  best_n_neighbours: number;
  best_score: number;
  mean_candidate_score: number;
  score_spread: number;
  honest_score: number;
  same_rows_score: number;
}

export async function searchNeighbourCounts(
  points: Point[],
  largestNeighbourCount: number,
  foldCount: number,
): Promise<SearchOutcome> {
  return postJson<SearchOutcome>("/concepts/grid-search/search", {
    points,
    n_neighbours_from: 1,
    n_neighbours_to: largestNeighbourCount,
    n_folds: foldCount,
  });
}

// pinned_scores are two copies of one setting from a single search whose
// splitter was unseeded; fresh_deal_scores are the same setting on deals
// drawn under the listed seeds.
export interface SameFoldsOutcome {
  pinned_scores: number[];
  scores_tie: boolean;
  fresh_deal_seeds: number[];
  fresh_deal_scores: number[];
  fresh_deal_spread: number;
}

export async function compareFoldDeals(
  points: Point[],
  neighbourCount: number,
  foldCount: number,
  firstSeed = 0,
  dealCount = 6,
): Promise<SameFoldsOutcome> {
  return postJson<SameFoldsOutcome>("/concepts/grid-search/same-folds", {
    points,
    n_neighbours: neighbourCount,
    n_folds: foldCount,
    first_seed: firstSeed,
    n_deals: dealCount,
  });
}

export interface CandidateDocument {
  assignments: Record<string, number>;
  built_n_neighbours: number;
}

// declared_fields are the model's hyperparameters, the list a misspelling is
// checked against.
export interface SpaceOutcome {
  declared_fields: string[];
  parameter_names: string[];
  n_candidates: number;
  candidates: CandidateDocument[];
}

export async function buildSpace(
  parameterName: string,
  values: number[],
): Promise<SpaceOutcome> {
  return postJson<SpaceOutcome>("/concepts/grid-search/space", {
    parameter_name: parameterName,
    values,
  });
}

export interface GridCell {
  degree: number;
  penalty: number;
  score: number;
}

// cells are in the order the search ran them, degree slowest. n_fits is
// n_candidates times the fold count.
export interface GridOutcome {
  n_searched: number;
  n_held_out: number;
  n_candidates: number;
  n_fits: number;
  cells: GridCell[];
  best_degree: number;
  best_penalty: number;
  best_score: number;
  worst_score: number;
  score_spread: number;
  honest_score: number;
}

export async function searchGrid(
  points: Point[],
  degrees: number[],
  penalties: number[],
  foldCount: number,
): Promise<GridOutcome> {
  return postJson<GridOutcome>("/concepts/grid-search/grid", {
    points,
    degrees,
    penalties,
    n_folds: foldCount,
  });
}

export type SearchTarget = "noise" | "signal";

// nested_score is what a second layer of folds round the whole search
// reports on the same draw, and nested_winners the setting each outer fold's
// inner search chose.
export interface OptimismOutcome {
  seed: number;
  n_candidates: number;
  target: SearchTarget;
  candidates: CandidateScore[];
  best_n_neighbours: number;
  best_score: number;
  mean_candidate_score: number;
  score_spread: number;
  refolded_score: number;
  optimism: number;
  n_draws: number;
  mean_optimism_over_draws: number;
  nested_score: number;
  nested_winners: number[];
}

// Several widgets read the same fixed draws, and each draw runs a run of
// twelve searches, so one page-load shares one answer per distinct request.
const optimismCache = new Map<string, Promise<OptimismOutcome>>();

export async function measureOptimism(
  seed: number,
  candidateCount = 25,
  target: SearchTarget = "noise",
): Promise<OptimismOutcome> {
  const body = { seed, n_candidates: candidateCount, target };
  const key = JSON.stringify(body);
  const cached = optimismCache.get(key);
  if (cached) return cached;
  const pending = postJson<OptimismOutcome>(
    "/concepts/grid-search/optimism",
    body,
  ).catch((error) => {
    optimismCache.delete(key);
    throw error;
  });
  optimismCache.set(key, pending);
  return pending;
}

// One outer fold: the setting its inner search chose, that search's own
// selection score, and the winner's score on the outer rows it never saw.
export interface OuterFoldReading {
  held_out_indices: number[];
  best_n_neighbours: number;
  best_inner_score: number;
  honest_score: number;
}

export interface NestedOutcome {
  outer_folds: OuterFoldReading[];
  mean_honest_score: number;
  honest_spread: number;
  flat_best_n_neighbours: number;
  flat_best_score: number;
  n_candidates: number;
  n_fits: number;
}

export async function nestSearch(
  points: Point[],
  outerFoldCount = 4,
  innerFoldCount = 3,
  largestNeighbourCount = 5,
): Promise<NestedOutcome> {
  return postJson<NestedOutcome>("/concepts/grid-search/nested", {
    points,
    n_outer_folds: outerFoldCount,
    n_inner_folds: innerFoldCount,
    n_neighbours_to: largestNeighbourCount,
  });
}
