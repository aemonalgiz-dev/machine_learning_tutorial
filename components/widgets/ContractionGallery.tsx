"use client";

// Twelve words put to the seven listed spellings, and what each one does.
//
// The API splits every text by the pattern, by the annotation rules of the
// sibling page and by the pattern with the two later changes in it, and reports
// whether one of the seven leading branches fired at all. The browser draws the
// three readings side by side, marks the ones where no listed spelling matched,
// and then draws the two later changes on the texts that show them.

import { useEffect, useState } from "react";
import { ApiError } from "@/lib/api";
import {
  ContractionsView,
  fetchContractions,
} from "@/lib/concepts/the-pattern-language-models-use";
import { ChipRow, Stat } from "@/components/widgets/PieceChip";

export function ContractionGallery() {
  const [view, setView] = useState<ContractionsView | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setView(await fetchContractions());
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
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="text-[11px] text-slate-500 dark:text-slate-400">
          the seven listed spellings
        </span>
        {view.clitics.map((clitic) => (
          <span
            key={clitic}
            className="rounded bg-indigo-100 px-1.5 py-0.5 font-mono text-xs text-indigo-900 dark:bg-indigo-950/50 dark:text-indigo-200"
          >
            {clitic}
          </span>
        ))}
      </div>

      <div className="mt-3 space-y-1.5">
        {view.probes.map((probe) => (
          <div
            key={probe.text}
            className={`rounded-lg border px-3 py-2 ${
              probe.a_contraction_branch_fired
                ? "border-slate-200 dark:border-slate-800"
                : "border-amber-300 bg-amber-50/40 dark:border-amber-700 dark:bg-amber-950/20"
            }`}
          >
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <span className="font-mono text-xs text-slate-500 dark:text-slate-400">
                {probe.text}
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                {probe.a_contraction_branch_fired
                  ? "a listed spelling matched"
                  : "no listed spelling matched"}
              </span>
            </div>
            <div className="mt-1.5 grid gap-1 sm:grid-cols-2">
              <div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  the pattern, {probe.n_pieces} pieces
                </div>
                <ChipRow
                  pieces={probe.pieces}
                  tone={(piece) => (piece.startsWith(" ") ? "spaced" : "plain")}
                />
              </div>
              <div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  the annotation rules, {probe.on_annotation_rules.length} pieces
                </div>
                <ChipRow pieces={probe.on_annotation_rules} />
              </div>
            </div>
            <div className="mt-1.5 text-xs text-slate-600 dark:text-slate-400">
              {probe.look_at}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-3 grid grid-cols-2 gap-1.5 sm:grid-cols-3">
        <Stat label="listed spellings" value={`${view.n_clitics}`} />
        <Stat label="words put to them" value={`${view.n_probes}`} />
        <Stat
          label="where a listed spelling matched"
          value={`${view.n_firing}`}
        />
      </div>

      <div className="mt-4 space-y-2">
        {view.later_changes.map((change) => (
          <div
            key={change.became}
            className="rounded-lg border border-slate-200 px-3 py-2 dark:border-slate-800"
          >
            <div className="text-xs text-slate-600 dark:text-slate-400">
              {change.change}
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-2 font-mono text-xs">
              <span className="rounded bg-slate-100 px-1.5 py-0.5 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                {change.was}
              </span>
              <span className="text-slate-400">becomes</span>
              <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200">
                {change.became}
              </span>
            </div>
            <div className="mt-2 font-mono text-[11px] text-slate-500 dark:text-slate-400">
              {change.text}
            </div>
            <div className="mt-1 space-y-1">
              <ChipRow
                pieces={change.before}
                tone={(piece) => (piece.startsWith(" ") ? "spaced" : "plain")}
              />
              <ChipRow
                pieces={change.after}
                tone={(piece) => (piece.startsWith(" ") ? "spaced" : "good")}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
