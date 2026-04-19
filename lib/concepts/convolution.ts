// The convolution page's endpoints. One kernel swept across a small picture,
// with every window behind the answer, and the parameter count of a
// convolution beside the two layers that would answer the same size.

import { postJson } from "@/lib/api";

export const PICTURE_SIDE = 8;
export const KERNEL_SIDE = 3;
export const MAX_KERNEL_WEIGHT = 10;

export type Grid = number[][];

export interface SweepSetting {
  stride: number;
  padding: number;
}

// The window behind one answer cell. top and left are picture coordinates
// and go negative where the window begins on the border padding adds.
export interface WindowReading {
  top: number;
  left: number;
  patch: Grid;
  products: Grid;
}

export interface ParameterCount {
  reads: number[];
  answers: number[];
  n_inputs: number;
  n_outputs: number;
  convolution: number;
  unshared: number;
  dense: number;
  ratio: number;
}

export interface Sweep {
  output: Grid;
  output_height: number;
  output_width: number;
  windows: WindowReading[][];
  parameters: ParameterCount;
}

export interface CountRequest {
  channels: number;
  side: number;
  n_filters: number;
  kernel_size: number;
  stride: number;
  padding: number;
}

export async function sweepKernel(
  picture: Grid,
  kernel: Grid,
  setting: SweepSetting,
): Promise<Sweep> {
  return postJson<Sweep>("/concepts/convolution/apply", {
    picture,
    kernel,
    ...setting,
  });
}

export async function countParameters(
  request: CountRequest,
): Promise<ParameterCount> {
  return postJson<ParameterCount>(
    "/concepts/convolution/parameter-count",
    request,
  );
}
