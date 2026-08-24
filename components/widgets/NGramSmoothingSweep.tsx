"use client";

// Perplexity against how much is pretended, on the text that chooses and the
// text that reports.
//
// Both axes are logarithmic. The indigo line is six sentences held back to
// choose the constant on, and the ringed point is where it is lowest; the
// amber line is six further sentences that chose nothing, so the height of the
// amber line above the ring is what this setting is actually worth. The dashed
// line marks adding one to every count, which is where a reader arriving from
// the textbook would have started and is nowhere near the bottom of either
// curve. The API sweeps and scores; the browser draws.

import { useEffect, useState } from "react";
import {
  SmoothingView,
  StrengthSweep,
  fetchSmoothing,
  messageFor,
} from "@/lib/concepts/n-grams";
import { ACTIVE_CLASS, BUTTON_CLASS, Stat, readStrength } from "./nGramParts";

const WIDTH = 640;
const HEIGHT = 300;
const PAD_LEFT = 52;
const PAD_RIGHT = 116;
const PAD_TOP = 18;
const PAD_BOTTOM = 46;

const NAMES: Record<number, string> = {
  1: "1 word",
  2: "2 words",
  3: "3 words",
  4: "4 words",
  5: "5 words",
};

export function NGramSmoothingSweep() {
  const [view, setView] = useState<SmoothingView | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [order, setOrder] = useState(2);

  useEffect(() => {
    (async () => {
      try {
        setView(await fetchSmoothing());
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

  const sweep: StrengthSweep =
    view.sweeps.find((entry) => entry.order === order) ?? view.sweeps[0];
  const values = sweep.rows.flatMap((row) => [
    row.tuning_perplexity,
    row.test_perplexity,
  ]);
  const low = Math.log10(Math.min(...values)) - 0.06;
  const high = Math.log10(Math.max(...values)) + 0.06;
  const leftStrength = Math.log10(sweep.rows[0].strength);
  const rightStrength = Math.log10(sweep.rows[sweep.rows.length - 1].strength);

  const strengthToX = (strength: number) =>
    PAD_LEFT +
    ((Math.log10(strength) - leftStrength) / (rightStrength - leftStrength)) *
      (WIDTH - PAD_LEFT - PAD_RIGHT);
  const scoreToY = (score: number) =>
    PAD_TOP +
    ((high - Math.log10(score)) / (high - low)) * (HEIGHT - PAD_TOP - PAD_BOTTOM);

  const ticks = [3, 10, 30, 100].filter(
    (value) => Math.log10(value) >= low && Math.log10(value) <= high,
  );
  const path = (read: (row: StrengthSweep["rows"][number]) => number) =>
    sweep.rows
      .map(
        (row, index) =>
          `${index === 0 ? "M" : "L"} ${strengthToX(row.strength).toFixed(1)} ${scoreToY(read(row)).toFixed(1)}`,
      )
      .join(" ");

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center gap-2">
        {view.sweeps.map((entry) => (
          <button
            key={entry.order}
            type="button"
            onClick={() => setOrder(entry.order)}
            className={order === entry.order ? ACTIVE_CLASS : BUTTON_CLASS}
          >
            {NAMES[entry.order]}
          </button>
        ))}
      </div>

      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="w-full select-none rounded-lg bg-slate-50 dark:bg-slate-950"
      >
        {ticks.map((value) => (
          <g key={value}>
            <line
              x1={PAD_LEFT}
              y1={scoreToY(value)}
              x2={WIDTH - PAD_RIGHT}
              y2={scoreToY(value)}
              className="stroke-slate-200 dark:stroke-slate-800"
              strokeWidth={1}
            />
            <text
              x={PAD_LEFT - 8}
              y={scoreToY(value) + 3}
              textAnchor="end"
              className="fill-slate-500 font-mono text-[10px] dark:fill-slate-400"
            >
              {value}
            </text>
          </g>
        ))}

        <line
          x1={strengthToX(1.0)}
          y1={PAD_TOP}
          x2={strengthToX(1.0)}
          y2={HEIGHT - PAD_BOTTOM}
          className="stroke-slate-400 dark:stroke-slate-600"
          strokeWidth={1}
          strokeDasharray="4 4"
        />
        <text
          x={strengthToX(1.0) - 6}
          y={PAD_TOP + 10}
          textAnchor="end"
          className="fill-slate-500 text-[10px] dark:fill-slate-400"
        >
          adding one
        </text>

        <path d={path((row) => row.test_perplexity)} fill="none" stroke="#f59e0b" strokeWidth={2} />
        <path d={path((row) => row.tuning_perplexity)} fill="none" stroke="#6366f1" strokeWidth={2} />

        {sweep.rows.map((row) => (
          <g key={row.strength}>
            <circle
              cx={strengthToX(row.strength)}
              cy={scoreToY(row.test_perplexity)}
              r={3}
              fill="#f59e0b"
            />
            <circle
              cx={strengthToX(row.strength)}
              cy={scoreToY(row.tuning_perplexity)}
              r={3}
              fill="#6366f1"
            />
            <text
              x={strengthToX(row.strength)}
              y={HEIGHT - PAD_BOTTOM + 16}
              textAnchor="middle"
              className="fill-slate-500 font-mono text-[9px] dark:fill-slate-400"
            >
              {readStrength(row.strength)}
            </text>
          </g>
        ))}
        <circle
          cx={strengthToX(sweep.best_strength)}
          cy={scoreToY(sweep.best_tuning_perplexity)}
          r={7}
          fill="none"
          stroke="#6366f1"
          strokeWidth={2}
        />

        <text
          x={WIDTH - PAD_RIGHT + 8}
          y={scoreToY(sweep.rows[sweep.rows.length - 1].tuning_perplexity) + 3}
          className="text-[10px]"
          fill="#6366f1"
        >
          the choosing text
        </text>
        <text
          x={WIDTH - PAD_RIGHT + 8}
          y={scoreToY(sweep.rows[sweep.rows.length - 1].test_perplexity) + 3}
          className="text-[10px]"
          fill="#f59e0b"
        >
          the reporting text
        </text>
        <text
          x={(PAD_LEFT + WIDTH - PAD_RIGHT) / 2}
          y={HEIGHT - 10}
          textAnchor="middle"
          className="fill-slate-500 text-[11px] dark:fill-slate-400"
        >
          how many times every word is pretended to have followed every context
        </text>
      </svg>

      <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Stat label="the constant chosen" value={readStrength(sweep.best_strength)} />
        <Stat
          label="what it scores where it chose"
          value={sweep.best_tuning_perplexity.toFixed(2)}
        />
        <Stat
          label="what it scores where it did not"
          value={sweep.best_test_perplexity.toFixed(2)}
        />
        <Stat
          label="adding one, same text"
          value={sweep.laplace_test_perplexity.toFixed(2)}
        />
      </div>
    </div>
  );
}
