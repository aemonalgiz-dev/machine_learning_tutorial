// Client functions for the page on searching a collection of pictures.
//
// Every number here is computed by the API. The collection is 4000 pictures,
// each given a position by the reference network, and the queries are the 240
// pictures that network was scored on and never trained on. Most requests are
// fixed reports and are cached in module-level promises, since several widgets
// read the same one; only the single search changes with what the reader
// picks.

import { getJson, postJson } from "@/lib/api";

const BASE = "/concepts/searching-a-collection-of-pictures";

export interface PictureGrid {
  rows: number[][];
  darkest: number;
  brightest: number;
}

export interface FoundPicture {
  position: number;
  kind: string;
  distance: number;
  rank: number;
  cell: number;
  in_exact_answer: boolean;
  picture: PictureGrid;
}

export interface PrecisionRow {
  k: number;
  precision: number;
  queries_all_same_kind: number;
}

export interface CoordinatePair {
  query: number;
  neighbour: number;
  gap: number;
  squared_gap: number;
}

export interface WorkedDistance {
  query: number;
  query_kind: string;
  neighbour: number;
  neighbour_kind: string;
  coordinates: CoordinatePair[];
  sum_of_squares_from_rounded: number;
  distance_from_rounded: number;
  distance: number;
  second_distance: number;
  farthest_distance: number;
}

export interface Stranger {
  query: number;
  query_kind: string;
  neighbour: number;
  neighbour_kind: string;
  distance: number;
  same_kind_in_ten: number;
}

export interface OverviewResponse {
  collection_seed: number;
  collection_size: number;
  per_kind: number;
  n_queries: number;
  dimension: number;
  kinds: string[];
  network_held_out_accuracy: number;
  measured_k: number;
  precision: PrecisionRow[];
  by_kind: { kind: string; precision: number }[];
  vote_accuracy: number;
  chance_precision: number;
  worked: WorkedDistance;
  strangers: Stranger[];
  distances_per_query: number;
  multiply_adds_per_query: number;
  distances_for_every_query: number;
  search_agrees_with_distance_ranking: boolean;
}

let overview: Promise<OverviewResponse> | null = null;

export function fetchOverview(): Promise<OverviewResponse> {
  overview ??= getJson<OverviewResponse>(`${BASE}/overview`);
  return overview;
}

export type CellCount = 16 | 32 | 64;

export interface SearchRequest {
  query: number;
  k: number;
  n_cells: CellCount;
  probes: number;
}

export interface ProbedCell {
  cell: number;
  size: number;
  centre_distance: number;
  holds_true_neighbours: number;
}

export interface SearchResponse {
  query: number;
  query_kind: string;
  query_picture: PictureGrid;
  query_cell: number;
  k: number;
  n_cells: number;
  probes: number;
  exact: FoundPicture[];
  indexed: FoundPicture[];
  exact_precision: number;
  recall: number;
  exact_distances: number;
  index_distances: number;
  touched_share: number;
  probed: ProbedCell[];
  kth_distance: number;
  next_distance: number;
}

export function searchOne(request: SearchRequest): Promise<SearchResponse> {
  return postJson<SearchResponse>(`${BASE}/search`, request);
}

export interface MapPoint {
  x: number;
  y: number;
  kind: number;
  cells: number[];
}

export interface MapResponse {
  points: MapPoint[];
  queries: MapPoint[];
  cell_counts: {
    n_cells: number;
    centres: { x: number; y: number; size: number }[];
  }[];
  kept_share: number;
}

let collectionMap: Promise<MapResponse> | null = null;

export function fetchCollectionMap(): Promise<MapResponse> {
  collectionMap ??= getJson<MapResponse>(`${BASE}/map`);
  return collectionMap;
}

export interface ProbeRow {
  probes: number;
  recall: number;
  worst_recall: number;
  queries_with_every_neighbour: number;
  worst_query: number;
  touched_share: number;
  distances_computed: number;
}

export interface CellCountReport {
  n_cells: number;
  smallest_cell: number;
  largest_cell: number;
  empty_cells: number;
  size_weighted_share: number;
  iterations: number;
  rows: ProbeRow[];
}

export interface RadiusRow {
  radius: number;
  buckets_probed: number;
  recall: number;
  touched_share: number;
}

export interface HashReport {
  bits: number;
  possible_buckets: number;
  occupied_buckets: number;
  largest_bucket: number;
  rows: RadiusRow[];
}

export interface TradeOffResponse {
  k: number;
  collection_size: number;
  cell_counts: CellCountReport[];
  hashing: HashReport[];
  cosine_euclidean_overlap: number;
}

let tradeOff: Promise<TradeOffResponse> | null = null;

export function fetchTradeOff(): Promise<TradeOffResponse> {
  tradeOff ??= getJson<TradeOffResponse>(`${BASE}/trade-off`);
  return tradeOff;
}

export interface CodedPicture {
  position: number;
  kind: string;
  code: string;
  angle_degrees: number;
  bits_agreeing: number;
  expected_agreeing: number;
  picture: PictureGrid;
}

export interface HashingResponse {
  bits: number;
  query: number;
  query_kind: string;
  query_code: string;
  query_picture: PictureGrid;
  others: CodedPicture[];
  check_planes: number;
  check_pairs: number;
  largest_gap: number;
  mean_gap: number;
  standard_error: number;
  all_positive_coordinates: number;
  mean_vector_length: number;
}

let hashing: Promise<HashingResponse> | null = null;

export function fetchHashing(): Promise<HashingResponse> {
  hashing ??= getJson<HashingResponse>(`${BASE}/hashing`);
  return hashing;
}

export interface RatioRow {
  label: string;
  dimension: number;
  mean_ratio: number;
  median_ratio: number;
  smallest_ratio: number;
  largest_ratio: number;
}

export interface ConcentrationResponse {
  collection_size: number;
  n_queries: number;
  ratios: RatioRow[];
  index_rows: { label: string; dimension: number; rows: ProbeRow[] }[];
  spread_shares: number[];
  components_for_ninety: number;
  uniform_spread_shares: number[];
  uniform_components_for_ninety: number;
}

let concentration: Promise<ConcentrationResponse> | null = null;

export function fetchConcentration(): Promise<ConcentrationResponse> {
  concentration ??= getJson<ConcentrationResponse>(`${BASE}/concentration`);
  return concentration;
}

export interface SeedResponse {
  weight_seed: number;
  network_held_out_accuracy: number;
  precision_at_k: number;
  precision_at_one: number;
  index_recall: number;
  index_touched_share: number;
  k: number;
  n_cells: number;
  probes: number;
}

const seeds = new Map<number, Promise<SeedResponse>>();

// One network per request, since each seed other than the reference trains
// one from scratch. The widget asks for all three and they arrive separately.
export function fetchSeed(weightSeed: 0 | 1 | 2): Promise<SeedResponse> {
  const waiting = seeds.get(weightSeed);
  if (waiting) return waiting;
  const started = getJson<SeedResponse>(`${BASE}/seeds/${weightSeed}`);
  seeds.set(weightSeed, started);
  return started;
}
