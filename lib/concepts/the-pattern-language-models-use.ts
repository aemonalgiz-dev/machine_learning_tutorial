// Client functions for the page about the pattern language models pre-tokenize with.
//
// Five endpoints. The split endpoint reads whatever text it is given by
// whichever of seven patterns the caller names, reporting every piece with the
// span it claims, whether that piece carries a leading space, which of the
// twelve branches produced it, and whether the pieces concatenate back to the
// whole text including its spacing, with the four earlier rules of the sibling
// pages beside it. The branches endpoint reads the twelve branches one at a
// time and reports how many pieces of the six-sentence notebook each claimed.
// The contractions endpoint puts twelve texts to the seven listed spellings and
// shows the two changes the later patterns made. The corpus endpoint counts the
// notebook under five rules and reports what attaching the space costs in rows.
// The dialect endpoint compares the published character classes against the
// ones that can be written here.

import { getJson, postJson } from "@/lib/api";

export type PatternKey =
  | "the-pattern"
  | "without-the-contractions"
  | "without-the-optional-space"
  | "without-the-held-back-space"
  | "words-and-marks"
  | "runs-with-no-spaces"
  | "letters-only";

export interface Piece {
  text: string;
  start: number;
  end: number;
  has_a_leading_space: boolean;
  branch: number | null;
}

export interface Reading {
  label: string;
  pieces: string[];
  n_pieces: number;
  n_characters_in_pieces: number;
  joins_back_exactly: boolean;
  joins_back_with_one_space: boolean;
}

export interface PatternReading {
  source: string;
  n_characters: number;
  n_non_space_characters: number;
  pattern_key: string;
  pattern_source: string;
  pattern_label: string;
  pattern_note: string;
  pieces: Piece[];
  n_pieces: number;
  n_with_a_leading_space: number;
  n_characters_in_pieces: number;
  joins_back_exactly: boolean;
  joins_back_with_one_space: boolean;
  on_spaces: Reading;
  on_boundaries: Reading;
  on_annotation_rules: Reading;
  on_translation_rules: Reading;
}

export interface SplitResult {
  texts: PatternReading[];
}

export async function readTexts(
  texts: string[],
  pattern: PatternKey,
): Promise<SplitResult> {
  return postJson<SplitResult>(
    "/concepts/the-pattern-language-models-use/split",
    { texts, pattern },
  );
}

export interface BranchView {
  position: number;
  source: string;
  reads: string;
  family: string;
  n_claimed: number;
  share_claimed: number;
  examples: string[];
}

export interface HeldSpaceView {
  text: string;
  with_the_branch: string[];
  without_the_branch: string[];
  n_with: number;
  n_without: number;
}

export interface RefusedPattern {
  source: string;
  reason: string;
}

export interface RandomTexts {
  n_texts: number;
  n_joining_back: number;
  n_codepoints_drawn_from: number;
  longest_text: number;
}

export interface BranchesView {
  pattern_source: string;
  branches: BranchView[];
  n_branches: number;
  n_branches_used: number;
  n_pieces: number;
  n_texts: number;
  running: PatternReading;
  held_space: HeldSpaceView;
  random_texts: RandomTexts;
  refusals: RefusedPattern[];
}

// None of these four requests takes an input, so each is made once and shared
// by whichever widgets on the page want it.
let branchesPromise: Promise<BranchesView> | null = null;

export async function fetchBranches(): Promise<BranchesView> {
  if (!branchesPromise) {
    branchesPromise = getJson<BranchesView>(
      "/concepts/the-pattern-language-models-use/branches",
    );
  }
  return branchesPromise;
}

export interface ContractionProbe {
  text: string;
  pieces: string[];
  on_annotation_rules: string[];
  on_the_later_pattern: string[];
  n_pieces: number;
  a_contraction_branch_fired: boolean;
  look_at: string;
}

export interface LaterChange {
  change: string;
  was: string;
  became: string;
  text: string;
  before: string[];
  after: string[];
}

export interface ContractionsView {
  clitics: string[];
  n_clitics: number;
  probes: ContractionProbe[];
  n_probes: number;
  n_firing: number;
  later_changes: LaterChange[];
}

let contractionsPromise: Promise<ContractionsView> | null = null;

export async function fetchContractions(): Promise<ContractionsView> {
  if (!contractionsPromise) {
    contractionsPromise = getJson<ContractionsView>(
      "/concepts/the-pattern-language-models-use/contractions",
    );
  }
  return contractionsPromise;
}

export interface CorpusReading {
  label: string;
  n_pieces: number;
  n_distinct: number;
  n_characters_in_pieces: number;
  share_of_characters: number;
  n_joining_back_exactly: number;
  n_joining_back_with_one_space: number;
}

export interface DoubledRow {
  word: string;
  n_with_the_space: number;
  n_without_the_space: number;
}

export interface TellApartPair {
  first: string;
  second: string;
  first_here: string[];
  second_here: string[];
  told_apart_here: boolean;
  told_apart_on_spaces: boolean;
  told_apart_on_boundaries: boolean;
  told_apart_on_annotation_rules: boolean;
  told_apart_on_translation_rules: boolean;
}

export interface CorpusView {
  n_texts: number;
  n_characters: number;
  n_non_space_characters: number;
  readings: CorpusReading[];
  without_the_optional_space: CorpusReading;
  n_distinct_with_a_leading_space: number;
  n_distinct: number;
  doubled: DoubledRow[];
  told_apart: TellApartPair[];
  scriptless_text: string;
  scriptless_pieces: string[];
  scriptless_on_boundaries: string[];
  notebook: string[];
  running: PatternReading;
}

let corpusPromise: Promise<CorpusView> | null = null;

export async function fetchCorpus(): Promise<CorpusView> {
  if (!corpusPromise) {
    corpusPromise = getJson<CorpusView>(
      "/concepts/the-pattern-language-models-use/corpus",
    );
  }
  return corpusPromise;
}

export interface DialectProbe {
  text: string;
  as_published: string[];
  here: string[];
  agree: boolean;
  look_at: string;
}

export interface ClassCounts {
  n_number_codepoints: number;
  n_read_as_digits_here: number;
  n_read_as_letters_here: number;
  n_letter_codepoints: number;
  n_letters_agreeing: number;
  examples: string[];
}

export interface AdjacencyRow {
  context: string;
  shape: string;
  n_differing: number;
  n_characters: number;
}

export interface UnderscoreView {
  text: string;
  with_the_repair: string[];
  without_the_repair: string[];
  joins_back_with_the_repair: boolean;
  joins_back_without_the_repair: boolean;
  n_characters_lost: number;
}

export interface DialectView {
  published_letters: string;
  published_numbers: string;
  letters_here: string;
  numbers_here: string;
  marks_here: string;
  probes: DialectProbe[];
  n_probes: number;
  n_agreeing: number;
  counts: ClassCounts;
  adjacency: AdjacencyRow[];
  underscore: UnderscoreView;
  n_notebook_texts_differing: number;
}

let dialectPromise: Promise<DialectView> | null = null;

export async function fetchDialect(): Promise<DialectView> {
  if (!dialectPromise) {
    dialectPromise = getJson<DialectView>(
      "/concepts/the-pattern-language-models-use/dialect",
    );
  }
  return dialectPromise;
}
