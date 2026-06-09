// The judging-a-classifier page's endpoints: one crowd judged at a chosen
// threshold with everything the threshold sweep draws beside it, a
// three-class crowd judged through the wider table with the width stated
// or inferred, and the two-class crowd folded and scored two ways.

import { LabelledPoint, RegionGrid, postJson } from "@/lib/api";

export interface ConfusionCounts {
  true_positives: number;
  true_negatives: number;
  false_positives: number;
  false_negatives: number;
}

// Precision is null when the threshold called nobody positive, which leaves
// it zero over zero rather than zero, and the F-scores are null wherever
// precision is or where both rates are zero.
export interface Rates {
  accuracy: number;
  precision: number | null;
  recall: number;
  specificity: number;
  false_positive_rate: number;
  f_one: number | null;
  f_half: number | null;
  f_two: number | null;
}

// What calling everybody the majority class scores on the same crowd.
export interface Baseline {
  majority_label: number;
  accuracy: number;
  precision: number | null;
  recall: number;
}

export interface ThresholdReading {
  threshold: number;
  true_positives: number;
  false_positives: number;
  false_negatives: number;
  true_negatives: number;
  accuracy: number;
  precision: number | null;
  recall: number;
  false_positive_rate: number;
  f_one: number | null;
  f_half: number | null;
  f_two: number | null;
}

// One corner of the receiver operating characteristic, read at one distinct
// chance. The first corner is nobody called, whose threshold is null.
export interface RocPoint {
  threshold: number | null;
  false_positive_rate: number;
  recall: number;
}

export interface PrecisionRecallPoint {
  threshold: number;
  recall: number;
  precision: number;
}

export interface BestThreshold {
  threshold: number;
  value: number;
}

// People whose chance fell in one fifth, and how many really were adults.
// The mean and the share are null for an empty bin.
export interface ReliabilityBin {
  lower: number;
  upper: number;
  count: number;
  mean_probability: number | null;
  observed_share: number | null;
}

export interface Reliability {
  bins: ReliabilityBin[];
  expected_calibration_error: number;
  brier_score: number;
  mean_probability: number;
  observed_rate: number;
}

export interface ClassifierEvaluation {
  probabilities: number[];
  predictions: number[];
  prevalence: number;
  counts: ConfusionCounts;
  rates: Rates;
  baseline: Baseline;
  curve: ThresholdReading[];
  roc: RocPoint[];
  roc_area: number;
  precision_recall: PrecisionRecallPoint[];
  average_precision: number;
  best: Record<"f_half" | "f_one" | "f_two", BestThreshold>;
  reliability: Reliability;
  epochs_run: number;
  converged: boolean;
  regions: RegionGrid;
}

// Several widgets read the page's fixed crowds at the halfway threshold,
// and the endpoint refits and sweeps each time, so one page-load shares one
// answer per distinct request rather than asking eight times.
const evaluationCache = new Map<string, Promise<ClassifierEvaluation>>();

export async function evaluateAtThreshold(
  points: LabelledPoint[],
  threshold: number,
): Promise<ClassifierEvaluation> {
  const body = { points, threshold };
  const key = JSON.stringify(body);
  const cached = evaluationCache.get(key);
  if (cached) return cached;
  const pending = postJson<ClassifierEvaluation>(
    "/concepts/judging-a-classifier/evaluate",
    body,
  ).catch((error) => {
    evaluationCache.delete(key);
    throw error;
  });
  evaluationCache.set(key, pending);
  return pending;
}

// One class's row and column of the three-class table. Precision is null
// when the model never called this class, recall when no judged row belongs
// to it, and F1 when either is or both are zero.
export interface ClassReading {
  class_index: number;
  name: string;
  actually_are: number;
  predicted_as: number;
  true_positives: number;
  precision: number | null;
  recall: number | null;
  f_one: number | null;
}

export interface MulticlassJudgement {
  n_classes: number;
  class_names: string[];
  width_was_stated: boolean;
  n_judged: number;
  counts: number[][];
  accuracy: number;
  classes: ClassReading[];
  macro_precision: number | null;
  macro_recall: number | null;
  macro_f_one: number | null;
  micro_precision: number;
  micro_recall: number;
  predictions: number[];
  judged_labels: number[];
}

export interface MulticlassOptions {
  // Which rows of the crowd to judge, in request order; left out means all.
  judged?: number[];
  // The class count handed to the evaluation; left out means it is inferred
  // from the judged rows' true classes.
  statedWidth?: number;
}

export async function judgeThreeClasses(
  points: { x: number; y: number; label: number }[],
  options: MulticlassOptions = {},
): Promise<MulticlassJudgement> {
  return postJson<MulticlassJudgement>(
    "/concepts/judging-a-classifier/multiclass",
    {
      points,
      ...(options.judged === undefined ? {} : { judged: options.judged }),
      ...(options.statedWidth === undefined
        ? {}
        : { stated_width: options.statedWidth }),
    },
  );
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
