"use client";

// What the corrections do over the passes, and what their order decides.
//
// The API fits the same eight marked-up sentences once per order, reports how
// many gaps each pass corrected, and asks each fit for the same sentence. The
// browser draws the corrections as a column per pass and lists what each order
// answered. What to look at is that every order runs out of corrections and
// several of them still answer differently, which is a fact about a rule that
// only ever repairs the gaps it is currently wrong about.

import { useEffect, useState } from "react";
import {
  TrainingView,
  fetchTraining,
  messageFor,
} from "@/lib/concepts/learning-boundaries-from-examples";
import { Loading, Sentences, Stat, WordsRow } from "./pointwiseParts";

export function PerceptronWalk({
  showSentences = false,
}: {
  showSentences?: boolean;
}) {
  const [view, setView] = useState<TrainingView | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setView(await fetchTraining());
      } catch (error) {
        setMessage(messageFor(error));
      }
    })();
  }, []);

  if (!view) {
    return <Loading message={message} />;
  }

  const known = new Set(view.sentences.flat());
  const tallest = Math.max(...view.epoch_rows.map((row) => row.n_updates), 1);
  const readings = new Set(view.seed_rows.map((row) => row.words.join(" ")));

  return (
    <div className="rounded-lg border border-slate-200 p-3 dark:border-slate-800">
      <p className="mb-2 text-xs font-medium text-slate-500 dark:text-slate-400">
        {view.n_marked_gaps} marked gaps, {view.n_boundaries} of them carrying a
        boundary, from {view.corpus_label}
      </p>
      {showSentences && <Sentences sentences={view.sentences} />}

      <p className="mt-3 mb-1 text-xs text-slate-500 dark:text-slate-400">
        Gaps corrected on each pass
      </p>
      <div className="flex items-end gap-1">
        {view.epoch_rows.map((row) => (
          <div key={row.epoch} className="flex flex-col items-center">
            <span
              className="w-4 rounded-t bg-sky-500 dark:bg-sky-400"
              style={{ height: `${(row.n_updates / tallest) * 56 + 1}px` }}
              title={`pass ${row.epoch}: ${row.n_updates} gaps corrected`}
            />
            <span className="mt-1 text-[9px] text-slate-400 dark:text-slate-500">
              {row.epoch}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Stat label="marked gaps" value={`${view.n_marked_gaps}`} />
        <Stat label="weights learned" value={`${view.n_features}`} />
        <Stat label="passes offered" value={`${view.epochs}`} />
        <Stat
          label="different readings across the orders"
          value={`${readings.size} of ${view.seed_rows.length}`}
        />
      </div>

      <p className="mt-4 mb-1 text-xs text-slate-500 dark:text-slate-400">
        The same sentences in {view.seed_rows.length} different orders, each
        asked for{" "}
        <span className="font-mono text-slate-800 dark:text-slate-200">
          {view.text}
        </span>
      </p>
      <ul className="space-y-2">
        {view.seed_rows.map((row) => (
          <li
            key={row.random_seed}
            className="flex flex-wrap items-start gap-3 border-b border-slate-100 pb-2 last:border-0 dark:border-slate-800/60"
          >
            <span className="w-36 shrink-0 pt-0.5 text-xs text-slate-500 dark:text-slate-400">
              order {row.random_seed + 1}, settled after{" "}
              {row.n_passes_before_settling} passes
            </span>
            <span className="min-w-0 grow">
              <WordsRow words={row.words} known={known} />
            </span>
            <span className="shrink-0 text-right text-[11px] text-slate-500 dark:text-slate-400">
              {row.words.length} pieces
            </span>
          </li>
        ))}
      </ul>

      <p className="mt-2 text-xs text-slate-600 dark:text-slate-400">
        A reader answers {view.reader_reading.length} pieces, and{" "}
        {view.n_seeds_matching_reader} of the {view.seed_rows.length} orders
        reproduce that reading exactly.
      </p>
    </div>
  );
}
