"use client";

// Six entries somebody might want in a table of exceptions, three of them refused.
//
// The API offers each proposed entry to a table of the shape this page
// describes and reports whether it was taken, with the reason written in the
// page's own words rather than passed through from anywhere. The browser draws
// one row per proposal, green where it was taken and amber where it was not.

import { useEffect, useState } from "react";
import { ApiError } from "@/lib/api";
import { ListView, fetchList } from "@/lib/concepts/moses-rules";

export function ExceptionEntryTable() {
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

  return (
    <div className="space-y-2">
      {view.proposals.map((entry) => (
        <div
          key={`${entry.word}-${entry.pieces.join("|")}`}
          className={`rounded-lg border px-3 py-2 ${
            entry.accepted
              ? "border-emerald-300 bg-emerald-50/50 dark:border-emerald-700 dark:bg-emerald-950/20"
              : "border-amber-300 bg-amber-50/60 dark:border-amber-700 dark:bg-amber-950/20"
          }`}
        >
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded bg-white px-1.5 py-0.5 font-mono text-xs text-slate-800 dark:bg-slate-900 dark:text-slate-200">
              {entry.word}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              cut into
            </span>
            {entry.pieces.map((piece, position) => (
              <span
                key={`${position}-${piece}`}
                className="rounded bg-white px-1.5 py-0.5 font-mono text-xs text-slate-800 dark:bg-slate-900 dark:text-slate-200"
              >
                {piece}
              </span>
            ))}
          </div>
          <div className="mt-1 text-xs text-slate-600 dark:text-slate-400">
            {entry.verdict}
          </div>
        </div>
      ))}
      <p className="text-xs text-slate-500 dark:text-slate-400">
        The three pairs are the argument. The same word listed as a place to cut
        is taken, and listed as something to write instead is not, which is the
        one constraint that keeps every piece a stretch of the writing it came
        from.
      </p>
    </div>
  );
}
