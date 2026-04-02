"use client";

// The page's main playground, the hold-out split made visible.
//
// The fifteen noisy throw measurements are split by the library into a
// training share and a held-out share. The slider chooses the polynomial
// degree, the API fits on the training share alone, and the two readouts
// score the same curve on each share. At degree 2 the shares agree. As the
// degree climbs the training score keeps improving while the held-out score
// falls away, and the gap between them is the page's whole argument. Every
// split, fit and score comes from the API, never the browser.

import { useEffect, useState } from "react";
import { ApiError, Point, SplitFit, fitOnSplit } from "@/lib/api";

const DOMAIN = { xMin: 0, xMax: 4, yMin: -2, yMax: 26 };
const VIEW = { width: 640, height: 440 };
const PAD = { left: 52, right: 16, top: 16, bottom: 52 };
const PLOT = {
  width: VIEW.width - PAD.left - PAD.right,
  height: VIEW.height - PAD.top - PAD.bottom,
};

// Fifteen noisy measurements of the thrown ball, shared with the other
// widgets on this page.
const NOISY_THROW: Point[] = [
  { x: 0.0, y: 0.7 },
  { x: 0.29, y: 5.2 },
  { x: 0.57, y: 9.5 },
  { x: 0.86, y: 13.0 },
  { x: 1.14, y: 16.9 },
  { x: 1.43, y: 18.1 },
  { x: 1.71, y: 19.4 },
  { x: 2.0, y: 21.0 },
  { x: 2.29, y: 19.6 },
  { x: 2.57, y: 19.1 },
  { x: 2.86, y: 16.8 },
  { x: 3.14, y: 13.6 },
  { x: 3.43, y: 11.1 },
  { x: 3.71, y: 6.2 },
  { x: 4.0, y: 1.2 },
];

function toPixel(point: Point) {
  const pixelX =
    PAD.left +
    ((point.x - DOMAIN.xMin) / (DOMAIN.xMax - DOMAIN.xMin)) * PLOT.width;
  const pixelY =
    PAD.top +
    (1 - (point.y - DOMAIN.yMin) / (DOMAIN.yMax - DOMAIN.yMin)) * PLOT.height;
  return { pixelX, pixelY };
}

// Scores can plunge far below zero at high degree, where three decimals
// would only be noise on a ruin.
function formatScore(value: number): string {
  if (value < -10) return value.toFixed(0);
  return value.toFixed(3);
}

function statusText(fit: SplitFit | null, degree: number): string {
  if (!fit) return "…";
  if (degree === 1) {
    return "Too stiff. The curve misses both shares alike, which is what underfitting looks like.";
  }
  if (fit.held_out_r_squared < 0) {
    return "The training score looks splendid and the held-out score has collapsed. The fit has memorised its share and learned nothing portable.";
  }
  if (fit.held_out_r_squared > 0.9 && degree <= 5) {
    return "Both shares agree. The curve is learning the throw, not the measurements.";
  }
  return "The shares are parting. The extra bends are starting to chase measurement noise.";
}

