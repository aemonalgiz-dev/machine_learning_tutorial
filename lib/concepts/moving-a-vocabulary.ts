// Client functions for the page about moving a vocabulary.
//
// Every number here is computed by the API from the library's own fits and its
// own mapping between two vocabularies. The two static endpoints take no input,
// so their promises are cached at module level and several widgets share one
// request; the transfer endpoint is the playground and is called on every
// change.

import { ApiError, getJson, postJson } from "@/lib/api";

const BASE = "/concepts/moving-a-vocabulary";

export type Route = "copied" | "rebuilt" | "stand_in" | "nothing";

export interface MappingRow {
  target_token: string;
  target_id: number;
  route: string;
  decoded: string;
  source_tokens: string[];
  source_ids: number[];
  n_source_ids: number;
  uses_stand_in: boolean;
  gained_a_marker: boolean;
}

export interface MoveSummary {
  n_target_tokens: number;
  n_source_tokens: number;
  n_copied: number;
  n_copied_multi_character: number;
  n_rebuilt: number;
  n_stand_in_route: number;
  n_nothing: number;
  n_using_stand_in: number;
  n_stand_in_only: number;
  n_inner_rebuilt: number;
  n_gained_a_marker: number;
  mean_pieces_when_rebuilt: number;
}

export interface Reading {
  label: string;
  pieces: string[];
  n_pieces: number;
}

export interface CrossingSummary {
  label: string;
  source_tokens: string[];
  target_tokens: string[];
  summary: MoveSummary;
  rows: MappingRow[];
}

export interface WorkedView {
  corpus: string[];
  word_counts: string[][];
  small_tokens: string[];
  large_tokens: string[];
  narrow_tokens: string[];
  larger_to_smaller: MappingRow[];
  larger_to_smaller_summary: MoveSummary;
  smaller_to_larger: MappingRow[];
  smaller_to_larger_summary: MoveSummary;
  narrow: MappingRow[];
  narrow_summary: MoveSummary;
  word_piece: CrossingSummary;
  byte_level_n_tokens: number;
  byte_level_n_nothing: number;
  byte_level_nothing: string[];
  byte_level_space_symbol: string;
  byte_level_mapped_example: MappingRow;
}

export interface LengthRow {
  label: string;
  old_pieces: number;
  new_pieces: number;
}

export interface TableCost {
  label: string;
  rows: number;
  width: number;
  n_numbers: number;
}

export interface SweepRow {
  asked: number;
  learned: number;
  n_copied: number;
  n_rebuilt: number;
  n_nothing: number;
  new_corpus_pieces: number;
}

export interface SharedPiece {
  piece: string;
  old_words: string[];
  new_words: string[];
  old_count: number;
  new_count: number;
  shared_words: string[];
}

export interface CollidingId {
  token_id: number;
  old_token: string;
  new_token: string;
}

export interface DomainsView {
  old_corpus: string[];
  new_corpus: string[];
  old_tokens: number;
  new_tokens: number;
  old_merges: number;
  new_merges: number;
  summary: MoveSummary;
  rows: MappingRow[];
  stand_in_rows: MappingRow[];
  marker_rows: MappingRow[];
  lengths: LengthRow[];
  old_sentence_readings: Reading[];
  new_sentence_readings: Reading[];
  tables: TableCost[];
  seeded_numbers: number;
  stand_in_only_numbers: number;
  sweep: SweepRow[];
  shared_pieces: SharedPiece[];
  colliding_ids: CollidingId[];
}

export interface TransferView {
  source_learned: number;
  target_learned: number;
  summary: MoveSummary;
  rows: MappingRow[];
  source_reading: Reading;
  target_reading: Reading;
  source_corpus_pieces: number;
  target_corpus_pieces: number;
}

export type CorpusChoice = "reports" | "kitchen" | "four_words";

let workedPromise: Promise<WorkedView> | null = null;
let domainsPromise: Promise<DomainsView> | null = null;

export function fetchWorked(): Promise<WorkedView> {
  workedPromise ??= getJson<WorkedView>(`${BASE}/worked`);
  return workedPromise;
}

export function fetchDomains(): Promise<DomainsView> {
  domainsPromise ??= getJson<DomainsView>(`${BASE}/domains`);
  return domainsPromise;
}

export function moveVocabulary(
  sourceCorpus: CorpusChoice,
  targetCorpus: CorpusChoice,
  sourceSize: number,
  targetSize: number,
  text: string,
): Promise<TransferView> {
  return postJson<TransferView>(`${BASE}/transfer`, {
    source_corpus: sourceCorpus,
    target_corpus: targetCorpus,
    source_size: sourceSize,
    target_size: targetSize,
    text,
  });
}

// The one message a widget shows when a request could not be answered.
export function messageFor(error: unknown): string {
  return error instanceof ApiError ? error.message : "Something went wrong.";
}
