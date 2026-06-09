"use client";

// The receiver operating characteristic, one corner per distinct chance.
//
// Recall up against the false positive rate across, starting at nobody
// called in the bottom left and ending at everybody called in the top right.
// Each step down through the chances moves the curve up if the person added
// was an adult and right if they were a child, so a perfect ranking climbs
// the left edge before crossing the top, and the diagonal is what a coin
// would draw. The area underneath is the share of adult-child pairs in
// which the adult's chance is the higher, which the readout counts. The
// buttons switch between the twelve and the crowd where adults are rare.
// The API sweeps the corners and counts the pairs; the browser draws.

import { useEffect, useState } from "react";
import { ApiError, LabelledPoint } from "@/lib/api";
import {
  ClassifierEvaluation,
  evaluateAtThreshold,
} from "@/lib/concepts/judging-a-classifier";
import {
  AMBER,
  INDIGO,
  OVERLAPPING_CROWD,
  RARE_CROWD,
  buttonClass,
} from "./judgingAClassifierFixtures";

const VIEW = { width: 640, height: 320 };
const PAD = { left: 56, right: 20, top: 18, bottom: 44 };
const PLOT = { width: VIEW.width - PAD.left - PAD.right, height: VIEW.height - PAD.top - PAD.bottom };

const CROWDS: Record<string, LabelledPoint[]> = {
  "the twelve": OVERLAPPING_CROWD,
  "adults rare": RARE_CROWD,
};

export function RocCurve() {
  const [crowdName, setCrowdName] = useState("the twelve");
  const [answer, setAnswer] = useState<ClassifierEvaluation | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [selected, setSelected] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const result = await evaluateAtThreshold(CROWDS[crowdName], 0.5);
        if (cancelled) return;
        setAnswer(result);
        setSelected(null);
        setMessage(null);
      } catch (error) {
        if (cancelled) return;
        if (error instanceof ApiError) setMessage(error.message);
        else setMessage("Something went wrong.");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [crowdName]);

  if (!answer) {
    return <p className="text-sm text-slate-500 dark:text-slate-400">{message ?? "…"}</p>;
  }

  const crowd = CROWDS[crowdName];
  const adults = crowd.filter((person) => person.label === 1).length;
  const children = crowd.length - adults;
  const pairs = adults * children;
  const ordered = Math.round(answer.roc_area * pairs * 2) / 2;

  const rateToX = (value: number) => PAD.left + value * PLOT.width;
  const rateToY = (value: number) => PAD.top + (1 - value) * PLOT.height;
  const corners = answer.roc;
  const path = corners.map((corner, index) => `${index === 0 ? "M" : "L"}${rateToX(corner.false_positive_rate).toFixed(1)},${rateToY(corner.recall).toFixed(1)}`).join(" ");
  const area = `${path} L${rateToX(1).toFixed(1)},${rateToY(0).toFixed(1)} Z`;
  const chosen = selected === null ? null : corners[selected];

  return (
    <div className="my-4">
      <div className="flex flex-wrap items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
        <span className="flex gap-1 rounded-md border border-slate-300 p-0.5 dark:border-slate-700">
          {Object.keys(CROWDS).map((name) => (
            <button key={name} onClick={() => setCrowdName(name)} className={buttonClass(crowdName === name)}>
              {name}
            </button>
          ))}
        </span>
        <span className="text-xs text-slate-500 dark:text-slate-400">click a corner to read its threshold</span>
      </div>

      <svg viewBox={`0 0 ${VIEW.width} ${VIEW.height}`} className="mt-2 w-full select-none rounded-lg bg-slate-50 dark:bg-slate-950">
        {[0, 0.25, 0.5, 0.75, 1].map((tick) => (
          <g key={tick}>
            <line x1={PAD.left} x2={PAD.left + PLOT.width} y1={rateToY(tick)} y2={rateToY(tick)} className="stroke-slate-200 dark:stroke-slate-800" strokeWidth={1} />
            <text x={PAD.left - 8} y={rateToY(tick) + 4} textAnchor="end" className="fill-slate-500 text-[11px] dark:fill-slate-400">{tick.toFixed(2)}</text>
            <text x={rateToX(tick)} y={PAD.top + PLOT.height + 14} textAnchor="middle" className="fill-slate-500 text-[11px] dark:fill-slate-400">{tick.toFixed(2)}</text>
          </g>
        ))}
        <path d={area} fill={INDIGO} opacity={0.12} />
        <line x1={rateToX(0)} y1={rateToY(0)} x2={rateToX(1)} y2={rateToY(1)} stroke={AMBER} strokeDasharray="5 4" strokeWidth={1.5} />
        <text x={rateToX(0.72)} y={rateToY(0.66)} className="text-[10px] font-medium" fill={AMBER}>a coin</text>
        <path d={path} fill="none" stroke={INDIGO} strokeWidth={2} />
        {corners.map((corner, index) => (
          <circle key={index} cx={rateToX(corner.false_positive_rate)} cy={rateToY(corner.recall)} r={index === selected ? 6 : 3.5} fill={index === selected ? AMBER : INDIGO} stroke="white" strokeWidth={1.5} className="cursor-pointer" onClick={() => setSelected(index)} />
        ))}
        <text x={PAD.left + PLOT.width / 2} y={VIEW.height - 6} textAnchor="middle" className="fill-slate-500 text-xs font-medium dark:fill-slate-400">
          False positive rate across, recall up; the shaded area is the share of pairs ranked the right way
        </text>
      </svg>

      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Stat label="area under the curve" value={answer.roc_area.toFixed(4)} />
        <Stat label="adult-child pairs" value={`${adults} × ${children} = ${pairs}`} />
        <Stat label="pairs ranked the right way" value={`${ordered} of ${pairs}`} />
        <Stat label="corners" value={String(corners.length)} />
        {chosen && (
          <>
            <Stat label="threshold at this corner" value={chosen.threshold === null ? "above every chance" : chosen.threshold.toFixed(4)} />
            <Stat label="false positive rate" value={chosen.false_positive_rate.toFixed(4)} />
            <Stat label="recall" value={chosen.recall.toFixed(4)} />
          </>
        )}
      </div>
      {message && <p className="mt-2 text-sm text-rose-600 dark:text-rose-400">{message}</p>}
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
