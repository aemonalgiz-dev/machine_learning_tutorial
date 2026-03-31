"use client";

// A cloud of people, and the directions it actually varies along.
//
// The two arrows through the cloud's mean are its principal components, the
// long one carrying most of the spread, and their lengths are scaled by how
// much variance each carries. The projections toggle flattens every person
// onto the long direction, drawing where they land and the piece of them that
// is lost. Click to add people, drag them, double-click to remove. Every
// direction is the library's through the API, not the browser's.

import { useCallback, useEffect, useRef, useState } from "react";
import { ApiError, PcaAnalysis, Point, analyzeCloud } from "@/lib/api";

const DOMAIN = { xMin: 100, xMax: 200, yMin: 10, yMax: 100 };
const VIEW = { width: 640, height: 460 };
const PAD = { left: 56, right: 16, top: 16, bottom: 50 };
const PLOT = {
  width: VIEW.width - PAD.left - PAD.right,
  height: VIEW.height - PAD.top - PAD.bottom,
};

// The four people whose deviation sums the page works by hand.
const WORKED_PEOPLE: Point[] = [
  { x: 180, y: 78 },
  { x: 160, y: 58 },
  { x: 175, y: 63 },
  { x: 165, y: 73 },
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

export function PcaPlayground() {
  const [points, setPoints] = useState<Point[]>(WORKED_PEOPLE);
  const [showProjections, setShowProjections] = useState(false);
  const [analysis, setAnalysis] = useState<PcaAnalysis | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const dragging = useRef<number | null>(null);

  useEffect(() => {
    const timer = setTimeout(async () => {
      try {
        setAnalysis(await analyzeCloud(points));
        setMessage(null);
      } catch (error) {
        if (error instanceof ApiError) setMessage(error.message);
        else setMessage("Something went wrong.");
      }
    }, 150);
    return () => clearTimeout(timer);
  }, [points]);

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
    if (points.length <= 2) return;
    setPoints((current) => current.filter((_, i) => i !== index));
  };

  // Arrow lengths scale with the standard deviation along each direction, so
  // the picture carries the shares by eye.
  const arrowFor = (componentIndex: number) => {
    if (!analysis) return null;
    const component = analysis.components[componentIndex];
    if (!component) return null;
    const reach = 1.8 * Math.sqrt(component.variance);
    const from = toPixel({
      x: analysis.mean.x - reach * component.dx,
      y: analysis.mean.y - reach * component.dy,
    });
    const to = toPixel({
      x: analysis.mean.x + reach * component.dx,
      y: analysis.mean.y + reach * component.dy,
    });
    return { from, to };
  };

  const first = arrowFor(0);
  const second = arrowFor(1);

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
          <input
            type="checkbox"
            checked={showProjections}
            onChange={(event) => setShowProjections(event.target.checked)}
            className="accent-indigo-600"
          />
          Flatten onto the first component
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
        {/* the two directions, drawn through the mean */}
        {first && (
          <line
            x1={first.from.px}
            y1={first.from.py}
            x2={first.to.px}
            y2={first.to.py}
            stroke="currentColor"
            className="text-indigo-500"
            strokeWidth={3}
          />
        )}
        {second && (
          <line
            x1={second.from.px}
            y1={second.from.py}
            x2={second.to.px}
            y2={second.to.py}
            stroke="currentColor"
            className="text-amber-500"
            strokeWidth={2}
          />
        )}

        {/* what flattening onto the first component loses and keeps */}
        {showProjections &&
          analysis &&
          points.map((point, index) => {
            const shadow = analysis.reconstructions[index];
            if (!shadow) return null;
            const a = toPixel(point);
            const b = toPixel(shadow);
            return (
              <g key={`p${index}`}>
                <line
                  x1={a.px}
                  y1={a.py}
                  x2={b.px}
                  y2={b.py}
                  stroke="currentColor"
                  className="text-slate-400 dark:text-slate-600"
                  strokeWidth={1.5}
                  strokeDasharray="3 3"
                />
                <circle
                  cx={b.px}
                  cy={b.py}
                  r={5}
                  className="fill-emerald-500 stroke-white dark:stroke-slate-900"
                  strokeWidth={1.5}
                />
              </g>
            );
          })}

        {/* the people */}
        {points.map((point, index) => {
          const { px, py } = toPixel(point);
          return (
            <circle
              key={index}
              cx={px}
              cy={py}
              r={6}
              className="cursor-grab fill-slate-700 stroke-white dark:fill-slate-200 dark:stroke-slate-900"
              strokeWidth={1.5}
              onPointerDown={onPointPointerDown(index)}
              onDoubleClick={removePoint(index)}
            />
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
        The indigo line is the first component and the amber line the second,
        each drawn to the spread it carries. Green dots are people flattened
        onto the first.
      </p>

      <div className="mt-3 grid grid-cols-3 gap-3">
        <Stat
          label="Share of component 1"
          value={
            analysis ? analysis.components[0].share.toFixed(3) : "…"
          }
        />
        <Stat
          label="Share of component 2"
          value={
            analysis && analysis.components[1]
              ? analysis.components[1].share.toFixed(3)
              : "…"
          }
        />
        <Stat
          label="Direction 1"
          value={
            analysis
              ? `(${analysis.components[0].dx.toFixed(2)}, ${analysis.components[0].dy.toFixed(2)})`
              : "…"
          }
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
      <div className="font-mono text-base font-semibold text-slate-900 dark:text-slate-100">
        {value}
      </div>
    </div>
  );
}
