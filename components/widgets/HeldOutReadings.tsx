"use client";

// One sentence none of the eighteen contained, read by three fitted tables.
//
// The API fits the eighteen sentences twice, once at each of two settings of
// the multiplier on the text half of the cost, and grows a third table of the
// same size by joining the commonest adjacent pair; it then encodes the
// running sentence with each, glues the pieces back, and says whether what
// came out is what went in. The browser stacks the three so the trade is
// visible in one place.

import { useEffect, useState } from "react";
import { CountsView, fetchCounts, messageFor } from "@/lib/concepts/morfessor";
import { Pieces } from "./morfessorParts";

function labelFor(method: string, weight: number | null): string {
  if (method === "commonest_pair") {
    return "pieces grown by joining the commonest pair";
  }
  return `pieces chosen to shorten the description, text weighted ${weight}`;
}

export function HeldOutReadings() {
  const [counts, setCounts] = useState<CountsView | null>(null);
  const [message, setMessage] = useState<string | null>(null);

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

  return (
    <div className="rounded-lg border border-slate-200 p-3 dark:border-slate-800">
      <p className="mb-3 font-mono text-sm text-slate-700 dark:text-slate-300">
        {counts.sentence}
      </p>
      <div className="space-y-4">
        {counts.readings.map((reading) => (
          <div key={`${reading.method}-${reading.weight}`}>
            <p className="mb-1 text-xs text-slate-500 dark:text-slate-400">
              {labelFor(reading.method, reading.weight)}
            </p>
            <p className="mb-1 font-mono text-[11px] text-slate-500 dark:text-slate-400">
              {reading.n_rows} rows · {reading.corpus_pieces} pieces for the
              eighteen sentences · {reading.n_pieces} for this one ·{" "}
              {reading.characters_held} of {reading.n_characters} characters
              spellable on their own
            </p>
            <Pieces
              pieces={reading.pieces}
              tone={reading.n_unknown === 0 ? "highlight" : "plain"}
            />
          </div>
        ))}
      </div>
      <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
        The first table describes the eighteen sentences in{" "}
        {counts.readings[0].corpus_pieces} pieces where the third needs{" "}
        {counts.readings[2].corpus_pieces}, and hands back{" "}
        {counts.readings[0].n_unknown} stand-ins on a sentence it never saw
        where the third hands back {counts.readings[2].n_unknown}. Only the
        middle one gives the sentence back unchanged when its pieces are glued.
      </p>
    </div>
  );
}
