"use client";

// The same candidates scored in two units, on two corpora.
//
// The API scores every candidate twice, once counting the positions of the
// spelled word and once counting the characters underneath them with the
// end-of-word mark as a character of its own. The browser puts the two columns
// side by side and marks the leader in each, so a reader can see whether the
// unit changes the answer or only the numbers.

import { useEffect, useState } from "react";
import {
  UnitsView,
  fetchUnits,
  messageFor,
} from "@/lib/concepts/greedy-coverage";
import { Choices, END_OF_WORD, Stat } from "./greedyCoverageParts";

function plain(piece: string) {
  return piece.endsWith(END_OF_WORD)
    ? piece.slice(0, -END_OF_WORD.length)
    : piece;
}

export function UnitRivals() {
  const [view, setView] = useState<UnitsView | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [key, setKey] = useState("four_words");

  useEffect(() => {
    (async () => {
      try {
        setView(await fetchUnits());
      } catch (error) {
        setMessage(messageFor(error));
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

  const corpus =
    view.corpora.find((entry) => entry.key === key) ?? view.corpora[0];

  return (
    <div>
      <Choices
        label="corpus"
        chosen={corpus.key}
        onChoose={setKey}
        options={view.corpora.map((entry) => ({
          value: entry.key,
          label: entry.label,
        }))}
      />

      <p className="mt-3 font-mono text-xs text-slate-600 dark:text-slate-400">
        {corpus.word_counts
          .map((entry) => `${entry.word} ×${entry.count}`)
          .join("   ")}
      </p>

      <div className="mt-3 overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left dark:border-slate-800">
              <th className="py-1.5 pr-4 font-semibold text-slate-600 dark:text-slate-400">
                candidate
              </th>
              <th className="py-1.5 pr-4 font-semibold text-slate-600 dark:text-slate-400">
                occurs
              </th>
              <th className="py-1.5 pr-4 font-semibold text-slate-600 dark:text-slate-400">
                counted in positions
              </th>
              <th className="py-1.5 font-semibold text-slate-600 dark:text-slate-400">
                counted in characters
              </th>
            </tr>
          </thead>
          <tbody>
            {corpus.candidates.map((candidate) => {
              const winsPositions =
                candidate.piece === corpus.winner_by_positions;
              const winsCharacters =
                candidate.piece === corpus.winner_by_characters;
              return (
                <tr
                  key={candidate.piece}
                  className="border-b border-slate-100 last:border-0 dark:border-slate-800/60"
                >
                  <td className="py-1.5 pr-4 font-mono text-slate-800 dark:text-slate-200">
                    {plain(candidate.piece)}
                    {candidate.piece.endsWith(END_OF_WORD) && (
                      <span className="ml-0.5 text-slate-400">&#9141;</span>
                    )}
                  </td>
                  <td className="py-1.5 pr-4 font-mono text-slate-500 dark:text-slate-400">
                    {candidate.occurrences}&times;
                  </td>
                  <td
                    className={`py-1.5 pr-4 font-mono ${
                      winsPositions
                        ? "font-semibold text-indigo-700 dark:text-indigo-300"
                        : "text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    {candidate.in_positions}
                    {winsPositions && " ←"}
                  </td>
                  <td
                    className={`py-1.5 font-mono ${
                      winsCharacters
                        ? "font-semibold text-emerald-700 dark:text-emerald-300"
                        : "text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    {candidate.in_characters}
                    {winsCharacters && " ←"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Stat
          label="positions in the corpus"
          value={corpus.total_positions}
        />
        <Stat
          label="characters in the corpus"
          value={corpus.total_characters}
        />
        <Stat
          label="first pick, in positions"
          value={`${plain(corpus.winner_by_positions)} at ${corpus.winner_positions_score}`}
        />
        <Stat
          label="first pick, in characters"
          value={`${plain(corpus.winner_by_characters)} at ${corpus.winner_characters_score}`}
        />
      </div>

      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <div>
          <p className="mb-1 text-xs font-semibold text-indigo-700 dark:text-indigo-300">
            the run, counting positions
          </p>
          <p className="font-mono text-xs text-slate-700 dark:text-slate-300">
            {corpus.run_by_positions
              .map((row) => `${plain(row.piece)} ${row.in_positions}`)
              .join("   ")}
          </p>
        </div>
        <div>
          <p className="mb-1 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
            the run, counting characters
          </p>
          <p className="font-mono text-xs text-slate-700 dark:text-slate-300">
            {corpus.run_by_characters
              .map((row) => `${plain(row.piece)} ${row.in_characters}`)
              .join("   ")}
          </p>
        </div>
      </div>

      <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
        {corpus.same_winner
          ? "Both units lead with the same candidate here, though every score differs and a piece that ends a word gains one for the mark."
          : "The two units lead with different candidates here, and neither margin is a tie, so no tie-break is involved."}
      </p>
    </div>
  );
}
