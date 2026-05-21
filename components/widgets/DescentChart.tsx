"use client";

// The descent the gradient boosting page runs by hand, drawn as bars.
//
// Each bar is the squared leftover across the three worked points, t of 1, 2,
// 3 with heights 2, 6, 10, after that many rounds of boosting at a learning
// rate of a half. Round 0 is the flat mean start, in slate, and its bar is
// the 32 the page sums by hand. Round 1 drops to 14 and round 2 to 3.875,
// the page's own arithmetic, and the indigo bars beyond them carry the same
// walk on for twenty rounds. Every height comes from the API; the browser
// only draws.

import { useEffect, useState } from "react";
import {
  ApiError,
  BoostingDescent,
  Point,
  traceBoostingDescent,
} from "@/lib/api";

const VIEW_WIDTH = 520;
const VIEW_HEIGHT = 280;
const PLOT_LEFT = 16;
const PLOT_RIGHT = VIEW_WIDTH - 16;
const PLOT_TOP = 16;
const PLOT_BOTTOM = VIEW_HEIGHT - 32;

// The gradient boosting page's three worked points, height against t.
const THREE_POINTS: Point[] = [
  { x: 1, y: 2 },
  { x: 2, y: 6 },
  { x: 3, y: 10 },
];

const ROUNDS = 20;
const LEARNING_RATE = 0.5;
const LABEL_EVERY = 5;

interface Bar {
  round: number;
  left: number;
  top: number;
  width: number;
  height: number;
  isFlatStart: boolean;
}

export function DescentChart() {
  const [descent, setDescent] = useState<BoostingDescent | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setDescent(
          await traceBoostingDescent(THREE_POINTS, ROUNDS, LEARNING_RATE),
        );
      } catch (error) {
        if (error instanceof ApiError) setMessage(error.message);
        else setMessage("Something went wrong.");
      }
    })();
  }, []);

  let bars: Bar[] = [];
  if (descent) {
    const tallestLeftover = Math.max(...descent.residual_sums);
    const slotWidth = (PLOT_RIGHT - PLOT_LEFT) / descent.rounds.length;
    bars = descent.rounds.map((round, roundIndex) => {
      const leftover = descent.residual_sums[roundIndex];
      const barHeight =
        tallestLeftover > 0
          ? (leftover / tallestLeftover) * (PLOT_BOTTOM - PLOT_TOP)
          : 0;
      return {
        round,
        left: PLOT_LEFT + roundIndex * slotWidth + slotWidth * 0.1,
        top: PLOT_BOTTOM - barHeight,
        width: slotWidth * 0.8,
        height: barHeight,
        isFlatStart: round === 0,
      };
    });
  }

  return (
    <div>
      <svg
        viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}
        className="mx-auto w-full max-w-lg select-none rounded-lg bg-slate-50 dark:bg-slate-950"
      >
        <line
          x1={PLOT_LEFT}
          y1={PLOT_BOTTOM}
          x2={PLOT_RIGHT}
          y2={PLOT_BOTTOM}
          stroke="currentColor"
          className="text-slate-200 dark:text-slate-800"
          strokeWidth={1}
        />

        {bars.map((bar) => (
          <rect
            key={bar.round}
            x={bar.left}
            y={bar.top}
            width={bar.width}
            height={bar.height}
            className={
              bar.isFlatStart
                ? "fill-slate-400 dark:fill-slate-500"
                : "fill-indigo-500 dark:fill-indigo-400"
            }
          />
        ))}

        {bars
          .filter((bar) => bar.round % LABEL_EVERY === 0)
          .map((bar) => (
            <text
              key={`label${bar.round}`}
              x={bar.left + bar.width / 2}
              y={PLOT_BOTTOM + 18}
              textAnchor="middle"
              className="fill-slate-500 text-xs font-medium dark:fill-slate-400"
            >
              {bar.round}
            </text>
          ))}
      </svg>

      <p className="mt-2 text-center text-xs text-slate-500 dark:text-slate-500">
        The first bars are the worked example&apos;s own numbers and every
        later round keeps shrinking what remains.
      </p>

      <div className="mt-3 grid grid-cols-3 gap-3">
        <Stat
          label="Leftover at round 0"
          value={descent ? descent.residual_sums[0].toFixed(0) : "…"}
        />
        <Stat
          label="After round 1"
          value={descent ? descent.residual_sums[1].toFixed(0) : "…"}
        />
        <Stat
          label="After round 2"
          value={descent ? descent.residual_sums[2].toFixed(3) : "…"}
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
