"use client";

// Five losses, one slider.
//
// The slider is the last layer's raw output, the one number a network hands
// its loss. Three of the five losses read it as a plain prediction of a
// number and compare it to the target; the other two squash it into a
// probability first and compare that to a yes or a no. The upper chart draws
// what each loss costs across the whole range and the lower chart draws which
// way each one pushes, with the slider's position marked on every curve. A
// sixth, dashed grey curve can be switched on, a sigmoid output scored by
// squared error, which is the pairing the page argues against. The table
// underneath is the readout the page quotes, and its last column is the slope
// found by nudging the raw output either side and dividing, so the reader can
// see that the gradient really is the slope of the cost. Every number here
// comes from the library through the API; the browser only draws.

import { useEffect, useState } from "react";
import { ApiError } from "@/lib/api";
import {
  CurveSample,
  LOSS_NAMES,
  LossCurves,
  LossMeasurement,
  ReadingName,
  YesOrNo,
  measureLosses,
  traceLossCurves,
} from "@/lib/concepts/loss-functions";
import { show } from "./lossFixtures";

const VIEW = { width: 640, height: 250 };
const PAD = { left: 56, right: 16, top: 14, bottom: 34 };
const PLOT = {
  width: VIEW.width - PAD.left - PAD.right,
  height: VIEW.height - PAD.top - PAD.bottom,
};

const RAW_LOW = -5;
const RAW_HIGH = 5;
const SAMPLE_COUNT = 101;
const DEBOUNCE_MS = 120;

// The page's slider example: a regression truth of one half, a class label
// of yes, and the raw output at zero, where three of the five pulls coincide.
const WORKED_TARGET = 0.5;
const WORKED_LABEL: YesOrNo = 1;
const WORKED_THRESHOLD = 1.0;
const WORKED_RAW_OUTPUT = 0;

const LABELS: Record<ReadingName, string> = {
  squared_error: "Squared error",
  absolute_error: "Absolute error",
  huber_error: "Huber",
  binary_cross_entropy: "Binary cross-entropy",
  softmax_cross_entropy: "Softmax cross-entropy",
  sigmoid_then_squared: "Sigmoid, then squared error",
};

const STROKES: Record<ReadingName, string> = {
  squared_error: "stroke-indigo-600",
  absolute_error: "stroke-amber-500",
  huber_error: "stroke-emerald-600",
  binary_cross_entropy: "stroke-rose-500",
  softmax_cross_entropy: "stroke-sky-500",
  sigmoid_then_squared: "stroke-slate-400",
};

const FILLS: Record<ReadingName, string> = {
  squared_error: "fill-indigo-600",
  absolute_error: "fill-amber-500",
  huber_error: "fill-emerald-600",
  binary_cross_entropy: "fill-rose-500",
  softmax_cross_entropy: "fill-sky-500",
  sigmoid_then_squared: "fill-slate-400",
};

// The softmax curve sits exactly on the binary cross-entropy curve, by the
// identity the page proves, so it is dashed to stay visible; the mismatched
// pairing is dashed because it is the one that is not a recommendation.
const DASHES: Partial<Record<ReadingName, string>> = {
  softmax_cross_entropy: "6 4",
  sigmoid_then_squared: "3 3",
};

function rawToX(rawOutput: number): number {
  return PAD.left + ((rawOutput - RAW_LOW) / (RAW_HIGH - RAW_LOW)) * PLOT.width;
}

function valueToY(value: number, low: number, high: number): number {
  const span = high - low || 1;
  return PAD.top + ((high - value) / span) * PLOT.height;
}

function pathOf(
  samples: CurveSample[],
  read: (sample: CurveSample) => number,
  low: number,
  high: number,
): string {
  return samples
    .map((sample, index) => {
      const command = index === 0 ? "M" : "L";
      return `${command}${rawToX(sample.raw_output).toFixed(1)},${valueToY(read(sample), low, high).toFixed(1)}`;
    })
    .join(" ");
}

function niceTicks(low: number, high: number, count: number): number[] {
  const step = (high - low) / (count - 1);
  return Array.from({ length: count }, (_, index) => low + index * step);
}

interface ChartProps {
  title: string;
  names: ReadingName[];
  curves: LossCurves | null;
  read: (sample: CurveSample) => number;
  low: number;
  high: number;
  rawOutput: number;
  measurement: LossMeasurement | null;
  readPoint: (reading: LossMeasurement["readings"][ReadingName]) => number;
}

