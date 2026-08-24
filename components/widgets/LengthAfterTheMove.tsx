"use client";

// What the move does to length, in both directions.
//
// The API reads four texts twice, once with the vocabulary learned from the old
// domain and once with the vocabulary learned from the new one, and returns the
// piece counts and the pieces themselves. The browser draws the pairs and
// prints one sentence of each domain underneath, since the two sentences move
// opposite ways and the counts alone do not show why.

import { useEffect, useState } from "react";
import {
  DomainsView,
  fetchDomains,
  messageFor,
} from "@/lib/concepts/moving-a-vocabulary";
import { Pieces } from "./movingAVocabularyParts";

const WIDTH = 640;
const LABEL_WIDTH = 132;
const BAR_LEFT = LABEL_WIDTH + 6;
const BAR_WIDTH = 400;
const GROUP_HEIGHT = 46;
const TOP = 26;

export function LengthAfterTheMove() {
  const [domains, setDomains] = useState<DomainsView | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [showing, setShowing] = useState<"new" | "old">("new");

  useEffect(() => {
    (async () => {
      try {
        setDomains(await fetchDomains());
      } catch (error) {
        setMessage(messageFor(error));
      }
    })();
  }, []);

  if (!domains) {
    return (
      <p className="text-sm text-slate-500 dark:text-slate-400">
        {message ?? "…"}
      </p>
    );
  }

  const longest = Math.max(
    ...domains.lengths.flatMap((row) => [row.old_pieces, row.new_pieces]),
  );
  const height = TOP + domains.lengths.length * GROUP_HEIGHT + 10;
  const readings =
    showing === "new"
      ? domains.new_sentence_readings
      : domains.old_sentence_readings;

  return (
    <div className="rounded-lg border border-slate-200 p-3 dark:border-slate-800">
      <div className="overflow-x-auto">
        <svg
          viewBox={`0 0 ${WIDTH} ${height}`}
          className="w-full"
          role="img"
          aria-label="Piece counts before and after the move"
        >
          <text
            x={BAR_LEFT}
            y={14}
            className="fill-slate-500 text-[11px] dark:fill-slate-400"
          >
            grey is the old vocabulary, blue the new one
          </text>
          {domains.lengths.map((row, index) => {
            const y = TOP + index * GROUP_HEIGHT;
            const before = (row.old_pieces / longest) * BAR_WIDTH;
            const after = (row.new_pieces / longest) * BAR_WIDTH;
            return (
              <g key={row.label}>
                <text
                  x={0}
                  y={y + 20}
                  className="fill-slate-600 text-[11px] dark:fill-slate-300"
                >
                  {row.label}
                </text>
                <rect
                  x={BAR_LEFT}
                  y={y}
                  width={before}
                  height={14}
                  className="fill-slate-400 dark:fill-slate-600"
                />
                <text
                  x={BAR_LEFT + before + 5}
                  y={y + 11}
                  className="fill-slate-600 font-mono text-[10px] dark:fill-slate-300"
                >
                  {row.old_pieces}
                </text>
                <rect
                  x={BAR_LEFT}
                  y={y + 18}
                  width={after}
                  height={14}
                  className="fill-indigo-500"
                />
                <text
                  x={BAR_LEFT + after + 5}
                  y={y + 29}
                  className="fill-slate-600 font-mono text-[10px] dark:fill-slate-300"
                >
                  {row.new_pieces}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {(["new", "old"] as const).map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => setShowing(key)}
            className={`rounded-md px-2.5 py-1 text-xs font-medium transition ${
              showing === key
                ? "bg-indigo-600 text-white"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
            }`}
          >
            {key === "new"
              ? "a sentence of the new domain"
              : "a sentence of the old one"}
          </button>
        ))}
      </div>

      <div className="mt-3 space-y-3">
        {readings.map((reading, index) => (
          <div key={reading.label}>
            <p className="mb-1 text-xs text-slate-500 dark:text-slate-400">
              {reading.label}, {reading.n_pieces} pieces
            </p>
            <Pieces
              pieces={reading.pieces}
              tone={index === 0 ? "muted" : "learned"}
            />
          </div>
        ))}
      </div>

      <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
        The new domain costs {domains.lengths[0].old_pieces} pieces before the
        move and {domains.lengths[0].new_pieces} after it, and the old domain
        goes the other way, from {domains.lengths[1].old_pieces} to{" "}
        {domains.lengths[1].new_pieces}.
      </p>
    </div>
  );
}
