"use client";

// Re-estimation on the smallest corpus that has a choice in it, and then on the
// four words.
//
// The API runs the two steps on a one-word corpus whose every number can be
// checked by hand, and separately records what four rounds do to three pieces
// of the four-word model and to the likeliest spelling of a word that corpus
// never contained. The browser prints both. The second panel is the one worth
// watching, since it shows the model becoming certain.

import { useEffect, useState } from "react";
import {
  PruningView,
  fetchPruning,
  messageFor,
} from "@/lib/concepts/the-unigram-language-model";
import { Pieces, Piece, readProbability, readShare } from "./unigramModelParts";

export function EstimationRounds() {
  const [view, setView] = useState<PruningView | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setView(await fetchPruning());
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

  const worked = view.worked;
  const order = worked.start.map((entry) => entry.piece);
  const columns = [
    { label: "to begin with", probabilities: worked.start },
    ...worked.rounds.map((round) => ({
      label: `after round ${round.round_number}`,
      probabilities: round.probabilities,
    })),
  ];

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-slate-200 p-3 dark:border-slate-800">
        <p className="mb-2 text-xs font-medium text-slate-500 dark:text-slate-400">
          One word, {worked.word}, seen once, with three pieces at equal
          probability
        </p>
        <div className="mb-3 space-y-1">
          {worked.spellings.map((row) => (
            <div key={row.pieces.join("|")} className="flex items-center gap-2">
              <Pieces pieces={row.pieces} tone={row.is_best ? "learned" : "plain"} />
              <span className="font-mono text-xs text-slate-500 dark:text-slate-400">
                {readProbability(row.probability)}, which is{" "}
                {readShare(row.share)} of the word
              </span>
            </div>
          ))}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="text-slate-500 dark:text-slate-400">
              <tr>
                <th className="py-1 pr-3 font-medium">piece</th>
                {columns.map((column) => (
                  <th key={column.label} className="py-1 pr-3 font-medium">
                    {column.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="font-mono text-slate-700 dark:text-slate-300">
              {order.map((piece) => (
                <tr
                  key={piece}
                  className="border-t border-slate-100 dark:border-slate-800/60"
                >
                  <td className="py-1 pr-3">
                    <Piece text={piece} />
                  </td>
                  {columns.map((column) => (
                    <td key={column.label} className="py-1 pr-3">
                      {readProbability(
                        column.probabilities.find(
                          (entry) => entry.piece === piece,
                        )?.probability ?? 0,
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-2 text-[11px] text-slate-500 dark:text-slate-400">
          The expected counts behind the first column of numbers are{" "}
          {worked.expected
            .map((entry) => `${entry.count.toFixed(2)} for ${entry.piece}`)
            .join(", ")}
          , which add to {worked.expected_total.toFixed(2)}. Each new
          probability is a piece&rsquo;s share of that total.
        </p>
      </div>

      <div className="rounded-lg border border-slate-200 p-3 dark:border-slate-800">
        <p className="mb-2 text-xs font-medium text-slate-500 dark:text-slate-400">
          The same two steps on the four words, four rounds of them
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="text-slate-500 dark:text-slate-400">
              <tr>
                <th className="py-1 pr-3 font-medium">round</th>
                {view.concentration[0].probabilities.map((entry) => (
                  <th key={entry.piece} className="py-1 pr-3 font-medium">
                    <Piece text={entry.piece} />
                  </th>
                ))}
                <th className="py-1 pr-3 font-medium">likeliest cut of lowest</th>
                <th className="py-1 font-medium">its score, in nats</th>
              </tr>
            </thead>
            <tbody className="font-mono text-slate-700 dark:text-slate-300">
              {view.concentration.map((round) => (
                <tr
                  key={round.round_number}
                  className="border-t border-slate-100 dark:border-slate-800/60"
                >
                  <td className="py-1 pr-3">{round.round_number}</td>
                  {round.probabilities.map((entry) => (
                    <td key={entry.piece} className="py-1 pr-3">
                      {readProbability(entry.probability)}
                    </td>
                  ))}
                  <td className="py-1 pr-3">
                    <Pieces pieces={round.unseen_pieces} tone="plain" />
                  </td>
                  <td className="py-1">
                    {round.unseen_log_probability.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-2 text-[11px] text-slate-500 dark:text-slate-400">
          The corpus is four words repeated, so every occurrence is spelled best
          as one piece, and the pieces no occurrence needs lose their
          probability round by round. The word lowest is spelled the same way
          throughout and its score roughly doubles in the negative direction
          each round, which is the model becoming certain about a corpus that
          does not contain it.
        </p>
      </div>
    </div>
  );
}
