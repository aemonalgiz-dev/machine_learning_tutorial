"use client";

// Where a grammar reads one word several ways, and how fast that can multiply.
//
// The API sends every reading of the words its larger grammar reads more than
// once, and separately the number of readings a four-line grammar gives a word
// of each length; the browser lays the readings out and draws the counts as a
// row of bars. Which readings exist is the grammar's answer, not a choice made
// here.

import { useEffect, useState } from "react";
import {
  AmbiguityView,
  fetchAmbiguity,
  messageFor,
} from "@/lib/concepts/finite-state-morphology";
import { Loading, Readings, Stat } from "./morphologyParts";

export function ManyReadings({ showGrowth = true }: { showGrowth?: boolean }) {
  const [ambiguity, setAmbiguity] = useState<AmbiguityView | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setAmbiguity(await fetchAmbiguity());
      } catch (error) {
        setMessage(messageFor(error));
      }
    })();
  }, []);

  if (!ambiguity) {
    return <Loading message={message} />;
  }

  const tallest = Math.max(...ambiguity.growth.map((row) => row.n_readings));

  return (
    <div className="rounded-lg border border-slate-200 p-3 dark:border-slate-800">
      <div className="mb-3 grid grid-cols-3 gap-2">
        <Stat label="words it accepts" value={`${ambiguity.n_forms}`} />
        <Stat
          label="read more than once"
          value={`${ambiguity.n_ambiguous_forms}`}
        />
        <Stat
          label="that is a share of"
          value={`${(ambiguity.share_ambiguous * 100).toFixed(1)}%`}
        />
      </div>

      {ambiguity.most_read_words.map((view) => (
        <div key={view.word} className="mb-4">
          <p className="mb-2 font-mono text-base text-slate-900 dark:text-slate-100">
            {view.word}
          </p>
          <Readings view={view} />
        </div>
      ))}

      {showGrowth && (
        <>
          <p className="mb-1 mt-4 text-xs font-medium text-slate-500 dark:text-slate-400">
            A grammar of four lines, one piece of a single character and one of
            two, and how many readings a word of each length has
          </p>
          <div className="flex items-end gap-2">
            {ambiguity.growth.map((row) => (
              <div key={row.length} className="flex-1 text-center">
                <div className="font-mono text-[11px] text-slate-600 dark:text-slate-400">
                  {row.n_readings}
                </div>
                <svg
                  viewBox="0 0 10 60"
                  className="h-16 w-full"
                  preserveAspectRatio="none"
                >
                  <rect
                    x="1"
                    y={60 - Math.max((row.n_readings / tallest) * 58, 1)}
                    width="8"
                    height={Math.max((row.n_readings / tallest) * 58, 1)}
                    className="fill-violet-500"
                  />
                </svg>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  {row.length}
                </div>
              </div>
            ))}
          </div>
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            Length along the bottom, readings up the side. The counts are the
            Fibonacci numbers, since a word of n characters is read as a piece
            of one followed by a reading of n minus 1, or a piece of two
            followed by a reading of n minus 2.
          </p>
        </>
      )}
    </div>
  );
}
