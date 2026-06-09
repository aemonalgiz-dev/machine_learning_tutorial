"use client";

// Hand a word to a written grammar, and add lines to the grammar until it can
// be read.
//
// The API builds the grammar with whatever lines have been added, runs the
// search, and sends back every reading with the pieces and their labels, the
// walk that found them, and how many lines the grammar now takes to write. The
// browser only collects the word and the lines. Adding a verb that ends in an e
// costs three lines rather than two, and the readout says so, which is the
// spelling problem showing up where it actually costs something.

import { useEffect, useState } from "react";
import {
  AddedLine,
  ENTRY_KINDS,
  EntryKind,
  ReadView,
  messageFor,
  readWord,
} from "@/lib/concepts/finite-state-morphology";
import { Loading, Readings, Stat } from "./morphologyParts";

const GRAMMARS: { key: string; label: string }[] = [
  { key: "larger", label: "thirty-six verbs and forty nouns" },
  { key: "small", label: "three verbs" },
];

const SUGGESTIONS = [
  "recovers",
  "reopeners",
  "unnamed",
  "measured",
  "busiest",
  "prewalk",
];

export function MorphologyPlayground() {
  const [word, setWord] = useState("recovers");
  const [grammar, setGrammar] = useState("larger");
  const [added, setAdded] = useState<AddedLine[]>([]);
  const [surface, setSurface] = useState("");
  const [kind, setKind] = useState<EntryKind>("a verb");
  const [result, setResult] = useState<ReadView | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const view = await readWord(word, grammar, added);
        if (!cancelled) {
          setResult(view);
          setMessage(null);
        }
      } catch (error) {
        if (!cancelled) {
          setMessage(messageFor(error));
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [word, grammar, added]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-3">
        <label className="text-sm text-slate-600 dark:text-slate-400">
          <span className="mb-1 block text-xs font-medium">a word to read</span>
          <input
            value={word}
            maxLength={24}
            onChange={(event) => setWord(event.target.value.trim())}
            className="w-52 rounded-md border border-slate-300 bg-white px-3 py-1.5 font-mono text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
          />
        </label>
        <div className="flex flex-wrap gap-2">
          {GRAMMARS.map((choice) => (
            <button
              key={choice.key}
              type="button"
              onClick={() => {
                setAdded([]);
                setGrammar(choice.key);
              }}
              className={`rounded-md border px-3 py-1.5 text-sm ${
                grammar === choice.key
                  ? "border-sky-400 bg-sky-50 text-sky-900 dark:border-sky-500 dark:bg-sky-950/40 dark:text-sky-200"
                  : "border-slate-200 text-slate-600 hover:border-slate-300 dark:border-slate-700 dark:text-slate-400"
              }`}
            >
              {choice.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {SUGGESTIONS.map((suggestion) => (
          <button
            key={suggestion}
            type="button"
            onClick={() => setWord(suggestion)}
            className="rounded-md border border-slate-200 px-2 py-1 font-mono text-xs text-slate-600 hover:border-slate-300 dark:border-slate-700 dark:text-slate-400"
          >
            {suggestion}
          </button>
        ))}
      </div>

      <div className="rounded-lg border border-slate-200 p-3 dark:border-slate-800">
        <p className="mb-2 text-xs font-medium text-slate-500 dark:text-slate-400">
          Add a line to the grammar, which is the only way anything new becomes
          readable
        </p>
        <div className="flex flex-wrap items-end gap-2">
          <input
            value={surface}
            maxLength={24}
            placeholder="spelling"
            onChange={(event) => setSurface(event.target.value.trim())}
            className="w-40 rounded-md border border-slate-300 bg-white px-3 py-1.5 font-mono text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
          />
          <select
            value={kind}
            onChange={(event) => setKind(event.target.value as EntryKind)}
            className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
          >
            {ENTRY_KINDS.map((choice) => (
              <option key={choice} value={choice}>
                {choice}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => {
              setAdded([...added, { surface, kind }]);
              setSurface("");
            }}
            className="rounded-md border border-sky-400 bg-sky-50 px-3 py-1.5 text-sm text-sky-900 dark:border-sky-500 dark:bg-sky-950/40 dark:text-sky-200"
          >
            add it
          </button>
          {added.length > 0 && (
            <button
              type="button"
              onClick={() => setAdded([])}
              className="rounded-md border border-slate-200 px-3 py-1.5 text-sm text-slate-600 dark:border-slate-700 dark:text-slate-400"
            >
              take them all out
            </button>
          )}
        </div>
        {result && result.added_lines.length > 0 && (
          <div className="mt-3 overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <tbody>
                {result.added_lines.map((line, position) => (
                  <tr
                    key={`${position}-${line.surface}-${line.label}-${line.goes_to}`}
                    className="border-b border-slate-100 last:border-0 dark:border-slate-800/60"
                  >
                    <td className="py-1 pr-4 font-mono text-slate-800 dark:text-slate-200">
                      {line.surface}
                    </td>
                    <td className="py-1 pr-4 font-mono text-xs text-slate-600 dark:text-slate-400">
                      {line.label}
                    </td>
                    <td className="py-1 text-xs text-slate-600 dark:text-slate-400">
                      then go to {line.goes_to}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {message && (
        <p className="rounded-md border border-amber-300 bg-amber-50/60 px-3 py-2 text-sm text-amber-900 dark:border-amber-500/60 dark:bg-amber-950/20 dark:text-amber-200">
          {message}
        </p>
      )}

      {!result ? (
        <Loading message={null} />
      ) : (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <Stat label="lines in the grammar" value={`${result.n_written_lines}`} />
            <Stat label="lines tried" value={`${result.view.n_lines_tried}`} />
            <Stat label="readings found" value={`${result.view.n_analyses}`} />
            <Stat
              label="pieces it is handed on as"
              value={`${result.view.cut.length}`}
            />
          </div>
          <Readings view={result.view} />
        </div>
      )}
    </div>
  );
}
