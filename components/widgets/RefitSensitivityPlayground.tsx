"use client";

// Three nearly identical samples, and how far apart their fits land.
//
// Sample A is the noisy throw. Sample B is the same fifteen readings with
// one of them moved a metre and a half. Sample C is a fresh set of readings
// of the same throw with its own noise. Each is fitted with the degree-9
// polynomial at the chosen penalty and the three curves are drawn on one
// axis, with each fit's largest coefficient beside it. With no penalty the
// curves disagree between the readings and the coefficients run to tens of
// thousands. At a penalty of one the three curves lie on top of each other.
// Every fit is the API's; the browser draws the overlay.

import { useEffect, useState } from "react";
import { ApiError, PenalisedFit, Point, fitPenalised } from "@/lib/api";

const SAMPLE_A: Point[] = [
  { x: 0.0, y: 0.7 },
  { x: 0.29, y: 5.2 },
  { x: 0.57, y: 9.5 },
  { x: 0.86, y: 13.0 },
  { x: 1.14, y: 16.9 },
  { x: 1.43, y: 18.1 },
  { x: 1.71, y: 19.4 },
  { x: 2.0, y: 21.0 },
  { x: 2.29, y: 19.6 },
  { x: 2.57, y: 19.1 },
  { x: 2.86, y: 16.8 },
  { x: 3.14, y: 13.6 },
  { x: 3.43, y: 11.1 },
  { x: 3.71, y: 6.2 },
  { x: 4.0, y: 1.2 },
];

// Sample A with the reading at two seconds moved from 21.0 to 22.5.
const MOVED_INDEX = 7;
const SAMPLE_B: Point[] = SAMPLE_A.map((point, index) =>
  index === MOVED_INDEX ? { x: point.x, y: 22.5 } : point,
);

// A second set of readings of the same throw, with its own noise.
const SAMPLE_C: Point[] = [
  { x: 0.0, y: 0.0 },
  { x: 0.29, y: 5.49 },
  { x: 0.57, y: 9.66 },
  { x: 0.86, y: 13.01 },
  { x: 1.14, y: 16.18 },
  { x: 1.43, y: 17.98 },
  { x: 1.71, y: 19.92 },
  { x: 2.0, y: 21.2 },
  { x: 2.29, y: 19.82 },
  { x: 2.57, y: 18.66 },
  { x: 2.86, y: 17.44 },
  { x: 3.14, y: 14.67 },
  { x: 3.43, y: 11.03 },
  { x: 3.71, y: 6.13 },
  { x: 4.0, y: 1.58 },
];

const SAMPLES = [
  { key: "A", label: "Sample A", points: SAMPLE_A, colour: "#6366f1" },
  { key: "B", label: "Sample B, one reading moved", points: SAMPLE_B, colour: "#f59e0b" },
  { key: "C", label: "Sample C, fresh noise", points: SAMPLE_C, colour: "#10b981" },
];

const PENALTY_CHOICES = [
  { label: "none", value: 0 },
  { label: "0.001", value: 0.001 },
  { label: "0.1", value: 0.1 },
  { label: "1", value: 1 },
];

const VIEW = { width: 640, height: 380 };
const PAD = { left: 52, right: 16, top: 16, bottom: 44 };
const PLOT = { width: VIEW.width - PAD.left - PAD.right, height: VIEW.height - PAD.top - PAD.bottom };
const DOMAIN = { xMin: 0, xMax: 4, yMin: -2, yMax: 26 };

function toPixel(point: Point) {
  const px = PAD.left + ((point.x - DOMAIN.xMin) / (DOMAIN.xMax - DOMAIN.xMin)) * PLOT.width;
  const raw = PAD.top + (1 - (point.y - DOMAIN.yMin) / (DOMAIN.yMax - DOMAIN.yMin)) * PLOT.height;
  return { px, py: Math.min(PAD.top + PLOT.height, Math.max(PAD.top, raw)) };
}

function largest(fit: PenalisedFit): number {
  return Math.max(...fit.coefficients.map((each) => Math.abs(each.value)));
}

function formatLarge(value: number): string {
  if (Math.abs(value) >= 1000) return value.toLocaleString("en-GB", { maximumFractionDigits: 0 });
  return value.toFixed(2);
}

