"use client";

// The two tables a fit learns, and which one it answers with.
//
// The left column is the table that gets kept, read as the words nearest the
// chosen one; the right column is the table that gets thrown away, read as
// what it says about which word belongs beside the chosen one. Both are the
// same size, both were learned by the same passes, and only one of them is
// what anybody wanted. The API fits and reads both; the browser draws.

import { useEffect, useState } from "react";
import { ApiError, Word2vecFit, fitWord2vec } from "@/lib/concepts/word2vec";
import { Legend, MONEY, Stat, VERB, Waiting, colourFor } from "./word2vecShared";

const WORDS = ["walked", "play", "market", "yield"];

export function Word2vecTwoTables() {
  const [word, setWord] = useState("walked");
  const [fit, setFit] = useState<Word2vecFit | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setFit(
          await fitWord2vec({ learningRate: 0.05, epochs: 5, word, nNeighbours: 6 }),
        );
        setMessage(null);
      } catch (error) {
        if (error instanceof ApiError) setMessage(error.message);
        else setMessage("Something went wrong.");
      }
    })();
  }, [word]);

  if (!fit) return <Waiting message={message} />;

  const column = (
    title: string,
    subtitle: string,
    entries: Word2vecFit["neighbours"],
    format: (value: number) => string,
    accent: string,
  ) => (
    <div className="rounded-lg border p-3" style={{ borderColor: `${accent}66` }}>
      <p className="text-sm font-medium" style={{ color: accent }}>
        {title}
      </p>
      <p className="mb-2 text-xs text-slate-500 dark:text-slate-400">{subtitle}</p>
      <div className="space-y-1 font-mono text-xs">
        {entries.map((entry) => (
          <div key={entry.word} className="flex justify-between">
            <span style={{ color: colourFor(entry.topic) }}>{entry.word}</span>
            <span className="text-slate-600 dark:text-slate-400">
              {format(entry.similarity)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
        <span>around</span>
        {WORDS.map((choice) => (
          <button
            key={choice}
            onClick={() => setWord(choice)}
            style={choice === word ? { backgroundColor: "#334155", color: "white" } : undefined}
            className={
              "rounded px-2 py-0.5 font-mono text-xs transition " +
              (choice === word
                ? ""
                : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800")
            }
          >
            {choice}
          </button>
        ))}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {column(
          "the table that is kept",
          "nearest words, by the angle between their vectors",
          fit.neighbours,
          (value) => value.toFixed(4),
          VERB,
        )}
        {column(
          "the table that is thrown away",
          `how likely each word is to be a neighbour of ${word}`,
          fit.predicted,
          (value) => value.toFixed(4),
          MONEY,
        )}
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Stat label="numbers kept" value={String(fit.kept_numbers)} />
        <Stat label="numbers discarded" value={String(fit.discarded_numbers)} />
        <Stat
          label="mean readiness, words of the same list"
          value={fit.predicted_mean_same_list.toFixed(4)}
        />
        <Stat
          label="mean readiness, words of the other list"
          value={fit.predicted_mean_other_list.toFixed(4)}
        />
      </div>

      <Legend>
        Exactly half of what the fit learned is in each column, and the answer
        keeps the left one. The right column is the model doing its stated job,
        and its numbers are probabilities rather than angles, which is why it
        can be read as a sentence, so that given {word} it says how ready the
        fit is to have each word appear beside it.
      </Legend>
      {message && <p className="mt-2 text-sm text-amber-600 dark:text-amber-400">{message}</p>}
    </div>
  );
}
