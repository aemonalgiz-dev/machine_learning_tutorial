"use client";

// What a vocabulary grown by counting buys, one row at a time.
//
// The API fits the twelve inflected forms with a merge-grown vocabulary at
// twelve sizes and reports, at each, the piece that size bought over the one
// below it, what the whole corpus then costs in pieces, and how three of the
// forms come apart. The browser draws the rungs and lets a reader step through
// them, so the order the pieces arrive in is visible rather than described.

import { useEffect, useState } from "react";
import { CountsView, fetchCounts, messageFor } from "@/lib/concepts/morfessor";
import { Pieces, Stat } from "./morfessorParts";

const STEMS = ["walk", "talk", "play"];

export function CountCutLadder() {
  const [counts, setCounts] = useState<CountsView | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [rung, setRung] = useState(3);

  useEffect(() => {
    (async () => {
      try {
        setCounts(await fetchCounts());
      } catch (error) {
        setMessage(messageFor(error));
      }
    })();
  }, []);

  if (!counts) {
    return (
      <p className="text-sm text-slate-500 dark:text-slate-400">
        {message ?? "…"}
      </p>
    );
  }

  const rungs = counts.ladder;
  const position = Math.min(rung, rungs.length - 1);
  const shown = rungs[position];
  const learned = rungs
    .slice(0, position + 1)
    .map((row) => row.learned)
    .filter((piece): piece is string => piece !== null);
  const stemsHeld = STEMS.filter((stem) => learned.includes(stem)).length;

  return (
    <div className="rounded-lg border border-slate-200 p-3 dark:border-slate-800">
      <label className="block text-xs text-slate-500 dark:text-slate-400">
        vocabulary size
        <input
          type="range"
          min={0}
          max={rungs.length - 1}
          step={1}
          value={position}
          onChange={(event) => setRung(Number(event.target.value))}
          className="mt-1 w-full accent-indigo-500"
        />
      </label>

      <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Stat label="rows in the table" value={shown.size} />
        <Stat label="pieces bought so far" value={learned.length} />
        <Stat label="the corpus, in pieces" value={shown.corpus_pieces} />
        <Stat label="stems held whole" value={`${stemsHeld} of 3`} />
      </div>

      <div className="mt-3">
        <p className="mb-1 text-xs text-slate-500 dark:text-slate-400">
          Bought, in the order the counts chose them.
        </p>
        {learned.length === 0 ? (
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Nothing yet; this is the alphabet with a word ending marked apart.
          </p>
        ) : (
          <Pieces
            pieces={learned}
            tone={stemsHeld === STEMS.length ? "highlight" : "learned"}
          />
        )}
      </div>

      <div className="mt-4 space-y-2 border-t border-slate-100 pt-3 dark:border-slate-800">
        {shown.cuts.map((cut) => (
          <div key={cut.word} className="flex flex-wrap items-center gap-2">
            <span className="w-20 shrink-0 font-mono text-xs text-slate-500 dark:text-slate-400">
              {cut.word}
            </span>
            <Pieces pieces={cut.pieces} tone="plain" />
            <span className="text-xs text-slate-400 dark:text-slate-500">
              {cut.n_pieces}
            </span>
          </div>
        ))}
      </div>

      <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
        The three stems arrive as the eighth, ninth and tenth pieces bought,
        after {counts.n_symbols} symbols and seven rows spent on al, alk, la and
        the rest. Everything before them cuts a stem somewhere inside it, and
        walking is read with its own stem split until row{" "}
        {rungs[rungs.length - 2].size}.
      </p>
    </div>
  );
}
