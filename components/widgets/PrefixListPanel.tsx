"use client";

// The named list, and how much of it eighteen sentences of the right kind reach.
//
// The API reads the list, counts how many of the eighteen sentences' runs of
// characters end in exactly one full stop, works out which entries answered
// that question and which were never consulted, and separates the words that
// kept their stop from the words that lost it. The browser draws the entries as
// chips, dark where the corpus reached them and pale where it did not, then the
// two lists of words underneath.

import { useEffect, useState } from "react";
import { ApiError } from "@/lib/api";
import { ListView, fetchList } from "@/lib/concepts/moses-rules";

const REAL_ABBREVIATIONS = ["Gov", "Sen", "Fig", "Rev", "approx"];

export function PrefixListPanel() {
  const [view, setView] = useState<ListView | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setView(await fetchList());
      } catch (error) {
        setMessage(
          error instanceof ApiError ? error.message : "Something went wrong.",
        );
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

  const coverage = view.coverage;
  const reached = new Set(coverage.reached);
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

  return (
    <div>
      <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-4">
        <Stat label="entries in all" value={`${coverage.n_entries}`} />
        <Stat
          label="runs ending in one stop"
          value={`${coverage.n_words_ending_in_one_stop}`}
        />
        <Stat label="entries reached" value={`${coverage.n_reached}`} />
        <Stat
          label="entries never consulted"
          value={`${coverage.n_never_reached}`}
        />
      </div>

      <div className="mt-4">
        <div className="text-[11px] text-slate-500 dark:text-slate-400">
          the {coverage.n_named_entries} titles, months and company suffixes
        </div>
        <div className="mt-1 flex flex-wrap gap-1">
          {view.named_entries.map((entry) => (
            <Chip key={entry} text={`${entry}.`} lit={reached.has(entry)} />
          ))}
        </div>
      </div>

      <div className="mt-3">
        <div className="text-[11px] text-slate-500 dark:text-slate-400">
          the {coverage.n_single_letter_entries} single capitals, which are
          there for an initial in a name
        </div>
        <div className="mt-1 flex flex-wrap gap-1">
          {letters.map((entry) => (
            <Chip key={entry} text={`${entry}.`} lit={reached.has(entry)} />
          ))}
        </div>
      </div>

      <div className="mt-3">
        <div className="text-[11px] text-slate-500 dark:text-slate-400">
          the {coverage.n_figure_only_entries} entries that keep their stop only
          when a figure follows
        </div>
        <div className="mt-1 flex flex-wrap gap-1">
          {view.figure_only_entries.map((entry) => (
            <Chip key={entry} text={`${entry}.`} lit={reached.has(entry)} />
          ))}
        </div>
      </div>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left dark:border-slate-800">
              <th className="py-2 pr-6 font-semibold text-slate-600 dark:text-slate-400">
                what kept the stop, of the {coverage.n_kept_in_all} that were
                kept
              </th>
              <th className="py-2 pr-6 font-semibold text-slate-600 dark:text-slate-400">
                stops
              </th>
              <th className="py-2 font-semibold text-slate-600 dark:text-slate-400">
                which ones
              </th>
            </tr>
          </thead>
          <tbody>
            {coverage.by_clause.map((entry) => (
              <tr
                key={entry.clause}
                className="border-b border-slate-100 last:border-0 dark:border-slate-800/60"
              >
                <td className="py-2 pr-6 text-slate-700 dark:text-slate-300">
                  {entry.clause}
                </td>
                <td className="py-2 pr-6 font-mono text-slate-900 dark:text-slate-100">
                  {entry.n_kept}
                </td>
                <td className="py-2 font-mono text-xs text-slate-600 dark:text-slate-400">
                  {entry.examples.join(" ") || "none here"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        <div className="rounded-lg border border-emerald-300 bg-emerald-50/50 px-3 py-2 dark:border-emerald-700 dark:bg-emerald-950/20">
          <div className="text-[11px] text-slate-500 dark:text-slate-400">
            kept their stop over the eighteen sentences
          </div>
          <div className="mt-1 flex flex-wrap gap-1">
            {coverage.kept_whole.map((word) => (
              <span
                key={word}
                className="rounded bg-white px-1.5 py-0.5 font-mono text-xs text-slate-800 dark:bg-slate-900 dark:text-slate-200"
              >
                {word}
              </span>
            ))}
          </div>
        </div>
        <div className="rounded-lg border border-rose-300 bg-rose-50/50 px-3 py-2 dark:border-rose-700 dark:bg-rose-950/20">
          <div className="text-[11px] text-slate-500 dark:text-slate-400">
            lost their stop, and the ones in bold are abbreviations
          </div>
          <div className="mt-1 flex flex-wrap gap-1">
            {coverage.lost_the_stop.map((word) => (
              <span
                key={word}
                className={`rounded bg-white px-1.5 py-0.5 font-mono text-xs dark:bg-slate-900 ${
                  REAL_ABBREVIATIONS.includes(word)
                    ? "font-bold text-rose-800 dark:text-rose-300"
                    : "text-slate-800 dark:text-slate-200"
                }`}
              >
                {word}
              </span>
            ))}
          </div>
        </div>
      </div>

      <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
        A dark chip is an entry these eighteen sentences actually consulted and a
        pale one is an entry that was never asked. The question was asked{" "}
        {coverage.n_words_ending_in_one_stop} times and{" "}
        {coverage.n_reached} entries answered it, which leaves{" "}
        {coverage.n_never_reached} carrying nothing here. In{" "}
        {coverage.n_texts_ending_in_an_abbreviation} of the{" "}
        {coverage.n_texts} sentences the last piece is a word that kept its stop,
        which is a sentence ending in an abbreviation and has no right answer at
        all.
      </p>
    </div>
  );
}

function Chip({ text, lit }: { text: string; lit: boolean }) {
  return (
    <span
      className={`rounded px-1.5 py-0.5 font-mono text-xs ${
        lit
          ? "bg-indigo-600 text-white dark:bg-indigo-500"
          : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-500"
      }`}
    >
      {text}
    </span>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-slate-100 px-2 py-1.5 dark:bg-slate-800">
      <div className="text-[11px] text-slate-500 dark:text-slate-400">
        {label}
      </div>
      <div className="font-mono text-sm font-semibold text-slate-900 dark:text-slate-100">
        {value}
      </div>
    </div>
  );
}
