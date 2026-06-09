"use client";

// Sentences drawn from the model rather than read off it, at six widths.
//
// The three sentences under each width come from three fixed draws, so they do
// not change between visits and can be compared width by width. The bar is the
// other half of the demonstration: out of fifty draws, how many came back as a
// training sentence word for word. It is zero at one word and fifty at six,
// which is the point of the widget. The API draws every sentence and counts
// the copies; the browser lays them out.

import { useEffect, useState } from "react";
import {
  GenerationView,
  fetchGeneration,
  messageFor,
} from "@/lib/concepts/n-grams";
import { ACTIVE_CLASS, BUTTON_CLASS, Stat } from "./nGramParts";

export function NGramGenerator() {
  const [view, setView] = useState<GenerationView | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [order, setOrder] = useState(3);

  useEffect(() => {
    (async () => {
      try {
        setView(await fetchGeneration());
      } catch (error) {
        setMessage(messageFor(error));
      }
    })();
  }, []);

  if (!view) {
    return (
      <p className="text-sm text-slate-500 dark:text-slate-400">
        {message ?? "…"}
      </p>
    );
  }

  const chosen =
    view.by_order.find((entry) => entry.order === order) ?? view.by_order[0];

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center gap-2">
        {view.by_order.map((entry) => (
          <button
            key={entry.order}
            type="button"
            onClick={() => setOrder(entry.order)}
            className={order === entry.order ? ACTIVE_CLASS : BUTTON_CLASS}
          >
            {entry.order === 1 ? "1 word" : `${entry.order} words`}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {chosen.samples.map((sample, index) => (
          <p
            key={index}
            className="rounded-md border border-slate-200 bg-white px-3 py-2 font-mono text-xs text-slate-800 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
          >
            {sample}
          </p>
        ))}
      </div>

      <p className="mt-4 mb-1 text-xs text-slate-500 dark:text-slate-400">
        Out of fifty draws, how many came back as a training sentence word for
        word.
      </p>
      <div className="space-y-1">
        {view.by_order.map((entry) => (
          <div key={entry.order} className="flex items-center gap-2">
            <span className="w-16 shrink-0 text-right font-mono text-[11px] text-slate-500 dark:text-slate-400">
              {entry.order === 1 ? "1 word" : `${entry.order} words`}
            </span>
            <div className="h-3 flex-1 rounded bg-slate-100 dark:bg-slate-800">
              <div
                className={
                  entry.order === order
                    ? "h-3 rounded bg-indigo-600"
                    : "h-3 rounded bg-indigo-300 dark:bg-indigo-500/50"
                }
                style={{
                  width: `${(entry.n_exact_copies / entry.n_draws) * 100}%`,
                }}
              />
            </div>
            <span className="w-16 shrink-0 font-mono text-[11px] text-slate-600 dark:text-slate-300">
              {entry.n_exact_copies} of {entry.n_draws}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Stat label="window drawn from" value={`${chosen.order} words`} />
        <Stat
          label="draws that copied a sentence"
          value={`${chosen.n_exact_copies} of ${chosen.n_draws}`}
        />
        <Stat
          label="sentences it was fitted to"
          value={view.n_training_sentences}
        />
        <Stat
          label="share of draws that copied"
          value={chosen.share_exact_copies.toFixed(2)}
        />
      </div>
    </div>
  );
}
