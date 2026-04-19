// The distance-metrics page's endpoints. One returns the shape of one unit
// away under a metric, one refits the k-nearest crowd under a metric, and one
// measures a single pair under all six at once, with the working shown.

import {
  ChosenNeighbour,
  LabelledPoint,
  Point,
  RegionGrid,
  postJson,
} from "@/lib/api";

export type MetricName =
  | "euclidean"
  | "manhattan"
  | "chebyshev"
  | "cosine"
  | "hamming"
  | "canberra";

// In the order the library declares them, which is the order the page draws.
export const METRIC_NAMES: readonly MetricName[] = [
  "euclidean",
  "manhattan",
  "chebyshev",
  "cosine",
  "hamming",
  "canberra",
];

export const METRIC_TITLES: Record<MetricName, string> = {
  euclidean: "Euclidean",
  manhattan: "Manhattan",
  chebyshev: "Chebyshev",
  cosine: "Cosine",
  hamming: "Hamming",
  canberra: "Canberra",
};

// The metric's distance at every cell of a lattice around a centre, with the
// cells within one unit and the cells at exactly one unit already picked out.
// The grids are row-major from the bottom-left, like the region grids.
export interface UnitShape {
  metric: MetricName;
  centre: Point;
  x_min: number;
  x_max: number;
  y_min: number;
  y_max: number;
  cells: number;
  distances: number[][];
  inside: boolean[][];
  on_boundary: boolean[][];
  inside_count: number;
  boundary_count: number;
}

export async function unitShape(
  metric: MetricName,
  centre: Point,
): Promise<UnitShape> {
  return postJson<UnitShape>("/concepts/distance-metrics/unit-circle", {
    metric,
    centre,
  });
}

// One stored person, where they came in the query's ranking under the
// metric, and whether they were among the k who voted.
export interface RankedPerson {
  index: number;
  distance: number;
  label: number;
  chosen: boolean;
}

export interface MetricNeighboursAnswer {
  metric: MetricName;
  prediction: number;
  neighbours: ChosenNeighbour[];
  ranked: RankedPerson[];
  votes_for_zero: number;
  votes_for_one: number;
  regions: RegionGrid;
}

export async function neighboursUnder(
  points: LabelledPoint[],
  query: Point,
  metric: MetricName,
  k: number,
): Promise<MetricNeighboursAnswer> {
  return postJson<MetricNeighboursAnswer>(
    "/concepts/distance-metrics/neighbours",
    { points, query, metric, k },
  );
}

export type SixDistances = Record<MetricName, number>;

// The intermediate numbers a hand calculation of the six passes through.
export interface PairWorking {
  gap_x: number;
  gap_y: number;
  dot_product: number;
  first_length: number;
  second_length: number;
  cosine_similarity: number;
  canberra_terms: number[];
  differing_features: number;
  feature_count: number;
}

// The p-norm of the pair's gap at one order. A null order is infinity, which
// JSON cannot spell, and the page writes the symbol itself.
export interface OrderedNorm {
  order: number | null;
  distance: number;
}

export interface PairMeasurement {
  distances: SixDistances;
  working: PairWorking;
  orders: OrderedNorm[];
}

export async function measurePair(
  first: Point,
  second: Point,
): Promise<PairMeasurement> {
  return postJson<PairMeasurement>("/concepts/distance-metrics/between", {
    first,
    second,
  });
}
