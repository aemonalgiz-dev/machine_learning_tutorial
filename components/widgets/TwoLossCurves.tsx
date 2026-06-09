"use client";

// The loss a training loop can see, and the one it cannot.
//
// Fourteen of the sixty people are trained on and the other forty-six are held
// back. The API measures both losses after every epoch of the same run, so the
// solid line is what a loop watching its own progress would see and the dashed
// line is what it has no access to. The vertical mark is the epoch at which
// the held-out loss was lowest, which is where the walk should have stopped.
// The toggle flips three of the fourteen training labels, which is what turns
// a curve that flattens into one that climbs.

import { useEffect, useState } from "react";
import {
  Generalisation,
  failureMessage,
  fetchGeneralisation,
} from "@/lib/concepts/training-a-network";

const CHART = { width: 640, height: 250 };
const PAD = { left: 54, right: 18, top: 16, bottom: 34 };
const PLOT = {
  width: CHART.width - PAD.left - PAD.right,
  height: CHART.height - PAD.top - PAD.bottom,
};

const ACCURACY = { width: 640, height: 190 };
const ACCURACY_PLOT = {
  width: ACCURACY.width - PAD.left - PAD.right,
  height: ACCURACY.height - PAD.top - PAD.bottom,
};

const TRAINING_COLOUR = "#6366f1";
const HELD_OUT_COLOUR = "#f59e0b";

const BUTTON =
  "rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700";

const ACTIVE =
  "rounded-md border border-indigo-400 bg-indigo-50 px-3 py-1.5 text-sm font-medium text-indigo-700 dark:border-indigo-600 dark:bg-indigo-950 dark:text-indigo-300";

