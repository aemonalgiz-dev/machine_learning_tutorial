"use client";

// One text put through the hash, at a width and a number of hashes the reader
// chooses.
//
// The API multiplies each character's number by each multiplier, reduces the
// products by the width, and reports the buckets, what the table costs, and any
// two characters of the text that came out with the same set. The browser draws
// the strip and the readouts, so the effect of narrowing the table shows up as
// characters merging in front of the reader rather than as a claim.

import { useEffect, useState } from "react";
import { ApiError } from "@/lib/api";
import { HashedTextView, hashText } from "@/lib/concepts/hashing-characters";
import {
  PUBLISHED_BUCKETS,
  TEXT_PRESETS,
  RUNNING_SENTENCE,
  WIDTH_CHOICES,
} from "./hashingCharactersFixtures";

const HASH_CHOICES = [1, 2, 4, 8];

export function CharacterHashExplorer() {
  const [text, setText] = useState(RUNNING_SENTENCE);
  const [nBuckets, setBuckets] = useState(PUBLISHED_BUCKETS);
  const [nHashes, setHashes] = useState(8);
  const [view, setView] = useState<HashedTextView | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let live = true;
    (async () => {
      try {
        const answer = await hashText(text, {
          nBuckets,
          nHashFunctions: nHashes,
        });
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
  }, [text, nBuckets, nHashes]);

  const clashing = new Set(
    (view?.clashes ?? []).flatMap((group) => group.characters),
  );

  return (
    <div>
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

      <div className="mb-3 flex flex-wrap items-center gap-2">
        <span className="text-sm text-slate-600 dark:text-slate-400">
          Hashes each character
        </span>
        {HASH_CHOICES.map((count) => (
          <button
            key={count}
            type="button"
            onClick={() => setHashes(count)}
            className={`rounded-lg px-2.5 py-1 text-sm font-medium ${
              nHashes === count
                ? "bg-indigo-600 text-white"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
            }`}
          >
            {count}
          </button>
        ))}
      </div>

      <textarea
        value={text}
        onChange={(event) => setText(event.target.value.slice(0, 200))}
        rows={2}
        spellCheck={false}
        className="w-full resize-y rounded-lg border border-slate-200 bg-white px-3 py-2 font-mono text-sm text-slate-800 outline-none focus:border-indigo-400 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
      />

      <div className="mt-2 flex flex-wrap gap-2">
        {TEXT_PRESETS.map((preset) => (
          <button
            key={preset.label}
            type="button"
            onClick={() => setText(preset.text)}
            className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
          >
            {preset.label}
          </button>
        ))}
      </div>

      {!view ? (
        <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
          {message ?? "…"}
        </p>
      ) : (
        <>
          <div className="mt-4 flex flex-wrap gap-1.5">
            {view.characters.map((character, position) => (
              <div
                key={`${position}-${character.codepoint}`}
                className={`rounded-md border px-2 py-1 text-center ${
                  clashing.has(character.display)
                    ? "border-amber-400 bg-amber-50 dark:border-amber-500/70 dark:bg-amber-950/30"
                    : "border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800"
                }`}
              >
                <div className="font-mono text-sm text-slate-900 dark:text-slate-100">
                  {character.display}
                </div>
                <div className="font-mono text-[10px] leading-tight text-slate-500 dark:text-slate-400">
                  {character.bucket_ids.slice(0, 2).join(" ")}
                  {character.bucket_ids.length > 2 ? " …" : ""}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-3 grid grid-cols-2 gap-1.5 sm:grid-cols-4">
            <Stat label="characters" value={`${view.n_characters}`} />
            <Stat label="numbers the text becomes" value={`${view.n_ids}`} />
            <Stat
              label="rows in the table"
              value={view.table_rows.toLocaleString()}
            />
            <Stat
              label="characters sharing one set"
              value={view.characters_per_bucket_set.toLocaleString(undefined, {
                maximumFractionDigits: 2,
              })}
            />
          </div>

          <div className="mt-3 rounded-lg bg-slate-100 px-3 py-2 dark:bg-slate-800">
            <div className="text-[11px] text-slate-500 dark:text-slate-400">
              the first character, in full
            </div>
            <div className="font-mono text-sm text-slate-900 dark:text-slate-100">
              {view.characters.length === 0
                ? "nothing was given"
                : `${view.characters[0].display} is ${view.characters[0].codepoint_label}, number ${view.characters[0].codepoint}, and lands in ${view.characters[0].bucket_ids.join(", ")}`}
            </div>
            <div className="mt-1 font-mono text-[11px] text-slate-500 dark:text-slate-400">
              multipliers {view.multipliers.join(", ")}
            </div>
          </div>

          <div
            className={`mt-3 rounded-lg border px-3 py-2 text-xs ${
              view.clashes.length === 0
                ? "border-emerald-300 bg-emerald-50/60 dark:border-emerald-700 dark:bg-emerald-950/20"
                : "border-amber-300 bg-amber-50/60 dark:border-amber-700 dark:bg-amber-950/20"
            }`}
          >
            {view.clashes.length === 0 ? (
              <span className="text-slate-700 dark:text-slate-300">
                All {view.n_distinct_characters} distinct characters of this text
                came out with a different set of buckets at this width.
              </span>
            ) : (
              <span className="text-slate-700 dark:text-slate-300">
                {view.n_distinct_characters} distinct characters came out as{" "}
                {view.n_distinct_bucket_sets} distinct sets. Sharing a set:{" "}
                {view.clashes
                  .map((group) => group.characters.join(" and "))
                  .join("; ")}
                .
              </span>
            )}
          </div>

          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            The strip shows the first two buckets of each character; the readout
            under it spells the first character out in full. Nothing here was
            fitted to any writing, so the same character gets the same buckets
            whatever else is in the box. A space is drawn as ␣.
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
