"use client";

// Where one text's position actually came from, word by word.
//
// Every word of a text supplies some share of the length of the position the
// text ends up at, and those shares add to exactly one, so they can be read as
// a division of the answer. Switching the rule reweights the division, which is
// what a weighting is for. The API rebuilds each word's own term and reports its
// share; the browser draws.

import { useEffect, useState } from "react";
import {
  ApiError,
  CorpusName,
  MethodName,
  Pooled,
  poolTexts,
} from "@/lib/concepts/pooling-a-text";
import { Choice, Legend, Stat, Waiting, colourFor } from "./poolingATextShared";

const METHODS: { label: string; value: MethodName }[] = [
  { label: "averaged", value: "average" },
  { label: "averaged, weighted by rarity", value: "weighted-average" },
  { label: "smooth weights", value: "smooth-weights" },
];

export function ContributionBars({
  corpus = "documents",
  text = "the crew and the boat and we sail",
}: {
  corpus?: CorpusName;
  text?: string;
}) {
  const [method, setMethod] = useState<MethodName>("average");
  const [pooled, setPooled] = useState<Pooled | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const next = await poolTexts({ corpus, method, texts: [text] });
        if (!cancelled) {
          setPooled(next);
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
  }, [corpus, method, text]);

  if (!pooled) return <Waiting message={message} />;

  const entry = pooled.texts[0];
  const largest = Math.max(...entry.by_word.map((share) => share.share), 0.001);
  const carriesNoSubject = entry.by_word
    .filter((share) => share.group === "shared")
    .reduce((total, share) => total + share.share, 0);
  const equalShare = entry.words.length === 0 ? 0 : 1 / entry.words.length;

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
        <Choice options={METHODS} value={method} onChange={setMethod} />
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        <Stat
          label="words carrying no subject"
          value={carriesNoSubject.toFixed(4)}
        />
        <Stat label="an equal share per token" value={equalShare.toFixed(4)} />
        <Stat label="tokens in the text" value={String(entry.words.length)} />
      </div>

      <div className="mt-3 space-y-1">
        {entry.by_word.map((share) => (
          <div key={share.word} className="flex items-center gap-2">
            <span
              className="w-20 shrink-0 truncate font-mono text-[11px]"
              style={{ color: colourFor(share.group) }}
            >
              {share.word}
            </span>
            <span className="flex h-2.5 flex-1 rounded bg-slate-100 dark:bg-slate-800">
              <span
                className="block h-2.5 rounded"
                style={{
                  width: `${Math.max(0, share.share / largest) * 100}%`,
                  backgroundColor: colourFor(share.group),
                }}
              />
            </span>
            <span className="w-14 shrink-0 text-right font-mono text-[11px] text-slate-500 dark:text-slate-400">
              {share.share.toFixed(4)}
            </span>
          </div>
        ))}
      </div>

      <Legend>
        One bar per distinct word, longest first, and a word used twice carries
        both of its uses in one bar. The shares add to exactly one, so a bar
        wider than the equal share above means that word supplied more of the
        answer than its count of tokens would suggest. Grey is a word carrying no
        subject.
      </Legend>
      {message && (
        <p className="mt-2 text-sm text-amber-600 dark:text-amber-400">
          {message}
        </p>
      )}
    </div>
  );
}
