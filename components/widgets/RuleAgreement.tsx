"use client";

// How often two rules name the same nearest word, over the whole vocabulary.
//
// A square of counts, one row and column per rule, shaded by how much of the
// vocabulary the pair agrees on, with the words the angle and the straight
// line place differently listed underneath. The API asks every rule for every
// word's nearest and counts the matches; the browser only colours cells.

import { useEffect, useState } from "react";
import { ApiError } from "@/lib/api";
import {
  AgreementView,
  fetchAgreement,
} from "@/lib/concepts/distance-and-similarity";
import { topicClasses } from "./distanceAndSimilarityShared";

export function RuleAgreement() {
  const [view, setView] = useState<AgreementView | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setView(await fetchAgreement());
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

  const shade = (count: number) => {
    const share = count / view.n_words;
    return `rgba(79, 70, 229, ${(0.08 + 0.72 * share).toFixed(3)})`;
  };

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="border-collapse text-xs">
          <thead>
            <tr>
              <th />
              {view.plain_names.map((name) => (
                <th
                  key={name}
                  className="px-1 pb-1 align-bottom font-semibold text-slate-500 dark:text-slate-400"
                >
                  <span className="block w-14 leading-tight">{name}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {view.grid.map((row, first) => (
              <tr key={view.metrics[first]}>
                <th className="pr-2 text-right font-semibold text-slate-500 dark:text-slate-400">
                  {view.plain_names[first]}
                </th>
                {row.map((count, second) => (
                  <td
                    key={view.metrics[second]}
                    style={{ backgroundColor: shade(count) }}
                    className="border border-white px-2 py-1.5 text-center font-mono text-slate-800 dark:border-slate-900 dark:text-slate-100"
                  >
                    {count}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
        Out of {view.n_words} words. Every rule but the one reading coordinates
        as labels names the same nearest word for{" "}
        {view.n_all_but_labels_agree} of them.
      </p>

      <div className="mt-3 rounded-lg border border-slate-200 p-3 dark:border-slate-800">
        <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
          the {view.angle_against_line.length} words where the angle and the
          straight line part
        </p>
        <table className="mt-2 w-full text-xs">
          <thead>
            <tr className="text-left text-slate-500 dark:text-slate-400">
              <th className="py-1 pr-3 font-semibold">standing at</th>
              <th className="py-1 pr-3 font-semibold">nearest by line</th>
              <th className="py-1 font-semibold">nearest by angle</th>
            </tr>
          </thead>
          <tbody>
            {view.angle_against_line.map((row) => (
              <tr
                key={row.word}
                className="border-t border-slate-100 dark:border-slate-800/60"
              >
                <td
                  className={"py-1 pr-3 font-mono " + topicClasses(row.word)}
                >
                  {row.word}
                </td>
                <td className="py-1 pr-3 font-mono text-slate-600 dark:text-slate-400">
                  {row.first_choice}
                </td>
                <td className="py-1 font-mono text-slate-600 dark:text-slate-400">
                  {row.second_choice}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
