"use client";

// The four bends' slopes laid over one another.
//
// Each curve is one activation's derivative across scores from minus six to
// six, the factor a gradient is multiplied by on its way back through a
// neuron carrying that bend. The identity is 1 everywhere, the rectifier is a
// step from 0 to 1 at zero, the tangent peaks at 1 and falls away at both
// ends, and the sigmoid peaks at a quarter and does the same, which is the
// vanishing gradient in one picture. Every slope and every peak is the
// library's through the API. The browser only scales them.

import { useEffect, useState } from "react";
import { ApiError } from "@/lib/api";
import {
  ACTIVATION_NAMES,
  ActivationCurve,
  ActivationName,
  respondNeuron,
} from "@/lib/concepts/neurons-and-activations";

const VIEW = { width: 640, height: 320 };
const PAD = { left: 48, right: 20, top: 16, bottom: 44 };
const PLOT = {
  width: VIEW.width - PAD.left - PAD.right,
  height: VIEW.height - PAD.top - PAD.bottom,
};

const SCORE_RANGE = { low: -6, high: 6 };
const SLOPE_RANGE = { low: 0, high: 1.05 };

// The curve does not depend on the neuron, so the request carries the page's
// worked neuron and the smallest lattice the API accepts.
const WORKED_REQUEST = {
  weights: [2, -1] as [number, number],
  bias: 0.5,
  probe: { first_input: 1, second_input: 1 },
  lattice: {
    first_input_low: -3,
    first_input_high: 3,
    second_input_low: -3,
    second_input_high: 3,
    cells: 2,
  },
};

const LABELS: Record<ActivationName, string> = {
  identity: "Identity",
  rectified_linear: "ReLU",
  sigmoid: "Sigmoid",
  hyperbolic_tangent: "tanh",
};

const STROKES: Record<ActivationName, string> = {
  identity: "text-slate-400 dark:text-slate-500",
  rectified_linear: "text-indigo-600 dark:text-indigo-400",
  sigmoid: "text-amber-500",
  hyperbolic_tangent: "text-emerald-600 dark:text-emerald-400",
};

const SWATCHES: Record<ActivationName, string> = {
  identity: "bg-slate-400 dark:bg-slate-500",
  rectified_linear: "bg-indigo-600 dark:bg-indigo-400",
  sigmoid: "bg-amber-500",
  hyperbolic_tangent: "bg-emerald-600 dark:bg-emerald-400",
};

function scoreToX(score: number): number {
  return (
    PAD.left +
    ((score - SCORE_RANGE.low) / (SCORE_RANGE.high - SCORE_RANGE.low)) *
      PLOT.width
  );
}

function slopeToY(slope: number): number {
  return (
    PAD.top +
    ((SLOPE_RANGE.high - slope) / (SLOPE_RANGE.high - SLOPE_RANGE.low)) *
      PLOT.height
  );
}

type Curves = Record<ActivationName, ActivationCurve>;

export function ActivationSlopeChart() {
  const [curves, setCurves] = useState<Curves | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const answers = await Promise.all(
          ACTIVATION_NAMES.map((activation) =>
            respondNeuron({ ...WORKED_REQUEST, activation }),
          ),
        );
        const gathered = {} as Curves;
        ACTIVATION_NAMES.forEach((activation, index) => {
          gathered[activation] = answers[index].curve;
        });
        setCurves(gathered);
      } catch (error) {
        if (error instanceof ApiError) setMessage(error.message);
        else setMessage("Something went wrong.");
      }
    })();
  }, []);

  const pathOf = (curve: ActivationCurve): string =>
    curve.scores
      .map(
        (score, index) =>
          `${index === 0 ? "M" : "L"} ${scoreToX(score).toFixed(2)} ${slopeToY(curve.slopes[index]).toFixed(2)}`,
      )
      .join(" ");

  return (
    <div>
      <svg
        viewBox={`0 0 ${VIEW.width} ${VIEW.height}`}
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
        {[0.25, 0.5, 0.75, 1].map((tick) => (
          <g key={`y${tick}`}>
            <line
              x1={PAD.left}
              y1={slopeToY(tick)}
              x2={PAD.left + PLOT.width}
              y2={slopeToY(tick)}
              stroke="currentColor"
              className="text-slate-200 dark:text-slate-800"
              strokeWidth={1}
            />
            <text
              x={PAD.left - 8}
              y={slopeToY(tick) + 4}
              textAnchor="end"
              className="fill-slate-500 text-xs font-medium dark:fill-slate-400"
            >
              {tick.toFixed(2)}
            </text>
          </g>
        ))}
        <line
          x1={scoreToX(0)}
          y1={PAD.top}
          x2={scoreToX(0)}
          y2={PAD.top + PLOT.height}
          stroke="currentColor"
          className="text-slate-200 dark:text-slate-800"
          strokeWidth={1}
        />

        {curves &&
          ACTIVATION_NAMES.map((activation) => (
            <path
              key={activation}
              d={pathOf(curves[activation])}
              fill="none"
              stroke="currentColor"
              className={STROKES[activation]}
              strokeWidth={2.5}
            />
          ))}

        {[-6, -3, 0, 3, 6].map((tick) => (
          <text
            key={`x${tick}`}
            x={scoreToX(tick)}
            y={PAD.top + PLOT.height + 18}
            textAnchor="middle"
            className="fill-slate-500 text-xs font-medium dark:fill-slate-400"
          >
            {tick}
          </text>
        ))}
        <text
          x={PAD.left + PLOT.width / 2}
          y={VIEW.height - 6}
          textAnchor="middle"
          className="fill-slate-500 text-xs font-medium dark:fill-slate-400"
        >
          z, the score
        </text>
        <text
          x={14}
          y={PAD.top + PLOT.height / 2}
          textAnchor="middle"
          transform={`rotate(-90 14 ${PAD.top + PLOT.height / 2})`}
          className="fill-slate-500 text-xs font-medium dark:fill-slate-400"
        >
          f′(z), the slope
        </text>
      </svg>

      <p className="mt-2 text-center text-xs text-slate-500 dark:text-slate-500">
        The factor a gradient keeps on its way back through one neuron, for
        each of the four bends. Where a curve sits near the floor, the neurons
        below stop learning.
      </p>

      <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {ACTIVATION_NAMES.map((activation) => (
          <div
            key={activation}
            className="rounded-lg bg-slate-100 px-3 py-2 dark:bg-slate-800"
          >
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <span
                className={
                  "inline-block h-2 w-4 rounded-sm " + SWATCHES[activation]
                }
              />
              Peak slope, {LABELS[activation]}
            </div>
            <div className="font-mono text-lg font-semibold text-slate-900 dark:text-slate-100">
              {curves ? curves[activation].peak_slope.toFixed(2) : "…"}
            </div>
          </div>
        ))}
      </div>

      {message && (
        <p className="mt-3 text-sm text-amber-600 dark:text-amber-400">
          {message}
        </p>
      )}
    </div>
  );
}
