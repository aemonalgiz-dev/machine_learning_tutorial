"use client";

// A handful of words read by the grammar, with what each piece was called.
//
// The API reads every word and sends the pieces, the label the grammar put on
// each and what that label says in ordinary words; the browser only lays them
// out. The point of showing several at once is the column of labels, which is
// the thing a method that learns its pieces from counts never produces.

import { useEffect, useState } from "react";
import {
  ScenariosView,
  WordView,
  fetchScenarios,
  messageFor,
} from "@/lib/concepts/finite-state-morphology";
import { Loading, Readings } from "./morphologyParts";

export function WordsAnalysed({
  words = ["walked", "bakes", "baked_after", "reopeners"],
}: {
  words?: (keyof ScenariosView)[];
}) {
  const [scenarios, setScenarios] = useState<ScenariosView | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setScenarios(await fetchScenarios());
      } catch (error) {
        setMessage(messageFor(error));
      }
    })();
  }, []);

  if (!scenarios) {
    return <Loading message={message} />;
  }

  const views = words.map((key) => {
    const held = scenarios[key];
    return Array.isArray(held) ? held[0] : (held as WordView);
  });

  return (
    <div className="space-y-4 rounded-lg border border-slate-200 p-3 dark:border-slate-800">
      {views.map((view) => (
        <div key={view.word}>
          <p className="mb-2 font-mono text-base text-slate-900 dark:text-slate-100">
            {view.word}
          </p>
          <Readings view={view} />
        </div>
      ))}
    </div>
  );
}

// The same, for the words a grammar cannot read at all.
export function WordsNotRead() {
  const [scenarios, setScenarios] = useState<ScenariosView | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setScenarios(await fetchScenarios());
      } catch (error) {
        setMessage(messageFor(error));
      }
    })();
  }, []);

  if (!scenarios) {
    return <Loading message={message} />;
  }

  return (
    <div className="space-y-3 rounded-lg border border-slate-200 p-3 dark:border-slate-800">
      {scenarios.unreadable.map((view) => (
        <div key={view.word}>
          <p className="mb-1 font-mono text-base text-slate-900 dark:text-slate-100">
            {view.word}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {view.n_lines_tried} lines were tried and{" "}
            {view.n_analyses === 0 ? "none" : view.n_analyses} reached the end,
            so what comes back is the word itself with no pieces and no labels
          </p>
        </div>
      ))}
    </div>
  );
}
