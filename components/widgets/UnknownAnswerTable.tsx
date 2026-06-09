"use client";

// What four different tables do when they meet a piece they have never seen.
//
// The API puts one sentence carrying an unseen word to a table that keeps a
// stand-in and to the same table without one, puts the same sentence with a
// different unseen word to the first of those, and puts a sentence carrying two
// unseen letters to a character table and to the table of every byte value. The
// browser lays the five answers out and compares the two that came back the
// same.

import { useEffect, useState } from "react";
import { ApiError } from "@/lib/api";
import {
  UnknownAnswersView,
  fetchUnknownAnswers,
} from "@/lib/concepts/what-a-token-is";

const BADGE: Record<string, string> = {
  substituted:
    "bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300",
  refused: "bg-rose-100 text-rose-800 dark:bg-rose-950/50 dark:text-rose-300",
  "nothing was unknown":
    "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300",
};

export function UnknownAnswerTable() {
  const [view, setView] = useState<UnknownAnswersView | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setView(await fetchUnknownAnswers());
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

  const [first, second] = view.probes;
  const twinsAgree =
    first.ids !== null &&
    second.ids !== null &&
    JSON.stringify(first.ids) === JSON.stringify(second.ids);

  return (
    <div className="space-y-3">
      {view.probes.map((probe, position) => (
        <div
          key={`${position}-${probe.table}`}
          className="rounded-lg border border-slate-200 px-4 py-3 dark:border-slate-800"
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
              {probe.table}
            </span>
            <span
              className={`rounded-full px-2 py-0.5 text-xs font-semibold ${BADGE[probe.answer]}`}
            >
              {probe.answer}
            </span>
          </div>
          <p className="mt-1.5 font-mono text-xs text-slate-600 dark:text-slate-400">
            {probe.text}
          </p>
          {probe.ids ? (
            <>
              <p className="mt-1.5 font-mono text-xs text-slate-800 dark:text-slate-200">
                {probe.ids.length > 24
                  ? `${probe.ids.slice(0, 24).join(" ")} and ${probe.ids.length - 24} more`
                  : probe.ids.join(" ")}
              </p>
              <p className="mt-1.5 font-mono text-xs text-slate-800 dark:text-slate-200">
                read back as {probe.decoded}
              </p>
            </>
          ) : (
            <p className="mt-1.5 text-xs text-slate-800 dark:text-slate-200">
              {probe.reason}
            </p>
          )}
        </div>
      ))}
      <p className="text-xs text-slate-500 dark:text-slate-400">
        The first two sentences differ in one word and{" "}
        {twinsAgree ? "carry the same numbers" : "carry different numbers"}. The
        table with a stand-in holds {view.table_size} entries, the same table
        without one holds {view.closed_size}, and the table of every byte value
        holds {view.byte_size} and reserves nothing for a piece it has not met.
      </p>
    </div>
  );
}
