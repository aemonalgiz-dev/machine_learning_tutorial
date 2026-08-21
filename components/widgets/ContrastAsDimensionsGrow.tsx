"use client";

// How much further the farthest word is than the nearest, as coordinates are added.
//
// Two bars per width: the table fitted to the corpus, and a table of the same
// shape whose numbers were drawn independently. The usual demonstration of the
// curse draws its positions independently, and a fitted table is not
// independent, so both are shown. The API refits at every width and measures
// both; the browser draws bars.

import { useEffect, useState } from "react";
import { ApiError } from "@/lib/api";
import {
  ContrastView,
  fetchContrast,
} from "@/lib/concepts/distance-and-similarity";

const WIDTH = 460;
const HEIGHT = 220;
const PAD = 46;

export function ContrastAsDimensionsGrow() {
  const [view, setView] = useState<ContrastView | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setView(await fetchContrast());
      } catch (error) {
        setMessage(
          error instanceof ApiError ? error.message : "Something went wrong.",
        );
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

  const highest = Math.max(
    ...view.rows.flatMap((row) => [row.fitted, row.uniform]),
  );
  const bandWidth = (WIDTH - PAD - 14) / view.rows.length;
  const barWidth = bandWidth / 2.6;
  const place = (value: number) =>
    HEIGHT - PAD - (value / (highest * 1.08)) * (HEIGHT - PAD - 16);

  return (
    <div>
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="w-full"
        role="img"
        aria-label="how far the nearest and farthest words are apart, at rising numbers of coordinates"
      >
        <line
          x1={PAD}
          y1={HEIGHT - PAD}
          x2={WIDTH - 10}
          y2={HEIGHT - PAD}
          className="stroke-slate-300 dark:stroke-slate-700"
        />
        <line
          x1={PAD}
          y1={HEIGHT - PAD}
          x2={PAD}
          y2={12}
          className="stroke-slate-300 dark:stroke-slate-700"
        />
        <text x={4} y={16} className="fill-slate-500 text-[10px]">
          contrast
        </text>
        <text
          x={WIDTH - 10}
          y={HEIGHT - 14}
          textAnchor="end"
          className="fill-slate-500 text-[10px]"
        >
          numbers a word
        </text>
        {view.rows.map((row, index) => {
          const left = PAD + index * bandWidth + bandWidth / 2 - barWidth - 3;
          return (
            <g key={row.dimension}>
              <rect
                x={left}
                y={place(row.fitted)}
                width={barWidth}
                height={HEIGHT - PAD - place(row.fitted)}
                className="fill-indigo-500/80"
              >
                <title>fitted, {row.fitted.toFixed(4)}</title>
              </rect>
              <rect
                x={left + barWidth + 6}
                y={place(row.uniform)}
                width={barWidth}
                height={HEIGHT - PAD - place(row.uniform)}
                className="fill-slate-400/70"
              >
                <title>drawn independently, {row.uniform.toFixed(4)}</title>
              </rect>
              <text
                x={left + barWidth + 3}
                y={HEIGHT - PAD + 14}
                textAnchor="middle"
                className="fill-slate-500 text-[10px]"
              >
                {row.dimension}
              </text>
              <text
                x={left + barWidth / 2}
                y={place(row.fitted) - 4}
                textAnchor="middle"
                className="fill-slate-500 text-[9px]"
              >
                {row.fitted.toFixed(2)}
              </text>
              <text
                x={left + barWidth * 1.5 + 6}
                y={place(row.uniform) - 4}
                textAnchor="middle"
                className="fill-slate-500 text-[9px]"
              >
                {row.uniform.toFixed(2)}
              </text>
            </g>
          );
        })}
      </svg>
      <div className="mt-1 flex flex-wrap items-center gap-4 text-xs text-slate-600 dark:text-slate-400">
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-4 rounded-sm bg-indigo-500/80" />
          fitted to the corpus
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-4 rounded-sm bg-slate-400/70" />
          drawn independently
        </span>
      </div>
      <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
        Median over the {view.n_words} words of how much further the farthest is
        than the nearest.
        {view.crossover_dimension !== null &&
          ` The fitted table keeps the wider spread until ${view.crossover_dimension} numbers a word, where the two swap over.`}
      </p>
    </div>
  );
}
