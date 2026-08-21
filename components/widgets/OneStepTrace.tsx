"use client";

// One step of learning, opened up.
//
// The API takes a single step from the untrained chain and reports everything
// it changed: three of the twenty-five numbers with the slope each was handed
// and where it landed, the length of the whole slope, and the distance the
// step covered. Underneath is the same slope spent at eight different step
// sizes, with what the slope alone predicted the loss would fall by beside
// what it actually fell by. The library computes every figure; the browser
// lays them out and draws the bars.

import { useEffect, useState } from "react";
import {
  OneStep,
  failureMessage,
  fetchOneStep,
} from "@/lib/concepts/training-a-network";

const BAR = { width: 620, height: 210 };
const PAD = { left: 62, right: 18, top: 16, bottom: 34 };
const PLOT = {
  width: BAR.width - PAD.left - PAD.right,
  height: BAR.height - PAD.top - PAD.bottom,
};

export function OneStepTrace() {
  const [step, setStep] = useState<OneStep | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setStep(await fetchOneStep(0.5));
      } catch (error) {
        setMessage(failureMessage(error));
      }
    })();
  }, []);

  if (!step) {
    return (
      <p className="text-sm text-slate-500 dark:text-slate-400">
        {message ?? "… taking one step"}
      </p>
    );
  }

  const ladder = step.first_order;
  const positions = ladder.map(
    (_, index) => PAD.left + ((index + 0.5) / ladder.length) * PLOT.width,
  );
  const barWidth = (PLOT.width / ladder.length) * 0.62;

  return (
    <div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Stat label="Loss before" value={step.loss_before.toFixed(6)} />
        <Stat
          label="Loss after"
          value={step.loss_after === null ? "…" : step.loss_after.toFixed(6)}
        />
        <Stat
          label="Length of the slope"
          value={step.gradient_norm.toFixed(6)}
        />
        <Stat
          label={`Distance moved at ${step.learning_rate}`}
          value={step.distance_moved.toFixed(6)}
        />
      </div>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left dark:border-slate-800">
              <th className="py-2 pr-4 font-semibold text-slate-600 dark:text-slate-400">
                one of the twenty-five numbers
              </th>
              <th className="py-2 pr-4 text-right font-semibold text-slate-600 dark:text-slate-400">
                before
              </th>
              <th className="py-2 pr-4 text-right font-semibold text-slate-600 dark:text-slate-400">
                its slope
              </th>
              <th className="py-2 text-right font-semibold text-slate-600 dark:text-slate-400">
                after
              </th>
            </tr>
          </thead>
          <tbody>
            {step.traced.map((parameter) => (
              <tr
                key={parameter.description}
                className="border-b border-slate-100 last:border-0 dark:border-slate-800/60"
              >
                <td className="py-2 pr-4 text-slate-600 dark:text-slate-400">
                  {parameter.description}
                </td>
                <td className="py-2 pr-4 text-right font-mono text-slate-800 dark:text-slate-200">
                  {parameter.before.toFixed(6)}
                </td>
                <td className="py-2 pr-4 text-right font-mono text-slate-800 dark:text-slate-200">
                  {parameter.slope.toFixed(6)}
                </td>
                <td className="py-2 text-right font-mono font-semibold text-indigo-700 dark:text-indigo-300">
                  {parameter.after.toFixed(6)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
        The same slope, spent at eight step sizes. The pale bar is what the
        slope alone said the loss would fall by and the solid bar is what it
        did fall by.
      </p>

      <svg
        viewBox={`0 0 ${BAR.width} ${BAR.height}`}
        className="mt-1 w-full select-none rounded-lg bg-slate-50 dark:bg-slate-950"
      >
        {[0, 0.25, 0.5, 0.75, 1].map((share) => {
          const y = PAD.top + (1 - share) * PLOT.height;
          return (
            <g key={share}>
              <line
                x1={PAD.left}
                x2={PAD.left + PLOT.width}
                y1={y}
                y2={y}
                className="stroke-slate-200 dark:stroke-slate-800"
                strokeWidth={1}
              />
              <text
                x={PAD.left - 8}
                y={y + 4}
                textAnchor="end"
                className="fill-slate-500 text-[10px] dark:fill-slate-400"
              >
                {share.toFixed(2)}
              </text>
            </g>
          );
        })}
        {ladder.map((row, index) => {
          const ratio = row.ratio ?? 0;
          const height = Math.max(0, Math.min(1, ratio)) * PLOT.height;
          return (
            <g key={row.learning_rate}>
              <rect
                x={positions[index] - barWidth / 2}
                y={PAD.top}
                width={barWidth}
                height={PLOT.height}
                className="fill-slate-300/50 dark:fill-slate-700/50"
              />
              <rect
                x={positions[index] - barWidth / 2}
                y={PAD.top + PLOT.height - height}
                width={barWidth}
                height={height}
                className="fill-indigo-500 dark:fill-indigo-400"
              />
              <text
                x={positions[index]}
                y={PAD.top + PLOT.height - height - 5}
                textAnchor="middle"
                className="fill-slate-600 text-[10px] dark:fill-slate-300"
              >
                {ratio.toFixed(2)}
              </text>
              <text
                x={positions[index]}
                y={BAR.height - PAD.bottom + 16}
                textAnchor="middle"
                className="fill-slate-500 text-[10px] dark:fill-slate-400"
              >
                {row.learning_rate}
              </text>
            </g>
          );
        })}
        <text
          x={PAD.left + PLOT.width / 2}
          y={BAR.height - 4}
          textAnchor="middle"
          className="fill-slate-500 text-[11px] dark:fill-slate-400"
        >
          step size
        </text>
        <text
          x={13}
          y={PAD.top + PLOT.height / 2}
          textAnchor="middle"
          transform={`rotate(-90 13 ${PAD.top + PLOT.height / 2})`}
          className="fill-slate-500 text-[11px] dark:fill-slate-400"
        >
          actual ÷ predicted
        </text>
      </svg>

      <div className="mt-3 overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left dark:border-slate-800">
              <th className="py-2 pr-4 font-semibold text-slate-600 dark:text-slate-400">
                step size
              </th>
              <th className="py-2 pr-4 text-right font-semibold text-slate-600 dark:text-slate-400">
                predicted drop
              </th>
              <th className="py-2 pr-4 text-right font-semibold text-slate-600 dark:text-slate-400">
                actual drop
              </th>
              <th className="py-2 text-right font-semibold text-slate-600 dark:text-slate-400">
                loss reached
              </th>
            </tr>
          </thead>
          <tbody>
            {ladder.map((row) => (
              <tr
                key={row.learning_rate}
                className="border-b border-slate-100 last:border-0 dark:border-slate-800/60"
              >
                <td className="py-2 pr-4 font-mono text-slate-800 dark:text-slate-200">
                  {row.learning_rate}
                </td>
                <td className="py-2 pr-4 text-right font-mono text-slate-600 dark:text-slate-400">
                  {row.predicted_drop.toFixed(6)}
                </td>
                <td className="py-2 pr-4 text-right font-mono text-slate-800 dark:text-slate-200">
                  {row.actual_drop === null ? "not finite" : row.actual_drop.toFixed(6)}
                </td>
                <td className="py-2 text-right font-mono text-slate-800 dark:text-slate-200">
                  {row.loss_after === null ? "not finite" : row.loss_after.toFixed(6)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {message && (
        <p className="mt-3 text-sm text-rose-600 dark:text-rose-400">
          {message}
        </p>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-slate-100 px-3 py-2 dark:bg-slate-800">
      <div className="text-xs text-slate-500 dark:text-slate-400">{label}</div>
      <div className="font-mono text-sm font-semibold text-slate-900 dark:text-slate-100">
        {value}
      </div>
    </div>
  );
}
