// The training-a-network page's endpoints: one recorded training run, and the
// loop around it.
//
// The page is about the loop rather than about any one piece of it, so most of
// these fetch a whole family of runs at once: every step size walked from one
// start, every batch size run for the same epochs, the training loss and the
// held-out loss measured side by side. The API computes all of it; the widgets
// only draw.

import { ApiError, RegionGrid, getJson, postJson } from "@/lib/api";

const BASE = "/concepts/training-a-network";

export type TrainingPreset = "rings" | "exclusive_or";

export type Objective = "log_loss" | "squared_error";

export interface TrainedPoint {
  x: number;
  y: number;
  label: number;
}

// The loss belongs to the chain as it stood BEFORE this epoch's step, because
// the backward pass measures on the way forward.
export interface EpochReading {
  epoch: number;
  loss: number;
  accuracy: number;
  largest_movement: number;
}

export interface RecordedRegion {
  epoch: number;
  regions: RegionGrid;
}

export interface TrainingRun {
  points: TrainedPoint[];
  readings: EpochReading[];
  regions: RecordedRegion[];
  final_accuracy: number;
  final_loss: number;
  starting_loss: number;
  n_parameters: number;
  straight_line_accuracy: number;
}

export interface TrainingSettings {
  preset: TrainingPreset;
  hiddenWidth: number;
  learningRate: number;
  maxEpochs: number;
  weightSeed: number;
}

export const PRESET_TITLES: Record<TrainingPreset, string> = {
  rings: "Two rings",
  exclusive_or: "Exclusive-or",
};

export async function trainOneNetwork(
  settings: TrainingSettings,
): Promise<TrainingRun> {
  return postJson<TrainingRun>(`${BASE}/train`, {
    preset: settings.preset,
    hidden_width: settings.hiddenWidth,
    learning_rate: settings.learningRate,
    max_epochs: settings.maxEpochs,
    weight_seed: settings.weightSeed,
  });
}

// One step, traced.

export interface TracedParameter {
  description: string;
  before: number;
  slope: number;
  after: number;
}

export interface LayerStepSummary {
  position: number;
  n_weights: number;
  n_biases: number;
  largest_weight_slope: number;
  largest_bias_slope: number;
}

// What the slope alone said the loss would fall by, against what it did. The
// ratio approaches one as the step shrinks, which is the whole argument for a
// small one.
export interface FirstOrderRow {
  learning_rate: number;
  predicted_drop: number;
  actual_drop: number | null;
  ratio: number | null;
  loss_after: number | null;
}

export interface OneStep {
  n_parameters: number;
  n_rows: number;
  learning_rate: number;
  loss_before: number;
  loss_after: number | null;
  actual_drop: number | null;
  predicted_drop: number;
  gradient_norm: number;
  distance_moved: number;
  largest_movement: number;
  ratio: number | null;
  layers: LayerStepSummary[];
  traced: TracedParameter[];
  first_order: FirstOrderRow[];
}

export async function fetchOneStep(
  learningRate: number,
  preset: TrainingPreset = "rings",
): Promise<OneStep> {
  return postJson<OneStep>(`${BASE}/step`, {
    preset,
    hidden_width: 6,
    learning_rate: learningRate,
    weight_seed: 1,
  });
}

// Every step size walked from one start.

export interface SweptRate {
  learning_rate: number;
  losses: (number | null)[];
  epochs_run: number;
  final_loss: number | null;
  best_loss: number | null;
  best_epoch: number | null;
  final_accuracy: number | null;
  first_non_finite_epoch: number | null;
  refused_at_epoch: number | null;
  refusal: string | null;
}

export interface RateSweep {
  objective: Objective;
  max_epochs: number;
  starting_loss: number;
  rows: SweptRate[];
}

const RATE_SWEEPS = new Map<Objective, Promise<RateSweep>>();

export function fetchRateSweep(objective: Objective): Promise<RateSweep> {
  const held = RATE_SWEEPS.get(objective);
  if (held) return held;
  const asked = postJson<RateSweep>(`${BASE}/rate-sweep`, {
    preset: "rings",
    hidden_width: 6,
    weight_seed: 1,
    max_epochs: 200,
    objective,
    learning_rates:
      objective === "log_loss"
        ? [0.001, 0.01, 0.1, 0.5, 2.0, 5.0, 20.0, 100.0]
        : [0.1, 0.5, 1.0, 2.0, 5.0, 20.0],
  });
  RATE_SWEEPS.set(objective, asked);
  return asked;
}

