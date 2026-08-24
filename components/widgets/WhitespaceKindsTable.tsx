"use client";

// Ten characters put between two letters, and whether a word ended at each.
//
// The API puts each character between the letters a and b, applies the rule, and
// reports how many pieces came out. Two pieces means the character ended a word
// and one means it did not. The browser draws the answers as a table, since
// several of these characters would arrive at a reader as an empty box and only
// their names and numbers can be shown.

import { useEffect, useState } from "react";
import { ApiError } from "@/lib/api";
import { SurveyView, fetchSurvey } from "@/lib/concepts/splitting-on-spaces";

export function WhitespaceKindsTable() {
  const [view, setView] = useState<SurveyView | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setView(await fetchSurvey());
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

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left dark:border-slate-800">
              <th className="py-2 pr-6 font-semibold text-slate-600 dark:text-slate-400">
                character
              </th>
              <th className="py-2 pr-6 font-semibold text-slate-600 dark:text-slate-400">
                its number
              </th>
              <th className="py-2 pr-6 font-semibold text-slate-600 dark:text-slate-400">
                pieces
              </th>
              <th className="py-2 font-semibold text-slate-600 dark:text-slate-400">
                ends a word
              </th>
            </tr>
          </thead>
          <tbody>
            {view.separators.map((probe) => (
              <tr
                key={probe.code_point}
                className="border-b border-slate-100 last:border-0 dark:border-slate-800/60"
              >
                <td className="py-2 pr-6 text-slate-800 dark:text-slate-200">
                  {probe.name}
                </td>
                <td className="py-2 pr-6 font-mono text-slate-600 dark:text-slate-400">
                  {probe.code_point}
                </td>
                <td className="py-2 pr-6 font-mono text-slate-600 dark:text-slate-400">
                  {probe.n_pieces}
                </td>
                <td
                  className={`py-2 font-medium ${
                    probe.ends_a_word
                      ? "text-emerald-700 dark:text-emerald-400"
                      : "text-amber-700 dark:text-amber-400"
                  }`}
                >
                  {probe.ends_a_word ? "yes" : "no"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
        Each row is the text a, then the character, then b.{" "}
        {view.n_separators_that_end_a_word} of the {view.separators.length} end a
        word, and the three that do not include one whose name is a space and one
        whose name is a break.
      </p>
    </div>
  );
}
