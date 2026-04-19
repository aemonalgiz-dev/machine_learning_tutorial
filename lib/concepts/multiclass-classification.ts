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
}

export async function classifyAmongThree(
  points: ClassedPoint[],
  route: MulticlassRoute,
): Promise<MulticlassAnswer> {
  return postJson<MulticlassAnswer>(
    "/concepts/multiclass-classification/classify",
    { points, route },
  );
}
