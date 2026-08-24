// Client functions for the n-grams page.
//
// Every number here is computed by the API from the library's own fits. The
// five static endpoints take no input, so their promises are cached at module
// level and several widgets share one request; the fit endpoint is the
// playground and is called on every change.

import { ApiError, getJson, postJson } from "@/lib/api";

const BASE = "/concepts/n-grams";

export interface Framing {
  order: number;
  framed: string[];
  windows: string[][];
  n_windows: number;
  n_start_markers: number;
}

export interface SparsityRow {
  order: number;
  n_seen: number;
  n_possible: number;
  share_seen: number;
  n_seen_once: number;
  share_seen_once: number;
  n_occurrences: number;
}

export interface NoveltyRow {
  order: number;
  n_runs: number;
  n_unseen: number;
  share_unseen: number;
}

export interface GrowthRow {
  n_sentences: number;
  n_word_occurrences: number;
  vocabulary_size: number;
  n_unigram_types: number;
  n_bigram_types: number;
  n_trigram_types: number;
  test_perplexity: number;
  n_unknown: number;
  unknown_share: number;
  knowing_nothing_perplexity: number;
}

export interface GramsView {
  sentence: string;
  words: string[];
  n_words: number;
  sentence_start: string;
  sentence_end: string;
  framings: Framing[];
  n_training_sentences: number;
  n_word_occurrences: number;
  n_distinct_words: number;
  vocabulary_size: number;
  sparsity: SparsityRow[];
  novelty: NoveltyRow[];
  growth: GrowthRow[];
}

export interface UnigramRow {
  word: string;
  count: number;
  n_times_followed: number;
}

export interface BigramRow {
  context: string;
  word: string;
  count: number;
}

export interface ProbabilityRow {
  context: string;
  word: string;
  count: number;
  context_total: number;
  unsmoothed: number;
  smoothed: number;
}

export interface SentenceScore {
  text: string;
  n_predicted: number;
  unsmoothed_probability: number | null;
  unsmoothed_perplexity: number | null;
  unsmoothed_is_finite: boolean;
  smoothed_log_probability: number;
  smoothed_perplexity: number;
  in_corpus: boolean;
}

export interface WalkStep {
  context: string;
  word: string;
  count: number;
  context_total: number;
  probability: number;
  is_unknown: boolean;
}

export interface CountsView {
  corpus: string[];
  vocabulary: string[];
  vocabulary_size: number;
  unigrams: UnigramRow[];
  bigrams: BigramRow[];
  n_predicted_positions: number;
  probabilities: ProbabilityRow[];
  sentences: SentenceScore[];
  walk_strength: number;
  walk: WalkStep[];
  walk_perplexity: number;
  walk_cross_entropy: number;
  walk_n_unknown: number;
  walk_n_predicted: number;
}

export interface StrengthRow {
  strength: number;
  tuning_perplexity: number;
  test_perplexity: number;
}

export interface StrengthSweep {
  order: number;
  rows: StrengthRow[];
  best_strength: number;
  best_tuning_perplexity: number;
  best_test_perplexity: number;
  laplace_tuning_perplexity: number;
  laplace_test_perplexity: number;
}

export interface CertainRow {
  strength: number;
  probability: number;
  entropy: number;
}

export interface LimitRow {
  strength: number;
  test_perplexity: number;
}

export interface WordShare {
  word: string;
  probability: number;
}

export interface ContextAnswer {
  label: string;
  context: string[];
  strength: number;
  entropy: number;
  n_words: number;
  context_total: number;
  n_followers: number;
  top: WordShare[];
}

export interface SmoothingView {
  strengths: number[];
  sweeps: StrengthSweep[];
  certain_context: string;
  certain_word: string;
  certain_count: number;
  certain_context_total: number;
  certain_rows: CertainRow[];
  certain_unsmoothed_probability: number;
  certain_unsmoothed_entropy: number;
  limits: LimitRow[];
  vocabulary_size: number;
  flat_probability: number;
  flat_entropy: number;
  answers: ContextAnswer[];
}

