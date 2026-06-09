"use client";

// Where a run of byte numbers stops standing for text, stopped at every position
// in turn.
//
// The API reads two sentences as bytes and then decodes the first one number,
// the first two, the first three and so on, marking each stopping point
// according to whether what came back was text or carried the replacement
// character. The browser draws one cell per stopping point and shows what the
// chosen one gave back.

import { useEffect, useState } from "react";
import { ApiError } from "@/lib/api";
import { ByteRunsView, fetchByteRuns } from "@/lib/concepts/bytes-and-characters";

export function PartialByteRun() {
  const [view, setView] = useState<ByteRunsView | null>(null);
  const [chosen, setChosen] = useState<{ language: string; n: number } | null>(
    null,
  );
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setView(await fetchByteRuns());
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
    <div className="space-y-4">
      {view.runs.map((run) => (
        <div
          key={run.language}
          className="rounded-lg border border-slate-200 px-4 py-3 dark:border-slate-800"
        >
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
              {run.language}, {run.n_ids} numbers
            </p>
            <p className="font-mono text-xs text-slate-600 dark:text-slate-400">
              {run.n_broken} of {run.n_ids} stopping points are not text
            </p>
          </div>
          <p className="mt-1 font-mono text-xs text-slate-600 dark:text-slate-400">
            {run.text}
          </p>
          <div className="mt-2 flex flex-wrap gap-0.5">
            {run.prefixes.map((prefix) => (
              <button
                key={prefix.n_ids}
                type="button"
                onMouseEnter={() =>
                  setChosen({ language: run.language, n: prefix.n_ids })
                }
                onFocus={() =>
                  setChosen({ language: run.language, n: prefix.n_ids })
                }
                onClick={() =>
                  setChosen({ language: run.language, n: prefix.n_ids })
                }
                title={`the first ${prefix.n_ids} numbers`}
                className={`h-5 w-4 rounded-[3px] ${
                  prefix.is_text
                    ? "bg-emerald-400/70 hover:bg-emerald-500 dark:bg-emerald-600/70"
                    : "bg-amber-400/80 hover:bg-amber-500 dark:bg-amber-600/80"
                }`}
              />
            ))}
          </div>
          {chosen !== null && chosen.language === run.language && (
            <p className="mt-2 rounded-md bg-slate-100 px-3 py-2 font-mono text-xs text-slate-900 dark:bg-slate-800 dark:text-slate-100">
              the first {chosen.n} gave back{" "}
              {run.prefixes[chosen.n - 1].decoded.replace(/ /g, "␣") || " "}
            </p>
          )}
        </div>
      ))}
      <p className="text-xs text-slate-500 dark:text-slate-400">
        One cell per stopping point, green where the numbers so far are text and
        amber where they end part way through a character. Hover a cell to see
        what it gave back. Taken on its own, {view.single_ids_that_are_not} of
        the {view.table_size} numbers give back the same mark, since they only
        ever continue the number before them.
      </p>
    </div>
  );
}
