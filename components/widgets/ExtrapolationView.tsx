"use client";

// What each kernel says once the ball has landed.
//
// The throw is measured over four seconds and the curve is sampled from
// four seconds before it to eight after, with the target mean drawn behind.
// The radial curve goes back to that mean within a couple of seconds of the
// last throw, because its kernel is a bump around each training row and
// there are no rows out there; the polynomial curve keeps its shape and runs
// away; the line keeps its slope. Drag the question along the axis and read
// what each answers and how far from the mean it is. Every curve and every
// answer comes from the library through the API.

import { useEffect, useState } from "react";
import { ApiError, KernelChoice, KernelRidgeFit, fitKernelRidge } from "@/lib/concepts/kernel-ridge";
import { ACTIVE_CLASS, BUTTON_CLASS, KERNEL_COLOUR, MEAN_COLOUR, NOISY_THROW, boundsOf, scalesOf } from "./kernelRidgeFixtures";

const FRAME = { width: 640, height: 300, left: 48, right: 18, top: 14, bottom: 40 };
const RANGE = { from: -4, to: 12 };
const DEBOUNCE_MS = 140;

const KERNELS: { label: string; kernel: KernelChoice; penalty: number }[] = [
  { label: "Radial basis, gamma 1, penalty 0.1", kernel: { name: "rbf", gamma: 1 }, penalty: 0.1 },
  { label: "Polynomial, degree 2, penalty 1", kernel: { name: "polynomial", degree: 2 }, penalty: 1 },
  { label: "Linear, penalty 1", kernel: { name: "linear" }, penalty: 1 },
];

export function ExtrapolationView() {
  const [which, setWhich] = useState(0);
  const [queryX, setQueryX] = useState(6);
  const [answer, setAnswer] = useState<KernelRidgeFit | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(async () => {
      try {
        const choice = KERNELS[which];
        setAnswer(await fitKernelRidge(NOISY_THROW, choice.kernel, choice.penalty, queryX, RANGE));
        setMessage(null);
      } catch (error) {
        if (error instanceof ApiError) setMessage(error.message);
        else setMessage("Something went wrong.");
      }
    }, DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [which, queryX]);

  const bounds = boundsOf(NOISY_THROW, answer ? [answer.curve] : [], 60);
  bounds.xMin = RANGE.from;
  bounds.xMax = RANGE.to;
  const { plotX, plotY, pathOf, plotWidth, plotHeight } = scalesOf(bounds, FRAME);

  return (
    <div className="my-4">
      <div className="flex flex-wrap items-center gap-4 pb-2 text-sm text-slate-600 dark:text-slate-300">
        <span className="flex flex-wrap gap-2">
          {KERNELS.map((each, index) => (
            <button key={each.label} onClick={() => setWhich(index)} className={index === which ? ACTIVE_CLASS : BUTTON_CLASS}>{each.label}</button>
          ))}
        </span>
        <label className="flex items-center gap-2">
          ask at
          <input type="range" min={RANGE.from} max={RANGE.to} step={0.25} value={queryX} onChange={(event) => setQueryX(Number(event.target.value))} className="w-32 accent-amber-500" />
          <span className="w-12 font-mono text-sm">{queryX.toFixed(2)} s</span>
        </label>
      </div>
      <svg viewBox={`0 0 ${FRAME.width} ${FRAME.height}`} className="w-full select-none rounded-lg bg-slate-50 dark:bg-slate-950">
        {answer && (
          <>
            <rect x={plotX(0)} y={FRAME.top} width={plotX(4) - plotX(0)} height={plotHeight} className="fill-slate-200/60 dark:fill-slate-800/60" />
            <line x1={FRAME.left} x2={FRAME.left + plotWidth} y1={plotY(answer.target_mean)} y2={plotY(answer.target_mean)} stroke={MEAN_COLOUR} strokeWidth={1.5} strokeDasharray="4 4" />
            <path d={pathOf(answer.curve)} fill="none" strokeWidth={2.5} stroke={KERNEL_COLOUR} />
            <line x1={plotX(queryX)} x2={plotX(queryX)} y1={FRAME.top} y2={FRAME.top + plotHeight} className="stroke-amber-500" strokeDasharray="3 3" strokeWidth={1.5} />
          </>
        )}
        {NOISY_THROW.map((point, index) => (
          <circle key={index} cx={plotX(point.x)} cy={plotY(point.y)} r={3.5} className="fill-slate-800 stroke-white dark:fill-slate-100 dark:stroke-slate-900" strokeWidth={1.5} />
        ))}
        {[-4, 0, 4, 8, 12].map((tick) => (
          <text key={tick} x={plotX(tick)} y={FRAME.height - 22} textAnchor="middle" className="fill-slate-500 text-[10px] dark:fill-slate-400">{tick} s</text>
        ))}
        <text x={FRAME.left} y={FRAME.height - 6} className="fill-slate-500 text-[10px] dark:fill-slate-400">shaded, the four seconds that were measured · dashed, the target mean · the window clips a curve past ±60</text>
      </svg>
      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
        <Stat label={`answer at ${queryX.toFixed(2)} s`} value={answer ? answer.prediction_at_query.toFixed(3) : "…"} />
        <Stat label="target mean" value={answer ? answer.target_mean.toFixed(3) : "…"} />
        <Stat label="distance from the mean" value={answer ? Math.abs(answer.prediction_at_query - answer.target_mean).toExponential(2) : "…"} />
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
