"use client";

// The crowd's eleven heights on five rulers, with one height typed in
// millimetres by mistake.
//
// The three buttons choose the column: the heights as measured, the tallest
// person's 183 typed as 1830, and a middle person's 147 typed as 1470. Each
// row is one scaling method, its centre and spread at the left, the eleven
// scaled heights on a fixed ruler, and the 156 cm person's scaled value at
// the right, since that person is the median and the one whose reading each
// method ought to leave alone. A value off the end of a ruler is a hollow
// arrow. The API fits every scaler; the browser draws.

import { useEffect, useState } from "react";
import {
  ApiError,
  FeatureScalings,
  MethodScaling,
  ScalingMethod,
  scaleFeature,
} from "@/lib/api";
import { CROWD_HEIGHTS, MIDDLE_INDEX, TALLEST_INDEX } from "./featureScalingFixtures";

const VIEW = { width: 640, height: 44 };
const PAD = { left: 20, right: 20 };
const PLOT = { width: VIEW.width - PAD.left - PAD.right };
const BASELINE = 26;
const DOT_RADIUS = 5;
const WATCHED_INDEX = 1;

type Column = "measured" | "tallest" | "middle";

const COLUMNS: { key: Column; label: string; typoIndex: number | null }[] = [
  { key: "measured", label: "as measured", typoIndex: null },
  { key: "tallest", label: "the tallest typed as 1830", typoIndex: TALLEST_INDEX },
  { key: "middle", label: "a middle person typed as 1470", typoIndex: MIDDLE_INDEX },
];

function columnValues(column: Column): number[] {
  const values = [...CROWD_HEIGHTS];
  if (column === "tallest") values[TALLEST_INDEX] = CROWD_HEIGHTS[TALLEST_INDEX] * 10;
  if (column === "middle") values[MIDDLE_INDEX] = CROWD_HEIGHTS[MIDDLE_INDEX] * 10;
  return values;
}

interface Ruler {
  method: ScalingMethod;
  label: string;
  min: number;
  max: number;
  ticks: number[];
}

const RULERS: Ruler[] = [
  { method: "standardize", label: "Standardize", min: -3, max: 3, ticks: [-3, -2, -1, 0, 1, 2, 3] },
  { method: "min_max", label: "Min-max", min: 0, max: 1, ticks: [0, 0.25, 0.5, 0.75, 1] },
  { method: "max_abs", label: "Max-abs", min: 0, max: 1, ticks: [0, 0.25, 0.5, 0.75, 1] },
  { method: "robust", label: "Robust", min: -3, max: 3, ticks: [-3, -2, -1, 0, 1, 2, 3] },
  { method: "root_mean_square", label: "Root mean square", min: 0, max: 3, ticks: [0, 1, 2, 3] },
];

function positionOn(value: number, min: number, max: number): number {
  return PAD.left + ((value - min) / (max - min)) * PLOT.width;
}

export function OutlierRulers() {
  const [column, setColumn] = useState<Column>("measured");
  const [answer, setAnswer] = useState<FeatureScalings | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const typoIndex = COLUMNS.find((choice) => choice.key === column)!.typoIndex;

  useEffect(() => {
    (async () => {
      try {
        setAnswer(await scaleFeature(columnValues(column)));
        setMessage(null);
      } catch (error) {
        if (error instanceof ApiError) setMessage(error.message);
        else setMessage("Something went wrong.");
      }
    })();
  }, [column]);

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 pb-3 text-sm">
        {COLUMNS.map((choice) => (
          <button
            key={choice.key}
            onClick={() => setColumn(choice.key)}
            className={
              "rounded-md px-3 py-1.5 text-sm font-medium transition " +
              (column === choice.key
                ? "bg-indigo-600 text-white"
                : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700")
            }
          >
            {choice.label}
          </button>
        ))}
      </div>
      {!answer ? (
        <p className="text-sm text-slate-500 dark:text-slate-400">{message ?? "…"}</p>
      ) : (
        <div className="grid grid-cols-[8.5rem_1fr_3.5rem] items-center gap-x-3 gap-y-1">
          {RULERS.map((ruler) => (
            <RulerRow key={ruler.method} ruler={ruler} scaling={answer.scalings[ruler.method]} typoIndex={typoIndex} />
          ))}
        </div>
      )}
      <p className="mt-2 text-center text-xs text-slate-500 dark:text-slate-500">
        The amber dot is the 156 cm person, and the readout at the right is
        where each ruler puts them. The rose dot is the typed value, when there
        is one.
      </p>
      {message && <p className="mt-2 text-sm text-amber-600 dark:text-amber-400">{message}</p>}
    </div>
  );
}

function RulerRow({ ruler, scaling, typoIndex }: { ruler: Ruler; scaling: MethodScaling; typoIndex: number | null }) {
  const watched = scaling.scaled[WATCHED_INDEX];
  return (
    <>
      <div className="text-sm">
        <div className="font-medium text-slate-700 dark:text-slate-200">{ruler.label}</div>
        <div className="font-mono text-xs text-slate-500 dark:text-slate-400">
          centre {scaling.centre.toFixed(1)} · spread {scaling.spread.toFixed(1)}
        </div>
      </div>
      <svg viewBox={`0 0 ${VIEW.width} ${VIEW.height}`} className="w-full select-none rounded-lg bg-slate-50 dark:bg-slate-950">
        <line x1={PAD.left} y1={BASELINE} x2={PAD.left + PLOT.width} y2={BASELINE} stroke="currentColor" className="text-slate-300 dark:text-slate-700" strokeWidth={1} />
        {ruler.ticks.map((tick) => {
          const px = positionOn(tick, ruler.min, ruler.max);
          return (
            <g key={tick}>
              <line x1={px} y1={BASELINE} x2={px} y2={BASELINE + 4} stroke="currentColor" className="text-slate-300 dark:text-slate-700" strokeWidth={1} />
              <text x={px} y={BASELINE + 15} textAnchor="middle" className="fill-slate-500 text-[10px] font-medium dark:fill-slate-400">{tick}</text>
            </g>
          );
        })}
        {scaling.scaled.map((value, index) => {
          const beyond = value < ruler.min ? -1 : value > ruler.max ? 1 : 0;
          const clamped = Math.min(ruler.max, Math.max(ruler.min, value));
          const px = positionOn(clamped, ruler.min, ruler.max);
          const py = BASELINE - DOT_RADIUS - 2;
          const colour = index === WATCHED_INDEX ? "#f59e0b" : index === typoIndex ? "#f43f5e" : "#6366f1";
          if (beyond !== 0) {
            const tip = px + beyond * DOT_RADIUS;
            const tail = px - beyond * DOT_RADIUS;
            return <path key={index} d={`M ${tail} ${py - DOT_RADIUS} L ${tip} ${py} L ${tail} ${py + DOT_RADIUS} Z`} fill="none" stroke={colour} strokeWidth={2} />;
          }
          return <circle key={index} cx={px} cy={py} r={DOT_RADIUS} fill={colour} stroke="white" strokeWidth={1.2} opacity={index === WATCHED_INDEX || index === typoIndex ? 1 : 0.7} />;
        })}
      </svg>
      <div className="text-right font-mono text-sm font-semibold text-amber-600 dark:text-amber-400">{watched.toFixed(2)}</div>
    </>
  );
}
