"use client";

// A kernel direction, which is one coefficient per person and nothing else.
//
// The bars are the first two directions' coefficients on the ring, one per
// person, indigo for the inner twelve and amber for the outer twenty-four.
// Under the radial kernel the first direction gives every inner person one
// sign and every outer person the other, which is the direction from one
// group to the other written as a recipe over the people. The readouts give
// the eigenvalue at its two scales, the coefficients' squared length, and
// the two facts about the coefficient vectors the page measures: the largest
// dot product between two of them, and how far the coefficient matrix with
// the centred table in the middle sits from the identity. The library fits;
// the browser draws bars.

import { useEffect, useState } from "react";
import { ApiError, Lifted, fetchLifted } from "@/lib/concepts/kernel-pca";
import { GAMMA_STOPS, INNER, INNER_COUNT, MEASURED_FOUR, OUTER, RING, RING_GAMMA, gammaIndex } from "./kernelPcaFixtures";

const VIEW = { width: 640, height: 150 };
const PAD = { left: 36, right: 12, top: 10, bottom: 18 };

function tidy(value: number, digits: number): string {
  const rounded = Number(value.toFixed(digits));
  return (Object.is(rounded, -0) ? 0 : rounded).toFixed(digits);
}

export function RowCoefficients() {
  const [cloud, setCloud] = useState<"ring" | "four">("ring");
  const [gammaStop, setGammaStop] = useState(gammaIndex(RING_GAMMA));
  const [lifted, setLifted] = useState<Lifted | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const gamma = GAMMA_STOPS[gammaStop];

  useEffect(() => {
    const timer = setTimeout(async () => {
      try {
        setLifted(
          cloud === "ring"
            ? await fetchLifted(RING, "rbf", gamma, { innerCount: INNER_COUNT })
            : await fetchLifted(MEASURED_FOUR, "linear", 1),
        );
        setMessage(null);
      } catch (error) {
        if (error instanceof ApiError) setMessage(error.message);
        else setMessage("Something went wrong.");
      }
    }, 60);
    return () => clearTimeout(timer);
  }, [cloud, gamma]);

  if (!lifted) {
    return <p className="text-sm text-slate-500 dark:text-slate-400">{message ?? "…"}</p>;
  }

  const people = lifted.n_rows;
  const innerCount = cloud === "ring" ? INNER_COUNT : 0;
  const slot = (VIEW.width - PAD.left - PAD.right) / people;
  const fill = (index: number) => (cloud === "ring" ? (index < innerCount ? INNER : OUTER) : "#475569");

  const chart = (coefficients: number[], title: string) => {
    const reach = Math.max(...coefficients.map((value) => Math.abs(value)), 1e-9) * 1.1;
    const mid = PAD.top + (VIEW.height - PAD.top - PAD.bottom) / 2;
    const scale = (VIEW.height - PAD.top - PAD.bottom) / 2 / reach;
    return (
      <div>
        <p className="mb-1 text-xs text-slate-500 dark:text-slate-400">{title}</p>
        <svg viewBox={`0 0 ${VIEW.width} ${VIEW.height}`} className="w-full select-none rounded-lg bg-slate-50 dark:bg-slate-950">
          <line x1={PAD.left} x2={VIEW.width - PAD.right} y1={mid} y2={mid} className="stroke-slate-300 dark:stroke-slate-700" strokeWidth={1} />
          {coefficients.map((value, index) => (
            <rect key={index} x={PAD.left + index * slot + slot * 0.15} y={value >= 0 ? mid - value * scale : mid} width={slot * 0.7} height={Math.abs(value) * scale} fill={fill(index)} />
          ))}
          <text x={PAD.left - 4} y={mid + 3} textAnchor="end" className="fill-slate-500 text-[9px] dark:fill-slate-400">0</text>
          <text x={PAD.left - 4} y={PAD.top + 8} textAnchor="end" className="fill-slate-500 text-[9px] dark:fill-slate-400">{tidy(reach / 1.1, 3)}</text>
          <text x={VIEW.width - PAD.right} y={VIEW.height - 4} textAnchor="end" className="fill-slate-500 text-[9px] dark:fill-slate-400">one bar per person, in the order sent</text>
        </svg>
      </div>
    );
  };

  const first = lifted.components[0];
  const second = lifted.components[1];

  return (
    <div>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-600 dark:text-slate-300">
        <span className="flex gap-1 rounded-md border border-slate-300 p-0.5 dark:border-slate-700">
          {(["ring", "four"] as const).map((choice) => (
            <button key={choice} onClick={() => setCloud(choice)} className={"rounded px-2 py-0.5 text-xs font-medium transition " + (cloud === choice ? "bg-indigo-600 text-white" : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800")}>
              {choice === "ring" ? "the ring, radial" : "the measured four, linear"}
            </button>
          ))}
        </span>
        <label className="flex flex-1 items-center gap-2">
          gamma
          <input type="range" min={0} max={GAMMA_STOPS.length - 1} step={1} value={gammaStop} disabled={cloud === "four"} onChange={(event) => setGammaStop(Number(event.target.value))} className="flex-1 accent-indigo-600 disabled:opacity-40" />
          <span className="w-14 text-right font-mono">{cloud === "four" ? "" : gamma}</span>
        </label>
      </div>
      <div className="mt-3 space-y-3">
        {chart(first.row_coefficients, "first direction")}
        {second && chart(second.row_coefficients, "second direction")}
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Stat label="raw eigenvalue, first" value={tidy(first.raw_eigenvalue, 4)} />
        <Stat label={`over n − 1 = ${lifted.divisor}, the variance`} value={tidy(first.variance, 4)} />
        <Stat label="coefficients' squared length, first" value={tidy(first.row_coefficients.reduce((sum, value) => sum + value * value, 0), 4)} />
        <Stat label="one over the raw eigenvalue" value={tidy(1 / first.raw_eigenvalue, 4)} />
        <Stat label="largest dot product between two directions' coefficients" value={lifted.largest_coefficient_dot_product.toExponential(1)} />
        <Stat label="coefficients through the centred table, gap from identity" value={lifted.largest_kernel_metric_gap.toExponential(1)} />
        <Stat label="inner coefficients, first, from and to" value={cloud === "ring" ? `${tidy(Math.min(...first.row_coefficients.slice(0, innerCount)), 3)}, ${tidy(Math.max(...first.row_coefficients.slice(0, innerCount)), 3)}` : "…"} />
        <Stat label="outer coefficients, first, from and to" value={cloud === "ring" ? `${tidy(Math.min(...first.row_coefficients.slice(innerCount)), 3)}, ${tidy(Math.max(...first.row_coefficients.slice(innerCount)), 3)}` : "…"} />
      </div>
      {message && <p className="mt-2 text-sm text-amber-600 dark:text-amber-400">{message}</p>}
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
