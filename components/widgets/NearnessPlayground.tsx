"use client";

// One word's neighbours ranked six times over, once under each rule.
//
// Six columns for the chosen word, each holding the words that rule puts
// nearest and the number it gave them. A row is marked where that rule has put
// a word in a place no other rule put it, so the disagreement is visible
// without reading every column. The API computes every ranking; the browser
// sorts nothing and compares only which names came back.

import { useEffect, useState } from "react";
import { ApiError } from "@/lib/api";
import {
  NeighboursView,
  RankedList,
  fetchNeighbours,
} from "@/lib/concepts/distance-and-similarity";
import { WORD_CHOICES, topicClasses } from "./distanceAndSimilarityShared";

export function NearnessPlayground({
  word = "sail",
  nResults = 5,
}: {
  word?: string;
  nResults?: number;
}) {
  const [chosen, setChosen] = useState<string>(word);
  const [view, setView] = useState<NeighboursView | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setView(await fetchNeighbours(chosen, nResults));
        setMessage(null);
      } catch (error) {
        setMessage(
          error instanceof ApiError ? error.message : "Something went wrong.",
        );
      }
    })();
  }, [chosen, nResults]);

  if (!view) {
    return (
      <p className="text-sm text-slate-500 dark:text-slate-400">
        {message ?? "…"}
      </p>
    );
  }

  const firstPlaces = Object.values(view.first_places);
  const tally = new Map<string, number>();
  firstPlaces.forEach((name) =>
    tally.set(name, (tally.get(name) ?? 0) + 1),
  );

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm text-slate-600 dark:text-slate-300">
          standing at
        </span>
        {WORD_CHOICES.map((option) => (
          <button
            key={option}
            onClick={() => setChosen(option)}
            className={
              "rounded px-2 py-0.5 font-mono text-xs transition " +
              (option === chosen
                ? "bg-indigo-600 text-white"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700")
            }
          >
            {option}
          </button>
        ))}
        <span className="ml-auto font-mono text-xs text-slate-500 dark:text-slate-400">
          its own length {view.length.toFixed(4)}
        </span>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {view.rankings.map((ranking) => (
          <Column
            key={ranking.metric}
            ranking={ranking}
            majority={tally.get(ranking.rows[0]?.word ?? "") ?? 0}
          />
        ))}
      </div>

      <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
        The most popular first place is held by{" "}
        {view.n_rules_agreeing_on_first} of the six rules, and every rule read
        the same {view.comparisons} other positions to get there, which came to{" "}
        {view.multiplications.toLocaleString()} multiplications.
      </p>
    </div>
  );
}

function Column({
  ranking,
  majority,
}: {
  ranking: RankedList;
  majority: number;
}) {
  return (
    <div className="rounded-lg border border-slate-200 p-3 dark:border-slate-800">
      <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
        {ranking.plain_name}
      </p>
      <p className="mt-0.5 text-[0.65rem] text-slate-400 dark:text-slate-500">
        {ranking.bounded
          ? `never above ${ranking.ceiling?.toFixed(0)}`
          : "no ceiling"}
      </p>
      <table className="mt-2 w-full text-xs">
        <tbody>
          {ranking.rows.map((row, place) => (
            <tr
              key={row.word}
              className={
                place === 0 && majority <= 2
                  ? "bg-amber-50 dark:bg-amber-950/30"
                  : undefined
              }
            >
              <td className={"py-0.5 pr-2 font-mono " + topicClasses(row.word)}>
                {row.word}
              </td>
              <td className="py-0.5 text-right font-mono text-slate-500 dark:text-slate-400">
                {row.reading.toFixed(4)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
