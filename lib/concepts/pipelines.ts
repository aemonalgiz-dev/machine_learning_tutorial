// The pipelines page's endpoints, the leak measured over a family of thirty
// seeds at one row count, and a polynomial degree searched through a pipeline.

import { postJson } from "@/lib/api";

// One transformer's two arrangements, seed by seed and then summarised.
// outside_scores are the mean held-out R squared when the transformer was
// fitted on every row before the folds were dealt, inside_scores when it was
// refitted inside each fold, and seeds_flattered counts the seeds on which the
// outside arrangement scored higher.
export interface ArrangementGap {
  outside_scores: number[];
  inside_scores: number[];
  mean_outside: number;
  mean_inside: number;
  flattered_by: number;
  seeds_flattered: number;
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
  scaling: ArrangementGap;
  selection: ArrangementGap;
  pipeline_fitted_after_folds: boolean;
  configuration_fitted_after_folds: boolean;
}

export async function measureLeak(
  rowCount: number,
  firstSeed: number,
): Promise<LeakMeasurement> {
  return postJson<LeakMeasurement>("/concepts/pipelines/leak", {
    n_rows: rowCount,
    seed: firstSeed,
  });
}

export interface PlanePoint {
  x: number;
  y: number;
}

// Every degree the search tried and what it scored, in the order of degrees,
// with the winner and the spread between the best and worst candidate.
export interface DegreeSearch {
  degrees: number[];
  scores: number[];
  best_degree: number;
  best_score: number;
  score_spread: number;
  n_candidates: number;
  n_folds: number;
  penalty: number;
}

export async function searchDegrees(
  points: PlanePoint[],
): Promise<DegreeSearch> {
  return postJson<DegreeSearch>("/concepts/pipelines/degree-search", {
    points,
  });
}