export interface OrderRow {
  order: number;
  n_types: number;
  unsmoothed_training_perplexity: number;
  unsmoothed_test_perplexity: number | null;
  unsmoothed_test_is_finite: boolean;
  laplace_training_perplexity: number;
  laplace_test_perplexity: number;
  laplace_test_cross_entropy: number;
  tuned_strength: number;
  tuned_training_perplexity: number;
  tuned_test_perplexity: number;
  unknown_share: number;
}

export interface ReversedRow {
  order: number;
  forwards_perplexity: number;
  reversed_perplexity: number;
}

export interface DependencyRow {
  order: number;
  n_context_words: number;
  agreeing_probability: number;
  disagreeing_probability: number;
}

export interface RunningRow {
  order: number;
  strength: number | null;
  perplexity: number | null;
  cross_entropy: number | null;
  is_finite: boolean;
}

export interface ScoresView {
  n_test_texts: number;
  n_predicted_positions: number;
  orders: OrderRow[];
  reversed_rows: ReversedRow[];
  reversed_example: string;
  dependency_corpus: string[];
  dependency_context: string[];
  agreeing_word: string;
  disagreeing_word: string;
  dependency_rows: DependencyRow[];
  running_rows: RunningRow[];
}

export interface DrawnByOrder {
  order: number;
  samples: string[];
  n_draws: number;
  n_exact_copies: number;
  share_exact_copies: number;
}

export interface DrawnByTemperature {
  temperature: number;
  samples: string[];
}

export interface GenerationView {
  by_order: DrawnByOrder[];
  temperature_order: number;
  temperature_strength: number;
  by_temperature: DrawnByTemperature[];
  n_training_sentences: number;
}

export type RuleChoice = "counts_as_they_stand" | "add_a_constant";

export interface FitView {
  order: number;
  rule: RuleChoice;
  strength: number | null;
  text: string;
  words: string[];
  framed: string[];
  vocabulary_size: number;
  n_types: number;
  steps: WalkStep[];
  n_predicted: number;
  n_unknown: number;
  unknown_words: string[];
  n_unseen_runs: number;
  log_probability: number | null;
  perplexity: number | null;
  cross_entropy: number | null;
  is_finite: boolean;
  generated: string[];
  next_context: string[];
  next_is_defined: boolean;
  next_entropy: number | null;
  next_top: WordShare[];
}

let gramsPromise: Promise<GramsView> | null = null;
let countsPromise: Promise<CountsView> | null = null;
let smoothingPromise: Promise<SmoothingView> | null = null;
let scoresPromise: Promise<ScoresView> | null = null;
let generationPromise: Promise<GenerationView> | null = null;

export function fetchGrams(): Promise<GramsView> {
  gramsPromise ??= getJson<GramsView>(`${BASE}/grams`);
  return gramsPromise;
}

export function fetchCounts(): Promise<CountsView> {
  countsPromise ??= getJson<CountsView>(`${BASE}/counts`);
  return countsPromise;
}

export function fetchSmoothing(): Promise<SmoothingView> {
  smoothingPromise ??= getJson<SmoothingView>(`${BASE}/smoothing`);
  return smoothingPromise;
}

export function fetchScores(): Promise<ScoresView> {
  scoresPromise ??= getJson<ScoresView>(`${BASE}/scores`);
  return scoresPromise;
}

export function fetchGeneration(): Promise<GenerationView> {
  generationPromise ??= getJson<GenerationView>(`${BASE}/generation`);
  return generationPromise;
}

export function readOneText(
  order: number,
  rule: RuleChoice,
  strength: number,
  text: string,
  randomSeed: number,
): Promise<FitView> {
  return postJson<FitView>(`${BASE}/fit`, {
    order,
    rule,
    strength,
    text,
    random_seed: randomSeed,
  });
}

// The one message a widget shows when a request could not be answered.
export function messageFor(error: unknown): string {
  return error instanceof ApiError ? error.message : "Something went wrong.";
}
