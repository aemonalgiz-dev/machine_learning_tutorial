"use client";

// Learn a set of pieces by shortening a description, and read text with it.
//
// The API picks one of three small corpora, repeats it as often as asked,
// searches for the pieces that shorten the two-part description under the
// chosen multiplier, and reports the pieces, the three parts of the price, how
// each training word came apart, and what one text and one word are read as.
// The browser only draws, and shows the refusal when a request cannot be
// answered.

import { useEffect, useState } from "react";
import {
  FitView,
  MorfessorCorpus,
  fitMorfessor,
  messageFor,
} from "@/lib/concepts/morfessor";
import { CORPUS_LABELS, Pieces, Stat, nats } from "./morfessorParts";

const WEIGHTS = [0.25, 0.5, 0.75, 0.9, 1, 1.25, 1.5, 2];

export function MorfessorPlayground() {
  const [corpus, setCorpus] = useState<MorfessorCorpus>("inflections");
  const [repeats, setRepeats] = useState(3);
  const [weight, setWeight] = useState(1);
  const [text, setText] = useState("walking and playing");
  const [word, setWord] = useState("walkings");
  const [fit, setFit] = useState<FitView | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let current = true;
    (async () => {
      try {
        const answer = await fitMorfessor(corpus, repeats, weight, text, word);
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
  }, [corpus, repeats, weight, text, word]);

  return (
    <div>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="text-xs text-slate-500 dark:text-slate-400">
          corpus
          <select
            value={corpus}
            onChange={(event) =>
              setCorpus(event.target.value as MorfessorCorpus)
            }
            className="mt-1 w-full rounded border border-slate-300 bg-white px-2 py-1 text-sm text-slate-800 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
          >
            {Object.entries(CORPUS_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>

        <label className="text-xs text-slate-500 dark:text-slate-400">
          each word repeated {repeats}{" "}
          {repeats === 1 ? "time" : "times"}
          {corpus !== "inflections" && " (fixed for this corpus)"}
          <input
            type="range"
            min={1}
            max={8}
            step={1}
            value={repeats}
            disabled={corpus !== "inflections"}
            onChange={(event) => setRepeats(Number(event.target.value))}
            className="mt-1 w-full accent-indigo-500 disabled:opacity-40"
          />
        </label>

        <label className="text-xs text-slate-500 dark:text-slate-400">
          multiplier on the text half of the cost
          <select
            value={weight}
            onChange={(event) => setWeight(Number(event.target.value))}
            className="mt-1 w-full rounded border border-slate-300 bg-white px-2 py-1 text-sm text-slate-800 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
          >
            {WEIGHTS.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </label>

        <label className="text-xs text-slate-500 dark:text-slate-400">
          one word to cut
          <input
            type="text"
            value={word}
            maxLength={40}
            onChange={(event) => setWord(event.target.value)}
            className="mt-1 w-full rounded border border-slate-300 bg-white px-2 py-1 font-mono text-sm text-slate-800 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
          />
        </label>

        <label className="text-xs text-slate-500 dark:text-slate-400 sm:col-span-2">
          text to read back
          <input
            type="text"
            value={text}
            maxLength={200}
            onChange={(event) => setText(event.target.value)}
            className="mt-1 w-full rounded border border-slate-300 bg-white px-2 py-1 font-mono text-sm text-slate-800 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
          />
        </label>
      </div>

      {message && (
        <p className="mt-3 rounded border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:border-amber-500/60 dark:bg-amber-950/30 dark:text-amber-200">
          {message}
        </p>
      )}

      {!fit ? (
        <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">…</p>
      ) : (
        <div className="mt-4 space-y-4">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <Stat label="pieces found" value={fit.n_morphs} />
            <Stat label="rows in the table" value={fit.n_rows} />
            <Stat
              label="the corpus, in pieces"
              value={`${fit.corpus_pieces} of ${fit.whole_word_pieces} words`}
            />
            <Stat label="passes made" value={fit.epochs_run} />
          </div>

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <Stat
              label="spelling the list"
              value={nats(fit.breakdown.spelling_cost)}
            />
            <Stat
              label="writing the counts"
              value={nats(fit.breakdown.count_cost)}
            />
            <Stat
              label="writing the text"
              value={nats(fit.breakdown.corpus_cost)}
            />
            <Stat label="total, in nats" value={nats(fit.breakdown.total)} />
          </div>

          <div>
            <p className="mb-1 text-xs text-slate-500 dark:text-slate-400">
              The pieces, commonest first. Leaving every word whole would have
              cost {nats(fit.start_total)} nats.
            </p>
            <Pieces
              pieces={fit.morphs.map((morph) => morph.text)}
              tone="learned"
            />
          </div>

          <div className="border-t border-slate-100 pt-3 dark:border-slate-800">
            <p className="mb-1 text-xs text-slate-500 dark:text-slate-400">
              How the training words came apart.
            </p>
            <div className="space-y-1.5">
              {fit.segmentations.map((cut) => (
                <div
                  key={cut.word}
                  className="flex flex-wrap items-center gap-2"
                >
                  <span className="w-24 shrink-0 font-mono text-xs text-slate-500 dark:text-slate-400">
                    {cut.word}
                  </span>
                  <Pieces
                    pieces={cut.pieces}
                    tone={cut.n_pieces === 1 ? "muted" : "plain"}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-slate-100 pt-3 dark:border-slate-800">
            <p className="mb-1 text-xs text-slate-500 dark:text-slate-400">
              The single word, cut at the cheapest place, costing{" "}
              {nats(fit.word_cost)} nats.
            </p>
            <Pieces pieces={fit.word_pieces} tone="highlight" />
          </div>

          <div className="border-t border-slate-100 pt-3 dark:border-slate-800">
            <p className="mb-1 text-xs text-slate-500 dark:text-slate-400">
              The text, in {fit.n_pieces} pieces,{" "}
              {fit.n_unknown === 0
                ? "none of them a stand-in"
                : `${fit.n_unknown} of them a stand-in`}
              .
            </p>
            <Pieces pieces={fit.cut} />
            <p className="mt-2 font-mono text-xs text-slate-600 dark:text-slate-400">
              glued back: {fit.decoded || "(nothing)"}
            </p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              {fit.round_trip_exact
                ? "Which is what went in."
                : "Which is not what went in, because a character no piece covers takes its word boundary with it."}{" "}
              This table can spell {fit.alphabet_covered} of the corpus&rsquo;s{" "}
              {fit.alphabet_size} characters on their own.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
