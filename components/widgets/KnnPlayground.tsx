"use client";

// Children and adults by height and weight, and a query decided by its
// neighbours.
//
// The ringed point is the person to classify. Drag them anywhere, set how many
// neighbours vote with the slider, and the lines show who was consulted. The
// shaded regions are the model's answer at every spot on the plane, jagged at
// small k and smooth at large. Points are added in whichever class the toggle
// holds. Every answer is the library's through the API, not the browser's.

import { useCallback, useEffect, useRef, useState } from "react";
import {
  ApiError,
  KnnAnswer,
  LabelledPoint,
  Point,
  classifyByNeighbours,
} from "@/lib/api";

const DOMAIN = { xMin: 100, xMax: 200, yMin: 10, yMax: 100 };
const VIEW = { width: 640, height: 460 };
const PAD = { left: 56, right: 16, top: 16, bottom: 50 };
const PLOT = {
  width: VIEW.width - PAD.left - PAD.right,
  height: VIEW.height - PAD.top - PAD.bottom,
};

// The worked set, five children and six adults, with a query whose nearest
// three sit at distances 5, 10 and 13, every one a 3-4-5 triangle.
const WORKED_PEOPLE: LabelledPoint[] = [
  { x: 147, y: 41, label: 0 },
  { x: 156, y: 53, label: 1 },
  { x: 145, y: 57, label: 0 },
  { x: 159, y: 57, label: 1 },
  { x: 162, y: 61, label: 1 },
  { x: 120, y: 25, label: 0 },
  { x: 122, y: 28, label: 0 },
  { x: 118, y: 24, label: 0 },
  { x: 180, y: 80, label: 1 },
  { x: 183, y: 83, label: 1 },
  { x: 178, y: 78, label: 1 },
];

const WORKED_QUERY: Point = { x: 150, y: 45 };

// The ideal case, two well-separated clumps with the query deep inside one,
// so every k from 1 to 15 returns the same confident answer.
const IDEAL_PEOPLE: LabelledPoint[] = [
  { x: 118, y: 24, label: 0 },
  { x: 120, y: 27, label: 0 },
  { x: 122, y: 25, label: 0 },
  { x: 124, y: 29, label: 0 },
  { x: 119, y: 30, label: 0 },
  { x: 125, y: 26, label: 0 },
  { x: 121, y: 32, label: 0 },
  { x: 126, y: 31, label: 0 },
  { x: 117, y: 28, label: 0 },
  { x: 176, y: 74, label: 1 },
  { x: 179, y: 78, label: 1 },
  { x: 182, y: 76, label: 1 },
  { x: 185, y: 80, label: 1 },
  { x: 178, y: 82, label: 1 },
  { x: 183, y: 84, label: 1 },
  { x: 180, y: 72, label: 1 },
  { x: 186, y: 77, label: 1 },
];

const IDEAL_QUERY: Point = { x: 122, y: 28 };

function randomCrowd(): LabelledPoint[] {
  const around = (
    centreX: number,
    centreY: number,
    label: number,
    count: number,
  ): LabelledPoint[] =>
    Array.from({ length: count }, () => ({
      x: Math.round(centreX + (Math.random() - 0.5) * 30),
      y: Math.round(centreY + (Math.random() - 0.5) * 26),
      label,
    }));
  return [...around(130, 32, 0, 8), ...around(170, 70, 1, 8)];
}

const MAX_POINTS = 100;

function toPixel(point: { x: number; y: number }) {
  const px =
    PAD.left +
    ((point.x - DOMAIN.xMin) / (DOMAIN.xMax - DOMAIN.xMin)) * PLOT.width;
  const py =
    PAD.top +
    (1 - (point.y - DOMAIN.yMin) / (DOMAIN.yMax - DOMAIN.yMin)) * PLOT.height;
  return { px, py };
}

function toData(px: number, py: number) {
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

export function KnnPlayground() {
  const [points, setPoints] = useState<LabelledPoint[]>(WORKED_PEOPLE);
  const [query, setQuery] = useState<Point>(WORKED_QUERY);
  const [k, setK] = useState(3);
  const [addClass, setAddClass] = useState(0);
  const [answer, setAnswer] = useState<KnnAnswer | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const dragging = useRef<number | "query" | null>(null);

  useEffect(() => {
    const timer = setTimeout(async () => {
      try {
        setAnswer(await classifyByNeighbours(points, query, k));
        setMessage(null);
      } catch (error) {
        if (error instanceof ApiError) setMessage(error.message);
        else setMessage("Something went wrong.");
      }
    }, 150);
    return () => clearTimeout(timer);
  }, [points, query, k]);

  const eventToData = useCallback((clientX: number, clientY: number) => {
    const svg = svgRef.current!;
    const rect = svg.getBoundingClientRect();
    const px = ((clientX - rect.left) / rect.width) * VIEW.width;
    const py = ((clientY - rect.top) / rect.height) * VIEW.height;
    return toData(px, py);
  }, []);

  const onBackgroundPointerDown = (event: React.PointerEvent) => {
    if (dragging.current !== null) return;
    if (points.length >= MAX_POINTS) return;
    const dropped = eventToData(event.clientX, event.clientY);
    setPoints((current) => [...current, { ...dropped, label: addClass }]);
    dragging.current = points.length;
    svgRef.current?.setPointerCapture(event.pointerId);
  };

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
      current.map((point, i) => (i === index ? { ...point, ...moved } : point)),
    );
  };

  const onPointerUp = () => {
    dragging.current = null;
  };

  const removePoint = (index: number) => (event: React.MouseEvent) => {
    event.stopPropagation();
    if (points.length <= 1) return;
    setPoints((current) => current.filter((_, i) => i !== index));
  };

  const regions = answer?.regions;
  const cellWidth = regions
    ? PLOT.width / regions.cells
    : 0;
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

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 pb-3">
        <button
          onClick={() => {
            setPoints(IDEAL_PEOPLE);
            setQuery(IDEAL_QUERY);
          }}
          className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
        >
          An Ideal Case
        </button>
        <button
          onClick={() => {
            setPoints(WORKED_PEOPLE);
            setQuery(WORKED_QUERY);
          }}
          className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
        >
          The borderline case
        </button>
        <button
          onClick={() => setPoints(randomCrowd())}
          className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
        >
          Random crowd
        </button>
        <div className="flex gap-1 rounded-md border border-slate-300 p-0.5 dark:border-slate-700">
          {[
            { label: "Add children", value: 0 },
            { label: "Add adults", value: 1 },
          ].map((option) => (
            <button
              key={option.value}
              onClick={() => setAddClass(option.value)}
              className={
                "rounded px-3 py-1 text-sm font-medium transition " +
                (addClass === option.value
                  ? option.value === 0
                    ? "bg-amber-500 text-white"
                    : "bg-indigo-600 text-white"
                  : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800")
              }
            >
              {option.label}
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
        onPointerDown={onBackgroundPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
      >
        {/* the model's answer at every cell */}
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

        {/* lines to the consulted neighbours */}
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
              onDoubleClick={removePoint(index)}
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
        being classified, and the dashed lines reach their {k} nearest.
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

      {message && (
        <p className="mt-3 text-sm text-amber-600 dark:text-amber-400">
          {message}
        </p>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-slate-100 px-3 py-2 dark:bg-slate-800">
      <div className="text-xs text-slate-500 dark:text-slate-400">{label}</div>
      <div className="font-mono text-lg font-semibold text-slate-900 dark:text-slate-100">
        {value}
      </div>
    </div>
  );
}
