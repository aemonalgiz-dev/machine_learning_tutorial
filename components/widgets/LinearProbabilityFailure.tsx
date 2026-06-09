"use client";

// A straight line fitted to zeros and ones, and where it stops being a probability.
//
// The twelve students sit on the floor and the ceiling of the plot, and the
// ordinary least-squares line through them is drawn with the band between
// zero and one shaded. Left of about one and a half hours the line is below
// zero; right of seven it is above one, and neither stretch can be read as a
// chance. The toggle swaps the line for the fitted logistic curve, which
// never leaves the band. Both fits come from the API.

import { useEffect, useState } from "react";
import { ApiError, LogisticFit, Outcome, fitLogistic } from "@/lib/api";

const WORKED_OUTCOMES: Outcome[] = [
  { x: 1, label: 0 },
  { x: 1.5, label: 0 },
  { x: 2, label: 0 },
  { x: 3, label: 0 },
  { x: 3.5, label: 0 },
  { x: 5, label: 0 },
  { x: 4, label: 1 },
  { x: 4.5, label: 1 },
  { x: 5.5, label: 1 },
  { x: 6, label: 1 },
  { x: 7, label: 1 },
  { x: 8, label: 1 },
];

const LEARNING_RATE = 0.5;
const DOMAIN = { xMin: 0, xMax: 10, yMin: -0.5, yMax: 1.5 };
const VIEW = { width: 640, height: 320 };
const PAD = { left: 52, right: 16, top: 12, bottom: 44 };
const PLOT = { width: VIEW.width - PAD.left - PAD.right, height: VIEW.height - PAD.top - PAD.bottom };

function toX(hours: number) {
  return PAD.left + ((hours - DOMAIN.xMin) / (DOMAIN.xMax - DOMAIN.xMin)) * PLOT.width;
}
function toY(value: number) {
  return PAD.top + (1 - (value - DOMAIN.yMin) / (DOMAIN.yMax - DOMAIN.yMin)) * PLOT.height;
}

export function LinearProbabilityFailure() {
  const [fit, setFit] = useState<LogisticFit | null>(null);
  const [showCurve, setShowCurve] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setFit(await fitLogistic(WORKED_OUTCOMES, LEARNING_RATE));
      } catch (error) {
        if (error instanceof ApiError) setMessage(error.message);
        else setMessage("Something went wrong.");
      }
    })();
  }, []);

  const line = fit ? fit.straight_line : null;
  const lineAt = (hours: number) => (line ? line.intercept + line.slope * hours : 0);
  const belowZeroUntil = line ? -line.intercept / line.slope : null;
  const aboveOneFrom = line ? (1 - line.intercept) / line.slope : null;

  return (
    <div>
      <div className="flex gap-1 pb-3">
        {[
          { key: false, label: "the straight line" },
          { key: true, label: "the logistic curve" },
        ].map((choice) => (
          <button
            key={String(choice.key)}
            onClick={() => setShowCurve(choice.key)}
            className={`rounded-md border px-3 py-1 text-sm font-medium transition ${
              showCurve === choice.key
                ? "border-indigo-500 bg-indigo-50 text-indigo-700 dark:border-indigo-400 dark:bg-indigo-950/40 dark:text-indigo-200"
                : "border-slate-300 bg-white text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
            }`}
          >
            {choice.label}
          </button>
        ))}
      </div>
      <svg viewBox={`0 0 ${VIEW.width} ${VIEW.height}`} className="w-full select-none rounded-lg bg-slate-50 dark:bg-slate-950">
        <rect x={PAD.left} y={toY(1)} width={PLOT.width} height={toY(0) - toY(1)} className="fill-emerald-100/70 dark:fill-emerald-900/30" />
        {[-0.5, 0, 0.5, 1, 1.5].map((tick) => (
          <g key={tick}>
            <line x1={PAD.left} y1={toY(tick)} x2={PAD.left + PLOT.width} y2={toY(tick)} stroke="currentColor" className={tick === 0 || tick === 1 ? "text-slate-400 dark:text-slate-600" : "text-slate-200 dark:text-slate-800"} />
            <text x={PAD.left - 8} y={toY(tick) + 4} textAnchor="end" className="fill-slate-400 text-[11px]">{tick}</text>
          </g>
        ))}
        {line && !showCurve && (
          <>
            <line x1={toX(DOMAIN.xMin)} y1={toY(lineAt(DOMAIN.xMin))} x2={toX(DOMAIN.xMax)} y2={toY(lineAt(DOMAIN.xMax))} stroke="#6366f1" strokeWidth={2.5} />
            {belowZeroUntil !== null && (
              <line x1={toX(DOMAIN.xMin)} y1={toY(lineAt(DOMAIN.xMin))} x2={toX(belowZeroUntil)} y2={toY(0)} stroke="#ef4444" strokeWidth={4} />
            )}
            {aboveOneFrom !== null && (
              <line x1={toX(aboveOneFrom)} y1={toY(1)} x2={toX(DOMAIN.xMax)} y2={toY(lineAt(DOMAIN.xMax))} stroke="#ef4444" strokeWidth={4} />
            )}
          </>
        )}
        {fit && showCurve && (
          <path d={fit.curve.map((point, index) => `${index === 0 ? "M" : "L"} ${toX(point.x).toFixed(1)} ${toY(point.y).toFixed(1)}`).join(" ")} fill="none" stroke="#6366f1" strokeWidth={2.5} />
        )}
        {WORKED_OUTCOMES.map((point, index) => (
          <circle key={index} cx={toX(point.x)} cy={toY(point.label)} r={6} className={point.label === 1 ? "fill-emerald-600 stroke-white dark:stroke-slate-900" : "fill-rose-500 stroke-white dark:stroke-slate-900"} strokeWidth={1.5} />
        ))}
        {[0, 2, 4, 6, 8, 10].map((tick) => (
          <text key={tick} x={toX(tick)} y={PAD.top + PLOT.height + 18} textAnchor="middle" className="fill-slate-400 text-[11px]">{tick}</text>
        ))}
        <text x={PAD.left + PLOT.width / 2} y={VIEW.height - 6} textAnchor="middle" className="fill-slate-500 text-xs font-medium dark:fill-slate-400">hours studied</text>
      </svg>
      <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
        {line && !showCurve
          ? `The line is below zero for anyone who studied less than ${belowZeroUntil!.toFixed(1)} hours and above one past ${aboveOneFrom!.toFixed(1)} hours, the red stretches. At one hour it predicts ${lineAt(1).toFixed(2)} and at eight hours ${lineAt(8).toFixed(2)}.`
          : "The curve stays inside the shaded band at every number of hours, so every value on it can be read as a chance."}
      </p>
      {message && (
        <p className="mt-3 text-sm text-amber-600 dark:text-amber-400">{message}</p>
      )}
    </div>
  );
}
