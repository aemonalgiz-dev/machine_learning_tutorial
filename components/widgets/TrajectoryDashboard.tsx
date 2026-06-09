"use client";

// One recorded walk, read off every instrument at once.
//
// The API records a whole walk, and this scrubs through it with every panel
// following the same pass: the path across the loss contours, the level and
// the slope against pass number, the loss and the gradient size on a log
// scale, the distance of each parameter from the closed-form answer, also on
// a log scale so geometric shrinking is a straight line, and a status board
// that separates the claims a run can make. The loss is finite. The loss
// fell last pass. The gradient is small. The movement is small. The pass
// limit was hit. The tolerance was met. Those are different facts, and a
// run can satisfy some without the others. Every number is the library's;
// the browser draws.

import { useEffect, useState } from "react";
import { ApiError, Point } from "@/lib/api";
import {
  LossSurface,
  RecordedWalk,
  sampleLossSurface,
  walkDownhill,
} from "@/lib/concepts/gradient-descent-regression";
import { ContourMap } from "./ContourMap";

const WORKED_THREE: Point[] = [
  { x: 165, y: 62 },
  { x: 170, y: 68 },
  { x: 175, y: 68 },
];

const PANEL = { width: 320, height: 200 };
const PAD = { left: 46, right: 10, top: 10, bottom: 28 };
const PLOT = { width: PANEL.width - PAD.left - PAD.right, height: PANEL.height - PAD.top - PAD.bottom };

const LEVEL = "#6366f1";
const SLOPE = "#f59e0b";

function formatSmall(value: number): string {
  if (value === 0) return "0";
  if (Math.abs(value) < 0.001) return value.toExponential(2);
  return value.toFixed(4);
}

