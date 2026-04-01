// The one place the website knows how to reach the compute API.
//
// Every interactive widget fits through here rather than doing the mathematics
// in the browser, so the library stays the single source of truth and the
// frontend stays a view. The base URL is configuration -- the deployed API's
// origin in production, the local FastAPI dev server otherwise.

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";

export interface Point {
  x: number;
  y: number;
}

export interface FittedLine {
  x_start: number;
  y_start: number;
  x_end: number;
  y_end: number;
}

export interface LineFit {
  slope: number;
  intercept: number;
  r_squared: number;
  line: FittedLine;
  residuals: number[];
}

// A typed library refusal comes back as { error, detail }; the widgets show the
// detail, because it is written to be read by a learner. A network failure is
// distinguished from a refusal so the widget can say "can't reach the API"
// rather than blaming the data.
export class ApiError extends Error {
  constructor(
    message: string,
    readonly kind: "refused" | "unreachable",
  ) {
    super(message);
    this.name = "ApiError";
  }
}

// One POST, one place to turn a non-2xx into a readable ApiError. Every call
// below is a thin wrapper over this.
async function postJson<T>(path: string, body: unknown): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch {
    throw new ApiError(
      "The compute API is not reachable. Is it running?",
      "unreachable",
    );
  }

  if (!response.ok) {
    const errorBody = await response.json().catch(() => null);
    const detail =
      errorBody?.detail && typeof errorBody.detail === "string"
        ? errorBody.detail
        : "The API could not compute this input.";
    throw new ApiError(detail, "refused");
  }

  return (await response.json()) as T;
}

export async function fitSimpleLinearRegression(
  points: Point[],
): Promise<LineFit> {
  return postJson<LineFit>("/concepts/simple-linear-regression/fit", { points });
}

// --- Calculus primer: gradient descent on a fixed curve ---------------------

export type DescentFunction = "bowl" | "valley";

export type DescentOutcome = "converged" | "step_limit_reached" | "diverged";

export interface CurvePoint {
  x: number;
  y: number;
}

export interface DescentPoint {
  x: number;
  y: number;
  slope: number;
}

export interface DescentWindow {
  x_min: number;
  x_max: number;
  y_min: number;
  y_max: number;
}

export interface Descent {
  curve: CurvePoint[];
  window: DescentWindow;
  path: DescentPoint[];
  outcome: DescentOutcome;
  minimum: CurvePoint | null;
}

export interface DescentRequest {
  function: DescentFunction;
  start: number;
  learning_rate: number;
  steps?: number;
}

export async function runGradientDescent(
  request: DescentRequest,
): Promise<Descent> {
  return postJson<Descent>("/primers/calculus/descend", request);
}

// The step before descent: the slope of a curve at one point, for the tangent
// explorer.
export interface CurveSlope {
  x: number;
  y: number;
  slope: number;
}

export interface Tangent {
  curve: CurvePoint[];
  window: DescentWindow;
  point: CurveSlope;
}

export interface TangentRequest {
  function: DescentFunction;
  x: number;
}

export async function curveTangent(request: TangentRequest): Promise<Tangent> {
  return postJson<Tangent>("/primers/calculus/tangent", request);
}

// The definition of the derivative: the average rate of change across a gap (the
// secant), and the derivative at the base (the tangent) the secant approaches as
// the gap shrinks.
export interface Secant {
  curve: CurvePoint[];
  window: DescentWindow;
  base_point: CurvePoint;
  second_point: CurvePoint;
  secant_slope: number;
  tangent_slope: number;
}

export interface SecantRequest {
  function: DescentFunction;
  base: number;
  gap: number;
}

export async function curveSecant(request: SecantRequest): Promise<Secant> {
  return postJson<Secant>("/primers/calculus/secant", request);
}

// --- Linear algebra primer: vectors, and a matrix moving the plane ----------

export interface PlanePoint {
  x: number;
  y: number;
}

export interface VectorPair {
  length_first: number;
  length_second: number;
  distance: number;
  dot: number;
  cosine: number | null;
}

export async function measureVectors(
  first: PlanePoint,
  second: PlanePoint,
): Promise<VectorPair> {
  return postJson<VectorPair>("/primers/linear-algebra/vectors", {
    first,
    second,
  });
}

