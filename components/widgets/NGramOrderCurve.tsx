"use client";

// Perplexity against how many words the model reads back, on two texts.
//
// The grey line is the score on the very sentences the counts were taken from,
// which only falls as the window widens, because a wider window has more of
// those sentences memorised. The indigo line is the score on six sentences the
// counts never saw, and it turns: two words beat one, and everything past two
// is worse than two. The amber line is the same held-out text under adding one
// to every count, which is worse everywhere and turns in the same place. The
// axis is logarithmic, since the two ends of the grey line differ by a factor
// of twenty. The API fits every model and scores it; the browser draws.

import { useEffect, useState } from "react";
import { ScoresView, fetchScores, messageFor } from "@/lib/concepts/n-grams";
import { Stat } from "./nGramParts";

const WIDTH = 640;
const HEIGHT = 300;
const PAD_LEFT = 52;
const PAD_RIGHT = 130;
const PAD_TOP = 18;
const PAD_BOTTOM = 46;

interface Series {
  name: string;
  colour: string;
  read: (row: ScoresView["orders"][number]) => number;
}

const SERIES: Series[] = [
  {
    name: "the text it was fitted to",
    colour: "#94a3b8",
    read: (row) => row.unsmoothed_training_perplexity,
  },
  {
    name: "text it never saw, well smoothed",
    colour: "#6366f1",
    read: (row) => row.tuned_test_perplexity,
  },
  {
    name: "text it never saw, one added",
    colour: "#f59e0b",
    read: (row) => row.laplace_test_perplexity,
  },
];

export function NGramOrderCurve() {
  const [view, setView] = useState<ScoresView | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setView(await fetchScores());
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

  const rows = view.orders;
  const values = rows.flatMap((row) => SERIES.map((series) => series.read(row)));
  const low = Math.log10(Math.min(...values)) - 0.08;
  const high = Math.log10(Math.max(...values)) + 0.08;
  const widest = Math.max(...rows.map((row) => row.order));

  const orderToX = (order: number) =>
    PAD_LEFT +
    ((order - 1) / (widest - 1)) * (WIDTH - PAD_LEFT - PAD_RIGHT);
  const scoreToY = (score: number) =>
    PAD_TOP +
    ((high - Math.log10(score)) / (high - low)) * (HEIGHT - PAD_TOP - PAD_BOTTOM);

  const ticks = [1, 3, 10, 30, 100].filter(
    (value) => Math.log10(value) >= low && Math.log10(value) <= high,
  );
  const best = rows.reduce((chosen, row) =>
    row.tuned_test_perplexity < chosen.tuned_test_perplexity ? row : chosen,
  );

  return (
    <div>
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
          x1={orderToX(best.order)}
          y1={PAD_TOP}
          x2={orderToX(best.order)}
          y2={HEIGHT - PAD_BOTTOM}
          className="stroke-emerald-500"
          strokeWidth={1}
          strokeDasharray="4 4"
        />

        {SERIES.map((series) => (
          <g key={series.name}>
            <path
              d={rows
                .map(
                  (row, index) =>
                    `${index === 0 ? "M" : "L"} ${orderToX(row.order).toFixed(1)} ${scoreToY(series.read(row)).toFixed(1)}`,
                )
                .join(" ")}
              fill="none"
              stroke={series.colour}
              strokeWidth={2}
            />
            {rows.map((row) => (
              <circle
                key={row.order}
                cx={orderToX(row.order)}
                cy={scoreToY(series.read(row))}
                r={3.5}
                fill={series.colour}
              />
            ))}
            <text
              x={WIDTH - PAD_RIGHT + 8}
              y={scoreToY(series.read(rows[rows.length - 1])) + 3}
              className="text-[10px]"
              fill={series.colour}
            >
              {series.name}
            </text>
          </g>
        ))}

        {rows.map((row) => (
          <text
            key={row.order}
            x={orderToX(row.order)}
            y={HEIGHT - PAD_BOTTOM + 16}
            textAnchor="middle"
            className="fill-slate-500 font-mono text-[10px] dark:fill-slate-400"
          >
            {row.order}
          </text>
        ))}
        <text
          x={(PAD_LEFT + WIDTH - PAD_RIGHT) / 2}
          y={HEIGHT - 10}
          textAnchor="middle"
          className="fill-slate-500 text-[11px] dark:fill-slate-400"
        >
          words in each window
        </text>
      </svg>

      <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Stat label="best window" value={`${best.order} words`} />
        <Stat
          label="its score on unseen text"
          value={best.tuned_test_perplexity.toFixed(2)}
        />
        <Stat
          label="widest window, unseen text"
          value={rows[rows.length - 1].tuned_test_perplexity.toFixed(2)}
        />
        <Stat
          label="widest window, fitted text"
          value={rows[rows.length - 1].unsmoothed_training_perplexity.toFixed(2)}
        />
      </div>
      <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
        The unsmoothed model is missing from the two held-out lines because it
        has no score there at any width. It gives at least one run of the
        held-out text no chance at all, which makes the whole text impossible
        and its perplexity infinite.
      </p>
    </div>
  );
}
