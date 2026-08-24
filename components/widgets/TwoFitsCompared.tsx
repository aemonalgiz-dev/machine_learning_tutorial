"use client";

// The same texts fitted twice from two different random starts.
//
// Each panel reports one fit: how much nearer two words of one topic came out
// than two words of different topics, the watched word's coordinates, and the
// words that fit put nearest it. The stats beneath compare the two fits against
// each other, which is the point, since a table with no fixed axes cannot be
// compared coordinate by coordinate even when both fits found the same shape.
// The API runs both fits once and caches them; the browser lays them out.

import { useEffect, useState } from "react";
import { ApiError } from "@/lib/api";
import { TwoFitsView, fetchTwoFits } from "@/lib/concepts/a-vector-for-a-word";

export function TwoFitsCompared() {
  const [view, setView] = useState<TwoFitsView | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setView(await fetchTwoFits());
      } catch (error) {
        setMessage(error instanceof ApiError ? error.message : "Something went wrong.");
      }
    })();
  }, []);

  if (!view) {
    return <p className="text-sm text-slate-500 dark:text-slate-400">{message ?? "…"}</p>;
  }

  return (
    <div>
      <div className="grid gap-3 sm:grid-cols-2">
        {view.fits.map((fit, index) => (
          <div
            key={fit.seed}
            className="rounded-lg border border-slate-200 p-3 dark:border-slate-800"
          >
            <div className="text-[11px] uppercase tracking-wide text-slate-500 dark:text-slate-400">
              fit {index === 0 ? "one" : "two"}, same texts, different start
            </div>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <Stat label="mean cosine within a topic" value={fit.within_topic.toFixed(4)} />
              <Stat label="mean cosine across topics" value={fit.across_topic.toFixed(4)} />
            </div>
            <div className="mt-2 text-[11px] text-slate-500 dark:text-slate-400">
              first three coordinates of {view.watched}
            </div>
            <div className="font-mono text-xs text-slate-800 dark:text-slate-200">
              ({fit.watched_vector.slice(0, 3).map((value) => value.toFixed(4)).join(", ")}, …)
            </div>
            <div className="mt-2 text-[11px] text-slate-500 dark:text-slate-400">
              nearest {view.watched}
            </div>
            <div className="font-mono text-xs text-slate-800 dark:text-slate-200">
              {fit.watched_neighbours
                .map((row) => `${row.word} ${row.cosine.toFixed(4)}`)
                .join(", ")}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Stat
          label={`${view.watched} in one fit against itself in the other`}
          value={view.self_cosine.toFixed(4)}
        />
        <Stat
          label="mean gap in a first coordinate"
          value={view.mean_first_coordinate_gap.toFixed(4)}
        />
        <Stat
          label="largest gap in a first coordinate"
          value={view.largest_first_coordinate_gap.toFixed(4)}
        />
        <Stat
          label="nearest-word places holding the same word"
          value={`${view.shared_neighbour_places} of ${view.neighbour_places}`}
        />
      </div>

      {message && <p className="mt-2 text-sm text-rose-600">{message}</p>}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-slate-100 px-2 py-1.5 dark:bg-slate-800">
      <div className="text-[11px] text-slate-500 dark:text-slate-400">{label}</div>
      <div className="font-mono text-sm font-semibold text-slate-900 dark:text-slate-100">
        {value}
      </div>
    </div>
  );
}
