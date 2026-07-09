"use client";

// Every person's three scores added up, under both routes, on the crowd.
//
// Two bars per person. The grey bar is the softmax total and reaches exactly
// one for everyone, since the three scores share a single unit of
// probability. The coloured bar is the one-vs-rest total, coloured by the
// person's class, and it falls short for the teenagers, whose own fit cannot
// carve the middle of the crowd out with one straight line, and overshoots
// for everyone else, whom the teenager fit still grants a third or so on top
// of their own class's confident yes. The dashed line is one. Every total
// comes from the API, not the browser.

import { useEffect, useState } from "react";
import { ApiError } from "@/lib/api";
import {
  ClassedPoint,
  MulticlassAnswer,
  classifyAmongThree,
} from "@/lib/concepts/multiclass-classification";

const VIEW = { width: 640, height: 320 };
const PAD = { left: 48, right: 16, top: 16, bottom: 44 };
const PLOT = {
  width: VIEW.width - PAD.left - PAD.right,
  height: VIEW.height - PAD.top - PAD.bottom,
};

const TOP_OF_AXIS = 1.6;
const AXIS_TICKS = [0, 0.5, 1, 1.5];

// The playground's crowd, four children, five teenagers and four adults.
const CROWD: ClassedPoint[] = [
  { x: 118, y: 24, label: 0 },
  { x: 120, y: 25, label: 0 },
  { x: 122, y: 28, label: 0 },
  { x: 125, y: 31, label: 0 },
  { x: 145, y: 57, label: 1 },
  { x: 147, y: 41, label: 1 },
  { x: 156, y: 53, label: 1 },
  { x: 159, y: 57, label: 1 },
  { x: 162, y: 61, label: 1 },
  { x: 178, y: 78, label: 2 },
  { x: 180, y: 80, label: 2 },
  { x: 183, y: 83, label: 2 },
  { x: 186, y: 77, label: 2 },
];

const CLASS_FILLS = ["fill-amber-500", "fill-emerald-600", "fill-indigo-600"];

function totalToY(total: number): number {
  return PAD.top + (1 - Math.min(total, TOP_OF_AXIS) / TOP_OF_AXIS) * PLOT.height;
}

export function RowSumChart() {
  const [softmax, setSoftmax] = useState<MulticlassAnswer | null>(null);
  const [oneVsRest, setOneVsRest] = useState<MulticlassAnswer | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const [shared, separate] = await Promise.all([
          classifyAmongThree(CROWD, "softmax"),
          classifyAmongThree(CROWD, "one_vs_rest"),
        ]);
        setSoftmax(shared);
        setOneVsRest(separate);
      } catch (error) {
        if (error instanceof ApiError) setMessage(error.message);
        else setMessage("Something went wrong.");
      }
    })();
  }, []);

  const slot = PLOT.width / CROWD.length;
  const barWidth = slot * 0.32;
  const baseline = PAD.top + PLOT.height;

  let lowestReadout = "…";
  let highestReadout = "…";
  let softmaxReadout = "…";
  if (oneVsRest) {
    lowestReadout = Math.min(...oneVsRest.row_sums).toFixed(2);
    highestReadout = Math.max(...oneVsRest.row_sums).toFixed(2);
  }
  if (softmax) {
    const lowest = Math.min(...softmax.row_sums).toFixed(2);
    const highest = Math.max(...softmax.row_sums).toFixed(2);
    softmaxReadout = lowest === highest ? `all ${lowest}` : `${lowest} to ${highest}`;
  }

  return (
    <div>
      <svg
        viewBox={`0 0 ${VIEW.width} ${VIEW.height}`}
        className="w-full select-none rounded-lg bg-slate-50 dark:bg-slate-950"
      >
        {AXIS_TICKS.map((tick) => (
          <g key={`tick${tick}`}>
            <line
              x1={PAD.left}
              y1={totalToY(tick)}
              x2={PAD.left + PLOT.width}
              y2={totalToY(tick)}
              stroke="currentColor"
              className={
                tick === 1
                  ? "text-slate-400 dark:text-slate-500"
                  : "text-slate-200 dark:text-slate-800"
              }
              strokeWidth={1}
              strokeDasharray={tick === 1 ? "6 4" : undefined}
            />
            <text
              x={PAD.left - 8}
              y={totalToY(tick) + 4}
              textAnchor="end"
              className="fill-slate-500 text-xs font-medium dark:fill-slate-400"
            >
              {tick.toFixed(1)}
            </text>
          </g>
        ))}

        {CROWD.map((person, index) => {
          const centre = PAD.left + (index + 0.5) * slot;
          const sharedTotal = softmax?.row_sums[index];
          const separateTotal = oneVsRest?.row_sums[index];
          return (
            <g key={`person${index}`}>
              {sharedTotal !== undefined && (
                <rect
                  x={centre - barWidth - 1}
                  y={totalToY(sharedTotal)}
                  width={barWidth}
                  height={baseline - totalToY(sharedTotal)}
                  className="fill-slate-400 dark:fill-slate-500"
                />
              )}
              {separateTotal !== undefined && (
                <rect
                  x={centre + 1}
                  y={totalToY(separateTotal)}
                  width={barWidth}
                  height={baseline - totalToY(separateTotal)}
                  className={CLASS_FILLS[person.label % CLASS_FILLS.length]}
                />
              )}
              <circle
                cx={centre}
                cy={baseline + 12}
                r={4}
                className={CLASS_FILLS[person.label % CLASS_FILLS.length]}
              />
            </g>
          );
        })}

        <line
          x1={PAD.left}
          y1={baseline}
          x2={PAD.left + PLOT.width}
          y2={baseline}
          stroke="currentColor"
          className="text-slate-300 dark:text-slate-700"
          strokeWidth={1}
        />

        <text
          x={PAD.left + PLOT.width / 2}
          y={VIEW.height - 6}
          textAnchor="middle"
          className="fill-slate-500 text-xs font-medium dark:fill-slate-400"
        >
          The crowd, children then teenagers then adults
        </text>
        <text
          x={14}
          y={PAD.top + PLOT.height / 2}
          textAnchor="middle"
          transform={`rotate(-90 14 ${PAD.top + PLOT.height / 2})`}
          className="fill-slate-500 text-xs font-medium dark:fill-slate-400"
        >
          Total of the three scores
        </text>
      </svg>

      <p className="mt-2 text-center text-xs text-slate-500 dark:text-slate-500">
        Grey is the softmax total, and the coloured bar beside it is the
        one-vs-rest total for the same person. The dashed line is one.
      </p>

      <div className="mt-3 grid grid-cols-3 gap-3">
        <Stat label="Softmax totals" value={softmaxReadout} />
        <Stat label="One vs rest, lowest total" value={lowestReadout} />
        <Stat label="One vs rest, highest total" value={highestReadout} />
      </div>

      {message && (
        <p className="mt-3 text-sm text-amber-600 dark:text-amber-400">
          {message}
        </p>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-slate-100 px-3 py-2 dark:bg-slate-800">
      <div className="text-xs text-slate-500 dark:text-slate-400">{label}</div>
      <div className="font-mono text-lg font-semibold text-slate-900 dark:text-slate-100">
        {value}
      </div>
    </div>
  );
}
