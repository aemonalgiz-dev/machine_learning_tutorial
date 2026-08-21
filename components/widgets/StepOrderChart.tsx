"use client";

// The same two steps, run in both orders, at a range of penalties.
//
// Indigo is the chain's own order, expand height to its square and then
// standardize both columns; amber is the reverse, standardize height and then
// square it. Each point is the mean held-out R squared across the same
// seeded folds, and the readouts give the largest difference between the two
// orders' predictions on the three held-out people at a penalty of zero,
// where it is rounding, and at the shown penalty, where it is not. The table
// below is the columns each order handed the model, with their centre and
// spread over the training nine and the coefficient the ridge gave them. The
// API fits both orders; the browser draws the lines.

import { useEffect, useState } from "react";
import { ApiError } from "@/lib/api";
import { StepOrder, compareOrders } from "@/lib/concepts/pipelines";
import {
  CHAIN_ORDER,
  MIDDLE_THREE,
  ORDER_PENALTIES,
  PAGE_DEGREE,
  PAGE_FOLDS,
  PAGE_SEED,
  REVERSE_ORDER,
  TWELVE_PEOPLE,
  formatScore,
} from "./pipelinesFixtures";

const VIEW = { width: 640, height: 280 };
const PAD = { left: 52, right: 16, top: 20, bottom: 40 };
const PLOT = {
  width: VIEW.width - PAD.left - PAD.right,
  height: VIEW.height - PAD.top - PAD.bottom,
};
const SCORE_TOP = 1.0;
const SCORE_BOTTOM = -0.25;
const GRID_SCORES = [1, 0.75, 0.5, 0.25, 0];

function pixelForScore(score: number): number {
  const clamped = Math.max(Math.min(score, SCORE_TOP), SCORE_BOTTOM);
  return PAD.top + ((SCORE_TOP - clamped) / (SCORE_TOP - SCORE_BOTTOM)) * PLOT.height;
}

function pixelForPosition(position: number, count: number): number {
  return PAD.left + ((position + 0.5) / count) * PLOT.width;
}

