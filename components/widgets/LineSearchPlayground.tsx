"use client";

// Every candidate line is a point on the loss surface, and this is the link.
//
// Two sliders set a level and a slope. The data panel draws the line those
// make and its residuals, and the surface panel marks the same pair as a
// point on the loss over every level and slope. Move a slider and both move
// together, which is the whole idea of the page: fitting a line in data
// space and walking a point across an error surface are one process seen
// twice. The slice panels cut the surface along one parameter at a time and
// draw the tangent at the current point, whose slope is that parameter's
// partial derivative. The arrows on the surface are the gradient, uphill,
// and its negative, downhill, with the point one pass would step to. The
// optimum stays hidden until asked for, so the reader can hunt first. Every
// loss, gradient and slice comes from the API.

import { useEffect, useState } from "react";
import { ApiError, Point } from "@/lib/api";
import {
  Candidate,
  LossSurface,
  sampleLossSurface,
  scoreCandidate,
} from "@/lib/concepts/gradient-descent-regression";
import { ContourMap } from "./ContourMap";

const WORKED_THREE: Point[] = [
  { x: 165, y: 62 },
  { x: 170, y: 68 },
  { x: 175, y: 68 },
];

export type SearchPanel = "line" | "surface" | "slices";

const DATA = { width: 320, height: 280 };
const DATA_PAD = { left: 40, right: 10, top: 10, bottom: 34 };
const DATA_PLOT = { width: DATA.width - DATA_PAD.left - DATA_PAD.right, height: DATA.height - DATA_PAD.top - DATA_PAD.bottom };
const HEIGHTS = { min: 160, max: 180 };
const WEIGHTS = { min: -10, max: 100 };

const SLICE = { width: 320, height: 200 };
const SLICE_PAD = { left: 46, right: 10, top: 10, bottom: 30 };
const SLICE_PLOT = { width: SLICE.width - SLICE_PAD.left - SLICE_PAD.right, height: SLICE.height - SLICE_PAD.top - SLICE_PAD.bottom };

const LEARNING_RATE = 0.02;

