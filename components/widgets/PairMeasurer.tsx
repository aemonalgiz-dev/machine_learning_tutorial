"use client";

// Two people, measured under all six metrics at once.
//
// The pair starts as the query and its nearest person, a gap of 3 and 4, so
// the three p-norms can be read straight off a schoolroom triangle. The
// working panel shows the intermediate numbers a hand calculation passes
// through. The row panel scales the second person's whole row by a factor,
// which moves five of the six and leaves cosine exactly where it was. The
// column panel switches the weight column between kilograms and grams,
// which moves five of the six and leaves Canberra exactly where it was, and
// cosine is not among the ones left alone. The API measures; the browser
// draws.

import { useEffect, useState } from "react";
import { ApiError, Point } from "@/lib/api";
import {
  METRIC_NAMES,
  METRIC_TITLES,
  PairMeasurement,
  measurePair,
} from "@/lib/concepts/distance-metrics";
import {
  WORKED_NEAREST,
  WORKED_QUERY,
  formatDistance,
} from "./distanceMetricsFixtures";

export type PairPanel = "working" | "row" | "column";

const ROW_FACTORS = [1, 2, 5, 10];

// The pair after the second person's row is scaled and the weight column is
// put into grams or left in kilograms.
function pairFor(rowFactor: number, grams: boolean): [Point, Point] {
  const columnFactor = grams ? 1000 : 1;
  return [
    { x: WORKED_QUERY.x, y: WORKED_QUERY.y * columnFactor },
    {
      x: WORKED_NEAREST.x * rowFactor,
      y: WORKED_NEAREST.y * rowFactor * columnFactor,
    },
  ];
}

export function PairMeasurer({ panel = "working" }: { panel?: PairPanel }) {
  const [rowFactor, setRowFactor] = useState(1);
  const [grams, setGrams] = useState(false);
  const [plain, setPlain] = useState<PairMeasurement | null>(null);
  const [changed, setChanged] = useState<PairMeasurement | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const [first, second] = pairFor(rowFactor, grams);
  const isChanged = rowFactor !== 1 || grams;

  useEffect(() => {
    let stale = false;
    (async () => {
      try {
        const [movedFirst, movedSecond] = pairFor(rowFactor, grams);
        const [base, moved] = await Promise.all([
          measurePair(WORKED_QUERY, WORKED_NEAREST),
          measurePair(movedFirst, movedSecond),
        ]);
        if (stale) return;
        setPlain(base);
        setChanged(moved);
        setMessage(null);
      } catch (error) {
        if (stale) return;
        if (error instanceof ApiError) setMessage(error.message);
        else setMessage("Something went wrong.");
      }
    })();
    return () => {
      stale = true;
    };
  }, [rowFactor, grams]);

  const working = plain?.working;

  return (
    <div>
      {panel === "row" && (
        <div className="flex flex-wrap items-center gap-2 pb-3">
          <span className="text-sm text-slate-600 dark:text-slate-300">
            Scale the second person&rsquo;s whole row by
          </span>
          <div className="flex gap-1 rounded-md border border-slate-300 p-0.5 dark:border-slate-700">
            {ROW_FACTORS.map((factor) => (
              <button
                key={factor}
                onClick={() => setRowFactor(factor)}
                className={
                  "rounded px-2.5 py-1 text-sm font-medium transition " +
                  (rowFactor === factor
                    ? "bg-indigo-600 text-white"
                    : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800")
                }
              >
                ×{factor}
              </button>
            ))}
          </div>
        </div>
      )}
      {panel === "column" && (
        <div className="flex flex-wrap items-center gap-2 pb-3">
          <span className="text-sm text-slate-600 dark:text-slate-300">
            Weight measured in
          </span>
          <div className="flex gap-1 rounded-md border border-slate-300 p-0.5 dark:border-slate-700">
            {[false, true].map((inGrams) => (
              <button
                key={String(inGrams)}
                onClick={() => setGrams(inGrams)}
                className={
                  "rounded px-2.5 py-1 text-sm font-medium transition " +
                  (grams === inGrams
                    ? "bg-indigo-600 text-white"
                    : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800")
                }
              >
                {inGrams ? "grams" : "kilograms"}
              </button>
            ))}
          </div>
        </div>
      )}

      <p className="text-xs text-slate-500 dark:text-slate-400">
        ({first.x}, {first.y}) against ({second.x}, {second.y}), under all six.
      </p>
      <div className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-6">
        {METRIC_NAMES.map((name) => {
          const value = (isChanged ? changed : plain)?.distances[name];
          const before = plain?.distances[name];
          const unchanged =
            isChanged && value !== undefined && before !== undefined
              ? value === before
              : false;
          return (
            <Stat
              key={name}
              label={METRIC_TITLES[name]}
              value={value === undefined ? "…" : formatDistance(value)}
              highlighted={unchanged}
            />
          );
        })}
      </div>
      {isChanged && plain && (
        <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
          Highlighted is unchanged from the pair as first measured. Before the
          change the six read{" "}
          {METRIC_NAMES.map(
            (name) =>
              `${METRIC_TITLES[name]} ${formatDistance(plain.distances[name])}`,
          ).join(", ")}
          .
        </p>
      )}

      {panel === "working" && working && plain && (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm text-slate-700 dark:text-slate-300">
            <tbody>
              <Row
                label="the gap"
                value={`(${working.gap_x}, ${working.gap_y})`}
              />
              <Row
                label="Manhattan, the gaps added"
                value={formatDistance(plain.distances.manhattan)}
              />
              <Row
                label="Euclidean, the root of the squares"
                value={formatDistance(plain.distances.euclidean)}
              />
              <Row
                label="Chebyshev, the larger gap"
                value={formatDistance(plain.distances.chebyshev)}
              />
              <Row
                label="features that differ, of how many"
                value={`${working.differing_features} of ${working.feature_count}, so Hamming ${formatDistance(plain.distances.hamming)}`}
              />
              <Row
                label="dot product"
                value={working.dot_product.toLocaleString()}
              />
              <Row
                label="the two lengths"
                value={`${working.first_length.toFixed(4)} and ${working.second_length.toFixed(4)}`}
              />
              <Row
                label="cosine similarity, so cosine distance"
                value={`${working.cosine_similarity.toFixed(5)}, so ${plain.distances.cosine.toFixed(5)}`}
              />
              <Row
                label="Canberra terms, summed"
                value={`${working.canberra_terms.map((term) => term.toFixed(4)).join(" + ")} = ${plain.distances.canberra.toFixed(4)}`}
              />
            </tbody>
          </table>
        </div>
      )}

      {message && (
        <p className="mt-3 text-sm text-amber-600 dark:text-amber-400">
          {message}
        </p>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <tr className="border-t border-slate-100 dark:border-slate-800">
      <td className="py-1 pr-3 text-slate-500 dark:text-slate-400">{label}</td>
      <td className="py-1 font-mono">{value}</td>
    </tr>
  );
}

function Stat({
  label,
  value,
  highlighted = false,
}: {
  label: string;
  value: string;
  highlighted?: boolean;
}) {
  return (
    <div
      className={
        "rounded-lg px-3 py-2 " +
        (highlighted
          ? "bg-indigo-100 ring-1 ring-indigo-400 dark:bg-indigo-950 dark:ring-indigo-500"
          : "bg-slate-100 dark:bg-slate-800")
      }
    >
      <div className="text-xs text-slate-500 dark:text-slate-400">{label}</div>
      <div className="font-mono text-lg font-semibold text-slate-900 dark:text-slate-100">
        {value}
      </div>
    </div>
  );
}
