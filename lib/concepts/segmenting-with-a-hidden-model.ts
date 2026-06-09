// Client functions for the page about tagging every character with its place in a word.
//
// Six endpoints. The setup endpoint carries the word neither dictionary method
// can produce, answered three ways from one set of sentences. The tables
// endpoint carries everything two fits learned, with the counts the smoothed
// numbers were built from, so a fraction can be shown rather than a value. The
// scenarios endpoint carries the page's fixed texts, each with all four places
// scored at every character. The smoothing endpoint walks one free number and
// reports where a corpus that disagrees with itself changes its mind. The scale
// endpoint measures how much tagged text each method needs, on two generated
// languages scored the same way. The limits endpoint carries the two
// arrangements on which the counts decide nothing. The segment endpoint is the
// playground and answers the same shape for whatever text it is handed.
//
// The API computes all of it; these functions only carry it across.

import { ApiError, getJson, postJson } from "@/lib/api";

export interface Cell {
  tag: string;
  tag_name: string;
  score: number | null;
  came_from: string | null;
  on_best_path: boolean;
}

export interface TrellisColumn {
  position: number;
  character: string;
  in_alphabet: boolean;
  cells: Cell[];
  tag: string;
}

export interface Tagging {
  key: string;
  label: string;
  text: string;
  corpus_label: string;
  smoothing: number;
  columns: TrellisColumn[];
  tags: string;
  words: string[];
  total_log_score: number;
  n_characters: number;
  n_unseen_characters: number;
  reader_reading: string[] | null;
  matches_reader: boolean;
  from_a_word_list: string[];
  list_matches_reader: boolean;
  from_a_greedy_scan: string[];
  words_in_the_corpus: string[];
  n_new_words: number;
}

export interface ScenariosView {
  scenarios: Tagging[];
}

export interface StartRow {
  tag: string;
  tag_name: string;
  count: number;
  total: number;
  admissible: boolean;
  probability: number | null;
  log_probability: number | null;
}

export interface StepRow {
  previous: string;
  following: string;
  count: number;
  total: number;
  admissible: boolean;
  probability: number | null;
  log_probability: number | null;
}

export interface CharacterRow {
  tag: string;
  character: string;
  count: number;
  total: number;
  probability: number;
  log_probability: number;
}

export interface Tables {
  key: string;
  label: string;
  sentences: string[][];
  n_sentences: number;
  n_words: number;
  alphabet: string[];
  n_alphabet: number;
  smoothing: number;
  n_slots: number;
  starts: StartRow[];
  steps: StepRow[];
  characters: CharacterRow[];
  floors: CharacterRow[];
  n_admissible_steps: number;
  n_forbidden_steps: number;
}

export interface TablesView {
  tables: Tables[];
}

export interface SetupView {
  corpus_sentences: string[][];
  corpus_words: string[];
  text: string;
  reader_reading: string[];
  from_a_greedy_scan: string[];
  from_a_word_list: string[];
  from_the_tagger: string[];
  n_new_words: number;
  sentence: string;
  spaceless_sentence: string;
  sentence_reading: string[];
  surname: string;
  name_sentence: string;
  name_reading: string[];
  name_from_a_word_list: string[];
  name_from_the_tagger: string[];
  name_from_both: string[];
}

export interface SmoothingStep {
  smoothing: number;
  words: string[];
  tags: string;
  reproduces_the_corpus: boolean;
  begin_after_begin_is_middle: number;
  probability_of_the_compound_start: number;
}

export interface SmoothingView {
  sentences: string[][];
  text: string;
  majority_reading: string[];
  minority_reading: string[];
  n_majority: number;
  n_minority: number;
  steps: SmoothingStep[];
  turns_between: number[];
}

export interface Quality {
  f_measure: number;
  precision: number;
  recall: number;
  recall_on_seen: number;
  recall_on_unseen: number;
}

export interface ScaleStep {
  n_sentences: number;
  n_known_words: number;
  share_unseen: number;
  tagger: Quality;
  word_list: Quality;
  together: Quality;
}

