"use client";

// What the output layer reads, epoch by epoch, as the hidden layer learns.
//
// The crowd network's output layer reads sixteen numbers per person, one
// from each rectified hidden unit, and the chart follows the mean and the
// deviation of each of those sixteen over the whole crowd across four
// hundred epochs. Without a normalising layer those are whatever the hidden
// weights happen to produce, and they move as the weights move. With a batch
// layer between the two, what the output layer reads has, by construction, a
// mean equal to the layer's shift and a deviation equal to its scale, and
// both of those are learned, so the chart shows whether the block held
// still or was moved on purpose instead. Every statistic is the library's
// through the API; the browser draws the sixteen lines.

import { useEffect, useState } from "react";
import {
  CrowdExperiment,
  DriftReading,
  failureMessage,
  fetchCrowdExperiment,
} from "@/lib/concepts/normalisation-layers";
import {
  ACTIVE_BUTTON_CLASS,
  BUTTON_CLASS,
  formatMagnitude,
} from "./normalisationLayersFixtures";

const CHART = { width: 640, height: 260 };
const PAD = { left: 48, right: 16, top: 16, bottom: 36 };
const PLOT = {
  width: CHART.width - PAD.left - PAD.right,
  height: CHART.height - PAD.top - PAD.bottom,
};

const UNIT_COLOURS = [
  "#6366f1",
  "#f59e0b",
  "#10b981",
  "#e11d48",
  "#0ea5e9",
  "#8b5cf6",
  "#f97316",
  "#14b8a6",
];

type Statistic = "means" | "deviations";

export function DriftChart() {
  const [experiment, setExperiment] = useState<CrowdExperiment | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [arrangement, setArrangement] = useState<"none" | "batch">("none");
  const [statistic, setStatistic] = useState<Statistic>("means");

  useEffect(() => {
    (async () => {
      try {
        setExperiment(await fetchCrowdExperiment());
      } catch (error) {
        setMessage(failureMessage(error));
      }
    })();
  }, []);

  if (!experiment) {
    return (
      <p className="text-sm text-slate-500 dark:text-slate-400">
        {message ?? "… the first visit trains a hundred and thirty small networks, which takes ten to twenty seconds"}
      </p>
    );
  }

  const drift = experiment.drift.find((reading) => reading.arrangement === arrangement);
  if (!drift) return null;

  const epochs = drift.recorded_epochs;
  const lastEpoch = epochs[epochs.length - 1];
  const values = drift.units.map((unit) => unit[statistic]);
  const top = Math.max(...values.flat(), 0.5);
  const bottom = Math.min(...values.flat(), 0);
  const epochToX = (epoch: number) => PAD.left + (epoch / lastEpoch) * PLOT.width;
  const valueToY = (value: number) =>
    PAD.top + (1 - (value - bottom) / (top - bottom)) * PLOT.height;
  const pathOf = (series: number[]) =>
    series
      .map((value, index) => `${index === 0 ? "M" : "L"} ${epochToX(epochs[index])} ${valueToY(value)}`)
      .join(" ");
  const ticks = [bottom, (bottom + top) / 2, top];

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 pb-3">
        <button
          onClick={() => setArrangement("none")}
          className={arrangement === "none" ? ACTIVE_BUTTON_CLASS : BUTTON_CLASS}
        >
          No normalisation
        </button>
        <button
          onClick={() => setArrangement("batch")}
          className={arrangement === "batch" ? ACTIVE_BUTTON_CLASS : BUTTON_CLASS}
        >
          Batch layer between
        </button>
        <span className="ml-auto flex items-center gap-1">
          <button
            onClick={() => setStatistic("means")}
            className={statistic === "means" ? ACTIVE_BUTTON_CLASS : BUTTON_CLASS}
          >
            Means
          </button>
          <button
            onClick={() => setStatistic("deviations")}
            className={statistic === "deviations" ? ACTIVE_BUTTON_CLASS : BUTTON_CLASS}
          >
            Deviations
          </button>
        </span>
      </div>

      <svg
        viewBox={`0 0 ${CHART.width} ${CHART.height}`}
        className="w-full select-none rounded-lg bg-slate-50 dark:bg-slate-950"
      >
        {ticks.map((tick) => (
          <g key={tick}>
            <line
              x1={PAD.left}
              x2={PAD.left + PLOT.width}
              y1={valueToY(tick)}
              y2={valueToY(tick)}
              className="stroke-slate-200 dark:stroke-slate-800"
              strokeWidth={1}
            />
            <text
              x={PAD.left - 8}
              y={valueToY(tick) + 4}
              textAnchor="end"
              className="fill-slate-500 text-xs dark:fill-slate-400"
            >
              {tick.toFixed(1)}
            </text>
          </g>
        ))}
        {[0, 100, 200, 300, 400].map((tick) => (
          <text
            key={tick}
            x={epochToX(tick)}
            y={CHART.height - PAD.bottom + 16}
            textAnchor="middle"
            className="fill-slate-500 text-xs dark:fill-slate-400"
          >
            {tick}
          </text>
        ))}
        {values.map((series, unit) => (
          <path
            key={unit}
            d={pathOf(series)}
            fill="none"
            stroke={UNIT_COLOURS[unit % UNIT_COLOURS.length]}
            strokeWidth={1.4}
            opacity={0.85}
          />
        ))}
        <text
          x={PAD.left + PLOT.width / 2}
          y={CHART.height - 4}
          textAnchor="middle"
          className="fill-slate-500 text-xs dark:fill-slate-400"
        >
          epochs
        </text>
        <text
          x={14}
          y={PAD.top + PLOT.height / 2}
          textAnchor="middle"
          transform={`rotate(-90 14 ${PAD.top + PLOT.height / 2})`}
          className="fill-slate-500 text-xs dark:fill-slate-400"
        >
          {statistic === "means" ? "mean over the crowd" : "deviation over the crowd"}
        </text>
      </svg>
      <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
        One line per hidden unit, sixteen in all, read by the output layer
        over the whole crowd after every fourth epoch.
        {arrangement === "batch" &&
          " Under the batch layer every unit starts at a mean of zero and a deviation of one, and what moves them afterwards is the learned shift and scale."}
      </p>

      <Summary drift={drift} />
      {message && (
        <p className="mt-3 text-sm text-amber-600 dark:text-amber-400">{message}</p>
      )}
    </div>
  );
}

function Summary({ drift }: { drift: DriftReading }) {
  return (
    <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
      <Stat label="largest mean shift, first epoch to last" value={drift.largest_mean_shift.toFixed(4)} />
      <Stat label="largest deviation change" value={drift.largest_deviation_change.toFixed(4)} />
      <Stat label="largest mean move in one epoch" value={drift.largest_single_epoch_mean_move.toFixed(4)} />
      {drift.mean_matches_shift_gap === null ? (
        <Stat label="largest deviation move in one epoch" value={drift.largest_single_epoch_deviation_move.toFixed(4)} />
      ) : (
        <Stat label="gap between each mean and the shift" value={formatMagnitude(drift.mean_matches_shift_gap)} />
      )}
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
