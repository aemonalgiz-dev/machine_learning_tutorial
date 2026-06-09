// Client functions for the byte pair encoding page.
//
// Every number here is computed by the API from the library's own fits. The
// four static endpoints take no input, so their promises are cached at module
// level and several widgets share one request; the fit endpoint is the
// playground and is called on every change.

import { ApiError, getJson, postJson } from "@/lib/api";

const BASE = "/concepts/byte-pair-encoding";

export interface SpelledEntry {
  word: string;
  count: number;
  symbols: string[];
}

export interface LadderStep {
  step: number;
  left: string | null;
  right: string | null;
  merged: string | null;
  count: number | null;
  tied: string[];
  spellings: SpelledEntry[];
  corpus_pieces: number;
  unseen_pieces: string[];
}

export interface LearningView {
  corpus: string[];
  word_counts: SpelledEntry[];
  alphabet: string[];
  total_occurrences: number;
  character_pieces: number;
  unseen_word: string;
  steps: LadderStep[];
  tokens: string[];
}

export interface SizeRow {
  asked: number;
  learned: number;
  total_rows: number;
  n_merges: number;
  corpus_pieces: number;
  sentence_pieces: number;
  round_trip_exact: boolean;
}

export interface SentenceCut {
  vocabulary_size: number;
  learned: number;
  total_rows: number;
  n_merges: number;
  pieces: string[];
  n_pieces: number;
  decoded: string;
  round_trip_exact: boolean;
}

export interface BaselineCounts {
  n_distinct_words: number;
  n_word_occurrences: number;
  alphabet_size: number;
  corpus_character_pieces: number;
  sentence_words: string[];
  sentence_words_unseen: string[];
  sentence_characters: number;
  sentence_character_pieces: number;
  sentence_characters_unseen: string[];
  sentence_symbols_unspellable: string[];
}

export interface WordReading {
  word: string;
  pieces: string[];
  n_pieces: number;
}

export interface SizesView {
  corpus: string[];
  sentence: string;
  baselines: BaselineCounts;
  smallest_size: number;
  largest_useful_size: number;
  floor_rows: number;
  rows: SizeRow[];
  cuts: SentenceCut[];
  neighbour_readings: WordReading[];
}

export interface FallbackReading {
  key: string;
  label: string;
  pieces: string[];
  n_pieces: number;
  n_byte_rows: number;
  n_bare_markers: number;
  n_stand_ins: number;
  decoded: string;
  round_trip_exact: boolean;
}

export interface FallbackText {
  key: string;
  label: string;
  text: string;
  n_characters: number;
  characters_unseen: string[];
  readings: FallbackReading[];
}

export interface AccountingRow {
  asked: number;
  n_merges: number;
  learned: number;
  floor_rows: number;
  total_rows: number;
}

export interface FallbackView {
  alphabet_size: number;
  floor_rows: number;
  n_byte_rows: number;
  unspellable_symbol: string;
  unspellable_character: string;
  stand_in: string;
  repaired_spelling: string[];
  byte_spelled_character: string;
  byte_spelling: string[];
  corpus_pieces: number;
  corpus_pieces_published: number;
  texts: FallbackText[];
  accounting: AccountingRow[];
}

export interface VariantReading {
  pieces: string[];
  n_pieces: number;
  decoded: string;
  round_trip_exact: boolean;
}

export interface VariantSummary {
  key: string;
  label: string;
  asked: number;
  learned: number;
  n_merges: number;
  alphabet_size: number;
  floor_rows: number;
  corpus_pieces: number;
  sentence: VariantReading;
  foreign: VariantReading;
  greek: VariantReading;
}

export interface SuperwordSummary {
  corpus_label: string;
  n_word_merges: number;
  n_superword_merges: number;
  superword_merges: string[];
  superword_tokens: string[];
  example_text: string;
  example_pieces: string[];
}

