"use client";

// What the letter chain writes, at each length of memory.
//
// Shannon printed this experiment in 1948 for English at large, and this is
// the same experiment on the first two chapters of Alice. Every sample is 150
// symbols drawn from the same seed, so the only thing that changes down the
// list is how much the model remembers. The memoryless draw takes each letter
// from the chain's long-run shares; the others walk chains whose states are
// runs of one, two and three letters. The last sample is the two-letter chain
// again with a smoothing of a half, which is Part 6's failure written out. The
// API draws every sample; the browser lays them out.

import { useEffect, useState } from "react";
import { LettersView, fetchLetters, messageFor } from "@/lib/concepts/markov-chains";
import { Caption, Loading } from "./markovParts";

export function MarkovSamples() {
  const [view, setView] = useState<LettersView | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setView(await fetchLetters());
      } catch (error) {
        setMessage(messageFor(error));
      }
    })();
  }, []);

  if (!view) return <Loading message={message} />;

  return (
    <div className="space-y-3">
      {view.samples.map((sample) => (
        <div key={sample.label}>
          <p className="mb-1 text-xs text-slate-500 dark:text-slate-400">
            {sample.label}
            {sample.smoothing > 0 && sample.width === 3
              ? ", with a smoothing of a thousandth so that every state has a row"
              : ""}
          </p>
          <p
            className={`break-words rounded-md border px-3 py-2 font-mono text-xs ${
              sample.smoothing >= 0.5
                ? "border-rose-200 bg-rose-50 text-rose-900 dark:border-rose-500/40 dark:bg-rose-950/30 dark:text-rose-200"
                : "border-slate-200 bg-white text-slate-800 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
            }`}
          >
            {sample.text}
          </p>
        </div>
      ))}
      <Caption>
        All five start from the same seed. The first four run from no memory to
        three letters of it; the last, in rose, is the two-letter chain with
        half a step added to every one of its cells before dividing.
      </Caption>
    </div>
  );
}
