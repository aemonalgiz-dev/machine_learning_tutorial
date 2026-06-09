"use client";

// Sixty epochs of the same network, at five batch sizes.
//
// Each curve is one run of the loop, from weights drawn under the same seed
// and visiting the rows in the same shuffled order, differing only in how many
// rows one step is taken from. The loss is measured on all sixty people once
// per epoch whatever the run stepped on, so the curves are comparable. The
// bars underneath are a separate measurement at the untrained start: the
// cosine between a drawn batch's direction and the whole crowd's, averaged
// over two hundred draws, with the worst single draw marked. The API runs
// every one of these; the browser draws them.

import { useEffect, useState } from "react";
import {
  BatchSweep,
  failureMessage,
  fetchBatchSweep,
} from "@/lib/concepts/training-a-network";

const CHART = { width: 640, height: 260 };
const PAD = { left: 58, right: 84, top: 16, bottom: 36 };
const PLOT = {
  width: CHART.width - PAD.left - PAD.right,
  height: CHART.height - PAD.top - PAD.bottom,
};

const AGREE = { width: 640, height: 190 };
const AGREE_PAD = { left: 58, right: 20, top: 16, bottom: 40 };
const AGREE_PLOT = {
  width: AGREE.width - AGREE_PAD.left - AGREE_PAD.right,
  height: AGREE.height - AGREE_PAD.top - AGREE_PAD.bottom,
};

const COLOURS = ["#ef4444", "#f59e0b", "#22c55e", "#0ea5e9", "#6366f1"];

