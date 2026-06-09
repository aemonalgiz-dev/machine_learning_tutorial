"use client";

// The cloud seen along one direction the reader chooses.
//
// A direction through the mean, every person dropped perpendicularly onto
// it, and the signed position where they land, read off on a number line
// beneath the cloud. Turning the direction moves every landing point and
// the variance of the scores with them, which is the search the first
// principal component wins. The panels switch on what a section needs:
// the arrow's length as a separate control, the centring switch, the
// perpendicular residuals with their squared total, one person's
// contributions to their score, the covariance matrix's image of the
// direction, and the variance-by-angle curve with the current angle
// marked. The API projects and measures; the browser draws.

import { useEffect, useState } from "react";
import { ApiError, Point, VarianceSweep, sweepVariance } from "@/lib/api";
import { DirectionView, projectOntoDirection } from "@/lib/concepts/pca";
import { CROWD, FIRST, KEPT, LOST, SECOND, WORKED_PEOPLE } from "./pcaFixtures";

const VIEW = { width: 640, height: 400 };
const PAD = { left: 56, right: 16, top: 16, bottom: 40 };
const LINE = { width: 640, height: 56 };
const CURVE = { width: 640, height: 200 };
const CURVE_PAD = { left: 56, right: 16, top: 18, bottom: 34 };

export type ExplorerPanel = "length" | "centre" | "residuals" | "contribution" | "transform" | "sweep" | "scores";

