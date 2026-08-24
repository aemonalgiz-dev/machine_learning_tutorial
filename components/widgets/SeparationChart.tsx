"use client";

// How many kinds of character an arrangement can tell apart, counted over the
// whole codepoint space at four numbers of hashes.
//
// The API multiplies and reduces every character number in the space and counts
// how many different sets of buckets come out, once per bucket count and per
// number of hashes. The browser draws each count as a share of the most any
// arrangement of that width could reach, so a bar touching the right edge means
// the hashes have nothing left to separate.

import { useEffect, useState } from "react";
import { ApiError } from "@/lib/api";
import { SeparationView, fetchSeparation } from "@/lib/concepts/hashing-characters";

const ROW_HEIGHT = 62;
const TOP = 26;
const LEFT = 74;
const RIGHT = 690;
const BAR_HEIGHT = 9;
const BAR_GAP = 3;

const COLOURS = ["#6366f1", "#0ea5e9", "#14b8a6", "#f59e0b"];

export function SeparationChart() {
  const [view, setView] = useState<SeparationView | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setView(await fetchSeparation());
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

  const height = TOP + view.rows.length * ROW_HEIGHT + 12;
  const divided = view.rows.filter((row) => row.shares_a_factor);
  const alreadyAtTheEdge = view.rows.filter(
    (row) => row.counts[0].distinct_sets === row.ceiling,
  ).length;
  const secondReaches = divided.every(
    (row) => row.counts[1].distinct_sets === row.ceiling,
  );

  return (
    <div>
      <div className="overflow-x-auto">
        <svg
          viewBox={`0 0 720 ${height}`}
          className="w-full"
          role="img"
          aria-label="Distinct sets of buckets reached at each width and each number of hashes"
        >
          <text
            x={LEFT}
            y={14}
            className="fill-slate-500 dark:fill-slate-400"
            fontSize="11"
          >
            share of the most that width could ever tell apart
          </text>
          <line
            x1={RIGHT}
            y1={TOP - 6}
            x2={RIGHT}
            y2={height - 14}
            className="stroke-slate-300 dark:stroke-slate-600"
            strokeDasharray="3 3"
          />
          {view.rows.map((row, rowIndex) => {
            const top = TOP + rowIndex * ROW_HEIGHT;
            return (
              <g key={row.n_buckets}>
                <text
                  x={LEFT - 10}
                  y={top + 14}
                  textAnchor="end"
                  className="fill-slate-700 dark:fill-slate-300"
                  fontSize="12"
                  fontFamily="monospace"
                >
                  {row.n_buckets.toLocaleString()}
                </text>
                <text
                  x={LEFT - 10}
                  y={top + 30}
                  textAnchor="end"
                  className="fill-slate-400 dark:fill-slate-500"
                  fontSize="9"
                >
                  {row.shares_a_factor ? "31 divides it" : "31 does not"}
                </text>
                {row.counts.map((count, barIndex) => {
                  const y = top + barIndex * (BAR_HEIGHT + BAR_GAP);
                  const span =
                    (count.distinct_sets / row.ceiling) * (RIGHT - LEFT);
                  return (
                    <g key={count.n_hash_functions}>
                      <rect
                        x={LEFT}
                        y={y}
                        width={RIGHT - LEFT}
                        height={BAR_HEIGHT}
                        rx={2}
                        className="fill-slate-100 dark:fill-slate-800"
                      />
                      <rect
                        x={LEFT}
                        y={y}
                        width={Math.max(span, 1.5)}
                        height={BAR_HEIGHT}
                        rx={2}
                        fill={COLOURS[barIndex]}
                      />
                      <text
                        x={LEFT + Math.max(span, 1.5) + 6}
                        y={y + BAR_HEIGHT - 1}
                        className="fill-slate-600 dark:fill-slate-400"
                        fontSize="9"
                        fontFamily="monospace"
                      >
                        {count.distinct_sets.toLocaleString()}
                      </text>
                    </g>
                  );
                })}
              </g>
            );
          })}
        </svg>
      </div>

      <div className="mt-2 flex flex-wrap gap-4 text-xs">
        {view.rows[0].counts.map((count, index) => (
          <span
            key={count.n_hash_functions}
            className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400"
          >
            <span
              className="inline-block h-2 w-4 rounded-sm"
              style={{ backgroundColor: COLOURS[index] }}
            />
            {count.n_hash_functions}{" "}
            {count.n_hash_functions === 1 ? "hash" : "hashes"}
          </span>
        ))}
      </div>

      <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
        Four bars to a row, one per number of hashes. In {alreadyAtTheEdge} of
        the {view.rows.length} rows the four are the same length, because the
        first hash already reaches the edge there. The {divided.length} rows
        where it falls short are the widths the first multiplier{" "}
        {view.first_multiplier} divides, and in those the second bar{" "}
        {secondReaches ? "reaches the edge" : "moves and stops short of it"}.
        Past the second bar nothing moves anywhere on the chart.
      </p>
    </div>
  );
}
