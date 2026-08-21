// The Hopfield page's endpoints. The recall endpoint, which the playground
// uses, lives in the shared client; these are the further ones. Storage shows
// the outer products the matrix was assembled from; the walk by unit opens a
// sweep into its visits, one cell at a time, under either update rule and any
// seed; states scores any list of states the browser builds, a path from one
// shape to another or a mixture of three; capacity is the measurement the
// page quotes against the literature's figure, computed once and cached;
// self-connection puts a weight back on the diagonal the storage rule
// cleared; and contracts runs the edges the last part of the page lists.

import { getJson, postJson } from "@/lib/api";

export { ApiError, recallPattern } from "@/lib/api";
export type { Recall, RecallPassDocument, SettledInto } from "@/lib/api";
import type { SettledInto } from "@/lib/api";

export type UpdateRuleName = "asynchronous" | "synchronous";

// --- Storage ---------------------------------------------------------------

// What one stored pattern adds to every pair of cells, the outer product of
// the pattern with itself, +1 where two cells agree in it and -1 where they
// disagree, before the division and before the diagonal is cleared.
export interface PatternContribution {
  pattern_index: number;
  products: number[][];
}

// summed is the products added and divided by the cell count with the
// diagonal still holding the load; weights is the library's matrix, which is
// summed with the diagonal cleared.
export interface Storage {
  n_units: number;
  n_stored_patterns: number;
  load: number;
  contributions: PatternContribution[];
  summed: number[][];
  weights: number[][];
  has_self_connections: boolean;
}

export async function storePatterns(patterns: number[][]): Promise<Storage> {
  return postJson<Storage>("/concepts/hopfield/storage", { patterns });
}

// --- The walk, one cell at a time --------------------------------------------

// One cell reading its connections and deciding whether to move. The weighted
// sum is what its connections told it, and under the asynchronous rule the
// energy after is never above the energy before.
export interface UnitVisit {
  pass_number: number;
  visit_number: number;
  unit: number;
  weighted_sum: number;
  value_before: number;
  value_after: number;
  flipped: boolean;
  energy_before: number;
  energy_after: number;
}

// One sweep. weighted_sums is what every cell read at the start of it, which
// the synchronous rule acts on all at once.
export interface UnitWalkPass {
  pass_number: number;
  state: number[];
  energy_before: number;
  energy_after: number;
  units_changed: number;
  weighted_sums: number[];
}

// visits is empty under the synchronous rule, which has none. The oscillation
// period is 2 when the walk ended repeating the state from two sweeps back
// while still moving, and null otherwise.
export interface UnitWalk {
  update_rule: UpdateRuleName;
  n_units: number;
  n_stored_patterns: number;
  load: number;
  initial_energy: number;
  visits: UnitVisit[];
  passes: UnitWalkPass[];
  settled_state: number[];
  settled: boolean;
  stopped_because: string;
  is_fixed_point: boolean;
  settled_into: SettledInto;
  oscillation_period: number | null;
}

export async function walkByUnit(
  patterns: number[][],
  probe: number[],
  options: { updateRule?: UpdateRuleName; randomSeed?: number; maxPasses?: number } = {},
): Promise<UnitWalk> {
  const body: Record<string, unknown> = { patterns, probe };
  if (options.updateRule !== undefined) body.update_rule = options.updateRule;
  if (options.randomSeed !== undefined) body.random_seed = options.randomSeed;
  if (options.maxPasses !== undefined) body.max_passes = options.maxPasses;
  return postJson<UnitWalk>("/concepts/hopfield/walk-by-unit", body);
}

// --- Scoring states the browser built ---------------------------------------

// agreements counts, for each stored pattern in turn, how many cells the
// state shares with it; the cell count means identical and zero means the
// state is that pattern's negation.
export interface StateReport {
  state: number[];
  energy: number;
  is_fixed_point: boolean;
  units_wanting_to_move: number;
  weighted_sums: number[];
  agreements: number[];
  equals: SettledInto;
}

export interface StateScores {
  n_units: number;
  n_stored_patterns: number;
  load: number;
  stored_energies: number[];
  reports: StateReport[];
}

export async function scoreStates(patterns: number[][], states: number[][]): Promise<StateScores> {
  return postJson<StateScores>("/concepts/hopfield/states", { patterns, states });
}

// --- Capacity, measured once -----------------------------------------------------

export interface LoadPoint {
  n_patterns: number;
  load: number;
  exact_share: number;
  corrupted_share: number;
  fixed_point_share: number;
}

export interface SizeSweep {
  n_units: number;
  n_sets: number;
  n_flipped: number;
  points: LoadPoint[];
}

// mean_absolute_overlap is the mean over pairs of stored patterns of the
// absolute inner product over the cell count, 0 for orthogonal and 1 for
// identical or opposite.
export interface PatternSetTrial {
  name: string;
  n_units: number;
  n_patterns: number;
  load: number;
  mean_absolute_overlap: number;
  fixed_point_share: number;
  recovered_share: number;
  n_flipped: number;
}

export interface Capacity {
  sweeps: SizeSweep[];
  comparisons: PatternSetTrial[];
}

// Two widgets read the same fixed measurement, so it is fetched once.
let capacityPromise: Promise<Capacity> | null = null;

export function fetchCapacity(): Promise<Capacity> {
  if (!capacityPromise) capacityPromise = getJson<Capacity>("/concepts/hopfield/capacity");
  return capacityPromise;
}

// --- A weight put back on the diagonal ---------------------------------------

// energy_shift is the constant the self weight adds to every state's energy;
// largest_row_sum is the largest sum of absolute weights in any row away from
// the diagonal, and a self weight above it stops every cell from ever moving.
export interface SelfConnection {
  self_weight: number;
  has_self_connections: boolean;
  weighted_sums_without: number[];
  weighted_sums_with: number[];
  units_wanting_to_move_without: number[];
  units_wanting_to_move_with: number[];
  probe_energy_without: number;
  probe_energy_with: number;
  energy_shift: number;
  largest_row_sum: number;
  settled_state_without: number[];
  settled_into_without: SettledInto;
}

export async function connectToSelf(
  patterns: number[][],
  probe: number[],
  selfWeight: number,
): Promise<SelfConnection> {
  return postJson<SelfConnection>("/concepts/hopfield/self-connection", {
    patterns,
    probe,
    self_weight: selfWeight,
  });
}

// --- The contracts ------------------------------------------------------------

export interface ContractProbe {
  edge: string;
  outcome: "accepted" | "refused";
  error: string | null;
  detail: string;
}

export interface Contracts {
  probes: ContractProbe[];
}

export async function fetchContracts(): Promise<Contracts> {
  return getJson<Contracts>("/concepts/hopfield/contracts");
}
