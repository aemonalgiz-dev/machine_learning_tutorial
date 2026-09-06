// The convolution page's endpoints. One kernel swept across a small picture,
// with every window behind the answer, the parameter count of a convolution
// beside the two layers that would answer the same size, and the measurements
// the later parts of the page quote: what a dense layer makes of a shuffled
// picture, what happens to the answer when the picture moves, the arrangement
// a layer settles before any data arrives, the backward pass against a finite
// difference, what the sweep costs in time, and every refusal.
//
// The four requests that take no input are cached in a module-level promise
// each, so several widgets on one page share one answer rather than asking the
// same question over again.

import { getJson, postJson } from "@/lib/api";

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

// --- What a dense layer cannot see ------------------------------------------

export interface Arrangement {
  picture: Grid;
  scrambled: Grid;
  picture_cells_moved: number;
  n_picture_cells: number;
  dense_answer: number[];
  dense_answer_rewired: number[];
  dense_largest_gap: number;
  dense_identical: boolean;
  swept: Grid;
  swept_scrambled: Grid;
  swept_largest_gap: number;
  swept_cells_changed: number;
  n_answer_cells: number;
  dense_parameters: number;
  convolution_parameters: number;
}

let arrangementRequest: Promise<Arrangement> | null = null;

export async function readArrangement(): Promise<Arrangement> {
  if (!arrangementRequest) {
    arrangementRequest = getJson<Arrangement>(
      "/concepts/convolution/arrangement",
    ).catch((error) => {
      arrangementRequest = null;
      throw error;
    });
  }
  return arrangementRequest;
}

// --- Moving the picture ------------------------------------------------------

// One sideways position. output_shift is null when the stride does not divide
// the move, in which case the answer has no position to move to and
// largest_gap is null rather than zero.
export interface ShiftedSweep {
  shift: number;
  picture: Grid;
  swept: Grid;
  output_shift: number | null;
  largest_gap: number | null;
  matches_moved_answer: boolean;
  picture_cells_changed: number;
  swept_cells_changed: number;
  detector_answer: number;
  dense_largest_gap: number | null;
  dense_largest_answer: number;
  dense_cells_changed: number;
}

export interface ShiftSweep {
  stride: number;
  reads: number[];
  answers: number[];
  detector_top: number;
  detector_left: number;
  detector_at_rest: number;
  resting_swept: Grid;
  n_answer_cells: number;
  shifts: ShiftedSweep[];
}

export async function sweepShifts(
  kernel: Grid,
  stride: number,
  shifts: number[],
): Promise<ShiftSweep> {
  return postJson<ShiftSweep>("/concepts/convolution/shift", {
    kernel,
    stride,
    shifts,
  });
}

// --- A bank of kernels -------------------------------------------------------

export interface FilterMap {
  position: number;
  output: Grid;
  largest: number;
  smallest: number;
  strongest_row: number;
  strongest_column: number;
}

export interface KernelBank {
  reads: number[];
  answers: number[];
  n_filters: number;
  kernel_shape: number[];
  maps: FilterMap[];
  parameters: ParameterCount;
}

export async function sweepBank(
  picture: Grid,
  kernels: Grid[],
  setting: SweepSetting,
): Promise<KernelBank> {
  return postJson<KernelBank>("/concepts/convolution/bank", {
    picture,
    kernels,
    ...setting,
  });
}

// --- The arrangement, settled in integers ------------------------------------

// One setting, with nothing swept. Every measured field is null on a setting
// the library refuses, and detail carries its message instead.
export interface GeometryRow {
  kernel_size: number;
  stride: number;
  padding: number;
  refused: boolean;
  detail: string | null;
  reads: number[] | null;
  answers: number[] | null;
  n_inputs: number | null;
  n_outputs: number | null;
  parameters: number | null;
  corner_windows: number | null;
  centre_windows: number | null;
  unread_cells: number | null;
  keeps_the_side: boolean;
}

export interface Geometry {
  channels: number;
  side: number;
  n_filters: number;
  rows: GeometryRow[];
}

export interface GeometryRequest {
  side: number;
  n_filters?: number;
  kernel_sizes: number[];
  strides: number[];
  paddings: number[];
}

export async function readGeometry(
  request: GeometryRequest,
): Promise<Geometry> {
  return postJson<Geometry>("/concepts/convolution/geometry", request);
}

// --- The backward pass -------------------------------------------------------

export interface WorkedBackward {
  picture: Grid;
  arriving: number;
  n_output_positions: number;
  n_lit_cells: number;
  kernel_slopes: Grid;
  kernel_slopes_by_hand: Grid;
  slopes_agree: boolean;
  bias_slope: number;
  blame: Grid;
  kernel_total: number;
  corner_blame: number;
  centre_blame: number;
  n_cells_receiving_nothing: number;
}

export interface GradientCheck {
  name: string;
  reads: number[];
  n_filters: number;
  kernel_size: number;
  stride: number;
  padding: number;
  n_rows: number;
  n_checked: number;
  largest_kernel_gap: number;
  largest_bias_gap: number;
  largest_input_gap: number;
  largest_true_slope: number;
}

export interface Backward {
  worked: WorkedBackward;
  checks: GradientCheck[];
  step: number;
  largest_gap_anywhere: number;
}

let backwardRequest: Promise<Backward> | null = null;

export async function readBackward(): Promise<Backward> {
  if (!backwardRequest) {
    backwardRequest = getJson<Backward>(
      "/concepts/convolution/backward",
    ).catch((error) => {
      backwardRequest = null;
      throw error;
    });
  }
  return backwardRequest;
}

// --- What the sweep costs ----------------------------------------------------

export interface CostRow {
  side: number;
  n_filters: number;
  answers: number[];
  n_inputs: number;
  n_outputs: number;
  n_terms: number;
  convolution_parameters: number;
  dense_parameters: number;
  sweep_milliseconds: number;
  loop_milliseconds: number;
  dense_milliseconds: number;
  ratio: number;
  loop_over_sweep: number;
  largest_disagreement: number;
}

export interface Cost {
  repeats: number;
  rows: CostRow[];
  largest_disagreement_anywhere: number;
}

let costRequest: Promise<Cost> | null = null;

export async function readCost(): Promise<Cost> {
  if (!costRequest) {
    costRequest = getJson<Cost>("/concepts/convolution/cost").catch((error) => {
      costRequest = null;
      throw error;
    });
  }
  return costRequest;
}

// --- Every refusal, and the join a stack will not make -----------------------

export interface EdgeCase {
  name: string;
  attempt: string;
  raised: boolean;
  error: string | null;
  detail: string | null;
  library_error: boolean;
  outcome: string;
}

export interface JoinAttempt {
  name: string;
  beneath: number[];
  above: number[];
  both_hold: number;
  counts_agree: boolean;
  refused: boolean;
  error: string | null;
  detail: string | null;
  stack_reads: number[] | null;
  stack_answers: number[] | null;
  n_layers: number | null;
}

export interface EdgeCases {
  cases: EdgeCase[];
  n_refused: number;
  n_accepted: number;
  n_in_the_library_words: number;
  joins: JoinAttempt[];
}

let edgeCasesRequest: Promise<EdgeCases> | null = null;

export async function readEdgeCases(): Promise<EdgeCases> {
  if (!edgeCasesRequest) {
    edgeCasesRequest = getJson<EdgeCases>(
      "/concepts/convolution/edge-cases",
    ).catch((error) => {
      edgeCasesRequest = null;
      throw error;
    });
  }
  return edgeCasesRequest;
}
