"use client";

// Choosing one of three, against switching on any of three.
//
// The left panel is a multiclass question. One selection, exactly one class
// active, and a probability bar that divides a single unit among the three,
// so dragging one share up forces the others down. The right panel is a
// multilabel question. Three independent switches, any combination active,
// three probabilities that each answer their own yes-or-no and owe the
// others nothing, and a threshold per label deciding which are on. Nothing
// is fitted here. The two panels are the two shapes a target can take.

import { useState } from "react";

const CLASSES = [
  { name: "child", colour: "#f59e0b" },
  { name: "teenager", colour: "#10b981" },
  { name: "adult", colour: "#6366f1" },
];

const LABELS = [
  { name: "enjoys sports", colour: "#f59e0b" },
  { name: "enjoys music", colour: "#10b981" },
  { name: "enjoys reading", colour: "#6366f1" },
];

export function MulticlassVersusMultilabel() {
  const [chosen, setChosen] = useState(1);
  const [shares, setShares] = useState([0.1, 0.75, 0.15]);
  const [switches, setSwitches] = useState([true, false, true]);
  const [labelProbabilities, setLabelProbabilities] = useState([0.8, 0.7, 0.1]);
  const [thresholds, setThresholds] = useState([0.5, 0.5, 0.5]);

  // Raising one share takes the difference from the other two in proportion,
  // so the three always total one.
  const setShare = (index: number, value: number) => {
    const clamped = Math.min(0.98, Math.max(0.01, value));
    const othersTotal = shares.reduce((sum, share, position) => (position === index ? sum : sum + share), 0);
    const remaining = 1 - clamped;
    setShares(shares.map((share, position) => (position === index ? clamped : (share / othersTotal) * remaining)));
  };

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="rounded-lg border border-slate-200 p-3 dark:border-slate-800">
        <p className="mb-2 text-sm font-medium text-slate-700 dark:text-slate-200">Multiclass, exactly one is correct</p>
        <div className="flex flex-col gap-1.5">
          {CLASSES.map((each, index) => (
            <label key={each.name} className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200">
              <input type="radio" name="age-group" checked={chosen === index} onChange={() => setChosen(index)} style={{ accentColor: each.colour }} />
              {each.name}
            </label>
          ))}
        </div>
        <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">One unit of probability, divided among the three.</p>
        <div className="mt-1 flex h-7 w-full overflow-hidden rounded-md">
          {shares.map((share, index) => (
            <div key={index} style={{ width: `${share * 100}%`, backgroundColor: CLASSES[index].colour }} className="flex items-center justify-center text-[10px] font-semibold text-white">
              {share >= 0.12 ? share.toFixed(2) : ""}
            </div>
          ))}
        </div>
        <div className="mt-2 space-y-1">
          {shares.map((share, index) => (
            <label key={index} className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
              <span className="w-16">{CLASSES[index].name}</span>
              <input type="range" min={0.01} max={0.98} step={0.01} value={share} onChange={(event) => setShare(index, Number(event.target.value))} className="flex-1" style={{ accentColor: CLASSES[index].colour }} />
              <span className="w-10 text-right font-mono">{share.toFixed(2)}</span>
            </label>
          ))}
        </div>
        <p className="mt-2 font-mono text-xs text-slate-600 dark:text-slate-300">total {shares.reduce((sum, share) => sum + share, 0).toFixed(2)}, always</p>
      </div>

      <div className="rounded-lg border border-slate-200 p-3 dark:border-slate-800">
        <p className="mb-2 text-sm font-medium text-slate-700 dark:text-slate-200">Multilabel, any number can be correct</p>
        <div className="flex flex-col gap-1.5">
          {LABELS.map((each, index) => (
            <label key={each.name} className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200">
              <input type="checkbox" checked={switches[index]} onChange={(event) => setSwitches(switches.map((on, position) => (position === index ? event.target.checked : on)))} style={{ accentColor: each.colour }} />
              {each.name}
            </label>
          ))}
        </div>
        <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">Three separate probabilities, each with its own threshold.</p>
        <div className="mt-1 space-y-2">
          {LABELS.map((each, index) => {
            const on = labelProbabilities[index] >= thresholds[index];
            return (
              <div key={each.name}>
                <div className="relative h-5 w-full overflow-hidden rounded-md bg-slate-200 dark:bg-slate-800">
                  <div style={{ width: `${labelProbabilities[index] * 100}%`, backgroundColor: each.colour }} className="h-full" />
                  <div style={{ left: `${thresholds[index] * 100}%` }} className="absolute top-0 h-full w-0.5 bg-slate-900 dark:bg-slate-100" />
                </div>
                <div className="mt-0.5 flex items-center gap-2 text-[11px] text-slate-600 dark:text-slate-300">
                  <span className="w-24">{each.name}</span>
                  <input type="range" min={0.01} max={0.99} step={0.01} value={labelProbabilities[index]} onChange={(event) => setLabelProbabilities(labelProbabilities.map((value, position) => (position === index ? Number(event.target.value) : value)))} className="flex-1" style={{ accentColor: each.colour }} />
                  <span className="w-8 font-mono">{labelProbabilities[index].toFixed(2)}</span>
                  <span className="text-slate-400">t</span>
                  <input type="range" min={0.05} max={0.95} step={0.05} value={thresholds[index]} onChange={(event) => setThresholds(thresholds.map((value, position) => (position === index ? Number(event.target.value) : value)))} className="w-16 accent-slate-600" />
                  <span className={`w-8 font-semibold ${on ? "text-emerald-600 dark:text-emerald-300" : "text-slate-400"}`}>{on ? "on" : "off"}</span>
                </div>
              </div>
            );
          })}
        </div>
        <p className="mt-2 font-mono text-xs text-slate-600 dark:text-slate-300">
          total {labelProbabilities.reduce((sum, value) => sum + value, 0).toFixed(2)}, which means nothing
        </p>
      </div>
    </div>
  );
}
