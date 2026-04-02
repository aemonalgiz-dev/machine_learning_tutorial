"use client";

// The root's whole shortlist, drawn as a field of lollipops.
//
// Before the trees page's tree asks its first question, the split search
// stands a candidate threshold between every adjacent pair of values in each
// feature and scores the purity gain that question would buy. This chart
// draws one lollipop per candidate, placed by its threshold and raised by its
// gain, indigo for height questions and amber for weight questions. The
// winner, enlarged and green, is the question the grown tree really asks
// first. Every gain is scored by the library through the API, never in the
// browser.

import { useEffect, useState } from "react";
import {
  ApiError,
  LabelledPoint,
  RootCandidate,
  RootSearch,
  searchRootCandidates,
} from "@/lib/api";

const VIEW = { width: 640, height: 360 };
const PAD = { left: 56, right: 16, top: 16, bottom: 50 };
const PLOT = {
  width: VIEW.width - PAD.left - PAD.right,
  height: VIEW.height - PAD.top - PAD.bottom,
};

// The clean worked set, solved by a single question.
const WORKED_PEOPLE: LabelledPoint[] = [
  { x: 147, y: 41, label: 0 },
  { x: 156, y: 53, label: 1 },
  { x: 145, y: 57, label: 0 },
  { x: 159, y: 57, label: 1 },
  { x: 162, y: 61, label: 1 },
  { x: 120, y: 25, label: 0 },
  { x: 122, y: 28, label: 0 },
  { x: 118, y: 24, label: 0 },
  { x: 180, y: 80, label: 1 },
  { x: 183, y: 83, label: 1 },
  { x: 178, y: 78, label: 1 },
];

// Thresholds sit strictly between adjacent worked values, so weights fall
// inside 24 to 83 and heights inside 118 to 183. One shared axis covers both.
const THRESHOLD_LOW = 20;
const THRESHOLD_HIGH = 190;
const GAIN_HIGH = 0.55;

const GAIN_TICKS = [0, 0.1, 0.2, 0.3, 0.4, 0.5];
const THRESHOLD_TICKS = [25, 50, 75, 100, 125, 150, 175];

function thresholdToPixelX(threshold: number): number {
  return (
    PAD.left +
    ((threshold - THRESHOLD_LOW) / (THRESHOLD_HIGH - THRESHOLD_LOW)) *
      PLOT.width
  );
}

function gainToPixelY(gain: number): number {
  return PAD.top + (1 - gain / GAIN_HIGH) * PLOT.height;
}

function isWinner(candidate: RootCandidate, search: RootSearch): boolean {
  return (
    candidate.feature === search.best_feature &&
    candidate.threshold === search.best_threshold
  );
}

