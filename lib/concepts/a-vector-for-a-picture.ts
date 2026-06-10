// Client functions for the a-vector-for-a-picture page.
//
// Every number here is computed by the API and only drawn in the browser. The
// network is the one every picture page shares, trained only to name four
// kinds of picture, and its hidden layer of sixteen is read as each
// picture's vector. The fixed requests are cached in module-level promises,
// because several widgets on the page want the same walk, the same sphere and
// the same three seed studies.

import { getJson, postJson } from "@/lib/api";

export type KindName = "cross" | "square" | "disc" | "bar" | "ring";

export interface LayerRow {
  position: number;
  name: string;
  answer_shape: number[];
  n_numbers: number;
  n_parameters: number;
}

export interface WalkedPicture {
  position: number;
  kind: KindName;
  rows: number[][];
  vector: number[];
  length: number;
  scores: number[];
  probabilities: number[];
  called: KindName;
}

export interface WorkedPair {
  first: KindName;
  second: KindName;
  dot: number;
  first_length: number;
  second_length: number;
  cosine: number;
}

export interface WalkAnswer {
  layers: LayerRow[];
  n_parameters: number;
  epochs: number;
  n_training: number;
  n_held_out: number;
  per_kind_held_out: number;
  held_out_accuracy: number;
  training_accuracy: number;
  kinds: KindName[];
  pictures: WalkedPicture[];
  cosines: number[][];
  pixel_gaps: number[][];
  worked: WorkedPair;
}

export interface SpherePoint {
  x: number;
  y: number;
  z: number;
  kind: KindName;
  position: number;
}

export interface SphereView {
  network: "trained" | "untrained";
  points: SpherePoint[];
  kept_share: number;
  within: number;
  across: number;
  nearest_own_kind: number;
}

export interface SphereAnswer {
  dimension: number;
  n_pictures: number;
  n_rings: number;
  views: SphereView[];
}

export interface Neighbour {
  collection: "held_out" | "rings";
  position: number;
  kind: KindName;
  rows: number[][];
  cosine: number;
  gap: number;
}

export interface NeighboursAnswer {
  collection: "held_out" | "rings";
  position: number;
  kind: KindName;
  rows: number[][];
  called: KindName;
  probabilities: number[];
  length: number;
  pool_size: number;
  by_vector: Neighbour[];
  by_pixels: Neighbour[];
  pixel_misses: number[];
  vector_misses: number[];
}

export interface Representation {
  name: string;
  layer: "pixels" | "pixels less their mean" | "flattened" | "hidden" | "scores";
  trained: boolean | null;
  measure: "angle" | "distance";
  width: number;
  nearest_own_kind: number;
  within: number;
  across: number;
}

export interface RingStudy {
  called: number[];
  nearest_by_vector: number[];
  nearest_by_pixels: number[];
  nearest_by_untrained: number[];
  ring_to_ring: number;
  ring_to_kind: number[];
  gathered: Record<string, number>;
}

export interface AgainstReference {
  same_picture_cosine: number;
  matching_coordinate_correlation: number;
  same_nearest_picture: number;
  same_nearest_kind: number;
}

export interface SeedAnswer {
  weight_seed: number;
  held_out_accuracy: number;
  untrained_accuracy: number;
  kinds: KindName[];
  representations: Representation[];
  vector_confusion: number[][];
  pixel_confusion: number[][];
  rings: RingStudy;
  against_reference: AgainstReference | null;
}

export interface LengthStudy {
  shortest: number;
  longest: number;
  mean: number;
  bound: number;
  saturated_share: number;
  confidence_correlation: number;
  nearest_own_kind_by_angle: number;
  nearest_own_kind_by_distance: number;
}

export interface BlankPicture {
  name: string;
  level: number;
  length: number;
  called: KindName;
  probabilities: number[];
  cosine_to_kind: number[];
  lit_after_first_convolution: number;
  lit_after_convolutions: number;
  cosine_to_all_black: number;
}

export interface BrightnessStep {
  factor: number;
  cosine_to_original: number;
  length: number;
  called: KindName;
}

export interface BrightnessSweep {
  position: number;
  kind: KindName;
  steps: BrightnessStep[];
}

export interface EdgesAnswer {
  kinds: KindName[];
  lengths: LengthStudy;
  blanks: BlankPicture[];
  brightness: BrightnessSweep[];
  training_lift: number[];
  training_background: number[];
}

const BASE = "/concepts/a-vector-for-a-picture";

export const SEEDS = [0, 1, 2] as const;

let walkPromise: Promise<WalkAnswer> | null = null;
let spherePromise: Promise<SphereAnswer> | null = null;
let edgesPromise: Promise<EdgesAnswer> | null = null;
let seedsPromise: Promise<SeedAnswer[]> | null = null;

export function fetchWalk(): Promise<WalkAnswer> {
  walkPromise ??= getJson<WalkAnswer>(`${BASE}/walk`);
  return walkPromise;
}

export function fetchSphere(): Promise<SphereAnswer> {
  spherePromise ??= getJson<SphereAnswer>(`${BASE}/sphere`);
  return spherePromise;
}

export function fetchEdges(): Promise<EdgesAnswer> {
  edgesPromise ??= getJson<EdgesAnswer>(`${BASE}/edges`);
  return edgesPromise;
}

// The three seeds are three requests rather than one, so each stays inside
// the time one training costs; the server answers them side by side.
export function fetchSeeds(): Promise<SeedAnswer[]> {
  seedsPromise ??= Promise.all(
    SEEDS.map((seed) => getJson<SeedAnswer>(`${BASE}/seed/${seed}`)),
  );
  return seedsPromise;
}

export function fetchNeighbours(request: {
  collection: "held_out" | "rings";
  position: number;
  network: "trained" | "untrained";
  withRings: boolean;
  nResults?: number;
}): Promise<NeighboursAnswer> {
  return postJson<NeighboursAnswer>(`${BASE}/neighbours`, {
    collection: request.collection,
    position: request.position,
    network: request.network,
    with_rings: request.withRings,
    n_results: request.nResults ?? 4,
  });
}
