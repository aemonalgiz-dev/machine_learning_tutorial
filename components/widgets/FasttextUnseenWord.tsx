"use client";

// The verb form no sentence holds, answered from its spelling, beside what a
// fit with one row per word says when asked the same thing.
//
// The two ranges are drawn as bars with the worst case marked, since two means
// on their own would not show whether the ranges overlap; underneath are the
// corpus words that share a piece with it, and the sentence the plain fit
// answers with. The API fits and measures; the browser draws.

import { useEffect, useState } from "react";
import { ApiError, UnseenReport, fetchUnseen } from "@/lib/concepts/fasttext";
import { Legend, MONEY, NeighbourBars, Stat, VERB, Waiting } from "./fasttextShared";

const BAR = { width: 640, height: 120 };
const LEFT = 150;

export function FasttextUnseenWord() {
  const [report, setReport] = useState<UnseenReport | null>(null);
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

  const rows = [
    {
      label: "the twenty verb forms",
      mean: report.mean_to_verbs,
      worst: report.smallest_to_verbs,
      colour: VERB,
    },
    {
      label: "the eleven money words",
      mean: report.mean_to_money,
      worst: report.largest_to_money,
      colour: MONEY,
    },
  ];
  const span = BAR.width - LEFT - 60;
  const scale = (value: number) => LEFT + Math.max(0, value) * span;

  return (
    <div>
      <svg
        viewBox={`0 0 ${BAR.width} ${BAR.height}`}
        className="w-full select-none rounded-lg bg-slate-50 dark:bg-slate-950"
      >
        {rows.map((row, index) => (
          <g key={row.label} transform={`translate(0, ${24 + index * 38})`}>
            <text
              x={LEFT - 8}
              y={12}
              textAnchor="end"
              className="fill-slate-600 text-[11px] dark:fill-slate-300"
            >
              {row.label}
            </text>
            <rect x={LEFT} y={2} width={span} height={14} rx={3} className="fill-slate-200 dark:fill-slate-800" />
            <rect
              x={LEFT}
              y={2}
              width={Math.max(1, scale(row.mean) - LEFT)}
              height={14}
              rx={3}
              fill={row.colour}
            />
            <line
              x1={scale(row.worst)}
              x2={scale(row.worst)}
              y1={0}
              y2={18}
              stroke="#0f172a"
              strokeWidth={1.5}
            />
            <text
              x={LEFT + span + 6}
              y={13}
              className="fill-slate-600 text-[11px] dark:fill-slate-300"
            >
              {row.mean.toFixed(4)}
            </text>
          </g>
        ))}
        <text
          x={LEFT}
          y={BAR.height - 12}
          className="fill-slate-500 text-[10px] dark:fill-slate-400"
        >
          mean cosine to each list, with the worst case in the list marked
        </text>
      </svg>

      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Stat label="pieces" value={report.n_pieces.toString()} />
        <Stat label="a corpus word owns" value={report.n_pieces_owned.toString()} />
        <Stat label="corpus words sharing one" value={report.sharers.length.toString()} />
        <Stat
          label="worst verb form beats best money word by"
          value={(report.smallest_to_verbs - report.largest_to_money).toFixed(4)}
        />
      </div>

      <p className="mt-4 text-sm text-slate-600 dark:text-slate-300">
        The words nearest {report.word}, none of which it was ever seen beside.
      </p>
      <div className="mt-2">
        <NeighbourBars entries={report.nearest} />
      </div>

      <p className="mt-4 text-sm text-slate-600 dark:text-slate-300">
        Asked for the same word, a fit that learned one position per word answers
        this instead.
      </p>
      <p className="mt-1 rounded-lg border-l-4 border-amber-400 bg-amber-50/60 px-4 py-2 text-sm text-slate-700 dark:border-amber-500/70 dark:bg-amber-950/20 dark:text-slate-300">
        {report.plain_refusal}
      </p>

      <div className="mt-4 space-y-1">
        {report.sharers.map((entry) => (
          <div key={entry.word} className="flex flex-wrap items-baseline gap-2">
            <span className="w-16 shrink-0 font-mono text-xs text-slate-700 dark:text-slate-300">
              {entry.word}
            </span>
            <span className="font-mono text-[11px] text-slate-500 dark:text-slate-400">
              {entry.pieces.join(" ")}
            </span>
          </div>
        ))}
      </div>

      <Legend>
        Every piece listed beside a word is one that word and {report.word} both
        have, which is the whole of what the corpus could teach about a word it
        never contained.
      </Legend>
    </div>
  );
}
