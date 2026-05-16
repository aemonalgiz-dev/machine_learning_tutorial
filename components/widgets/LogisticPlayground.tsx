"use client";

// Hours studied against pass or fail, and the probability curve between them.
//
// Fails sit on the floor of the plot and passes on its ceiling, since the
// outcome is one or the other, and the curve is the fitted probability of
// passing at every number of hours. The dashed line is the boundary, the hours
// at which the probability crosses one half. Click low to add a fail, high to
// add a pass, drag sideways, double-click to remove. Every fit is the
// library's through the API, not the browser's.

import { useCallback, useEffect, useRef, useState } from "react";
import { ApiError, LogisticFit, Outcome, fitLogistic } from "@/lib/api";

const DOMAIN = { xMin: 0, xMax: 10 };
const VIEW = { width: 640, height: 380 };
const PAD = { left: 52, right: 16, top: 20, bottom: 48 };
const PLOT = {
  width: VIEW.width - PAD.left - PAD.right,
  height: VIEW.height - PAD.top - PAD.bottom,
};

// Twelve outcomes with an overlap between four and five and a half hours, the
// worked set the page reads its numbers from.
const WORKED_OUTCOMES: Outcome[] = [
  { x: 1, label: 0 },
  { x: 1.5, label: 0 },
  { x: 2, label: 0 },
  { x: 3, label: 0 },
  { x: 3.5, label: 0 },
  { x: 5, label: 0 },
  { x: 4, label: 1 },
  { x: 4.5, label: 1 },
  { x: 5.5, label: 1 },
  { x: 6, label: 1 },
  { x: 7, label: 1 },
  { x: 8, label: 1 },
];

// The ideal case, a clear gap between the classes, every student called
// correctly. Separation also steepens the curve, which the page explains.
const IDEAL_OUTCOMES: Outcome[] = [
  { x: 1, label: 0 },
  { x: 1.5, label: 0 },
  { x: 2, label: 0 },
  { x: 2.5, label: 0 },
  { x: 3, label: 0 },
  { x: 3.5, label: 0 },
  { x: 5.5, label: 1 },
  { x: 6, label: 1 },
  { x: 6.5, label: 1 },
  { x: 7, label: 1 },
  { x: 7.5, label: 1 },
  { x: 8, label: 1 },
];

function randomOutcomes(): Outcome[] {
  const boundary = 3.5 + Math.random() * 2;
  return Array.from({ length: 16 }, () => {
    const hours = Math.round((0.5 + Math.random() * 9) * 4) / 4;
    const lean = 1 / (1 + Math.exp(-(hours - boundary) * 0.5));
    return { x: hours, label: Math.random() < lean ? 1 : 0 };
  });
}

const MAX_POINTS = 100;

function toPixelX(x: number) {
  return PAD.left + ((x - DOMAIN.xMin) / (DOMAIN.xMax - DOMAIN.xMin)) * PLOT.width;
}

function toPixelY(probability: number) {
  return PAD.top + (1 - probability) * PLOT.height;
}

function toHours(px: number) {
  const raw = DOMAIN.xMin + ((px - PAD.left) / PLOT.width) * (DOMAIN.xMax - DOMAIN.xMin);
  return Math.min(DOMAIN.xMax, Math.max(DOMAIN.xMin, Math.round(raw * 20) / 20));
}

function statusText(fit: LogisticFit | null, learningRate: number): string {
  if (!fit) return "…";
  if (learningRate > 2 && fit.slope > 5) {
    return "The climb is overshooting. Each stride flies past the top, the slope balloons instead of settling, and the boundary wanders.";
  }
  if (fit.slope > 5) {
    return "The two classes no longer overlap, so nothing stops the slope growing and the curve steepens toward a step.";
  }
  if (fit.boundary === null) {
    return "The fitted curve is level, so no boundary exists to report.";
  }
  return `The curve crosses one half at ${fit.boundary.toFixed(2)} hours, and everything to the right is called a pass.`;
}

