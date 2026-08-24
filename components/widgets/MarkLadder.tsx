"use client";

// The four-word corpus merged one pair at a time, with every candidate that
// reached the winning count shown beside the one that was taken.
//
// The API walks the corpus and returns, at each step, the spellings before the
// merge, the merge chosen, the candidates tied with it and what the word the
// corpus never contained looks like at that point. The browser draws the step
// the control names. The rows to watch are the ones where a candidate
// beginning with the mark tied and lost.

import { useEffect, useState } from "react";
import {
  LearningView,
  fetchLearning,
  messageFor,
} from "@/lib/concepts/sentencepiece";
import { MARK, Piece, Pieces, Stat } from "./sentencePieceParts";

export function MarkLadder() {
  const [learning, setLearning] = useState<LearningView | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [step, setStep] = useState(4);

  useEffect(() => {
    (async () => {
      try {
        setLearning(await fetchLearning());
      } catch (error) {
        setMessage(messageFor(error));
      }
    })();
  }, []);

  if (!learning) {
    return (
      <p className="text-sm text-slate-500 dark:text-slate-400">
        {message ?? "…"}
      </p>
    );
  }

  const last = learning.steps.length;
  const startingRows = learning.tokens.length - last;
  const shown = Math.min(step, last);
  const current = shown < last ? learning.steps[shown] : null;
  const spellings = current
    ? current.spellings
    : learning.final_spellings;
  const pieces = current ? current.corpus_pieces : learning.final_pieces;
  const unseen = current
    ? current.unseen_pieces
    : learning.final_unseen_pieces;

  return (
    <div className="rounded-lg border border-slate-200 p-3 dark:border-slate-800">
      <label className="block text-sm text-slate-600 dark:text-slate-400">
        Merges made
        <span className="ml-2 font-mono text-slate-800 dark:text-slate-200">
          {shown}
        </span>
        <input
          type="range"
          min={0}
          max={last}
          step={1}
          value={shown}
          onChange={(event) => setStep(Number(event.target.value))}
          className="mt-1 w-full accent-indigo-600"
        />
      </label>

      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
        <Stat label="corpus, in pieces" value={pieces} />
        <Stat label="rows so far" value={startingRows + shown} />
        <Stat
          label={`${learning.unseen_word}, unseen`}
          value={`${unseen.length} pieces`}
        />
      </div>

      <div className="mt-3 space-y-1.5">
        {spellings.map((symbols, index) => (
          <div
            key={learning.words[index]}
            className="flex flex-wrap items-center gap-2"
          >
            <span className="w-20 shrink-0 font-mono text-xs text-slate-500 dark:text-slate-400">
              {learning.words[index]} &times;{learning.counts[index]}
            </span>
            <Pieces pieces={symbols} tone="learned" />
          </div>
        ))}
      </div>

      {current && (
        <div className="mt-4 border-t border-slate-100 pt-3 dark:border-slate-800">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Next merge, chosen at a count of {current.count}
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            {current.tied.map((pair) => {
              const taken = pair === `${current.left} + ${current.right}`;
              return (
                <span
                  key={pair}
                  className={`rounded border px-2 py-0.5 font-mono text-xs ${
                    taken
                      ? "border-emerald-400 bg-emerald-50 text-emerald-900 dark:border-emerald-500/70 dark:bg-emerald-950/40 dark:text-emerald-200"
                      : "border-slate-200 bg-slate-50 text-slate-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400"
                  }`}
                >
                  {pair}
                </span>
              );
            })}
          </div>
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            {current.tied.length === 1
              ? "One candidate reached that count, so nothing had to be decided here."
              : current.mark_pair_was_tied
                ? `One of the tied candidates begins with the mark and it is passed over, since the tie goes to the pair that sorts earlier and ${MARK} sorts after every letter.`
                : "The tie goes to the pair that sorts earlier."}
          </p>
        </div>
      )}

      <div className="mt-4 border-t border-slate-100 pt-3 dark:border-slate-800">
        <p className="mb-2 text-xs text-slate-500 dark:text-slate-400">
          The word {learning.unseen_word}, which the corpus never contained, as
          it stands now
        </p>
        <div className="flex flex-wrap gap-1">
          {unseen.map((piece, index) => (
            <Piece key={`${index}-${piece}`} text={piece} tone="highlight" />
          ))}
        </div>
      </div>
    </div>
  );
}
