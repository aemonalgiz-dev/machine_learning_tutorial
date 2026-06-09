"use client";

// Every character of one short text, with the class the rules give it.
//
// The API asks the boundary rules for the class of each character and for the
// segments the text becomes, and reports both together, so each entry carries
// its class and whether a word ended immediately before it. The browser draws
// the characters in a row with a rule between two of them wherever a boundary
// fell, and colours each entry by its class so the runs of one class are visible
// as runs.

import { useEffect, useState } from "react";
import { ApiError } from "@/lib/api";
import { SplitView, readTexts } from "@/lib/concepts/unicode-word-boundaries";
import { SHORT_TEXT, visible } from "./unicodeWordFixtures";

const TONE: Record<string, string> = {
  "a letter":
    "border-indigo-300 bg-indigo-50 text-indigo-900 dark:border-indigo-500/60 dark:bg-indigo-950/40 dark:text-indigo-200",
  "a digit":
    "border-emerald-300 bg-emerald-50 text-emerald-900 dark:border-emerald-600/60 dark:bg-emerald-950/40 dark:text-emerald-200",
  "a space":
    "border-slate-300 bg-slate-100 text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400",
};

const OTHER_TONE =
  "border-amber-300 bg-amber-50 text-amber-900 dark:border-amber-600/60 dark:bg-amber-950/40 dark:text-amber-200";

let sharedPromise: Promise<SplitView> | null = null;

async function fetchShortText(): Promise<SplitView> {
  if (!sharedPromise) {
    sharedPromise = readTexts([SHORT_TEXT]).then((answer) => answer.texts[0]);
  }
  return sharedPromise;
}

export function CharacterClassStrip() {
  const [view, setView] = useState<SplitView | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setView(await fetchShortText());
      } catch (error) {
        setMessage(
          error instanceof ApiError ? error.message : "Something went wrong.",
        );
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

  const classes = Array.from(
    new Set(view.characters.map((entry) => entry.description)),
  );

  return (
    <div>
      <div className="overflow-x-auto pb-2">
        <div className="flex items-stretch">
          {view.characters.map((entry, position) => (
            <div key={`${position}-${entry.code_point}`} className="flex">
              {entry.breaks_before && (
                <div
                  className="mx-1 w-px shrink-0 bg-rose-400 dark:bg-rose-500"
                  aria-hidden="true"
                />
              )}
              <div
                className={`w-12 shrink-0 rounded-md border px-1 py-1 text-center ${
                  TONE[entry.description] ?? OTHER_TONE
                }`}
              >
                <div className="font-mono text-base leading-tight">
                  {visible(entry.character)}
                </div>
                <div className="font-mono text-[9px] opacity-70">
                  {entry.code_point}
                </div>
                <div className="font-mono text-[10px] opacity-70">
                  {position}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-2 flex flex-wrap gap-2">
        {classes.map((description) => (
          <span
            key={description}
            className={`rounded border px-1.5 py-0.5 text-[11px] ${
              TONE[description] ?? OTHER_TONE
            }`}
          >
            {description}
          </span>
        ))}
      </div>

      <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
        Each character is drawn with its number and its position, coloured by the
        class the rules put it in, and a thin red rule stands wherever a boundary
        fell. There are {view.n_characters} characters and{" "}
        {view.n_characters - 1} places a boundary could have fallen, of which{" "}
        {view.characters.filter((entry) => entry.breaks_before).length} did.
      </p>
    </div>
  );
}
