"use client";

// A word the corpus really does hold, taken out of it, and then asked for.
//
// Every sentence containing one word is dropped, both fits are run again on
// what is left, and the word is asked for. The fit that reads spellings still
// answers; the fit that learns one position per word says what it says at the
// bottom. The API drops the sentences, fits both and measures; the browser
// draws.

import { useEffect, useState } from "react";
import { ApiError, HeldOutReport, fetchHeldOut } from "@/lib/concepts/fasttext";
import { Legend, NeighbourBars, Stat, Waiting } from "./fasttextShared";

export function FasttextHeldOut() {
  const [report, setReport] = useState<HeldOutReport | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchHeldOut()
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

  return (
    <div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Stat label="sentences dropped" value={report.n_sentences_dropped.toString()} />
        <Stat
          label="occurrences dropped"
          value={report.n_occurrences_dropped.toString()}
        />
        <Stat label="words left" value={report.n_words_left.toString()} />
        <Stat
          label="rows its pieces still reach"
          value={`${report.shared_buckets} of ${report.n_pieces}`}
        />
      </div>

      <div className="mt-2 grid grid-cols-2 gap-2">
        <Stat
          label="mean cosine to the other verb forms"
          value={report.mean_to_verbs.toFixed(4)}
        />
        <Stat
          label="mean cosine to the money words"
          value={report.mean_to_money.toFixed(4)}
        />
      </div>

      <p className="mt-4 text-sm text-slate-600 dark:text-slate-300">
        The words nearest {report.word} in a corpus that no longer contains it.
      </p>
      <div className="mt-2">
        <NeighbourBars entries={report.nearest} />
      </div>

      <p className="mt-4 rounded-lg border-l-4 border-amber-400 bg-amber-50/60 px-4 py-2 text-sm text-slate-700 dark:border-amber-500/70 dark:bg-amber-950/20 dark:text-slate-300">
        {report.plain_refusal}
      </p>

      <Legend>
        As it stands the corpus has no rare words at all, since its commonest
        word appears {report.most_occurrences} times, its rarest{" "}
        {report.fewest_occurrences}, and {report.words_seen_once} of them appear
        once. The missing word had to be made by hand.
      </Legend>
    </div>
  );
}
