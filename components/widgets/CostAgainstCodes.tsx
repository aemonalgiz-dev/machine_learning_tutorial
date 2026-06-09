"use client";

// The rounding error against the number of codes, twice over.
//
// The API rounds six hundred vectors to a fixed grid and, separately, to a
// table of exactly the same size fitted to those same six hundred vectors, and
// returns both errors at every size; the browser draws the two as lines against
// the code count so the gap between them is the price of having nothing to fit.

import { useEffect, useState } from "react";
import { ApiError } from "@/lib/api";
import { CostReport, fetchCostReport } from "@/lib/concepts/finite-scalar-quantisation";

const WIDTH = 660;
const HEIGHT = 300;
const LEFT = 56;
const RIGHT = WIDTH - 16;
const TOP = 16;
const BOTTOM = HEIGHT - 46;

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-slate-100 px-2 py-1.5 dark:bg-slate-800">
      <div className="text-[11px] text-slate-500 dark:text-slate-400">
        {label}
      </div>
      <div className="font-mono text-sm font-semibold text-slate-900 dark:text-slate-100">
        {value}
      </div>
    </div>
  );
}

export function CostAgainstCodes() {
  const [report, setReport] = useState<CostReport | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [hovered, setHovered] = useState<number | null>(null);

  useEffect(() => {
    let current = true;
    (async () => {
      try {
        const loaded = await fetchCostReport();
        if (current) {
          setReport(loaded);
        }
      } catch (error) {
        if (current) {
          setMessage(
            error instanceof ApiError ? error.message : "Something went wrong.",
          );
        }
      }
    })();
    return () => {
      current = false;
    };
  }, []);

  if (!report) {
    return (
      <p className="text-sm text-slate-500 dark:text-slate-400">
        {message ?? "…"}
      </p>
    );
  }

  const rows = report.rows;
  const highest = Math.max(...rows.map((row) => row.grid_distortion));
  const lowestBits = Math.min(...rows.map((row) => row.bits));
  const highestBits = Math.max(...rows.map((row) => row.bits));
  const x = (bits: number) =>
    LEFT + ((bits - lowestBits) / (highestBits - lowestBits)) * (RIGHT - LEFT);
  const y = (value: number) => BOTTOM - (value / highest) * (BOTTOM - TOP);

  const path = (pick: (row: (typeof rows)[number]) => number) =>
    rows
      .map((row, position) => `${position === 0 ? "M" : "L"} ${x(row.bits)} ${y(pick(row))}`)
      .join(" ");

  const shown = rows[hovered ?? rows.length - 1];

  return (
    <div>
      <div className="overflow-x-auto">
        <svg
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          className="w-full"
          role="img"
          aria-label="Rounding error against the number of codes, for a fixed grid and for a fitted table"
        >
          {[0, 0.25, 0.5, 0.75, 1].map((share) => {
            const line = TOP + (BOTTOM - TOP) * (1 - share);
            return (
              <g key={share}>
                <line
                  x1={LEFT}
                  y1={line}
                  x2={RIGHT}
                  y2={line}
                  className="stroke-slate-200 dark:stroke-slate-800"
                />
                <text
                  x={LEFT - 8}
                  y={line + 4}
                  textAnchor="end"
                  className="fill-slate-500 text-[10px] dark:fill-slate-400"
                >
                  {(highest * share).toFixed(2)}
                </text>
              </g>
            );
          })}

          <path
            d={path((row) => row.grid_distortion)}
            className="fill-none stroke-rose-500"
            strokeWidth={2}
          />
          <path
            d={path((row) => row.table_distortion)}
            className="fill-none stroke-indigo-500"
            strokeWidth={2}
          />

          {rows.map((row, position) => (
            <g
              key={row.n_codes}
              onMouseEnter={() => setHovered(position)}
              onMouseLeave={() => setHovered(null)}
            >
              <rect
                x={x(row.bits) - 16}
                y={TOP}
                width={32}
                height={BOTTOM - TOP}
                className="fill-transparent"
              />
              <circle
                cx={x(row.bits)}
                cy={y(row.grid_distortion)}
                r={hovered === position ? 6 : 4}
                className="fill-rose-500"
              />
              <circle
                cx={x(row.bits)}
                cy={y(row.table_distortion)}
                r={hovered === position ? 6 : 4}
                className="fill-indigo-500"
              />
              <text
                x={x(row.bits)}
                y={BOTTOM + 16}
                textAnchor="middle"
                className="fill-slate-500 font-mono text-[10px] dark:fill-slate-400"
              >
                {row.n_codes}
              </text>
              <text
                x={x(row.bits)}
                y={BOTTOM + 30}
                textAnchor="middle"
                className="fill-slate-400 font-mono text-[9px] dark:fill-slate-500"
              >
                {row.levels.join(",")}
              </text>
            </g>
          ))}
        </svg>
      </div>

      <div className="mt-1 flex flex-wrap gap-4 text-xs text-slate-600 dark:text-slate-400">
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2 w-4 rounded bg-rose-500" />
          the fixed grid
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2 w-4 rounded bg-indigo-500" />
          a table of the same size fitted to the vectors
        </span>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Stat label="Codes" value={String(shown.n_codes)} />
        <Stat label="Grid error" value={shown.grid_distortion.toFixed(4)} />
        <Stat label="Fitted error" value={shown.table_distortion.toFixed(4)} />
        <Stat label="Times worse" value={`${shown.ratio.toFixed(2)}×`} />
      </div>
    </div>
  );
}
