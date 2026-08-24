// Client functions for the page about the Penn Treebank word rules.
//
// Four endpoints. The split endpoint reads whatever texts it is given by the
// treebank rules, by the same rules with the bracket spellings switched on, by
// splitting on spaces and by the Unicode boundary rules all at once, and
// reports, for each, every piece with the span it claims, the slice of source
// that span actually covers, whether the two differ, how much of the text ended
// up inside a piece, and what the two ways back give. The contractions endpoint
// puts fifteen short forms to the rules, nine of which they cut and six of
// which they never see. The full stops endpoint probes the final-period rule
// and then counts the six sentences arriving one at a time against the same six
// arriving joined. The corpus endpoint reads both corpora by all three rules and
// counts how many pieces no longer hold the text their span names.

import { getJson, postJson } from "@/lib/api";

export interface Piece {
  text: string;
  start: number;
  end: number;
  source: string;
  is_rewritten: boolean;
}

export interface RuleView {
  pieces: Piece[];
  n_pieces: number;
  n_characters_in_pieces: number;
  share_covered: number;
  glued: string;
  glue_is_exact: boolean;
  n_rewritten: number;
  spans_recover_the_source: boolean;
}

export interface SplitView {
  source: string;
  n_characters: number;
  n_non_space_characters: number;
  on_treebank: RuleView;
  on_treebank_naming_brackets: RuleView;
  on_spaces: RuleView;
  on_boundaries: RuleView;
}

export interface SplitResult {
  texts: SplitView[];
}

export async function readTexts(texts: string[]): Promise<SplitResult> {
  return postJson<SplitResult>("/concepts/penn-treebank-rules/split", { texts });
}

export interface ContractionProbe {
  label: string;
  text: string;
  pieces: Piece[];
  n_pieces: number;
  is_cut: boolean;
  n_rewritten: number;
  look_at: string;
}

export interface ContractionsView {
  probes: ContractionProbe[];
  n_probes: number;
  n_cut: number;
  n_left_whole: number;
  n_fixed_forms: number;
  n_clitic_endings: number;
}

let contractionsPromise: Promise<ContractionsView> | null = null;

// The contraction request takes no input, so it is made once and shared by
// whichever widgets on the page want it.
export async function fetchContractions(): Promise<ContractionsView> {
  if (!contractionsPromise) {
    contractionsPromise = getJson<ContractionsView>(
      "/concepts/penn-treebank-rules/contractions",
    );
  }
  return contractionsPromise;
}

export interface FullStopProbe {
  label: string;
  text: string;
  pieces: Piece[];
  n_pieces: number;
  attached_stops: string[];
  has_own_stop_piece: boolean;
  look_at: string;
}

export interface SentenceCountView {
  separately: number;
  together: number;
  attached_stops_separately: string[];
  attached_stops_together: string[];
  stop_pieces_separately: number;
  stop_pieces_together: number;
}

export interface FullStopsView {
  probes: FullStopProbe[];
  sentences: SentenceCountView;
}

let fullStopsPromise: Promise<FullStopsView> | null = null;

export async function fetchFullStops(): Promise<FullStopsView> {
  if (!fullStopsPromise) {
    fullStopsPromise = getJson<FullStopsView>(
      "/concepts/penn-treebank-rules/full-stops",
    );
  }
  return fullStopsPromise;
}

export interface CorpusReading {
  n_pieces: number;
  n_distinct: number;
  n_characters_covered: number;
  share_covered: number;
}

export interface CorpusView {
  n_texts: number;
  n_characters: number;
  n_non_space_characters: number;
  on_treebank: CorpusReading;
  on_spaces: CorpusReading;
  on_boundaries: CorpusReading;
  only_on_treebank_against_spaces: string[];
  only_on_spaces: string[];
  shared_with_spaces: number;
  only_on_treebank_against_boundaries: string[];
  only_on_boundaries: string[];
  shared_with_boundaries: number;
}

export interface RewritingCensus {
  n_pieces: number;
  n_rewritten: number;
  share_rewritten: number;
  by_piece: string[];
  n_rewritten_naming_brackets: number;
  n_pieces_without_letter_or_digit: number;
  n_pieces_from_a_cut_host: number;
}

export interface CorpusResult {
  notebook: CorpusView;
  notebook_texts: string[];
  annotated: CorpusView;
  census: RewritingCensus;
  running: SplitView;
  quoted: SplitView;
}

let corpusPromise: Promise<CorpusResult> | null = null;

export async function fetchCorpus(): Promise<CorpusResult> {
  if (!corpusPromise) {
    corpusPromise = getJson<CorpusResult>("/concepts/penn-treebank-rules/corpus");
  }
  return corpusPromise;
}
