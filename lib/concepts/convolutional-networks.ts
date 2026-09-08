// The convolutional networks page's endpoints.
//
// One report per arrangement and weight seed: the network itself, the network
// with its pooling taken away, one round of convolve and pool, and dense
// layers on the raw pixels. Each is trained once on the server and cached, so
// the fixed requests below are fetched once per page and shared through
// module-level promises between every widget that wants them.
//
// Beside those, one picture of each kind carried through every depth, which
// pixels one unit can see, and what the network answers when the question is
// outside what it was built for.

import { getJson, postJson } from "@/lib/api";

export type Grid = number[][];

export type Variant = "reference" | "without_pooling" | "one_round" | "dense";

export const VARIANTS: Variant[] = [
  "reference",
  "without_pooling",
  "one_round",
  "dense",
];

export const SEEDS = [0, 1, 2] as const;

export type Depth =
  | "first_convolution"
  | "first_pooling"
  | "second_convolution"
  | "second_pooling";

export type Kind = "cross" | "square" | "disc" | "bar";

export const KINDS: Kind[] = ["cross", "square", "disc", "bar"];

export const KIND_WORDS: Record<string, string> = {
  cross: "cross",
  square: "square outline",
  disc: "filled disc",
  bar: "diagonal bar",
  ring: "ring",
};

export interface LayerReading {
  label: string;
  reads: number[];
  answers: number[];
  parameters: number;
  multiply_adds: number;
  field: number;
  step: number;
  reads_whole_picture: boolean;
}

export interface EpochReading {
  epoch: number;
  loss: number;
  training_accuracy: number;
  held_out_accuracy: number;
}

export interface ShiftReading {
  distance: number;
  n_pictures: number;
  calls_changed: number;
  shifted_accuracy: number;
  accuracy_before: number;
  probability_move: number;
}

export interface FilterReading {
  index: number;
  kernel: Grid;
  start_kernel: Grid;
  closest_grid: Grid;
  bias: number;
  moved: number;
  closest: string;
  closeness: number;
  closeness_at_start: number;
  weight_total: number;
  active_share: number;
  nearly_silent: boolean;
}

export interface EdgeBaseline {
  n_draws: number;
  median: number;
  ninetieth_percentile: number;
}

export interface VariantReport {
  variant: Variant;
  label: string;
  seed: number;
  layers: LayerReading[];
  n_parameters: number;
  n_multiply_adds: number;
  n_training: number;
  n_held_out: number;
  training_accuracy: number;
  held_out_accuracy: number;
  best_held_out_accuracy: number;
  best_epoch: number;
  final_loss: number;
  history: EpochReading[];
  shifts: ShiftReading[];
  filters: FilterReading[];
  edge_baseline: EdgeBaseline;
  n_nearly_silent: number;
  seconds: number;
}

export interface DepthMaps {
  depth: Depth;
  label: string;
  side: number;
  maps: Grid[];
  largest: number;
}

export interface PictureThroughNetwork {
  kind: Kind;
  kind_words: string;
  position: number;
  picture: Grid;
  depths: DepthMaps[];
  vector: number[];
  scores: number[];
  probabilities: number[];
  called: Kind;
}

export interface WorkedCell {
  filter_index: number;
  row: number;
  column: number;
  patch: Grid;
  kernel: Grid;
  products: Grid;
  product_total: number;
  bias: number;
  score: number;
  output: number;
  pool_top: number;
  pool_left: number;
  pool_window: Grid;
  pooled: number;
}

export interface MapsResponse {
  kind_names: Kind[];
  pictures: PictureThroughNetwork[];
  worked: WorkedCell;
}

export interface ReachResponse {
  kind: Kind;
  depth: Depth;
  label: string;
  side: number;
  row: number;
  column: number;
  field: number;
  top: number;
  left: number;
  bottom: number;
  right: number;
  n_in_window: number;
  n_moved: number;
  n_moved_outside: number;
  poke: number;
  picture: Grid;
  influence: Grid;
  largest_influence: number;
}

export interface UnseenPicture {
  picture: Grid;
  probabilities: number[];
  called: Kind;
}

export interface SideReading {
  side: number;
  after_first_pooling: number;
  after_second_pooling: number;
  flattened: number;
  trained_width: number;
  readable: boolean;
  first_drops: number;
  second_drops: number;
}

export interface UnseenResponse {
  kind_names: Kind[];
  n_rings: number;
  ring_calls: number[];
  ring_mean_confidence: number;
  ring_share_above_ninety: number;
  held_out_mean_confidence: number;
  held_out_share_above_ninety: number;
  examples: UnseenPicture[];
  blank_brightness: number;
  blank_probabilities: number[];
  blank_called: Kind;
  sides: SideReading[];
}

const PREFIX = "/concepts/convolutional-networks";

const reports = new Map<string, Promise<VariantReport>>();

// Each report trains a network the first time it is asked for, so a failed
// request is dropped from the cache and the next widget to ask tries again.
export function fetchNetworkReport(
  variant: Variant,
  seed: number,
): Promise<VariantReport> {
  const key = `${variant}:${seed}`;
  let pending = reports.get(key);
  if (!pending) {
    pending = getJson<VariantReport>(
      `${PREFIX}/network?variant=${variant}&seed=${seed}`,
    );
    pending.catch(() => reports.delete(key));
    reports.set(key, pending);
  }
  return pending;
}

let maps: Promise<MapsResponse> | null = null;

export function fetchNetworkMaps(): Promise<MapsResponse> {
  if (!maps) {
    maps = getJson<MapsResponse>(`${PREFIX}/maps`);
    maps.catch(() => {
      maps = null;
    });
  }
  return maps;
}

let unseen: Promise<UnseenResponse> | null = null;

export function fetchUnseen(): Promise<UnseenResponse> {
  if (!unseen) {
    unseen = getJson<UnseenResponse>(`${PREFIX}/unseen`);
    unseen.catch(() => {
      unseen = null;
    });
  }
  return unseen;
}

export async function fetchReach(
  kind: Kind,
  depth: Depth,
  row: number,
  column: number,
): Promise<ReachResponse> {
  return postJson<ReachResponse>(`${PREFIX}/reach`, {
    kind,
    depth,
    row,
    column,
  });
}