export function TrajectoryDashboard() {
  const [rate, setRate] = useState(0.02);
  const [maxEpochs, setMaxEpochs] = useState(500);
  const [walk, setWalk] = useState<RecordedWalk | null>(null);
  const [surface, setSurface] = useState<LossSurface | null>(null);
  const [passIndex, setPassIndex] = useState(0);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setSurface(await sampleLossSurface(WORKED_THREE, "centred", 0.02, 1));
      } catch (error) {
        if (error instanceof ApiError) setMessage(error.message);
      }
    })();
  }, []);

  useEffect(() => {
    const timer = setTimeout(async () => {
      try {
        const recorded = await walkDownhill(WORKED_THREE, rate, maxEpochs);
        setWalk(recorded);
        setPassIndex(recorded.passes.length);
        setMessage(null);
      } catch (error) {
        if (error instanceof ApiError) setMessage(error.message);
        else setMessage("Something went wrong.");
      }
    }, 150);
    return () => clearTimeout(timer);
  }, [rate, maxEpochs]);

  const positions = walk ? [walk.start, ...walk.passes] : [];
  const count = positions.length;
  const shown = Math.min(passIndex, count - 1);
  const standing = count > 0 ? positions[shown] : null;
  const thisPass = walk && shown > 0 ? walk.passes[shown - 1] : null;
  const previous = count > 0 && shown > 0 ? positions[shown - 1] : null;

  const toPassX = (index: number) => PAD.left + (index / Math.max(1, count - 1)) * PLOT.width;
  const linear = (values: number[], low: number, high: number) => (value: number) =>
    PAD.top + (1 - (Math.min(high, Math.max(low, value)) - low) / (high - low || 1)) * PLOT.height;
  const logarithmic = (values: number[]) => {
    const positive = values.filter((value) => value > 0);
    const low = Math.log10(Math.max(1e-12, Math.min(...positive)));
    const high = Math.log10(Math.max(...positive, 1e-12));
    return { low, high, toY: (value: number) => PAD.top + (1 - (Math.log10(Math.max(1e-12, value)) - low) / (high - low || 1)) * PLOT.height };
  };
  const pathOf = (values: number[], toY: (value: number) => number) =>
    values.map((value, index) => `${index === 0 ? "M" : "L"} ${toPassX(index).toFixed(1)} ${toY(value).toFixed(1)}`).join(" ");

  const levels = positions.map((each) => each.level);
  const slopes = positions.map((each) => each.slope);
  const losses = positions.map((each) => each.loss);
  const gradientSizes = walk ? walk.passes.map((each) => Math.hypot(each.gradient_level, each.gradient_slope)) : [];
  const movements = walk ? walk.passes.map((each) => each.movement) : [];
  const levelErrors = walk ? positions.map((each) => Math.abs(each.level - walk.closed_form.level)) : [];
  const slopeErrors = walk ? positions.map((each) => Math.abs(each.slope - walk.closed_form.slope)) : [];

  const levelScale = linear(levels, Math.min(0, ...levels), Math.max(...levels, walk ? walk.closed_form.level : 1) * 1.05);
  const slopeScale = linear(slopes, Math.min(0, ...slopes), Math.max(...slopes, walk ? walk.closed_form.slope : 1) * 1.05);
  const lossScale = logarithmic(losses);
  const gradientScale = logarithmic([...gradientSizes, ...movements]);
  const errorScale = logarithmic([...levelErrors, ...slopeErrors]);

  const distance = walk && standing ? Math.hypot(standing.level - walk.closed_form.level, standing.slope - walk.closed_form.slope) : null;

  return (
    <div>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 pb-3 text-sm text-slate-600 dark:text-slate-300">
        <label className="flex items-center gap-2">
          rate
          <input type="range" min={-3} max={-0.7} step={0.05} value={Math.log10(rate)} onChange={(event) => setRate(Number((10 ** Number(event.target.value)).toPrecision(3)))} className="w-32 accent-indigo-600" />
          <span className="w-16 font-mono">{rate.toPrecision(3)}</span>
        </label>
        <label className="flex items-center gap-2">
          passes allowed
          <input type="range" min={1} max={500} step={1} value={maxEpochs} onChange={(event) => setMaxEpochs(Number(event.target.value))} className="w-28 accent-emerald-600" />
          <span className="w-10 font-mono">{maxEpochs}</span>
        </label>
        <label className="ml-auto flex items-center gap-2">
          pass
          <input type="range" min={0} max={Math.max(0, count - 1)} step={1} value={shown} onChange={(event) => setPassIndex(Number(event.target.value))} className="w-40 accent-slate-700 dark:accent-slate-300" />
          <span className="w-20 font-mono">{shown} of {Math.max(0, count - 1)}</span>
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Frame title="The path across the loss">
          {surface && walk ? (
            <ContourMap firstAxis={surface.first_axis} secondAxis={surface.second_axis} values={surface.losses} width={320} height={200} firstLabel="level" secondLabel="slope">
              {({ toX, toY, clampX, clampY }) => (
                <>
                  <path d={positions.slice(0, shown + 1).map((each, index) => `${index === 0 ? "M" : "L"} ${clampX(toX(each.level)).toFixed(1)} ${clampY(toY(each.slope)).toFixed(1)}`).join(" ")} fill="none" stroke="#0f172a" strokeWidth={1.5} opacity={0.8} />
                  <circle cx={toX(walk.closed_form.level)} cy={toY(walk.closed_form.slope)} r={5} fill="#10b981" stroke="white" strokeWidth={1.5} />
                  {standing && <circle cx={clampX(toX(standing.level))} cy={clampY(toY(standing.slope))} r={5} fill="#0f172a" stroke="white" strokeWidth={1.5} />}
                </>
              )}
            </ContourMap>
          ) : (
            <p className="text-sm text-slate-500">…</p>
          )}
        </Frame>

        <Frame title="Level and slope, pass by pass">
          <svg viewBox={`0 0 ${PANEL.width} ${PANEL.height}`} className="w-full select-none rounded-md bg-slate-50 dark:bg-slate-950">
            {walk && (
              <>
                <line x1={PAD.left} y1={levelScale(walk.closed_form.level)} x2={PAD.left + PLOT.width} y2={levelScale(walk.closed_form.level)} stroke={LEVEL} strokeDasharray="3 3" opacity={0.5} />
                <line x1={PAD.left} y1={slopeScale(walk.closed_form.slope)} x2={PAD.left + PLOT.width} y2={slopeScale(walk.closed_form.slope)} stroke={SLOPE} strokeDasharray="3 3" opacity={0.5} />
                <path d={pathOf(levels, levelScale)} fill="none" stroke={LEVEL} strokeWidth={2} />
                <path d={pathOf(slopes, slopeScale)} fill="none" stroke={SLOPE} strokeWidth={2} />
                <line x1={toPassX(shown)} y1={PAD.top} x2={toPassX(shown)} y2={PAD.top + PLOT.height} stroke="currentColor" className="text-slate-500" strokeDasharray="4 3" />
                <text x={PAD.left + 4} y={PAD.top + 12} className="text-[10px] font-medium" fill={LEVEL}>level, target {walk.closed_form.level.toFixed(2)}</text>
                <text x={PAD.left + 4} y={PAD.top + 24} className="text-[10px] font-medium" fill={SLOPE}>slope, target {walk.closed_form.slope.toFixed(2)}</text>
              </>
            )}
            <Axis count={count} toPassX={toPassX} />
          </svg>
          <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">Each drawn on its own scale from zero to its target. The dashed lines are the closed form.</p>
        </Frame>

        <Frame title="Loss, log scale">
          <svg viewBox={`0 0 ${PANEL.width} ${PANEL.height}`} className="w-full select-none rounded-md bg-slate-50 dark:bg-slate-950">
            {walk && (
              <>
                <line x1={PAD.left} y1={lossScale.toY(walk.closed_form.loss)} x2={PAD.left + PLOT.width} y2={lossScale.toY(walk.closed_form.loss)} stroke="#10b981" strokeDasharray="3 3" />
                <path d={pathOf(losses, lossScale.toY)} fill="none" stroke="#0f172a" strokeWidth={2} className="dark:stroke-slate-100" />
                <line x1={toPassX(shown)} y1={PAD.top} x2={toPassX(shown)} y2={PAD.top + PLOT.height} stroke="currentColor" className="text-slate-500" strokeDasharray="4 3" />
                <text x={PAD.left - 4} y={PAD.top + 10} textAnchor="end" className="fill-slate-400 text-[10px]">{(10 ** lossScale.high).toPrecision(2)}</text>
                <text x={PAD.left - 4} y={PAD.top + PLOT.height} textAnchor="end" className="fill-slate-400 text-[10px]">{(10 ** lossScale.low).toPrecision(2)}</text>
              </>
            )}
            <Axis count={count} toPassX={toPassX} />
          </svg>
          <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">The green dashes are the closed form&rsquo;s loss, the floor nothing can go below.</p>
        </Frame>

        <Frame title="Gradient size and movement, log scale">
          <svg viewBox={`0 0 ${PANEL.width} ${PANEL.height}`} className="w-full select-none rounded-md bg-slate-50 dark:bg-slate-950">
            {walk && gradientSizes.length > 0 && (
              <>
                <path d={gradientSizes.map((value, index) => `${index === 0 ? "M" : "L"} ${toPassX(index + 1).toFixed(1)} ${gradientScale.toY(value).toFixed(1)}`).join(" ")} fill="none" stroke="#ef4444" strokeWidth={2} />
                <path d={movements.map((value, index) => `${index === 0 ? "M" : "L"} ${toPassX(index + 1).toFixed(1)} ${gradientScale.toY(value).toFixed(1)}`).join(" ")} fill="none" stroke="#0ea5e9" strokeWidth={2} />
                <line x1={PAD.left} y1={gradientScale.toY(walk.tolerance)} x2={PAD.left + PLOT.width} y2={gradientScale.toY(walk.tolerance)} stroke="#0ea5e9" strokeDasharray="3 3" opacity={0.6} />
                <line x1={toPassX(shown)} y1={PAD.top} x2={toPassX(shown)} y2={PAD.top + PLOT.height} stroke="currentColor" className="text-slate-500" strokeDasharray="4 3" />
                <text x={PAD.left + 4} y={PAD.top + 12} className="text-[10px] font-medium" fill="#ef4444">gradient size</text>
                <text x={PAD.left + 4} y={PAD.top + 24} className="text-[10px] font-medium" fill="#0ea5e9">largest movement, tolerance dashed</text>
              </>
            )}
            <Axis count={count} toPassX={toPassX} />
          </svg>
        </Frame>

        <Frame title="Distance from the closed form, per parameter, log scale">
          <svg viewBox={`0 0 ${PANEL.width} ${PANEL.height}`} className="w-full select-none rounded-md bg-slate-50 dark:bg-slate-950">
            {walk && (
              <>
                <path d={pathOf(levelErrors, errorScale.toY)} fill="none" stroke={LEVEL} strokeWidth={2} />
                <path d={pathOf(slopeErrors, errorScale.toY)} fill="none" stroke={SLOPE} strokeWidth={2} />
                <line x1={toPassX(shown)} y1={PAD.top} x2={toPassX(shown)} y2={PAD.top + PLOT.height} stroke="currentColor" className="text-slate-500" strokeDasharray="4 3" />
                <text x={PAD.left + 4} y={PAD.top + 12} className="text-[10px] font-medium" fill={LEVEL}>|level − {walk.closed_form.level.toFixed(0)}|</text>
                <text x={PAD.left + 4} y={PAD.top + 24} className="text-[10px] font-medium" fill={SLOPE}>|slope − {walk.closed_form.slope.toFixed(1)}|</text>
              </>
            )}
            <Axis count={count} toPassX={toPassX} />
          </svg>
          <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">A straight line here is geometric shrinking, and the steeper line is the direction with the larger curvature.</p>
        </Frame>

        <Frame title="What this run can claim">
          {walk && standing ? (
            <div className="space-y-1 text-sm">
              <Claim label="loss is finite" holds={Number.isFinite(standing.loss)} />
              <Claim label="loss fell during this pass" holds={previous !== null && standing.loss < previous.loss} detail={previous ? `${previous.loss.toFixed(4)} → ${standing.loss.toFixed(4)}` : "no pass yet"} />
              <Claim label="gradient size" holds={thisPass !== null && Math.hypot(thisPass.gradient_level, thisPass.gradient_slope) < 1e-4} detail={thisPass ? formatSmall(Math.hypot(thisPass.gradient_level, thisPass.gradient_slope)) : "not read yet"} />
              <Claim label={`largest movement under the tolerance ${walk.tolerance.toExponential(0)}`} holds={thisPass !== null && thisPass.movement < walk.tolerance} detail={thisPass ? formatSmall(thisPass.movement) : ""} />
              <Claim label="distance from the closed form" holds={distance !== null && distance < 1e-4} detail={distance === null ? "" : formatSmall(distance)} />
              <Claim label="pass limit reached" holds={walk.outcome === "pass_limit_reached"} warn />
              <Claim label="convergence criterion satisfied" holds={walk.outcome === "converged"} detail={`stopped after ${walk.passes_run} passes, outcome ${walk.outcome.replace(/_/g, " ")}`} />
            </div>
          ) : (
            <p className="text-sm text-slate-500">…</p>
          )}
        </Frame>
      </div>

      {message && (
        <p className="mt-3 text-sm text-amber-600 dark:text-amber-400">{message}</p>
      )}
    </div>
  );
}

