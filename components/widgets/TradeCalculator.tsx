"use client";

// Two committees under the correlation formula, and which one comes out lower.
//
// A bagged committee and a forest are each given a member variance σ² and a
// pairwise correlation ρ, and the formula ρσ² + (1 − ρ)σ²/B is evaluated for
// both at the chosen B. The forest usually raises σ² and lowers ρ at once,
// and the calculator shows which of those wins, and that at a finite B the
// second term still matters. This is the page's explanatory model
// evaluated, not a fit.

import { useState } from "react";

function variance(sigma: number, rho: number, members: number) {
  return rho * sigma + ((1 - rho) * sigma) / members;
}

export function TradeCalculator() {
  const [members, setMembers] = useState(25);
  const [bagging, setBagging] = useState({ sigma: 1.0, rho: 0.5 });
  const [forest, setForest] = useState({ sigma: 1.2, rho: 0.25 });
  const baggingVariance = variance(bagging.sigma, bagging.rho, members);
  const forestVariance = variance(forest.sigma, forest.rho, members);

  return (
    <div>
      <label className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
        <span className="w-24">members B</span>
        <input type="range" min={1} max={200} step={1} value={members} onChange={(event) => setMembers(Number(event.target.value))} className="flex-1 accent-slate-600" />
        <span className="w-10 text-right font-mono">{members}</span>
      </label>
      <div className="mt-3 grid gap-4 sm:grid-cols-2">
        {[
          { name: "bagging", values: bagging, set: setBagging, accent: "#6366f1", total: baggingVariance },
          { name: "random forest", values: forest, set: setForest, accent: "#10b981", total: forestVariance },
        ].map((side) => (
          <div key={side.name} className="rounded-lg border border-slate-200 p-3 dark:border-slate-800">
            <p className="mb-2 text-sm font-medium" style={{ color: side.accent }}>{side.name}</p>
            <label className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
              <span className="w-24">member σ²</span>
              <input type="range" min={0.2} max={2.5} step={0.05} value={side.values.sigma} onChange={(event) => side.set({ ...side.values, sigma: Number(event.target.value) })} className="flex-1" style={{ accentColor: side.accent }} />
              <span className="w-10 text-right font-mono">{side.values.sigma.toFixed(2)}</span>
            </label>
            <label className="mt-1 flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
              <span className="w-24">correlation ρ</span>
              <input type="range" min={0} max={0.95} step={0.01} value={side.values.rho} onChange={(event) => side.set({ ...side.values, rho: Number(event.target.value) })} className="flex-1" style={{ accentColor: side.accent }} />
              <span className="w-10 text-right font-mono">{side.values.rho.toFixed(2)}</span>
            </label>
            <div className="mt-2 rounded-md bg-slate-100 px-3 py-2 font-mono text-xs text-slate-800 dark:bg-slate-800 dark:text-slate-200">
              <p>shared ρσ² = {(side.values.rho * side.values.sigma).toFixed(3)}</p>
              <p>reducible (1 − ρ)σ²/B = {(((1 - side.values.rho) * side.values.sigma) / members).toFixed(3)}</p>
              <p className="font-semibold">committee variance = {side.total.toFixed(3)}</p>
            </div>
          </div>
        ))}
      </div>
      <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
        {Math.abs(baggingVariance - forestVariance) < 1e-9
          ? "The two come out level."
          : forestVariance < baggingVariance
            ? `The forest comes out lower, ${forestVariance.toFixed(3)} against ${baggingVariance.toFixed(3)}, so the fall in ρ paid for the rise in σ² at B = ${members}.`
            : `Bagging comes out lower, ${baggingVariance.toFixed(3)} against ${forestVariance.toFixed(3)}, so the rise in σ² cost more than the fall in ρ recovered at B = ${members}.`}
      </p>
    </div>
  );
}