export function StepOrderChart() {
  const [order, setOrder] = useState<StepOrder | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setOrder(
          await compareOrders(
            TWELVE_PEOPLE,
            ORDER_PENALTIES,
            MIDDLE_THREE,
            PAGE_DEGREE,
            PAGE_FOLDS,
            PAGE_SEED,
          ),
        );
      } catch (error) {
        if (error instanceof ApiError) setMessage(error.message);
        else setMessage("Something went wrong.");
      }
    })();
  }, []);

  const sweep = order?.sweep ?? [];
  const count = Math.max(sweep.length, 1);
  const line = (pick: (entry: StepOrder["sweep"][number]) => number) =>
    sweep.map((entry, position) => `${pixelForPosition(position, count)},${pixelForScore(pick(entry))}`).join(" ");
  const atZero = sweep.find((entry) => entry.penalty === 0) ?? null;
  const atShown = order ? (sweep.find((entry) => entry.penalty === order.shown_penalty) ?? null) : null;

  const columnRows = (columns: StepOrder["expand_then_scale_columns"]) =>
    columns.map((column) => (
      <tr key={column.name} className="border-b border-slate-100 last:border-0 dark:border-slate-800/60">
        <td className="py-1 pr-4 font-mono text-slate-800 dark:text-slate-200">{column.name}</td>
        <td className="py-1 pr-4 font-mono text-slate-800 dark:text-slate-200">{column.mean.toFixed(3)}</td>
        <td className="py-1 pr-4 font-mono text-slate-800 dark:text-slate-200">{column.standard_deviation.toFixed(3)}</td>
        <td className="py-1 font-mono text-slate-800 dark:text-slate-200">{column.coefficient.toFixed(3)}</td>
      </tr>
    ));

  return (
    <div>
      <svg viewBox={`0 0 ${VIEW.width} ${VIEW.height}`} className="w-full select-none rounded-lg bg-slate-50 dark:bg-slate-950">
        {GRID_SCORES.map((gridScore) => (
          <g key={`grid${gridScore}`}>
            <line
              x1={PAD.left}
              y1={pixelForScore(gridScore)}
              x2={PAD.left + PLOT.width}
              y2={pixelForScore(gridScore)}
              stroke="currentColor"
              className="text-slate-200 dark:text-slate-800"
              strokeWidth={1}
            />
            <text x={PAD.left - 8} y={pixelForScore(gridScore) + 3} textAnchor="end" className="fill-slate-500 text-xs font-medium dark:fill-slate-400">
              {gridScore.toFixed(2)}
            </text>
          </g>
        ))}
        {sweep.length > 1 && (
          <>
            <polyline points={line((entry) => entry.scale_then_expand_score)} fill="none" stroke={REVERSE_ORDER} strokeWidth={2} />
            <polyline points={line((entry) => entry.expand_then_scale_score)} fill="none" stroke={CHAIN_ORDER} strokeWidth={2} />
          </>
        )}
        {sweep.map((entry, position) => (
          <g key={`penalty${entry.penalty}`}>
            <circle cx={pixelForPosition(position, count)} cy={pixelForScore(entry.scale_then_expand_score)} r={5} fill={REVERSE_ORDER} stroke="white" strokeWidth={1.5} />
            <circle cx={pixelForPosition(position, count)} cy={pixelForScore(entry.expand_then_scale_score)} r={5} fill={CHAIN_ORDER} stroke="white" strokeWidth={1.5} />
            <text x={pixelForPosition(position, count)} y={pixelForScore(entry.expand_then_scale_score) - 10} textAnchor="middle" className="fill-slate-700 font-mono text-[10px] dark:fill-slate-300">
              {formatScore(entry.expand_then_scale_score, 3)}
            </text>
            <text x={pixelForPosition(position, count)} y={pixelForScore(entry.scale_then_expand_score) + 18} textAnchor="middle" className="fill-slate-700 font-mono text-[10px] dark:fill-slate-300">
              {formatScore(entry.scale_then_expand_score, 3)}
            </text>
            <text x={pixelForPosition(position, count)} y={VIEW.height - 12} textAnchor="middle" className="fill-slate-500 text-xs font-medium dark:fill-slate-400">
              penalty {entry.penalty}
            </text>
          </g>
        ))}
      </svg>
      <p className="mt-2 text-center text-xs text-slate-500 dark:text-slate-500">
        Indigo expands height and then standardizes both columns; amber
        standardizes height and then squares it. Both are mean held-out R²
        across the same four seeded folds.
      </p>

      <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat label="Held-out gap at penalty 0" value={atZero ? atZero.held_out_gap.toExponential(1) : "…"} />
        <Stat label={order ? `Held-out gap at penalty ${order.shown_penalty}` : "Held-out gap"} value={atShown ? `${atShown.held_out_gap.toFixed(3)} kg` : "…"} />
        <Stat label="Same, plain least squares" value={order ? order.least_squares_gap.toExponential(1) : "…"} />
        <Stat label="Degree" value={order ? String(order.degree) : "…"} />
      </div>

      {order && (
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div>
            <p className="mb-1 text-sm font-medium" style={{ color: CHAIN_ORDER }}>
              expand, then standardize, at penalty {order.shown_penalty}
            </p>
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left dark:border-slate-800">
                  {["column", "centre", "spread", "coefficient"].map((heading) => (
                    <th key={heading} className="py-1 pr-4 font-semibold text-slate-600 last:pr-0 dark:text-slate-400">{heading}</th>
                  ))}
                </tr>
              </thead>
              <tbody>{columnRows(order.expand_then_scale_columns)}</tbody>
            </table>
          </div>
          <div>
            <p className="mb-1 text-sm font-medium" style={{ color: REVERSE_ORDER }}>
              standardize, then expand, at penalty {order.shown_penalty}
            </p>
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left dark:border-slate-800">
                  {["column", "centre", "spread", "coefficient"].map((heading) => (
                    <th key={heading} className="py-1 pr-4 font-semibold text-slate-600 last:pr-0 dark:text-slate-400">{heading}</th>
                  ))}
                </tr>
              </thead>
              <tbody>{columnRows(order.scale_then_expand_columns)}</tbody>
            </table>
          </div>
        </div>
      )}

      {message && (
        <p className="mt-3 text-sm text-amber-600 dark:text-amber-400">{message}</p>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-slate-100 px-3 py-2 dark:bg-slate-800">
      <div className="text-xs text-slate-500 dark:text-slate-400">{label}</div>
      <div className="font-mono text-base font-semibold text-slate-900 dark:text-slate-100">
        {value}
      </div>
    </div>
  );
}
