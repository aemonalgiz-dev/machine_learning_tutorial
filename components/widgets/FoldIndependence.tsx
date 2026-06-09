"use client";

// One chain object handed to every fold, against a fresh chain each time.
//
// The twelve people are dealt into four seeded folds, and at each fold the
// same chain object is refitted on that fold's training nine and scored on
// its three, while a chain built fresh for the fold is fitted and scored
// beside it. Each bar is the shared object's held-out score and the figure
// over it is the largest difference between the two chains' predictions on
// that fold, which is zero at every fold because the fit copies its
// configuration before touching it. The API deals, fits and compares; the
// browser draws the bars.

import { useEffect, useState } from "react";
import { ApiError } from "@/lib/api";
import { ChainAnatomy, fetchAnatomy } from "@/lib/concepts/pipelines";
import {
  MIDDLE_THREE,
  PAGE_DEGREE,
  PAGE_FOLDS,
  PAGE_PENALTY,
  PAGE_SEED,
  TWELVE_PEOPLE,
} from "./pipelinesFixtures";

const VIEW = { width: 640, height: 220 };
const PAD = { left: 52, right: 16, top: 34, bottom: 30 };
const PLOT = {
  width: VIEW.width - PAD.left - PAD.right,
  height: VIEW.height - PAD.top - PAD.bottom,
};
const SCORE_TOP = 1.0;
const SCORE_BOTTOM = 0.0;
const GRID_SCORES = [1, 0.75, 0.5, 0.25, 0];
const BAR_WIDTH = 60;

function pixelForScore(score: number): number {
  const clamped = Math.max(Math.min(score, SCORE_TOP), SCORE_BOTTOM);
  return PAD.top + ((SCORE_TOP - clamped) / (SCORE_TOP - SCORE_BOTTOM)) * PLOT.height;
}

export function FoldIndependence() {
  const [anatomy, setAnatomy] = useState<ChainAnatomy | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setAnatomy(
          await fetchAnatomy(
            TWELVE_PEOPLE,
            MIDDLE_THREE,
            PAGE_DEGREE,
            PAGE_PENALTY,
            PAGE_FOLDS,
            PAGE_SEED,
          ),
        );
      } catch (error) {
        if (error instanceof ApiError) setMessage(error.message);
        else setMessage("Something went wrong.");
      }
    })();
  }, []);

  const folds = anatomy?.folds ?? [];

  return (
    <div>
      <svg
        viewBox={`0 0 ${VIEW.width} ${VIEW.height}`}
        className="w-full select-none rounded-lg bg-slate-50 dark:bg-slate-950"
      >
        {GRID_SCORES.map((gridScore) => (
          <g key={`grid${gridScore}`}>
            <line
              x1={PAD.left}
              y1={pixelForScore(gridScore)}
              x2={PAD.left + PLOT.width}
              y2={pixelForScore(gridScore)}
              stroke="currentColor"
              className="text-slate-200 dark:text-slate-800"
              strokeWidth={1}
            />
            <text
              x={PAD.left - 8}
              y={pixelForScore(gridScore) + 3}
              textAnchor="end"
              className="fill-slate-500 text-xs font-medium dark:fill-slate-400"
            >
              {gridScore.toFixed(2)}
            </text>
          </g>
        ))}
        {folds.map((fold, position) => {
          const centre = PAD.left + ((position + 0.5) / folds.length) * PLOT.width;
          const top = pixelForScore(fold.r2_score);
          return (
            <g key={`fold${fold.fold}`}>
              <rect
                x={centre - BAR_WIDTH / 2}
                y={top}
                width={BAR_WIDTH}
                height={pixelForScore(0) - top}
                className="fill-indigo-600"
              />
              <text
                x={centre}
                y={top - 18}
                textAnchor="middle"
                className="fill-slate-700 font-mono text-xs font-semibold dark:fill-slate-200"
              >
                {fold.r2_score.toFixed(4)}
              </text>
              <text
                x={centre}
                y={top - 6}
                textAnchor="middle"
                className="fill-slate-500 text-[10px] dark:fill-slate-400"
              >
                gap to a fresh chain {fold.gap_to_fresh_fit.toExponential(1)}
              </text>
              <text
                x={centre}
                y={VIEW.height - 8}
                textAnchor="middle"
                className="fill-slate-500 text-xs font-medium dark:fill-slate-400"
              >
                fold {fold.fold}, {fold.n_training} train, {fold.n_held_out} held out
              </text>
            </g>
          );
        })}
      </svg>
      <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat label="Folds" value={anatomy ? `${anatomy.n_folds}, seed ${anatomy.fold_seed}` : "…"} />
        <Stat label="Mean held-out R²" value={anatomy ? anatomy.mean_fold_r2.toFixed(4) : "…"} />
        <Stat
          label="Object fitted after the folds"
          value={anatomy ? (anatomy.pipeline_fitted_after_folds ? "yes, to fold 4" : "no") : "…"}
        />
        <Stat
          label="Configuration fitted after the folds"
          value={anatomy ? (anatomy.configuration_fitted_after_folds ? "yes" : "no") : "…"}
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
