"use client";

// A function that is sometimes a kernel, and what the solver does about it.
//
// The sigmoid kernel is a hyperbolic tangent of the scaled dot product plus
// a constant, and for many constants its Gram matrix on the throw has a
// negative eigenvalue, which no kernel's can. The Gram matrix is built first
// and its smallest eigenvalue read; then the fit is attempted. The
// factorisation the fit uses fails at the first non-positive pivot, so the
// fit is refused exactly when the smallest eigenvalue plus the penalty is
// not positive, and accepted, with a score worse than guessing the mean,
// when the penalty is just large enough to hide it. Both numbers and the
// refusal itself are the library's; the browser reports them.

import { useEffect, useState } from "react";
import { ApiError, GramMatrix, KernelRidgeFit, fetchGram, fitKernelRidge } from "@/lib/concepts/kernel-ridge";
import { KERNEL_COLOUR, MEAN_COLOUR, NOISY_THROW, boundsOf, formatScore, formatSmall, scalesOf } from "./kernelRidgeFixtures";

const FRAME = { width: 640, height: 240, left: 48, right: 18, top: 14, bottom: 30 };
const DEBOUNCE_MS = 140;
const GAMMA = 1;

export function MercerProbe() {
  const [constant, setConstant] = useState(-0.5);
  const [logPenalty, setLogPenalty] = useState(0);
  const [gram, setGram] = useState<GramMatrix | null>(null);
  const [fit, setFit] = useState<KernelRidgeFit | null>(null);
  const [refusal, setRefusal] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const penalty = 10 ** logPenalty;

  useEffect(() => {
    const timer = setTimeout(async () => {
      const kernel = { name: "sigmoid" as const, gamma: GAMMA, constant };
      try {
        setGram(await fetchGram(NOISY_THROW, kernel));
        setMessage(null);
      } catch (error) {
        if (error instanceof ApiError) setMessage(error.message);
        else setMessage("Something went wrong.");
        return;
      }
      try {
        setFit(await fitKernelRidge(NOISY_THROW, kernel, penalty, 2.0));
        setRefusal(null);
      } catch (error) {
        setFit(null);
        if (error instanceof ApiError && error.kind === "refused") setRefusal(error.message);
        else setMessage("Something went wrong.");
      }
    }, DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [constant, penalty]);

  const bounds = boundsOf(NOISY_THROW, fit ? [fit.curve] : [], 200);
  const { plotX, plotY, pathOf, plotWidth } = scalesOf(bounds, FRAME);
  const smallest = gram ? gram.eigenvalues[0] : null;

  return (
    <div className="my-4">
      <div className="flex flex-wrap items-center gap-4 pb-2 text-sm text-slate-600 dark:text-slate-300">
        <label className="flex items-center gap-2">
          constant
          <input type="range" min={-2} max={2} step={0.25} value={constant} onChange={(event) => setConstant(Number(event.target.value))} className="w-32 accent-emerald-600" />
          <span className="w-12 font-mono text-sm">{constant.toFixed(2)}</span>
        </label>
        <label className="flex items-center gap-2">
          penalty
          <input type="range" min={-2} max={2} step={0.25} value={logPenalty} onChange={(event) => setLogPenalty(Number(event.target.value))} className="w-32 accent-indigo-600" />
          <span className="w-16 font-mono text-sm">{formatSmall(penalty)}</span>
        </label>
      </div>
      <svg viewBox={`0 0 ${FRAME.width} ${FRAME.height}`} className="w-full select-none rounded-lg bg-slate-50 dark:bg-slate-950">
        {fit && (
          <>
            <line x1={FRAME.left} x2={FRAME.left + plotWidth} y1={plotY(fit.target_mean)} y2={plotY(fit.target_mean)} stroke={MEAN_COLOUR} strokeWidth={1} strokeDasharray="2 4" />
            <path d={pathOf(fit.curve)} fill="none" strokeWidth={2.5} stroke={KERNEL_COLOUR} />
          </>
        )}
        {NOISY_THROW.map((point, index) => (
          <circle key={index} cx={plotX(point.x)} cy={plotY(point.y)} r={3.5} className="fill-slate-800 stroke-white dark:fill-slate-100 dark:stroke-slate-900" strokeWidth={1.5} />
        ))}
        {!fit && refusal && (
          <text x={FRAME.left + plotWidth / 2} y={FRAME.top + 24} textAnchor="middle" className="fill-rose-500 text-xs font-medium">no fit, the solve was refused</text>
        )}
        <text x={FRAME.left} y={FRAME.height - 10} className="fill-slate-500 text-[10px] dark:fill-slate-400">tanh({GAMMA} a·b + {constant.toFixed(2)}) on the centred times, at penalty {formatSmall(penalty)}</text>
      </svg>
      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Stat label="smallest Gram eigenvalue" value={smallest === null ? "…" : smallest.toFixed(4)} />
        <Stat label="smallest eigenvalue plus penalty" value={smallest === null ? "…" : (smallest + penalty).toFixed(4)} />
        <Stat label="the solve" value={gram ? (fit ? "accepted" : refusal ? "refused" : "…") : "…"} />
        <Stat label="R² when accepted" value={fit ? formatScore(fit.r_squared) : "…"} />
      </div>
      {refusal && <p className="mt-2 text-xs text-rose-600 dark:text-rose-400">{refusal}</p>}
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