export function TwoLossCurves({
  showAccuracy = true,
}: {
  showAccuracy?: boolean;
}) {
  const [mislabelled, setMislabelled] = useState(3);
  const [held, setHeld] = useState<Record<number, Generalisation>>({});
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const answer = await fetchGeneralisation(mislabelled);
        setHeld((current) => ({ ...current, [mislabelled]: answer }));
      } catch (error) {
        setMessage(failureMessage(error));
      }
    })();
  }, [mislabelled]);

  const run = held[mislabelled];
  if (!run) {
    return (
      <p className="text-sm text-slate-500 dark:text-slate-400">
        {message ?? "… running six hundred epochs and scoring both sets at each"}
      </p>
    );
  }

  const epochs = run.readings[run.readings.length - 1].epoch;
  const losses = run.readings.flatMap((reading) =>
    [reading.training_loss, reading.held_out_loss].filter(
      (value): value is number => value !== null,
    ),
  );
  const highest = Math.max(...losses);

  const toX = (epoch: number, width: number) =>
    PAD.left + (epoch / epochs) * width;
  const toY = (loss: number) => PAD.top + (1 - loss / highest) * PLOT.height;
  const toAccuracyY = (accuracy: number) =>
    PAD.top + (1 - accuracy) * ACCURACY_PLOT.height;

  const pathOf = (
    pick: (reading: Generalisation["readings"][number]) => number | null,
    toValueY: (value: number) => number,
    width: number,
  ) =>
    run.readings
      .map((reading, index) => {
        const value = pick(reading);
        if (value === null) return "";
        return `${index === 0 ? "M" : "L"}${toX(reading.epoch, width).toFixed(1)},${toValueY(value).toFixed(1)}`;
      })
      .join(" ")
      .trim();

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 pb-3">
        {[0, 3].map((count) => (
          <button
            key={count}
            onClick={() => setMislabelled(count)}
            className={count === mislabelled ? ACTIVE : BUTTON}
          >
            {count === 0
              ? "labels as drawn"
              : "three of the fourteen labels flipped"}
          </button>
        ))}
        <span className="ml-auto text-xs text-slate-500 dark:text-slate-400">
          {run.n_training} trained on, {run.n_held_out} held back,{" "}
          {run.n_parameters} numbers in the chain
        </span>
      </div>

      <svg
        viewBox={`0 0 ${CHART.width} ${CHART.height}`}
        className="w-full select-none rounded-lg bg-slate-50 dark:bg-slate-950"
      >
        {[0, 0.5, 1].map((share) => (
          <g key={share}>
            <line
              x1={PAD.left}
              x2={PAD.left + PLOT.width}
              y1={toY(share * highest)}
              y2={toY(share * highest)}
              className="stroke-slate-200 dark:stroke-slate-800"
              strokeWidth={1}
            />
            <text
              x={PAD.left - 8}
              y={toY(share * highest) + 4}
              textAnchor="end"
              className="fill-slate-500 text-[10px] dark:fill-slate-400"
            >
              {(share * highest).toFixed(2)}
            </text>
          </g>
        ))}
        <line
          x1={toX(run.best_held_out_loss_epoch, PLOT.width)}
          x2={toX(run.best_held_out_loss_epoch, PLOT.width)}
          y1={PAD.top}
          y2={PAD.top + PLOT.height}
          className="stroke-slate-500"
          strokeDasharray="3 3"
          strokeWidth={1.4}
        />
        <text
          x={toX(run.best_held_out_loss_epoch, PLOT.width) + 5}
          y={PAD.top + 12}
          className="fill-slate-500 text-[10px] dark:fill-slate-400"
        >
          epoch {run.best_held_out_loss_epoch}
        </text>
        <path
          d={pathOf((reading) => reading.training_loss, toY, PLOT.width)}
          fill="none"
          stroke={TRAINING_COLOUR}
          strokeWidth={2}
        />
        <path
          d={pathOf((reading) => reading.held_out_loss, toY, PLOT.width)}
          fill="none"
          stroke={HELD_OUT_COLOUR}
          strokeWidth={2}
          strokeDasharray="5 4"
        />
        {[0, 150, 300, 450, 600]
          .filter((epoch) => epoch <= epochs)
          .map((epoch) => (
            <text
              key={epoch}
              x={toX(epoch, PLOT.width)}
              y={CHART.height - PAD.bottom + 16}
              textAnchor="middle"
              className="fill-slate-500 text-[10px] dark:fill-slate-400"
            >
              {epoch}
            </text>
          ))}
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
      <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
        Solid is the fourteen the steps were taken from, dashed is the
        forty-six nothing was learned from.
      </p>

      {showAccuracy && (
        <svg
          viewBox={`0 0 ${ACCURACY.width} ${ACCURACY.height}`}
          className="mt-3 w-full select-none rounded-lg bg-slate-50 dark:bg-slate-950"
        >
          {[0.4, 0.6, 0.8, 1.0].map((tick) => (
            <g key={tick}>
              <line
                x1={PAD.left}
                x2={PAD.left + ACCURACY_PLOT.width}
                y1={toAccuracyY(tick)}
                y2={toAccuracyY(tick)}
                className="stroke-slate-200 dark:stroke-slate-800"
                strokeWidth={1}
              />
              <text
                x={PAD.left - 8}
                y={toAccuracyY(tick) + 4}
                textAnchor="end"
                className="fill-slate-500 text-[10px] dark:fill-slate-400"
              >
                {tick.toFixed(1)}
              </text>
            </g>
          ))}
          <path
            d={pathOf(
              (reading) => reading.training_accuracy,
              toAccuracyY,
              ACCURACY_PLOT.width,
            )}
            fill="none"
            stroke={TRAINING_COLOUR}
            strokeWidth={2}
          />
          <path
            d={pathOf(
              (reading) => reading.held_out_accuracy,
              toAccuracyY,
              ACCURACY_PLOT.width,
            )}
            fill="none"
            stroke={HELD_OUT_COLOUR}
            strokeWidth={2}
            strokeDasharray="5 4"
          />
          <text
            x={PAD.left + ACCURACY_PLOT.width / 2}
            y={ACCURACY.height - 8}
            textAnchor="middle"
            className="fill-slate-500 text-[11px] dark:fill-slate-400"
          >
            the share called correctly, epoch by epoch
          </text>
        </svg>
      )}

      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Stat
          label="Lowest held-out loss"
          value={`${run.best_held_out_loss.toFixed(4)} at ${run.best_held_out_loss_epoch}`}
        />
        <Stat
          label="Held-out loss at the end"
          value={run.final_held_out_loss.toFixed(4)}
        />
        <Stat
          label="Training loss at the end"
          value={run.final_training_loss.toFixed(4)}
        />
        <Stat
          label="Best held-out accuracy"
          value={`${run.best_held_out_accuracy.toFixed(3)} at ${run.best_held_out_accuracy_epoch}`}
        />
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