export interface Matrix2x2 {
  a: number;
  b: number;
  c: number;
  d: number;
}

export interface GridSegment {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export interface EigenDirection {
  value: number;
  x: number;
  y: number;
}

export interface PlaneTransform {
  grid_lines: GridSegment[];
  unit_square: PlanePoint[];
  basis_first: PlanePoint;
  basis_second: PlanePoint;
  eigen: EigenDirection[];
  has_real_eigen: boolean;
}

export async function transformPlane(
  matrix: Matrix2x2,
): Promise<PlaneTransform> {
  return postJson<PlaneTransform>("/primers/linear-algebra/transform", matrix);
}

export interface AppliedVector {
  image: PlanePoint;
  aligned: boolean;
  factor: number | null;
  angle_degrees: number | null;
  eigen: EigenDirection[];
  has_real_eigen: boolean;
}

export async function applyMatrix(
  matrix: Matrix2x2,
  vector: PlanePoint,
): Promise<AppliedVector> {
  return postJson<AppliedVector>("/primers/linear-algebra/apply", {
    ...matrix,
    vector,
  });
}

// --- Multiple & polynomial regression, and ridge & lasso ------------------

export interface NamedCoefficient {
  name: string;
  value: number;
}

export interface PolynomialFit {
  coefficients: NamedCoefficient[];
  intercept: number;
  r_squared: number;
  curve: CurvePoint[];
}

export async function fitPolynomial(
  points: Point[],
  degree: number,
): Promise<PolynomialFit> {
  return postJson<PolynomialFit>("/concepts/multiple-polynomial-regression/fit", {
    points,
    degree,
  });
}

export type PenaltyModel = "ridge" | "lasso";

export interface PenalisedFit {
  coefficients: NamedCoefficient[];
  intercept: number;
  r_squared: number;
  nonzero_count: number;
  curve: CurvePoint[];
}

export async function fitPenalised(
  points: Point[],
  model: PenaltyModel,
  penalty: number,
): Promise<PenalisedFit> {
  return postJson<PenalisedFit>("/concepts/ridge-lasso/fit", {
    points,
    model,
    penalty,
  });
}

// --- Classification: logistic, k-nearest neighbours, decision trees --------

export interface Outcome {
  x: number;
  label: number;
}

export interface LogisticFit {
  slope: number;
  intercept: number;
  boundary: number | null;
  accuracy: number;
  curve: CurvePoint[];
}

export async function fitLogistic(
  points: Outcome[],
  learningRate: number,
): Promise<LogisticFit> {
  return postJson<LogisticFit>("/concepts/logistic-regression/fit", {
    points,
    learning_rate: learningRate,
  });
}

export interface LabelledPoint {
  x: number;
  y: number;
  label: number;
}

export interface RegionGrid {
  x_min: number;
  x_max: number;
  y_min: number;
  y_max: number;
  cells: number;
  labels: number[][];
}

export interface ChosenNeighbour {
  index: number;
  distance: number;
  label: number;
}

export interface KnnAnswer {
  prediction: number;
  neighbours: ChosenNeighbour[];
  votes_for_zero: number;
  votes_for_one: number;
  regions: RegionGrid;
}

export async function classifyByNeighbours(
  points: LabelledPoint[],
  query: Point,
  k: number,
): Promise<KnnAnswer> {
  return postJson<KnnAnswer>("/concepts/k-nearest-neighbours/classify", {
    points,
    query,
    k,
  });
}

export interface TreeNodeDocument {
  kind: string;
  samples: number;
  question: string | null;
  left: TreeNodeDocument | null;
  right: TreeNodeDocument | null;
  label: number | null;
}

export interface TreeFit {
  tree: TreeNodeDocument;
  depth: number;
  n_leaves: number;
  accuracy: number;
  regions: RegionGrid;
}

export async function fitTree(
  points: LabelledPoint[],
  maxDepth: number,
): Promise<TreeFit> {
  return postJson<TreeFit>("/concepts/decision-trees/fit", {
    points,
    max_depth: maxDepth,
  });
}

// --- Ensembles: bagging, random forests, gradient boosting -----------------

export interface CommitteeAnswer {
  accuracy: number;
  out_of_bag_score: number;
  roots_on_height: number;
  roots_on_weight: number;
  regions: RegionGrid;
}

export async function fitCommittee(
  kind: "bagging" | "random-forest",
  points: LabelledPoint[],
  nMembers: number,
): Promise<CommitteeAnswer> {
  return postJson<CommitteeAnswer>(`/concepts/ensembles/${kind}`, {
    points,
    n_members: nMembers,
  });
}

export interface BoostingAnswer {
  r_squared: number;
  predictions: number[];
  curve: CurvePoint[];
}

export async function fitBoosting(
  points: Point[],
  rounds: number,
  learningRate: number,
): Promise<BoostingAnswer> {
  return postJson<BoostingAnswer>("/concepts/ensembles/gradient-boosting", {
    points,
    rounds,
    learning_rate: learningRate,
  });
}

// --- The three-dimensional pictures -----------------------------------------

export interface Person3d {
  height: number;
  age: number;
  weight: number;
}

export interface PlaneFit3d {
  height_coefficient: number;
  age_coefficient: number;
  intercept: number;
  r_squared: number;
  heights_axis: number[];
  ages_axis: number[];
  surface: number[][];
}

export async function fitPlane3d(people: Person3d[]): Promise<PlaneFit3d> {
  return postJson<PlaneFit3d>(
    "/concepts/multiple-polynomial-regression/fit-plane",
    { people },
  );
}

export interface LossSurface {
  slopes: number[];
  intercepts: number[];
  rss: number[][];
  minimum: { slope: number; intercept: number; rss: number };
}

export async function lossSurface(points: Point[]): Promise<LossSurface> {
  return postJson<LossSurface>("/concepts/simple-linear-regression/loss-surface", {
    points,
  });
}

export interface LiftedPoint {
  u: number;
  v: number;
  w: number;
  label: number;
}

export interface ClinicLift {
  points: LiftedPoint[];
  plane: { a: number; b: number; c: number; d: number };
  accuracy: number;
}

export async function liftClinic(points: LabelledPoint[]): Promise<ClinicLift> {
  return postJson<ClinicLift>("/concepts/kernel-trick/lift", {
    points,
    kernel: "polynomial",
  });
}

// --- The kernel trick -------------------------------------------------------

export type KernelChoice = "linear" | "polynomial" | "rbf";

export interface KernelAnswer {
  accuracy: number;
  regions: RegionGrid;
}

export async function classifyWithKernel(
  points: LabelledPoint[],
  kernel: KernelChoice,
): Promise<KernelAnswer> {
  return postJson<KernelAnswer>("/concepts/kernel-trick/classify", {
    points,
    kernel,
  });
}

// --- Unsupervised: k-means and principal component analysis ----------------

export interface Clustering {
  labels: number[];
  centres: Point[];
  inertia: number;
  iterations_run: number;
  regions: RegionGrid;
}

export async function clusterPeople(
  points: Point[],
  k: number,
): Promise<Clustering> {
  return postJson<Clustering>("/concepts/k-means/cluster", { points, k });
}

export interface ComponentDocument {
  dx: number;
  dy: number;
  variance: number;
  share: number;
}

export interface PcaAnalysis {
  mean: Point;
  components: ComponentDocument[];
  reconstructions: Point[];
}

export async function analyzeCloud(points: Point[]): Promise<PcaAnalysis> {
  return postJson<PcaAnalysis>("/concepts/pca/analyze", { points });
}

// --- Statistics primer: summaries of a cloud, and draws from a population ---

export interface CloudSummary {
  mean_x: number;
  mean_y: number;
  variance_x: number;
  variance_y: number;
  standard_deviation_x: number;
  standard_deviation_y: number;
  covariance: number;
  correlation: number | null;
}

export async function summarizeCloud(points: Point[]): Promise<CloudSummary> {
  return postJson<CloudSummary>("/primers/statistics/summarize", { points });
}

export interface HistogramBin {
  start: number;
  end: number;
  count: number;
}

export interface SampleDraw {
  values: number[];
  count: number;
  mean: number;
  standard_deviation: number;
  bins: HistogramBin[];
  true_mean: number;
  true_standard_deviation: number;
}

export async function drawSample(
  values: number[],
  draw: number,
  seed: number,
): Promise<SampleDraw> {
  return postJson<SampleDraw>("/primers/statistics/sample", {
    values,
    draw,
    seed,
  });
}
