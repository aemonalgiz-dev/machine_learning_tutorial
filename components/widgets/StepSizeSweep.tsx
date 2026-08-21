"use client";

// The same chain, the same starting weights, eight step sizes.
//
// Every curve is one run of the loop, walked by the API from weights drawn
// under the same seed, so the only thing that differs between them is how far
// each step moved. The loss is on a logarithmic scale because the range these
// runs cover is far too wide for a straight one, and a curve that stops
// short is a run whose numbers stopped being numbers, with the epoch that
// happened at printed beside it. The objective can be switched, and it
// matters: log-loss on this chain never produces a number that is not a
// number however large the step, and squared error does.

import { useEffect, useState } from "react";
import {
  Objective,
  RateSweep,
  failureMessage,
  fetchRateSweep,
} from "@/lib/concepts/training-a-network";

const CHART = { width: 640, height: 300 };
const PAD = { left: 56, right: 116, top: 16, bottom: 38 };
const PLOT = {
  width: CHART.width - PAD.left - PAD.right,
  height: CHART.height - PAD.top - PAD.bottom,
};

const COLOURS = [
  "#94a3b8",
  "#64748b",
  "#0ea5e9",
  "#6366f1",
  "#22c55e",
  "#14b8a6",
  "#f59e0b",
  "#ef4444",
];

const OBJECTIVE_TITLES: Record<Objective, string> = {
  log_loss: "log-loss",
  squared_error: "squared error",
};

const BUTTON =
  "rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700";

const ACTIVE =
  "rounded-md border border-indigo-400 bg-indigo-50 px-3 py-1.5 text-sm font-medium text-indigo-700 dark:border-indigo-600 dark:bg-indigo-950 dark:text-indigo-300";

