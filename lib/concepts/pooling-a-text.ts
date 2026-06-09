// The pooling page's endpoints.
//
// One thing the reader varies, a set of texts pooled one way, and four fixed
// measurements the API computes once. The fixed ones are shared here through
// module-level promises, so a page that opens several sections at once still
// asks for each of them exactly once.

import { getJson, postJson } from "@/lib/api";

export { ApiError } from "@/lib/api";

export type CorpusName = "documents" | "sketch";

export type MethodName =
  | "counts"
  | "weighted-counts"
  | "average"
  | "weighted-average"
  | "smooth-weights"
  | "smooth-inverse-frequency";

export const METHOD_LABELS: Record<MethodName, string> = {
  counts: "counting",
  "weighted-counts": "counting, weighted by rarity",
  average: "the plain average",
  "weighted-average": "the average, weighted by rarity",
  "smooth-weights": "the smooth weights alone",
  "smooth-inverse-frequency": "smooth inverse frequency",
};

export const SHORT_LABELS: Record<MethodName, string> = {
  counts: "counted",
  "weighted-counts": "counted, weighted",
  average: "averaged",
  "weighted-average": "averaged, weighted",
  "smooth-weights": "smooth weights",
  "smooth-inverse-frequency": "smooth, direction out",
};

export const ALL_METHODS: MethodName[] = [
  "counts",
  "weighted-counts",
  "average",
  "weighted-average",
  "smooth-weights",
  "smooth-inverse-frequency",
];

// --- Pooling some texts ------------------------------------------------------

export interface WordShare {
  word: string;
  group: string;
  share: number;
}

export interface PooledText {
  text: string;
  words: string[];
  known_words: number;
  vector: number[];
  length: number;
  shares: WordShare[];
  by_word: WordShare[];
}

export interface TextPair {
  first: number;
  second: number;
  similarity: number | null;
  undefined_because: string | null;
}

export interface Pooled {
  corpus: CorpusName;
  method: MethodName;
  method_label: string;
  dimension: number;
  reads_positions: boolean;
  texts: PooledText[];
  pairs: TextPair[];
  smallest_similarity: number | null;
  largest_similarity: number | null;
  contribution_gap: number;
}

export interface PoolOptions {
  corpus?: CorpusName;
  method?: MethodName;
  texts?: string[];
}

export async function poolTexts(options: PoolOptions = {}): Promise<Pooled> {
  const body: Record<string, unknown> = {};
  if (options.corpus !== undefined) body.corpus = options.corpus;
  if (options.method !== undefined) body.method = options.method;
  if (options.texts !== undefined) body.texts = options.texts;
  return postJson<Pooled>("/concepts/pooling-a-text/pool", body);
}

// --- How far apart each method puts the two halves ---------------------------

export interface SeparationRow {
  corpus: CorpusName;
  method: MethodName;
  method_label: string;
  reads_positions: boolean;
  width: number;
  within_mean: number;
  within_smallest: number;
  between_mean: number;
  between_largest: number;
  margin: number;
  mean_gap: number;
  words_given_back: number | null;
}

export interface ThreeTextRow {
  method: MethodName;
  method_label: string;
  sailing_to_cooking: number;
  sailing_to_sailing: number;
  cooking_to_sailing: number;
  margin: number;
}

export interface Separation {
  rows: SeparationRow[];
  three_texts: ThreeTextRow[];
  texts: string[];
  text_groups: string[];
  shared_between_texts: string[];
  n_documents: number;
  n_words: number;
  position_width: number;
  counted_width: number;
}

let separationPromise: Promise<Separation> | null = null;

export function fetchSeparation(): Promise<Separation> {
  if (!separationPromise)
    separationPromise = getJson<Separation>(
      "/concepts/pooling-a-text/separation",
    );
  return separationPromise;
}

// --- The direction every text of a collection shares -------------------------

export interface WordAgainstDirection {
  word: string;
  group: string;
  cosine: number;
  length: number;
  use_count: number;
  weight: number;
}

export interface Direction {
  corpus: CorpusName;
  component: number[];
  words: WordAgainstDirection[];
  shared_words: string[];
  largest_content_cosine: number;
  smallest_shared_cosine: number;
  along_mean: number;
  along_smallest: number;
  along_largest: number;
  smallest_weight: number;
  largest_weight: number;
  weight_ratio: number;
  weight_of_a_common_word: number;
  weight_of_a_rare_word: number;
  illustrated_ratio: number;
  smoothing: number;
}

const directionPromises: Partial<Record<CorpusName, Promise<Direction>>> = {};

export function fetchDirection(corpus: CorpusName): Promise<Direction> {
  const existing = directionPromises[corpus];
  if (existing) return existing;
  const promise = postJson<Direction>("/concepts/pooling-a-text/direction", {
    corpus,
  });
  directionPromises[corpus] = promise;
  return promise;
}

// --- What reordering a text does ---------------------------------------------

export interface OrderRow {
  method: MethodName;
  method_label: string;
  first_vector: number[];
  second_vector: number[];
  largest_gap: number;
  similarity: number;
  identical: boolean;
}

export interface Order {
  first: string;
  second: string;
  rows: OrderRow[];
  n_orderings: number;
}

let orderPromise: Promise<Order> | null = null;

export function fetchOrder(): Promise<Order> {
  if (!orderPromise) orderPromise = getJson<Order>("/concepts/pooling-a-text/order");
  return orderPromise;
}

// --- The same text in different company --------------------------------------

export interface CompanyWord {
  word: string;
  group: string;
  in_the_whole: number;
  in_the_half: number;
}

export interface Company {
  text: string;
  whole_vector: number[];
  half_vector: number[];
  similarity_between_readings: number;
  whole_component: number[];
  half_component: number[];
  component_similarity: number;
  words: CompanyWord[];
  n_whole: number;
  n_half: number;
}

let companyPromise: Promise<Company> | null = null;

export function fetchCompany(): Promise<Company> {
  if (!companyPromise)
    companyPromise = getJson<Company>("/concepts/pooling-a-text/company");
  return companyPromise;
}

// --- The cases with nothing to compute ---------------------------------------

export interface MixedRow {
  method: MethodName;
  method_label: string;
  to_sailing: number;
  to_cooking: number;
  sailing_to_cooking: number;
}

export interface Edges {
  mixed_text: string;
  pure_sailing: string;
  pure_cooking: string;
  mixed: MixedRow[];
  mixed_nearest: string[];
  mixed_nearest_groups: string[];
  unknown_text: string;
  unknown_vector_length: number;
  unknown_refusal: string;
  single_residue_length: number;
  single_document: string;
  counting_smallest_within: number;
  smooth_smallest_within: number;
  average_smallest_within: number;
}

let edgesPromise: Promise<Edges> | null = null;

export function fetchEdges(): Promise<Edges> {
  if (!edgesPromise) edgesPromise = getJson<Edges>("/concepts/pooling-a-text/edges");
  return edgesPromise;
}
