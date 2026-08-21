"use client";

// A single prediction pulled apart into the nine terms that make it.
//
// The fit is the same degree-9 polynomial as the penalty playground, and
// the reader picks one moment in time. Each term's contribution at that
// moment is drawn as a block, positives stacking upward from the intercept
// and negatives stacking downward, and the final prediction is where the
// stack ends. With no penalty the blocks run to thousands of metres in each
// direction and cancel to a height of twenty, which is the instability the
// page is about. A small penalty and the blocks are a few metres each. The
// second view draws every term as its own curve across time, with the fit
// as their sum. Every contribution comes from the API on the standardized
// columns the fit actually used; the browser stacks and draws them.

import { useEffect, useState } from "react";
import { ApiError, PenalisedFit, Point, fitPenalised } from "@/lib/api";

const NOISY_THROW: Point[] = [
  { x: 0.0, y: 0.7 },
  { x: 0.29, y: 5.2 },
  { x: 0.57, y: 9.5 },
  { x: 0.86, y: 13.0 },
  { x: 1.14, y: 16.9 },
  { x: 1.43, y: 18.1 },
  { x: 1.71, y: 19.4 },
  { x: 2.0, y: 21.0 },
  { x: 2.29, y: 19.6 },
  { x: 2.57, y: 19.1 },
  { x: 2.86, y: 16.8 },
  { x: 3.14, y: 13.6 },
  { x: 3.43, y: 11.1 },
  { x: 3.71, y: 6.2 },
  { x: 4.0, y: 1.2 },
];

const PENALTY_CHOICES = [
  { label: "none", value: 0 },
  { label: "0.001", value: 0.001 },
  { label: "0.1", value: 0.1 },
  { label: "1", value: 1 },
];

// One colour per term, shared with the other coefficient widgets on the page.
export const TERM_COLOURS = [
  "#6366f1",
  "#f59e0b",
  "#10b981",
  "#ef4444",
  "#0ea5e9",
  "#a855f7",
  "#84cc16",
  "#f97316",
  "#64748b",
];

const STACK = { width: 300, height: 360, left: 60, right: 20, top: 16, bottom: 30 };
const CURVES = { width: 340, height: 360, left: 48, right: 12, top: 16, bottom: 34 };

function formatMetres(value: number): string {
  if (Math.abs(value) >= 10000) return value.toExponential(2);
  if (Math.abs(value) >= 100) return value.toFixed(0);
  return value.toFixed(2);
}

