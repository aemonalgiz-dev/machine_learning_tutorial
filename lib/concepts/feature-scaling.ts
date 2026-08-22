// Client functions for the feature scaling page.
//
// Every number here is computed by the API. The neighbours endpoint takes one
// k-nearest-neighbours vote with the heights in three units and then
// standardized; the models endpoint fits a gradient walk, a ridge, a
// least-squares line and a decision tree under the same four readings; the
// hold-out endpoint standardizes held-out rows with the training numbers and
// with their own; the quartiles endpoint places the robust scaler's cuts on a
// sorted column; and the contracts endpoint asks the library every edge the
// page tabulates. The playground keeps using the scale endpoint in lib/api.

import { LabelledPoint, Point, getJson, postJson } from "@/lib/api";

export type HeightUnit = "millimetres" | "centimetres" | "metres" | "standardized";

export interface UnitNeighbour {
  index: number;
  distance: number;
  label: number;
  height_share: number | null;
}

export interface UnitVote {
  unit: HeightUnit;
  factor: number;
  prediction: number;
  votes_for_one: number;
  neighbours: UnitNeighbour[];
}

export interface UnitNeighbours {
  votes: UnitVote[];
  height_mean: number;
  height_deviation: number;
  weight_mean: number;
  weight_deviation: number;
}

export async function voteByUnit(
  points: LabelledPoint[],
  query: Point,
  k: number,
): Promise<UnitNeighbours> {
  return postJson<UnitNeighbours>("/concepts/feature-scaling/units/neighbours", {
    points,
    query,
    k,
  });
}

export interface DescentByUnit {
  unit: HeightUnit;
  factor: number;
  curvature: number;
  condition_number: number;
  learning_rate: number;
  divergence_threshold: number;
  epochs_run: number;
  converged: boolean;
  slope: number;
  level: number;
}

export interface RidgeByUnit {
  unit: HeightUnit;
  factor: number;
  coefficient: number;
  intercept: number;
  r_squared: number;
}

export interface LeastSquaresByUnit {
  unit: HeightUnit;
  factor: number;
  slope: number;
  intercept: number;
  r_squared: number;
  slope_in_centimetres: number;
  intercept_in_centimetres: number;
}

export interface TreeByUnit {
  unit: HeightUnit;
  factor: number;
  depth: number;
  n_leaves: number;
  root_feature: string | null;
  root_threshold: number | null;
  predictions: number[];
}

export type ScalingMethodName =
  | "standardize"
  | "min_max"
  | "max_abs"
  | "robust"
  | "root_mean_square";

export interface InverseRoundTrip {
  method: ScalingMethodName;
  max_gap: number;
}

export interface UnitModels {
  descents: DescentByUnit[];
  ridges: RidgeByUnit[];
  least_squares: LeastSquaresByUnit[];
  trees: TreeByUnit[];
  trees_agree: boolean;
  round_trips: InverseRoundTrip[];
}

// The crowd is fixed, so every widget asking about it shares one request.
let modelsCache: Promise<UnitModels> | null = null;

export function fetchModelsByUnit(points: LabelledPoint[]): Promise<UnitModels> {
  if (!modelsCache) {
    modelsCache = postJson<UnitModels>("/concepts/feature-scaling/units/models", {
      points,
    }).catch((error) => {
      modelsCache = null;
      throw error;
    });
  }
  return modelsCache;
}

export interface HoldOut {
  training_indices: number[];
  held_out_indices: number[];
  training_mean: number;
  training_deviation: number;
  training_scaled: number[];
  by_training: number[];
  mean_by_training: number;
  own_mean: number;
  own_deviation: number;
  by_own: number[];
  slope: number;
  intercept: number;
  predictions_by_training: number[];
  predictions_by_own: number[];
  actual_weights: number[];
}

export async function standardizeHeldOut(
  points: Point[],
  heldOut: number[],
): Promise<HoldOut> {
  return postJson<HoldOut>("/concepts/feature-scaling/hold-out", {
    points,
    held_out: heldOut,
  });
}

export interface QuartilePosition {
  position: number;
  value: number;
}

export interface Quartiles {
  sorted_values: number[];
  first_quartile: QuartilePosition;
  median: QuartilePosition;
  third_quartile: QuartilePosition;
  interquartile_range: number;
  robust_centre: number;
  robust_spread: number;
}

export async function placeQuartiles(values: number[]): Promise<Quartiles> {
  return postJson<Quartiles>("/concepts/feature-scaling/quartiles", { values });
}

export interface ContractProbe {
  edge: string;
  method: string;
  outcome: "accepted" | "refused";
  result: string | null;
  reason: string | null;
}

export interface Contracts {
  probes: ContractProbe[];
}

let contractsCache: Promise<Contracts> | null = null;

export function fetchContracts(): Promise<Contracts> {
  if (!contractsCache) {
    contractsCache = getJson<Contracts>("/concepts/feature-scaling/contracts").catch(
      (error) => {
        contractsCache = null;
        throw error;
      },
    );
  }
  return contractsCache;
}
