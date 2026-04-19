// The neurons-and-activations page's endpoint. One neuron with two inputs,
// asked about a probe row, a lattice over the plane its inputs span, and the
// bend it applies to its score.

import { postJson } from "@/lib/api";

export type ActivationName =
  | "identity"
  | "rectified_linear"
  | "sigmoid"
  | "hyperbolic_tangent";

// The four bends the library offers, in the order the page's buttons show
// them.
export const ACTIVATION_NAMES: ActivationName[] = [
  "identity",
  "rectified_linear",
  "sigmoid",
  "hyperbolic_tangent",
];

// One row of two inputs, which is a point on the plane the neuron reads.
export interface PlanePoint {
  first_input: number;
  second_input: number;
}

// The window over the plane, and how finely to sample it.
export interface Lattice {
  first_input_low: number;
  first_input_high: number;
  second_input_low: number;
  second_input_high: number;
  cells: number;
}

export interface NeuronRequest {
  weights: [number, number];
  bias: number;
  activation: ActivationName;
  probe: PlanePoint;
  lattice: Lattice;
}

// What the neuron did with the probe row, and the slope of the bend there.
export interface NeuronReading {
  probe: PlanePoint;
  score: number;
  output: number;
  slope: number;
}

// The score and the output at every lattice cell, row-major from the low
// corner, so scores[row][column] is the row-th second input and the
// column-th first input.
export interface ResponseSurface extends Lattice {
  scores: number[][];
  outputs: number[][];
}

// Where the score is zero, clipped to the lattice window.
export interface ZeroLine {
  start: PlanePoint;
  end: PlanePoint;
}

// The bend and its slope sampled over a fixed range of scores, and the
// largest slope among the samples.
export interface ActivationCurve {
  scores: number[];
  outputs: number[];
  slopes: number[];
  peak_slope: number;
}

export interface NeuronResponse {
  activation: ActivationName;
  formula: string;
  reading: NeuronReading;
  surface: ResponseSurface;
  zero_line: ZeroLine | null;
  curve: ActivationCurve;
}

export async function respondNeuron(
  request: NeuronRequest,
): Promise<NeuronResponse> {
  return postJson<NeuronResponse>("/concepts/neurons/respond", request);
}