export function ProjectionExplorer({
  panels = ["scores"],
  initialAngle = 30,
  people = "crowd",
}: {
  panels?: ExplorerPanel[];
  initialAngle?: number;
  people?: "crowd" | "worked";
}) {
  const [points, setPoints] = useState<Point[]>(people === "crowd" ? CROWD : WORKED_PEOPLE);
  const [angle, setAngle] = useState(initialAngle);
  const [length, setLength] = useState(1);
  const [centre, setCentre] = useState(true);
  const [selected, setSelected] = useState(0);
  const [view, setView] = useState<DirectionView | null>(null);
  const [sweep, setSweep] = useState<VarianceSweep | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const has = (panel: ExplorerPanel) => panels.includes(panel);

  useEffect(() => {
    const timer = setTimeout(async () => {
      try {
        setView(await projectOntoDirection(points, angle, { centre, length }));
        setMessage(null);
      } catch (error) {
        if (error instanceof ApiError) setMessage(error.message);
        else setMessage("Something went wrong.");
      }
    }, 40);
    return () => clearTimeout(timer);
  }, [points, angle, centre, length]);

  useEffect(() => {
    if (!has("sweep")) return;
    (async () => {
      try {
        setSweep(await sweepVariance(points));
      } catch (error) {
        if (error instanceof ApiError) setMessage(error.message);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [points]);

  if (!view) {
    return <p className="text-sm text-slate-500 dark:text-slate-400">{message ?? "…"}</p>;
  }

  // The window follows the cloud, and when the cloud is not centred the
  // origin has to be in the picture, since that is where the projection
  // now pivots.
  const xs = points.map((point) => point.x).concat(centre ? [] : [0]);
  const ys = points.map((point) => point.y).concat(centre ? [] : [0]);
  const xSpan = Math.max(...xs) - Math.min(...xs) || 1;
  const ySpan = Math.max(...ys) - Math.min(...ys) || 1;
  const domain = {
    xMin: Math.min(...xs) - 0.12 * xSpan,
    xMax: Math.max(...xs) + 0.12 * xSpan,
    yMin: Math.min(...ys) - 0.12 * ySpan,
    yMax: Math.max(...ys) + 0.12 * ySpan,
  };
  const plotX = (value: number) => PAD.left + ((value - domain.xMin) / (domain.xMax - domain.xMin)) * (VIEW.width - PAD.left - PAD.right);
  const plotY = (value: number) => PAD.top + (1 - (value - domain.yMin) / (domain.yMax - domain.yMin)) * (VIEW.height - PAD.top - PAD.bottom);
  const pivot = view.pivot;
  const reach = Math.max(xSpan, ySpan) * 0.7;
  const lineEnds = [
    { x: pivot.x - reach * view.unit.dx, y: pivot.y - reach * view.unit.dy },
    { x: pivot.x + reach * view.unit.dx, y: pivot.y + reach * view.unit.dy },
  ];
  const arrowScale = reach * 0.45;
  const arrowTip = { x: pivot.x + arrowScale * view.vector.dx, y: pivot.y + arrowScale * view.vector.dy };
  const transformScale = view.transformed_length > 0 ? arrowScale / Math.max(view.transformed_length, 1e-9) * Math.min(1, view.transformed_length / Math.max(view.covariance.var_x, view.covariance.var_y)) : 0;
  const transformedTip = { x: pivot.x + transformScale * view.transformed.dx, y: pivot.y + transformScale * view.transformed.dy };

  const scores = view.rows.map((row) => row.score);
  const scoreReach = Math.max(1, ...scores.map((score) => Math.abs(score))) * 1.1;
  const lineX = (score: number) => PAD.left + ((score + scoreReach) / (2 * scoreReach)) * (LINE.width - PAD.left - PAD.right);
  const row = view.rows[Math.min(selected, view.rows.length - 1)];

  return (
    <div>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-600 dark:text-slate-300">
        <label className="flex flex-1 items-center gap-2">
          direction, degrees
          <input type="range" min={0} max={180} step={1} value={angle} onChange={(event) => setAngle(Number(event.target.value))} className="flex-1 accent-indigo-600" />
          <span className="w-10 text-right font-mono">{angle}</span>
        </label>
        {has("length") && (
          <label className="flex items-center gap-2">
            arrow length
            <input type="range" min={0.5} max={3} step={0.1} value={length} onChange={(event) => setLength(Number(event.target.value))} className="w-28 accent-amber-500" />
            <span className="w-8 text-right font-mono">{length.toFixed(1)}</span>
          </label>
        )}
        {has("centre") && (
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={centre} onChange={(event) => setCentre(event.target.checked)} className="accent-indigo-600" />
            subtract the mean first
          </label>
        )}
        <span className="flex gap-1 rounded-md border border-slate-300 p-0.5 dark:border-slate-700">
          {[
            { label: "the crowd", value: CROWD },
            { label: "the measured four", value: WORKED_PEOPLE },
          ].map((choice) => (
            <button key={choice.label} onClick={() => { setPoints(choice.value); setSelected(0); }} className={"rounded px-2 py-0.5 text-xs font-medium transition " + (points === choice.value ? "bg-indigo-600 text-white" : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800")}>
              {choice.label}
            </button>
          ))}
        </span>
      </div>

      <svg viewBox={`0 0 ${VIEW.width} ${VIEW.height}`} className="mt-3 w-full select-none rounded-lg bg-slate-50 dark:bg-slate-950">
        {!centre && (
          <>
            <line x1={plotX(0)} x2={plotX(0)} y1={PAD.top} y2={VIEW.height - PAD.bottom} className="stroke-slate-300 dark:stroke-slate-700" strokeWidth={1} />
            <line x1={PAD.left} x2={VIEW.width - PAD.right} y1={plotY(0)} y2={plotY(0)} className="stroke-slate-300 dark:stroke-slate-700" strokeWidth={1} />
          </>
        )}
        <line x1={plotX(lineEnds[0].x)} y1={plotY(lineEnds[0].y)} x2={plotX(lineEnds[1].x)} y2={plotY(lineEnds[1].y)} stroke={FIRST} strokeWidth={1.5} strokeDasharray="6 4" />
        {view.rows.map((each, index) => (
          <g key={index}>
            <line x1={plotX(each.x)} y1={plotY(each.y)} x2={plotX(each.foot.x)} y2={plotY(each.foot.y)} stroke={has("residuals") ? LOST : "#94a3b8"} strokeWidth={has("residuals") ? 2 : 1} strokeDasharray={has("residuals") ? undefined : "2 3"} />
            <circle cx={plotX(each.foot.x)} cy={plotY(each.foot.y)} r={4} fill={KEPT} />
          </g>
        ))}
        {has("contribution") && (
          <>
            <line x1={plotX(pivot.x)} y1={plotY(pivot.y)} x2={plotX(row.x)} y2={plotY(pivot.y)} stroke={FIRST} strokeWidth={2} />
            <line x1={plotX(row.x)} y1={plotY(pivot.y)} x2={plotX(row.x)} y2={plotY(row.y)} stroke={SECOND} strokeWidth={2} />
          </>
        )}
        {view.rows.map((each, index) => (
          <circle key={`p${index}`} cx={plotX(each.x)} cy={plotY(each.y)} r={index === selected ? 7 : 5.5} fill={index === selected ? FIRST : "#334155"} stroke="white" strokeWidth={1.5} className="cursor-pointer" onClick={() => setSelected(index)} />
        ))}
        <circle cx={plotX(pivot.x)} cy={plotY(pivot.y)} r={4} fill="white" stroke={FIRST} strokeWidth={2} />
        <line x1={plotX(pivot.x)} y1={plotY(pivot.y)} x2={plotX(arrowTip.x)} y2={plotY(arrowTip.y)} stroke={FIRST} strokeWidth={3} />
        <circle cx={plotX(arrowTip.x)} cy={plotY(arrowTip.y)} r={4} fill={FIRST} />
        {has("transform") && (
          <>
            <line x1={plotX(pivot.x)} y1={plotY(pivot.y)} x2={plotX(transformedTip.x)} y2={plotY(transformedTip.y)} stroke={SECOND} strokeWidth={3} />
            <circle cx={plotX(transformedTip.x)} cy={plotY(transformedTip.y)} r={4} fill={SECOND} />
            <text x={plotX(transformedTip.x) + 8} y={plotY(transformedTip.y) - 6} className="text-[10px] font-medium" fill={SECOND}>C u</text>
            <text x={plotX(arrowTip.x) + 8} y={plotY(arrowTip.y) - 6} className="text-[10px] font-medium" fill={FIRST}>u</text>
          </>
        )}
        <text x={PAD.left + (VIEW.width - PAD.left - PAD.right) / 2} y={VIEW.height - 8} textAnchor="middle" className="fill-slate-500 text-xs dark:fill-slate-400">height, cm</text>
        <text x={16} y={VIEW.height / 2} textAnchor="middle" transform={`rotate(-90 16 ${VIEW.height / 2})`} className="fill-slate-500 text-xs dark:fill-slate-400">weight, kg</text>
      </svg>

      {has("scores") && (
        <svg viewBox={`0 0 ${LINE.width} ${LINE.height}`} className="mt-1 w-full select-none">
          <line x1={PAD.left} x2={LINE.width - PAD.right} y1={LINE.height / 2} y2={LINE.height / 2} stroke={FIRST} strokeWidth={1.5} />
          <line x1={lineX(0)} x2={lineX(0)} y1={LINE.height / 2 - 8} y2={LINE.height / 2 + 8} className="stroke-slate-400" strokeWidth={1} />
          <text x={lineX(0)} y={LINE.height / 2 + 20} textAnchor="middle" className="fill-slate-500 text-[10px] dark:fill-slate-400">0</text>
          <text x={lineX(view.score_mean)} y={LINE.height / 2 - 12} textAnchor="middle" className="fill-slate-500 text-[10px] dark:fill-slate-400">mean {view.score_mean.toFixed(1)}</text>
          {view.rows.map((each, index) => (
            <circle key={index} cx={lineX(each.score)} cy={LINE.height / 2} r={index === selected ? 7 : 5} fill={index === selected ? FIRST : KEPT} stroke="white" strokeWidth={1.5} className="cursor-pointer" onClick={() => setSelected(index)} />
          ))}
          <text x={LINE.width - PAD.right} y={LINE.height / 2 + 20} textAnchor="end" className="fill-slate-500 text-[10px] dark:fill-slate-400">scores along the direction</text>
        </svg>
      )}

      {has("sweep") && sweep && (
        <SweepCurve sweep={sweep} angle={angle} current={view.unit_score_variance} />
      )}

      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Stat label="unit direction u" value={`(${view.unit.dx.toFixed(2)}, ${view.unit.dy.toFixed(2)})`} />
        {has("length") ? (
          <>
            <Stat label="arrow as drawn" value={`(${view.vector.dx.toFixed(2)}, ${view.vector.dy.toFixed(2)})`} />
            <Stat label="variance of scores, arrow" value={view.score_variance.toFixed(1)} />
            <Stat label="variance of scores, unit" value={view.unit_score_variance.toFixed(1)} />
          </>
        ) : has("centre") ? (
          <>
            <Stat label="mean of scores" value={view.score_mean.toFixed(1)} />
            <Stat label="mean of squared scores" value={view.score_second_moment.toFixed(1)} />
            <Stat label="variance about their mean" value={view.score_variance.toFixed(1)} />
          </>
        ) : has("residuals") ? (
          <>
            <Stat label="retained, sum of squared scores" value={view.retained_sum_squares.toFixed(1)} />
            <Stat label="discarded, sum of squared stubs" value={view.total_squared_residual.toFixed(1)} />
            <Stat label="total squared deviation" value={view.total_sum_squares.toFixed(1)} />
          </>
        ) : has("transform") ? (
          <>
            <Stat label="C u" value={`(${view.transformed.dx.toFixed(1)}, ${view.transformed.dy.toFixed(1)})`} />
            <Stat label="angle between u and C u" value={`${view.angle_between_degrees.toFixed(1)}°`} />
            <Stat label="length of C u" value={view.transformed_length.toFixed(1)} />
          </>
        ) : (
          <>
            <Stat label="mean of scores" value={view.score_mean.toFixed(1)} />
            <Stat label="variance of scores" value={view.score_variance.toFixed(1)} />
            <Stat label={`score of person ${selected + 1}`} value={row.score.toFixed(2)} />
          </>
        )}
      </div>

      {has("contribution") && (
        <div className="mt-2 rounded-md bg-slate-100 px-3 py-2 font-mono text-xs text-slate-800 dark:bg-slate-800 dark:text-slate-200">
          <p>person {selected + 1}, deviation ({row.deviation_x.toFixed(1)}, {row.deviation_y.toFixed(1)})</p>
          <p style={{ color: FIRST }}>height part {view.unit.dx.toFixed(2)} × {row.deviation_x.toFixed(1)} = {row.contribution_x.toFixed(2)}</p>
          <p style={{ color: SECOND }}>weight part {view.unit.dy.toFixed(2)} × {row.deviation_y.toFixed(1)} = {row.contribution_y.toFixed(2)}</p>
          <p className="font-semibold">score {row.contribution_x.toFixed(2)} + {row.contribution_y.toFixed(2)} = {row.score.toFixed(2)}</p>
        </div>
      )}
      {message && <p className="mt-2 text-sm text-amber-600 dark:text-amber-400">{message}</p>}
    </div>
  );
}

function SweepCurve({ sweep, angle, current }: { sweep: VarianceSweep; angle: number; current: number }) {
  const innerWidth = CURVE.width - CURVE_PAD.left - CURVE_PAD.right;
  const innerHeight = CURVE.height - CURVE_PAD.top - CURVE_PAD.bottom;
  const top = Math.max(...sweep.variances);
  const curveX = (degrees: number) => CURVE_PAD.left + (degrees / 180) * innerWidth;
  const curveY = (variance: number) => CURVE_PAD.top + (1 - variance / top) * innerHeight;
  const path = sweep.angles_degrees.map((degrees, index) => `${index === 0 ? "M" : "L"}${curveX(degrees)},${curveY(sweep.variances[index])}`).join(" ");
  const ordered = [...sweep.components].sort((first, second) => second.variance - first.variance);
  return (
    <svg viewBox={`0 0 ${CURVE.width} ${CURVE.height}`} className="mt-2 w-full select-none rounded-lg bg-slate-50 dark:bg-slate-950">
      <path d={path} fill="none" stroke={FIRST} strokeWidth={2} />
      {ordered.map((component, position) => (
        <g key={position}>
          <line x1={curveX(component.angle_degrees)} x2={curveX(component.angle_degrees)} y1={CURVE_PAD.top} y2={CURVE.height - CURVE_PAD.bottom} stroke={KEPT} strokeDasharray="4 3" strokeWidth={1.2} />
          <text x={curveX(component.angle_degrees)} y={CURVE_PAD.top - 6} textAnchor="middle" className="text-[10px] font-medium" fill={KEPT}>component {position + 1}, {component.angle_degrees.toFixed(0)}°</text>
        </g>
      ))}
      <line x1={curveX(angle)} x2={curveX(angle)} y1={CURVE_PAD.top} y2={CURVE.height - CURVE_PAD.bottom} stroke={SECOND} strokeWidth={1.5} />
      <circle cx={curveX(angle)} cy={curveY(current)} r={5} fill={SECOND} stroke="white" strokeWidth={1.5} />
      <text x={curveX(angle) + 8} y={curveY(current) - 8} className="text-[10px] font-medium" fill={SECOND}>{current.toFixed(1)} at {angle}°</text>
      {[0, 45, 90, 135, 180].map((tick) => (
        <text key={tick} x={curveX(tick)} y={CURVE.height - CURVE_PAD.bottom + 14} textAnchor="middle" className="fill-slate-500 text-[10px] dark:fill-slate-400">{tick}°</text>
      ))}
      <text x={CURVE_PAD.left - 6} y={CURVE_PAD.top + 4} textAnchor="end" className="fill-slate-500 text-[10px] dark:fill-slate-400">{top.toFixed(0)}</text>
      <text x={CURVE_PAD.left - 6} y={CURVE.height - CURVE_PAD.bottom + 4} textAnchor="end" className="fill-slate-500 text-[10px] dark:fill-slate-400">0</text>
      <text x={CURVE_PAD.left + innerWidth / 2} y={CURVE.height - 6} textAnchor="middle" className="fill-slate-500 text-[10px] dark:fill-slate-400">variance of the scores against the direction&rsquo;s angle</text>
    </svg>
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
