"use client";

// One boundary, one dial, and the four ways a call can go.
//
// The scatter colours each person by which cell of the table they fell into,
// so a wrongly called person is visibly a different colour rather than merely
// counted. The threshold slider does not refit anything: the boundary and
// every person's chance were computed once, and moving the dial only changes
// where the line between calling somebody adult and calling them child is
// drawn. Watch precision and recall trade against each other on the curve at
// the bottom, with the current threshold marked. Every chance, every count and
// every rate comes from the library through the API.

import { useEffect, useState } from "react";
import { ApiError, LabelledPoint } from "@/lib/api";
import {
  ClassifierEvaluation,
  evaluateAtThreshold,
} from "@/lib/concepts/judging-a-classifier";

const VIEW = { width: 640, height: 340 };
const PAD = { left: 52, right: 18, top: 16, bottom: 44 };
const PLOT = {
  width: VIEW.width - PAD.left - PAD.right,
  height: VIEW.height - PAD.top - PAD.bottom,
};

const CURVE_VIEW = { width: 640, height: 200 };
const CURVE_PAD = { left: 56, right: 20, top: 16, bottom: 40 };
const CURVE_PLOT = {
  width: CURVE_VIEW.width - CURVE_PAD.left - CURVE_PAD.right,
  height: CURVE_VIEW.height - CURVE_PAD.top - CURVE_PAD.bottom,
};

const DOMAIN = { xMin: 110, xMax: 195, yMin: 15, yMax: 95 };
const DEBOUNCE_MS = 120;

// Twelve people, ten a boundary can place and two it cannot: an adult-sized
// child and a child-sized adult, which is what fills all four cells.
const OVERLAPPING_CROWD: LabelledPoint[] = [
  { x: 118, y: 24, label: 0 },
  { x: 120, y: 25, label: 0 },
  { x: 122, y: 28, label: 0 },
  { x: 125, y: 31, label: 0 },
  { x: 140, y: 45, label: 0 },
  { x: 168, y: 66, label: 0 },
  { x: 150, y: 50, label: 1 },
  { x: 159, y: 57, label: 1 },
  { x: 162, y: 61, label: 1 },
  { x: 178, y: 78, label: 1 },
  { x: 180, y: 80, label: 1 },
  { x: 183, y: 83, label: 1 },
];

type Cell = "truePositive" | "trueNegative" | "falsePositive" | "falseNegative";

const CELL_FILL: Record<Cell, string> = {
  truePositive: "fill-indigo-600",
  trueNegative: "fill-emerald-600",
  falsePositive: "fill-amber-500",
  falseNegative: "fill-rose-500",
};

const CELL_TITLE: Record<Cell, string> = {
  truePositive: "called adult, is adult",
  trueNegative: "called child, is child",
  falsePositive: "called adult, is child",
  falseNegative: "called child, is adult",
};

function cellOf(label: number, prediction: number): Cell {
  if (label === 1) return prediction === 1 ? "truePositive" : "falseNegative";
  return prediction === 1 ? "falsePositive" : "trueNegative";
}

function toPixel(point: { x: number; y: number }) {
  return {
    px:
      PAD.left +
      ((point.x - DOMAIN.xMin) / (DOMAIN.xMax - DOMAIN.xMin)) * PLOT.width,
    py:
      PAD.top +
      (1 - (point.y - DOMAIN.yMin) / (DOMAIN.yMax - DOMAIN.yMin)) * PLOT.height,
  };
}

