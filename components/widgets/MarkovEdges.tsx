"use client";

// Four small chains on which settling is not the ordinary case.
//
// Each is counted on a word or two, in vowels and consonants, so every count
// can be checked by eye. For each the widget shows the counted steps, the
// table where there is one, the chance of a vowel along the first eight steps
// of a walk from the word's first letter, where the chain settles if there is
// one place, the share of time over a thousand steps, and what a smoothing of
// a half does to all of it. The API counts, solves and walks; the browser
// draws.

import { useEffect, useState } from "react";
import { EdgesView, fetchEdges, messageFor } from "@/lib/concepts/markov-chains";
import {
  ACTIVE_CLASS,
  BUTTON_CLASS,
  Caption,
  Grid,
  INDIGO,
  Loading,
  Stat,
  readProbability,
  stateName,
} from "./markovParts";

export function MarkovEdges({ initial = 0 }: { initial?: number }) {
  const [view, setView] = useState<EdgesView | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [chosen, setChosen] = useState(initial);

  useEffect(() => {
    (async () => {
      try {
        setView(await fetchEdges());
      } catch (error) {
        setMessage(messageFor(error));
      }
    })();
  }, []);

  if (!view) return <Loading message={message} />;

  const edge = view.cases[Math.min(chosen, view.cases.length - 1)];
  const pair = (values: number[] | null) =>
    values === null
      ? "none"
      : `${values[0].toFixed(4)}, ${values[1].toFixed(4)}`;

  return (
    <div>
      <div className="mb-3 flex flex-wrap gap-2">
        {view.cases.map((item, index) => (
          <button
            key={item.title}
            type="button"
            onClick={() => setChosen(index)}
            className={index === chosen ? ACTIVE_CLASS : BUTTON_CLASS}
          >
            {item.title}
          </button>
        ))}
      </div>

      <div className="mb-3 flex flex-wrap gap-3">
        {edge.words.map((word, index) => (
          <span
            key={word}
            className="rounded border border-slate-200 bg-white px-2 py-1 font-mono text-sm dark:border-slate-700 dark:bg-slate-900"
          >
            <span className="text-slate-800 dark:text-slate-200">{word}</span>
            <span className="ml-2 text-indigo-600 dark:text-indigo-400">
              {edge.classes[index]}
            </span>
          </span>
        ))}
      </div>

      <div className="flex flex-wrap items-start gap-4">
        <Grid
          title="steps counted"
          states={view.states}
          rows={edge.counts}
          read={(value) => String(value)}
        />
        {edge.table ? (
          <Grid
            title="each row divided by its total"
            states={view.states}
            rows={edge.table}
            read={readProbability}
          />
        ) : null}
        <Grid
          title={`with ${view.smoothing} added to every cell`}
          states={view.states}
          rows={edge.smoothed_table}
          read={readProbability}
        />
      </div>

      <p className="mt-3 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300">
        {edge.note}
      </p>

      {edge.walk && (
        <div className="mt-3">
          <p className="mb-1 text-xs text-slate-500 dark:text-slate-400">
            The chance of a vowel at each step of a walk from the first letter,
            a {stateName(edge.start)}
          </p>
          <div className="flex flex-wrap gap-1.5">
            {edge.walk.map((value, step) => (
              <span
                key={step}
                className="flex w-12 flex-col items-center rounded border border-slate-200 py-1 dark:border-slate-700"
              >
                <span
                  className="mb-1 inline-block h-4 w-4 rounded-full border border-indigo-300 dark:border-indigo-500/60"
                  style={{ backgroundColor: INDIGO, opacity: 0.1 + 0.9 * value }}
                />
                <span className="font-mono text-[10px] text-slate-600 dark:text-slate-400">
                  {value.toFixed(2)}
                </span>
                <span className="text-[10px] text-slate-400">{step}</span>
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
        <Stat label="where it settles, vowel and consonant" value={pair(edge.stationary)} />
        <Stat
          label="share of time over a thousand steps"
          value={pair(edge.long_run_share)}
        />
        <Stat
          label={`where it settles with ${view.smoothing} added`}
          value={pair(edge.smoothed_stationary)}
        />
      </div>

      {edge.kind === "never_left" && view.stranded_states.length > 0 && (
        <Caption>
          The same thing happens in the book. A chain on the first two chapters
          that remembers three letters strands{" "}
          {view.stranded_states.map((state) => `“${state}”`).join(" and ")}, the
          last three letters of these sentences and of nothing else counted.{" "}
          {view.stranded_sentences.map((sentence) => `“${sentence}”`).join(" ")}
        </Caption>
      )}
    </div>
  );
}
