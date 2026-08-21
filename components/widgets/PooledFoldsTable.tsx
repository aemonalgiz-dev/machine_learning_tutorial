"use client";

// The same twelve people dealt four different ways, scored two different ways.
//
// Each row is one deal: how many folds, and whether the deal was made to keep
// each fold's class balance. The averaged column takes each fold's accuracy
// and means them. The pooled column adds the folds' tables together first and
// divides once. The pooled figure is identical on every row, because every
// person is held out exactly once whatever the deal, so it is always the same
// table being divided. The averaged figure is not. Every number comes from the
// library through the API.

import { useEffect, useState } from "react";
import { ApiError } from "@/lib/api";
import { FoldedScores, foldTheCrowd } from "@/lib/concepts/judging-a-classifier";
import { OVERLAPPING_CROWD } from "./judgingAClassifierFixtures";

interface Deal {
  folds: number;
  stratified: boolean;
}

const DEALS: Deal[] = [
  { folds: 5, stratified: false },
  { folds: 5, stratified: true },
  { folds: 7, stratified: false },
  { folds: 7, stratified: true },
];

type Scored = Deal & { scores: FoldedScores };

export function PooledFoldsTable() {
  const [rows, setRows] = useState<Scored[] | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const scored = await Promise.all(
          DEALS.map(async (deal) => ({
            ...deal,
            scores: await foldTheCrowd(
              OVERLAPPING_CROWD,
              deal.folds,
              deal.stratified,
            ),
          })),
        );
        if (cancelled) return;
        setRows(scored);
        setMessage(null);
      } catch (error) {
        if (cancelled) return;
        if (error instanceof ApiError) setMessage(error.message);
        else setMessage("Something went wrong.");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="my-4">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-slate-500 dark:text-slate-400">
              <th className="py-1 pr-3 font-medium">the deal</th>
              <th className="py-1 pr-3 font-medium">accuracies averaged</th>
              <th className="py-1 pr-3 font-medium">tables pooled</th>
              <th className="py-1 pr-3 font-medium">spread</th>
              <th className="py-1 font-medium">folds missing a class</th>
            </tr>
          </thead>
          <tbody className="font-mono">
            {(rows ?? []).map((row) => (
              <tr
                key={`${row.folds}-${row.stratified}`}
                className="border-t border-slate-200 dark:border-slate-800"
              >
                <td className="py-1 pr-3 font-sans">
                  {row.folds} folds
                  {row.stratified ? ", balanced" : ""}
                </td>
                <td className="py-1 pr-3">
                  {row.scores.mean_fold_accuracy.toFixed(4)}
                </td>
                <td className="py-1 pr-3 font-semibold text-indigo-600 dark:text-indigo-400">
                  {row.scores.pooled_accuracy.toFixed(4)}
                </td>
                <td className="py-1 pr-3">
                  {row.scores.accuracy_spread.toFixed(4)}
                </td>
                <td className="py-1">
                  {row.scores.classes_missing_from_a_fold}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {rows && (
        <p className="mt-2 text-xs text-slate-500 dark:text-slate-500">
          The pooled column holds one value on every row. The averaged column
          holds{" "}
          {new Set(rows.map((row) => row.scores.mean_fold_accuracy.toFixed(4)))
            .size}{" "}
          different ones for the same twelve people.
        </p>
      )}

      {message && (
        <p className="mt-2 text-sm text-rose-600 dark:text-rose-400">{message}</p>
      )}
    </div>
  );
}
