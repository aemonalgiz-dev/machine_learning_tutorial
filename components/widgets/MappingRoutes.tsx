"use client";

// Two vocabularies over the same four words, and every mapping between them.
//
// The API fits the four words twice, at three merges and at ten, and asks the
// library which tokens of one are made of which tokens of the other. Both
// directions are here because they are not the same problem: the smaller
// vocabulary is a prefix of the larger one, so shrinking copies everything and
// growing has to read seven tokens again. The browser only draws.

import { useEffect, useState } from "react";
import {
  MappingRow,
  MoveSummary,
  WorkedView,
  fetchWorked,
  messageFor,
} from "@/lib/concepts/moving-a-vocabulary";
import { Pieces, RouteChip, Stat } from "./movingAVocabularyParts";

type Direction = "growing" | "shrinking";

export function MappingRoutes() {
  const [worked, setWorked] = useState<WorkedView | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [direction, setDirection] = useState<Direction>("growing");

  useEffect(() => {
    (async () => {
      try {
        setWorked(await fetchWorked());
      } catch (error) {
        setMessage(messageFor(error));
      }
    })();
  }, []);

  if (!worked) {
    return (
      <p className="text-sm text-slate-500 dark:text-slate-400">
        {message ?? "…"}
      </p>
    );
  }

  const growing = direction === "growing";
  const rows: MappingRow[] = growing
    ? worked.smaller_to_larger
    : worked.larger_to_smaller;
  const summary: MoveSummary = growing
    ? worked.smaller_to_larger_summary
    : worked.larger_to_smaller_summary;

  return (
    <div className="rounded-lg border border-slate-200 p-3 dark:border-slate-800">
      <div className="mb-3 flex flex-wrap gap-2">
        {(["growing", "shrinking"] as Direction[]).map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => setDirection(key)}
            className={`rounded-md px-2.5 py-1 text-xs font-medium transition ${
              direction === key
                ? "bg-indigo-600 text-white"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
            }`}
          >
            {key === "growing"
              ? "three merges to ten"
              : "ten merges back to three"}
          </button>
        ))}
      </div>

      <div className="mb-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Stat label="new tokens" value={summary.n_target_tokens} />
        <Stat label="copied exactly" value={summary.n_copied} />
        <Stat label="read again" value={summary.n_rebuilt} />
        <Stat
          label="rows averaged when read again"
          value={
            summary.n_rebuilt === 0
              ? "none"
              : summary.mean_pieces_when_rebuilt.toFixed(2)
          }
        />
      </div>

      <div className="max-h-80 overflow-y-auto">
        <table className="w-full text-left text-xs">
          <thead className="text-slate-500 dark:text-slate-400">
            <tr>
              <th className="py-1 pr-3 font-medium">new token</th>
              <th className="py-1 pr-3 font-medium">the text it stands for</th>
              <th className="py-1 pr-3 font-medium">rule</th>
              <th className="py-1 font-medium">old rows</th>
            </tr>
          </thead>
          <tbody className="text-slate-700 dark:text-slate-300">
            {rows.map((row) => (
              <tr
                key={row.target_id}
                className="border-t border-slate-100 align-top dark:border-slate-800/60"
              >
                <td className="py-1 pr-3">
                  <Pieces
                    pieces={[row.target_token]}
                    tone={row.route === "copied" ? "highlight" : "plain"}
                  />
                </td>
                <td className="py-1 pr-3 font-mono text-slate-500 dark:text-slate-400">
                  {row.decoded}
                </td>
                <td className="py-1 pr-3">
                  <RouteChip route={row.route} />
                </td>
                <td className="py-1">
                  <Pieces pieces={row.source_tokens} tone="muted" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
        {growing
          ? `Fourteen tokens are copied because the smaller vocabulary holds their spellings already, and seven are read again. One of the seven is the piece made of an e and a w, whose reading comes back carrying an end-of-word marker the piece never had.`
          : `Nothing has to be read again in this direction, because every token of the three-merge vocabulary is a token of the ten-merge one as well.`}
      </p>
    </div>
  );
}
