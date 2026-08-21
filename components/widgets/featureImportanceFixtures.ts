// What the feature-importance widgets share: the site's crowd, the column
// colours, and the names the drawn crowd's columns go by on screen.

import { LabelledPoint } from "@/lib/api";
import { TANGLED_CROWD } from "./BootstrapMachine";

// The crowd the ledger steps through, which is the crowd the bagging and
// random-forests pages fit, so the three pages quote one committee.
export const CROWD: LabelledPoint[] = TANGLED_CROWD;

// One colour per kind of column. The two coin flips and the two body
// measurements are indigo, the columns a reader should distrust are amber,
// and the second reading of height is teal so it can be told from the first.
export const REAL = "fill-indigo-600";
export const SUSPECT = "fill-amber-500";
export const TWIN = "fill-teal-600";

export function fillFor(name: string): string {
  if (name === "distractor" || name === "ticket") return SUSPECT;
  if (name === "height_again") return TWIN;
  return REAL;
}

// How each column is labelled on screen.
export const COLUMN_LABELS: Record<string, string> = {
  first: "first coin",
  second: "second coin",
  distractor: "noise",
  height: "height",
  weight: "weight",
  ticket: "ticket",
  height_again: "height again",
};

export function labelFor(name: string): string {
  return COLUMN_LABELS[name] ?? name;
}

// How each arrangement of the drawn crowd is labelled on its button.
export const ARRANGEMENT_LABELS: Record<string, string> = {
  measurements: "height and weight",
  with_ticket: "with a ticket",
  with_twin: "with height read twice",
  all_four: "all four",
  weight_only: "weight alone",
  ticket_only: "the ticket alone",
};
