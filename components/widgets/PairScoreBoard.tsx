"use client";

// Every candidate pair on the four-word corpus, orderable by either figure.
//
// The same eleven pairs are shown throughout; switching the ordering switches
// which pair sits at the top, and the top row is the pair a fit would take.
// The two counts beside each pair are how often each half occurs anywhere,
// which is the whole of what the score divides by. The API counts and scores;
// the browser sorts and draws.

import { useEffect, useState } from "react";
import {
  PairScore,
  ScoringView,
  fetchScoring,
  messageFor,
} from "@/lib/concepts/wordpiece";
import { Piece, formatScore } from "./wordPieceParts";

type Ordering = "count" | "score";

function sorted(pairs: PairScore[], ordering: Ordering): PairScore[] {
  return [...pairs].sort((one, other) =>
    ordering === "count"
      ? other.count - one.count || one.left.localeCompare(other.left)
      : other.score - one.score || one.left.localeCompare(other.left),
  );
}

export function PairScoreBoard() {
  const [scoring, setScoring] = useState<ScoringView | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [ordering, setOrdering] = useState<Ordering>("count");

  useEffect(() => {
    (async () => {
      try {
        setScoring(await fetchScoring());
      } catch (error) {
        setMessage(messageFor(error));
      }
    })();
  }, []);

  if (!scoring) {
    return (
      <p className="text-sm text-slate-500 dark:text-slate-400">
        {message ?? "…"}
      </p>
    );
  }

  const rows = sorted(scoring.pairs, ordering);
  const winner = rows[0];
  const runnerUp = rows[1];
  const tied = winner.score === runnerUp.score && winner.count === runnerUp.count;

  return (
    <div className="rounded-lg border border-slate-200 p-3 dark:border-slate-800">
      <div className="flex flex-wrap gap-2">
        {(["count", "score"] as const).map((choice) => (
          <button
            key={choice}
            type="button"
            onClick={() => setOrdering(choice)}
            className={`rounded-md border px-2.5 py-1 text-xs ${
              ordering === choice
                ? "border-indigo-400 bg-indigo-50 text-indigo-900 dark:border-indigo-500 dark:bg-indigo-950/50 dark:text-indigo-200"
                : "border-slate-300 text-slate-600 dark:border-slate-700 dark:text-slate-400"
            }`}
          >
            {choice === "count"
              ? "Order by how often the pair occurs"
              : "Order by the ratio"}
          </button>
        ))}
      </div>

      <div className="mt-3 overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left dark:border-slate-800">
              <th className="py-1.5 pr-4 text-xs font-semibold text-slate-500 dark:text-slate-400">
                pair
              </th>
              <th className="py-1.5 pr-4 text-xs font-semibold text-slate-500 dark:text-slate-400">
                together
              </th>
              <th className="py-1.5 pr-4 text-xs font-semibold text-slate-500 dark:text-slate-400">
                each half, anywhere
              </th>
              <th className="py-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400">
                the ratio
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((pair, position) => (
              <tr
                key={`${pair.left}+${pair.right}`}
                className={`border-b border-slate-100 last:border-0 dark:border-slate-800/60 ${
                  position === 0 ? "bg-indigo-50/60 dark:bg-indigo-950/30" : ""
                }`}
              >
                <td className="py-1.5 pr-4">
                  <span className="flex items-center gap-1">
                    <Piece
                      text={pair.left}
                      tone={position === 0 ? "learned" : "plain"}
                    />
                    <Piece
                      text={pair.right}
                      tone={position === 0 ? "learned" : "plain"}
                    />
                  </span>
                </td>
                <td className="py-1.5 pr-4 font-mono text-slate-800 dark:text-slate-200">
                  {pair.count}
                </td>
                <td className="py-1.5 pr-4 font-mono text-slate-500 dark:text-slate-400">
                  {pair.left_count} &times; {pair.right_count}
                </td>
                <td className="py-1.5 font-mono text-slate-800 dark:text-slate-200">
                  {formatScore(pair.score)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
        {ordering === "count" ? (
          <>
            Ordered this way the top pair is {winner.left} {winner.right}, seen{" "}
            {winner.count} times, and its halves are seen {winner.left_count} and{" "}
            {winner.right_count} times on their own. Its ratio is{" "}
            {formatScore(winner.score)}, which is{" "}
            {rows.filter((pair) => pair.score > winner.score).length} places from
            the top of the other ordering.
          </>
        ) : (
          <>
            Ordered this way the top pair is {winner.left} {winner.right}, seen
            only {winner.count} times, but its halves are seen{" "}
            {winner.left_count} and {winner.right_count} times in total, which is
            to say never anywhere else.{" "}
            {tied
              ? `It ties exactly with ${runnerUp.left} ${runnerUp.right} at ${formatScore(runnerUp.score)}.`
              : ""}
          </>
        )}
      </p>
    </div>
  );
}
