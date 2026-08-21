// The multiclass-classification page's endpoint: a three-class crowd scored
// by one of two routes, softmax or one-vs-rest, with every person's class
// scores, the scores before the squash, and each row's total.

import { RegionGrid, postJson } from "@/lib/api";

export type MulticlassRoute = "softmax" | "one_vs_rest";

export interface ClassedPoint {
  x: number;
  y: number;
  label: number;
}

export interface ClassFitDocument {
  class_index: number;
  positive_rows: number;
  epochs_run: number;
  converged: boolean;
}

// One class's score as an intercept and a weight per standardised column.
export interface ClassCoefficients {
  class_index: number;
  intercept: number;
  height: number;
  weight: number;
}

export interface MulticlassAnswer {
  route: MulticlassRoute;
  predictions: number[];
  scores: number[][];
  linear_scores: number[][];
  row_sums: number[];
  accuracy: number;
  epochs_run: number | null;
  converged: boolean | null;
  class_fits: ClassFitDocument[];
  regions: RegionGrid;
  standardised_points: number[][];
  class_coefficients: ClassCoefficients[];
  // [class][row][column], the linear score at each cell of the region lattice.
  score_lattice: number[][][];
  correct_class_scores: number[];
  log_loss: number;
  coefficient_norm: number;
}

export async function classifyAmongThree(
  points: ClassedPoint[],
  route: MulticlassRoute,
  maxEpochs?: number,
): Promise<MulticlassAnswer> {
  return postJson<MulticlassAnswer>(
    "/concepts/multiclass-classification/classify",
    maxEpochs === undefined ? { points, route } : { points, route, max_epochs: maxEpochs },
  );
}

export interface SoftmaxPass {
  pass_number: number;
  coefficient_norm: number;
  log_loss: number;
  accuracy: number;
  correct_class_probabilities: number[];
}

export interface SoftmaxWalk {
  passes: SoftmaxPass[];
  converged: boolean;
  passes_run: number;
}

export async function walkSoftmax(
  points: ClassedPoint[],
  maxEpochs: number,
): Promise<SoftmaxWalk> {
  return postJson<SoftmaxWalk>("/concepts/multiclass-classification/walk", {
    points,
    max_epochs: maxEpochs,
  });
}
