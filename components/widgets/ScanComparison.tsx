"use client";

// One text scanned from each end, with the fewest pieces any reading of it
// could have used sitting underneath both.
//
// The API runs both scans and, separately, searches every reading whose pieces
// are entries or lone characters to find the floor; the browser puts the two
// answers side by side and says whether the greedy one reached that floor. The
// floor is what makes the failure a measurement rather than an opinion, since a
// scan that used more pieces than some reading needed passed a better answer by.

import { useEffect, useState } from "react";
import {
  ScenariosView,
  fetchScenarios,
  messageFor,
  readingFor,
  scenarioFor,
} from "@/lib/concepts/maximum-matching";
import {
  CutsLine,
  Legend,
  Loading,
  ReadingBlock,
  WordsCut,
} from "./maximumMatchingParts";

export function ScanComparison({
  scenarioKeys = ["table", "park"],
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

  const scenario = scenarioFor(scenarios, chosen);
  const analysis = scenario.analysis;
  const left = readingFor(analysis, "left to right");
  const right = readingFor(analysis, "right to left");
  const both = readingFor(analysis, "both");
  const agree = left.pieces.map((piece) => piece.text).join("|") ===
    right.pieces.map((piece) => piece.text).join("|");

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
      <CutsLine
        n_characters={analysis.n_characters}
        n_cuts={analysis.n_cuts}
      />

      {scenario.words_in_list.length > 0 && (
        <div className="mt-3">
          <p className="mb-1 text-xs font-medium text-slate-500 dark:text-slate-400">
            The word list, {analysis.n_words_in_list} entries
          </p>
          <WordsCut words={scenario.words_in_list} />
        </div>
      )}

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <ReadingBlock reading={left} heading="Scanned from the left" />
        <ReadingBlock reading={right} heading="Scanned from the right" />
      </div>

      <p className="mt-3 text-xs text-slate-600 dark:text-slate-400">
        {agree
          ? "The two scans agree here."
          : `The two scans disagree. Running both and keeping one keeps the ${both.chosen_scan} answer, because ${both.decided_by}.`}
      </p>

      <div className="mt-3 rounded-lg bg-slate-100 px-3 py-2 dark:bg-slate-800/60">
        <p className="text-xs text-slate-600 dark:text-slate-400">
          Searching every reading whose pieces are entries or lone characters,
          the fewest any of them uses is {analysis.shortest.n_pieces}, and{" "}
          {analysis.shortest.n_readings} readings reach it.{" "}
          {analysis.greedy_reaches_shortest
            ? "The left-to-right answer is one of the shortest available."
            : `The left-to-right answer used ${left.n_pieces}, so a shorter reading was there and was passed over.`}
        </p>
        {analysis.shortest.readings.length > 0 && (
          <div className="mt-2 space-y-1">
            {analysis.shortest.readings.map((reading, position) => (
              <p
                key={`${position}-${reading.join("|")}`}
                className="break-all font-mono text-xs text-slate-700 dark:text-slate-300"
              >
                {reading.join(" | ")}
              </p>
            ))}
          </div>
        )}
      </div>

      {scenario.reader_reading && (
        <p className="mt-3 break-all text-xs text-slate-600 dark:text-slate-400">
          A reader answers{" "}
          <span className="font-mono">
            {scenario.reader_reading.join(" | ")}
          </span>
          , which is {scenario.reader_reading.length} words.
        </p>
      )}

      <Legend />
    </div>
  );
}
