"use client";

// Type a text, choose the sentences to learn from, choose how much to smooth,
// and watch every character be given a place.
//
// The API fits the model, walks the search, and answers the places, the words
// and what a word list counted from the identical sentences would have said.
// The browser draws the places as chips and prints the two answers side by side.
// Nothing here segments anything.

import { useEffect, useMemo, useState } from "react";
import {
  SegmentView,
  messageFor,
  segment,
} from "@/lib/concepts/segmenting-with-a-hidden-model";
import { AnswerLine, Loading, Sentences, Stat, TagRow } from "./hiddenModelParts";

const CORPORA = [
  { key: "five sentences", name: "Five Chinese sentences" },
  { key: "boundary", name: "Where each character plays one part" },
  { key: "contradictory", name: "Four sentences that disagree" },
  { key: "two sentences", name: "The smallest corpus" },
];

const SUGGESTIONS: Record<string, string[]> = {
  "five sentences": ["研究生命起源", "学生研究生命", "阿尔瓦雷斯研究生命起源", "很好"],
  boundary: ["adcfeb", "abcdef", "adad", "afafaf"],
  contradictory: ["研究生很多", "研究生命", "生命很好"],
  "two sentences": ["abcab", "abc", "cba", "aabbcc"],
};

const SMOOTHINGS = [2, 1, 0.5, 0.25, 0.1, 0.01];

export function HiddenModelPlayground() {
  const [corpus, setCorpus] = useState("five sentences");
  const [text, setText] = useState("研究生命起源");
  const [smoothing, setSmoothing] = useState(1);
  const [view, setView] = useState<SegmentView | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let current = true;
    (async () => {
      try {
        const answer = await segment(text, corpus, smoothing);
        if (current) {
          setView(answer);
          setMessage(null);
        }
      } catch (error) {
        if (current) {
          setMessage(messageFor(error));
        }
      }
    })();
    return () => {
      current = false;
    };
  }, [text, corpus, smoothing]);

  const known = useMemo(
    () => new Set(view ? view.tagging.words_in_the_corpus : []),
    [view],
  );

  return (
    <div>
      <h2 className="mb-1 text-lg font-semibold text-slate-900 dark:text-slate-100">
        Give every character a place and read the words off
      </h2>
      <p className="mb-3 text-sm text-slate-600 dark:text-slate-400">
        Pick the sentences the model may learn from, type anything, and the four
        places are fitted from those sentences alone. A word list counted from
        exactly the same sentences answers underneath, so the difference between
        the two rows is the method rather than the evidence.
      </p>

      <div className="mb-3 flex flex-wrap gap-2">
        {CORPORA.map((option) => (
          <button
            key={option.key}
            type="button"
            onClick={() => {
              setCorpus(option.key);
              setText(SUGGESTIONS[option.key][0]);
            }}
            className={`rounded-md border px-3 py-1 text-sm ${
              corpus === option.key
                ? "border-sky-400 bg-sky-50 text-sky-900 dark:border-sky-500 dark:bg-sky-950/40 dark:text-sky-200"
                : "border-slate-200 text-slate-600 hover:border-slate-300 dark:border-slate-700 dark:text-slate-400"
            }`}
          >
            {option.name}
          </button>
        ))}
      </div>

      <label className="block text-xs font-medium text-slate-500 dark:text-slate-400">
        Text to read
        <input
          value={text}
          maxLength={60}
          onChange={(event) => setText(event.target.value)}
          className="mt-1 w-full rounded-md border border-slate-200 bg-white px-3 py-2 font-mono text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
        />
      </label>

      <div className="mt-2 flex flex-wrap gap-1.5">
        {SUGGESTIONS[corpus].map((suggestion) => (
          <button
            key={suggestion}
            type="button"
            onClick={() => setText(suggestion)}
            className="rounded border border-slate-200 px-2 py-0.5 font-mono text-xs text-slate-600 hover:border-slate-300 dark:border-slate-700 dark:text-slate-400"
          >
            {suggestion}
          </button>
        ))}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
          added to every count
        </span>
        {SMOOTHINGS.map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => setSmoothing(value)}
            className={`rounded-md border px-2 py-1 font-mono text-xs ${
              smoothing === value
                ? "border-sky-400 bg-sky-50 text-sky-900 dark:border-sky-500 dark:bg-sky-950/40 dark:text-sky-200"
                : "border-slate-200 text-slate-600 hover:border-slate-300 dark:border-slate-700 dark:text-slate-400"
            }`}
          >
            {value}
          </button>
        ))}
      </div>

      {message && (
        <p className="mt-3 rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-900 dark:border-amber-500/60 dark:bg-amber-950/30 dark:text-amber-200">
          {message}
        </p>
      )}

      {!view ? (
        <div className="mt-3">
          <Loading message={null} />
        </div>
      ) : (
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div>
            <p className="mb-1 text-xs font-medium text-slate-500 dark:text-slate-400">
              What it was shown
            </p>
            <Sentences sentences={view.tables.sentences} />
            <div className="mt-3 grid grid-cols-2 gap-2">
              <Stat
                label="different characters"
                value={`${view.tables.n_alphabet}`}
              />
              <Stat
                label="characters never seen"
                value={`${view.tagging.n_unseen_characters}`}
              />
            </div>
          </div>
          <div>
            <p className="mb-1 text-xs font-medium text-slate-500 dark:text-slate-400">
              The place given to each character
            </p>
            <TagRow tags={view.tagging.tags} />
            <ul className="mt-2">
              <AnswerLine
                name="the places, read off"
                words={view.tagging.words}
                known={known}
                note={
                  <>
                    total {view.tagging.total_log_score.toFixed(4)},{" "}
                    {view.tagging.n_new_words} of the pieces never seen as words
                  </>
                }
              />
              <AnswerLine
                name="a list of those words"
                words={view.tagging.from_a_word_list}
                known={known}
              />
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
