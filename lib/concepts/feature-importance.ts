// The feature-importance page's endpoints. One draw of the parity puzzle
// with a lone tree and a forest fitted on it and every importance reading
// for both; the site's crowd with the lone tree's splits accounted for one
// at a time; a larger drawn crowd with two columns a reader should distrust,
// fitted in six arrangements; and the library's behaviour at each edge. The
// shapes mirror the API's response models field for field.

import { ApiError, LabelledPoint, getJson, postJson } from "@/lib/api";

export { ApiError };

// The bounds the parity endpoint enforces, mirrored so the controls stop
// where the API would refuse.
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

// The scramble experiment on one set of rows. `shares` is null when the
// library refused because no column's scramble lowered the score, and
// `refusal` then carries its words.
export interface ScrambleReading {
  intact_score: number;
  steps: ShuffleStep[];
  drop_total: number;
  shares: ImportanceShare[] | null;
  leading: string | null;
  refusal: string | null;
}

export type RowChoice = "training" | "held_out";

export interface ModelReport {
  training_accuracy: number;
  held_out_accuracy: number;
  impurity: ImportanceShare[];
  leading_by_impurity: string;
  training: ScrambleReading;
  held_out: ScrambleReading;
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

// Several widgets read the worked draw, so one page load shares one answer
// per distinct request rather than asking for it again.
const measureCache = new Map<string, Promise<ImportanceMeasurement>>();

export async function measureImportance(
  rowCount: number,
  seed: number,
): Promise<ImportanceMeasurement> {
  const body = { n_rows: rowCount, seed };
  const key = JSON.stringify(body);
  const cached = measureCache.get(key);
  if (cached) return cached;
  const pending = postJson<ImportanceMeasurement>(
    "/concepts/feature-importance/measure",
    body,
  ).catch((error) => {
    measureCache.delete(key);
    throw error;
  });
  measureCache.set(key, pending);
  return pending;
}

// --- The ledger: the site's crowd, one split at a time ---------------------

export interface LedgerSplit {
  order: number;
  feature: string;
  threshold: number;
  depth: number;
  n_rows: number;
  impurity: number;
  gain: number;
  credit: number;
  running_credits: FeatureCredit[];
  running_shares: ImportanceShare[];
}

export interface LedgerTree {
  depth: number;
  n_leaves: number;
  n_splits: number;
  training_accuracy: number;
  splits: LedgerSplit[];
  credits: FeatureCredit[];
  credit_total: number;
  impurity: ImportanceShare[];
  training: ScrambleReading;
}

export interface LedgerForest {
  n_members: number;
  max_features: number;
  training_accuracy: number;
  out_of_bag_accuracy: number;
  impurity: ImportanceShare[];
  member_shares: ImportanceShare[][];
  roots: FeatureCredit[];
  training: ScrambleReading;
}

export interface Ledger {
  feature_names: string[];
  tree: LedgerTree;
  forest: LedgerForest;
}

export interface LedgerOptions {
  maxDepth?: number;
  nMembers?: number;
  maxFeatures?: number;
  seed?: number;
}

const ledgerCache = new Map<string, Promise<Ledger>>();

export async function fetchLedger(
  points: LabelledPoint[],
  options: LedgerOptions = {},
): Promise<Ledger> {
  const body = {
    points,
    ...(options.maxDepth === undefined ? {} : { max_depth: options.maxDepth }),
    ...(options.nMembers === undefined ? {} : { n_members: options.nMembers }),
    ...(options.maxFeatures === undefined ? {} : { max_features: options.maxFeatures }),
    ...(options.seed === undefined ? {} : { seed: options.seed }),
  };
  const key = JSON.stringify(body);
  const cached = ledgerCache.get(key);
  if (cached) return cached;
  const pending = postJson<Ledger>("/concepts/feature-importance/ledger", body).catch(
    (error) => {
      ledgerCache.delete(key);
      throw error;
    },
  );
  ledgerCache.set(key, pending);
  return pending;
}

// --- The drawn crowd: four columns, six arrangements -----------------------

export interface FeatureCount {
  name: string;
  count: number;
}

export interface ArrangementModel {
  training_accuracy: number;
  held_out_accuracy: number;
  out_of_bag_accuracy: number | null;
  n_splits: number;
  depth: number;
  split_counts: FeatureCount[];
  impurity: ImportanceShare[];
  leading_by_impurity: string;
  training: ScrambleReading;
  held_out: ScrambleReading;
}

export type ArrangementName =
  | "measurements"
  | "with_ticket"
  | "with_twin"
  | "all_four"
  | "weight_only"
  | "ticket_only";

export interface Arrangement {
  name: ArrangementName;
  feature_names: string[];
  max_features: number;
  tree: ArrangementModel;
  forest: ArrangementModel;
}

export interface DrawnCrowd {
  n_rows: number;
  n_held_out: number;
  column_names: string[];
  correlations_with_height: FeatureCredit[];
  adult_share: number;
  arrangements: Arrangement[];
}

let drawnCrowdPending: Promise<DrawnCrowd> | null = null;

export async function fetchDrawnCrowd(): Promise<DrawnCrowd> {
  if (drawnCrowdPending) return drawnCrowdPending;
  drawnCrowdPending = getJson<DrawnCrowd>(
    "/concepts/feature-importance/drawn-crowd",
  ).catch((error) => {
    drawnCrowdPending = null;
    throw error;
  });
  return drawnCrowdPending;
}

// --- The edges -------------------------------------------------------------

export interface EdgeProbe {
  edge: string;
  outcome: "refused" | "accepted";
  error: string | null;
  detail: string;
}

export async function fetchEdges(): Promise<{ probes: EdgeProbe[] }> {
  return getJson<{ probes: EdgeProbe[] }>("/concepts/feature-importance/edges");
}
