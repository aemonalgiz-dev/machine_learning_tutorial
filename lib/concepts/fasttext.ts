// The FastText page's endpoints.
//
// Two that answer a request, one cutting a word into pieces (which needs no
// fit and is instant) and one running a whole fit; and four fixed measurements
// the API computes once and caches, each shared here through a module-level
// promise so a page that opens several sections at once still asks for each of
// them exactly once.

import { getJson, postJson } from "@/lib/api";

export { ApiError } from "@/lib/api";

// A word near another, with which of the two lists it came from, so a widget
// can colour a neighbour that crossed over.
export interface Neighbour {
  word: string;
  similarity: number;
  topic: string;
}

export interface EpochReport {
  epoch: number;
  mean_loss: number;
  n_pairs: number;
  learning_rate: number;
}

// --- The pieces of one word, which need no fit -------------------------------

export interface PieceReport {
  piece: string;
  length: number;
  bucket: number;
  owners: string[];
}

export interface WordPieces {
  word: string;
  wrapped: string;
  seen: boolean;
  pieces: PieceReport[];
  n_pieces: number;
  n_pieces_owned: number;
  shared_buckets: number;
  n_buckets: number;
}

export interface PiecesOptions {
  word: string;
  minimumLength?: number;
  maximumLength?: number;
  nBuckets?: number;
}

export async function fetchPieces(options: PiecesOptions): Promise<WordPieces> {
  const body: Record<string, unknown> = { word: options.word };
  if (options.minimumLength !== undefined) body.minimum_length = options.minimumLength;
  if (options.maximumLength !== undefined) body.maximum_length = options.maximumLength;
  if (options.nBuckets !== undefined) body.n_buckets = options.nBuckets;
  return postJson<WordPieces>("/concepts/fasttext/pieces", body);
}

// --- One fit, on request -----------------------------------------------------

// word_refusal carries the sentence a reader gets when the chosen word reaches
// no row anything wrote to, in which case neighbours is empty rather than
// misleading.
export interface FasttextFit {
  n_sentences: number;
  n_occurrences: number;
  n_words: number;
  epochs: EpochReport[];
  total_pairs: number;
  within_topic: number;
  across_topic: number;
  word: string;
  word_seen: boolean;
  word_pieces: string[];
  n_word_pieces: number;
  shared_buckets: number;
  mean_to_verbs: number;
  mean_to_money: number;
  neighbours: Neighbour[];
  word_refusal: string | null;
  n_distinct_pieces: number;
  n_distinct_rows: number;
  n_shared_pieces: number;
  word_row_numbers: number;
  bucket_row_numbers: number;
  rows_that_moved: number;
  seconds: number;
}

export interface FitOptions {
  minimumLength?: number;
  maximumLength?: number;
  nBuckets?: number;
  epochs?: number;
  learningRate?: number;
  window?: number;
  word?: string;
  nNeighbours?: number;
}

export async function fitFasttext(options: FitOptions = {}): Promise<FasttextFit> {
  const body: Record<string, unknown> = {};
  if (options.minimumLength !== undefined) body.minimum_length = options.minimumLength;
  if (options.maximumLength !== undefined) body.maximum_length = options.maximumLength;
  if (options.nBuckets !== undefined) body.n_buckets = options.nBuckets;
  if (options.epochs !== undefined) body.epochs = options.epochs;
  if (options.learningRate !== undefined) body.learning_rate = options.learningRate;
  if (options.window !== undefined) body.window = options.window;
  if (options.word !== undefined) body.word = options.word;
  if (options.nNeighbours !== undefined) body.n_neighbours = options.nNeighbours;
  return postJson<FasttextFit>("/concepts/fasttext/fit", body);
}

// --- A word the corpus never held --------------------------------------------

export interface SharedRow {
  bucket: number;
  piece: string;
  corpus_pieces: string[];
  owners: string[];
}

export interface UnseenProbe {
  word: string;
  n_pieces: number;
  shared_buckets: number;
  length: number;
  mean_to_verbs: number;
  mean_to_money: number;
  nearest: Neighbour[];
  shared_rows: SharedRow[];
  refusal: string | null;
}

export interface SharerReport {
  word: string;
  pieces: string[];
}

export interface SpellingShare {
  word: string;
  n_pieces: number;
  cosine: number;
  length_share: number;
}

export interface UnseenReport {
  word: string;
  n_pieces: number;
  n_pieces_owned: number;
  shared_buckets: number;
  sharers: SharerReport[];
  mean_to_verbs: number;
  smallest_to_verbs: number;
  mean_to_money: number;
  largest_to_money: number;
  nearest: Neighbour[];
  plain_refusal: string;
  probes: UnseenProbe[];
  spelling_shares: SpellingShare[];
}

