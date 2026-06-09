// Client functions for the page about the Moses word rules.
//
// Five endpoints. The split endpoint reads whatever text it is given by the
// Moses rules at whichever of the three settings the caller asked for, and by
// the Penn Treebank rules, splitting on spaces and the written-out table of
// exceptions beside it, reporting for each rule every piece with the span it
// claims, the slice of source that span covers, what the piece becomes once
// every rewriting is undone, and whether the pieces join back to everything in
// the text that is not spacing. The full stops endpoint puts ten stops whose
// answer can be stated to all three rules and scores them, with three more that
// have no answer kept apart. The list endpoint reports the named list, how much
// of it eighteen sentences reach, and what a table entry is allowed to say. The
// reversibility endpoint carries the round trip and the pair of texts one rule
// cannot tell apart. The corpus endpoint counts both corpora under all four
// rules.

import { getJson, postJson } from "@/lib/api";

export interface Piece {
  text: string;
  start: number;
  end: number;
  source: string;
  is_rewritten: boolean;
  undone: string;
}

export interface RuleView {
  pieces: Piece[];
  n_pieces: number;
  n_characters_in_pieces: number;
  share_covered: number;
  glued: string;
  glue_is_exact: boolean;
  n_rewritten: number;
  pieces_join_to_the_source: boolean;
  undoing_recovers_the_source: boolean;
}

export interface SplitView {
  source: string;
  n_characters: number;
  n_non_space_characters: number;
  on_these_rules: RuleView;
  on_annotation_rules: RuleView;
  on_spaces: RuleView;
  on_the_table: RuleView;
}

export interface SplitResult {
  texts: SplitView[];
}

export interface Settings {
  language: "en" | "fr" | "it";
  mark_hyphens: boolean;
  rewrite_marks: boolean;
}

export async function readTexts(
  texts: string[],
  settings: Settings,
): Promise<SplitResult> {
  return postJson<SplitResult>("/concepts/moses-rules/split", {
    texts,
    ...settings,
  });
}

export interface StopProbe {
  label: string;
  text: string;
  word: string;
  belongs_to_the_word: boolean;
  on_these_rules: string[];
  on_annotation_rules: string[];
  on_the_table: string[];
  kept_here: boolean;
  kept_by_annotation: boolean;
  kept_by_the_table: boolean;
  right_here: boolean;
  right_by_annotation: boolean;
  right_by_the_table: boolean;
  look_at: string;
}

export interface Scoreboard {
  n_cases: number;
  n_wanting_kept: number;
  n_right_here: number;
  n_right_by_annotation: number;
  n_right_by_the_table: number;
  n_answers_here: number;
  n_answers_by_annotation: number;
  n_answers_by_the_table: number;
}

export interface FullStopsView {
  probes: StopProbe[];
  undecidable: StopProbe[];
  scoreboard: Scoreboard;
}

let fullStopsPromise: Promise<FullStopsView> | null = null;

// None of these three requests takes an input, so each is made once and shared
// by whichever widgets on the page want it.
export async function fetchFullStops(): Promise<FullStopsView> {
  if (!fullStopsPromise) {
    fullStopsPromise = getJson<FullStopsView>("/concepts/moses-rules/full-stops");
  }
  return fullStopsPromise;
}

export interface ClauseTally {
  clause: string;
  n_kept: number;
  examples: string[];
}

export interface ListCoverage {
  n_entries: number;
  n_named_entries: number;
  n_single_letter_entries: number;
  n_figure_only_entries: number;
  n_texts: number;
  n_words_ending_in_one_stop: number;
  reached: string[];
  n_reached: number;
  n_never_reached: number;
  share_reached: number;
  kept_whole: string[];
  lost_the_stop: string[];
  texts_ending_in_an_abbreviation: string[];
  n_texts_ending_in_an_abbreviation: number;
  by_clause: ClauseTally[];
  n_kept_in_all: number;
}

export interface ProposedEntry {
  word: string;
  pieces: string[];
  accepted: boolean;
  verdict: string;
}

export interface ListView {
  coverage: ListCoverage;
  named_entries: string[];
  figure_only_entries: string[];
  n_table_entries: number;
  n_table_entries_kept_whole: number;
  n_table_entries_cut: number;
  n_table_entries_reached: number;
  table_entries_reached: string[];
  proposals: ProposedEntry[];
  minutes: string[];
}

let listPromise: Promise<ListView> | null = null;

export async function fetchList(): Promise<ListView> {
  if (!listPromise) {
    listPromise = getJson<ListView>("/concepts/moses-rules/the-list");
  }
  return listPromise;
}

export interface AmbiguityPair {
  first: string;
  second: string;
  first_on_these_rules: string[];
  second_on_these_rules: string[];
  first_on_annotation_rules: string[];
  second_on_annotation_rules: string[];
  told_apart_here: boolean;
  told_apart_by_annotation: boolean;
}

export interface ReversibilityView {
  quoted: SplitView;
  quoted_with_marks_rewritten: SplitView;
  running_with_hyphens_marked: SplitView;
  ambiguity: AmbiguityPair;
  n_texts: number;
  n_joining_here: number;
  n_joining_by_annotation: number;
  n_glue_exact_here: number;
  n_glue_exact_on_spaces: number;
}

let reversibilityPromise: Promise<ReversibilityView> | null = null;

export async function fetchReversibility(): Promise<ReversibilityView> {
  if (!reversibilityPromise) {
    reversibilityPromise = getJson<ReversibilityView>(
      "/concepts/moses-rules/reversibility",
    );
  }
  return reversibilityPromise;
}

export interface CorpusReading {
  n_pieces: number;
  n_distinct: number;
  n_characters_covered: number;
  share_covered: number;
}

export interface ScatteredStem {
  stem: string;
  spellings: string[];
}

export interface CorpusView {
  n_texts: number;
  n_characters: number;
  n_non_space_characters: number;
  on_these_rules: CorpusReading;
  on_annotation_rules: CorpusReading;
  on_spaces: CorpusReading;
  on_the_table: CorpusReading;
  only_on_these_rules: string[];
  only_on_annotation_rules: string[];
  scattered: ScatteredStem[];
  n_pieces_with_hyphens_marked: number;
  n_pieces_without_letter_or_digit: number;
}

export interface CorpusResult {
  notebook: CorpusView;
  notebook_texts: string[];
  minutes: CorpusView;
  minutes_texts: string[];
  running: SplitView;
}

let corpusPromise: Promise<CorpusResult> | null = null;

export async function fetchCorpus(): Promise<CorpusResult> {
  if (!corpusPromise) {
    corpusPromise = getJson<CorpusResult>("/concepts/moses-rules/corpus");
  }
  return corpusPromise;
}