export function LineSearchPlayground({
  panels = ["line", "surface"],
  showGradient = false,
  initialLevel = 20,
  initialSlope = 0.2,
}: {
  panels?: SearchPanel[];
  showGradient?: boolean;
  initialLevel?: number;
  initialSlope?: number;
}) {
  const [level, setLevel] = useState(initialLevel);
  const [slope, setSlope] = useState(initialSlope);
  const [revealed, setRevealed] = useState(false);
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [surface, setSurface] = useState<LossSurface | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!panels.includes("surface")) return;
    (async () => {
      try {
        setSurface(await sampleLossSurface(WORKED_THREE, "centred", LEARNING_RATE, 1));
      } catch (error) {
        if (error instanceof ApiError) setMessage(error.message);
      }
    })();
  }, [panels]);

  useEffect(() => {
    const timer = setTimeout(async () => {
      try {
        setCandidate(await scoreCandidate(WORKED_THREE, level, slope, LEARNING_RATE));
        setMessage(null);
      } catch (error) {
        if (error instanceof ApiError) setMessage(error.message);
        else setMessage("Something went wrong.");
      }
    }, 100);
    return () => clearTimeout(timer);
  }, [level, slope]);

  const meanHeight = candidate ? candidate.mean_height : 170;
  const dataX = (height: number) => DATA_PAD.left + ((height - HEIGHTS.min) / (HEIGHTS.max - HEIGHTS.min)) * DATA_PLOT.width;
  const dataY = (weight: number) =>
    Math.min(DATA_PAD.top + DATA_PLOT.height, Math.max(DATA_PAD.top, DATA_PAD.top + (1 - (weight - WEIGHTS.min) / (WEIGHTS.max - WEIGHTS.min)) * DATA_PLOT.height));
  const lineAt = (height: number) => level + slope * (height - meanHeight);

  return (
    <div>
      <div className="grid gap-x-6 gap-y-2 pb-3 sm:grid-cols-2">
        <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
          <span className="w-12">level</span>
          <input type="range" min={-20} max={120} step={0.5} value={level} onChange={(event) => setLevel(Number(event.target.value))} className="flex-1 accent-indigo-600" />
          <span className="w-14 text-right font-mono">{level.toFixed(1)}</span>
        </label>
        <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
          <span className="w-12">slope</span>
          <input type="range" min={-0.6} max={1.8} step={0.01} value={slope} onChange={(event) => setSlope(Number(event.target.value))} className="flex-1 accent-amber-500" />
          <span className="w-14 text-right font-mono">{slope.toFixed(2)}</span>
        </label>
      </div>

      <div className={`grid gap-4 ${panels.length > 1 ? "sm:grid-cols-2" : ""}`}>
        {panels.includes("line") && (
          <Frame title="The line those settings make">
            <svg viewBox={`0 0 ${DATA.width} ${DATA.height}`} className="w-full select-none rounded-md bg-slate-50 dark:bg-slate-950">
              {[0, 25, 50, 75, 100].map((tick) => (
                <g key={tick}>
                  <line x1={DATA_PAD.left} y1={dataY(tick)} x2={DATA_PAD.left + DATA_PLOT.width} y2={dataY(tick)} stroke="currentColor" className="text-slate-200 dark:text-slate-800" />
                  <text x={DATA_PAD.left - 5} y={dataY(tick) + 3} textAnchor="end" className="fill-slate-400 text-[10px]">{tick}</text>
                </g>
              ))}
              {revealed && candidate && (
                <line x1={dataX(HEIGHTS.min)} y1={dataY(candidate.closed_form.level + candidate.closed_form.slope * (HEIGHTS.min - meanHeight))} x2={dataX(HEIGHTS.max)} y2={dataY(candidate.closed_form.level + candidate.closed_form.slope * (HEIGHTS.max - meanHeight))} stroke="currentColor" className="text-emerald-500" strokeWidth={2} strokeDasharray="6 4" />
              )}
              <line x1={dataX(HEIGHTS.min)} y1={dataY(lineAt(HEIGHTS.min))} x2={dataX(HEIGHTS.max)} y2={dataY(lineAt(HEIGHTS.max))} stroke="currentColor" className="text-indigo-600 dark:text-indigo-400" strokeWidth={2.5} />
              {WORKED_THREE.map((point) => (
                <g key={point.x}>
                  <line x1={dataX(point.x)} y1={dataY(point.y)} x2={dataX(point.x)} y2={dataY(lineAt(point.x))} stroke="currentColor" className="text-rose-500" strokeWidth={1.5} />
                  <circle cx={dataX(point.x)} cy={dataY(point.y)} r={5} className="fill-slate-800 stroke-white dark:fill-slate-100 dark:stroke-slate-900" strokeWidth={1.5} />
                </g>
              ))}
              {[160, 170, 180].map((tick) => (
                <text key={tick} x={dataX(tick)} y={DATA_PAD.top + DATA_PLOT.height + 14} textAnchor="middle" className="fill-slate-400 text-[10px]">{tick}</text>
              ))}
              <text x={DATA_PAD.left + DATA_PLOT.width / 2} y={DATA.height - 4} textAnchor="middle" className="fill-slate-500 text-[10px] font-medium dark:fill-slate-400">height (cm)</text>
            </svg>
            <div className="mt-2 grid grid-cols-3 gap-2">
              {candidate?.observations.map((each) => (
                <div key={each.centred_height} className="rounded-md bg-slate-100 px-2 py-1 font-mono text-[11px] text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                  residual {each.residual.toFixed(1)}
                </div>
              ))}
            </div>
          </Frame>
        )}

        {panels.includes("surface") && (
          <Frame title="The same settings as a point on the loss">
            {surface ? (
              <ContourMap firstAxis={surface.first_axis} secondAxis={surface.second_axis} values={surface.losses} firstLabel="level" secondLabel="slope">
                {({ toX, toY, clampX, clampY }) => {
                  const px = clampX(toX(level));
                  const py = clampY(toY(slope));
                  // Arrows are drawn in a fixed pixel length, since the two
                  // gradient components live in different units.
                  const arrow = candidate && showGradient
                    ? (() => {
                        const dx = toX(level + candidate.gradient_level) - toX(level);
                        const dy = toY(slope + candidate.gradient_slope) - toY(slope);
                        const length = Math.hypot(dx, dy) || 1;
                        const reach = 46;
                        return { ux: (dx / length) * reach, uy: (dy / length) * reach };
                      })()
                    : null;
                  return (
                    <>
                      {revealed && <circle cx={toX(surface.optimum.first)} cy={toY(surface.optimum.second)} r={6} fill="#10b981" stroke="white" strokeWidth={1.5} />}
                      {arrow && (
                        <>
                          <line x1={px} y1={py} x2={px + arrow.ux} y2={py + arrow.uy} stroke="#ef4444" strokeWidth={2.5} markerEnd="url(#uphill)" />
                          <line x1={px} y1={py} x2={px - arrow.ux} y2={py - arrow.uy} stroke="#10b981" strokeWidth={2.5} />
                          <defs>
                            <marker id="uphill" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 z" fill="#ef4444" /></marker>
                          </defs>
                          {candidate && (
                            <circle cx={clampX(toX(candidate.next_position.level))} cy={clampY(toY(candidate.next_position.slope))} r={4} fill="none" stroke="#10b981" strokeWidth={2} />
                          )}
                        </>
                      )}
                      <circle cx={px} cy={py} r={6} fill="#6366f1" stroke="white" strokeWidth={1.5} />
                    </>
                  );
                }}
              </ContourMap>
            ) : (
              <p className="text-sm text-slate-500">…</p>
            )}
            <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
              Darker is a larger loss. {showGradient ? "Red points uphill along the gradient, green downhill, and the hollow ring is where one pass at a rate of 0.02 would land." : ""}
            </p>
          </Frame>
        )}

        {panels.includes("slices") && candidate && (
          <>
            <SlicePanel title="Loss against the level, slope held" slice={candidate.level_slice} at={level} loss={candidate.standing.loss} derivative={candidate.gradient_level} accent="#6366f1" label="level" />
            <SlicePanel title="Loss against the slope, level held" slice={candidate.slope_slice} at={slope} loss={candidate.standing.loss} derivative={candidate.gradient_slope} accent="#f59e0b" label="slope" />
          </>
        )}
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="MSE at these settings" value={candidate ? candidate.standing.loss.toFixed(2) : "…"} />
        <Stat label="∂loss / ∂level" value={candidate ? candidate.gradient_level.toFixed(2) : "…"} />
        <Stat label="∂loss / ∂slope" value={candidate ? candidate.gradient_slope.toFixed(2) : "…"} />
        <div className="flex items-center">
          <button
            onClick={() => setRevealed((current) => !current)}
            className="rounded-md border border-emerald-400 bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-800 transition hover:bg-emerald-100 dark:border-emerald-500/70 dark:bg-emerald-950/30 dark:text-emerald-200"
          >
            {revealed ? "Hide the optimum" : "Compare with the optimum"}
          </button>
        </div>
      </div>
      {revealed && candidate && (
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          The closed form sits at level {candidate.closed_form.level.toFixed(2)}, slope {candidate.closed_form.slope.toFixed(2)}, with MSE {candidate.closed_form.loss.toFixed(2)}. Your settings are {(candidate.standing.loss - candidate.closed_form.loss).toFixed(2)} above it.
        </p>
      )}

      {message && (
        <p className="mt-3 text-sm text-amber-600 dark:text-amber-400">{message}</p>
      )}
    </div>
  );
}

