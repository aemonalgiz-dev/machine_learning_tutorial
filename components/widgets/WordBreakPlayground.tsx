"use client";

// One text cut at every boundary the standard's rules find, with the space rule beside it.
//
// The API applies the boundary rules and splitting on spaces to the same text,
// records where each segment started and stopped in the source, marks which
// segments are words, adds up how much of the text ended up inside a word under
// each rule, and glues the words back with single spaces. The browser draws the
// segments in source order with the words boxed and the rest dimmed, then the
// readouts, then the space rule's answer underneath so the two can be read
// against each other.

import { useEffect, useState } from "react";
import { ApiError } from "@/lib/api";
import { SplitView, readTexts } from "@/lib/concepts/unicode-word-boundaries";
import { PRESETS, RUNNING_SENTENCE, visible } from "./unicodeWordFixtures";

export function WordBreakPlayground() {
  const [text, setText] = useState(RUNNING_SENTENCE);
  const [view, setView] = useState<SplitView | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let live = true;
    (async () => {
      try {
        const answer = await readTexts([text]);
        if (live) {
          setView(answer.texts[0]);
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

  return (
    <div>
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

      {!view ? (
        <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
          {message ?? "…"}
        </p>
      ) : (
        <>
          <div className="mt-4 flex flex-wrap items-end gap-x-1 gap-y-2">
            {view.segments.length === 0 && (
              <p className="text-sm text-slate-500 dark:text-slate-400">
                There is nothing here to find a boundary in, so the rules answer
                with no segments at all.
              </p>
            )}
            {view.segments.map((segment) => (
              <div
                key={`${segment.start}-${segment.end}`}
                className={`rounded-md border px-2 py-1 text-center ${
                  segment.is_word
                    ? "border-indigo-300 bg-indigo-50 dark:border-indigo-500/60 dark:bg-indigo-950/30"
                    : "border-dashed border-slate-300 bg-slate-50 dark:border-slate-700 dark:bg-slate-900/40"
                }`}
              >
                <div
                  className={`whitespace-pre font-mono text-sm ${
                    segment.is_word
                      ? "text-slate-900 dark:text-slate-100"
                      : "text-slate-400 dark:text-slate-500"
                  }`}
                >
                  {visible(segment.text)}
                </div>
                <div className="font-mono text-[11px] text-slate-500 dark:text-slate-400">
                  [{segment.start}, {segment.end})
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 grid grid-cols-2 gap-1.5 sm:grid-cols-4">
            <Stat label="segments" value={`${view.n_segments}`} />
            <Stat label="of those, words" value={`${view.on_boundaries.n_pieces}`} />
            <Stat
              label="characters inside a word"
              value={`${view.on_boundaries.n_characters_in_pieces} of ${view.n_characters}`}
            />
            <Stat
              label="the same text cut at spaces"
              value={`${view.on_spaces.n_pieces} pieces`}
            />
          </div>

          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            <Readback
              title="the words, joined with one space each"
              text={view.on_boundaries.glued}
              exact={view.on_boundaries.glue_is_exact}
            />
            <Readback
              title="the same text cut at spaces, joined back the same way"
              text={view.on_spaces.glued}
              exact={view.on_spaces.glue_is_exact}
            />
          </div>

          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            Every segment is drawn, in order, with the half-open span it covers,
            so the first number is where it starts and the second is one past
            where it stops. A solid box is a word and a dashed one is a segment
            the rules found and the answer drops. A space is drawn as {"␣"} and a
            line break as {"⏎"}.
          </p>
        </>
      )}
    </div>
  );
}

function Readback({
  title,
  text,
  exact,
}: {
  title: string;
  text: string;
  exact: boolean;
}) {
  return (
    <div
      className={`rounded-md border px-3 py-2 ${
        exact
          ? "border-emerald-300 bg-emerald-50/60 dark:border-emerald-700 dark:bg-emerald-950/20"
          : "border-amber-300 bg-amber-50/60 dark:border-amber-700 dark:bg-amber-950/20"
      }`}
    >
      <div className="text-[11px] text-slate-500 dark:text-slate-400">
        {title}
      </div>
      <div className="mt-1 whitespace-pre-wrap font-mono text-xs text-slate-900 dark:text-slate-100">
        {visible(text) || " "}
      </div>
      <div className="mt-1 text-xs text-slate-600 dark:text-slate-400">
        {exact ? "identical to what went in" : "not what went in"}
      </div>
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
