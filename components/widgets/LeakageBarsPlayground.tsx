"use client";

// The leak, measured rather than feared.
//
// Two transformers, three row counts, thirty seeds each. In every pair the
// amber bar is the mean held-out R squared when the transformer was fitted on
// every row before the folds were dealt, the indigo bar when it was refitted
// inside each fold, and the figure over the pair is amber less indigo. The
// upper panel is a standardizer, which never reads the target, and its gap
// sits within noise of zero with about half the seeds flattered. The lower
// panel is a column chosen by its correlation with a target of pure noise,
// and there the gap is a bias that survives every family of seeds. Every
// score is the library's through the API. The browser only draws the bars.

import { useEffect, useState } from "react";
import { ApiError } from "@/lib/api";
import {
  ArrangementGap,
  LeakMeasurement,
  measureLeak,
} from "@/lib/concepts/pipelines";

const ROW_COUNTS = [30, 60, 200];
const FIRST_SEED = 0;
const FAMILY_SIZE = 30;
// The API refuses a first seed above ten thousand, so the button wraps.
const LAST_FIRST_SEED = 10000 - FAMILY_SIZE;

const VIEW = { width: 640, height: 250 };
const PAD = { left: 52, right: 16, top: 34, bottom: 30 };
const PLOT = {
  width: VIEW.width - PAD.left - PAD.right,
  height: VIEW.height - PAD.top - PAD.bottom,
};
const SCORE_TOP = 1.0;
const SCORE_BOTTOM = -1.0;
const GRID_SCORES = [1, 0.5, 0, -0.5, -1];
const BAR_WIDTH = 44;
const BAR_GAP = 8;

function pixelForScore(score: number): number {
  const clamped = Math.max(Math.min(score, SCORE_TOP), SCORE_BOTTOM);
  return (
    PAD.top + ((SCORE_TOP - clamped) / (SCORE_TOP - SCORE_BOTTOM)) * PLOT.height
  );
}

function centreForGroup(groupIndex: number): number {
  return PAD.left + ((groupIndex + 0.5) / ROW_COUNTS.length) * PLOT.width;
}

function signed(value: number, digits: number): string {
  const sign = value < 0 ? "−" : "+";
  return sign + Math.abs(value).toFixed(digits);
}

function Bar({
  left,
  score,
  fill,
}: {
  left: number;
  score: number;
  fill: string;
}) {
  const zeroPixel = pixelForScore(0);
  const scorePixel = pixelForScore(score);
  return (
    <rect
      x={left}
      y={Math.min(zeroPixel, scorePixel)}
      width={BAR_WIDTH}
      height={Math.abs(scorePixel - zeroPixel)}
      className={fill}
    />
  );
}

