"use client";

// What each of five rules does with the spacing, on the running sentence.
//
// The API splits the sentence by the pattern and by the four earlier rules,
// counts the characters each keeps, and asks two questions of every one of
// them: whether the pieces joined with nothing between give the sentence back,
// and whether joining them with one space each does. It also splits four pairs
// of texts that differ only in their spacing. The browser draws the counts and
// then the pairs.

import { useEffect, useState } from "react";
import { ApiError } from "@/lib/api";
import {
  BranchesView,
  CorpusView,
  fetchBranches,
  fetchCorpus,
} from "@/lib/concepts/the-pattern-language-models-use";
import { ChipRow, Stat } from "@/components/widgets/PieceChip";

export function SpaceLedger() {
  const [view, setView] = useState<CorpusView | null>(null);
  const [drawn, setDrawn] = useState<BranchesView | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setView(await fetchCorpus());
        setDrawn(await fetchBranches());
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

  const running = view.running;
  const rows = [
    { label: running.on_spaces.label, reading: running.on_spaces },
    { label: running.on_boundaries.label, reading: running.on_boundaries },
    {
      label: running.on_annotation_rules.label,
      reading: running.on_annotation_rules,
    },
    {
      label: running.on_translation_rules.label,
      reading: running.on_translation_rules,
    },
  ];

  return (
    <div>
      <div className="font-mono text-xs text-slate-500 dark:text-slate-400">
        {running.source}
      </div>

      <div className="mt-3 overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="text-slate-500 dark:text-slate-400">
            <tr>
              <th className="py-1 pr-3 font-medium">rule</th>
              <th className="py-1 pr-3 font-medium">pieces</th>
              <th className="py-1 pr-3 font-medium">characters kept</th>
              <th className="py-1 pr-3 font-medium">joined with nothing</th>
              <th className="py-1 font-medium">joined with one space</th>
            </tr>
          </thead>
          <tbody className="text-slate-700 dark:text-slate-300">
            {rows.map((row) => (
              <tr
                key={row.label}
                className="border-t border-slate-200 dark:border-slate-800"
              >
                <td className="py-1 pr-3">{row.label}</td>
                <td className="py-1 pr-3 font-mono">{row.reading.n_pieces}</td>
                <td className="py-1 pr-3 font-mono">
                  {row.reading.n_characters_in_pieces} of {running.n_characters}
                </td>
                <td className="py-1 pr-3">
                  {row.reading.joins_back_exactly
                    ? "the sentence"
                    : "not the sentence"}
                </td>
                <td className="py-1">
                  {row.reading.joins_back_with_one_space
                    ? "the sentence"
                    : "not the sentence"}
                </td>
              </tr>
            ))}
            <tr className="border-t border-slate-300 bg-emerald-50/40 dark:border-slate-700 dark:bg-emerald-950/20">
              <td className="py-1 pr-3">the pattern</td>
              <td className="py-1 pr-3 font-mono">{running.n_pieces}</td>
              <td className="py-1 pr-3 font-mono">
                {running.n_characters_in_pieces} of {running.n_characters}
              </td>
              <td className="py-1 pr-3">
                {running.joins_back_exactly ? "the sentence" : "not the sentence"}
              </td>
              <td className="py-1">
                {running.joins_back_with_one_space
                  ? "the sentence"
                  : "not the sentence"}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="mt-4 rounded-lg border border-slate-200 px-3 py-2 dark:border-slate-800">
        <div className="text-[11px] text-slate-500 dark:text-slate-400">
          four pairs of texts that differ only in their spacing, and whether the
          pieces alone tell them apart
        </div>
        <div className="mt-2 space-y-2">
          {view.told_apart.map((pair) => (
            <div key={pair.first} className="grid gap-1 sm:grid-cols-2">
              <div>
                <div className="font-mono text-[11px] text-slate-500 dark:text-slate-400">
                  {JSON.stringify(pair.first)}
                </div>
                <ChipRow pieces={pair.first_here} />
              </div>
              <div>
                <div className="font-mono text-[11px] text-slate-500 dark:text-slate-400">
                  {JSON.stringify(pair.second)}
                </div>
                <ChipRow pieces={pair.second_here} />
              </div>
            </div>
          ))}
        </div>
        <div className="mt-2 text-xs text-slate-600 dark:text-slate-400">
          All four pairs come back as one answer under every earlier rule, and
          as two answers here.
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-1.5 sm:grid-cols-4">
        <Stat
          label="of 6 sentences given back exactly here"
          value={`${view.readings[4].n_joining_back_exactly}`}
        />
        <Stat
          label="the same by the crudest rule"
          value={`${view.readings[0].n_joining_back_exactly}`}
        />
        <Stat
          label="given back by putting one space between each pair"
          value={`${view.readings[0].n_joining_back_with_one_space}`}
        />
        <Stat
          label="the same for the annotation rules"
          value={`${view.readings[2].n_joining_back_with_one_space}`}
        />
      </div>

      {drawn && (
        <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
          Six sentences is a small test of a strong claim, so the same question
          was put to {drawn.random_texts.n_texts} texts drawn at random, up to{" "}
          {drawn.random_texts.longest_text} characters each from{" "}
          {drawn.random_texts.n_codepoints_drawn_from} different characters with
          spacing, a fraction, a Roman numeral and an underscore among them.{" "}
          {drawn.random_texts.n_joining_back} of them came back exactly.
        </p>
      )}
    </div>
  );
}
