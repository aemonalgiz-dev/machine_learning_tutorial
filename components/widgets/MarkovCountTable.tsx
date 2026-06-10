"use client";

// The fit of a two-state chain, which is a tally and a division.
//
// For the one sentence the widget lays out every letter with its class beneath
// it, so the twelve steps can be counted off the page; for the two chapters it
// shows the same three things at a scale no pencil reaches. Either way the
// left grid is the count of steps, the middle grid is each row divided by its
// total, and the picture is those four probabilities drawn as arrows. The API
// counts and divides; the browser draws.

import { useEffect, useState } from "react";
import { VowelsView, fetchVowels, messageFor } from "@/lib/concepts/markov-chains";
import {
  Caption,
  Grid,
  Loading,
  Stat,
  TwoStateDiagram,
  readProbability,
} from "./markovParts";

export function MarkovCountTable({ text }: { text: "sentence" | "chapters" }) {
  const [view, setView] = useState<VowelsView | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setView(await fetchVowels());
      } catch (error) {
        setMessage(messageFor(error));
      }
    })();
  }, []);

  if (!view) return <Loading message={message} />;

  const tally = text === "sentence" ? view.hand.tally : view.counted;

  return (
    <div>
      {text === "sentence" && (
        <div className="mb-4 flex flex-wrap gap-1">
          {view.hand.letters.split("").map((letter, index) => (
            <span
              key={index}
              className="flex w-7 flex-col items-center rounded border border-slate-200 bg-white py-0.5 font-mono text-xs dark:border-slate-700 dark:bg-slate-900"
            >
              <span className="text-slate-800 dark:text-slate-200">{letter}</span>
              <span
                className={
                  view.hand.classes[index] === "V"
                    ? "font-semibold text-indigo-600 dark:text-indigo-400"
                    : "text-slate-400 dark:text-slate-500"
                }
              >
                {view.hand.classes[index]}
              </span>
            </span>
          ))}
        </div>
      )}

      <div className="flex flex-wrap items-start gap-4">
        <Grid
          title="steps counted"
          states={view.states}
          rows={tally.counts}
          read={(value) => value.toLocaleString()}
        />
        <Grid
          title="each row divided by its total"
          states={view.states}
          rows={tally.table}
          read={readProbability}
        />
        <TwoStateDiagram table={tally.table} />
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Stat label="letters" value={tally.n_symbols.toLocaleString()} />
        <Stat label="steps counted" value={tally.n_steps.toLocaleString()} />
        <Stat
          label="share of the letters that are vowels"
          value={tally.vowel_share.toFixed(4)}
        />
        <Stat
          label="where the chain settles, vowel"
          value={tally.stationary[0].toFixed(4)}
        />
      </div>
      <Caption>
        {text === "sentence"
          ? "Each step is one letter and the letter after it. The last letter of the sentence begins no step, which is why thirteen letters give twelve."
          : `All ${view.n_sentences} sentences of the first two chapters, each counted on its own, so no step runs from the end of one sentence into the start of the next.`}
      </Caption>
    </div>
  );
}
