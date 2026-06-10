"use client";

// One held-out picture searched against the whole collection, twice.
//
// The left of the widget is the exact answer, every one of the 4000 pictures
// measured and the k nearest kept. The right is the inverted file, the
// collection cut into cells by k-means and only the few cells whose centres
// are nearest the query searched. The map underneath places every picture on
// the two directions of greatest spread in the sixteen numbers, and lights the
// cells the index opened, so a reader can see which part of the collection it
// read and which part it never looked at. The API computes every distance,
// every cell and the projection; the browser only draws.

import { useEffect, useMemo, useState } from "react";
import { ApiError } from "@/lib/api";
import {
  CellCount,
  MapResponse,
  OverviewResponse,
  SearchResponse,
  fetchCollectionMap,
  fetchOverview,
  fetchTradeOff,
  searchOne,
} from "@/lib/concepts/searching-a-collection-of-pictures";
import {
  KIND_ORDER,
  KindKey,
  Loading,
  PictureTile,
  Stat,
  kindColour,
} from "./searchingPicturesShared";

const MAP = { width: 560, height: 330, pad: 14 };
const CELL_COUNTS: CellCount[] = [16, 32, 64];

export function PictureSearchPlayground() {
  const [map, setMap] = useState<MapResponse | null>(null);
  const [overview, setOverview] = useState<OverviewResponse | null>(null);
  const [worstQuery, setWorstQuery] = useState<number | null>(null);
  const [result, setResult] = useState<SearchResponse | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [query, setQuery] = useState(0);
  const [k, setK] = useState(10);
  const [nCells, setNCells] = useState<CellCount>(32);
  const [probes, setProbes] = useState(1);

  useEffect(() => {
    let current = true;
    Promise.all([fetchCollectionMap(), fetchOverview()])
      .then(([loadedMap, loadedOverview]) => {
        if (!current) return;
        setMap(loadedMap);
        setOverview(loadedOverview);
      })
      .catch((error) => {
        if (current) setMessage(error instanceof ApiError ? error.message : "Something went wrong.");
      });
    // The trade-off report names the question one cell serves worst. It is
    // slower to compute than the map, so the button waits for it rather than
    // the whole widget.
    fetchTradeOff()
      .then((report) => {
        const thirtyTwo = report.cell_counts.find((cells) => cells.n_cells === 32);
        const oneCell = thirtyTwo?.rows.find((row) => row.probes === 1);
        if (current && oneCell) setWorstQuery(oneCell.worst_query);
      })
      .catch(() => {
        // The button simply stays hidden; every other part of the widget works.
      });
    return () => {
      current = false;
    };
  }, []);

  useEffect(() => {
    let current = true;
    searchOne({ query, k, n_cells: nCells, probes: Math.min(probes, nCells) })
      .then((loaded) => {
        if (current) setResult(loaded);
      })
      .catch((error) => {
        if (current) setMessage(error instanceof ApiError ? error.message : "Something went wrong.");
      });
    return () => {
      current = false;
    };
  }, [query, k, nCells, probes]);

  const bounds = useMemo(() => {
    if (!map) return null;
    const xs = map.points.map((point) => point.x);
    const ys = map.points.map((point) => point.y);
    return {
      xMin: Math.min(...xs),
      xMax: Math.max(...xs),
      yMin: Math.min(...ys),
      yMax: Math.max(...ys),
    };
  }, [map]);

  if (!map || !overview || !result || !bounds) {
    return <Loading message={message} />;
  }

  const countIndex = CELL_COUNTS.indexOf(nCells);
  const probed = new Set(result.probed.map((cell) => cell.cell));
  const exactSet = new Set(result.exact.map((found) => found.position));
  const toX = (x: number) => MAP.pad + ((x - bounds.xMin) / (bounds.xMax - bounds.xMin)) * (MAP.width - 2 * MAP.pad);
  const toY = (y: number) => MAP.height - MAP.pad - ((y - bounds.yMin) / (bounds.yMax - bounds.yMin)) * (MAP.height - 2 * MAP.pad);
  const queryPoint = map.queries[result.query];
  const missed = result.exact.filter((found) => !result.indexed.some((other) => other.position === found.position));
  const strangers = overview.strangers.map((stranger) => stranger.query);

  const pickKind = (label: number) => setQuery((previous) => {
    const next = Math.floor(previous / 4) * 4 + label;
    return next === previous ? (next + 4) % overview.n_queries : next;
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className="text-slate-500 dark:text-slate-400">query</span>
        <button type="button" onClick={() => setQuery((previous) => (previous + overview.n_queries - 1) % overview.n_queries)} className="rounded-md border border-slate-300 px-2 py-1 text-slate-700 dark:border-slate-700 dark:text-slate-300">previous</button>
        <button type="button" onClick={() => setQuery((previous) => (previous + 1) % overview.n_queries)} className="rounded-md border border-slate-300 px-2 py-1 text-slate-700 dark:border-slate-700 dark:text-slate-300">next</button>
        {KIND_ORDER.map((kind, label) => (
          <button key={kind} type="button" onClick={() => pickKind(label)} className="rounded-md border px-2 py-1" style={{ borderColor: kindColour(kind), color: kindColour(kind) }}>
            a {kind}
          </button>
        ))}
        <button
          type="button"
          onClick={() => setQuery((previous) => strangers.find((position) => position > previous) ?? strangers[0])}
          className="rounded-md border border-slate-300 px-2 py-1 text-slate-700 dark:border-slate-700 dark:text-slate-300"
        >
          nearest picture of another kind
        </button>
        {worstQuery !== null && (
          <button
            type="button"
            onClick={() => {
              setQuery(worstQuery);
              setNCells(32);
              setProbes(1);
            }}
            className="rounded-md border border-slate-300 px-2 py-1 text-slate-700 dark:border-slate-700 dark:text-slate-300"
          >
            the question one cell serves worst
          </button>
        )}
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <label className="text-xs text-slate-600 dark:text-slate-400">
          neighbours wanted, k = {k}
          <input type="range" min={1} max={20} value={k} onChange={(event) => setK(Number(event.target.value))} className="mt-1 w-full accent-indigo-600" />
        </label>
        <div className="text-xs text-slate-600 dark:text-slate-400">
          cells the collection is cut into
          <div className="mt-1 inline-flex overflow-hidden rounded-md border border-slate-300 dark:border-slate-700">
            {CELL_COUNTS.map((count) => (
              <button key={count} type="button" onClick={() => { setNCells(count); setProbes((previous) => Math.min(previous, count)); }} className={`px-3 py-1 ${nCells === count ? "bg-indigo-600 text-white" : "bg-white text-slate-700 dark:bg-slate-900 dark:text-slate-300"}`}>
                {count}
              </button>
            ))}
          </div>
        </div>
        <label className="text-xs text-slate-600 dark:text-slate-400">
          cells searched = {Math.min(probes, nCells)}
          <input type="range" min={1} max={16} value={Math.min(probes, nCells)} onChange={(event) => setProbes(Number(event.target.value))} className="mt-1 w-full accent-indigo-600" />
        </label>
      </div>

      <div className="flex flex-wrap items-start gap-4">
        <div>
          <p className="mb-1 text-xs font-medium text-slate-600 dark:text-slate-400">
            held-out picture {result.query}, a {result.query_kind}
          </p>
          <PictureTile grid={result.query_picture} cell={6} frame={kindColour(result.query_kind)} label={`the query, a ${result.query_kind}`} />
        </div>
        <div className="grid flex-1 grid-cols-2 gap-1.5 sm:grid-cols-3">
          <Stat label="exact: pictures measured" value={String(result.exact_distances)} />
          <Stat label="index: distances computed" value={String(result.index_distances)} />
          <Stat label="share of the collection read" value={`${(result.touched_share * 100).toFixed(1)}%`} />
          <Stat label="neighbours sharing its kind" value={result.exact_precision.toFixed(2)} />
          <Stat label="recall of the true k nearest" value={result.recall.toFixed(2)} />
          <Stat label={`k-th and next distance`} value={`${result.kth_distance.toFixed(3)}, ${result.next_distance.toFixed(3)}`} />
        </div>
      </div>

      <div>
        <p className="mb-1 text-xs font-medium text-slate-600 dark:text-slate-400">
          The exact {result.k} nearest, nearest first, each framed in the colour of its kind
        </p>
        <div className="flex flex-wrap gap-1">
          {result.exact.map((found) => (
            <div key={found.position} className="text-center">
              <PictureTile grid={found.picture} frame={kindColour(found.kind)} label={`a ${found.kind} at distance ${found.distance.toFixed(3)}`} />
              <div className="font-mono text-[10px] text-slate-500 dark:text-slate-400">{found.distance.toFixed(2)}</div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-1 text-xs font-medium text-slate-600 dark:text-slate-400">
          What the {result.probes === 1 ? "nearest cell holds" : `nearest ${result.probes} cells hold`}, nearest first. A dashed frame is a picture the exact answer does not contain.
        </p>
        <div className="flex flex-wrap gap-1">
          {result.indexed.map((found) => (
            <div key={found.position} className="text-center">
              <PictureTile grid={found.picture} frame={kindColour(found.kind)} dashed={!found.in_exact_answer} label={`a ${found.kind} at distance ${found.distance.toFixed(3)}`} />
              <div className="font-mono text-[10px] text-slate-500 dark:text-slate-400">{found.distance.toFixed(2)}</div>
            </div>
          ))}
        </div>
        {missed.length > 0 && (
          <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">
            Missed {missed.length} of the true {result.k}, the nearest of them at {missed[0].distance.toFixed(3)}, in a cell that was not searched.
          </p>
        )}
      </div>

      <div>
        <svg viewBox={`0 0 ${MAP.width} ${MAP.height}`} className="w-full select-none rounded-lg bg-slate-50 dark:bg-slate-950" role="img" aria-label="Every picture of the collection placed on two directions, with the searched cells lit">
          {map.points.map((point, position) => {
            const inProbed = probed.has(point.cells[countIndex]);
            return (
              <circle key={position} cx={toX(point.x)} cy={toY(point.y)} r={inProbed ? 1.9 : 1.3} fill={kindColour(KIND_ORDER[point.kind])} opacity={inProbed ? 0.95 : 0.14} />
            );
          })}
          {map.cell_counts[countIndex].centres.map((centre, cell) => (
            <circle key={`centre-${cell}`} cx={toX(centre.x)} cy={toY(centre.y)} r={probed.has(cell) ? 4 : 2.5} fill="none" className={probed.has(cell) ? "stroke-slate-900 dark:stroke-slate-100" : "stroke-slate-400 dark:stroke-slate-600"} strokeWidth={1.2} />
          ))}
          {result.exact.map((found) => (
            <circle key={`true-${found.position}`} cx={toX(map.points[found.position].x)} cy={toY(map.points[found.position].y)} r={3.2} fill="none" stroke={exactSet.has(found.position) && !found.in_exact_answer ? "#94a3b8" : "#0f172a"} strokeWidth={1} className="dark:stroke-white" />
          ))}
          <path d={star(toX(queryPoint.x), toY(queryPoint.y), 8)} fill={kindColour(result.query_kind)} className="stroke-slate-900 dark:stroke-white" strokeWidth={1.2} />
        </svg>
        <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
          <KindKey />
          <span className="text-xs text-slate-500 dark:text-slate-400">
            star the query, rings its true neighbours, open circles the cell centres
          </span>
        </div>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          The two directions keep {(map.kept_share * 100).toFixed(1)}% of the spread in the sixteen numbers, so two cells that overlap in the drawing can be well apart in the space the search measures. Bright dots are the pictures the index read; faint ones it never touched.
        </p>
      </div>
    </div>
  );
}

function star(x: number, y: number, radius: number): string {
  const points: string[] = [];
  for (let step = 0; step < 10; step += 1) {
    const angle = (step / 10) * Math.PI * 2 - Math.PI / 2;
    const reach = step % 2 === 0 ? radius : radius * 0.45;
    points.push(`${(x + Math.cos(angle) * reach).toFixed(1)},${(y + Math.sin(angle) * reach).toFixed(1)}`);
  }
  return `M${points.join("L")}Z`;
}
