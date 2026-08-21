"use client";

// One λ, read off four instruments at once.
//
// The API refits the degree-9 polynomial at thirty-three penalties, from a
// millionth to a hundred, twice each: once on every point, for the objective
// and its two halves and the coefficients, and once on the training share of
// the evaluation page's seeded split, for a training score and a held-out
// score. The slider picks one penalty and every panel follows it. The
// objective panel is the balance, RSS beside λ times the penalty, stacked to
// the total the fit actually minimised. The paths panel is every coefficient
// against log λ, with a zero line so a lasso path can be seen arriving on
// it. The scores panel is where the training score only falls while the
// held-out score rises and then turns. The curve panel refits at the chosen
// λ so the shape can be seen too. A page shows whichever panels a section
// needs; the arithmetic is the API's throughout.

import { useEffect, useState } from "react";
import {
  ApiError,
  PathStep,
  PenalisedFit,
  PenaltyModel,
  Point,
  RegularisationPath,
  fitPenalised,
  traceRegularisationPath,
} from "@/lib/api";
import { TERM_COLOURS } from "./ContributionTugOfWar";

const NOISY_THROW: Point[] = [
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

export type DashboardPanel = "objective" | "paths" | "scores" | "curve";

const PANEL = { width: 320, height: 240 };
const PAD = { left: 44, right: 12, top: 12, bottom: 30 };
const PLOT = { width: PANEL.width - PAD.left - PAD.right, height: PANEL.height - PAD.top - PAD.bottom };

function formatPenalty(penalty: number): string {
  if (penalty >= 10) return penalty.toFixed(0);
  if (penalty >= 0.01) return penalty.toFixed(penalty >= 1 ? 1 : 3);
  return penalty.toExponential(0);
}

function formatScore(value: number): string {
  if (value < -10) return value.toFixed(0);
  return value.toFixed(3);
}

// The default index lands on λ = 0.001, where the penalty playground starts.
const DEFAULT_INDEX = 12;

export function RegularisationPathDashboard({
  model: initialModel,
  panels,
  allowModelToggle = false,
}: {
  model: PenaltyModel;
  panels: DashboardPanel[];
  allowModelToggle?: boolean;
}) {
  const [model, setModel] = useState<PenaltyModel>(initialModel);
  const [path, setPath] = useState<RegularisationPath | null>(null);
  const [index, setIndex] = useState(DEFAULT_INDEX);
  const [fit, setFit] = useState<PenalisedFit | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setPath(await traceRegularisationPath(NOISY_THROW, model));
        setMessage(null);
      } catch (error) {
        if (error instanceof ApiError) setMessage(error.message);
        else setMessage("Something went wrong.");
      }
    })();
  }, [model]);

  const step = path ? path.steps[index] : null;
  const wantsCurve = panels.includes("curve");

  useEffect(() => {
    if (!wantsCurve || !step) return;
    const timer = setTimeout(async () => {
      try {
        setFit(await fitPenalised(NOISY_THROW, model, step.penalty));
      } catch (error) {
        if (error instanceof ApiError) setMessage(error.message);
      }
    }, 100);
    return () => clearTimeout(timer);
  }, [wantsCurve, step, model]);

  const count = path ? path.steps.length : 1;
  const toX = (position: number) => PAD.left + (position / (count - 1)) * PLOT.width;

  return (
    <div>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 pb-3 text-sm text-slate-600 dark:text-slate-300">
        {allowModelToggle && (
          <div className="flex gap-1 rounded-md border border-slate-300 p-0.5 dark:border-slate-700">
            {(["ridge", "lasso"] as PenaltyModel[]).map((option) => (
              <button
                key={option}
                onClick={() => setModel(option)}
                className={
                  "rounded px-3 py-1 text-sm font-medium capitalize transition " +
                  (model === option ? "bg-indigo-600 text-white" : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800")
                }
              >
                {option}
              </button>
            ))}
          </div>
        )}
        <label className="ml-auto flex items-center gap-2">
          λ
          <input
            type="range"
            min={0}
            max={count - 1}
            step={1}
            value={index}
            onChange={(event) => setIndex(Number(event.target.value))}
            className="w-44 accent-indigo-600"
          />
          <span className="w-14 font-mono">{step ? formatPenalty(step.penalty) : "…"}</span>
        </label>
      </div>

      <div className={`grid gap-4 ${panels.length > 1 ? "sm:grid-cols-2" : ""}`}>
        {panels.includes("objective") && path && step && (
          <Frame title="The objective, in its two halves">
            <svg viewBox={`0 0 ${PANEL.width} ${PANEL.height}`} className="w-full select-none rounded-md bg-slate-50 dark:bg-slate-950">
              {(() => {
                const top = Math.max(...path.steps.map((each) => each.objective)) * 1.05;
                const toY = (value: number) => PAD.top + (1 - value / top) * PLOT.height;
                const slot = PLOT.width / count;
                return (
                  <>
                    {path.steps.map((each, position) => (
                      <g key={position} opacity={position === index ? 1 : 0.45}>
                        <rect x={PAD.left + position * slot + 1} y={toY(each.residual_sum_of_squares)} width={Math.max(slot - 2, 1)} height={toY(0) - toY(each.residual_sum_of_squares)} className="fill-slate-400 dark:fill-slate-500" />
                        <rect x={PAD.left + position * slot + 1} y={toY(each.objective)} width={Math.max(slot - 2, 1)} height={toY(each.residual_sum_of_squares) - toY(each.objective)} className={model === "ridge" ? "fill-indigo-500" : "fill-amber-500"} />
                      </g>
                    ))}
                    <text x={PAD.left - 6} y={toY(top / 1.05) + 4} textAnchor="end" className="fill-slate-400 text-[10px]">{(top / 1.05).toFixed(0)}</text>
                    <text x={PAD.left - 6} y={toY(0) + 4} textAnchor="end" className="fill-slate-400 text-[10px]">0</text>
                  </>
                );
              })()}
              <AxisLabels count={count} path={path} toX={toX} />
            </svg>
            <div className="mt-2 grid grid-cols-3 gap-2">
              <Stat label="RSS" value={step.residual_sum_of_squares.toFixed(2)} />
              <Stat label="λ × penalty" value={step.penalty_cost.toFixed(2)} />
              <Stat label="total" value={step.objective.toFixed(2)} />
            </div>
            <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
              Grey is RSS, colour is λ times the penalty sum. The fit at each λ minimised the whole bar, not the grey part.
            </p>
          </Frame>
        )}

        {panels.includes("paths") && path && step && (
          <Frame title="Every coefficient against log λ">
            <svg viewBox={`0 0 ${PANEL.width} ${PANEL.height}`} className="w-full select-none rounded-md bg-slate-50 dark:bg-slate-950">
              {(() => {
                const reach = Math.max(1, ...path.steps.flatMap((each) => each.coefficients.map((value) => Math.abs(value)))) * 1.05;
                const toY = (value: number) => PAD.top + (1 - (value + reach) / (2 * reach)) * PLOT.height;
                return (
                  <>
                    <line x1={PAD.left} y1={toY(0)} x2={PAD.left + PLOT.width} y2={toY(0)} stroke="currentColor" className="text-slate-400 dark:text-slate-600" strokeWidth={1.5} />
                    <text x={PAD.left - 6} y={toY(reach / 1.05) + 4} textAnchor="end" className="fill-slate-400 text-[10px]">{(reach / 1.05).toFixed(0)}</text>
                    <text x={PAD.left - 6} y={toY(0) + 4} textAnchor="end" className="fill-slate-400 text-[10px]">0</text>
                    <text x={PAD.left - 6} y={toY(-reach / 1.05) + 4} textAnchor="end" className="fill-slate-400 text-[10px]">{(-reach / 1.05).toFixed(0)}</text>
                    {path.names.map((name, term) => (
                      <path
                        key={name}
                        d={path.steps.map((each, position) => `${position === 0 ? "M" : "L"} ${toX(position).toFixed(1)} ${toY(each.coefficients[term]).toFixed(1)}`).join(" ")}
                        fill="none"
                        stroke={TERM_COLOURS[term]}
                        strokeWidth={1.8}
                      />
                    ))}
                    <line x1={toX(index)} y1={PAD.top} x2={toX(index)} y2={PAD.top + PLOT.height} stroke="currentColor" className="text-slate-500" strokeDasharray="4 3" />
                  </>
                );
              })()}
              <AxisLabels count={count} path={path} toX={toX} />
            </svg>
            <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[11px]">
              {path.names.map((name, term) => (
                <span key={name} className="font-mono" style={{ color: TERM_COLOURS[term] }}>
                  {name} {step.coefficients[term].toFixed(2)}
                </span>
              ))}
            </div>
            <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
              {step.nonzero_count} of 9 terms nonzero at this λ.
            </p>
          </Frame>
        )}

        {panels.includes("scores") && path && step && (
          <Frame title="Training score and held-out score">
            <svg viewBox={`0 0 ${PANEL.width} ${PANEL.height}`} className="w-full select-none rounded-md bg-slate-50 dark:bg-slate-950">
              {(() => {
                const toY = (value: number) => PAD.top + ((1.05 - Math.max(-1, Math.min(1.05, value))) / 2.05) * PLOT.height;
                const line = (pick: (each: PathStep) => number) =>
                  path.steps.map((each, position) => `${position === 0 ? "M" : "L"} ${toX(position).toFixed(1)} ${toY(pick(each)).toFixed(1)}`).join(" ");
                return (
                  <>
                    {[1, 0, -1].map((tick) => (
                      <g key={tick}>
                        <line x1={PAD.left} y1={toY(tick)} x2={PAD.left + PLOT.width} y2={toY(tick)} stroke="currentColor" className="text-slate-200 dark:text-slate-800" />
                        <text x={PAD.left - 6} y={toY(tick) + 4} textAnchor="end" className="fill-slate-400 text-[10px]">{tick}</text>
                      </g>
                    ))}
                    <path d={line((each) => each.train_r_squared)} fill="none" stroke="#6366f1" strokeWidth={2} />
                    <path d={line((each) => each.held_out_r_squared)} fill="none" stroke="#f59e0b" strokeWidth={2} />
                    <line x1={toX(index)} y1={PAD.top} x2={toX(index)} y2={PAD.top + PLOT.height} stroke="currentColor" className="text-slate-500" strokeDasharray="4 3" />
                    <text x={PAD.left + PLOT.width - 4} y={PAD.top + 12} textAnchor="end" className="fill-indigo-600 text-[10px] font-medium dark:fill-indigo-300">training</text>
                    <text x={PAD.left + PLOT.width - 4} y={PAD.top + 24} textAnchor="end" className="fill-amber-600 text-[10px] font-medium dark:fill-amber-300">held out</text>
                  </>
                );
              })()}
              <AxisLabels count={count} path={path} toX={toX} />
            </svg>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <Stat label="R² on the training share" value={formatScore(step.train_r_squared)} />
              <Stat label="R² on the held-out share" value={formatScore(step.held_out_r_squared)} />
            </div>
            <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
              Held-out scores below −1 are drawn along the floor.
            </p>
          </Frame>
        )}

        {panels.includes("curve") && (
          <Frame title="The fitted curve at this λ">
            <svg viewBox={`0 0 ${PANEL.width} ${PANEL.height}`} className="w-full select-none rounded-md bg-slate-50 dark:bg-slate-950">
              {(() => {
                const cx = (time: number) => PAD.left + (time / 4) * PLOT.width;
                const cy = (height: number) => Math.min(PAD.top + PLOT.height, Math.max(PAD.top, PAD.top + (1 - (height + 2) / 28) * PLOT.height));
                return (
                  <>
                    {[0, 10, 20].map((tick) => (
                      <text key={tick} x={PAD.left - 6} y={cy(tick) + 4} textAnchor="end" className="fill-slate-400 text-[10px]">{tick}</text>
                    ))}
                    {NOISY_THROW.map((point, position) => (
                      <circle key={position} cx={cx(point.x)} cy={cy(point.y)} r={3.5} className="fill-slate-500 dark:fill-slate-400" />
                    ))}
                    {fit && (
                      <path d={fit.curve.map((point, position) => `${position === 0 ? "M" : "L"} ${cx(point.x).toFixed(1)} ${cy(point.y).toFixed(1)}`).join(" ")} fill="none" stroke={model === "ridge" ? "#6366f1" : "#f59e0b"} strokeWidth={2.5} />
                    )}
                    {[0, 1, 2, 3, 4].map((tick) => (
                      <text key={tick} x={cx(tick)} y={PAD.top + PLOT.height + 14} textAnchor="middle" className="fill-slate-400 text-[10px]">{tick}</text>
                    ))}
                  </>
                );
              })()}
            </svg>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <Stat label="R² on every point" value={fit ? fit.r_squared.toFixed(3) : "…"} />
              <Stat label="terms still on" value={fit ? `${fit.nonzero_count} of 9` : "…"} />
            </div>
          </Frame>
        )}
      </div>

      {message && (
        <p className="mt-3 text-sm text-amber-600 dark:text-amber-400">{message}</p>
      )}
    </div>
  );
}

function AxisLabels({ count, path, toX }: { count: number; path: RegularisationPath; toX: (position: number) => number }) {
  const ticks = [0, Math.floor(count / 4), Math.floor(count / 2), Math.floor((3 * count) / 4), count - 1];
  return (
    <>
      {ticks.map((position) => (
        <text key={position} x={toX(position)} y={PAD.top + PLOT.height + 14} textAnchor="middle" className="fill-slate-400 text-[10px]">
          {formatPenalty(path.steps[position].penalty)}
        </text>
      ))}
      <text x={PAD.left + PLOT.width / 2} y={PANEL.height - 2} textAnchor="middle" className="fill-slate-500 text-[10px] dark:fill-slate-400">λ, log scale</text>
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

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-slate-100 px-2 py-1.5 dark:bg-slate-800">
      <div className="text-[11px] text-slate-500 dark:text-slate-400">{label}</div>
      <div className="font-mono text-sm font-semibold text-slate-900 dark:text-slate-100">{value}</div>
    </div>
  );
}
