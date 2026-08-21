"use client";

// A fixed probability curve, a movable threshold, and the decisions that follow.
//
// The curve is the fitted one and it does not move. The slider moves the
// threshold, the horizontal line, and with it the boundary on the hours
// axis, every student's predicted class, and the four cells of the
// confusion matrix. Click a cell and the students it counts light up. What
// stays put is the log loss, because the threshold is a decision rule laid
// on top of the probabilities and changes nothing about them. Every
// decision and every count comes from the API's evaluate endpoint.

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
const VIEW = { width: 640, height: 320 };
const PAD = { left: 52, right: 16, top: 12, bottom: 40 };
const PLOT = { width: VIEW.width - PAD.left - PAD.right, height: VIEW.height - PAD.top - PAD.bottom };

type Cell = "true_positives" | "true_negatives" | "false_positives" | "false_negatives";

const CELLS: { key: Cell; label: string; predicted: number; actual: number; colour: string }[] = [
  { key: "true_positives", label: "true positive", predicted: 1, actual: 1, colour: "#10b981" },
  { key: "false_positives", label: "false positive", predicted: 1, actual: 0, colour: "#f59e0b" },
  { key: "false_negatives", label: "false negative", predicted: 0, actual: 1, colour: "#ef4444" },
  { key: "true_negatives", label: "true negative", predicted: 0, actual: 0, colour: "#64748b" },
];

function toX(hours: number) {
  return PAD.left + ((hours - DOMAIN.xMin) / (DOMAIN.xMax - DOMAIN.xMin)) * PLOT.width;
}
function toY(probability: number) {
  return PAD.top + (1 - probability) * PLOT.height;
}

