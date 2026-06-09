"use client";

// One word walked through the machine, character by character and step by step.
//
// The API runs the search and reports two things. The first is the state each
// character was read in, which is what turns the machine from a picture into
// something a reader can follow along a word. The second is every line the
// search tried, in the order it tried them and indented by how many lines had
// already been taken, with what came of each; the browser lays those out and
// greys the ones that led nowhere. Nothing here decides what may follow what.

import { useEffect, useState } from "react";
import {
  ScenariosView,
  TraceStep,
  WordView,
  fetchScenarios,
  messageFor,
} from "@/lib/concepts/finite-state-morphology";
import { Chip, Loading, Readings } from "./morphologyParts";

const CHOICES: { key: keyof ScenariosView; label: string }[] = [
  { key: "walked", label: "walked" },
  { key: "walks", label: "walks" },
  { key: "bakes", label: "bakes" },
  { key: "baked_after", label: "baked" },
  { key: "bakeed_after", label: "bakeed" },
];

function Step({ step }: { step: TraceStep }) {
  return (
    <li
      className="flex flex-wrap items-center gap-2 border-b border-slate-100 py-1.5 last:border-0 dark:border-slate-800/60"
      style={{ paddingLeft: `${step.depth * 20}px` }}
    >
      <span className="w-24 shrink-0 text-[11px] text-slate-500 dark:text-slate-400">
        at {step.at} in the {step.state === "word" ? "start" : step.state}
      </span>
      <span
        className={
          step.leads_anywhere
            ? "rounded border border-sky-300 bg-sky-50 px-1.5 py-0.5 font-mono text-sm text-sky-900 dark:border-sky-500/60 dark:bg-sky-950/40 dark:text-sky-200"
            : "rounded border border-slate-200 px-1.5 py-0.5 font-mono text-sm text-slate-400 line-through dark:border-slate-700 dark:text-slate-500"
        }
      >
        {step.surface}
      </span>
      <span className="font-mono text-[11px] text-slate-500 dark:text-slate-400">
        {step.label}
      </span>
      <span
        className={
          step.leads_anywhere
            ? "text-xs text-slate-600 dark:text-slate-400"
            : "text-xs text-slate-400 dark:text-slate-500"
        }
      >
        {step.outcome}
      </span>
    </li>
  );
}

function Characters({ view }: { view: WordView }) {
  if (view.states_by_character.length === 0) {
    return (
      <p className="text-sm text-slate-500 dark:text-slate-400">
        The walk never reached the end, so no character was read in any state
        that led anywhere.
      </p>
    );
  }
  return (
    <div className="flex flex-wrap gap-1">
      {view.states_by_character.map((row) => (
        <div key={row.at} className="text-center">
          <Chip
            text={row.character}
            tone={row.morph_index === 0 ? "stem" : "ending"}
          />
          <div className="mt-1 max-w-24 text-[10px] leading-tight text-slate-500 dark:text-slate-400">
            {row.state}
          </div>
        </div>
      ))}
    </div>
  );
}

export function WalkThroughAWord({
  word = "walked",
  showChoices = true,
}: {
  word?: keyof ScenariosView;
  showChoices?: boolean;
}) {
  const [scenarios, setScenarios] = useState<ScenariosView | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [chosen, setChosen] = useState<keyof ScenariosView>(word);

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

  const view = scenarios[chosen] as WordView;

  return (
    <div className="rounded-lg border border-slate-200 p-3 dark:border-slate-800">
      {showChoices && (
        <div className="mb-3 flex flex-wrap gap-2">
          {CHOICES.map((choice) => (
            <button
              key={choice.key}
              type="button"
              onClick={() => setChosen(choice.key)}
              className={`rounded-md border px-3 py-1 font-mono text-sm ${
                chosen === choice.key
                  ? "border-sky-400 bg-sky-50 text-sky-900 dark:border-sky-500 dark:bg-sky-950/40 dark:text-sky-200"
                  : "border-slate-200 text-slate-600 hover:border-slate-300 dark:border-slate-700 dark:text-slate-400"
              }`}
            >
              {choice.label}
            </button>
          ))}
        </div>
      )}

      <p className="mb-1 text-xs font-medium text-slate-500 dark:text-slate-400">
        Each character, and the state the machine was in while it read it
      </p>
      <Characters view={view} />

      <p className="mb-1 mt-4 text-xs font-medium text-slate-500 dark:text-slate-400">
        Every line tried, in the order the search tried them,{" "}
        {view.n_lines_tried} in all
      </p>
      <ul className="text-sm">
        {view.trace.map((step, position) => (
          <Step key={`${position}-${step.at}-${step.surface}-${step.label}`} step={step} />
        ))}
      </ul>

      <p className="mb-2 mt-4 text-xs font-medium text-slate-500 dark:text-slate-400">
        What came back
      </p>
      <Readings view={view} />
    </div>
  );
}
