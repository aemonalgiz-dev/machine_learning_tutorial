"use client";

// What the eighteen sentences learn once the space is one of the symbols:
// the merges in the order they were learned, and the rows that hold a word
// beside the same word with a space in front of it.
//
// The API fits the corpus and returns every merge with the count that chose
// it, together with the rows that differ from another row only by the leading
// mark. The browser draws the first stretch of the ladder and the pairs. What
// to look at is how early the mark starts winning merges, and how much of the
// finished table is one word held twice.

import { useEffect, useState } from "react";
import {
  LearningView,
  fetchLearning,
  messageFor,
} from "@/lib/concepts/sentencepiece";
import { MARK, Piece, Stat } from "./sentencePieceParts";

const SHOWN_MERGES = 12;

export function MarkedVocabulary() {
  const [learning, setLearning] = useState<LearningView | null>(null);
  const [message, setMessage] = useState<string | null>(null);

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

  const rows = learning.sentence_merges
    .slice(0, SHOWN_MERGES)
    .map((pair, rank) => ({
      rank,
      pair,
      count: learning.sentence_merge_counts[rank],
      marked: pair.includes(MARK),
    }));

  return (
    <div className="rounded-lg border border-slate-200 p-3 dark:border-slate-800">
      <div className="mb-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
        <Stat label="merges learned" value={learning.sentence_n_merges} />
        <Stat
          label="of them touching the mark"
          value={learning.sentence_n_mark_merges}
        />
        <Stat
          label="first such merge"
          value={`rank ${learning.first_mark_merge_rank}`}
        />
      </div>

      <p className="mb-2 text-xs font-medium text-slate-500 dark:text-slate-400">
        The first {SHOWN_MERGES} merges, earliest at the top
      </p>
      <table className="w-full text-left text-xs">
        <thead className="text-slate-500 dark:text-slate-400">
          <tr>
            <th className="py-1 pr-3 font-medium">rank</th>
            <th className="py-1 pr-3 font-medium">joined</th>
            <th className="py-1 font-medium">seen</th>
          </tr>
        </thead>
        <tbody className="font-mono text-slate-700 dark:text-slate-300">
          {rows.map((row) => (
            <tr
              key={row.rank}
              className={`border-t border-slate-100 dark:border-slate-800/60 ${
                row.marked
                  ? "bg-indigo-50/60 dark:bg-indigo-950/30"
                  : undefined
              }`}
            >
              <td className="py-1 pr-3">{row.rank}</td>
              <td className="py-1 pr-3">{row.pair}</td>
              <td className="py-1">{row.count}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-4 border-t border-slate-100 pt-3 dark:border-slate-800">
        <p className="mb-2 text-xs text-slate-500 dark:text-slate-400">
          {learning.twin_rows.length} of the finished rows are a row the table
          already holds with a space in front of it. Each pair below is two
          rows, not one.
        </p>
        <div className="flex flex-wrap gap-x-4 gap-y-1.5">
          {learning.twin_rows.map((marked) => (
            <span key={marked} className="flex items-center gap-1">
              <Piece text={marked.slice(MARK.length)} tone="muted" />
              <Piece text={marked} tone="learned" />
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
