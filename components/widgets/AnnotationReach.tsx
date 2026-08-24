"use client";

// What a corpus somebody marked only in part is worth to each of the two methods.
//
// The API draws one marking of two hundred sentences at each share, then counts
// two things over that same marking: how many gaps carry an answer, which is
// every marked gap, and how many characters have a settled place in their word,
// which needs the gaps on both sides of the character to have been marked. The
// browser draws the two shares as paired bars. What to look at is the gap
// between them in the middle of the range, since that is the annotation a
// whole-sequence learner cannot use.

import { useEffect, useState } from "react";
import {
  ComparisonView,
  fetchComparison,
  messageFor,
  percent,
} from "@/lib/concepts/learning-boundaries-from-examples";
import { Loading, Stat } from "./pointwiseParts";

const GAP_COLOUR = "#0ea5e9";
const PLACE_COLOUR = "#f43f5e";

export function AnnotationReach() {
  const [view, setView] = useState<ComparisonView | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setView(await fetchComparison());
      } catch (error) {
        setMessage(messageFor(error));
      }
    })();
  }, []);

  if (!view) {
    return <Loading message={message} />;
  }

  const rows = view.annotation;
  const middle = rows.find((row) => row.share_marked === 0.4) ?? rows[0];

  return (
    <div className="rounded-lg border border-slate-200 p-3 dark:border-slate-800">
      <p className="mb-3 text-xs text-slate-500 dark:text-slate-400">
        Two hundred sentences, {rows[0].n_gaps} gaps between them, with a share
        of those gaps marked and the rest left alone.
      </p>

      <div className="space-y-3">
        {rows.map((row) => (
          <div key={row.share_marked}>
            <div className="mb-1 flex justify-between text-xs text-slate-500 dark:text-slate-400">
              <span>{percent(row.share_marked, 0)} of the gaps marked</span>
              <span className="font-mono">
                {row.n_marked} gaps, {row.n_known_places} settled places
              </span>
            </div>
            <div className="space-y-1">
              <div className="h-3 w-full rounded bg-slate-100 dark:bg-slate-800">
                <div
                  className="h-3 rounded"
                  style={{
                    width: `${row.share_usable_gaps * 100}%`,
                    backgroundColor: GAP_COLOUR,
                  }}
                  title={`one answer per gap keeps ${percent(row.share_usable_gaps, 2)}`}
                />
              </div>
              <div className="h-3 w-full rounded bg-slate-100 dark:bg-slate-800">
                <div
                  className="h-3 rounded"
                  style={{
                    width: `${row.share_known_places * 100}%`,
                    backgroundColor: PLACE_COLOUR,
                  }}
                  title={`the whole-sequence method keeps ${percent(row.share_known_places, 2)}`}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <p className="mt-3 flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
        <span className="flex items-center gap-1.5">
          <span
            className="inline-block h-2 w-4 rounded"
            style={{ backgroundColor: GAP_COLOUR }}
          />
          gaps that are a training example
        </span>
        <span className="flex items-center gap-1.5">
          <span
            className="inline-block h-2 w-4 rounded"
            style={{ backgroundColor: PLACE_COLOUR }}
          />
          characters whose place in a word is settled
        </span>
      </p>

      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
        <Stat
          label="at two fifths marked, gaps kept"
          value={percent(middle.share_usable_gaps, 2)}
        />
        <Stat
          label="at two fifths marked, places settled"
          value={percent(middle.share_known_places, 2)}
        />
        <Stat
          label="the ratio between them"
          value={(
            middle.share_usable_gaps / middle.share_known_places
          ).toFixed(2)}
        />
      </div>
    </div>
  );
}
