"use client";

// The two shrinkage rules, traced from no penalty to a heavy one.
//
// Both models refit the regression page's five worked people at every penalty
// from 0 to 500 and report only the slope. Ridge divides the slope by a factor
// that grows with the penalty, so the indigo curve flattens toward the zero
// line without ever landing on it. Lasso subtracts a fixed amount instead, so
// the amber curve reaches zero and stays there, and the dot marks the first
// penalty where it does. Every slope comes from the API; the browser only
// draws.

import { useEffect, useState } from "react";
import { ApiError, Point, ShrinkagePath, traceShrinkage } from "@/lib/api";

const VIEW_WIDTH = 520;
const VIEW_HEIGHT = 320;
const MARGIN_LEFT = 48;
const MARGIN_RIGHT = 16;
const MARGIN_TOP = 16;
const MARGIN_BOTTOM = 36;
const PLOT_WIDTH = VIEW_WIDTH - MARGIN_LEFT - MARGIN_RIGHT;
const PLOT_HEIGHT = VIEW_HEIGHT - MARGIN_TOP - MARGIN_BOTTOM;

const PENALTY_MAX = 500;
const SLOPE_MAX = 0.85;
const PENALTY_TICKS = [0, 100, 200, 300, 400, 500];
const SLOPE_TICKS = [0, 0.2, 0.4, 0.6, 0.8];

// The regression page's five worked people.
const FIVE_PEOPLE: Point[] = [
  { x: 160, y: 58 },
  { x: 165, y: 66 },
  { x: 170, y: 68 },
  { x: 175, y: 74 },
  { x: 180, y: 74 },
];

function penaltyToX(penalty: number): number {
  return MARGIN_LEFT + (penalty / PENALTY_MAX) * PLOT_WIDTH;
}

function slopeToY(slope: number): number {
  return MARGIN_TOP + PLOT_HEIGHT - (slope / SLOPE_MAX) * PLOT_HEIGHT;
}

function tracedPath(penalties: number[], slopes: number[]): string {
  return penalties
    .map((penalty, position) => {
      const command = position === 0 ? "M" : "L";
      const svgX = penaltyToX(penalty).toFixed(1);
      const svgY = slopeToY(slopes[position]).toFixed(1);
      return `${command} ${svgX} ${svgY}`;
    })
    .join(" ");
}

function indexNearestPenalty(penalties: number[], target: number): number {
  let nearestIndex = 0;
  for (let position = 1; position < penalties.length; position++) {
    const currentGap = Math.abs(penalties[position] - target);
    const nearestGap = Math.abs(penalties[nearestIndex] - target);
    if (currentGap < nearestGap) nearestIndex = position;
  }
  return nearestIndex;
}

