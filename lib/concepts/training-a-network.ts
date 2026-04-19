// The training-a-network page's endpoint: one recorded training run, the loss
// after every epoch and the decision region at a handful of them.

import { RegionGrid, postJson } from "@/lib/api";

export type TrainingPreset = "rings" | "exclusive_or";

export interface TrainedPoint {
  x: number;
  y: number;
  label: number;
}

// The loss belongs to the stack as it stood BEFORE this epoch's step, because
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
  return postJson<TrainingRun>("/concepts/training-a-network/train", {
    preset: settings.preset,
    hidden_width: settings.hiddenWidth,
    learning_rate: settings.learningRate,
    max_epochs: settings.maxEpochs,
    weight_seed: settings.weightSeed,
  });
}
