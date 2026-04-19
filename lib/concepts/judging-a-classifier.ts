// The judging-a-classifier page's endpoints: one crowd judged at a chosen
// threshold with the whole threshold sweep beside it, and the same crowd
// folded, scored two ways.

import { LabelledPoint, RegionGrid, postJson } from "@/lib/api";

export interface ConfusionCounts {
  true_positives: number;
  true_negatives: number;
  false_positives: number;
  false_negatives: number;
}

// Precision is null when the threshold called nobody positive, which leaves it
// zero over zero rather than zero.
export interface Rates {
  accuracy: number;
  precision: number | null;
  recall: number;
  specificity: number;
}

export interface ThresholdReading {
  threshold: number;
  precision: number | null;
  recall: number;
}

export interface ClassifierEvaluation {
  probabilities: number[];
  predictions: number[];
  counts: ConfusionCounts;
  rates: Rates;
  curve: ThresholdReading[];
  regions: RegionGrid;
}

// One fold's held-out rows. Recall is null when the fold held no positive at
// all, which is the zero over zero that averaging has to paper over.
export interface FoldReading {
  held_out: number;
  positives_held_out: number;
  accuracy: number;
  precision: number | null;
  recall: number | null;
}

export interface FoldedScores {
  folds: FoldReading[];
  mean_fold_accuracy: number;
  pooled_accuracy: number;
  pooled_precision: number | null;
  pooled_recall: number;
  pooled_macro_precision: number | null;
  pooled_macro_recall: number;
  accuracy_spread: number;
  classes_missing_from_a_fold: number;
}

export async function evaluateAtThreshold(
  points: LabelledPoint[],
  threshold: number,
): Promise<ClassifierEvaluation> {
  return postJson<ClassifierEvaluation>(
    "/concepts/judging-a-classifier/evaluate",
    { points, threshold },
  );
}

export async function foldTheCrowd(
  points: LabelledPoint[],
  foldCount: number,
  stratified: boolean,
): Promise<FoldedScores> {
  return postJson<FoldedScores>("/concepts/judging-a-classifier/fold", {
    points,
    n_folds: foldCount,
    stratified,
  });
}
