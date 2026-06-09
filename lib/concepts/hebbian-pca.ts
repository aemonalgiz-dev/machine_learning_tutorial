// Client functions for the Hebbian principal components page.
//
// Every number here is computed by the API. The learn endpoint is the
// library's fit beside the eigensolver's; the walk endpoint steps the rule one
// person at a time so the page can show the weight vector turning, and lands
// where the fit lands; the sweeps endpoint repeats the fit across budgets,
// rates, seeds and schedules on one small cloud. Fixed requests are cached in
// module-level promises, because several widgets ask for the same walk or the
// same sweeps and one round trip serves them all.

import { Point, postJson } from "@/lib/api";

export interface EigenDirection {
  dx: number;
  dy: number;
  variance: number;
  share: number;
}

export interface LearnedDirection extends EigenDirection {
  length: number;
}

export interface HebbianFit {
  mean: Point;
  hebbian: LearnedDirection[];
  eigen: EigenDirection[];
  angles_degrees: number[];
  epochs_run: number;
  converged: boolean;
  worst_orthogonality: number;
  total_variance: number;
  kept_variance: number;
  starting_rate: number;
  learned_scores: number[][];
  eigen_scores: number[][];
}

export async function learnHebbian(
  points: Point[],
  maxEpochs: number,
  rateMultiplier?: number,
): Promise<HebbianFit> {
  return postJson<HebbianFit>("/concepts/hebbian-pca/learn", {
    points,
    max_epochs: maxEpochs,
    ...(rateMultiplier === undefined ? {} : { rate_multiplier: rateMultiplier }),
  });
}

export type Rule = "hebb" | "oja" | "sanger";
export type Start = "seeded" | "along_height";

export interface WalkOptions {
  rule?: Rule;
  nComponents?: 1 | 2;
  maxEpochs?: number;
  rateMultiplier?: number;
  decay?: boolean;
  centre?: boolean;
  start?: Start;
  randomSeed?: number;
}

export interface Vector {
  x: number;
  y: number;
}

export interface WeightState {
  dx: number;
  dy: number;
  length: number;
  angle_degrees: number;
  angle_to_mean_degrees: number;
}

export interface WalkStep {
  epoch: number;
  row: number;
  rate: number;
  presented: Vector;
  outputs: number[];
  residuals: Vector[];
  updates: Vector[];
  weights: WeightState[];
}

export interface EpochSummary {
  epoch: number;
  rate: number;
  weights: WeightState[];
  movement: number;
}

export interface Walk {
  mean: Point;
  eigen: EigenDirection[];
  starting_rate: number;
  initial: WeightState[];
  steps: WalkStep[];
  epochs: EpochSummary[];
  diverged_at_epoch: number | null;
  converged_at_epoch: number | null;
  worst_orthogonality: number | null;
}

function walkRequest(points: Point[], options: WalkOptions) {
  return {
    points,
    ...(options.rule === undefined ? {} : { rule: options.rule }),
    ...(options.nComponents === undefined ? {} : { n_components: options.nComponents }),
    ...(options.maxEpochs === undefined ? {} : { max_epochs: options.maxEpochs }),
    ...(options.rateMultiplier === undefined ? {} : { rate_multiplier: options.rateMultiplier }),
    ...(options.decay === undefined ? {} : { decay: options.decay }),
    ...(options.centre === undefined ? {} : { centre: options.centre }),
    ...(options.start === undefined ? {} : { start: options.start }),
    ...(options.randomSeed === undefined ? {} : { random_seed: options.randomSeed }),
  };
}

// A walk is fixed by its request, so two widgets stepping the same walk share
// one round trip. A failed request is forgotten so a retry can succeed.
const walkCache = new Map<string, Promise<Walk>>();

export function walkHebbian(points: Point[], options: WalkOptions = {}): Promise<Walk> {
  const request = walkRequest(points, options);
  const key = JSON.stringify(request);
  const cached = walkCache.get(key);
  if (cached) return cached;
  const promise = postJson<Walk>("/concepts/hebbian-pca/walk", request).catch((error) => {
    walkCache.delete(key);
    throw error;
  });
  walkCache.set(key, promise);
  return promise;
}

export interface BudgetFit {
  max_epochs: number;
  epochs_run: number;
  converged: boolean;
  angles_degrees: number[];
  lengths: number[];
  shares: number[];
}

export interface RateFit {
  rate_multiplier: number;
  starting_rate: number;
  diverged: boolean;
  epochs_run: number | null;
  angles_degrees: number[] | null;
  lengths: number[] | null;
}

export interface SeedFit {
  seed: number;
  dx: number;
  dy: number;
  length: number;
  angle_degrees: number;
  angle_to_first_seed_degrees: number;
  epochs_run: number;
}

export interface Sweeps {
  starting_rate: number;
  eigen: EigenDirection[];
  epochs: BudgetFit[];
  constant: BudgetFit[];
  rates: RateFit[];
  seeds: SeedFit[];
}

const sweepsCache = new Map<string, Promise<Sweeps>>();

export function sweepHebbian(points: Point[]): Promise<Sweeps> {
  const key = JSON.stringify(points);
  const cached = sweepsCache.get(key);
  if (cached) return cached;
  const promise = postJson<Sweeps>("/concepts/hebbian-pca/sweeps", { points }).catch((error) => {
    sweepsCache.delete(key);
    throw error;
  });
  sweepsCache.set(key, promise);
  return promise;
}
