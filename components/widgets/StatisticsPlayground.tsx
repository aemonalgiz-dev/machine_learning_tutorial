"use client";

// A cloud of people, and every number the primer builds read off it live.
//
// Each dot is one person, height across and weight up, draggable like the
// regression page's. The readouts show the means, the spreads, the covariance
// and the correlation, and the small cross marks the point of averages, the
// cloud's balance point. It loads the five people the site works by hand, so
// the readouts open on the exact numbers in the prose. Every number is the
// API's, not the browser's.

import { useCallback, useEffect, useRef, useState } from "react";
import { ApiError, CloudSummary, Point, summarizeCloud } from "@/lib/api";

const DOMAIN = { xMin: 150, xMax: 200, yMin: 40, yMax: 100 };
const VIEW = { width: 640, height: 440 };
const PAD = { left: 60, right: 16, top: 16, bottom: 52 };
const PLOT = {
  width: VIEW.width - PAD.left - PAD.right,
  height: VIEW.height - PAD.top - PAD.bottom,
};

// The five people the regression page fitted and the primer summarises by hand.
const WORKED_PEOPLE: Point[] = [
  { x: 160, y: 58 },
  { x: 165, y: 66 },
  { x: 170, y: 68 },
  { x: 175, y: 74 },
  { x: 180, y: 74 },
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
  const x =
    DOMAIN.xMin + ((px - PAD.left) / PLOT.width) * (DOMAIN.xMax - DOMAIN.xMin);
  const y =
    DOMAIN.yMin +
    (1 - (py - PAD.top) / PLOT.height) * (DOMAIN.yMax - DOMAIN.yMin);
  const clamp = (value: number, low: number, high: number) =>
    Math.min(high, Math.max(low, Math.round(value * 100) / 100));
  return {
    x: clamp(x, DOMAIN.xMin, DOMAIN.xMax),
    y: clamp(y, DOMAIN.yMin, DOMAIN.yMax),
  };
}

function randomPeople(): Point[] {
  const slope = 0.5 + Math.random() * 0.25;
  const intercept = -40 + (Math.random() - 0.5) * 12;
  return Array.from({ length: 15 }, (_, index) => {
    const x = Math.round((152 + index * 3) * 100) / 100;
    const noise = (Math.random() - 0.5) * 14;
    const y = Math.min(
      DOMAIN.yMax,
      Math.max(DOMAIN.yMin, Math.round((slope * x + intercept + noise) * 100) / 100),
    );
    return { x, y };
  });
}

function shapelessPeople(): Point[] {
  return Array.from({ length: 15 }, () => ({
    x: Math.round((152 + Math.random() * 46) * 100) / 100,
    y: Math.round((45 + Math.random() * 50) * 100) / 100,
  }));
}

function correlationText(summary: CloudSummary): string {
  if (summary.correlation === null) {
    return "One of the spreads is zero, so correlation has nothing to divide by and is undefined.";
  }
  const r = summary.correlation;
  if (r > 0.8) {
    return "The two move tightly together, so the correlation is close to 1.";
  }
  if (r > 0.3) {
    return "The two lean together loosely, so the correlation is positive but well short of 1.";
  }
  if (r > -0.3) {
    return "There is little linear pattern here, so the correlation sits near 0.";
  }
  return "One tends to fall as the other rises, so the correlation is negative.";
}

export function StatisticsPlayground() {
  const [points, setPoints] = useState<Point[]>(WORKED_PEOPLE);
  const [summary, setSummary] = useState<CloudSummary | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const dragging = useRef<number | null>(null);

  useEffect(() => {
    if (points.length === 0) return;
    const timer = setTimeout(async () => {
      try {
        setSummary(await summarizeCloud(points));
        setMessage(null);
      } catch (error) {
        if (error instanceof ApiError) setMessage(error.message);
        else setMessage("Something went wrong.");
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
    if (points.length <= 1) return;
    setPoints((current) => current.filter((_, i) => i !== index));
  };

  const meanPixel = summary
    ? toPixel({ x: summary.mean_x, y: summary.mean_y })
    : null;

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 pb-3">
        <Button onClick={() => setPoints(WORKED_PEOPLE)}>Worked example</Button>
        <Button onClick={() => setPoints(randomPeople())}>Random people</Button>
        <Button onClick={() => setPoints(shapelessPeople())}>No pattern</Button>
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

        {/* the point of averages, the cloud's balance point */}
        {meanPixel && (
          <>
            <line
              x1={meanPixel.px - 10}
              y1={meanPixel.py}
              x2={meanPixel.px + 10}
              y2={meanPixel.py}
              stroke="currentColor"
              className="text-emerald-500"
              strokeWidth={2}
            />
            <line
              x1={meanPixel.px}
              y1={meanPixel.py - 10}
              x2={meanPixel.px}
              y2={meanPixel.py + 10}
              stroke="currentColor"
              className="text-emerald-500"
              strokeWidth={2}
            />
          </>
        )}

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

      <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
        <Stat
          label="Mean height"
          value={summary ? summary.mean_x.toFixed(2) : "…"}
        />
        <Stat
          label="Mean weight"
          value={summary ? summary.mean_y.toFixed(2) : "…"}
        />
        <Stat
          label="SD of height"
          value={summary ? summary.standard_deviation_x.toFixed(2) : "…"}
        />
        <Stat
          label="SD of weight"
          value={summary ? summary.standard_deviation_y.toFixed(2) : "…"}
        />
        <Stat
          label="Covariance"
          value={summary ? summary.covariance.toFixed(2) : "…"}
        />
        <Stat
          label="Correlation r"
          value={
            summary
              ? summary.correlation === null
                ? "…"
                : summary.correlation.toFixed(3)
              : "…"
          }
        />
      </div>

      <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
        {message ? message : summary ? correlationText(summary) : "…"}
      </p>
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

function Grid() {
  const lines = [];
  for (let gx = DOMAIN.xMin; gx <= DOMAIN.xMax; gx += 10) {
    const { px } = toPixel({ x: gx, y: DOMAIN.yMin });
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
  for (let gy = DOMAIN.yMin; gy <= DOMAIN.yMax; gy += 10) {
    const { py } = toPixel({ x: DOMAIN.xMin, y: gy });
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
  return (
    <>
      {lines}
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
    </>
  );
}
