"use client";

// Seven short texts, and the piece in each that shows what the rule left alone.
//
// The API applies the rule to each text and names the one piece worth looking
// at. The browser draws every piece as a box and marks that one, so a reader can
// see in each row that the rule did nothing special and that doing nothing is
// what produced the piece.

import { useEffect, useState } from "react";
import { ApiError } from "@/lib/api";
import { SurveyView, fetchSurvey } from "@/lib/concepts/splitting-on-spaces";

export function MangledWritingPanel() {
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
    <div className="space-y-2">
      {view.breakages.map((probe) => (
        <div
          key={probe.label}
          className="rounded-lg border border-slate-200 px-4 py-3 dark:border-slate-800"
        >
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
              {probe.label}
            </p>
            <p className="font-mono text-xs text-slate-500 dark:text-slate-400">
              {probe.n_pieces} {probe.n_pieces === 1 ? "piece" : "pieces"}
            </p>
          </div>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {probe.pieces.map((piece, position) => (
              <span
                key={`${position}-${piece}`}
                className={`rounded-md border px-2 py-0.5 font-mono text-sm ${
                  piece === probe.look_at
                    ? "border-amber-400 bg-amber-50 text-slate-900 dark:border-amber-500/70 dark:bg-amber-950/30 dark:text-slate-100"
                    : "border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                }`}
              >
                {piece}
              </span>
            ))}
          </div>
        </div>
      ))}
      <p className="text-xs text-slate-500 dark:text-slate-400">
        The marked piece in each row is the one the difficulty lives in. Nothing
        in any row is a special case; every piece is a run of characters that are
        not white space.
      </p>
    </div>
  );
}