export function LogisticPlayground() {
  const [points, setPoints] = useState<Outcome[]>(WORKED_OUTCOMES);
  const [rateExponent, setRateExponent] = useState(-1);
  const [fit, setFit] = useState<LogisticFit | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const dragging = useRef<number | null>(null);

  const learningRate = Math.round(10 ** rateExponent * 100) / 100;

  useEffect(() => {
    const timer = setTimeout(async () => {
      try {
        setFit(await fitLogistic(points, learningRate));
        setMessage(null);
      } catch (error) {
        if (error instanceof ApiError) setMessage(error.message);
        else setMessage("Something went wrong computing the fit.");
      }
    }, 120);
    return () => clearTimeout(timer);
  }, [points, learningRate]);

  const eventToPlot = useCallback((clientX: number, clientY: number) => {
    const svg = svgRef.current!;
    const rect = svg.getBoundingClientRect();
    const px = ((clientX - rect.left) / rect.width) * VIEW.width;
    const py = ((clientY - rect.top) / rect.height) * VIEW.height;
    return { hours: toHours(px), upper: py < PAD.top + PLOT.height / 2 };
  }, []);

  const onBackgroundPointerDown = (event: React.PointerEvent) => {
    if (dragging.current !== null) return;
    if (points.length >= MAX_POINTS) return;
    const { hours, upper } = eventToPlot(event.clientX, event.clientY);
    setPoints((current) => [...current, { x: hours, label: upper ? 1 : 0 }]);
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
    const { hours } = eventToPlot(event.clientX, event.clientY);
    setPoints((current) =>
      current.map((point, index) =>
        index === dragging.current ? { ...point, x: hours } : point,
      ),
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

  const curvePath = fit
    ? fit.curve
        .map(
          (point, index) =>
            `${index === 0 ? "M" : "L"} ${toPixelX(point.x).toFixed(2)} ${toPixelY(point.y).toFixed(2)}`,
        )
        .join(" ")
    : "";

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 pb-3">
        <button
          onClick={() => setPoints(IDEAL_OUTCOMES)}
          className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
        >
          An Ideal Case
        </button>
        <button
          onClick={() => setPoints(WORKED_OUTCOMES)}
          className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
        >
          The overlap
        </button>
        <button
          onClick={() => setPoints(randomOutcomes())}
          className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
        >
          Random class
        </button>
        <label className="ml-auto flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
          Learning rate
          <input
            type="range"
            min={-1}
            max={1.7}
            step={0.1}
            value={rateExponent}
            onChange={(event) => setRateExponent(Number(event.target.value))}
            className="w-32 accent-indigo-600"
          />
          <span className="w-12 font-mono text-sm">
            {learningRate.toFixed(learningRate >= 10 ? 0 : 2)}
          </span>
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
        {/* probability gridlines */}
        {[0, 0.5, 1].map((level) => (
          <g key={level}>
            <line
              x1={PAD.left}
              y1={toPixelY(level)}
              x2={PAD.left + PLOT.width}
              y2={toPixelY(level)}
              stroke="currentColor"
              className="text-slate-200 dark:text-slate-800"
              strokeDasharray={level === 0.5 ? "3 3" : undefined}
            />
            <text
              x={PAD.left - 8}
              y={toPixelY(level) + 4}
              textAnchor="end"
              className="fill-slate-400 text-[11px]"
            >
              {level}
            </text>
          </g>
        ))}
        {Array.from({ length: 11 }, (_, hour) => (
          <text
            key={hour}
            x={toPixelX(hour)}
            y={PAD.top + PLOT.height + 18}
            textAnchor="middle"
            className="fill-slate-400 text-[11px]"
          >
            {hour}
          </text>
        ))}

        {/* the boundary, where the probability crosses one half */}
        {fit?.boundary !== null && fit?.boundary !== undefined && (
          <line
            x1={toPixelX(fit.boundary)}
            y1={PAD.top}
            x2={toPixelX(fit.boundary)}
            y2={PAD.top + PLOT.height}
            stroke="currentColor"
            className="text-emerald-500"
            strokeWidth={2}
            strokeDasharray="6 4"
          />
        )}

        {/* the fitted probability curve */}
        {fit && (
          <path
            d={curvePath}
            fill="none"
            stroke="currentColor"
            className="text-indigo-500"
            strokeWidth={2.5}
          />
        )}

        {/* the outcomes, fails on the floor and passes on the ceiling */}
        {points.map((point, index) => (
          <circle
            key={index}
            cx={toPixelX(point.x)}
            cy={toPixelY(point.label)}
            r={7}
            className={
              point.label === 1
                ? "cursor-grab fill-indigo-600 stroke-white dark:stroke-slate-900"
                : "cursor-grab fill-amber-500 stroke-white dark:stroke-slate-900"
            }
            strokeWidth={2}
            onPointerDown={onPointPointerDown(index)}
            onDoubleClick={removePoint(index)}
          />
        ))}

        <text
          x={PAD.left + PLOT.width / 2}
          y={VIEW.height - 6}
          textAnchor="middle"
          className="fill-slate-500 text-xs font-medium dark:fill-slate-400"
        >
          Hours studied
        </text>
        <text
          x={14}
          y={PAD.top + PLOT.height / 2}
          textAnchor="middle"
          transform={`rotate(-90 14 ${PAD.top + PLOT.height / 2})`}
          className="fill-slate-500 text-xs font-medium dark:fill-slate-400"
        >
          Probability of passing
        </text>
      </svg>

      <div className="mt-3 grid grid-cols-3 gap-3">
        <Stat
          label="Boundary (hours)"
          value={
            fit && fit.boundary !== null ? fit.boundary.toFixed(2) : "…"
          }
        />
        <Stat label="Slope" value={fit ? fit.slope.toFixed(2) : "…"} />
        <Stat label="Accuracy" value={fit ? fit.accuracy.toFixed(3) : "…"} />
      </div>

      <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
        {message ? message : statusText(fit, learningRate)}
      </p>
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
