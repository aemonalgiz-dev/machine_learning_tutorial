"use client";

// How much nearer the nearest picture is than the farthest, and what that
// does to an index.
//
// The left panel is one bar per kind of vector: the nearest distance divided
// by the farthest, for each of the 240 queries against a collection of 4000,
// the bar at the mean and the whisker from the smallest to the largest. A
// ratio near zero means the nearest is far nearer than everything else; a
// ratio near one means every point is about as far as every other. The right
// panel runs the same inverted file of 32 cells on the pictures and on
// uniform random vectors of 16 and 64 numbers, and plots how much of the true
// ten each number of cells searched recovers. The API measures; the browser
// draws.

import { useEffect, useState } from "react";
import { ApiError } from "@/lib/api";
import {
  ConcentrationResponse,
  fetchConcentration,
} from "@/lib/concepts/searching-a-collection-of-pictures";
import { Loading, Stat } from "./searchingPicturesShared";

const BARS = { width: 320, rowHeight: 26, left: 128, right: 40 };
const LINES = { width: 300, height: 220, left: 36, right: 10, top: 10, bottom: 34 };
const LINE_COLOURS = ["#10b981", "#94a3b8", "#475569"];

export function ConcentrationChart() {
  const [report, setReport] = useState<ConcentrationResponse | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let current = true;
    fetchConcentration()
      .then((loaded) => {
        if (current) setReport(loaded);
      })
      .catch((error) => {
        if (current) setMessage(error instanceof ApiError ? error.message : "Something went wrong.");
      });
    return () => {
      current = false;
    };
  }, []);

  if (!report) return <Loading message={message} />;

  const barsHeight = report.ratios.length * BARS.rowHeight + 24;
  const barWidth = BARS.width - BARS.left - BARS.right;
  const toBar = (ratio: number) => BARS.left + ratio * barWidth;

  const plotWidth = LINES.width - LINES.left - LINES.right;
  const plotHeight = LINES.height - LINES.top - LINES.bottom;
  const maxProbes = 32;
  const toX = (probes: number) => LINES.left + (Math.log2(probes) / Math.log2(maxProbes)) * plotWidth;
  const toY = (recall: number) => LINES.top + (1 - recall) * plotHeight;

  return (
    <div>
      <div className="grid gap-4 md:grid-cols-2">
        <svg viewBox={`0 0 ${BARS.width} ${barsHeight}`} className="w-full select-none" role="img" aria-label="Nearest distance over farthest distance for each kind of vector">
          {[0, 0.25, 0.5, 0.75, 1].map((tick) => (
            <g key={tick}>
              <line x1={toBar(tick)} x2={toBar(tick)} y1={4} y2={barsHeight - 18} className="stroke-slate-200 dark:stroke-slate-800" strokeWidth={0.7} />
              <text x={toBar(tick)} y={barsHeight - 6} textAnchor="middle" fontSize={9} className="fill-slate-500 dark:fill-slate-400">{tick}</text>
            </g>
          ))}
          {report.ratios.map((row, index) => {
            const y = 8 + index * BARS.rowHeight;
            const pictures = row.label === "picture vectors";
            return (
              <g key={`${row.label}-${row.dimension}`}>
                <text x={BARS.left - 6} y={y + 11} textAnchor="end" fontSize={10} className="fill-slate-700 dark:fill-slate-300">
                  {row.label === "uniform random" ? `random, ${row.dimension}` : `${row.label}, ${row.dimension}`}
                </text>
                <rect x={BARS.left} y={y + 2} width={row.mean_ratio * barWidth} height={13} rx={2} fill={pictures ? "#10b981" : row.label === "raw pixels" ? "#f59e0b" : "#94a3b8"} />
                <line x1={toBar(row.smallest_ratio)} x2={toBar(row.largest_ratio)} y1={y + 8.5} y2={y + 8.5} className="stroke-slate-700 dark:stroke-slate-300" strokeWidth={1} />
                <text x={toBar(row.mean_ratio) + 4} y={y + 12} fontSize={9} className="fill-slate-600 dark:fill-slate-400">{row.mean_ratio.toFixed(3)}</text>
              </g>
            );
          })}
        </svg>

        <svg viewBox={`0 0 ${LINES.width} ${LINES.height}`} className="w-full select-none" role="img" aria-label="Recall of the true ten against cells searched, on pictures and on random vectors">
          {[0, 0.25, 0.5, 0.75, 1].map((tick) => (
            <g key={tick}>
              <line x1={LINES.left} x2={LINES.width - LINES.right} y1={toY(tick)} y2={toY(tick)} className="stroke-slate-200 dark:stroke-slate-800" strokeWidth={0.7} />
              <text x={LINES.left - 4} y={toY(tick) + 3} textAnchor="end" fontSize={9} className="fill-slate-500 dark:fill-slate-400">{tick}</text>
            </g>
          ))}
          {[1, 2, 4, 8, 16, 32].map((tick) => (
            <text key={tick} x={toX(tick)} y={LINES.height - LINES.bottom + 12} textAnchor="middle" fontSize={9} className="fill-slate-500 dark:fill-slate-400">{tick}</text>
          ))}
          <text x={LINES.left + plotWidth / 2} y={LINES.height - 4} textAnchor="middle" fontSize={10} className="fill-slate-600 dark:fill-slate-400">cells searched, of 32</text>
          {report.index_rows.map((series, index) => (
            <g key={`${series.label}-${series.dimension}`}>
              <path d={series.rows.map((row, position) => `${position === 0 ? "M" : "L"}${toX(row.probes)},${toY(row.recall)}`).join("")} fill="none" stroke={LINE_COLOURS[index]} strokeWidth={2} />
              {series.rows.map((row) => (
                <circle key={row.probes} cx={toX(row.probes)} cy={toY(row.recall)} r={2.5} fill={LINE_COLOURS[index]} />
              ))}
            </g>
          ))}
        </svg>
      </div>
      <div className="mt-1 flex flex-wrap gap-3 text-xs text-slate-600 dark:text-slate-400">
        {report.index_rows.map((series, index) => (
          <span key={`${series.label}-${series.dimension}`} className="inline-flex items-center gap-1.5">
            <span className="inline-block h-2.5 w-2.5 rounded-sm" style={{ background: LINE_COLOURS[index] }} />
            {series.label === "picture vectors" ? "the picture vectors, 16 numbers" : `uniform random, ${series.dimension} numbers`}
          </span>
        ))}
      </div>
      <div className="mt-3 grid grid-cols-2 gap-1.5 sm:grid-cols-4">
        <Stat label="picture vectors: directions for 90% of spread" value={`${report.components_for_ninety} of 16`} />
        <Stat label="random, 16: directions for 90%" value={`${report.uniform_components_for_ninety} of 16`} />
        <Stat label="widest direction, pictures" value={`${(report.spread_shares[0] * 100).toFixed(1)}%`} />
        <Stat label="widest direction, random" value={`${(report.uniform_spread_shares[0] * 100).toFixed(1)}%`} />
      </div>
      <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
        Every row asks {report.n_queries} queries of {report.collection_size} points. The random vectors are drawn evenly between minus one and one in every number, which is the range the network&rsquo;s sixteen numbers can take.
      </p>
    </div>
  );
}
