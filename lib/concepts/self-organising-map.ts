// Client functions for the self-organising map page.
//
// Every number here is computed by the API. The fit call is the one the
// playground draws, with the reach exposed so a reader can switch it off and
// watch the map turn back into a plain grouping. The presentation call runs a
// single competition, cooperation and adaptation on cells the caller places by
// hand, which is the only way to show one person's effect on one grid. The
// schedules call reads the two curves epoch by epoch and counts how many cells
// still move. The ablation call refits the same people with each decay held
// still in turn. The topology call fits the same people twice, with the reach
// and without it, and pairs up grid distance against distance in the data. The
// versus call puts a chain with no reach beside the grouping method. The seeds
// call fits from several seeds. The edges call runs the failure table.

import { Point, getJson, postJson } from "@/lib/api";

export interface MapCellPosition {
  row: number;
  column: number;
  x: number;
  y: number;
}

export interface MapWinner {
  row: number;
  column: number;
}

export interface FittedMap {
  grid_width: number;
  grid_height: number;
  units: MapCellPosition[];
  winners: MapWinner[];
  epochs_run: number;
  final_movement: number;
  quantisation_error: number;
}

export interface ReachSetting {
  start: number;
  end: number;
}

// The reach is optional, and left out the API uses its own schedule, half the
// grid's longest side falling to a quarter of a cell.
export async function fitMap(
  points: Point[],
  gridWidth: number,
  gridHeight: number,
  maxEpochs: number,
  reach?: ReachSetting,
): Promise<FittedMap> {
  return postJson<FittedMap>("/concepts/self-organising-map/fit", {
    points,
    grid_width: gridWidth,
    grid_height: gridHeight,
    max_epochs: maxEpochs,
    ...(reach === undefined
      ? {}
      : { radius_start: reach.start, radius_end: reach.end }),
  });
}

export interface PresentedCell {
  row: number;
  column: number;
  is_winner: boolean;
  grid_distance: number;
  score: number;
  before_x: number;
  before_y: number;
  after_x: number;
  after_y: number;
  moved: number;
  distance_before: number;
  distance_after: number;
}

export interface Presentation {
  winner_row: number;
  winner_column: number;
  units: PresentedCell[];
  moving_units: number;
}

export async function presentOnePerson(
  cells: Point[],
  gridWidth: number,
  gridHeight: number,
  person: Point,
  rate: number,
  radius: number,
): Promise<Presentation> {
  return postJson<Presentation>("/concepts/self-organising-map/presentation", {
    units: cells,
    grid_width: gridWidth,
    grid_height: gridHeight,
    person,
    rate,
    radius,
  });
}

export interface EpochSchedule {
  epoch: number;
  rate: number;
  radius: number;
  neighbour_score: number;
  diagonal_score: number;
  moving_units: number;
}

export interface Schedules {
  epochs: EpochSchedule[];
  n_units: number;
  move_threshold: number;
  middle_row: number;
  middle_column: number;
}

// Two widgets read the same curves for one grid and budget, so a page load
// shares one answer per distinct request.
const scheduleCache = new Map<string, Promise<Schedules>>();

export function readSchedules(
  gridWidth: number,
  gridHeight: number,
  maxEpochs: number,
): Promise<Schedules> {
  const body = {
    grid_width: gridWidth,
    grid_height: gridHeight,
    max_epochs: maxEpochs,
  };
  const key = JSON.stringify(body);
  const cached = scheduleCache.get(key);
  if (cached) return cached;
  const pending = postJson<Schedules>(
    "/concepts/self-organising-map/schedules",
    body,
  ).catch((error) => {
    scheduleCache.delete(key);
    throw error;
  });
  scheduleCache.set(key, pending);
  return pending;
}

export interface AblationRun {
  name: string;
  rate_decays: boolean;
  radius_decays: boolean;
  final_movement: number;
  quantisation_error: number;
  correlation: number | null;
  units: MapCellPosition[];
}

export interface Ablation {
  runs: AblationRun[];
}

