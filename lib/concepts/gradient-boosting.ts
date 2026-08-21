// Client functions for the gradient boosting page.
//
// Every number here is computed by the API. The model endpoint is one fit
// read out for drawing, the rounds endpoint the same fit replayed one member
// at a time so the stepper can show what each round was handed and what it
// left, the curves endpoint a training and a held-out score after every
// round for each configuration asked about, and the comparison endpoint
// three committees of one size on one seeded deal. The fixed requests are
// cached in module-level promises, because several widgets on the page read
// the same sixty-measurement throw.

import { CurvePoint, Point, postJson } from "@/lib/api";

export interface BoostedModel {
  initial_prediction: number;
  r_squared: number;
  residual_sum_of_squares: number;
  total_leaves: number;
  predictions: number[];
  curve: CurvePoint[];
}

export async function fitBoostedModel(
  points: Point[],
  rounds: number,
  learningRate: number,
  maxDepth = 1,
): Promise<BoostedModel> {
  return postJson<BoostedModel>("/concepts/ensembles/boosting-model", {
    points,
    rounds,
    learning_rate: learningRate,
    max_depth: maxDepth,
  });
}

// One round as the stepper reads it. The residuals are what the committee
// so far had wrong when the round began, which is the target its member was
// fitted to; the threshold and two leaf values are set for a stump and the
// leaf values are null for a deeper member.
export interface RoundDocument {
  number: number;
  residuals_before: number[];
  residual_sum_before: number;
  threshold: number | null;
  left_value: number | null;
  right_value: number | null;
  n_leaves: number;
  member_predictions: number[];
  member_curve: number[];
  running_predictions: number[];
  running_curve: number[];
  residual_sum_after: number;
  r_squared_after: number;
}

export interface BoostingRounds {
  initial_prediction: number;
  residual_sum_at_start: number;
  grid: number[];
  rounds: RoundDocument[];
}

const roundsCache = new Map<string, Promise<BoostingRounds>>();

export async function stepBoostingRounds(
  points: Point[],
  rounds: number,
  learningRate: number,
  maxDepth = 1,
): Promise<BoostingRounds> {
  const body = { points, rounds, learning_rate: learningRate, max_depth: maxDepth };
  const key = JSON.stringify(body);
  const cached = roundsCache.get(key);
  if (cached) return cached;
  const pending = postJson<BoostingRounds>("/concepts/ensembles/boosting-rounds", body).catch(
    (error) => {
      roundsCache.delete(key);
      throw error;
    },
  );
  roundsCache.set(key, pending);
  return pending;
}

export interface CurveConfiguration {
  learning_rate: number;
  max_depth: number;
}

// Scores after every round, round zero the flat start. best_round is the
// first round at which the held-out score reached its highest value, and
// rounds_to_train the first round at which the training score passed the
// response's train_threshold, null if it never did.
export interface LearningCurve {
  learning_rate: number;
  max_depth: number;
  train_r_squared: number[];
  held_out_r_squared: number[];
  best_round: number;
  best_held_out_r_squared: number;
  final_train_r_squared: number;
  final_held_out_r_squared: number;
  rounds_to_train: number | null;
}

export interface LearningCurves {
  held_out_indices: number[];
  n_training: number;
  n_held_out: number;
  train_threshold: number;
  curves: LearningCurve[];
}

const curvesCache = new Map<string, Promise<LearningCurves>>();

export async function traceLearningCurves(
  points: Point[],
  maxRounds: number,
  configurations: CurveConfiguration[],
): Promise<LearningCurves> {
  const body = { points, max_rounds: maxRounds, configurations };
  const key = JSON.stringify(body);
  const cached = curvesCache.get(key);
  if (cached) return cached;
  const pending = postJson<LearningCurves>("/concepts/ensembles/boosting-curves", body).catch(
    (error) => {
      curvesCache.delete(key);
      throw error;
    },
  );
  curvesCache.set(key, pending);
  return pending;
}

// What one member was fitted to: the times it saw and the value it was asked
// to predict at each. A bagged member lists resampled heights with repeats,
// a boosted member every training time against the residual its round
// began with.
export interface FittedTarget {
  position: number;
  times: number[];
  targets: number[];
  distinct_rows: number;
}

export interface CommitteeScores {
  name: string;
  train_r_squared: number;
  held_out_r_squared: number;
  out_of_bag_r_squared: number | null;
  curve: CurvePoint[];
  fitted_targets: FittedTarget[];
}

export interface VersusBagging {
  held_out_indices: number[];
  training_times: number[];
  training_heights: number[];
  bagged_deep: CommitteeScores;
  bagged_stumps: CommitteeScores;
  boosted: CommitteeScores;
}

const versusCache = new Map<string, Promise<VersusBagging>>();

export async function compareWithBagging(
  points: Point[],
  nMembers: number,
  learningRate: number,
  maxDepth = 1,
): Promise<VersusBagging> {
  const body = {
    points,
    n_members: nMembers,
    learning_rate: learningRate,
    max_depth: maxDepth,
  };
  const key = JSON.stringify(body);
  const cached = versusCache.get(key);
  if (cached) return cached;
  const pending = postJson<VersusBagging>(
    "/concepts/ensembles/boosting-versus-bagging",
    body,
  ).catch((error) => {
    versusCache.delete(key);
    throw error;
  });
  versusCache.set(key, pending);
  return pending;
}
