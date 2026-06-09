"use client";

// The intercept and the coefficient, each on its own slider, and one hour's
// worth of movement read three ways.
//
// The curve starts on the fitted values and the sliders take it wherever
// the reader likes. Moving α slides the transition left or right; moving β
// sharpens or flattens it and flips it when it crosses zero. The one-hour
// panel picks a starting study time and shows what one more hour does to
// the score, the odds and the probability: the score and log-odds move by
// exactly β, the odds are multiplied by exactly e^β, and the probability
// moves by an amount that depends on where you started. The curve and every
// number under it come from the API's evaluate endpoint, which scores
// whatever curve the sliders name.

import { useEffect, useState } from "react";
import { ApiError, LogisticEvaluation, Outcome, evaluateLogistic, fitLogistic } from "@/lib/api";

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
const DOMAIN = { xMin: 0, xMax: 10 };
const VIEW = { width: 640, height: 300 };
const PAD = { left: 52, right: 16, top: 12, bottom: 40 };
const PLOT = { width: VIEW.width - PAD.left - PAD.right, height: VIEW.height - PAD.top - PAD.bottom };

const ALPHA = "text-indigo-600 dark:text-indigo-300";
const BETA = "text-amber-600 dark:text-amber-300";

function toX(hours: number) {
  return PAD.left + ((hours - DOMAIN.xMin) / (DOMAIN.xMax - DOMAIN.xMin)) * PLOT.width;
}
function toY(probability: number) {
  return PAD.top + (1 - probability) * PLOT.height;
}
function sigmoid(z: number) {
  return 1 / (1 + Math.exp(-z));
}

