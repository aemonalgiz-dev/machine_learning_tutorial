// Client functions for the greedy coverage page.
//
// Every number here is computed by the API from the library's own fits. The
// five static endpoints take no input, so their promises are cached at module
// level and several widgets share one request; the fit endpoint is the
// playground and is called on every change.

import { ApiError, getJson, postJson } from "@/lib/api";

const BASE = "/concepts/greedy-coverage";

export interface SpelledEntry {
  word: string;
  count: number;
  symbols: string[];
}

export interface Rival {
  piece: string;
  n_symbols: number;
  occurrences: number;
  coverage: number;
}

export interface ChoiceStep {
  step: number;
  piece: string | null;
  coverage: number | null;
  rivals: Rival[];
  covered: boolean[][];
  covered_positions: number;
  corpus_pieces: number;
}

export interface WordReading {
  word: string;
  seen_in_training: boolean;
  pieces: string[];
  n_covered_symbols: number;
}

export interface ChoosingView {
  corpus: string[];
  word_counts: SpelledEntry[];
  alphabet: string[];
  total_occurrences: number;
  total_positions: number;
  steps: ChoiceStep[];
  tokens: string[];
  stops_at: number;
  readings: WordReading[];
}

export interface UnitScore {
  piece: string;
  n_symbols: number;
  occurrences: number;
  in_positions: number;
  in_characters: number;
}

export interface UnitCorpus {
  key: string;
  label: string;
  word_counts: SpelledEntry[];
  total_positions: number;
  total_characters: number;
  candidates: UnitScore[];
  winner_by_positions: string;
  winner_positions_score: number;
  winner_by_characters: string;
  winner_characters_score: number;
  same_winner: boolean;
  run_by_positions: UnitScore[];
  run_by_characters: UnitScore[];
}

export interface UnitsView {
  corpora: UnitCorpus[];
}

export interface MatchedRow {
  asked: number;
  coverage_learned: number;
  merging_learned: number;
  coverage_corpus: number;
  merging_corpus: number;
  coverage_sentence: number;
  merging_sentence: number;
}

export interface Reading {
  label: string;
  text: string;
  coverage: string[];
  merging: string[];
}

export interface VocabularyPair {
  size: number;
  coverage_pieces: string[];
  merging_pieces: string[];
  shared: string[];
  coverage_whole_words: number;
  merging_whole_words: number;
  coverage_mean_length: number;
  merging_mean_length: number;
}

export interface MatchedView {
  corpus: string[];
  sentence: string;
  control: string;
  n_distinct_words: number;
  n_word_occurrences: number;
  alphabet_size: number;
  total_positions: number;
  coverage_ceiling: number;
  merging_ceiling: number;
  rows: MatchedRow[];
  crossover: number | null;
  compared: VocabularyPair;
  readings: Reading[];
  sentence_decoded: string;
  sentence_round_trip_exact: boolean;
  control_pieces: number;
  control_round_trip_exact: boolean;
}

export interface GainRow {
  rank: number;
  piece: string;
  coverage: number;
}

export interface BestSetRow {
  budget: number;
  greedy_pieces: string[];
  greedy_coverage: number;
  best_pieces: string[];
  best_coverage: number;
  ratio: number;
}

export interface OnceRow {
  size: number;
  coverage_rows: number;
  coverage_once: number;
  merging_rows: number;
  merging_once: number;
  examples: string[];
}

export interface LimitsView {
  gains: GainRow[];
  total_positions: number;
  covered_positions: number;
  trap_words: SpelledEntry[];
  trap_positions: number;
  trap_rows: BestSetRow[];
  trap_greedy_corpus: number;
  trap_best_corpus: number;
  guarantee: number;
  n_distinct_words: number;
  n_words_seen_once: number;
  once_rows: OnceRow[];
}

export interface CapRow {
  cap: number;
  learned: number;
  corpus_pieces: number;
  sentence_pieces: number;
  once_seen_rows: number;
  first_pieces: string[];
}

export interface CappingView {
  size: number;
  sentence: string;
  rows: CapRow[];
}

export interface ChosenRow {
  rank: number;
  piece: string;
  n_symbols: number;
  coverage: number;
}

export interface FitView {
  corpus: string[];
  alphabet: string[];
  smallest_size: number;
  asked: number;
  learned: number;
  n_pieces: number;
  pieces: ChosenRow[];
  tokens: string[];
  total_positions: number;
  covered_positions: number;
  corpus_pieces: number;
  corpus_bare_pieces: number;
  text: string;
  text_pieces: string[];
  n_text_pieces: number;
  unknown_pieces: number;
  decoded: string;
  round_trip_exact: boolean;
}

export type CorpusChoice = "four_words" | "sentences";

let choosingPromise: Promise<ChoosingView> | null = null;
let unitsPromise: Promise<UnitsView> | null = null;
let matchedPromise: Promise<MatchedView> | null = null;
let limitsPromise: Promise<LimitsView> | null = null;
let cappingPromise: Promise<CappingView> | null = null;

export function fetchChoosing(): Promise<ChoosingView> {
  choosingPromise ??= getJson<ChoosingView>(`${BASE}/choosing`);
  return choosingPromise;
}

export function fetchUnits(): Promise<UnitsView> {
  unitsPromise ??= getJson<UnitsView>(`${BASE}/units`);
  return unitsPromise;
}

export function fetchMatched(): Promise<MatchedView> {
  matchedPromise ??= getJson<MatchedView>(`${BASE}/matched`);
  return matchedPromise;
}

export function fetchLimits(): Promise<LimitsView> {
  limitsPromise ??= getJson<LimitsView>(`${BASE}/limits`);
  return limitsPromise;
}

export function fetchCapping(): Promise<CappingView> {
  cappingPromise ??= getJson<CappingView>(`${BASE}/capping`);
  return cappingPromise;
}

export function fitGreedyCoverage(
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