export function RootGainChart() {
  const [search, setSearch] = useState<RootSearch | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setSearch(await searchRootCandidates(WORKED_PEOPLE));
      } catch (error) {
        if (error instanceof ApiError) setMessage(error.message);
        else setMessage("Something went wrong.");
      }
    })();
  }, []);

  const losingCandidates = search
    ? search.candidates.filter((candidate) => !isWinner(candidate, search))
    : [];
  const winningCandidates = search
    ? search.candidates.filter((candidate) => isWinner(candidate, search))
    : [];

  return (
    <div>
      <svg
        viewBox={`0 0 ${VIEW.width} ${VIEW.height}`}
        className="w-full select-none rounded-lg bg-slate-50 dark:bg-slate-950"
      >
        {GAIN_TICKS.map((tick) => (
          <g key={`gain-${tick}`}>
            <line
              x1={PAD.left}
              y1={gainToPixelY(tick)}
              x2={PAD.left + PLOT.width}
              y2={gainToPixelY(tick)}
              stroke="currentColor"
              className="text-slate-200 dark:text-slate-800"
              strokeWidth={1}
            />
            <text
              x={PAD.left - 8}
              y={gainToPixelY(tick) + 4}
              textAnchor="end"
              className="fill-slate-500 text-xs dark:fill-slate-400"
            >
              {tick.toFixed(1)}
            </text>
          </g>
        ))}

        {THRESHOLD_TICKS.map((tick) => (
          <text
            key={`threshold-${tick}`}
            x={thresholdToPixelX(tick)}
            y={PAD.top + PLOT.height + 18}
            textAnchor="middle"
            className="fill-slate-500 text-xs dark:fill-slate-400"
          >
            {tick.toFixed(0)}
          </text>
        ))}

        <line
          x1={PAD.left}
          y1={gainToPixelY(0)}
          x2={PAD.left + PLOT.width}
          y2={gainToPixelY(0)}
          stroke="currentColor"
          className="text-slate-300 dark:text-slate-700"
          strokeWidth={1.5}
        />

        {losingCandidates.map((candidate) => (
          <g key={`${candidate.feature}-${candidate.threshold}`}>
            <line
              x1={thresholdToPixelX(candidate.threshold)}
              y1={gainToPixelY(0)}
              x2={thresholdToPixelX(candidate.threshold)}
              y2={gainToPixelY(candidate.gain)}
              stroke="currentColor"
              className={
                candidate.feature === "height"
                  ? "text-indigo-600/60 dark:text-indigo-400/60"
                  : "text-amber-500/60 dark:text-amber-400/60"
              }
              strokeWidth={1.5}
            />
            <circle
              cx={thresholdToPixelX(candidate.threshold)}
              cy={gainToPixelY(candidate.gain)}
              r={3.5}
              className={
                candidate.feature === "height"
                  ? "fill-indigo-600 dark:fill-indigo-400"
                  : "fill-amber-500 dark:fill-amber-400"
              }
            />
          </g>
        ))}

        {winningCandidates.map((candidate) => (
          <g key={`winner-${candidate.feature}-${candidate.threshold}`}>
            <line
              x1={thresholdToPixelX(candidate.threshold)}
              y1={gainToPixelY(0)}
              x2={thresholdToPixelX(candidate.threshold)}
              y2={gainToPixelY(candidate.gain)}
              stroke="currentColor"
              className="text-emerald-500"
              strokeWidth={2.5}
            />
            <circle
              cx={thresholdToPixelX(candidate.threshold)}
              cy={gainToPixelY(candidate.gain)}
              r={7}
              className="fill-emerald-500 stroke-white dark:stroke-slate-900"
              strokeWidth={2}
            />
          </g>
        ))}

        <circle
          cx={PAD.left + 14}
          cy={PAD.top + 12}
          r={4}
          className="fill-indigo-600 dark:fill-indigo-400"
        />
        <text
          x={PAD.left + 24}
          y={PAD.top + 16}
          className="fill-slate-500 text-xs font-medium dark:fill-slate-400"
        >
          Height questions (cm)
        </text>
        <circle
          cx={PAD.left + 14}
          cy={PAD.top + 30}
          r={4}
          className="fill-amber-500 dark:fill-amber-400"
        />
        <text
          x={PAD.left + 24}
          y={PAD.top + 34}
          className="fill-slate-500 text-xs font-medium dark:fill-slate-400"
        >
          Weight questions (kg)
        </text>

        <text
          x={PAD.left + PLOT.width / 2}
          y={VIEW.height - 8}
          textAnchor="middle"
          className="fill-slate-500 text-xs font-medium dark:fill-slate-400"
        >
          Candidate threshold
        </text>
        <text
          x={16}
          y={PAD.top + PLOT.height / 2}
          textAnchor="middle"
          transform={`rotate(-90 16 ${PAD.top + PLOT.height / 2})`}
          className="fill-slate-500 text-xs font-medium dark:fill-slate-400"
        >
          Gain
        </text>
      </svg>

      <p className="mt-2 text-center text-xs text-slate-500 dark:text-slate-500">
        Every question the root weighed is drawn, and the tallest one became
        the tree&apos;s first split.
      </p>

      <div className="mt-3 grid grid-cols-3 gap-3">
        <Stat
          label="The winning question"
          value={
            search
              ? `${search.best_feature} at or below ${search.best_threshold.toFixed(1)}`
              : "…"
          }
        />
        <Stat
          label="The winning gain"
          value={search ? search.best_gain.toFixed(3) : "…"}
        />
        <Stat
          label="Candidates scanned"
          value={search ? String(search.candidates.length) : "…"}
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
