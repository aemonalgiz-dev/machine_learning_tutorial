// Client functions for the Morfessor page.
//
// Every number here is computed by the API from the library's own fits. The
// four static endpoints take no input, so their promises are cached at module
// level and several widgets share one request; the fit endpoint is the
// playground and is called on every change.

import { ApiError, getJson, postJson } from "@/lib/api";

const BASE = "/concepts/morfessor";

export interface CostBreakdown {
  n_types: number;
  n_tokens: number;
  lexicon_characters: number;
  spelling_cost: number;
  count_cost: number;
  lexicon_cost: number;
  corpus_cost: number;
  total: number;
}

export interface MorphRow {
  text: string;
  count: number;
}

export interface WordCut {
  word: string;
  pieces: string[];
  n_pieces: number;
}

export interface SegmentationRow {
  word: string;
  pieces: string[];
  n_pieces: number;
  cost: number;
  n_unknown: number;
}

export interface MergeRung {
  size: number;
  learned: string | null;
  corpus_pieces: number;
  cuts: WordCut[];
}

export interface MethodPair {
  word: string;
  morph_pieces: string[];
  merged_pieces: string[];
}

export interface SentenceReading {
  method: string;
  weight: number | null;
  n_rows: number;
  corpus_pieces: number;
  pieces: string[];
  n_pieces: number;
  n_unknown: number;
  round_trip: boolean;
  characters_held: number;
  characters_missing: string[];
  n_characters: number;
}

export interface CountsView {
  words: string[];
  repeats: number;
  n_occurrences: number;
  n_characters: number;
  n_symbols: number;
  smallest_merged_size: number;
  ladder: MergeRung[];
  morph_rows: number;
  morph_types: number;
  morph_pieces: number;
  morph_cuts: WordCut[];
  matched_size: number;
  matched_learned: string[];
  sentence: string;
  n_distinct_words: number;
  n_word_occurrences: number;
  merged_size: number;
  merged_sentence_pieces: string[];
  merged_sentence_n: number;
  pairs: MethodPair[];
  readings: SentenceReading[];
}

export interface NamedLexicon {
  label: string;
  morphs: MorphRow[];
  breakdown: CostBreakdown;
}

export interface CostView {
  two_word_corpus: string[];
  two_word_whole: NamedLexicon;
  two_word_split: NamedLexicon;
  two_word_saving: number;
  words: string[];
  repeats: number;
  lexicons: NamedLexicon[];
  nat_in_bits: number;
  prefixed_words: string[];
  prefix_repeats: number;
  prefix_whole: NamedLexicon;
  prefix_split: NamedLexicon;
  prefix_penalty: number;
  prefix_found: MorphRow[];
}

export interface EpochRow {
  epoch: number;
  n_morphs: number;
  cost: number;
  converged: boolean;
  gained: string[];
  lost: string[];
}

export interface SearchView {
  words: string[];
  repeats: number;
  start_cost: number;
  final_cost: number;
  epochs_run: number;
  converged: boolean;
  morphs: MorphRow[];
  segmentations: WordCut[];
  n_tokens: number;
  inflection_epochs: EpochRow[];
  sentence_weight: number;
  sentence_epochs: EpochRow[];
  sentence_final_morphs: number;
  unseen: SegmentationRow[];
}

export interface SplitRow {
  word: string;
  left: string;
  right: string;
  delta: number;
}

export interface SplitSet {
  repeats: number;
  whole_cost: number;
  n_splits: number;
  n_downhill: number;
  rows: SplitRow[];
}

export interface RepeatRow {
  repeats: number;
  n_morphs: number;
  corpus_pieces: number;
  cost: number;
  epochs_run: number;
  best_delta: number;
  best_word: string;
  best_left: string;
  best_right: string;
}

export interface WeightRow {
  weight: number;
  n_morphs: number;
  corpus_pieces: number;
  cost: number;
  epochs_run: number;
  found_the_morphs: boolean;
}

export interface StallView {
  words: string[];
  repeats_that_work: number;
  repeats_that_stall: number;
  repeat_rows: RepeatRow[];
  split_sets: SplitSet[];
  stalled_cost: number;
  stem_and_suffix_cost: number;
  gap: number;
  weights: WeightRow[];
  threshold_below: number;
  threshold_above: number;
  escape_weight: number;
  escape_cost: number;
}

export interface FitView {
  corpus: string[];
  n_distinct_words: number;
  n_word_occurrences: number;
  alphabet_size: number;
  alphabet_covered: number;
  corpus_weight: number;
  n_morphs: number;
  n_rows: number;
  morphs: MorphRow[];
  breakdown: CostBreakdown;
  start_total: number;
  epochs_run: number;
  converged: boolean;
  corpus_pieces: number;
  whole_word_pieces: number;
  segmentations: WordCut[];
  text: string;
  cut: string[];
  n_pieces: number;
  n_unknown: number;
  decoded: string;
  round_trip_exact: boolean;
  word: string;
  word_pieces: string[];
  word_cost: number;
}

export type MorfessorCorpus = "inflections" | "sentences" | "prefixes";

let countsPromise: Promise<CountsView> | null = null;
let costPromise: Promise<CostView> | null = null;
let searchPromise: Promise<SearchView> | null = null;
let stallPromise: Promise<StallView> | null = null;

export function fetchCounts(): Promise<CountsView> {
  countsPromise ??= getJson<CountsView>(`${BASE}/counts`);
  return countsPromise;
}

export function fetchCost(): Promise<CostView> {
  costPromise ??= getJson<CostView>(`${BASE}/cost`);
  return costPromise;
}

export function fetchSearch(): Promise<SearchView> {
  searchPromise ??= getJson<SearchView>(`${BASE}/search`);
  return searchPromise;
}

export function fetchStall(): Promise<StallView> {
  stallPromise ??= getJson<StallView>(`${BASE}/stall`);
  return stallPromise;
}

export function fitMorfessor(
  corpus: MorfessorCorpus,
  repeats: number,
  corpusWeight: number,
  text: string,
  word: string,
): Promise<FitView> {
  return postJson<FitView>(`${BASE}/fit`, {
    corpus,
    repeats,
    corpus_weight: corpusWeight,
    text,
    word,
  });
}

// The one message a widget shows when a request could not be answered.
export function messageFor(error: unknown): string {
  return error instanceof ApiError ? error.message : "Something went wrong.";
}
