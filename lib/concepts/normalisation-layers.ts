// Client functions for the normalisation-layers page.
//
// Every number here is computed by the API. The normalise endpoint pushes a
// block through one of the three normalising layers and reports what it
// divided by, optionally under a scale and shift the reader chose; the
// backward endpoint runs the backward pass and checks it against a finite
// difference; the running-figures endpoint follows the batch layer's running
// mean and variance over many steps of one batch; and the crowd endpoint is
// the experiment on the tangled crowd, computed once on the server and cached,
// so every widget on the page shares one promise for it.

import { NormalisationLayer, ReducedStatistic, ApiError, postJson, getJson, LabelledPoint } from "@/lib/api";

export type { NormalisationLayer, ReducedStatistic };

export interface NormalisedBlock {
  layer: NormalisationLayer;
  standardised: number[][];
  normalised: number[][];
  largest_gap_to_raw: number;
  statistics: ReducedStatistic[];
  as_predicting: number[][] | null;
  predicting_statistics: ReducedStatistic[] | null;
}

export interface NormaliseOptions {
  scale?: number[];
  shift?: number[];
}

export async function normaliseBlock(
  rows: number[][],
  layer: NormalisationLayer,
  options: NormaliseOptions = {},
): Promise<NormalisedBlock> {
  return postJson<NormalisedBlock>("/concepts/normalisation-layers/normalise", {
    rows,
    layer,
    ...(options.scale === undefined ? {} : { scale: options.scale }),
    ...(options.shift === undefined ? {} : { shift: options.shift }),
  });
}

export interface BackwardCheck {
  layer: NormalisationLayer;
  arriving: number[][];
  passed_down: number[][];
  naive: number[][];
  finite_difference: number[][];
  largest_gap: number;
  largest_naive_gap: number;
  largest_true_slope: number;
  band_sums: number[];
  naive_band_sums: number[];
  largest_band_sum: number;
  largest_naive_band_sum: number;
  scale_slope: number[];
  shift_slope: number[];
  deviations: number[];
}

export async function checkBackwardPass(
  rows: number[][],
  layer: NormalisationLayer,
  arriving?: number[][],
): Promise<BackwardCheck> {
  return postJson<BackwardCheck>("/concepts/normalisation-layers/backward", {
    rows,
    layer,
    ...(arriving === undefined ? {} : { arriving }),
  });
}

export interface RunningStep {
  step: number;
  running_mean: number[];
  running_deviation: number[];
  largest_gap: number;
}

export interface LoneRow {
  row: number[];
  training_answer: number[];
  predicting_answer_fresh: number[];
  predicting_answer_final: number[];
  layer_answer: number[];
  rms_answer: number[];
}

export interface RunningFigures {
  momentum: number;
  batch_mean: number[];
  batch_deviation: number[];
  training_answer: number[][];
  steps: RunningStep[];
  first_step_within_hundredth: number | null;
  first_step_within_thousandth: number | null;
  lone_row: LoneRow;
}

export async function followRunningFigures(
  rows: number[][],
  nSteps: number,
): Promise<RunningFigures> {
  return postJson<RunningFigures>("/concepts/normalisation-layers/running-figures", {
    rows,
    n_steps: nSteps,
  });
}

export type Arrangement = "none" | "batch" | "layer" | "rms" | "weight";

export interface UnitDrift {
  means: number[];
  deviations: number[];
}

export interface DriftReading {
  arrangement: Arrangement;
  recorded_epochs: number[];
  units: UnitDrift[];
  largest_mean_shift: number;
  largest_deviation_change: number;
  largest_single_epoch_mean_move: number;
  largest_single_epoch_deviation_move: number;
  mean_matches_shift_gap: number | null;
}

export interface SeedReading {
  seed: number;
  training_accuracy: number;
  held_out_accuracy: number;
  training_loss: number;
}

export interface ArrangementReading {
  arrangement: Arrangement;
  training_accuracy_mean: number;
  held_out_accuracy_mean: number;
  held_out_accuracy_low: number;
  held_out_accuracy_high: number;
  training_loss_mean: number;
  per_seed: SeedReading[];
}

export interface CurveReading {
  epoch: number;
  loss: number;
  predicting_accuracy: number;
  training_accuracy: number;
}

export interface ArrangementCurve {
  arrangement: Arrangement;
  readings: CurveReading[];
  first_epoch_below_threshold: number | null;
  final_loss: number;
  final_accuracy: number;
}

export interface Reparameterisation {
  people: number[][];
  directions: number[][];
  magnitudes: number[];
  output_gap: number;
  direction_slopes: number[][];
  magnitude_slopes: number[];
  direction_gap: number;
  magnitude_gap: number;
  unprojected_gap: number;
  largest_direction_slope: number;
  radial_component: number;
  unprojected_radial_component: number;
  rate: number;
  effective_weights_after: number[][];
  dense_weights_after: number[][];
  destination_gap: number;
  lengths_before: number[];
  lengths_after: number[];
  dense_lengths_after: number[];
}

export interface CrowdExperiment {
  crowd: LabelledPoint[];
  hidden_width: number;
  epochs: number;
  learning_rate: number;
  n_folds: number;
  seeds: number[];
  loss_threshold: number;
  drift: DriftReading[];
  sweep: ArrangementReading[];
  curves: ArrangementCurve[];
  reparameterisation: Reparameterisation;
}

// The experiment trains a hundred and thirty small networks and is cached on
// the server, so every widget reading it shares one request.
let crowdPromise: Promise<CrowdExperiment> | null = null;

export function fetchCrowdExperiment(): Promise<CrowdExperiment> {
  if (crowdPromise === null) {
    crowdPromise = getJson<CrowdExperiment>("/concepts/normalisation-layers/crowd").catch(
      (error) => {
        crowdPromise = null;
        throw error;
      },
    );
  }
  return crowdPromise;
}

export const ARRANGEMENT_TITLES: Record<Arrangement, string> = {
  none: "no normalisation",
  batch: "batch layer",
  layer: "layer normalisation",
  rms: "RMS normalisation",
  weight: "weight normalisation",
};

export function failureMessage(error: unknown): string {
  return error instanceof ApiError ? error.message : "Something went wrong.";
}