export interface ScaleCorpus {
  key: string;
  label: string;
  n_words: number;
  n_alphabet: number;
  tag_bits: number;
  bits_left: number;
  bits_told: number;
  n_test_sentences: number;
  steps: ScaleStep[];
  turns_between: number[];
  example_text: string;
  example_truth: string[];
  example_from_the_tagger: string[];
  example_from_a_word_list: string[];
  running_text: string | null;
  running_truth: string[] | null;
  running_from_the_tagger: string[] | null;
  running_from_a_word_list: string[] | null;
}

export interface ScaleView {
  corpora: ScaleCorpus[];
}

export interface TwinText {
  text: string;
  answer: string[];
  in_the_first_language: boolean;
  in_the_second_language: boolean;
}

export interface UnseenRun {
  n_characters: number;
  tags: string;
  n_words: number;
}

export interface LimitsView {
  first_sentences: string[][];
  second_sentences: string[][];
  n_numbers_compared: number;
  n_numbers_equal: number;
  twin_texts: TwinText[];
  unseen_runs: UnseenRun[];
  unseen_texts: string[];
  unseen_tags: string;
}

export interface SegmentView {
  tagging: Tagging;
  tables: Tables;
}

const BASE = "/concepts/segmenting-with-a-hidden-model";

let setupPromise: Promise<SetupView> | null = null;
let tablesPromise: Promise<TablesView> | null = null;
let scenariosPromise: Promise<ScenariosView> | null = null;
let smoothingPromise: Promise<SmoothingView> | null = null;
let scalePromise: Promise<ScaleView> | null = null;
let limitsPromise: Promise<LimitsView> | null = null;

// Several widgets read each of these and none of them takes an input, so each
// request is made once and shared.
export async function fetchSetup(): Promise<SetupView> {
  if (!setupPromise) {
    setupPromise = getJson<SetupView>(`${BASE}/setup`);
  }
  return setupPromise;
}

export async function fetchTables(): Promise<TablesView> {
  if (!tablesPromise) {
    tablesPromise = getJson<TablesView>(`${BASE}/tables`);
  }
  return tablesPromise;
}

export async function fetchScenarios(): Promise<ScenariosView> {
  if (!scenariosPromise) {
    scenariosPromise = getJson<ScenariosView>(`${BASE}/scenarios`);
  }
  return scenariosPromise;
}

export async function fetchSmoothing(): Promise<SmoothingView> {
  if (!smoothingPromise) {
    smoothingPromise = getJson<SmoothingView>(`${BASE}/smoothing`);
  }
  return smoothingPromise;
}

export async function fetchScale(): Promise<ScaleView> {
  if (!scalePromise) {
    scalePromise = getJson<ScaleView>(`${BASE}/scale`);
  }
  return scalePromise;
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
  smoothing: number,
): Promise<SegmentView> {
  return postJson<SegmentView>(`${BASE}/segment`, {
    text,
    corpus,
    smoothing,
  });
}

export const TAG_ORDER = ["B", "M", "E", "S"];

export function scenarioFor(view: ScenariosView, key: string): Tagging {
  return view.scenarios.find((item) => item.key === key) ?? view.scenarios[0];
}

export function tablesFor(view: TablesView, key: string): Tables {
  return view.tables.find((item) => item.key === key) ?? view.tables[0];
}

export function corpusFor(view: ScaleView, key: string): ScaleCorpus {
  return view.corpora.find((item) => item.key === key) ?? view.corpora[0];
}

export function stepBetween(
  tables: Tables,
  previous: string,
  following: string,
): StepRow | undefined {
  return tables.steps.find(
    (step) => step.previous === previous && step.following === following,
  );
}

// A smoothed share, written the way the page argues about it: the count with the
// smoothing added on top, over the total with one helping of it per outcome.
export function fraction(
  count: number,
  added: number,
  total: number,
  outcomes: number,
): string {
  const smoothing = Number.isInteger(added) ? `${added}` : `${added}`;
  return `(${count} + ${smoothing}) / (${total} + ${smoothing} × ${outcomes})`;
}

export function signed(value: number, places = 4): string {
  return value.toFixed(places);
}

export function percent(value: number, places = 1): string {
  return `${(value * 100).toFixed(places)}%`;
}

export function messageFor(error: unknown): string {
  return error instanceof ApiError ? error.message : "Something went wrong.";
}
