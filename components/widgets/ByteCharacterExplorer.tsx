"use client";

// One text put to all three readings at once, with the strip for whichever is
// chosen.
//
// The API cuts the text into bytes, into characters and into the pieces merged
// from eighteen English sentences, reads each run of numbers straight back, and
// reports whether what came back is what went in. The browser draws the strip
// and the three readouts, so the two lengths and the two round trips can be
// compared on the same text.

import { useEffect, useState } from "react";
import { ApiError } from "@/lib/api";
import {
  Reading,
  ReadingsView,
  readTexts,
} from "@/lib/concepts/bytes-and-characters";
import { PRESETS, RUNNING_SENTENCE, visible } from "./bytesAndCharactersFixtures";

const ORDER: Reading[] = ["bytes", "characters", "learned"];

const BUTTONS: [Reading, string][] = [
  ["bytes", "every byte"],
  ["characters", "every character"],
  ["learned", "pieces learned from a corpus"],
];

export function ByteCharacterExplorer() {
  const [text, setText] = useState(RUNNING_SENTENCE);
  const [reading, setReading] = useState<Reading>("bytes");
  const [view, setView] = useState<ReadingsView | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let live = true;
    (async () => {
      try {
        const answer = await readTexts([text]);
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
  }, [text]);

  const seen = view?.texts[0] ?? null;
  const chosen = seen?.readings.find((entry) => entry.reading === reading);

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <span className="text-sm text-slate-600 dark:text-slate-400">
          Read it as
        </span>
        {BUTTONS.map(([value, label]) => (
          <button
            key={value}
            type="button"
            onClick={() => setReading(value)}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium ${
              reading === value
                ? "bg-indigo-600 text-white"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <textarea
        value={text}
        onChange={(event) => setText(event.target.value.slice(0, 300))}
        rows={2}
        spellCheck={false}
        className="w-full resize-y rounded-lg border border-slate-200 bg-white px-3 py-2 font-mono text-sm text-slate-800 outline-none focus:border-indigo-400 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
      />

      <div className="mt-2 flex flex-wrap gap-2">
        {PRESETS.map((preset) => (
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

      {!view || !seen || !chosen ? (
        <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
          {message ?? "…"}
        </p>
      ) : (
        <>
          <div className="mt-4 flex flex-wrap gap-1.5">
            {chosen.pieces.length === 0 && (
              <p className="text-sm text-slate-500 dark:text-slate-400">
                There is nothing here to read, so it becomes no numbers at all.
              </p>
            )}
            {chosen.pieces.map((piece, position) => (
              <div
                key={`${position}-${piece.token_id}`}
                className={`rounded-md border px-2 py-1 text-center ${
                  piece.known
                    ? "border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800"
                    : "border-amber-400 bg-amber-50 dark:border-amber-500/70 dark:bg-amber-950/30"
                }`}
              >
                <div className="font-mono text-sm text-slate-900 dark:text-slate-100">
                  {visible(piece.text)}
                </div>
                <div className="font-mono text-xs text-slate-500 dark:text-slate-400">
                  {piece.token_id}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-3 grid grid-cols-2 gap-1.5 sm:grid-cols-4">
            <Stat label="entries in the table" value={`${chosen.table_size}`} />
            <Stat label="numbers this text becomes" value={`${chosen.n_tokens}`} />
            <Stat label="pieces it could not spell" value={`${chosen.n_unseen}`} />
            <Stat
              label="comes back exactly"
              value={chosen.exact ? "yes" : "no"}
            />
          </div>

          <div className="mt-3 rounded-lg bg-slate-100 px-3 py-2 dark:bg-slate-800">
            <div className="text-[11px] text-slate-500 dark:text-slate-400">
              read the numbers back
            </div>
            <div className="whitespace-pre-wrap font-mono text-sm text-slate-900 dark:text-slate-100">
              {visible(chosen.decoded) || " "}
            </div>
          </div>

          <div className="mt-3 grid gap-1.5 sm:grid-cols-3">
            {ORDER.map((name) => {
              const entry = seen.readings.find(
                (candidate) => candidate.reading === name,
              );
              if (!entry) return null;
              return (
                <div
                  key={name}
                  className={`rounded-lg border px-3 py-2 text-xs ${
                    entry.exact
                      ? "border-emerald-300 bg-emerald-50/60 dark:border-emerald-700 dark:bg-emerald-950/20"
                      : "border-amber-300 bg-amber-50/60 dark:border-amber-700 dark:bg-amber-950/20"
                  }`}
                >
                  <div className="font-medium text-slate-700 dark:text-slate-300">
                    {entry.label}
                  </div>
                  <div className="mt-1 font-mono text-slate-600 dark:text-slate-400">
                    {entry.n_tokens} numbers, {entry.n_unseen} unspellable
                  </div>
                </div>
              );
            })}
          </div>

          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            This text has {seen.n_characters} characters and {seen.n_bytes} bytes.
            The character table was built from eighteen English sentences and
            holds {view.n_distinct_characters} characters plus one stand-in; the
            learned table holds {view.learned_table} entries after{" "}
            {view.n_merges} merges over the same sentences. A space has nothing
            visible to stand for it, so the strip names it {"Ġ"} under the byte
            reading, and everywhere else on this page it is drawn as {"␣"}.
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
