"use client";

// The five words nearest a chosen word, under a fit that reads the spelling
// and a fit that does not, in two columns.
//
// Both fits use the same corpus, width, reach, passes, first step and seed, so
// the only difference between the two columns is whether a word also stands
// for its pieces. A name in both columns is marked. The API fits both and
// ranks; the browser draws.

import { useEffect, useState } from "react";
import { ApiError, ComparisonReport, fetchComparison } from "@/lib/concepts/fasttext";
import { Legend, NeighbourBars, Waiting, WordChoice } from "./fasttextShared";

export function FasttextNeighbours() {
  const [report, setReport] = useState<ComparisonReport | null>(null);
  const [word, setWord] = useState("walked");
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchComparison()
      .then((next) => {
        if (!cancelled) setReport(next);
      })
      .catch((error) => {
        if (cancelled) return;
        setMessage(error instanceof ApiError ? error.message : "Something went wrong.");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!report) return <Waiting message={message} />;

  const chosen =
    report.words.find((entry) => entry.word === word) ?? report.words[0];

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
        <span>nearest to</span>
        <WordChoice
          words={report.words.map((entry) => entry.word)}
          value={chosen.word}
          onChange={setWord}
        />
      </div>

      <div className="mt-3 grid gap-4 sm:grid-cols-2">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            reading the spelling
          </p>
          <NeighbourBars entries={chosen.with_pieces} width="w-16" />
        </div>
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            one position per word
          </p>
          <NeighbourBars entries={chosen.without_pieces} width="w-16" />
        </div>
      </div>

      <Legend>
        The two fits agree that {chosen.word} belongs with{" "}
        {chosen.shared.length === 1
          ? `${chosen.shared[0]}, and name`
          : `${chosen.shared.join(", ")}, and name`}{" "}
        {chosen.shared.length} of five words in common. Both lists are drawn to
        their own strongest entry, so the bars compare within a column and not
        across the two.
      </Legend>
    </div>
  );
}
