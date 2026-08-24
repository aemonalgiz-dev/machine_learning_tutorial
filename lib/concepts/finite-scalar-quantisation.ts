// Client functions for the page about rounding each coordinate on its own.
//
// Every number here is computed by the API. The quantise endpoint takes one
// vector and one set of level counts and returns the whole per-coordinate
// ladder, the digits and the composed number, so the playground and the worked
// instances share one response shape; the words endpoint carries the word
// vectors the page walks through; the levels endpoint is the sweep the page's
// central claim rests on; the cost endpoint is the rounding error against a
// table of the same size fitted to the same vectors; and the limits endpoint
// carries the closing figures.

import { getJson, postJson } from "@/lib/api";

export interface CoordinateStep {
  index: number;
  n_levels: number;
  half_width: number;
  offset: number;
  value: number;
  squashed: number;
  scaled: number;
  position: number;
  digit: number;
  rung: number;
  squared_gap: number;
  place_value: number;
}

export interface QuantisedVector {
  values: number[];
  levels: number[];
  n_codes: number;
  steps: CoordinateStep[];
  digits: number[];
  code_id: number;
  reconstruction: number[];
  distortion: number;
  id_expression: string;
  product_expression: string;
  bits: number;
}

export async function quantiseVector(
  values: number[],
  levels: number[],
): Promise<QuantisedVector> {
  return postJson<QuantisedVector>(
    "/concepts/finite-scalar-quantisation/quantise",
    { values, levels },
  );
}

export interface QuantisedWord {
  word: string;
  values: number[];
  squashed: number[];
  digits: number[];
  code_id: number;
  reconstruction: number[];
  squared_gap: number;
}

export interface SentencePiece {
  piece: string;
  in_the_collection: boolean;
}

export interface WordCollection {
  levels: number[];
  n_codes: number;
  n_words: number;
  words: QuantisedWord[];
  named: QuantisedWord[];
  n_distinct_vectors: number;
  n_distinct_codes: number;
  n_empty_codes: number;
  largest_group: number;
  sharing_a_code: string[][];
  sentence: string;
  pieces: SentencePiece[];
  n_pieces_in_the_collection: number;
  corpus: string[];
}

export interface LevelRow {
  n_levels: number;
  half_width: number;
  offset: number;
  asked_for: number;
  naive_rungs: number;
  naive_lowest: number;
  naive_highest: number;
  naive_with_saturation: number;
  corrected_rungs: number;
  corrected_lowest: number;
  corrected_highest: number;
  rungs: number[];
  naive_rung_positions: number[];
}

export interface ConfigurationRow {
  levels: number[];
  asked_for: number;
  naive_reach: number;
  naive_distortion: number;
  corrected_distortion: number;
  naive_distinct: number;
  corrected_distinct: number;
}

export interface LevelSweep {
  rows: LevelRow[];
  configurations: ConfigurationRow[];
  saturating_input: number;
  n_rows_measured: number;
}

export interface CostRow {
  levels: number[];
  n_codes: number;
  bits: number;
  grid_distortion: number;
  table_distortion: number;
  ratio: number;
  grid_codes_used: number;
  table_codes_used: number;
  grid_busiest: number;
  table_busiest: number;
}

export interface UsageRow {
  n_vectors: number;
  n_codes: number;
}

export interface CostReport {
  n_rows: number;
  rows: CostRow[];
  published_levels: number[];
  published_codes: number;
  published_distortion: number;
  published_distinct: number;
  published_empty: number;
  published_busiest: number;
  published_usage: UsageRow[];
}

export interface ScaleRow {
  factor: number;
  distortion: number;
  codes_used: number;
  share_past_the_edge: number;
}

export interface LeanRow {
  levels: number[];
  n_codes: number;
  leaning_grid: number;
  leaning_table: number;
  leaning_grid_used: number;
  leaning_table_used: number;
  straight_grid: number;
  straight_table: number;
  straight_grid_used: number;
}

export interface SpendingRow {
  levels: number[];
  n_codes: number;
  distortion: number;
  codes_used: number;
}

export interface LimitsReport {
  n_rows: number;
  correlation: number;
  scale_rows: ScaleRow[];
  lean_rows: LeanRow[];
  spending_rows: SpendingRow[];
  saturating_input: number;
  zero_under_even: QuantisedVector;
  zero_under_odd: QuantisedVector;
}

// Several widgets want the same fixed answers, and a reader switching between
// them should not pay for the same request twice.
let collection: Promise<WordCollection> | null = null;
let sweep: Promise<LevelSweep> | null = null;
let costs: Promise<CostReport> | null = null;
let limits: Promise<LimitsReport> | null = null;

export async function fetchWordCollection(): Promise<WordCollection> {
  collection ??= getJson<WordCollection>(
    "/concepts/finite-scalar-quantisation/words",
  );
  return collection;
}

export async function fetchLevelSweep(): Promise<LevelSweep> {
  sweep ??= getJson<LevelSweep>("/concepts/finite-scalar-quantisation/levels");
  return sweep;
}

export async function fetchCostReport(): Promise<CostReport> {
  costs ??= getJson<CostReport>("/concepts/finite-scalar-quantisation/cost");
  return costs;
}

export async function fetchLimitsReport(): Promise<LimitsReport> {
  limits ??= getJson<LimitsReport>("/concepts/finite-scalar-quantisation/limits");
  return limits;
}
