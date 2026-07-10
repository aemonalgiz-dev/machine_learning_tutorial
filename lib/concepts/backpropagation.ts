// The backpropagation page's one endpoint, which runs one row through the
// 2-3-1 network, walks the blame back down it, takes one step, and measures
// the loss on either side of that step.

import { ApiError, postJson } from "@/lib/api";

export { ApiError };

export type HiddenActivation =
  | "rectified_linear"
  | "sigmoid"
  | "hyperbolic_tangent"
  | "identity";

export const HIDDEN_ACTIVATIONS: HiddenActivation[] = [
  "rectified_linear",
  "sigmoid",
  "hyperbolic_tangent",
  "identity",
];

export const HIDDEN_ACTIVATION_LABELS: Record<HiddenActivation, string> = {
  rectified_linear: "rectifier, max(0, z)",
  sigmoid: "sigmoid",
  hyperbolic_tangent: "hyperbolic tangent",
  identity: "identity, no bend",
};

// One neuron as the request carries it, a weight per input in the order the
// inputs arrive, and its bias.
export interface NeuronParameters {
  weights: number[];
  bias: number;
}

// Which single weight the finite-difference check nudges. Layer 0 is the
// hidden layer and layer 1 the output layer; the neuron and input indices are
// the row and column of that layer's weight matrix.
export interface CheckedWeight {
  layer_index: number;
  neuron_index: number;
  input_index: number;
}

export interface StepRequest {
  inputs: number[];
  target: number;
  hidden_activation: HiddenActivation;
  hidden_neurons: NeuronParameters[];
  output_neuron: NeuronParameters;
  learning_rate: number;
  checked_weight: CheckedWeight;
}

// Everything one layer did, forward and backward, and where it stepped to.
// `arriving` is the slope of the loss at the layer's outputs, `slopes` the
// bend's derivative at each score, `bias_gradient` the delta, since on one
// row the sum over rows is the row, and `passed_down` the slope at the
// layer's inputs, which is what the layer beneath receives as its own
// arriving block.
export interface LayerStep {
  inputs: number[];
  scores: number[];
  outputs: number[];
  arriving: number[];
  slopes: number[];
  weight_gradient: number[][];
  bias_gradient: number[];
  passed_down: number[];
  weights_after: number[][];
  biases_after: number[];
}

// The chain rule's slope for one weight beside the nudge-and-remeasure
// figure, and how far apart the two are.
export interface FiniteDifference {
  layer_index: number;
  neuron_index: number;
  input_index: number;
  analytic: number;
  numerical: number;
  disagreement: number;
  epsilon: number;
}

export interface BackpropagationStep {
  layers: LayerStep[];
  prediction: number;
  loss_before: number;
  loss_gradient: number;
  prediction_after: number;
  loss_after: number;
  largest_movement: number;
  finite_difference: FiniteDifference;
}

export async function stepBackpropagation(
  request: StepRequest,
): Promise<BackpropagationStep> {
  return postJson<BackpropagationStep>(
    "/concepts/backpropagation/step",
    request,
  );
}
