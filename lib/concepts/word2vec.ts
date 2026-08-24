// The word2vec page's endpoints.
//
// One fit on request, for the playground and for the sections that vary a
// dial; and seven fixed measurements the API computes once and caches, each
// shared here through a module-level promise so a page that opens several
// sections at once still asks for each of them exactly once.

import { getJson, postJson } from "@/lib/api";

export { ApiError } from "@/lib/api";

export type ArchitectureName = "skip-gram" | "bag-of-words";
export type ObjectiveName = "negative-sampling" | "tree";

export const ARCHITECTURE_LABELS: Record<ArchitectureName, string> = {
  "skip-gram": "skip-gram",
  "bag-of-words": "bag of words",
};

export const OBJECTIVE_LABELS: Record<ObjectiveName, string> = {
  "negative-sampling": "negative sampling",
  tree: "a tree",
};

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

// --- One fit, on request -----------------------------------------------------

// kept_numbers is the table the fit answers with and discarded_numbers the
// table it needed on the way; predicted is what that discarded table says
// about which words belong beside the chosen one, and is empty under the tree,
// whose rows are branches rather than words.
export interface Word2vecFit {
  n_sentences: number;
  n_occurrences: number;
  n_words: number;
  epochs: EpochReport[];
  total_pairs: number;
  within_topic: number;
  across_topic: number;
  neighbours: Neighbour[];
  coordinates: number[];
  kept_numbers: number;
  discarded_numbers: number;
  output_rows: number;
  predicted: Neighbour[];
  predicted_mean_same_list: number;
  predicted_mean_other_list: number;
  seconds: number;
}

export interface FitOptions {
  architecture?: ArchitectureName;
  objective?: ObjectiveName;
  learningRate?: number;
  epochs?: number;
  window?: number;
  dimension?: number;
  randomSeed?: number;
  word?: string;
  nNeighbours?: number;
}

export async function fitWord2vec(options: FitOptions = {}): Promise<Word2vecFit> {
  const body: Record<string, unknown> = {};
  if (options.architecture !== undefined) body.architecture = options.architecture;
  if (options.objective !== undefined) body.objective = options.objective;
  if (options.learningRate !== undefined) body.learning_rate = options.learningRate;
  if (options.epochs !== undefined) body.epochs = options.epochs;
  if (options.window !== undefined) body.window = options.window;
  if (options.dimension !== undefined) body.dimension = options.dimension;
  if (options.randomSeed !== undefined) body.random_seed = options.randomSeed;
  if (options.word !== undefined) body.word = options.word;
  if (options.nNeighbours !== undefined) body.n_neighbours = options.nNeighbours;
  return postJson<Word2vecFit>("/concepts/word2vec/fit", body);
}

// --- The table counting gives you --------------------------------------------

export interface CountingTable {
  words: string[];
  topics: string[];
  counts: number[];
  table: number[][];
  n_cells: number;
  n_zero_cells: number;
  zero_share: number;
  row_width: number;
  vector_width: number;
  vector_numbers: number;
  within_topic: number;
  across_topic: number;
  largest_for_walked: Neighbour[];
}

let countingPromise: Promise<CountingTable> | null = null;

export function fetchCountingTable(): Promise<CountingTable> {
  if (!countingPromise) countingPromise = getJson<CountingTable>("/concepts/word2vec/counting");
  return countingPromise;
}

// --- The pairs a window makes ------------------------------------------------

// reads are the words whose vectors form the prediction and predicts the words
// that have to come out of them, which is the one place the two directions
// differ.
export interface WindowPair {
  sentence: number;
  position: number;
  centre: string;
  context: string[];
  reads: string[];
  predicts: string[];
}

export interface WindowPairs {
  sentences: string[][];
  words: string[];
  counts: number[];
  pairs: WindowPair[];
  n_pairs: number;
  n_pairs_skip_gram: number;
  n_pairs_bag_of_words: number;
}

export async function fetchWindowPairs(
  reach: number,
  architecture: ArchitectureName,
): Promise<WindowPairs> {
  return postJson<WindowPairs>("/concepts/word2vec/windows", { reach, architecture });
}

// --- One pair, scored and differentiated -------------------------------------

export interface PlanePoint {
  x: number;
  y: number;
}

export interface ScoredRow {
  label: number;
  score: number;
  probability: number;
  loss: number;
  error: number;
  push_x: number;
  push_y: number;
}

export interface PairStep {
  hidden: PlanePoint;
  rows: ScoredRow[];
  loss: number;
  hidden_push: PlanePoint;
}

export async function scoreOnePair(
  hidden: PlanePoint,
  trueRow: PlanePoint,
  negativeRows: PlanePoint[],
): Promise<PairStep> {
  return postJson<PairStep>("/concepts/word2vec/pair-step", {
    hidden,
    true_row: trueRow,
    negative_rows: negativeRows,
  });
}

