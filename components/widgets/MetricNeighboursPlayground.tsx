"use client";

// The k-nearest crowd, with the meaning of near left open.
//
// The same eleven people and the same ringed query as the k-nearest page, but
// here the metric is a choice rather than a given. Pick one and the library
// refits, the dashed lines reach the k people that metric calls nearest, the
// shaded regions redraw as its answer at every spot on the plane, and the
// table underneath ranks everyone by that metric with the voters marked. The
// strip at the bottom measures the query against its nearest person under all
// six at once, and sweeps the p-norm of that one gap from Manhattan to
// Chebyshev. Two other crowds are a click away, the ideal case where every
// metric agrees and a random one. Every distance is the library's through
// the API, not the browser's.

import { useCallback, useEffect, useRef, useState } from "react";
import { ApiError, LabelledPoint, Point } from "@/lib/api";
import {
  METRIC_NAMES,
  METRIC_TITLES,
  MetricName,
  MetricNeighboursAnswer,
  PairMeasurement,
  measurePair,
  neighboursUnder,
} from "@/lib/concepts/distance-metrics";
import {
  IDEAL_PEOPLE,
  IDEAL_QUERY,
  WORKED_PEOPLE,
  WORKED_QUERY,
  formatDistance,
  randomCrowd,
} from "./distanceMetricsFixtures";

const DOMAIN = { xMin: 100, xMax: 200, yMin: 10, yMax: 100 };

const buttonClass =
  "rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700";
const VIEW = { width: 640, height: 460 };
const PAD = { left: 56, right: 16, top: 16, bottom: 50 };
const PLOT = {
  width: VIEW.width - PAD.left - PAD.right,
  height: VIEW.height - PAD.top - PAD.bottom,
};

function toPixel(point: Point) {
  const px =
    PAD.left +
    ((point.x - DOMAIN.xMin) / (DOMAIN.xMax - DOMAIN.xMin)) * PLOT.width;
  const py =
    PAD.top +
    (1 - (point.y - DOMAIN.yMin) / (DOMAIN.yMax - DOMAIN.yMin)) * PLOT.height;
  return { px, py };
}

function toData(px: number, py: number): Point {
  const clamp = (value: number, low: number, high: number) =>
    Math.min(high, Math.max(low, Math.round(value)));
  return {
    x: clamp(
      DOMAIN.xMin + ((px - PAD.left) / PLOT.width) * (DOMAIN.xMax - DOMAIN.xMin),
      DOMAIN.xMin,
      DOMAIN.xMax,
    ),
    y: clamp(
      DOMAIN.yMin +
        (1 - (py - PAD.top) / PLOT.height) * (DOMAIN.yMax - DOMAIN.yMin),
      DOMAIN.yMin,
      DOMAIN.yMax,
    ),
  };
}

