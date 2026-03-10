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

export async function fitSimpleLinearRegression(
  points: Point[],
): Promise<LineFit> {
  let response: Response;
  try {
    response = await fetch(
      `${API_BASE_URL}/concepts/simple-linear-regression/fit`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ points }),
      },
    );
  } catch {
    throw new ApiError(
      "The compute API is not reachable. Is it running?",
      "unreachable",
    );
  }

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    const detail =
      body?.detail && typeof body.detail === "string"
        ? body.detail
        : "The API could not compute this input.";
    throw new ApiError(detail, "refused");
  }

  return (await response.json()) as LineFit;
}
