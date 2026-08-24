// Client functions for the unigram language model page.
//
// Every number here is computed by the API from the library's own fits. The
// three static endpoints take no input, so their promises are cached at module
// level and several widgets share one request; the fit endpoint is the
// playground and is called on every change.

import { ApiError, getJson, postJson } from "@/lib/api";

const BASE = "/concepts/the-unigram-language-model";

export interface SpelledEntry {
  word: string;
  count: number;
  symbols: string[];
}

export interface SeedCandidate {
  piece: string;
  frequency: number;
  n_symbols: number;
  score: number;
}

export interface PieceProbability {
  piece: string;
  log_probability: number;
  probability: number;
}

export interface SpellingRow {
  pieces: string[];
  n_pieces: number;
  log_probability: number;
  probability: number;
  share: number;
  is_best: boolean;
  is_merged_cut: boolean;
}

export interface WordSpellings {
  word: string;
  symbols: string[];
  in_corpus: boolean;
  n_spellings: number;
  marginal_log_probability: number;
  marginal_probability: number;
  best_pieces: string[];
  best_log_probability: number;
  merged_pieces: string[];
  merged_rank: number | null;
  merged_share: number | null;
  rows: SpellingRow[];
}

export interface LatticeArc {
  start: number;
  end: number;
  piece: string;
  log_probability: number;
  probability: number;
  on_best_path: boolean;
}

export interface LatticeView {
  word: string;
  symbols: string[];
  n_positions: number;
  arcs: LatticeArc[];
  n_paths: number;
  best_pieces: string[];
  best_log_probability: number;
}

export interface SpellingsView {
  corpus: string[];
  word_counts: SpelledEntry[];
  alphabet: string[];
  total_occurrences: number;
  character_pieces: number;
  n_candidates: number;
  candidates: SeedCandidate[];
  seed_table: PieceProbability[];
  words: WordSpellings[];
  lattice: LatticeView;
}

export interface ExpectedCount {
  piece: string;
  count: number;
}

export interface EstimationRound {
  round_number: number;
  probabilities: PieceProbability[];
}

export interface WorkedEstimation {
  word: string;
  symbols: string[];
  start: PieceProbability[];
  spellings: SpellingRow[];
  marginal_log_probability: number;
  marginal_probability: number;
  expected: ExpectedCount[];
  expected_total: number;
  rounds: EstimationRound[];
}

export interface ConcentrationRow {
  round_number: number;
  probabilities: PieceProbability[];
  unseen_pieces: string[];
  unseen_log_probability: number;
}

export interface LossRow {
  piece: string;
  loss: number;
}

export interface LossView {
  label: string;
  n_pieces: number;
  n_removable: number;
  n_costing_nothing: number;
  most_costly: LossRow[];
  least_costly: LossRow[];
}

export interface PruningTrace {
  label: string;
  target: number;
  sizes: number[];
  n_rounds: number;
}

export interface PruningView {
  worked: WorkedEstimation;
  concentration: ConcentrationRow[];
  losses: LossView[];
  traces: PruningTrace[];
  shrinking_factor: number;
  estimation_rounds: number;
  tie_broken_survivors: string[];
  tie_broken_size: number;
}

export interface SizeRow {
  asked: number;
  unigram_learned: number;
  unigram_corpus: number;
  unigram_sentence: number;
  merged_learned: number;
  merged_corpus: number;
  merged_sentence: number;
}

export interface CutPair {
  vocabulary_size: number;
  unigram_pieces: string[];
  unigram_n: number;
  unigram_decoded: string;
  unigram_round_trip: boolean;
  merged_pieces: string[];
  merged_n: number;
}

export interface Composition {
  asked: number;
  unigram_learned: number;
  unigram_whole_words: number;
  unigram_other: string[];
  merged_learned: number;
  merged_whole_words: number;
}

export interface LengthComparison {
  word: string;
  likeliest_pieces: string[];
  likeliest_n: number;
  likeliest_log_probability: number;
  shortest_pieces: string[];
  shortest_n: number;
  shortest_log_probability: number;
}

export interface SizesView {
  corpus: string[];
  sentence: string;
  control_text: string;
  n_distinct_words: number;
  n_word_occurrences: number;
  alphabet_size: number;
  character_pieces: number;
  smallest_size: number;
  n_candidates: number;
  rows: SizeRow[];
  cuts: CutPair[];
  compositions: Composition[];
  control_pieces: number;
  control_round_trip: boolean;
  unspellable_symbol: string;
  length_comparisons: LengthComparison[];
  length_comparison_size: number;
  n_words_examined: number;
}

export interface FitView {
  corpus: string[];
  alphabet: string[];
  smallest_size: number;
  n_candidates: number;
  asked: number;
  learned: number;
  n_pruning_rounds: number;
  pieces: PieceProbability[];
  corpus_pieces: number;
  corpus_character_pieces: number;
  text: string;
  cut: string[];
  n_pieces: number;
  unknown_pieces: number;
  decoded: string;
  round_trip_exact: boolean;
  merged_learned: number;
  merged_corpus_pieces: number;
  merged_cut: string[];
  merged_n_pieces: number;
}

export type CorpusChoice = "four_words" | "sentences";

let spellingsPromise: Promise<SpellingsView> | null = null;
let pruningPromise: Promise<PruningView> | null = null;
let sizesPromise: Promise<SizesView> | null = null;

export function fetchSpellings(): Promise<SpellingsView> {
  spellingsPromise ??= getJson<SpellingsView>(`${BASE}/spellings`);
  return spellingsPromise;
}

export function fetchPruning(): Promise<PruningView> {
  pruningPromise ??= getJson<PruningView>(`${BASE}/pruning`);
  return pruningPromise;
}

export function fetchSizes(): Promise<SizesView> {
  sizesPromise ??= getJson<SizesView>(`${BASE}/sizes`);
  return sizesPromise;
}

export function fitUnigramModel(
  corpus: CorpusChoice,
  vocabularySize: number,
  text: string,
): Promise<FitView> {
  return postJson<FitView>(`${BASE}/fit`, {
    corpus,
    vocabulary_size: vocabularySize,
    text,
  });
}

// The one message a widget shows when a request could not be answered.
export function messageFor(error: unknown): string {
  return error instanceof ApiError ? error.message : "Something went wrong.";
}
