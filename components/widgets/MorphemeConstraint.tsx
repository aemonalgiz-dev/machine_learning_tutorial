"use client";

// Merging that may cross a word's joints, and merging that may not.
//
// Both fits see the same forty words, two prefixes across two roots, and both
// are asked for the same vocabulary size. The second is told where the joints
// are and spells each part on its own, so a pair straddling a joint is never
// adjacent and can never be proposed. The API runs both and reports every merge
// each learned, the finished vocabularies, and what one word comes out as. The
// browser lines the two up so the point at which they part is visible.

import { useEffect, useState } from "react";
import {
  VariantsView,
  fetchVariants,
  messageFor,
} from "@/lib/concepts/byte-pair-encoding";
import { Pieces, Stat } from "./bytePairEncodingParts";

export function MorphemeConstraint() {
  const [variants, setVariants] = useState<VariantsView | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setVariants(await fetchVariants());
      } catch (error) {
        setMessage(messageFor(error));
      }
    })();
  }, []);

  if (!variants) {
    return (
      <p className="text-sm text-slate-500 dark:text-slate-400">
        {message ?? "…"}
      </p>
    );
  }

  const morphology = variants.morphology;
  const shared = morphology.constrained_merges.length;

  const column = (
    title: string,
    merges: string[],
    tokens: string[],
    cut: string[],
    pieces: number,
    accent: boolean,
  ) => (
    <div
      className={`rounded-lg border p-3 ${
        accent
          ? "border-emerald-300 dark:border-emerald-500/60"
          : "border-slate-200 dark:border-slate-800"
      }`}
    >
      <p className="mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">
        {title}
      </p>
      <ol className="mb-2 space-y-0.5 font-mono text-xs">
        {merges.map((merge, index) => (
          <li
            key={merge}
            className={
              index < shared
                ? "text-slate-700 dark:text-slate-300"
                : "text-amber-700 dark:text-amber-400"
            }
          >
            {index + 1}. {merge}
            {index >= shared && " (joins a prefix to a root)"}
          </li>
        ))}
      </ol>
      <div className="mb-2 grid grid-cols-2 gap-2">
        <Stat label="tokens" value={tokens.length} />
        <Stat label="forty words cost" value={`${pieces} pieces`} />
      </div>
      <p className="mb-1 text-[11px] text-slate-500 dark:text-slate-400">
        undo comes out as
      </p>
      <Pieces pieces={cut} tone={accent ? "highlight" : "learned"} />
    </div>
  );

  return (
    <div>
      <p className="mb-3 text-xs text-slate-500 dark:text-slate-400">
        The corpus is {morphology.words.join(", ")}, ten times each. The joints
        are stated rather than learned:{" "}
        {morphology.morphs
          .map((parts, index) => `${morphology.words[index]} is ${parts.join(" + ")}`)
          .join(", ")}
        .
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        {column(
          "Merges may cross a joint",
          morphology.plain_merges,
          morphology.plain_tokens,
          morphology.plain_cut,
          morphology.plain_corpus_pieces,
          false,
        )}
        {column(
          "Merges may not cross a joint",
          morphology.constrained_merges,
          morphology.constrained_tokens,
          morphology.constrained_cut,
          morphology.constrained_corpus_pieces,
          true,
        )}
      </div>
      <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
        The first {shared} merges are the same on both sides, and after them the
        constrained fit has nothing left to join, since every part is already
        one symbol and the pairs that remain all straddle a joint. Both were
        asked for thirty tokens.
      </p>
    </div>
  );
}
