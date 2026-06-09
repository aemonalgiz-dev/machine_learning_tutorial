"use client";

// One text cut at every run of white space, with the span each piece came from.
//
// The API applies the rule, records where each piece started and stopped in the
// source, adds up how much of the text ended up inside a piece, and reads the
// pieces back both ways, glued with single spaces and rebuilt from the spans.
// The browser lays the source out with the pieces boxed in place, so the gaps
// between them are visible as gaps, and shows the readouts underneath.

import { useEffect, useState } from "react";
import { ApiError } from "@/lib/api";
import { SplitView, splitTexts } from "@/lib/concepts/splitting-on-spaces";
import { PRESETS, RUNNING_SENTENCE, visible } from "./spaceSplitFixtures";

export function SpaceSplitExplorer() {
  const [text, setText] = useState(RUNNING_SENTENCE);
  const [view, setView] = useState<SplitView | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let live = true;
    (async () => {
      try {
        const answer = await splitTexts([text]);
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
          <div className="mt-4 flex flex-wrap items-end gap-x-0.5 gap-y-2">
            {view.pieces.length === 0 && (
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Nothing here is a run of characters that are not white space, so
                the rule finds no words at all.
              </p>
            )}
            {view.pieces.map((piece, position) => (
              <div key={`${piece.start}-${piece.end}`} className="flex items-end">
                <Gap gap={view.gaps[position]} />
                <div className="rounded-md border border-indigo-300 bg-indigo-50 px-2 py-1 text-center dark:border-indigo-500/60 dark:bg-indigo-950/30">
                  <div className="whitespace-pre font-mono text-sm text-slate-900 dark:text-slate-100">
                    {piece.text}
                  </div>
                  <div className="font-mono text-[11px] text-slate-500 dark:text-slate-400">
                    [{piece.start}, {piece.end})
                  </div>
                </div>
              </div>
            ))}
            <Gap gap={view.gaps[view.gaps.length - 1]} />
          </div>

          <div className="mt-4 grid grid-cols-2 gap-1.5 sm:grid-cols-4">
            <Stat label="pieces" value={`${view.n_pieces}`} />
            <Stat
              label="characters inside a piece"
              value={`${view.n_characters_in_pieces} of ${view.n_characters}`}
            />
            <Stat
              label="share of the text kept"
              value={`${(view.share_covered * 100).toFixed(1)}%`}
            />
            <Stat
              label="one space between each, exactly"
              value={view.glue_is_exact ? "yes" : "no"}
            />
          </div>

          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            <Readback
              title="the pieces joined with one space each"
              text={view.glued}
              exact={view.glue_is_exact}
            />
            <Readback
              title="the pieces put back at their spans"
              text={view.rebuilt}
              exact={view.rebuild_is_exact}
            />
          </div>

          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            Each piece is drawn with the half-open span it was cut from, so the
            first number is where it starts and the second is one past where it
            stops. A space is drawn as {"␣"}, a line break as {"⏎"} and a tab as{" "}
            {"⇥"}.
          </p>
        </>
      )}
    </div>
  );
}

function Gap({ gap }: { gap: string | undefined }) {
  if (!gap) return null;
  return (
    <span className="whitespace-pre px-0.5 pb-5 font-mono text-sm text-amber-600 dark:text-amber-500">
      {visible(gap)}
    </span>
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
