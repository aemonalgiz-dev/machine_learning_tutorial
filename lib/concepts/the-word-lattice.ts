// Client functions for the page about the word lattice and the best path through it.
//
// Five endpoints. The setup endpoint carries what the greedy rule of the
// previous page answered for this page's texts, so the repair can be shown as a
// change in a number. The scenarios endpoint carries every fixed text, each laid
// out as a lattice with every candidate and its span, ranked by whole-path score,
// with the greedy answers beside it. The scale endpoint walks the prefixes of one
// text and reports how the readings and the work grow along it. The growth
// endpoint adds a word the text does not contain and reports the cut moving. The
// segment endpoint is the playground and answers the same shape for whatever text
// and counts it is handed.
//
// The API computes all of it; these functions only carry it across.

import { ApiError, getJson, postJson } from "@/lib/api";

export interface Entry {
  word: string;
  frequency: number;
  log_score: number;
}

export interface Edge {
  word: string;
  start: number;
  end: number;
  length: number;
  frequency: number;
  log_score: number;
  on_best_path: boolean;
}

export interface Reading {
  words: string[];
  n_words: number;
  total_log_score: number;
  share_of_best: number;
  matches_reader: boolean;
}

export interface GreedyAnswer {
  scan: string;
  words: string[];
  n_words: number;
  n_lookups: number;
  matches_reader: boolean;
}

export interface Analysis {
  key: string;
  label: string;
  text: string;
  n_characters: number;
  word_list_label: string;
  n_words_in_list: number;
  total_frequency: number;
  longest_entry: number;
  entries: Entry[];
  edges: Edge[];
  n_edges: number;
  n_cuts: string;
  n_readings: string;
  n_lookups: number;
  readings: Reading[];
  best: Reading;
  runner_up: Reading | null;
  margin: number;
  greedy: GreedyAnswer[];
  reader_reading: string[] | null;
}

export interface ScenariosView {
  scenarios: Analysis[];
}

export interface SetupView {
  sentence: string;
  spaceless_sentence: string;
  n_spaceless_characters: number;
  n_words_with_spaces: number;
  n_english_words: number;
  longest_english_entry: number;
  park_sentence: string;
  park_greedy_left: string[];
  park_greedy_right: string[];
  park_best_path: string[];
  water_text: string;
  water_greedy_left: string[];
  water_best_path: string[];
  water_reader_reading: string[];
}

export interface ScaleStep {
  n_characters: number;
  n_cuts: string;
  n_readings: string;
  n_edges: number;
  n_lookups: number;
}

export interface ScaleView {
  text: string;
  word_list_label: string;
  steps: ScaleStep[];
}

export interface GrowthStep {
  added_frequency: number;
  total_frequency: number;
  best: string[];
  best_score: number;
  whole_score: number;
  split_score: number;
  whole_wins: boolean;
}

export interface ScalingStep {
  factor: number;
  total_frequency: number;
  best: string[];
  best_score: number;
}

export interface GrowthView {
  text: string;
  added_word: string;
  base_total: number;
  crossing_total: number;
  exact_threshold: number;
  steps: GrowthStep[];
  scalings: ScalingStep[];
}

export interface SegmentView {
  analysis: Analysis;
  words_in_list: Entry[];
  removed: string[];
  unrelated_frequency: number;
}

const BASE = "/concepts/the-word-lattice";

let setupPromise: Promise<SetupView> | null = null;
let scenariosPromise: Promise<ScenariosView> | null = null;
let scalePromise: Promise<ScaleView> | null = null;
let growthPromise: Promise<GrowthView> | null = null;

// Several widgets read each of these and none of them takes an input, so each
// request is made once and shared.
export async function fetchSetup(): Promise<SetupView> {
  if (!setupPromise) {
    setupPromise = getJson<SetupView>(`${BASE}/setup`);
  }
  return setupPromise;
}

export async function fetchScenarios(): Promise<ScenariosView> {
  if (!scenariosPromise) {
    scenariosPromise = getJson<ScenariosView>(`${BASE}/scenarios`);
  }
  return scenariosPromise;
}

export async function fetchScale(): Promise<ScaleView> {
  if (!scalePromise) {
    scalePromise = getJson<ScaleView>(`${BASE}/scale`);
  }
  return scalePromise;
}

export async function fetchGrowth(): Promise<GrowthView> {
  if (!growthPromise) {
    growthPromise = getJson<GrowthView>(`${BASE}/growth`);
  }
  return growthPromise;
}

export async function segment(
  text: string,
  wordList: string,
  removed: string[],
  unrelatedFrequency: number,
): Promise<SegmentView> {
  return postJson<SegmentView>(`${BASE}/segment`, {
    text,
    word_list: wordList,
    removed,
    unrelated_frequency: unrelatedFrequency,
  });
}

// The counts of cuts and of readings arrive as digits rather than as numbers,
// since a text of sixty characters has more cuts than a double holds exactly.
// This groups them in threes for reading.
export function grouped(digits: string): string {
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

export function scenarioFor(scenarios: ScenariosView, key: string): Analysis {
  const found = scenarios.scenarios.find((scenario) => scenario.key === key);
  return found ?? scenarios.scenarios[0];
}

export function signed(value: number, places = 4): string {
  return value.toFixed(places);
}

export function messageFor(error: unknown): string {
  return error instanceof ApiError ? error.message : "Something went wrong.";
}
