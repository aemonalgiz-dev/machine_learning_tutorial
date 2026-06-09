// The latent semantic analysis page's endpoints.
//
// Two things the reader varies, a table and a fit, and three fixed
// measurements the API computes once. The fixed ones are shared here through a
// module-level promise, so a page that opens several sections at once still
// asks for each of them exactly once.

import { getJson, postJson } from "@/lib/api";

export { ApiError } from "@/lib/api";

export type CorpusName = "four" | "twenty-four";
export type WeightingName = "counts" | "weighted";

export const CORPUS_LABELS: Record<CorpusName, string> = {
  four: "four documents",
  "twenty-four": "twenty-four documents",
};

export const WEIGHTING_LABELS: Record<WeightingName, string> = {
  counts: "plain counts",
  weighted: "weighted counts",
};

// --- The table ---------------------------------------------------------------

// counts and weighted are the same row read two ways, so one request lets a
// widget show the change without asking twice.
export interface TermRow {
  word: string;
  group: string;
  document_frequency: number;
  weight: number;
  counts: number[];
  weighted: number[];
  total_count: number;
}

export interface TermTable {
  corpus: CorpusName;
  documents: string[];
  document_groups: string[];
  words: string[];
  rows: TermRow[];
  n_terms: number;
  n_documents: number;
  n_cells: number;
  n_nonzero: number;
  zero_share: number;
  everywhere_words: string[];
  commonest_word: string;
  count_share_of_a_column: number;
  weighted_share_of_a_column: number;
  smallest_weight: number;
  largest_weight: number;
  unsmoothed_weight_of_the_commonest: number;
}

const tablePromises: Partial<Record<CorpusName, Promise<TermTable>>> = {};

export function fetchTermTable(corpus: CorpusName): Promise<TermTable> {
  const existing = tablePromises[corpus];
  if (existing) return existing;
  const promise = postJson<TermTable>(
    "/concepts/latent-semantic-analysis/table",
    { corpus },
  );
  tablePromises[corpus] = promise;
  return promise;
}

// --- One fit -----------------------------------------------------------------

export interface WordPoint {
  word: string;
  group: string;
  coordinates: number[];
}

export interface DocumentPoint {
  position: number;
  text: string;
  group: string;
  coordinates: number[];
}

export interface NeighbourWord {
  word: string;
  group: string;
  similarity: number;
}

export interface NeighbourDocument {
  position: number;
  text: string;
  group: string;
  similarity: number;
}

// group_difference is the first half's mean coordinate minus the second's,
// which is zero to rounding on the leading direction and large on the next.
export interface ComponentReport {
  position: number;
  singular_value: number;
  share: number;
  cumulative: number;
  first_group_mean: number;
  second_group_mean: number;
  group_difference: number;
  all_one_sign: boolean;
}

export interface LatentFit {
  corpus: CorpusName;
  weighting: WeightingName;
  dimension: number;
  n_terms: number;
  n_documents: number;
  rank: number;
  components: ComponentReport[];
  kept_share: number;
  word_points: WordPoint[];
  document_points: DocumentPoint[];
  nearest_words: NeighbourWord[];
  nearest_documents: NeighbourDocument[];
  within_similarity: number | null;
  across_similarity: number | null;
  numbers_in_the_table: number;
  numbers_kept: number;
  reconstruction_error: number;
  discarded_energy: number;
  seconds: number;
  placed: number[] | null;
  placed_group: string | null;
}

export interface FitOptions {
  corpus?: CorpusName;
  weighting?: WeightingName;
  dimension?: number;
  word?: string;
  document?: number;
  nResults?: number;
  newText?: string;
}

export async function fitLatentSpace(
  options: FitOptions = {},
): Promise<LatentFit> {
  const body: Record<string, unknown> = {};
  if (options.corpus !== undefined) body.corpus = options.corpus;
  if (options.weighting !== undefined) body.weighting = options.weighting;
  if (options.dimension !== undefined) body.dimension = options.dimension;
  if (options.word !== undefined) body.word = options.word;
  if (options.document !== undefined) body.document = options.document;
  if (options.nResults !== undefined) body.n_results = options.nResults;
  if (options.newText !== undefined) body.new_text = options.newText;
  return postJson<LatentFit>("/concepts/latent-semantic-analysis/fit", body);
}

