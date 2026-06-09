"use client";

// What a straight line leaves behind, person by person.
//
// One bar per person, in order of height, showing how far above or below the fit
// each one's weight really is. Under a straight line the bars run positive at
// the young end and then negative for six people in a row, which is the shape of
// a bend rather than the shape of scatter; switch to the curve and the longest
// stretch on one side drops to three. The readout is that longest stretch, since
// it is the difference between a pattern and scatter in one number.
// The API fits and the browser draws.

import { useEffect, useState } from "react";
import { ApiError } from "@/lib/api";
import { CurveFit, fitCurve } from "@/lib/concepts/polynomial-features";
import { CROWD, CROWD_HEIGHTS, formatScore } from "./polynomialFeaturesFixtures";

const VIEW = { width: 640, height: 220 };
const PAD = { left: 44, right: 14, top: 16, bottom: 34 };

const CHOICES = [
  { degree: 1, label: "a straight line" },
  { degree: 2, label: "with height squared" },
  { degree: 3, label: "with the cube as well" },
];

export function MissesInAPattern() {
  const [degree, setDegree] = useState(1);
  const [fits, setFits] = useState<Record<number, CurveFit>>({});
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    Promise.all(
      CHOICES.map((choice) =>
        fitCurve(CROWD, choice.degree, { standardise: false }).then(
          (fitted) => [choice.degree, fitted] as const,
        ),
      ),
    )
      .then((pairs) => {
        if (!cancelled) setFits(Object.fromEntries(pairs));
      })
      .catch((error) => {
        if (cancelled) return;
        setMessage(
          error instanceof ApiError ? error.message : "Something went wrong.",
        );
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const answer = fits[degree];
  if (!answer) {
    return (
      <div className="my-4 text-sm text-slate-500 dark:text-slate-400">
        {message ?? "…"}
      </div>
    );
  }

  const largest = Math.max(
    ...Object.values(fits).flatMap((fit) =>
      fit.residuals.map((value) => Math.abs(value)),
    ),
  );
  const middle = PAD.top + (VIEW.height - PAD.top - PAD.bottom) / 2;
  const halfHeight = (VIEW.height - PAD.top - PAD.bottom) / 2;
  const step =
    (VIEW.width - PAD.left - PAD.right) / Math.max(1, answer.residuals.length);

  const signs = answer.residuals.map((value) => (value >= 0 ? "+" : "-"));
  let longestStretch = 0;
  let running = 0;
  signs.forEach((sign, index) => {
    running = index > 0 && sign === signs[index - 1] ? running + 1 : 1;
    longestStretch = Math.max(longestStretch, running);
  });

  return (
    <div className="my-4">
      <div className="flex flex-wrap items-center gap-3 pb-3">
        {CHOICES.map((choice) => (
          <button
            key={choice.degree}
            onClick={() => setDegree(choice.degree)}
            className={`rounded-md border px-3 py-1.5 text-sm font-medium transition ${
              degree === choice.degree
                ? "border-indigo-500 bg-indigo-50 text-indigo-700 dark:border-indigo-400 dark:bg-indigo-950/40 dark:text-indigo-300"
                : "border-slate-300 bg-white text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
            }`}
          >
            {choice.label}
          </button>
        ))}
      </div>

      <svg
        viewBox={`0 0 ${VIEW.width} ${VIEW.height}`}
        className="w-full select-none rounded-lg bg-slate-50 dark:bg-slate-950"
      >
        <line
          x1={PAD.left}
          y1={middle}
          x2={VIEW.width - PAD.right}
          y2={middle}
          className="stroke-slate-400 dark:stroke-slate-600"
          strokeWidth={1.5}
        />
        <text
          x={PAD.left - 8}
          y={middle + 4}
          textAnchor="end"
          className="fill-slate-500 text-[10px] dark:fill-slate-400"
        >
          0
        </text>
        {answer.residuals.map((value, index) => {
          const x = PAD.left + index * step + step * 0.15;
          const barWidth = step * 0.7;
          const barHeight = (Math.abs(value) / largest) * halfHeight;
          const y = value >= 0 ? middle - barHeight : middle;
          return (
            <g key={`${index}-${value}`}>
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={Math.max(1, barHeight)}
                rx={2}
                className={
                  value >= 0
                    ? "fill-indigo-500"
                    : "fill-rose-400 dark:fill-rose-500"
                }
              />
              {index % 3 === 0 && (
                <text
                  x={x + barWidth / 2}
                  y={VIEW.height - PAD.bottom + 22}
                  textAnchor="middle"
                  className="fill-slate-500 text-[9px] dark:fill-slate-400"
                >
                  {CROWD_HEIGHTS[index]}
                </text>
              )}
            </g>
          );
        })}
        <text
          x={VIEW.width - PAD.right}
          y={VIEW.height - 6}
          textAnchor="end"
          className="fill-slate-500 text-[11px] dark:fill-slate-400"
        >
          height in centimetres
        </text>
      </svg>

      <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat
          label="Longest stretch on one side"
          value={`${longestStretch} people`}
        />
        <Stat
          label="Total of the squared misses"
          value={formatScore(answer.residual_sum_of_squares, 2)}
        />
        <Stat
          label="The 104 cm child, who weighs 16.1"
          value={`${answer.fitted[0].toFixed(2)} kg`}
        />
        <Stat
          label="Score on the fitted people"
          value={formatScore(answer.train_r_squared)}
        />
      </div>

      <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
        Indigo is a person heavier than the fit expects and rose a person
        lighter. Scatter puts the colours in no order; a bend leaves the young
        end on one side and a long stretch of the middle on the other.
      </p>
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
