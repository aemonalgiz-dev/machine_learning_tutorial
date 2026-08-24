"use client";

// Type a text, choose the sentences to learn from, and click any gap to see why
// it was answered the way it was.
//
// The API fits the gap classifier on the chosen sentences, scores every gap of
// the text, and, for whichever gap is clicked, lists the features of that gap
// with the weight each carries. It also runs the whole-sequence method of the
// previous page on the very same sentences, so the two readings underneath
// differ by method rather than by evidence. The browser draws the bars and the
// chips and totals nothing.

import { useEffect, useMemo, useState } from "react";
import {
  CORPUS_CHOICES,
  SegmentView,
  messageFor,
  segment,
  signed,
} from "@/lib/concepts/learning-boundaries-from-examples";
import {
  AnswerLine,
  GapBars,
  GapLegend,
  Loading,
  Sentences,
  Stat,
} from "./pointwiseParts";

const SUGGESTIONS: Record<string, string[]> = {
  written: [
    "Dr.Alvarezdidn'texpectthelow-costre-analysis.",
    "Ms.Chendidn'treadthere-print.",
    "thehigh-costtest",
  ],
  "five sentences": ["研究生命起源", "学生研究生命", "阿尔瓦雷斯研究生命起源"],
  mixed: ["Ortiz漢字文", "Chen研究起源", "研究Watson生命"],
  paired: ["生命起源", "命起源生", "研究起源生命"],
};

const REACHES = [1, 2, 3, 4, 5];

export function PointwisePlayground() {
  const [corpus, setCorpus] = useState("written");
  const [text, setText] = useState(SUGGESTIONS.written[0]);
  const [reach, setReach] = useState(3);
  const [gap, setGap] = useState<number | null>(2);
  const [view, setView] = useState<SegmentView | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let current = true;
    (async () => {
      try {
        const answer = await segment(text, corpus, reach, 20, 0, gap);
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
  }, [text, corpus, reach, gap]);

  const known = useMemo(
    () => new Set(view ? view.scenario.corpus_words : []),
    [view],
  );

  return (
    <div>
      <h2 className="mb-1 text-lg font-semibold text-slate-900 dark:text-slate-100">
        Answer every gap on its own, then ask one of them why
      </h2>
      <p className="mb-3 text-sm text-slate-600 dark:text-slate-400">
        Pick the marked-up sentences, type anything, and every gap between two
        neighbouring characters is given its own yes or no. Click a bar to see
        what pushed that one gap either way. The whole-sequence method of the
        previous page is fitted on exactly the same sentences and answers
        underneath.
      </p>

      <div className="mb-3 flex flex-wrap gap-2">
        {CORPUS_CHOICES.map((option) => (
          <button
            key={option.key}
            type="button"
            onClick={() => {
              setCorpus(option.key);
              setText(SUGGESTIONS[option.key][0]);
              setGap(2);
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
          characters read each side of a gap
        </span>
        {REACHES.map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => setReach(value)}
            className={`rounded-md border px-2 py-1 font-mono text-xs ${
              reach === value
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
        <div className="mt-4 space-y-4">
          <div>
            <GapBars
              text={view.scenario.text}
              gaps={view.scenario.gaps}
              chosen={gap}
              onChoose={setGap}
            />
            <GapLegend />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="mb-1 text-xs font-medium text-slate-500 dark:text-slate-400">
                What it was shown
              </p>
              <Sentences sentences={view.scenario.sentences} />
              <div className="mt-3 grid grid-cols-2 gap-2">
                <Stat
                  label="gaps asked about"
                  value={`${view.scenario.n_gaps}`}
                />
                <Stat
                  label="weights learned"
                  value={`${view.scenario.n_features}`}
                />
              </div>
              <ul className="mt-3">
                <AnswerLine
                  name="one answer per gap"
                  words={view.scenario.words}
                  known={known}
                />
                <AnswerLine
                  name="the best whole sequence"
                  words={view.scenario.from_the_sequence_model}
                  known={known}
                />
              </ul>
            </div>

            <div>
              <p className="mb-1 text-xs font-medium text-slate-500 dark:text-slate-400">
                {view.opened
                  ? `The gap between ${view.opened.before} and ${view.opened.after}`
                  : "Click a bar to open a gap"}
              </p>
              {view.opened && (
                <>
                  <ul className="max-h-64 overflow-y-auto border-y border-slate-100 py-1 dark:border-slate-800/60">
                    {view.opened.votes.map((vote) => (
                      <li
                        key={vote.feature}
                        className="flex items-center gap-2 py-0.5 text-xs"
                      >
                        <span className="w-12 shrink-0 text-right font-mono text-slate-500 dark:text-slate-400">
                          {vote.reach}
                        </span>
                        <span className="min-w-0 grow truncate font-mono text-slate-800 dark:text-slate-200">
                          {vote.reads === "" ? "always" : vote.reads}
                        </span>
                        <span
                          className={`w-20 shrink-0 text-right font-mono ${
                            vote.seen
                              ? "text-slate-800 dark:text-slate-200"
                              : "text-slate-400 dark:text-slate-600"
                          }`}
                        >
                          {vote.seen ? signed(vote.weight) : "no weight"}
                        </span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <Stat
                      label="the score of this gap"
                      value={signed(view.opened.total)}
                    />
                    <Stat
                      label="so the gap is"
                      value={view.opened.cut ? "cut" : "kept together"}
                    />
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