export function ShrinkagePathChart() {
  const [path, setPath] = useState<ShrinkagePath | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setPath(await traceShrinkage(FIVE_PEOPLE));
      } catch (error) {
        if (error instanceof ApiError) setMessage(error.message);
        else setMessage("Something went wrong.");
      }
    })();
  }, []);

  let ridgeSlopeAtPenaltyZero: number | null = null;
  let ridgeSlopeAtPenaltyTwoHundredFifty: number | null = null;
  let lassoZeroPenalty: number | null = null;

  if (path) {
    ridgeSlopeAtPenaltyZero =
      path.ridge_slopes[indexNearestPenalty(path.penalties, 0)];
    ridgeSlopeAtPenaltyTwoHundredFifty =
      path.ridge_slopes[indexNearestPenalty(path.penalties, 250)];
    const zeroPosition = path.lasso_slopes.findIndex((slope) => slope === 0);
    if (zeroPosition >= 0) lassoZeroPenalty = path.penalties[zeroPosition];
  }

  return (
    <div>
      <svg
        viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}
        className="mx-auto w-full max-w-lg select-none rounded-lg bg-slate-50 dark:bg-slate-950"
      >
        <line
          x1={MARGIN_LEFT}
          y1={MARGIN_TOP}
          x2={MARGIN_LEFT}
          y2={MARGIN_TOP + PLOT_HEIGHT}
          stroke="currentColor"
          className="text-slate-300 dark:text-slate-700"
          strokeWidth={1}
        />
        <line
          x1={penaltyToX(0)}
          y1={slopeToY(0)}
          x2={penaltyToX(PENALTY_MAX)}
          y2={slopeToY(0)}
          stroke="currentColor"
          className="text-slate-300 dark:text-slate-700"
          strokeWidth={1}
        />

        {PENALTY_TICKS.map((penalty) => (
          <g key={`penalty${penalty}`}>
            <line
              x1={penaltyToX(penalty)}
              y1={MARGIN_TOP + PLOT_HEIGHT}
              x2={penaltyToX(penalty)}
              y2={MARGIN_TOP + PLOT_HEIGHT + 4}
              stroke="currentColor"
              className="text-slate-300 dark:text-slate-700"
              strokeWidth={1}
            />
            <text
              x={penaltyToX(penalty)}
              y={MARGIN_TOP + PLOT_HEIGHT + 16}
              textAnchor="middle"
              className="fill-slate-500 text-xs dark:fill-slate-400"
            >
              {penalty}
            </text>
          </g>
        ))}

        {SLOPE_TICKS.map((slope) => (
          <g key={`slope${slope}`}>
            <line
              x1={MARGIN_LEFT - 4}
              y1={slopeToY(slope)}
              x2={MARGIN_LEFT}
              y2={slopeToY(slope)}
              stroke="currentColor"
              className="text-slate-300 dark:text-slate-700"
              strokeWidth={1}
            />
            <text
              x={MARGIN_LEFT - 8}
              y={slopeToY(slope) + 4}
              textAnchor="end"
              className="fill-slate-500 text-xs dark:fill-slate-400"
            >
              {slope.toFixed(1)}
            </text>
          </g>
        ))}

        {path && (
          <path
            d={tracedPath(path.penalties, path.ridge_slopes)}
            fill="none"
            stroke="currentColor"
            className="text-indigo-500 dark:text-indigo-400"
            strokeWidth={2}
          />
        )}
        {path && (
          <path
            d={tracedPath(path.penalties, path.lasso_slopes)}
            fill="none"
            stroke="currentColor"
            className="text-amber-500 dark:text-amber-400"
            strokeWidth={2}
          />
        )}

        {lassoZeroPenalty !== null && (
          <circle
            cx={penaltyToX(lassoZeroPenalty)}
            cy={slopeToY(0)}
            r={5}
            className="fill-amber-500 stroke-white dark:stroke-slate-900"
            strokeWidth={2}
          />
        )}

        <line
          x1={MARGIN_LEFT + PLOT_WIDTH - 108}
          y1={MARGIN_TOP + 12}
          x2={MARGIN_LEFT + PLOT_WIDTH - 84}
          y2={MARGIN_TOP + 12}
          stroke="currentColor"
          className="text-indigo-500 dark:text-indigo-400"
          strokeWidth={2}
        />
        <text
          x={MARGIN_LEFT + PLOT_WIDTH - 78}
          y={MARGIN_TOP + 16}
          className="fill-slate-500 text-xs font-medium dark:fill-slate-400"
        >
          Ridge
        </text>
        <line
          x1={MARGIN_LEFT + PLOT_WIDTH - 108}
          y1={MARGIN_TOP + 32}
          x2={MARGIN_LEFT + PLOT_WIDTH - 84}
          y2={MARGIN_TOP + 32}
          stroke="currentColor"
          className="text-amber-500 dark:text-amber-400"
          strokeWidth={2}
        />
        <text
          x={MARGIN_LEFT + PLOT_WIDTH - 78}
          y={MARGIN_TOP + 36}
          className="fill-slate-500 text-xs font-medium dark:fill-slate-400"
        >
          Lasso
        </text>

        <text
          x={MARGIN_LEFT + PLOT_WIDTH / 2}
          y={VIEW_HEIGHT - 6}
          textAnchor="middle"
          className="fill-slate-500 text-xs font-medium dark:fill-slate-400"
        >
          Penalty λ
        </text>
        <text
          transform={`translate(14 ${MARGIN_TOP + PLOT_HEIGHT / 2}) rotate(-90)`}
          textAnchor="middle"
          className="fill-slate-500 text-xs font-medium dark:fill-slate-400"
        >
          Slope β
        </text>
      </svg>

      <p className="mt-2 text-center text-xs text-slate-500 dark:text-slate-500">
        Ridge divides the slope by a factor that grows with the penalty so it
        only ever approaches zero, while lasso subtracts a fixed amount each
        step and so actually arrives.
      </p>

      <div className="mt-3 grid grid-cols-3 gap-3">
        <Stat
          label="Ridge slope at penalty 0"
          value={
            ridgeSlopeAtPenaltyZero !== null
              ? ridgeSlopeAtPenaltyZero.toFixed(3)
              : "…"
          }
        />
        <Stat
          label="Ridge slope at penalty 250"
          value={
            ridgeSlopeAtPenaltyTwoHundredFifty !== null
              ? ridgeSlopeAtPenaltyTwoHundredFifty.toFixed(3)
              : "…"
          }
        />
        <Stat
          label="Lasso reaches zero at"
          value={
            path
              ? lassoZeroPenalty !== null
                ? lassoZeroPenalty.toFixed(0)
                : "never"
              : "…"
          }
        />
      </div>

      {message && (
        <p className="mt-3 text-sm text-amber-600 dark:text-amber-400">{message}</p>
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
