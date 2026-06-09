"use client";

// The split reading assembled one question at a time.
//
// The API grows the lone tree on the site's crowd and hands back every split
// in the order a reader steps through them, breadth first from the root,
// each with the rows that reached it, the impurity its question removed,
// and the credit that is their product. The slider adds the splits to the
// ledger one by one. The bars are the running credit each feature has
// collected so far, scaled so the tree's final total fills the width, and
// the figures beside them are the running shares, which are those credits
// divided by their running sum. The last position is the model's own
// reading. Every split, credit and share is the library's through the API;
// the browser only keeps the running total in view.

import { useEffect, useState } from "react";
import {
  ApiError,
  Ledger,
  fetchLedger,
} from "@/lib/concepts/feature-importance";
import { CROWD, fillFor, labelFor } from "./featureImportanceFixtures";

const BAR_VIEW = { width: 360, height: 96 };
const LABEL_WIDTH = 64;
const VALUE_WIDTH = 96;
const BAR_HEIGHT = 24;
const ROW_GAP = 16;
const TOP = 12;
const BAR_SPAN = BAR_VIEW.width - LABEL_WIDTH - VALUE_WIDTH;

export function CreditLedger({ maxDepth }: { maxDepth?: number }) {
  const [ledger, setLedger] = useState<Ledger | null>(null);
  const [added, setAdded] = useState(0);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const answer = await fetchLedger(CROWD, maxDepth === undefined ? {} : { maxDepth });
        setLedger(answer);
        setAdded(answer.tree.n_splits);
      } catch (error) {
        if (error instanceof ApiError) setMessage(error.message);
        else setMessage("Something went wrong.");
      }
    })();
  }, [maxDepth]);

  if (!ledger) {
    return <p className="text-sm text-slate-500 dark:text-slate-400">{message ?? "…"}</p>;
  }

  const tree = ledger.tree;
  const current = added > 0 ? tree.splits[added - 1] : null;
  const runningCredits = current
    ? current.running_credits
    : ledger.feature_names.map((name) => ({ name, credit: 0 }));
  const runningShares = current
    ? current.running_shares
    : ledger.feature_names.map((name) => ({ name, share: 0 }));
  const runningTotal = runningCredits.reduce((total, one) => total + one.credit, 0);

  return (
    <div>
      <div className="flex flex-wrap items-center gap-4 pb-3 text-sm text-slate-600 dark:text-slate-300">
        <label className="flex items-center gap-2">
          Splits added
          <input
            type="range"
            min={0}
            max={tree.n_splits}
            value={added}
            onChange={(event) => setAdded(Number(event.target.value))}
            className="w-44 accent-indigo-600"
          />
          <span className="w-10 font-mono text-sm">
            {added} of {tree.n_splits}
          </span>
        </label>
        <button
          onClick={() => setAdded((count) => Math.min(tree.n_splits, count + 1))}
          className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
        >
          Add the next split
        </button>
        <button
          onClick={() => setAdded(0)}
          className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
        >
          Clear the ledger
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-5">
        <div className="sm:col-span-3">
          <svg
            viewBox={`0 0 ${BAR_VIEW.width} ${BAR_VIEW.height}`}
            className="w-full select-none rounded-lg bg-slate-50 dark:bg-slate-950"
          >
            {runningCredits.map((entry, index) => {
              const y = TOP + index * (BAR_HEIGHT + ROW_GAP);
              const middle = y + BAR_HEIGHT / 2 + 4;
              const width = (entry.credit / tree.credit_total) * BAR_SPAN;
              return (
                <g key={entry.name}>
                  <text
                    x={LABEL_WIDTH - 8}
                    y={middle}
                    textAnchor="end"
                    className={
                      "text-xs " +
                      (current && current.feature === entry.name
                        ? "fill-slate-900 font-semibold dark:fill-slate-100"
                        : "fill-slate-500 font-medium dark:fill-slate-400")
                    }
                  >
                    {labelFor(entry.name)}
                  </text>
                  <rect
                    x={LABEL_WIDTH}
                    y={y}
                    width={BAR_SPAN}
                    height={BAR_HEIGHT}
                    rx={3}
                    className="fill-slate-200 dark:fill-slate-800"
                  />
                  {entry.credit > 0 && (
                    <rect
                      x={LABEL_WIDTH}
                      y={y}
                      width={width}
                      height={BAR_HEIGHT}
                      rx={3}
                      className={fillFor(entry.name)}
                    />
                  )}
                  <text
                    x={LABEL_WIDTH + BAR_SPAN + 8}
                    y={middle}
                    className="fill-slate-700 font-mono text-xs dark:fill-slate-200"
                  >
                    {`${entry.credit.toFixed(3)}  ${runningShares[index].share.toFixed(3)}`}
                  </text>
                </g>
              );
            })}
          </svg>
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            Bars are running credit, scaled so the finished tree&rsquo;s total
            of {tree.credit_total.toFixed(3)} fills the width. Beside each bar,
            the credit so far and its share of the running total.
          </p>
          <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
            <Stat
              label="Just added"
              value={current ? `${labelFor(current.feature)} < ${current.threshold}` : "nothing yet"}
            />
            <Stat
              label="Rows × gain"
              value={current ? `${current.n_rows} × ${current.gain.toFixed(4)}` : "…"}
            />
            <Stat label="Credit added" value={current ? current.credit.toFixed(4) : "0"} />
            <Stat label="Running total" value={runningTotal.toFixed(4)} />
          </div>
        </div>

        <div className="sm:col-span-2">
          <ol className="space-y-1 text-xs">
            {tree.splits.map((split) => {
              const state = split.order < added ? "past" : split.order === added ? "current" : "future";
              return (
                <li
                  key={split.order}
                  className={
                    "rounded-md px-2 py-1 font-mono " +
                    (state === "current"
                      ? "bg-indigo-50 text-slate-900 ring-1 ring-indigo-300 dark:bg-indigo-950/40 dark:text-slate-100 dark:ring-indigo-700"
                      : state === "past"
                        ? "text-slate-700 dark:text-slate-300"
                        : "text-slate-400 dark:text-slate-600")
                  }
                >
                  <span className="mr-1 text-slate-400 dark:text-slate-500">{split.order}.</span>
                  {labelFor(split.feature)} &lt; {split.threshold}, depth {split.depth}, {split.n_rows} rows × {split.gain.toFixed(3)} = {split.credit.toFixed(3)}
                </li>
              );
            })}
          </ol>
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            Numbered breadth first from the root, which is the order the
            decision-tree page steps through them. The tree reaches depth {tree.depth} with {tree.n_leaves} leaves.
          </p>
        </div>
      </div>

      {message && (
        <p className="mt-3 text-sm text-amber-600 dark:text-amber-400">{message}</p>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-slate-100 px-2 py-1.5 dark:bg-slate-800">
      <div className="text-[11px] text-slate-500 dark:text-slate-400">{label}</div>
      <div className="font-mono text-sm font-semibold text-slate-900 dark:text-slate-100">{value}</div>
    </div>
  );
}
