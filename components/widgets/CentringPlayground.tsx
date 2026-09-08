"use client";

// The people measured from a zero the reader chooses.
//
// Two sliders move the point every height and weight is measured from, which
// is the same as recording each height as a distance above a mark on the wall.
// The direction panel draws the longest direction of the rows measured from
// that zero, which is what a search for the direction of greatest spread finds
// when nothing centred the rows first, beside the first principal component of
// the centred rows and the arrow from zero to the average person. The line
// panel draws a least-squares line forced through that zero beside the line
// with an intercept. The API measures and fits; the browser draws.

import { useEffect, useState } from "react";
import { ApiError, Point } from "@/lib/api";
import { OriginView, viewFromOrigin } from "@/lib/concepts/centring-on-the-mean";
import {
  CENTRED,
  CROWD_POINTS,
  IDEAL_CASE,
  MEAN,
  MEASURED_FOUR,
  RAW,
  randomCrowd,
} from "./centringFixtures";

const VIEW = { width: 640, height: 400 };
const PAD = { left: 56, right: 16, top: 16, bottom: 40 };

export type OriginPanel = "direction" | "line";

type Choice = "crowd" | "four" | "ideal" | "random";

export function CentringPlayground({
  panels = ["direction", "line"],
  people = "crowd",
}: {
  panels?: OriginPanel[];
  people?: "crowd" | "four";
}) {
  const [choice, setChoice] = useState<Choice>(people);
  const [points, setPoints] = useState<Point[]>(people === "crowd" ? CROWD_POINTS : MEASURED_FOUR);
  const [heightOrigin, setHeightOrigin] = useState(0);
  const [weightOrigin, setWeightOrigin] = useState(0);
  const [view, setView] = useState<OriginView | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const has = (panel: OriginPanel) => panels.includes(panel);

  useEffect(() => {
    const timer = setTimeout(async () => {
      try {
        setView(await viewFromOrigin(points, heightOrigin, weightOrigin));
        setMessage(null);
      } catch (error) {
        if (error instanceof ApiError) setMessage(error.message);
        else setMessage("Something went wrong.");
      }
    }, 40);
    return () => clearTimeout(timer);
  }, [points, heightOrigin, weightOrigin]);

  const choose = (next: Choice) => {
    setChoice(next);
    if (next === "crowd") setPoints(CROWD_POINTS);
    if (next === "four") setPoints(MEASURED_FOUR);
    if (next === "ideal") setPoints(IDEAL_CASE);
    if (next === "random") setPoints(randomCrowd());
  };

  const tallest = Math.max(...points.map((point) => point.x));
  const heaviest = Math.max(...points.map((point) => point.y));

  const controls = (
    <div className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
      <div className="flex flex-wrap gap-1">
        {(
          [
            ["crowd", "the crowd"],
            ["four", "the measured four"],
            ["ideal", "An Ideal Case"],
            ["random", "a random crowd"],
          ] as [Choice, string][]
        ).map(([value, label]) => (
          <button
            key={value}
            onClick={() => choose(value)}
            className={
              "rounded px-2 py-0.5 text-xs font-medium transition " +
              (choice === value
                ? "bg-indigo-600 text-white"
                : "border border-slate-300 text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800")
            }
          >
            {label}
          </button>
        ))}
      </div>
      <label className="flex items-center gap-2">
        <span className="w-44">heights measured from, cm</span>
        <input type="range" min={0} max={tallest} step="any" value={heightOrigin} onChange={(event) => setHeightOrigin(Number(event.target.value))} className="flex-1 accent-rose-500" />
        <span className="w-14 text-right font-mono">{heightOrigin.toFixed(1)}</span>
      </label>
      <label className="flex items-center gap-2">
        <span className="w-44">weights measured from, kg</span>
        <input type="range" min={0} max={heaviest} step="any" value={weightOrigin} onChange={(event) => setWeightOrigin(Number(event.target.value))} className="flex-1 accent-rose-500" />
        <span className="w-14 text-right font-mono">{weightOrigin.toFixed(1)}</span>
      </label>
      <div className="flex flex-wrap gap-2">
        <button onClick={() => { setHeightOrigin(0); setWeightOrigin(0); }} className="rounded border border-slate-300 px-2 py-0.5 text-xs font-medium hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800">
          zero at no height and no weight
        </button>
        <button
          disabled={!view}
          onClick={() => {
            if (!view) return;
            setHeightOrigin(view.origin.x + view.centre.x);
            setWeightOrigin(view.origin.y + view.centre.y);
          }}
          className="rounded border border-slate-300 px-2 py-0.5 text-xs font-medium hover:bg-slate-100 disabled:opacity-50 dark:border-slate-700 dark:hover:bg-slate-800"
        >
          zero at the average person
        </button>
      </div>
    </div>
  );

  if (!view) {
    return (
      <div>
        {controls}
        <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">{message ?? "…"}</p>
      </div>
    );
  }

  const xs = points.map((point) => point.x).concat([heightOrigin]);
  const ys = points.map((point) => point.y).concat([weightOrigin]);
  const xSpan = Math.max(...xs) - Math.min(...xs) || 1;
  const ySpan = Math.max(...ys) - Math.min(...ys) || 1;
  const domain = {
    xMin: Math.min(...xs) - 0.08 * xSpan,
    xMax: Math.max(...xs) + 0.08 * xSpan,
    yMin: Math.min(...ys) - 0.08 * ySpan,
    yMax: Math.max(...ys) + 0.08 * ySpan,
  };
  const plotX = (value: number) => PAD.left + ((value - domain.xMin) / (domain.xMax - domain.xMin)) * (VIEW.width - PAD.left - PAD.right);
  const plotY = (value: number) => PAD.top + (1 - (value - domain.yMin) / (domain.yMax - domain.yMin)) * (VIEW.height - PAD.top - PAD.bottom);

  const zero = { x: heightOrigin, y: weightOrigin };
  const average = { x: heightOrigin + view.centre.x, y: weightOrigin + view.centre.y };
  const furthest = Math.max(...points.map((point) => Math.hypot(point.x - zero.x, point.y - zero.y)));
  const rawTip = {
    x: zero.x + 1.08 * furthest * view.uncentred.arrow.dx,
    y: zero.y + 1.08 * furthest * view.uncentred.arrow.dy,
  };
  const spreadReach = 1.15 * Math.max(...points.map((point) => Math.abs((point.x - average.x) * view.centred.arrow.dx + (point.y - average.y) * view.centred.arrow.dy)));
  const componentEnds = [
    { x: average.x - spreadReach * view.centred.arrow.dx, y: average.y - spreadReach * view.centred.arrow.dy },
    { x: average.x + spreadReach * view.centred.arrow.dx, y: average.y + spreadReach * view.centred.arrow.dy },
  ];
  const lineAt = (height: number, slope: number, intercept: number) => zero.y + intercept + slope * (height - zero.x);
  const locationShare = view.second_moment_total > 0 ? view.location_total / view.second_moment_total : 0;

  return (
    <div>
      {controls}
      <svg viewBox={`0 0 ${VIEW.width} ${VIEW.height}`} className="mt-3 w-full select-none rounded-lg bg-slate-50 dark:bg-slate-950">
        <defs>
          <clipPath id="centring-plot">
            <rect x={PAD.left} y={PAD.top} width={VIEW.width - PAD.left - PAD.right} height={VIEW.height - PAD.top - PAD.bottom} />
          </clipPath>
        </defs>
        <g clipPath="url(#centring-plot)">
          <line x1={plotX(zero.x)} x2={plotX(zero.x)} y1={PAD.top} y2={VIEW.height - PAD.bottom} className="stroke-slate-300 dark:stroke-slate-700" strokeWidth={1} />
          <line x1={PAD.left} x2={VIEW.width - PAD.right} y1={plotY(zero.y)} y2={plotY(zero.y)} className="stroke-slate-300 dark:stroke-slate-700" strokeWidth={1} />
          {has("direction") && (
            <>
              <line x1={plotX(zero.x)} y1={plotY(zero.y)} x2={plotX(average.x)} y2={plotY(average.y)} stroke={MEAN} strokeWidth={1.5} strokeDasharray="5 4" />
              <line x1={plotX(zero.x)} y1={plotY(zero.y)} x2={plotX(rawTip.x)} y2={plotY(rawTip.y)} stroke={RAW} strokeWidth={2.5} />
              <circle cx={plotX(rawTip.x)} cy={plotY(rawTip.y)} r={4} fill={RAW} />
              <line x1={plotX(componentEnds[0].x)} y1={plotY(componentEnds[0].y)} x2={plotX(componentEnds[1].x)} y2={plotY(componentEnds[1].y)} stroke={CENTRED} strokeWidth={2.5} />
            </>
          )}
          {has("line") && (
            <>
              <line x1={plotX(domain.xMin)} y1={plotY(lineAt(domain.xMin, view.through_origin.slope, 0))} x2={plotX(domain.xMax)} y2={plotY(lineAt(domain.xMax, view.through_origin.slope, 0))} stroke={RAW} strokeWidth={2} strokeDasharray={has("direction") ? "7 4" : undefined} />
              <line x1={plotX(domain.xMin)} y1={plotY(lineAt(domain.xMin, view.with_intercept.slope, view.with_intercept.intercept))} x2={plotX(domain.xMax)} y2={plotY(lineAt(domain.xMax, view.with_intercept.slope, view.with_intercept.intercept))} stroke={CENTRED} strokeWidth={2} strokeDasharray={has("direction") ? "7 4" : undefined} />
            </>
          )}
          {points.map((point, index) => (
            <circle key={index} cx={plotX(point.x)} cy={plotY(point.y)} r={5} fill="#334155" stroke="white" strokeWidth={1.5} />
          ))}
          <circle cx={plotX(average.x)} cy={plotY(average.y)} r={6} fill={MEAN} stroke="white" strokeWidth={1.5} />
          <text x={plotX(average.x) + 9} y={plotY(average.y) + 14} className="text-[10px] font-medium" fill={MEAN}>average person</text>
          <circle cx={plotX(zero.x)} cy={plotY(zero.y)} r={5} className="fill-slate-900 dark:fill-slate-100" />
          <text x={plotX(zero.x) + 8} y={plotY(zero.y) - 8} className="fill-slate-700 text-[10px] font-medium dark:fill-slate-300">zero</text>
        </g>
        <text x={PAD.left + (VIEW.width - PAD.left - PAD.right) / 2} y={VIEW.height - 8} textAnchor="middle" className="fill-slate-500 text-xs dark:fill-slate-400">height, cm</text>
        <text x={16} y={VIEW.height / 2} textAnchor="middle" transform={`rotate(-90 16 ${VIEW.height / 2})`} className="fill-slate-500 text-xs dark:fill-slate-400">weight, kg</text>
      </svg>

      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-600 dark:text-slate-400">
        {has("direction") && (
          <>
            <Swatch colour={RAW} label="longest direction measured from zero" />
            <Swatch colour={CENTRED} label="first principal component, centred" />
            <Swatch colour={MEAN} label="arrow from zero to the average person" dashed />
          </>
        )}
        {has("line") && (
          <>
            <Swatch colour={RAW} label="line forced through zero" dashed={has("direction")} />
            <Swatch colour={CENTRED} label="line with an intercept" dashed={has("direction")} />
          </>
        )}
      </div>

      {has("direction") && (
        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
          <Stat label="longest direction from zero" value={`${view.uncentred.arrow.angle_degrees.toFixed(2)}°`} />
          <Stat label="first component, centred" value={`${view.centred.arrow.angle_degrees.toFixed(2)}°`} />
          <Stat label="cosine between the two" value={view.uncentred_against_centred.toFixed(4)} />
          <Stat label="cosine with the arrow to the average" value={view.uncentred_against_mean === null ? "no arrow" : view.uncentred_against_mean.toFixed(5)} />
          <Stat label="share claimed, from zero" value={view.uncentred.share.toFixed(4)} />
          <Stat label="share of the variance, centred" value={view.centred.share.toFixed(4)} />
          <Stat label="squared length from zero" value={view.second_moment_total.toFixed(1)} />
          <Stat label="part of it that is location" value={locationShare.toFixed(4)} />
        </div>
      )}
      {has("line") && (
        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
          <Stat label="slope through zero" value={view.through_origin.slope.toFixed(4)} />
          <Stat label="explained, through zero" value={view.through_origin.r_squared.toFixed(4)} />
          <Stat label="slope, centred and through zero" value={view.centred_through_origin.slope.toFixed(4)} />
          <Stat label="slope with an intercept" value={view.with_intercept.slope.toFixed(4)} />
          <Stat label="explained, with an intercept" value={view.with_intercept.r_squared.toFixed(4)} />
          <Stat label="weight at the zero height" value={view.with_intercept.intercept.toFixed(2)} />
        </div>
      )}
      {message && <p className="mt-2 text-sm text-amber-600 dark:text-amber-400">{message}</p>}
    </div>
  );
}

function Swatch({ colour, label, dashed = false }: { colour: string; label: string; dashed?: boolean }) {
  return (
    <span className="flex items-center gap-1.5">
      <svg width="18" height="6" aria-hidden="true">
        <line x1={0} x2={18} y1={3} y2={3} stroke={colour} strokeWidth={2.5} strokeDasharray={dashed ? "4 3" : undefined} />
      </svg>
      {label}
    </span>
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
