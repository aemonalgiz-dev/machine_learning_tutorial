// Client functions for the page about splitting text on spaces.
//
// Three endpoints. The split endpoint cuts whatever texts it is given and
// reports, for each, the pieces with the span each was cut from, how much of the
// text ended up inside a piece, what lay in the gaps, and what comes back when
// the pieces are glued with single spaces against what comes back when the spans
// are used instead. The survey endpoint puts ten characters between two letters
// to find which of them end a word, and puts seven short texts to the rule to
// show what it leaves alone. The cost endpoint reads the same six sentences
// under this rule and under the Unicode word boundary rule so the two can be
// compared on identical writing.

import { getJson, postJson } from "@/lib/api";

export interface Piece {
  text: string;
  start: number;
  end: number;
}

export interface SplitView {
  source: string;
  n_characters: number;
  pieces: Piece[];
  n_pieces: number;
  n_characters_in_pieces: number;
  share_covered: number;
  gaps: string[];
  glued: string;
  glue_is_exact: boolean;
  rebuilt: string;
  rebuild_is_exact: boolean;
}

export interface SplitResult {
  texts: SplitView[];
}

export async function splitTexts(texts: string[]): Promise<SplitResult> {
  return postJson<SplitResult>("/concepts/splitting-on-spaces/split", { texts });
}

export interface SeparatorProbe {
  name: string;
  code_point: string;
  n_pieces: number;
  ends_a_word: boolean;
}

export interface BreakageProbe {
  label: string;
  text: string;
  n_pieces: number;
  pieces: string[];
  look_at: string;
}

export interface SurveyView {
  separators: SeparatorProbe[];
  n_separators_that_end_a_word: number;
  breakages: BreakageProbe[];
}

let surveyPromise: Promise<SurveyView> | null = null;

// Two widgets read the survey and it takes no input, so the request is made once
// and shared between them.
export async function fetchSurvey(): Promise<SurveyView> {
  if (!surveyPromise) {
    surveyPromise = getJson<SurveyView>("/concepts/splitting-on-spaces/survey");
  }
  return surveyPromise;
}

export interface RuleCost {
  n_distinct: number;
  n_pieces: number;
  running_pieces: string[];
  running_covered: number;
  running_glued: string;
  running_glue_is_exact: boolean;
}

export interface CostView {
  corpus: string[];
  n_characters: number;
  on_spaces: RuleCost;
  on_word_boundaries: RuleCost;
  n_shared_entries: number;
  only_on_spaces: string[];
  only_on_word_boundaries: string[];
  n_entries_with_edge_punctuation: number;
  entries_ending_in_a_full_stop: string[];
  n_distinct_after_stripping: number;
  duplicated_entries: string[];
}

let costPromise: Promise<CostView> | null = null;

export async function fetchCost(): Promise<CostView> {
  if (!costPromise) {
    costPromise = getJson<CostView>("/concepts/splitting-on-spaces/cost");
  }
  return costPromise;
}
