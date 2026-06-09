"use client";

// The four bends side by side, each with its slope beneath it.
//
// One panel per activation, the bend in indigo across scores from minus six
// to six and its slope dashed in amber on the same axes, with the page's two
// worked people marked: the tall heavy person, whom the worked neuron scores
// at 1.5, and the short heavy person, at -2.5. Under each panel are the
// outputs at those two scores, which is where the rectifier answers zero and
// the other three still answer something. Every curve, slope and reading is
// the library's through the API. The browser only scales them.

import { useEffect, useState } from "react";
import { ApiError } from "@/lib/api";
import {
  ACTIVATION_NAMES,
  ActivationName,
  NeuronReading,
  ResponsesByActivation,
  fetchWorkedResponses,
} from "@/lib/concepts/neurons-and-activations";
import {
  ACTIVATION_LABELS,
  CURVE_RANGE,
  SHORT_HEAVY,
  TALL_HEAVY,
  signed,
} from "./neuronFixtures";

const PANEL = { width: 300, height: 200 };
const PAD = { left: 36, right: 10, top: 10, bottom: 26 };
const PLOT = {
  width: PANEL.width - PAD.left - PAD.right,
  height: PANEL.height - PAD.top - PAD.bottom,
};

function scoreToX(score: number): number {
  return (
    PAD.left +
    ((score - CURVE_RANGE.low) / (CURVE_RANGE.high - CURVE_RANGE.low)) *
      PLOT.width
  );
}

function valueToY(value: number, low: number, high: number): number {
  return PAD.top + ((high - value) / (high - low)) * PLOT.height;
}

