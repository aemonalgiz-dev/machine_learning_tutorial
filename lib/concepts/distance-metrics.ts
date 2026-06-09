// The distance-metrics page's endpoints. One returns the shape of one unit
// away under a metric, one refits the k-nearest crowd under a metric, one
// measures a single pair under all six at once with the working shown, one
// puts three people through the checks a distance has to pass, one refits
// the crowd with its weight column rescaled and again standardised, one fits
// the two clusterers that take a metric under all six, and one measures how
// far the farthest row is beyond the nearest as the feature count grows.

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

// Three ways to the one Euclidean number. The direct route is the
// definition, the raw expansion is the matrix-multiply form on the
// coordinates as given, and the library's is the same expansion after
// shifting both rows toward the remembered rows' mean.
export interface EuclideanRoutes {
  direct: number;
  expanded_raw: number;
  library: number;
}

export interface PairMeasurement {
  distances: SixDistances;
  working: PairWorking;
  orders: OrderedNorm[];
  at_order: number | null;
  euclidean_routes: EuclideanRoutes;
}

export async function measurePair(
  first: Point,
  second: Point,
  order?: number,
): Promise<PairMeasurement> {
  return postJson<PairMeasurement>("/concepts/distance-metrics/between", {
    first,
    second,
    ...(order === undefined ? {} : { order }),
  });
}

// One metric's answers to the four checks on three people: a person against
// themselves, the direct route both ways, the two-leg route by way of the
// third person against the direct one, and a row of zeros against itself.
export interface MetricAxioms {
  metric: MetricName;
  self_distance: number;
  forward: number;
  backward: number;
  leg_one: number;
  leg_two: number;
  via: number;
  triangle_holds: boolean;
  origin_self_distance: number;
}

export interface AxiomsAnswer {
  metrics: MetricAxioms[];
}

export async function checkAxioms(
  first: Point,
  second: Point,
  third: Point,
): Promise<AxiomsAnswer> {
  return postJson<AxiomsAnswer>("/concepts/distance-metrics/axioms", {
    first,
    second,
    third,
  });
}

export type TreatmentName = "raw" | "weight_rescaled" | "standardised";

// The crowd refitted after one treatment of its columns, with the share of
// the squared-gap arithmetic the height column is doing.
export interface Treatment {
  name: TreatmentName;
  query: Point;
  prediction: number;
  neighbours: ChosenNeighbour[];
  ranked: RankedPerson[];
  height_share_of_squared_gaps: number;
}

export interface UnitsAnswer {
  metric: MetricName;
  weight_factor: number;
  treatments: Treatment[];
}

export async function refitUnderUnits(
  points: LabelledPoint[],
  query: Point,
  metric: MetricName,
  k: number,
  weightFactor: number,
): Promise<UnitsAnswer> {
  return postJson<UnitsAnswer>("/concepts/distance-metrics/units", {
    points,
    query,
    metric,
    k,
    weight_factor: weightFactor,
  });
}

// What the density clusterer found under one metric; -1 is a person in no
// group at all.
export interface DensityUnderMetric {
  metric: MetricName;
  n_clusters: number;
  n_noise: number;
  labels: number[];
}

// Single linkage cut at two groups under one metric. The merge heights are
// null when two people leave nothing to merge.
export interface LinkageUnderMetric {
  metric: MetricName;
  labels: number[];
  first_merge: number | null;
  last_merge: number | null;
}

// The mean against the median on the crowd's weight column, which is the
// whole of the reason k-means takes no metric.
export interface CentreArgument {
  mean: number;
  median: number;
  squared_at_mean: number;
  squared_at_median: number;
  absolute_at_mean: number;
  absolute_at_median: number;
}

export interface WardRefusal {
  refused: boolean;
  message: string;
}

export interface ModelsAnswer {
  density: DensityUnderMetric[];
  single_linkage: LinkageUnderMetric[];
  centre_argument: CentreArgument;
  ward_with_manhattan: WardRefusal;
}

export async function fitModelsUnderMetrics(
  points: Point[],
  radius: number,
  minNeighbourhoodSize: number,
): Promise<ModelsAnswer> {
  return postJson<ModelsAnswer>("/concepts/distance-metrics/models", {
    points,
    radius,
    min_neighbourhood_size: minNeighbourhoodSize,
  });
}

// How much further the farthest row sits than the nearest, at one feature
// count: the mean of each row's ratio, and the median of the same ratios.
export interface ContrastAtDimension {
  dimensions: number;
  nearest: number;
  farthest: number;
  relative_contrast: number;
  median_relative_contrast: number;
}

export interface MetricContrast {
  metric: MetricName;
  contrasts: ContrastAtDimension[];
}

export interface DimensionsAnswer {
  n_points: number;
  seed: number;
  dimensions: number[];
  metrics: MetricContrast[];
}

export async function measureDimensions(
  nPoints: number,
  seed: number,
): Promise<DimensionsAnswer> {
  return postJson<DimensionsAnswer>("/concepts/distance-metrics/dimensions", {
    n_points: nPoints,
    seed,
  });
}
