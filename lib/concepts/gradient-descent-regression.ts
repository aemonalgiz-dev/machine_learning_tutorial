// The gradient-descent page's endpoints: one recorded walk, pass by pass,
// and a sweep of step sizes asking the library for a plain fit at each.

import { Point, postJson } from "@/lib/api";

export type WalkOutcome = "converged" | "pass_limit_reached" | "diverged";
export type FitVerdict = "converged" | "pass_limit_reached" | "refused";

// Where a line stands and what it costs there. `level` is the weight the line
// predicts at the average height, which is the intercept the library learns on
// centred heights; `intercept` is the same line's weight at a height of zero,
// the number the line page reports.
export interface LinePosition {
  slope: number;
  level: number;
  intercept: number;
  loss: number;
}

export interface WalkPass extends LinePosition {
  pass_number: number;
  gradient_level: number;
  gradient_slope: number;
  movement: number;
}

// What the library answered when asked for a plain fit at one rate. A refused
// fit carries the library's error by name and no numbers, because there were
// none to report.
export interface LibraryVerdict {
  learning_rate: number;
  verdict: FitVerdict;
  epochs_run: number | null;
  slope: number | null;
  level: number | null;
  error_factor_per_pass: number;
  error_name: string | null;
  message: string | null;
}

export interface RecordedWalk {
  mean_height: number;
  start: LinePosition;
  passes: WalkPass[];
  closed_form: LinePosition;
  outcome: WalkOutcome;
  passes_run: number;
  tolerance: number;
  divergence_threshold: number;
  divergence_threshold_uncentred: number;
  level_factor_per_pass: number;
  slope_factor_per_pass: number;
  error_factor_per_pass: number;
  library_verdict: LibraryVerdict;
}

export interface RateSweep {
  divergence_threshold: number;
  closed_form: LinePosition;
  verdicts: LibraryVerdict[];
}

export async function walkDownhill(
  points: Point[],
  learningRate: number,
  maxEpochs: number,
): Promise<RecordedWalk> {
  return postJson<RecordedWalk>(
    "/concepts/gradient-descent-regression/walk",
    { points, learning_rate: learningRate, max_epochs: maxEpochs },
  );
}

export async function sweepRates(
  points: Point[],
  learningRates: number[],
  maxEpochs: number,
): Promise<RateSweep> {
  return postJson<RateSweep>(
    "/concepts/gradient-descent-regression/rate-sweep",
    { points, learning_rates: learningRates, max_epochs: maxEpochs },
  );
}

// One line the reader holds: scored, differentiated, and stepped once.
export interface ObservationContribution {
  centred_height: number;
  weight: number;
  prediction: number;
  residual: number;
  squared_residual: number;
  level_share: number;
  slope_share: number;
}

export interface LossSlice {
  axis: number[];
  losses: number[];
}

export interface Candidate {
  mean_height: number;
  standing: LinePosition;
  observations: ObservationContribution[];
  gradient_level: number;
  gradient_slope: number;
  next_position: LinePosition;
  level_slice: LossSlice;
  slope_slice: LossSlice;
  closed_form: LinePosition;
}

export async function scoreCandidate(
  points: Point[],
  level: number,
  slope: number,
  learningRate: number,
): Promise<Candidate> {
  return postJson<Candidate>(
    "/concepts/gradient-descent-regression/candidate",
    { points, level, slope, learning_rate: learningRate },
  );
}

export type Parameterisation = "raw" | "centred" | "scaled";

export interface ParameterPair {
  first: number;
  second: number;
  loss: number;
}

// The loss over both parameters, its curvatures, and one walk across it.
export interface LossSurface {
  first_name: string;
  second_name: string;
  first_axis: number[];
  second_axis: number[];
  losses: number[][];
  optimum: ParameterPair;
  smallest_curvature: number;
  largest_curvature: number;
  condition_number: number;
  divergence_threshold: number;
  walk: ParameterPair[];
  outcome: WalkOutcome;
}

export async function sampleLossSurface(
  points: Point[],
  parameterisation: Parameterisation,
  learningRate: number,
  maxEpochs: number,
): Promise<LossSurface> {
  return postJson<LossSurface>(
    "/concepts/gradient-descent-regression/loss-surface",
    { points, parameterisation, learning_rate: learningRate, max_epochs: maxEpochs },
  );
}
