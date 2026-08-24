"use client";

// What happens when the counts do not pick a winner.
//
// At two of the four-word corpus's ten merge steps, several adjacent pairs
// reach the winning count together. The API takes each tied pair in turn,
// finishes the rest of the fit from there, and reports the whole vocabulary
// that resulted, what the corpus then costs, and how a word the corpus never
// contained is cut. The branch the tie rule actually takes is marked. The
// browser draws the comparison and nothing else.

import { useEffect, useState } from "react";
import {
  LimitsView,
  fetchLimits,
  messageFor,
} from "@/lib/concepts/byte-pair-encoding";
import { Pieces } from "./bytePairEncodingParts";

export function TieBranches() {
  const [limits, setLimits] = useState<LimitsView | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [which, setWhich] = useState(0);

  useEffect(() => {
    (async () => {
      try {
        setLimits(await fetchLimits());
      } catch (error) {
        setMessage(messageFor(error));
      }
    })();
  }, []);

  if (!limits) {
    return (
      <p className="text-sm text-slate-500 dark:text-slate-400">
        {message ?? "…"}
      </p>
    );
  }

  const tie = limits.ties[which];
  const shared = tie.branches.reduce<string[]>(
    (kept, branch) => kept.filter((token) => branch.tokens.includes(token)),
    [...tie.branches[0].tokens],
  );

  return (
    <div>
      <div className="mb-3 flex flex-wrap gap-2">
        {limits.ties.map((option, index) => (
          <button
            key={option.step}
            type="button"
            onClick={() => setWhich(index)}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition ${
              which === index
                ? "bg-indigo-600 text-white"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
            }`}
          >
            Merge {option.step + 1}, {option.branches.length} pairs at{" "}
            {option.count}
          </button>
        ))}
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {tie.branches.map((branch) => (
          <div
            key={branch.pair}
            className={`rounded-lg border p-3 ${
              branch.chosen_by_the_rule
                ? "border-indigo-400 bg-indigo-50/50 dark:border-indigo-500/70 dark:bg-indigo-950/20"
                : "border-slate-200 dark:border-slate-800"
            }`}
          >
            <p className="font-mono text-sm text-slate-800 dark:text-slate-200">
              {branch.pair}
            </p>
            <p className="mb-2 text-[11px] text-slate-500 dark:text-slate-400">
              {branch.chosen_by_the_rule
                ? "taken, because its first symbol sorts earliest"
                : "equally good, and not taken"}
            </p>
            <p className="mb-1 text-[11px] text-slate-500 dark:text-slate-400">
              tokens this branch has that the others do not
            </p>
            <Pieces
              pieces={branch.tokens.filter((token) => !shared.includes(token))}
              tone={branch.chosen_by_the_rule ? "learned" : "muted"}
            />
            <p className="mt-2 text-[11px] text-slate-500 dark:text-slate-400">
              corpus in {branch.corpus_pieces} pieces
            </p>
            <p className="mt-2 mb-1 text-[11px] text-slate-500 dark:text-slate-400">
              {tie.unseen_word} comes out as
            </p>
            <Pieces pieces={branch.unseen_pieces} tone="highlight" />
          </div>
        ))}
      </div>

      <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
        Every branch here leaves the corpus at the same number of pieces, so the
        objective the method is climbing genuinely does not prefer one over
        another. What differs is which tokens exist afterwards, and at the
        second tie that changes how a word the corpus never contained is cut.
      </p>
    </div>
  );
}
