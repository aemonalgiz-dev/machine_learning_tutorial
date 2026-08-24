"use client";

// What each piece is worth, measured as the corpus likelihood lost by dropping
// it.
//
// The API takes the estimated model on each corpus, removes one piece at a
// time, respells every word whose best spelling used it, and totals the fall.
// The browser draws the ranked answers as bars and says how many of them came
// out at exactly zero, which is the number the closing part of the page rests
// on. Switch corpora with the buttons.

import { useEffect, useState } from "react";
import {
  PruningView,
  fetchPruning,
  messageFor,
} from "@/lib/concepts/the-unigram-language-model";
import { Piece, Stat } from "./unigramModelParts";

export function PieceLosses() {
  const [view, setView] = useState<PruningView | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [chosen, setChosen] = useState(0);

  useEffect(() => {
    (async () => {
      try {
        setView(await fetchPruning());
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

  const losses = view.losses[chosen];
  const largest = losses.most_costly[0].loss;
  const share = Math.round(
    (losses.n_costing_nothing / losses.n_removable) * 100,
  );

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center gap-2">
        {view.losses.map((entry, index) => (
          <button
            key={entry.label}
            type="button"
            onClick={() => setChosen(index)}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition ${
              chosen === index
                ? "bg-indigo-600 text-white"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
            }`}
          >
            {entry.label}
          </button>
        ))}
      </div>

      <div className="mb-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Stat label="pieces in the model" value={losses.n_pieces} />
        <Stat label="of those, removable" value={losses.n_removable} />
        <Stat label="costing exactly nothing" value={losses.n_costing_nothing} />
        <Stat label="that is" value={`${share}% of them`} />
      </div>

      <div className="space-y-1.5 rounded-lg border border-slate-200 p-3 dark:border-slate-800">
        <p className="mb-2 text-xs font-medium text-slate-500 dark:text-slate-400">
          The ten most costly, in nats of corpus likelihood
        </p>
        {losses.most_costly.map((row) => (
          <div key={row.piece} className="flex items-center gap-2">
            <span className="w-32 shrink-0">
              <Piece text={row.piece} tone={row.loss > 0 ? "learned" : "muted"} />
            </span>
            <div className="h-3 flex-1 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-900">
              <div
                className="h-3 rounded-full bg-indigo-500"
                style={{ width: `${Math.max((row.loss / largest) * 100, 0.4)}%` }}
              />
            </div>
            <span className="w-16 shrink-0 text-right font-mono text-xs text-slate-500 dark:text-slate-400">
              {row.loss.toFixed(2)}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-3 rounded-lg border border-slate-200 p-3 dark:border-slate-800">
        <p className="mb-2 text-xs font-medium text-slate-500 dark:text-slate-400">
          The last five in the same ranking
        </p>
        <div className="flex flex-wrap gap-1">
          {losses.least_costly.map((row) => (
            <Piece key={row.piece} text={row.piece} tone="muted" />
          ))}
        </div>
      </div>

      <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
        A piece costs nothing when no word&rsquo;s likeliest spelling uses it,
        or when the spelling that replaces it is exactly as probable. On this
        corpus that is true of {losses.n_costing_nothing} of the{" "}
        {losses.n_removable} pieces the pruning is allowed to touch, so the
        ranking separates a handful of pieces from each other and leaves the
        rest tied at the bottom.
      </p>
    </div>
  );
}
