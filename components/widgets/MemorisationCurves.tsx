"use client";

// Training against held-out accuracy, epoch by epoch, with and without dropout.
//
// One seed's five folds of the tangled crowd, pooled: after every fourth
// epoch the training accuracy is the mean over the folds and the held-out
// accuracy is the share of all twenty-five people called correctly by the
// fold that held them out. The three curves are the same network with no
// dropout layer and with one at two rates, and the gap between the solid
// and dashed line of each colour is what the network memorised. The lower
// chart is the loss the backward pass measured on its way forward, which
// under dropout is one thinned network's loss and so rises and falls where
// the undropped one only falls. Every accuracy and every loss is the
// library's through the API; the browser draws the curves and, on the first
// visit, waits for the seventy-five training runs behind them.

import { useEffect, useState } from "react";
import {
  DropoutExperiment,
  RateCurve,
  failureMessage,
  fetchDropoutExperiment,
} from "@/lib/concepts/dropout";

const CHART = { width: 640, height: 260 };
const PAD = { left: 52, right: 20, top: 16, bottom: 36 };
const PLOT = {
  width: CHART.width - PAD.left - PAD.right,
  height: CHART.height - PAD.top - PAD.bottom,
};
const LOSS_CHART = { width: 640, height: 200 };
const LOSS_PLOT = {
  width: LOSS_CHART.width - PAD.left - PAD.right,
  height: LOSS_CHART.height - PAD.top - PAD.bottom,
};

const RATE_COLOURS: Record<string, string> = {
  "0": "#64748b",
  "0.2": "#6366f1",
  "0.5": "#f59e0b",
};

function rateLabel(rate: number): string {
  return rate === 0 ? "no dropout" : `dropout at ${rate.toFixed(1)}`;
}

