// The random indexing page's endpoints.
//
// One thing the reader varies, a fit, and three fixed measurements the API
// computes once. The fixed ones are shared here through a module-level promise,
// so a page that opens several sections at once still asks for each of them
// exactly once. The worked instance is keyed by the request that produced it,
// since two widgets ask for two different words.

import { getJson, postJson } from "@/lib/api";

export { ApiError } from "@/lib/api";

export type CorpusName = "two-topic" | "three-sentences";
export type WeightingName = "uniform" | "harmonic";

// The widths a reader may choose between. Discrete rather than continuous,
// because the interesting comparison is a doubling and not a single step.
export const WIDTHS = [
  4, 8, 16, 32, 64, 128, 256, 529, 1024, 2048,
] as const;

// --- One fit -----------------------------------------------------------------

export interface DrawnDirection {
  word: string;
  group: string;
  entries: number[];
  positions: number[];
}

export interface WordPosition {
  word: string;
  group: string;
  coordinates: number[];
  length: number;
  occurrences: number;
}

// table_similarity is the same pair read off the whole table of counts, and
// table_rank is where that reading put the word, so a reordering is visible
// without a second request.
export interface Neighbour {
  word: string;
  group: string;
  similarity: number;
  table_similarity: number;
  table_rank: number;
}

export interface RandomIndexingFit {
  corpus: CorpusName;
  dimension: number;
  n_nonzero: number;
  window: number;
  weighting: WeightingName;
  random_seed: number;
  words: string[];
  n_words: number;
  directions: DrawnDirection[];
  positions: WordPosition[];
  word: string;
  nearest: Neighbour[];
  table_nearest: Neighbour[];
  against_every_word: Neighbour[];
  within_similarity: number;
  across_similarity: number;
  table_within_similarity: number;
  table_across_similarity: number;
  shared_to_topic: number;
  table_shared_to_topic: number;
  identity_gap: number;
  largest_coordinate: number;
  table_gap_mean: number;
  table_gap_largest: number;
  direction_mean_absolute_cosine: number;
  direction_predicted_cosine: number;
  direction_exactly_perpendicular: number;
  colliding_pairs: number;
  n_direction_pairs: number;
  table_cells: number;
  position_cells: number;
  occurrences: number;
  neighbour_visits: number;
  slot_updates: number;
  product_multiplications: number;
  seconds: number;
}

export interface FitOptions {
  corpus?: CorpusName;
  dimension?: number;
  nNonzero?: number;
  window?: number;
  weighting?: WeightingName;
  randomSeed?: number;
  word?: string;
  nResults?: number;
}

function fitBody(options: FitOptions): Record<string, unknown> {
  const body: Record<string, unknown> = {};
  if (options.corpus !== undefined) body.corpus = options.corpus;
  if (options.dimension !== undefined) body.dimension = options.dimension;
  if (options.nNonzero !== undefined) body.n_nonzero = options.nNonzero;
  if (options.window !== undefined) body.window = options.window;
  if (options.weighting !== undefined) body.weighting = options.weighting;
  if (options.randomSeed !== undefined) body.random_seed = options.randomSeed;
  if (options.word !== undefined) body.word = options.word;
  if (options.nResults !== undefined) body.n_results = options.nResults;
  return body;
}

const fitPromises = new Map<string, Promise<RandomIndexingFit>>();

export function fetchFit(
  options: FitOptions = {},
): Promise<RandomIndexingFit> {
  const body = fitBody(options);
  const key = JSON.stringify(body);
  const existing = fitPromises.get(key);
  if (existing) return existing;
  const promise = postJson<RandomIndexingFit>(
    "/concepts/random-indexing/fit",
    body,
  );
  fitPromises.set(key, promise);
  return promise;
}

// --- One word's position, built up ------------------------------------------

export interface AccumulationStep {
  step: number;
  sentence: number;
  sentence_text: string;
  position: number;
  neighbour: string;
  neighbour_group: string;
  distance: number;
  weight: number;
  added: number[];
  running: number[];
}

export interface Accumulation {
  corpus: CorpusName;
  word: string;
  group: string;
  dimension: number;
  n_nonzero: number;
  window: number;
  weighting: WeightingName;
  random_seed: number;
  sentences: string[];
  words: string[];
  directions: DrawnDirection[];
  counts: number[][];
  steps: AccumulationStep[];
  final: number[];
  n_occurrences: number;
  row_total: number;
  matches_the_fit: boolean;
}

export interface AccumulationOptions {
  corpus?: CorpusName;
  word?: string;
  dimension?: number;
  nNonzero?: number;
  window?: number;
  weighting?: WeightingName;
  randomSeed?: number;
}

const workedPromises = new Map<string, Promise<Accumulation>>();

