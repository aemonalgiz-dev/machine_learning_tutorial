"use client";

// The rule working, one chosen piece at a time, on four words.
//
// The API walks the four-word corpus from bare symbols to a finished
// vocabulary and reports, at every turn, which positions of every word are
// already claimed and what the leading candidates were worth before the next
// one was taken. The browser draws each word as a row of positions, fills the
// claimed ones, and lists the rivals beside them so a reader can see the
// arithmetic that settled the turn.

import { useEffect, useState } from "react";
import {
  ChoosingView,
  fetchChoosing,
  messageFor,
} from "@/lib/concepts/greedy-coverage";
import { END_OF_WORD, Stat } from "./greedyCoverageParts";

function label(symbol: string) {
  return symbol.endsWith(END_OF_WORD)
    ? symbol.slice(0, -END_OF_WORD.length)
    : symbol;
}

export function CoverClaims() {
  const [view, setView] = useState<ChoosingView | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [step, setStep] = useState(0);

  useEffect(() => {
    (async () => {
      try {
        setView(await fetchChoosing());
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

  const current = view.steps[Math.min(step, view.steps.length - 1)];
  const share = Math.round(
    (current.covered_positions / view.total_positions) * 100,
  );

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-xs text-slate-500 dark:text-slate-400">
          pieces chosen so far
        </span>
        <input
          type="range"
          min={0}
          max={view.steps.length - 1}
          step={1}
          value={step}
          onChange={(event) => setStep(Number(event.target.value))}
          className="w-48 accent-indigo-500"
        />
        <span className="font-mono text-sm text-slate-800 dark:text-slate-200">
          {current.step}
        </span>
      </div>

      <div className="mt-4 space-y-2">
        {view.word_counts.map((entry, wordIndex) => (
          <div key={entry.word} className="flex flex-wrap items-center gap-2">
            <span className="w-24 shrink-0 font-mono text-xs text-slate-500 dark:text-slate-400">
              {entry.word} &times;{entry.count}
            </span>
            <div className="flex gap-1">
              {entry.symbols.map((symbol, position) => {
                const claimed = current.covered[wordIndex][position];
                return (
                  <span
                    key={`${entry.word}-${position}`}
                    className={`inline-flex h-7 min-w-7 items-center justify-center rounded border px-1 font-mono text-xs ${
                      claimed
                        ? "border-indigo-400 bg-indigo-500/90 text-white dark:border-indigo-400/70"
                        : "border-slate-300 bg-white text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
                    }`}
                  >
                    {label(symbol)}
                    {symbol.endsWith(END_OF_WORD) && (
                      <span className="ml-0.5 opacity-60">&#9141;</span>
                    )}
                  </span>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Stat
          label="pieces chosen"
          value={current.step}
        />
        <Stat
          label="positions covered"
          value={`${current.covered_positions} of ${view.total_positions}`}
        />
        <Stat label="that is" value={`${share}%`} />
        <Stat label="corpus, in pieces" value={current.corpus_pieces} />
      </div>

      {current.piece && (
        <div className="mt-4 overflow-x-auto">
          <p className="mb-2 text-xs text-slate-500 dark:text-slate-400">
            What the leading candidates were worth before turn {current.step + 1},
            each counted as its length in positions times how often it occurs.
          </p>
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left dark:border-slate-800">
                <th className="py-1.5 pr-4 font-semibold text-slate-600 dark:text-slate-400">
                  candidate
                </th>
                <th className="py-1.5 pr-4 font-semibold text-slate-600 dark:text-slate-400">
                  positions
                </th>
                <th className="py-1.5 pr-4 font-semibold text-slate-600 dark:text-slate-400">
                  occurrences
                </th>
                <th className="py-1.5 font-semibold text-slate-600 dark:text-slate-400">
                  covers
                </th>
              </tr>
            </thead>
            <tbody>
              {current.rivals.map((rival) => (
                <tr
                  key={rival.piece}
                  className={`border-b border-slate-100 last:border-0 dark:border-slate-800/60 ${
                    rival.piece === current.piece
                      ? "bg-indigo-50/70 dark:bg-indigo-950/30"
                      : ""
                  }`}
                >
                  <td className="py-1.5 pr-4 font-mono text-slate-800 dark:text-slate-200">
                    {label(rival.piece)}
                    {rival.piece.endsWith(END_OF_WORD) && (
                      <span className="ml-0.5 text-slate-400">&#9141;</span>
                    )}
                  </td>
                  <td className="py-1.5 pr-4 font-mono text-slate-600 dark:text-slate-400">
                    {rival.n_symbols}
                  </td>
                  <td className="py-1.5 pr-4 font-mono text-slate-600 dark:text-slate-400">
                    {rival.occurrences}
                  </td>
                  <td className="py-1.5 font-mono text-slate-800 dark:text-slate-200">
                    {rival.coverage}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
        Filled positions are the ones some chosen piece has claimed. At the last
        turn every position of all {view.total_occurrences} word occurrences is
        filled, no candidate can cover anything, and the fit stops at{" "}
        {view.stops_at} tokens however many were asked for.
      </p>
    </div>
  );
}
