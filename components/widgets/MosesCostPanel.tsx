"use client";

// What the four rules cost over the same two corpora, in pieces and in entries.
//
// The API reads both corpora by the Moses rules, the Penn Treebank rules,
// splitting on spaces and the written-out table of exceptions, counting for
// each how many pieces came back, how many different pieces there were, and how
// much of the writing ended up inside one. It also lists the words the crudest
// rule spells more than one way, which is the failure the whole method exists
// to repair. The browser draws the counts as a table and the scattered words
// underneath.

import { useEffect, useState } from "react";
import { ApiError } from "@/lib/api";
import { CorpusResult, CorpusView, fetchCorpus } from "@/lib/concepts/moses-rules";

export function MosesCostPanel() {
  const [view, setView] = useState<CorpusResult | null>(null);
  const [corpus, setCorpus] = useState<"notebook" | "minutes">("minutes");
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setView(await fetchCorpus());
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

  const chosen: CorpusView = corpus === "minutes" ? view.minutes : view.notebook;

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {(
          [
            ["minutes", `the ${view.minutes.n_texts} minuted sentences`],
            ["notebook", `the ${view.notebook.n_texts} notebook sentences`],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setCorpus(key)}
            className={`rounded-lg px-2.5 py-1 text-xs ${
              corpus === key
                ? "bg-indigo-600 text-white"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="mt-3 overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left dark:border-slate-800">
              <th className="py-2 pr-6 font-semibold text-slate-600 dark:text-slate-400">
                {chosen.n_characters} characters, {chosen.n_non_space_characters}{" "}
                of them not spacing
              </th>
              <th className="py-2 pr-6 font-semibold text-slate-600 dark:text-slate-400">
                pieces
              </th>
              <th className="py-2 pr-6 font-semibold text-slate-600 dark:text-slate-400">
                different pieces
              </th>
              <th className="py-2 font-semibold text-slate-600 dark:text-slate-400">
                characters kept
              </th>
            </tr>
          </thead>
          <tbody>
            <Row label="at every run of spaces" reading={chosen.on_spaces} />
            <Row label="these rules" reading={chosen.on_these_rules} />
            <Row
              label="the annotation rules"
              reading={chosen.on_annotation_rules}
            />
            <Row label="a table of exceptions" reading={chosen.on_the_table} />
          </tbody>
        </table>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-1.5 sm:grid-cols-3">
        <Stat
          label="pieces once every compound is cut at its hyphen"
          value={`${chosen.n_pieces_with_hyphens_marked}`}
        />
        <Stat
          label="pieces holding no letter and no digit"
          value={`${chosen.n_pieces_without_letter_or_digit}`}
        />
        <Stat
          label="more pieces than cutting at the spaces"
          value={`${chosen.on_these_rules.n_pieces - chosen.on_spaces.n_pieces}`}
        />
      </div>

      <div className="mt-3 rounded-lg border border-amber-300 bg-amber-50/60 px-3 py-2 dark:border-amber-700 dark:bg-amber-950/20">
        <div className="text-[11px] text-slate-500 dark:text-slate-400">
          words the crudest rule spells more than one way, which is the failure
          the whole method exists to repair
        </div>
        <div className="mt-1 space-y-1">
          {chosen.scattered.map((entry) => (
            <div key={entry.stem} className="flex flex-wrap items-center gap-1">
              {entry.spellings.map((spelling) => (
                <span
                  key={spelling}
                  className="rounded bg-white px-1.5 py-0.5 font-mono text-xs text-slate-800 dark:bg-slate-900 dark:text-slate-200"
                >
                  {spelling}
                </span>
              ))}
            </div>
          ))}
        </div>
        <div className="mt-1 text-xs text-slate-600 dark:text-slate-400">
          {chosen.scattered.length} of them here, each one an extra row in any
          table built over this writing, and each one collapsed to a single row
          by separating the mark.
        </div>
      </div>

      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        <Beside
          title="pieces only these rules produce"
          pieces={chosen.only_on_these_rules}
        />
        <Beside
          title="pieces only the annotation rules produce"
          pieces={chosen.only_on_annotation_rules}
        />
      </div>

      <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
        Every rule keeps the same {chosen.n_non_space_characters} characters,
        which is everything in the writing that is not spacing, so what separates
        them is where the cuts fall and not what they throw away.
      </p>
    </div>
  );
}

function Row({
  label,
  reading,
}: {
  label: string;
  reading: CorpusView["on_spaces"];
}) {
  return (
    <tr className="border-b border-slate-100 last:border-0 dark:border-slate-800/60">
      <td className="py-2 pr-6 text-slate-700 dark:text-slate-300">{label}</td>
      <td className="py-2 pr-6 font-mono text-slate-900 dark:text-slate-100">
        {reading.n_pieces}
      </td>
      <td className="py-2 pr-6 font-mono text-slate-900 dark:text-slate-100">
        {reading.n_distinct}
      </td>
      <td className="py-2 font-mono text-slate-900 dark:text-slate-100">
        {reading.n_characters_covered}
      </td>
    </tr>
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

function Beside({ title, pieces }: { title: string; pieces: string[] }) {
  return (
    <div className="rounded-md border border-slate-200 px-3 py-2 dark:border-slate-800">
      <div className="text-[11px] text-slate-500 dark:text-slate-400">
        {title} ({pieces.length})
      </div>
      <div className="mt-1 flex flex-wrap gap-1">
        {pieces.map((piece, position) => (
          <span
            key={`${position}-${piece}`}
            className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-xs text-slate-800 dark:bg-slate-800 dark:text-slate-200"
          >
            {piece}
          </span>
        ))}
      </div>
    </div>
  );
}
