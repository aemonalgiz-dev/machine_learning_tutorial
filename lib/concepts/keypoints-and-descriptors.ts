// Client functions for the keypoints and descriptors page.
//
// Every number here is computed by the API. The detect endpoint takes the
// settings a reader moves and answers a picture, its corner scores and the
// peaks kept from them; the five fixed endpoints answer the arithmetic the
// page works through, on pictures that never change, so their promises are
// cached at module level and shared between the widgets that need them.

import { getJson, postJson } from "@/lib/api";

export type SceneName =
  | "workbench"
  | "relit"
  | "turned"
  | "square"
  | "floor"
  | "horizon";

export type MeasureName = "smallest_eigenvalue" | "harris";

export interface KeypointReport {
  row: number;
  column: number;
  strength: number;
}

export interface DetectSettings {
  scene?: SceneName;
  measure?: MeasureName;
  sensitivity?: number;
  window_side?: number;
  minimum_strength?: number;
  separation?: number;
  border?: number;
  limit?: number | null;
}

export interface Detection {
  height: number;
  width: number;
  picture: number[][];
  picture_low: number;
  picture_high: number;
  scores: number[][];
  score_low: number;
  score_high: number;
  keypoints: KeypointReport[];
  n_candidates: number;
  n_keypoints: number;
}

const PREFIX = "/concepts/keypoints-and-descriptors";

export async function detectKeypoints(
  settings: DetectSettings,
): Promise<Detection> {
  return postJson<Detection>(`${PREFIX}/detect`, settings);
}

export interface GradientVector {
  across: number;
  down: number;
}

export interface ProbeReport {
  name: string;
  row: number;
  column: number;
  gradients: GradientVector[][];
  horizontal_squared: number;
  vertical_squared: number;
  cross: number;
  trace: number;
  determinant: number;
  smallest_eigenvalue: number;
  harris: number;
}

export interface WindowStep {
  window_side: number;
  corner_score: number;
  brightest: number;
  n_keypoints: number;
}

export interface WhyACorner {
  height: number;
  width: number;
  picture: number[][];
  probes: ProbeReport[];
  trace_ratio: number;
  window_sweep: WindowStep[];
  harris_sensitivity: number;
  harris_at_high_sensitivity: number;
  harris_keypoints_at_high_sensitivity: number;
}

export interface SlidStep {
  row: number;
  patch: number[][];
  distance_from_edge: number;
  distance_from_corner: number;
}

export interface Aperture {
  height: number;
  width: number;
  picture: number[][];
  edge_row: number;
  corner_row: number;
  column: number;
  edge_patch: number[][];
  corner_patch: number[][];
  steps: SlidStep[];
  edge_matches: number;
  corner_matches: number;
}

export interface SeparationStep {
  separation: number;
  n_keypoints: number;
}

export interface Suppression {
  height: number;
  width: number;
  picture: number[][];
  scores: number[][];
  score_high: number;
  square_candidates: number;
  square_sweep: SeparationStep[];
  scene_candidates: number;
  scene_sweep: SeparationStep[];
  border: number;
  without_border: KeypointReport[];
  in_order: KeypointReport[];
  out_of_order: KeypointReport[];
  shoulder_score: number;
  corner_score: number;
}

export interface NamedDistance {
  name: string;
  distance: number;
}

export interface DescriptorReport {
  height: number;
  width: number;
  picture: number[][];
  row: number;
  column: number;
  side: number;
  raw: number[][];
  centred: number[][];
  unit: number[][];
  patch_mean: number;
  centred_length: number;
  comparisons: NamedDistance[];
  shift_rows: number;
  shift_columns: number;
  shifted_strengths_agree: boolean;
  shifted_positions_agree: boolean;
  turned_gaps: number[];
}

export interface MatchReport {
  from_row: number;
  from_column: number;
  to_row: number;
  to_column: number;
  distance: number;
  runner_up_distance: number;
  ratio: number;
  kept: boolean;
}

export interface MatchScene {
  name: string;
  label: string;
  height: number;
  width: number;
  first_picture: number[][];
  second_picture: number[][];
  first_keypoints: KeypointReport[];
  second_keypoints: KeypointReport[];
  matches: MatchReport[];
  n_kept: number;
}

export interface Matching {
  maximum_ratio: number;
  scenes: MatchScene[];
}

export interface StrayMatch {
  from_row: number;
  from_column: number;
  to_row: number;
  to_column: number;
  distance: number;
  runner_up_distance: number;
  ratio: number;
}

export interface SceneReport {
  n_keypoints: number;
  minimum_strength: number;
  lighting_scale: number;
  score_ratio: number;
  relit_score_low: number;
  relit_score_high: number;
  relit_descriptor_gap: number;
  turned_positions_agree: boolean;
  n_turned_keypoints: number;
  turned_gap_low: number;
  turned_gap_high: number;
  n_matches: number;
  n_kept: number;
  n_refused: number;
  n_refused_on_the_repeated_motif: number;
  n_on_the_same_position: number;
  strays: StrayMatch[];
  refused_ratio_low: number;
  n_positions: number;
  distinct_descriptions: number;
  n_sharing_a_description: number;
  largest_identical_group: number;
  dense_numbers: number;
  sparse_numbers: number;
  dense_pairs: number;
  sparse_pairs: number;
  dense_seconds: number;
  sparse_seconds: number;
}

export interface WithoutCorners {
  height: number;
  width: number;
  first_picture: number[][];
  second_picture: number[][];
  shift_rows: number;
  score_high: number;
  n_keypoints: number;
  n_positions: number;
  n_flat_positions: number;
  n_informative_positions: number;
  n_recovering_the_shift: number;
  furthest_true_partner: number;
}

// The fixed reports never change, and several widgets want the same one,
// so each is fetched once per page load and shared.
let whyACornerPromise: Promise<WhyACorner> | null = null;
let aperturePromise: Promise<Aperture> | null = null;
let suppressionPromise: Promise<Suppression> | null = null;
let descriptorPromise: Promise<DescriptorReport> | null = null;
let matchingPromise: Promise<Matching> | null = null;
let sceneReportPromise: Promise<SceneReport> | null = null;
let withoutCornersPromise: Promise<WithoutCorners> | null = null;

export async function fetchWhyACorner(): Promise<WhyACorner> {
  whyACornerPromise ??= getJson<WhyACorner>(`${PREFIX}/why-a-corner`);
  return whyACornerPromise;
}

export async function fetchAperture(): Promise<Aperture> {
  aperturePromise ??= getJson<Aperture>(`${PREFIX}/aperture`);
  return aperturePromise;
}

export async function fetchSuppression(): Promise<Suppression> {
  suppressionPromise ??= getJson<Suppression>(`${PREFIX}/suppression`);
  return suppressionPromise;
}

export async function fetchDescriptor(): Promise<DescriptorReport> {
  descriptorPromise ??= getJson<DescriptorReport>(`${PREFIX}/descriptor`);
  return descriptorPromise;
}

export async function fetchMatching(): Promise<Matching> {
  matchingPromise ??= getJson<Matching>(`${PREFIX}/matching`);
  return matchingPromise;
}

export async function fetchSceneReport(): Promise<SceneReport> {
  sceneReportPromise ??= getJson<SceneReport>(`${PREFIX}/scene-report`);
  return sceneReportPromise;
}

export async function fetchWithoutCorners(): Promise<WithoutCorners> {
  withoutCornersPromise ??= getJson<WithoutCorners>(`${PREFIX}/without-corners`);
  return withoutCornersPromise;
}
