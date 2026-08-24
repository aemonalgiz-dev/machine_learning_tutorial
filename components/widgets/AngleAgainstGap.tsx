"use client";

// The same word's neighbours ranked twice, once by angle and once by gap.
//
// Two columns side by side for one chosen word: the words nearest it by
// cosine, and the words nearest it by ordinary straight-line distance, each
// row carrying the other reading and the neighbour's own length so a
// disagreement can be traced to a length difference. Rows that change place
// between the two columns are marked. The API measures both readings; the
// browser sorts nothing.

import { useEffect, useState } from "react";
import { ApiError } from "@/lib/api";
import {
  NeighbourAnswer,
  SpaceName,
  fetchNeighbours,
} from "@/lib/concepts/a-vector-for-a-word";
import { CONTRAST, colourOf } from "./wordPositionFixtures";

export function AngleAgainstGap({
  word = "sail",
  space = "documents",
  choices = ["sail", "oven", "the", "crew"],
  nResults = 6,
}: {
  word?: string;
  space?: SpaceName;
  choices?: string[];
  nResults?: number;
}) {
  const [chosen, setChosen] = useState(word);
  const [answer, setAnswer] = useState<NeighbourAnswer | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setAnswer(await fetchNeighbours(chosen, { space, nResults }));
        setMessage(null);
      } catch (error) {
        setMessage(error instanceof ApiError ? error.message : "Something went wrong.");
      }
    })();
  }, [chosen, space, nResults]);

  if (!answer) {
    return <p className="text-sm text-slate-500 dark:text-slate-400">{message ?? "…"}</p>;
  }

  const cosineOrder = answer.by_cosine.map((row) => row.word);
  const gapOrder = answer.by_gap.map((row) => row.word);
  const moved = (list: string[], other: string[], index: number) =>
    other[index] !== list[index];

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm text-slate-600 dark:text-slate-300">
          standing at
        </span>
        {choices.map((option) => (
          <button
            key={option}
            onClick={() => setChosen(option)}
            className={
              "rounded px-2 py-0.5 font-mono text-xs transition " +
              (option === chosen
                ? "bg-indigo-600 text-white"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700")
            }
          >
            {option}
          </button>
        ))}
        <span className="ml-auto font-mono text-xs text-slate-500 dark:text-slate-400">
          its own length {answer.length.toFixed(4)}
        </span>
      </div>

      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <Column
          heading="nearest by angle"
          note="largest cosine first"
          rows={answer.by_cosine.map((row, index) => ({
            word: row.word,
            first: row.cosine.toFixed(4),
            second: row.gap.toFixed(4),
            length: row.length.toFixed(4),
            moved: moved(cosineOrder, gapOrder, index),
          }))}
          firstHeading="cosine"
          secondHeading="gap"
        />
        <Column
          heading="nearest by straight-line gap"
          note="smallest gap first"
          rows={answer.by_gap.map((row, index) => ({
            word: row.word,
            first: row.gap.toFixed(4),
            second: row.cosine.toFixed(4),
            length: row.length.toFixed(4),
            moved: moved(gapOrder, cosineOrder, index),
          }))}
          firstHeading="gap"
          secondHeading="cosine"
        />
      </div>

      <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
        A row shown in pink changed place between the two columns, and the
        length column is why, since the gap grows with a neighbour&rsquo;s own
        length even when the direction is unchanged.
      </p>

      {message && <p className="mt-2 text-sm text-rose-600">{message}</p>}
    </div>
  );
}

function Column({
  heading,
  note,
  rows,
  firstHeading,
  secondHeading,
}: {
  heading: string;
  note: string;
  rows: {
    word: string;
    first: string;
    second: string;
    length: string;
    moved: boolean;
  }[];
  firstHeading: string;
  secondHeading: string;
}) {
  return (
    <div className="rounded-lg border border-slate-200 p-3 dark:border-slate-800">
      <div className="text-[11px] uppercase tracking-wide text-slate-500 dark:text-slate-400">
        {heading}
      </div>
      <div className="text-[11px] text-slate-400 dark:text-slate-500">{note}</div>
      <table className="mt-2 w-full text-xs">
        <thead>
          <tr className="text-slate-400 dark:text-slate-500">
            <th className="text-left font-normal">word</th>
            <th className="text-right font-normal">{firstHeading}</th>
            <th className="text-right font-normal">{secondHeading}</th>
            <th className="text-right font-normal">length</th>
          </tr>
        </thead>
        <tbody className="font-mono">
          {rows.map((row) => (
            <tr key={row.word} style={row.moved ? { color: CONTRAST } : undefined}>
              <td className="py-0.5 text-left">
                <span
                  className="mr-1 inline-block h-2 w-2 rounded-full align-middle"
                  style={{ background: colourOf(row.word) }}
                />
                {row.word}
              </td>
              <td className="py-0.5 text-right font-semibold">{row.first}</td>
              <td className="py-0.5 text-right">{row.second}</td>
              <td className="py-0.5 text-right">{row.length}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
