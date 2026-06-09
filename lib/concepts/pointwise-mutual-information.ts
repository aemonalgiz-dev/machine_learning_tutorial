// The pointwise mutual information page's endpoints.
//
// Two things the reader varies, a table and a fit, and three fixed
// measurements the API computes once. The fixed ones are shared here through
// module-level promises, so a page that opens several sections at once still
// asks for each of them exactly once.

import { getJson, postJson } from "@/lib/api";

export { ApiError } from "@/lib/api";

const BASE = "/concepts/pointwise-mutual-information";

export type CorpusChoice = "three-sentences" | "twenty-four-documents";
export type ReadingName =
  | "counts"
  | "plain-scores"
  | "smoothed-scores"
  | "vectors";

export const CORPUS_LABELS: Record<CorpusChoice, string> = {
  "three-sentences": "three sentences",
  "twenty-four-documents": "twenty-four documents",
};

// score is null where the two words were never seen together, because the
// logarithm of zero is not a number; kept is what survives the clip, and it is
// a number in every case, which is the confusion the page's third part is
// about.
export interface ScoredPair {
  word: string;
  context: string;
  count: number;
  joint_rate: number;
  word_rate: number;
  context_rate: number;
  expected_rate: number;
  ratio: number | null;
  score: number | null;
  kept: number;
  ceiling: number;
}

export interface Neighbour {
  word: string;
  similarity: number;
  topic: string;
}

// --- The table, on request ---------------------------------------------------

export interface AssociationTable {
  corpus: CorpusChoice;
  words: string[];
  topics: string[];
  n_texts: number;
  n_occurrences: number;
  total: number;
  counts: number[][];
  word_totals: number[];
  context_totals: number[];
  word_rates: number[];
  context_rates: number[];
  scores: (number | null)[][];
  kept: number[][];
  n_cells: number;
  n_observed: number;
  n_undefined: number;
  n_above_chance: number;
  n_below_chance: number;
  n_kept: number;
  n_zero: number;
  pairs: ScoredPair[];
  highest: ScoredPair | null;
  nearest_chance: ScoredPair | null;
  lowest: ScoredPair | null;
}

export interface TableOptions {
  corpus?: CorpusChoice;
  window?: number;
  contextSmoothing?: number;
  shift?: number;
}

export async function fetchTable(
  options: TableOptions = {},
): Promise<AssociationTable> {
  const body: Record<string, unknown> = {};
  if (options.corpus !== undefined) body.corpus = options.corpus;
  if (options.window !== undefined) body.window = options.window;
  if (options.contextSmoothing !== undefined)
    body.context_smoothing = options.contextSmoothing;
  if (options.shift !== undefined) body.shift = options.shift;
  return postJson<AssociationTable>(`${BASE}/table`, body);
}

// --- One fit, on request -----------------------------------------------------

export interface MutualInformationFit {
  n_words: number;
  n_cells: number;
  n_observed: number;
  n_kept: number;
  n_zero: number;
  singular_values: number[];
  within_topic: number | null;
  across_topic: number | null;
  gap: number | null;
  neighbours: Neighbour[];
  coordinates: number[];
  numbers_in_the_table: number;
  numbers_in_the_vectors: number;
  reconstruction_error: number;
  n_words_without_a_direction: number;
  seconds: number;
  note: string | null;
}

export interface FitOptions {
  window?: number;
  dimension?: number;
  contextSmoothing?: number;
  shift?: number;
  singularValueExponent?: number;
  word?: string;
  nNeighbours?: number;
}

export async function fitScores(
  options: FitOptions = {},
): Promise<MutualInformationFit> {
  const body: Record<string, unknown> = {};
  if (options.window !== undefined) body.window = options.window;
  if (options.dimension !== undefined) body.dimension = options.dimension;
  if (options.contextSmoothing !== undefined)
    body.context_smoothing = options.contextSmoothing;
  if (options.shift !== undefined) body.shift = options.shift;
  if (options.singularValueExponent !== undefined)
    body.singular_value_exponent = options.singularValueExponent;
  if (options.word !== undefined) body.word = options.word;
  if (options.nNeighbours !== undefined) body.n_neighbours = options.nNeighbours;
  return postJson<MutualInformationFit>(`${BASE}/fit`, body);
}

// --- The three fixed measurements --------------------------------------------

export interface ShiftRow {
  shift: number;
  n_kept: number;
  n_zero: number;
  within_topic: number | null;
  across_topic: number | null;
  gap: number | null;
}

export interface ClippingReport {
  n_cells: number;
  n_observed: number;
  n_undefined: number;
  n_above_chance: number;
  n_below_chance: number;
  n_zero_after_clipping: number;
  lowest_score: number;
  mean_below_chance: number;
  furthest_falls: ScoredPair[];
  shifts: ShiftRow[];
}

let clippingPromise: Promise<ClippingReport> | null = null;

export function fetchClipping(): Promise<ClippingReport> {
  clippingPromise ??= getJson<ClippingReport>(`${BASE}/clipping`);
  return clippingPromise;
}

export interface SmoothingRow {
  exponent: number;
  rare_context: number;
  frequent_context: number;
  below_chance: number;
  n_kept: number;
  n_asymmetric_entries: number;
  n_asymmetric_pairs: number;
  within_topic: number | null;
  across_topic: number | null;
  gap: number | null;
}

export interface SmoothingReport {
  rare_context_pair: string[];
  frequent_context_pair: string[];
  below_chance_pair: string[];
  rare_context_total: number;
  frequent_context_total: number;
  rows: SmoothingRow[];
  largest_asymmetry: ScoredPair[];
}

let smoothingPromise: Promise<SmoothingReport> | null = null;

export function fetchSmoothing(): Promise<SmoothingReport> {
  smoothingPromise ??= getJson<SmoothingReport>(`${BASE}/smoothing`);
  return smoothingPromise;
}

export interface Reading {
  name: ReadingName;
  label: string;
  numbers_per_word: number;
  within_topic: number | null;
  across_topic: number | null;
  gap: number | null;
  nearest: Neighbour[];
}

export interface SweepRow {
  value: number;
  numbers_per_word: number;
  n_kept: number;
  within_topic: number | null;
  across_topic: number | null;
  gap: number | null;
}

// Two words the squeeze placed on exactly one ray, with how alike their whole
// rows of scores were before it.
export interface CollapsedPair {
  first: string;
  second: string;
  full_row_similarity: number;
  vector_similarity: number;
}

export interface ReadingsReport {
  word: string;
  readings: Reading[];
  collapsed: CollapsedPair[];
  windows: SweepRow[];
  dimensions: SweepRow[];
  exponents: SweepRow[];
  numbers_in_the_table: number;
  numbers_in_the_vectors: number;
  counting_milliseconds: number;
  scoring_milliseconds: number;
  decomposing_milliseconds: number;
}

const readingsPromises = new Map<string, Promise<ReadingsReport>>();

export function fetchReadings(word = "flour"): Promise<ReadingsReport> {
  const existing = readingsPromises.get(word);
  if (existing) return existing;
  const pending = getJson<ReadingsReport>(
    `${BASE}/readings?word=${encodeURIComponent(word)}`,
  );
  readingsPromises.set(word, pending);
  return pending;
}
