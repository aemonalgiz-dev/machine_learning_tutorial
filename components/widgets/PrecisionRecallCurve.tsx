"use client";

// Precision against recall, one corner per distinct chance.
//
// The threshold starts above the highest chance, where nobody is called, and
// steps down through every person's chance in turn. Each step adds one
// person to those called adult, which moves recall right if they were an
// adult and precision down if they were not, so the curve is a staircase
// rather than a line and is drawn as one. The area under the steps is the
// average precision. The buttons switch between the twelve and the crowd
// where adults are rare, whose curve ends at a different height because the
// rightmost precision is always the share of the crowd that is adult. The
// API sweeps the corners and sums the area; the browser draws.

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

export function PrecisionRecallCurve() {
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

  const recallToX = (value: number) => PAD.left + value * PLOT.width;
  const precisionToY = (value: number) => PAD.top + (1 - value) * PLOT.height;
  const corners = answer.precision_recall;
  const steps = corners
    .map((corner, index) => {
      const x = recallToX(corner.recall).toFixed(1);
      const y = precisionToY(corner.precision).toFixed(1);
      if (index === 0) return `M${x},${y}`;
      const previous = corners[index - 1];
      return `L${x},${precisionToY(previous.precision).toFixed(1)} L${x},${y}`;
    })
    .join(" ");
  const area = corners
    .map((corner, index) => {
      const previousRecall = index === 0 ? 0 : corners[index - 1].recall;
      return `M${recallToX(previousRecall).toFixed(1)},${precisionToY(0).toFixed(1)} L${recallToX(previousRecall).toFixed(1)},${precisionToY(corner.precision).toFixed(1)} L${recallToX(corner.recall).toFixed(1)},${precisionToY(corner.precision).toFixed(1)} L${recallToX(corner.recall).toFixed(1)},${precisionToY(0).toFixed(1)} Z`;
    })
    .join(" ");
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
            <line x1={PAD.left} x2={PAD.left + PLOT.width} y1={precisionToY(tick)} y2={precisionToY(tick)} className="stroke-slate-200 dark:stroke-slate-800" strokeWidth={1} />
            <text x={PAD.left - 8} y={precisionToY(tick) + 4} textAnchor="end" className="fill-slate-500 text-[11px] dark:fill-slate-400">{tick.toFixed(2)}</text>
            <text x={recallToX(tick)} y={PAD.top + PLOT.height + 14} textAnchor="middle" className="fill-slate-500 text-[11px] dark:fill-slate-400">{tick.toFixed(2)}</text>
          </g>
        ))}
        <path d={area} fill={INDIGO} opacity={0.12} />
        <line x1={PAD.left} x2={PAD.left + PLOT.width} y1={precisionToY(answer.prevalence)} y2={precisionToY(answer.prevalence)} stroke={AMBER} strokeDasharray="5 4" strokeWidth={1.5} />
        <text x={PAD.left + PLOT.width - 4} y={precisionToY(answer.prevalence) - 5} textAnchor="end" className="text-[10px] font-medium" fill={AMBER}>
          prevalence {answer.prevalence.toFixed(4)}
        </text>
        <path d={steps} fill="none" stroke={INDIGO} strokeWidth={2} />
        {corners.map((corner, index) => (
          <circle key={index} cx={recallToX(corner.recall)} cy={precisionToY(corner.precision)} r={index === selected ? 6 : 4} fill={index === selected ? AMBER : INDIGO} stroke="white" strokeWidth={1.5} className="cursor-pointer" onClick={() => setSelected(index)} />
        ))}
        <text x={PAD.left + PLOT.width / 2} y={VIEW.height - 6} textAnchor="middle" className="fill-slate-500 text-xs font-medium dark:fill-slate-400">
          Recall across, precision up; the shaded steps are the average precision
        </text>
      </svg>

      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Stat label="corners" value={String(corners.length)} />
        <Stat label="average precision" value={answer.average_precision.toFixed(4)} />
        <Stat label="rightmost precision" value={corners[corners.length - 1].precision.toFixed(4)} />
        <Stat label="prevalence" value={answer.prevalence.toFixed(4)} />
        {chosen && (
          <>
            <Stat label="threshold at this corner" value={chosen.threshold.toFixed(4)} />
            <Stat label="recall" value={chosen.recall.toFixed(4)} />
            <Stat label="precision" value={chosen.precision.toFixed(4)} />
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
