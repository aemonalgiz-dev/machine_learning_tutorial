"use client";

// The twelve alternatives of the pattern, read one at a time.
//
// The API lists each branch with what it reads in ordinary words, splits the
// six-sentence notebook and credits every one of its pieces to the branch that
// produced it, and splits one text with doubled spacing twice, once with the
// eleventh branch and once without it. The browser draws the list with a bar
// for each branch's share, and then the two readings of the doubled spacing
// side by side.

import { useEffect, useState } from "react";
import { ApiError } from "@/lib/api";
import {
  BranchesView,
  fetchBranches,
} from "@/lib/concepts/the-pattern-language-models-use";
import { ChipRow, Stat } from "@/components/widgets/PieceChip";

export function BranchReader() {
  const [view, setView] = useState<BranchesView | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setView(await fetchBranches());
      } catch (error) {
        setMessage(
          error instanceof ApiError ? error.message : "Something went wrong.",
        );
      }
    })();
  }, []);

  if (!view) {
    return (
      <p className="text-sm text-slate-500 dark:text-slate-400">
        {message ?? "…"}
      </p>
    );
  }

  return (
    <div>
      <div className="overflow-x-auto rounded-lg border border-slate-200 px-3 py-2 font-mono text-[11px] break-all text-slate-700 dark:border-slate-800 dark:text-slate-300">
        {view.pattern_source}
      </div>

      <div className="mt-3 space-y-1">
        {view.branches.map((branch) => (
          <div
            key={branch.position}
            className={`rounded-lg border px-3 py-1.5 ${
              branch.n_claimed
                ? "border-slate-200 dark:border-slate-800"
                : "border-dashed border-slate-200 opacity-70 dark:border-slate-800"
            }`}
          >
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <span className="font-mono text-xs text-slate-800 dark:text-slate-200">
                {branch.source}
              </span>
              <span className="font-mono text-[11px] text-slate-500 dark:text-slate-400">
                {branch.n_claimed} of {view.n_pieces}
              </span>
            </div>
            <div className="mt-1 h-1 w-full rounded bg-slate-100 dark:bg-slate-800">
              <div
                className="h-1 rounded bg-indigo-400 dark:bg-indigo-500"
                style={{ width: `${Math.max(branch.share_claimed * 100, branch.n_claimed ? 1 : 0)}%` }}
              />
            </div>
            <div className="mt-1 text-xs text-slate-600 dark:text-slate-400">
              {branch.reads}
            </div>
            {branch.examples.length > 0 && (
              <div className="mt-1">
                <ChipRow pieces={branch.examples} />
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-3 grid grid-cols-2 gap-1.5 sm:grid-cols-4">
        <Stat label="branches" value={`${view.n_branches}`} />
        <Stat
          label="branches six sentences reached"
          value={`${view.n_branches_used}`}
        />
        <Stat label="pieces credited" value={`${view.n_pieces}`} />
        <Stat
          label="claimed by the letters branch"
          value={`${view.branches[7].n_claimed}`}
        />
      </div>

      <div className="mt-4 rounded-lg border border-slate-200 px-3 py-2 dark:border-slate-800">
        <div className="text-[11px] text-slate-500 dark:text-slate-400">
          one text with doubled spacing, read with the eleventh branch and
          without it
        </div>
        <div className="mt-1 font-mono text-xs text-slate-500 dark:text-slate-400">
          {JSON.stringify(view.held_space.text)}
        </div>
        <div className="mt-2 space-y-2">
          <div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400">
              with it, {view.held_space.n_with} pieces
            </div>
            <ChipRow
              pieces={view.held_space.with_the_branch}
              tone={(piece) => (piece.startsWith(" ") ? "spaced" : "plain")}
            />
          </div>
          <div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400">
              without it, {view.held_space.n_without} pieces
            </div>
            <ChipRow
              pieces={view.held_space.without_the_branch}
              tone={(piece) => (piece.startsWith(" ") ? "spaced" : "plain")}
            />
          </div>
        </div>
        <div className="mt-2 text-xs text-slate-600 dark:text-slate-400">
          The same number of pieces both times. What changes is which piece owns
          the last space, and therefore whether the word after a doubled space is
          the same piece as the word after a single one.
        </div>
      </div>
    </div>
  );
}
