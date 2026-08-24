// Client functions for the page about maximum matching, the greedy longest match.
//
// Four endpoints. The setup endpoint carries the opening arithmetic, which is
// the running sentence with its spaces taken out, how many ways that many
// characters could be cut, and what each of the five word-finding rules from
// earlier in the section answers for a text with nothing between its words. The
// scenarios endpoint carries the five fixed texts the page works through, each
// scanned from the left, from the right, and both ways, with the walk that
// produced each answer and the fewest pieces any reading of that text could have
// used. The misses endpoint takes one word out of a list and reports the answers
// either side of taking it. The segment endpoint is the playground, and answers
// the same shape for whatever text and word list it is handed.
//
// The API computes all of it; these functions only carry it across.

import { ApiError, getJson, postJson } from "@/lib/api";

export type Scan = "left to right" | "right to left" | "both";

export const SCANS: Scan[] = ["left to right", "right to left", "both"];

export interface Piece {
  text: string;
  start: number;
  end: number;
  is_entry: boolean;
}

export interface Attempt {
  text: string;
  is_entry: boolean;
}

export interface WalkStep {
  at: number;
  attempts: Attempt[];
  taken: string;
  taken_is_entry: boolean;
}

export interface Reading {
  scan: Scan;
  pieces: Piece[];
  n_pieces: number;
  n_single_characters: number;
  n_entries: number;
  n_lookups: number;
  walk: WalkStep[] | null;
  chosen_scan: Scan | null;
  decided_by: string | null;
}

export interface Shortest {
  n_pieces: number;
  n_readings: string;
  readings: string[][];
}

export interface Analysis {
  text: string;
  n_characters: number;
  n_cuts: string;
  word_list_label: string;
  n_words_in_list: number;
  longest_entry: number;
  readings: Reading[];
  shortest: Shortest;
  greedy_reaches_shortest: boolean;
}

export interface RuleOnText {
  rule: string;
  n_pieces: number;
  pieces: string[];
}

export interface SetupView {
  sentence: string;
  n_sentence_characters: number;
  n_spaces: number;
  n_words_with_spaces: number;
  spaceless_sentence: string;
  n_spaceless_characters: number;
  n_cuts: string;
  earlier_rules_on_the_spaceless_sentence: RuleOnText[];
  earlier_rules_on_the_park_sentence: RuleOnText[];
  park_sentence: string;
  n_park_characters: number;
  n_park_cuts: string;
  n_words_a_reader_finds_in_the_park_sentence: number;
  n_english_words: number;
}

export interface ScenarioView {
  key: string;
  label: string;
  script: string;
  analysis: Analysis;
  words_in_list: string[];
  reader_reading: string[] | null;
  reader_reading_is_all_entries: boolean | null;
}

export interface ScenariosView {
  scenarios: ScenarioView[];
}

export interface MissView {
  label: string;
  text: string;
  removed: string;
  with_the_word: Reading[];
  without_the_word: Reading[];
  reader_reading: string[];
}

export interface MissesView {
  misses: MissView[];
}

export interface SegmentView {
  analysis: Analysis;
  words_in_list: string[];
  removed: string[];
}

const BASE = "/concepts/maximum-matching";

let setupPromise: Promise<SetupView> | null = null;
let scenariosPromise: Promise<ScenariosView> | null = null;
let missesPromise: Promise<MissesView> | null = null;

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

export async function fetchMisses(): Promise<MissesView> {
  if (!missesPromise) {
    missesPromise = getJson<MissesView>(`${BASE}/misses`);
  }
  return missesPromise;
}

export async function segment(
  text: string,
  wordList: string,
  removed: string[],
): Promise<SegmentView> {
  return postJson<SegmentView>(`${BASE}/segment`, {
    text,
    word_list: wordList,
    removed,
  });
}

// The count of possible cuts arrives as digits rather than as a number, since a
// text of sixty characters has more readings than a double can hold exactly.
// This groups them in threes for reading.
export function grouped(digits: string): string {
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

export function readingFor(analysis: Analysis, scan: Scan): Reading {
  const found = analysis.readings.find((reading) => reading.scan === scan);
  return found ?? analysis.readings[0];
}

export function scenarioFor(
  scenarios: ScenariosView,
  key: string,
): ScenarioView {
  const found = scenarios.scenarios.find((scenario) => scenario.key === key);
  return found ?? scenarios.scenarios[0];
}

export function messageFor(error: unknown): string {
  return error instanceof ApiError ? error.message : "Something went wrong.";
}