export function ThresholdExplorer() {
  const [fitted, setFitted] = useState<{ slope: number; intercept: number } | null>(null);
  const [threshold, setThreshold] = useState(0.5);
  const [evaluation, setEvaluation] = useState<LogisticEvaluation | null>(null);
  const [selected, setSelected] = useState<Cell | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const fit = await fitLogistic(WORKED_OUTCOMES, LEARNING_RATE);
        setFitted({ slope: fit.slope, intercept: fit.intercept });
      } catch (error) {
        if (error instanceof ApiError) setMessage(error.message);
        else setMessage("Something went wrong.");
      }
    })();
  }, []);

  useEffect(() => {
    if (!fitted) return;
    const timer = setTimeout(async () => {
      try {
        setEvaluation(await evaluateLogistic(WORKED_OUTCOMES, fitted.slope, fitted.intercept, threshold));
        setMessage(null);
      } catch (error) {
        if (error instanceof ApiError) setMessage(error.message);
      }
    }, 80);
    return () => clearTimeout(timer);
  }, [fitted, threshold]);

  const cellOf = (predicted: number, actual: number): Cell =>
    predicted === 1 ? (actual === 1 ? "true_positives" : "false_positives") : actual === 1 ? "false_negatives" : "true_negatives";
  const colourOf = (cell: Cell) => CELLS.find((each) => each.key === cell)!.colour;

  return (
    <div>
      <label className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
        <span className="w-20">threshold t</span>
        <input type="range" min={0.05} max={0.95} step={0.01} value={threshold} onChange={(event) => setThreshold(Number(event.target.value))} className="flex-1 accent-indigo-600" />
        <span className="w-12 text-right font-mono">{threshold.toFixed(2)}</span>
      </label>

      <svg viewBox={`0 0 ${VIEW.width} ${VIEW.height}`} className="mt-3 w-full select-none rounded-lg bg-slate-50 dark:bg-slate-950">
        {[0, 0.5, 1].map((tick) => (
          <g key={tick}>
            <line x1={PAD.left} y1={toY(tick)} x2={PAD.left + PLOT.width} y2={toY(tick)} stroke="currentColor" className="text-slate-200 dark:text-slate-800" />
            <text x={PAD.left - 8} y={toY(tick) + 4} textAnchor="end" className="fill-slate-400 text-[11px]">{tick}</text>
          </g>
        ))}
        {evaluation && (
          <>
            <path d={evaluation.curve.map((point, index) => `${index === 0 ? "M" : "L"} ${toX(point.x).toFixed(1)} ${toY(point.y).toFixed(1)}`).join(" ")} fill="none" stroke="#6366f1" strokeWidth={2.5} />
            <line x1={PAD.left} y1={toY(threshold)} x2={PAD.left + PLOT.width} y2={toY(threshold)} stroke="#0f172a" strokeDasharray="5 4" className="dark:stroke-slate-300" />
            {evaluation.boundary !== null && evaluation.boundary >= DOMAIN.xMin && evaluation.boundary <= DOMAIN.xMax && (
              <>
                <line x1={toX(evaluation.boundary)} y1={PAD.top} x2={toX(evaluation.boundary)} y2={PAD.top + PLOT.height} stroke="#0f172a" strokeDasharray="5 4" className="dark:stroke-slate-300" />
                <text x={toX(evaluation.boundary) + 4} y={PAD.top + 12} className="fill-slate-600 text-[10px] dark:fill-slate-300">boundary {evaluation.boundary.toFixed(2)} h</text>
              </>
            )}
            {evaluation.outcomes.map((each, index) => {
              const cell = cellOf(each.predicted, each.label);
              const dimmed = selected !== null && selected !== cell;
              return (
                <g key={index} opacity={dimmed ? 0.2 : 1}>
                  <line x1={toX(each.x)} y1={toY(each.label)} x2={toX(each.x)} y2={toY(each.probability)} stroke={colourOf(cell)} strokeWidth={1} strokeDasharray="2 2" />
                  <circle cx={toX(each.x)} cy={toY(each.probability)} r={4} fill={colourOf(cell)} />
                  <circle cx={toX(each.x)} cy={toY(each.label)} r={6} fill={colourOf(cell)} stroke="white" strokeWidth={1.5} />
                </g>
              );
            })}
          </>
        )}
        {[0, 2, 4, 6, 8, 10].map((tick) => (
          <text key={tick} x={toX(tick)} y={PAD.top + PLOT.height + 18} textAnchor="middle" className="fill-slate-400 text-[11px]">{tick}</text>
        ))}
        <text x={PAD.left + PLOT.width / 2} y={VIEW.height - 4} textAnchor="middle" className="fill-slate-500 text-[11px] font-medium dark:fill-slate-400">hours studied</text>
      </svg>
      <p className="mt-1 text-center text-xs text-slate-500 dark:text-slate-500">
        Large dots are the students at their outcomes, small dots the curve&rsquo;s probability for them, coloured by the cell they land in.
      </p>

      <div className="mt-3 grid gap-4 sm:grid-cols-[1fr_1fr]">
        <div className="grid grid-cols-2 gap-2">
          {CELLS.map((cell) => (
            <button
              key={cell.key}
              onClick={() => setSelected((current) => (current === cell.key ? null : cell.key))}
              className={`rounded-lg border-2 px-3 py-2 text-left transition ${selected === cell.key ? "border-slate-900 dark:border-slate-100" : "border-transparent"}`}
              style={{ backgroundColor: `${cell.colour}22` }}
            >
              <div className="text-[11px] font-medium" style={{ color: cell.colour }}>{cell.label}</div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400">predicted {cell.predicted === 1 ? "pass" : "fail"}, was {cell.actual === 1 ? "pass" : "fail"}</div>
              <div className="font-mono text-xl font-semibold text-slate-900 dark:text-slate-100">{evaluation ? evaluation.confusion[cell.key] : "…"}</div>
            </button>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-2 self-start">
          <Stat label="accuracy" value={evaluation ? evaluation.accuracy.toFixed(3) : "…"} />
          <Stat label="log loss, unchanged" value={evaluation ? evaluation.log_loss.toFixed(4) : "…"} />
          <Stat label="score threshold, logit(t)" value={Math.log(threshold / (1 - threshold)).toFixed(3)} />
          <Stat label="boundary (logit(t) − α) / β" value={evaluation && evaluation.boundary !== null ? `${evaluation.boundary.toFixed(3)} h` : "…"} />
        </div>
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
