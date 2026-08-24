"use client";

// Nine short texts, each read by the boundary rules and by splitting on spaces.
//
// The API reads every text by both rules and reports the words each found, how
// many there were, and how many characters ended up inside a word. The browser
// stacks the two answers per text with the note saying what to look at, so the
// texts where the boundary rules win and the texts where they lose sit in one
// list rather than in two flattering ones.

import { useEffect, useState } from "react";
import { ApiError } from "@/lib/api";
import { ScriptsView, fetchScripts } from "@/lib/concepts/unicode-word-boundaries";

export function ScriptCoveragePanel() {
  const [view, setView] = useState<ScriptsView | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setView(await fetchScripts());
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
    <div className="space-y-3">
      {view.probes.map((probe) => (
        <div
          key={probe.label}
          className="rounded-lg border border-slate-200 px-3 py-2 dark:border-slate-800"
        >
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
              {probe.label}
            </span>
            <span className="font-mono text-sm text-slate-900 dark:text-slate-100">
              {probe.text}
            </span>
          </div>

          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            <Answer
              title={`cut at every boundary (${probe.n_boundary_pieces} words, ${probe.boundary_covered} of ${probe.n_characters} characters)`}
              pieces={probe.boundary_pieces}
              tone="boundary"
            />
            <Answer
              title={`cut at every run of spaces (${probe.n_space_pieces} words, ${probe.space_covered} of ${probe.n_characters} characters)`}
              pieces={probe.space_pieces}
              tone="space"
            />
          </div>

          <p className="mt-2 text-xs text-slate-600 dark:text-slate-400">
            {probe.look_at}
          </p>
        </div>
      ))}
    </div>
  );
}

function Answer({
  title,
  pieces,
  tone,
}: {
  title: string;
  pieces: string[];
  tone: "boundary" | "space";
}) {
  return (
    <div className="rounded-md border border-slate-200 px-2 py-1.5 dark:border-slate-800">
      <div className="text-[11px] text-slate-500 dark:text-slate-400">
        {title}
      </div>
      <div className="mt-1 flex flex-wrap gap-1">
        {pieces.length === 0 && (
          <span className="text-xs text-slate-500 dark:text-slate-400">
            nothing at all
          </span>
        )}
        {pieces.map((piece, position) => (
          <span
            key={`${position}-${piece}`}
            className={`rounded px-1.5 py-0.5 font-mono text-xs ${
              tone === "boundary"
                ? "bg-indigo-100 text-indigo-900 dark:bg-indigo-950/50 dark:text-indigo-200"
                : "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200"
            }`}
          >
            {piece}
          </span>
        ))}
      </div>
    </div>
  );
}
