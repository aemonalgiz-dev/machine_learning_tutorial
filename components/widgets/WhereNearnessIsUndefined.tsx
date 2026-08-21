"use client";

// The inputs on which nearness has no answer, or has one only by convention.
//
// Each row says what was asked, what the mathematics leaves undefined about
// it, and what actually came back. The second panel lists the words whose
// nearest word does not name them in return, which is a property of the
// nearest relation rather than of any rule. Every sentence and every number is
// composed by the API in the page's own words.

import { useEffect, useState } from "react";
import { ApiError } from "@/lib/api";
import {
  UndefinedView,
  fetchUndefined,
} from "@/lib/concepts/distance-and-similarity";
import { topicClasses } from "./distanceAndSimilarityShared";

export function WhereNearnessIsUndefined({
  panel = "cases",
}: {
  panel?: "cases" | "asymmetry";
}) {
  const [view, setView] = useState<UndefinedView | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setView(await fetchUndefined());
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

  if (panel === "asymmetry") {
    return (
      <div>
        <table className="w-full border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-200 text-left dark:border-slate-800">
              <th className="py-1 pr-3 font-semibold text-slate-600 dark:text-slate-400">
                standing at
              </th>
              <th className="py-1 pr-3 font-semibold text-slate-600 dark:text-slate-400">
                its nearest
              </th>
              <th className="py-1 font-semibold text-slate-600 dark:text-slate-400">
                and that word&rsquo;s nearest
              </th>
            </tr>
          </thead>
          <tbody>
            {view.asymmetric.map((row) => (
              <tr
                key={row.word}
                className="border-b border-slate-100 last:border-0 dark:border-slate-800/60"
              >
                <td className={"py-1 pr-3 font-mono " + topicClasses(row.word)}>
                  {row.word}
                </td>
                <td className="py-1 pr-3 font-mono text-slate-700 dark:text-slate-300">
                  {row.nearest}
                </td>
                <td className="py-1 font-mono text-rose-600 dark:text-rose-400">
                  {row.returned}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
          {view.n_asymmetric} of {view.n_words} words, while the measure itself
          is symmetric to the last bit, with a gap of{" "}
          {view.symmetry_gap.toFixed(1)} between reading a pair one way round
          and the other.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {view.cases.map((row) => (
        <div
          key={row.situation}
          className="rounded-lg border border-slate-200 p-3 dark:border-slate-800"
        >
          <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            {row.situation}
          </p>
          <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
            {row.what_is_undefined}
          </p>
          <p className="mt-1 font-mono text-xs text-indigo-700 dark:text-indigo-300">
            {row.outcome}
          </p>
        </div>
      ))}
    </div>
  );
}
