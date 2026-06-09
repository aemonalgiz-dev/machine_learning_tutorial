"use client";

// The climb, recorded pass by pass, on the log loss over both coefficients.
//
// The API records every pass of the library's gradient ascent and samples
// the log loss over intercept and slope, and this scrubs through the record
// with each panel following the same pass: the path across the loss
// contours, the probability curve at that pass, the per-student gaps y − p
// whose two sums are the gradient, and the coefficients, loss and accuracy
// against pass number. On the overlapping students the gaps come into
// balance and the climb settles. On separated students accuracy reaches one
// early and the slope keeps growing for as long as the budget allows, which
// is the page's separation section. Every number is the library's.

import { useEffect, useState } from "react";
import { ApiError, LogisticEvaluation, LogisticPass, LogisticWalk, Outcome, evaluateLogistic, walkLogistic } from "@/lib/api";
import { ContourMap } from "./ContourMap";

export const OVERLAPPING_STUDENTS: Outcome[] = [
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

export const SEPARATED_STUDENTS: Outcome[] = [
  { x: 1, label: 0 },
  { x: 1.5, label: 0 },
  { x: 2, label: 0 },
  { x: 2.5, label: 0 },
  { x: 3, label: 0 },
  { x: 3.5, label: 0 },
  { x: 5.5, label: 1 },
  { x: 6, label: 1 },
  { x: 6.5, label: 1 },
  { x: 7, label: 1 },
  { x: 7.5, label: 1 },
  { x: 8, label: 1 },
];

export type WalkPanel = "surface" | "curve" | "gaps" | "traces";

const PANEL = { width: 320, height: 220 };
const PAD = { left: 46, right: 10, top: 12, bottom: 30 };
const PLOT = { width: PANEL.width - PAD.left - PAD.right, height: PANEL.height - PAD.top - PAD.bottom };
const DOMAIN = { xMin: 0, xMax: 10 };

export function LogisticWalkPlayground({
  points = OVERLAPPING_STUDENTS,
  panels = ["surface", "curve", "gaps", "traces"],
  maxEpochs = 300,
  learningRate = 0.5,
}: {
  points?: Outcome[];
  panels?: WalkPanel[];
  maxEpochs?: number;
  learningRate?: number;
}) {
  const [walk, setWalk] = useState<LogisticWalk | null>(null);
  const [index, setIndex] = useState(0);
  const [evaluation, setEvaluation] = useState<LogisticEvaluation | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const recorded = await walkLogistic(points, learningRate, maxEpochs);
        setWalk(recorded);
        setIndex(recorded.passes.length);
        setMessage(null);
      } catch (error) {
        if (error instanceof ApiError) setMessage(error.message);
        else setMessage("Something went wrong.");
      }
    })();
  }, [points, learningRate, maxEpochs]);

  const pass = walk && index > 0 ? walk.passes[Math.min(index, walk.passes.length) - 1] : null;
  const intercept = pass ? pass.intercept : 0;
  const slope = pass ? pass.slope : 0;

  useEffect(() => {
    if (!walk) return;
    const timer = setTimeout(async () => {
      try {
        setEvaluation(await evaluateLogistic(points, slope, intercept));
      } catch (error) {
        if (error instanceof ApiError) setMessage(error.message);
      }
    }, 60);
    return () => clearTimeout(timer);
  }, [walk, points, slope, intercept]);

  const count = walk ? walk.passes.length : 0;
  const toPassX = (position: number) => PAD.left + (position / Math.max(1, count)) * PLOT.width;
  const curveX = (hours: number) => PAD.left + ((hours - DOMAIN.xMin) / (DOMAIN.xMax - DOMAIN.xMin)) * PLOT.width;
  const curveY = (probability: number) => PAD.top + (1 - probability) * PLOT.height;

  return (
    <div>
      <label className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
        pass
        <input type="range" min={0} max={count} step={1} value={Math.min(index, count)} onChange={(event) => setIndex(Number(event.target.value))} className="flex-1 accent-slate-700 dark:accent-slate-300" />
        <span className="w-24 text-right font-mono">{Math.min(index, count)} of {count}</span>
      </label>
      <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-5">
        <Stat label="α" value={intercept.toFixed(3)} />
        <Stat label="β" value={slope.toFixed(3)} />
        <Stat label="log loss" value={pass ? pass.log_loss.toFixed(4) : walk ? walk.start_log_loss.toFixed(4) : "…"} />
        <Stat label="accuracy at ½" value={pass ? pass.accuracy.toFixed(3) : "0.500"} />
        <Stat label="verdict on this budget" value={walk ? (walk.converged ? "converged" : "passes ran out") : "…"} />
      </div>

      <div className={`mt-3 grid gap-4 ${panels.length > 1 ? "sm:grid-cols-2" : ""}`}>
        {panels.includes("surface") && walk && (
          <Frame title="The path across the log loss">
            <ContourMap firstAxis={walk.intercept_axis} secondAxis={walk.slope_axis} values={walk.log_losses} width={320} height={220} firstLabel="intercept α" secondLabel="slope β">
              {({ toX, toY, clampX, clampY }) => (
                <>
                  <path d={[{ intercept: 0, slope: 0 }, ...walk.passes.slice(0, Math.min(index, count))].map((each, position) => `${position === 0 ? "M" : "L"} ${clampX(toX(each.intercept)).toFixed(1)} ${clampY(toY(each.slope)).toFixed(1)}`).join(" ")} fill="none" stroke="#0f172a" strokeWidth={1.5} opacity={0.85} />
                  <circle cx={clampX(toX(intercept))} cy={clampY(toY(slope))} r={5} fill="#0f172a" stroke="white" strokeWidth={1.5} />
                </>
              )}
            </ContourMap>
          </Frame>
        )}

        {panels.includes("curve") && (
          <Frame title="The probability curve at this pass">
            <svg viewBox={`0 0 ${PANEL.width} ${PANEL.height}`} className="w-full select-none rounded-md bg-slate-50 dark:bg-slate-950">
              {[0, 0.5, 1].map((tick) => (
                <g key={tick}>
                  <line x1={PAD.left} y1={curveY(tick)} x2={PAD.left + PLOT.width} y2={curveY(tick)} stroke="currentColor" className="text-slate-200 dark:text-slate-800" />
                  <text x={PAD.left - 6} y={curveY(tick) + 4} textAnchor="end" className="fill-slate-400 text-[10px]">{tick}</text>
                </g>
              ))}
              {points.map((point, position) => (
                <circle key={position} cx={curveX(point.x)} cy={curveY(point.label)} r={4} className={point.label === 1 ? "fill-emerald-600" : "fill-rose-500"} />
              ))}
              {evaluation && (
                <path d={evaluation.curve.map((point, position) => `${position === 0 ? "M" : "L"} ${curveX(point.x).toFixed(1)} ${curveY(point.y).toFixed(1)}`).join(" ")} fill="none" stroke="#6366f1" strokeWidth={2.5} />
              )}
              {[0, 5, 10].map((tick) => (
                <text key={tick} x={curveX(tick)} y={PAD.top + PLOT.height + 14} textAnchor="middle" className="fill-slate-400 text-[10px]">{tick}</text>
              ))}
              <text x={PAD.left + PLOT.width / 2} y={PANEL.height - 4} textAnchor="middle" className="fill-slate-500 text-[10px] font-medium dark:fill-slate-400">hours studied</text>
            </svg>
          </Frame>
        )}

        {panels.includes("gaps") && evaluation && (
          <Frame title="The gaps y − p, per student">
            <svg viewBox={`0 0 ${PANEL.width} ${PANEL.height}`} className="w-full select-none rounded-md bg-slate-50 dark:bg-slate-950">
              {(() => {
                const zero = PAD.top + PLOT.height / 2;
                const toGapY = (gap: number) => zero - gap * (PLOT.height / 2);
                return (
                  <>
                    <line x1={PAD.left} y1={zero} x2={PAD.left + PLOT.width} y2={zero} stroke="currentColor" className="text-slate-400 dark:text-slate-600" />
                    <text x={PAD.left - 6} y={toGapY(1) + 4} textAnchor="end" className="fill-slate-400 text-[10px]">1</text>
                    <text x={PAD.left - 6} y={zero + 4} textAnchor="end" className="fill-slate-400 text-[10px]">0</text>
                    <text x={PAD.left - 6} y={toGapY(-1) + 4} textAnchor="end" className="fill-slate-400 text-[10px]">−1</text>
                    {evaluation.outcomes.map((each, position) => (
                      <rect key={position} x={curveX(each.x) - 5} y={Math.min(zero, toGapY(each.gap))} width={10} height={Math.abs(toGapY(each.gap) - zero)} fill={each.gap >= 0 ? "#10b981" : "#ef4444"} opacity={0.85} />
                    ))}
                    {[0, 5, 10].map((tick) => (
                      <text key={tick} x={curveX(tick)} y={PAD.top + PLOT.height + 14} textAnchor="middle" className="fill-slate-400 text-[10px]">{tick}</text>
                    ))}
                  </>
                );
              })()}
              <text x={PAD.left + PLOT.width / 2} y={PANEL.height - 4} textAnchor="middle" className="fill-slate-500 text-[10px] font-medium dark:fill-slate-400">hours studied</text>
            </svg>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <Stat label="Σ (y − p), the α gradient" value={evaluation.gap_total.toFixed(4)} />
              <Stat label="Σ (y − p)·x, the β gradient" value={evaluation.weighted_gap_total.toFixed(4)} />
            </div>
          </Frame>
        )}

        {panels.includes("traces") && walk && (
          <Frame title="Slope, log loss and accuracy against pass">
            <svg viewBox={`0 0 ${PANEL.width} ${PANEL.height}`} className="w-full select-none rounded-md bg-slate-50 dark:bg-slate-950">
              {(() => {
                const slopes = walk.passes.map((each) => each.slope);
                const slopeTop = Math.max(0.1, ...slopes.map((value) => Math.abs(value))) * 1.05;
                const slopeY = (value: number) => PAD.top + (1 - Math.max(0, value) / slopeTop) * PLOT.height;
                const lossTop = Math.max(walk.start_log_loss, ...walk.passes.map((each) => each.log_loss)) * 1.05;
                const lossY = (value: number) => PAD.top + (1 - value / lossTop) * PLOT.height;
                const accuracyY = (value: number) => PAD.top + (1 - value) * PLOT.height;
                const line = (pick: (each: LogisticPass) => number, toY: (value: number) => number) =>
                  walk.passes.map((each, position) => `${position === 0 ? "M" : "L"} ${toPassX(position + 1).toFixed(1)} ${toY(pick(each)).toFixed(1)}`).join(" ");
                return (
                  <>
                    <path d={line((each) => each.slope, slopeY)} fill="none" stroke="#f59e0b" strokeWidth={2} />
                    <path d={line((each) => each.log_loss, lossY)} fill="none" stroke="#0f172a" strokeWidth={2} className="dark:stroke-slate-100" />
                    <path d={line((each) => each.accuracy, accuracyY)} fill="none" stroke="#10b981" strokeWidth={2} strokeDasharray="4 3" />
                    <line x1={toPassX(Math.min(index, count))} y1={PAD.top} x2={toPassX(Math.min(index, count))} y2={PAD.top + PLOT.height} stroke="currentColor" className="text-slate-500" strokeDasharray="4 3" />
                    <text x={PAD.left + 4} y={PAD.top + 12} className="text-[10px] font-medium" fill="#f59e0b">slope β, to {slopeTop.toFixed(1)}</text>
                    <text x={PAD.left + 4} y={PAD.top + 24} className="fill-slate-700 text-[10px] font-medium dark:fill-slate-200">log loss, to {lossTop.toFixed(2)}</text>
                    <text x={PAD.left + 4} y={PAD.top + 36} className="text-[10px] font-medium" fill="#10b981">accuracy, 0 to 1</text>
                    {[0, Math.floor(count / 2), count].map((tick) => (
                      <text key={tick} x={toPassX(tick)} y={PAD.top + PLOT.height + 14} textAnchor="middle" className="fill-slate-400 text-[10px]">{tick}</text>
                    ))}
                  </>
                );
              })()}
              <text x={PAD.left + PLOT.width / 2} y={PANEL.height - 4} textAnchor="middle" className="fill-slate-500 text-[10px] font-medium dark:fill-slate-400">pass</text>
            </svg>
          </Frame>
        )}
      </div>
      {message && (
        <p className="mt-3 text-sm text-amber-600 dark:text-amber-400">{message}</p>
      )}
    </div>
  );
}

function Frame({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-slate-200 p-3 dark:border-slate-800">
      <p className="mb-2 text-sm font-medium text-slate-700 dark:text-slate-200">{title}</p>
      {children}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-slate-100 px-2 py-1.5 dark:bg-slate-800">
      <div className="text-[11px] text-slate-500 dark:text-slate-400">{label}</div>
      <div className="font-mono text-sm font-semibold text-slate-900 dark:text-slate-100">{value}</div>
    </div>
  );
}
