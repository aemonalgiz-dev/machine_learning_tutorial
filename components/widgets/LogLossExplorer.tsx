"use client";

// What a probability costs when the outcome is known, and how the twelve
// students' costs combine.
//
// The top panel draws −ln(p) for a student who passed and −ln(1 − p) for
// one who failed, with a draggable p, so the reader can watch the cost
// climb without limit as the curve grows confident in the wrong outcome.
// The table below is the fitted curve scored student by student: the
// probability it gave to what actually happened, the product of those
// twelve numbers, which is the likelihood, its logarithm, and the log loss.
// A second, flatter curve sits beside it. It makes exactly the same twelve
// decisions and pays a higher loss, which is the difference between being
// right and being confidently right. All of the scoring is the API's.

import { useEffect, useState } from "react";
import { ApiError, LogisticEvaluation, Outcome, evaluateLogistic, fitLogistic } from "@/lib/api";

const WORKED_OUTCOMES: Outcome[] = [
  { x: 1, label: 0 },
  { x: 1.5, label: 0 },
  { x: 2, label: 0 },
  { x: 3, label: 0 },
  { x: 3.5, label: 0 },
  { x: 5, label: 0 },
  { x: 4, label: 1 },
  { x: 4.5, label: 1 },
  { x: 5.5, label: 1 },
  { x: 6, label: 1 },
  { x: 7, label: 1 },
  { x: 8, label: 1 },
];

const LEARNING_RATE = 0.5;
const CURVE = { width: 640, height: 240 };
const PAD = { left: 52, right: 16, top: 12, bottom: 36 };
const PLOT = { width: CURVE.width - PAD.left - PAD.right, height: CURVE.height - PAD.top - PAD.bottom };
const LOSS_TOP = 5;

function toX(probability: number) {
  return PAD.left + probability * PLOT.width;
}
function toY(loss: number) {
  return PAD.top + (1 - Math.min(LOSS_TOP, loss) / LOSS_TOP) * PLOT.height;
}

