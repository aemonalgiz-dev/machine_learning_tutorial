// Client functions for the WordPiece page.
//
// Every number here is computed by the API from the library's own fits. The
// three static endpoints take no input, so their promises are cached at module
// level and several widgets share one request; the fit endpoint is the
// playground and is called on every change.

import { ApiError, getJson, postJson } from "@/lib/api";

const BASE = "/concepts/wordpiece";

export interface SpelledEntry {
  word: string;
  count: number;
  pieces: string[];
}

export interface SymbolCount {
  piece: string;
  count: number;
}

export interface PairScore {
  left: string;
  right: string;
  count: number;
  left_count: number;
  right_count: number;
  score: number;
  total_gain: number;
}

export interface MergeRow {
  rank: number;
  left: string;
  right: string;
  merged: string;
  count: number;
  score: number;
}

export interface OrderPair {
  corpus: string;
  corpus_label: string;
  by_count: MergeRow[];
  by_score: MergeRow[];
  first_difference: number;
}

export interface LengthRow {
  asked: number;
  by_count_learned: number;
  by_count_length: number;
  by_score_learned: number;
  by_score_length: number;
}

export interface LengthGroup {
  corpus: string;
  corpus_label: string;
  start_length: number;
  rows: LengthRow[];
}

export interface TieView {
  tied: PairScore[];
  taken: string;
  rejected: string;
  word_start_mark: string;
  word_start_mark_codepoint: number;
  rival_character: string;
  rival_codepoint: number;
}

export interface ScoringView {
  four_word_corpus: string[];
  four_word_occurrences: number;
  four_word_symbol_total: number;
  spellings: SpelledEntry[];
  symbols: SymbolCount[];
  pairs: PairScore[];
  four_word_best_total_gain: PairScore;
  tie: TieView;
  orders: OrderPair[];
  lengths: LengthGroup[];
  sentence_pairs: PairScore[];
  sentence_largest_count: PairScore;
  sentence_best_score: PairScore;
  sentence_largest_count_rank: number;
  sentence_n_candidates: number;
}

export interface SizeRow {
  asked: number;
  learned: number;
  n_merges: number;
  corpus_pieces: number;
  sentence_pieces: number;
  n_unknown: number;
  round_trip_exact: boolean;
}

export interface SentenceCut {
  vocabulary_size: number;
  learned: number;
  n_merges: number;
  pieces: string[];
  n_pieces: number;
  decoded: string;
  round_trip_exact: boolean;
}

export interface WordPair {
  word: string;
  marked: string[];
  marked_unknown: boolean;
  ended: string[];
  ended_unknown: boolean;
}

export interface SpellingView {
  sentence: string;
  corpus: string[];
  n_distinct_words: number;
  n_word_occurrences: number;
  marked_alphabet: string[];
  ended_alphabet_size: number;
  four_word_marked_alphabet: string[];
  four_word_ended_alphabet: string[];
  character_pieces: number;
  rows: SizeRow[];
  count_rows: SizeRow[];
  cuts: SentenceCut[];
  distinct_characters: number;
  never_opens: string[];
  never_ends: string[];
  comparisons: WordPair[];
  four_word_comparisons: WordPair[];
}

export interface BoundRow {
  repeats: number;
  score: number;
  rival_repeats: number;
  rival_score: number;
  taken: string;
}

export interface GreedyCheck {
  longest_word: number;
  n_letters: number;
  n_words: number;
  n_cut: number;
  n_refused: number;
  n_refused_at_the_first_letter: number;
  n_refused_later: number;
  n_refused_with_a_cut_available: number;
  opening_pieces: string[];
  continuation_letters: string[];
  missing_continuations: string[];
}

export interface MinimumReading {
  minimum: number;
  as_filter: string[];
  as_stopping_test: string[];
  stopped_on: string;
  stopped_on_count: number;
  left_unmerged: string[];
}

export interface CarriedCorpus {
  learned: number;
  n_merges: number;
  corpus_pieces: number;
  corpus_words: number;
  corpus_per_word: number;
  sentence_pieces: number;
  sentence_words: number;
  sentence_per_word: number;
  neighbour_text: string;
  neighbour_pieces: number;
  neighbour_words: number;
  neighbour_per_word: number;
  whole_word_pieces: string[];
}

export interface LimitsView {
  bound_rows: BoundRow[];
  greedy: GreedyCheck;
  minimum: MinimumReading;
  carried: CarriedCorpus;
}

export interface FitView {
  corpus: string[];
  corpus_label: string;
  alphabet: string[];
  smallest_size: number;
  asked: number;
  learned: number;
  n_merges: number;
  merges: MergeRow[];
  tokens: string[];
  corpus_pieces: number;
  corpus_character_pieces: number;
  text: string;
  pieces: string[];
  n_pieces: number;
  n_unknown: number;
  decoded: string;
  round_trip_exact: boolean;
  count_pieces: string[] | null;
  count_n_pieces: number | null;
  count_corpus_pieces: number | null;
}

export type CorpusChoice = "four_words" | "sentences";

let scoringPromise: Promise<ScoringView> | null = null;
let spellingPromise: Promise<SpellingView> | null = null;
let limitsPromise: Promise<LimitsView> | null = null;

export function fetchScoring(): Promise<ScoringView> {
  scoringPromise ??= getJson<ScoringView>(`${BASE}/scoring`);
  return scoringPromise;
}

export function fetchSpelling(): Promise<SpellingView> {
  spellingPromise ??= getJson<SpellingView>(`${BASE}/spelling`);
  return spellingPromise;
}

export function fetchLimits(): Promise<LimitsView> {
  limitsPromise ??= getJson<LimitsView>(`${BASE}/limits`);
  return limitsPromise;
}

export function fitWordPiece(
  corpus: CorpusChoice,
  vocabularySize: number,
  minimumPairFrequency: number,
  text: string,
): Promise<FitView> {
  return postJson<FitView>(`${BASE}/fit`, {
    corpus,
    vocabulary_size: vocabularySize,
    minimum_pair_frequency: minimumPairFrequency,
    text,
  });
}

// The one message a widget shows when a request could not be answered.
export function messageFor(error: unknown): string {
  return error instanceof ApiError ? error.message : "Something went wrong.";
}
