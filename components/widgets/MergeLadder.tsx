"use client";

// The four-word corpus assembling itself, one merge at a time.
//
// Drag the step and the four words are respelled: at step zero every word is
// its characters, and each step afterwards joins the pair the counts chose and
// shows what the whole corpus then costs. The candidates tied at the winning
// count are listed beside the merge, because on a corpus this small the count
// often fails to pick a winner on its own. The API does the fitting and the
// counting; the browser draws the ladder.

import { useEffect, useState } from "react";
import {
  LearningView,
  fetchLearning,
  messageFor,
} from "@/lib/concepts/byte-pair-encoding";
import { Pieces, Stat } from "./bytePairEncodingParts";

export function MergeLadder({ initialStep = 0 }: { initialStep?: number }) {
  const [learning, setLearning] = useState<LearningView | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [step, setStep] = useState(initialStep);

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

  const last = learning.steps.length - 1;
  const here = learning.steps[Math.min(step, last)];
  const start = learning.steps[0];

  return (
    <div className="rounded-lg border border-slate-200 p-3 dark:border-slate-800">
      <label className="block text-sm text-slate-600 dark:text-slate-400">
        Merges applied
        <span className="ml-2 font-mono text-slate-800 dark:text-slate-200">
          {here.step} of {last}
        </span>
        <input
          type="range"
          min={0}
          max={last}
          step={1}
          value={Math.min(step, last)}
          onChange={(event) => setStep(Number(event.target.value))}
          className="mt-1 w-full accent-indigo-600"
        />
      </label>

      <div className="mt-3 space-y-2">
        {here.spellings.map((entry) => (
          <div key={entry.word} className="flex flex-wrap items-center gap-2">
            <span className="w-24 shrink-0 font-mono text-xs text-slate-500 dark:text-slate-400">
              {entry.word} &times;{entry.count}
            </span>
            <Pieces
              pieces={entry.symbols}
              tone={here.step === 0 ? "muted" : "learned"}
            />
          </div>
        ))}
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Stat
          label="corpus, in pieces"
          value={`${here.corpus_pieces} of ${start.corpus_pieces}`}
        />
        <Stat
          label="vocabulary"
          value={learning.alphabet.length + 1 + here.step}
        />
        <Stat
          label="next merge"
          value={
            here.left === null ? "none left" : `${here.left} + ${here.right}`
          }
        />
        <Stat label="seen" value={here.count === null ? "none" : here.count} />
      </div>

      <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
        {here.left === null ? (
          <>
            Nothing adjacent occurs twice any more, so there is no merge left to
            make. The word {learning.unseen_word}, which this corpus never
            contained, now reads as {here.unseen_pieces.length} pieces.
          </>
        ) : (
          <>
            {here.tied.length > 1 ? (
              <>
                {here.tied.length} pairs reach {here.count} here,{" "}
                {here.tied.join(", ")}, so the count does not decide on its own
                and the one whose first symbol sorts earliest is taken.
              </>
            ) : (
              <>
                One pair reaches {here.count} here, {here.tied[0]}, so nothing
                needs breaking.
              </>
            )}{" "}
            The word {learning.unseen_word} currently reads as{" "}
            {here.unseen_pieces.length} pieces.
          </>
        )}
      </p>
    </div>
  );
}