export function ThresholdMatrix() {
  const [threshold, setThreshold] = useState(0.5);
  const [answer, setAnswer] = useState<ClassifierEvaluation | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(async () => {
      try {
        setAnswer(await evaluateAtThreshold(OVERLAPPING_CROWD, threshold));
        setMessage(null);
      } catch (error) {
        if (error instanceof ApiError) setMessage(error.message);
        else setMessage("Something went wrong.");
      }
    }, DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [threshold]);

  const counts = answer?.counts;
  const rates = answer?.rates;

  const thresholdToX = (value: number) =>
    CURVE_PAD.left + value * CURVE_PLOT.width;
  const rateToY = (value: number) =>
    CURVE_PAD.top + (1 - value) * CURVE_PLOT.height;

  return (
    <div>
      <label className="flex items-center gap-3 pb-3 text-sm text-slate-600 dark:text-slate-300">
        threshold
        <input
          type="range"
          min={0.05}
          max={0.95}
          step={0.01}
          value={threshold}
          onChange={(event) => setThreshold(Number(event.target.value))}
          className="w-full accent-indigo-600"
        />
        <span className="w-10 font-mono text-sm">{threshold.toFixed(2)}</span>
      </label>

      <svg
        viewBox={`0 0 ${VIEW.width} ${VIEW.height}`}
        className="w-full select-none rounded-lg bg-slate-50 dark:bg-slate-950"
      >
        {OVERLAPPING_CROWD.map((person, index) => {
          const { px, py } = toPixel(person);
          const prediction = answer ? answer.predictions[index] : person.label;
          const cell = cellOf(person.label, prediction);
          const wrong = cell === "falsePositive" || cell === "falseNegative";
          return (
            <g key={`${person.x},${person.y}`}>
              <circle
                cx={px}
                cy={py}
                r={wrong ? 7 : 5}
                className={`${CELL_FILL[cell]} stroke-white dark:stroke-slate-900`}
                strokeWidth={1.5}
              />
              {answer && (
                <text
                  x={px}
                  y={py - 12}
                  textAnchor="middle"
                  className="fill-slate-500 font-mono text-[9px] dark:fill-slate-400"
                >
                  {answer.probabilities[index].toFixed(2)}
                </text>
              )}
            </g>
          );
        })}
        <text
          x={PAD.left + PLOT.width / 2}
          y={VIEW.height - 8}
          textAnchor="middle"
          className="fill-slate-500 text-xs font-medium dark:fill-slate-400"
        >
          Height across, weight up, each person labelled with their chance of
          being adult
        </text>
      </svg>

      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-600 dark:text-slate-300">
        {(Object.keys(CELL_TITLE) as Cell[]).map((cell) => (
          <span key={cell} className="flex items-center gap-1.5">
            <span
              className={`inline-block h-2.5 w-2.5 rounded-full ${CELL_FILL[cell].replace("fill-", "bg-")}`}
            />
            {CELL_TITLE[cell]}
          </span>
        ))}
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div>
          <div className="mb-1 text-xs text-slate-500 dark:text-slate-400">
            The confusion matrix
          </div>
          <table className="w-full border-collapse text-center text-sm">
            <tbody className="font-mono">
              <tr>
                <td className="border border-slate-200 p-2 dark:border-slate-800">
                  <div className="text-[10px] font-sans text-slate-500 dark:text-slate-400">
                    called adult, is adult
                  </div>
                  <div className="text-lg font-semibold text-indigo-600 dark:text-indigo-400">
                    {counts ? counts.true_positives : "…"}
                  </div>
                </td>
                <td className="border border-slate-200 p-2 dark:border-slate-800">
                  <div className="text-[10px] font-sans text-slate-500 dark:text-slate-400">
                    called child, is adult
                  </div>
                  <div className="text-lg font-semibold text-rose-500">
                    {counts ? counts.false_negatives : "…"}
                  </div>
                </td>
              </tr>
              <tr>
                <td className="border border-slate-200 p-2 dark:border-slate-800">
                  <div className="text-[10px] font-sans text-slate-500 dark:text-slate-400">
                    called adult, is child
                  </div>
                  <div className="text-lg font-semibold text-amber-500">
                    {counts ? counts.false_positives : "…"}
                  </div>
                </td>
                <td className="border border-slate-200 p-2 dark:border-slate-800">
                  <div className="text-[10px] font-sans text-slate-500 dark:text-slate-400">
                    called child, is child
                  </div>
                  <div className="text-lg font-semibold text-emerald-600">
                    {counts ? counts.true_negatives : "…"}
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Stat
            label="Accuracy"
            value={rates ? rates.accuracy.toFixed(4) : "…"}
          />
          <Stat
            label="Precision"
            value={
              rates
                ? rates.precision === null
                  ? "nobody called"
                  : rates.precision.toFixed(4)
                : "…"
            }
          />
          <Stat label="Recall" value={rates ? rates.recall.toFixed(4) : "…"} />
          <Stat
            label="Specificity"
            value={rates ? rates.specificity.toFixed(4) : "…"}
          />
        </div>
      </div>

      {answer && (
        <svg
          viewBox={`0 0 ${CURVE_VIEW.width} ${CURVE_VIEW.height}`}
          className="mt-4 w-full select-none rounded-lg bg-slate-50 dark:bg-slate-950"
        >
          {[0, 0.5, 1].map((tick) => (
            <g key={tick}>
              <line
                x1={CURVE_PAD.left}
                x2={CURVE_PAD.left + CURVE_PLOT.width}
                y1={rateToY(tick)}
                y2={rateToY(tick)}
                className="stroke-slate-200 dark:stroke-slate-800"
                strokeWidth={1}
              />
              <text
                x={CURVE_PAD.left - 8}
                y={rateToY(tick) + 4}
                textAnchor="end"
                className="fill-slate-500 text-[11px] dark:fill-slate-400"
              >
                {tick.toFixed(1)}
              </text>
            </g>
          ))}
          <path
            d={answer.curve
              .map((reading, index) => {
                const command = index === 0 ? "M" : "L";
                return `${command}${thresholdToX(reading.threshold).toFixed(1)},${rateToY(reading.recall).toFixed(1)}`;
              })
              .join(" ")}
            fill="none"
            strokeWidth={2}
            className="stroke-indigo-600 dark:stroke-indigo-400"
          />
          <path
            d={answer.curve
              .filter((reading) => reading.precision !== null)
              .map((reading, index) => {
                const command = index === 0 ? "M" : "L";
                return `${command}${thresholdToX(reading.threshold).toFixed(1)},${rateToY(reading.precision as number).toFixed(1)}`;
              })
              .join(" ")}
            fill="none"
            strokeWidth={2}
            className="stroke-amber-500"
          />
          <line
            x1={thresholdToX(threshold)}
            y1={CURVE_PAD.top}
            x2={thresholdToX(threshold)}
            y2={CURVE_PAD.top + CURVE_PLOT.height}
            className="stroke-slate-500 dark:stroke-slate-400"
            strokeDasharray="3 3"
            strokeWidth={1.5}
          />
          <text
            x={CURVE_PAD.left + CURVE_PLOT.width / 2}
            y={CURVE_VIEW.height - 6}
            textAnchor="middle"
            className="fill-slate-500 text-xs font-medium dark:fill-slate-400"
          >
            Threshold across, with recall in indigo and precision in amber
          </text>
        </svg>
      )}

      {message && (
        <p className="mt-3 text-sm text-rose-600 dark:text-rose-400">{message}</p>
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
