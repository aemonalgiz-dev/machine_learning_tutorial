// Client functions for the page about reading a text as bytes or as characters.
//
// Every number here is computed by the API. The readings endpoint puts one text
// to all three readings the page compares and reads the numbers straight back
// again; the scripts endpoint measures one sentence written in twelve
// languages; the growth endpoint lets those twelve arrive one at a time beside a
// byte table that cannot grow; and the byte-runs endpoint measures how narrow
// validity is for a run of byte numbers.

import { getJson, postJson } from "@/lib/api";

export type Reading = "bytes" | "characters" | "learned";

export interface PieceView {
  text: string;
  token_id: number;
  known: boolean;
}

export interface ReadingView {
  reading: Reading;
  label: string;
  table_size: number;
  n_tokens: number;
  n_unseen: number;
  pieces: PieceView[];
  ids: number[];
  decoded: string;
  exact: boolean;
}

export interface TextReadings {
  source: string;
  n_characters: number;
  n_bytes: number;
  readings: ReadingView[];
}

export interface ReadingsView {
  corpus: string[];
  byte_table: number;
  character_table: number;
  learned_table: number;
  n_distinct_characters: number;
  n_merges: number;
  texts: TextReadings[];
}

export async function readTexts(texts: string[]): Promise<ReadingsView> {
  return postJson<ReadingsView>("/concepts/bytes-and-characters/readings", {
    texts,
  });
}

// Two widgets put the same three texts to the same three readings, so the
// request is made once and shared between them.
let threeTextsPromise: Promise<ReadingsView> | null = null;

export async function fetchThreeTexts(texts: string[]): Promise<ReadingsView> {
  if (!threeTextsPromise) {
    threeTextsPromise = readTexts(texts);
  }
  return threeTextsPromise;
}

export function readingOf(
  text: TextReadings,
  reading: Reading,
): ReadingView | undefined {
  return text.readings.find((entry) => entry.reading === reading);
}

export interface ScriptRow {
  language: string;
  text: string;
  n_characters: number;
  n_bytes: number;
  bytes_per_character: number;
  byte_exact: boolean;
  character_tokens: number;
  character_unseen: number;
  learned_tokens: number;
  learned_unseen: number;
}

export interface ScriptsView {
  rows: ScriptRow[];
  byte_table: number;
  character_table: number;
  learned_table: number;
}

let scriptsPromise: Promise<ScriptsView> | null = null;

export async function fetchScripts(): Promise<ScriptsView> {
  if (!scriptsPromise) {
    scriptsPromise = getJson<ScriptsView>("/concepts/bytes-and-characters/scripts");
  }
  return scriptsPromise;
}

export interface GrowthStep {
  label: string;
  n_texts: number;
  character_table: number;
  byte_table: number;
  byte_values_used: number;
}

export interface GrowthView {
  steps: GrowthStep[];
}

let growthPromise: Promise<GrowthView> | null = null;

export async function fetchAlphabetGrowth(): Promise<GrowthView> {
  if (!growthPromise) {
    growthPromise = getJson<GrowthView>(
      "/concepts/bytes-and-characters/alphabet-growth",
    );
  }
  return growthPromise;
}

export interface PrefixStep {
  n_ids: number;
  decoded: string;
  is_text: boolean;
}

export interface RunView {
  language: string;
  text: string;
  n_ids: number;
  n_broken: number;
  prefixes: PrefixStep[];
}

export interface RandomRun {
  length: number;
  n_text: number;
  n_trials: number;
}

export interface ByteRunsView {
  single_ids_that_are_text: number;
  single_ids_that_are_not: number;
  table_size: number;
  accented_ids: number[];
  accented_whole: string;
  accented_first_alone: string;
  accented_second_alone: string;
  random_runs: RandomRun[];
  runs: RunView[];
}

let byteRunsPromise: Promise<ByteRunsView> | null = null;

export async function fetchByteRuns(): Promise<ByteRunsView> {
  if (!byteRunsPromise) {
    byteRunsPromise = getJson<ByteRunsView>(
      "/concepts/bytes-and-characters/byte-runs",
    );
  }
  return byteRunsPromise;
}