export function BatchSizeComparison({
  showAgreement = true,
}: {
  showAgreement?: boolean;
}) {
  const [sweep, setSweep] = useState<BatchSweep | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setSweep(await fetchBatchSweep());
      } catch (error) {
        setMessage(failureMessage(error));
      }
    })();
  }, []);

  if (!sweep) {
    return (
      <p className="text-sm text-slate-500 dark:text-slate-400">
        {message ?? "… running five thousand steps, which takes a second or two"}
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
    PAD.left + (epoch / (sweep.max_epochs - 1)) * PLOT.width;

  const ticks: number[] = [];
  for (let power = Math.ceil(lowest); power <= Math.floor(highest); power += 1) {
    ticks.push(power);
  }

  const agreeX = (index: number) =>
    AGREE_PAD.left +
    ((index + 0.5) / sweep.agreement.length) * AGREE_PLOT.width;
  const agreeY = (cosine: number) =>
    AGREE_PAD.top + (1 - (cosine + 1) / 2) * AGREE_PLOT.height;
  const barWidth = (AGREE_PLOT.width / sweep.agreement.length) * 0.5;

  return (
    <div>
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
        {[0, 15, 30, 45, 59].map((epoch) => (
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
          const path = row.losses
            .map((loss, position) =>
              loss === null || loss <= 0
                ? ""
                : `${position === 0 ? "M" : "L"}${toX(position).toFixed(1)},${toY(loss).toFixed(1)}`,
            )
            .join(" ")
            .trim();
          const last = row.losses[row.losses.length - 1];
          return (
            <g key={row.batch_size}>
              <path
                d={path}
                fill="none"
                stroke={COLOURS[index % COLOURS.length]}
                strokeWidth={1.9}
              />
              {last !== null && last > 0 && (
                <text
                  x={PAD.left + PLOT.width + 6}
                  y={toY(last) + 3}
                  className="text-[10px]"
                  fill={COLOURS[index % COLOURS.length]}
                >
                  {row.batch_size} at a time
                </text>
              )}
            </g>
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
          loss on all {sweep.n_rows}
        </text>
      </svg>

      <div className="mt-3 overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left dark:border-slate-800">
              <th className="py-2 pr-4 font-semibold text-slate-600 dark:text-slate-400">
                rows per step
              </th>
              <th className="py-2 pr-4 text-right font-semibold text-slate-600 dark:text-slate-400">
                steps in an epoch
              </th>
              <th className="py-2 pr-4 text-right font-semibold text-slate-600 dark:text-slate-400">
                steps in all
              </th>
              <th className="py-2 pr-4 text-right font-semibold text-slate-600 dark:text-slate-400">
                loss after {sweep.max_epochs}
              </th>
              <th className="py-2 pr-4 text-right font-semibold text-slate-600 dark:text-slate-400">
                accuracy
              </th>
              <th className="py-2 text-right font-semibold text-slate-600 dark:text-slate-400">
                milliseconds a step
              </th>
            </tr>
          </thead>
          <tbody>
            {sweep.rows.map((row, index) => (
              <tr
                key={row.batch_size}
                className="border-b border-slate-100 last:border-0 dark:border-slate-800/60"
              >
                <td
                  className="py-2 pr-4 font-mono font-semibold"
                  style={{ color: COLOURS[index % COLOURS.length] }}
                >
                  {row.batch_size}
                </td>
                <td className="py-2 pr-4 text-right font-mono text-slate-600 dark:text-slate-400">
                  {row.steps_per_epoch}
                </td>
                <td className="py-2 pr-4 text-right font-mono text-slate-600 dark:text-slate-400">
                  {row.total_steps}
                </td>
                <td className="py-2 pr-4 text-right font-mono text-slate-800 dark:text-slate-200">
                  {row.final_loss === null
                    ? "not a number"
                    : row.final_loss.toFixed(5)}
                </td>
                <td className="py-2 pr-4 text-right font-mono text-slate-800 dark:text-slate-200">
                  {row.final_accuracy === null
                    ? "unavailable"
                    : row.final_accuracy.toFixed(3)}
                </td>
                <td className="py-2 text-right font-mono text-slate-600 dark:text-slate-400">
                  {row.milliseconds_per_step.toFixed(3)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showAgreement && (
        <>
          <p className="mt-4 text-xs text-slate-500 dark:text-slate-400">
            How closely a drawn batch points where the whole crowd points, at
            the untrained start. The bar is the mean over{" "}
            {sweep.agreement[0]?.n_draws} draws and the mark below it is the
            worst single draw.
          </p>
          <svg
            viewBox={`0 0 ${AGREE.width} ${AGREE.height}`}
            className="mt-1 w-full select-none rounded-lg bg-slate-50 dark:bg-slate-950"
          >
            {[-1, -0.5, 0, 0.5, 1].map((tick) => (
              <g key={tick}>
                <line
                  x1={AGREE_PAD.left}
                  x2={AGREE_PAD.left + AGREE_PLOT.width}
                  y1={agreeY(tick)}
                  y2={agreeY(tick)}
                  className={
                    tick === 0
                      ? "stroke-slate-400 dark:stroke-slate-600"
                      : "stroke-slate-200 dark:stroke-slate-800"
                  }
                  strokeWidth={1}
                />
                <text
                  x={AGREE_PAD.left - 8}
                  y={agreeY(tick) + 4}
                  textAnchor="end"
                  className="fill-slate-500 text-[10px] dark:fill-slate-400"
                >
                  {tick.toFixed(1)}
                </text>
              </g>
            ))}
            {sweep.agreement.map((row, index) => (
              <g key={row.batch_size}>
                <rect
                  x={agreeX(index) - barWidth / 2}
                  y={Math.min(agreeY(row.mean_cosine), agreeY(0))}
                  width={barWidth}
                  height={Math.abs(agreeY(row.mean_cosine) - agreeY(0))}
                  fill={COLOURS[index % COLOURS.length]}
                  opacity={0.75}
                />
                <line
                  x1={agreeX(index) - barWidth / 2}
                  x2={agreeX(index) + barWidth / 2}
                  y1={agreeY(row.worst_cosine)}
                  y2={agreeY(row.worst_cosine)}
                  className="stroke-slate-700 dark:stroke-slate-200"
                  strokeWidth={2}
                />
                <text
                  x={agreeX(index)}
                  y={agreeY(Math.max(row.mean_cosine, 0)) - 6}
                  textAnchor="middle"
                  className="fill-slate-600 text-[10px] dark:fill-slate-300"
                >
                  {row.mean_cosine.toFixed(3)}
                </text>
                <text
                  x={agreeX(index)}
                  y={AGREE.height - AGREE_PAD.bottom + 16}
                  textAnchor="middle"
                  className="fill-slate-500 text-[10px] dark:fill-slate-400"
                >
                  {row.batch_size}
                </text>
              </g>
            ))}
            <text
              x={AGREE_PAD.left + AGREE_PLOT.width / 2}
              y={AGREE.height - 6}
              textAnchor="middle"
              className="fill-slate-500 text-[11px] dark:fill-slate-400"
            >
              rows in the batch
            </text>
          </svg>
        </>
      )}

      {message && (
        <p className="mt-3 text-sm text-rose-600 dark:text-rose-400">
          {message}
        </p>
      )}
    </div>
  );
}