export interface MorphComparison {
  corpus: string[];
  words: string[];
  morphs: string[][];
  plain_merges: string[];
  plain_tokens: string[];
  plain_cut: string[];
  plain_corpus_pieces: number;
  constrained_merges: string[];
  constrained_tokens: string[];
  constrained_cut: string[];
  constrained_corpus_pieces: number;
}

export interface VariantsView {
  sentence: string;
  foreign: string;
  greek: string;
  fits: VariantSummary[];
  corpus_distinct_characters: number;
  foreign_word: string;
  foreign_character: string;
  foreign_character_bytes: number[];
  published_foreign_word: string[];
  plain_foreign_word: string[];
  byte_foreign_word: string[];
  superwords: SuperwordSummary[];
  morphology: MorphComparison;
}

export interface TieBranch {
  pair: string;
  chosen_by_the_rule: boolean;
  tokens: string[];
  corpus_pieces: number;
  unseen_pieces: string[];
}

export interface TieView {
  step: number;
  count: number;
  unseen_word: string;
  branches: TieBranch[];
}

export interface GreedyRow {
  budget: number;
  greedy_pieces: number;
  best_pieces: number;
  greedy_merges: string[];
  best_merges: string[];
}

export interface LimitsView {
  ties: TieView[];
  trap_words: SpelledEntry[];
  trap_start_pieces: number;
  trap_first_tie: string[];
  trap_first_tie_count: number;
  greedy_rows: GreedyRow[];
  lost_boundary_text: string;
  lost_boundary_pieces: string[];
  lost_boundary_decoded: string;
  lost_boundary_repaired_pieces: string[];
  lost_boundary_repaired_decoded: string;
}

export interface MergeRow {
  rank: number;
  left: string;
  right: string;
  merged: string;
  count: number;
}

export interface FitView {
  corpus: string[];
  alphabet: string[];
  smallest_size: number;
  asked: number;
  learned: number;
  floor_rows: number;
  total_rows: number;
  n_merges: number;
  merges: MergeRow[];
  tokens: string[];
  corpus_pieces: number;
  corpus_character_pieces: number;
  text: string;
  pieces: string[];
  n_pieces: number;
  unknown_pieces: number;
  decoded: string;
  round_trip_exact: boolean;
}

export type CorpusChoice = "four_words" | "sentences";

let learningPromise: Promise<LearningView> | null = null;
let sizesPromise: Promise<SizesView> | null = null;
let fallbackPromise: Promise<FallbackView> | null = null;
let variantsPromise: Promise<VariantsView> | null = null;
let limitsPromise: Promise<LimitsView> | null = null;

export function fetchLearning(): Promise<LearningView> {
  learningPromise ??= getJson<LearningView>(`${BASE}/learning`);
  return learningPromise;
}

export function fetchSizes(): Promise<SizesView> {
  sizesPromise ??= getJson<SizesView>(`${BASE}/sizes`);
  return sizesPromise;
}

export function fetchFallback(): Promise<FallbackView> {
  fallbackPromise ??= getJson<FallbackView>(`${BASE}/fallback`);
  return fallbackPromise;
}

export function fetchVariants(): Promise<VariantsView> {
  variantsPromise ??= getJson<VariantsView>(`${BASE}/variants`);
  return variantsPromise;
}

export function fetchLimits(): Promise<LimitsView> {
  limitsPromise ??= getJson<LimitsView>(`${BASE}/limits`);
  return limitsPromise;
}

export function fitBytePairEncoding(
  corpus: CorpusChoice,
  vocabularySize: number,
  text: string,
  byteFallback: boolean,
): Promise<FitView> {
  return postJson<FitView>(`${BASE}/fit`, {
    corpus,
    vocabulary_size: vocabularySize,
    text,
    byte_fallback: byteFallback,
  });
}

// The one message a widget shows when a request could not be answered.
export function messageFor(error: unknown): string {
  return error instanceof ApiError ? error.message : "Something went wrong.";
}
