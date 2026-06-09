"use client";

// What has to be true of the corpus before the uncertainties say anything.
//
// The API counts a byte model over one to twenty copies of the same six-word
// sentence, at two amounts credited to every byte nobody saw, and reports the
// uncertainty at two positions of that sentence, one inside a word and one at
// the first letter of the next. The browser draws the two as a pair of lines
// per panel and marks the corpus sizes at which the blocks came out as the
// sentence's words.

import { useEffect, useState } from "react";
import { ApiError } from "@/lib/api";
import {
  ConditionRow,
  CorpusConditionView,
  fetchCorpusCondition,
} from "@/lib/concepts/patching-without-a-vocabulary";

const WIDTH = 720;
const PANEL_WIDTH = 340;
const TOP = 22;
const PLOT_HEIGHT = 168;
const BOTTOM = TOP + PLOT_HEIGHT;
const HEIGHT = BOTTOM + 62;
const LEFT_PAD = 40;
const MAX_BITS = 8;

const INSIDE_COLOUR = "#0ea5e9";
const START_COLOUR = "#e11d48";

export function CorpusConditionChart() {
  const [view, setView] = useState<CorpusConditionView | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setView(await fetchCorpusCondition());
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

  const smoothings = [...new Set(view.rows.map((row) => row.smoothing))].sort(
    (left, right) => right - left,
  );
  const copies = [...new Set(view.rows.map((row) => row.n_copies))].sort(
    (left, right) => left - right,
  );
  const lowest = Math.log10(copies[0] || 1);
  const highest = Math.log10(copies[copies.length - 1]);
  const span = highest - lowest || 1;

  const earliest = view.rows
    .filter((row) => row.words_recovered)
    .sort((left, right) => left.n_copies - right.n_copies)[0];
  const justBefore = view.rows
    .filter(
      (row) =>
        earliest &&
        row.smoothing === earliest.smoothing &&
        row.n_copies < earliest.n_copies,
    )
    .sort((left, right) => right.n_copies - left.n_copies)[0];

  return (
    <div>
      <div className="overflow-x-auto">
        <svg
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          className="w-full"
          role="img"
          aria-label="Uncertainty inside a word and at a word start, against how many copies of the sentence were read"
        >
          {smoothings.map((smoothing, panel) => {
            const originX = panel * (PANEL_WIDTH + 40) + LEFT_PAD;
            const rightX = originX + PANEL_WIDTH - LEFT_PAD;
            const rows = view.rows
              .filter((row) => row.smoothing === smoothing)
              .sort((left, right) => left.n_copies - right.n_copies);

            const xOf = (row: ConditionRow) =>
              originX +
              ((Math.log10(row.n_copies) - lowest) / span) *
                (rightX - originX);
            const yOf = (bits: number) =>
              BOTTOM - (bits / MAX_BITS) * PLOT_HEIGHT;
            const pathOf = (pick: (row: ConditionRow) => number) =>
              rows
                .map(
                  (row, position) =>
                    `${position === 0 ? "M" : "L"} ${xOf(row).toFixed(
                      1,
                    )} ${yOf(pick(row)).toFixed(1)}`,
                )
                .join(" ");

            return (
              <g key={smoothing}>
                <text
                  x={originX}
                  y={12}
                  className="fill-slate-600 dark:fill-slate-300"
                  fontSize="11"
                >
                  {smoothing >= 1
                    ? "one credited to every unseen byte"
                    : "a thousandth credited to every unseen byte"}
                </text>
                {[0, 2, 4, 6, 8].map((bits) => (
                  <g key={bits}>
                    <line
                      x1={originX}
                      y1={yOf(bits)}
                      x2={rightX}
                      y2={yOf(bits)}
                      className="stroke-slate-200 dark:stroke-slate-800"
                    />
                    {panel === 0 && (
                      <text
                        x={originX - 8}
                        y={yOf(bits) + 3}
                        textAnchor="end"
                        className="fill-slate-400 dark:fill-slate-500"
                        fontSize="9"
                        fontFamily="monospace"
                      >
                        {bits}
                      </text>
                    )}
                  </g>
                ))}

                <path
                  d={pathOf((row) => row.at_a_word_start)}
                  fill="none"
                  stroke={START_COLOUR}
                  strokeWidth="2"
                />
                <path
                  d={pathOf((row) => row.inside_a_word)}
                  fill="none"
                  stroke={INSIDE_COLOUR}
                  strokeWidth="2"
                />

                {rows.map((row) => (
                  <g key={row.n_copies}>
                    <circle
                      cx={xOf(row)}
                      cy={yOf(row.at_a_word_start)}
                      r={2.5}
                      fill={START_COLOUR}
                    />
                    <circle
                      cx={xOf(row)}
                      cy={yOf(row.inside_a_word)}
                      r={2.5}
                      fill={INSIDE_COLOUR}
                    />
                    <text
                      x={xOf(row)}
                      y={BOTTOM + 14}
                      textAnchor="middle"
                      className="fill-slate-500 dark:fill-slate-400"
                      fontSize="9"
                      fontFamily="monospace"
                    >
                      {row.n_copies}
                    </text>
                    <rect
                      x={xOf(row) - 5}
                      y={BOTTOM + 20}
                      width={10}
                      height={5}
                      rx={1}
                      className={
                        row.words_recovered
                          ? "fill-emerald-500"
                          : "fill-slate-200 dark:fill-slate-700"
                      }
                    />
                  </g>
                ))}

                <text
                  x={(originX + rightX) / 2}
                  y={BOTTOM + 46}
                  textAnchor="middle"
                  className="fill-slate-500 dark:fill-slate-400"
                  fontSize="10"
                >
                  copies of the sentence read
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      <div className="mt-1 flex flex-wrap gap-4 text-xs text-slate-600 dark:text-slate-400">
        <span className="flex items-center gap-1.5">
          <span
            className="inline-block h-2 w-4 rounded-sm"
            style={{ backgroundColor: START_COLOUR }}
          />
          the first letter of a word
        </span>
        <span className="flex items-center gap-1.5">
          <span
            className="inline-block h-2 w-4 rounded-sm"
            style={{ backgroundColor: INSIDE_COLOUR }}
          />
          a letter inside one
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2 w-4 rounded-sm bg-emerald-500" />
          the blocks came out as the words
        </span>
      </div>

      {earliest && justBefore && (
        <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
          On the left panel the two lines stay within{" "}
          {Math.max(
            ...view.rows
              .filter((row) => row.smoothing >= 1)
              .map((row) => row.gap),
          ).toFixed(3)}{" "}
          bits of each other all the way to twenty copies, and every marker under
          it stays grey. On the right the words come out at{" "}
          {earliest.n_copies} copies and not at {justBefore.n_copies}, where the
          text still comes to {justBefore.n_patches} blocks rather than{" "}
          {earliest.n_patches}.
        </p>
      )}
    </div>
  );
}
