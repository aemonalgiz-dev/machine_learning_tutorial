// Client functions for the page about giving a picture a token number.
//
// Every number here is computed by the API against the same four pictures, each
// cut into pairs of side-by-side pixels: the quantise endpoint snaps every pair
// to the nearest entry of a table and reports what that cost, the sweep endpoint
// walks the table size from one entry to thirty-two on all four pictures, the
// same-number endpoint finds pairs that came back with one number and puts a
// table to a picture it was never chosen for, and the choosing endpoint fits a
// table on half a picture and measures it on the other half.

import { getJson, postJson } from "@/lib/api";

const BASE = "/concepts/codebook-quantisation";

export type PictureName = "photograph" | "poster" | "chart" | "speckle";

export interface HandRow {
  vector: number[];
  squared_distances: number[];
  code_id: number;
  reconstruction: number[];
  squared_gap: number;
  tied: boolean;
}

export interface HandView {
  codes: number[][];
  rows: HandRow[];
  distortion: number;
  reordered_codes: number[][];
  reordered_ids: number[];
  reordered_distortion: number;
}

let handPromise: Promise<HandView> | null = null;

export async function fetchNearestCode(): Promise<HandView> {
  if (!handPromise) {
    handPromise = getJson<HandView>(`${BASE}/nearest-code`);
  }
  return handPromise;
}

export interface PieceView {
  left: number;
  right: number;
  code_id: number;
  squared_gap: number;
}

export interface QuantiseView {
  picture: PictureName;
  picture_label: string;
  picture_description: string;
  table_from: PictureName;
  table_from_label: string;
  side: number;
  n_codes: number;
  n_pieces: number;
  n_distinct_pieces: number;
  pixels: number[][];
  reconstruction: number[][];
  codes: number[][];
  pieces: PieceView[];
  usage: number[];
  n_unused: number;
  distortion: number;
  root_mean_square_gap: number;
  worst_squared_gap: number;
  worst_piece: number[];
  best_squared_gap: number;
  best_piece: number[];
  bits_per_piece: number;
  total_id_bits: number;
}

export async function quantisePicture(
  picture: PictureName,
  nCodes: number,
  tableFrom?: PictureName,
): Promise<QuantiseView> {
  return postJson<QuantiseView>(`${BASE}/quantise`, {
    picture,
    n_codes: nCodes,
    ...(tableFrom ? { table_from: tableFrom } : {}),
  });
}

export interface SweepStep {
  n_codes: number;
  bits_per_piece: number;
  distortion: number | null;
  cut_by: number | null;
  exact: boolean;
  n_unused: number | null;
  refused: string | null;
}

export interface PictureSweep {
  picture: PictureName;
  label: string;
  description: string;
  n_pieces: number;
  n_distinct_pieces: number;
  spread_along: number;
  spread_across: number;
  spread_ratio: number | null;
  steps: SweepStep[];
}

export interface SweepView {
  sizes: number[];
  pictures: PictureSweep[];
}

let sweepPromise: Promise<SweepView> | null = null;

// The sweep is the same four pictures every time, so the request is made once
// and shared by whichever widgets ask for it.
export async function fetchTableSizeSweep(): Promise<SweepView> {
  if (!sweepPromise) {
    sweepPromise = getJson<SweepView>(`${BASE}/table-size-sweep`);
  }
  return sweepPromise;
}

export interface Collision {
  n_codes: number;
  code_id: number;
  n_pieces_sharing: number;
  n_distinct_sharing: number;
  first: number[];
  second: number[];
  separation: number;
  reconstruction: number[];
}

export interface MatchProbe {
  piece: number[];
  code_id: number;
  reconstruction: number[];
  squared_gap: number;
}

export interface SameNumberView {
  collisions: Collision[];
  home_picture: PictureName;
  home_label: string;
  home_distortion: number;
  elsewhere_picture: PictureName;
  elsewhere_label: string;
  elsewhere_distortion: number;
  elsewhere_n_codes: number;
  elsewhere_ratio: number;
  elsewhere_best: MatchProbe;
  elsewhere_worst: MatchProbe;
}

let sameNumberPromise: Promise<SameNumberView> | null = null;

export async function fetchSameNumber(): Promise<SameNumberView> {
  if (!sameNumberPromise) {
    sameNumberPromise = getJson<SameNumberView>(`${BASE}/same-number`);
  }
  return sameNumberPromise;
}

export interface UnusedRow {
  n_codes: number;
  fitted_distortion: number;
  fitted_unused: number;
  held_out_distortion: number;
  held_out_unused: number;
  elsewhere_distortion: number | null;
  elsewhere_unused: number | null;
}

export interface StartRow {
  seed: number;
  distortion: number;
}

export interface MetricDisagreement {
  piece: number[];
  straight_line_id: number;
  straight_line_code: number[];
  coordinate_sum_id: number;
  coordinate_sum_code: number[];
  straight_line_distances: number[];
  coordinate_sum_distances: number[];
}

export interface ChoosingView {
  n_pieces: number;
  n_fitting_pieces: number;
  n_held_out_pieces: number;
  rows: UnusedRow[];
  start_size: number;
  starts: StartRow[];
  disagreement_size: number;
  n_disagreements: number;
  disagreements: MetricDisagreement[];
  largest_table: number;
  refusal_size: number;
  refusal: string;
  one_entry_distortion: number;
  spread_about_the_mean: number;
}

let choosingPromise: Promise<ChoosingView> | null = null;

export async function fetchChoosingTheTable(): Promise<ChoosingView> {
  if (!choosingPromise) {
    choosingPromise = getJson<ChoosingView>(`${BASE}/choosing-the-table`);
  }
  return choosingPromise;
}
