// Client functions for the a-vector-for-a-word page.
//
// Every number here is computed by the API and only drawn in the browser. Two
// spaces are served: the twenty-four cooking and sailing documents, which is a
// real fit, and the five-word two-dimensional sketch, where every cosine can be
// checked on paper. The two fixed requests are cached in module-level promises,
// because four widgets want the same table and the same sweep.

import { getJson, postJson } from "@/lib/api";

export type SpaceName = "documents" | "sketch";

export interface WordRow {
  word: string;
  token_id: number;
  count: number | null;
  vector: number[];
  length: number;
}

export interface PairRow {
  first: string;
  second: string;
  id_gap: number;
  cosine: number;
  gap: number;
}

export interface WordSpace {
  name: string;
  documents: string[];
  dimension: number;
  n_words: number;
  words: WordRow[];
  pairs: PairRow[];
  table_numbers: number;
  n_pairs: number;
  length_count_correlation: number | null;
  id_gap_cosine_correlation: number | null;
}

export interface NeighbourRow {
  word: string;
  cosine: number;
  gap: number;
  length: number;
}

export interface NeighbourAnswer {
  word: string;
  vector: number[];
  length: number;
  by_cosine: NeighbourRow[];
  by_gap: NeighbourRow[];
  comparisons: number;
}

export interface AnalogyTerm {
  word: string;
  added: boolean;
  vector: number[];
  length: number;
  unit: number[];
}

export interface AnalogyAnswer {
  terms: AnalogyTerm[];
  combination: number[];
  combination_length: number;
  excluded: string[];
  answers: NeighbourRow[];
}

export interface ExclusionExample {
  positive_first: string;
  negative: string;
  positive_second: string;
  with_exclusion: string;
  without_exclusion: string;
}

export interface ExclusionSweep {
  n_questions: number;
  n_returning_a_question_word: number;
  share: number;
  n_added_word: number;
  n_subtracted_word: number;
  examples: ExclusionExample[];
}

export interface TurnedRow {
  word: string;
  before: number[];
  after: number[];
  length_before: number;
  length_after: number;
}

export interface RotationView {
  angle_degrees: number;
  rows: TurnedRow[];
  watched: TurnedRow;
  neighbours_before: NeighbourRow[];
  neighbours_after: NeighbourRow[];
  worst_cosine_change: number;
  worst_length_change: number;
  largest_coordinate_move: number;
  n_orders_unchanged: number;
  n_top_unchanged: number;
  n_words: number;
}

export interface SenseRow {
  word: string;
  nearest: string;
  cosine: number;
}

export interface SensesView {
  merged_word: string;
  replaced: string[];
  merged_documents: string[];
  neighbours: NeighbourRow[];
  best_cosine: number;
  separate: SenseRow[];
  mean_to_cooking: number;
  mean_to_sailing: number;
  comparison_word: string;
  comparison_to_cooking: number;
  comparison_to_sailing: number;
  lowest_best_cosine: SenseRow;
}

export interface ContextCount {
  word: string;
  weight: number;
}

export interface CompanyView {
  window: number;
  first: string;
  second: string;
  first_company: ContextCount[];
  second_company: ContextCount[];
  shared: string[];
  between: number;
  cosine: number;
}

export interface OneFit {
  seed: number;
  within_topic: number;
  across_topic: number;
  watched_vector: number[];
  watched_neighbours: NeighbourRow[];
}

export interface TwoFitsView {
  watched: string;
  fits: OneFit[];
  self_cosine: number;
  mean_first_coordinate_gap: number;
  largest_first_coordinate_gap: number;
  shared_neighbour_places: number;
  neighbour_places: number;
}

export interface ContractProbe {
  edge: string;
  outcome: string;
  result: string | null;
  reason: string | null;
}

const BASE = "/concepts/a-vector-for-a-word";

let documentsPromise: Promise<WordSpace> | null = null;
let sketchPromise: Promise<WordSpace> | null = null;
let exclusionPromise: Promise<ExclusionSweep> | null = null;
let sensesPromise: Promise<SensesView> | null = null;
let contractsPromise: Promise<ContractProbe[]> | null = null;
let twoFitsPromise: Promise<TwoFitsView> | null = null;

export function fetchSpace(space: SpaceName): Promise<WordSpace> {
  if (space === "sketch") {
    sketchPromise ??= getJson<WordSpace>(`${BASE}/sketch`);
    return sketchPromise;
  }
  documentsPromise ??= getJson<WordSpace>(`${BASE}/space`);
  return documentsPromise;
}

export interface SphereWord {
  word: string;
  token_id: number;
  count: number;
  x: number;
  y: number;
  z: number;
  topic: "cooking" | "sailing" | "shared";
  length: number;
}

export interface SphereAnswer {
  words: SphereWord[];
  dimension: number;
  n_drawn: number;
  kept_share: number;
  within_topic: number;
  across_topic: number;
}

let spherePromise: Promise<SphereAnswer> | null = null;

export function fetchSphere(): Promise<SphereAnswer> {
  spherePromise ??= getJson<SphereAnswer>(`${BASE}/sphere`);
  return spherePromise;
}

export function fetchNeighbours(
  word: string,
  options: { space?: SpaceName; nResults?: number } = {},
): Promise<NeighbourAnswer> {
  return postJson<NeighbourAnswer>(`${BASE}/neighbours`, {
    space: options.space ?? "documents",
    word,
    n_results: options.nResults ?? 6,
  });
}

export function fetchAnalogy(
  positive: string[],
  negative: string[],
  options: {
    space?: SpaceName;
    excludeQuestionWords?: boolean;
    nResults?: number;
  } = {},
): Promise<AnalogyAnswer> {
  return postJson<AnalogyAnswer>(`${BASE}/analogy`, {
    space: options.space ?? "sketch",
    positive,
    negative,
    exclude_question_words: options.excludeQuestionWords ?? true,
    n_results: options.nResults ?? 4,
  });
}

export function fetchExclusionSweep(): Promise<ExclusionSweep> {
  exclusionPromise ??= getJson<ExclusionSweep>(`${BASE}/analogy-exclusion`);
  return exclusionPromise;
}

export function fetchRotation(
  angleDegrees: number,
  word: string,
): Promise<RotationView> {
  return postJson<RotationView>(`${BASE}/rotation`, {
    angle_degrees: angleDegrees,
    word,
  });
}

export function fetchSenses(): Promise<SensesView> {
  sensesPromise ??= getJson<SensesView>(`${BASE}/senses`);
  return sensesPromise;
}

export function fetchCompany(
  first: string,
  second: string,
): Promise<CompanyView> {
  return postJson<CompanyView>(`${BASE}/company`, { first, second });
}

export function fetchTwoFits(): Promise<TwoFitsView> {
  twoFitsPromise ??= getJson<TwoFitsView>(`${BASE}/two-fits`);
  return twoFitsPromise;
}

export function fetchContracts(): Promise<ContractProbe[]> {
  contractsPromise ??= getJson<{ probes: ContractProbe[] }>(
    `${BASE}/contracts`,
  ).then((body) => body.probes);
  return contractsPromise;
}