// --- Where the wrong answers come from ---------------------------------------

export interface SamplerRow {
  word: string;
  topic: string;
  count: number;
  raw_share: number;
  flattened_share: number;
  ratio: number;
}

export interface SamplerShares {
  exponent: number;
  rows: SamplerRow[];
  commonest: SamplerRow;
  rarest: SamplerRow;
  raw_odds: number;
  flattened_odds: number;
  toy_counts: number[];
  toy_raw: number[];
  toy_flattened: number[];
}

export async function fetchSamplerShares(exponent: number): Promise<SamplerShares> {
  return postJson<SamplerShares>("/concepts/word2vec/sampler", { exponent });
}

// --- The tree, and what it saves ---------------------------------------------

export interface TreePath {
  word: string;
  count: number;
  depth: number;
  nodes: number[];
  bits: number[];
}

// skewed_depth is the same construction over counts falling as one over the
// rank, which is roughly how real word counts fall, and balanced_depth ignores
// the counts entirely.
export interface SizeRow {
  n_words: number;
  sweep_rows: number;
  negative_rows: number;
  uniform_depth: number;
  skewed_depth: number;
  balanced_depth: number;
}

export interface TreeReport {
  small_words: string[];
  small_counts: number[];
  small_paths: TreePath[];
  small_internal_nodes: number;
  small_expected_depth: number;
  small_sweep_rows: number;
  corpus_words: number;
  corpus_expected_depth: number;
  corpus_balanced_depth: number;
  corpus_sweep_rows: number;
  corpus_negative_rows: number;
  corpus_shortest_depth: number;
  corpus_longest_depth: number;
  sizes: SizeRow[];
}

let treePromise: Promise<TreeReport> | null = null;

export function fetchTreeReport(): Promise<TreeReport> {
  if (!treePromise) treePromise = getJson<TreeReport>("/concepts/word2vec/tree");
  return treePromise;
}

// --- The four combinations, at two learning rates ----------------------------

export interface CombinationReport {
  architecture: ArchitectureName;
  objective: ObjectiveName;
  learning_rate: number;
  within_topic: number;
  across_topic: number;
  gap: number;
  mean_losses: number[];
  pairs_per_epoch: number;
  output_rows: number;
  neighbours: Record<string, Neighbour[]>;
}

export interface Combinations {
  reference_rate: number;
  doubled_rate: number;
  epochs: number;
  dimension: number;
  window: number;
  words: string[];
  reports: CombinationReport[];
}

let combinationsPromise: Promise<Combinations> | null = null;

export function fetchCombinations(): Promise<Combinations> {
  if (!combinationsPromise) combinationsPromise = getJson<Combinations>("/concepts/word2vec/combinations");
  return combinationsPromise;
}

// --- Training for longer -----------------------------------------------------

export interface LengthReport {
  epochs: number;
  first_loss: number;
  final_loss: number;
  within_topic: number;
  across_topic: number;
  gap: number;
}

export interface LongerTraining {
  points: LengthReport[];
}

let longerPromise: Promise<LongerTraining> | null = null;

export function fetchLongerTraining(): Promise<LongerTraining> {
  if (!longerPromise) longerPromise = getJson<LongerTraining>("/concepts/word2vec/longer-training");
  return longerPromise;
}

// --- What a seed fixes -------------------------------------------------------

export interface SeedReport {
  seed: number;
  coordinates: number[];
  neighbours: Neighbour[];
}

export interface SeedPair {
  word: string;
  reports: SeedReport[];
  mean_coordinate_gap: number;
  largest_coordinate_gap: number;
  similarity_correlation: number;
  mean_similarity_gap: number;
  shared_neighbours: string[];
}

let seedsPromise: Promise<SeedPair> | null = null;

export function fetchSeedPair(): Promise<SeedPair> {
  if (!seedsPromise) seedsPromise = getJson<SeedPair>("/concepts/word2vec/seeds");
  return seedsPromise;
}

// --- A word seen a handful of times ------------------------------------------

export interface RareWord {
  rare_word: string;
  rare_count: number;
  common_word: string;
  common_count: number;
  against: string;
  seeds: number[];
  rare_similarities: number[];
  common_similarities: number[];
  rare_spread: number;
  common_spread: number;
  rare_neighbour_lists: string[][];
  common_neighbour_lists: string[][];
}

let rareWordPromise: Promise<RareWord> | null = null;

export function fetchRareWord(): Promise<RareWord> {
  if (!rareWordPromise) rareWordPromise = getJson<RareWord>("/concepts/word2vec/rare-word");
  return rareWordPromise;
}
