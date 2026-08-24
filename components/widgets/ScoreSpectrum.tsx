"use client";

// Every score in the twenty-four documents, laid out on one scale.
//
// Each tick is one ordered pair of words placed at its score, so the height of
// the pile at a position is how many pairs scored there. Zero is marked,
// because zero is the one value on this page that means something exact: the
// two words occurred together precisely as often as their separate rates
// predict. Three pairs are named, one from each region. The API scores; the
// browser draws.

import { useEffect, useState } from "react";
import {
  ApiError,
  AssociationTable,
  fetchTable,
} from "@/lib/concepts/pointwise-mutual-information";
import {
  ABOVE,
  BELOW,
  Legend,
  Stat,
  Waiting,
} from "./mutualInformationShared";

const NAMED: [string, string][] = [
  ["crew", "deck"],
  ["and", "anchor"],
  ["and", "bake"],
];

const WIDTH = 640;
const HEIGHT = 190;
const BASE = 150;

export function ScoreSpectrum() {
  const [table, setTable] = useState<AssociationTable | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const next = await fetchTable({
          corpus: "twenty-four-documents",
          window: 5,
          contextSmoothing: 1.0,
        });
        if (!cancelled) setTable(next);
      } catch (error) {
        if (cancelled) return;
        if (error instanceof ApiError) setMessage(error.message);
        else setMessage("Something went wrong.");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (!table) return <Waiting message={message} />;

  const scores = table.pairs
    .map((pair) => pair.score)
    .filter((score): score is number => score !== null);
  const lowest = Math.min(...scores);
  const highest = Math.max(...scores);
  const span = highest - lowest;
  const place = (score: number) => 40 + ((score - lowest) / span) * (WIDTH - 80);

  const buckets = new Map<number, number>();
  for (const score of scores) {
    const slot = Math.round(place(score));
    buckets.set(slot, (buckets.get(slot) ?? 0) + 1);
  }
  const tallest = Math.max(...buckets.values());

  const named = NAMED.map(([word, context]) =>
    table.pairs.find(
      (pair) => pair.word === word && pair.context === context,
    ),
  ).filter((pair): pair is NonNullable<typeof pair> => pair !== undefined);

  return (
    <div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Stat label="scores that exist" value={String(scores.length)} />
        <Stat label="above chance" value={String(table.n_above_chance)} />
        <Stat label="below chance" value={String(table.n_below_chance)} />
        <Stat label="no score at all" value={String(table.n_undefined)} />
      </div>

      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="mt-3 w-full"
        role="img"
        aria-label="every score in the corpus placed on one scale"
      >
        <line
          x1={40}
          y1={BASE}
          x2={WIDTH - 40}
          y2={BASE}
          stroke="currentColor"
          strokeWidth={1}
          className="text-slate-300 dark:text-slate-700"
        />
        {[...buckets.entries()].map(([slot, height]) => (
          <line
            key={slot}
            x1={slot}
            y1={BASE}
            x2={slot}
            y2={BASE - (height / tallest) * 100}
            stroke={slot < place(0) ? BELOW : ABOVE}
            strokeWidth={2}
            opacity={0.75}
          />
        ))}
        <line
          x1={place(0)}
          y1={BASE + 8}
          x2={place(0)}
          y2={BASE - 110}
          stroke="#6366f1"
          strokeWidth={1}
          strokeDasharray="3 3"
        />
        <text
          x={place(0)}
          y={BASE - 118}
          textAnchor="middle"
          className="fill-indigo-600 text-[10px] dark:fill-indigo-400"
        >
          exactly as often as chance predicts
        </text>
        {named.map((pair, index) => (
          <g key={`${pair.word}-${pair.context}`}>
            <circle
              cx={place(pair.score ?? 0)}
              cy={BASE}
              r={3.5}
              fill="#6366f1"
            />
            <text
              x={place(pair.score ?? 0)}
              y={BASE + 18 + index * 12}
              textAnchor="middle"
              className="fill-slate-600 font-mono text-[9px] dark:fill-slate-300"
            >
              {pair.word} ~ {pair.context} {(pair.score ?? 0).toFixed(4)}
            </text>
          </g>
        ))}
        <text
          x={40}
          y={BASE - 8}
          className="fill-slate-500 font-mono text-[9px] dark:fill-slate-400"
        >
          {lowest.toFixed(2)}
        </text>
        <text
          x={WIDTH - 40}
          y={BASE - 8}
          textAnchor="end"
          className="fill-slate-500 font-mono text-[9px] dark:fill-slate-400"
        >
          {highest.toFixed(2)}
        </text>
      </svg>

      <Legend>
        The three marked pairs are one from each region. Notice how much of the
        scale lies to the right of the dashed line and how little to the left,
        and that the {table.n_undefined} pairs with no score at all are not on
        this picture anywhere, since a pair that never occurred has nothing to
        place.
      </Legend>
      {message && (
        <p className="mt-2 text-sm text-amber-600 dark:text-amber-400">
          {message}
        </p>
      )}
    </div>
  );
}
