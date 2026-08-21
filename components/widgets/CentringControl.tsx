"use client";

// Three lines through the crowd, two of them right and one of them the
// mistake the library made and recorded.
//
// Ridge regression and kernel ridge under the linear kernel are the same fit,
// so their lines lie exactly on top of one another and both pass through the
// mean point, drawn as a ring. The third line centred the target and left the
// heights where they were, at a hundred and seventy centimetres from the
// origin, and it comes out flat. Drag the penalty down toward nothing and the
// two right lines climb toward the slope the people really have while the
// third stays where it is. Every line comes from the library through the API.

import { useEffect, useState } from "react";
import { Point } from "@/lib/api";
import { ApiError, CentringControl as CentringAnswer, fitCentringControl } from "@/lib/concepts/kernel-ridge";
import { ACTIVE_CLASS, BUTTON_CLASS, CROWD, KERNEL_COLOUR, MEAN_COLOUR, NOISY_THROW, RIDGE_COLOUR, WRONG_COLOUR, boundsOf, formatSmall, scalesOf } from "./kernelRidgeFixtures";

const FRAME = { width: 640, height: 300, left: 48, right: 18, top: 14, bottom: 46 };
const DEBOUNCE_MS = 140;

const DATASETS: { label: string; points: Point[]; axis: string }[] = [
  { label: "The crowd", points: CROWD, axis: "height, cm" },
  { label: "The thrown ball", points: NOISY_THROW, axis: "time, s" },
];

export function CentringControl() {
  const [which, setWhich] = useState(0);
  const [logPenalty, setLogPenalty] = useState(0);
  const [answer, setAnswer] = useState<CentringAnswer | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const penalty = 10 ** logPenalty;
  const points = DATASETS[which].points;

  useEffect(() => {
    const timer = setTimeout(async () => {
      try {
        setAnswer(await fitCentringControl(points, penalty));
        setMessage(null);
      } catch (error) {
        if (error instanceof ApiError) setMessage(error.message);
        else setMessage("Something went wrong.");
      }
    }, DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [points, penalty]);

  const bounds = boundsOf(points, answer ? [answer.ridge.curve, answer.kernel_ridge.curve, answer.target_only.curve] : []);
  const { plotX, plotY, pathOf } = scalesOf(bounds, FRAME);

  return (
    <div className="my-4">
      <div className="flex flex-wrap items-center gap-4 pb-2 text-sm text-slate-600 dark:text-slate-300">
        <span className="flex gap-2">
          {DATASETS.map((each, index) => (
            <button key={each.label} onClick={() => setWhich(index)} className={index === which ? ACTIVE_CLASS : BUTTON_CLASS}>{each.label}</button>
          ))}
        </span>
        <label className="flex items-center gap-2">
          penalty
          <input type="range" min={-3} max={2} step={0.25} value={logPenalty} onChange={(event) => setLogPenalty(Number(event.target.value))} className="w-32 accent-indigo-600" />
          <span className="w-16 font-mono text-sm">{formatSmall(penalty)}</span>
        </label>
      </div>

      <svg viewBox={`0 0 ${FRAME.width} ${FRAME.height}`} className="w-full select-none rounded-lg bg-slate-50 dark:bg-slate-950">
        {answer && (
          <>
            <path d={pathOf(answer.ridge.curve)} fill="none" strokeWidth={6} stroke={RIDGE_COLOUR} />
            <path d={pathOf(answer.kernel_ridge.curve)} fill="none" strokeWidth={2.5} stroke={KERNEL_COLOUR} />
            <path d={pathOf(answer.target_only.curve)} fill="none" strokeWidth={2.5} strokeDasharray="6 4" stroke={WRONG_COLOUR} />
            <circle cx={plotX(answer.mean.x)} cy={plotY(answer.mean.y)} r={7} fill="none" strokeWidth={2} stroke={MEAN_COLOUR} />
          </>
        )}
        {points.map((point, index) => (
          <circle key={index} cx={plotX(point.x)} cy={plotY(point.y)} r={4} className="fill-slate-800 stroke-white dark:fill-slate-100 dark:stroke-slate-900" strokeWidth={1.5} />
        ))}
        <text x={FRAME.left} y={FRAME.height - 26} className="fill-slate-500 text-xs dark:fill-slate-400">grey and indigo, the two right fits · rose, the target centred alone · ring, the mean point</text>
        <text x={FRAME.left} y={FRAME.height - 10} className="fill-slate-500 text-xs dark:fill-slate-400">{DATASETS[which].axis}</text>
      </svg>

      <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="ridge slope" value={answer ? answer.ridge.slope.toFixed(4) : "…"} />
        <Stat label="kernel ridge slope" value={answer ? answer.kernel_ridge.slope.toFixed(4) : "…"} />
        <Stat label="target centred alone" value={answer ? answer.target_only.slope.toFixed(4) : "…"} />
        <Stat label="at the mean, right and wrong" value={answer ? `${answer.ridge.at_mean.toFixed(2)}, ${answer.target_only.at_mean.toFixed(2)}` : "…"} />
      </div>
      {message && <p className="mt-2 text-sm text-rose-600 dark:text-rose-400">{message}</p>}
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
