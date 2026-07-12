"use client";

// A search over something that cannot be learned, and what its winner claims.
//
// The target here is pure noise, so no setting can genuinely beat a score of
// zero and every honest answer is negative. The dots are the twenty-five
// candidates and the ringed one is the winner. The winner's score sits above
// the mean candidate, which is unremarkable, and above what that same setting
// scores when the folds are dealt again, which is the point: the maximum of
// many noisy estimates is higher than any of them deserves. Draw again to see
// a different set of folds tell the same story. Every score comes from the
// library through the API.

import { useEffect, useState } from "react";
import { ApiError } from "@/lib/api";
import { OptimismOutcome, measureOptimism } from "@/lib/concepts/grid-search";

const VIEW = { width: 640, height: 300 };
const PAD = { left: 58, right: 20, top: 18, bottom: 44 };
const PLOT = {
  width: VIEW.width - PAD.left - PAD.right,
  height: VIEW.height - PAD.top - PAD.bottom,
};

const FIRST_SEED = 4;
const LAST_SEED = 40;

const BUTTON_CLASS =
  "rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700";

export function OptimismChart() {
  const [seed, setSeed] = useState(FIRST_SEED);
  const [answer, setAnswer] = useState<OptimismOutcome | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const measured = await measureOptimism(seed);
        if (cancelled) return;
        setAnswer(measured);
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
  }, [seed]);

  // The answer is kept beside the seed it answered, so a stale one is told
  // apart by comparing seeds rather than by clearing state as the effect
  // starts.
  const showing = answer !== null && answer.seed === seed ? answer : null;

  let low = -1;
  let high = 0.2;
  if (showing) {
    const values = showing.candidates.map((candidate) => candidate.score);
    values.push(showing.refolded_score, 0);
    low = Math.min(...values);
    high = Math.max(...values);
    const pad = 0.1 * (high - low || 1);
    low -= pad;
    high += pad;
  }

  const counts = showing ? showing.candidates.length : 25;
  const countToX = (index: number) =>
    PAD.left + (counts === 1 ? 0.5 : index / (counts - 1)) * PLOT.width;
  const scoreToY = (score: number) =>
    PAD.top + ((high - score) / (high - low || 1)) * PLOT.height;

  const nextDraw = () =>
    setSeed((current) => (current >= LAST_SEED ? FIRST_SEED : current + 1));

  return (
    <div className="my-4">
      <div className="flex flex-wrap items-center gap-3 pb-3 text-sm text-slate-600 dark:text-slate-300">
        <button onClick={nextDraw} className={BUTTON_CLASS}>
          Draw again
        </button>
        <span>
          draw <span className="font-mono">{seed}</span>, twenty-five settings
          over eighty rows of noise
        </span>
      </div>

      <svg
        viewBox={`0 0 ${VIEW.width} ${VIEW.height}`}
        className="w-full select-none rounded-lg bg-slate-50 dark:bg-slate-950"
      >
        {[0, 1, 2, 3, 4].map((step) => {
          const tick = low + (step / 4) * (high - low);
          return (
            <g key={step}>
              <line
                x1={PAD.left}
                x2={PAD.left + PLOT.width}
                y1={scoreToY(tick)}
                y2={scoreToY(tick)}
                className="stroke-slate-200 dark:stroke-slate-800"
                strokeWidth={1}
              />
              <text
                x={PAD.left - 8}
                y={scoreToY(tick) + 4}
                textAnchor="end"
                className="fill-slate-500 text-[11px] dark:fill-slate-400"
              >
                {tick.toFixed(2)}
              </text>
            </g>
          );
        })}

        {/* Zero is the ceiling on honest performance here, so it is drawn. */}
        {showing && high >= 0 && low <= 0 && (
          <>
            <line
              x1={PAD.left}
              x2={PAD.left + PLOT.width}
              y1={scoreToY(0)}
              y2={scoreToY(0)}
              className="stroke-slate-500 dark:stroke-slate-400"
              strokeWidth={1.5}
            />
            <text
              x={PAD.left + PLOT.width - 4}
              y={scoreToY(0) - 6}
              textAnchor="end"
              className="fill-slate-500 text-[11px] dark:fill-slate-400"
            >
              nothing can honestly beat this
            </text>
          </>
        )}

        {showing && (
          <>
            <line
              x1={PAD.left}
              x2={PAD.left + PLOT.width}
              y1={scoreToY(showing.refolded_score)}
              y2={scoreToY(showing.refolded_score)}
              className="stroke-amber-500"
              strokeDasharray="6 4"
              strokeWidth={2}
            />
            {showing.candidates.map((candidate, index) => (
              <g key={candidate.n_neighbours}>
                <circle
                  cx={countToX(index)}
                  cy={scoreToY(candidate.score)}
                  r={3}
                  className="fill-indigo-600 dark:fill-indigo-400"
                />
                {candidate.n_neighbours === showing.best_n_neighbours && (
                  <circle
                    cx={countToX(index)}
                    cy={scoreToY(candidate.score)}
                    r={8}
                    fill="none"
                    strokeWidth={2}
                    className="stroke-indigo-600 dark:stroke-indigo-400"
                  />
                )}
              </g>
            ))}
          </>
        )}
        <text
          x={PAD.left + PLOT.width / 2}
          y={VIEW.height - 8}
          textAnchor="middle"
          className="fill-slate-500 text-xs font-medium dark:fill-slate-400"
        >
          Twenty-five settings, left to right, with the winner ringed and its
          re-dealt score dashed
        </text>
      </svg>

      <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat
          label="Winner's score"
          value={showing ? showing.best_score.toFixed(4) : "…"}
        />
        <Stat
          label="Mean candidate"
          value={showing ? showing.mean_candidate_score.toFixed(4) : "…"}
        />
        <Stat
          label="Same setting, new folds"
          value={showing ? showing.refolded_score.toFixed(4) : "…"}
        />
        <Stat
          label="Optimism, this draw"
          value={showing ? showing.optimism.toFixed(4) : "…"}
        />
      </div>

      <p className="mt-2 text-center text-xs text-slate-500 dark:text-slate-500">
        {showing
          ? `Averaged over ${showing.n_draws} draws, the winner's score is flattering by ${showing.mean_optimism_over_draws.toFixed(4)}.`
          : "…"}
      </p>

      {message && (
        <p className="mt-2 text-sm text-rose-600 dark:text-rose-400">{message}</p>
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
