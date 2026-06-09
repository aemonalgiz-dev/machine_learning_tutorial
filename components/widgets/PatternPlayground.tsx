"use client";

// Any text, cut by any of seven patterns, with the spacing drawn.
//
// The API reads the text with whichever pattern the reader chose and with the
// four earlier rules of the sibling pages beside it, and reports every piece,
// the span it claims, whether it carries a leading space, which branch produced
// it, and whether the pieces concatenate back to the whole text. The browser
// draws the pattern in force, the pieces with their spacing visible, and the
// four earlier rules underneath.

import { useEffect, useState } from "react";
import { ApiError } from "@/lib/api";
import {
  PatternKey,
  PatternReading,
  Reading,
  readTexts,
} from "@/lib/concepts/the-pattern-language-models-use";
import { PieceChip, Stat } from "@/components/widgets/PieceChip";
import {
  PATTERN_CHOICES,
  PATTERN_FIXTURES,
} from "@/components/widgets/patternFixtures";

const BRANCH_NAMES = [
  "a listed contraction",
  "a listed contraction",
  "a listed contraction",
  "a listed contraction",
  "a listed contraction",
  "a listed contraction",
  "a listed contraction",
  "an optional space, then letters",
  "an optional space, then digits",
  "an optional space, then marks",
  "spacing, less its last character",
  "spacing",
];

export function PatternPlayground() {
  const [text, setText] = useState(PATTERN_FIXTURES[0].text);
  const [pattern, setPattern] = useState<PatternKey>("the-pattern");
  const [view, setView] = useState<PatternReading | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let live = true;
    (async () => {
      try {
        const result = await readTexts([text], pattern);
        if (live) {
          setView(result.texts[0]);
          setMessage(null);
        }
      } catch (error) {
        if (live) {
          setMessage(
            error instanceof ApiError ? error.message : "Something went wrong.",
          );
        }
      }
    })();
    return () => {
      live = false;
    };
  }, [text, pattern]);

  return (
    <div>
      <div className="flex flex-wrap gap-1.5">
        {PATTERN_FIXTURES.map((fixture) => (
          <button
            key={fixture.name}
            type="button"
            onClick={() => setText(fixture.text)}
            title={fixture.note}
            className={`rounded-lg border px-2.5 py-1 text-xs ${
              text === fixture.text
                ? "border-indigo-400 bg-indigo-50 text-indigo-800 dark:border-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-200"
                : "border-slate-200 text-slate-600 hover:border-slate-300 dark:border-slate-700 dark:text-slate-400"
            }`}
          >
            {fixture.name}
          </button>
        ))}
      </div>

      <textarea
        value={text}
        onChange={(event) => setText(event.target.value.slice(0, 400))}
        rows={2}
        spellCheck={false}
        className="mt-3 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 font-mono text-xs text-slate-800 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
      />

      <div className="mt-3 flex flex-wrap gap-1.5">
        {PATTERN_CHOICES.map((choice) => (
          <button
            key={choice.key}
            type="button"
            onClick={() => setPattern(choice.key as PatternKey)}
            className={`rounded-lg border px-2.5 py-1 text-xs ${
              pattern === choice.key
                ? "border-emerald-400 bg-emerald-50 text-emerald-800 dark:border-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-200"
                : "border-slate-200 text-slate-600 hover:border-slate-300 dark:border-slate-700 dark:text-slate-400"
            }`}
          >
            {choice.name}
          </button>
        ))}
      </div>

      {!view ? (
        <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
          {message ?? "…"}
        </p>
      ) : (
        <div className="mt-4">
          <div className="rounded-lg border border-slate-200 px-3 py-2 dark:border-slate-800">
            <div className="text-[11px] text-slate-500 dark:text-slate-400">
              {view.pattern_label}, which reads {view.pattern_note}
            </div>
            <div className="mt-1 overflow-x-auto font-mono text-xs break-all text-slate-800 dark:text-slate-200">
              {view.pattern_source}
            </div>
          </div>

          <div className="mt-3 flex flex-wrap gap-1">
            {view.pieces.map((piece) => (
              <PieceChip
                key={`${piece.start}-${piece.end}`}
                text={piece.text}
                tone={piece.has_a_leading_space ? "spaced" : "plain"}
                title={
                  piece.branch === null
                    ? `characters ${piece.start} to ${piece.end}`
                    : `${BRANCH_NAMES[piece.branch]}, characters ${piece.start} to ${piece.end}`
                }
              />
            ))}
          </div>

          <div className="mt-3 grid grid-cols-2 gap-1.5 sm:grid-cols-4">
            <Stat label="pieces" value={`${view.n_pieces}`} />
            <Stat
              label="carrying a leading space"
              value={`${view.n_with_a_leading_space}`}
            />
            <Stat
              label="characters kept of the text"
              value={`${view.n_characters_in_pieces} of ${view.n_characters}`}
            />
            <Stat
              label="joined back with nothing between"
              value={view.joins_back_exactly ? "the text" : "not the text"}
            />
          </div>

          <div className="mt-4 space-y-1.5">
            <EarlierRule reading={view.on_spaces} />
            <EarlierRule reading={view.on_boundaries} />
            <EarlierRule reading={view.on_annotation_rules} />
            <EarlierRule reading={view.on_translation_rules} />
          </div>

          <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
            A raised dot stands for a space, an arrow for a tab and a return
            mark for a line break. A piece shaded blue is one that carries its
            own leading space, so the same word after a space and at the start
            of a line are two different pieces. Hovering a piece names the
            branch that produced it and the characters of the text it covers.
          </p>
        </div>
      )}
    </div>
  );
}

function EarlierRule({ reading }: { reading: Reading }) {
  return (
    <div className="rounded-lg border border-slate-200 px-3 py-1.5 dark:border-slate-800">
      <div className="text-[11px] text-slate-500 dark:text-slate-400">
        {reading.label} ({reading.n_pieces} pieces,{" "}
        {reading.joins_back_exactly
          ? "and joining them gives the text back"
          : "and joining them does not give the text back"}
        )
      </div>
      <div className="mt-1 flex flex-wrap gap-1">
        {reading.pieces.map((piece, position) => (
          <PieceChip key={`${position}-${piece}`} text={piece} />
        ))}
      </div>
    </div>
  );
}
