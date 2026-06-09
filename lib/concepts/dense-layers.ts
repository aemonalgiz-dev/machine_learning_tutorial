// The dense-layers page's endpoints. One row pushed through a two-to-three-
// to-one stack, reported layer by layer and by both routes; a block of rows
// through the same stack; one seeded layer of any width asked the same row
// both ways; two dense layers, or a whole chain of them, asked whether they
// join with no row sent; and rectifier networks trained on the crowd at
// whatever widths a widget names, several starts each.

import { RegionGrid, postJson } from "@/lib/api";

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

// The observed route: every neuron asked one at a time for the same row.
// products holds each neuron's weight-times-input terms in input order.
export interface NeuronRoute {
  scores: number[];
  outputs: number[];
  products: number[][];
}

// One layer's part of the pass, straight off the library's response. inputs
// is the row it read, scores the sums before the bend, outputs the row the
// next layer reads, formula the bend in the library's own notation,
// weight_matrix one row per neuron and one column per input, and route_gap
// the largest difference between the matrix route and the neuron route.
export interface LayerPass extends Extents {
  activation: ActivationName;
  formula: string;
  inputs: number[];
  scores: number[];
  outputs: number[];
  weight_matrix: number[][];
  bias_vector: number[];
  n_parameters: number;
  neuron_route: NeuronRoute;
  route_gap: number;
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
  n_layers: number;
  n_parameters: number;
  layers: LayerPass[];
  output: number;
  without_bends: CollapsedMap;
}

export async function forwardPass(
  request: ForwardRequest,
): Promise<ForwardPass> {
  return postJson<ForwardPass>("/concepts/dense-layers/forward", request);
}

export interface BlockRequest {
  rows: number[][];
  hidden: LayerWeights;
  output: LayerWeights;
}

// One layer's response to a block. inputs_shape is (rows, inputs) and
// scores_shape is (rows, neurons), which the outputs share.
export interface BlockPass extends Extents {
  inputs_shape: number[];
  scores_shape: number[];
  inputs: number[][];
  scores: number[][];
  outputs: number[][];
}

export interface BlockResponse {
  n_rows: number;
  shape: Extents;
  layers: BlockPass[];
  outputs: number[];
}

export async function pushBlock(request: BlockRequest): Promise<BlockResponse> {
  return postJson<BlockResponse>("/concepts/dense-layers/block", request);
}

export interface RoutesRequest {
  n_inputs: number;
  n_neurons: number;
  activation?: ActivationName;
  seed?: number;
}

// The two routes on one seeded layer, and how far apart they came out.
export interface RoutesComparison {
  n_inputs: number;
  n_neurons: number;
  n_parameters: number;
  score_gap: number;
  output_gap: number;
  first_scores_matrix: number[];
  first_scores_loop: number[];
}

export async function compareRoutes(
  request: RoutesRequest,
): Promise<RoutesComparison> {
  return postJson<RoutesComparison>("/concepts/dense-layers/routes", request);
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

export interface ChainVerdict {
  layers: Extents[];
  stack: Extents;
  n_seams: number;
  n_parameters: number;
}

export async function stackChain(layers: DenseShape[]): Promise<ChainVerdict> {
  return postJson<ChainVerdict>("/concepts/dense-layers/chain", { layers });
}

// One training run from one seed, as it ended. dead_units has one entry per
// hidden layer and counts the units that never switched on for anyone.
export interface CarvedRun {
  seed: number;
  accuracy: number;
  n_correct: number;
  starting_loss: number;
  final_loss: number;
  dead_units: number[];
}

// One first-layer rectifier's fold, in standardised units, where its score
// is zero. dead says it never switched on for anyone in the crowd.
export interface FoldLine {
  weight_height: number;
  weight_weight: number;
  bias: number;
  dead: boolean;
}

export interface CarvedPerson {
  height: number;
  weight: number;
  is_adult: number;
  called_adult: number;
}

export interface Carving {
  hidden_widths: number[];
  n_parameters: number;
  learning_rate: number;
  epochs: number;
  runs: CarvedRun[];
  best_seed: number;
  best_accuracy: number;
  mean_accuracy: number;
  seeds_reaching_everyone: number;
  regions: RegionGrid;
  folds: FoldLine[];
  people: CarvedPerson[];
  mean_height: number;
  deviation_height: number;
  mean_weight: number;
  deviation_weight: number;
  straight_line_accuracy: number;
}

// Several widgets ask for the same architectures, and each one is six
// training runs, so one page-load shares one answer per architecture.
const carvingCache = new Map<string, Promise<Carving>>();

export function carveCrowd(hiddenWidths: number[]): Promise<Carving> {
  const key = hiddenWidths.join(",");
  const cached = carvingCache.get(key);
  if (cached) return cached;
  const pending = postJson<Carving>("/concepts/dense-layers/carve", {
    hidden_widths: hiddenWidths,
  }).catch((error) => {
    carvingCache.delete(key);
    throw error;
  });
  carvingCache.set(key, pending);
  return pending;
}
