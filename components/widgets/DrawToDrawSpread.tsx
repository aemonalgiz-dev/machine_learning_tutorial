"use client";

// How much of the answer is the corpus and how much is the draw.
//
// Twenty draws at each of four widths, on the same twenty-four documents, with
// nothing else changed. Each bar runs from the smallest answer any draw gave
// for one pair of words to the largest, so the length of the bar is what a
// second run of the same fit could have said instead. The API fits twenty
// times per width; the browser draws the ranges.

import { useEffect, useState } from "react";
import { ApiError, Costs, fetchCosts } from "@/lib/concepts/random-indexing";
import {
  Choice,
  FIRST_HALF,
  Legend,
  SHARED,
  Stat,
  Waiting,
} from "./randomIndexingShared";

const WIDTH = 560;
const ROW = 34;
const LEFT = 54;
const RIGHT = 18;
const TOP = 22;

type Reading = "pair" | "separation";

export function DrawToDrawSpread() {
  const [reading, setReading] = useState<Reading>("pair");
  const [costs, setCosts] = useState<Costs | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const next = await fetchCosts();
        if (!cancelled) {
          setCosts(next);
          setMessage(null);
        }
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

  if (!costs) return <Waiting message={message} />;

  const rows = costs.draws;
  const height = TOP + rows.length * ROW + 20;
  const span = WIDTH - LEFT - RIGHT;
  const across = (value: number) => LEFT + value * span;
  const smallest = (one: (typeof rows)[number]) =>
    reading === "pair" ? one.smallest_pair : one.smallest_separation;
  const largest = (one: (typeof rows)[number]) =>
    reading === "pair" ? one.largest_pair : one.largest_separation;
  const narrow = rows[0];
  const wide = rows[rows.length - 1];

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
        <Choice
          options={[
            { label: "two cooking words", value: "pair" as Reading },
            { label: "the whole separation", value: "separation" as Reading },
          ]}
          value={reading}
          onChange={setReading}
          accent={FIRST_HALF}
        />
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Stat label="draws at each width" value={String(narrow.n_draws)} />
        <Stat
          label={`spread at ${narrow.dimension} numbers`}
          value={(largest(narrow) - smallest(narrow)).toFixed(4)}
        />
        <Stat
          label={`spread at ${wide.dimension} numbers`}
          value={(largest(wide) - smallest(wide)).toFixed(4)}
        />
        <Stat
          label="the corpus behind all of them"
          value="one and the same"
        />
      </div>

      <svg
        viewBox={`0 0 ${WIDTH} ${height}`}
        className="mt-3 w-full rounded-lg bg-slate-50 dark:bg-slate-900/60"
        role="img"
        aria-label="The range of answers twenty draws gave at each width"
      >
        {[0, 0.25, 0.5, 0.75, 1].map((tick) => (
          <g key={tick}>
            <line
              x1={across(tick)}
              y1={TOP - 6}
              x2={across(tick)}
              y2={height - 18}
              stroke="#e2e8f0"
            />
            <text
              x={across(tick)}
              y={height - 5}
              fontSize={8}
              textAnchor="middle"
              fill={SHARED}
            >
              {tick.toFixed(2)}
            </text>
          </g>
        ))}
        {rows.map((one, position) => {
          const y = TOP + position * ROW;
          const from = across(Math.max(0, smallest(one)));
          const to = across(Math.max(0, largest(one)));
          return (
            <g key={one.dimension}>
              <text x={LEFT - 8} y={y + 12} fontSize={10} textAnchor="end" fill={SHARED}>
                {one.dimension}
              </text>
              <rect
                x={from}
                y={y}
                width={Math.max(2, to - from)}
                height={14}
                rx={3}
                fill={FIRST_HALF}
                fillOpacity={0.65}
              />
              <text x={from} y={y + 25} fontSize={8} fill={SHARED}>
                {smallest(one).toFixed(4)}
              </text>
              <text x={to} y={y + 25} fontSize={8} textAnchor="end" fill={SHARED}>
                {largest(one).toFixed(4)}
              </text>
            </g>
          );
        })}
        <text x={LEFT} y={12} fontSize={9} fill={SHARED}>
          each bar is the range over twenty draws of the same collection
        </text>
      </svg>

      <Legend>
        Nothing about the collection changes down this picture, and nothing
        about the counting changes either. Only which positions the draw picked
        changes, and at {narrow.dimension} numbers a word that alone moves the
        answer for one pair by {(largest(narrow) - smallest(narrow)).toFixed(4)}.
      </Legend>
      {message && (
        <p className="mt-2 text-sm text-amber-600 dark:text-amber-400">
          {message}
        </p>
      )}
    </div>
  );
}
