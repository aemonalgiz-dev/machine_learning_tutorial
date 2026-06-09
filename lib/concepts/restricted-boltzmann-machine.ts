// The generative page's further endpoints. The fit and reconstruct calls the
// playground uses live in the shared client; these are the seven the later
// parts of the page measure with. Step replays the learning rule one update at
// a time and hands back both counts beside the weights before and after;
// states scores any list of grids the browser builds against one fit; the two
// sweeps refit at a list of walk lengths and at a list of hidden widths; seeds
// refits under several seeds and also fits the first of them twice; against
// memory puts the same shapes and the same grids to this model and to the
// associative memory of the page before it; and contracts runs every edge the
// last part of the page lists.

import { getJson, postJson } from "@/lib/api";

export { ApiError, fitBoltzmann, reconstructWithBoltzmann } from "@/lib/api";
export type {
  BoltzmannFit,
  BoltzmannReconstruction,
  BoltzmannRowDocument,
} from "@/lib/api";

import type { BoltzmannRowDocument } from "@/lib/api";

// --- One learning step at a time --------------------------------------------

// One update. The data counts are measured with the cells held at the stored
// patterns, the chain counts after the machine has been let go for a single
// alternation, and both tables have one row per cell and one column per hidden
// unit. The chain grid is what the machine actually drew, one row per pattern.
export interface BoltzmannStep {
  step_number: number;
  learning_rate: number;
  data_correlations: number[][];
  chain_correlations: number[][];
  data_visible_means: number[];
  chain_visible_means: number[];
  chain_visible: number[][];
  weight_change: number[][];
  weights_after: number[][];
  visible_bias_after: number[];
  hidden_bias_after: number[];
  largest_movement: number;
}

export interface BoltzmannStepTrace {
  n_visible_units: number;
  n_hidden_units: number;
  learning_rate: number;
  starting_weights: number[][];
  steps: BoltzmannStep[];
}

export async function traceBoltzmannSteps(
  patterns: number[][],
  hiddenUnits: number,
  steps: number,
): Promise<BoltzmannStepTrace> {
  return postJson<BoltzmannStepTrace>("/concepts/rbm/step", {
    patterns,
    n_hidden_units: hiddenUnits,
    n_steps: steps,
  });
}

// --- Scoring grids the browser built ----------------------------------------

// The stored patterns and the supplied grids read off one fit, in the same
// document, so a grid that happens to be a stored pattern reports exactly what
// that pattern reports.
export interface BoltzmannStates {
  n_visible_units: number;
  n_hidden_units: number;
  epochs_run: number;
  reconstruction_error: number;
  stored: BoltzmannRowDocument[];
  states: BoltzmannRowDocument[];
}

export async function scoreBoltzmannStates(
  patterns: number[][],
  hiddenUnits: number,
  maxEpochs: number,
  states: number[][],
): Promise<BoltzmannStates> {
  return postJson<BoltzmannStates>("/concepts/rbm/states", {
    patterns,
    n_hidden_units: hiddenUnits,
    max_epochs: maxEpochs,
    states,
  });
}

// --- The probe rebuilt as the walk lengthens --------------------------------

// distance_to_target is the mean squared gap between what came back and the
// undamaged shape the probe was made from, and cells_matching_target rounds
// the rebuilt cells and counts how many land on it.
export interface BoltzmannEpochPoint {
  max_epochs: number;
  epochs_run: number;
  stored_reconstruction_error: number;
  probe_reconstruction: number[];
  probe_hidden_probabilities: number[];
  probe_free_energy: number;
  stored_free_energies: number[];
  distance_to_target: number;
  cells_matching_target: number;
}

export interface BoltzmannEpochSweep {
  n_visible_units: number;
  n_hidden_units: number;
  target: number[];
  points: BoltzmannEpochPoint[];
}