export function StepSizeSweep() {
  const [objective, setObjective] = useState<Objective>("log_loss");
  const [sweeps, setSweeps] = useState<Partial<Record<Objective, RateSweep>>>(
    {},
  );
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const answer = await fetchRateSweep(objective);
        setSweeps((held) => ({ ...held, [objective]: answer }));
      } catch (error) {
        setMessage(failureMessage(error));
      }
    })();
  }, [objective]);

  const sweep = sweeps[objective];
  if (!sweep) {
    return (
      <p className="text-sm text-slate-500 dark:text-slate-400">
        {message ?? "… walking eight runs of two hundred epochs"}
      </p>
    );
  }

  const finite = sweep.rows.flatMap((row) =>
    row.losses.filter((value): value is number => value !== null && value > 0),
  );
  const highest = Math.log10(Math.max(...finite));
  const lowest = Math.log10(Math.min(...finite));
  const span = Math.max(highest - lowest, 0.5);

  const toY = (loss: number) =>
    PAD.top + (1 - (Math.log10(loss) - lowest) / span) * PLOT.height;
  const toX = (epoch: number) =>
    PAD.left + ((epoch - 1) / (sweep.max_epochs - 1)) * PLOT.width;

  const ticks: number[] = [];
  for (
    let power = Math.ceil(lowest);
    power <= Math.floor(highest);
    power += Math.max(1, Math.round(span / 6))
  ) {
    ticks.push(power);
  }

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 pb-3">
        {(Object.keys(OBJECTIVE_TITLES) as Objective[]).map((name) => (
          <button
            key={name}
            onClick={() => setObjective(name)}
            className={name === objective ? ACTIVE : BUTTON}
          >
            {OBJECTIVE_TITLES[name]}
          </button>
        ))}
        <span className="ml-auto text-xs text-slate-500 dark:text-slate-400">
          one start, {sweep.max_epochs} epochs, loss on the whole crowd
        </span>
      </div>

      <svg
        viewBox={`0 0 ${CHART.width} ${CHART.height}`}
        className="w-full select-none rounded-lg bg-slate-50 dark:bg-slate-950"
      >
        {ticks.map((power) => (
          <g key={power}>
            <line
              x1={PAD.left}
              x2={PAD.left + PLOT.width}
              y1={toY(10 ** power)}
              y2={toY(10 ** power)}
              className="stroke-slate-200 dark:stroke-slate-800"
              strokeWidth={1}
            />
            <text
              x={PAD.left - 8}
              y={toY(10 ** power) + 4}
              textAnchor="end"
              className="fill-slate-500 text-[10px] dark:fill-slate-400"
            >
              {power === 0 ? "1" : `1e${power}`}
            </text>
          </g>
        ))}
        {[1, 50, 100, 150, 200]
          .filter((epoch) => epoch <= sweep.max_epochs)
          .map((epoch) => (
            <text
              key={epoch}
              x={toX(epoch)}
              y={CHART.height - PAD.bottom + 16}
              textAnchor="middle"
              className="fill-slate-500 text-[10px] dark:fill-slate-400"
            >
              {epoch}
            </text>
          ))}
        {sweep.rows.map((row, index) => {
          let started = false;
          const path = row.losses
            .map((loss, position) => {
              if (loss === null || loss <= 0) {
                started = false;
                return "";
              }
              const command = started ? "L" : "M";
              started = true;
              return `${command}${toX(position + 1).toFixed(1)},${toY(loss).toFixed(1)}`;
            })
            .join(" ")
            .trim();
          return (
            <path
              key={row.learning_rate}
              d={path}
              fill="none"
              stroke={COLOURS[index % COLOURS.length]}
              strokeWidth={1.8}
            />
          );
        })}
        {sweep.rows.map((row, index) => {
          const last = [...row.losses]
            .map((loss, position) => ({ loss, position }))
            .reverse()
            .find((entry) => entry.loss !== null && entry.loss > 0);
          if (!last || last.loss === null) return null;
          return (
            <text
              key={row.learning_rate}
              x={PAD.left + PLOT.width + 6}
              y={toY(last.loss) + 3}
              className="text-[10px]"
              fill={COLOURS[index % COLOURS.length]}
            >
              {row.learning_rate}
              {row.first_non_finite_epoch !== null
                ? ` stops at ${row.first_non_finite_epoch}`
                : ""}
            </text>
          );
        })}
        <text
          x={PAD.left + PLOT.width / 2}
          y={CHART.height - 4}
          textAnchor="middle"
          className="fill-slate-500 text-[11px] dark:fill-slate-400"
        >
          epochs
        </text>
        <text
          x={13}
          y={PAD.top + PLOT.height / 2}
          textAnchor="middle"
          transform={`rotate(-90 13 ${PAD.top + PLOT.height / 2})`}
          className="fill-slate-500 text-[11px] dark:fill-slate-400"
        >
          loss
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
                loss at the end
              </th>
              <th className="py-2 pr-4 text-right font-semibold text-slate-600 dark:text-slate-400">
                lowest it reached
              </th>
              <th className="py-2 pr-4 text-right font-semibold text-slate-600 dark:text-slate-400">
                accuracy
              </th>
              <th className="py-2 font-semibold text-slate-600 dark:text-slate-400">
                what happened
              </th>
            </tr>
          </thead>
          <tbody>
            {sweep.rows.map((row, index) => (
              <tr
                key={row.learning_rate}
                className="border-b border-slate-100 last:border-0 dark:border-slate-800/60"
              >
                <td
                  className="py-2 pr-4 font-mono font-semibold"
                  style={{ color: COLOURS[index % COLOURS.length] }}
                >
                  {row.learning_rate}
                </td>
                <td className="py-2 pr-4 text-right font-mono text-slate-800 dark:text-slate-200">
                  {row.final_loss === null
                    ? "not a number"
                    : row.final_loss.toPrecision(4)}
                </td>
                <td className="py-2 pr-4 text-right font-mono text-slate-600 dark:text-slate-400">
                  {row.best_loss === null
                    ? "none"
                    : `${row.best_loss.toPrecision(4)} at ${row.best_epoch}`}
                </td>
                <td className="py-2 pr-4 text-right font-mono text-slate-600 dark:text-slate-400">
                  {row.final_accuracy === null
                    ? "unavailable"
                    : row.final_accuracy.toFixed(3)}
                </td>
                <td className="py-2 text-slate-600 dark:text-slate-400">
                  {row.first_non_finite_epoch === null
                    ? "walked all the way"
                    : `loss not a number at epoch ${row.first_non_finite_epoch}, weights at epoch ${row.refused_at_epoch}`}
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
