import { postJson } from "@/lib/api";

export type Colour = "red" | "blue" | "green";
export type Word = "cat" | "dog" | "mat";
export type RecurrentKind = "simple" | "lstm" | "gru";
export interface AttentionView {
  tokens: Colour[];
  inputs: number[][];
  queries: number[][][];
  keys: number[][][];
  values: number[][][];
  shares: number[][][];
  outputs: number[][];
  head_size: number;
}
export interface EmbeddingView {
  vocabulary: string[];
  identifiers: number[];
  before: number[][];
  looked_up: number[][];
  targets: number[][];
  gradient: number[][];
  after: number[][];
  loss_before: number;
  loss_after: number;
}
export interface PositionView {
  inputs: number[][];
  pattern: number[][];
  outputs: number[][];
}
export interface RecurrentView {
  inputs: number[];
  states: number[];
  cells: number[];
  gate_names: string[];
  gates: number[][];
  input_slopes: number[];
}
export interface RadialView {
  centres: number[];
  outputs: number[];
  distances_squared: number[];
  curve_inputs: number[];
  curve_outputs: number[][];
  centre_slopes: number[];
  width_slopes: number[];
}
export interface ResidualView {
  inner_output: number;
  output: number;
  inner_slope: number;
  slope: number;
}

export const attend = (tokens: Colour[], heads: number, causal: boolean, positions: boolean) =>
  postJson<AttentionView>("/concepts/attention/respond", { tokens, heads, causal, positions });
export const updateEmbedding = (tokens: Word[], learning_rate: number) =>
  postJson<EmbeddingView>("/concepts/embedding-layers/step", { tokens, learning_rate });
export const encodePositions = (steps: number, wavelength: number) =>
  postJson<PositionView>("/concepts/positional-encoding/respond", { steps, wavelength });
export const recur = (kind: RecurrentKind, steps: number, signal: number, forget_bias: number) =>
  postJson<RecurrentView>("/concepts/recurrent-layers/respond", { kind, steps, signal, forget_bias });
export const radial = (probe: number, width: number) =>
  postJson<RadialView>("/concepts/radial-basis-networks/respond", { probe, width });
export const residual = (value: number, weight: number) =>
  postJson<ResidualView>("/concepts/residual-connections/respond", { value, weight });
