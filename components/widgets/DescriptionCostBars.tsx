"use client";

// Three ways of describing one corpus, priced side by side.
//
// The API prices each of three choices of pieces for the twelve inflected
// forms: every word its own piece, three stems with three endings, and every
// character its own piece. Each price has three parts, and the browser draws
// them as one stacked bar per choice against a shared scale, so the reader can
// see the part that falls as the pieces get smaller and the part that rises.

import { useEffect, useState } from "react";
import { CostView, fetchCost, messageFor } from "@/lib/concepts/morfessor";
import { Stat, nats } from "./morfessorParts";

const WIDTH = 640;
const ROW_HEIGHT = 54;
const PAD_LEFT = 150;
const PAD_RIGHT = 60;
const PAD_TOP = 22;

const PARTS = [
  { key: "spelling", label: "spelling the list", fill: "#6366f1" },
  { key: "counts", label: "writing the counts", fill: "#a855f7" },
  { key: "corpus", label: "writing the text", fill: "#10b981" },
];

export function DescriptionCostBars() {
  const [cost, setCost] = useState<CostView | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [hover, setHover] = useState(1);

  useEffect(() => {
    (async () => {
      try {
        setCost(await fetchCost());
      } catch (error) {
        setMessage(messageFor(error));
      }
    })();
  }, []);

  if (!cost) {
    return (
      <p className="text-sm text-slate-500 dark:text-slate-400">
        {message ?? "…"}
      </p>
    );
  }

  const rows = cost.lexicons;
  const widest = Math.max(...rows.map((row) => row.breakdown.total));
  const scale = (value: number) => (value / widest) * (WIDTH - PAD_LEFT - PAD_RIGHT);
  const height = PAD_TOP + rows.length * ROW_HEIGHT + 12;
  const shown = rows[Math.min(hover, rows.length - 1)];

  return (
    <div>
      <svg
        viewBox={`0 0 ${WIDTH} ${height}`}
        className="w-full select-none rounded-lg bg-slate-50 dark:bg-slate-950"
      >
        {PARTS.map((part, index) => (
          <g key={part.key}>
            <rect
              x={PAD_LEFT + index * 150}
              y={6}
              width={9}
              height={9}
              fill={part.fill}
            />
            <text
              x={PAD_LEFT + index * 150 + 13}
              y={14}
              className="fill-slate-500 text-[10px] dark:fill-slate-400"
            >
              {part.label}
            </text>
          </g>
        ))}

        {rows.map((row, index) => {
          const top = PAD_TOP + index * ROW_HEIGHT;
          const spelling = scale(row.breakdown.spelling_cost);
          const counting = scale(row.breakdown.count_cost);
          const text = scale(row.breakdown.corpus_cost);
          return (
            <g
              key={row.label}
              onMouseEnter={() => setHover(index)}
              opacity={index === Math.min(hover, rows.length - 1) ? 1 : 0.7}
            >
              <text
                x={PAD_LEFT - 8}
                y={top + 22}
                textAnchor="end"
                className="fill-slate-600 text-[11px] dark:fill-slate-300"
              >
                {row.label}
              </text>
              <rect
                x={PAD_LEFT}
                y={top + 8}
                width={spelling}
                height={20}
                fill="#6366f1"
              />
              <rect
                x={PAD_LEFT + spelling}
                y={top + 8}
                width={counting}
                height={20}
                fill="#a855f7"
              />
              <rect
                x={PAD_LEFT + spelling + counting}
                y={top + 8}
                width={text}
                height={20}
                fill="#10b981"
              />
              <text
                x={PAD_LEFT + spelling + counting + text + 6}
                y={top + 23}
                className="fill-slate-500 text-[10px] dark:fill-slate-400"
              >
                {row.breakdown.total.toFixed(1)}
              </text>
              <rect
                x={PAD_LEFT}
                y={top + 4}
                width={WIDTH - PAD_LEFT - PAD_RIGHT}
                height={28}
                fill="transparent"
              />
            </g>
          );
        })}
      </svg>

      <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Stat label="pieces in the list" value={shown.breakdown.n_types} />
        <Stat label="pieces in the text" value={shown.breakdown.n_tokens} />
        <Stat label="the list, in nats" value={nats(shown.breakdown.lexicon_cost)} />
        <Stat label="the text, in nats" value={nats(shown.breakdown.corpus_cost)} />
      </div>
      <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
        Twelve inflected forms, each occurring {cost.repeats} times. Hover a bar
        to read it. Spelling the list falls all the way down the panel, from{" "}
        {nats(rows[0].breakdown.spelling_cost)} nats to{" "}
        {nats(rows[2].breakdown.spelling_cost)}, and writing the text rises all
        the way, from {nats(rows[0].breakdown.corpus_cost)} to{" "}
        {nats(rows[2].breakdown.corpus_cost)}, so the total has its lowest
        value at the middle bar rather than at either end.
      </p>
    </div>
  );
}
