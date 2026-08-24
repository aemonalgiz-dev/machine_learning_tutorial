"use client";

// What a larger vocabulary buys, drawn as two falling curves.
//
// The API fits the eighteen-sentence corpus at fifteen vocabulary sizes and
// reports what the corpus costs in pieces at each, and what the running
// sentence costs. The browser scales those two series into one panel and marks
// the size at which the fit stops learning, which is where both curves go flat
// because the corpus has no adjacent pair left that it saw twice.

import { useEffect, useState } from "react";
import {
  SizesView,
  fetchSizes,
  messageFor,
} from "@/lib/concepts/byte-pair-encoding";
import { Stat } from "./bytePairEncodingParts";

const WIDTH = 640;
const HEIGHT = 300;
const PAD_LEFT = 52;
const PAD_RIGHT = 16;
const PAD_TOP = 18;
const PAD_BOTTOM = 42;

export function PieceCountCurve() {
  const [sizes, setSizes] = useState<SizesView | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [hover, setHover] = useState<number | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setSizes(await fetchSizes());
      } catch (error) {
        setMessage(messageFor(error));
      }
    })();
  }, []);

  if (!sizes) {
    return (
      <p className="text-sm text-slate-500 dark:text-slate-400">
        {message ?? "…"}
      </p>
    );
  }

  const rows = sizes.rows;
  const minAsked = rows[0].asked;
  const maxAsked = rows[rows.length - 1].asked;
  const maxCorpus = Math.max(...rows.map((row) => row.corpus_pieces));
  const maxSentence = Math.max(...rows.map((row) => row.sentence_pieces));

  const positionX = (asked: number) =>
    PAD_LEFT +
    ((asked - minAsked) / (maxAsked - minAsked)) *
      (WIDTH - PAD_LEFT - PAD_RIGHT);
  const corpusY = (pieces: number) =>
    HEIGHT - PAD_BOTTOM - (pieces / maxCorpus) * (HEIGHT - PAD_TOP - PAD_BOTTOM);
  const sentenceY = (pieces: number) =>
    HEIGHT -
    PAD_BOTTOM -
    (pieces / maxSentence) * (HEIGHT - PAD_TOP - PAD_BOTTOM);

  const path = (toY: (value: number) => number, read: (index: number) => number) =>
    rows
      .map(
        (row, index) =>
          `${index === 0 ? "M" : "L"} ${positionX(row.asked).toFixed(1)} ${toY(read(index)).toFixed(1)}`,
      )
      .join(" ");

  const flatFrom = sizes.largest_useful_size;
  const shown = hover === null ? rows[rows.length - 1] : rows[hover];

  return (
    <div>
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
          x1={positionX(flatFrom)}
          y1={PAD_TOP}
          x2={positionX(flatFrom)}
          y2={HEIGHT - PAD_BOTTOM}
          className="stroke-slate-400 dark:stroke-slate-600"
          strokeWidth={1}
          strokeDasharray="4 4"
        />
        <text
          x={positionX(flatFrom) + 5}
          y={PAD_TOP + 10}
          className="fill-slate-500 text-[10px] dark:fill-slate-400"
        >
          nothing more to merge at {flatFrom}
        </text>

        <path
          d={path(corpusY, (index) => rows[index].corpus_pieces)}
          fill="none"
          stroke="#6366f1"
          strokeWidth={2}
        />
        <path
          d={path(sentenceY, (index) => rows[index].sentence_pieces)}
          fill="none"
          stroke="#10b981"
          strokeWidth={2}
        />

        {rows.map((row, index) => (
          <g key={row.asked} onMouseEnter={() => setHover(index)}>
            <circle
              cx={positionX(row.asked)}
              cy={corpusY(row.corpus_pieces)}
              r={hover === index ? 5 : 3}
              fill="#6366f1"
            />
            <circle
              cx={positionX(row.asked)}
              cy={sentenceY(row.sentence_pieces)}
              r={hover === index ? 5 : 3}
              fill="#10b981"
            />
            <rect
              x={positionX(row.asked) - 10}
              y={PAD_TOP}
              width={20}
              height={HEIGHT - PAD_TOP - PAD_BOTTOM}
              fill="transparent"
            />
          </g>
        ))}

        {rows
          .filter((_, index) => index % 3 === 0 || index === rows.length - 1)
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
          y={corpusY(maxCorpus) + 4}
          textAnchor="end"
          className="fill-indigo-500 text-[10px]"
        >
          {maxCorpus}
        </text>
        <text
          x={PAD_LEFT - 8}
          y={sentenceY(maxSentence) + 14}
          textAnchor="end"
          className="fill-emerald-600 text-[10px] dark:fill-emerald-400"
        >
          {maxSentence}
        </text>
      </svg>

      <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-5">
        <Stat label="vocabulary asked for" value={shown.asked} />
        <Stat label="tokens it managed" value={shown.learned} />
        <Stat label="rows in the table" value={shown.total_rows} />
        <Stat
          label="corpus, in pieces"
          value={shown.corpus_pieces}
        />
        <Stat label="sentence, in pieces" value={shown.sentence_pieces} />
      </div>
      <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
        Indigo is the whole corpus, {sizes.baselines.n_word_occurrences} words
        in eighteen sentences; green is the one sentence none of them contained.
        Both are counted in pieces, and both are drawn against their own scale
        so the shapes can be compared rather than the heights. Hover a point to
        read it. The rows in the table run {sizes.floor_rows} ahead of the
        tokens learned at every point, and that gap never moves.
      </p>
    </div>
  );
}
