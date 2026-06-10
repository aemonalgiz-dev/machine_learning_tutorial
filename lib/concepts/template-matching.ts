// Client functions for the template matching page.
//
// Every number here is computed by the API. What is unusual about this page is
// how much of the response is pixels: the scene, the template and the score
// surface all arrive as nested lists of brightness, because the browser draws
// pictures here and nothing on the site did that before. A grid carries its own
// darkest and brightest value, since a greyscale drawing means nothing until
// the two ends of its scale are known and the ends differ from picture to
// picture.
//
// The fixed requests are cached in module-level promises. There are three
// scenes and five standing reports, all of them constant, and several widgets
// want the same one.

import { getJson, postJson } from "@/lib/api";

const BASE = "/concepts/template-matching";

export type SceneName = "workbench" | "unlit" | "relit";

export interface PictureGrid {
  rows: number[][];
  height: number;
  width: number;
  darkest: number;
  brightest: number;
}

export interface Position {
  row: number;
  column: number;
  score: number;
}

export interface Believability {
  ratio: number;
  is_infinite: boolean;
  believable: boolean;
  runner_up: Position;
}

export interface RuleResult {
  rule: string;
  higher_is_better: boolean;
  perfect_score: number;
  best: Position;
  at_the_motifs: Position[];
  surface: PictureGrid;
  believability: Believability | null;
}

export interface SearchResponse {
  scene_title: string;
  scene: PictureGrid;
  template: PictureGrid;
  motif_positions: number[][];
  n_positions: number;
  n_pixels_read: number;
  results: RuleResult[];
}

const searches = new Map<SceneName, Promise<SearchResponse>>();

export function searchScene(scene: SceneName): Promise<SearchResponse> {
  const waiting = searches.get(scene);
  if (waiting) return waiting;
  const started = postJson<SearchResponse>(`${BASE}/search`, { scene });
  searches.set(scene, started);
  return started;
}

export interface HandCell {
  row: number;
  column: number;
  scores: number[];
}

export interface HandSizedResponse {
  picture: PictureGrid;
  template: PictureGrid;
  template_from: Position;
  rules: string[];
  higher_is_better: boolean[];
  perfect_scores: number[];
  cells: HandCell[];
  n_positions: number;
  n_pixels_read: number;
  best: Position[];
  correlation_ties: Position[];
}

let handSized: Promise<HandSizedResponse> | null = null;

export function fetchHandSized(): Promise<HandSizedResponse> {
  handSized ??= getJson<HandSizedResponse>(`${BASE}/hand-sized`);
  return handSized;
}

export interface ChangedThing {
  change: string;
  scene: PictureGrid;
  template: PictureGrid;
  drawn_at: number[];
  at_the_truth: Position;
  best: Position;
  pixels_away: number;
  surface: PictureGrid;
}

export interface ChangedThingResponse {
  cases: ChangedThing[];
  doubled_corner: ChangedThing;
  doubled_corner_contains_the_original: boolean;
  doubled_corner_copy_at: number[];
  doubled_corner_ratio: number;
  doubled_corner_believable: boolean;
}

let changedThing: Promise<ChangedThingResponse> | null = null;

export function fetchChangedThing(): Promise<ChangedThingResponse> {
  changedThing ??= getJson<ChangedThingResponse>(`${BASE}/changed-thing`);
  return changedThing;
}

export interface SeedRatios {
  seed: number;
  absent_ratio: number;
  absent_best_score: number;
  present_ratio: number;
  present_best_score: number;
}

export interface SizeRow {
  side: number;
  mean_chance_agreement: number;
  highest_chance_agreement: number;
  absent_low: number | null;
  absent_high: number | null;
  present_low: number | null;
  present_high: number | null;
  present_below_threshold: number | null;
  n_seeds: number;
  has_a_second_candidate: boolean;
}

export interface BelievabilityResponse {
  threshold: number;
  template_side: number;
  texture_side: number;
  seeds: SeedRatios[];
  absent_low: number;
  absent_high: number;
  present_low: number;
  present_high: number;
  absent_score_low: number;
  absent_score_high: number;
  sizes: SizeRow[];
  n_chance_seeds: number;
}

let believability: Promise<BelievabilityResponse> | null = null;

export function fetchBelievability(): Promise<BelievabilityResponse> {
  believability ??= getJson<BelievabilityResponse>(`${BASE}/believability`);
  return believability;
}

export interface CostRow {
  picture_side: number;
  template_side: number;
  n_positions: number;
  n_pixels_read: number;
}

export interface CostResponse {
  rows: CostRow[];
  n_angles: number;
  n_scales: number;
  largest_row: CostRow;
  n_pixels_read_over_angles_and_scales: number;
}

let cost: Promise<CostResponse> | null = null;

export function fetchCost(): Promise<CostResponse> {
  cost ??= getJson<CostResponse>(`${BASE}/cost`);
  return cost;
}

// The ramp and undefined-case reports are quoted in the page's prose rather
// than drawn, so there is no client function for them here. The numbers are
// pinned by the tests beside those endpoints, which is what keeps the prose
// honest; a widget wrapper that nothing rendered would only be dead weight.
