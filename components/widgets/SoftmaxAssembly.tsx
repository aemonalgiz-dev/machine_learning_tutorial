"use client";

// Softmax as an assembly line: score, exponential, share of the total, probability.
//
// Three score sliders feed three rows, each row carrying one class's number
// through every stage in its own colour. The shared total is the one thing
// every row divides by, which is why raising one score lowers the other two
// probabilities. The shift slider adds the same constant to every score and
// changes nothing on the right, since softmax only reads differences, and
// the stable button jumps to scores near a thousand, where exponentiating
// directly overflows and subtracting the largest score first does not. The
// definition is drawn here; nothing is fitted.

import { useState } from "react";

const CLASSES = [
  { name: "class 1", colour: "#f59e0b" },
  { name: "class 2", colour: "#10b981" },
  { name: "class 3", colour: "#6366f1" },
];

function formatBig(value: number): string {
  if (!Number.isFinite(value)) return "overflow";
  if (value >= 1e6) return value.toExponential(2);
  return value.toFixed(3);
}

export function SoftmaxAssembly() {
  const [scores, setScores] = useState([1, 2, 0]);
  const [shift, setShift] = useState(0);
  const [stable, setStable] = useState(false);

  const shifted = scores.map((score) => score + shift);
  const largest = Math.max(...shifted);
  const naive = shifted.map((score) => Math.exp(score));
  const naiveTotal = naive.reduce((sum, value) => sum + value, 0);
  const centred = shifted.map((score) => score - largest);
  const stableExponentials = centred.map((score) => Math.exp(score));
  const stableTotal = stableExponentials.reduce((sum, value) => sum + value, 0);
  const probabilities = stableExponentials.map((value) => value / stableTotal);
  const naiveProbabilities = naive.map((value) => value / naiveTotal);
  const overflow = !Number.isFinite(naiveTotal);

  return (
    <div>
      <div className="grid gap-x-6 gap-y-2 pb-3 sm:grid-cols-2">
        {scores.map((score, index) => (
          <label key={index} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
            <span className="w-16" style={{ color: CLASSES[index].colour }}>z{index + 1}</span>
            <input type="range" min={-4} max={4} step={0.1} value={score} onChange={(event) => setScores(scores.map((value, position) => (position === index ? Number(event.target.value) : value)))} className="flex-1" style={{ accentColor: CLASSES[index].colour }} />
            <span className="w-12 text-right font-mono">{score.toFixed(1)}</span>
          </label>
        ))}
        <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
          <span className="w-16">shift all</span>
          <input type="range" min={-5} max={5} step={0.1} value={shift} onChange={(event) => setShift(Number(event.target.value))} className="flex-1 accent-slate-500" />
          <span className="w-12 text-right font-mono">{shift >= 0 ? "+" : ""}{shift.toFixed(1)}</span>
        </label>
      </div>
      <div className="flex flex-wrap gap-2 pb-3">
        <button onClick={() => { setScores([1, 2, 0]); setShift(0); setStable(false); }} className="rounded-md border border-slate-300 bg-white px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
          the clean example (1, 2, 0)
        </button>
        <button onClick={() => { setScores([0, 3.9602, -0.7918]); setShift(0); setStable(false); }} className="rounded-md border border-slate-300 bg-white px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
          the fitted middle person
        </button>
        <button onClick={() => { setScores([1, 2, 0]); setShift(999); setStable(true); }} className="rounded-md border border-amber-400 bg-amber-50 px-3 py-1 text-xs font-medium text-amber-800 hover:bg-amber-100 dark:border-amber-500/70 dark:bg-amber-950/30 dark:text-amber-200">
          scores near a thousand
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left dark:border-slate-800">
              <th className="py-1.5 pr-3 font-semibold text-slate-600 dark:text-slate-400">class</th>
              <th className="py-1.5 pr-3 font-semibold text-slate-600 dark:text-slate-400">score z</th>
              {stable && <th className="py-1.5 pr-3 font-semibold text-slate-600 dark:text-slate-400">z − max</th>}
              <th className="py-1.5 pr-3 font-semibold text-slate-600 dark:text-slate-400">{stable ? "e^(z − max)" : "e^z"}</th>
              <th className="py-1.5 pr-3 font-semibold text-slate-600 dark:text-slate-400">÷ total</th>
              <th className="py-1.5 font-semibold text-slate-600 dark:text-slate-400">probability</th>
            </tr>
          </thead>
          <tbody className="font-mono text-slate-800 dark:text-slate-200">
            {CLASSES.map((each, index) => (
              <tr key={each.name} className="border-b border-slate-100 last:border-0 dark:border-slate-800/60" style={{ color: each.colour }}>
                <td className="py-1.5 pr-3 font-sans">{each.name}</td>
                <td className="py-1.5 pr-3">{shifted[index].toFixed(3)}</td>
                {stable && <td className="py-1.5 pr-3">{centred[index].toFixed(3)}</td>}
                <td className="py-1.5 pr-3">{stable ? stableExponentials[index].toFixed(3) : formatBig(naive[index])}</td>
                <td className="py-1.5 pr-3 text-slate-500">÷ {stable ? stableTotal.toFixed(3) : formatBig(naiveTotal)}</td>
                <td className="py-1.5 font-semibold">{stable ? probabilities[index].toFixed(3) : overflow ? "NaN" : naiveProbabilities[index].toFixed(3)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-3 flex h-7 w-full overflow-hidden rounded-md">
        {probabilities.map((probability, index) => (
          <div key={index} style={{ width: `${probability * 100}%`, backgroundColor: CLASSES[index].colour }} className="flex items-center justify-center text-[10px] font-semibold text-white">
            {probability >= 0.1 ? probability.toFixed(3) : ""}
          </div>
        ))}
      </div>
      <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600 dark:text-slate-300">
        <span className="font-mono">total {probabilities.reduce((sum, value) => sum + value, 0).toFixed(3)}</span>
        <span className="font-mono">largest score: {CLASSES[shifted.indexOf(largest)].name}, largest probability: {CLASSES[probabilities.indexOf(Math.max(...probabilities))].name}</span>
        <label className="flex items-center gap-1.5">
          <input type="checkbox" checked={stable} onChange={(event) => setStable(event.target.checked)} className="accent-indigo-600" />
          subtract the largest score first
        </label>
      </div>
      {overflow && !stable && (
        <p className="mt-2 text-sm text-amber-700 dark:text-amber-300">
          e to the power of a thousand is larger than a float can hold, so the direct route divides infinity by infinity. Tick the box to subtract the largest score first.
        </p>
      )}
    </div>
  );
}
