// The paragraph-vectors page's endpoints.
//
// One inference on request, for the playground and for the sections that vary
// the number of passes; and four fixed measurements the API computes once and
// caches, each shared here through a module-level promise so a page that opens
// several sections at once still asks for each of them exactly once.

import { getJson, postJson } from "@/lib/api";

export { ApiError } from "@/lib/api";

export type ArchitectureName = "distributed-memory" | "bag-of-words";

export const ARCHITECTURE_LABELS: Record<ArchitectureName, string> = {
  "distributed-memory": "distributed memory",
  "bag-of-words": "distributed bag of words",
};

export const ARCHITECTURE_NAMES: ArchitectureName[] = [
  "distributed-memory",
  "bag-of-words",
];

// A position's mean cosine to each half of the collection, and which half it
// leans towards, which is the whole verdict on a held-out text.
export interface TopicScores {
  cooking: number;
  sailing: number;
  leans_towards: string;
}

export interface RowLengths {
  smallest: number;
  largest: number;
  mean: number;
}

// --- Both fits ---------------------------------------------------------------

export interface DocumentEntry {
  position: number;
  text: string;
  topic: string;
}

export interface EpochReport {
  epoch: number;
  mean_loss: number;
  n_pairs: number;
}

export interface PairSummary {
  cooking: number;
  sailing: number;
  within: number;
  across: number;
  worst_within: number;
  best_across: number;
  margin: number;
}

export interface ArchitectureReport {
  architecture: ArchitectureName;
  label: string;
  epochs: EpochReport[];
  summary: PairSummary;
  similarities: number[][];
  fourteen_nearest_all_cooking: boolean;
  word_lengths: RowLengths;
  document_lengths: RowLengths;
  word_numbers: number;
  document_numbers: number;
  output_numbers: number;
  word_vectors_moved: boolean;
  seconds: number;
  near_pair: number;
  far_pair: number;
}

export interface ReferenceDefaults {
  epochs: number;
  learning_rate: number;
  positions: number;
  first_loss: number;
  last_loss: number;
  summary: PairSummary;
}

export interface Fits {
  documents: DocumentEntry[];
  n_documents: number;
  n_words: number;
  n_occurrences: number;
  dimension: number;
  window: number;
  epochs: number;
  learning_rate: number;
  untrained_cost: number;
  architectures: ArchitectureReport[];
  reference_defaults: ReferenceDefaults;
  bag_of_words_with_word_pairs_near: number;
  bag_of_words_with_word_pairs_far: number;
}

let fitsPromise: Promise<Fits> | null = null;

export function fetchFits(): Promise<Fits> {
  if (!fitsPromise) {
    fitsPromise = getJson<Fits>("/concepts/paragraph-vectors/fits");
  }
  return fitsPromise;
}

// --- One held-out text -------------------------------------------------------

export interface NearDocument {
  position: number;
  text: string;
  topic: string;
  similarity: number;
}

export interface Inferred {
  architecture: ArchitectureName;
  label: string;
  passes: number;
  known_words: string[];
  unknown_words: string[];
  nothing_to_descend_on: boolean;
  scores: TopicScores;
  length: number;
  nearest: NearDocument[];
  seconds: number;
  document_lengths: RowLengths;
}

export interface InferOptions {
  architecture?: ArchitectureName;
  text?: string;
  passes?: number;
  randomSeed?: number;
  nNearest?: number;
}

export async function inferPosition(
  options: InferOptions = {},
): Promise<Inferred> {
  const body: Record<string, unknown> = {};
  if (options.architecture !== undefined) body.architecture = options.architecture;
  if (options.text !== undefined) body.text = options.text;
  if (options.passes !== undefined) body.passes = options.passes;
  if (options.randomSeed !== undefined) body.random_seed = options.randomSeed;
  if (options.nNearest !== undefined) body.n_nearest = options.nNearest;
  return postJson<Inferred>("/concepts/paragraph-vectors/infer", body);
}

// --- The answer against the number of passes ---------------------------------

export interface CurvePoint {
  passes: number;
  cooking: number;
  sailing: number;
  length: number;
  seconds: number;
  leans_towards: string;
}

export interface CurveSeries {
  architecture: ArchitectureName;
  label: string;
  points: CurvePoint[];
  document_length_mean: number;
  word_length_mean: number;
}

export interface Curve {
  text: string;
  published_passes: number;
  series: CurveSeries[];
}

let curvePromise: Promise<Curve> | null = null;

export function fetchInferenceCurve(): Promise<Curve> {
  if (!curvePromise) {
    curvePromise = getJson<Curve>("/concepts/paragraph-vectors/inference-curve");
  }
  return curvePromise;
}

// --- Against averaging the words ---------------------------------------------

export interface RuleReport {
  rule: string;
  summary: PairSummary;
  held_out: TopicScores;
  seconds_to_prepare: number;
  seconds_per_text: number;
  numbers_per_document: number;
}

export interface AgainstAveraging {
  rules: RuleReport[];
}

let averagingPromise: Promise<AgainstAveraging> | null = null;

export function fetchAgainstAveraging(): Promise<AgainstAveraging> {
  if (!averagingPromise) {
    averagingPromise = getJson<AgainstAveraging>(
      "/concepts/paragraph-vectors/against-averaging",
    );
  }
  return averagingPromise;
}

// --- Does anything here read the order ---------------------------------------

export interface OrderRow {
  rule: string;
  passes: number;
  two_orders: number;
  two_starts_first: number;
  two_starts_second: number;
  reads_order: boolean;
}

export interface OrderProbe {
  text: string;
  shuffled: string;
  rows: OrderRow[];
}

let orderPromise: Promise<OrderProbe> | null = null;

export function fetchOrderProbe(): Promise<OrderProbe> {
  if (!orderPromise) {
    orderPromise = getJson<OrderProbe>("/concepts/paragraph-vectors/order");
  }
  return orderPromise;
}

// --- One position, worked out ------------------------------------------------

export interface HandWorked {
  document_vector: number[];
  context_vector: number[];
  hidden: number[];
  score: number;
  probability: number;
  hidden_gradient: number[];
  learning_rate: number;
  n_averaged: number;
  step: number[];
}

let onePositionPromise: Promise<HandWorked> | null = null;

export function fetchOnePosition(): Promise<HandWorked> {
  if (!onePositionPromise) {
    onePositionPromise = getJson<HandWorked>(
      "/concepts/paragraph-vectors/one-position",
    );
  }
  return onePositionPromise;
}
