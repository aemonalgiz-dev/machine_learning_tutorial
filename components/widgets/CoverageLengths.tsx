"use client";

// Two vocabularies of the same size, measured in pieces.
//
// The API fits both methods on the eighteen sentences at eleven matched sizes
// and reports what the training corpus costs and what the held-out sentence
// costs under each. The browser draws the two series against one scale and
// marks the size where the ordering on the sentence changes hands. The toggle
// switches which of the two readings is drawn, since the two disagree.

import { useEffect, useState } from "react";
import {
  MatchedView,
  fetchMatched,
  messageFor,
} from "@/lib/concepts/greedy-coverage";
import {
  COVERAGE_COLOUR,
  Choices,
  MERGING_COLOUR,
  Stat,
} from "./greedyCoverageParts";

const WIDTH = 640;
const HEIGHT = 300;
const PAD_LEFT = 52;
const PAD_RIGHT = 16;
const PAD_TOP = 18;
const PAD_BOTTOM = 42;

type Reading = "corpus" | "sentence";

export function CoverageLengths() {
  const [view, setView] = useState<MatchedView | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [reading, setReading] = useState<Reading>("corpus");
  const [hover, setHover] = useState<number | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setView(await fetchMatched());
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

  const rows = view.rows;
  const byCoverage = (index: number) =>
    reading === "corpus" ? rows[index].coverage_corpus : rows[index].coverage_sentence;
  const byMerging = (index: number) =>
    reading === "corpus" ? rows[index].merging_corpus : rows[index].merging_sentence;

  const lowest = rows[0].asked;
  const highest = rows[rows.length - 1].asked;
  const tallest = Math.max(
    ...rows.map((_, index) => Math.max(byCoverage(index), byMerging(index))),
  );

  const positionX = (asked: number) =>
    PAD_LEFT +
    ((asked - lowest) / (highest - lowest)) * (WIDTH - PAD_LEFT - PAD_RIGHT);
  const positionY = (value: number) =>
    HEIGHT - PAD_BOTTOM - (value / tallest) * (HEIGHT - PAD_TOP - PAD_BOTTOM);

  const path = (read: (index: number) => number) =>
    rows
      .map(
        (row, index) =>
          `${index === 0 ? "M" : "L"} ${positionX(row.asked).toFixed(1)} ${positionY(read(index)).toFixed(1)}`,
      )
      .join(" ");

  const index = hover ?? rows.length - 1;
  const shown = rows[index];

  return (
    <div>
      <Choices
        label="what is being read"
        chosen={reading}
        onChoose={setReading}
        options={[
          { value: "corpus", label: "The corpus they chose from" },
          { value: "sentence", label: "The sentence they did not" },
        ]}
      />

      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="mt-3 w-full select-none rounded-lg bg-slate-50 dark:bg-slate-950"
      >
        <line
          x1={PAD_LEFT}
          y1={HEIGHT - PAD_BOTTOM}
          x2={WIDTH - PAD_RIGHT}
          y2={HEIGHT - PAD_BOTTOM}
          className="stroke-slate-300 dark:stroke-slate-700"
          strokeWidth={1}
        />
        {view.crossover !== null && reading === "sentence" && (
          <>
            <line
              x1={positionX(view.crossover)}
              y1={PAD_TOP}
              x2={positionX(view.crossover)}
              y2={HEIGHT - PAD_BOTTOM}
              className="stroke-slate-400 dark:stroke-slate-600"
              strokeWidth={1}
              strokeDasharray="4 4"
            />
            <text
              x={positionX(view.crossover) + 5}
              y={PAD_TOP + 10}
              className="fill-slate-500 text-[10px] dark:fill-slate-400"
            >
              merging takes the lead at {view.crossover}
            </text>
          </>
        )}

        <path
          d={path(byCoverage)}
          fill="none"
          stroke={COVERAGE_COLOUR}
          strokeWidth={2}
        />
        <path
          d={path(byMerging)}
          fill="none"
          stroke={MERGING_COLOUR}
          strokeWidth={2}
        />

        {rows.map((row, position) => (
          <g key={row.asked} onMouseEnter={() => setHover(position)}>
            <circle
              cx={positionX(row.asked)}
              cy={positionY(byCoverage(position))}
              r={hover === position ? 5 : 3}
              fill={COVERAGE_COLOUR}
            />
            <circle
              cx={positionX(row.asked)}
              cy={positionY(byMerging(position))}
              r={hover === position ? 5 : 3}
              fill={MERGING_COLOUR}
            />
            <rect
              x={positionX(row.asked) - 12}
              y={PAD_TOP}
              width={24}
              height={HEIGHT - PAD_TOP - PAD_BOTTOM}
              fill="transparent"
            />
          </g>
        ))}

        {rows
          .filter((_, position) => position % 2 === 0 || position === rows.length - 1)
          .map((row) => (
            <text
              key={`tick-${row.asked}`}
              x={positionX(row.asked)}
              y={HEIGHT - PAD_BOTTOM + 16}
              textAnchor="middle"
              className="fill-slate-500 text-[10px] dark:fill-slate-400"
            >
              {row.asked}
            </text>
          ))}
        <text
          x={WIDTH / 2}
          y={HEIGHT - 8}
          textAnchor="middle"
          className="fill-slate-500 text-[11px] dark:fill-slate-400"
        >
          vocabulary size asked for
        </text>
        <text
          x={PAD_LEFT - 8}
          y={positionY(tallest) + 4}
          textAnchor="end"
          className="fill-slate-500 text-[10px] dark:fill-slate-400"
        >
          {tallest}
        </text>
      </svg>

      <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Stat label="vocabulary asked for" value={shown.asked} />
        <Stat label="tokens each managed" value={`${shown.coverage_learned} and ${shown.merging_learned}`} />
        <Stat label="by coverage, in pieces" value={byCoverage(index)} />
        <Stat label="by merging, in pieces" value={byMerging(index)} />
      </div>
      <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
        Indigo chooses pieces by coverage; green grows them by merging. Both are
        counted in pieces. The corpus holds {view.n_word_occurrences} word
        occurrences across {view.n_distinct_words} distinct words, so a corpus
        reading of {view.n_word_occurrences} would be one piece per word. Hover a
        point to read it.
      </p>
    </div>
  );
}
