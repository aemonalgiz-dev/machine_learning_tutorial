// The dense-layers page's endpoints. One row pushed through a two-to-three-
// to-one stack, reported layer by layer, and two dense layers asked whether
// they join, with no row sent.

import { postJson } from "@/lib/api";

export { ApiError } from "@/lib/api";

export type ActivationName =
  | "identity"
  | "rectified_linear"
  | "sigmoid"
  | "hyperbolic_tangent";

export const ACTIVATION_NAMES: ActivationName[] = [
  "identity",
  "rectified_linear",
  "sigmoid",
  "hyperbolic_tangent",
];

export const ACTIVATION_LABELS: Record<ActivationName, string> = {
  identity: "identity",
  rectified_linear: "rectified linear",
  sigmoid: "sigmoid",
  hyperbolic_tangent: "hyperbolic tangent",
};

// One layer as the request carries it, a weight row per neuron, a bias per
// neuron, and the bend every neuron in the layer shares.
export interface LayerWeights {
  weights: number[][];
  biases: number[];
  activation: ActivationName;
}

export interface ForwardRequest {
  inputs: number[];
  hidden: LayerWeights;
  output: LayerWeights;
}

// What a layer, or the whole stack, reads and answers with. Each side is the
// library's tuple of extents, so a dense layer's is a one-entry list.
export interface Extents {
  reads: number[];
  answers: number[];
}

// One layer's part of the pass, straight off the library's response. inputs
// is the row it read, scores the sums before the bend, outputs the row the
// next layer reads, and formula the bend in the library's own notation.
export interface LayerPass extends Extents {
  activation: ActivationName;
  formula: string;
  inputs: number[];
  scores: number[];
  outputs: number[];
}

// The single affine map the two layers become when both bends are removed,
// and the library's own answer at the row with both bends set to identity.
export interface CollapsedMap {
  weights: number[];
  bias: number;
  output: number;
}

export interface ForwardPass {
  purpose: string;
  shape: Extents;
  layers: LayerPass[];
  output: number;
  without_bends: CollapsedMap;
}

export async function forwardPass(
  request: ForwardRequest,
): Promise<ForwardPass> {
  return postJson<ForwardPass>("/concepts/dense-layers/forward", request);
}

export interface DenseShape {
  reads: number;
  answers: number;
}

export interface JoinVerdict {
  layers: Extents[];
  stack: Extents;
}

export async function joinLayers(
  beneath: DenseShape,
  above: DenseShape,
): Promise<JoinVerdict> {
  return postJson<JoinVerdict>("/concepts/dense-layers/join", {
    beneath,
    above,
  });
}
