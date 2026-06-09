"use client";

// The identity, checked to the number on the thrown ball.
//
// Ridge regression solved feature by feature and kernel ridge solved row by
// row under the linear kernel are the same line, and this widget says so in
// figures rather than by overlaying two curves and asking the eye. The slope
// ridge reports, the slope the dual weights add up to through the centred
// times, the widest gap between the two sampled curves, both scores and both
// answers at two seconds, at whatever penalty is chosen. Both fits are the
// library's; the browser draws the one line twice.

import { useEffect, useState } from "react";
import { ApiError, KernelRidgeFit, fitKernelRidge } from "@/lib/concepts/kernel-ridge";
import { KERNEL_COLOUR, NOISY_THROW, RIDGE_COLOUR, boundsOf, formatScore, formatSmall, scalesOf } from "./kernelRidgeFixtures";

const FRAME = { width: 640, height: 240, left: 48, right: 18, top: 14, bottom: 34 };
const DEBOUNCE_MS = 140;
const QUERY = 2.0;

export function IdentityLedger() {
  const [logPenalty, setLogPenalty] = useState(0);
  const [answer, setAnswer] = useState<KernelRidgeFit | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const penalty = 10 ** logPenalty;

  useEffect(() => {
    const timer = setTimeout(async () => {
      try {
        setAnswer(await fitKernelRidge(NOISY_THROW, { name: "linear" }, penalty, QUERY));
        setMessage(null);
      } catch (error) {
        if (error instanceof ApiError) setMessage(error.message);
        else setMessage("Something went wrong.");
      }
    }, DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [penalty]);

  const bounds = boundsOf(NOISY_THROW, answer ? [answer.curve, answer.ridge_curve] : []);
  const { plotX, plotY, pathOf } = scalesOf(bounds, FRAME);

  return (
    <div className="my-4">
      <label className="flex items-center gap-3 pb-2 text-sm text-slate-600 dark:text-slate-300">
        penalty
        <input type="range" min={-3} max={3} step={0.25} value={logPenalty} onChange={(event) => setLogPenalty(Number(event.target.value))} className="w-40 accent-indigo-600" />
        <span className="w-16 font-mono text-sm">{formatSmall(penalty)}</span>
      </label>
      <svg viewBox={`0 0 ${FRAME.width} ${FRAME.height}`} className="w-full select-none rounded-lg bg-slate-50 dark:bg-slate-950">
        {answer && (
          <>
            <path d={pathOf(answer.ridge_curve)} fill="none" strokeWidth={7} stroke={RIDGE_COLOUR} />
            <path d={pathOf(answer.curve)} fill="none" strokeWidth={2} stroke={KERNEL_COLOUR} />
          </>
        )}
        {NOISY_THROW.map((point, index) => (
          <circle key={index} cx={plotX(point.x)} cy={plotY(point.y)} r={3.5} className="fill-slate-800 stroke-white dark:fill-slate-100 dark:stroke-slate-900" strokeWidth={1.5} />
        ))}
        <text x={FRAME.left} y={FRAME.height - 10} className="fill-slate-500 text-[10px] dark:fill-slate-400">grey, ridge solved by feature · indigo, the same solve by row, drawn on top</text>
      </svg>
      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
        <Stat label="ridge slope, per feature" value={answer ? answer.ridge_slope.toFixed(6) : "…"} />
        <Stat label="slope the dual weights add up to" value={answer && answer.implied_slope !== null ? answer.implied_slope.toFixed(6) : "…"} />
        <Stat label="widest gap over 81 samples" value={answer ? answer.largest_gap.toExponential(2) : "…"} />
        <Stat label="ridge R²" value={answer ? formatScore(answer.ridge_r_squared, 6) : "…"} />
        <Stat label="kernel R²" value={answer ? formatScore(answer.r_squared, 6) : "…"} />
        <Stat label="both at 2.0 s" value={answer ? `${answer.ridge_at_query.toFixed(4)}, ${answer.prediction_at_query.toFixed(4)}` : "…"} />
      </div>
      {message && <p className="mt-2 text-sm text-rose-600 dark:text-rose-400">{message}</p>}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-slate-100 px-2 py-1.5 dark:bg-slate-800">
      <div className="text-[11px] text-slate-500 dark:text-slate-400">{label}</div>
      <div className="font-mono text-sm font-semibold text-slate-900 dark:text-slate-100">{value}</div>
    </div>
  );
}
