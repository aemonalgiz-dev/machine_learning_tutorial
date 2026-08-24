"use client";

// One text cut by the Penn Treebank rules, with the two rules it argues with beside it.
//
// The API applies the treebank rules, the same rules with the bracket spellings
// switched on, splitting on spaces and the Unicode boundary rules to one text,
// records for every piece the span it claims and the slice of source that span
// actually covers, and adds up how much of the text ended up inside a piece
// under each rule. The browser draws the treebank pieces in source order with a
// piece whose text is no longer its source marked, then the readouts, then the
// other two rules' answers underneath so the three can be read against each
// other.

import { useEffect, useState } from "react";
import { ApiError } from "@/lib/api";
import { SplitView, readTexts } from "@/lib/concepts/penn-treebank-rules";
import { PRESETS, RUNNING_SENTENCE, visible } from "./treebankFixtures";

export function TreebankPlayground() {
  const [text, setText] = useState(RUNNING_SENTENCE);
  const [nameBrackets, setNameBrackets] = useState(false);
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

  const rule = view
    ? nameBrackets
      ? view.on_treebank_naming_brackets
      : view.on_treebank
    : null;

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

      <label className="mt-3 flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
        <input
          type="checkbox"
          checked={nameBrackets}
          onChange={(event) => setNameBrackets(event.target.checked)}
          className="h-3.5 w-3.5 accent-indigo-600"
        />
        Spell a separated bracket with the treebank&rsquo;s own name for it
      </label>

      {!view || !rule ? (
        <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
          {message ?? "…"}
        </p>
      ) : (
        <>
          <div className="mt-4 flex flex-wrap items-end gap-x-1 gap-y-2">
            {rule.pieces.length === 0 && (
              <p className="text-sm text-slate-500 dark:text-slate-400">
                There is nothing here to cut, so the rules answer with no pieces
                at all.
              </p>
            )}
            {rule.pieces.map((piece) => (
              <div
                key={`${piece.start}-${piece.end}`}
                className={`rounded-md border px-2 py-1 text-center ${
                  piece.is_rewritten
                    ? "border-amber-400 bg-amber-50 dark:border-amber-500/70 dark:bg-amber-950/25"
                    : "border-indigo-300 bg-indigo-50 dark:border-indigo-500/60 dark:bg-indigo-950/30"
                }`}
              >
                <div className="whitespace-pre font-mono text-sm text-slate-900 dark:text-slate-100">
                  {visible(piece.text)}
                </div>
                <div className="font-mono text-[11px] text-slate-500 dark:text-slate-400">
                  [{piece.start}, {piece.end})
                </div>
                {piece.is_rewritten && (
                  <div className="font-mono text-[11px] text-amber-700 dark:text-amber-400">
                    was {visible(piece.source)}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-4 grid grid-cols-2 gap-1.5 sm:grid-cols-4">
            <Stat label="pieces" value={`${rule.n_pieces}`} />
            <Stat
              label="pieces no longer their source"
              value={`${rule.n_rewritten}`}
            />
            <Stat
              label="characters inside a piece"
              value={`${rule.n_characters_in_pieces} of ${view.n_characters}`}
            />
            <Stat
              label="characters that are not spacing"
              value={`${view.n_non_space_characters}`}
            />
          </div>

          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            <Beside
              title={`the same text cut at every run of spaces (${view.on_spaces.n_pieces})`}
              pieces={view.on_spaces.pieces.map((piece) => piece.text)}
            />
            <Beside
              title={`the same text cut at every boundary the standard finds (${view.on_boundaries.n_pieces})`}
              pieces={view.on_boundaries.pieces.map((piece) => piece.text)}
            />
          </div>

          <div className="mt-2 rounded-md border border-slate-200 px-3 py-2 dark:border-slate-800">
            <div className="text-[11px] text-slate-500 dark:text-slate-400">
              the pieces joined with one space each
            </div>
            <div className="mt-1 whitespace-pre-wrap font-mono text-xs text-slate-900 dark:text-slate-100">
              {visible(rule.glued) || " "}
            </div>
            <div className="mt-1 text-xs text-slate-600 dark:text-slate-400">
              {rule.glue_is_exact
                ? "identical to what went in"
                : "not what went in"}
              , and reading the spans back out of the source recovers everything
              that is not spacing
              {rule.spans_recover_the_source ? "" : " only in part"}.
            </div>
          </div>

          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            Every piece is drawn, in order, with the half-open span it claims, so
            the first number is where it starts and the second is one past where
            it stops. An amber piece is one whose text is not the source its span
            names, and it says underneath what that source was. A space is drawn
            as {"␣"}.
          </p>
        </>
      )}
    </div>
  );
}

function Beside({ title, pieces }: { title: string; pieces: string[] }) {
  return (
    <div className="rounded-md border border-slate-200 px-3 py-2 dark:border-slate-800">
      <div className="text-[11px] text-slate-500 dark:text-slate-400">
        {title}
      </div>
      <div className="mt-1 flex flex-wrap gap-1">
        {pieces.map((piece, position) => (
          <span
            key={`${position}-${piece}`}
            className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-xs text-slate-800 dark:bg-slate-800 dark:text-slate-200"
          >
            {visible(piece)}
          </span>
        ))}
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
