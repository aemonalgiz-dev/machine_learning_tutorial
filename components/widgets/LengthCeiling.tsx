"use client";

// One vocabulary size under six ceilings on how long a piece may be.
//
// The API fits the eighteen sentences six times at the same size, changing only
// the longest piece a candidate may be, and reports what the corpus costs, what
// the held-out sentence costs, and how many rows went on whole words the corpus
// saw once. The browser lays the six fits out as a table with the two readings
// side by side, because they do not agree about which ceiling is best.

import { useEffect, useState } from "react";
import {
  CappingView,
  fetchCapping,
  messageFor,
} from "@/lib/concepts/greedy-coverage";
import { END_OF_WORD } from "./greedyCoverageParts";

function plain(piece: string) {
  return piece.endsWith(END_OF_WORD)
    ? `${piece.slice(0, -END_OF_WORD.length)}⎵`
    : piece;
}

export function LengthCeiling() {
  const [view, setView] = useState<CappingView | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setView(await fetchCapping());
      } catch (error) {
        setMessage(messageFor(error));
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

  const bestSentence = Math.min(...view.rows.map((row) => row.sentence_pieces));
  const bestCorpus = Math.min(...view.rows.map((row) => row.corpus_pieces));

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left dark:border-slate-800">
              <th className="py-1.5 pr-4 font-semibold text-slate-600 dark:text-slate-400">
                longest piece
              </th>
              <th className="py-1.5 pr-4 font-semibold text-slate-600 dark:text-slate-400">
                the corpus
              </th>
              <th className="py-1.5 pr-4 font-semibold text-slate-600 dark:text-slate-400">
                the sentence
              </th>
              <th className="py-1.5 pr-4 font-semibold text-slate-600 dark:text-slate-400">
                rows on words seen once
              </th>
              <th className="py-1.5 font-semibold text-slate-600 dark:text-slate-400">
                first pieces chosen
              </th>
            </tr>
          </thead>
          <tbody>
            {view.rows.map((row) => (
              <tr
                key={row.cap}
                className="border-b border-slate-100 last:border-0 dark:border-slate-800/60"
              >
                <td className="py-1.5 pr-4 font-mono text-slate-800 dark:text-slate-200">
                  {row.cap} symbols
                </td>
                <td
                  className={`py-1.5 pr-4 font-mono ${
                    row.corpus_pieces === bestCorpus
                      ? "font-semibold text-indigo-700 dark:text-indigo-300"
                      : "text-slate-700 dark:text-slate-300"
                  }`}
                >
                  {row.corpus_pieces}
                </td>
                <td
                  className={`py-1.5 pr-4 font-mono ${
                    row.sentence_pieces === bestSentence
                      ? "font-semibold text-emerald-700 dark:text-emerald-300"
                      : "text-slate-700 dark:text-slate-300"
                  }`}
                >
                  {row.sentence_pieces}
                </td>
                <td className="py-1.5 pr-4 font-mono text-slate-700 dark:text-slate-300">
                  {row.once_seen_rows}
                </td>
                <td className="py-1.5 font-mono text-xs text-slate-600 dark:text-slate-400">
                  {row.first_pieces.map(plain).join(" ")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
        Every row asked for {view.size} tokens and differs only in how long a
        candidate may be. Indigo marks the shortest reading of the corpus the
        pieces were chosen from, green the shortest reading of the sentence they
        were not, and the two are in different rows.
      </p>
    </div>
  );
}
