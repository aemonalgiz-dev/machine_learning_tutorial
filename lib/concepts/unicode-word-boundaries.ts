// Client functions for the page about the Unicode word boundary rules.
//
// Four endpoints. The split endpoint reads whatever texts it is given by the
// boundary rules and by splitting on spaces at the same time, and reports, for
// each, the class every character was given and whether a word ended before it,
// every segment between two boundaries and whether it counts as a word, and for
// each of the two rules the words with their spans, how much of the text ended
// up inside a word, and what comes back when the words are glued with single
// spaces. The classes endpoint counts how often each class turns up over six
// sentences and puts twelve marks between two letters and then between two
// digits. The scripts endpoint reads nine short texts by both rules, chosen so
// the two disagree in both directions. The cost endpoint reads the same six
// sentences by both rules so the tables they would need can be compared.

import { getJson, postJson } from "@/lib/api";

export interface Piece {
  text: string;
  start: number;
  end: number;
}

export interface Segment {
  text: string;
  start: number;
  end: number;
  is_word: boolean;
}

export interface CharacterClass {
  character: string;
  code_point: string;
  description: string;
  breaks_before: boolean;
}

export interface RuleView {
  pieces: Piece[];
  n_pieces: number;
  n_characters_in_pieces: number;
  share_covered: number;
  glued: string;
  glue_is_exact: boolean;
}

export interface SplitView {
  source: string;
  n_characters: number;
  characters: CharacterClass[];
  segments: Segment[];
  n_segments: number;
  segments_tile_the_text: boolean;
  on_boundaries: RuleView;
  on_spaces: RuleView;
  keeping_punctuation: string[];
  n_keeping_punctuation: number;
}

export interface SplitResult {
  texts: SplitView[];
}

export async function readTexts(texts: string[]): Promise<SplitResult> {
  return postJson<SplitResult>("/concepts/unicode-word-boundaries/split", {
    texts,
  });
}

export interface MarkProbe {
  name: string;
  code_point: string;
  description: string;
  between_letters: string[];
  joins_letters: boolean;
  between_digits: string[];
  joins_digits: boolean;
}

export interface ClassCount {
  description: string;
  count: number;
}

export interface ClassesView {
  n_classes: number;
  n_classes_used: number;
  census: ClassCount[];
  n_characters: number;
  marks: MarkProbe[];
  n_marks_joining_letters: number;
  n_marks_joining_digits: number;
  n_marks_disagreeing: number;
}

let classesPromise: Promise<ClassesView> | null = null;

// The classes request takes no input, so it is made once and shared by whichever
// widgets on the page want it.
export async function fetchClasses(): Promise<ClassesView> {
  if (!classesPromise) {
    classesPromise = getJson<ClassesView>(
      "/concepts/unicode-word-boundaries/classes",
    );
  }
  return classesPromise;
}

export interface ScriptProbe {
  label: string;
  text: string;
  n_characters: number;
  boundary_pieces: string[];
  n_boundary_pieces: number;
  boundary_covered: number;
  space_pieces: string[];
  n_space_pieces: number;
  space_covered: number;
  look_at: string;
}

export interface ScriptsView {
  probes: ScriptProbe[];
}

let scriptsPromise: Promise<ScriptsView> | null = null;

export async function fetchScripts(): Promise<ScriptsView> {
  if (!scriptsPromise) {
    scriptsPromise = getJson<ScriptsView>(
      "/concepts/unicode-word-boundaries/scripts",
    );
  }
  return scriptsPromise;
}

export interface CorpusCost {
  n_distinct: number;
  n_pieces: number;
  n_characters_covered: number;
  share_covered: number;
  running_pieces: string[];
  running_covered: number;
  running_glued: string;
  running_glue_is_exact: boolean;
}

export interface CostView {
  corpus: string[];
  n_characters: number;
  on_boundaries: CorpusCost;
  on_spaces: CorpusCost;
  n_shared_entries: number;
  only_on_boundaries: string[];
  only_on_spaces: string[];
  n_segments: number;
  n_pieces_keeping_punctuation: number;
  n_distinct_keeping_punctuation: number;
}

let costPromise: Promise<CostView> | null = null;

export async function fetchCost(): Promise<CostView> {
  if (!costPromise) {
    costPromise = getJson<CostView>("/concepts/unicode-word-boundaries/cost");
  }
  return costPromise;
}
