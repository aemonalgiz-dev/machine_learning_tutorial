"use client";

// The whole method under one set of controls: a corpus, a learner, a
// vocabulary size, and a text to read with what was learned.
//
// The API marks the text, fits the corpus at the size asked for and returns
// the marked stream, the pieces, the glued-back text and, where its own floor
// allows, the same request answered by the scheme that splits on spaces first.
// The browser only draws. Dropping the size below the corpus's own alphabet is
// left reachable on purpose, because the refusal that comes back says
// something the slider cannot.

import { useEffect, useState } from "react";
import {
  CorpusChoice,
  FitView,
  LearnerChoice,
  fitSentencePiece,
  messageFor,
} from "@/lib/concepts/sentencepiece";
import {
  CORPUS_LABELS,
  LEARNER_LABELS,
  MarkedText,
  Pieces,
  Stat,
} from "./sentencePieceParts";

const DEFAULTS: Record<
  CorpusChoice,
  { size: number; text: string; max: number }
> = {
  four_words: { size: 27, text: "lowest", max: 40 },
  sentences: {
    size: 100,
    text: "Dr. Alvarez didn't expect the low-cost re-analysis.",
    max: 160,
  },
  unspaced: { size: 24, text: "学生研究生命起源", max: 40 },
};

export function SentencePiecePlayground() {
  const [corpus, setCorpus] = useState<CorpusChoice>("sentences");
  const [learner, setLearner] = useState<LearnerChoice>("merging");
  const [size, setSize] = useState(DEFAULTS.sentences.size);
  const [text, setText] = useState(DEFAULTS.sentences.text);
  const [fit, setFit] = useState<FitView | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let current = true;
    (async () => {
      try {
        const answer = await fitSentencePiece(corpus, learner, size, text);
        if (current) {
          setFit(answer);
          setMessage(null);
        }
      } catch (error) {
        if (current) setMessage(messageFor(error));
      }
    })();
    return () => {
      current = false;
    };
  }, [corpus, learner, size, text]);

  const choose = (next: CorpusChoice) => {
    setCorpus(next);
    setSize(DEFAULTS[next].size);
    setText(DEFAULTS[next].text);
  };

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center gap-2">
        {(Object.keys(DEFAULTS) as CorpusChoice[]).map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => choose(key)}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition ${
              corpus === key
                ? "bg-indigo-600 text-white"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
            }`}
          >
            {CORPUS_LABELS[key]}
          </button>
        ))}
      </div>

      <div className="mb-3 flex flex-wrap items-center gap-2">
        {(Object.keys(LEARNER_LABELS) as LearnerChoice[]).map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => setLearner(key)}
            className={`rounded-md px-3 py-1 text-xs font-medium transition ${
              learner === key
                ? "bg-slate-800 text-white dark:bg-slate-200 dark:text-slate-900"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700"
            }`}
          >
            {LEARNER_LABELS[key]}
          </button>
        ))}
      </div>

      <div className="mb-3 grid gap-3 sm:grid-cols-2">
        <label className="block text-sm text-slate-600 dark:text-slate-400">
          Vocabulary size
          <span className="ml-2 font-mono text-slate-800 dark:text-slate-200">
            {size}
          </span>
          <input
            type="range"
            min={2}
            max={DEFAULTS[corpus].max}
            step={1}
            value={size}
            onChange={(event) => setSize(Number(event.target.value))}
            className="mt-1 w-full accent-indigo-600"
          />
        </label>
        <label className="block text-sm text-slate-600 dark:text-slate-400">
          Text to read with it
          <input
            type="text"
            value={text}
            maxLength={120}
            onChange={(event) => setText(event.target.value)}
            className="mt-1 w-full rounded-md border border-slate-300 bg-white px-2 py-1 font-mono text-sm text-slate-800 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
          />
        </label>
      </div>

      {message && (
        <p className="rounded-md border-l-4 border-amber-400 bg-amber-50/70 px-4 py-3 text-sm text-amber-900 dark:border-amber-500/70 dark:bg-amber-950/30 dark:text-amber-200">
          {message}
        </p>
      )}

      {!fit && !message && (
        <p className="text-sm text-slate-500 dark:text-slate-400">…</p>
      )}

      {fit && !message && (
        <>
          <div className="mb-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
            <Stat label="rows learned" value={fit.learned} />
            <Stat
              label="corpus, in pieces"
              value={fit.corpus_pieces}
            />
            <Stat
              label="text, in pieces"
              value={`${fit.n_pieces}${
                fit.n_unspellable > 0
                  ? ` (${fit.n_unspellable} unspellable)`
                  : ""
              }`}
            />
            <Stat
              label="glued back"
              value={fit.round_trip_exact ? "exact" : "not exact"}
            />
          </div>

          <div className="rounded-lg border border-slate-200 p-3 dark:border-slate-800">
            <p className="mb-1 text-xs font-medium text-slate-500 dark:text-slate-400">
              The text with every space written as a mark
            </p>
            <MarkedText text={fit.marked_text} />
            <p className="mb-2 mt-3 text-xs font-medium text-slate-500 dark:text-slate-400">
              Cut into pieces
            </p>
            <Pieces pieces={fit.pieces} tone="learned" />
            <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
              Glued back together it reads{" "}
              <span className="font-mono text-slate-700 dark:text-slate-300">
                {fit.decoded}
              </span>
              , which{" "}
              {fit.round_trip_exact
                ? "is the text it started as."
                : "is not the text it started as."}
            </p>
          </div>

          <div className="mt-3 rounded-lg border border-slate-200 p-3 dark:border-slate-800">
            <p className="mb-2 text-xs font-medium text-slate-500 dark:text-slate-400">
              The same size, given to a scheme that splits on spaces first
            </p>
            {fit.end_pieces === null ? (
              <p className="text-xs text-slate-500 dark:text-slate-400">
                That scheme cannot be fitted here at all below {fit.end_floor}{" "}
                rows, because holding a word-final letter apart from the same
                letter inside a word gives it a larger alphabet to store before
                it has learned anything.
              </p>
            ) : (
              <>
                <Pieces pieces={fit.end_pieces} tone="muted" />
                <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                  {fit.end_n_pieces} pieces against {fit.n_pieces}, and glued
                  back it reads{" "}
                  <span className="font-mono text-slate-700 dark:text-slate-300">
                    {fit.end_decoded}
                  </span>
                  .
                </p>
              </>
            )}
          </div>

          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            This corpus is spelled in {fit.alphabet.length} symbols once the
            mark is one of them, so the smallest vocabulary that can exist here
            is {fit.floor}. Ask for fewer and the answer is a refusal rather
            than a smaller vocabulary.
          </p>
        </>
      )}
    </div>
  );
}
