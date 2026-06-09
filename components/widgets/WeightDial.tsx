"use client";

// The one setting that is not part of the principle, swept.
//
// The API fits the twelve inflected forms at five repeats under eleven
// settings of the multiplier on the text half of the cost, and reports what
// each fit found. The browser draws the sweep as a strip so a reader can find
// the setting where the answer changes from twelve whole words to three stems
// and three endings, and read the cost on either side of it.

import { useEffect, useState } from "react";
import { StallView, fetchStall, messageFor } from "@/lib/concepts/morfessor";
import { Stat, nats } from "./morfessorParts";

export function WeightDial() {
  const [stall, setStall] = useState<StallView | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [chosen, setChosen] = useState(8);

  useEffect(() => {
    (async () => {
      try {
        setStall(await fetchStall());
      } catch (error) {
        setMessage(messageFor(error));
      }
    })();
  }, []);

  if (!stall) {
    return (
      <p className="text-sm text-slate-500 dark:text-slate-400">
        {message ?? "…"}
      </p>
    );
  }

  const rows = stall.weights;
  const position = Math.min(chosen, rows.length - 1);
  const shown = rows[position];

  return (
    <div className="rounded-lg border border-slate-200 p-3 dark:border-slate-800">
      <label className="block text-xs text-slate-500 dark:text-slate-400">
        multiplier on the text half of the cost
        <input
          type="range"
          min={0}
          max={rows.length - 1}
          step={1}
          value={position}
          onChange={(event) => setChosen(Number(event.target.value))}
          className="mt-1 w-full accent-indigo-500"
        />
      </label>

      <div className="mt-2 flex flex-wrap gap-1">
        {rows.map((row, index) => (
          <button
            key={row.weight}
            type="button"
            onClick={() => setChosen(index)}
            className={`rounded border px-1.5 py-0.5 font-mono text-xs ${
              index === position
                ? "border-slate-500 bg-slate-100 text-slate-900 dark:border-slate-400 dark:bg-slate-800 dark:text-slate-100"
                : row.found_the_morphs
                  ? "border-emerald-300 bg-emerald-50 text-emerald-900 dark:border-emerald-500/60 dark:bg-emerald-950/40 dark:text-emerald-200"
                  : "border-slate-200 bg-slate-50 text-slate-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400"
            }`}
          >
            {row.weight}
          </button>
        ))}
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Stat label="setting" value={shown.weight} />
        <Stat label="pieces found" value={shown.n_morphs} />
        <Stat label="passes made" value={shown.epochs_run} />
        <Stat label="total, in nats" value={nats(shown.cost)} />
      </div>

      <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
        Green is a setting at which the search reaches the three stems and the
        three endings; grey is one at which every word is left whole. The
        answer changes between {stall.threshold_below.toFixed(5)} and{" "}
        {stall.threshold_above.toFixed(5)}, and the two sides of that line are
        not comparable by their totals, since the total being minimised is a
        different quantity at every setting.
      </p>
    </div>
  );
}
