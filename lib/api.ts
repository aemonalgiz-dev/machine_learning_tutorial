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
