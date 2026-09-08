// The U-Net page's endpoints.
//
// One report per arrangement and weight seed: the small U with its skip
// connections joined and the same U without them. Each is trained once on the
// server and cached, so the fixed requests below are fetched once per page and
// shared through module-level promises between every widget that wants them.
//
// Beside those, what a classifier's kind and a brightness threshold manage on
// the same pictures, the backward walk checked against a finite difference,
// and the trained weights read at another size.

import { getJson } from "@/lib/api";

export type Grid = number[][];

export const SEEDS = [0, 1, 2] as const;

export interface LayerReading {
  part: string;
  label: string;
  reads: number[];
  answers: number[];
  parameters: number;
  reads_skip: boolean;
}

export interface EpochReading {
  epoch: number;
  loss_per_pixel: number;
  held_out_pixel_accuracy: number;
  held_out_overlap: number;
}

export interface Scores {
  n_pictures: number;
  pixel_accuracy: number;
  mean_overlap: number;
  boundary_accuracy: number;
  interior_accuracy: number;
  n_boundary: number;
  n_interior: number;
  boundary_wrong: number;
  interior_wrong: number;
  missed: number;
  invented: number;
}

export interface KindScore {
  kind: string;
  kind_words: string;
  mean_overlap: number;
  pixel_accuracy: number;
  boundary_accuracy: number;
}

export interface PictureAnswer {
  kind: string;
  kind_words: string;
  picture: Grid;
  truth: Grid;
  boundary: Grid;
  probability: Grid;
  called: Grid;
  pixels_right: number;
  overlap: number;
  boundary_right: number;
  n_boundary: number;
}

export interface RingErrors {
  n_hole: number;
  hole_called_shape: number;
  n_outside: number;
  outside_called_shape: number;
  n_ring: number;
  ring_missed: number;
}

export interface WorkedPixel {
  row: number;
  column: number;
  truth: number;
  on_boundary: boolean;
  score: number;
  probability: number;
  loss_term: number;
}

export interface WorkedOverlap {
  truth_pixels: number;
  called_pixels: number;
  intersection: number;
  union: number;
  overlap: number;
  pixels_right: number;
  n_boundary: number;
  boundary_right: number;
}

export interface UReport {
  skip: boolean;
  seed: number;
  label: string;
  layers: LayerReading[];
  n_parameters: number;
  parameters_by_part: Record<string, number>;
  n_training: number;
  n_held_out: number;
  epochs: number;
  step_size: number;
  history: EpochReading[];
  held_out: Scores;
  by_kind: KindScore[];
  rings: Scores;
  ring_errors: RingErrors;
  examples: PictureAnswer[];
  ring_examples: PictureAnswer[];
  worked_pixel: WorkedPixel;
  worked_overlap: WorkedOverlap;
  seconds: number;
}

export interface ClassifierShape {
  label: string;
  answers: number[];
  spatial: boolean;
}

export interface Baseline {
  name: string;
  description: string;
  scores: Scores;
}

export interface BaselinesResponse {
  mask_share: number;
  best_cut: number;
  cuts_tried: number;
  training_accuracy_at_cut: number;
  classifier_accuracy: number;
  classifier_shapes: ClassifierShape[];
  baselines: Baseline[];
  ring_cut: Scores;
  ring_picture_threshold: Scores;
}

export interface SideReading {
  side: number;
  after_first_pooling: number;
  after_second_pooling: number;
  repeated_once: number;
  repeated_twice: number;
  half_size_join_defined: boolean;
  full_size_join_defined: boolean;
  answer_side: number;
}

export interface LargerResponse {
  side: number;
  picture: Grid;
  truth: Grid;
  probability: Grid;
  scores: Scores;
  separately: Scores;
  changed_pixels: number;
  farthest_from_seam: number;
  blank_brightness: number;
  blank_called_with_skip: number;
  blank_largest_probability: number;
  sides: SideReading[];
}

const PREFIX = "/concepts/u-net";

const reports = new Map<string, Promise<UReport>>();

// Each report trains a network the first time it is asked for, so a failed
// request is dropped from the cache and the next widget to ask tries again.
export function fetchUReport(skip: boolean, seed: number): Promise<UReport> {
  const key = `${skip}:${seed}`;
  let pending = reports.get(key);
  if (!pending) {
    pending = getJson<UReport>(`${PREFIX}/network?skip=${skip}&seed=${seed}`);
    pending.catch(() => reports.delete(key));
    reports.set(key, pending);
  }
  return pending;
}

let baselines: Promise<BaselinesResponse> | null = null;

export function fetchBaselines(): Promise<BaselinesResponse> {
  if (!baselines) {
    baselines = getJson<BaselinesResponse>(`${PREFIX}/baselines`);
    baselines.catch(() => {
      baselines = null;
    });
  }
  return baselines;
}

let larger: Promise<LargerResponse> | null = null;

export function fetchLarger(): Promise<LargerResponse> {
  if (!larger) {
    larger = getJson<LargerResponse>(`${PREFIX}/larger`);
    larger.catch(() => {
      larger = null;
    });
  }
  return larger;
}