export function CoefficientExplorer() {
  const [fitted, setFitted] = useState<{ slope: number; intercept: number } | null>(null);
  const [slope, setSlope] = useState(1.69);
  const [intercept, setIntercept] = useState(-7.18);
  const [start, setStart] = useState(3);
  const [evaluation, setEvaluation] = useState<LogisticEvaluation | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const fit = await fitLogistic(WORKED_OUTCOMES, LEARNING_RATE);
        setFitted({ slope: fit.slope, intercept: fit.intercept });
        setSlope(fit.slope);
        setIntercept(fit.intercept);
      } catch (error) {
        if (error instanceof ApiError) setMessage(error.message);
        else setMessage("Something went wrong.");
      }
    })();
  }, []);

  useEffect(() => {
    const timer = setTimeout(async () => {
      try {
        setEvaluation(await evaluateLogistic(WORKED_OUTCOMES, slope, intercept));
        setMessage(null);
      } catch (error) {
        if (error instanceof ApiError) setMessage(error.message);
      }
    }, 100);
    return () => clearTimeout(timer);
  }, [slope, intercept]);

  // The curve is drawn across the whole axis, past the data's ends, so a
  // shifted transition stays visible; the API's curve covers only the data.
  const curve = Array.from({ length: 101 }, (_, index) => {
    const hours = DOMAIN.xMin + ((DOMAIN.xMax - DOMAIN.xMin) * index) / 100;
    return `${index === 0 ? "M" : "L"} ${toX(hours).toFixed(1)} ${toY(sigmoid(intercept + slope * hours)).toFixed(1)}`;
  }).join(" ");
  const crossing = Math.abs(slope) > 1e-9 ? -intercept / slope : null;

  const before = { score: intercept + slope * start };
  const after = { score: intercept + slope * (start + 1) };
  const beforeP = sigmoid(before.score);
  const afterP = sigmoid(after.score);
  const beforeOdds = beforeP / (1 - beforeP);
  const afterOdds = afterP / (1 - afterP);

  return (
    <div>
      <div className="grid gap-x-6 gap-y-2 pb-3 sm:grid-cols-2">
        <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
          <span className={`w-16 font-mono ${ALPHA}`}>α</span>
          <input type="range" min={-16} max={4} step={0.05} value={intercept} onChange={(event) => setIntercept(Number(event.target.value))} className="flex-1 accent-indigo-600" />
          <span className="w-14 text-right font-mono">{intercept.toFixed(2)}</span>
        </label>
        <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
          <span className={`w-16 font-mono ${BETA}`}>β</span>
          <input type="range" min={-3} max={4} step={0.01} value={slope} onChange={(event) => setSlope(Number(event.target.value))} className="flex-1 accent-amber-500" />
          <span className="w-14 text-right font-mono">{slope.toFixed(2)}</span>
        </label>
      </div>

      <svg viewBox={`0 0 ${VIEW.width} ${VIEW.height}`} className="w-full select-none rounded-lg bg-slate-50 dark:bg-slate-950">
        {[0, 0.5, 1].map((tick) => (
          <g key={tick}>
            <line x1={PAD.left} y1={toY(tick)} x2={PAD.left + PLOT.width} y2={toY(tick)} stroke="currentColor" className={tick === 0.5 ? "text-slate-400 dark:text-slate-600" : "text-slate-200 dark:text-slate-800"} strokeDasharray={tick === 0.5 ? "4 3" : undefined} />
            <text x={PAD.left - 8} y={toY(tick) + 4} textAnchor="end" className="fill-slate-400 text-[11px]">{tick}</text>
          </g>
        ))}
        {WORKED_OUTCOMES.map((point, index) => (
          <circle key={index} cx={toX(point.x)} cy={toY(point.label)} r={5} className={point.label === 1 ? "fill-emerald-600" : "fill-rose-500"} opacity={0.7} />
        ))}
        <path d={curve} fill="none" stroke="#6366f1" strokeWidth={2.5} />
        {crossing !== null && crossing >= DOMAIN.xMin && crossing <= DOMAIN.xMax && (
          <>
            <line x1={toX(crossing)} y1={PAD.top} x2={toX(crossing)} y2={PAD.top + PLOT.height} stroke="#0f172a" strokeDasharray="5 4" className="dark:stroke-slate-300" />
            <text x={toX(crossing) + 4} y={PAD.top + 12} className="fill-slate-600 text-[10px] dark:fill-slate-300">p = ½ at {crossing.toFixed(2)} h</text>
          </>
        )}
        <line x1={toX(start)} y1={toY(beforeP)} x2={toX(start + 1)} y2={toY(afterP)} stroke="#10b981" strokeWidth={2} />
        <circle cx={toX(start)} cy={toY(beforeP)} r={6} fill="#10b981" stroke="white" strokeWidth={1.5} />
        <circle cx={toX(start + 1)} cy={toY(afterP)} r={6} fill="none" stroke="#10b981" strokeWidth={2.5} />
        {[0, 2, 4, 6, 8, 10].map((tick) => (
          <text key={tick} x={toX(tick)} y={PAD.top + PLOT.height + 18} textAnchor="middle" className="fill-slate-400 text-[11px]">{tick}</text>
        ))}
        <text x={PAD.left + PLOT.width / 2} y={VIEW.height - 4} textAnchor="middle" className="fill-slate-500 text-[11px] font-medium dark:fill-slate-400">hours studied</text>
      </svg>

      <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
        <label className="flex flex-1 items-center gap-2">
          start at
          <input type="range" min={0} max={9} step={0.5} value={start} onChange={(event) => setStart(Number(event.target.value))} className="flex-1 accent-emerald-600" />
          <span className="w-10 font-mono">{start.toFixed(1)} h</span>
        </label>
        <button
          onClick={() => {
            if (!fitted) return;
            setSlope(fitted.slope);
            setIntercept(fitted.intercept);
          }}
          disabled={!fitted}
          className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-100 disabled:opacity-40 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
        >
          Back to the fitted curve
        </button>
      </div>

      <div className="mt-3 overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left dark:border-slate-800">
              <th className="py-1.5 pr-4 font-semibold text-slate-600 dark:text-slate-400"></th>
              <th className="py-1.5 pr-4 font-semibold text-slate-600 dark:text-slate-400">at {start.toFixed(1)} h</th>
              <th className="py-1.5 pr-4 font-semibold text-slate-600 dark:text-slate-400">at {(start + 1).toFixed(1)} h</th>
              <th className="py-1.5 font-semibold text-emerald-700 dark:text-emerald-300">one more hour</th>
            </tr>
          </thead>
          <tbody className="font-mono text-slate-800 dark:text-slate-200">
            <tr className="border-b border-slate-100 dark:border-slate-800/60">
              <td className="py-1.5 pr-4 font-sans text-slate-600 dark:text-slate-400">score z, the log-odds</td>
              <td className="py-1.5 pr-4">{before.score.toFixed(3)}</td>
              <td className="py-1.5 pr-4">{after.score.toFixed(3)}</td>
              <td className="py-1.5 text-emerald-700 dark:text-emerald-300">+ {slope.toFixed(3)}, always β</td>
            </tr>
            <tr className="border-b border-slate-100 dark:border-slate-800/60">
              <td className="py-1.5 pr-4 font-sans text-slate-600 dark:text-slate-400">odds</td>
              <td className="py-1.5 pr-4">{beforeOdds.toFixed(4)}</td>
              <td className="py-1.5 pr-4">{afterOdds.toFixed(4)}</td>
              <td className="py-1.5 text-emerald-700 dark:text-emerald-300">× {Math.exp(slope).toFixed(3)}, always e^β</td>
            </tr>
            <tr>
              <td className="py-1.5 pr-4 font-sans text-slate-600 dark:text-slate-400">probability p</td>
              <td className="py-1.5 pr-4">{beforeP.toFixed(4)}</td>
              <td className="py-1.5 pr-4">{afterP.toFixed(4)}</td>
              <td className="py-1.5 text-emerald-700 dark:text-emerald-300">+ {(afterP - beforeP).toFixed(4)}, depends on the start</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="σ(α), p at zero hours" value={sigmoid(intercept).toFixed(4)} />
        <Stat label="e^β, the odds multiplier" value={Math.exp(slope).toFixed(3)} />
        <Stat label="accuracy at ½" value={evaluation ? evaluation.accuracy.toFixed(3) : "…"} />
        <Stat label="log loss" value={evaluation ? evaluation.log_loss.toFixed(4) : "…"} />
      </div>
      {message && (
        <p className="mt-3 text-sm text-amber-600 dark:text-amber-400">{message}</p>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-slate-100 px-3 py-2 dark:bg-slate-800">
      <div className="text-xs text-slate-500 dark:text-slate-400">{label}</div>
      <div className="font-mono text-base font-semibold text-slate-900 dark:text-slate-100">{value}</div>
    </div>
  );
}
