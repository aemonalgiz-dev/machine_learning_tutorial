"use client";

// The same corpus fitted twice from two different starts.
//
// Two rows of twelve bars are one word's coordinates under each start, and
// they have nothing in common. Underneath, the same two fits are compared on
// every pair of words at once, and the cosines they report agree almost
// exactly, which is the difference between what the fit determines and what it
// merely happened to land on. The API runs both fits and compares them; the
// browser draws.

import { useEffect, useState } from "react";
import { ApiError, SeedPair, fetchSeedPair } from "@/lib/concepts/word2vec";
import { Legend, MONEY, Stat, VERB, Waiting, colourFor } from "./word2vecShared";

const BARS = { width: 320, height: 60 };

export function Word2vecSeeds() {
  const [pair, setPair] = useState<SeedPair | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setPair(await fetchSeedPair());
      } catch (error) {
        if (error instanceof ApiError) setMessage(error.message);
        else setMessage("Something went wrong.");
      }
    })();
  }, []);

  if (!pair) return <Waiting message={message} />;

  const reach = Math.max(
    ...pair.reports.flatMap((report) => report.coordinates.map(Math.abs)),
  );

  return (
    <div>
      <div className="grid gap-3 sm:grid-cols-2">
        {pair.reports.map((report, index) => {
          const slot = BARS.width / report.coordinates.length;
          return (
            <div
              key={report.seed}
              className="rounded-lg border border-slate-200 p-3 dark:border-slate-800"
            >
              <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                start {index + 1}, the twelve coordinates of{" "}
                <span className="font-mono">{pair.word}</span>
              </p>
              <svg
                viewBox={`0 0 ${BARS.width} ${BARS.height}`}
                className="mt-2 w-full select-none"
              >
                <line
                  x1={0}
                  x2={BARS.width}
                  y1={BARS.height / 2}
                  y2={BARS.height / 2}
                  className="stroke-slate-300 dark:stroke-slate-700"
                  strokeWidth={1}
                />
                {report.coordinates.map((value, position) => (
                  <rect
                    key={position}
                    x={position * slot + 2}
                    y={value >= 0 ? BARS.height / 2 - (value / reach) * (BARS.height / 2 - 2) : BARS.height / 2}
                    width={slot - 4}
                    height={Math.max(1, (Math.abs(value) / reach) * (BARS.height / 2 - 2))}
                    fill={index === 0 ? VERB : MONEY}
                  />
                ))}
              </svg>
              <p className="mt-2 flex flex-wrap gap-x-2 font-mono text-xs">
                {report.neighbours.map((entry) => (
                  <span
                    key={entry.word}
                    style={{
                      color: colourFor(entry.topic),
                      fontWeight: pair.shared_neighbours.includes(entry.word) ? 700 : 400,
                    }}
                  >
                    {entry.word}
                  </span>
                ))}
              </p>
            </div>
          );
        })}
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Stat label="mean gap, coordinate by coordinate" value={pair.mean_coordinate_gap.toFixed(4)} />
        <Stat label="largest single gap" value={pair.largest_coordinate_gap.toFixed(4)} />
        <Stat label="agreement on every pair of words" value={pair.similarity_correlation.toFixed(4)} />
        <Stat label="mean gap in how alike a pair is" value={pair.mean_similarity_gap.toFixed(4)} />
      </div>

      <Legend>
        Both fits are correct and neither is a better answer than the other. The
        five nearest words to <span className="font-mono">{pair.word}</span>{" "}
        overlap in {pair.shared_neighbours.length}, shown in bold, and every one
        of the ten is a verb form, so the two runs agree about which list the
        word belongs to and disagree about the order inside it.
      </Legend>
      {message && <p className="mt-2 text-sm text-amber-600 dark:text-amber-400">{message}</p>}
    </div>
  );
}
