"use client";

// Recall of the true ten nearest against the share of the collection read.
//
// Every point is one setting averaged over the 240 held-out queries. The
// solid lines are the inverted file at three cell counts, a point per number
// of cells searched; the dashed lines are random hyperplane hashing at three
// code lengths, a point per search radius in bits. A point further up and
// further left is a better bargain, and the corner at one and zero, the whole
// answer for nothing read, is where no method reaches. The API measures every
// point; the browser draws the lines between them.

import { useEffect, useState } from "react";
import { ApiError } from "@/lib/api";
import {
  TradeOffResponse,
  fetchTradeOff,
} from "@/lib/concepts/searching-a-collection-of-pictures";
import { Loading } from "./searchingPicturesShared";

const VIEW = { width: 600, height: 340, left: 48, right: 16, top: 16, bottom: 40 };
const CELL_COLOURS = ["#a5b4fc", "#6366f1", "#312e81"];
const HASH_COLOURS = ["#fcd34d", "#f59e0b", "#b45309"];
const X_MAX = 0.5;
const Y_MIN = 0.3;

type Shown = "both" | "cells" | "hashing";

export function RecallTradeOffChart() {
  const [report, setReport] = useState<TradeOffResponse | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [shown, setShown] = useState<Shown>("both");
  const [hovered, setHovered] = useState<string | null>(null);

  useEffect(() => {
    let current = true;
    fetchTradeOff()
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

  const plotWidth = VIEW.width - VIEW.left - VIEW.right;
  const plotHeight = VIEW.height - VIEW.top - VIEW.bottom;
  const toX = (share: number) => VIEW.left + (Math.min(share, X_MAX) / X_MAX) * plotWidth;
  const toY = (recall: number) => VIEW.top + (1 - (recall - Y_MIN) / (1 - Y_MIN)) * plotHeight;

  const series = [
    ...(shown !== "hashing"
      ? report.cell_counts.map((cells, index) => ({
          key: `cells-${cells.n_cells}`,
          label: `${cells.n_cells} cells`,
          colour: CELL_COLOURS[index],
          dashed: false,
          points: cells.rows
            .filter((row) => row.touched_share <= X_MAX)
            .map((row) => ({ x: row.touched_share, y: row.recall, note: `${cells.n_cells} cells, ${row.probes} searched, recall ${row.recall.toFixed(4)} reading ${(row.touched_share * 100).toFixed(1)}%` })),
        }))
      : []),
    ...(shown !== "cells"
      ? report.hashing.map((table, index) => ({
          key: `bits-${table.bits}`,
          label: `${table.bits} hyperplanes`,
          colour: HASH_COLOURS[index],
          dashed: true,
          points: table.rows
            .filter((row) => row.touched_share <= X_MAX)
            .map((row) => ({ x: row.touched_share, y: row.recall, note: `${table.bits} planes, codes within ${row.radius} of the question’s, recall ${row.recall.toFixed(4)} reading ${(row.touched_share * 100).toFixed(1)}%` })),
        }))
      : []),
  ];

  return (
    <div>
      <div className="mb-2 inline-flex overflow-hidden rounded-md border border-slate-300 text-xs dark:border-slate-700">
        {(["both", "cells", "hashing"] as const).map((option) => (
          <button key={option} type="button" onClick={() => setShown(option)} className={`px-3 py-1 ${shown === option ? "bg-indigo-600 text-white" : "bg-white text-slate-700 dark:bg-slate-900 dark:text-slate-300"}`}>
            {option === "both" ? "both routes" : option === "cells" ? "inverted file" : "hyperplane hashing"}
          </button>
        ))}
      </div>
      <svg viewBox={`0 0 ${VIEW.width} ${VIEW.height}`} className="w-full select-none" role="img" aria-label="Recall of the true ten nearest against the share of the collection read">
        {[0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1].map((tick) => (
          <g key={`y-${tick}`}>
            <line x1={VIEW.left} x2={VIEW.width - VIEW.right} y1={toY(tick)} y2={toY(tick)} className="stroke-slate-200 dark:stroke-slate-800" strokeWidth={0.7} />
            <text x={VIEW.left - 6} y={toY(tick) + 3} textAnchor="end" fontSize={10} className="fill-slate-500 dark:fill-slate-400">{tick.toFixed(1)}</text>
          </g>
        ))}
        {[0, 0.1, 0.2, 0.3, 0.4, 0.5].map((tick) => (
          <g key={`x-${tick}`}>
            <line x1={toX(tick)} x2={toX(tick)} y1={VIEW.top} y2={VIEW.height - VIEW.bottom} className="stroke-slate-100 dark:stroke-slate-900" strokeWidth={0.7} />
            <text x={toX(tick)} y={VIEW.height - VIEW.bottom + 14} textAnchor="middle" fontSize={10} className="fill-slate-500 dark:fill-slate-400">{`${Math.round(tick * 100)}%`}</text>
          </g>
        ))}
        <text x={VIEW.left + plotWidth / 2} y={VIEW.height - 6} textAnchor="middle" fontSize={11} className="fill-slate-600 dark:fill-slate-400">share of the 4000 pictures whose distance was computed</text>
        <text x={12} y={VIEW.top + plotHeight / 2} textAnchor="middle" fontSize={11} transform={`rotate(-90 12 ${VIEW.top + plotHeight / 2})`} className="fill-slate-600 dark:fill-slate-400">recall of the true 10</text>
        {series.map((line) => (
          <g key={line.key}>
            <path d={line.points.map((point, index) => `${index === 0 ? "M" : "L"}${toX(point.x)},${toY(point.y)}`).join("")} fill="none" stroke={line.colour} strokeWidth={2} strokeDasharray={line.dashed ? "5 4" : undefined} />
            {line.points.map((point) => (
              <circle key={point.note} cx={toX(point.x)} cy={toY(point.y)} r={hovered === point.note ? 5 : 3.2} fill={line.colour} stroke="white" strokeWidth={1} onMouseEnter={() => setHovered(point.note)} onMouseLeave={() => setHovered(null)} />
            ))}
          </g>
        ))}
      </svg>
      <div className="mt-1 flex flex-wrap gap-3 text-xs text-slate-600 dark:text-slate-400">
        {series.map((line) => (
          <span key={line.key} className="inline-flex items-center gap-1.5">
            <svg width={22} height={8} aria-hidden="true">
              <line x1={0} x2={22} y1={4} y2={4} stroke={line.colour} strokeWidth={2} strokeDasharray={line.dashed ? "5 4" : undefined} />
            </svg>
            {line.label}
          </span>
        ))}
      </div>
      <p className="mt-2 min-h-[1.25rem] font-mono text-xs text-slate-700 dark:text-slate-300">
        {hovered ?? "Point at a dot to read its setting."}
      </p>
      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
        The inverted file is scored against the exact Euclidean ten, the hashing against the exact cosine ten, since each stands in for its own distance. Settings reading more than half the collection are left off, since every one of them recovers at least {Math.min(...report.cell_counts.flatMap((cells) => cells.rows.filter((row) => row.touched_share > X_MAX).map((row) => row.recall)), ...report.hashing.flatMap((table) => table.rows.filter((row) => row.touched_share > X_MAX).map((row) => row.recall))).toFixed(4)} of it.
      </p>
    </div>
  );
}
