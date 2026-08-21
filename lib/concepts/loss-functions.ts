// The loss-functions page's endpoints: five losses asked at one raw output,
// the same five swept across a range, three of them on a whole batch of
// guessed weights, one on a batch of yes-or-no scores, one across a row of
// class scores, and one linear neuron walked down each regression loss.

import { Point, postJson } from "@/lib/api";

export type YesOrNo = 0 | 1;

export interface LossSetting {
  target: number;
  label: YesOrNo;
  huber_threshold: number;
}

// The slope by nudging and its disagreement are filled by the point
// measurement and left null by the curve, which does not nudge.
export interface LossReading {
  value: number;
  gradient: number;
  probability: number | null;
  slope_by_nudging: number | null;
  disagreement: number | null;
}

export type LossName =
  | "squared_error"
  | "absolute_error"
  | "huber_error"
  | "binary_cross_entropy"
  | "softmax_cross_entropy";

// The five, and the pairing the page argues against, a sigmoid output scored
// by squared error, which the API computes through a one-neuron layer.
export type ReadingName = LossName | "sigmoid_then_squared";

export const LOSS_NAMES: LossName[] = [
  "squared_error",
  "absolute_error",
  "huber_error",
  "binary_cross_entropy",
  "softmax_cross_entropy",
];

export type SixReadings = Record<ReadingName, LossReading>;

export interface LossMeasurement {
  raw_output: number;
  nudge: number;
  readings: SixReadings;
}

export interface CurveSample {
  raw_output: number;
  value: number;
  gradient: number;
  probability: number | null;
}

export type LossCurves = Record<ReadingName, CurveSample[]>;

export async function measureLosses(
  setting: LossSetting,
  rawOutput: number,
): Promise<LossMeasurement> {
  return postJson<LossMeasurement>("/concepts/loss-functions/measure", {
    ...setting,
    raw_output: rawOutput,
  });
}

export async function traceLossCurves(
  setting: LossSetting,
  sampleCount: number,
): Promise<LossCurves> {
  return postJson<LossCurves>("/concepts/loss-functions/curve", {
    ...setting,
    n_samples: sampleCount,
  });
}

// --- A whole batch --------------------------------------------------------

export interface PredictedRow {
  prediction: number;
  truth: number;
}

// One loss on a whole batch. The row costs are each row's own cost before the
// division by the row count, so they sum to the total and the value is that
// total over the rows; the gradients carry the division; the pull shares are
// each row's slice of the batch's total pull.
export interface BatchReading {
  value: number;
  row_costs: number[];
  total_row_cost: number;
  gradients: number[];
  pull_shares: number[];
  largest_pull_share: number;
}

export type RegressionLossName = "squared_error" | "absolute_error" | "huber_error";

export const REGRESSION_LOSS_NAMES: RegressionLossName[] = [
  "squared_error",
  "absolute_error",
  "huber_error",
];

export interface RegressionBatch {
  n_rows: number;
  misses: number[];
  inside_knee: boolean[];
  squared_error: BatchReading;
  absolute_error: BatchReading;
  huber_error: BatchReading;
}

export async function scoreRegressionBatch(
  rows: PredictedRow[],
  huberThreshold: number,
): Promise<RegressionBatch> {
  return postJson<RegressionBatch>("/concepts/loss-functions/regression-batch", {
    rows,
    huber_threshold: huberThreshold,
  });
}

export interface ScoredRow {
  score: number;
  label: YesOrNo;
}

export interface ClassificationBatch {
  n_rows: number;
  probabilities: number[];
  binary_cross_entropy: BatchReading;
  accuracy: number;
}

export async function scoreClassificationBatch(
  rows: ScoredRow[],
): Promise<ClassificationBatch> {
  return postJson<ClassificationBatch>(
    "/concepts/loss-functions/classification-batch",
    { rows },
  );
}

// --- One row of class scores ---------------------------------------------

export interface SoftmaxRow {
  probabilities: number[];
  value: number;
  gradient: number[];
  gradient_sum: number;
}

export async function scoreSoftmaxRow(
  logits: number[],
  trueClass: number,
): Promise<SoftmaxRow> {
  return postJson<SoftmaxRow>("/concepts/loss-functions/softmax-row", {
    logits,
    true_class: trueClass,
  });
}

// --- One linear neuron, three losses, three lines --------------------------

// Where one loss walked the line to. The final largest movement is the
// biggest slope left in the neuron on the last epoch, near zero for a walk
// that settled and the size of its step for one that is still stepping.
export interface DescendedLine {
  slope: number;
  intercept: number;
  predictions: number[];
  residuals: number[];
  starting_loss: number;
  final_loss: number;
  final_largest_movement: number;
  loss_history: number[];
}

export interface DescendedLines {
  n_rows: number;
  squared_error: DescendedLine;
  absolute_error: DescendedLine;
  huber_error: DescendedLine;
  least_squares: { slope: number; intercept: number };
  descent_gap: number;
}

export async function descendLine(
  points: Point[],
  huberThreshold: number,
): Promise<DescendedLines> {
  return postJson<DescendedLines>("/concepts/loss-functions/descend-line", {
    points,
    huber_threshold: huberThreshold,
  });
}
