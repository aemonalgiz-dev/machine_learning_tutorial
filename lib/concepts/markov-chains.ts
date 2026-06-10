// Client functions for the Markov chains page.
//
// Every number here is computed by the API from the library's own chains,
// counted on the first two chapters of Alice's Adventures in Wonderland and
// read on the third. The four static endpoints take no input, so their promises
// are cached at module level and several widgets share one request; the fit
// endpoint is the playground and is called on every change.

import { ApiError, getJson, postJson } from "@/lib/api";

const BASE = "/concepts/markov-chains";

// The two states of Markov's alphabet, and the one state of the letter alphabet
// that is not a letter.
export const VOWEL = "V";
export const CONSONANT = "C";
export const SPACE = " ";

export interface ClassTable {
  counts: number[][];
  table: number[][];
  n_symbols: number;
  n_steps: number;
  stationary: number[];
  vowel_share: number;
}

export interface HandSentence {
  sentence: string;
  letters: string;
  classes: string;
  pairs: string[];
  tally: ClassTable;
}

export interface LikelihoodPoint {
  probability: number;
  log_likelihood: number;
}

export interface AfterRow {
  n_steps: number;
  vowel_from_vowel: number;
  vowel_from_consonant: number;
  distance_from_vowel: number;
  distance_from_consonant: number;
}

export interface GapRow {
  gap: number;
  chain_vowel_after_vowel: number;
  chain_vowel_after_consonant: number;
  text_vowel_after_vowel: number;
  text_vowel_after_consonant: number;
  held_back_vowel_after_vowel: number;
  written_chain_vowel_after_vowel: number;
  written_text_vowel_after_vowel: number;
}

export interface ChapterRow {
  chapter: string;
  n_symbols: number;
  vowel_after_vowel: number;
  vowel_after_consonant: number;
  stationary_vowel: number;
}

export interface VowelsView {
  states: string[];
  hand: HandSentence;
  counted: ClassTable;
  n_sentences: number;
  held_back_vowel_share: number;
  walk_vowel_share: number;
  walk_length: number;
  likelihood: LikelihoodPoint[];
  best_probability: number;
  best_log_likelihood: number;
  counted_log_probability: number;
  second_eigenvalue: number;
  after: AfterRow[];
  gaps: GapRow[];
  written_length: number;
  chapters: ChapterRow[];
}

export interface Follower {
  state: string;
  probability: number;
}

export interface FollowerRow {
  state: string;
  n_leaving: number;
  n_followers: number;
  top: Follower[];
}

export interface ShareRow {
  state: string;
  stationary: number;
  counted: number;
  held_back: number;
  walk: number;
}

export interface MixingRow {
  n_steps: number;
  worst_distance: number;
  worst_start: string;
}

export interface Sample {
  label: string;
  width: number;
  smoothing: number;
  text: string;
}

export interface CostRow {
  width: number;
  n_possible_states: number;
  n_states: number;
  n_cells: number;
  n_nonzero: number;
  share_nonzero: number;
  n_steps: number;
  steps_per_state: number;
  never_left: string[];
}

export interface LettersView {
  states: string[];
  counts: number[][];
  table: number[][];
  n_symbols: number;
  n_steps: number;
  n_cells: number;
  n_nonzero: number;
  followers: FollowerRow[];
  shares: ShareRow[];
  largest_gap_counted: number;
  largest_gap_held_back: number;
  largest_gap_walk: number;
  walk_length: number;
  mixing: MixingRow[];
  samples: Sample[];
  costs: CostRow[];
  stranded_sentences: string[];
}

export interface ScoreRow {
  width: number;
  smoothing: number;
  bits: number | null;
  n_impossible: number;
}

export interface AheadRow {
  n_steps: number;
  bits: number;
}

export interface MemoryView {
  letter_positions: number;
  letter_positions_set_aside: number;
  letter_rows: ScoreRow[];
  ahead_positions: number;
  ahead: AheadRow[];
  frequencies_bits: number;
  ahead_smoothing: number;
  class_positions: number;
  class_positions_set_aside: number;
  class_rows: ScoreRow[];
}

export type EdgeKind =
  | "settles"
  | "never_settles"
  | "several_groups"
  | "never_left";

export interface EdgeCase {
  title: string;
  words: string[];
  classes: string[];
  kind: EdgeKind;
  counts: number[][];
  table: number[][] | null;
  stationary: number[] | null;
  note: string;
  start: string;
  walk: number[] | null;
  long_run_share: number[] | null;
  smoothed_table: number[][];
  smoothed_stationary: number[];
}

export interface EdgesView {
  states: string[];
  smoothing: number;
  cases: EdgeCase[];
  stranded_width: number;
  stranded_states: string[];
  stranded_sentences: string[];
}

export type Alphabet = "vowels_and_consonants" | "letters";

export type Source =
  | "typed"
  | "counted_chapters"
  | "alice_run"
  | "written_by_the_chain";

export interface FitRequest {
  source: Source;
  text: string;
  alice_start: number;
  alphabet: Alphabet;
  smoothing: number;
  n_steps: number;
  random_seed: number;
}

export interface FitView {
  source: Source;
  alphabet: Alphabet;
  smoothing: number;
  shown: string;
  n_sequences: number;
  n_symbols: number;
  n_steps_counted: number;
  states: string[];
  counts: number[][];
  table: number[][] | null;
  table_note: string | null;
  never_left: string[];
  text_shares: number[];
  stationary: number[] | null;
  stationary_note: string | null;
  settles: boolean | null;
  n_steps: number;
  after: number[][] | null;
  distances: number[] | null;
  chain_two_step: number[][] | null;
  text_two_step: number[][] | null;
  two_step_gap: number | null;
  walk: string | null;
}

let vowelsPromise: Promise<VowelsView> | null = null;
let lettersPromise: Promise<LettersView> | null = null;
let memoryPromise: Promise<MemoryView> | null = null;
let edgesPromise: Promise<EdgesView> | null = null;

export function fetchVowels(): Promise<VowelsView> {
  vowelsPromise ??= getJson<VowelsView>(`${BASE}/vowels`);
  return vowelsPromise;
}

export function fetchLetters(): Promise<LettersView> {
  lettersPromise ??= getJson<LettersView>(`${BASE}/letters`);
  return lettersPromise;
}

export function fetchMemory(): Promise<MemoryView> {
  memoryPromise ??= getJson<MemoryView>(`${BASE}/memory`);
  return memoryPromise;
}

export function fetchEdges(): Promise<EdgesView> {
  edgesPromise ??= getJson<EdgesView>(`${BASE}/edges`);
  return edgesPromise;
}

export function countOneText(request: FitRequest): Promise<FitView> {
  return postJson<FitView>(`${BASE}/fit`, request);
}

// The one message a widget shows when a request could not be answered.
export function messageFor(error: unknown): string {
  return error instanceof ApiError ? error.message : "Something went wrong.";
}
