"use client";

// The same tree grown on heights in centimetres and in metres.
//
// Dividing every height by a hundred moves the threshold from 151.5 to
// 1.515 and moves nobody from one side of it to the other, because a
// threshold question only reads the order of the values and dividing by a
// positive number keeps the order. The two fits are the API's, and the
// widget shows their questions, their leaf counts and their accuracies
// agreeing to the digit, with only the threshold's number changed.

import { useEffect, useState } from "react";
import { ApiError, TreeFit, fitTree } from "@/lib/api";
import { CLEAN_CROWD } from "./SplitInspector";

export function UnitConversion() {
  const [centimetres, setCentimetres] = useState<TreeFit | null>(null);
  const [metres, setMetres] = useState<TreeFit | null>(null);
  const [unit, setUnit] = useState<"cm" | "m">("cm");
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const [first, second] = await Promise.all([
          fitTree(CLEAN_CROWD, 6),
          fitTree(CLEAN_CROWD.map((person) => ({ ...person, x: person.x / 100 })), 6),
        ]);
        setCentimetres(first);
        setMetres(second);
      } catch (error) {
        if (error instanceof ApiError) setMessage(error.message);
        else setMessage("Something went wrong.");
      }
    })();
  }, []);

  const shown = unit === "cm" ? centimetres : metres;
  const sameSides = centimetres && metres
    ? JSON.stringify(centimetres.regions.labels) === JSON.stringify(metres.regions.labels)
    : null;

  return (
    <div>
      <div className="flex gap-1 pb-3">
        {(["cm", "m"] as const).map((choice) => (
          <button key={choice} onClick={() => setUnit(choice)} className={`rounded-md border px-3 py-1 text-sm font-medium transition ${unit === choice ? "border-indigo-500 bg-indigo-50 text-indigo-700 dark:border-indigo-400 dark:bg-indigo-950/40 dark:text-indigo-200" : "border-slate-300 bg-white text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"}`}>
            heights in {choice === "cm" ? "centimetres" : "metres"}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="root question" value={shown ? shown.tree.question ?? "no question" : "…"} />
        <Stat label="leaves" value={shown ? String(shown.n_leaves) : "…"} />
        <Stat label="training accuracy" value={shown ? shown.accuracy.toFixed(3) : "…"} />
        <Stat label="same people on each side" value={sameSides === null ? "…" : sameSides ? "yes" : "no"} />
      </div>
      <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
        The tallest child is 147 cm and the shortest adult 156 cm. Halfway is 151.5 cm, or 1.515 m, and every person is on the same side of it in either unit.
      </p>
      {message && (
        <p className="mt-3 text-sm text-amber-600 dark:text-amber-400">{message}</p>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-slate-100 px-3 py-2 dark:bg-slate-800">
      <div className="text-xs text-slate-500 dark:text-slate-400">{label}</div>
      <div className="font-mono text-sm font-semibold text-slate-900 dark:text-slate-100">{value}</div>
    </div>
  );
}
