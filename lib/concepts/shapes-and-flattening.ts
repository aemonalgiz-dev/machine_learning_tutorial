// The shape-guarantee page's endpoint: a stack of layer specifications in,
// every layer's arrangement and every seam's verdict out.
//
// The bounds below mirror the constants the API enforces, so the builder can
// stop a reader before a request the API would refuse. They are duplicated
// deliberately: the browser cannot import a Python constant, and a control
// that lets you ask for something the server will reject is a worse trade
// than two numbers that have to agree.

import { postJson } from "@/lib/api";

export const MAX_LAYERS = 8;
export const MAX_EXTENT = 32;
export const MAX_WIDTH = 16_384;
export const MAX_FILTERS = 16;
export const MAX_NEURONS = 64;
export const MAX_PADDING = 8;

export type PoolSummary = "max" | "average";

export type LayerKind = "conv" | "pool" | "flatten" | "dense";

// A layer's own reads, or null to be told what arrives. The first layer must
// state its own, since nothing beneath it answers.
export type LayerSpec =
  | {
      kind: "conv";
      reads: number[] | null;
      n_filters: number;
      kernel_size: number;
      stride: number;
      padding: number;
    }
  | {
      kind: "pool";
      reads: number[] | null;
      summary: PoolSummary;
      window: number;
      stride: number;
    }
  | { kind: "flatten"; reads: number[] | null }
  | { kind: "dense"; reads: number[] | null; n_neurons: number };

// Both the arrangement and the bare count, because the page's whole point is
// that those are two different facts. A layer the library refused carries a
// refusal and no answers; one left unsettled, because the layer beneath it was
// refused and it had nothing to read, carries neither.
export interface LayerReport {
  kind: LayerKind;
  reads: number[] | null;
  answers: number[] | null;
  n_reads: number | null;
  n_answers: number | null;
  refusal: string | null;
}

// The seam between layer `position` and the one above it. Only the seam the
// stack stopped at carries a message; the library never reaches the ones above.
export interface JoinReport {
  position: number;
  verdict: "holds" | "fails" | "unsettled";
  message: string | null;
}

export interface StackCheck {
  layers: LayerReport[];
  joins: JoinReport[];
  holds: boolean;
  reads: number[] | null;
  answers: number[] | null;
  refusal: string | null;
}

export async function checkStack(layers: LayerSpec[]): Promise<StackCheck> {
  return postJson<StackCheck>("/concepts/shapes/check", { layers });
}

// A tuple printed the way the library prints one, so a reader comparing the
// card to the refusal message sees the same notation in both places. A single
// extent keeps its trailing comma, since (36,) is a one-sided arrangement and
// (36) is just a number.
export function formatExtents(extents: number[] | null): string {
  if (extents === null) return "unsettled";
  if (extents.length === 1) return `(${extents[0]},)`;
  return `(${extents.join(", ")})`;
}