export function RefitSensitivityPlayground() {
  const [penalty, setPenalty] = useState(0);
  const [shown, setShown] = useState("A");
  const [fits, setFits] = useState<(PenalisedFit | null)[]>([null, null, null]);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setFits(await Promise.all(SAMPLES.map((sample) => fitPenalised(sample.points, "ridge", penalty))));
        setMessage(null);
      } catch (error) {
        if (error instanceof ApiError) setMessage(error.message);
        else setMessage("Something went wrong.");
      }
    })();
  }, [penalty]);

  const shownSample = SAMPLES.find((sample) => sample.key === shown) ?? SAMPLES[0];

  return (
    <div>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 pb-3 text-sm text-slate-600 dark:text-slate-300">
        <span className="flex items-center gap-1">
          penalty
          {PENALTY_CHOICES.map((choice) => (
            <button
              key={choice.label}
              onClick={() => setPenalty(choice.value)}
              className={`rounded-md border px-2 py-1 text-xs font-medium transition ${
                penalty === choice.value
                  ? "border-indigo-500 bg-indigo-50 text-indigo-700 dark:border-indigo-400 dark:bg-indigo-950/40 dark:text-indigo-200"
                  : "border-slate-300 bg-white text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
              }`}
            >
              {choice.label}
            </button>
          ))}
        </span>
        <span className="ml-auto flex items-center gap-1">
          points shown
          {SAMPLES.map((sample) => (
            <button
              key={sample.key}
              onClick={() => setShown(sample.key)}
              className={`rounded-md border px-2 py-1 text-xs font-medium transition ${
                shown === sample.key
                  ? "border-slate-500 bg-slate-100 text-slate-900 dark:border-slate-400 dark:bg-slate-800 dark:text-slate-100"
                  : "border-slate-300 bg-white text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
              }`}
            >
              {sample.key}
            </button>
          ))}
        </span>
      </div>

      <svg viewBox={`0 0 ${VIEW.width} ${VIEW.height}`} className="w-full select-none rounded-lg bg-slate-50 dark:bg-slate-950">
        {[0, 5, 10, 15, 20, 25].map((tick) => {
          const { py } = toPixel({ x: 0, y: tick });
          return (
            <g key={`h-${tick}`}>
              <line x1={PAD.left} y1={py} x2={PAD.left + PLOT.width} y2={py} stroke="currentColor" className="text-slate-200 dark:text-slate-800" />
              <text x={PAD.left - 8} y={py + 4} textAnchor="end" className="fill-slate-400 text-[11px]">{tick}</text>
            </g>
          );
        })}
        {[0, 1, 2, 3, 4].map((tick) => (
          <text key={`t-${tick}`} x={toPixel({ x: tick, y: 0 }).px} y={PAD.top + PLOT.height + 18} textAnchor="middle" className="fill-slate-400 text-[11px]">{tick}</text>
        ))}
        {shownSample.points.map((point, index) => {
          const { px, py } = toPixel(point);
          const moved = shownSample.key === "B" && index === MOVED_INDEX;
          return <circle key={index} cx={px} cy={py} r={moved ? 7 : 5} fill={moved ? "#f59e0b" : "#64748b"} stroke="white" strokeWidth={1.5} />;
        })}
        {fits.map((fit, index) =>
          fit ? (
            <path
              key={SAMPLES[index].key}
              d={fit.curve.map((point, position) => {
                const { px, py } = toPixel(point);
                return `${position === 0 ? "M" : "L"} ${px.toFixed(1)} ${py.toFixed(1)}`;
              }).join(" ")}
              fill="none"
              stroke={SAMPLES[index].colour}
              strokeWidth={2.5}
              opacity={0.9}
            />
          ) : null,
        )}
        <text x={PAD.left + PLOT.width / 2} y={VIEW.height - 6} textAnchor="middle" className="fill-slate-500 text-xs font-medium dark:fill-slate-400">Time (s)</text>
      </svg>

      <div className="mt-3 overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left dark:border-slate-800">
              <th className="py-1.5 pr-4 font-semibold text-slate-600 dark:text-slate-400">Sample</th>
              <th className="py-1.5 pr-4 font-semibold text-slate-600 dark:text-slate-400">Training R²</th>
              <th className="py-1.5 pr-4 font-semibold text-slate-600 dark:text-slate-400">Largest coefficient</th>
              <th className="py-1.5 font-semibold text-slate-600 dark:text-slate-400">Coefficient on t, t², t³</th>
            </tr>
          </thead>
          <tbody className="font-mono text-slate-800 dark:text-slate-200">
            {SAMPLES.map((sample, index) => {
              const fit = fits[index];
              return (
                <tr key={sample.key} className="border-b border-slate-100 last:border-0 dark:border-slate-800/60">
                  <td className="py-1.5 pr-4 font-sans" style={{ color: sample.colour }}>{sample.label}</td>
                  <td className="py-1.5 pr-4">{fit ? fit.r_squared.toFixed(4) : "…"}</td>
                  <td className="py-1.5 pr-4">{fit ? formatLarge(largest(fit)) : "…"}</td>
                  <td className="py-1.5">{fit ? fit.coefficients.slice(0, 3).map((each) => formatLarge(each.value)).join(", ") : "…"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {message && (
        <p className="mt-3 text-sm text-amber-600 dark:text-amber-400">{message}</p>
      )}
    </div>
  );
}
