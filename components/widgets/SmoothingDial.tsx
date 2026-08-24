"use client";

// One free number, walked down a ladder, and the reading it decides between.
//
// The API fits the same four sentences at each value on the ladder and reports
// what the model then answers for the one sentence those four disagree about,
// together with the value at which the answer turns, found by halving the
// interval until the two ends agree to twelve places. The browser draws the
// ladder as a row of stops and prints the answer at whichever stop is chosen.

import { useEffect, useState } from "react";
import {
  SmoothingView,
  fetchSmoothing,
  messageFor,
} from "@/lib/concepts/segmenting-with-a-hidden-model";
import {
  Chip,
  Loading,
  Sentences,
  Stat,
  TagRow,
  WordsRow,
} from "./hiddenModelParts";

export function SmoothingDial() {
  const [view, setView] = useState<SmoothingView | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [position, setPosition] = useState(1);

  useEffect(() => {
    (async () => {
      try {
        setView(await fetchSmoothing());
      } catch (error) {
        setMessage(messageFor(error));
      }
    })();
  }, []);

  if (!view) {
    return <Loading message={message} />;
  }

  const step = view.steps[Math.min(position, view.steps.length - 1)];
  const known = new Set(view.sentences.flat());
  const [low, high] = view.turns_between;

  return (
    <div className="rounded-lg border border-slate-200 p-3 dark:border-slate-800">
      <p className="mb-2 text-xs font-medium text-slate-500 dark:text-slate-400">
        Four sentences, in which the first two characters are a word{" "}
        {view.n_majority} times and all three are a word {view.n_minority} time
      </p>
      <Sentences sentences={view.sentences} />

      <div className="mt-4 mb-2 flex flex-wrap gap-1.5">
        {view.steps.map((option, index) => (
          <button
            key={option.smoothing}
            type="button"
            onClick={() => setPosition(index)}
            className={`rounded-md border px-2 py-1 font-mono text-xs ${
              index === position
                ? "border-sky-400 bg-sky-50 text-sky-900 dark:border-sky-500 dark:bg-sky-950/40 dark:text-sky-200"
                : "border-slate-200 text-slate-600 hover:border-slate-300 dark:border-slate-700 dark:text-slate-400"
            }`}
          >
            {option.smoothing}
          </button>
        ))}
      </div>

      <p className="mb-2 text-xs text-slate-500 dark:text-slate-400">
        Adding {step.smoothing} to every outcome that can happen, the sentence{" "}
        <span className="font-mono text-slate-900 dark:text-slate-100">
          {view.text}
        </span>{" "}
        comes back as
      </p>
      <WordsRow words={step.words} known={known} />
      <div className="mt-2">
        <TagRow tags={step.tags} />
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
        <Stat
          label="reproduces its own sentence"
          value={step.reproduces_the_corpus ? "yes" : "no"}
        />
        <Stat
          label="inside a word, after a beginning"
          value={step.begin_after_begin_is_middle.toFixed(4)}
        />
        <Stat
          label="inside a word produces the second character"
          value={step.probability_of_the_compound_start.toFixed(4)}
        />
      </div>

      <p className="mt-3 text-xs text-slate-600 dark:text-slate-400">
        The answer turns between {low.toFixed(5)} and {high.toFixed(5)}. Above
        it the two sentences that read the first two characters as a word win and
        the training sentence is not reproduced; below it the single sentence
        that reads all three as one word wins. Nothing in the method says which
        side to be on.
      </p>

      <p className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
        <Chip text="word" tone="known" /> a word the four sentences contained
        <Chip text="word" tone="new" /> a piece none of them did
      </p>
    </div>
  );
}