export async function holdEachDecayStill(
  points: Point[],
  gridWidth: number,
  gridHeight: number,
  maxEpochs: number,
): Promise<Ablation> {
  return postJson<Ablation>("/concepts/self-organising-map/ablation", {
    points,
    grid_width: gridWidth,
    grid_height: gridHeight,
    max_epochs: maxEpochs,
  });
}

export interface CellContents {
  row: number;
  column: number;
  x: number;
  y: number;
  n_people: number;
  people: number[];
  mean_x: number | null;
  mean_y: number | null;
}

export interface CellPair {
  first_row: number;
  first_column: number;
  second_row: number;
  second_column: number;
  grid_distance: number;
  weight_distance: number;
}

export interface MapReport {
  grid_width: number;
  grid_height: number;
  units: MapCellPosition[];
  cells: CellContents[];
  pairs: CellPair[];
  correlation: number | null;
  quantisation_error: number;
  final_movement: number;
  epochs_run: number;
}

export interface WithAndWithoutReach {
  organised: MapReport;
  without_neighbourhood: MapReport;
}

// Three widgets read the same pair of fits, so one page load shares one answer
// per distinct grid.
const topologyCache = new Map<string, Promise<WithAndWithoutReach>>();

export function fitWithAndWithoutReach(
  points: Point[],
  gridWidth: number,
  gridHeight: number,
  maxEpochs: number,
): Promise<WithAndWithoutReach> {
  const body = {
    points,
    grid_width: gridWidth,
    grid_height: gridHeight,
    max_epochs: maxEpochs,
  };
  const key = JSON.stringify(body);
  const cached = topologyCache.get(key);
  if (cached) return cached;
  const pending = postJson<WithAndWithoutReach>(
    "/concepts/self-organising-map/topology",
    body,
  ).catch((error) => {
    topologyCache.delete(key);
    throw error;
  });
  topologyCache.set(key, pending);
  return pending;
}

export interface AgainstGrouping {
  map_labels: number[];
  kmeans_labels: number[];
  same_partition: boolean;
  map_units: Point[];
  kmeans_centres: Point[];
  largest_prototype_gap: number;
  matched_one_to_one: boolean;
  map_quantisation_error: number;
  kmeans_quantisation_error: number;
  with_reach_labels: number[];
  with_reach_same_partition: boolean;
}

export async function compareWithGrouping(
  points: Point[],
  nCells: number,
  maxEpochs: number,
): Promise<AgainstGrouping> {
  return postJson<AgainstGrouping>(
    "/concepts/self-organising-map/versus-k-means",
    { points, n_units: nCells, max_epochs: maxEpochs },
  );
}

export interface SeededMap {
  seed: number;
  units: MapCellPosition[];
  labels: number[];
  same_partition_as_first: boolean;
  identical_to_first: boolean;
  correlation: number | null;
  quantisation_error: number;
  reading_order: number[];
}

export interface SeededMaps {
  fits: SeededMap[];
}

export async function fitFromSeveralSeeds(
  points: Point[],
  gridWidth: number,
  gridHeight: number,
  maxEpochs: number,
  nSeeds = 6,
): Promise<SeededMaps> {
  return postJson<SeededMaps>("/concepts/self-organising-map/seeds", {
    points,
    grid_width: gridWidth,
    grid_height: gridHeight,
    max_epochs: maxEpochs,
    n_seeds: nSeeds,
  });
}

export interface EdgeOutcome {
  edge: string;
  accepted: boolean;
  detail: string;
  figure: number | null;
}

export interface Edges {
  outcomes: EdgeOutcome[];
}

// The failure table is the same for every reader, so one request serves it.
let edgesRequest: Promise<Edges> | null = null;

export function readEdges(): Promise<Edges> {
  if (!edgesRequest) {
    edgesRequest = getJson<Edges>("/concepts/self-organising-map/edges").catch(
      (error) => {
        edgesRequest = null;
        throw error;
      },
    );
  }
  return edgesRequest;
}
