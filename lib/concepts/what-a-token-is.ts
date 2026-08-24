// Client functions for the page about what a token is.
//
// Every number here is computed by the API against the same six sentences: the
// encode endpoint cuts a text under one of two schemes and reads the numbers
// back again, the growth endpoint feeds the six sentences in one at a time and
// measures both tables after each, and the unknown-answers endpoint puts one
// unseen word to four tables and records what each of them did.

import { postJson, getJson } from "@/lib/api";

export type Scheme = "character" | "word";

export interface TokenView {
  text: string;
  token_id: number;
  known: boolean;
}

export interface EncodedText {
  source: string;
  tokens: TokenView[];
  ids: number[];
  n_tokens: number;
  n_unknown: number;
  decoded: string;
  round_trip_exact: boolean;
}

export interface EncodeView {
  scheme: Scheme;
  corpus: string[];
  vocabulary_size: number;
  n_pieces_learned: number;
  stand_in: string | null;
  vocabulary: string[];
  encodings: EncodedText[];
}

export async function encodeTexts(
  texts: string[],
  scheme: Scheme,
): Promise<EncodeView> {
  return postJson<EncodeView>("/concepts/what-a-token-is/encode", {
    texts,
    scheme,
  });
}

export interface GrowthStep {
  n_texts: number;
  characters_seen: number;
  words_seen: number;
  character_table: number;
  word_table: number;
  next_text: string | null;
  next_character_tokens: number | null;
  next_unknown_characters: number | null;
  next_word_tokens: number | null;
  next_unknown_words: number | null;
}

export interface GrowthView {
  corpus: string[];
  steps: GrowthStep[];
}

let growthPromise: Promise<GrowthView> | null = null;

// The growth curve is the same six sentences every time, so the request is made
// once and shared by whichever widgets ask for it.
export async function fetchVocabularyGrowth(): Promise<GrowthView> {
  if (!growthPromise) {
    growthPromise = getJson<GrowthView>(
      "/concepts/what-a-token-is/vocabulary-growth",
    );
  }
  return growthPromise;
}

export interface UnknownProbe {
  table: string;
  text: string;
  answer: "substituted" | "refused" | "nothing was unknown";
  n_tokens: number | null;
  ids: number[] | null;
  pieces: string[] | null;
  decoded: string | null;
  round_trip_exact: boolean | null;
  reason: string | null;
}

export interface UnknownAnswersView {
  table_size: number;
  closed_size: number;
  byte_size: number;
  probes: UnknownProbe[];
}

let unknownPromise: Promise<UnknownAnswersView> | null = null;

export async function fetchUnknownAnswers(): Promise<UnknownAnswersView> {
  if (!unknownPromise) {
    unknownPromise = getJson<UnknownAnswersView>(
      "/concepts/what-a-token-is/unknown-answers",
    );
  }
  return unknownPromise;
}
