"use client";

// What each rule buys, in pieces, for the same number of merges.
//
// Both lines start from the same spelling of the same corpus and run the same
// loop, so the vertical gap between them at any point is what choosing by the
// ratio costs in length. The corpus can be switched. The API runs both loops
// and measures the corpus after each; the browser draws two lines.

import { useEffect, useState } from "react";
import {
  LengthGroup,
  ScoringView,
  fetchScoring,
  messageFor,
} from "@/lib/concepts/wordpiece";
import { Stat } from "./wordPieceParts";

const WIDTH = 640;
const HEIGHT = 300;
const LEFT = 56;
const RIGHT = 16;
const TOP = 14;
const BOTTOM = 40;

function path(
  group: LengthGroup,
  reader: (row: LengthGroup["rows"][number]) => number,
  placeX: (asked: number) => number,
  placeY: (length: number) => number,
): string {
  return group.rows
    .map(
      (row, index) =>
        `${index === 0 ? "M" : "L"} ${placeX(row.asked)} ${placeY(reader(row))}`,
    )
    .join(" ");
}

export function ShorteningCurve({
  initialCorpus = "sentences",
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

  const group =
    scoring.lengths.find((candidate) => candidate.corpus === corpus) ??
    scoring.lengths[0];
  const asked = group.rows.map((row) => row.asked);
  const largest = Math.max(...asked);
  const lengths = group.rows.flatMap((row) => [
    row.by_count_length,
    row.by_score_length,
  ]);
  const lowest = Math.min(...lengths);

  const placeX = (value: number) =>
    LEFT + (value / largest) * (WIDTH - LEFT - RIGHT);
  const placeY = (value: number) =>
    HEIGHT -
    BOTTOM -
    ((value - lowest) / (group.start_length - lowest)) *
      (HEIGHT - TOP - BOTTOM);

  const last = group.rows[group.rows.length - 1];

  return (
    <div className="rounded-lg border border-slate-200 p-3 dark:border-slate-800">
      <div className="flex flex-wrap gap-2">
        {scoring.lengths.map((candidate) => (
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

      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="mt-2 w-full"
        role="img"
        aria-label="The corpus length after each number of merges, under both rules"
      >
        <line
          x1={LEFT}
          y1={HEIGHT - BOTTOM}
          x2={WIDTH - RIGHT}
          y2={HEIGHT - BOTTOM}
          className="stroke-slate-300 dark:stroke-slate-700"
        />
        <line
          x1={LEFT}
          y1={TOP}
          x2={LEFT}
          y2={HEIGHT - BOTTOM}
          className="stroke-slate-300 dark:stroke-slate-700"
        />
        {asked.map((value) => (
          <text
            key={value}
            x={placeX(value)}
            y={HEIGHT - BOTTOM + 16}
            textAnchor="middle"
            className="fill-slate-500 text-[11px] dark:fill-slate-400"
          >
            {value}
          </text>
        ))}
        {[group.start_length, lowest].map((value) => (
          <text
            key={value}
            x={LEFT - 8}
            y={placeY(value) + 4}
            textAnchor="end"
            className="fill-slate-500 text-[11px] dark:fill-slate-400"
          >
            {value}
          </text>
        ))}
        <text
          x={(LEFT + WIDTH - RIGHT) / 2}
          y={HEIGHT - 6}
          textAnchor="middle"
          className="fill-slate-500 text-[11px] dark:fill-slate-400"
        >
          merges made
        </text>

        <path
          d={path(group, (row) => row.by_count_length, placeX, placeY)}
          fill="none"
          strokeWidth={2}
          className="stroke-slate-400 dark:stroke-slate-500"
        />
        <path
          d={path(group, (row) => row.by_score_length, placeX, placeY)}
          fill="none"
          strokeWidth={2}
          className="stroke-indigo-500 dark:stroke-indigo-400"
        />
        {group.rows.map((row) => (
          <g key={row.asked}>
            <circle
              cx={placeX(row.asked)}
              cy={placeY(row.by_count_length)}
              r={3}
              className="fill-slate-400 dark:fill-slate-500"
            />
            <circle
              cx={placeX(row.asked)}
              cy={placeY(row.by_score_length)}
              r={3}
              className="fill-indigo-500 dark:fill-indigo-400"
            />
          </g>
        ))}
      </svg>

      <div className="mt-2 flex flex-wrap gap-4 text-xs">
        <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
          <span className="inline-block h-0.5 w-5 bg-slate-400 dark:bg-slate-500" />
          chosen by how often the pair occurs
        </span>
        <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
          <span className="inline-block h-0.5 w-5 bg-indigo-500 dark:bg-indigo-400" />
          chosen by the ratio
        </span>
      </div>

      <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Stat label="before any merge" value={group.start_length} />
        <Stat label="merges asked for" value={last.asked} />
        <Stat
          label="by count, learned and reached"
          value={`${last.by_count_learned} · ${last.by_count_length}`}
        />
        <Stat
          label="by ratio, learned and reached"
          value={`${last.by_score_learned} · ${last.by_score_length}`}
        />
      </div>
    </div>
  );
}
