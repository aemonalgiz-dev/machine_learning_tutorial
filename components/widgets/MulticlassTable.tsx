"use client";

// The three-class table, with the width stated or left to be inferred.
//
// Sixteen people in three classes, fitted once by the API as a three-way
// choice and judged through the wider table. The first control chooses
// which rows are judged, everybody or a held-out set that happens to hold
// no adults or no teenagers, which is what a fold of a small crowd looks
// like. The second says whether the class count is handed to the evaluation
// or inferred from the judged rows' true classes. Whichever combination is
// chosen, the table, each class's row and column, its precision, recall
// and F1, the macro and micro averages and the refusal, if there is one,
// are the library's own. The API judges; the browser draws.

import { useEffect, useState } from "react";
import { ApiError } from "@/lib/api";
import {
  MulticlassJudgement,
  judgeThreeClasses,
} from "@/lib/concepts/judging-a-classifier";
import { CLASS_NAMES, THREE_CLASS_CROWD, buttonClass, rate } from "./judgingAClassifierFixtures";

type Judged = "everybody" | "without the adults" | "without the teenagers";

const ROWS: Record<Judged, number[] | undefined> = {
  everybody: undefined,
  "without the adults": THREE_CLASS_CROWD.map((person, index) => (person.label === 2 ? -1 : index)).filter((index) => index >= 0),
  "without the teenagers": THREE_CLASS_CROWD.map((person, index) => (person.label === 1 ? -1 : index)).filter((index) => index >= 0),
};

export function MulticlassTable() {
  const [judged, setJudged] = useState<Judged>("everybody");
  const [stated, setStated] = useState(true);
  const [answer, setAnswer] = useState<MulticlassJudgement | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const result = await judgeThreeClasses(THREE_CLASS_CROWD, {
          judged: ROWS[judged],
          statedWidth: stated ? CLASS_NAMES.length : undefined,
        });
        if (cancelled) return;
        setAnswer(result);
        setMessage(null);
      } catch (error) {
        if (cancelled) return;
        setAnswer(null);
        if (error instanceof ApiError) setMessage(error.message);
        else setMessage("Something went wrong.");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [judged, stated]);

  const cell = "border border-slate-200 px-3 py-2 text-center font-mono dark:border-slate-800";

  return (
    <div className="my-4">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-600 dark:text-slate-300">
        <span className="flex gap-1 rounded-md border border-slate-300 p-0.5 dark:border-slate-700">
          {(Object.keys(ROWS) as Judged[]).map((name) => (
            <button key={name} onClick={() => setJudged(name)} className={buttonClass(judged === name)}>
              {name}
            </button>
          ))}
        </span>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={stated} onChange={(event) => setStated(event.target.checked)} className="accent-indigo-600" />
          state the width, three classes
        </label>
      </div>

      {message && (
        <div className="mt-3 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300">
          <span className="font-semibold">Refused. </span>
          {message}
        </div>
      )}

      {answer && (
        <div className="mt-3 grid gap-4 sm:grid-cols-[auto_1fr]">
          <table className="border-collapse text-sm">
            <thead>
              <tr className="text-[11px] text-slate-500 dark:text-slate-400">
                <th className="px-2 py-1 text-right font-medium">is \ called</th>
                {answer.class_names.map((name) => (
                  <th key={name} className="px-2 py-1 font-medium">{name}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {answer.counts.map((row, actual) => (
                <tr key={actual}>
                  <th className="px-2 py-1 text-right text-[11px] font-medium text-slate-500 dark:text-slate-400">{answer.class_names[actual]}</th>
                  {row.map((count, predicted) => (
                    <td key={predicted} className={cell + (actual === predicted ? " bg-indigo-50 font-semibold text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300" : count > 0 ? " bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-300" : " text-slate-400 dark:text-slate-600")}>
                      {count}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-slate-500 dark:text-slate-400">
                  <th className="py-1 pr-3 font-medium">class</th>
                  <th className="py-1 pr-3 font-medium">are</th>
                  <th className="py-1 pr-3 font-medium">called</th>
                  <th className="py-1 pr-3 font-medium">precision</th>
                  <th className="py-1 pr-3 font-medium">recall</th>
                  <th className="py-1 font-medium">F1</th>
                </tr>
              </thead>
              <tbody className="font-mono">
                {answer.classes.map((each) => (
                  <tr key={each.class_index} className="border-t border-slate-200 dark:border-slate-800">
                    <td className="py-1 pr-3 font-sans">{each.name}</td>
                    <td className="py-1 pr-3">{each.actually_are}</td>
                    <td className="py-1 pr-3">{each.predicted_as}</td>
                    <td className="py-1 pr-3">{rate(each.precision)}</td>
                    <td className="py-1 pr-3">{rate(each.recall)}</td>
                    <td className="py-1">{rate(each.f_one)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {answer && (
        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
          <Stat label="rows judged" value={String(answer.n_judged)} />
          <Stat label="width" value={`${answer.n_classes}, ${answer.width_was_stated ? "stated" : "inferred"}`} />
          <Stat label="accuracy" value={answer.accuracy.toFixed(4)} />
          <Stat label="micro precision, micro recall" value={`${answer.micro_precision.toFixed(4)}, ${answer.micro_recall.toFixed(4)}`} />
          <Stat label="macro precision" value={rate(answer.macro_precision)} />
          <Stat label="macro recall" value={rate(answer.macro_recall)} />
          <Stat label="macro F1" value={rate(answer.macro_f_one)} />
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-slate-100 px-2 py-1.5 dark:bg-slate-800">
      <div className="text-[11px] text-slate-500 dark:text-slate-400">{label}</div>
      <div className="font-mono text-sm font-semibold text-slate-900 dark:text-slate-100">{value}</div>
    </div>
  );
}
