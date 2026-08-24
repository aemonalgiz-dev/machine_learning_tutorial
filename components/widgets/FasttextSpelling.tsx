"use client";

// Eight words no sentence holds, and which of the two lists their spelling put
// them in.
//
// Each row is one word with two bars, how alike it came out to the twenty verb
// forms and to the eleven money words. Choosing a word shows how long its
// vector came out and which rows of the table it reached, which is what
// separates a word the corpus really did teach from a word placed by a single
// accident. The API fits, measures and hashes; the browser draws.

import { useEffect, useState } from "react";
import { ApiError, UnseenReport, fetchUnseen } from "@/lib/concepts/fasttext";
import { Legend, MONEY, Stat, VERB, Waiting, WordChoice } from "./fasttextShared";

const CHART = { width: 640, height: 300 };
const LEFT = 96;

export function FasttextSpelling() {
  const [report, setReport] = useState<UnseenReport | null>(null);
  const [word, setWord] = useState("queue");
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchUnseen()
      .then((next) => {
        if (!cancelled) setReport(next);
      })
      .catch((error) => {
        if (cancelled) return;
        setMessage(error instanceof ApiError ? error.message : "Something went wrong.");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!report) return <Waiting message={message} />;

  const rows = report.probes.filter((entry) => entry.refusal === null);
  const chosen = report.probes.find((entry) => entry.word === word) ?? report.probes[0];
  const span = CHART.width - LEFT - 60;
  const height = 26;

  return (
    <div>
      <svg
        viewBox={`0 0 ${CHART.width} ${rows.length * height + 40}`}
        className="w-full select-none rounded-lg bg-slate-50 dark:bg-slate-950"
      >
        {rows.map((row, index) => (
          <g key={row.word} transform={`translate(0, ${14 + index * height})`}>
            <text
              x={LEFT - 8}
              y={14}
              textAnchor="end"
              className="fill-slate-700 text-[11px] dark:fill-slate-300"
            >
              {row.word}
            </text>
            <rect
              x={LEFT}
              y={2}
              width={Math.max(1, row.mean_to_verbs * span)}
              height={8}
              rx={2}
              fill={VERB}
            />
            <rect
              x={LEFT}
              y={12}
              width={Math.max(1, row.mean_to_money * span)}
              height={8}
              rx={2}
              fill={MONEY}
            />
            <text
              x={LEFT + span + 6}
              y={16}
              className="fill-slate-500 text-[10px] dark:fill-slate-400"
            >
              {row.shared_buckets} of {row.n_pieces}
            </text>
          </g>
        ))}
        <text
          x={LEFT}
          y={rows.length * height + 30}
          className="fill-slate-500 text-[10px] dark:fill-slate-400"
        >
          mean cosine to the verb forms and to the money words, and how many of the
          word&rsquo;s pieces reach a row the corpus wrote to
        </text>
      </svg>

      <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
        <span>look at</span>
        <WordChoice
          words={report.probes.map((entry) => entry.word)}
          value={chosen.word}
          onChange={setWord}
        />
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Stat label="pieces" value={chosen.n_pieces.toString()} />
        <Stat label="rows the corpus wrote to" value={chosen.shared_buckets.toString()} />
        <Stat label="length of the vector" value={chosen.length.toFixed(4)} />
        <Stat
          label="nearest words"
          value={
            chosen.nearest.length
              ? chosen.nearest.map((entry) => entry.word).join(", ")
              : "none"
          }
        />
      </div>

      {chosen.refusal ? (
        <p className="mt-3 rounded-lg border-l-4 border-amber-400 bg-amber-50/60 px-4 py-2 text-sm text-slate-700 dark:border-amber-500/70 dark:bg-amber-950/20 dark:text-slate-300">
          {chosen.refusal}
        </p>
      ) : (
        <div className="mt-3 space-y-1">
          {chosen.shared_rows.map((row) => (
            <div key={row.bucket} className="flex flex-wrap items-baseline gap-2 text-xs">
              <span className="w-10 shrink-0 font-mono text-slate-500 dark:text-slate-400">
                {row.bucket}
              </span>
              <span className="w-16 shrink-0 font-mono text-slate-800 dark:text-slate-200">
                {row.piece}
              </span>
              <span className="font-mono text-slate-500 dark:text-slate-400">
                {row.corpus_pieces.join(" ")}
              </span>
              <span className="text-slate-500 dark:text-slate-400">
                {row.owners.join(", ")}
              </span>
            </div>
          ))}
        </div>
      )}

      <Legend>
        Each line under the chosen word is a row that word reaches, the piece of
        its own spelling that reaches it, the pieces of the corpus kept in the
        same row, and the words those came from. Where the two spellings differ,
        the word is being placed by a hash rather than by anything it has in
        common with the corpus.
      </Legend>
    </div>
  );
}
