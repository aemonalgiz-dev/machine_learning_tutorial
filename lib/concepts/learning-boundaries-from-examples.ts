// Client functions for the page about deciding every gap on its own.
//
// Five endpoints and one playground. The scenarios endpoint carries the page's
// fixed texts, each with a score and a decision at every gap and with what the
// whole-sequence method answers for the same text. The gaps endpoint carries
// four gaps taken apart into the features that voted on them, and the smallest
// fit there is. The training endpoint carries what the corrections do and what
// the order of them decides. The comparison endpoint carries the head-to-head on
// two generated languages, together with the arithmetic of a corpus somebody
// marked only in part. The limits endpoint carries how far a gap can see and
// what an answer assembled out of independent parts is worth. The segment
// endpoint is the playground and answers the same shape for whatever text it is
// handed.
//
// The API computes all of it; these functions only carry it across.

import { ApiError, getJson, postJson } from "@/lib/api";

export interface GapDecision {
  index: number;
  position: number;
  before: string;
  after: string;
  score: number;
  cut: boolean;
  expected: boolean | null;
  correct: boolean | null;
}

export interface Scenario {
  key: string;
  label: string;
  corpus_key: string;
  corpus_label: string;
  sentences: string[][];
  corpus_words: string[];
  window: number;
  epochs: number;
  random_seed: number;
  text: string;
  gaps: GapDecision[];
  words: string[];
  n_gaps: number;
  n_gaps_wrong: number | null;
  reader_reading: string[] | null;
  matches_reader: boolean;
  from_the_sequence_model: string[];
  sequence_matches_reader: boolean;
  n_new_words: number;
  n_features: number;
  n_free_boundaries: number;
}

export interface ScenariosView {
  scenarios: Scenario[];
}

export interface FeatureVote {
  feature: string;
  family: string;
  reach: string;
  reads: string;
  weight: number;
  seen: boolean;
}

export interface OpenedGap {
  key: string;
  label: string;
  corpus_key: string;
  corpus_label: string;
  text: string;
  gap: number;
  before: string;
  after: string;
  votes: FeatureVote[];
  total: number;
  cut: boolean;
  expected: boolean | null;
  base_rate_total: number;
  identity_total: number;
  kind_total: number;
  n_identity: number;
  n_identity_seen: number;
  n_kind: number;
  n_kind_seen: number;
}

export interface HandWorked {
  text: string;
  features: string[];
  n_features: number;
  score_when_cut: number;
  score_when_joined: number;
  words_when_cut: string[];
  words_when_joined: string[];
  n_updates_by_epoch: number[];
}

export interface GapsView {
  gaps: OpenedGap[];
  hand_worked: HandWorked;
  features_by_reach: string[][];
}

export interface EpochRow {
  epoch: number;
  n_updates: number;
}

export interface SeedRow {
  random_seed: number;
  words: string[];
  scores: number[];
  n_updates_by_epoch: number[];
  matches_reader: boolean;
  n_passes_before_settling: number;
}

export interface TrainingView {
  corpus_key: string;
  corpus_label: string;
  sentences: string[][];
  text: string;
  reader_reading: string[];
  window: number;
  epochs: number;
  n_marked_gaps: number;
  n_boundaries: number;
  n_features: number;
  epoch_rows: EpochRow[];
  seed_rows: SeedRow[];
  n_seeds_matching_reader: number;
}

export interface Quality {
  f_measure: number;
  precision: number;
  recall: number;
  recall_on_seen: number;
  recall_on_unseen: number;
}

export interface SizeStep {
  n_sentences: number;
  n_marked_gaps: number;
  n_features: number;
  n_known_words: number;
  share_unseen: number;
  pointwise: Quality;
  sequence: Quality;
}

export interface LanguageRace {
  key: string;
  label: string;
  n_words: number;
  n_alphabet: number;
  n_test_sentences: number;
  steps: SizeStep[];
  crosses_between: number[];
}

export interface AnnotationRow {
  share_marked: number;
  n_marked: number;
  n_gaps: number;
  share_usable_gaps: number;
  n_known_places: number;
  n_characters: number;
  share_known_places: number;
}

