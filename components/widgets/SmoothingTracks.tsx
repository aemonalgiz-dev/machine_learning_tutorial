"use client";

// Which way a score moves when the context rates are flattened.
//
// Three pairs are tracked as the exponent falls from one, where nothing is
// flattened, down to a quarter. The first has a rare word as its context and
// the second a common one, and they move in opposite directions, which is the
// point: flattening lifts a rare context's rate, and the rate is in the
// denominator, so the score of a pair with a rare context falls. The third is
// already below chance and is pushed further below by the same reasoning. The
// API scores at every exponent; the browser draws.

import { useEffect, useState } from "react";
import {
  ApiError,
  SmoothingReport,
  fetchSmoothing,
} from "@/lib/concepts/pointwise-mutual-information";
import { BELOW, COOKING, Legend, SAILING, Stat, Waiting } from "./mutualInformationShared";

const WIDTH = 620;
const HEIGHT = 230;
const LEFT = 52;
const RIGHT = 24;
const TOP = 18;
const BOTTOM = 40;

export function SmoothingTracks() {
  const [report, setReport] = useState<SmoothingReport | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const next = await fetchSmoothing();
        if (!cancelled) setReport(next);
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

  if (!report) return <Waiting message={message} />;

  const rows = [...report.rows].sort((a, b) => b.exponent - a.exponent);
  const values = rows.flatMap((row) => [
    row.rare_context,
    row.frequent_context,
    row.below_chance,
  ]);
  const lowest = Math.min(...values, 0);
  const highest = Math.max(...values, 0);
  const acrossX = (exponent: number) =>
    LEFT + ((1 - exponent) / 0.75) * (WIDTH - LEFT - RIGHT);
  const upY = (value: number) =>
    HEIGHT -
    BOTTOM -
    ((value - lowest) / (highest - lowest)) * (HEIGHT - TOP - BOTTOM);

  const tracks = [
    {
      label: `${report.rare_context_pair[0]} ~ ${report.rare_context_pair[1]}`,
      note: `context seen ${report.rare_context_total.toFixed(0)} times`,
      colour: COOKING,
      read: (row: (typeof rows)[number]) => row.rare_context,
    },
    {
      label: `${report.frequent_context_pair[0]} ~ ${report.frequent_context_pair[1]}`,
      note: `context seen ${report.frequent_context_total.toFixed(0)} times`,
      colour: SAILING,
      read: (row: (typeof rows)[number]) => row.frequent_context,
    },
    {
      label: `${report.below_chance_pair[0]} ~ ${report.below_chance_pair[1]}`,
      note: "already below chance",
      colour: BELOW,
      read: (row: (typeof rows)[number]) => row.below_chance,
    },
  ];

  const published = rows.find((row) => Math.abs(row.exponent - 0.75) < 1e-9);

  return (
    <div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Stat
          label="entries kept, unflattened"
          value={String(rows[0].n_kept)}
        />
        <Stat
          label="entries kept at the published exponent"
          value={String(published?.n_kept ?? 0)}
        />
        <Stat
          label="pairs whose two directions now disagree"
          value={String(published?.n_asymmetric_pairs ?? 0)}
        />
        <Stat
          label="how far the halves came apart"
          value={published?.gap === null || published === undefined ? "none" : published.gap.toFixed(4)}
        />
      </div>

      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="mt-3 w-full"
        role="img"
        aria-label="three pairs' scores against the flattening exponent"
      >
        <line
          x1={LEFT}
          y1={upY(0)}
          x2={WIDTH - RIGHT}
          y2={upY(0)}
          stroke="currentColor"
          strokeWidth={1}
          className="text-slate-300 dark:text-slate-700"
        />
        <text
          x={LEFT - 6}
          y={upY(0) + 3}
          textAnchor="end"
          className="fill-slate-400 font-mono text-[9px]"
        >
          0
        </text>
        {rows.map((row) => (
          <g key={row.exponent}>
            <line
              x1={acrossX(row.exponent)}
              y1={TOP}
              x2={acrossX(row.exponent)}
              y2={HEIGHT - BOTTOM}
              stroke="currentColor"
              strokeWidth={0.5}
              className="text-slate-200 dark:text-slate-800"
            />
            <text
              x={acrossX(row.exponent)}
              y={HEIGHT - BOTTOM + 14}
              textAnchor="middle"
              className="fill-slate-500 font-mono text-[9px] dark:fill-slate-400"
            >
              {row.exponent.toFixed(2)}
            </text>
          </g>
        ))}
        {published && (
          <text
            x={acrossX(0.75)}
            y={HEIGHT - BOTTOM + 26}
            textAnchor="middle"
            className="fill-indigo-600 text-[9px] dark:fill-indigo-400"
          >
            published
          </text>
        )}
        {tracks.map((track) => (
          <g key={track.label}>
            <polyline
              points={rows
                .map(
                  (row) => `${acrossX(row.exponent)},${upY(track.read(row))}`,
                )
                .join(" ")}
              fill="none"
              stroke={track.colour}
              strokeWidth={2}
            />
            {rows.map((row) => (
              <circle
                key={row.exponent}
                cx={acrossX(row.exponent)}
                cy={upY(track.read(row))}
                r={2.5}
                fill={track.colour}
              />
            ))}
            <text
              x={LEFT + 4}
              y={upY(track.read(rows[0])) - 6}
              className="font-mono text-[9px]"
              fill={track.colour}
            >
              {track.label}
            </text>
          </g>
        ))}
      </svg>

      <div className="mt-1 flex flex-wrap gap-3 text-[11px] text-slate-500 dark:text-slate-400">
        {tracks.map((track) => (
          <span key={track.label} className="flex items-center gap-1">
            <span
              className="inline-block h-2 w-2 rounded-sm"
              style={{ backgroundColor: track.colour }}
            />
            {track.label}, {track.note}
          </span>
        ))}
      </div>

      <Legend>
        The horizontal axis runs from no flattening at all on the left to heavy
        flattening on the right. The amber line falls and the blue one rises,
        which is the opposite of what the word lifting suggests, and the red line
        falls further below zero, since the same reasoning applies to a pair that
        was under chance already.
      </Legend>
      {message && (
        <p className="mt-2 text-sm text-amber-600 dark:text-amber-400">
          {message}
        </p>
      )}
    </div>
  );
}
