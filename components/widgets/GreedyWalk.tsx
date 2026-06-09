"use client";

// The rule walked one position at a time, with every candidate it asked about.
//
// The API runs the scan and reports, for each position, the substrings tried in
// the order they were tried, longest first, and which one was taken; the browser
// lays the steps out in order and marks the take. A reader can check the whole
// of it against the word list beside it, which is the point of a text this
// short.

import { useEffect, useState } from "react";
import {
  Scan,
  ScenariosView,
  fetchScenarios,
  messageFor,
  readingFor,
  scenarioFor,
  WalkStep,
} from "@/lib/concepts/maximum-matching";
import { Chip, Cut, Loading, WordsCut } from "./maximumMatchingParts";

function Step({ step, fromTheRight }: { step: WalkStep; fromTheRight: boolean }) {
  return (
    <li className="flex flex-wrap items-center gap-2 border-b border-slate-100 py-2 last:border-0 dark:border-slate-800/60">
      <span className="w-24 shrink-0 text-xs text-slate-500 dark:text-slate-400">
        {fromTheRight ? "ending at" : "position"} {step.at}
      </span>
      <span className="flex flex-wrap items-center gap-1">
        {step.attempts.length === 0 ? (
          <span className="text-xs text-slate-500 dark:text-slate-400">
            one character left, so nothing to try
          </span>
        ) : (
          step.attempts.map((attempt, position) => (
            <span
              key={`${position}-${attempt.text}`}
              className={
                attempt.is_entry
                  ? "rounded border border-sky-300 bg-sky-50 px-1.5 py-0.5 font-mono text-sm text-sky-900 dark:border-sky-500/60 dark:bg-sky-950/40 dark:text-sky-200"
                  : "rounded border border-slate-200 px-1.5 py-0.5 font-mono text-sm text-slate-400 line-through dark:border-slate-700 dark:text-slate-500"
              }
            >
              {attempt.text}
            </span>
          ))
        )}
      </span>
      <span className="text-xs text-slate-500 dark:text-slate-400">takes</span>
      <Chip text={step.taken} tone={step.taken_is_entry ? "entry" : "lone"} />
    </li>
  );
}

export function GreedyWalk({
  scenarioKey = "park",
  scan = "left to right",
}: {
  scenarioKey?: string;
  scan?: Scan;
}) {
  const [scenarios, setScenarios] = useState<ScenariosView | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [direction, setDirection] = useState<Scan>(scan);

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

  const scenario = scenarioFor(scenarios, scenarioKey);
  const reading = readingFor(scenario.analysis, direction);
  const steps = reading.walk ?? [];

  return (
    <div className="rounded-lg border border-slate-200 p-3 dark:border-slate-800">
      <div className="mb-3 flex flex-wrap gap-2">
        {(["left to right", "right to left"] as Scan[]).map((choice) => (
          <button
            key={choice}
            type="button"
            onClick={() => setDirection(choice)}
            className={`rounded-md border px-3 py-1 text-sm ${
              direction === choice
                ? "border-sky-400 bg-sky-50 text-sky-900 dark:border-sky-500 dark:bg-sky-950/40 dark:text-sky-200"
                : "border-slate-200 text-slate-600 hover:border-slate-300 dark:border-slate-700 dark:text-slate-400"
            }`}
          >
            {choice}
          </button>
        ))}
      </div>

      <p className="mb-1 text-xs font-medium text-slate-500 dark:text-slate-400">
        The text, {scenario.analysis.n_characters} characters
      </p>
      <p className="break-all font-mono text-base text-slate-900 dark:text-slate-100">
        {scenario.analysis.text}
      </p>

      {scenario.words_in_list.length > 0 && (
        <>
          <p className="mb-1 mt-3 text-xs font-medium text-slate-500 dark:text-slate-400">
            The whole word list, {scenario.analysis.n_words_in_list} entries, longest{" "}
            {scenario.analysis.longest_entry} characters
          </p>
          <WordsCut words={scenario.words_in_list} />
        </>
      )}

      <p className="mb-1 mt-4 text-xs font-medium text-slate-500 dark:text-slate-400">
        {direction === "left to right"
          ? "Each position, longest candidate first, until one is an entry"
          : "Each position counted from the right, longest candidate first"}
      </p>
      <ul className="text-sm">
        {steps.map((step, position) => (
          <Step
            key={`${position}-${step.at}-${step.taken}`}
            step={step}
            fromTheRight={direction === "right to left"}
          />
        ))}
      </ul>

      <p className="mb-1 mt-4 text-xs font-medium text-slate-500 dark:text-slate-400">
        The answer, {reading.n_pieces} pieces from {reading.n_lookups} candidates
        asked about
      </p>
      <Cut pieces={reading.pieces} />
    </div>
  );
}
