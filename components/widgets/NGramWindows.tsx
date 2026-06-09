"use client";

// The running sentence framed and then cut into every window of one width.
//
// The grey chips are the markers the framing puts in, one end marker behind
// and one start marker in front for every word of context the width asks for,
// and the white chips are the words the splitting rule found. Below them each
// window is drawn on its own row with its last word picked out, since that
// last word is the one being predicted and everything before it is what it is
// predicted from. The API frames and cuts; the browser draws.

import { useEffect, useState } from "react";
import { GramsView, fetchGrams, messageFor } from "@/lib/concepts/n-grams";
import { ACTIVE_CLASS, BUTTON_CLASS, Stat, Word, Words } from "./nGramParts";

const NAMES: Record<number, string> = {
  1: "one word",
  2: "two words",
  3: "three words",
  4: "four words",
};

export function NGramWindows() {
  const [view, setView] = useState<GramsView | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [order, setOrder] = useState(3);

  useEffect(() => {
    (async () => {
      try {
        setView(await fetchGrams());
      } catch (error) {
        setMessage(messageFor(error));
      }
    })();
  }, []);

  if (!view) {
    return (
      <p className="text-sm text-slate-500 dark:text-slate-400">
        {message ?? "…"}
      </p>
    );
  }

  const framing =
    view.framings.find((entry) => entry.order === order) ?? view.framings[0];

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center gap-2">
        {view.framings.map((entry) => (
          <button
            key={entry.order}
            type="button"
            onClick={() => setOrder(entry.order)}
            className={order === entry.order ? ACTIVE_CLASS : BUTTON_CLASS}
          >
            {NAMES[entry.order]}
          </button>
        ))}
      </div>

      <p className="mb-1 text-xs text-slate-500 dark:text-slate-400">
        The sentence with its edges put in.
      </p>
      <Words words={framing.framed} />

      <p className="mb-1 mt-4 text-xs text-slate-500 dark:text-slate-400">
        Every window of {NAMES[framing.order]}, left to right. The last chip of
        each row is what that window predicts.
      </p>
      <div className="space-y-1">
        {framing.windows.map((window, index) => (
          <div key={index} className="flex flex-wrap items-center gap-1">
            <span className="w-6 shrink-0 text-right font-mono text-[11px] text-slate-400 dark:text-slate-500">
              {index + 1}
            </span>
            {window.map((word, position) => (
              <Word
                key={`${position}-${word}`}
                text={word}
                tone={position === window.length - 1 ? "learned" : "muted"}
              />
            ))}
          </div>
        ))}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Stat label="words in the sentence" value={view.n_words} />
        <Stat label="markers in front" value={framing.n_start_markers} />
        <Stat label="windows" value={framing.n_windows} />
        <Stat label="words of context each" value={framing.order - 1} />
      </div>
    </div>
  );
}
