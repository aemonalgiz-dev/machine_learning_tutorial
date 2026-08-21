"use client";

// What a dual weight is, read row by row.
//
// The fit's optimality condition says each row's dual weight is its residual
// divided by the penalty, under any kernel. This ledger lists every throw
// with its fitted height, its residual, that residual over the penalty, and
// the dual weight the solve actually produced, and the bars draw the weights
// against time with the residuals behind them. Drag the penalty and the
// weights scale as one over the penalty while, under the linear kernel, the
// line barely moves. Every column is the library's; the browser only lays
// them side by side.

import { useEffect, useState } from "react";
import { ApiError, KernelChoice, KernelRidgeFit, fitKernelRidge } from "@/lib/concepts/kernel-ridge";
import { ACTIVE_CLASS, BUTTON_CLASS, KERNEL_COLOUR, NOISY_THROW, SECOND_COLOUR, formatScore, formatSmall } from "./kernelRidgeFixtures";

const FRAME = { width: 640, height: 200, left: 48, right: 18, top: 14, bottom: 30 };
const DEBOUNCE_MS = 140;

const KERNELS: { label: string; kernel: KernelChoice }[] = [
  { label: "Linear", kernel: { name: "linear" } },
  { label: "Radial basis, gamma 1", kernel: { name: "rbf", gamma: 1 } },
];

export function DualWeightLedger() {
  const [which, setWhich] = useState(0);
  const [logPenalty, setLogPenalty] = useState(0);
  const [answer, setAnswer] = useState<KernelRidgeFit | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const penalty = 10 ** logPenalty;

  useEffect(() => {
    const timer = setTimeout(async () => {
      try {
        setAnswer(await fitKernelRidge(NOISY_THROW, KERNELS[which].kernel, penalty, 2.0));
        setMessage(null);
      } catch (error) {
        if (error instanceof ApiError) setMessage(error.message);
        else setMessage("Something went wrong.");
      }
    }, DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [which, penalty]);

  const plotWidth = FRAME.width - FRAME.left - FRAME.right;
  const plotHeight = FRAME.height - FRAME.top - FRAME.bottom;
  const reach = answer ? Math.max(...answer.dual_weights.map(Math.abs), ...answer.residuals.map(Math.abs), 1e-9) : 1;
  const plotX = (index: number) => FRAME.left + ((index + 0.5) / NOISY_THROW.length) * plotWidth;
  const plotY = (value: number) => FRAME.top + (1 - (value + reach) / (2 * reach)) * plotHeight;
  const barWidth = (plotWidth / NOISY_THROW.length) * 0.7;

  return (
    <div className="my-4">
      <div className="flex flex-wrap items-center gap-4 pb-2 text-sm text-slate-600 dark:text-slate-300">
        <span className="flex gap-2">
          {KERNELS.map((each, index) => (
            <button key={each.label} onClick={() => setWhich(index)} className={index === which ? ACTIVE_CLASS : BUTTON_CLASS}>{each.label}</button>
          ))}
        </span>
        <label className="flex items-center gap-2">
          penalty
          <input type="range" min={-3} max={2} step={0.25} value={logPenalty} onChange={(event) => setLogPenalty(Number(event.target.value))} className="w-32 accent-indigo-600" />
          <span className="w-16 font-mono text-sm">{formatSmall(penalty)}</span>
        </label>
      </div>

      <svg viewBox={`0 0 ${FRAME.width} ${FRAME.height}`} className="w-full select-none rounded-lg bg-slate-50 dark:bg-slate-950">
        <line x1={FRAME.left} x2={FRAME.left + plotWidth} y1={plotY(0)} y2={plotY(0)} className="stroke-slate-300 dark:stroke-slate-700" strokeWidth={1} />
        {answer &&
          answer.dual_weights.map((weight, index) => (
            <g key={index}>
              <rect x={plotX(index) - barWidth / 2} y={Math.min(plotY(0), plotY(answer.residuals[index]))} width={barWidth} height={Math.abs(plotY(answer.residuals[index]) - plotY(0))} fill={SECOND_COLOUR} opacity={0.35} />
              <rect x={plotX(index) - barWidth / 4} y={Math.min(plotY(0), plotY(weight))} width={barWidth / 2} height={Math.abs(plotY(weight) - plotY(0))} fill={KERNEL_COLOUR} />
            </g>
          ))}
        {NOISY_THROW.map((point, index) => (
          <text key={index} x={plotX(index)} y={FRAME.height - 12} textAnchor="middle" className="fill-slate-500 text-[9px] dark:fill-slate-400">{point.x.toFixed(1)}</text>
        ))}
        <text x={FRAME.left} y={FRAME.top + 10} className="fill-slate-500 text-[10px] dark:fill-slate-400">indigo, the dual weight · green, the residual behind it · scale ±{reach.toFixed(2)}</text>
      </svg>

      {answer && (
        <div className="mt-3 overflow-x-auto">
          <table className="w-full border-collapse font-mono text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-left text-slate-500 dark:border-slate-800 dark:text-slate-400">
                <th className="py-1 pr-3 font-medium">time</th>
                <th className="py-1 pr-3 font-medium">height</th>
                <th className="py-1 pr-3 font-medium">fitted</th>
                <th className="py-1 pr-3 font-medium">residual</th>
                <th className="py-1 pr-3 font-medium">residual / penalty</th>
                <th className="py-1 font-medium">dual weight</th>
              </tr>
            </thead>
            <tbody>
              {NOISY_THROW.map((point, index) => (
                <tr key={index} className="border-b border-slate-100 text-slate-800 dark:border-slate-800/60 dark:text-slate-200">
                  <td className="py-0.5 pr-3">{point.x.toFixed(2)}</td>
                  <td className="py-0.5 pr-3">{point.y.toFixed(1)}</td>
                  <td className="py-0.5 pr-3">{answer.fitted[index].toFixed(3)}</td>
                  <td className="py-0.5 pr-3">{answer.residuals[index].toFixed(3)}</td>
                  <td className="py-0.5 pr-3">{answer.residuals_over_penalty[index].toFixed(3)}</td>
                  <td className="py-0.5">{answer.dual_weights[index].toFixed(3)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Stat label="widest gap between the last two columns" value={answer ? answer.dual_residual_gap.toExponential(2) : "…"} />
        <Stat label="largest dual weight, in size" value={answer ? answer.max_abs_dual_weight.toFixed(3) : "…"} />
        <Stat label="R²" value={answer ? formatScore(answer.r_squared, 4) : "…"} />
        <Stat label="rows the model keeps" value={answer ? String(answer.n_training_rows) : "…"} />
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
