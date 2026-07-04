"use client";

// The same setting scored on the same folds, and on different ones.
//
// Two copies of one neighbour count go through a single search whose
// splitter was handed over without a seed, and they come back with one score
// to the last bit, because the search draws a seed once and pins it for every
// candidate. Below them the same setting is cross-validated on six deals
// drawn under six seeds, which is what a search without the pin would have
// been comparing its candidates across. The API computes every score and the
// browser draws them.

import { useEffect, useState } from "react";
import { ApiError } from "@/lib/api";
import { SameFoldsOutcome, compareFoldDeals } from "@/lib/concepts/grid-search";
import { BUTTON_CLASS, TWELVE_PEOPLE, formatScore } from "./gridSearchFixtures";

const NEIGHBOUR_COUNT = 2;
const FOLD_COUNT = 3;

export function FoldPinningTable() {
  const [run, setRun] = useState(0);
  const [answer, setAnswer] = useState<SameFoldsOutcome | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const compared = await compareFoldDeals(
          TWELVE_PEOPLE,
          NEIGHBOUR_COUNT,
          FOLD_COUNT,
        );
        if (cancelled) return;
        setAnswer(compared);
        setMessage(null);
      } catch (error) {
        if (cancelled) return;
        if (error instanceof ApiError) setMessage(error.message);
        else setMessage("Something went wrong.");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [run]);

  return (
    <div className="my-4">
      <div className="flex flex-wrap items-center gap-3 pb-3 text-sm text-slate-600 dark:text-slate-300">
        <button onClick={() => setRun((current) => current + 1)} className={BUTTON_CLASS}>
          Search again
        </button>
        <span>
          two neighbours, twice over, on the nine searched people in three
          folds
        </span>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-lg border border-indigo-200 p-3 dark:border-indigo-900">
          <p className="mb-2 text-sm font-medium text-indigo-700 dark:text-indigo-300">
            One search, two copies of k = 2
          </p>
          <div className="grid grid-cols-2 gap-2">
            <Stat label="first copy" value={answer ? formatScore(answer.pinned_scores[0], 16) : "…"} />
            <Stat label="second copy" value={answer ? formatScore(answer.pinned_scores[1], 16) : "…"} />
          </div>
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            {answer
              ? answer.scores_tie
                ? "Equal to the last bit, and the deal itself was drawn fresh for this search."
                : "The two copies differ, which the pinned deal is meant to make impossible."
              : "…"}
          </p>
        </div>
        <div className="rounded-lg border border-amber-200 p-3 dark:border-amber-900">
          <p className="mb-2 text-sm font-medium text-amber-700 dark:text-amber-300">
            The same k = 2 on six fresh deals
          </p>
          <div className="grid grid-cols-3 gap-2">
            {answer
              ? answer.fresh_deal_scores.map((score, index) => (
                  <Stat
                    key={answer.fresh_deal_seeds[index]}
                    label={`seed ${answer.fresh_deal_seeds[index]}`}
                    value={formatScore(score)}
                  />
                ))
              : Array.from({ length: 6 }, (_, index) => (
                  <Stat key={index} label="…" value="…" />
                ))}
          </div>
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            {answer
              ? `Highest less lowest across the six deals: ${formatScore(answer.fresh_deal_spread)}.`
              : "…"}
          </p>
        </div>
      </div>

      {message && (
        <p className="mt-2 text-sm text-rose-600 dark:text-rose-400">{message}</p>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-slate-100 px-2 py-1.5 dark:bg-slate-800">
      <div className="text-[11px] text-slate-500 dark:text-slate-400">{label}</div>
      <div className="break-all font-mono text-sm font-semibold text-slate-900 dark:text-slate-100">
        {value}
      </div>
    </div>
  );
}
