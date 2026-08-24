"use client";

// The whole method under one set of controls: a corpus, a vocabulary size, and
// a text to read with what was learned.
//
// The API shrinks a model of the size asked for and returns the surviving
// pieces with the probability each carries, what the corpus costs in pieces,
// and how the text was cut and glued back; it fits a merge-grown vocabulary of
// the same size beside it so the two answers can be read together. The browser
// only draws. Dropping the size below the corpus's own alphabet is left
// reachable on purpose, because the refusal that comes back says something the
// slider cannot.

import { useEffect, useState } from "react";
import {
  CorpusChoice,
  FitView,
  fitUnigramModel,
  messageFor,
} from "@/lib/concepts/the-unigram-language-model";
import {
  CORPUS_LABELS,
  Pieces,
  Piece,
  Stat,
  readProbability,
} from "./unigramModelParts";

const DEFAULTS: Record<
  CorpusChoice,
  { size: number; text: string; max: number }
> = {
  four_words: { size: 16, text: "lowest", max: 40 },
  sentences: {
    size: 100,
    text: "Dr. Alvarez didn't expect the low-cost re-analysis.",
    max: 200,
  },
};

export function UnigramPlayground() {
  const [corpus, setCorpus] = useState<CorpusChoice>("sentences");
  const [size, setSize] = useState(DEFAULTS.sentences.size);
  const [text, setText] = useState(DEFAULTS.sentences.text);
  const [fit, setFit] = useState<FitView | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let current = true;
    (async () => {
      try {
        const answer = await fitUnigramModel(corpus, size, text);
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
  }, [corpus, size, text]);

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
            <Stat label="tokens learned" value={fit.learned} />
            <Stat
              label="candidates it started from"
              value={fit.n_candidates}
            />
            <Stat label="rounds of shrinking" value={fit.n_pruning_rounds} />
            <Stat
              label="corpus, in pieces"
              value={`${fit.corpus_pieces} of ${fit.corpus_character_pieces}`}
            />
          </div>

          <div className="rounded-lg border border-slate-200 p-3 dark:border-slate-800">
            <p className="mb-2 text-xs font-medium text-slate-500 dark:text-slate-400">
              The text, cut by probability, {fit.n_pieces} pieces
              {fit.unknown_pieces > 0
                ? `, ${fit.unknown_pieces} of them unspellable`
                : ""}
            </p>
            <Pieces pieces={fit.cut} tone="learned" />
            <p className="mt-3 mb-1 text-xs font-medium text-slate-500 dark:text-slate-400">
              The same text under a merge-grown vocabulary of the same size,{" "}
              {fit.merged_n_pieces} pieces
            </p>
            <Pieces pieces={fit.merged_cut} tone="highlight" />
            <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
              Glued back together the first of those reads{" "}
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
              The likeliest pieces the shrinking left, with what each is worth
            </p>
            <div className="flex flex-wrap gap-2">
              {fit.pieces.map((entry) => (
                <span
                  key={entry.piece}
                  className="inline-flex items-center gap-1.5"
                >
                  <Piece text={entry.piece} tone="learned" />
                  <span className="font-mono text-[11px] text-slate-500 dark:text-slate-400">
                    {readProbability(entry.probability)}
                  </span>
                </span>
              ))}
            </div>
          </div>

          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            The corpus is spelled in {fit.alphabet.length} symbols, so the
            smallest vocabulary that can exist here is {fit.smallest_size}. Ask
            for fewer and the answer is a refusal rather than a smaller
            vocabulary, since a single symbol is never dropped and a corpus that
            cannot be spelled has no likelihood at all. Ask for more than{" "}
            {fit.n_candidates} and there is nothing left to keep.
          </p>
        </>
      )}
    </div>
  );
}
