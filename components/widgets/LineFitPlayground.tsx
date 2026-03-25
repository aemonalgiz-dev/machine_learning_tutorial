"use client";

// Drop points, drag them, watch the best-fit line follow.
//
// The point of the widget is to make "the line that fits best" a thing you feel
// rather than a formula you take on faith: drag one point up and the whole line
// tilts toward it, and the grey residual sticks -- the misses the line is
// trading off -- grow and shrink as you go. Every fit is the API's, debounced so
// a drag sends a handful of requests rather than a hundred, and the last good
// line stays on screen while the next is in flight so the picture never flickers
// empty.

import { useCallback, useEffect, useRef, useState } from "react";
import { ApiError, fitSimpleLinearRegression, LineFit, Point } from "@/lib/api";

const DOMAIN = { xMin: 0, xMax: 10, yMin: 0, yMax: 10 };
const VIEW = { width: 640, height: 440 };
const PAD = { left: 44, right: 16, top: 16, bottom: 36 };

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
  const x =
    DOMAIN.xMin +
    ((px - PAD.left) / PLOT.width) * (DOMAIN.xMax - DOMAIN.xMin);
  const y =
    DOMAIN.yMin +
    (1 - (py - PAD.top) / PLOT.height) * (DOMAIN.yMax - DOMAIN.yMin);
  return {
    x: clamp(round2(x), DOMAIN.xMin, DOMAIN.xMax),
    y: clamp(round2(y), DOMAIN.yMin, DOMAIN.yMax),
  };
}

const clamp = (value: number, low: number, high: number) =>
  Math.min(high, Math.max(low, value));
const round2 = (value: number) => Math.round(value * 100) / 100;

const STARTING_POINTS: Point[] = [
  { x: 1, y: 2 },
  { x: 3, y: 3.4 },
  { x: 5, y: 4.1 },
  { x: 7, y: 6.3 },
  { x: 9, y: 6.9 },
];

function randomScatter(): Point[] {
  const slope = 0.4 + Math.random() * 0.6;
  const intercept = 1 + Math.random() * 2;
  return Array.from({ length: 6 }, (_, index) => {
    const x = round2(1 + index * 1.5);
    const noise = (Math.random() - 0.5) * 2.5;
    return { x, y: clamp(round2(slope * x + intercept + noise), 0, 10) };
  });
}

export function LineFitPlayground() {
  const [points, setPoints] = useState<Point[]>(STARTING_POINTS);
  const [fit, setFit] = useState<LineFit | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const dragging = useRef<number | null>(null);

  // Debounced fit: the effect re-runs on every points change, but waits out a
  // short quiet period first, so a drag that changes points many times a second
  // still sends only a request or two.
  useEffect(() => {
    if (points.length < 2) {
      setFit(null);
      setMessage("Add at least two points to fit a line.");
      return;
    }
    const timer = setTimeout(async () => {
      try {
        setFit(await fitSimpleLinearRegression(points));
        setMessage(null);
      } catch (error) {
        if (error instanceof ApiError) setMessage(error.message);
        else setMessage("Something went wrong computing the fit.");
      }
    }, 120);
    return () => clearTimeout(timer);
  }, [points]);

  const eventToData = useCallback((clientX: number, clientY: number): Point => {
    const svg = svgRef.current!;
    const rect = svg.getBoundingClientRect();
    const px = ((clientX - rect.left) / rect.width) * VIEW.width;
    const py = ((clientY - rect.top) / rect.height) * VIEW.height;
    return toData(px, py);
  }, []);

  const onBackgroundPointerDown = (event: React.PointerEvent) => {
    if (dragging.current !== null) return;
    const dropped = eventToData(event.clientX, event.clientY);
    setPoints((current) => [...current, dropped]);
    dragging.current = points.length; // the new point's index
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
    setPoints((current) =>
      current.map((point, index) =>
        index === dragging.current ? moved : point,
      ),
    );
  };

  const onPointerUp = () => {
    dragging.current = null;
  };

  const removePoint = (index: number) => (event: React.MouseEvent) => {
    event.stopPropagation();
    setPoints((current) => current.filter((_, i) => i !== index));
  };

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 pb-3">
        <Button onClick={() => setPoints(randomScatter())}>Random scatter</Button>
        <Button onClick={() => setPoints(STARTING_POINTS)}>Reset</Button>
        <Button onClick={() => setPoints([])}>Clear</Button>
        <span className="ml-auto text-xs text-slate-500 dark:text-slate-500">
          Click to add · drag to move · double-click a point to remove
        </span>
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
        <Grid />

        {/* residual sticks: each point down (or up) to the fitted line */}
        {fit &&
          points.map((point, index) => {
            const predictedY = fit.slope * point.x + fit.intercept;
            const a = toPixel(point);
            const b = toPixel({ x: point.x, y: predictedY });
            return (
              <line
                key={`res-${index}`}
                x1={a.px}
                y1={a.py}
                x2={b.px}
                y2={b.py}
                stroke="currentColor"
                className="text-slate-400 dark:text-slate-600"
                strokeWidth={1.5}
                strokeDasharray="3 3"
              />
            );
          })}

        {/* the fitted line, clipped to the plot */}
        {fit && (
          <line
            x1={toPixel({ x: fit.line.x_start, y: fit.line.y_start }).px}
            y1={toPixel({ x: fit.line.x_start, y: fit.line.y_start }).py}
            x2={toPixel({ x: fit.line.x_end, y: fit.line.y_end }).px}
            y2={toPixel({ x: fit.line.x_end, y: fit.line.y_end }).py}
            stroke="currentColor"
            className="text-indigo-500"
            strokeWidth={2.5}
          />
        )}

        {/* the points */}
        {points.map((point, index) => {
          const { px, py } = toPixel(point);
          return (
            <circle
              key={`pt-${index}`}
              cx={px}
              cy={py}
              r={7}
              className="cursor-grab fill-slate-700 stroke-white dark:fill-slate-200 dark:stroke-slate-900"
              strokeWidth={2}
              onPointerDown={onPointPointerDown(index)}
              onDoubleClick={removePoint(index)}
            />
          );
        })}
      </svg>

      <StatsPanel fit={fit} message={message} pointCount={points.length} />
    </div>
  );
}