export function MetricNeighboursPlayground() {
  const [points, setPoints] = useState<LabelledPoint[]>(WORKED_PEOPLE);
  const [query, setQuery] = useState<Point>(WORKED_QUERY);
  const [metric, setMetric] = useState<MetricName>("euclidean");
  const [k, setK] = useState(3);
  const [answer, setAnswer] = useState<MetricNeighboursAnswer | null>(null);
  const [pair, setPair] = useState<PairMeasurement | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const dragging = useRef<number | "query" | null>(null);

  useEffect(() => {
    const timer = setTimeout(async () => {
      try {
        const crowdAnswer = await neighboursUnder(points, query, metric, k);
        const nearest = points[crowdAnswer.neighbours[0].index];
        const pairAnswer = await measurePair(query, nearest);
        setAnswer(crowdAnswer);
        setPair(pairAnswer);
        setMessage(null);
      } catch (error) {
        if (error instanceof ApiError) setMessage(error.message);
        else setMessage("Something went wrong.");
      }
    }, 150);
    return () => clearTimeout(timer);
  }, [points, query, metric, k]);

  const eventToData = useCallback((clientX: number, clientY: number) => {
    const svg = svgRef.current!;
    const rect = svg.getBoundingClientRect();
    const px = ((clientX - rect.left) / rect.width) * VIEW.width;
    const py = ((clientY - rect.top) / rect.height) * VIEW.height;
    return toData(px, py);
  }, []);

  const onPointPointerDown = (index: number) => (event: React.PointerEvent) => {
    event.stopPropagation();
    dragging.current = index;
    svgRef.current?.setPointerCapture(event.pointerId);
  };

  const onQueryPointerDown = (event: React.PointerEvent) => {
    event.stopPropagation();
    dragging.current = "query";
    svgRef.current?.setPointerCapture(event.pointerId);
  };

  const onPointerMove = (event: React.PointerEvent) => {
    if (dragging.current === null) return;
    const moved = eventToData(event.clientX, event.clientY);
    if (dragging.current === "query") {
      setQuery(moved);
      return;
    }
    const index = dragging.current;
    setPoints((current) =>
      current.map((point, position) =>
        position === index ? { ...point, ...moved } : point,
      ),
    );
  };

  const onPointerUp = () => {
    dragging.current = null;
  };

  const regions = answer?.regions;
  const cellWidth = regions ? PLOT.width / regions.cells : 0;
  const cellHeight = regions ? PLOT.height / regions.cells : 0;

  const regionPixel = (column: number, row: number) => {
    if (!regions) return { px: 0, py: 0 };
    const x =
      regions.x_min +
      ((column + 0.5) / regions.cells) * (regions.x_max - regions.x_min);
    const y =
      regions.y_min +
      ((row + 0.5) / regions.cells) * (regions.y_max - regions.y_min);
    return toPixel({ x, y });
  };

  const queryPixel = toPixel(query);
  const nearest = answer ? points[answer.neighbours[0].index] : undefined;

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 pb-3">
        <button
          onClick={() => {
            setPoints(IDEAL_PEOPLE);
            setQuery(IDEAL_QUERY);
          }}
          className={buttonClass}
        >
          An Ideal Case
        </button>
        <button
          onClick={() => {
            setPoints(WORKED_PEOPLE);
            setQuery(WORKED_QUERY);
          }}
          className={buttonClass}
        >
          The borderline case
        </button>
        <button
          onClick={() => {
            setPoints(randomCrowd());
            setQuery(WORKED_QUERY);
          }}
          className={buttonClass}
        >
          Random crowd
        </button>
        <div className="flex flex-wrap gap-1 rounded-md border border-slate-300 p-0.5 dark:border-slate-700">
          {METRIC_NAMES.map((name) => (
            <button
              key={name}
              onClick={() => setMetric(name)}
              className={
                "rounded px-2.5 py-1 text-sm font-medium transition " +
                (metric === name
                  ? "bg-indigo-600 text-white"
                  : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800")
              }
            >
              {METRIC_TITLES[name]}
            </button>
          ))}
        </div>
        <label className="ml-auto flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
          k
          <input
            type="range"
            min={1}
            max={15}
            step={2}
            value={k}
            onChange={(event) => setK(Number(event.target.value))}
            className="w-32 accent-indigo-600"
          />
          <span className="w-6 font-mono text-sm">{k}</span>
        </label>
      </div>

      <svg
        ref={svgRef}
        viewBox={`0 0 ${VIEW.width} ${VIEW.height}`}
        className="w-full touch-none select-none rounded-lg bg-slate-50 dark:bg-slate-950"
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
      >
        {/* the model's answer at every cell, under this metric */}
        {regions?.labels.map((row, rowIndex) =>
          row.map((label, columnIndex) => {
            const { px, py } = regionPixel(columnIndex, rowIndex);
            return (
              <rect
                key={`${rowIndex}-${columnIndex}`}
                x={px - cellWidth / 2}
                y={py - cellHeight / 2}
                width={cellWidth + 0.5}
                height={cellHeight + 0.5}
                className={
                  label === 1 ? "fill-indigo-500/15" : "fill-amber-500/15"
                }
              />
            );
          }),
        )}

        {/* lines to the people this metric consulted */}
        {answer?.neighbours.map((neighbour) => {
          const target = points[neighbour.index];
          if (!target) return null;
          const { px, py } = toPixel(target);
          return (
            <line
              key={neighbour.index}
              x1={queryPixel.px}
              y1={queryPixel.py}
              x2={px}
              y2={py}
              stroke="currentColor"
              className="text-emerald-500"
              strokeWidth={1.5}
              strokeDasharray="4 3"
            />
          );
        })}

        {/* the stored people */}
        {points.map((point, index) => {
          const { px, py } = toPixel(point);
          return (
            <circle
              key={index}
              cx={px}
              cy={py}
              r={6}
              className={
                point.label === 1
                  ? "cursor-grab fill-indigo-600 stroke-white dark:stroke-slate-900"
                  : "cursor-grab fill-amber-500 stroke-white dark:stroke-slate-900"
              }
              strokeWidth={1.5}
              onPointerDown={onPointPointerDown(index)}
            />
          );
        })}

        {/* the query, ringed */}
        <circle
          cx={queryPixel.px}
          cy={queryPixel.py}
          r={11}
          className="fill-none stroke-emerald-500"
          strokeWidth={2.5}
        />
        <circle
          cx={queryPixel.px}
          cy={queryPixel.py}
          r={6}
          className={
            "cursor-grab stroke-white dark:stroke-slate-900 " +
            (answer?.prediction === 1 ? "fill-indigo-600" : "fill-amber-500")
          }
          strokeWidth={1.5}
          onPointerDown={onQueryPointerDown}
        />

        <text
          x={PAD.left + PLOT.width / 2}
          y={VIEW.height - 6}
          textAnchor="middle"
          className="fill-slate-500 text-xs font-medium dark:fill-slate-400"
        >
          Height (cm)
        </text>
        <text
          x={16}
          y={PAD.top + PLOT.height / 2}
          textAnchor="middle"
          transform={`rotate(-90 16 ${PAD.top + PLOT.height / 2})`}
          className="fill-slate-500 text-xs font-medium dark:fill-slate-400"
        >
          Weight (kg)
        </text>
      </svg>

      <p className="mt-2 text-center text-xs text-slate-500 dark:text-slate-500">
        Amber is children, indigo is adults. The ringed point is the person
        being classified, and the dashed lines reach the {k} people that{" "}
        {METRIC_TITLES[metric]} distance calls nearest. Drag anyone.
      </p>

      <div className="mt-3 grid grid-cols-3 gap-3">
        <Stat
          label="Votes for child"
          value={answer ? String(answer.votes_for_zero) : "…"}
        />
        <Stat
          label="Votes for adult"
          value={answer ? String(answer.votes_for_one) : "…"}
        />
        <Stat
          label="Answer"
          value={answer ? (answer.prediction === 1 ? "adult" : "child") : "…"}
        />
      </div>

      {answer && (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm text-slate-700 dark:text-slate-300">
            <thead>
              <tr className="text-left text-xs text-slate-500 dark:text-slate-400">
                <th className="py-1 pr-3 font-medium">Rank</th>
                <th className="py-1 pr-3 font-medium">Person</th>
                <th className="py-1 pr-3 font-medium">Class</th>
                <th className="py-1 pr-3 font-medium">
                  {METRIC_TITLES[metric]} distance
                </th>
                <th className="py-1 font-medium">Voted</th>
              </tr>
            </thead>
            <tbody>
              {answer.ranked.map((person, rank) => {
                const stored = points[person.index];
                if (!stored) return null;
                return (
                  <tr
                    key={person.index}
                    className={
                      person.chosen
                        ? "bg-emerald-500/10"
                        : "border-t border-slate-100 dark:border-slate-800"
                    }
                  >
                    <td className="py-1 pr-3 font-mono">{rank + 1}</td>
                    <td className="py-1 pr-3 font-mono">
                      ({stored.x}, {stored.y})
                    </td>
                    <td className="py-1 pr-3">
                      {person.label === 1 ? "adult" : "child"}
                    </td>
                    <td className="py-1 pr-3 font-mono">
                      {formatDistance(person.distance)}
                    </td>
                    <td className="py-1 font-mono">
                      {person.chosen ? "yes" : ""}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {nearest && (
        <p className="mt-4 text-xs text-slate-500 dark:text-slate-400">
          The query at ({query.x}, {query.y}) against its nearest person under{" "}
          {METRIC_TITLES[metric]}, at ({nearest.x}, {nearest.y}), measured under
          all six.
        </p>
      )}
      <div className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-6">
        {METRIC_NAMES.map((name) => (
          <Stat
            key={name}
            label={METRIC_TITLES[name]}
            value={pair ? formatDistance(pair.distances[name]) : "…"}
            highlighted={name === metric}
          />
        ))}
      </div>

      {pair && (
        <>
          <p className="mt-4 text-xs text-slate-500 dark:text-slate-400">
            The p-norm of that one gap, swept from Manhattan at p of 1 to
            Chebyshev at p of infinity.
          </p>
          <div className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-6">
            {pair.orders.map((entry) => (
              <Stat
                key={entry.order ?? "infinity"}
                label={`p = ${entry.order ?? "∞"}`}
                value={formatDistance(entry.distance)}
              />
            ))}
          </div>
        </>
      )}

      {message && (
        <p className="mt-3 text-sm text-amber-600 dark:text-amber-400">
          {message}
        </p>
      )}
    </div>
  );
}

function Stat({
  label,
  value,
  highlighted = false,
}: {
  label: string;
  value: string;
  highlighted?: boolean;
}) {
  return (
    <div
      className={
        "rounded-lg px-3 py-2 " +
        (highlighted
          ? "bg-indigo-100 ring-1 ring-indigo-400 dark:bg-indigo-950 dark:ring-indigo-500"
          : "bg-slate-100 dark:bg-slate-800")
      }
    >
      <div className="text-xs text-slate-500 dark:text-slate-400">{label}</div>
      <div className="font-mono text-lg font-semibold text-slate-900 dark:text-slate-100">
        {value}
      </div>
    </div>
  );
}
