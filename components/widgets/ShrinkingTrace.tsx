"use client";

// How large the model was after each round of shrinking, on both corpora.
//
// The API runs the loop itself and records the size the table was left at
// every time, so the geometric fall and the flat landing on the requested size
// are both measured rather than described. The browser draws the two traces as
// steps and prints the sizes underneath.

import { useEffect, useState } from "react";
import {
  PruningView,
  fetchPruning,
  messageFor,
} from "@/lib/concepts/the-unigram-language-model";
import { Stat } from "./unigramModelParts";

const WIDTH = 640;
const HEIGHT = 260;
const PAD_LEFT = 54;
const PAD_RIGHT = 18;
const PAD_TOP = 18;
const PAD_BOTTOM = 46;

export function ShrinkingTrace() {
  const [view, setView] = useState<PruningView | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [chosen, setChosen] = useState(1);

  useEffect(() => {
    (async () => {
      try {
        setView(await fetchPruning());
      } catch (error) {
        setMessage(messageFor(error));
      }
    })();
  }, []);

  if (!view) {
    return (
      <p className="text-sm text-slate-500 dark:text-slate-400">
        {message ?? "…"}
      </p>
    );
  }

  const trace = view.traces[chosen];
  const largest = trace.sizes[0];
  const lastRound = trace.sizes.length - 1;
  const positionX = (round: number) =>
    PAD_LEFT + (round / lastRound) * (WIDTH - PAD_LEFT - PAD_RIGHT);
  const positionY = (size: number) =>
    HEIGHT - PAD_BOTTOM - (size / largest) * (HEIGHT - PAD_TOP - PAD_BOTTOM);

  const path = trace.sizes
    .map(
      (size, round) =>
        `${round === 0 ? "M" : "L"} ${positionX(round).toFixed(1)} ${positionY(size).toFixed(1)}`,
    )
    .join(" ");

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center gap-2">
        {view.traces.map((entry, index) => (
          <button
            key={entry.label}
            type="button"
            onClick={() => setChosen(index)}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition ${
              chosen === index
                ? "bg-indigo-600 text-white"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
            }`}
          >
            {entry.label}
          </button>
        ))}
      </div>

      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="w-full select-none rounded-lg bg-slate-50 dark:bg-slate-950"
      >
        <line
          x1={PAD_LEFT}
          y1={HEIGHT - PAD_BOTTOM}
          x2={WIDTH - PAD_RIGHT}
          y2={HEIGHT - PAD_BOTTOM}
          className="stroke-slate-300 dark:stroke-slate-700"
          strokeWidth={1}
        />
        <line
          x1={PAD_LEFT}
          y1={positionY(trace.target)}
          x2={WIDTH - PAD_RIGHT}
          y2={positionY(trace.target)}
          className="stroke-emerald-500"
          strokeWidth={1}
          strokeDasharray="4 4"
        />
        <text
          x={WIDTH - PAD_RIGHT}
          y={positionY(trace.target) - 6}
          textAnchor="end"
          className="fill-emerald-600 text-[10px] dark:fill-emerald-400"
        >
          the size asked for, {trace.target}
        </text>

        <path d={path} fill="none" stroke="#6366f1" strokeWidth={2} />
        {trace.sizes.map((size, round) => (
          <g key={round}>
            <circle
              cx={positionX(round)}
              cy={positionY(size)}
              r={4}
              fill="#6366f1"
            />
            <text
              x={positionX(round)}
              y={positionY(size) - 10}
              textAnchor="middle"
              className="fill-slate-600 font-mono text-[10px] dark:fill-slate-300"
            >
              {size}
            </text>
            <text
              x={positionX(round)}
              y={HEIGHT - PAD_BOTTOM + 16}
              textAnchor="middle"
              className="fill-slate-500 text-[10px] dark:fill-slate-400"
            >
              {round}
            </text>
          </g>
        ))}
        <text
          x={WIDTH / 2}
          y={HEIGHT - 10}
          textAnchor="middle"
          className="fill-slate-500 text-[11px] dark:fill-slate-400"
        >
          rounds of shrinking
        </text>
      </svg>

      <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Stat label="candidates to begin with" value={largest} />
        <Stat label="rounds" value={trace.n_rounds} />
        <Stat label="share kept each round" value={view.shrinking_factor} />
        <Stat
          label="re-estimations per round"
          value={view.estimation_rounds}
        />
      </div>
      <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
        Each round keeps three quarters of what is there, or the size asked for
        if that is larger, so the fall is geometric until the last round, which
        lands on the target exactly. The probabilities are re-estimated before
        every size check, so what is reported was estimated on the pieces that
        were reported.
      </p>
    </div>
  );
}
