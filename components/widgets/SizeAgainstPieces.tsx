"use client";

// What each of the two boundary schemes costs, in pieces, at the same
// vocabulary size.
//
// The API fits both schemes at fourteen sizes on the eighteen sentences and
// reports what the corpus and the held-out sentence cost at each; below the
// second scheme's own floor there is no second answer to report, which is the
// left end of the picture. The browser draws two curves and nothing else. What
// to look at is that the two curves cross: the front-marked fit is shorter on
// the corpus everywhere and longer on the sentence from seventy rows up.

import { useEffect, useState } from "react";
import {
  CostsView,
  SizeRow,
  fetchCosts,
  messageFor,
} from "@/lib/concepts/sentencepiece";

type Series = "sentence" | "corpus";

const WIDTH = 640;
const HEIGHT = 260;
const LEFT = 46;
const RIGHT = 12;
const TOP = 14;
const BOTTOM = 34;

function frontValue(row: SizeRow, series: Series): number {
  return series === "sentence"
    ? row.front_sentence_pieces
    : row.front_corpus_pieces;
}

function endValue(row: SizeRow, series: Series): number | null {
  return series === "sentence" ? row.end_sentence_pieces : row.end_corpus_pieces;
}

export function SizeAgainstPieces() {
  const [costs, setCosts] = useState<CostsView | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [series, setSeries] = useState<Series>("sentence");

  useEffect(() => {
    (async () => {
      try {
        setCosts(await fetchCosts());
      } catch (error) {
        setMessage(messageFor(error));
      }
    })();
  }, []);

  if (!costs) {
    return (
      <p className="text-sm text-slate-500 dark:text-slate-400">
        {message ?? "…"}
      </p>
    );
  }

  const rows = costs.rows.filter((row) => row.asked <= 137);
  const values = rows.flatMap((row) => {
    const other = endValue(row, series);
    return other === null
      ? [frontValue(row, series)]
      : [frontValue(row, series), other];
  });
  const lowSize = rows[0].asked;
  const highSize = rows[rows.length - 1].asked;
  const highValue = Math.max(...values);

  const positionX = (size: number) =>
    LEFT + ((size - lowSize) / (highSize - lowSize)) * (WIDTH - LEFT - RIGHT);
  const positionY = (value: number) =>
    TOP + (1 - value / highValue) * (HEIGHT - TOP - BOTTOM);

  const frontPath = rows
    .map(
      (row, index) =>
        `${index === 0 ? "M" : "L"} ${positionX(row.asked).toFixed(1)} ${positionY(
          frontValue(row, series),
        ).toFixed(1)}`,
    )
    .join(" ");
  const endRows = rows.filter((row) => endValue(row, series) !== null);
  const endPath = endRows
    .map(
      (row, index) =>
        `${index === 0 ? "M" : "L"} ${positionX(row.asked).toFixed(1)} ${positionY(
          endValue(row, series) as number,
        ).toFixed(1)}`,
    )
    .join(" ");

  return (
    <div className="rounded-lg border border-slate-200 p-3 dark:border-slate-800">
      <div className="mb-3 flex flex-wrap gap-2">
        {(["sentence", "corpus"] as Series[]).map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => setSeries(key)}
            className={`rounded-md px-3 py-1 text-xs font-medium transition ${
              series === key
                ? "bg-indigo-600 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700"
            }`}
          >
            {key === "sentence" ? "The held-out sentence" : "The whole corpus"}
          </button>
        ))}
      </div>

      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="w-full"
        role="img"
        aria-label="Pieces against vocabulary size, for both boundary schemes"
      >
        <line
          x1={LEFT}
          y1={HEIGHT - BOTTOM}
          x2={WIDTH - RIGHT}
          y2={HEIGHT - BOTTOM}
          className="stroke-slate-300 dark:stroke-slate-700"
          strokeWidth={1}
        />
        <line
          x1={LEFT}
          y1={TOP}
          x2={LEFT}
          y2={HEIGHT - BOTTOM}
          className="stroke-slate-300 dark:stroke-slate-700"
          strokeWidth={1}
        />
        <line
          x1={positionX(costs.end_floor)}
          y1={TOP}
          x2={positionX(costs.end_floor)}
          y2={HEIGHT - BOTTOM}
          className="stroke-slate-300 dark:stroke-slate-700"
          strokeWidth={1}
          strokeDasharray="3 3"
        />
        <path
          d={frontPath}
          fill="none"
          className="stroke-indigo-500"
          strokeWidth={2}
        />
        <path
          d={endPath}
          fill="none"
          className="stroke-slate-400 dark:stroke-slate-500"
          strokeWidth={2}
          strokeDasharray="5 3"
        />
        {rows.map((row) => (
          <circle
            key={`front-${row.asked}`}
            cx={positionX(row.asked)}
            cy={positionY(frontValue(row, series))}
            r={2.5}
            className="fill-indigo-500"
          />
        ))}
        {endRows.map((row) => (
          <circle
            key={`end-${row.asked}`}
            cx={positionX(row.asked)}
            cy={positionY(endValue(row, series) as number)}
            r={2.5}
            className="fill-slate-400 dark:fill-slate-500"
          />
        ))}
        {[lowSize, costs.end_floor, 90, highSize].map((size) => (
          <text
            key={size}
            x={positionX(size)}
            y={HEIGHT - BOTTOM + 16}
            textAnchor="middle"
            className="fill-slate-500 text-[10px] dark:fill-slate-400"
          >
            {size}
          </text>
        ))}
        {[0, Math.round(highValue / 2), highValue].map((value) => (
          <text
            key={value}
            x={LEFT - 6}
            y={positionY(value) + 3}
            textAnchor="end"
            className="fill-slate-500 text-[10px] dark:fill-slate-400"
          >
            {value}
          </text>
        ))}
        <text
          x={(WIDTH + LEFT) / 2}
          y={HEIGHT - 4}
          textAnchor="middle"
          className="fill-slate-500 text-[10px] dark:fill-slate-400"
        >
          rows asked for
        </text>
      </svg>

      <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
        The solid line marks the space in front of a word; the dashed one marks
        the end of a word behind it, and starts at {costs.end_floor} because
        below that it cannot be fitted at all where the other can be fitted from{" "}
        {costs.front_floor}. Only the solid line ever gives the sentence back
        unchanged.
      </p>
    </div>
  );
}
