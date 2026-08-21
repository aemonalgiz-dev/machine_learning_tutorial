// The neurons-and-activations page's endpoints. One neuron with two inputs,
// asked about a probe row, a lattice over the plane its inputs span, and the
// bend it applies to its score; the logistic model fitted to the crowd and
// the neuron that equals it; a census of the crowd under any neuron; two
// neurons in a chain; and the one appearance of softmax.

import { getJson, postJson } from "@/lib/api";

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

// The page's worked neuron, weights (2, -1) and bias one half, which every
// widget that only wants a bend's curve asks about, with the smallest
// lattice the API accepts so the surface costs nothing.
const WORKED_NEURON = {
  weights: [2, -1] as [number, number],
  bias: 0.5,
  lattice: {
    first_input_low: -3,
    first_input_high: 3,
    second_input_low: -3,
    second_input_high: 3,
    cells: 2,
  },
};

export type ResponsesByActivation = Record<ActivationName, NeuronResponse>;

const workedResponses = new Map<string, Promise<ResponsesByActivation>>();

// The worked neuron under each of the four bends at one probe, fetched once
// per probe and shared by every widget that reads a curve or a worked
// reading off it.
export function fetchWorkedResponses(
  probe: PlanePoint,
): Promise<ResponsesByActivation> {
  const key = `${probe.first_input},${probe.second_input}`;
  let pending = workedResponses.get(key);
  if (!pending) {
    pending = Promise.all(
      ACTIVATION_NAMES.map((activation) =>
        respondNeuron({ ...WORKED_NEURON, activation, probe }),
      ),
    ).then((answers) => {
      const gathered = {} as ResponsesByActivation;
      ACTIVATION_NAMES.forEach((activation, index) => {
        gathered[activation] = answers[index];
      });
      return gathered;
    });
    workedResponses.set(key, pending);
  }
  return pending;
}

// One person of the crowd, in the units measured and in standard units.
export interface CrowdPerson {
  height: number;
  weight: number;
  is_adult: number;
  standardised_height: number;
  standardised_weight: number;
}

// One person scored by the logistic model and by the neuron built from it.
export interface TwinPerson extends CrowdPerson {
  score: number;
  model_probability: number;
  neuron_output: number;
  gap: number;
  predicted_adult: number;
}

// The logistic model fitted to the standardised crowd, and the neuron that
// equals it: its weights on standardised height and weight, in that order,
// and its bias.
export interface LogisticTwin {
  mean_height: number;
  deviation_height: number;
  mean_weight: number;
  deviation_weight: number;
  fitted_weights: number[];
  fitted_bias: number;
  epochs_run: number;
  converged: boolean;
  accuracy: number;
  n_correct: number;
  n_people: number;
  largest_gap: number;
  zero_line: ZeroLine | null;
  people: TwinPerson[];
}

let logisticTwin: Promise<LogisticTwin> | null = null;

// The twin is one fixed fit, so every widget shares one request.
export function fetchLogisticTwin(): Promise<LogisticTwin> {
  if (!logisticTwin) {
    logisticTwin = getJson<LogisticTwin>("/concepts/neurons/logistic-twin");
  }
  return logisticTwin;
}

export interface CensusRequest {
  weights: [number, number];
  bias: number;
  activation: ActivationName;
}

// One person's score, output and the bend's slope at that score.
export interface CensusPerson extends CrowdPerson {
  score: number;
  output: number;
  slope: number;
}

// How much of the crowd a neuron has stopped learning from. The dead are
// those at whose score the slope is exactly zero; the saturated are those
// under a hundredth of the bend's peak, and they include the dead.
export interface CrowdCensus {
  activation: ActivationName;
  peak_slope: number;
  saturation_threshold: number;
  n_people: number;
  n_dead: number;
  n_saturated: number;
  smallest_slope: number;
  largest_slope: number;
  people: CensusPerson[];
}

export async function censusCrowd(request: CensusRequest): Promise<CrowdCensus> {
  return postJson<CrowdCensus>("/concepts/neurons/crowd-census", request);
}

export interface ChainRequest {
  first_weights: [number, number];
  first_bias: number;
  between: ActivationName;
  second_weight: number;
  second_bias: number;
  probe: PlanePoint;
  lattice: Lattice;
}

// The least-squares plane through the chain's surface. r_squared is null
// when the surface is flat, since there is nothing for a plane to explain.
export interface PlaneFit {
  height_weight: number;
  weight_weight: number;
  intercept: number;
  r_squared: number | null;
  largest_residual: number;
}

// The probe row followed through both neurons, and through the collapsed
// single neuron, which agrees only when nothing bends between them.
export interface ChainReading {
  probe: PlanePoint;
  first_score: number;
  first_output: number;
  second_score: number;
  output: number;
  collapsed_output: number;
}

export interface ChainResponse {
  between: ActivationName;
  collapsed_weights: number[];
  collapsed_bias: number;
  cells: number;
  outputs: number[][];
  reading: ChainReading;
  plane: PlaneFit;
}

export async function chainNeurons(
  request: ChainRequest,
): Promise<ChainResponse> {
  return postJson<ChainResponse>("/concepts/neurons/chain", request);
}

export interface SoftmaxRow {
  scores: number[];
  outputs: number[];
}

// Three scores through softmax, then the same three with only the last one
// moved, and how many times the untouched first output fell.
export interface SoftmaxContrast {
  before: SoftmaxRow;
  after: SoftmaxRow;
  first_output_ratio: number;
}

let softmaxContrast: Promise<SoftmaxContrast> | null = null;

export function fetchSoftmaxContrast(): Promise<SoftmaxContrast> {
  if (!softmaxContrast) {
    softmaxContrast = getJson<SoftmaxContrast>(
      "/concepts/neurons/softmax-contrast",
    );
  }
  return softmaxContrast;
}
