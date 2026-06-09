"use client";

// What the written lines buy, set beside a vocabulary of the same size learned
// by counting.
//
// The API enumerates every word the grammar accepts, fits a vocabulary of the
// grammar's own size on exactly those words, and reports how many pieces each
// method spells them in and where each puts its cuts; the browser lays the two
// columns side by side. The corpus is the grammar's own language with every
// word in it once, which is the most helpful corpus the learned method could be
// handed and is not a corpus anybody has.

import { useEffect, useState } from "react";
import {
  CostView,
  fetchCost,
  messageFor,
} from "@/lib/concepts/finite-state-morphology";
import { Chip, Loading, Stat } from "./morphologyParts";

export function WrittenAgainstLearned() {
  const [cost, setCost] = useState<CostView | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [budget, setBudget] = useState(0);

  useEffect(() => {
    (async () => {
      try {
        setCost(await fetchCost());
      } catch (error) {
        setMessage(messageFor(error));
      }
    })();
  }, []);

  if (!cost) {
    return <Loading message={message} />;
  }

  const chosen = cost.budgets[budget];

  return (
    <div className="rounded-lg border border-slate-200 p-3 dark:border-slate-800">
      <div className="mb-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Stat label="lines written" value={`${cost.n_written_lines}`} />
        <Stat label="words accepted" value={`${cost.n_forms}`} />
        <Stat label="pieces per word" value={cost.mean_morphs.toFixed(3)} />
        <Stat label="most pieces" value={`${cost.max_morphs}`} />
      </div>

      <div className="mb-3 flex flex-wrap gap-2">
        {cost.budgets.map((each, position) => (
          <button
            key={each.n_pieces}
            type="button"
            onClick={() => setBudget(position)}
            className={`rounded-md border px-3 py-1 text-sm ${
              budget === position
                ? "border-sky-400 bg-sky-50 text-sky-900 dark:border-sky-500 dark:bg-sky-950/40 dark:text-sky-200"
                : "border-slate-200 text-slate-600 hover:border-slate-300 dark:border-slate-700 dark:text-slate-400"
            }`}
          >
            a learned vocabulary of {each.n_pieces} pieces
          </button>
        ))}
      </div>

      <div className="mb-3 grid grid-cols-2 gap-2">
        <Stat
          label="pieces per word, learned"
          value={chosen.mean_pieces.toFixed(3)}
        />
        <Stat
          label="of the accepted words held whole"
          value={`${chosen.n_whole_words}`}
        />
      </div>

      <p className="mb-1 text-xs font-medium text-slate-500 dark:text-slate-400">
        Where each of them cuts
      </p>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left dark:border-slate-800">
              <th className="py-1 pr-4 text-xs font-semibold text-slate-500 dark:text-slate-400">
                word
              </th>
              <th className="py-1 pr-4 text-xs font-semibold text-slate-500 dark:text-slate-400">
                learned by counting
              </th>
              <th className="py-1 text-xs font-semibold text-slate-500 dark:text-slate-400">
                read by the grammar
              </th>
            </tr>
          </thead>
          <tbody>
            {chosen.cuts.map((cut) => (
              <tr
                key={cut.word}
                className="border-b border-slate-100 last:border-0 dark:border-slate-800/60"
              >
                <td className="py-1.5 pr-4 font-mono text-slate-800 dark:text-slate-200">
                  {cut.word}
                </td>
                <td className="py-1.5 pr-4">
                  <span className="flex flex-wrap gap-1">
                    {cut.learned.map((piece, position) => (
                      <Chip
                        key={`${position}-${piece}`}
                        text={piece}
                        tone={cut.agree ? "quiet" : "missing"}
                      />
                    ))}
                  </span>
                </td>
                <td className="py-1.5">
                  <span className="flex flex-wrap gap-1">
                    {cut.written.map((piece, position) => (
                      <Chip
                        key={`${position}-${piece}`}
                        text={piece}
                        tone={position === 0 ? "stem" : "ending"}
                      />
                    ))}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
        A row in amber is one where the two disagree about where the word is
        jointed. Change the budget and the learned column changes; the written
        column cannot, because nothing in it was counted.
      </p>
    </div>
  );
}
