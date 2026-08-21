// The held-out evaluation page's further endpoints: the same split dealt
// under a family of seeds, the folds dealt and scored one at a time, the
// labelled crowd folded plain or stratified, and the leak measured on the
// throw. The three original endpoints, the fixed split, the gap curve and
// the validation curve, stay in lib/api.ts because the polynomial page
// shares two of them.

import { LabelledPoint, Point, postJson } from "@/lib/api";

// One seed's deal and the two scores it produced.
export interface SeededSplit {
  seed: number;
  held_out_indices: number[];
  train_r_squared: number;
  held_out_r_squared: number;
}

// The same fit judged under every seed in the family. held_out_spread is the
// highest held-out score less the lowest.
export interface SplitFamily {
  n_training: number;
  n_held_out: number;
  splits: SeededSplit[];
  mean_train_r_squared: number;
  mean_held_out_r_squared: number;
  lowest_held_out_r_squared: number;
  highest_held_out_r_squared: number;
  held_out_spread: number;
}

export async function dealSplitFamily(
  points: Point[],
  degree: number,
  heldOutFraction: number,
  firstSeed = 0,
  seedCount = 30,
): Promise<SplitFamily> {
  return postJson<SplitFamily>("/concepts/evaluation/split-family", {
    points,
    degree,
    held_out_fraction: heldOutFraction,
    first_seed: firstSeed,
    n_seeds: seedCount,
  });
}

// One fold's held-out rows and what the fit made of them. r_squared is null
// on a fold of one row, where the held-out share has no spread to explain.
export interface FoldReading {
  held_out_indices: number[];
  n_held_out: number;
  r_squared: number | null;
  residual_sum_of_squares: number;
  mean_squared_error: number;
}

// The mean and spread are null whenever any fold's score is undefined; the
// pooled figures score every held-out prediction at once and always exist.
export interface FoldDeal {
  folds: FoldReading[];
  n_fits: number;
  mean_r_squared: number | null;
  spread: number | null;
  pooled_r_squared: number;
  pooled_mean_squared_error: number;
}

export async function dealFolds(
  points: Point[],
  degree: number,
  foldCount: number,
  seed = 4,
): Promise<FoldDeal> {
  return postJson<FoldDeal>("/concepts/evaluation/fold-deal", {
    points,
    degree,
    n_folds: foldCount,
    seed,
  });
}

// One fold of the crowd. recall is null on a fold holding no adult, where it
// is zero over zero.
export interface ClassifierFoldReading {
  held_out_indices: number[];
  n_held_out: number;
  positives_held_out: number;
  correct: number;
  true_positives: number;
  accuracy: number;
  recall: number | null;
}

// mean_fold_accuracy averages the folds; pooled_accuracy adds the folds'
// tables and divides once. mean_defined_recall averages recall over the
// folds where it exists, which is the convention averaging is forced into.
export interface ClassifierFolds {
  folds: ClassifierFoldReading[];
  classes_missing_from_a_fold: number;
  mean_fold_accuracy: number;
  pooled_accuracy: number;
  accuracy_spread: number;
  folds_with_defined_recall: number;
  mean_defined_recall: number | null;
  pooled_recall: number | null;
  pooled_true_positives: number;
  pooled_actual_positives: number;
}

export async function foldClassifier(
  points: LabelledPoint[],
  foldCount: number,
  stratified: boolean,
  seed = 4,
): Promise<ClassifierFolds> {
  return postJson<ClassifierFolds>("/concepts/evaluation/classifier-folds", {
    points,
    n_folds: foldCount,
    stratified,
    seed,
  });
}

// One model's two arrangements of the standardiser, seed by seed and then
// summarised. flattered_by is outside less inside, averaged over the seeds.
export interface ArrangementScores {
  outside_scores: number[];
  inside_scores: number[];
  mean_outside: number;
  mean_inside: number;
  flattered_by: number;
  seeds_flattered: number;
  largest_absolute_gap: number;
}

export interface LeakMeasurement {
  n_rows: number;
  n_folds: number;
  degree: number;
  penalty: number;
  ridge: ArrangementScores;
  least_squares: ArrangementScores;
}

export async function measureThrowLeak(
  points: Point[],
  degree: number,
  penalty: number,
): Promise<LeakMeasurement> {
  return postJson<LeakMeasurement>("/concepts/evaluation/leak", {
    points,
    degree,
    penalty,
  });
}