function StatsPanel({
  fit,
  message,
  pointCount,
}: {
  fit: LineFit | null;
  message: string | null;
  pointCount: number;
}) {
  return (
    <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
      <Stat label="Points" value={String(pointCount)} />
      <Stat label="Slope" value={fit ? fit.slope.toFixed(3) : "—"} />
      <Stat label="Intercept" value={fit ? fit.intercept.toFixed(3) : "—"} />
      <Stat
        label="R²"
        value={fit ? fit.r_squared.toFixed(3) : "—"}
        hint="how much of the spread the line explains"
      />
      {message && (
        <p className="col-span-full text-sm text-amber-600 dark:text-amber-400">
          {message}
        </p>
      )}
    </div>
  );
}

function Stat({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div
      className="rounded-lg bg-slate-100 px-3 py-2 dark:bg-slate-800"
      title={hint}
    >
      <div className="text-xs text-slate-500 dark:text-slate-400">{label}</div>
      <div className="font-mono text-lg font-semibold text-slate-900 dark:text-slate-100">
        {value}
      </div>
    </div>
  );
}

function Button({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
    >
      {children}
    </button>
  );
}

function Grid() {
  const lines = [];
  for (let gx = DOMAIN.xMin; gx <= DOMAIN.xMax; gx += 2) {
    const { px } = toPixel({ x: gx, y: 0 });
    lines.push(
      <g key={`gx-${gx}`}>
        <line
          x1={px}
          y1={PAD.top}
          x2={px}
          y2={PAD.top + PLOT.height}
          stroke="currentColor"
          className="text-slate-200 dark:text-slate-800"
        />
        <text
          x={px}
          y={PAD.top + PLOT.height + 20}
          textAnchor="middle"
          className="fill-slate-400 text-[11px]"
        >
          {gx}
        </text>
      </g>,
    );
  }
  for (let gy = DOMAIN.yMin; gy <= DOMAIN.yMax; gy += 2) {
    const { py } = toPixel({ x: 0, y: gy });
    lines.push(
      <g key={`gy-${gy}`}>
        <line
          x1={PAD.left}
          y1={py}
          x2={PAD.left + PLOT.width}
          y2={py}
          stroke="currentColor"
          className="text-slate-200 dark:text-slate-800"
        />
        <text
          x={PAD.left - 10}
          y={py + 4}
          textAnchor="end"
          className="fill-slate-400 text-[11px]"
        >
          {gy}
        </text>
      </g>,
    );
  }
  return <>{lines}</>;
}