export async function sweepBoltzmannEpochs(
  patterns: number[][],
  hiddenUnits: number,
  probe: number[],
  target: number[],
  epochCounts: number[],
): Promise<BoltzmannEpochSweep> {
  return postJson<BoltzmannEpochSweep>("/concepts/rbm/epoch-sweep", {
    patterns,
    n_hidden_units: hiddenUnits,
    probe,
    target,
    epoch_counts: epochCounts,
  });
}

// --- How wide the hidden layer needs to be ----------------------------------

// codes rounds each pattern's hidden probabilities to nought or one, and
// n_distinct_codes counts how many of those differ, which is how many shapes
// the width can keep apart at all.
export interface BoltzmannWidthPoint {
  n_hidden_units: number;
  reconstruction_error: number;
  worst_pattern_error: number;
  codes: number[][];
  n_distinct_codes: number;
  patterns_rebuilt_exactly: number;
}

export interface BoltzmannWidthSweep {
  n_visible_units: number;
  n_patterns: number;
  max_epochs: number;
  points: BoltzmannWidthPoint[];
}

export async function sweepBoltzmannWidths(
  patterns: number[][],
  maxEpochs: number,
  hiddenCounts: number[],
): Promise<BoltzmannWidthSweep> {
  return postJson<BoltzmannWidthSweep>("/concepts/rbm/hidden-sweep", {
    patterns,
    max_epochs: maxEpochs,
    hidden_counts: hiddenCounts,
  });
}

// --- What a seed fixes ------------------------------------------------------

export interface BoltzmannSeedRun {
  seed: number;
  reconstruction_error: number;
  codes: number[][];
  free_energies: number[];
  largest_weight: number;
  codes_all_distinct: boolean;
}

// repeat_weight_gap is the largest difference between two fits run under the
// first seed twice over; across_seed_weight_gap is the same measurement
// between the first two seeds.
export interface BoltzmannSeeds {
  runs: BoltzmannSeedRun[];
  repeat_weight_gap: number;
  repeat_error_gap: number;
  across_seed_weight_gap: number | null;
  error_spread: number;
}

export async function fitBoltzmannUnderSeeds(
  patterns: number[][],
  hiddenUnits: number,
  maxEpochs: number,
  seeds: number[],
): Promise<BoltzmannSeeds> {
  return postJson<BoltzmannSeeds>("/concepts/rbm/seeds", {
    patterns,
    n_hidden_units: hiddenUnits,
    max_epochs: maxEpochs,
    seeds,
  });
}

// --- Beside the memory that stores exactly ----------------------------------

// settled is where the memory comes to rest from the same grid and settled_into
// names which stored shape that is, or null. rebuilt_rounds_to is the same
// question for what the machine gives back, rounded cell by cell.
export interface BoltzmannBesideMemory {
  state: number[];
  free_energy: number;
  reversed_free_energy: number;
  memory_energy: number;
  reversed_memory_energy: number;
  rebuilt: number[];
  settled: number[];
  settled_into: number | null;
  settled_inverted: boolean;
  rebuilt_rounds_to: number | null;
}

export interface BoltzmannAgainstMemory {
  n_visible_units: number;
  stored_free_energies: number[];
  stored_memory_energies: number[];
  reports: BoltzmannBesideMemory[];
  largest_reversal_gap: number;
  largest_memory_reversal_gap: number;
}

export async function compareBoltzmannWithMemory(
  patterns: number[][],
  hiddenUnits: number,
  maxEpochs: number,
  states: number[][],
): Promise<BoltzmannAgainstMemory> {
  return postJson<BoltzmannAgainstMemory>("/concepts/rbm/against-memory", {
    patterns,
    n_hidden_units: hiddenUnits,
    max_epochs: maxEpochs,
    states,
  });
}

// --- The contracts ----------------------------------------------------------

export interface BoltzmannContractProbe {
  edge: string;
  outcome: "accepted" | "refused";
  detail: string;
}

export interface BoltzmannContracts {
  probes: BoltzmannContractProbe[];
}

export async function fetchBoltzmannContracts(): Promise<BoltzmannContracts> {
  return getJson<BoltzmannContracts>("/concepts/rbm/contracts");
}