// Every batch size run for the same epochs.

export interface BatchSizeRun {
  batch_size: number;
  steps_per_epoch: number;
  total_steps: number;
  losses: (number | null)[];
  final_loss: number | null;
  final_accuracy: number | null;
  milliseconds: number;
  milliseconds_per_step: number;
}

// The cosine between one batch's direction and the whole set's, at the
// untrained start. One is the same direction and a negative number is a step
// that makes the loss worse on the rows the batch left out.
export interface DirectionAgreement {
  batch_size: number;
  mean_cosine: number;
  worst_cosine: number;
  n_draws: number;
}

export interface BatchSweep {
  n_rows: number;
  learning_rate: number;
  max_epochs: number;
  starting_loss: number;
  rows: BatchSizeRun[];
  agreement: DirectionAgreement[];
}

let batchSweep: Promise<BatchSweep> | null = null;

export function fetchBatchSweep(): Promise<BatchSweep> {
  batchSweep ??= postJson<BatchSweep>(`${BASE}/batch-sweep`, {
    preset: "rings",
    hidden_width: 6,
    weight_seed: 1,
    learning_rate: 0.5,
    max_epochs: 60,
    order_seed: 3,
    batch_sizes: [1, 5, 15, 30, 60],
  });
  return batchSweep;
}

// The two curves, only one of which a training loop can see.

export interface GeneralisationReading {
  epoch: number;
  training_loss: number | null;
  held_out_loss: number | null;
  training_accuracy: number;
  held_out_accuracy: number;
}

export interface Generalisation {
  n_training: number;
  n_held_out: number;
  n_mislabelled: number;
  n_parameters: number;
  readings: GeneralisationReading[];
  best_held_out_loss: number;
  best_held_out_loss_epoch: number;
  best_held_out_accuracy: number;
  best_held_out_accuracy_epoch: number;
  final_training_loss: number;
  final_held_out_loss: number;
  final_training_accuracy: number;
  final_held_out_accuracy: number;
}

const GENERALISATIONS = new Map<number, Promise<Generalisation>>();

export function fetchGeneralisation(mislabelled: number): Promise<Generalisation> {
  const held = GENERALISATIONS.get(mislabelled);
  if (held) return held;
  const asked = postJson<Generalisation>(`${BASE}/generalisation`, {
    preset: "rings",
    n_training: 14,
    mislabelled,
    hidden_width: 8,
    learning_rate: 1.0,
    max_epochs: 600,
    weight_seed: 1,
    split_seed: 5,
  });
  GENERALISATIONS.set(mislabelled, asked);
  return asked;
}

// What a seed fixes, and what it does not.

export interface RepeatedRun {
  description: string;
  first_final_loss: number;
  second_final_loss: number;
  identical: boolean;
}

export interface SeededStart {
  weight_seed: number;
  starting_loss: number;
  final_loss: number;
  final_accuracy: number | null;
}

// Which units a layer that silences at random kept, on four consecutive
// passes. All alike is what a rebuilt layer does and what a carried one
// must not.
export interface DrawSequence {
  description: string;
  sheets: number[][];
  all_alike: boolean;
}

export interface Repeatability {
  runs: RepeatedRun[];
  starts: SeededStart[];
  draws: DrawSequence[];
  step_returns_the_same_layer: boolean;
}

let repeatability: Promise<Repeatability> | null = null;

export function fetchRepeatability(): Promise<Repeatability> {
  repeatability ??= getJson<Repeatability>(`${BASE}/repeatability`);
  return repeatability;
}

// The edges, probed when the request arrives.

export interface ContractRow {
  situation: string;
  verdict: "refused" | "accepted";
  detail: string;
}

export interface LoopContracts {
  rows: ContractRow[];
}

let contracts: Promise<LoopContracts> | null = null;

export function fetchLoopContracts(): Promise<LoopContracts> {
  contracts ??= getJson<LoopContracts>(`${BASE}/loop-contracts`);
  return contracts;
}

export function failureMessage(error: unknown): string {
  return error instanceof ApiError ? error.message : "Something went wrong.";
}
