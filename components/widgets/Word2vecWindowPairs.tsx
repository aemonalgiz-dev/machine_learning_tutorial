"use client";

// Every training pair three short sentences produce, at a reach the reader
// chooses.
//
// The point of the widget is the count in the corner: widening the window
// multiplies the pairs one way round and leaves them untouched the other, and
// the table underneath shows exactly which words are read and which have to
// come out. The API enumerates; the browser draws.

import { useEffect, useState } from "react";
import {
  ApiError,
  ArchitectureName,
  WindowPairs,
  fetchWindowPairs,
} from "@/lib/concepts/word2vec";
import { Choice, Legend, MONEY, Stat, VERB, Waiting } from "./word2vecShared";

export function Word2vecWindowPairs() {
  const [reach, setReach] = useState(1);
  const [architecture, setArchitecture] = useState<ArchitectureName>("skip-gram");
  const [pairs, setPairs] = useState<WindowPairs | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setPairs(await fetchWindowPairs(reach, architecture));
        setMessage(null);
      } catch (error) {
        if (error instanceof ApiError) setMessage(error.message);
        else setMessage("Something went wrong.");
      }
    })();
  }, [reach, architecture]);

  if (!pairs) return <Waiting message={message} />;

  const moneyWords = new Set(["bond", "market", "price"]);
  const colourOf = (word: string) => (moneyWords.has(word) ? MONEY : VERB);

  return (
    <div>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-600 dark:text-slate-300">
        <Choice
          options={[
            { label: "skip-gram", value: "skip-gram" as ArchitectureName },
            { label: "bag of words", value: "bag-of-words" as ArchitectureName },
          ]}
          value={architecture}
          onChange={setArchitecture}
        />
        <label className="flex items-center gap-2">
          reach on each side
          <input
            type="range"
            min={1}
            max={3}
            step={1}
            value={reach}
            onChange={(event) => setReach(Number(event.target.value))}
            className="w-24 accent-indigo-600"
          />
          <span className="w-4 text-right font-mono">{reach}</span>
        </label>
      </div>

      <div className="mt-3 space-y-1 font-mono text-sm text-slate-800 dark:text-slate-200">
        {pairs.sentences.map((sentence, index) => (
          <p key={index}>
            {sentence.map((word, position) => (
              <span key={position} style={{ color: colourOf(word) }} className="mr-2">
                {word}
              </span>
            ))}
          </p>
        ))}
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
        <Stat label="pairs, skip-gram" value={String(pairs.n_pairs_skip_gram)} />
        <Stat label="pairs, bag of words" value={String(pairs.n_pairs_bag_of_words)} />
        <Stat label="distinct words" value={String(pairs.words.length)} />
      </div>

      <div className="mt-3 max-h-72 overflow-y-auto">
        <table className="w-full border-collapse text-left text-sm">
          <thead className="sticky top-0 bg-white dark:bg-slate-900">
            <tr className="border-b border-slate-200 dark:border-slate-800">
              <th className="py-1.5 pr-4 font-semibold text-slate-600 dark:text-slate-400">
                centre
              </th>
              <th className="py-1.5 pr-4 font-semibold text-slate-600 dark:text-slate-400">
                window
              </th>
              <th className="py-1.5 pr-4 font-semibold text-slate-600 dark:text-slate-400">
                read
              </th>
              <th className="py-1.5 font-semibold text-slate-600 dark:text-slate-400">
                predicted
              </th>
            </tr>
          </thead>
          <tbody>
            {pairs.pairs.map((pair, index) => (
              <tr
                key={index}
                className="border-b border-slate-100 last:border-0 dark:border-slate-800/60"
              >
                <td className="py-1 pr-4 font-mono text-slate-800 dark:text-slate-200">
                  {pair.centre}
                </td>
                <td className="py-1 pr-4 font-mono text-slate-500 dark:text-slate-400">
                  {pair.context.join(" ")}
                </td>
                <td className="py-1 pr-4 font-mono" style={{ color: VERB }}>
                  {pair.reads.join(" + ")}
                </td>
                <td className="py-1 font-mono" style={{ color: MONEY }}>
                  {pair.predicts.join(" ")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Legend>
        The sentences are only three words long, so a reach of three is a reach
        of two and the counts stop growing there. In the real corpus the reach is
        redrawn at every position, between one and the number set, which weights
        near neighbours more heavily without any weighting formula.
      </Legend>
      {message && <p className="mt-2 text-sm text-amber-600 dark:text-amber-400">{message}</p>}
    </div>
  );
}
