"use client";

// The running figures, followed step by step toward the batch.
//
// The whole-number four is passed through a fresh batch layer again and
// again, and after each step the layer is asked the same rows while
// predicting. The chart is how far that predicting answer still is from the
// training answer, on a logarithmic scale because the gap falls by a tenth of
// itself each step and would vanish into the axis otherwise, with the two
// steps marked at which it first falls under a hundredth and a thousandth.
// Below it is the first row on its own, which is the case the batch layer
// cannot standardise while training. Every figure is the library's through
// the API; the browser draws the curve.

import { useEffect, useState } from "react";
import {
  RunningFigures,
  failureMessage,
  followRunningFigures,
} from "@/lib/concepts/normalisation-layers";
import { WORKED_BLOCK, formatMagnitude, formatSigned } from "./normalisationLayersFixtures";

const STEPS = 100;
const CHART = { width: 640, height: 240 };
const PAD = { left: 56, right: 16, top: 16, bottom: 36 };
const PLOT = {
  width: CHART.width - PAD.left - PAD.right,
  height: CHART.height - PAD.top - PAD.bottom,
};
const LOG_TOP = 1;
const LOG_BOTTOM = -5;

export function RunningFiguresChart() {
  const [figures, setFigures] = useState<RunningFigures | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setFigures(await followRunningFigures(WORKED_BLOCK, STEPS));
      } catch (error) {
        setMessage(failureMessage(error));
      }
    })();
  }, []);

  if (!figures) {
    return <p className="text-sm text-slate-500 dark:text-slate-400">{message ?? "…"}</p>;
  }

  const stepToX = (step: number) => PAD.left + (step / STEPS) * PLOT.width;
  const gapToY = (gap: number) => {
    const logged = Math.max(LOG_BOTTOM, Math.min(LOG_TOP, Math.log10(Math.max(gap, 1e-12))));
    return PAD.top + ((LOG_TOP - logged) / (LOG_TOP - LOG_BOTTOM)) * PLOT.height;
  };
  const path = figures.steps
    .map((step, index) => `${index === 0 ? "M" : "L"} ${stepToX(step.step)} ${gapToY(step.largest_gap)}`)
    .join(" ");
  const marks = [
    { step: figures.first_step_within_hundredth, threshold: 0.01, label: "a hundredth" },
    { step: figures.first_step_within_thousandth, threshold: 0.001, label: "a thousandth" },
  ];
  const at = (step: number) => figures.steps[step - 1];
  const lone = figures.lone_row;

  return (
    <div>
      <svg
        viewBox={`0 0 ${CHART.width} ${CHART.height}`}
        className="w-full select-none rounded-lg bg-slate-50 dark:bg-slate-950"
      >
        {[1, 0, -1, -2, -3, -4, -5].map((power) => (
          <g key={power}>
            <line
              x1={PAD.left}
              x2={PAD.left + PLOT.width}
              y1={gapToY(10 ** power)}
              y2={gapToY(10 ** power)}
              className="stroke-slate-200 dark:stroke-slate-800"
              strokeWidth={1}
            />
            <text
              x={PAD.left - 8}
              y={gapToY(10 ** power) + 4}
              textAnchor="end"
              className="fill-slate-500 text-[10px] dark:fill-slate-400"
            >
              {power >= 0 ? (10 ** power).toString() : `1e${power}`}
            </text>
          </g>
        ))}
        {[0, 25, 50, 75, 100].map((tick) => (
          <text
            key={tick}
            x={stepToX(tick)}
            y={CHART.height - PAD.bottom + 16}
            textAnchor="middle"
            className="fill-slate-500 text-xs dark:fill-slate-400"
          >
            {tick}
          </text>
        ))}
        {marks.map(
          (mark) =>
            mark.step !== null && (
              <g key={mark.label}>
                <line
                  x1={stepToX(mark.step)}
                  x2={stepToX(mark.step)}
                  y1={PAD.top}
                  y2={PAD.top + PLOT.height}
                  stroke="#f59e0b"
                  strokeDasharray="4 3"
                  strokeWidth={1.2}
                />
                <text
                  x={stepToX(mark.step) + 5}
                  y={gapToY(mark.threshold) - 6}
                  className="text-[10px] font-medium"
                  fill="#f59e0b"
                >
                  step {mark.step}, under {mark.label}
                </text>
              </g>
            ),
        )}
        <path d={path} fill="none" stroke="#6366f1" strokeWidth={2} />
        <text
          x={PAD.left + PLOT.width / 2}
          y={CHART.height - 4}
          textAnchor="middle"
          className="fill-slate-500 text-xs dark:fill-slate-400"
        >
          steps of the same batch
        </text>
        <text
          x={14}
          y={PAD.top + PLOT.height / 2}
          textAnchor="middle"
          transform={`rotate(-90 14 ${PAD.top + PLOT.height / 2})`}
          className="fill-slate-500 text-xs dark:fill-slate-400"
        >
          widest gap, predicting to training
        </text>
      </svg>

      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Stat label="the batch, mean and deviation, feature 2" value={`${figures.batch_mean[1]}, ${figures.batch_deviation[1].toFixed(7)}`} />
        <Stat label="running after step 1" value={`${formatSigned(at(1).running_mean[1], 4)}, ${at(1).running_deviation[1].toFixed(7)}`} />
        <Stat label="running after step 10" value={`${at(10).running_mean[1].toFixed(4)}, ${at(10).running_deviation[1].toFixed(4)}`} />
        <Stat label={`running after step ${STEPS}`} value={`${at(STEPS).running_mean[1].toFixed(4)}, ${at(STEPS).running_deviation[1].toFixed(4)}`} />
        <Stat label="widest gap after step 1" value={at(1).largest_gap.toFixed(4)} />
        <Stat label="after step 10" value={at(10).largest_gap.toFixed(4)} />
        <Stat label="after step 44" value={at(44).largest_gap.toFixed(4)} />
        <Stat label={`after step ${STEPS}`} value={formatMagnitude(at(STEPS).largest_gap)} />
      </div>

      <p className="mt-4 text-sm font-medium text-slate-700 dark:text-slate-300">
        The first row on its own, ({lone.row[0]}, {lone.row[1]})
      </p>
      <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-5">
        <Stat label="batch layer, while training" value={pair(lone.training_answer)} />
        <Stat label="batch layer, predicting, fresh figures" value={pair(lone.predicting_answer_fresh)} />
        <Stat label={`batch layer, predicting, after ${STEPS} steps`} value={pair(lone.predicting_answer_final)} />
        <Stat label="layer normalisation" value={pair(lone.layer_answer)} />
        <Stat label="RMS normalisation" value={pair(lone.rms_answer)} />
      </div>
      {message && (
        <p className="mt-3 text-sm text-amber-600 dark:text-amber-400">{message}</p>
      )}
    </div>
  );
}

function pair(values: number[]): string {
  return values.map((value) => formatSigned(value, 4)).join(", ");
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-slate-100 px-2 py-1.5 dark:bg-slate-800">
      <div className="text-[11px] text-slate-500 dark:text-slate-400">{label}</div>
      <div className="font-mono text-sm font-semibold text-slate-900 dark:text-slate-100">{value}</div>
    </div>
  );
}
