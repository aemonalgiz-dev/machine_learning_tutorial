"use client";

// One text, cut into pieces, with the number each piece goes in as.
//
// The two schemes share a table built from the same six sentences, so the only
// thing that differs between them is what counts as a piece. The API cuts the
// text, looks every piece up, reads the numbers back again and reports whether
// what came back is the text that went in; the browser draws the strip, marks
// the pieces the table had never seen, and shows the readouts underneath.

import { useEffect, useState } from "react";
import { ApiError } from "@/lib/api";
import {
  EncodeView,
  Scheme,
  encodeTexts,
} from "@/lib/concepts/what-a-token-is";
import { PRESETS, RUNNING_SENTENCE, visible } from "./tokenBasicsFixtures";

export function TokenStripExplorer() {
  const [text, setText] = useState(RUNNING_SENTENCE);
  const [scheme, setScheme] = useState<Scheme>("word");
  const [view, setView] = useState<EncodeView | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let live = true;
    (async () => {
      try {
        const answer = await encodeTexts([text], scheme);
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
  }, [text, scheme]);

  const encoding = view?.encodings[0] ?? null;

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <span className="text-sm text-slate-600 dark:text-slate-400">
          Pieces are
        </span>
        {(
          [
            ["word", "whole words"],
            ["character", "single characters"],
          ] as [Scheme, string][]
        ).map(([value, label]) => (
          <button
            key={value}
            type="button"
            onClick={() => setScheme(value)}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium ${
              scheme === value
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
        onChange={(event) => setText(event.target.value.slice(0, 400))}
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

      {!view || !encoding ? (
        <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
          {message ?? "…"}
        </p>
      ) : (
        <>
          <div className="mt-4 flex flex-wrap gap-1.5">
            {encoding.tokens.length === 0 && (
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Nothing in this text counts as a piece, so it becomes no numbers
                at all.
              </p>
            )}
            {encoding.tokens.map((token, position) => (
              <div
                key={`${position}-${token.token_id}`}
                className={`rounded-md border px-2 py-1 text-center ${
                  token.known
                    ? "border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800"
                    : "border-amber-400 bg-amber-50 dark:border-amber-500/70 dark:bg-amber-950/30"
                }`}
              >
                <div className="font-mono text-sm text-slate-900 dark:text-slate-100">
                  {visible(token.text)}
                </div>
                <div className="font-mono text-xs text-slate-500 dark:text-slate-400">
                  {token.token_id}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-3 grid grid-cols-2 gap-1.5 sm:grid-cols-4">
            <Stat label="pieces in the table" value={`${view.vocabulary_size}`} />
            <Stat label="numbers this text becomes" value={`${encoding.n_tokens}`} />
            <Stat
              label="pieces the table never saw"
              value={`${encoding.n_unknown}`}
            />
            <Stat
              label="comes back exactly"
              value={encoding.round_trip_exact ? "yes" : "no"}
            />
          </div>

          <div className="mt-3 rounded-lg bg-slate-100 px-3 py-2 dark:bg-slate-800">
            <div className="text-[11px] text-slate-500 dark:text-slate-400">
              read the numbers back
            </div>
            <div className="whitespace-pre-wrap font-mono text-sm text-slate-900 dark:text-slate-100">
              {visible(encoding.decoded) || " "}
            </div>
          </div>

          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            The table was built from six sentences and holds{" "}
            {view.n_pieces_learned}{" "}
            {scheme === "word" ? "distinct words" : "distinct characters"} plus
            one stand-in at number 0. A space is drawn as {"␣"} and a line
            break as {"⏎"}.
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
