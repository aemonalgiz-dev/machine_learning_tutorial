"use client";

// The configuration and the fitted copy, told apart.
//
// One chain object is fitted on nine people, and every row here is a fact
// read off that same object afterwards: the model and steps it was built
// with are still unfitted, the copies the fit produced are fitted, and the
// copies are different objects. Then the object is refitted on other people
// and compared with a fresh chain, and a refit is broken on purpose with a
// constant column, to see whether anything of the earlier fit survives it.
// The API fits, refits and reads; the browser lays out the ledger.

import { useEffect, useState } from "react";
import { ApiError } from "@/lib/api";
import { ChainAnatomy, fetchAnatomy } from "@/lib/concepts/pipelines";
import {
  MIDDLE_THREE,
  PAGE_DEGREE,
  PAGE_FOLDS,
  PAGE_PENALTY,
  PAGE_SEED,
  TWELVE_PEOPLE,
} from "./pipelinesFixtures";

export function TemplateLedger() {
  const [anatomy, setAnatomy] = useState<ChainAnatomy | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setAnatomy(
          await fetchAnatomy(
            TWELVE_PEOPLE,
            MIDDLE_THREE,
            PAGE_DEGREE,
            PAGE_PENALTY,
            PAGE_FOLDS,
            PAGE_SEED,
          ),
        );
      } catch (error) {
        if (error instanceof ApiError) setMessage(error.message);
        else setMessage("Something went wrong.");
      }
    })();
  }, []);

  if (!anatomy) {
    return <p className="text-sm text-slate-500 dark:text-slate-400">{message ?? "…"}</p>;
  }

  const yesNo = (value: boolean) => (value ? "yes" : "no");
  const rows: { question: string; answer: string; good: boolean }[] = [
    {
      question: "is the model the chain was built with fitted?",
      answer: yesNo(anatomy.configuration_model_fitted),
      good: !anatomy.configuration_model_fitted,
    },
    {
      question: "are the steps the chain was built with fitted?",
      answer: anatomy.configuration_steps_fitted.map(yesNo).join(", "),
      good: anatomy.configuration_steps_fitted.every((fitted) => !fitted),
    },
    {
      question: "is the fitted copy of the model fitted?",
      answer: yesNo(anatomy.fitted_model_fitted),
      good: anatomy.fitted_model_fitted,
    },
    {
      question: "are the fitted copies different objects from the configuration?",
      answer: yesNo(anatomy.fitted_parts_are_separate),
      good: anatomy.fitted_parts_are_separate,
    },
    {
      question: "the standardizer's centre for height before and after a predict",
      answer: `${anatomy.mean_before_predict.toFixed(4)}, ${anatomy.mean_after_predict.toFixed(4)}`,
      good: anatomy.mean_before_predict === anatomy.mean_after_predict,
    },
    {
      question: "refitted on other people, largest gap to a fresh chain on the same people",
      answer: anatomy.refit_gap.toExponential(1),
      good: anatomy.refit_gap === 0,
    },
    {
      question: "a refit on a constant height column",
      answer: `refused, ${anatomy.failed_refit.error}`,
      good: true,
    },
    {
      question: "still fitted after that refusal, and how far the predictions moved",
      answer: `${yesNo(anatomy.still_fitted_after_failed_refit)}, ${anatomy.predictions_after_failed_refit_gap.toExponential(1)}`,
      good: anatomy.still_fitted_after_failed_refit && anatomy.predictions_after_failed_refit_gap === 0,
    },
    {
      question: "a chain with no steps against the bare model, largest gap",
      answer: anatomy.no_steps_gap.toExponential(1),
      good: anatomy.no_steps_gap === 0,
    },
  ];

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left dark:border-slate-800">
              <th className="py-2 pr-4 font-semibold text-slate-600 dark:text-slate-400">read off the one object</th>
              <th className="py-2 font-semibold text-slate-600 dark:text-slate-400">answer</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.question} className="border-b border-slate-100 last:border-0 dark:border-slate-800/60">
                <td className="py-1.5 pr-4 text-slate-800 dark:text-slate-200">{row.question}</td>
                <td
                  className={
                    "py-1.5 font-mono " +
                    (row.good
                      ? "text-emerald-700 dark:text-emerald-400"
                      : "text-rose-600 dark:text-rose-400")
                  }
                >
                  {row.answer}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
        Every row is read from the same chain, fitted on {anatomy.n_training} of
        the twelve people at degree {anatomy.degree} and penalty {anatomy.penalty}.
        The refusal in the seventh row reads, in full, {anatomy.failed_refit.detail}.
      </p>
      {message && (
        <p className="mt-3 text-sm text-amber-600 dark:text-amber-400">{message}</p>
      )}
    </div>
  );
}