function Panel({
  heading,
  gaps,
}: {
  heading: string;
  gaps: (ArrangementGap | null)[];
}) {
  return (
    <div>
      <p className="mb-1 text-sm font-medium text-slate-700 dark:text-slate-300">
        {heading}
      </p>
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
              className={
                gridScore === 0
                  ? "text-slate-400 dark:text-slate-600"
                  : "text-slate-200 dark:text-slate-800"
              }
              strokeWidth={1}
            />
            <text
              x={PAD.left - 8}
              y={pixelForScore(gridScore) + 3}
              textAnchor="end"
              className="fill-slate-500 text-xs font-medium dark:fill-slate-400"
            >
              {gridScore.toFixed(1)}
            </text>
          </g>
        ))}

        {ROW_COUNTS.map((rowCount, groupIndex) => {
          const centre = centreForGroup(groupIndex);
          const gap = gaps[groupIndex];
          return (
            <g key={`group${rowCount}`}>
              {gap && (
                <>
                  <Bar
                    left={centre - BAR_WIDTH - BAR_GAP / 2}
                    score={gap.mean_outside}
                    fill="fill-amber-500"
                  />
                  <Bar
                    left={centre + BAR_GAP / 2}
                    score={gap.mean_inside}
                    fill="fill-indigo-600"
                  />
                  <text
                    x={centre}
                    y={PAD.top - 20}
                    textAnchor="middle"
                    className="fill-slate-700 font-mono text-xs font-semibold dark:fill-slate-200"
                  >
                    {signed(gap.flattered_by, 4)}
                  </text>
                  <text
                    x={centre}
                    y={PAD.top - 7}
                    textAnchor="middle"
                    className="fill-slate-500 text-[10px] dark:fill-slate-400"
                  >
                    {gap.seeds_flattered} of {gap.outside_scores.length} seeds
                    flattered
                  </text>
                </>
              )}
              <text
                x={centre}
                y={VIEW.height - 8}
                textAnchor="middle"
                className="fill-slate-500 text-xs font-medium dark:fill-slate-400"
              >
                {rowCount} rows
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

export function LeakageBarsPlayground() {
  const [firstSeed, setFirstSeed] = useState(FIRST_SEED);
  const [answer, setAnswer] = useState<{
    seed: number;
    measurements: LeakMeasurement[];
  } | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const answers = await Promise.all(
          ROW_COUNTS.map((rowCount) => measureLeak(rowCount, firstSeed)),
        );
        if (cancelled) return;
        setAnswer({ seed: firstSeed, measurements: answers });
        setMessage(null);
      } catch (error) {
        if (cancelled) return;
        if (error instanceof ApiError) setMessage(error.message);
        else setMessage("Something went wrong.");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [firstSeed]);

  // The answer is kept beside the seed it answered, so a stale one is told
  // apart from a fresh one by comparing seeds rather than by clearing state as
  // the effect starts, which would set state synchronously and cascade a
  // render.
  const measurements =
    answer !== null && answer.seed === firstSeed ? answer.measurements : null;

  const nextFamily = () =>
    setFirstSeed((current) =>
      current + FAMILY_SIZE > LAST_FIRST_SEED ? FIRST_SEED : current + FAMILY_SIZE,
    );

  const smallest = measurements ? measurements[0] : null;

  const buttonClass =
    "rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700";

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 pb-3">
        <button onClick={() => setFirstSeed(FIRST_SEED)} className={buttonClass}>
          The first thirty seeds
        </button>
        <button onClick={nextFamily} className={buttonClass}>
          Another thirty seeds
        </button>
        <span className="ml-auto font-mono text-sm text-slate-600 dark:text-slate-300">
          seeds {firstSeed} to {firstSeed + FAMILY_SIZE - 1}
        </span>
      </div>

      <div className="space-y-4">
        <Panel
          heading="A standardizer, which never reads the target"
          gaps={ROW_COUNTS.map((_, index) =>
            measurements ? measurements[index].scaling : null,
          )}
        />
        <Panel
          heading="A column chosen by its correlation with the target"
          gaps={ROW_COUNTS.map((_, index) =>
            measurements ? measurements[index].selection : null,
          )}
        />
      </div>

      <p className="mt-2 text-center text-xs text-slate-500 dark:text-slate-500">
        Amber is the transformer fitted on every row before the folds were
        dealt, indigo is the same transformer refitted inside each fold, and
        the figure over each pair is amber less indigo, averaged over thirty
        seeds of five-fold k-nearest neighbours.
      </p>

      <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat
          label="Standardizer gap, 30 rows"
          value={smallest ? signed(smallest.scaling.flattered_by, 4) : "…"}
        />
        <Stat
          label="Seeds flattered"
          value={
            smallest
              ? `${smallest.scaling.seeds_flattered} of ${smallest.n_seeds}`
              : "…"
          }
        />
        <Stat
          label="Chosen-column gap, 30 rows"
          value={smallest ? signed(smallest.selection.flattered_by, 4) : "…"}
        />
        <Stat
          label="Seeds flattered"
          value={
            smallest
              ? `${smallest.selection.seeds_flattered} of ${smallest.n_seeds}`
              : "…"
          }
        />
      </div>

      {smallest && (
        <p className="mt-3 text-center text-xs text-slate-500 dark:text-slate-500">
          One pipeline object was handed to every fold of every seed. Afterwards
          it is {smallest.pipeline_fitted_after_folds ? "fitted" : "unfitted"},
          to the last fold it saw, and the steps and model it was configured
          with are{" "}
          {smallest.configuration_fitted_after_folds ? "fitted" : "unfitted"}.
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
