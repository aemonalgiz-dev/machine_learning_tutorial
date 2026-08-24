"use client";

// Fifteen short forms put to the treebank rules, nine cut and six left whole.
//
// The API splits each of the fifteen texts and reports the pieces with their
// spans, whether the text was cut at all, and how many of its pieces no longer
// hold the source their span names. The browser lists them in the order the API
// sends, which runs from the case the rules were written for to the cases
// nobody wrote a clause for, and marks each row as cut or left whole.

import { useEffect, useState } from "react";
import { ApiError } from "@/lib/api";
import {
  ContractionsView,
  fetchContractions,
} from "@/lib/concepts/penn-treebank-rules";

export function ContractionTable() {
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
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left dark:border-slate-800">
              <th className="py-2 pr-4 font-semibold text-slate-600 dark:text-slate-400">
                the text
              </th>
              <th className="py-2 pr-4 font-semibold text-slate-600 dark:text-slate-400">
                the pieces
              </th>
              <th className="py-2 font-semibold text-slate-600 dark:text-slate-400">
                what to look at
              </th>
            </tr>
          </thead>
          <tbody>
            {view.probes.map((probe) => (
              <tr
                key={probe.text}
                className="border-b border-slate-100 align-top last:border-0 dark:border-slate-800/60"
              >
                <td className="py-2 pr-4 font-mono text-slate-900 dark:text-slate-100">
                  {probe.text}
                </td>
                <td className="py-2 pr-4">
                  <div className="flex flex-wrap gap-1">
                    {probe.pieces.map((piece) => (
                      <span
                        key={`${piece.start}-${piece.end}`}
                        className={`rounded px-1.5 py-0.5 font-mono text-xs ${
                          piece.is_rewritten
                            ? "bg-amber-100 text-amber-900 dark:bg-amber-950/40 dark:text-amber-300"
                            : "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200"
                        }`}
                      >
                        {piece.text}
                      </span>
                    ))}
                  </div>
                  <div className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                    {probe.is_cut ? "cut" : "left whole"}
                  </div>
                </td>
                <td className="py-2 text-slate-600 dark:text-slate-400">
                  {probe.look_at}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
        Of the {view.n_probes} texts the rules cut {view.n_cut} and leave{" "}
        {view.n_left_whole} whole, and nothing in the answer distinguishes a
        text that was examined and left alone from one that no clause covers. An
        amber piece is one whose text is not the character it came from, and only
        the quoted row has any. The rules take {view.n_clitic_endings} different
        endings off the back of a run and carry {view.n_fixed_forms} whole forms
        by name, and a text has to match one of those to be cut at all.
      </p>
    </div>
  );
}
