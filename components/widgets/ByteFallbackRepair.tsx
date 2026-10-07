"use client";

// Three texts read twice by the same 85 merges, once with a spelling for every
// character and once without.
//
// The API fits the eighteen-sentence corpus both ways and encodes each text
// with each fit, then glues the pieces back and says whether what came out is
// what went in. It also counts how much of each reading is raw bytes rather
// than anything the corpus taught, which is what the repair costs. The browser
// only draws. Switch texts to see the cost go from one piece to twenty-four.

import { useEffect, useState } from "react";
import {
  FallbackView,
  fetchFallback,
  messageFor,
} from "@/lib/concepts/byte-pair-encoding";
import { Pieces, Stat } from "./bytePairEncodingParts";

export function ByteFallbackRepair() {
  const [view, setView] = useState<FallbackView | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [which, setWhich] = useState("sentence");

  useEffect(() => {
    (async () => {
      try {
        setView(await fetchFallback());
      } catch (error) {
        setMessage(messageFor(error));
      }
    })();
  }, []);

  if (!view) {
    return (
      <p className="text-sm text-slate-500 dark:text-slate-400">
        {message ?? "…"}
      </p>
    );
  }

  const chosen = view.texts.find((text) => text.key === which) ?? view.texts[0];

  return (
    <div>
      <div className="mb-3 flex flex-wrap gap-2">
        {view.texts.map((text) => (
          <button
            key={text.key}
            type="button"
            onClick={() => setWhich(text.key)}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition ${
              chosen.key === text.key
                ? "bg-indigo-600 text-white"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
            }`}
          >
            {text.label}
          </button>
        ))}
      </div>

      <p className="mb-3 font-mono text-sm text-slate-700 dark:text-slate-300">
        {chosen.text}
      </p>
      <p className="mb-3 text-xs text-slate-500 dark:text-slate-400">
        {chosen.n_characters} characters, of which{" "}
        {chosen.characters_unseen.length === 0
          ? "every one appears somewhere in the eighteen sentences"
          : `${chosen.characters_unseen.length} never appear in the eighteen sentences, namely ${chosen.characters_unseen.join(" ")}`}
        .
      </p>

      <div className="grid gap-3 sm:grid-cols-2">
        {chosen.readings.map((reading) => (
          <div
            key={reading.key}
            className="rounded-lg border border-slate-200 p-3 dark:border-slate-800"
          >
            <p className="mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">
              {reading.label}
            </p>
            <Pieces
              pieces={reading.pieces}
              tone={reading.key === "published" ? "muted" : "learned"}
            />
            <div className="mt-3 grid grid-cols-2 gap-2">
              <Stat label="pieces" value={reading.n_pieces} />
              <Stat
                label="of those, raw bytes"
                value={reading.n_byte_rows}
              />
            </div>
            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
              Glued back together:{" "}
              <span className="font-mono text-slate-700 dark:text-slate-300">
                {reading.decoded}
              </span>
            </p>
            <p
              className={`mt-1 text-xs font-medium ${
                reading.round_trip_exact
                  ? "text-emerald-700 dark:text-emerald-400"
                  : "text-amber-700 dark:text-amber-400"
              }`}
            >
              {reading.round_trip_exact
                ? "identical to what went in"
                : "not what went in, and nothing said so"}
            </p>
          </div>
        ))}
      </div>

      <>
<p className="mt-2 text-xs text-slate-500 dark:text-slate-400">The two readings share the same 85 learned merges and the same {view.alphabet_size}-symbol starting alphabet. What differs is the treatment of an unfamiliar symbol.</p><p className="mt-2 text-xs text-slate-500 dark:text-slate-400">The left reading substitutes an unknown entry. The right represents the symbol with bytes, shown in blue, and handles the word-end marker separately. This fallback requires {view.floor_rows} additional vocabulary entries. Compare the decoded text to see what that extra representation preserves.</p>
</>
    </div>
  );
}