export function MemorisationCurves({ showLoss = true }: { showLoss?: boolean }) {
  const [experiment, setExperiment] = useState<DropoutExperiment | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [shown, setShown] = useState<number[]>([0, 0.5]);

  useEffect(() => {
    (async () => {
      try {
        setExperiment(await fetchDropoutExperiment());
      } catch (error) {
        setMessage(failureMessage(error));
      }
    })();
  }, []);

  if (!experiment) {
    return (
      <p className="text-sm text-slate-500 dark:text-slate-400">
        {message ?? "… the first visit trains seventy-five small networks, which takes ten to twenty seconds"}
      </p>
    );
  }

  const epochs = experiment.epochs;
  const epochToX = (epoch: number) => PAD.left + (epoch / epochs) * PLOT.width;
  const accuracyToY = (accuracy: number) =>
    PAD.top + (1 - (accuracy - 0.5) / 0.5) * PLOT.height;
  const lossTop = Math.max(
    ...experiment.curves.flatMap((curve) => curve.readings.map((reading) => reading.thinned_loss)),
  );
  const lossToY = (loss: number) => PAD.top + (1 - loss / lossTop) * LOSS_PLOT.height;

  const pathOf = (curve: RateCurve, pick: (reading: RateCurve["readings"][number]) => number, toY: (value: number) => number) =>
    curve.readings
      .map((reading, index) => `${index === 0 ? "M" : "L"} ${epochToX(reading.epoch)} ${toY(pick(reading))}`)
      .join(" ");

  const toggle = (rate: number) =>
    setShown((current) =>
      current.includes(rate)
        ? current.length > 1
          ? current.filter((each) => each !== rate)
          : current
        : [...current, rate].sort(),
    );

  const visible = experiment.curves.filter((curve) => shown.includes(curve.drop_probability));

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 pb-3">
        {experiment.curves.map((curve) => {
          const rate = curve.drop_probability;
          const colour = RATE_COLOURS[String(rate)];
          const on = shown.includes(rate);
          return (
            <button
              key={rate}
              onClick={() => toggle(rate)}
              className={
                "rounded-md border px-3 py-1.5 text-sm font-medium transition " +
                (on
                  ? "text-white"
                  : "border-slate-300 bg-white text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200")
              }
              style={on ? { backgroundColor: colour, borderColor: colour } : undefined}
            >
              {rateLabel(rate)}
            </button>
          );
        })}
        <span className="ml-auto text-xs text-slate-500 dark:text-slate-400">
          seed {experiment.seeds[0]}, {experiment.n_folds} folds pooled, {experiment.hidden_width} hidden units
        </span>
      </div>

      <svg
        viewBox={`0 0 ${CHART.width} ${CHART.height}`}
        className="w-full select-none rounded-lg bg-slate-50 dark:bg-slate-950"
      >
        {[0.5, 0.6, 0.7, 0.8, 0.9, 1.0].map((tick) => (
          <g key={tick}>
            <line
              x1={PAD.left}
              x2={PAD.left + PLOT.width}
              y1={accuracyToY(tick)}
              y2={accuracyToY(tick)}
              className="stroke-slate-200 dark:stroke-slate-800"
              strokeWidth={1}
            />
            <text
              x={PAD.left - 8}
              y={accuracyToY(tick) + 4}
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
        {visible.map((curve) => {
          const colour = RATE_COLOURS[String(curve.drop_probability)];
          return (
            <g key={curve.drop_probability}>
              <path
                d={pathOf(curve, (reading) => reading.training_accuracy, accuracyToY)}
                fill="none"
                stroke={colour}
                strokeWidth={2}
              />
              <path
                d={pathOf(curve, (reading) => reading.held_out_accuracy, accuracyToY)}
                fill="none"
                stroke={colour}
                strokeWidth={2}
                strokeDasharray="5 4"
              />
            </g>
          );
        })}
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
          accuracy
        </text>
      </svg>
      <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
        Solid is the training rows, dashed is the people held out. The gap
        between a colour&rsquo;s two lines is what that network memorised.
      </p>

      <div className="mt-3 grid grid-cols-3 gap-2">
        {visible.map((curve) => {
          const last = curve.readings[curve.readings.length - 1];
          return (
            <Stat
              key={curve.drop_probability}
              label={`${rateLabel(curve.drop_probability)}, after ${last.epoch} epochs`}
              value={`${last.training_accuracy.toFixed(2)} trained, ${last.held_out_accuracy.toFixed(2)} held out`}
              colour={RATE_COLOURS[String(curve.drop_probability)]}
            />
          );
        })}
      </div>

      {showLoss && (
        <>
          <svg
            viewBox={`0 0 ${LOSS_CHART.width} ${LOSS_CHART.height}`}
            className="mt-4 w-full select-none rounded-lg bg-slate-50 dark:bg-slate-950"
          >
            {[0, lossTop / 2, lossTop].map((tick) => (
              <text
                key={tick}
                x={PAD.left - 8}
                y={lossToY(tick) + 4}
                textAnchor="end"
                className="fill-slate-500 text-xs dark:fill-slate-400"
              >
                {tick.toFixed(2)}
              </text>
            ))}
            <line
              x1={PAD.left}
              x2={PAD.left}
              y1={PAD.top}
              y2={PAD.top + LOSS_PLOT.height}
              className="stroke-slate-300 dark:stroke-slate-700"
              strokeWidth={1}
            />
            {visible.map((curve) => (
              <path
                key={curve.drop_probability}
                d={pathOf(curve, (reading) => reading.thinned_loss, lossToY)}
                fill="none"
                stroke={RATE_COLOURS[String(curve.drop_probability)]}
                strokeWidth={1.5}
              />
            ))}
            <text
              x={PAD.left + LOSS_PLOT.width / 2}
              y={LOSS_CHART.height - 4}
              textAnchor="middle"
              className="fill-slate-500 text-xs dark:fill-slate-400"
            >
              the loss the backward pass measured, mean over the folds
            </text>
          </svg>
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            Under dropout the loss is one thinned network&rsquo;s, a different
            one every epoch, so the curve rises as often as it falls while the
            accuracy above it still climbs.
          </p>
        </>
      )}

      {message && (
        <p className="mt-3 text-sm text-amber-600 dark:text-amber-400">{message}</p>
      )}
    </div>
  );
}

function Stat({ label, value, colour }: { label: string; value: string; colour: string }) {
  return (
    <div className="rounded-lg bg-slate-100 px-3 py-2 dark:bg-slate-800">
      <div className="text-[11px]" style={{ color: colour }}>
        {label}
      </div>
      <div className="font-mono text-xs font-semibold text-slate-900 dark:text-slate-100">
        {value}
      </div>
    </div>
  );
}
