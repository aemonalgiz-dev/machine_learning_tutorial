"use client";

// What grows when the corpus does, and what does not.
//
// The corpus is repeated whole, one copy then two then four then eight, which
// leaves the vocabulary and the set of pairs that ever co-occurred exactly
// where they were while doubling how much text there is to walk. The two lines
// are how many terms a pass over the table has against how many neighbour
// readings a pass over the text makes, and the second is the one that grows.
// The API counts; the browser draws.

import { useEffect, useState } from "react";
import { ApiError, CostReport, fetchCostReport } from "@/lib/concepts/glove";
import { ASTRONOMY, COOKING, Legend, Stat, Waiting } from "./gloveShared";

const PANEL = { width: 640, height: 200 };
const PAD = { left: 56, right: 96, top: 20, bottom: 36 };

export function GloveTableCost() {
  const [report, setReport] = useState<CostReport | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setReport(await fetchCostReport());
      } catch (error) {
        if (error instanceof ApiError) setMessage(error.message);
        else setMessage("Something went wrong.");
      }
    })();
  }, []);

  if (!report) return <Waiting message={message} />;

  const innerWidth = PANEL.width - PAD.left - PAD.right;
  const innerHeight = PANEL.height - PAD.top - PAD.bottom;
  const top =
    Math.max(...report.growth.map((row) => row.ordered_positions)) * 1.08;
  const positionX = (index: number) =>
    PAD.left + (index / (report.growth.length - 1)) * innerWidth;
  const positionY = (value: number) => PAD.top + (1 - value / top) * innerHeight;
  const pathOf = (values: number[]) =>
    values
      .map(
        (value, index) =>
          `${index === 0 ? "M" : "L"}${positionX(index)},${positionY(value)}`,
      )
      .join(" ");
  const last = report.growth[report.growth.length - 1];

  return (
    <div>
      <svg
        viewBox={`0 0 ${PANEL.width} ${PANEL.height}`}
        className="w-full select-none rounded-lg bg-slate-50 dark:bg-slate-950"
      >
        <path
          d={pathOf(report.growth.map((row) => row.ordered_positions))}
          fill="none"
          stroke={COOKING}
          strokeWidth={2}
        />
        <path
          d={pathOf(report.growth.map((row) => row.nonzero_pairs))}
          fill="none"
          stroke={ASTRONOMY}
          strokeWidth={2}
        />
        {report.growth.map((row, index) => (
          <g key={row.copies}>
            <circle
              cx={positionX(index)}
              cy={positionY(row.ordered_positions)}
              r={4}
              fill={COOKING}
            />
            <circle
              cx={positionX(index)}
              cy={positionY(row.nonzero_pairs)}
              r={4}
              fill={ASTRONOMY}
            />
            <text
              x={positionX(index)}
              y={PANEL.height - PAD.bottom + 16}
              textAnchor="middle"
              className="fill-slate-500 text-[10px] dark:fill-slate-400"
            >
              {row.n_occurrences} words
            </text>
          </g>
        ))}
        <text
          x={positionX(report.growth.length - 1) + 8}
          y={positionY(last.ordered_positions) + 4}
          className="text-[10px]"
          fill={COOKING}
        >
          {last.ordered_positions} readings
        </text>
        <text
          x={positionX(report.growth.length - 1) + 8}
          y={positionY(last.nonzero_pairs) + 4}
          className="text-[10px]"
          fill={ASTRONOMY}
        >
          {last.nonzero_pairs} terms
        </text>
        <text
          x={PAD.left + innerWidth / 2}
          y={PANEL.height - 6}
          textAnchor="middle"
          className="fill-slate-500 text-[10px] dark:fill-slate-400"
        >
          one pass over the text against one pass over the table, as the corpus
          is repeated
        </text>
      </svg>

      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Stat label="numbers in the whole table" value={String(report.numbers_in_all_rows)} />
        <Stat
          label="numbers in the fitted vectors"
          value={String(report.numbers_in_all_vectors)}
        />
        <Stat
          label="building the table"
          value={`${(report.table_seconds * 1000).toFixed(1)} ms`}
        />
        <Stat label="fitting it" value={`${report.fit_seconds.toFixed(2)} s`} />
      </div>

      <Legend>
        Repeating a corpus is not the same as collecting more of it, and it is
        chosen here precisely because it holds the vocabulary fixed, which
        isolates the one claim being made. A pass over the table costs the number
        of distinct pairs and nothing else, while a pass over the text costs a
        reading at every position. On real text the set of distinct pairs does
        keep growing, only far more slowly than the text does.
      </Legend>
      {message && (
        <p className="mt-2 text-sm text-amber-600 dark:text-amber-400">{message}</p>
      )}
    </div>
  );
}
