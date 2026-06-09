"use client";

// The leading readings of one text in order, with what each is worth.
//
// The API runs the same search that answers with the best path, keeping the
// leading few answers at each position rather than only the winner, so this list
// is the ranking that search produces rather than a second opinion about it. The
// browser draws the readings, marks the one a person answers, marks the two the
// greedy rule of the previous page reaches, and prints the gap between the top
// two, which is what says whether the winner won by anything.

import { useEffect, useState } from "react";
import {
  Analysis,
  ScenariosView,
  fetchScenarios,
  messageFor,
  scenarioFor,
} from "@/lib/concepts/the-word-lattice";
import {
  Legend,
  Loading,
  ReadingRow,
  Stat,
  entriesOf,
} from "./wordLatticeParts";

function noteFor(analysis: Analysis, words: string[]): string | undefined {
  const notes: string[] = [];
  if (analysis.reader_reading && analysis.reader_reading.join("|") === words.join("|")) {
    notes.push("what a person answers");
  }
  for (const scan of analysis.greedy) {
    if (scan.words.join("|") === words.join("|")) {
      notes.push(`what the greedy rule reaches ${scan.scan.replace("scanned ", "")}`);
    }
  }
  return notes.length > 0 ? notes.join(", ") : undefined;
}

export function PathLadder({
  scenarioKeys = ["research"],
}: {
  scenarioKeys?: string[];
}) {
  const [scenarios, setScenarios] = useState<ScenariosView | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [chosen, setChosen] = useState(scenarioKeys[0]);

  useEffect(() => {
    (async () => {
      try {
        setScenarios(await fetchScenarios());
      } catch (error) {
        setMessage(messageFor(error));
      }
    })();
  }, []);

  if (!scenarios) {
    return <Loading message={message} />;
  }

  const analysis = scenarioFor(scenarios, chosen);
  const entries = entriesOf(analysis.edges);
  const tied = analysis.margin === 0;

  return (
    <div className="rounded-lg border border-slate-200 p-3 dark:border-slate-800">
      {scenarioKeys.length > 1 && (
        <div className="mb-3 flex flex-wrap gap-2">
          {scenarioKeys.map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => setChosen(key)}
              className={`rounded-md border px-3 py-1 text-sm ${
                chosen === key
                  ? "border-sky-400 bg-sky-50 text-sky-900 dark:border-sky-500 dark:bg-sky-950/40 dark:text-sky-200"
                  : "border-slate-200 text-slate-600 hover:border-slate-300 dark:border-slate-700 dark:text-slate-400"
              }`}
            >
              {scenarioFor(scenarios, key).label}
            </button>
          ))}
        </div>
      )}

      <p className="break-all font-mono text-base text-slate-900 dark:text-slate-100">
        {analysis.text}
      </p>
      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
        {analysis.word_list_label}, counted {analysis.total_frequency} times
        between them
      </p>

      <ul className="mt-3 text-sm">
        {analysis.readings.map((reading, rank) => (
          <ReadingRow
            key={reading.words.join("|")}
            reading={reading}
            entries={entries}
            rank={rank + 1}
            note={noteFor(analysis, reading.words)}
          />
        ))}
      </ul>

      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Stat label="best" value={analysis.best.total_log_score.toFixed(4)} />
        <Stat
          label="next best"
          value={
            analysis.runner_up
              ? analysis.runner_up.total_log_score.toFixed(4)
              : "none"
          }
        />
        <Stat label="the gap" value={analysis.margin.toFixed(4)} />
        <Stat
          label="how likely the next is"
          value={
            analysis.runner_up
              ? `${(analysis.runner_up.share_of_best * 100).toFixed(1)}%`
              : "none"
          }
        />
      </div>

      <p className="mt-3 text-xs text-slate-600 dark:text-slate-400">
        {tied
          ? "The top two score identically, to the last bit, so nothing in the counts separates them and the answer above was settled by a rule outside the score."
          : `The winner is ${(1 / (analysis.runner_up?.share_of_best ?? 1)).toFixed(2)} times as likely as the reading below it under these counts.`}
      </p>

      <Legend />
    </div>
  );
}
