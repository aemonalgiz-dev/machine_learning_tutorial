"use client";

// The two ways of reaching a vocabulary, measured at fourteen matched sizes.
//
// The API fits both methods on the eighteen sentences at every size and counts
// two things with each: what the training corpus costs in pieces, and what the
// one sentence none of those eighteen contained costs. The browser draws the
// four series in one panel, each pair against its own scale so the shapes can
// be compared, and lets a reader switch between the corpus and the sentence.

import { useEffect, useState } from "react";
import {
  SizesView,
  fetchSizes,
  messageFor,
} from "@/lib/concepts/the-unigram-language-model";
import { Stat } from "./unigramModelParts";

const WIDTH = 640;
const HEIGHT = 300;
const PAD_LEFT = 52;
const PAD_RIGHT = 20;
const PAD_TOP = 20;
const PAD_BOTTOM = 46;

type Reading = "corpus" | "sentence";

export function AgainstMerging() {
  const [view, setView] = useState<SizesView | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [reading, setReading] = useState<Reading>("corpus");
  const [hover, setHover] = useState<number | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setView(await fetchSizes());
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
  const readUnigram = (index: number) =>
    reading === "corpus" ? rows[index].unigram_corpus : rows[index].unigram_sentence;
  const readMerged = (index: number) =>
    reading === "corpus" ? rows[index].merged_corpus : rows[index].merged_sentence;

  const smallest = rows[0].asked;
  const largest = rows[rows.length - 1].asked;
  const highest = Math.max(
    ...rows.map((_, index) => Math.max(readUnigram(index), readMerged(index))),
  );

  const positionX = (asked: number) =>
    PAD_LEFT +
    ((asked - smallest) / (largest - smallest)) * (WIDTH - PAD_LEFT - PAD_RIGHT);
  const positionY = (value: number) =>
    HEIGHT - PAD_BOTTOM - (value / highest) * (HEIGHT - PAD_TOP - PAD_BOTTOM);

  const path = (read: (index: number) => number) =>
    rows
      .map(
        (row, index) =>
          `${index === 0 ? "M" : "L"} ${positionX(row.asked).toFixed(1)} ${positionY(read(index)).toFixed(1)}`,
      )
      .join(" ");

  const shown = hover === null ? rows.length - 3 : hover;
  const row = rows[shown];

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center gap-2">
        {(["corpus", "sentence"] as Reading[]).map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => setReading(key)}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition ${
              reading === key
                ? "bg-indigo-600 text-white"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
            }`}
          >
            {key === "corpus"
              ? "The corpus they learned from"
              : "The sentence they did not"}
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

        <path d={path(readMerged)} fill="none" stroke="#10b981" strokeWidth={2} />
        <path d={path(readUnigram)} fill="none" stroke="#6366f1" strokeWidth={2} />

        {rows.map((entry, index) => (
          <g key={entry.asked} onMouseEnter={() => setHover(index)}>
            <circle
              cx={positionX(entry.asked)}
              cy={positionY(readMerged(index))}
              r={hover === index ? 5 : 3}
              fill="#10b981"
            />
            <circle
              cx={positionX(entry.asked)}
              cy={positionY(readUnigram(index))}
              r={hover === index ? 5 : 3}
              fill="#6366f1"
            />
            <rect
              x={positionX(entry.asked) - 10}
              y={PAD_TOP}
              width={20}
              height={HEIGHT - PAD_TOP - PAD_BOTTOM}
              fill="transparent"
            />
          </g>
        ))}

        {rows
          .filter((_, index) => index % 2 === 0 || index === rows.length - 1)
          .map((entry) => (
            <text
              key={`tick-${entry.asked}`}
              x={positionX(entry.asked)}
              y={HEIGHT - PAD_BOTTOM + 16}
              textAnchor="middle"
              className="fill-slate-500 text-[10px] dark:fill-slate-400"
            >
              {entry.asked}
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
          y={positionY(highest) + 4}
          textAnchor="end"
          className="fill-slate-500 text-[10px] dark:fill-slate-400"
        >
          {highest}
        </text>
      </svg>

      <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Stat label="vocabulary asked for" value={row.asked} />
        <Stat
          label="by probability, in pieces"
          value={reading === "corpus" ? row.unigram_corpus : row.unigram_sentence}
        />
        <Stat
          label="merging, in pieces"
          value={reading === "corpus" ? row.merged_corpus : row.merged_sentence}
        />
        <Stat
          label="tokens each managed"
          value={`${row.unigram_learned} and ${row.merged_learned}`}
        />
      </div>
      <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
        Indigo is the vocabulary shrunk by likelihood, green the one grown by
        merging, both fitted to the same eighteen sentences and both counted in
        pieces on the same axis. Hover a point to read it. The corpus holds{" "}
        {view.n_word_occurrences} word occurrences, so a corpus reading of{" "}
        {view.n_word_occurrences} is one piece per word and cannot be beaten.
      </p>
    </div>
  );
}