export interface ComparisonView {
  languages: LanguageRace[];
  annotation: AnnotationRow[];
  identity_share_seen: number;
  kind_share_seen: number;
  n_features_counted: number;
}

export interface WindowRow {
  n_filler: number;
  offset: number;
  n_right_by_window: number[];
  n_texts: number;
  smallest_window_that_works: number | null;
}

export interface CoherenceRow {
  name: string;
  words: string[];
  n_pieces: number;
  sequence_log_score: number;
  is_the_sequence_answer: boolean;
}

export interface LimitsView {
  window_rows: WindowRow[];
  windows: number[];
  wide_example: string[];
  coherence_text: string;
  coherence_rows: CoherenceRow[];
  n_four_character_texts: number;
  n_odd_pointwise: number;
  n_odd_sequence: number;
  odd_example_text: string;
  odd_from_pointwise: string[];
  odd_from_the_sequence_model: string[];
  paired_words: string[];
}

export interface SegmentView {
  scenario: Scenario;
  opened: OpenedGap | null;
}

const BASE = "/concepts/learning-boundaries-from-examples";

let scenariosPromise: Promise<ScenariosView> | null = null;
let gapsPromise: Promise<GapsView> | null = null;
let trainingPromise: Promise<TrainingView> | null = null;
let comparisonPromise: Promise<ComparisonView> | null = null;
let limitsPromise: Promise<LimitsView> | null = null;

// Several widgets read each of these and none of them takes an input, so each
// request is made once and shared.
export async function fetchScenarios(): Promise<ScenariosView> {
  if (!scenariosPromise) {
    scenariosPromise = getJson<ScenariosView>(`${BASE}/scenarios`);
  }
  return scenariosPromise;
}

export async function fetchGaps(): Promise<GapsView> {
  if (!gapsPromise) {
    gapsPromise = getJson<GapsView>(`${BASE}/gaps`);
  }
  return gapsPromise;
}

export async function fetchTraining(): Promise<TrainingView> {
  if (!trainingPromise) {
    trainingPromise = getJson<TrainingView>(`${BASE}/training`);
  }
  return trainingPromise;
}

export async function fetchComparison(): Promise<ComparisonView> {
  if (!comparisonPromise) {
    comparisonPromise = getJson<ComparisonView>(`${BASE}/comparison`);
  }
  return comparisonPromise;
}

export async function fetchLimits(): Promise<LimitsView> {
  if (!limitsPromise) {
    limitsPromise = getJson<LimitsView>(`${BASE}/limits`);
  }
  return limitsPromise;
}

export async function segment(
  text: string,
  corpus: string,
  window: number,
  epochs: number,
  randomSeed: number,
  gap: number | null,
): Promise<SegmentView> {
  return postJson<SegmentView>(`${BASE}/segment`, {
    text,
    corpus,
    window,
    epochs,
    random_seed: randomSeed,
    gap,
  });
}

export const CORPUS_CHOICES = [
  { key: "written", name: "eight English sentences" },
  { key: "five sentences", name: "five sentences without spaces" },
  { key: "mixed", name: "eight sentences mixing two scripts" },
  { key: "paired", name: "four sentences of two-character words" },
] as const;

export function scenarioFor(view: ScenariosView, key: string): Scenario {
  return view.scenarios.find((item) => item.key === key) ?? view.scenarios[0];
}

export function openedFor(view: GapsView, key: string): OpenedGap {
  return view.gaps.find((item) => item.key === key) ?? view.gaps[0];
}

export function languageFor(view: ComparisonView, key: string): LanguageRace {
  return view.languages.find((item) => item.key === key) ?? view.languages[0];
}

export function signed(value: number, places = 4): string {
  return `${value >= 0 ? "+" : "−"}${Math.abs(value).toFixed(places)}`;
}

export function percent(value: number, places = 1): string {
  return `${(value * 100).toFixed(places)}%`;
}

export function messageFor(error: unknown): string {
  return error instanceof ApiError ? error.message : "Something went wrong.";
}