export function ContributionTugOfWar() {
  const [penalty, setPenalty] = useState(0);
  const [sample, setSample] = useState(40);
  const [fit, setFit] = useState<PenalisedFit | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setFit(await fitPenalised(NOISY_THROW, "ridge", penalty));
        setMessage(null);
      } catch (error) {
        if (error instanceof ApiError) setMessage(error.message);
        else setMessage("Something went wrong.");
      }
    })();
  }, [penalty]);

  const time = fit ? fit.curve[sample].x : (sample / 80) * 4;
  const contributions = fit
    ? fit.term_contributions.map((term) => ({ name: term.name, value: term.values[sample] }))
    : [];
  const prediction = fit ? fit.curve[sample].y : null;

  // The stack: intercept first, then positives upward, then negatives downward,
  // each block starting where the previous one ended.
  const positives = contributions.filter((each) => each.value >= 0);
  const negatives = contributions.filter((each) => each.value < 0);
  const intercept = fit ? fit.intercept : 0;
  const topOfStack = intercept + positives.reduce((sum, each) => sum + each.value, 0);
  const bottomOfStack = topOfStack + negatives.reduce((sum, each) => sum + each.value, 0);
  const reach = Math.max(30, Math.abs(topOfStack), Math.abs(bottomOfStack), Math.abs(intercept)) * 1.05;
  const stackY = (value: number) =>
    STACK.top + (1 - (value + reach) / (2 * reach)) * (STACK.height - STACK.top - STACK.bottom);

  const blocks: { name: string; from: number; to: number; colour: string }[] = [];
  let running = 0;
  blocks.push({ name: "intercept", from: 0, to: intercept, colour: "#94a3b8" });
  running = intercept;
  for (const each of positives) {
    const index = fit!.term_contributions.findIndex((term) => term.name === each.name);
    blocks.push({ name: each.name, from: running, to: running + each.value, colour: TERM_COLOURS[index] });
    running += each.value;
  }
  for (const each of negatives) {
    const index = fit!.term_contributions.findIndex((term) => term.name === each.name);
    blocks.push({ name: each.name, from: running, to: running + each.value, colour: TERM_COLOURS[index] });
    running += each.value;
  }

  // The curves view: each term across time, the fit as their sum.
  const curveReach = fit
    ? Math.max(30, ...fit.term_contributions.flatMap((term) => term.values.map((value) => Math.abs(value)))) * 1.05
    : 30;
  const curveX = (index: number) => CURVES.left + (index / 80) * (CURVES.width - CURVES.left - CURVES.right);
  const curveY = (value: number) =>
    CURVES.top + (1 - (value + curveReach) / (2 * curveReach)) * (CURVES.height - CURVES.top - CURVES.bottom);
  const pathOf = (values: number[]) =>
    values.map((value, index) => `${index === 0 ? "M" : "L"} ${curveX(index).toFixed(1)} ${curveY(value).toFixed(1)}`).join(" ");

  return (
    <div>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 pb-3 text-sm text-slate-600 dark:text-slate-300">
        <span className="flex items-center gap-1">
          penalty
          {PENALTY_CHOICES.map((choice) => (
            <button
              key={choice.label}
              onClick={() => setPenalty(choice.value)}
              className={`rounded-md border px-2 py-1 text-xs font-medium transition ${
                penalty === choice.value
                  ? "border-indigo-500 bg-indigo-50 text-indigo-700 dark:border-indigo-400 dark:bg-indigo-950/40 dark:text-indigo-200"
                  : "border-slate-300 bg-white text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
              }`}
            >
              {choice.label}
            </button>
          ))}
        </span>
        <label className="ml-auto flex items-center gap-2">
          time
          <input
            type="range"
            min={0}
            max={80}
            step={1}
            value={sample}
            onChange={(event) => setSample(Number(event.target.value))}
            className="w-36 accent-indigo-600"
          />
          <span className="w-12 font-mono">{time.toFixed(2)} s</span>
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-[300px_1fr]">
        <svg viewBox={`0 0 ${STACK.width} ${STACK.height}`} className="w-full select-none rounded-lg bg-slate-50 dark:bg-slate-950">
          <line x1={STACK.left} y1={stackY(0)} x2={STACK.width - STACK.right} y2={stackY(0)} stroke="currentColor" className="text-slate-400 dark:text-slate-600" strokeWidth={1.5} />
          <text x={STACK.left - 6} y={stackY(0) + 4} textAnchor="end" className="fill-slate-400 text-[10px]">0</text>
          <text x={STACK.left - 6} y={stackY(reach / 1.05) + 4} textAnchor="end" className="fill-slate-400 text-[10px]">{formatMetres(reach / 1.05)}</text>
          <text x={STACK.left - 6} y={stackY(-reach / 1.05) + 4} textAnchor="end" className="fill-slate-400 text-[10px]">{formatMetres(-reach / 1.05)}</text>
          {blocks.map((block, index) => {
            const top = Math.min(stackY(block.from), stackY(block.to));
            const height = Math.abs(stackY(block.to) - stackY(block.from));
            return (
              <rect
                key={`${block.name}-${index}`}
                x={STACK.left + 30}
                y={top}
                width={90}
                height={Math.max(height, 1)}
                fill={block.colour}
                opacity={0.85}
                stroke="white"
                strokeWidth={0.5}
              />
            );
          })}
          {prediction !== null && (
            <>
              <line x1={STACK.left + 20} y1={stackY(prediction)} x2={STACK.width - STACK.right} y2={stackY(prediction)} stroke="currentColor" className="text-emerald-600 dark:text-emerald-400" strokeWidth={2.5} />
              <text x={STACK.width - STACK.right - 4} y={stackY(prediction) - 6} textAnchor="end" className="fill-emerald-700 text-[11px] font-semibold dark:fill-emerald-300">
                prediction {prediction.toFixed(1)} m
              </text>
            </>
          )}
          <text x={STACK.left + 75} y={STACK.height - 10} textAnchor="middle" className="fill-slate-500 text-[11px] dark:fill-slate-400">
            the stack at t = {time.toFixed(2)}
          </text>
        </svg>

        <svg viewBox={`0 0 ${CURVES.width} ${CURVES.height}`} className="w-full select-none rounded-lg bg-slate-50 dark:bg-slate-950">
          <line x1={CURVES.left} y1={curveY(0)} x2={CURVES.width - CURVES.right} y2={curveY(0)} stroke="currentColor" className="text-slate-300 dark:text-slate-700" />
          <text x={CURVES.left - 6} y={curveY(curveReach / 1.05) + 4} textAnchor="end" className="fill-slate-400 text-[10px]">{formatMetres(curveReach / 1.05)}</text>
          <text x={CURVES.left - 6} y={curveY(0) + 4} textAnchor="end" className="fill-slate-400 text-[10px]">0</text>
          <text x={CURVES.left - 6} y={curveY(-curveReach / 1.05) + 4} textAnchor="end" className="fill-slate-400 text-[10px]">{formatMetres(-curveReach / 1.05)}</text>
          {fit?.term_contributions.map((term, index) => (
            <path key={term.name} d={pathOf(term.values)} fill="none" stroke={TERM_COLOURS[index]} strokeWidth={1.5} opacity={0.85} />
          ))}
          {fit && <path d={pathOf(fit.curve.map((point) => point.y))} fill="none" stroke="currentColor" className="text-slate-900 dark:text-slate-100" strokeWidth={3} />}
          {fit && <line x1={curveX(sample)} y1={CURVES.top} x2={curveX(sample)} y2={CURVES.height - CURVES.bottom} stroke="currentColor" className="text-slate-400 dark:text-slate-500" strokeDasharray="4 3" />}
          {[0, 1, 2, 3, 4].map((tick) => (
            <text key={tick} x={curveX(tick * 20)} y={CURVES.height - 18} textAnchor="middle" className="fill-slate-400 text-[10px]">{tick}</text>
          ))}
          <text x={(CURVES.left + CURVES.width - CURVES.right) / 2} y={CURVES.height - 4} textAnchor="middle" className="fill-slate-500 text-[11px] dark:fill-slate-400">
            every term across time, the fit in black
          </text>
        </svg>
      </div>

      <div className="mt-3 overflow-x-auto">
        <table className="w-full border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-200 text-left dark:border-slate-800">
              <th className="py-1 pr-3 font-semibold text-slate-600 dark:text-slate-400">term</th>
              <th className="py-1 pr-3 font-semibold text-slate-600 dark:text-slate-400">intercept</th>
              {fit?.term_contributions.map((term, index) => (
                <th key={term.name} className="py-1 pr-3 font-semibold" style={{ color: TERM_COLOURS[index] }}>{term.name}</th>
              ))}
              <th className="py-1 font-semibold text-emerald-700 dark:text-emerald-300">sum</th>
            </tr>
          </thead>
          <tbody className="font-mono text-slate-800 dark:text-slate-200">
            <tr>
              <td className="py-1 pr-3 font-sans text-slate-500 dark:text-slate-400">metres at t = {time.toFixed(2)}</td>
              <td className="py-1 pr-3">{fit ? formatMetres(fit.intercept) : "…"}</td>
              {contributions.map((each) => (
                <td key={each.name} className="py-1 pr-3">{formatMetres(each.value)}</td>
              ))}
              <td className="py-1 text-emerald-700 dark:text-emerald-300">{prediction === null ? "…" : formatMetres(prediction)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {message && (
        <p className="mt-3 text-sm text-amber-600 dark:text-amber-400">{message}</p>
      )}
    </div>
  );
}
