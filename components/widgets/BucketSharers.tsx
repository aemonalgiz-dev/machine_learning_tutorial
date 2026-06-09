"use client";

// One character, its buckets, and everything else that lands in all of them.
//
// The API works out how far apart two character numbers have to be to agree
// under every hash, walks the whole codepoint space at that spacing, and hands
// back the ones Unicode has a name for. The browser draws the buckets and the
// crowd, so the size of the crowd and the width of the table can be moved
// against each other.

import { useEffect, useState } from "react";
import { ApiError } from "@/lib/api";
import { CollisionsView, findSharers } from "@/lib/concepts/hashing-characters";
import {
  CHARACTER_CHOICES,
  PUBLISHED_BUCKETS,
  WIDTH_CHOICES,
} from "./hashingCharactersFixtures";

export function BucketSharers() {
  const [character, setCharacter] = useState("A");
  const [nBuckets, setBuckets] = useState(PUBLISHED_BUCKETS);
  const [view, setView] = useState<CollisionsView | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let live = true;
    (async () => {
      try {
        const answer = await findSharers(character, nBuckets);
        if (live) {
          setView(answer);
          setMessage(null);
        }
      } catch (error) {
        if (!live) return;
        setView(null);
        setMessage(
          error instanceof ApiError ? error.message : "Something went wrong.",
        );
      }
    })();
    return () => {
      live = false;
    };
  }, [character, nBuckets]);

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <span className="text-sm text-slate-600 dark:text-slate-400">
          Character
        </span>
        {CHARACTER_CHOICES.map((choice) => (
          <button
            key={choice}
            type="button"
            onClick={() => setCharacter(choice)}
            className={`rounded-lg px-2.5 py-1 font-mono text-sm ${
              character === choice
                ? "bg-indigo-600 text-white"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
            }`}
          >
            {choice}
          </button>
        ))}
      </div>

      <div className="mb-3 flex flex-wrap items-center gap-2">
        <span className="text-sm text-slate-600 dark:text-slate-400">
          Buckets
        </span>
        {WIDTH_CHOICES.map((width) => (
          <button
            key={width}
            type="button"
            onClick={() => setBuckets(width)}
            className={`rounded-lg px-2.5 py-1 text-sm font-medium ${
              nBuckets === width
                ? "bg-indigo-600 text-white"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
            }`}
          >
            {width.toLocaleString()}
          </button>
        ))}
      </div>

      {!view ? (
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {message ?? "…"}
        </p>
      ) : (
        <>
          <div className="rounded-lg bg-slate-100 px-3 py-2 dark:bg-slate-800">
            <div className="text-[11px] text-slate-500 dark:text-slate-400">
              {view.codepoint_label}
              {view.unicode_name ? `, ${view.unicode_name.toLowerCase()}` : ""}
            </div>
            <div className="mt-1 flex flex-wrap gap-1.5">
              {view.bucket_ids.map((bucket, position) => (
                <span
                  key={`${position}-${bucket}`}
                  className="rounded-md bg-white px-2 py-0.5 font-mono text-xs text-slate-800 dark:bg-slate-900 dark:text-slate-200"
                >
                  {bucket}
                </span>
              ))}
            </div>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-1.5 sm:grid-cols-3">
            <Stat
              label="others with the same set"
              value={view.n_sharers.toLocaleString()}
            />
            <Stat
              label="of those, ones Unicode names"
              value={`${view.n_named_sharers}`}
            />
            <Stat
              label="spacing between them"
              value={view.sharing_step.toLocaleString()}
            />
          </div>

          <div className="mt-3 space-y-1">
            {view.named.length === 0 ? (
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Every character that shares this set falls in a part of the space
                Unicode has assigned nothing to, so there is nothing to show.
                They are still there, and a text carrying one would be read as
                this character.
              </p>
            ) : (
              view.named.map((sharer) => (
                <div
                  key={sharer.codepoint}
                  className="flex items-baseline gap-3 rounded-md border border-slate-200 px-3 py-1.5 dark:border-slate-700"
                >
                  <span className="font-mono text-base text-slate-900 dark:text-slate-100">
                    {sharer.character}
                  </span>
                  <span className="font-mono text-xs text-slate-500 dark:text-slate-400">
                    {sharer.codepoint_label}
                  </span>
                  <span className="text-xs text-slate-600 dark:text-slate-400">
                    {sharer.unicode_name.toLowerCase()}
                  </span>
                </div>
              ))
            )}
          </div>

          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            Every character listed here produces the identical set of buckets,
            checked one by one rather than argued from the spacing. A model reads
            those buckets and nothing else, so it has no way of telling any of
            these apart from {view.display}. Narrow the table and the crowd
            grows; widen it and the crowd shrinks and the rows cost more.
          </p>
        </>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-slate-100 px-2 py-1.5 dark:bg-slate-800">
      <div className="text-[11px] text-slate-500 dark:text-slate-400">
        {label}
      </div>
      <div className="font-mono text-sm font-semibold text-slate-900 dark:text-slate-100">
        {value}
      </div>
    </div>
  );
}