function SlicePanel({
  title,
  slice,
  at,
  loss,
  derivative,
  accent,
  label,
}: {
  title: string;
  slice: { axis: number[]; losses: number[] };
  at: number;
  loss: number;
  derivative: number;
  accent: string;
  label: string;
}) {
  const min = slice.axis[0];
  const max = slice.axis[slice.axis.length - 1];
  const top = Math.max(...slice.losses) * 1.05;
  const toX = (value: number) => SLICE_PAD.left + ((value - min) / (max - min)) * SLICE_PLOT.width;
  const toY = (value: number) => SLICE_PAD.top + (1 - Math.max(0, Math.min(top, value)) / top) * SLICE_PLOT.height;
  const path = slice.axis.map((value, index) => `${index === 0 ? "M" : "L"} ${toX(value).toFixed(1)} ${toY(slice.losses[index]).toFixed(1)}`).join(" ");
  const reach = (max - min) / 4;
  return (
    <Frame title={title}>
      <svg viewBox={`0 0 ${SLICE.width} ${SLICE.height}`} className="w-full select-none rounded-md bg-slate-50 dark:bg-slate-950">
        <path d={path} fill="none" stroke={accent} strokeWidth={2.5} />
        <line x1={toX(at - reach)} y1={toY(loss - derivative * reach)} x2={toX(at + reach)} y2={toY(loss + derivative * reach)} stroke="#ef4444" strokeWidth={2} />
        <circle cx={toX(at)} cy={toY(loss)} r={5} fill={accent} stroke="white" strokeWidth={1.5} />
        <text x={SLICE_PAD.left - 5} y={toY(top / 1.05) + 4} textAnchor="end" className="fill-slate-400 text-[10px]">{(top / 1.05).toFixed(0)}</text>
        <text x={SLICE_PAD.left - 5} y={toY(0) + 4} textAnchor="end" className="fill-slate-400 text-[10px]">0</text>
        <text x={toX(min)} y={SLICE_PAD.top + SLICE_PLOT.height + 12} className="fill-slate-400 text-[10px]">{min.toFixed(1)}</text>
        <text x={toX(max)} y={SLICE_PAD.top + SLICE_PLOT.height + 12} textAnchor="end" className="fill-slate-400 text-[10px]">{max.toFixed(1)}</text>
        <text x={SLICE_PAD.left + SLICE_PLOT.width / 2} y={SLICE.height - 4} textAnchor="middle" className="fill-slate-500 text-[10px] font-medium dark:fill-slate-400">{label}</text>
      </svg>
      <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
        The red line is the tangent at the current {label}. Its slope, {derivative.toFixed(2)}, is the partial derivative, and loss falls in the direction it points downward.
      </p>
    </Frame>
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
    <div className="rounded-lg bg-slate-100 px-3 py-2 dark:bg-slate-800">
      <div className="text-xs text-slate-500 dark:text-slate-400">{label}</div>
      <div className="font-mono text-base font-semibold text-slate-900 dark:text-slate-100">{value}</div>
    </div>
  );
}
