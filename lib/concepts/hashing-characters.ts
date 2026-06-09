// Client functions for the page about turning a character into a position with
// arithmetic instead of looking it up in a table.
//
// Every number here is computed by the API. The hash-text endpoint puts a text
// through the multiplicative hash at a chosen width and reports each
// character's buckets; the collisions endpoint takes one character and finds
// everything that shares its whole set; the separation endpoint counts how many
// kinds of character an arrangement can tell apart at all; the fingerprints
// endpoint is the same idea applied to a word's three-character pieces; and the
// limits endpoint carries the fixed figures the closing part quotes.

import { getJson, postJson } from "@/lib/api";

export interface HashedCharacterView {
  character: string;
  display: string;
  codepoint: number;
  codepoint_label: string;
  bucket_ids: number[];
  n_sharers: number;
}

export interface ClashGroup {
  characters: string[];
  bucket_ids: number[];
}

export interface HashedTextView {
  text: string;
  n_characters: number;
  n_bytes: number;
  byte_tokens: number;
  n_buckets: number;
  n_hash_functions: number;
  multipliers: number[];
  characters: HashedCharacterView[];
  n_ids: number;
  table_rows: number;
  table_numbers: number;
  slice_width: number;
  sharing_step: number;
  characters_per_bucket_set: number;
  clashes: ClashGroup[];
  rebuilt: string;
  rebuilt_exactly: boolean;
  n_distinct_characters: number;
  n_distinct_bucket_sets: number;
}

export interface HashTextOptions {
  nBuckets?: number;
  nHashFunctions?: number;
}

export async function hashText(
  text: string,
  options: HashTextOptions = {},
): Promise<HashedTextView> {
  return postJson<HashedTextView>("/concepts/hashing-characters/hash-text", {
    text,
    ...(options.nBuckets === undefined ? {} : { n_buckets: options.nBuckets }),
    ...(options.nHashFunctions === undefined
      ? {}
      : { n_hash_functions: options.nHashFunctions }),
  });
}

export interface SharerView {
  character: string;
  codepoint: number;
  codepoint_label: string;
  unicode_name: string;
}

export interface CollisionsView {
  character: string;
  display: string;
  codepoint: number;
  codepoint_label: string;
  unicode_name: string;
  bucket_ids: number[];
  n_buckets: number;
  n_hash_functions: number;
  multipliers: number[];
  sharing_step: number;
  n_sharers: number;
  n_named_sharers: number;
  named: SharerView[];
  every_sharer_agrees: boolean;
}

export async function findSharers(
  character: string,
  nBuckets: number,
): Promise<CollisionsView> {
  return postJson<CollisionsView>("/concepts/hashing-characters/collisions", {
    character,
    n_buckets: nBuckets,
  });
}

export interface SeparationCount {
  n_hash_functions: number;
  distinct_sets: number;
  reaches_the_ceiling: boolean;
}

export interface SeparationRow {
  n_buckets: number;
  ceiling: number;
  shares_a_factor: boolean;
  counts: SeparationCount[];
}

export interface SeparationView {
  codepoints: number;
  multipliers: number[];
  rows: SeparationRow[];
  widths_tried: number;
  widths_where_one_falls_short: number;
  widths_where_two_fall_short: number;
  first_ten_short_widths: number[];
  every_short_width_is_a_multiple: boolean;
  first_multiplier: number;
  multiples_of_the_first_multiplier: number;
}

// The separation sweep is the same answer for every reader, so the two widgets
// that read it share one request.
let separationPromise: Promise<SeparationView> | null = null;

export async function fetchSeparation(): Promise<SeparationView> {
  if (!separationPromise) {
    separationPromise = getJson<SeparationView>(
      "/concepts/hashing-characters/separation",
    );
  }
  return separationPromise;
}

export interface WordFingerprint {
  word: string;
  trigrams: string[];
  bucket_ids: number[];
  n_trigrams: number;
  n_active: number;
}

export interface PairOverlap {
  first: string;
  second: string;
  shared: number;
  first_active: number;
  second_active: number;
  identical: boolean;
}

export interface FingerprintsView {
  n_buckets: number;
  n_hash_functions: number;
  multipliers: number[];
  boundary_marker: string;
  words: WordFingerprint[];
  pairs: PairOverlap[];
}

export async function fingerprintWords(
  words: string[],
  nBuckets: number,
): Promise<FingerprintsView> {
  return postJson<FingerprintsView>(
    "/concepts/hashing-characters/fingerprints",
    { words, n_buckets: nBuckets },
  );
}

export interface TableCost {
  label: string;
  rows: number;
  numbers: number;
}

export interface LengthRow {
  language: string;
  text: string;
  n_characters: number;
  n_bytes: number;
  hashed_positions: number;
  hashed_ids: number;
  merged_tokens: number;
  merged_stand_ins: number;
  character_stand_ins: number;
}

export interface WidthTrade {
  n_buckets: number;
  numbers: number;
  characters_per_bucket_set: number;
}

export interface SpreadRow {
  n_buckets: number;
  buckets_used: number;
  heaviest_bucket: number;
  mean_load: number;
}

export interface TrigramClash {
  bucket_id: number;
  trigrams: string[];
}

export interface WordClash {
  first: string;
  second: string;
}

export interface RepeatedLetterCase {
  first: string;
  second: string;
  first_trigrams: string[];
  second_trigrams: string[];
  identical: boolean;
}

export interface LimitsView {
  codepoints: number;
  embedding_width: number;
  published_buckets: number;
  published_hashes: number;
  tables: TableCost[];
  codepoint_table_over_hashed: number;
  hashed_over_byte_table: number;
  lengths: LengthRow[];
  width_trades: WidthTrade[];
  trigram_alphabet_size: number;
  trigrams_counted: number;
  spread: SpreadRow[];
  trigram_clash: TrigramClash;
  heaviest_trigram_bucket: TrigramClash;
  narrow_buckets: number;
  narrow_words_tried: number;
  narrow_distinct_fingerprints: number;
  narrow_clashes: number;
  narrow_examples: WordClash[];
  repeated_letters: RepeatedLetterCase[];
  sentence_words: string[];
  sentence_positions: number;
  sentence_active_buckets: number;
  sentence_merged_tokens: number;
  sentence_characters: number;
}

let limitsPromise: Promise<LimitsView> | null = null;

export async function fetchHashingLimits(): Promise<LimitsView> {
  if (!limitsPromise) {
    limitsPromise = getJson<LimitsView>("/concepts/hashing-characters/limits");
  }
  return limitsPromise;
}