export function HoldOutPlayground() {
  const [degree, setDegree] = useState(2);
  const [fit, setFit] = useState<SplitFit | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(async () => {
      try {
        setFit(await fitOnSplit(NOISY_THROW, degree));
        setMessage(null);
      } catch (error) {
        if (error instanceof ApiError) setMessage(error.message);
        else setMessage("Something went wrong computing the fit.");
      }
    }, 120);
    return () => clearTimeout(timer);
  }, [degree]);

  const heldOutIndexSet = new Set(fit ? fit.held_out_indices : []);

  // The curve is drawn as the API returned it, clamped to the plot's edges
  // in pixels only, so a wild high-degree swing cannot escape the box.
  const curvePath = fit
    ? fit.curve
        .map((curvePoint, curveIndex) => {
          const { pixelX, pixelY } = toPixel(curvePoint);
          const clampedY = Math.min(
            PAD.top + PLOT.height,
            Math.max(PAD.top, pixelY),
          );
          return `${curveIndex === 0 ? "M" : "L"} ${pixelX.toFixed(2)} ${clampedY.toFixed(2)}`;
        })
        .join(" ")
    : "";

  const legendX = PAD.left + PLOT.width - 168;

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 pb-3">
        <label className="ml-auto flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
          Degree
          <input
            type="range"
            min={1}
            max={9}
            step={1}
            value={degree}
            onChange={(event) => setDegree(Number(event.target.value))}
            className="w-36 accent-indigo-600"
          />
          <span className="w-5 font-mono text-sm">{degree}</span>
        </label>
      </div>

      <svg
        viewBox={`0 0 ${VIEW.width} ${VIEW.height}`}
        className="w-full select-none rounded-lg bg-slate-50 dark:bg-slate-950"
      >
        <Grid />

        {fit && (
          <path
            d={curvePath}
            fill="none"
            stroke="currentColor"
            className="text-indigo-500"
            strokeWidth={2.5}
          />
        )}

        {NOISY_THROW.map((point, pointIndex) => {
          const { pixelX, pixelY } = toPixel(point);
          const isHeldOut = heldOutIndexSet.has(pointIndex);
          return isHeldOut ? (
            <circle
              key={`pt-${pointIndex}`}
              cx={pixelX}
              cy={pixelY}
              r={6.5}
              className="fill-amber-400 stroke-amber-600 dark:fill-amber-500 dark:stroke-amber-300"
              strokeWidth={3}
            />
          ) : (
            <circle
              key={`pt-${pointIndex}`}
              cx={pixelX}
              cy={pixelY}
              r={6}
              className="fill-indigo-500 stroke-white dark:fill-indigo-400 dark:stroke-slate-900"
              strokeWidth={2}
            />
          );
        })}

        <g>
          <circle
            cx={legendX}
            cy={PAD.top + 14}
            r={5.5}
            className="fill-indigo-500 stroke-white dark:fill-indigo-400 dark:stroke-slate-900"
            strokeWidth={2}
          />
          <text
            x={legendX + 12}
            y={PAD.top + 18}
            className="fill-slate-500 text-xs dark:fill-slate-400"
          >
            training
          </text>
          <circle
            cx={legendX + 82}
            cy={PAD.top + 14}
            r={5.5}
            className="fill-amber-400 stroke-amber-600 dark:fill-amber-500 dark:stroke-amber-300"
            strokeWidth={3}
          />
          <text
            x={legendX + 94}
            y={PAD.top + 18}
            className="fill-slate-500 text-xs dark:fill-slate-400"
          >
            held out
          </text>
        </g>
      </svg>

      <p className="mt-2 text-center text-xs text-slate-500 dark:text-slate-500">
        The amber points were hidden from the fit and only asked to judge it
        afterwards.
      </p>

      <div className="mt-3 grid grid-cols-3 gap-3">
        <Stat
          label="R² on the training share"
          value={fit ? fit.train_r_squared.toFixed(3) : "…"}
        />
        <Stat
          label="R² on the held-out share"
          value={fit ? formatScore(fit.held_out_r_squared) : "…"}
        />
        <Stat
          label="The gap"
          value={
            fit
              ? formatScore(fit.train_r_squared - fit.held_out_r_squared)
              : "…"
          }
        />
      </div>

      {!message && (
        <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
          {statusText(fit, degree)}
        </p>
      )}

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

function Grid() {
  const lines = [];
  for (let gridX = DOMAIN.xMin; gridX <= DOMAIN.xMax; gridX += 1) {
    const { pixelX } = toPixel({ x: gridX, y: DOMAIN.yMin });
    lines.push(
      <g key={`grid-x-${gridX}`}>
        <line
          x1={pixelX}
          y1={PAD.top}
          x2={pixelX}
          y2={PAD.top + PLOT.height}
          stroke="currentColor"
          className="text-slate-200 dark:text-slate-800"
        />
        <text
          x={pixelX}
          y={PAD.top + PLOT.height + 20}
          textAnchor="middle"
          className="fill-slate-400 text-[11px]"
        >
          {gridX}
        </text>
      </g>,
    );
  }
  for (let gridY = 0; gridY <= DOMAIN.yMax; gridY += 5) {
    const { pixelY } = toPixel({ x: DOMAIN.xMin, y: gridY });
    lines.push(
      <g key={`grid-y-${gridY}`}>
        <line
          x1={PAD.left}
          y1={pixelY}
          x2={PAD.left + PLOT.width}
          y2={pixelY}
          stroke="currentColor"
          className="text-slate-200 dark:text-slate-800"
        />
        <text
          x={PAD.left - 10}
          y={pixelY + 4}
          textAnchor="end"
          className="fill-slate-400 text-[11px]"
        >
          {gridY}
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
        Time (s)
      </text>
      <text
        x={14}
        y={PAD.top + PLOT.height / 2}
        textAnchor="middle"
        transform={`rotate(-90 14 ${PAD.top + PLOT.height / 2})`}
        className="fill-slate-500 text-xs font-medium dark:fill-slate-400"
      >
        Height (m)
      </text>
    </>
  );
}
