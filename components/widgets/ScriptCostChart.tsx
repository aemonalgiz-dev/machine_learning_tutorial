"use client";

// One short sentence written in twelve languages, measured under both readings.
//
// The API reads each sentence as characters and as bytes and reports both
// counts, the ratio between them and whether the byte reading gave the sentence
// back exactly. The browser draws the two bars per language, so the ratio and
// the total can be read off the same picture, and they do not say the same
// thing.

import { useEffect, useState } from "react";
import { ApiError } from "@/lib/api";
import { ScriptsView, fetchScripts } from "@/lib/concepts/bytes-and-characters";

const CHARACTER_COLOUR = "#6366f1";
const BYTE_COLOUR = "#f59e0b";

export function ScriptCostChart() {
  const [view, setView] = useState<ScriptsView | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setView(await fetchScripts());
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

  const widest = Math.max(...view.rows.map((row) => row.n_bytes));

  return (
    <div>
      <div className="space-y-2">
        {view.rows.map((row) => (
          <div key={row.language} className="text-xs">
            <div className="flex items-baseline justify-between gap-2">
              <span className="font-medium text-slate-700 dark:text-slate-300">
                {row.language}
              </span>
              <span className="font-mono text-slate-600 dark:text-slate-400">
                {row.n_characters} characters, {row.n_bytes} bytes,{" "}
                {row.bytes_per_character.toFixed(2)} each
              </span>
            </div>
            <div className="mt-1 space-y-0.5">
              <Bar
                width={(row.n_characters / widest) * 100}
                colour={CHARACTER_COLOUR}
              />
              <Bar width={(row.n_bytes / widest) * 100} colour={BYTE_COLOUR} />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-3 flex flex-wrap gap-4 text-xs">
        <Key colour={CHARACTER_COLOUR} label="numbers under the character reading" />
        <Key colour={BYTE_COLOUR} label="numbers under the byte reading" />
      </div>

      <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
        One sentence with one meaning, written twelve ways. Every one of them
        comes back exactly under the byte reading. The upper bar is also what the
        writing costs in characters, so a language whose upper bar is short is
        saying the same thing in fewer of them.
      </p>
    </div>
  );
}

function Bar({ width, colour }: { width: number; colour: string }) {
  return (
    <div className="h-2 w-full rounded-sm bg-slate-100 dark:bg-slate-800">
      <div
        className="h-2 rounded-sm"
        style={{ width: `${width}%`, backgroundColor: colour }}
      />
    </div>
  );
}

function Key({ colour, label }: { colour: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
      <span
        className="inline-block h-2 w-4 rounded-sm"
        style={{ backgroundColor: colour }}
      />
      {label}
    </span>
  );
}
