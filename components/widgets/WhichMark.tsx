"use client";

// The same four words fitted twice, under two different characters standing in
// for the space.
//
// The API runs both fits and returns each vocabulary twice, once as it really
// reads and once with the mark rewritten as a neutral glyph so the two tables
// can be compared row for row. The browser lines them up. What to look at is
// not the marks, which are cosmetic, but the merges: the character that sorts
// before the letters attaches to the word first and the word grows outward
// from it, and the one that sorts after every letter waits.

import { useEffect, useState } from "react";
import {
  LimitsView,
  fetchLimits,
  messageFor,
} from "@/lib/concepts/sentencepiece";
import { Pieces } from "./sentencePieceParts";

export function WhichMark() {
  const [limits, setLimits] = useState<LimitsView | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setLimits(await fetchLimits());
      } catch (error) {
        setMessage(messageFor(error));
      }
    })();
  }, []);

  if (!limits) {
    return (
      <p className="text-sm text-slate-500 dark:text-slate-400">
        {message ?? "…"}
      </p>
    );
  }

  const [late, early] = limits.mark_choices;
  const shared = new Set(
    late.tokens_shown.filter((token) => early.tokens_shown.includes(token)),
  );

  return (
    <div className="rounded-lg border border-slate-200 p-3 dark:border-slate-800">
      <div className="space-y-5">
        {limits.mark_choices.map((choice) => (
          <div key={choice.mark}>
            <p className="mb-2 text-xs text-slate-500 dark:text-slate-400">
              The mark is <span className="font-mono">{choice.mark}</span>,
              codepoint {choice.codepoint}, which sorts{" "}
              {choice.sorts_before_the_letters ? "before" : "after"} the
              letters. {choice.learned} rows, {choice.merges.length} merges.
            </p>
            <div className="flex flex-wrap gap-1">
              {choice.merges.slice(0, 8).map((pair, rank) => (
                <span
                  key={pair}
                  className="rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 font-mono text-xs text-slate-700 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300"
                >
                  {rank}. {pair}
                </span>
              ))}
            </div>
            <div className="mt-2 flex flex-wrap gap-1">
              {choice.tokens_shown.slice(12).map((token, index) => (
                <span
                  key={`${index}-${token}`}
                  className={`rounded border px-1.5 py-0.5 font-mono text-xs ${
                    shared.has(token)
                      ? "border-slate-200 bg-slate-50 text-slate-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400"
                      : "border-indigo-300 bg-indigo-50 text-indigo-900 dark:border-indigo-500/60 dark:bg-indigo-950/40 dark:text-indigo-200"
                  }`}
                >
                  {token}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 border-t border-slate-100 pt-3 dark:border-slate-800">
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Both tables hold {late.learned} rows and {limits.shared_rows} of them
          agree once the mark is written the same way, so{" "}
          {late.learned - limits.shared_rows} rows on each side exist only under
          one mark. The coloured rows above are those. The word{" "}
          {limits.unseen_word}, which the four words never contained, is cut the
          same way either way.
        </p>
        <div className="mt-2 grid gap-1 sm:grid-cols-2">
          <Pieces pieces={late.unseen_pieces} tone="learned" />
          <Pieces pieces={early.unseen_pieces} tone="learned" />
        </div>
      </div>
    </div>
  );
}
