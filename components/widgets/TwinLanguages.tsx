"use client";

// Two languages that leave the same counts behind, and a run of characters none
// of which was ever seen.
//
// The API fits both languages, compares every number of one fit against the
// matching number of the other, and reports how many of them differ. It also
// hands a run of characters outside the corpus's alphabet to a fit and reports
// the places it gives them, which is what is left of the method when the
// characters say nothing. The browser only prints what comes back.

import { useEffect, useState } from "react";
import {
  LimitsView,
  fetchLimits,
  messageFor,
} from "@/lib/concepts/segmenting-with-a-hidden-model";
import { AnswerLine, Loading, Sentences, Stat, TagRow } from "./hiddenModelParts";

export function TwinLanguages() {
  const [view, setView] = useState<LimitsView | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setView(await fetchLimits());
      } catch (error) {
        setMessage(messageFor(error));
      }
    })();
  }, []);

  if (!view) {
    return <Loading message={message} />;
  }

  const first = new Set(view.first_sentences.flat());
  const second = new Set(view.second_sentences.flat());

  return (
    <div className="rounded-lg border border-slate-200 p-3 dark:border-slate-800">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <p className="mb-1 text-xs font-medium text-slate-500 dark:text-slate-400">
            One language
          </p>
          <Sentences sentences={view.first_sentences} />
        </div>
        <div>
          <p className="mb-1 text-xs font-medium text-slate-500 dark:text-slate-400">
            The other
          </p>
          <Sentences sentences={view.second_sentences} />
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
        <Stat
          label="numbers compared"
          value={`${view.n_numbers_compared}`}
        />
        <Stat
          label="of them equal"
          value={`${view.n_numbers_equal}`}
        />
        <Stat
          label="of them different"
          value={`${view.n_numbers_compared - view.n_numbers_equal}`}
        />
      </div>

      <p className="mt-3 mb-1 text-xs font-medium text-slate-500 dark:text-slate-400">
        What either fit answers, since they are the same fit
      </p>
      <ul>
        {view.twin_texts.map((twin) => (
          <AnswerLine
            key={twin.text}
            name={twin.text}
            words={twin.answer}
            known={twin.in_the_first_language ? first : second}
            note={
              twin.in_the_first_language
                ? "words of the first language"
                : "words of the second language, answered by a fit shown only the first"
            }
          />
        ))}
      </ul>

      <p className="mt-4 mb-1 text-xs font-medium text-slate-500 dark:text-slate-400">
        A run of characters the five Chinese sentences never held, of each length
      </p>
      <div className="space-y-1">
        {view.unseen_runs.map((run) => (
          <div key={run.n_characters} className="flex items-center gap-3">
            <span className="w-24 shrink-0 text-xs text-slate-500 dark:text-slate-400">
              {run.n_characters} characters
            </span>
            <TagRow tags={run.tags} />
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {run.n_words} pieces
            </span>
          </div>
        ))}
      </div>
      <p className="mt-2 text-[11px] text-slate-500 dark:text-slate-400">
        Every character here is worth exactly the same to every place, so these
        answers are properties of the corpus rather than of the run. Three
        entirely different runs of five,{" "}
        <span className="font-mono">{view.unseen_texts.join(", ")}</span>, all
        come back as {view.unseen_tags}.
      </p>
    </div>
  );
}
