"use client";

// The curve behind the out-of-bag score.
//
// A bootstrap sample draws as many rows as the training set holds, with
// replacement, so any one row can be missed by every single draw. The curve
// shows the chance of that happening as the crowd grows from two rows to two
// hundred. It settles almost at once onto the dashed line at 1/e, just over
// a third, and the dot at a crowd of twenty five is already near enough to
// touch it. That flatness is the whole point, since a third of the rows held
// out for free is a third whatever the dataset's size. Every number comes
// from the API; the browser only draws.

import { useEffect, useState } from "react";
import { ApiError, LeaveOutCurve, traceLeaveOut } from "@/lib/api";

const VIEW_WIDTH = 520;
const VIEW_HEIGHT = 300;
const MARGIN_LEFT = 52;
const MARGIN_RIGHT = 16;
const MARGIN_TOP = 18;
const MARGIN_BOTTOM = 40;
const PLOT_WIDTH = VIEW_WIDTH - MARGIN_LEFT - MARGIN_RIGHT;
const PLOT_HEIGHT = VIEW_HEIGHT - MARGIN_TOP - MARGIN_BOTTOM;

const CROWD_LOW = 2;
const CROWD_HIGH = 200;
const CHANCE_LOW = 0.2;
const CHANCE_HIGH = 0.5;
const MARKED_CROWD = 25;

const CROWD_TICKS = [2, 50, 100, 150, 200];
const CHANCE_TICKS = [0.2, 0.3, 0.4, 0.5];

function horizontalFor(crowdSize: number): number {
  return (
    MARGIN_LEFT +
    ((crowdSize - CROWD_LOW) / (CROWD_HIGH - CROWD_LOW)) * PLOT_WIDTH
  );
}

function verticalFor(probability: number): number {
  return (
    MARGIN_TOP +
    ((CHANCE_HIGH - probability) / (CHANCE_HIGH - CHANCE_LOW)) * PLOT_HEIGHT
  );
}

export function LeaveOutChart() {
  const [curve, setCurve] = useState<LeaveOutCurve | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setCurve(await traceLeaveOut(CROWD_HIGH));
      } catch (error) {
        if (error instanceof ApiError) setMessage(error.message);
        else setMessage("Something went wrong.");
      }
    })();
  }, []);

  const chanceAt = (crowdSize: number): number | null => {
    if (!curve) return null;
    const position = curve.sizes.indexOf(crowdSize);
    if (position < 0) return null;
    return curve.probabilities[position];
  };

  const chanceAtMarked = chanceAt(MARKED_CROWD);
  const chanceAtLargest = chanceAt(CROWD_HIGH);

  let curvePoints = "";
  if (curve) {
    curvePoints = curve.sizes
      .map((size, position) => ({
        size,
        probability: curve.probabilities[position],
      }))
      .filter((point) => point.size >= CROWD_LOW && point.size <= CROWD_HIGH)
      .map(
        (point) =>
          `${horizontalFor(point.size)},${verticalFor(point.probability)}`,
      )
      .join(" ");
  }

  return (
    <div>
      <svg
        viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}
        className="mx-auto w-full max-w-lg select-none rounded-lg bg-slate-50 dark:bg-slate-950"
      >
        {CHANCE_TICKS.map((tick) => (
          <g key={`chance${tick}`}>
            <line
              x1={MARGIN_LEFT}
              y1={verticalFor(tick)}
              x2={VIEW_WIDTH - MARGIN_RIGHT}
              y2={verticalFor(tick)}
              stroke="currentColor"
              className="text-slate-200 dark:text-slate-800"
              strokeWidth={1}
            />
            <text
              x={MARGIN_LEFT - 8}
              y={verticalFor(tick) + 3}
              textAnchor="end"
              className="fill-slate-500 text-xs dark:fill-slate-400"
            >
              {tick.toFixed(1)}
            </text>
          </g>
        ))}

        {CROWD_TICKS.map((tick) => (
          <text
            key={`crowd${tick}`}
            x={horizontalFor(tick)}
            y={VIEW_HEIGHT - MARGIN_BOTTOM + 16}
            textAnchor="middle"
            className="fill-slate-500 text-xs dark:fill-slate-400"
          >
            {tick}
          </text>
        ))}

        <line
          x1={MARGIN_LEFT}
          y1={MARGIN_TOP}
          x2={MARGIN_LEFT}
          y2={VIEW_HEIGHT - MARGIN_BOTTOM}
          stroke="currentColor"
          className="text-slate-300 dark:text-slate-700"
          strokeWidth={1}
        />
        <line
          x1={MARGIN_LEFT}
          y1={VIEW_HEIGHT - MARGIN_BOTTOM}
          x2={VIEW_WIDTH - MARGIN_RIGHT}
          y2={VIEW_HEIGHT - MARGIN_BOTTOM}
          stroke="currentColor"
          className="text-slate-300 dark:text-slate-700"
          strokeWidth={1}
        />

        <text
          x={MARGIN_LEFT + PLOT_WIDTH / 2}
          y={VIEW_HEIGHT - 6}
          textAnchor="middle"
          className="fill-slate-500 text-xs font-medium dark:fill-slate-400"
        >
          Crowd size
        </text>
        <text
          x={14}
          y={MARGIN_TOP + PLOT_HEIGHT / 2}
          textAnchor="middle"
          transform={`rotate(-90 14 ${MARGIN_TOP + PLOT_HEIGHT / 2})`}
          className="fill-slate-500 text-xs font-medium dark:fill-slate-400"
        >
          Chance a row is missed
        </text>

        {curve && (
          <g>
            <line
              x1={MARGIN_LEFT}
              y1={verticalFor(curve.limit)}
              x2={VIEW_WIDTH - MARGIN_RIGHT}
              y2={verticalFor(curve.limit)}
              stroke="currentColor"
              className="text-slate-400 dark:text-slate-500"
              strokeWidth={1.5}
              strokeDasharray="6 4"
            />
            <text
              x={VIEW_WIDTH - MARGIN_RIGHT - 4}
              y={verticalFor(curve.limit) - 6}
              textAnchor="end"
              className="fill-slate-500 text-xs font-medium dark:fill-slate-400"
            >
              1/e
            </text>
          </g>
        )}

        {curvePoints && (
          <polyline
            points={curvePoints}
            fill="none"
            stroke="currentColor"
            className="text-indigo-500 dark:text-indigo-400"
            strokeWidth={2}
          />
        )}

        {chanceAtMarked !== null && (
          <circle
            cx={horizontalFor(MARKED_CROWD)}
            cy={verticalFor(chanceAtMarked)}
            r={6}
            className="fill-indigo-500 stroke-white dark:fill-indigo-400 dark:stroke-slate-900"
            strokeWidth={2}
          />
        )}
      </svg>

      <p className="mt-2 text-center text-xs text-slate-500 dark:text-slate-500">
        Whatever the crowd size, roughly the same third goes unseen, which is
        what makes the out-of-bag score dependable.
      </p>

      <div className="mt-3 grid grid-cols-3 gap-3">
        <Stat
          label="Missed at a crowd of 25"
          value={chanceAtMarked !== null ? chanceAtMarked.toFixed(3) : "…"}
        />
        <Stat
          label="Missed at a crowd of 200"
          value={chanceAtLargest !== null ? chanceAtLargest.toFixed(3) : "…"}
        />
        <Stat
          label="The limit, 1/e"
          value={curve ? curve.limit.toFixed(3) : "…"}
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
