"use client";

// Two scatter plots over the fitted table, switched by a prop.
//
// In "numbers" mode each dot is a pair of words, placed by how far apart their
// table numbers are and how alike their directions turned out, which is the
// picture of a number carrying no meaning. In "lengths" mode each dot is a
// word, placed by how often the texts used it and how long its vector came
// out, which is the picture of length carrying something other than meaning.
// The API fits the table and computes both correlations; the browser draws the
// axes.

import { useEffect, useState } from "react";
import { ApiError } from "@/lib/api";
import { WordSpace, fetchSpace } from "@/lib/concepts/a-vector-for-a-word";
import { ACCENT, colourOf } from "./wordPositionFixtures";

const VIEW = { width: 620, height: 300 };
const PAD = { left: 62, right: 90, top: 16, bottom: 40 };

export function WordSpaceScatter({ mode }: { mode: "numbers" | "lengths" }) {
  const [table, setTable] = useState<WordSpace | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setTable(await fetchSpace("documents"));
      } catch (error) {
        setMessage(error instanceof ApiError ? error.message : "Something went wrong.");
      }
    })();
  }, []);

  if (!table) {
    return <p className="text-sm text-slate-500 dark:text-slate-400">{message ?? "…"}</p>;
  }

  const dots =
    mode === "numbers"
      ? table.pairs.map((pair) => ({
          key: `${pair.first}-${pair.second}`,
          x: pair.id_gap,
          y: pair.cosine,
          colour: colourOf(pair.first),
          label: `${pair.first} and ${pair.second}`,
        }))
      : table.words.map((row) => ({
          key: row.word,
          x: row.count ?? 0,
          y: row.length,
          colour: colourOf(row.word),
          label: row.word,
        }));

  const xValues = dots.map((dot) => dot.x);
  const yValues = dots.map((dot) => dot.y);
  const xMin = Math.min(...xValues);
  const xMax = Math.max(...xValues);
  const yMin = Math.min(...yValues, 0);
  const yMax = Math.max(...yValues);
  const plotX = (value: number) =>
    PAD.left +
    ((value - xMin) / (xMax - xMin || 1)) * (VIEW.width - PAD.left - PAD.right);
  const plotY = (value: number) =>
    PAD.top +
    (1 - (value - yMin) / (yMax - yMin || 1)) * (VIEW.height - PAD.top - PAD.bottom);

  const correlation =
    mode === "numbers"
      ? table.id_gap_cosine_correlation
      : table.length_count_correlation;
  const xLabel =
    mode === "numbers"
      ? "how far apart the two words’ table numbers are"
      : "times the texts used the word";
  const yLabel = mode === "numbers" ? "cosine" : "length of the vector";

  return (
    <div>
      <svg
        viewBox={`0 0 ${VIEW.width} ${VIEW.height}`}
        className="w-full select-none rounded-lg bg-slate-50 dark:bg-slate-950"
      >
        <line
          x1={PAD.left}
          x2={VIEW.width - PAD.right}
          y1={plotY(yMin)}
          y2={plotY(yMin)}
          className="stroke-slate-300 dark:stroke-slate-700"
          strokeWidth={1}
        />
        <line
          x1={PAD.left}
          x2={PAD.left}
          y1={PAD.top}
          y2={VIEW.height - PAD.bottom}
          className="stroke-slate-300 dark:stroke-slate-700"
          strokeWidth={1}
        />
        {mode === "numbers" && (
          <line
            x1={PAD.left}
            x2={VIEW.width - PAD.right}
            y1={plotY(0)}
            y2={plotY(0)}
            className="stroke-slate-300 dark:stroke-slate-700"
            strokeDasharray="4 4"
            strokeWidth={1}
          />
        )}
        {dots.map((dot) => (
          <circle
            key={dot.key}
            cx={plotX(dot.x)}
            cy={plotY(dot.y)}
            r={mode === "numbers" ? 3 : 5}
            fill={dot.colour}
            opacity={mode === "numbers" ? 0.55 : 0.9}
          >
            <title>{dot.label}</title>
          </circle>
        ))}
        {mode === "lengths" &&
          dots.map((dot) => (
            <text
              key={`t${dot.key}`}
              x={plotX(dot.x) + 8}
              y={plotY(dot.y) + 3}
              className="fill-slate-500 font-mono text-[9px] dark:fill-slate-400"
            >
              {dot.label}
            </text>
          ))}
        <text
          x={PAD.left + (VIEW.width - PAD.left - PAD.right) / 2}
          y={VIEW.height - 8}
          textAnchor="middle"
          className="fill-slate-500 text-xs dark:fill-slate-400"
        >
          {xLabel}
        </text>
        <text
          x={16}
          y={VIEW.height / 2}
          textAnchor="middle"
          transform={`rotate(-90 16 ${VIEW.height / 2})`}
          className="fill-slate-500 text-xs dark:fill-slate-400"
        >
          {yLabel}
        </text>
        {[yMin, yMax].map((value) => (
          <text
            key={value}
            x={PAD.left - 8}
            y={plotY(value) + 4}
            textAnchor="end"
            className="fill-slate-500 font-mono text-[10px] dark:fill-slate-400"
          >
            {value.toFixed(2)}
          </text>
        ))}
      </svg>

      <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
        <Stat
          label="dots drawn"
          value={String(mode === "numbers" ? table.n_pairs : table.n_words)}
        />
        <Stat
          label="correlation between the two"
          value={correlation === null ? "not defined here" : correlation.toFixed(4)}
        />
        <Stat
          label={mode === "numbers" ? "words in the table" : "numbers in the table"}
          value={String(mode === "numbers" ? table.n_words : table.table_numbers)}
        />
      </div>
      {message && (
        <p className="mt-2 text-sm" style={{ color: ACCENT }}>
          {message}
        </p>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-slate-100 px-2 py-1.5 dark:bg-slate-800">
      <div className="text-[11px] text-slate-500 dark:text-slate-400">{label}</div>
      <div className="font-mono text-sm font-semibold text-slate-900 dark:text-slate-100">
        {value}
      </div>
    </div>
  );
}
