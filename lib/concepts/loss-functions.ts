// The loss-functions page's endpoints: five losses asked at one raw output,
// and the same five swept across a range.

import { postJson } from "@/lib/api";

export type YesOrNo = 0 | 1;

export interface LossSetting {
  target: number;
  label: YesOrNo;
  huber_threshold: number;
}

export interface LossReading {
  value: number;
  gradient: number;
  probability: number | null;
}

export type LossName =
  | "squared_error"
  | "absolute_error"
  | "huber_error"
  | "binary_cross_entropy"
  | "softmax_cross_entropy";

export const LOSS_NAMES: LossName[] = [
  "squared_error",
  "absolute_error",
  "huber_error",
  "binary_cross_entropy",
  "softmax_cross_entropy",
];

export type FiveReadings = Record<LossName, LossReading>;

export interface LossMeasurement {
  raw_output: number;
  readings: FiveReadings;
}

export interface CurveSample {
  raw_output: number;
  value: number;
  gradient: number;
  probability: number | null;
}

export type LossCurves = Record<LossName, CurveSample[]>;

export async function measureLosses(
  setting: LossSetting,
  rawOutput: number,
): Promise<LossMeasurement> {
  return postJson<LossMeasurement>("/concepts/loss-functions/measure", {
    ...setting,
    raw_output: rawOutput,
  });
}

export async function traceLossCurves(
  setting: LossSetting,
  sampleCount: number,
): Promise<LossCurves> {
  return postJson<LossCurves>("/concepts/loss-functions/curve", {
    ...setting,
    n_samples: sampleCount,
  });
}
