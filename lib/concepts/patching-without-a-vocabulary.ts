// Client functions for the page about grouping bytes back into larger pieces.
//
// Every number here is computed by the API. The patch endpoint cuts one text
// both ways at once and returns the per-byte uncertainty the second of the two
// rules reads, so the playground and the profile chart share one response
// shape; the cut-landing endpoint sweeps both rules across the eighteen
// sentences and counts where every cut fell; the corpus-condition endpoint
// measures the same sentence under models counted over more and more copies of
// it; and the limits endpoint carries the lengths and the closing figures.

import { getJson, postJson } from "@/lib/api";

export type Source = "reports" | "one sentence";

export type Rule = "global_threshold" | "relative_increase";

export interface PatchPiece {
  text: string;
  start: number;
  end: number;
  n_bytes: number;
  displays: string[];
}

export interface PatchView {
  label: string;
  n_patches: number;
  boundaries: number[];
  pieces: PatchPiece[];
  at_a_word_start: number;
  inside_a_word: number;
  elsewhere: number;
  n_broken_characters: number;
  longest: number;
  shortest: number;
}

export interface BytePosition {
  position: number;
  byte_id: number;
  display: string;
  entropy: number;
  begins_a_patch: boolean;
  at_a_word_start: boolean;
}

export interface PatchedTextView {
  text: string;
  n_characters: number;
  n_bytes: number;
  source_label: string;
  n_texts_counted: number;
  n_contexts: number;
  order: number;
  threshold: number;
  smoothing: number;
  rule_label: string;
  patch_size: number;
  fixed: PatchView;
  entropy: PatchView;
  positions: BytePosition[];
  highest_entropy: number;
  lowest_entropy: number;
}

export interface PatchOptions {
  source?: Source;
  nCopies?: number;
  order?: number;
  threshold?: number;
  smoothing?: number;
  rule?: Rule;
  patchSize?: number;
}

export async function patchText(
  text: string,
  options: PatchOptions = {},
): Promise<PatchedTextView> {
  return postJson<PatchedTextView>(
    "/concepts/patching-without-a-vocabulary/patch",
    {
      text,
      ...(options.source === undefined ? {} : { source: options.source }),
      ...(options.nCopies === undefined ? {} : { n_copies: options.nCopies }),
      ...(options.order === undefined ? {} : { order: options.order }),
      ...(options.threshold === undefined
        ? {}
        : { threshold: options.threshold }),
      ...(options.smoothing === undefined
        ? {}
        : { smoothing: options.smoothing }),
      ...(options.rule === undefined ? {} : { rule: options.rule }),
      ...(options.patchSize === undefined
        ? {}
        : { patch_size: options.patchSize }),
    },
  );
}

// The profile chart asks for a small fixed set of texts at the page's own
// settings, and a reader switching between them should not pay for the same
// request twice.
const patchedTexts = new Map<string, Promise<PatchedTextView>>();

export async function fetchPatchedText(
  text: string,
  options: PatchOptions = {},
): Promise<PatchedTextView> {
  const key = JSON.stringify([text, options]);
  const waiting = patchedTexts.get(key);
  if (waiting) {
    return waiting;
  }
  const started = patchText(text, options);
  patchedTexts.set(key, started);
  return started;
}

export interface LandingRow {
  setting: number;
  n_patches: number;
  at_a_word_start: number;
  inside_a_word: number;
  elsewhere: number;
  share_inside_a_word: number;
  bytes_per_patch: number;
}

export interface CutLandingView {
  n_texts: number;
  corpus_bytes: number;
  word_starts: number;
  positions_inside_a_word: number;
  positions_between_bytes: number;
  share_of_positions_inside_a_word: number;
  order: number;
  threshold: number;
  fixed: LandingRow[];
  thresholds: LandingRow[];
  orders: LandingRow[];
}

let cutLandingPromise: Promise<CutLandingView> | null = null;

export async function fetchCutLanding(): Promise<CutLandingView> {
  if (!cutLandingPromise) {
    cutLandingPromise = getJson<CutLandingView>(
      "/concepts/patching-without-a-vocabulary/cut-landing",
    );
  }
  return cutLandingPromise;
}

export interface ConditionRow {
  n_copies: number;
  smoothing: number;
  inside_a_word: number;
  at_a_word_start: number;
  gap: number;
  lowest: number;
  highest: number;
  n_patches: number;
  patches: string[];
  words_recovered: boolean;
}

export interface OnePhraseView {
  phrase: string;
  n_copies: number;
  entropies: number[];
  displays: string[];
  patches: string[];
  every_position_agrees: boolean;
}

export interface EquivalenceView {
  n_copies: number;
  smoothing: number;
  single_copy_smoothing: number;
  largest_gap: number;
  patches_agree: boolean;
}

export interface CorpusConditionView {
  sentence: string;
  n_bytes: number;
  words: string[];
  order: number;
  threshold: number;
  displays: string[];
  rows: ConditionRow[];
  one_phrase: OnePhraseView;
  equivalence: EquivalenceView;
}

let corpusConditionPromise: Promise<CorpusConditionView> | null = null;

export async function fetchCorpusCondition(): Promise<CorpusConditionView> {
  if (!corpusConditionPromise) {
    corpusConditionPromise = getJson<CorpusConditionView>(
      "/concepts/patching-without-a-vocabulary/corpus-condition",
    );
  }
  return corpusConditionPromise;
}

export interface LengthRow {
  label: string;
  sentence: number;
  corpus: number;
  table_entries: number | null;
}

export interface SmallExample {
  corpus: string;
  text: string;
  displays: string[];
  entropies: number[];
  n_contexts: number;
  patches_at_a_high_threshold: string[];
  threshold: number;
}

export interface ModelRow {
  label: string;
  n_contexts: number;
  patches: string[];
  n_patches: number;
  held_out_patches: number;
}

export interface RuleRow {
  label: string;
  seen: string[];
  unseen: string[];
  corpus_patches: number;
}

export interface RepeatedPiece {
  text: string;
  n_occurrences: number;
}

export interface BrokenCharacter {
  text: string;
  n_characters: number;
  n_bytes: number;
  patch_size: number;
  pieces: string[];
  n_broken_characters: number;
}

export interface PatchingLimitsView {
  sentence: string;
  seen_sentence: string;
  order: number;
  threshold: number;
  smoothing: number;
  n_copies: number;
  lengths: LengthRow[];
  small_example: SmallExample;
  models: ModelRow[];
  rules: RuleRow[];
  distinct_patch_spellings: number;
  total_patches: number;
  repeated_pieces: RepeatedPiece[];
  broken: BrokenCharacter;
  unseen_bytes_at_the_top: number;
  sentence_bytes_at_the_top: number;
}

let patchingLimitsPromise: Promise<PatchingLimitsView> | null = null;

export async function fetchPatchingLimits(): Promise<PatchingLimitsView> {
  if (!patchingLimitsPromise) {
    patchingLimitsPromise = getJson<PatchingLimitsView>(
      "/concepts/patching-without-a-vocabulary/limits",
    );
  }
  return patchingLimitsPromise;
}
