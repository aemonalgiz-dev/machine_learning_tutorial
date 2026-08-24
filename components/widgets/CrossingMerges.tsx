"use client";

// What the merging loop does to the eighteen sentences when nothing is cut at
// the marks and a pair may join across a space.
//
// The API runs the same counting arithmetic over whole lines rather than over
// units, and reports each merge with the count that chose it and whether the
// piece it produced holds a mark anywhere but at its front. The browser draws
// the ladder and picks those out. What to look at is the very first row.

import { useEffect, useState } from "react";
import {
  LimitsView,
  fetchLimits,
  messageFor,
} from "@/lib/concepts/sentencepiece";
import { MARK, Stat } from "./sentencePieceParts";

const SHOWN = 22;

export function CrossingMerges() {
  const [limits, setLimits] = useState<LimitsView | null>(null);
  const [message, setMessage] = useState<string | null>(null);

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

  return (
    <div className="rounded-lg border border-slate-200 p-3 dark:border-slate-800">
      <div className="mb-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
        <Stat label="merges walked" value={limits.n_uncut} />
        <Stat
          label="pieces holding a space inside"
          value={limits.n_uncut_crossing}
        />
        <Stat
          label="first such piece"
          value={`rank ${limits.first_uncut_crossing_rank}`}
        />
      </div>

      <table className="w-full text-left text-xs">
        <thead className="text-slate-500 dark:text-slate-400">
          <tr>
            <th className="py-1 pr-3 font-medium">rank</th>
            <th className="py-1 pr-3 font-medium">joined</th>
            <th className="py-1 pr-3 font-medium">became</th>
            <th className="py-1 font-medium">seen</th>
          </tr>
        </thead>
        <tbody className="font-mono text-slate-700 dark:text-slate-300">
          {limits.uncut_merges.slice(0, SHOWN).map((merge) => (
            <tr
              key={merge.rank}
              className={`border-t border-slate-100 dark:border-slate-800/60 ${
                merge.crosses
                  ? "bg-amber-50/70 dark:bg-amber-950/25"
                  : undefined
              }`}
            >
              <td className="py-1 pr-3">{merge.rank}</td>
              <td className="py-1 pr-3">
                {merge.left} + {merge.right}
              </td>
              <td className="py-1 pr-3">{merge.merged}</td>
              <td className="py-1">{merge.count}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
        The shaded rows hold a {MARK} somewhere other than at the front, so
        each is a piece that reaches past the end of one word. The first is the
        first merge of all, a letter joined to the space that follows it, and
        by rank 20 the piece is the ending of one word, a space, and the whole
        of the next.
      </p>
    </div>
  );
}
