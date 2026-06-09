"use client";

// One kernel refitted at thirteen penalties, from a billionth to a thousand.
//
// The upper chart follows the training score, the size of the largest dual
// weight and the condition number of the penalised system across the
// ladder, on a log axis, and the lower chart draws the curve at whichever
// penalty is selected, with the target mean behind it. At the small end the
// radial curve passes through the throws and swings between them, and the
// weights and the condition number climb as one over the penalty; at the
// large end the curve flattens onto the mean. Every refit is the library's;
// the browser picks one out to draw.

import { useEffect, useState } from "react";
import { ApiError, KernelChoice, PenaltySweep, sweepPenalties } from "@/lib/concepts/kernel-ridge";
import { ACTIVE_CLASS, BUTTON_CLASS, KERNEL_COLOUR, MEAN_COLOUR, NOISY_THROW, SECOND_COLOUR, WRONG_COLOUR, boundsOf, formatScore, scalesOf } from "./kernelRidgeFixtures";

const CHART = { width: 640, height: 220, left: 48, right: 48, top: 16, bottom: 34 };
const CURVE = { width: 640, height: 220, left: 48, right: 18, top: 14, bottom: 30 };
const PENALTIES = Array.from({ length: 13 }, (_, index) => 10 ** (index - 9));

const KERNELS: { label: string; kernel: KernelChoice }[] = [
  { label: "Radial basis, gamma 1", kernel: { name: "rbf", gamma: 1 } },
  { label: "Polynomial, degree 2", kernel: { name: "polynomial", degree: 2 } },
  { label: "Linear", kernel: { name: "linear" } },
];

export function PenaltySweepChart() {
  const [which, setWhich] = useState(0);
  const [selected, setSelected] = useState(9);
  const [sweep, setSweep] = useState<PenaltySweep | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setSweep(await sweepPenalties(NOISY_THROW, KERNELS[which].kernel, PENALTIES));
        setMessage(null);
      } catch (error) {
        if (error instanceof ApiError) setMessage(error.message);
        else setMessage("Something went wrong.");
      }
    })();
  }, [which]);

  if (!sweep) return <p className="my-4 text-sm text-slate-500 dark:text-slate-400">{message ?? "…"}</p>;

  const steps = sweep.steps;
  const step = steps[selected];
  const innerWidth = CHART.width - CHART.left - CHART.right;
  const innerHeight = CHART.height - CHART.top - CHART.bottom;
  const chartX = (index: number) => CHART.left + (index / (steps.length - 1)) * innerWidth;
  const scoreY = (value: number) => CHART.top + (1 - Math.max(0, value)) * innerHeight;
  const logTop = Math.max(...steps.map((each) => Math.log10(Math.max(each.condition_number, each.max_abs_dual_weight))), 1);
  const logY = (value: number) => CHART.top + (1 - Math.max(0, Math.log10(Math.max(value, 1e-12))) / logTop) * innerHeight;
  const line = (values: number[], y: (value: number) => number) => values.map((value, index) => `${index === 0 ? "M" : "L"}${chartX(index).toFixed(1)},${y(value).toFixed(1)}`).join(" ");

  const bounds = boundsOf(NOISY_THROW, [step.curve], 60);
  const { plotX, plotY, pathOf, plotWidth } = scalesOf(bounds, CURVE);

  return (
    <div className="my-4">
      <div className="flex flex-wrap items-center gap-2 pb-2">
        {KERNELS.map((each, index) => (
          <button key={each.label} onClick={() => setWhich(index)} className={index === which ? ACTIVE_CLASS : BUTTON_CLASS}>{each.label}</button>
        ))}
      </div>
      <svg viewBox={`0 0 ${CHART.width} ${CHART.height}`} className="w-full select-none rounded-lg bg-slate-50 dark:bg-slate-950">
        <path d={line(steps.map((each) => each.r_squared), scoreY)} fill="none" stroke={KERNEL_COLOUR} strokeWidth={2} />
        <path d={line(steps.map((each) => each.max_abs_dual_weight), logY)} fill="none" stroke={SECOND_COLOUR} strokeWidth={1.5} strokeDasharray="5 3" />
        <path d={line(steps.map((each) => each.condition_number), logY)} fill="none" stroke={WRONG_COLOUR} strokeWidth={1.5} strokeDasharray="2 3" />
        <line x1={chartX(selected)} x2={chartX(selected)} y1={CHART.top} y2={CHART.top + innerHeight} stroke={MEAN_COLOUR} strokeWidth={1.5} />
        {steps.map((each, index) => (
          <circle key={index} cx={chartX(index)} cy={scoreY(each.r_squared)} r={index === selected ? 5 : 3} fill={KERNEL_COLOUR} className="cursor-pointer" onClick={() => setSelected(index)} />
        ))}
        {steps.map((each, index) => (
          <text key={index} x={chartX(index)} y={CHART.height - 14} textAnchor="middle" className="fill-slate-500 text-[8px] dark:fill-slate-400">{`1e${Math.round(Math.log10(each.penalty))}`}</text>
        ))}
        <text x={CHART.left - 6} y={CHART.top + 4} textAnchor="end" className="fill-slate-500 text-[9px] dark:fill-slate-400">1</text>
        <text x={CHART.left - 6} y={CHART.top + innerHeight + 3} textAnchor="end" className="fill-slate-500 text-[9px] dark:fill-slate-400">0</text>
        <text x={CHART.left + innerWidth + 6} y={CHART.top + 4} className="fill-slate-500 text-[9px] dark:fill-slate-400">1e{logTop.toFixed(0)}</text>
        <text x={CHART.left + innerWidth + 6} y={CHART.top + innerHeight + 3} className="fill-slate-500 text-[9px] dark:fill-slate-400">1</text>
        <text x={CHART.left + innerWidth / 2} y={CHART.height - 3} textAnchor="middle" className="fill-slate-500 text-[9px] dark:fill-slate-400">penalty · indigo, R² on the left scale · green, largest dual weight and rose, condition number on the log scale at right</text>
      </svg>

      <svg viewBox={`0 0 ${CURVE.width} ${CURVE.height}`} className="mt-2 w-full select-none rounded-lg bg-slate-50 dark:bg-slate-950">
        <line x1={CURVE.left} x2={CURVE.left + plotWidth} y1={plotY(sweep.target_mean)} y2={plotY(sweep.target_mean)} stroke={MEAN_COLOUR} strokeWidth={1} strokeDasharray="2 4" />
        <path d={pathOf(step.curve)} fill="none" strokeWidth={2} stroke={KERNEL_COLOUR} />
        {NOISY_THROW.map((point, index) => (
          <circle key={index} cx={plotX(point.x)} cy={plotY(point.y)} r={3.5} className="fill-slate-800 stroke-white dark:fill-slate-100 dark:stroke-slate-900" strokeWidth={1.5} />
        ))}
        <text x={CURVE.left} y={CURVE.height - 10} className="fill-slate-500 text-[10px] dark:fill-slate-400">the curve at penalty {step.penalty.toExponential(0)}, clipped where it leaves the window</text>
      </svg>

      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-5">
        <Stat label="penalty" value={step.penalty.toExponential(0)} />
        <Stat label="R²" value={formatScore(step.r_squared, 6)} />
        <Stat label="largest dual weight" value={step.max_abs_dual_weight.toExponential(2)} />
        <Stat label="condition number" value={step.condition_number.toExponential(2)} />
        <Stat label="rows passed through, farthest from mean" value={`${step.rows_passed_through}, ${step.farthest_from_mean.toFixed(2)}`} />
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
