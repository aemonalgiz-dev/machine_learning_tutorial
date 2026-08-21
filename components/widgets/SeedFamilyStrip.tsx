"use client";

// The same fit judged under thirty deals of the same split.
//
// The throw is cut into a training share and a held-out share thirty times,
// once per seed, and at the chosen degree the curve is refitted on each
// training share and scored on each held-out share. Every dot is one seed's
// held-out score, placed on an R squared axis; a dot that falls below the
// frame is pinned to the bottom edge with an arrow. The amber band spans the
// lowest and highest verdict, and the indigo line is the mean training score
// across the same thirty fits, which barely moves. The API deals, fits and
// scores; the browser only places the dots.

import { useEffect, useState } from "react";
import { ApiError } from "@/lib/api";
import { SplitFamily, dealSplitFamily } from "@/lib/concepts/held-out-evaluation";
import { NOISY_THROW, formatScore } from "./heldOutEvaluationFixtures";

const VIEW = { width: 640, height: 220 };
const PAD = { left: 52, right: 16, top: 18, bottom: 34 };
const PLOT = {
  width: VIEW.width - PAD.left - PAD.right,
  height: VIEW.height - PAD.top - PAD.bottom,
};
const SCORE_TOP = 1.02;
const SCORE_BOTTOM = 0.0;
const GRID_SCORES = [1, 0.75, 0.5, 0.25, 0];
const HELD_OUT_FRACTION = 0.3;

function pixelForScore(score: number): number {
  const clamped = Math.max(Math.min(score, SCORE_TOP), SCORE_BOTTOM);
  return PAD.top + ((SCORE_TOP - clamped) / (SCORE_TOP - SCORE_BOTTOM)) * PLOT.height;
}

export function SeedFamilyStrip() {
  const [degree, setDegree] = useState(2);
  const [family, setFamily] = useState<SplitFamily | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(async () => {
      try {
        setFamily(await dealSplitFamily(NOISY_THROW, degree, HELD_OUT_FRACTION));
        setMessage(null);
      } catch (error) {
        if (error instanceof ApiError) setMessage(error.message);
        else setMessage("Something went wrong.");
      }
    }, 120);
    return () => clearTimeout(timer);
  }, [degree]);

  const splits = family ? family.splits : [];
  const step = splits.length > 1 ? PLOT.width / (splits.length - 1) : 0;

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 pb-3">
        <span className="text-sm text-slate-600 dark:text-slate-300">
          Thirty seeds, four of fifteen held out each time
        </span>
        <label className="ml-auto flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
          Degree
          <input
            type="range"
            min={1}
            max={6}
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
        {GRID_SCORES.map((gridScore) => (
          <g key={`grid-${gridScore}`}>
            <line
              x1={PAD.left}
              y1={pixelForScore(gridScore)}
              x2={PAD.left + PLOT.width}
              y2={pixelForScore(gridScore)}
              stroke="currentColor"
              className="text-slate-200 dark:text-slate-800"
            />
            <text
              x={PAD.left - 8}
              y={pixelForScore(gridScore) + 4}
              textAnchor="end"
              className="fill-slate-400 text-[11px]"
            >
              {gridScore.toFixed(2)}
            </text>
          </g>
        ))}

        {family && (
          <rect
            x={PAD.left}
            y={pixelForScore(family.highest_held_out_r_squared)}
            width={PLOT.width}
            height={Math.max(
              1,
              pixelForScore(family.lowest_held_out_r_squared) -
                pixelForScore(family.highest_held_out_r_squared),
            )}
            className="fill-amber-300/30 dark:fill-amber-500/20"
          />
        )}

        {family && (
          <line
            x1={PAD.left}
            y1={pixelForScore(family.mean_train_r_squared)}
            x2={PAD.left + PLOT.width}
            y2={pixelForScore(family.mean_train_r_squared)}
            stroke="currentColor"
            strokeWidth={1.5}
            strokeDasharray="5 4"
            className="text-indigo-500 dark:text-indigo-400"
          />
        )}

        {splits.map((split, position) => {
          const pixelX = PAD.left + position * step;
          const clamped = split.held_out_r_squared < SCORE_BOTTOM;
          const pixelY = pixelForScore(split.held_out_r_squared);
          return clamped ? (
            <path
              key={`seed-${split.seed}`}
              d={`M ${pixelX - 4} ${pixelY - 8} L ${pixelX + 4} ${pixelY - 8} L ${pixelX} ${pixelY - 1} Z`}
              className="fill-amber-500 dark:fill-amber-400"
            />
          ) : (
            <circle
              key={`seed-${split.seed}`}
              cx={pixelX}
              cy={pixelY}
              r={4}
              className="fill-amber-500 stroke-white dark:fill-amber-400 dark:stroke-slate-900"
              strokeWidth={1.5}
            />
          );
        })}

        {splits
          .filter((split) => split.seed % 5 === 0)
          .map((split) => (
            <text
              key={`label-${split.seed}`}
              x={PAD.left + split.seed * step}
              y={PAD.top + PLOT.height + 16}
              textAnchor="middle"
              className="fill-slate-400 text-[11px]"
            >
              {split.seed}
            </text>
          ))}
        <text
          x={PAD.left + PLOT.width / 2}
          y={VIEW.height - 4}
          textAnchor="middle"
          className="fill-slate-500 text-xs font-medium dark:fill-slate-400"
        >
          Seed of the deal
        </text>
      </svg>

      <p className="mt-2 text-center text-xs text-slate-500 dark:text-slate-500">
        Each amber dot is one deal&rsquo;s held-out score, the band spans the
        lowest and the highest, and the dashed indigo line is the mean training
        score of the same thirty fits.
      </p>

      <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-5">
        <Stat label="Mean training" value={family ? family.mean_train_r_squared.toFixed(4) : "…"} />
        <Stat label="Mean held out" value={family ? family.mean_held_out_r_squared.toFixed(4) : "…"} />
        <Stat label="Lowest held out" value={family ? formatScore(family.lowest_held_out_r_squared, 4) : "…"} />
        <Stat label="Highest held out" value={family ? family.highest_held_out_r_squared.toFixed(4) : "…"} />
        <Stat label="Spread" value={family ? formatScore(family.held_out_spread, 3) : "…"} />
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
