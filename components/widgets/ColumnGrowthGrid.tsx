"use client";

// How many columns an expansion produces, by degree and by how many
// measurements it started with.
//
// A lattice, original width down the side and degree along the top, each cell
// the count of columns the expansion actually built. Every number here was read
// off a built expansion rather than worked out from a formula, so the shading is
// the growth itself. The line under it turns whichever cell the reader hovers
// into the sentence a modeller cares about, how many people it would take to
// pin those columns down. The API counts and the browser draws.

import { useEffect, useState } from "react";
import { ApiError } from "@/lib/api";
import { ColumnCounts, fetchColumnCounts } from "@/lib/concepts/polynomial-features";

const CELL = 72;
const HEAD = 40;
const SIDE = 96;

export function ColumnGrowthGrid() {
  const [answer, setAnswer] = useState<ColumnCounts | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [chosen, setChosen] = useState<{ width: number; degree: number } | null>(
    null,
  );

  useEffect(() => {
    let cancelled = false;
    fetchColumnCounts()
      .then((counts) => {
        if (!cancelled) setAnswer(counts);
      })
      .catch((error) => {
        if (cancelled) return;
        setMessage(
          error instanceof ApiError ? error.message : "Something went wrong.",
        );
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!answer) {
    return (
      <div className="my-4 text-sm text-slate-500 dark:text-slate-400">
        {message ?? "…"}
      </div>
    );
  }

  const width = SIDE + answer.degrees.length * CELL;
  const height = HEAD + answer.rows.length * CELL;
  const largest = Math.max(...answer.rows.flatMap((row) => row.counts));

  const shade = (count: number) =>
    0.1 + 0.8 * (Math.log(count + 1) / Math.log(largest + 1));

  const selected = chosen
    ? answer.rows.find((row) => row.width === chosen.width)!.counts[
        answer.degrees.indexOf(chosen.degree)
      ]
    : null;

  return (
    <div className="my-4">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="mx-auto w-full max-w-xl select-none rounded-lg bg-slate-50 dark:bg-slate-950"
      >
        {answer.degrees.map((degree, column) => (
          <text
            key={degree}
            x={SIDE + column * CELL + CELL / 2}
            y={HEAD - 12}
            textAnchor="middle"
            className="fill-slate-500 text-[11px] dark:fill-slate-400"
          >
            degree {degree}
          </text>
        ))}
        {answer.rows.map((row, line) => (
          <text
            key={row.width}
            x={SIDE - 10}
            y={HEAD + line * CELL + CELL / 2 + 4}
            textAnchor="end"
            className="fill-slate-500 text-[11px] dark:fill-slate-400"
          >
            {row.width} measured
          </text>
        ))}
        {answer.rows.map((row, line) =>
          row.counts.map((count, column) => {
            const x = SIDE + column * CELL;
            const y = HEAD + line * CELL;
            const picked =
              chosen?.width === row.width &&
              chosen?.degree === answer.degrees[column];
            return (
              <g
                key={`${row.width}-${answer.degrees[column]}`}
                onMouseEnter={() =>
                  setChosen({ width: row.width, degree: answer.degrees[column] })
                }
                onMouseLeave={() => setChosen(null)}
              >
                <rect
                  x={x + 3}
                  y={y + 3}
                  width={CELL - 6}
                  height={CELL - 6}
                  rx={6}
                  fill="#6366f1"
                  opacity={shade(count)}
                />
                {picked && (
                  <rect
                    x={x + 3}
                    y={y + 3}
                    width={CELL - 6}
                    height={CELL - 6}
                    rx={6}
                    fill="none"
                    strokeWidth={3}
                    className="stroke-indigo-700 dark:stroke-indigo-300"
                  />
                )}
                <text
                  x={x + CELL / 2}
                  y={y + CELL / 2 + 4}
                  textAnchor="middle"
                  className="fill-slate-900 font-mono text-[12px] dark:fill-slate-100"
                >
                  {count}
                </text>
              </g>
            );
          }),
        )}
      </svg>

      <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
        {chosen && selected !== null ? (
          <>
            {chosen.width} measurement{chosen.width === 1 ? "" : "s"} at degree{" "}
            {chosen.degree} makes {selected} column{selected === 1 ? "" : "s"},
            so the fit has {selected + 1} numbers to set and needs at least that
            many people to set them from.
          </>
        ) : (
          <>
            Each cell is the number of columns the expansion built. Point at one
            to read how many people it would take to pin them down.
          </>
        )}
      </p>
    </div>
  );
}
