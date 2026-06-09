"use client";

// One text taken all the way through, with the answer at every gap and its score.
//
// The API fits the gap classifier on the named sentences, scores every gap of
// the text, cuts where a score came out positive, and runs the whole-sequence
// method of the previous page on the very same sentences so the two answers can
// be set side by side. The browser draws the characters with a signed bar in
// each gap and prints the two readings underneath. What to look at is the height
// of each bar, since every one of them was arrived at without consulting any
// other.

import { useEffect, useState } from "react";
import {
  ScenariosView,
  fetchScenarios,
  messageFor,
  scenarioFor,
} from "@/lib/concepts/learning-boundaries-from-examples";
import {
  AnswerLine,
  GapBars,
  GapLegend,
  Loading,
  Sentences,
  Stat,
} from "./pointwiseParts";

export function GapStrip({
  scenarioKeys,
  showSentences = false,
}: {
  scenarioKeys: string[];
  showSentences?: boolean;
}) {
  const [view, setView] = useState<ScenariosView | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [chosen, setChosen] = useState(scenarioKeys[0]);

  useEffect(() => {
    (async () => {
      try {
        setView(await fetchScenarios());
      } catch (error) {
        setMessage(messageFor(error));
      }
    })();
  }, []);

  if (!view) {
    return <Loading message={message} />;
  }

  const scenario = scenarioFor(view, chosen);
  const known = new Set(scenario.corpus_words);

  return (
    <div className="rounded-lg border border-slate-200 p-3 dark:border-slate-800">
      {scenarioKeys.length > 1 && (
        <div className="mb-3 flex flex-wrap gap-2">
          {scenarioKeys.map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => setChosen(key)}
              className={`rounded-md border px-3 py-1 text-left text-sm ${
                chosen === key
                  ? "border-sky-400 bg-sky-50 text-sky-900 dark:border-sky-500 dark:bg-sky-950/40 dark:text-sky-200"
                  : "border-slate-200 text-slate-600 hover:border-slate-300 dark:border-slate-700 dark:text-slate-400"
              }`}
            >
              {scenarioFor(view, key).label}
            </button>
          ))}
        </div>
      )}

      <p className="mb-2 text-xs text-slate-500 dark:text-slate-400">
        Learned from {scenario.corpus_label}, reading{" "}
        {scenario.window} characters each side of a gap.
      </p>

      {showSentences && (
        <div className="mb-3">
          <Sentences sentences={scenario.sentences} />
        </div>
      )}

      <GapBars text={scenario.text} gaps={scenario.gaps} />
      <GapLegend withWrong={scenario.n_gaps_wrong !== null} />

      <ul className="mt-3">
        {scenario.reader_reading && (
          <AnswerLine
            name="what a reader answers"
            words={scenario.reader_reading}
            known={known}
          />
        )}
        <AnswerLine
          name="one answer per gap"
          words={scenario.words}
          known={known}
        />
        <AnswerLine
          name="the best whole sequence"
          words={scenario.from_the_sequence_model}
          known={known}
        />
      </ul>

      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Stat label="gaps asked about" value={`${scenario.n_gaps}`} />
        <Stat
          label="gaps answered against the reading"
          value={
            scenario.n_gaps_wrong === null ? "not stated" : `${scenario.n_gaps_wrong}`
          }
        />
        <Stat
          label="pieces the sentences never held"
          value={`${scenario.n_new_words}`}
        />
        <Stat label="weights in the fit" value={`${scenario.n_features}`} />
      </div>

      {scenario.n_free_boundaries > 0 && (
        <p className="mt-3 text-xs text-slate-600 dark:text-slate-400">
          {scenario.n_free_boundaries} further boundary is already marked by a
          space, so it costs no question and cannot be got wrong.
        </p>
      )}
    </div>
  );
}
