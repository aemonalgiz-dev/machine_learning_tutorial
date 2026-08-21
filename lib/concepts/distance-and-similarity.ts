// Client functions for the distance-and-similarity page.
//
// Every number here is computed by the API and only drawn in the browser. Most
// of the page's requests take no input at all, since they ask about one fixed
// corpus, so those are cached in module-level promises and several widgets
// share one fetch.

import { getJson, postJson } from "@/lib/api";

export interface WordRow {
  word: string;
  use_count: number;
  vector: number[];
  length: number;
}

export interface SpaceView {
  documents: string[];
  n_documents: number;
  n_words: number;
  dimension: number;
  window: number;
  words: WordRow[];
  table_numbers: number;
  n_pairs: number;
  metrics: string[];
  plain_names: Record<string, string>;
}

export interface HandPair {
  first: string;
  second: string;
  first_vector: number[];
  second_vector: number[];
  answers: Record<string, number>;
  cosine_similarity: number;
}

export interface HandView {
  contexts: string[];
  words: string[];
  rows: number[][];
  lengths: number[];
  times: number;
  scaled_word: string;
  pairs: HandPair[];
}

export interface NeighbourRow {
  word: string;
  reading: number;
  length: number;
}

export interface RankedList {
  metric: string;
  plain_name: string;
  bounded: boolean;
  ceiling: number | null;
  rows: NeighbourRow[];
}

export interface NeighboursView {
  word: string;
  vector: number[];
  length: number;
  rankings: RankedList[];
  n_rules_agreeing_on_first: number;
  first_places: Record<string, string>;
  comparisons: number;
  multiplications: number;
}

export interface LengthRow {
  word: string;
  use_count: number;
  counting_length: number;
  predicting_length: number;
}

export interface LengthsView {
  rows: LengthRow[];
  counting_correlation: number;
  predicting_correlation: number;
  counting_dimension: number;
  predicting_dimension: number;
  commonest_words: string[];
  commonest_count: number;
}

export interface Disagreement {
  word: string;
  first_choice: string;
  second_choice: string;
}

export interface CoordinateMatch {
  first: string;
  second: string;
  n_matching: number;
}

export interface AgreementView {
  metrics: string[];
  plain_names: string[];
  grid: number[][];
  n_words: number;
  nearest: Record<string, string[]>;
  words: string[];
  angle_against_line: Disagreement[];
  n_all_but_labels_agree: number;
  exact_coordinate_matches: number;
  n_pairs: number;
  best_label_match: CoordinateMatch;
  unit_orders_agree: boolean;
  largest_identity_gap: number;
  raw_order_matches_unit_order: boolean;
}

export interface MovedRow {
  shift: number;
  definition: number;
  expanded: number;
  shifted_first: number;
  digits_lost: number;
}

export interface MovedView {
  first: string;
  second: string;
  first_vector: number[];
  second_vector: number[];
  rows: MovedRow[];
  largest_relative_gap: number;
  n_random_pairs: number;
}

export interface ContrastRow {
  dimension: number;
  fitted: number;
  uniform: number;
}

export interface ContrastView {
  rows: ContrastRow[];
  n_words: number;
  crossover_dimension: number | null;
}

export interface CostRow {
  n_words: number;
  dimension: number;
  multiplications: number;
  milliseconds: number | null;
}

export interface CostView {
  rows: CostRow[];
  repeats: number;
}

export interface UndefinedCase {
  situation: string;
  what_is_undefined: string;
  outcome: string;
}

export interface AsymmetricPair {
  word: string;
  nearest: string;
  returned: string;
}

export interface UndefinedView {
  cases: UndefinedCase[];
  asymmetric: AsymmetricPair[];
  n_words: number;
  n_asymmetric: number;
  symmetry_gap: number;
}

export interface TriangleView {
  metrics: string[];
  plain_names: string[];
  violations: number[];
  n_triples: number;
  worst_excess: number[];
  worst_route: Record<string, string[]>;
  worst_legs: Record<string, number[]>;
}

const BASE = "/concepts/distance-and-similarity";

let spacePromise: Promise<SpaceView> | null = null;
let lengthsPromise: Promise<LengthsView> | null = null;
let agreementPromise: Promise<AgreementView> | null = null;
let contrastPromise: Promise<ContrastView> | null = null;
let costPromise: Promise<CostView> | null = null;
let undefinedPromise: Promise<UndefinedView> | null = null;
let trianglePromise: Promise<TriangleView> | null = null;

export function fetchSpace(): Promise<SpaceView> {
  spacePromise ??= getJson<SpaceView>(`${BASE}/space`);
  return spacePromise;
}

export function fetchByHand(
  options: { times?: number; scaledWord?: string } = {},
): Promise<HandView> {
  return postJson<HandView>(`${BASE}/by-hand`, {
    times: options.times ?? 1,
    scaled_word: options.scaledWord ?? "bake",
  });
}

export function fetchNeighbours(
  word: string,
  nResults = 6,
): Promise<NeighboursView> {
  return postJson<NeighboursView>(`${BASE}/neighbours`, {
    word,
    n_results: nResults,
  });
}

export function fetchLengths(): Promise<LengthsView> {
  lengthsPromise ??= getJson<LengthsView>(`${BASE}/lengths`);
  return lengthsPromise;
}

export function fetchAgreement(): Promise<AgreementView> {
  agreementPromise ??= getJson<AgreementView>(`${BASE}/agreement`);
  return agreementPromise;
}

export function fetchMoved(shifts?: number[]): Promise<MovedView> {
  return postJson<MovedView>(`${BASE}/moved`, shifts ? { shifts } : {});
}

export function fetchContrast(): Promise<ContrastView> {
  contrastPromise ??= getJson<ContrastView>(`${BASE}/contrast`);
  return contrastPromise;
}

export function fetchCost(): Promise<CostView> {
  costPromise ??= getJson<CostView>(`${BASE}/cost`);
  return costPromise;
}

export function fetchUndefined(): Promise<UndefinedView> {
  undefinedPromise ??= getJson<UndefinedView>(`${BASE}/undefined`);
  return undefinedPromise;
}

export function fetchTriangle(): Promise<TriangleView> {
  trianglePromise ??= getJson<TriangleView>(`${BASE}/triangle`);
  return trianglePromise;
}
