"use client";

// The whole method under one set of controls: a corpus, a vocabulary size, a
// text to read with what was learned, and whether a character the corpus never
// used has a spelling.
//
// The API fits the corpus at the size asked for and returns the merges in the
// order they were learned, the finished vocabulary, what the corpus costs in
// pieces, and how the text was cut and glued back. The browser only draws.
// Dropping the size below the corpus's own alphabet is left reachable on
// purpose, because the refusal that comes back says something the slider
// cannot; so is the published method, because typing an accented letter under
// it is the quickest way to see the loss the page's twelfth section is about.

import { useEffect, useMemo, useState } from "react";
import {
  CorpusChoice,
  FitView,
  fitBytePairEncoding,
  messageFor,
} from "@/lib/concepts/byte-pair-encoding";
import { CORPUS_LABELS, Pieces, Stat } from "./bytePairEncodingParts";

const DEFAULTS: Record<CorpusChoice, { size: number; text: string; max: number }> =
  {
    four_words: { size: 22, text: "lowest", max: 30 },
    sentences: {
      size: 100,
      text: "Dr. Alvarez didn't expect the low-cost re-analysis.",
      max: 160,
    },
  };

export function BytePairPlayground() {
  const [corpus, setCorpus] = useState<CorpusChoice>("sentences");
  const [size, setSize] = useState(DEFAULTS.sentences.size);
  const [text, setText] = useState(DEFAULTS.sentences.text);
  const [spellEverything, setSpellEverything] = useState(true);
  const [fit, setFit] = useState<FitView | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let current = true;
    (async () => {
      try {
        const answer = await fitBytePairEncoding(
          corpus,
          size,
          text,
          spellEverything,
        );
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
  }, [corpus, size, text, spellEverything]);

  const choose = (next: CorpusChoice) => {
    setCorpus(next);
    setSize(DEFAULTS[next].size);
    setText(DEFAULTS[next].text);
  };

  const shown = useMemo(() => fit?.merges.slice(-14) ?? [], [fit]);

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

      <div className="mb-3 flex flex-wrap gap-2">
        {(
          [
            [true, "Every character spellable"],
            [false, "The method as published"],
          ] as const
        ).map(([value, label]) => (
          <button
            key={label}
            type="button"
            onClick={() => setSpellEverything(value)}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition ${
              spellEverything === value
                ? "bg-indigo-600 text-white"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
            }`}
          >
            {label}
          </button>
        ))}
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
          <div className="mb-3 grid grid-cols-2 gap-2 sm:grid-cols-5">
            <Stat label="tokens learned" value={fit.learned} />
            <Stat label="rows in the table" value={fit.total_rows} />
            <Stat label="merges learned" value={fit.n_merges} />
            <Stat
              label="corpus, in pieces"
              value={`${fit.corpus_pieces} of ${fit.corpus_character_pieces}`}
            />
            <Stat
              label="text, in pieces"
              value={`${fit.n_pieces}${
                fit.unknown_pieces > 0 ? ` (${fit.unknown_pieces} unspellable)` : ""
              }`}
            />
          </div>

          <div className="rounded-lg border border-slate-200 p-3 dark:border-slate-800">
            <p className="mb-2 text-xs font-medium text-slate-500 dark:text-slate-400">
              The text, cut into pieces
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
              {fit.n_merges === 0
                ? "No merge has been learned, so every piece is a single character"
                : shown.length < fit.n_merges
                  ? `The last ${shown.length} merges, latest at the bottom`
                  : "Every merge, in the order it was learned"}
            </p>
            {fit.n_merges > 0 && (
              <div className="max-h-56 overflow-y-auto">
                <table className="w-full text-left text-xs">
                  <thead className="text-slate-500 dark:text-slate-400">
                    <tr>
                      <th className="py-1 pr-3 font-medium">rank</th>
                      <th className="py-1 pr-3 font-medium">joined</th>
                      <th className="py-1 pr-3 font-medium">became</th>
                      <th className="py-1 font-medium">seen</th>
                    </tr>
                  </thead>
                  <tbody className="font-mono text-slate-700 dark:text-slate-300">
                    {shown.map((merge) => (
                      <tr
                        key={merge.rank}
                        className="border-t border-slate-100 dark:border-slate-800/60"
                      >
                        <td className="py-1 pr-3">{merge.rank}</td>
                        <td className="py-1 pr-3">
                          {merge.left} + {merge.right}
                        </td>
                        <td className="py-1 pr-3">{merge.merged}</td>
                        <td className="py-1">{merge.count}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            The corpus is spelled in {fit.alphabet.length} symbols, so the
            smallest vocabulary that can exist here is {fit.smallest_size}. Ask
            for fewer and the answer is a refusal rather than a smaller
            vocabulary; ask for many more and the count stops rising, because
            the corpus runs out of pairs it has seen twice.{" "}
            {fit.floor_rows > 0
              ? `The size asked for bounds only what the corpus taught, and ${fit.floor_rows} further rows sit underneath it so that no character is unspellable.`
              : "As published there are no rows underneath, so a character the corpus never used has nothing to be written with."}
          </p>
        </>
      )}
    </div>
  );
}
