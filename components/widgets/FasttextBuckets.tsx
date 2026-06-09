"use client";

// How 279 pieces are made to fit a fixed number of rows, and what it costs.
//
// The first table is arithmetic on the hash alone and needs no fit: it counts
// how many rows the corpus's pieces land in as the table grows. The second
// runs the corpus at four of those sizes, so a table far too small can be seen
// doing damage rather than described as doing it. Underneath are the rows that
// two pieces of the corpus really do share here. The API hashes and fits; the
// browser draws.

import { useEffect, useState } from "react";
import { ApiError, BucketsReport, fetchBuckets } from "@/lib/concepts/fasttext";
import { Legend, Stat, Waiting } from "./fasttextShared";

const CHART = { width: 640, height: 180 };
const PAD = { left: 46, right: 16, top: 14, bottom: 34 };

export function FasttextBuckets() {
  const [report, setReport] = useState<BucketsReport | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchBuckets()
      .then((next) => {
        if (!cancelled) setReport(next);
      })
      .catch((error) => {
        if (cancelled) return;
        setMessage(error instanceof ApiError ? error.message : "Something went wrong.");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!report) return <Waiting message={message} />;

  const innerWidth = CHART.width - PAD.left - PAD.right;
  const innerHeight = CHART.height - PAD.top - PAD.bottom;
  const bars = report.sharing;
  const step = innerWidth / bars.length;
  const tallest = report.n_distinct_pieces;

  return (
    <div>
      <svg
        viewBox={`0 0 ${CHART.width} ${CHART.height}`}
        className="w-full select-none rounded-lg bg-slate-50 dark:bg-slate-950"
      >
        {bars.map((row, index) => {
          const height = (row.n_shared / tallest) * innerHeight;
          return (
            <g key={row.n_buckets}>
              <rect
                x={PAD.left + index * step + step * 0.2}
                y={PAD.top + innerHeight - height}
                width={step * 0.6}
                height={Math.max(1, height)}
                rx={2}
                fill="#f59e0b"
              />
              <text
                x={PAD.left + index * step + step * 0.5}
                y={PAD.top + innerHeight - height - 4}
                textAnchor="middle"
                className="fill-slate-600 text-[10px] dark:fill-slate-300"
              >
                {row.n_shared}
              </text>
              <text
                x={PAD.left + index * step + step * 0.5}
                y={CHART.height - PAD.bottom + 14}
                textAnchor="middle"
                className="fill-slate-500 text-[10px] dark:fill-slate-400"
              >
                {row.n_buckets >= 1000
                  ? `${Math.round(row.n_buckets / 1000)}k`
                  : row.n_buckets}
              </text>
            </g>
          );
        })}
        <text
          x={PAD.left + innerWidth / 2}
          y={CHART.height - 6}
          textAnchor="middle"
          className="fill-slate-500 text-[10px] dark:fill-slate-400"
        >
          pieces that have to share a row, against how many rows there are
        </text>
      </svg>

      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Stat label="distinct words" value={report.n_words.toString()} />
        <Stat label="distinct pieces" value={report.n_distinct_pieces.toString()} />
        <Stat label="pieces per word" value={report.pieces_per_word.toFixed(4)} />
        <Stat
          label="rows at the published size"
          value={report.published_buckets.toLocaleString()}
        />
      </div>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left dark:border-slate-800">
              <th className="py-2 pr-4 font-semibold text-slate-600 dark:text-slate-400">
                rows
              </th>
              <th className="py-2 pr-4 font-semibold text-slate-600 dark:text-slate-400">
                pieces sharing one
              </th>
              <th className="py-2 pr-4 font-semibold text-slate-600 dark:text-slate-400">
                alike, same list
              </th>
              <th className="py-2 pr-4 font-semibold text-slate-600 dark:text-slate-400">
                alike, across lists
              </th>
              <th className="py-2 font-semibold text-slate-600 dark:text-slate-400">
                the missing form, to the money words
              </th>
            </tr>
          </thead>
          <tbody>
            {report.fits.map((row) => (
              <tr
                key={row.n_buckets}
                className="border-b border-slate-100 last:border-0 dark:border-slate-800/60"
              >
                <td className="py-2 pr-4 font-mono text-slate-800 dark:text-slate-200">
                  {row.n_buckets.toLocaleString()}
                </td>
                <td className="py-2 pr-4 font-mono text-slate-800 dark:text-slate-200">
                  {row.n_shared}
                </td>
                <td className="py-2 pr-4 font-mono text-slate-800 dark:text-slate-200">
                  {row.within_topic.toFixed(4)}
                </td>
                <td className="py-2 pr-4 font-mono text-slate-800 dark:text-slate-200">
                  {row.across_topic.toFixed(4)}
                </td>
                <td className="py-2 font-mono text-slate-800 dark:text-slate-200">
                  {row.missing_to_money.toFixed(4)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-4 text-sm text-slate-600 dark:text-slate-300">
        At two thousand rows, {report.colliding.length} rows carry two pieces each.
      </p>
      <div className="mt-2 grid gap-1 sm:grid-cols-2">
        {report.colliding.map((row) => (
          <div key={row.bucket} className="flex items-baseline gap-2 text-xs">
            <span className="w-10 shrink-0 font-mono text-slate-500 dark:text-slate-400">
              {row.bucket}
            </span>
            <span className="font-mono text-slate-800 dark:text-slate-200">
              {row.pieces.join("  ")}
            </span>
            <span className="text-slate-500 dark:text-slate-400">
              {row.owners.map((words) => words[0]).join(", ")}
            </span>
          </div>
        ))}
      </div>

      <Legend>
        Each line is one row, the two pieces kept in it, and one word that owns
        each of them. The two pieces have nothing to do with each other; they are
        added into the same twelve numbers because the hash sent them there.
      </Legend>
    </div>
  );
}
