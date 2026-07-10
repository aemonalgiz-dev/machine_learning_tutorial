// The pooling page's endpoints: one picture pooled by one window, with the
// blame every input cell receives when a slope of one arrives at each pooled
// cell, and what one window's shares add up to at every side up to thirty-two.

import { postJson } from "@/lib/api";

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
