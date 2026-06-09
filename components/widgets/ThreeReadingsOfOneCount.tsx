"use client";

// The same counts read three ways, and what the loudest rows do to each.
//
// The bars are how alike a word carrying no subject comes out to a word that
// does carry one, which is a number that ought to be small and is not. Adding
// up raw counts inherits it from the counts almost exactly; dividing out what
// frequency alone would explain is what removes it. The table underneath is the
// single nearest word to each of six, under each reading. The API fits all
// three; the browser draws.

import { useEffect, useState } from "react";
import {
  AgainstTheTable,
  ApiError,
  fetchAgainstTheTable,
} from "@/lib/concepts/random-indexing";
import {
  FIRST_HALF,
  Legend,
  MEASURED,
  SECOND_HALF,
  SHARED,
  Stat,
  Waiting,
} from "./randomIndexingShared";

const WIDTH = 560;
const HEIGHT = 130;
const LEFT = 168;
const RIGHT = 46;
const TOP = 22;

export function ThreeReadingsOfOneCount() {
  const [reading, setReading] = useState<AgainstTheTable | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const next = await fetchAgainstTheTable();
        if (!cancelled) {
          setReading(next);
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

  if (!reading) return <Waiting message={message} />;

  const bars = [
    {
      label: "the whole table of counts",
      value: reading.table_shared_to_topic,
      colour: SHARED,
    },
    {
      label: "adding up random directions",
      value: reading.projected_shared_to_topic,
      colour: FIRST_HALF,
    },
    {
      label: "dividing out what frequency explains",
      value: reading.weighted_shared_to_topic,
      colour: MEASURED,
    },
  ];
  const span = WIDTH - LEFT - RIGHT;
  const tallest = Math.max(...bars.map((one) => one.value));
  const across = (value: number) => (value / tallest) * span;

  return (
    <div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Stat
          label="the loudest row in the collection"
          value={String(reading.shared_row_total)}
        />
        <Stat
          label="the loudest row with a subject"
          value={String(reading.largest_topic_row_total)}
        />
        <Stat
          label="of the whole table, three such rows"
          value={`${(reading.shared_share_of_the_table * 100).toFixed(1)}%`}
        />
        <Stat
          label="the two halves, weighted"
          value={reading.weighted_across.toFixed(4)}
        />
      </div>

      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="mt-3 w-full rounded-lg bg-slate-50 dark:bg-slate-900/60"
        role="img"
        aria-label="How alike a word with no subject is to a word with one, three ways"
      >
        {bars.map((bar, position) => {
          const y = TOP + position * 32;
          return (
            <g key={bar.label}>
              <text x={LEFT - 8} y={y + 12} fontSize={9} textAnchor="end" fill={SHARED}>
                {bar.label}
              </text>
              <rect
                x={LEFT}
                y={y}
                width={Math.max(2, across(bar.value))}
                height={15}
                rx={2}
                fill={bar.colour}
                fillOpacity={0.75}
              />
              <text
                x={LEFT + across(bar.value) + 5}
                y={y + 12}
                fontSize={9}
                fill={SHARED}
              >
                {bar.value.toFixed(4)}
              </text>
            </g>
          );
        })}
        <text x={LEFT} y={12} fontSize={9} fill={SHARED}>
          how alike a word carrying no subject is to one that does
        </text>
      </svg>

      <div className="mt-3 overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left dark:border-slate-800">
              <th className="py-2 pr-6 font-semibold text-slate-600 dark:text-slate-400">
                word
              </th>
              <th className="py-2 pr-6 font-semibold text-slate-600 dark:text-slate-400">
                nearest, whole table
              </th>
              <th className="py-2 pr-6 font-semibold text-slate-600 dark:text-slate-400">
                nearest, random directions
              </th>
              <th className="py-2 font-semibold text-slate-600 dark:text-slate-400">
                nearest, weighted
              </th>
            </tr>
          </thead>
          <tbody>
            {reading.rows.map((row) => (
              <tr
                key={row.word}
                className="border-b border-slate-100 last:border-0 dark:border-slate-800/60"
              >
                <td
                  className="py-2 pr-6 font-mono"
                  style={{ color: FIRST_HALF }}
                >
                  {row.word}
                </td>
                <td className="py-2 pr-6 font-mono text-slate-800 dark:text-slate-200">
                  {row.by_the_table}
                </td>
                <td
                  className="py-2 pr-6 font-mono"
                  style={{
                    color:
                      row.by_the_projection === row.by_the_table
                        ? undefined
                        : SECOND_HALF,
                  }}
                >
                  {row.by_the_projection}
                </td>
                <td className="py-2 font-mono text-slate-800 dark:text-slate-200">
                  {row.by_the_weighted_table}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Legend>
        The three words carrying no subject have the largest rows in the whole
        collection, {reading.shared_row_total} against{" "}
        {reading.largest_topic_row_total} for the loudest word that does carry
        one, and adding up their directions unweighted carries that straight
        through. Of the six words below, all three readings agree about the
        nearest word to{" "}
        {
          reading.rows.filter(
            (row) =>
              row.by_the_table === row.by_the_projection &&
              row.by_the_table === row.by_the_weighted_table,
          ).length
        }{" "}
        of them.
      </Legend>
      {message && (
        <p className="mt-2 text-sm text-amber-600 dark:text-amber-400">
          {message}
        </p>
      )}
    </div>
  );
}
