"use client";

// Every setting tried, scored, and the winner marked.
//
// Each dot is one neighbour count, and its height is that setting's
// cross-validated score, the mean of the fold scores drawn faintly behind it.
// The winner is ringed. The dashed line is what that same winner scores on the
// quarter of the people held back from the search entirely, which is the only
// number on the chart that nothing chose. The gap between the ringed dot and
// the dashed line is the thing the page is about. Every score comes from the
// library through the API.

import { useEffect, useState } from "react";
import { ApiError } from "@/lib/api";
import {
  SearchOutcome,
  SearchPoint,
  searchNeighbourCounts,
} from "@/lib/concepts/grid-search";

const VIEW = { width: 640, height: 330 };
const PAD = { left: 54, right: 20, top: 18, bottom: 48 };
const PLOT = {
  width: VIEW.width - PAD.left - PAD.right,
  height: VIEW.height - PAD.top - PAD.bottom,
};

const DEBOUNCE_MS = 160;

// Twelve people along a line, the page's worked search.
const TWELVE_ALONG_A_LINE: SearchPoint[] = [
  { x: 0.5, y: 2 },
  { x: 1.4, y: 3 },
  { x: 2.6, y: 6 },
  { x: 3.1, y: 5 },
  { x: 4.7, y: 10 },
  { x: 5.2, y: 11 },
  { x: 6.8, y: 13 },
  { x: 7.3, y: 16 },
  { x: 8.9, y: 17 },
  { x: 9.6, y: 20 },
  { x: 10.4, y: 21 },
  { x: 11.5, y: 22 },
];

const BUTTON_CLASS =
  "rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700";

export function SearchCurveChart() {
  const [largest, setLargest] = useState(5);
  const [folds, setFolds] = useState(3);
  const [answer, setAnswer] = useState<SearchOutcome | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(async () => {
      try {
        setAnswer(
          await searchNeighbourCounts(TWELVE_ALONG_A_LINE, largest, folds),
        );
        setMessage(null);
      } catch (error) {
        if (error instanceof ApiError) setMessage(error.message);
        else setMessage("Something went wrong.");
      }
    }, DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [largest, folds]);

  // The drawn window covers every fold score as well as the candidate means,
  // since a single bad fold can sit well below the mean it belongs to.
  let low = 0;
  let high = 1;
  if (answer) {
    const values = answer.candidates.flatMap((candidate) => [
      candidate.score,
      ...candidate.fold_scores,
    ]);
    values.push(answer.honest_score);
    low = Math.min(...values);
    high = Math.max(...values);
    const pad = 0.08 * (high - low || 1);
    low -= pad;
    high += pad;
  }

  const countToX = (count: number) =>
    PAD.left +
    (largest === 1 ? 0.5 : (count - 1) / (largest - 1)) * PLOT.width;
  const scoreToY = (score: number) =>
    PAD.top + ((high - score) / (high - low || 1)) * PLOT.height;

  const ticks = [0, 1, 2, 3, 4].map(
    (step) => low + (step / 4) * (high - low),
  );

  return (
    <div className="my-4">
      <div className="flex flex-wrap items-center gap-4 pb-3 text-sm text-slate-600 dark:text-slate-300">
        <button onClick={() => { setLargest(5); setFolds(3); }} className={BUTTON_CLASS}>
          The worked search
        </button>
        <label className="flex items-center gap-2">
          largest k
          <input
            type="range"
            min={2}
            max={9}
            step={1}
            value={largest}
            onChange={(event) => setLargest(Number(event.target.value))}
            className="w-28 accent-indigo-600"
          />
          <span className="w-4 font-mono text-sm">{largest}</span>
        </label>
        <label className="flex items-center gap-2">
          folds
          <input
            type="range"
            min={2}
            max={4}
            step={1}
            value={folds}
            onChange={(event) => setFolds(Number(event.target.value))}
            className="w-20 accent-emerald-600"
          />
          <span className="w-4 font-mono text-sm">{folds}</span>
        </label>
      </div>

      <svg
        viewBox={`0 0 ${VIEW.width} ${VIEW.height}`}
        className="w-full select-none rounded-lg bg-slate-50 dark:bg-slate-950"
      >
        {ticks.map((tick) => (
          <g key={tick}>
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
        ))}

        {answer && (
          <>
            <line
              x1={PAD.left}
              x2={PAD.left + PLOT.width}
              y1={scoreToY(answer.honest_score)}
              y2={scoreToY(answer.honest_score)}
              className="stroke-amber-500"
              strokeDasharray="6 4"
              strokeWidth={2}
            />
            <path
              d={answer.candidates
                .map((candidate, index) => {
                  const command = index === 0 ? "M" : "L";
                  return `${command}${countToX(candidate.n_neighbours).toFixed(1)},${scoreToY(candidate.score).toFixed(1)}`;
                })
                .join(" ")}
              fill="none"
              strokeWidth={2}
              className="stroke-indigo-600 dark:stroke-indigo-400"
            />
            {answer.candidates.map((candidate) => (
              <g key={candidate.n_neighbours}>
                {candidate.fold_scores.map((fold, index) => (
                  <circle
                    key={index}
                    cx={countToX(candidate.n_neighbours)}
                    cy={scoreToY(fold)}
                    r={2}
                    className="fill-slate-400 dark:fill-slate-500"
                  />
                ))}
                <circle
                  cx={countToX(candidate.n_neighbours)}
                  cy={scoreToY(candidate.score)}
                  r={4}
                  className="fill-indigo-600 dark:fill-indigo-400"
                />
                {candidate.n_neighbours === answer.best_n_neighbours && (
                  <circle
                    cx={countToX(candidate.n_neighbours)}
                    cy={scoreToY(candidate.score)}
                    r={9}
                    fill="none"
                    strokeWidth={2}
                    className="stroke-indigo-600 dark:stroke-indigo-400"
                  />
                )}
                <text
                  x={countToX(candidate.n_neighbours)}
                  y={VIEW.height - PAD.bottom + 18}
                  textAnchor="middle"
                  className="fill-slate-500 text-[11px] dark:fill-slate-400"
                >
                  {candidate.n_neighbours}
                </text>
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
          Neighbours asked for, with the winner ringed and the held-out score
          dashed
        </text>
      </svg>

      <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat
          label="Winner"
          value={answer ? `k = ${answer.best_n_neighbours}` : "…"}
        />
        <Stat
          label="Its search score"
          value={answer ? answer.best_score.toFixed(4) : "…"}
        />
        <Stat
          label="On the held-out quarter"
          value={answer ? answer.honest_score.toFixed(4) : "…"}
        />
        <Stat
          label="Spread across candidates"
          value={answer ? answer.score_spread.toFixed(4) : "…"}
        />
      </div>

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
