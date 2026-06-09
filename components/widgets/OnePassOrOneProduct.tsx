"use client";

// The same positions, reached two ways, and how far apart the two answers are.
//
// One way walks the collection and adds a direction at every occurrence; the
// other builds the whole table of counts and multiplies it by the directions.
// The readout is the largest disagreement anywhere in the table of positions,
// which is the number the section is about. The row underneath shows one word's
// counts, so the multiplication that would have produced the same answer is
// visible as an arithmetic rather than a claim. The API computes both; the
// browser shows the difference.

import { useEffect, useState } from "react";
import {
  Accumulation,
  ApiError,
  RandomIndexingFit,
  WeightingName,
  fetchAccumulation,
  fetchFit,
} from "@/lib/concepts/random-indexing";
import { Choice, Legend, SHARED, Stat, Waiting, colourFor } from "./randomIndexingShared";

type Scale = "small" | "large";

export function OnePassOrOneProduct() {
  const [scale, setScale] = useState<Scale>("small");
  const [weighting, setWeighting] = useState<WeightingName>("uniform");
  const [fit, setFit] = useState<RandomIndexingFit | null>(null);
  const [worked, setWorked] = useState<Accumulation | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [nextFit, nextWorked] = await Promise.all([
          fetchFit(
            scale === "small"
              ? {
                  corpus: "three-sentences",
                  dimension: 8,
                  window: 2,
                  weighting,
                  word: "cat",
                }
              : { dimension: 64, weighting },
          ),
          fetchAccumulation({
            corpus: "three-sentences",
            word: "cat",
            dimension: 8,
            window: 2,
            weighting,
          }),
        ]);
        if (!cancelled) {
          setFit(nextFit);
          setWorked(nextWorked);
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
  }, [scale, weighting]);

  if (!fit || !worked) return <Waiting message={message} />;

  const row = worked.counts[worked.words.indexOf(worked.word)];

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-600 dark:text-slate-300">
        <label className="flex items-center gap-2">
          <span className="text-xs">checked on</span>
          <Choice
            options={[
              { label: "three sentences", value: "small" as Scale },
              { label: "twenty-four documents", value: "large" as Scale },
            ]}
            value={scale}
            onChange={setScale}
          />
        </label>
        <label className="flex items-center gap-2">
          <span className="text-xs">a neighbour further away</span>
          <Choice
            options={[
              { label: "counts the same", value: "uniform" as WeightingName },
              { label: "counts less", value: "harmonic" as WeightingName },
            ]}
            value={weighting}
            onChange={setWeighting}
          />
        </label>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Stat
          label="largest disagreement anywhere"
          value={
            fit.identity_gap === 0
              ? "0"
              : fit.identity_gap.toExponential(2).replace("e-", " × 10⁻")
          }
        />
        <Stat
          label="largest number in the answer"
          value={fit.largest_coordinate.toFixed(2)}
        />
        <Stat label="words with a position" value={String(fit.n_words)} />
        <Stat
          label="directions added in one pass"
          value={String(fit.neighbour_visits)}
        />
      </div>

      <div className="mt-3 rounded-lg bg-slate-50 p-3 dark:bg-slate-900/60">
        <p className="mb-2 text-xs text-slate-500 dark:text-slate-400">
          how often each word turned up beside{" "}
          <span className="font-mono">{worked.word}</span>, over three sentences
        </p>
        <div className="flex flex-wrap gap-2">
          {worked.words.map((one, position) => (
            <span
              key={one}
              className="rounded bg-white px-2 py-1 font-mono text-xs shadow-sm dark:bg-slate-800"
              style={{ color: colourFor(worked.directions[position].group) }}
            >
              {one} {row[position]}
            </span>
          ))}
        </div>
        <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
          Multiply each of those counts by that word&rsquo;s direction, add the{" "}
          {worked.words.length} results together, and the answer is the running
          total the previous step arrived at by walking the sentences.
        </p>
      </div>

      <svg
        viewBox="0 0 560 46"
        className="mt-3 w-full rounded-lg bg-slate-50 dark:bg-slate-900/60"
        role="img"
        aria-label="The two routes to one answer"
      >
        <text x={12} y={18} fontSize={10} fill={SHARED}>
          walk the collection, add a direction at every occurrence
        </text>
        <text x={12} y={34} fontSize={10} fill={SHARED}>
          build the whole table of counts, multiply it by the directions
        </text>
        <text x={548} y={26} fontSize={11} textAnchor="end" fill={SHARED}>
          {fit.identity_gap === 0
            ? "the same answer, to the last bit"
            : "apart by rounding alone"}
        </text>
      </svg>

      <Legend>
        {fit.identity_gap === 0 ? (
          <>
            The two routes are the same arithmetic in a different order, and
            every weight in this setting is a number binary can hold exactly, so
            the two answers agree to the last bit and the disagreement is 0.
            The one setting here where they part is the twenty-four documents
            with a neighbour further away counting less, where a weight of a
            third appears.
          </>
        ) : (
          <>
            The weights here include a third, which no binary fraction holds, so
            the two routes round differently and part in the last bits. The
            largest disagreement anywhere is{" "}
            {fit.identity_gap.toExponential(2)} in a table whose largest entry is{" "}
            {fit.largest_coordinate.toFixed(2)}, which is rounding rather than a
            difference of method.
          </>
        )}
      </Legend>
      {message && (
        <p className="mt-2 text-sm text-amber-600 dark:text-amber-400">
          {message}
        </p>
      )}
    </div>
  );
}
