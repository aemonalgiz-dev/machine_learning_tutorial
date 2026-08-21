"use client";

// Two columns carrying one piece of information, and the coefficients they
// cannot pin down between them.
//
// The first column is t and the second is 2t, which says nothing the first
// did not. The ideal throw's fit put 20 on t; here the slider moves that 20
// between the two columns, and the table shows every prediction staying put,
// since β₁ × t + β₂ × 2t depends only on β₁ + 2β₂. Every position of the
// slider is a different pair of coefficients describing the identical model,
// which is what the fit refuses to choose between and why it raises rather
// than answering.

import { useState } from "react";

const TIMES = [0, 1, 2, 3, 4];
const TOTAL_ON_T = 20;

function fixed(value: number): string {
  const text = value.toFixed(2);
  return text === "-0.00" ? "0.00" : text;
}

export function DuplicateColumnsSlider() {
  const [betaOne, setBetaOne] = useState(20);
  const betaTwo = (TOTAL_ON_T - betaOne) / 2;

  return (
    <div>
      <label className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
        <span className="w-32">coefficient on t</span>
        <input
          type="range"
          min={-20}
          max={40}
          step={0.5}
          value={betaOne}
          onChange={(event) => setBetaOne(Number(event.target.value))}
          className="flex-1 accent-indigo-600"
        />
        <span className="w-16 text-right font-mono">{fixed(betaOne)}</span>
      </label>
      <p className="mt-2 rounded-md bg-slate-100 px-3 py-2 text-center font-mono text-sm text-slate-800 dark:bg-slate-800 dark:text-slate-200">
        <span className="text-indigo-600 dark:text-indigo-300">{fixed(betaOne)}</span> × t +{" "}
        <span className="text-amber-600 dark:text-amber-300">{fixed(betaTwo)}</span> × 2t = {TOTAL_ON_T} × t
      </p>
      <div className="mt-3 overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left dark:border-slate-800">
              <th className="py-1.5 pr-4 font-semibold text-slate-600 dark:text-slate-400">t</th>
              <th className="py-1.5 pr-4 font-semibold text-slate-600 dark:text-slate-400">2t</th>
              <th className="py-1.5 pr-4 font-semibold text-indigo-600 dark:text-indigo-300">first share</th>
              <th className="py-1.5 pr-4 font-semibold text-amber-600 dark:text-amber-300">second share</th>
              <th className="py-1.5 font-semibold text-slate-600 dark:text-slate-400">their sum</th>
            </tr>
          </thead>
          <tbody className="font-mono text-slate-800 dark:text-slate-200">
            {TIMES.map((time) => (
              <tr key={time} className="border-b border-slate-100 last:border-0 dark:border-slate-800/60">
                <td className="py-1.5 pr-4">{time}</td>
                <td className="py-1.5 pr-4">{2 * time}</td>
                <td className="py-1.5 pr-4 text-indigo-600 dark:text-indigo-300">{fixed(betaOne * time)}</td>
                <td className="py-1.5 pr-4 text-amber-600 dark:text-amber-300">{fixed(betaTwo * 2 * time)}</td>
                <td className="py-1.5">{fixed(TOTAL_ON_T * time)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
        Move the slider anywhere. The last column never changes, so no residual
        changes either, and the fit has no reason to prefer one position over
        another.
      </p>
    </div>
  );
}