export function fetchAccumulation(
  options: AccumulationOptions = {},
): Promise<Accumulation> {
  const body: Record<string, unknown> = {};
  if (options.corpus !== undefined) body.corpus = options.corpus;
  if (options.word !== undefined) body.word = options.word;
  if (options.dimension !== undefined) body.dimension = options.dimension;
  if (options.nNonzero !== undefined) body.n_nonzero = options.nNonzero;
  if (options.window !== undefined) body.window = options.window;
  if (options.weighting !== undefined) body.weighting = options.weighting;
  if (options.randomSeed !== undefined) body.random_seed = options.randomSeed;
  const key = JSON.stringify(body);
  const existing = workedPromises.get(key);
  if (existing) return existing;
  const promise = postJson<Accumulation>(
    "/concepts/random-indexing/worked",
    body,
  );
  workedPromises.set(key, promise);
  return promise;
}

// --- How nearly perpendicular the drawn directions are -----------------------

export interface WidthReading {
  dimension: number;
  n_nonzero: number;
  predicted: number;
  measured: number;
  ratio: number;
  exactly_perpendicular: number;
  largest_absolute: number;
}

export interface Perpendicularity {
  n_vectors: number;
  n_pairs: number;
  widths: WidthReading[];
  fullness: WidthReading[];
  fullness_dimension: number;
}

let perpendicularityPromise: Promise<Perpendicularity> | null = null;

export function fetchPerpendicularity(): Promise<Perpendicularity> {
  if (!perpendicularityPromise)
    perpendicularityPromise = getJson<Perpendicularity>(
      "/concepts/random-indexing/perpendicularity",
    );
  return perpendicularityPromise;
}

// --- What the shortcut costs -------------------------------------------------

export interface CostRow {
  dimension: number;
  gap_mean: number;
  gap_largest: number;
  within_similarity: number;
  across_similarity: number;
  separation: number;
  colliding_pairs: number;
  shared_neighbours: number;
  position_cells: number;
}

export interface DrawRow {
  dimension: number;
  n_draws: number;
  smallest_pair: number;
  largest_pair: number;
  pair_spread: number;
  smallest_separation: number;
  largest_separation: number;
  mean_gap: number;
}

export interface RepeatRow {
  repeats: number;
  occurrences: number;
  gap_mean: number;
  pair_similarity: number;
}

// mean_gap is averaged over several draws and one_draw_gap is the single draw
// the rest of the page uses, which orders the settings differently.
export interface SparsityRow {
  dimension: number;
  n_nonzero: number;
  n_draws: number;
  mean_gap: number;
  one_draw_gap: number;
}

export interface NeverMet {
  first: string;
  second: string;
  count: number;
  table_similarity: number;
  projected_similarity: number;
}

export interface Costs {
  n_never_met: number;
  n_topic_pairs: number;
  never_met: NeverMet;
  sparsity: SparsityRow[];
  sparsity_draws: number;
  reference_word: string;
  table_neighbours: string[];
  table_within_similarity: number;
  table_across_similarity: number;
  table_separation: number;
  table_cells: number;
  n_words: number;
  n_top: number;
  widths: CostRow[];
  draws: DrawRow[];
  repeats: RepeatRow[];
  exact_dimension: number;
  exact_seed: number;
  exact_gap: number;
  exact_colliding: number;
  inexact_seed: number;
  inexact_gap: number;
  inexact_colliding: number;
}

let costsPromise: Promise<Costs> | null = null;

export function fetchCosts(): Promise<Costs> {
  if (!costsPromise)
    costsPromise = getJson<Costs>("/concepts/random-indexing/costs");
  return costsPromise;
}

// --- Against a reading that weights the counts -------------------------------

export interface ReadingRow {
  word: string;
  group: string;
  by_the_table: string;
  by_the_projection: string;
  by_the_weighted_table: string;
}

export interface AgainstTheTable {
  words: string[];
  row_totals: number[];
  shared_words: string[];
  shared_row_total: number;
  largest_topic_row_total: number;
  shared_share_of_the_table: number;
  table_shared_to_topic: number;
  projected_shared_to_topic: number;
  weighted_shared_to_topic: number;
  table_within: number;
  table_across: number;
  projected_within: number;
  projected_across: number;
  weighted_within: number;
  weighted_across: number;
  shared_pairs: string[];
  shared_pair_projected: number[];
  shared_pair_table: number[];
  rows: ReadingRow[];
}

let againstPromise: Promise<AgainstTheTable> | null = null;

export function fetchAgainstTheTable(): Promise<AgainstTheTable> {
  if (!againstPromise)
    againstPromise = getJson<AgainstTheTable>(
      "/concepts/random-indexing/against-the-table",
    );
  return againstPromise;
}
