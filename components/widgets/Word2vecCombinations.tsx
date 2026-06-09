"use client";

// The four shapes of the method, at the published first step and at twice it.
//
// Each of the four gets a row: the mean cosine inside a list against the mean
// cosine across the two, drawn as a bar from one to the other, so a row whose
// two ends nearly touch is a fit that did not tell the lists apart. Choosing a
// word swaps the lists of nearest words underneath, which is where the four
// agree on the list and disagree on the order. The API fits all eight; the
// browser draws.

import { useEffect, useState } from "react";
import {
  ARCHITECTURE_LABELS,
  ApiError,
  Combinations,
  OBJECTIVE_LABELS,
  fetchCombinations,
} from "@/lib/concepts/word2vec";
import { Choice, FALLING, Legend, MONEY, RISING, Waiting, colourFor } from "./word2vecShared";

const BAR = { width: 320, height: 18 };

export function Word2vecCombinations({ word: initialWord = "walked" }: { word?: string }) {
  const [rate, setRate] = useState<"reference" | "doubled">("doubled");
  const [word, setWord] = useState(initialWord);
  const [combinations, setCombinations] = useState<Combinations | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setCombinations(await fetchCombinations());
      } catch (error) {
        if (error instanceof ApiError) setMessage(error.message);
        else setMessage("Something went wrong.");
      }
    })();
  }, []);

  if (!combinations) return <Waiting message={message} />;

  const chosen =
    rate === "reference" ? combinations.reference_rate : combinations.doubled_rate;
  const shown = combinations.reports.filter((report) => report.learning_rate === chosen);
  const barX = (similarity: number) => ((similarity + 1) / 2) * BAR.width;

  return (
    <div>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-600 dark:text-slate-300">
        <Choice
          options={[
            { label: `first step ${combinations.reference_rate}`, value: "reference" as const },
            { label: `first step ${combinations.doubled_rate}`, value: "doubled" as const },
          ]}
          value={rate}
          onChange={setRate}
        />
        <label className="flex items-center gap-2">
          nearest to
          <select
            value={word}
            onChange={(event) => setWord(event.target.value)}
            className="rounded border border-slate-300 bg-white px-2 py-0.5 font-mono text-xs text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
          >
            {combinations.words.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        {shown.map((report) => (
          <div
            key={`${report.architecture}-${report.objective}`}
            className="rounded-lg border border-slate-200 p-3 dark:border-slate-800"
          >
            <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
              {ARCHITECTURE_LABELS[report.architecture]}, {OBJECTIVE_LABELS[report.objective]}
            </p>
            <svg viewBox={`0 0 ${BAR.width} ${BAR.height}`} className="mt-2 w-full select-none">
              <line
                x1={0}
                x2={BAR.width}
                y1={BAR.height / 2}
                y2={BAR.height / 2}
                className="stroke-slate-200 dark:stroke-slate-700"
                strokeWidth={2}
              />
              <line
                x1={barX(report.across_topic)}
                x2={barX(report.within_topic)}
                y1={BAR.height / 2}
                y2={BAR.height / 2}
                stroke={report.gap > 0.25 ? FALLING : RISING}
                strokeWidth={4}
              />
              <circle cx={barX(report.across_topic)} cy={BAR.height / 2} r={5} fill={RISING} />
              <circle cx={barX(report.within_topic)} cy={BAR.height / 2} r={5} fill={FALLING} />
            </svg>
            <p className="mt-1 font-mono text-xs text-slate-600 dark:text-slate-400">
              same list {report.within_topic.toFixed(4)}, across{" "}
              {report.across_topic.toFixed(4)}, apart by {report.gap.toFixed(4)}
            </p>
            <p className="mt-1 font-mono text-xs text-slate-500 dark:text-slate-500">
              {report.pairs_per_epoch.toLocaleString()} pairs a pass,{" "}
              {report.output_rows} rows of scoring weights
            </p>
            <p className="mt-2 flex flex-wrap gap-x-2 gap-y-1 font-mono text-xs">
              {(report.neighbours[word] ?? []).map((entry) => (
                <span key={entry.word} style={{ color: colourFor(entry.topic) }}>
                  {entry.word} {entry.similarity.toFixed(3)}
                </span>
              ))}
            </p>
          </div>
        ))}
      </div>

      <Legend>
        The red dot is how alike two words from different lists are on average
        and the green dot how alike two from the same list; a long bar is a fit
        that separated them. Nearest words are coloured by which list they came
        from, so an <span style={{ color: MONEY }}>amber</span> word beside a
        verb form is a mistake.
      </Legend>
      {message && <p className="mt-2 text-sm text-amber-600 dark:text-amber-400">{message}</p>}
    </div>
  );
}
