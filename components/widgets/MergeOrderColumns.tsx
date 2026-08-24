"use client";

// The same corpus merged under both rules, one column each.
//
// Both columns start from the identical spelling and differ only in which pair
// each step takes, so a difference between the two columns is a difference of
// rule. The rank at which they first part is marked, and each row carries the
// count the pair reached and the ratio it scored, so a reader can check either
// column against either figure. The API fits both orders; the browser draws
// them.

import { useEffect, useState } from "react";
import {
  MergeRow,
  ScoringView,
  fetchScoring,
  messageFor,
} from "@/lib/concepts/wordpiece";
import { Piece, Stat, formatScore } from "./wordPieceParts";

function Column({
  title,
  rows,
  divergence,
}: {
  title: string;
  rows: MergeRow[];
  divergence: number;
}) {
  return (
    <div>
      <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
        {title}
      </p>
      <div className="space-y-1">
        {rows.map((row) => (
          <div
            key={row.rank}
            className={`flex flex-wrap items-center gap-1.5 rounded px-1.5 py-1 ${
              row.rank === divergence
                ? "bg-amber-50 dark:bg-amber-950/30"
                : ""
            }`}
          >
            <span className="w-5 shrink-0 font-mono text-[11px] text-slate-400 dark:text-slate-500">
              {row.rank + 1}
            </span>
            <Piece text={row.left} />
            <span className="text-slate-400">+</span>
            <Piece text={row.right} />
            <span className="text-slate-400">&rarr;</span>
            <Piece text={row.merged} tone="learned" />
            <span className="ml-auto font-mono text-[11px] text-slate-500 dark:text-slate-400">
              {row.count} &middot; {formatScore(row.score)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function MergeOrderColumns({
  initialCorpus = "four_words",
}: {
  initialCorpus?: string;
}) {
  const [scoring, setScoring] = useState<ScoringView | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [corpus, setCorpus] = useState(initialCorpus);

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

  const order =
    scoring.orders.find((candidate) => candidate.corpus === corpus) ??
    scoring.orders[0];
  const parted = order.first_difference;

  return (
    <div className="rounded-lg border border-slate-200 p-3 dark:border-slate-800">
      <div className="flex flex-wrap gap-2">
        {scoring.orders.map((candidate) => (
          <button
            key={candidate.corpus}
            type="button"
            onClick={() => setCorpus(candidate.corpus)}
            className={`rounded-md border px-2.5 py-1 text-xs ${
              candidate.corpus === corpus
                ? "border-indigo-400 bg-indigo-50 text-indigo-900 dark:border-indigo-500 dark:bg-indigo-950/50 dark:text-indigo-200"
                : "border-slate-300 text-slate-600 dark:border-slate-700 dark:text-slate-400"
            }`}
          >
            {candidate.corpus_label}
          </button>
        ))}
      </div>

      <div className="mt-3 grid gap-5 sm:grid-cols-2">
        <Column
          title="Chosen by how often the pair occurs"
          rows={order.by_count}
          divergence={parted}
        />
        <Column
          title="Chosen by the ratio"
          rows={order.by_score}
          divergence={parted}
        />
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
        <Stat label="merges shown" value={order.by_score.length} />
        <Stat
          label="first rank they differ"
          value={parted < 0 ? "never" : parted + 1}
        />
        <Stat
          label="pieces in common"
          value={
            order.by_count.filter((row) =>
              order.by_score.some((other) => other.merged === row.merged),
            ).length
          }
        />
      </div>

      <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
        {parted < 0 ? (
          <>
            The two columns agree everywhere they are shown, which on these
            corpora does not happen.
          </>
        ) : (
          <>
            The two columns part at step {parted + 1}, where counting takes{" "}
            {order.by_count[parted].left} {order.by_count[parted].right} at{" "}
            {order.by_count[parted].count} and the ratio takes{" "}
            {order.by_score[parted].left} {order.by_score[parted].right} at{" "}
            {order.by_score[parted].count}. Everything after that is downstream
            of the one choice, since each step counts the corpus the step before
            left.
          </>
        )}
      </p>
    </div>
  );
}
