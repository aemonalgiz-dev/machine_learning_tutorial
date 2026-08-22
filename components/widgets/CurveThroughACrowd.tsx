"use client";

// One column raised to a chosen degree, fitted, and drawn through the people.
//
// The scatter is height against weight for the crowd the page carries, the
// curve is the fit at the chosen degree, and the hollow rings are the people
// held back from it. Two readouts, the score on the people the fit saw and the
// score on the people it did not, so the reader can turn the degree up and
// watch the second one part company with the first. The penalty slider shrinks
// the fitted weights, which is what makes a high degree survivable. The API
// fits and the browser draws.

import { useEffect, useRef, useState } from "react";
import { ApiError, Point } from "@/lib/api";
import { CurveFit, fitCurve } from "@/lib/concepts/polynomial-features";
import {
  CROWD,
  IDEAL_CROWD,
  anotherCrowd,
  formatScore,
} from "./polynomialFeaturesFixtures";

const VIEW = { width: 640, height: 380 };
const PAD = { left: 56, right: 18, top: 18, bottom: 40 };
const DEBOUNCE_MS = 140;

const PENALTIES = [0, 0.001, 0.01, 0.1, 1, 10];

export function CurveThroughACrowd() {
  const [points, setPoints] = useState<Point[]>(CROWD);
  const [degree, setDegree] = useState(1);
  const [penaltyStep, setPenaltyStep] = useState(0);
  const [answer, setAnswer] = useState<CurveFit | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const latest = useRef(0);

  const penalty = PENALTIES[penaltyStep];

  useEffect(() => {
    const ticket = ++latest.current;
    const timer = setTimeout(async () => {
      try {
        const fitted = await fitCurve(points, degree, { penalty });
        if (ticket !== latest.current) return;
        setAnswer(fitted);
        setMessage(null);
      } catch (error) {
        if (ticket !== latest.current) return;
        setAnswer(null);
        setMessage(
          error instanceof ApiError ? error.message : "Something went wrong.",
        );
      }
    }, DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [points, degree, penalty]);

  const heights = points.map((point) => point.x);
  const weights = points.map((point) => point.y);
  const xMin = Math.min(...heights) - 4;
  const xMax = Math.max(...heights) + 4;
  const yMin = Math.min(0, Math.min(...weights) - 6);
  const yMax = Math.max(...weights) + 10;

  const toPixel = (point: Point) => ({
    px:
      PAD.left +
      ((point.x - xMin) / (xMax - xMin)) *
        (VIEW.width - PAD.left - PAD.right),
    py:
      VIEW.height -
      PAD.bottom -
      ((point.y - yMin) / (yMax - yMin)) *
        (VIEW.height - PAD.top - PAD.bottom),
  });

  const inFrame = (value: number) => value >= yMin - 200 && value <= yMax + 200;
  const curvePath = answer
    ? answer.curve
        .map((sample, index) => {
          const { px, py } = toPixel(sample);
          const clamped = Math.max(
            PAD.top - 60,
            Math.min(VIEW.height - PAD.bottom + 60, py),
          );
          return `${index === 0 ? "M" : "L"} ${px.toFixed(2)} ${clamped.toFixed(2)}`;
        })
        .join(" ")
    : "";
  const escapes = answer
    ? answer.curve.some((sample) => !inFrame(sample.y))
    : false;

  const heldOut = new Set(answer?.held_out_indices ?? []);

  const datasets: { label: string; make: () => Point[] }[] = [
    { label: "The measured crowd", make: () => CROWD },
    { label: "An Ideal Case", make: () => IDEAL_CROWD },
    { label: "Another crowd", make: anotherCrowd },
  ];

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3 pb-3">
        {datasets.map((dataset) => (
          <button
            key={dataset.label}
            onClick={() => setPoints(dataset.make())}
            className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
          >
            {dataset.label}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-4 pb-3 text-sm text-slate-600 dark:text-slate-300">
        <label className="flex items-center gap-2">
          Degree
          <input
            type="range"
            min={1}
            max={14}
            step={1}
            value={degree}
            onChange={(event) => setDegree(Number(event.target.value))}
            className="w-40 accent-indigo-600"
          />
          <span className="w-6 font-mono text-sm">{degree}</span>
        </label>
        <label className="flex items-center gap-2">
          Penalty
          <input
            type="range"
            min={0}
            max={PENALTIES.length - 1}
            step={1}
            value={penaltyStep}
            onChange={(event) => setPenaltyStep(Number(event.target.value))}
            className="w-32 accent-amber-600"
          />
          <span className="w-12 font-mono text-sm">{penalty}</span>
        </label>
      </div>

      <svg
        viewBox={`0 0 ${VIEW.width} ${VIEW.height}`}
        className="w-full select-none rounded-lg bg-slate-50 dark:bg-slate-950"
      >
        <line
          x1={PAD.left}
          y1={VIEW.height - PAD.bottom}
          x2={VIEW.width - PAD.right}
          y2={VIEW.height - PAD.bottom}
          className="stroke-slate-300 dark:stroke-slate-700"
          strokeWidth={1}
        />
        <line
          x1={PAD.left}
          y1={PAD.top}
          x2={PAD.left}
          y2={VIEW.height - PAD.bottom}
          className="stroke-slate-300 dark:stroke-slate-700"
          strokeWidth={1}
        />
        <text
          x={VIEW.width - PAD.right}
          y={VIEW.height - 12}
          textAnchor="end"
          className="fill-slate-500 text-[11px] dark:fill-slate-400"
        >
          height in centimetres
        </text>
        <text
          x={PAD.left - 6}
          y={PAD.top + 10}
          textAnchor="end"
          className="fill-slate-500 text-[11px] dark:fill-slate-400"
        >
          kg
        </text>

        {answer && (
          <path
            d={curvePath}
            fill="none"
            strokeWidth={2.5}
            className="stroke-indigo-500"
          />
        )}

        {points.map((point, index) => {
          const { px, py } = toPixel(point);
          const held = heldOut.has(index);
          return (
            <circle
              key={`${point.x}-${point.y}-${index}`}
              cx={px}
              cy={py}
              r={held ? 6 : 5}
              fill={held ? "none" : "#0f172a"}
              className={
                held
                  ? "stroke-amber-500 dark:stroke-amber-400"
                  : "fill-slate-900 dark:fill-slate-200"
              }
              strokeWidth={held ? 2.5 : 0}
            />
          );
        })}
      </svg>

      <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Columns handed over" value={answer ? `${answer.n_terms}` : "…"} />
        <Stat
          label="Score, people it saw"
          value={answer ? formatScore(answer.train_r_squared) : "…"}
        />
        <Stat
          label="Score, people it did not"
          value={answer ? formatScore(answer.held_out_r_squared) : "…"}
        />
        <Stat
          label="Total of the squared misses"
          value={answer ? formatScore(answer.residual_sum_of_squares, 2) : "…"}
        />
      </div>

      <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
        Hollow rings are the seven people held back from every fit on this page.
        The curve is drawn only across the measured range, and at a high degree
        it leaves the frame between the people rather than staying near them.
        {escapes ? " It is off the top or bottom of the frame right now." : ""}
      </p>

      {message && (
        <p className="mt-2 text-sm text-rose-600 dark:text-rose-400">{message}</p>
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
