"use client";

// The same four cells read three ways.
//
// The table is the twelve people judged at the halfway threshold, and the
// buttons choose which question is being asked of it. Precision reads along
// the row of people the model called adult, recall reads down the column of
// people who are adults, and specificity reads down the column of children.
// The cells the chosen ratio uses are highlighted and the ratio is written
// out underneath from those cells, so the reader can see that the three
// rates share a table and differ only in which total sits underneath. The
// counts come from the API; the browser draws.

import { useEffect, useState } from "react";
import { ApiError } from "@/lib/api";
import {
  ClassifierEvaluation,
  evaluateAtThreshold,
} from "@/lib/concepts/judging-a-classifier";
import { OVERLAPPING_CROWD, buttonClass } from "./judgingAClassifierFixtures";

type Reading = "precision" | "recall" | "specificity" | "accuracy";

const QUESTION: Record<Reading, string> = {
  precision: "of the people called adult, how many are?",
  recall: "of the adults, how many were found?",
  specificity: "of the children, how many were left alone?",
  accuracy: "of everybody, how many were called rightly?",
};

// Which cells each reading counts on top and underneath.
const CELLS: Record<Reading, { numerator: string[]; denominator: string[] }> = {
  precision: { numerator: ["tp"], denominator: ["tp", "fp"] },
  recall: { numerator: ["tp"], denominator: ["tp", "fn"] },
  specificity: { numerator: ["tn"], denominator: ["tn", "fp"] },
  accuracy: { numerator: ["tp", "tn"], denominator: ["tp", "fp", "fn", "tn"] },
};

export function TwoReadings() {
  const [reading, setReading] = useState<Reading>("precision");
  const [answer, setAnswer] = useState<ClassifierEvaluation | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setAnswer(await evaluateAtThreshold(OVERLAPPING_CROWD, 0.5));
      } catch (error) {
        if (error instanceof ApiError) setMessage(error.message);
        else setMessage("Something went wrong.");
      }
    })();
  }, []);

  if (!answer) {
    return <p className="text-sm text-slate-500 dark:text-slate-400">{message ?? "…"}</p>;
  }

  const counts: Record<string, number> = {
    tp: answer.counts.true_positives,
    fp: answer.counts.false_positives,
    fn: answer.counts.false_negatives,
    tn: answer.counts.true_negatives,
  };
  const chosen = CELLS[reading];
  const top = chosen.numerator.reduce((sum, key) => sum + counts[key], 0);
  const bottom = chosen.denominator.reduce((sum, key) => sum + counts[key], 0);
  const value =
    reading === "accuracy"
      ? answer.rates.accuracy
      : reading === "precision"
        ? answer.rates.precision
        : reading === "recall"
          ? answer.rates.recall
          : answer.rates.specificity;

  const cellClass = (key: string) => {
    const inTop = chosen.numerator.includes(key);
    const inBottom = chosen.denominator.includes(key);
    const base = "border border-slate-200 p-3 text-center dark:border-slate-800 ";
    if (inTop) return base + "bg-indigo-100 font-semibold text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-200";
    if (inBottom) return base + "bg-amber-50 text-amber-800 dark:bg-amber-900/30 dark:text-amber-200";
    return base + "text-slate-400 dark:text-slate-600";
  };

  return (
    <div className="my-4">
      <div className="flex flex-wrap items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
        <span className="flex gap-1 rounded-md border border-slate-300 p-0.5 dark:border-slate-700">
          {(["precision", "recall", "specificity", "accuracy"] as Reading[]).map((name) => (
            <button key={name} onClick={() => setReading(name)} className={buttonClass(reading === name)}>
              {name}
            </button>
          ))}
        </span>
        <span className="text-xs text-slate-500 dark:text-slate-400">{QUESTION[reading]}</span>
      </div>

      <div className="mt-3 grid gap-4 sm:grid-cols-[auto_1fr] sm:items-center">
        <table className="border-collapse font-mono text-sm">
          <thead>
            <tr className="text-[11px] font-sans text-slate-500 dark:text-slate-400">
              <th className="p-1" />
              <th className="p-1 font-medium">is adult</th>
              <th className="p-1 font-medium">is child</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <th className="p-1 text-right text-[11px] font-sans font-medium text-slate-500 dark:text-slate-400">called adult</th>
              <td className={cellClass("tp")}>{counts.tp}</td>
              <td className={cellClass("fp")}>{counts.fp}</td>
            </tr>
            <tr>
              <th className="p-1 text-right text-[11px] font-sans font-medium text-slate-500 dark:text-slate-400">called child</th>
              <td className={cellClass("fn")}>{counts.fn}</td>
              <td className={cellClass("tn")}>{counts.tn}</td>
            </tr>
          </tbody>
        </table>
        <div className="rounded-lg bg-slate-100 px-4 py-3 font-mono text-sm text-slate-800 dark:bg-slate-800 dark:text-slate-200">
          <p>
            {reading} = {chosen.numerator.map((key) => counts[key]).join(" + ")} / ({chosen.denominator.map((key) => counts[key]).join(" + ")})
          </p>
          <p className="mt-1">
            = {top} / {bottom} = <span className="font-semibold text-indigo-600 dark:text-indigo-400">{value === null ? "undefined" : value.toFixed(4)}</span>
          </p>
          <p className="mt-2 text-xs font-sans text-slate-500 dark:text-slate-400">
            Indigo cells are counted on top, amber cells are added underneath, and grey cells play no part in this question.
          </p>
        </div>
      </div>
      {message && <p className="mt-2 text-sm text-rose-600 dark:text-rose-400">{message}</p>}
    </div>
  );
}