function Chart({
  title,
  names,
  curves,
  read,
  low,
  high,
  rawOutput,
  measurement,
  readPoint,
}: ChartProps) {
  const ticksY = niceTicks(low, high, 5);
  const ticksX = niceTicks(RAW_LOW, RAW_HIGH, 5);
  const zeroY = low < 0 && high > 0 ? valueToY(0, low, high) : null;

  return (
    <svg
      viewBox={`0 0 ${VIEW.width} ${VIEW.height}`}
      className="w-full"
      role="img"
      aria-label={title}
    >
      <text
        x={PAD.left}
        y={PAD.top - 2}
        className="fill-slate-500 text-[11px] dark:fill-slate-400"
      >
        {title}
      </text>
      {ticksY.map((tick) => (
        <g key={`y-${tick}`}>
          <line
            x1={PAD.left}
            x2={VIEW.width - PAD.right}
            y1={valueToY(tick, low, high)}
            y2={valueToY(tick, low, high)}
            className="stroke-slate-200 dark:stroke-slate-800"
            strokeWidth={1}
          />
          <text
            x={PAD.left - 8}
            y={valueToY(tick, low, high) + 4}
            textAnchor="end"
            className="fill-slate-500 text-[11px] dark:fill-slate-400"
          >
            {tick.toFixed(1)}
          </text>
        </g>
      ))}
      {ticksX.map((tick) => (
        <text
          key={`x-${tick}`}
          x={rawToX(tick)}
          y={VIEW.height - PAD.bottom + 18}
          textAnchor="middle"
          className="fill-slate-500 text-[11px] dark:fill-slate-400"
        >
          {tick.toFixed(1)}
        </text>
      ))}
      <text
        x={PAD.left + PLOT.width / 2}
        y={VIEW.height - 4}
        textAnchor="middle"
        className="fill-slate-500 text-[11px] dark:fill-slate-400"
      >
        raw output of the last layer
      </text>
      {zeroY !== null && (
        <line
          x1={PAD.left}
          x2={VIEW.width - PAD.right}
          y1={zeroY}
          y2={zeroY}
          className="stroke-slate-400 dark:stroke-slate-600"
          strokeWidth={1}
        />
      )}
      <line
        x1={rawToX(rawOutput)}
        x2={rawToX(rawOutput)}
        y1={PAD.top}
        y2={PAD.top + PLOT.height}
        className="stroke-slate-400 dark:stroke-slate-500"
        strokeDasharray="3 3"
        strokeWidth={1}
      />
      {curves &&
        names.map((name) => (
          <path
            key={name}
            d={pathOf(curves[name], read, low, high)}
            fill="none"
            strokeWidth={2}
            strokeDasharray={DASHES[name]}
            className={STROKES[name]}
          />
        ))}
      {measurement &&
        names.map((name) => (
          <circle
            key={`point-${name}`}
            cx={rawToX(measurement.raw_output)}
            cy={valueToY(readPoint(measurement.readings[name]), low, high)}
            r={4}
            className={FILLS[name]}
          />
        ))}
    </svg>
  );
}

