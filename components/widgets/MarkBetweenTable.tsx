"use client";

// Twelve marks, each put between two letters and then between two digits.
//
// The API builds the two three-character texts for each mark, reads both by the
// boundary rules, and reports the class the mark was given along with what came
// back on each side. The browser lays the two answers in adjacent columns so the
// rows where they disagree can be found by eye.

import { useEffect, useState } from "react";
import { ApiError } from "@/lib/api";
import { ClassesView, fetchClasses } from "@/lib/concepts/unicode-word-boundaries";

export function MarkBetweenTable() {
  const [view, setView] = useState<ClassesView | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setView(await fetchClasses());
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
              <th className="py-2 pr-4 font-semibold text-slate-600 dark:text-slate-400">
                the mark
              </th>
              <th className="py-2 pr-4 font-semibold text-slate-600 dark:text-slate-400">
                its class
              </th>
              <th className="py-2 pr-4 font-semibold text-slate-600 dark:text-slate-400">
                between two letters
              </th>
              <th className="py-2 font-semibold text-slate-600 dark:text-slate-400">
                between two digits
              </th>
            </tr>
          </thead>
          <tbody>
            {view.marks.map((mark) => (
              <tr
                key={mark.code_point}
                className="border-b border-slate-100 last:border-0 dark:border-slate-800/60"
              >
                <td className="py-2 pr-4 text-slate-700 dark:text-slate-300">
                  {mark.name}
                  <span className="ml-2 font-mono text-[11px] text-slate-500 dark:text-slate-400">
                    {mark.code_point}
                  </span>
                </td>
                <td className="py-2 pr-4 text-slate-600 dark:text-slate-400">
                  {mark.description}
                </td>
                <td className="py-2 pr-4">
                  <Answer pieces={mark.between_letters} joins={mark.joins_letters} />
                </td>
                <td className="py-2">
                  <Answer pieces={mark.between_digits} joins={mark.joins_digits} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
        A green answer is one word and an amber answer is two.{" "}
        {view.n_marks_joining_letters} of the {view.marks.length} hold two
        letters together and {view.n_marks_joining_digits} hold two digits
        together, and the {view.n_marks_disagreeing} rows where the two columns
        differ are the ones worth stopping on.
      </p>
    </div>
  );
}

function Answer({ pieces, joins }: { pieces: string[]; joins: boolean }) {
  return (
    <span className="flex flex-wrap gap-1">
      {pieces.map((piece, position) => (
        <span
          key={`${position}-${piece}`}
          className={`rounded px-1.5 py-0.5 font-mono text-xs ${
            joins
              ? "bg-emerald-100 text-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-200"
              : "bg-amber-100 text-amber-900 dark:bg-amber-950/50 dark:text-amber-200"
          }`}
        >
          {piece}
        </span>
      ))}
    </span>
  );
}
