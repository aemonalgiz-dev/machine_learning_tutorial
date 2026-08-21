"use client";

// Every setting tried, scored, and the winner marked.
//
// Each indigo dot is one neighbour count, and its height is that setting's
// cross-validated score, the mean of the fold scores drawn faintly behind
// it. The winner is ringed. The grey line above is what each setting scores
// on the very rows it was fitted to, which only ever falls as the count
// rises and starts at exactly one. The dashed amber line is what the winner
// scores on the quarter of the people held back from the search entirely,
// the only number on the chart that nothing chose. The API computes every
// score and the browser draws them.

import { useEffect, useState } from "react";
import { ApiError, Point } from "@/lib/api";
import { SearchOutcome, searchNeighbourCounts } from "@/lib/concepts/grid-search";
import {
  ACTIVE_CLASS,
  BUTTON_CLASS,
  CrowdName,
  IDEAL_CASE,
  TWELVE_PEOPLE,
  formatScore,
  randomCrowd,
} from "./gridSearchFixtures";

const VIEW = { width: 640, height: 330 };
const PAD = { left: 54, right: 20, top: 18, bottom: 48 };
const PLOT = {
  width: VIEW.width - PAD.left - PAD.right,
  height: VIEW.height - PAD.top - PAD.bottom,
};

const DEBOUNCE_MS = 160;

export function SearchCurveChart() {
  const [crowd, setCrowd] = useState<CrowdName>("twelve");
  const [points, setPoints] = useState<Point[]>(TWELVE_PEOPLE);
  const [largest, setLargest] = useState(5);
  const [folds, setFolds] = useState(3);
  const [answer, setAnswer] = useState<SearchOutcome | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const timer = setTimeout(async () => {
      try {
        const searched = await searchNeighbourCounts(points, largest, folds);
        if (cancelled) return;
        setAnswer(searched);
        setMessage(null);
      } catch (error) {
        if (cancelled) return;
        if (error instanceof ApiError) setMessage(error.message);
        else setMessage("Something went wrong.");
      }
    }, DEBOUNCE_MS);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [points, largest, folds]);

  const choose = (name: CrowdName) => {
    setCrowd(name);
    if (name === "twelve") setPoints(TWELVE_PEOPLE);
    else if (name === "ideal") setPoints(IDEAL_CASE);
    else setPoints(randomCrowd());
  };

  // The drawn window covers every fold score as well as the candidate means,
  // since a single bad fold can sit well below the mean it belongs to. A
  // ruinous fold is clipped at minus one so the rest stays legible.
  let low = 0;
  let high = 1;
  if (answer) {
    const values = answer.candidates.flatMap((candidate) => [
      candidate.score,
      candidate.training_score,
      ...candidate.fold_scores,
    ]);
    values.push(answer.honest_score);
    low = Math.max(-1, Math.min(...values));
    high = Math.max(...values);
    const pad = 0.08 * (high - low || 1);
    low -= pad;
    high += pad;
  }

  const countToX = (count: number) =>
    PAD.left +
    (largest === 1 ? 0.5 : (count - 1) / (largest - 1)) * PLOT.width;
  const scoreToY = (score: number) =>
    PAD.top +
    ((high - Math.max(score, low)) / (high - low || 1)) * PLOT.height;

  const ticks = [0, 1, 2, 3, 4].map(
    (step) => low + (step / 4) * (high - low),
  );

  const linePath = (read: (candidate: SearchOutcome["candidates"][number]) => number) =>
    answer
      ? answer.candidates
          .map((candidate, index) => {
            const command = index === 0 ? "M" : "L";
            return `${command}${countToX(candidate.n_neighbours).toFixed(1)},${scoreToY(read(candidate)).toFixed(1)}`;
          })
          .join(" ")
      : "";

  return (
    <div className="my-4">
      <div className="flex flex-wrap items-center gap-2 pb-3 text-sm text-slate-600 dark:text-slate-300">
        <button
          onClick={() => choose("twelve")}
          className={crowd === "twelve" ? ACTIVE_CLASS : BUTTON_CLASS}
        >
          Twelve people
        </button>
        <button
          onClick={() => choose("ideal")}
          className={crowd === "ideal" ? ACTIVE_CLASS : BUTTON_CLASS}
        >
          An Ideal Case
        </button>
        <button onClick={() => choose("random")} className={BUTTON_CLASS}>
          Random crowd
        </button>
        <label className="ml-2 flex items-center gap-2">
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
            <path
              d={linePath((candidate) => candidate.training_score)}
              fill="none"
              strokeWidth={1.5}
              className="stroke-slate-400 dark:stroke-slate-500"
            />
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
              d={linePath((candidate) => candidate.score)}
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
                  cy={scoreToY(candidate.training_score)}
                  r={2.5}
                  className="fill-slate-500 dark:fill-slate-400"
                />
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
          Neighbours asked for. Indigo is the cross-validated score, grey the
          score on the fitted rows, dashed the held-out quarter
        </text>
      </svg>

      <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-5">
        <Stat
          label="Winner"
          value={answer ? `k = ${answer.best_n_neighbours}` : "…"}
        />
        <Stat
          label="Its search score"
          value={answer ? formatScore(answer.best_score) : "…"}
        />
        <Stat
          label="On the held-out quarter"
          value={answer ? formatScore(answer.honest_score) : "…"}
        />
        <Stat
          label="On its own fitted rows"
          value={answer ? formatScore(answer.same_rows_score) : "…"}
        />
        <Stat
          label="Spread across candidates"
          value={answer ? formatScore(answer.score_spread) : "…"}
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
