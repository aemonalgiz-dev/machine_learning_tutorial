"use client";

// An analogy worked all the way through, in either table.
//
// Three chip rows choose the two words that are added and the one that is
// subtracted. The panel then shows each word's own vector, its length, the unit
// vector it actually contributes, the sum of the three, and the ranking that
// sum produces. A switch decides whether the words already in the question may
// be answers, which is the whole point of the section it appears in. The API
// does every step; the browser lays them out.

import { useEffect, useState } from "react";
import { ApiError } from "@/lib/api";
import {
  AnalogyAnswer,
  SpaceName,
  WordSpace,
  fetchAnalogy,
  fetchSpace,
} from "@/lib/concepts/a-vector-for-a-word";
import { colourOf } from "./wordPositionFixtures";

export function AnalogyWorkbench({
  space = "sketch",
  initial = ["king", "man", "woman"],
  allowExclusionSwitch = true,
}: {
  space?: SpaceName;
  initial?: string[];
  allowExclusionSwitch?: boolean;
}) {
  const [table, setTable] = useState<WordSpace | null>(null);
  const [first, setFirst] = useState(initial[0]);
  const [minus, setMinus] = useState(initial[1]);
  const [second, setSecond] = useState(initial[2]);
  const [exclude, setExclude] = useState(true);
  const [answer, setAnswer] = useState<AnalogyAnswer | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setTable(await fetchSpace(space));
      } catch (error) {
        setMessage(error instanceof ApiError ? error.message : "Something went wrong.");
      }
    })();
  }, [space]);

  useEffect(() => {
    (async () => {
      try {
        setAnswer(
          await fetchAnalogy([first, second], [minus], {
            space,
            excludeQuestionWords: exclude,
            nResults: 4,
          }),
        );
        setMessage(null);
      } catch (error) {
        setAnswer(null);
        setMessage(error instanceof ApiError ? error.message : "Something went wrong.");
      }
    })();
  }, [space, first, minus, second, exclude]);

  if (!table) {
    return <p className="text-sm text-slate-500 dark:text-slate-400">{message ?? "…"}</p>;
  }

  const usable = table.words.filter((row) => row.length > 0).map((row) => row.word);
  const rows: { label: string; value: string; set: (word: string) => void }[] = [
    { label: "add", value: first, set: setFirst },
    { label: "subtract", value: minus, set: setMinus },
    { label: "add", value: second, set: setSecond },
  ];

  return (
    <div>
      <div className="space-y-2">
        {rows.map((row, index) => (
          <div key={index} className="flex flex-wrap items-center gap-1">
            <span className="w-16 shrink-0 text-xs text-slate-500 dark:text-slate-400">
              {row.label}
            </span>
            {usable.map((option) => (
              <button
                key={option}
                onClick={() => row.set(option)}
                className={
                  "rounded px-1.5 py-0.5 font-mono text-[11px] transition " +
                  (option === row.value
                    ? "text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700")
                }
                style={option === row.value ? { background: colourOf(option) } : undefined}
              >
                {option}
              </button>
            ))}
          </div>
        ))}
      </div>

      {allowExclusionSwitch && (
        <label className="mt-3 flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
          <input
            type="checkbox"
            checked={exclude}
            onChange={(event) => setExclude(event.target.checked)}
            className="accent-indigo-600"
          />
          keep the three question words out of the running
        </label>
      )}

      {answer ? (
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <div className="rounded-lg border border-slate-200 p-3 dark:border-slate-800">
            <div className="text-[11px] uppercase tracking-wide text-slate-500 dark:text-slate-400">
              every step of the sum
            </div>
            <table className="mt-2 w-full text-xs">
              <thead>
                <tr className="text-slate-400 dark:text-slate-500">
                  <th className="text-left font-normal">word</th>
                  <th className="text-right font-normal">its vector</th>
                  <th className="text-right font-normal">length</th>
                  <th className="text-right font-normal">unit vector</th>
                </tr>
              </thead>
              <tbody className="font-mono">
                {answer.terms.map((term) => (
                  <tr key={term.word}>
                    <td className="py-0.5">
                      {term.added ? "+" : "−"} {term.word}
                    </td>
                    <td className="py-0.5 text-right">
                      ({term.vector.map((value) => value.toFixed(2)).join(", ")})
                    </td>
                    <td className="py-0.5 text-right">{term.length.toFixed(4)}</td>
                    <td className="py-0.5 text-right">
                      ({term.unit.map((value) => value.toFixed(2)).join(", ")})
                    </td>
                  </tr>
                ))}
                <tr className="border-t border-slate-200 font-semibold dark:border-slate-800">
                  <td className="py-1">sum</td>
                  <td className="py-1 text-right" colSpan={2}>
                    ({answer.combination.map((value) => value.toFixed(2)).join(", ")})
                  </td>
                  <td className="py-1 text-right">
                    {answer.combination_length.toFixed(4)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="rounded-lg border border-slate-200 p-3 dark:border-slate-800">
            <div className="text-[11px] uppercase tracking-wide text-slate-500 dark:text-slate-400">
              what the sum lands nearest
            </div>
            <table className="mt-2 w-full text-xs">
              <tbody className="font-mono">
                {answer.answers.map((row, index) => (
                  <tr key={row.word}>
                    <td className="py-0.5 text-slate-400">{index + 1}</td>
                    <td className="py-0.5">
                      <span
                        className="mr-1 inline-block h-2 w-2 rounded-full align-middle"
                        style={{ background: colourOf(row.word) }}
                      />
                      {row.word}
                    </td>
                    <td className="py-0.5 text-right font-semibold">
                      {row.cosine.toFixed(4)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="mt-2 text-[11px] text-slate-500 dark:text-slate-400">
              {answer.excluded.length > 0
                ? `kept out of the running: ${answer.excluded.join(", ")}`
                : "nothing is kept out of the running"}
            </p>
          </div>
        </div>
      ) : (
        <p className="mt-3 text-sm text-rose-600 dark:text-rose-400">{message ?? "…"}</p>
      )}
    </div>
  );
}