export function BendGallery() {
  const [tall, setTall] = useState<ResponsesByActivation | null>(null);
  const [short, setShort] = useState<ResponsesByActivation | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const [first, second] = await Promise.all([
          fetchWorkedResponses(TALL_HEAVY),
          fetchWorkedResponses(SHORT_HEAVY),
        ]);
        setTall(first);
        setShort(second);
      } catch (error) {
        if (error instanceof ApiError) setMessage(error.message);
        else setMessage("Something went wrong.");
      }
    })();
  }, []);

  if (!tall || !short) {
    return (
      <p className="text-sm text-slate-500 dark:text-slate-400">
        {message ?? "…"}
      </p>
    );
  }

  const panel = (activation: ActivationName) => {
    const curve = tall[activation].curve;
    const readings: { label: string; reading: NeuronReading }[] = [
      { label: "tall heavy, z = 1.5", reading: tall[activation].reading },
      { label: "short heavy, z = −2.5", reading: short[activation].reading },
    ];
    // Each panel's vertical range holds the bend and its slope together,
    // with zero on it so both are read against the same floor.
    const everything = [...curve.outputs, ...curve.slopes, 0];
    let low = Math.min(...everything);
    let high = Math.max(...everything);
    const padding = 0.06 * (high - low);
    low -= padding;
    high += padding;
    const pathOf = (values: number[]) =>
      curve.scores
        .map(
          (score, index) =>
            `${index === 0 ? "M" : "L"} ${scoreToX(score).toFixed(2)} ${valueToY(values[index], low, high).toFixed(2)}`,
        )
        .join(" ");

    return (
      <div key={activation}>
        <p className="mb-1 text-sm font-medium text-slate-700 dark:text-slate-300">
          {ACTIVATION_LABELS[activation]}
          <span className="ml-2 font-mono text-xs text-slate-500 dark:text-slate-400">
            {tall[activation].formula}
          </span>
        </p>
        <svg
          viewBox={`0 0 ${PANEL.width} ${PANEL.height}`}
          className="w-full select-none rounded-lg bg-slate-50 dark:bg-slate-950"
        >
          <rect
            x={PAD.left}
            y={PAD.top}
            width={PLOT.width}
            height={PLOT.height}
            fill="none"
            stroke="currentColor"
            className="text-slate-300 dark:text-slate-700"
            strokeWidth={1}
          />
          <line
            x1={PAD.left}
            y1={valueToY(0, low, high)}
            x2={PAD.left + PLOT.width}
            y2={valueToY(0, low, high)}
            stroke="currentColor"
            className="text-slate-300 dark:text-slate-700"
            strokeWidth={1}
          />
          <line
            x1={scoreToX(0)}
            y1={PAD.top}
            x2={scoreToX(0)}
            y2={PAD.top + PLOT.height}
            stroke="currentColor"
            className="text-slate-300 dark:text-slate-700"
            strokeWidth={1}
          />
          <path
            d={pathOf(curve.slopes)}
            fill="none"
            stroke="currentColor"
            className="text-amber-500"
            strokeWidth={2}
            strokeDasharray="5 3"
          />
          <path
            d={pathOf(curve.outputs)}
            fill="none"
            stroke="currentColor"
            className="text-indigo-600 dark:text-indigo-400"
            strokeWidth={2.5}
          />
          {readings.map(({ reading }) => (
            <g key={reading.score}>
              <line
                x1={scoreToX(reading.score)}
                y1={PAD.top}
                x2={scoreToX(reading.score)}
                y2={PAD.top + PLOT.height}
                stroke="currentColor"
                className="text-slate-500 dark:text-slate-400"
                strokeWidth={1}
                strokeDasharray="2 3"
              />
              <circle
                cx={scoreToX(reading.score)}
                cy={valueToY(reading.slope, low, high)}
                r={4}
                className="fill-amber-500 stroke-white dark:stroke-slate-900"
                strokeWidth={1.5}
              />
              <circle
                cx={scoreToX(reading.score)}
                cy={valueToY(reading.output, low, high)}
                r={4}
                className="fill-indigo-600 stroke-white dark:fill-indigo-400 dark:stroke-slate-900"
                strokeWidth={1.5}
              />
            </g>
          ))}
          <text
            x={PAD.left - 5}
            y={PAD.top + 4}
            textAnchor="end"
            className="fill-slate-500 text-[9px] font-medium dark:fill-slate-400"
          >
            {high.toFixed(1)}
          </text>
          <text
            x={PAD.left - 5}
            y={PAD.top + PLOT.height}
            textAnchor="end"
            className="fill-slate-500 text-[9px] font-medium dark:fill-slate-400"
          >
            {low.toFixed(1)}
          </text>
          {[CURVE_RANGE.low, 0, CURVE_RANGE.high].map((tick) => (
            <text
              key={`x${tick}`}
              x={scoreToX(tick)}
              y={PAD.top + PLOT.height + 12}
              textAnchor="middle"
              className="fill-slate-500 text-[9px] font-medium dark:fill-slate-400"
            >
              {tick}
            </text>
          ))}
        </svg>
        <div className="mt-2 grid grid-cols-2 gap-2">
          {readings.map(({ label, reading }) => (
            <Stat
              key={label}
              label={label}
              value={`${signed(reading.output, 4)}, slope ${signed(reading.slope, 4)}`}
            />
          ))}
        </div>
      </div>
    );
  };

  return (
    <div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {ACTIVATION_NAMES.map(panel)}
      </div>
      <p className="mt-2 text-center text-xs text-slate-500 dark:text-slate-500">
        Each bend in indigo with its slope dashed in amber, over scores from
        −6 to 6, marked at the two worked people. The readouts are the output
        and the slope at each.
      </p>
      {message && (
        <p className="mt-3 text-sm text-amber-600 dark:text-amber-400">
          {message}
        </p>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-slate-100 px-2 py-1.5 dark:bg-slate-800">
      <div className="text-[11px] text-slate-500 dark:text-slate-400">
        {label}
      </div>
      <div className="font-mono text-sm font-semibold text-slate-900 dark:text-slate-100">
        {value}
      </div>
    </div>
  );
}
