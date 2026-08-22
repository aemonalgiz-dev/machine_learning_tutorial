// The polynomial-features page's endpoints: the columns an expansion builds and
// what is in them, how many there are at each degree and each original width,
// one curve fitted through the crowd and sampled for drawing, the degree swept
// with and without a penalty on people the fit never saw, a plane against the
// powers against the powers and the products, what a change of unit does to a
// column that has been raised to a power, and the same people fitted by straight
// cuts instead.

import { Point, postJson, getJson } from "@/lib/api";

// One factor of a term, a column and the power it is raised to.
export interface Exponent {
  feature: string;
  exponent: number;
}

// One column the expansion built, named for the term that produced it. values
// are in the order the people were sent.
export interface ExpandedTerm {
  name: string;
  exponents: Exponent[];
  total_degree: number;
  values: number[];
}

export interface Expansion {
  source_names: string[];
  terms: ExpandedTerm[];
  n_terms: number;
}

export interface NamedColumn {
  name: string;
  values: number[];
}

export async function expandColumns(
  columns: NamedColumn[],
  degree: number,
  includeInteractions: boolean,
): Promise<Expansion> {
  return postJson<Expansion>("/concepts/polynomial-features/expansion", {
    columns,
    degree,
    include_interactions: includeInteractions,
  });
}

export interface CountRow {
  width: number;
  counts: number[];
}

export interface ColumnCounts {
  widths: number[];
  degrees: number[];
  rows: CountRow[];
}

// The growth table is the same for every reader, so one page-load fetches it
// once however many widgets ask.
let countsRequest: Promise<ColumnCounts> | null = null;

export async function fetchColumnCounts(): Promise<ColumnCounts> {
  if (!countsRequest) {
    countsRequest = getJson<ColumnCounts>(
      "/concepts/polynomial-features/column-counts",
    ).catch((error) => {
      countsRequest = null;
      throw error;
    });
  }
  return countsRequest;
}

export interface NamedCoefficient {
  name: string;
  value: number;
}

// fitted and residuals carry one entry per person sent, in that order, whichever
// half of the split they landed in, so a miss can be drawn under the person that
// produced it.
export interface CurveFit {
  n_terms: number;
  term_names: string[];
  coefficients: NamedCoefficient[];
  intercept: number;
  n_training_rows: number;
  held_out_indices: number[];
  train_r_squared: number;
  held_out_r_squared: number;
  residual_sum_of_squares: number;
  fitted: number[];
  residuals: number[];
  curve: Point[];
}

export interface CurveOptions {
  penalty?: number;
  standardise?: boolean;
}

export async function fitCurve(
  points: Point[],
  degree: number,
  options: CurveOptions = {},
): Promise<CurveFit> {
  return postJson<CurveFit>("/concepts/polynomial-features/curve-fit", {
    points,
    degree,
    ...(options.penalty === undefined ? {} : { penalty: options.penalty }),
    ...(options.standardise === undefined
      ? {}
      : { standardise: options.standardise }),
  });
}

export interface PenalisedReading {
  penalty: number;
  train_r_squared: number;
  held_out_r_squared: number;
}

export interface DegreeReading {
  degree: number;
  n_terms: number;
  train_r_squared: number;
  held_out_r_squared: number;
  penalised: PenalisedReading[];
}

// interpolating_degree is where the fit has as many numbers to set as there are
// people to set them from.
export interface DegreeGap {
  n_training_rows: number;
  held_out_indices: number[];
  readings: DegreeReading[];
  best_held_out_degree: number;
  best_held_out_score: number;
  worst_held_out_degree: number;
  worst_held_out_score: number;
  interpolating_degree: number;
}

const gapCache = new Map<string, Promise<DegreeGap>>();

export async function sweepDegreeGap(
  points: Point[],
  maxDegree: number,
  penalties: number[] = [],
  standardise = true,
): Promise<DegreeGap> {
  const body = {
    points,
    max_degree: maxDegree,
    penalties,
    standardise,
  };
  const key = JSON.stringify(body);
  const cached = gapCache.get(key);
  if (cached) return cached;
  const pending = postJson<DegreeGap>(
    "/concepts/polynomial-features/degree-gap",
    body,
  ).catch((error) => {
    gapCache.delete(key);
    throw error;
  });
  gapCache.set(key, pending);
  return pending;
}

export interface PersonThreeWays {
  height: number;
  girth: number;
  weight: number;
}

export interface ColumnSetFit {
  label: string;
  n_terms: number;
  term_names: string[];
  r_squared: number;
  residual_sum_of_squares: number;
}

// What a fixed amount of girth is worth at one height, read off the people and
// then asked of each fit. A plane has to answer the same number everywhere.
export interface GirthGain {
  height: number;
  from_girth: number;
  to_girth: number;
  measured: number;
  plane: number;
  expanded: number;
}

export interface TwoColumnAnswer {
  correlation: number;
  fits: ColumnSetFit[];
  gains: GirthGain[];
}

export async function compareColumnSets(
  people: PersonThreeWays[],
  degree: number,
): Promise<TwoColumnAnswer> {
  return postJson<TwoColumnAnswer>(
    "/concepts/polynomial-features/two-columns",
    { people, degree },
  );
}

export interface ColumnSpan {
  name: string;
  smallest: number;
  largest: number;
}

export interface UnitReading {
  unit: string;
  factor: number;
  columns: ColumnSpan[];
  span_ratio: number;
  plain_r_squared: number;
  penalised_r_squared: number;
  penalised_coefficients: NamedCoefficient[];
  tree_r_squared: number;
}

export interface HighDegreeReading {
  reading: string;
  degree: number;
  largest_value: number;
  train_r_squared: number;
  held_out_r_squared: number;
}

export interface UnitAnswer {
  readings: UnitReading[];
  high_degree: HighDegreeReading[];
}

export async function measureUnits(
  points: Point[],
  degree: number,
  penalty: number,
): Promise<UnitAnswer> {
  return postJson<UnitAnswer>("/concepts/polynomial-features/units", {
    points,
    degree,
    penalty,
  });
}

export interface StepReading {
  depth: number;
  n_leaves: number;
  train_r_squared: number;
  held_out_r_squared: number;
}

export interface StepComparison {
  n_training_rows: number;
  held_out_indices: number[];
  curve_readings: DegreeReading[];
  step_readings: StepReading[];
  best_curve_degree: number;
  best_curve_score: number;
  worst_curve_score: number;
  best_step_depth: number;
  best_step_score: number;
  worst_step_score: number;
}

export async function compareAgainstSteps(
  points: Point[],
  maxDegree: number,
): Promise<StepComparison> {
  return postJson<StepComparison>(
    "/concepts/polynomial-features/against-a-tree",
    { points, max_degree: maxDegree },
  );
}
