// The feature-importance page's endpoint, one draw of the parity puzzle with
// a lone tree and a forest fitted on it, and both importance readings for
// both models. The shapes mirror the API's response models field for field.

import { ApiError, postJson } from "@/lib/api";

export { ApiError };

// The bounds the endpoint enforces, mirrored so the controls stop where the
// API would refuse.
export const MIN_ROWS = 200;
export const MAX_ROWS = 400;
export const MAX_SEED = 9999;

// The draw the page works by hand, which is the library's own parity fixture.
export const WORKED_ROWS = 300;
export const WORKED_SEED = 4;

export interface ImportanceShare {
  name: string;
  share: number;
}

export interface SplitCredit {
  feature: string;
  depth: number;
  n_rows: number;
  gain: number;
  credit: number;
}

export interface FeatureCredit {
  name: string;
  credit: number;
}

export interface ShuffleStep {
  name: string;
  shuffled_score: number;
  drop: number;
}

export interface ModelReport {
  training_accuracy: number;
  held_out_accuracy: number;
  impurity: ImportanceShare[];
  permutation: ImportanceShare[];
  leading_by_impurity: string;
  leading_by_permutation: string;
  intact_score: number;
  shuffles: ShuffleStep[];
  drop_total: number;
}

export interface LoneTreeReport extends ModelReport {
  splits: SplitCredit[];
  credits: FeatureCredit[];
  credit_total: number;
}

export interface ImportanceMeasurement {
  n_rows: number;
  feature_names: string[];
  lone_tree: LoneTreeReport;
  forest: ModelReport;
}

export async function measureImportance(
  rowCount: number,
  seed: number,
): Promise<ImportanceMeasurement> {
  return postJson<ImportanceMeasurement>(
    "/concepts/feature-importance/measure",
    { n_rows: rowCount, seed },
  );
}
