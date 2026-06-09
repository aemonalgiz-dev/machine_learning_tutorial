"use client";

// The fifteen measurements dealt into folds, and every fold's turn as judge.
//
// Each dot is one measurement of the throw, placed by its time and coloured
// by the fold it was dealt into. Choose how many folds and which degree, and
// the API refits the curve once per fold on the other folds and scores the
// held-out one, so the row of cards under the axis is one held-out score per
// fold. The readouts show the library's mean and spread across the folds
// beside the score of every held-out prediction pooled and judged at once,
// which is a different number and the only one that survives folds of a
// single row. The API deals and scores; the browser draws.

import { useEffect, useState } from "react";
import { ApiError } from "@/lib/api";
import { FoldDeal, dealFolds } from "@/lib/concepts/held-out-evaluation";
import { NOISY_THROW, PAGE_SEED, foldColour, formatScore } from "./heldOutEvaluationFixtures";

const FOLD_CHOICES = [2, 3, 5, 10, 15];
const VIEW = { width: 640, height: 120 };
const PAD = { left: 24, right: 24, top: 30, bottom: 30 };
const TIME_MAX = 4;

function pixelForTime(time: number): number {
  return PAD.left + (time / TIME_MAX) * (VIEW.width - PAD.left - PAD.right);
}

export function FoldDeck() {
  const [foldCount, setFoldCount] = useState(5);
  const [degree, setDegree] = useState(2);
  const [deal, setDeal] = useState<FoldDeal | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(async () => {
      try {
        setDeal(await dealFolds(NOISY_THROW, degree, foldCount, PAGE_SEED));
        setMessage(null);
      } catch (error) {
        if (error instanceof ApiError) setMessage(error.message);
        else setMessage("Something went wrong.");
      }
    }, 120);
    return () => clearTimeout(timer);
  }, [foldCount, degree]);

  const foldOf = new Map<number, number>();
  deal?.folds.forEach((fold, foldIndex) => {
    fold.held_out_indices.forEach((index) => foldOf.set(index, foldIndex));
  });

  return (
    <div>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 pb-3 text-sm text-slate-600 dark:text-slate-300">
        <span className="flex items-center gap-2">
          Folds
          <span className="flex gap-1 rounded-md border border-slate-300 p-0.5 dark:border-slate-700">
            {FOLD_CHOICES.map((choice) => (
              <button
                key={choice}
                onClick={() => setFoldCount(choice)}
                className={
                  "rounded px-2 py-0.5 text-xs font-medium transition " +
                  (foldCount === choice
                    ? "bg-indigo-600 text-white"
                    : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800")
                }
              >
                {choice}
              </button>
            ))}
          </span>
        </span>
        <label className="ml-auto flex items-center gap-2">
          Degree
          <input
            type="range"
            min={1}
            max={8}
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
        <line
          x1={PAD.left}
          y1={VIEW.height / 2}
          x2={VIEW.width - PAD.right}
          y2={VIEW.height / 2}
          stroke="currentColor"
          className="text-slate-300 dark:text-slate-700"
        />
        {NOISY_THROW.map((point, index) => {
          const fold = foldOf.get(index);
          const colour = fold === undefined ? "#94a3b8" : foldColour(fold, foldCount);
          return (
            <g key={`point-${index}`}>
              <circle
                cx={pixelForTime(point.x)}
                cy={VIEW.height / 2}
                r={9}
                fill={colour}
                stroke="white"
                strokeWidth={2}
              />
              <text
                x={pixelForTime(point.x)}
                y={VIEW.height / 2 + 4}
                textAnchor="middle"
                className="fill-white text-[10px] font-semibold"
              >
                {fold === undefined ? "" : fold + 1}
              </text>
              <text
                x={pixelForTime(point.x)}
                y={VIEW.height - 8}
                textAnchor="middle"
                className="fill-slate-400 text-[10px]"
              >
                {point.x.toFixed(1)}
              </text>
            </g>
          );
        })}
        <text
          x={PAD.left}
          y={16}
          className="fill-slate-500 text-xs font-medium dark:fill-slate-400"
        >
          Time (s), each measurement numbered by the fold that judges it
        </text>
      </svg>

      <div className="mt-3 flex flex-wrap gap-2">
        {deal?.folds.map((fold, foldIndex) => (
          <div
            key={`fold-${foldIndex}`}
            className="min-w-[88px] flex-1 rounded-lg border px-2 py-1.5"
            style={{ borderColor: foldColour(foldIndex, foldCount) }}
          >
            <div className="text-[11px] text-slate-500 dark:text-slate-400">
              fold {foldIndex + 1}, {fold.n_held_out} {fold.n_held_out === 1 ? "row" : "rows"}
            </div>
            <div className="font-mono text-sm font-semibold text-slate-900 dark:text-slate-100">
              {formatScore(fold.r_squared)}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Mean across folds" value={deal ? formatScore(deal.mean_r_squared, 4) : "…"} />
        <Stat label="Spread across folds" value={deal ? formatScore(deal.spread, 4) : "…"} />
        <Stat label="Pooled held-out R²" value={deal ? formatScore(deal.pooled_r_squared, 4) : "…"} />
        <Stat label="Fits made" value={deal ? String(deal.n_fits) : "…"} />
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
