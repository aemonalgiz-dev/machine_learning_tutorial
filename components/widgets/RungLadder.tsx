"use client";

// How many levels each of the two rounding rules actually reaches.
//
// The API sweeps one coordinate from two levels to twelve under both rules and
// returns the levels each of them produces; the browser draws each count as a
// line from minus one to plus one with a tick per level, the obvious rule above
// and the corrected rule below, so the missing level at every even count is a
// gap a reader can see rather than a claim they have to take.

import { useEffect, useState } from "react";
import { ApiError } from "@/lib/api";
import { LevelSweep, fetchLevelSweep } from "@/lib/concepts/finite-scalar-quantisation";

const WIDTH = 660;
const LEFT = 118;
const RIGHT = WIDTH - 130;
const ROW_HEIGHT = 40;
const TOP = 26;

export function RungLadder() {
  const [sweep, setSweep] = useState<LevelSweep | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [showEvenOnly, setShowEvenOnly] = useState(false);

  useEffect(() => {
    let current = true;
    (async () => {
      try {
        const loaded = await fetchLevelSweep();
        if (current) {
          setSweep(loaded);
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

  if (!sweep) {
    return (
      <p className="text-sm text-slate-500 dark:text-slate-400">
        {message ?? "…"}
      </p>
    );
  }

  const rows = showEvenOnly
    ? sweep.rows.filter((row) => row.n_levels % 2 === 0)
    : sweep.rows;
  const height = TOP + ROW_HEIGHT * rows.length + 10;
  const at = (position: number) =>
    LEFT + ((position + 1) / 2) * (RIGHT - LEFT);

  return (
    <div>
      <div className="mb-3 flex flex-wrap gap-2">
        {[
          { label: "Every level count", even: false },
          { label: "Only the even ones", even: true },
        ].map((choice) => (
          <button
            key={choice.label}
            type="button"
            onClick={() => setShowEvenOnly(choice.even)}
            className={`rounded-md px-3 py-1.5 text-xs font-medium transition ${
              showEvenOnly === choice.even
                ? "bg-indigo-600 text-white"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
            }`}
          >
            {choice.label}
          </button>
        ))}
      </div>

      <div className="overflow-x-auto">
        <svg
          viewBox={`0 0 ${WIDTH} ${height}`}
          className="w-full"
          role="img"
          aria-label="The levels each rounding rule reaches, from two levels to twelve"
        >
          <text
            x={LEFT}
            y={14}
            className="fill-slate-500 text-[11px] dark:fill-slate-400"
          >
            upper row, the obvious rule; lower row, the half offset
          </text>
          {rows.map((row, position) => {
            const y = TOP + ROW_HEIGHT * position + 14;
            const short = row.naive_rungs < row.n_levels;
            return (
              <g key={row.n_levels}>
                <text
                  x={LEFT - 12}
                  y={y + 4}
                  textAnchor="end"
                  className="fill-slate-600 text-[11px] dark:fill-slate-300"
                >
                  {row.n_levels} asked for
                </text>
                <line
                  x1={LEFT}
                  y1={y - 7}
                  x2={RIGHT}
                  y2={y - 7}
                  className="stroke-slate-200 dark:stroke-slate-800"
                />
                <line
                  x1={LEFT}
                  y1={y + 7}
                  x2={RIGHT}
                  y2={y + 7}
                  className="stroke-slate-200 dark:stroke-slate-800"
                />
                {row.naive_rung_positions.map((rung) => (
                  <line
                    key={`n${rung}`}
                    x1={at(rung)}
                    y1={y - 13}
                    x2={at(rung)}
                    y2={y - 1}
                    className={
                      short ? "stroke-rose-500" : "stroke-slate-400 dark:stroke-slate-500"
                    }
                    strokeWidth={2}
                  />
                ))}
                {row.rungs.map((rung) => (
                  <line
                    key={`c${rung}`}
                    x1={at(rung)}
                    y1={y + 1}
                    x2={at(rung)}
                    y2={y + 13}
                    className="stroke-indigo-500"
                    strokeWidth={2}
                  />
                ))}
                <text
                  x={RIGHT + 10}
                  y={y - 3}
                  className={`font-mono text-[11px] ${
                    short
                      ? "fill-rose-600 dark:fill-rose-400"
                      : "fill-slate-500 dark:fill-slate-400"
                  }`}
                >
                  {row.naive_rungs}
                </text>
                <text
                  x={RIGHT + 10}
                  y={y + 13}
                  className="fill-indigo-600 font-mono text-[11px] dark:fill-indigo-400"
                >
                  {row.corrected_rungs}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
        Each line runs from &minus;1 on the left to +1 on the right. The counts
        on the right are how many distinct levels each rule reached over two
        hundred thousand ordinary inputs.
      </p>
    </div>
  );
}
