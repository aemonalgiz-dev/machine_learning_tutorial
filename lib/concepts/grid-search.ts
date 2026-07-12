// The grid-search page's endpoints: every neighbour count cross-validated on
// the reader's points with a quarter held out to judge the winner, and the
// same search run on pure noise to measure how flattering the winner is.

import { postJson } from "@/lib/api";

export interface SearchPoint {
  x: number;
  y: number;
}

export interface CandidateScore {
  n_neighbours: number;
  score: number;
  fold_scores: number[];
}

export interface SearchOutcome {
  held_out_indices: number[];
  fold_of: (number | null)[];
  candidates: CandidateScore[];
  best_n_neighbours: number;
  best_score: number;
  mean_candidate_score: number;
  score_spread: number;
  honest_score: number;
}

export interface OptimismOutcome {
  seed: number;
  candidates: CandidateScore[];
  best_n_neighbours: number;
  best_score: number;
  mean_candidate_score: number;
  score_spread: number;
  refolded_score: number;
  optimism: number;
  n_draws: number;
  mean_optimism_over_draws: number;
}

export async function searchNeighbourCounts(
  points: SearchPoint[],
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

export async function measureOptimism(seed: number): Promise<OptimismOutcome> {
  return postJson<OptimismOutcome>("/concepts/grid-search/optimism", { seed });
}
