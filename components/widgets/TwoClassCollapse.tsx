"use client";

// Two-class softmax folding into the sigmoid of a score difference.
//
// Two score sliders drive a two-class softmax on the left. On the right the
// same two scores are reduced to their difference and fed through the
// logistic page's sigmoid, and the two probabilities agree to every digit,
// because e^z₀ / (e^z₀ + e^z₁) is 1 / (1 + e^(z₁ − z₀)) is σ(z₀ − z₁). Drag
// both scores together and nothing changes; only the gap between them
// matters, which is also why softmax's parameters need a reference class.

import { useState } from "react";

export function TwoClassCollapse() {
  const [first, setFirst] = useState(1.5);
  const [second, setSecond] = useState(0.5);
  const softmaxFirst = Math.exp(first) / (Math.exp(first) + Math.exp(second));
  const difference = first - second;
  const sigmoid = 1 / (1 + Math.exp(-difference));

  return (
    <div>
      <div className="grid gap-x-6 gap-y-2 sm:grid-cols-2">
        <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
          <span className="w-10 font-mono text-amber-600 dark:text-amber-300">z₀</span>
          <input type="range" min={-5} max={5} step={0.1} value={first} onChange={(event) => setFirst(Number(event.target.value))} className="flex-1 accent-amber-500" />
          <span className="w-12 text-right font-mono">{first.toFixed(1)}</span>
        </label>
        <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
          <span className="w-10 font-mono text-indigo-600 dark:text-indigo-300">z₁</span>
          <input type="range" min={-5} max={5} step={0.1} value={second} onChange={(event) => setSecond(Number(event.target.value))} className="flex-1 accent-indigo-600" />
          <span className="w-12 text-right font-mono">{second.toFixed(1)}</span>
        </label>
      </div>
      <div className="mt-3 grid gap-4 sm:grid-cols-2">
        <div className="rounded-lg border border-slate-200 p-3 font-mono text-sm dark:border-slate-800">
          <p className="mb-1 font-sans text-xs font-medium text-slate-600 dark:text-slate-400">two-class softmax</p>
          <p className="text-slate-700 dark:text-slate-200">e^z₀ = {Math.exp(first).toFixed(3)}</p>
          <p className="text-slate-700 dark:text-slate-200">e^z₁ = {Math.exp(second).toFixed(3)}</p>
          <p className="mt-1 font-semibold text-slate-900 dark:text-slate-100">P(class 0) = {Math.exp(first).toFixed(3)} / {(Math.exp(first) + Math.exp(second)).toFixed(3)} = {softmaxFirst.toFixed(4)}</p>
        </div>
        <div className="rounded-lg border border-slate-200 p-3 font-mono text-sm dark:border-slate-800">
          <p className="mb-1 font-sans text-xs font-medium text-slate-600 dark:text-slate-400">the sigmoid of the difference</p>
          <p className="text-slate-700 dark:text-slate-200">z₀ − z₁ = {difference.toFixed(3)}</p>
          <p className="text-slate-700 dark:text-slate-200">e^−(z₀ − z₁) = {Math.exp(-difference).toFixed(3)}</p>
          <p className="mt-1 font-semibold text-slate-900 dark:text-slate-100">σ(z₀ − z₁) = 1 / (1 + {Math.exp(-difference).toFixed(3)}) = {sigmoid.toFixed(4)}</p>
        </div>
      </div>
      <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
        Move both sliders by the same amount and both numbers stay put. Only the gap between the scores reaches the probability.
      </p>
    </div>
  );
}
