"use client";

// Four texts whose round trip is not exact, and what each one lost.
//
// The API encodes each with the finished fit and glues the pieces back, so
// every string below is what actually came out rather than what ought to. The
// browser draws the text as it went in, the pieces, and the text as it came
// back, with every space shown as a dot so the difference is visible.

import { useEffect, useState } from "react";
import {
  MarkingView,
  fetchMarking,
  messageFor,
} from "@/lib/concepts/sentencepiece";
import { Pieces } from "./sentencePieceParts";

function visible(text: string): string {
  return text.replace(/ /g, "·").replace(/\t/g, "→");
}

export function ExactUpToThis() {
  const [marking, setMarking] = useState<MarkingView | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setMarking(await fetchMarking());
      } catch (error) {
        setMessage(messageFor(error));
      }
    })();
  }, []);

  if (!marking) {
    return (
      <p className="text-sm text-slate-500 dark:text-slate-400">
        {message ?? "…"}
      </p>
    );
  }

  return (
    <div className="rounded-lg border border-slate-200 p-3 dark:border-slate-800">
      <p className="mb-3 text-xs text-slate-500 dark:text-slate-400">
        Spaces are drawn as dots and a tab as an arrow, since otherwise the
        difference between the two columns is invisible.
      </p>
      <div className="space-y-4">
        {marking.losses.map((loss) => (
          <div key={loss.text}>
            <div className="flex flex-wrap items-center gap-3">
              <span className="font-mono text-xs text-slate-700 dark:text-slate-300">
                {visible(loss.text)}
              </span>
              <span className="text-xs text-slate-400 dark:text-slate-500">
                &rarr;
              </span>
              <span className="font-mono text-xs text-amber-700 dark:text-amber-300">
                {visible(loss.decoded)}
              </span>
            </div>
            <div className="mt-1.5">
              <Pieces pieces={loss.pieces} tone="muted" />
            </div>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              {loss.what_was_lost}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
