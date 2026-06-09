"use client";

// How many pieces of a corpus no longer hold the text the span they claim covers.
//
// The API splits one sentence and its quoted twin and reports, for every piece,
// the span it claims and the slice of source that span actually covers, then
// counts over a corpus of twenty-two sentences how many pieces the two differ
// for, with and without the treebank's bracket spellings. The browser draws the
// quoted sentence piece by piece with the rewritten ones marked and the source
// they stand for underneath, then the corpus counts.

import { useEffect, useState } from "react";
import { ApiError } from "@/lib/api";
import { CorpusResult, fetchCorpus } from "@/lib/concepts/penn-treebank-rules";
import { visible } from "./treebankFixtures";

export function RewritingCensus() {
  const [view, setView] = useState<CorpusResult | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setView(await fetchCorpus());
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

  const quoted = view.quoted;
  const census = view.census;

  return (
    <div>
      <div className="font-mono text-xs text-slate-500 dark:text-slate-400">
        {quoted.source}
      </div>

      <div className="mt-2 flex flex-wrap items-end gap-x-1 gap-y-2">
        {quoted.on_treebank.pieces.map((piece) => (
          <div
            key={`${piece.start}-${piece.end}`}
            className={`rounded-md border px-2 py-1 text-center ${
              piece.is_rewritten
                ? "border-amber-400 bg-amber-50 dark:border-amber-500/70 dark:bg-amber-950/25"
                : "border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900/40"
            }`}
          >
            <div className="whitespace-pre font-mono text-sm text-slate-900 dark:text-slate-100">
              {visible(piece.text)}
            </div>
            <div className="font-mono text-[11px] text-slate-500 dark:text-slate-400">
              [{piece.start}, {piece.end})
            </div>
            <div
              className={`font-mono text-[11px] ${
                piece.is_rewritten
                  ? "text-amber-700 dark:text-amber-400"
                  : "text-slate-400 dark:text-slate-600"
              }`}
            >
              {visible(piece.source)}
            </div>
          </div>
        ))}
      </div>

      <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
        The third line of each box is the source the span above it covers. For{" "}
        {quoted.on_treebank.n_pieces - quoted.on_treebank.n_rewritten} of the{" "}
        {quoted.on_treebank.n_pieces} pieces it repeats the first line exactly.
        For the {quoted.on_treebank.n_rewritten} amber ones it does not, and each
        of those spans is one character wide while the piece above it is two
        characters long.
      </p>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left dark:border-slate-800">
              <th className="py-2 pr-6 font-semibold text-slate-600 dark:text-slate-400">
                over {view.annotated.n_texts} sentences
              </th>
              <th className="py-2 font-semibold text-slate-600 dark:text-slate-400">
                count
              </th>
            </tr>
          </thead>
          <tbody>
            <Row label="pieces in all" value={`${census.n_pieces}`} />
            <Row
              label="pieces that are not the source their span covers"
              value={`${census.n_rewritten}`}
            />
            <Row
              label="share of the pieces that were rewritten"
              value={`${(census.share_rewritten * 100).toFixed(1)}%`}
            />
            <Row
              label="the same, with the bracket spellings switched on"
              value={`${census.n_rewritten_naming_brackets}`}
            />
            <Row
              label="pieces holding no letter and no digit"
              value={`${census.n_pieces_without_letter_or_digit}`}
            />
          </tbody>
        </table>
      </div>

      <div className="mt-2 flex flex-wrap gap-2">
        {census.by_piece.map((line) => (
          <span
            key={line}
            className="rounded bg-amber-100 px-2 py-1 font-mono text-xs text-amber-900 dark:bg-amber-950/40 dark:text-amber-300"
          >
            {line}
          </span>
        ))}
      </div>

      <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
        Every rewritten piece over these {view.annotated.n_texts} sentences is a
        quotation mark, and the two spellings turn up the same number of times
        because the corpus closes every quotation it opens. Switching the bracket
        spellings on raises the count from {census.n_rewritten} to{" "}
        {census.n_rewritten_naming_brackets}.
      </p>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <tr className="border-b border-slate-100 last:border-0 dark:border-slate-800/60">
      <td className="py-2 pr-6 text-slate-700 dark:text-slate-300">{label}</td>
      <td className="py-2 font-mono text-slate-900 dark:text-slate-100">
        {value}
      </td>
    </tr>
  );
}
