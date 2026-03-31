"use client";

// Unlabelled people, sorted into groups no one defined.
//
// Nothing here carries a label. Every dot starts the same colour of nothing,
// and the colours you see are the groups k-means found, with an X at each
// group's resting centre and the plane shaded by which centre is nearest. The
// slider sets how many groups to look for, which is a choice, not a
// discovery. Click to add people, drag them, double-click to remove. Every
// grouping is the library's through the API, not the browser's.

import { useCallback, useEffect, useRef, useState } from "react";
import { ApiError, Clustering, Point, clusterPeople } from "@/lib/api";

const DOMAIN = { xMin: 100, xMax: 200, yMin: 10, yMax: 100 };
const VIEW = { width: 640, height: 460 };
const PAD = { left: 56, right: 16, top: 16, bottom: 50 };
const PLOT = {
  width: VIEW.width - PAD.left - PAD.right,
  height: VIEW.height - PAD.top - PAD.bottom,
};

// Eight people in two tight clumps whose group means are whole numbers, the
// worked example the page sums by hand.
const WORKED_PEOPLE: Point[] = [
  { x: 118, y: 24 },
  { x: 120, y: 25 },
  { x: 122, y: 28 },
  { x: 124, y: 27 },
  { x: 178, y: 78 },
  { x: 180, y: 80 },
  { x: 182, y: 83 },
  { x: 184, y: 79 },
];

// The classification pages' crowd with its labels stripped away.
const CROWD: Point[] = [
  { x: 147, y: 41 },
  { x: 156, y: 53 },
  { x: 145, y: 57 },
  { x: 159, y: 57 },
  { x: 162, y: 61 },
  { x: 120, y: 25 },
  { x: 122, y: 28 },
  { x: 118, y: 24 },
  { x: 180, y: 80 },
  { x: 183, y: 83 },
  { x: 178, y: 78 },
];

const MAX_POINTS = 100;

const POINT_FILLS = [
  "fill-indigo-600",
  "fill-amber-500",
  "fill-emerald-600",
  "fill-rose-500",
  "fill-sky-500",
  "fill-violet-500",
];

const REGION_FILLS = [
  "fill-indigo-500/15",
  "fill-amber-500/15",
  "fill-emerald-500/15",
  "fill-rose-500/15",
  "fill-sky-500/15",
  "fill-violet-500/15",
];

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

export function KMeansPlayground() {
  const [points, setPoints] = useState<Point[]>(WORKED_PEOPLE);
  const [k, setK] = useState(2);
  const [answer, setAnswer] = useState<Clustering | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const dragging = useRef<number | null>(null);

  useEffect(() => {
    const timer = setTimeout(async () => {
      try {
        setAnswer(await clusterPeople(points, k));
        setMessage(null);
      } catch (error) {
        if (error instanceof ApiError) setMessage(error.message);
        else setMessage("Something went wrong.");
      }
    }, 150);
    return () => clearTimeout(timer);
  }, [points, k]);

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
    setPoints((current) => [...current, dropped]);
    dragging.current = points.length;
    svgRef.current?.setPointerCapture(event.pointerId);
  };

  const onPointPointerDown = (index: number) => (event: React.PointerEvent) => {
    event.stopPropagation();
    dragging.current = index;
    svgRef.current?.setPointerCapture(event.pointerId);
  };

  const onPointerMove = (event: React.PointerEvent) => {
    if (dragging.current === null) return;
    const moved = eventToData(event.clientX, event.clientY);
    const index = dragging.current;
    setPoints((current) =>
      current.map((point, i) => (i === index ? moved : point)),
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

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 pb-3">
        <button
          onClick={() => setPoints(WORKED_PEOPLE)}
          className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
        >
          Worked example
        </button>
        <button
          onClick={() => setPoints(CROWD)}
          className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
        >
          The crowd, unlabelled
        </button>
        <label className="ml-auto flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
          k
          <input
            type="range"
            min={1}
            max={6}
            step={1}
            value={k}
            onChange={(event) => setK(Number(event.target.value))}
            className="w-32 accent-indigo-600"
          />
          <span className="w-4 font-mono text-sm">{k}</span>
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
                className={REGION_FILLS[label % REGION_FILLS.length]}
              />
            );
          }),
        )}

        {points.map((point, index) => {
          const { px, py } = toPixel(point);
          const label = answer?.labels[index];
          return (
            <circle
              key={index}
              cx={px}
              cy={py}
              r={6}
              className={
                "cursor-grab stroke-white dark:stroke-slate-900 " +
                (label === undefined
                  ? "fill-slate-500"
                  : POINT_FILLS[label % POINT_FILLS.length])
              }
              strokeWidth={1.5}
              onPointerDown={onPointPointerDown(index)}
              onDoubleClick={removePoint(index)}
            />
          );
        })}

        {/* the resting centres */}
        {answer?.centres.map((centre, index) => {
          const { px, py } = toPixel(centre);
          return (
            <g key={`c${index}`} className="text-slate-700 dark:text-slate-200">
              <line
                x1={px - 7}
                y1={py - 7}
                x2={px + 7}
                y2={py + 7}
                stroke="currentColor"
                strokeWidth={3}
              />
              <line
                x1={px - 7}
                y1={py + 7}
                x2={px + 7}
                y2={py - 7}
                stroke="currentColor"
                strokeWidth={3}
              />
            </g>
          );
        })}

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
        The colours are the groups k-means found, and each X is a group&rsquo;s
        resting centre. No dot carried a label to begin with.
      </p>

      <div className="mt-3 grid grid-cols-3 gap-3">
        <Stat label="Groups asked for" value={String(k)} />
        <Stat
          label="Inertia"
          value={answer ? answer.inertia.toFixed(1) : "…"}
        />
        <Stat
          label="Iterations"
          value={answer ? String(answer.iterations_run) : "…"}
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
