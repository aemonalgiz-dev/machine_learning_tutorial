"use client";

// The fixed direction drawn for each of a few words, entry by entry.
//
// One row per word and one square per position, filled where the entry is +1
// or −1 and left empty where it is zero, so how little of a direction is
// anything at all is the first thing a reader sees. The width and how many
// non-zero entries to draw are the two settings that change the picture. The
// API draws the directions; the browser only colours them in.

import { useEffect, useState } from "react";
import {
  ApiError,
  CorpusName,
  RandomIndexingFit,
  fetchFit,
} from "@/lib/concepts/random-indexing";
import {
  Choice,
  DirectionRow,
  Legend,
  NEGATIVE,
  POSITIVE,
  Stat,
  Waiting,
  colourFor,
} from "./randomIndexingShared";

export function DrawnDirections({
  corpus = "two-topic",
  words,
  dimension: initial = 16,
  allowWidths = true,
}: {
  corpus?: CorpusName;
  words: string[];
  dimension?: number;
  allowWidths?: boolean;
}) {
  const [dimension, setDimension] = useState(initial);
  const [nNonzero, setNonzero] = useState(4);
  const [fit, setFit] = useState<RandomIndexingFit | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const next = await fetchFit({
          corpus,
          dimension,
          nNonzero,
          word: words[0],
        });
        if (!cancelled) {
          setFit(next);
          setMessage(null);
        }
      } catch (error) {
        if (cancelled) return;
        if (error instanceof ApiError) setMessage(error.message);
        else setMessage("Something went wrong.");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [corpus, dimension, nNonzero, words]);

  if (!fit) return <Waiting message={message} />;

  const shown = fit.directions.filter((one) => words.includes(one.word));
  const cell = dimension > 40 ? 6 : dimension > 20 ? 10 : 13;
  const filled = nNonzero / dimension;

  return (
    <div>
      {allowWidths && (
        <div className="mb-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-600 dark:text-slate-300">
          <label className="flex items-center gap-2">
            <span className="text-xs">how many numbers a direction has</span>
            <Choice
              options={[16, 32, 64].map((one) => ({
                label: String(one),
                value: one,
              }))}
              value={dimension}
              onChange={setDimension}
            />
          </label>
          <label className="flex items-center gap-2">
            <span className="text-xs">non-zero entries</span>
            <Choice
              options={[2, 4, 8].map((one) => ({
                label: String(one),
                value: one,
              }))}
              value={nNonzero}
              onChange={setNonzero}
            />
          </label>
        </div>
      )}

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        <Stat label="entries in a direction" value={String(dimension)} />
        <Stat
          label="of them anything but zero"
          value={`${nNonzero} (${(filled * 100).toFixed(1)}%)`}
        />
        <Stat
          label="of these pairs at a right angle"
          value={`${(fit.direction_exactly_perpendicular * 100).toFixed(1)}%`}
        />
      </div>

      <div className="mt-3 space-y-1.5 overflow-x-auto rounded-lg bg-slate-50 p-3 dark:bg-slate-900/60">
        {shown.map((direction) => (
          <div key={direction.word} className="flex items-center gap-3">
            <span
              className="w-16 shrink-0 text-right font-mono text-xs"
              style={{ color: colourFor(direction.group) }}
            >
              {direction.word}
            </span>
            <DirectionRow entries={direction.entries} cell={cell} />
            <span className="shrink-0 font-mono text-[11px] text-slate-500 dark:text-slate-400">
              {direction.positions.join(", ")}
            </span>
          </div>
        ))}
      </div>

      <Legend>
        <span style={{ color: POSITIVE }}>Filled one way</span> is an entry of
        +1 and <span style={{ color: NEGATIVE }}>filled the other</span> is an
        entry of −1, and every other square is exactly zero. The numbers on the
        right are which positions the draw picked. Nothing here was learned from
        the collection, and swapping the draw would replace every square without
        changing a single count.
      </Legend>
      {message && (
        <p className="mt-2 text-sm text-amber-600 dark:text-amber-400">
          {message}
        </p>
      )}
    </div>
  );
}
