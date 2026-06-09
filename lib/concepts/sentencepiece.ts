// Client functions for the SentencePiece page.
//
// Every number here is computed by the API from the library's own fits. The
// four static endpoints take no input, so their promises are cached at module
// level and several widgets share one request; the fit endpoint is the
// playground and is called on every change.

import { ApiError, getJson, postJson } from "@/lib/api";

const BASE = "/concepts/sentencepiece";

export interface Reading {
  pieces: string[];
  n_pieces: number;
  decoded: string;
  round_trip_exact: boolean;
  n_unspellable: number;
}

export interface SchemeSummary {
  key: string;
  label: string;
  alphabet: string[];
  alphabet_size: number;
  floor: number;
  learned: number;
  n_merges: number;
  corpus_pieces: number;
  sentence: Reading;
}

export interface WordPair {
  word: string;
  front_pieces: string[];
  end_pieces: string[];
}

export interface LossRow {
  text: string;
  pieces: string[];
  decoded: string;
  what_was_lost: string;
}

export interface MarkingView {
  sentence: string;
  corpus: string[];
  n_distinct_words: number;
  n_word_occurrences: number;
  distinct_characters: number;
  mark: string;
  mark_codepoint: number;
  marked_sentence: string;
  marked_units: string[];
  schemes: SchemeSummary[];
  word_pairs: WordPair[];
  losses: LossRow[];
  unspaced_corpus: string[];
  unspaced_words_found: number;
}

export interface LadderStep {
  step: number;
  left: string;
  right: string;
  merged: string;
  count: number;
  tied: string[];
  mark_pair_was_tied: boolean;
  spellings: string[][];
  corpus_pieces: number;
  unseen_pieces: string[];
}

export interface LearnerSummary {
  key: string;
  label: string;
  learned: number;
  tokens: string[];
  unseen_pieces: string[];
  corpus_pieces: number;
  sentence_corpus_pieces: number;
  sentence_pieces: number;
}

export interface LearningView {
  words: string[];
  counts: number[];
  mark: string;
  mark_codepoint: number;
  rival_character: string;
  rival_codepoint: number;
  starting_pieces: number;
  steps: LadderStep[];
  final_spellings: string[][];
  final_pieces: number;
  final_unseen_pieces: string[];
  tokens: string[];
  unseen_word: string;
  sentence_merges: string[];
  sentence_merge_counts: number[];
  sentence_n_merges: number;
  sentence_n_mark_merges: number;
  first_mark_merge_rank: number;
  twin_rows: string[];
  sentence_tokens: string[];
  learners: LearnerSummary[];
  shared_tokens: number;
}

export interface SizeRow {
  asked: number;
  front_learned: number;
  front_corpus_pieces: number;
  front_sentence_pieces: number;
  front_exact: boolean;
  end_learned: number | null;
  end_corpus_pieces: number | null;
  end_sentence_pieces: number | null;
  end_exact: boolean | null;
}

export interface UnspacedSummary {
  key: string;
  label: string;
  asked: number;
  learned: number;
  n_merges: number;
  tokens: string[];
  corpus_pieces: number;
  text_pieces: string[];
  n_text_pieces: number;
  decoded: string;
  round_trip_exact: boolean;
}

export interface CostsView {
  sentence: string;
  rows: SizeRow[];
  front_floor: number;
  end_floor: number;
  front_exhausted: number;
  end_exhausted: number;
  unspaced_corpus: string[];
  unspaced_glosses: string[][];
  unspaced_text: string;
  unspaced: UnspacedSummary[];
  unspaced_end_final_marks: string[];
}

export interface UncutMerge {
  rank: number;
  left: string;
  right: string;
  merged: string;
  count: number;
  crosses: boolean;
}

export interface MarkChoice {
  mark: string;
  codepoint: number;
  sorts_before_the_letters: boolean;
  learned: number;
  merges: string[];
  tokens: string[];
  tokens_shown: string[];
  unseen_pieces: string[];
}

export interface LimitsView {
  uncut_merges: UncutMerge[];
  n_uncut_crossing: number;
  n_uncut: number;
  first_uncut_crossing_rank: number;
  mark_choices: MarkChoice[];
  shared_rows: number;
  unseen_word: string;
  twin_rows: string[];
  n_sentence_rows: number;
  foreign_text: string;
  foreign_pieces: string[];
  foreign_decoded: string;
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
  floor: number;
  asked: number;
  learned: number;
  n_merges: number;
  merges: MergeRow[];
  tokens: string[];
  corpus_pieces: number;
  text: string;
  marked_units: string[];
  marked_text: string;
  pieces: string[];
  n_pieces: number;
  n_unspellable: number;
  decoded: string;
  round_trip_exact: boolean;
  end_floor: number;
  end_pieces: string[] | null;
  end_n_pieces: number | null;
  end_decoded: string | null;
  end_round_trip_exact: boolean | null;
}

export type CorpusChoice = "four_words" | "sentences" | "unspaced";
export type LearnerChoice = "merging" | "shrinking";

let markingPromise: Promise<MarkingView> | null = null;
let learningPromise: Promise<LearningView> | null = null;
let costsPromise: Promise<CostsView> | null = null;
let limitsPromise: Promise<LimitsView> | null = null;

export function fetchMarking(): Promise<MarkingView> {
  markingPromise ??= getJson<MarkingView>(`${BASE}/marking`);
  return markingPromise;
}

export function fetchLearning(): Promise<LearningView> {
  learningPromise ??= getJson<LearningView>(`${BASE}/learning`);
  return learningPromise;
}

export function fetchCosts(): Promise<CostsView> {
  costsPromise ??= getJson<CostsView>(`${BASE}/costs`);
  return costsPromise;
}

export function fetchLimits(): Promise<LimitsView> {
  limitsPromise ??= getJson<LimitsView>(`${BASE}/limits`);
  return limitsPromise;
}

export function fitSentencePiece(
  corpus: CorpusChoice,
  learner: LearnerChoice,
  vocabularySize: number,
  text: string,
): Promise<FitView> {
  return postJson<FitView>(`${BASE}/fit`, {
    corpus,
    learner,
    vocabulary_size: vocabularySize,
    text,
  });
}

// The one message a widget shows when a request could not be answered.
export function messageFor(error: unknown): string {
  return error instanceof ApiError ? error.message : "Something went wrong.";
}