export function LogLossExplorer() {
  const [probability, setProbability] = useState(0.7);
  const [sharp, setSharp] = useState<LogisticEvaluation | null>(null);
  const [flat, setFlat] = useState<LogisticEvaluation | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const fit = await fitLogistic(WORKED_OUTCOMES, LEARNING_RATE);
        const [fittedScores, flatterScores] = await Promise.all([
          evaluateLogistic(WORKED_OUTCOMES, fit.slope, fit.intercept),
          evaluateLogistic(WORKED_OUTCOMES, fit.slope / 2, fit.intercept / 2),
        ]);
        setSharp(fittedScores);
        setFlat(flatterScores);
      } catch (error) {
        if (error instanceof ApiError) setMessage(error.message);
        else setMessage("Something went wrong.");
      }
    })();
  }, []);

  const passCurve = Array.from({ length: 99 }, (_, index) => {
    const p = 0.01 + (0.98 * index) / 98;
    return `${index === 0 ? "M" : "L"} ${toX(p).toFixed(1)} ${toY(-Math.log(p)).toFixed(1)}`;
  }).join(" ");
  const failCurve = Array.from({ length: 99 }, (_, index) => {
    const p = 0.01 + (0.98 * index) / 98;
    return `${index === 0 ? "M" : "L"} ${toX(p).toFixed(1)} ${toY(-Math.log(1 - p)).toFixed(1)}`;
  }).join(" ");

  return (
    <div>
      <label className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
        <span className="w-32">predicted p of passing</span>
        <input type="range" min={0.01} max={0.99} step={0.01} value={probability} onChange={(event) => setProbability(Number(event.target.value))} className="flex-1 accent-indigo-600" />
        <span className="w-12 text-right font-mono">{probability.toFixed(2)}</span>
      </label>
      <svg viewBox={`0 0 ${CURVE.width} ${CURVE.height}`} className="mt-3 w-full select-none rounded-lg bg-slate-50 dark:bg-slate-950">
        {[0, 1, 2, 3, 4, 5].map((tick) => (
          <g key={tick}>
            <line x1={PAD.left} y1={toY(tick)} x2={PAD.left + PLOT.width} y2={toY(tick)} stroke="currentColor" className="text-slate-200 dark:text-slate-800" />
            <text x={PAD.left - 8} y={toY(tick) + 4} textAnchor="end" className="fill-slate-400 text-[11px]">{tick}</text>
          </g>
        ))}
        <path d={passCurve} fill="none" stroke="#10b981" strokeWidth={2.5} />
        <path d={failCurve} fill="none" stroke="#ef4444" strokeWidth={2.5} />
        <line x1={toX(probability)} y1={PAD.top} x2={toX(probability)} y2={PAD.top + PLOT.height} stroke="#0f172a" strokeDasharray="4 3" className="dark:stroke-slate-300" />
        <circle cx={toX(probability)} cy={toY(-Math.log(probability))} r={6} fill="#10b981" stroke="white" strokeWidth={1.5} />
        <circle cx={toX(probability)} cy={toY(-Math.log(1 - probability))} r={6} fill="#ef4444" stroke="white" strokeWidth={1.5} />
        <text x={PAD.left + 6} y={PAD.top + 14} className="fill-emerald-700 text-[11px] font-medium dark:fill-emerald-300">if they passed, cost −ln(p)</text>
        <text x={PAD.left + 6} y={PAD.top + 28} className="fill-rose-700 text-[11px] font-medium dark:fill-rose-300">if they failed, cost −ln(1 − p)</text>
        {[0, 0.25, 0.5, 0.75, 1].map((tick) => (
          <text key={tick} x={toX(tick)} y={PAD.top + PLOT.height + 16} textAnchor="middle" className="fill-slate-400 text-[11px]">{tick}</text>
        ))}
        <text x={PAD.left + PLOT.width / 2} y={CURVE.height - 4} textAnchor="middle" className="fill-slate-500 text-[11px] font-medium dark:fill-slate-400">the probability the curve gave to passing</text>
      </svg>
      <div className="mt-2 grid grid-cols-2 gap-3">
        <Stat label="cost if the student passed" value={(-Math.log(probability)).toFixed(3)} />
        <Stat label="cost if the student failed" value={(-Math.log(1 - probability)).toFixed(3)} />
      </div>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-200 text-left dark:border-slate-800">
              <th className="py-1 pr-2 font-semibold text-slate-600 dark:text-slate-400">hours</th>
              <th className="py-1 pr-2 font-semibold text-slate-600 dark:text-slate-400">outcome</th>
              <th className="py-1 pr-2 font-semibold text-indigo-600 dark:text-indigo-300">fitted curve p</th>
              <th className="py-1 pr-2 font-semibold text-indigo-600 dark:text-indigo-300">assigned to what happened</th>
              <th className="py-1 pr-2 font-semibold text-indigo-600 dark:text-indigo-300">cost</th>
              <th className="py-1 pr-2 font-semibold text-amber-600 dark:text-amber-300">flatter curve p</th>
              <th className="py-1 pr-2 font-semibold text-amber-600 dark:text-amber-300">cost</th>
              <th className="py-1 font-semibold text-slate-600 dark:text-slate-400">same decision?</th>
            </tr>
          </thead>
          <tbody className="font-mono text-slate-800 dark:text-slate-200">
            {sharp && flat && sharp.outcomes.map((each, index) => (
              <tr key={index} className="border-b border-slate-100 last:border-0 dark:border-slate-800/60">
                <td className="py-1 pr-2">{each.x}</td>
                <td className="py-1 pr-2 font-sans">{each.label === 1 ? "pass" : "fail"}</td>
                <td className="py-1 pr-2">{each.probability.toFixed(3)}</td>
                <td className="py-1 pr-2">{each.assigned_probability.toFixed(3)}</td>
                <td className="py-1 pr-2">{each.loss_contribution.toFixed(3)}</td>
                <td className="py-1 pr-2">{flat.outcomes[index].probability.toFixed(3)}</td>
                <td className="py-1 pr-2">{flat.outcomes[index].loss_contribution.toFixed(3)}</td>
                <td className="py-1 font-sans">{each.predicted === flat.outcomes[index].predicted ? "yes" : "no"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="fitted curve: likelihood, the product" value={sharp ? sharp.likelihood.toExponential(3) : "…"} />
        <Stat label="fitted curve: log-likelihood" value={sharp ? sharp.log_likelihood.toFixed(4) : "…"} />
        <Stat label="fitted curve: log loss" value={sharp ? sharp.log_loss.toFixed(4) : "…"} />
        <Stat label="fitted curve: accuracy" value={sharp ? sharp.accuracy.toFixed(3) : "…"} />
        <Stat label="flatter curve: likelihood" value={flat ? flat.likelihood.toExponential(3) : "…"} />
        <Stat label="flatter curve: log-likelihood" value={flat ? flat.log_likelihood.toFixed(4) : "…"} />
        <Stat label="flatter curve: log loss" value={flat ? flat.log_loss.toFixed(4) : "…"} />
        <Stat label="flatter curve: accuracy" value={flat ? flat.accuracy.toFixed(3) : "…"} />
      </div>
      <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
        The flatter curve has half the fitted slope and half the fitted intercept, so it crosses one half at the same hours and makes the same twelve decisions.
      </p>
      {message && (
        <p className="mt-3 text-sm text-amber-600 dark:text-amber-400">{message}</p>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-slate-100 px-3 py-2 dark:bg-slate-800">
      <div className="text-[11px] text-slate-500 dark:text-slate-400">{label}</div>
      <div className="font-mono text-sm font-semibold text-slate-900 dark:text-slate-100">{value}</div>
    </div>
  );
}
