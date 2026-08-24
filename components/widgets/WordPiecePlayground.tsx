"use client";

// The whole method under one set of controls.
//
// Choose a corpus, choose how large a vocabulary to stop at, choose the fewest
// times a pair may be seen, and type a text to read back with it. The merges
// are listed with both the count they reached and the ratio that chose them,
// and the same text cut by a count-scored vocabulary of the same size sits
// underneath, so the contrast the page is about is always visible. The API
// fits and cuts; the browser draws.

import { useEffect, useState } from "react";
import {
  CorpusChoice,
  FitView,
  fitWordPiece,
  messageFor,
} from "@/lib/concepts/wordpiece";
import { CORPUS_LABELS, Pieces, Stat, formatScore } from "./wordPieceParts";

const DEFAULT_TEXTS: Record<CorpusChoice, string> = {
  four_words: "lowest lower",
  sentences: "Dr. Alvarez didn't expect the low-cost re-analysis.",
};

const SIZES: Record<CorpusChoice, { least: number; most: number; start: number }> =
  {
    four_words: { least: 12, most: 30, start: 22 },
    sentences: { least: 50, most: 220, start: 130 },
  };

export function WordPiecePlayground() {
  const [corpus, setCorpus] = useState<CorpusChoice>("sentences");
  const [size, setSize] = useState(SIZES.sentences.start);
  const [minimum, setMinimum] = useState(2);
  const [text, setText] = useState(DEFAULT_TEXTS.sentences);
  const [fit, setFit] = useState<FitView | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let live = true;
    (async () => {
      try {
        const answer = await fitWordPiece(corpus, size, minimum, text);
        if (live) {
          setFit(answer);
          setMessage(null);
        }
      } catch (error) {
        if (live) {
          setMessage(messageFor(error));
        }
      }
    })();
    return () => {
      live = false;
    };
  }, [corpus, size, minimum, text]);

  function chooseCorpus(choice: CorpusChoice) {
    setCorpus(choice);
    setSize(SIZES[choice].start);
    setText(DEFAULT_TEXTS[choice]);
  }

  const bounds = SIZES[corpus];

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {(["sentences", "four_words"] as const).map((choice) => (
          <button
            key={choice}
            type="button"
            onClick={() => chooseCorpus(choice)}
            className={`rounded-md border px-3 py-1.5 text-sm ${
              corpus === choice
                ? "border-indigo-400 bg-indigo-50 text-indigo-900 dark:border-indigo-500 dark:bg-indigo-950/50 dark:text-indigo-200"
                : "border-slate-300 text-slate-600 dark:border-slate-700 dark:text-slate-400"
            }`}
          >
            {CORPUS_LABELS[choice]}
          </button>
        ))}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block text-sm text-slate-600 dark:text-slate-400">
          Vocabulary size
          <span className="ml-2 font-mono text-slate-800 dark:text-slate-200">
            {size}
          </span>
          <input
            type="range"
            min={bounds.least}
            max={bounds.most}
            step={1}
            value={size}
            onChange={(event) => setSize(Number(event.target.value))}
            className="mt-1 w-full accent-indigo-600"
          />
        </label>
        <label className="block text-sm text-slate-600 dark:text-slate-400">
          Fewest times a pair may be seen
          <span className="ml-2 font-mono text-slate-800 dark:text-slate-200">
            {minimum}
          </span>
          <input
            type="range"
            min={1}
            max={8}
            step={1}
            value={minimum}
            onChange={(event) => setMinimum(Number(event.target.value))}
            className="mt-1 w-full accent-indigo-600"
          />
        </label>
      </div>

      <label className="block text-sm text-slate-600 dark:text-slate-400">
        Text to read back
        <input
          type="text"
          value={text}
          maxLength={200}
          onChange={(event) => setText(event.target.value)}
          className="mt-1 w-full rounded-md border border-slate-300 bg-white px-2.5 py-1.5 font-mono text-sm text-slate-800 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
        />
      </label>

      {message && (
        <p className="rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-900 dark:border-amber-600/60 dark:bg-amber-950/30 dark:text-amber-200">
          {message}
        </p>
      )}

      {fit && (
        <>
          <div>
            <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              The text, cut by the ratio
            </p>
            <Pieces pieces={fit.pieces} tone="learned" />
          </div>

          <div>
            <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              The same text, cut by a count-scored vocabulary of that size
            </p>
            {fit.count_pieces ? (
              <Pieces pieces={fit.count_pieces} tone="plain" />
            ) : (
              <p className="text-xs text-slate-500 dark:text-slate-400">
                That vocabulary cannot be built this small, since holding a
                word&rsquo;s last letter apart from the same letter inside a word
                needs two rows more than this corpus has room for here.
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <Stat label="tokens learned" value={fit.learned} />
            <Stat label="merges" value={fit.n_merges} />
            <Stat
              label="the text, in pieces"
              value={
                fit.count_n_pieces === null
                  ? fit.n_pieces
                  : `${fit.n_pieces} against ${fit.count_n_pieces}`
              }
            />
            <Stat
              label="the corpus, in pieces"
              value={
                fit.count_corpus_pieces === null
                  ? fit.corpus_pieces
                  : `${fit.corpus_pieces} against ${fit.count_corpus_pieces}`
              }
            />
          </div>

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <Stat label="smallest workable size" value={fit.smallest_size} />
            <Stat label="unspellable words" value={fit.n_unknown} />
            <Stat
              label="glues back exactly"
              value={fit.round_trip_exact ? "yes" : "no"}
            />
            <Stat label="rows before merging" value={fit.alphabet.length + 1} />
          </div>

          <details className="rounded-lg border border-slate-200 px-3 py-2 dark:border-slate-800">
            <summary className="cursor-pointer text-sm text-slate-600 dark:text-slate-400">
              The {fit.n_merges} merges, in the order they were learned
            </summary>
            <div className="mt-2 max-h-64 overflow-y-auto">
              <table className="w-full border-collapse text-xs">
                <tbody>
                  {fit.merges.map((merge) => (
                    <tr
                      key={merge.rank}
                      className="border-b border-slate-100 last:border-0 dark:border-slate-800/60"
                    >
                      <td className="py-1 pr-3 font-mono text-slate-400 dark:text-slate-500">
                        {merge.rank + 1}
                      </td>
                      <td className="py-1 pr-3 font-mono text-slate-800 dark:text-slate-200">
                        {merge.left} + {merge.right}
                      </td>
                      <td className="py-1 pr-3 font-mono text-slate-800 dark:text-slate-200">
                        {merge.merged}
                      </td>
                      <td className="py-1 pr-3 font-mono text-slate-500 dark:text-slate-400">
                        seen {merge.count}
                      </td>
                      <td className="py-1 font-mono text-slate-500 dark:text-slate-400">
                        {formatScore(merge.score)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </details>
        </>
      )}
    </div>
  );
}
