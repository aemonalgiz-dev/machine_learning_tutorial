// Client functions for the k-means page.
//
// Every number here is computed by the API. The cluster call is the fit the
// playground draws; the walk is one seeded start rerun with its pass budget
// raised one at a time, which is the same walk watched at every stage; the
// restarts, elbow, other-definitions and units calls are the library's own
// fits read out in the shapes the widgets draw; and the centre-choice call is
// the objective's arithmetic on one group, which is why the update step is a
// mean.

import { Point, RegionGrid, postJson } from "@/lib/api";

export interface ClusterFit {
  labels: number[];
  centres: Point[];
  inertia: number;
  iterations_run: number;
  sizes: number[];
  regions: RegionGrid;
}

export async function fitClusters(points: Point[], k: number): Promise<ClusterFit> {
  return postJson<ClusterFit>("/concepts/k-means/cluster", { points, k });
}

export interface WalkStage {
  centres: Point[];
  labels: number[];
  inertia: number;
  regions: RegionGrid;
}

export interface WalkPass {
  pass_number: number;
  labels_used: number[];
  centres: Point[];
  inertia_after_update: number;
  labels_after_assign: number[];
  inertia_after_assign: number;
  largest_shift: number;
  regions: RegionGrid;
}

export interface Walk {
  start: WalkStage;
  passes: WalkPass[];
  settled_pass: number;
  resting_inertia: number;
  best_of_ten_inertia: number;
  rests_in_the_best_valley: boolean;
}

// Two widgets follow the same seeded walk on the crowd, so one page-load
// shares one answer per distinct request.
const walkCache = new Map<string, Promise<Walk>>();

export function walkKMeans(points: Point[], k: number, seed?: number): Promise<Walk> {
  const body = { points, k, ...(seed === undefined ? {} : { seed }) };
  const key = JSON.stringify(body);
  const cached = walkCache.get(key);
  if (cached) return cached;
  const pending = postJson<Walk>("/concepts/k-means/walk", body).catch((error) => {
    walkCache.delete(key);
    throw error;
  });
  walkCache.set(key, pending);
  return pending;
}

export interface SeededFit {
  seed: number;
  labels: number[];
  centres: Point[];
  inertia: number;
  iterations_run: number;
  sizes: number[];
  regions: RegionGrid;
  same_grouping_as_best: boolean;
}

export interface Restarts {
  fits: SeededFit[];
  best_seed: number;
  best_inertia: number;
  with_restarts_inertia: number;
  distinct_inertias: number;
}

export async function compareRestarts(points: Point[], k: number, seeds = 10): Promise<Restarts> {
  return postJson<Restarts>("/concepts/k-means/restarts", { points, k, n_seeds: seeds });
}

export interface ElbowPoint {
  k: number;
  inertia: number;
  sizes: number[];
  drop_from_previous: number | null;
  share_of_total: number;
}

export interface Elbow {
  points: ElbowPoint[];
  total_scatter: number;
}

export async function sweepElbow(points: Point[], maxK = 6): Promise<Elbow> {
  return postJson<Elbow>("/concepts/k-means/elbow", { points, max_k: maxK });
}

export interface DensityGrouping {
  labels: number[];
  n_clusters: number;
  n_noise: number;
}

export interface OtherDefinitions {
  k_means: ClusterFit;
  density: DensityGrouping;
  single_linkage: { labels: number[] };
  mixture: { labels: number[] };
}

export async function groupOtherWays(
  points: Point[],
  k: number,
  radius: number,
  minNeighbourhoodSize = 2,
): Promise<OtherDefinitions> {
  return postJson<OtherDefinitions>("/concepts/k-means/other-definitions", {
    points,
    k,
    radius,
    min_neighbourhood_size: minNeighbourhoodSize,
  });
}

export interface UnitGrouping {
  unit: string;
  factor: number;
  labels: number[];
  centres: Point[];
  inertia: number;
  sizes: number[];
  same_grouping_as_centimetres: boolean;
}

export interface UnitGroupings {
  variants: UnitGrouping[];
  standardised: UnitGrouping;
}

export async function refitInUnits(points: Point[], k: number): Promise<UnitGroupings> {
  return postJson<UnitGroupings>("/concepts/k-means/units", { points, k });
}

export interface CentreChoice {
  mean: Point;
  median: Point;
  squared_at_mean: number;
  squared_at_median: number;
  absolute_at_mean: number;
  absolute_at_median: number;
}

export async function chooseCentre(points: Point[]): Promise<CentreChoice> {
  return postJson<CentreChoice>("/concepts/k-means/centre-choice", { points });
}