let unseenPromise: Promise<UnseenReport> | null = null;

export function fetchUnseen(): Promise<UnseenReport> {
  if (!unseenPromise) unseenPromise = getJson<UnseenReport>("/concepts/fasttext/unseen");
  return unseenPromise;
}

// --- Taking a word out of the corpus and asking for it anyway ----------------

// The counts describe the corpus as it stands, which is what says whether it
// has any rare words of its own; everything else describes the fit made after
// every sentence holding one word was dropped.
export interface HeldOutReport {
  word: string;
  fewest_occurrences: number;
  most_occurrences: number;
  words_seen_once: number;
  n_sentences_dropped: number;
  n_occurrences_dropped: number;
  n_words_left: number;
  n_pieces: number;
  shared_buckets: number;
  mean_to_verbs: number;
  mean_to_money: number;
  nearest: Neighbour[];
  plain_refusal: string;
}

let heldOutPromise: Promise<HeldOutReport> | null = null;

export function fetchHeldOut(): Promise<HeldOutReport> {
  if (!heldOutPromise)
    heldOutPromise = getJson<HeldOutReport>("/concepts/fasttext/held-out");
  return heldOutPromise;
}

// --- The fit with no piece short enough to exist -----------------------------

export interface ReductionRow {
  architecture: string;
  objective: string;
  table_gap: number;
  output_gap: number;
  loss_gap: number;
  largest_bucket_value: number;
}

export interface ReductionReport {
  minimum_length: number;
  longest_wrapped_word: number;
  epochs: number;
  rows: ReductionRow[];
  losses_with_pieces: number[];
  losses_without: number[];
}

let reductionPromise: Promise<ReductionReport> | null = null;

export function fetchReduction(): Promise<ReductionReport> {
  if (!reductionPromise)
    reductionPromise = getJson<ReductionReport>("/concepts/fasttext/reduction");
  return reductionPromise;
}

// --- How many rows the pieces have to share ----------------------------------

export interface SharingRow {
  n_buckets: number;
  n_rows_used: number;
  n_shared: number;
}

export interface CollidingRow {
  bucket: number;
  pieces: string[];
  owners: string[][];
}

export interface BucketFitRow {
  n_buckets: number;
  n_rows_used: number;
  n_shared: number;
  within_topic: number;
  across_topic: number;
  gap: number;
  missing_to_verbs: number;
  missing_to_money: number;
}

export interface LengthRow {
  minimum_length: number;
  maximum_length: number;
  n_distinct_pieces: number;
  pieces_per_word: number;
  within_topic: number;
  across_topic: number;
  gap: number;
  missing_to_verbs: number;
  missing_to_money: number;
}

export interface BucketsReport {
  n_words: number;
  n_distinct_pieces: number;
  pieces_per_word: number;
  fewest_pieces: number;
  most_pieces: number;
  sharing: SharingRow[];
  colliding: CollidingRow[];
  fits: BucketFitRow[];
  lengths: LengthRow[];
  published_buckets: number;
}

let bucketsPromise: Promise<BucketsReport> | null = null;

export function fetchBuckets(): Promise<BucketsReport> {
  if (!bucketsPromise) bucketsPromise = getJson<BucketsReport>("/concepts/fasttext/buckets");
  return bucketsPromise;
}

// --- The two fits side by side ------------------------------------------------

export interface WordComparison {
  word: string;
  topic: string;
  with_pieces: Neighbour[];
  without_pieces: Neighbour[];
  shared: string[];
}

export interface SeparationRow {
  method: string;
  learning_rate: number;
  within_topic: number;
  across_topic: number;
  gap: number;
}

// parts_per_word is the word's own row plus one for each of its pieces, which
// is how many rows one correction is added to.
export interface ComparisonReport {
  words: WordComparison[];
  separation: SeparationRow[];
  numbers_with_pieces: number;
  numbers_without_pieces: number;
  rows_that_moved: number;
  composed_table_numbers: number;
  parts_per_word: number;
  fewest_parts: number;
  most_parts: number;
  losses_with_pieces: number[];
  losses_without: number[];
}

let comparisonPromise: Promise<ComparisonReport> | null = null;

export function fetchComparison(): Promise<ComparisonReport> {
  if (!comparisonPromise)
    comparisonPromise = getJson<ComparisonReport>("/concepts/fasttext/comparison");
  return comparisonPromise;
}
