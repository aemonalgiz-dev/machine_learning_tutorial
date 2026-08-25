// The pooling page's endpoints: one picture pooled by one window, with the
// blame every input cell receives when a slope of one arrives at each pooled
// cell, and what one window's shares add up to at every side up to thirty-two.
//
// Four more sit beside those. The arrangement endpoint builds a layer for every
// window and stride and reads its shape without pooling anything, which is how
// the page can state the output extents before a picture exists. The window
// endpoint asks each kind what it makes of one small square and what it owes
// each position in it. The shift endpoint pools a picture, then the same
// picture moved sideways, and counts what changed. The edge-case endpoint runs
// every refusal the page's last part quotes, and the two things that are not
// refusals.

import { getJson, postJson } from "@/lib/api";

export type PoolingKind = "max" | "average";

export type Grid = number[][];

export interface PicturePosition {
  row: number;
  column: number;
}

// One window the layer swept. The corner is the window's first cell in the
// picture, the winner is the cell a maximum routed the whole slope to and is
// null under an average, and share_total is what the layer's shares inside
// the window add up to.
export interface SweptWindow {
  output_row: number;
  output_column: number;
  top: number;
  left: number;
  answer: number;
  winner: PicturePosition | null;
  share_total: number;
}

export interface Pooling {
  kind: PoolingKind;
  height: number;
  width: number;
  window: number;
  stride: number;
  pooled_height: number;
  pooled_width: number;
  pooled: Grid;
  blame: Grid;
  corrected: boolean[][];
  n_corrected: number;
  windows: SweptWindow[];
}

export interface ShareTotal {
  side: number;
  positions: number;
  total: number;
  exact: boolean;
}

export interface ShareTotals {
  kind: PoolingKind;
  totals: ShareTotal[];
  n_inexact: number;
  worst_side: number;
  worst_gap: number;
}

export async function applyPooling(
  picture: Grid,
  window: number,
  stride: number,
  kind: PoolingKind,
): Promise<Pooling> {
  return postJson<Pooling>("/concepts/pooling/apply", {
    picture,
    window,
    stride,
    kind,
  });
}

export async function sumWindowShares(
  kind: PoolingKind,
  largestSide: number,
): Promise<ShareTotals> {
  return postJson<ShareTotals>("/concepts/pooling/share-totals", {
    kind,
    largest_side: largestSide,
  });
}

// One window and stride over one picture, with nothing pooled. `answers` is the
// arrangement one output has, `unvisited_rows` and `unvisited_columns` are the
// positions no window reaches, and a combination the library will not build
// comes back refused with its own message rather than failing the whole sweep.
export interface ArrangementRow {
  window: number;
  stride: number;
  refused: boolean;
  detail: string | null;
  reads: number[] | null;
  answers: number[] | null;
  n_inputs: number | null;
  n_outputs: number | null;
  values_dropped: number | null;
  kept_share: number | null;
  overlaps: boolean;
  unvisited_rows: number[];
  unvisited_columns: number[];
  n_unvisited_cells: number;
  kinds_agree: boolean;
}

export interface Arrangement {
  channels: number;
  height: number;
  width: number;
  rows: ArrangementRow[];
}

export interface ArrangementRequest {
  channels: number;
  height: number;
  width: number;
  windows: number[];
  strides: number[];
}

// Several widgets ask for the same fixed arrangement, so one page load makes
// one request per distinct question.
const arrangementCache = new Map<string, Promise<Arrangement>>();

export async function readArrangement(
  request: ArrangementRequest,
): Promise<Arrangement> {
  const key = JSON.stringify(request);
  const cached = arrangementCache.get(key);
  if (cached) return cached;
  const pending = postJson<Arrangement>(
    "/concepts/pooling/geometry",
    request,
  ).catch((error) => {
    arrangementCache.delete(key);
    throw error;
  });
  arrangementCache.set(key, pending);
  return pending;
}

// What one kind keeps from one window, and what each position in it is owed.
export interface WindowSummary {
  kind: PoolingKind;
  answer: number;
  shares: Grid;
  share_total: number;
  winner: PicturePosition | null;
  n_receiving: number;
}

export interface WindowReading {
  side: number;
  positions: number;
  values: Grid;
  total: number;
  summaries: WindowSummary[];
}

export async function readWindow(window: Grid): Promise<WindowReading> {
  return postJson<WindowReading>("/concepts/pooling/window", { window });
}

// The pooled map at one sideways position, beside the map at no shift at all.
export interface ShiftedMap {
  shift: number;
  picture: Grid;
  pooled: Grid;
  picture_cells_changed: number;
  pooled_cells_changed: number;
  largest_pooled_change: number;
}

export interface KindShifts {
  kind: PoolingKind;
  maps: ShiftedMap[];
}

export interface ShiftReading {
  window: number;
  stride: number;
  height: number;
  width: number;
  pooled_height: number;
  pooled_width: number;
  n_picture_cells: number;
  n_pooled_cells: number;
  by_kind: KindShifts[];
}

export async function poolAcrossShifts(
  picture: Grid,
  window: number,
  stride: number,
  shifts: number[],
): Promise<ShiftReading> {
  return postJson<ShiftReading>("/concepts/pooling/shift", {
    picture,
    window,
    stride,
    shifts,
  });
}

// One thing asked of a pooling layer, and what came back. `library_error` says
// whether the refusal is one of the library's own rather than a bare builtin
// failure, and `outcome` describes what happened when nothing was refused.
export interface EdgeCase {
  name: string;
  attempt: string;
  raised: boolean;
  error: string | null;
  detail: string | null;
  library_error: boolean;
  outcome: string;
}

// Two layers of one shape, and a response handed to the wrong one. Nothing is
// raised, the totals agree, and the arriving values land elsewhere.
export interface PairingMistake {
  reads: number[];
  answers: number[];
  producer_window: number;
  producer_stride: number;
  receiver_window: number;
  receiver_stride: number;
  arriving: Grid;
  producer_blame: Grid;
  receiver_blame: Grid;
  producer_total: number;
  receiver_total: number;
  n_cells_differing: number;
  raised: boolean;
}

export interface EdgeCases {
  cases: EdgeCase[];
  n_refused: number;
  n_accepted: number;
  pairing_mistake: PairingMistake;
}

let edgeCases: Promise<EdgeCases> | null = null;

export async function readEdgeCases(): Promise<EdgeCases> {
  if (edgeCases) return edgeCases;
  edgeCases = getJson<EdgeCases>("/concepts/pooling/edge-cases").catch(
    (error) => {
      edgeCases = null;
      throw error;
    },
  );
  return edgeCases;
}