function Claim({ label, holds, detail, warn = false }: { label: string; holds: boolean; detail?: string; warn?: boolean }) {
  const colour = holds
    ? warn
      ? "text-amber-600 dark:text-amber-400"
      : "text-emerald-700 dark:text-emerald-400"
    : "text-slate-400 dark:text-slate-500";
  return (
    <p className="flex items-baseline gap-2">
      <span className={`w-4 font-mono ${colour}`}>{holds ? "●" : "○"}</span>
      <span className="text-slate-700 dark:text-slate-300">{label}</span>
      {detail && <span className="ml-auto font-mono text-xs text-slate-500 dark:text-slate-400">{detail}</span>}
    </p>
  );
}

function Axis({ count, toPassX }: { count: number; toPassX: (index: number) => number }) {
  const ticks = count > 1 ? [0, Math.floor((count - 1) / 2), count - 1] : [0];
  return (
    <>
      {ticks.map((tick) => (
        <text key={tick} x={toPassX(tick)} y={PAD.top + PLOT.height + 12} textAnchor="middle" className="fill-slate-400 text-[10px]">{tick}</text>
      ))}
      <text x={PAD.left + PLOT.width / 2} y={PANEL.height - 2} textAnchor="middle" className="fill-slate-500 text-[10px] dark:fill-slate-400">pass</text>
    </>
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