export function LossCurvesPlayground() {
  const [rawOutput, setRawOutput] = useState<number>(WORKED_RAW_OUTPUT);
  const [target, setTarget] = useState<number>(WORKED_TARGET);
  const [label, setLabel] = useState<YesOrNo>(WORKED_LABEL);
  const [threshold, setThreshold] = useState<number>(WORKED_THRESHOLD);
  const [showMismatched, setShowMismatched] = useState(false);
  const [curves, setCurves] = useState<LossCurves | null>(null);
  const [measurement, setMeasurement] = useState<LossMeasurement | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const names: ReadingName[] = showMismatched
    ? [...LOSS_NAMES, "sigmoid_then_squared"]
    : LOSS_NAMES;

  // The curves depend on the setting and not on the slider, so they are
  // fetched only when the setting changes; the slider's readout is cheaper
  // and is fetched on every move, debounced.
  useEffect(() => {
    let cancelled = false;
    const handle = window.setTimeout(async () => {
      try {
        const traced = await traceLossCurves(
          { target, label, huber_threshold: threshold },
          SAMPLE_COUNT,
        );
        if (!cancelled) {
          setCurves(traced);
          setMessage(null);
        }
      } catch (error) {
        if (cancelled) return;
        if (error instanceof ApiError) setMessage(error.message);
        else setMessage("Something went wrong.");
      }
    }, DEBOUNCE_MS);
    return () => {
      cancelled = true;
      window.clearTimeout(handle);
    };
  }, [target, label, threshold]);

  useEffect(() => {
    let cancelled = false;
    const handle = window.setTimeout(async () => {
      try {
        const measured = await measureLosses(
          { target, label, huber_threshold: threshold },
          rawOutput,
        );
        if (!cancelled) {
          setMeasurement(measured);
          setMessage(null);
        }
      } catch (error) {
        if (cancelled) return;
        if (error instanceof ApiError) setMessage(error.message);
        else setMessage("Something went wrong.");
      }
    }, DEBOUNCE_MS);
    return () => {
      cancelled = true;
      window.clearTimeout(handle);
    };
  }, [rawOutput, target, label, threshold]);

  // The value chart's ceiling follows the data so a far target does not
  // flatten every curve into the floor; the gradient chart's range is fixed,
  // since a slope here can never exceed the width of the sweep.
  let valueCeiling = 1;
  if (curves) {
    for (const name of LOSS_NAMES) {
      for (const sample of curves[name]) {
        if (sample.value > valueCeiling) valueCeiling = sample.value;
      }
    }
  }
  valueCeiling = Math.ceil(valueCeiling);

  const resetToWorked = () => {
    setRawOutput(WORKED_RAW_OUTPUT);
    setTarget(WORKED_TARGET);
    setLabel(WORKED_LABEL);
    setThreshold(WORKED_THRESHOLD);
  };

  const largestDisagreement = measurement
    ? Math.max(
        ...names.map((name) => measurement.readings[name].disagreement ?? 0),
      )
    : null;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600 dark:text-slate-300">
        <button
          type="button"
          onClick={resetToWorked}
          className="rounded-md border border-slate-300 px-3 py-1 text-sm hover:border-indigo-400 dark:border-slate-700 dark:hover:border-indigo-500"
        >
          The halfway guess
        </button>
        <label className="flex items-center gap-2">
          target
          <input
            type="range"
            min={-2}
            max={2}
            step={0.5}
            value={target}
            onChange={(event) => setTarget(Number(event.target.value))}
            className="w-28 accent-indigo-600"
          />
          <span className="w-10 font-mono text-sm">{target.toFixed(1)}</span>
        </label>
        <label className="flex items-center gap-2">
          label
          <select
            value={label}
            onChange={(event) => setLabel(Number(event.target.value) as YesOrNo)}
            className="rounded-md border border-slate-300 bg-white px-2 py-1 text-sm dark:border-slate-700 dark:bg-slate-900"
          >
            <option value={1}>yes (1)</option>
            <option value={0}>no (0)</option>
          </select>
        </label>
        <label className="flex items-center gap-2">
          Huber knee
          <input
            type="range"
            min={0.5}
            max={3}
            step={0.5}
            value={threshold}
            onChange={(event) => setThreshold(Number(event.target.value))}
            className="w-28 accent-emerald-600"
          />
          <span className="w-8 font-mono text-sm">{threshold.toFixed(1)}</span>
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={showMismatched}
            onChange={(event) => setShowMismatched(event.target.checked)}
            className="accent-slate-500"
          />
          also draw a sigmoid output scored by squared error
        </label>
      </div>

      <label className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
        raw output
        <input
          type="range"
          min={RAW_LOW}
          max={RAW_HIGH}
          step={0.1}
          value={rawOutput}
          onChange={(event) => setRawOutput(Number(event.target.value))}
          className="w-full accent-slate-700 dark:accent-slate-300"
        />
        <span className="w-12 font-mono text-sm">{rawOutput.toFixed(1)}</span>
      </label>

      <Chart
        title="what the miss costs"
        names={names}
        curves={curves}
        read={(sample) => sample.value}
        low={0}
        high={valueCeiling}
        rawOutput={rawOutput}
        measurement={measurement}
        readPoint={(reading) => reading.value}
      />
      <Chart
        title="which way it pushes, the gradient at the raw output"
        names={names}
        curves={curves}
        read={(sample) => sample.gradient}
        low={-5.5}
        high={5.5}
        rawOutput={rawOutput}
        measurement={measurement}
        readPoint={(reading) => reading.gradient}
      />

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-slate-500 dark:text-slate-400">
              <th className="py-1 pr-3 font-medium">loss</th>
              <th className="py-1 pr-3 font-medium">reads the raw output as</th>
              <th className="py-1 pr-3 font-medium">probability</th>
              <th className="py-1 pr-3 font-medium">cost</th>
              <th className="py-1 pr-3 font-medium">gradient</th>
              <th className="py-1 font-medium">slope by nudging</th>
            </tr>
          </thead>
          <tbody className="font-mono">
            {names.map((name) => {
              const reading = measurement?.readings[name];
              const squashes = reading?.probability !== null && reading !== undefined;
              return (
                <tr
                  key={name}
                  className="border-t border-slate-200 dark:border-slate-800"
                >
                  <td className="py-1 pr-3 font-sans">
                    <span
                      className={`mr-2 inline-block h-2.5 w-2.5 rounded-full ${FILLS[name].replace("fill-", "bg-")}`}
                    />
                    {LABELS[name]}
                  </td>
                  <td className="py-1 pr-3 font-sans text-slate-500 dark:text-slate-400">
                    {squashes ? "a score to squash" : "the prediction itself"}
                  </td>
                  <td className="py-1 pr-3">{reading?.probability == null ? "" : show(reading.probability)}</td>
                  <td className="py-1 pr-3">{show(reading?.value)}</td>
                  <td className="py-1 pr-3">{show(reading?.gradient)}</td>
                  <td className="py-1">{show(reading?.slope_by_nudging)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-slate-500 dark:text-slate-400">
        The last column nudges the raw output by {measurement ? measurement.nudge.toExponential(0) : "…"} either side, measures the cost at both, and divides the difference by the gap. The largest disagreement with the gradient across the rows shown is {largestDisagreement === null ? "…" : largestDisagreement.toExponential(1)}.
      </p>

      {message && (
        <p className="text-sm text-rose-600 dark:text-rose-400">{message}</p>
      )}
    </div>
  );
}
