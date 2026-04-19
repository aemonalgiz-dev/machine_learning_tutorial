"use client";

// A preprocessing setting, searched like any other.
//
// Degree belongs to the polynomial step and not to the ridge model behind it,
// so the search here varies whole pipelines, one per degree, and
// cross-validates each on the same seeded folds. The indigo dots are each
// degree's mean held-out R squared and the emerald dot is the one the search
// kept. On the thrown ball degree 2 wins by a distance. On the straight line
// the five candidates finish within a few thousandths of one another, which
// is the spread readout saying there was nothing to choose. Every score is
// the library's through the API. The browser only places the dots.

import { useEffect, useState } from "react";
import { ApiError } from "@/lib/api";
import {
  DegreeSearch,
  PlanePoint,
  searchDegrees,
} from "@/lib/concepts/pipelines";

const VIEW = { width: 640, height: 320 };
const PAD = { left: 52, right: 16, top: 20, bottom: 44 };
const PLOT = {
  width: VIEW.width - PAD.left - PAD.right,
  height: VIEW.height - PAD.top - PAD.bottom,
};
const SCORE_TOP = 1.05;
const SCORE_BOTTOM = -1.5;
const GRID_SCORES = [1, 0, -1];

// The fifteen noisy measurements of the thrown ball the evaluation pages share.
const THROWN_BALL: PlanePoint[] = [
  { x: 0.0, y: 0.7 },
  { x: 0.29, y: 5.2 },
  { x: 0.57, y: 9.5 },
  { x: 0.86, y: 13.0 },
  { x: 1.14, y: 16.9 },
  { x: 1.43, y: 18.1 },
  { x: 1.71, y: 19.4 },
  { x: 2.0, y: 21.0 },
  { x: 2.29, y: 19.6 },
  { x: 2.57, y: 19.1 },
  { x: 2.86, y: 16.8 },
  { x: 3.14, y: 13.6 },
  { x: 3.43, y: 11.1 },
  { x: 3.71, y: 6.2 },
  { x: 4.0, y: 1.2 },
];

// Fifteen points a hair either side of a straight line.
const STRAIGHT_LINE: PlanePoint[] = [
  { x: 0.0, y: 3.3 },
  { x: 0.5, y: 3.55 },
  { x: 1.0, y: 4.6 },
  { x: 1.5, y: 4.85 },
  { x: 2.0, y: 6.2 },
  { x: 2.5, y: 6.75 },
  { x: 3.0, y: 7.4 },
  { x: 3.5, y: 8.55 },
  { x: 4.0, y: 8.7 },
  { x: 4.5, y: 9.85 },
  { x: 5.0, y: 10.7 },
  { x: 5.5, y: 11.05 },
  { x: 6.0, y: 12.0 },
  { x: 6.5, y: 13.15 },
  { x: 7.0, y: 13.4 },
];

type Example = "ball" | "line";

interface DegreeMark {
  degree: number;
  score: number;
  x: number;
  y: number;
  belowTheChart: boolean;
  winner: boolean;
}

function pixelForScore(score: number): number {
  const clamped = Math.max(Math.min(score, SCORE_TOP), SCORE_BOTTOM);
  return (
    PAD.top + ((SCORE_TOP - clamped) / (SCORE_TOP - SCORE_BOTTOM)) * PLOT.height
  );
}

export function PipelineDegreeChart() {
  const [example, setExample] = useState<Example>("ball");
  const [search, setSearch] = useState<DegreeSearch | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const answer = await searchDegrees(
          example === "ball" ? THROWN_BALL : STRAIGHT_LINE,
        );
        if (cancelled) return;
        setSearch(answer);
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
  }, [example]);

  let marks: DegreeMark[] = [];
  if (search && search.degrees.length > 0) {
    const lastPosition = Math.max(search.degrees.length - 1, 1);
    marks = search.degrees.map((degree, index) => ({
      degree,
      score: search.scores[index],
      x: PAD.left + (index / lastPosition) * PLOT.width,
      y: pixelForScore(search.scores[index]),
      belowTheChart: search.scores[index] < SCORE_BOTTOM,
      winner: degree === search.best_degree,
    }));
  }

  const buttonClass = (selected: boolean) =>
    "rounded-md border px-3 py-1.5 text-sm font-medium transition " +
    (selected
      ? "border-indigo-600 bg-indigo-600 text-white"
      : "border-slate-300 bg-white text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700");

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 pb-3">
        <button
          onClick={() => setExample("ball")}
          className={buttonClass(example === "ball")}
        >
          The thrown ball
        </button>
        <button
          onClick={() => setExample("line")}
          className={buttonClass(example === "line")}
        >
          A straight line
        </button>
      </div>

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
              {gridScore.toFixed(1)}
            </text>
          </g>
        ))}

        <line
          x1={PAD.left}
          y1={PAD.top + PLOT.height}
          x2={PAD.left + PLOT.width}
          y2={PAD.top + PLOT.height}
          stroke="currentColor"
          className="text-slate-300 dark:text-slate-700"
          strokeWidth={1}
        />

        {marks.length > 1 && (
          <polyline
            points={marks.map((mark) => `${mark.x},${mark.y}`).join(" ")}
            fill="none"
            stroke="currentColor"
            className="text-indigo-500 dark:text-indigo-400"
            strokeWidth={1.5}
          />
        )}

        {marks.map((mark) => (
          <circle
            key={`score${mark.degree}`}
            cx={mark.x}
            cy={mark.y}
            r={mark.winner ? 7 : 5}
            className={
              (mark.winner ? "fill-emerald-500" : "fill-indigo-600") +
              " stroke-white dark:stroke-slate-900"
            }
            strokeWidth={1.5}
          />
        ))}

        {marks.map((mark) => (
          <text
            key={`label${mark.degree}`}
            x={mark.x}
            y={mark.y - 12}
            textAnchor="middle"
            className="fill-slate-600 font-mono text-xs dark:fill-slate-300"
          >
            {mark.score.toFixed(4)}
          </text>
        ))}

        {marks
          .filter((mark) => mark.belowTheChart)
          .map((mark) => (
            <path
              key={`arrow${mark.degree}`}
              d={`M ${mark.x - 4} ${PAD.top + PLOT.height + 3} L ${mark.x + 4} ${PAD.top + PLOT.height + 3} L ${mark.x} ${PAD.top + PLOT.height + 10} Z`}
              className="fill-amber-500 dark:fill-amber-400"
            />
          ))}

        {marks.map((mark) => (
          <text
            key={`degree${mark.degree}`}
            x={mark.x}
            y={PAD.top + PLOT.height + 26}
            textAnchor="middle"
            className="fill-slate-500 text-xs font-medium dark:fill-slate-400"
          >
            degree {mark.degree}
          </text>
        ))}
      </svg>

      <p className="mt-2 text-center text-xs text-slate-500 dark:text-slate-500">
        Each dot is one whole pipeline, expand to that degree, standardize the
        columns, then ridge, cross-validated on the same five folds. The
        emerald dot is the candidate the search kept, and an amber arrow marks
        a score that fell below the chart.
      </p>

      <div className="mt-3 grid grid-cols-3 gap-3">
        <Stat
          label="Best degree"
          value={search ? String(search.best_degree) : "…"}
        />
        <Stat
          label="Its mean held-out R²"
          value={search ? search.best_score.toFixed(4) : "…"}
        />
        <Stat
          label="Score spread"
          value={search ? search.score_spread.toFixed(4) : "…"}
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