// --- The table rebuilt from what was kept ------------------------------------

// empty_cell_mean is the mean of the rebuilt table over exactly the cells the
// corpus left at zero, which is where a word never seen in a document goes.
export interface Reconstruction {
  corpus: CorpusName;
  dimension: number;
  words: string[];
  documents: string[];
  document_groups: string[];
  original: number[][];
  rebuilt: number[][];
  squared_error: number;
  discarded_energy: number;
  kept_share: number;
  n_negative: number;
  most_negative: number;
  empty_cell_mean: number;
  empty_cell_largest: number;
  row_word: string;
  row_original: number[];
  row_rebuilt: number[];
  row_seen_in: number;
  row_filled_in: number;
}

export async function fetchReconstruction(
  dimension: number,
  word = "flour",
): Promise<Reconstruction> {
  return postJson<Reconstruction>(
    "/concepts/latent-semantic-analysis/reconstruction",
    { dimension, word },
  );
}

// --- Where the raw table fails -----------------------------------------------

export interface PairReading {
  first: string;
  second: string;
  raw: number;
  narrow: number;
  wide: number;
}

// within_smallest is the smallest angle between two words of one half, which
// is what a hard squeeze destroys and the table itself keeps.
export interface WidthRow {
  label: string;
  dimension: number | null;
  kept_share: number | null;
  within_mean: number;
  within_smallest: number;
  within_largest: number;
  across_mean: number;
  gap: number;
}

export interface Sharpness {
  document_pairs: PairReading[];
  crossing_pair: PairReading;
  word_pairs: PairReading[];
  n_document_pairs: number;
  n_document_pairs_at_zero: number;
  n_across_document_pairs: number;
  n_across_document_pairs_at_zero: number;
  n_word_pairs: number;
  n_word_pairs_at_zero: number;
  widths: WidthRow[];
  narrow_dimension: number;
  wide_dimension: number;
}

let sharpnessPromise: Promise<Sharpness> | null = null;

export function fetchSharpness(): Promise<Sharpness> {
  if (!sharpnessPromise)
    sharpnessPromise = getJson<Sharpness>(
      "/concepts/latent-semantic-analysis/sharpness",
    );
  return sharpnessPromise;
}

// --- The leading direction, with the shift and without -----------------------

export interface Directions {
  documents: string[];
  document_groups: string[];
  as_counted_first: number[];
  as_counted_second: number[];
  after_shifting_first: number[];
  as_counted_first_means: number[];
  as_counted_first_difference: number;
  as_counted_second_means: number[];
  as_counted_second_difference: number;
  after_shifting_means: number[];
  after_shifting_difference: number;
  as_counted_shares: number[];
  after_shifting_shares: number[];
  shared_words: string[];
  shared_word_second_coordinates: number[];
  smallest_first_coordinate: number;
  largest_first_coordinate: number;
}

let directionsPromise: Promise<Directions> | null = null;

export function fetchDirections(): Promise<Directions> {
  if (!directionsPromise)
    directionsPromise = getJson<Directions>(
      "/concepts/latent-semantic-analysis/directions",
    );
  return directionsPromise;
}

// --- One spelling, two senses ------------------------------------------------

export interface Senses {
  word: string;
  coordinates: number[];
  second_coordinate: number;
  nearest: NeighbourWord[];
  similarity_to_cooking_word: number;
  similarity_to_sailing_word: number;
  similarity_to_a_shared_word: number;
  cooking_example: string;
  sailing_example: string;
  shared_example: string;
  cooking_word_second_coordinate: number;
  sailing_word_second_coordinate: number;
  documents: string[];
}

let sensesPromise: Promise<Senses> | null = null;

export function fetchSenses(): Promise<Senses> {
  if (!sensesPromise)
    sensesPromise = getJson<Senses>("/concepts/latent-semantic-analysis/senses");
  return sensesPromise;
}
