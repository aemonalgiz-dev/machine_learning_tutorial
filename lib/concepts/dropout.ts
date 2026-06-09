// The dropout page's endpoints. One row pushed through a seeded dropout layer
// many times, one block pushed through once and blamed back through its
// mask, and one experiment on the tangled crowd that trains a small network
// with and without dropout and holds it out fold by fold.

import { ApiError, LabelledPoint, getJson, postJson } from "@/lib/api";

// What the row endpoint answers. `scale` is one over the keep probability,
// the factor every survivor is multiplied by. `mask` is the first draw's
// scaled mask as the library carried it, `scale` where a unit survived and
// zero where it did not, and `kept` is that mask read as a flag.
// `running_means` holds the mean so far of every unit's training output
// after each draw, so its last row is `mean_output`, and `times_kept` counts
// each unit's survivals across the draws, read from the masks and never from
// the outputs. `single_draw_low` and `single_draw_high` bracket what any one
// draw sent, which is the spread the average hides.
export interface DropoutApplication {
  scale: number;
  training_output: number[];
  mask: number[];
  kept: boolean[];
  predicting_output: number[];
  n_draws: number;
  times_kept: number[];
  running_means: number[][];
  mean_output: number[];
  largest_gap: number;
  single_draw_low: number[];
  single_draw_high: number[];
}

export async function applyDropout(
  values: number[],
  dropProbability: number,
  randomSeed: number,
  drawCount: number,
): Promise<DropoutApplication> {
  return postJson<DropoutApplication>("/concepts/dropout/apply", {
    values,
    drop_probability: dropProbability,
    random_seed: randomSeed,
    n_draws: drawCount,
  });
}

// What the block endpoint answers. `mask` is drawn independently for every
// row. `mask_read_from_outputs` is what the shortcut would record, and
// `misfiled` marks where it disagrees with the real mask, which is exactly
// the entries that held zero and survived. `passed_down` is the arriving
// blame seen through the mask, and `finite_difference` is the same slope
// measured by nudging each input under the same seed.
export interface BlockPass {
  scale: number;
  predicting_outputs: number[][];
  training_outputs: number[][];
  mask: number[][];
  kept: boolean[][];
  mask_read_from_outputs: boolean[][];
  misfiled: boolean[][];
  n_misfiled: number;
  n_kept_per_row: number[];
  arriving: number[][];
  passed_down: number[][];
  gradient_is_none: boolean;
  finite_difference: number[][];
  largest_finite_difference_gap: number;
}

export async function passBlock(
  rows: number[][],
  dropProbability: number,
  randomSeed: number,
  arriving?: number[][],
): Promise<BlockPass> {
  return postJson<BlockPass>("/concepts/dropout/block", {
    rows,
    drop_probability: dropProbability,
    random_seed: randomSeed,
    ...(arriving ? { arriving } : {}),
  });
}

export interface SeedReading {
  seed: number;
  training_accuracy: number;
  held_out_accuracy: number;
}

export interface RateReading {
  drop_probability: number;
  training_accuracy_mean: number;
  held_out_accuracy_mean: number;
  held_out_accuracy_low: number;
  held_out_accuracy_high: number;
  per_seed: SeedReading[];
}

export interface CurveReading {
  epoch: number;
  training_accuracy: number;
  held_out_accuracy: number;
  thinned_loss: number;
}

export interface RateCurve {
  drop_probability: number;
  readings: CurveReading[];
}

export interface UnitAblation {
  drop_probability: number;
  intact_accuracy: number;
  silenced: number[];
  mean_drop: number;
  largest_drop: number;
  dead: boolean[];
  n_dead: number;
}

export interface KeptZeros {
  n_readings: number;
  n_zero: number;
  n_zero_and_kept: number;
}

export interface PurposeConfusion {
  predicting_accuracy: number;
  training_purpose_accuracies: number[];
  training_purpose_low: number;
  training_purpose_high: number;
  identity_control_gap: number;
  swing_predicting_chance: number;
  swing_low_chance: number;
  swing_high_chance: number;
}

export interface ScoreAveraging {
  n_draws: number;
  largest_score_gap: number;
  largest_single_draw_gap: number;
  largest_chance_gap: number;
  largest_predicting_score: number;
}

export interface DropoutExperiment {
  crowd: LabelledPoint[];
  hidden_width: number;
  epochs: number;
  learning_rate: number;
  n_folds: number;
  seeds: number[];
  sweep: RateReading[];
  curves: RateCurve[];
  ablations: UnitAblation[];
  kept_zeros: KeptZeros;
  confusion: PurposeConfusion;
  averaging: ScoreAveraging;
}

// The experiment takes no input and several widgets read it, so one request
// serves the page.
let experimentPromise: Promise<DropoutExperiment> | null = null;

export function fetchDropoutExperiment(): Promise<DropoutExperiment> {
  if (!experimentPromise) {
    experimentPromise = getJson<DropoutExperiment>("/concepts/dropout/experiment").catch(
      (error) => {
        experimentPromise = null;
        throw error;
      },
    );
  }
  return experimentPromise;
}

// The sentence a widget shows when a request fails, the API's own when it
// refused the ask, and a plain one for anything else.
export function failureMessage(error: unknown): string {
  return error instanceof ApiError ? error.message : "Something went wrong.";
}
