// Client functions for the page about finite-state morphology.
//
// Five endpoints. The machine endpoint carries the page's grammars written out
// state by state and line by line, with the size of the language each of them
// accepts. The scenarios endpoint carries the fixed words the page walks
// through, each with the search that read it, the state every character was
// read in, and every reading that reached the end. The cost endpoint carries
// the grammar's size against a learned vocabulary of the same size fitted on
// the grammar's own language. The ambiguity endpoint carries the words one
// grammar reads more than one way and how fast readings multiply. The coverage
// endpoint carries the share of two texts the grammar can read at all. The read
// endpoint is the playground, and answers the same shape for whatever word and
// whatever added lines it is handed.
//
// The API computes all of it; these functions only carry it across.

import { ApiError, getJson, postJson } from "@/lib/api";

const BASE = "/concepts/finite-state-morphology";

export interface Line {
  surface: string;
  label: string;
  meaning: string;
  goes_to: string;
  ends_the_word: boolean;
}

export interface State {
  name: string;
  lines: Line[];
  n_lines: number;
  is_start: boolean;
}

export interface Morph {
  text: string;
  start: number;
  end: number;
  label: string;
  meaning: string;
}

export interface AnalysisView {
  morphs: Morph[];
  tags: string;
  n_morphemes: number;
}

export interface TraceStep {
  depth: number;
  at: number;
  state: string;
  surface: string;
  label: string;
  goes_to: string;
  outcome: string;
  leads_anywhere: boolean;
}

export interface CharacterState {
  character: string;
  at: number;
  state: string;
  morph_index: number;
}

export interface WordView {
  word: string;
  grammar_label: string;
  is_readable: boolean;
  n_analyses: number;
  analyses: AnalysisView[];
  trace: TraceStep[];
  n_lines_tried: number;
  states_by_character: CharacterState[];
  cut: string[];
}

export interface GrammarView {
  key: string;
  label: string;
  n_states: number;
  n_written_lines: number;
  n_arcs: number;
  n_forms: number;
  n_paths: number;
  n_ambiguous_forms: number;
  mean_morphs: number;
  states: State[];
  sample_forms: string[];
}

export interface MachineView {
  grammars: GrammarView[];
}

export interface LearnedCut {
  word: string;
  learned: string[];
  written: string[];
  agree: boolean;
}

export interface Budget {
  n_pieces: number;
  mean_pieces: number;
  n_whole_words: number;
  cuts: LearnedCut[];
}

export interface CostView {
  n_written_lines: number;
  n_states: number;
  n_forms: number;
  n_paths: number;
  mean_morphs: number;
  max_morphs: number;
  budgets: Budget[];
}

export interface Growth {
  length: number;
  n_readings: number;
}

export interface AmbiguityView {
  n_forms: number;
  n_ambiguous_forms: number;
  share_ambiguous: number;
  most_read_words: WordView[];
  growth: Growth[];
}

export interface Reading {
  text: string;
  is_readable: boolean;
  cut: string[];
}

export interface CoverageOfText {
  text_label: string;
  grammar_label: string;
  n_written_lines: number;
  n_tokens: number;
  n_readable_tokens: number;
  token_share: number;
  n_types: number;
  n_readable_types: number;
  type_share: number;
  unreadable_types: string[];
}

export interface SplitterView {
  rule: string;
  pieces: Reading[];
  n_readable: number;
}

export interface CoverageView {
  sentence: string;
  splitters: SplitterView[];
  paragraph: string;
  coverages: CoverageOfText[];
  function_words: string[];
}

export interface ScenariosView {
  walked: WordView;
  walks: WordView;
  bakes: WordView;
  baked_before: WordView;
  baked_after: WordView;
  bakeed_before: WordView;
  bakeed_after: WordView;
  recovers: WordView;
  reopeners: WordView;
  unreadable: WordView[];
}

export type EntryKind =
  | "a verb"
  | "a verb ending in e"
  | "a noun"
  | "a prefix"
  | "a word with no parts";

export const ENTRY_KINDS: EntryKind[] = [
  "a verb",
  "a verb ending in e",
  "a noun",
  "a prefix",
  "a word with no parts",
];

export interface AddedLine {
  surface: string;
  kind: EntryKind;
}

export interface ReadView {
  view: WordView;
  n_written_lines: number;
  added_lines: Line[];
}

// Four of these are fixed and several widgets want the same one, so each is
// held in a module-level promise and fetched once per page load.
let machinePromise: Promise<MachineView> | null = null;
let scenariosPromise: Promise<ScenariosView> | null = null;
let costPromise: Promise<CostView> | null = null;
let ambiguityPromise: Promise<AmbiguityView> | null = null;
let coveragePromise: Promise<CoverageView> | null = null;

export async function fetchMachine(): Promise<MachineView> {
  if (!machinePromise) {
    machinePromise = getJson<MachineView>(`${BASE}/machine`);
  }
  return machinePromise;
}

export async function fetchScenarios(): Promise<ScenariosView> {
  if (!scenariosPromise) {
    scenariosPromise = getJson<ScenariosView>(`${BASE}/scenarios`);
  }
  return scenariosPromise;
}

export async function fetchCost(): Promise<CostView> {
  if (!costPromise) {
    costPromise = getJson<CostView>(`${BASE}/cost`);
  }
  return costPromise;
}

export async function fetchAmbiguity(): Promise<AmbiguityView> {
  if (!ambiguityPromise) {
    ambiguityPromise = getJson<AmbiguityView>(`${BASE}/ambiguity`);
  }
  return ambiguityPromise;
}

export async function fetchCoverage(): Promise<CoverageView> {
  if (!coveragePromise) {
    coveragePromise = getJson<CoverageView>(`${BASE}/coverage`);
  }
  return coveragePromise;
}

export async function readWord(
  word: string,
  grammar: string,
  added: AddedLine[],
): Promise<ReadView> {
  return postJson<ReadView>(`${BASE}/read`, { word, grammar, added });
}

export function grammarFor(machine: MachineView, key: string): GrammarView {
  const found = machine.grammars.find((grammar) => grammar.key === key);
  return found ?? machine.grammars[0];
}

export function asPercentage(share: number): string {
  return `${(share * 100).toFixed(1)}%`;
}

export function messageFor(error: unknown): string {
  return error instanceof ApiError ? error.message : "Something went wrong.";
}
