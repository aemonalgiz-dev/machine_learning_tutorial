"use client";

// The bagging-versus-forest comparison repeated under several seeds.
//
// One out-of-bag comparison at one seed is one observed result. Here the
// same crowd, the same twenty-five members and the same tree settings are
// refitted under eight seeds, bagging and forest side by side, with the
// root census and the paired out-of-bag scores for each. What is stable
// across the rows is the procedure's behaviour; what wobbles is the seed.
// Every committee is the library's.

import { useEffect, useState } from "react";
import { ApiError, SeedComparison as SeedAnswer, compareAcrossSeeds } from "@/lib/api";
import { TANGLED_CROWD } from "./BootstrapMachine";

const BAGGING = "#6366f1";
const FOREST = "#10b981";
const N_SEEDS = 8;
const N_MEMBERS = 25;

export function SeedComparison() {
  const [answer, setAnswer] = useState<SeedAnswer | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setAnswer(await compareAcrossSeeds(TANGLED_CROWD, N_SEEDS, N_MEMBERS));
      } catch (error) {
        if (error instanceof ApiError) setMessage(error.message);
        else setMessage("Something went wrong.");
      }
    })();
  }, []);

  if (!answer) {
    return <p className="text-sm text-slate-500 dark:text-slate-400">{message ?? "…"}</p>;
  }

  const forestWins = answer.results.filter((row) => row.forest_out_of_bag > row.bagging_out_of_bag).length;
  const ties = answer.results.filter((row) => row.forest_out_of_bag === row.bagging_out_of_bag).length;
  const baggingRoots = answer.results.map((row) => row.bagging_roots_on_height);
  const forestRoots = answer.results.map((row) => row.forest_roots_on_height);
  const bar = (value: number, colour: string) => (
    <div className="flex items-center gap-2">
      <div className="h-3 rounded-sm" style={{ width: `${value * 100}%`, backgroundColor: colour, opacity: 0.8 }} />
      <span className="font-mono text-xs text-slate-700 dark:text-slate-200">{value.toFixed(2)}</span>
    </div>
  );

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="text-slate-500 dark:text-slate-400">
              <th className="py-1 pr-2 font-medium">seed</th>
              <th className="py-1 pr-2 font-medium">bagging roots on height</th>
              <th className="py-1 pr-2 font-medium">forest roots on height</th>
              <th className="w-1/4 py-1 pr-2 font-medium" style={{ color: BAGGING }}>bagging out of bag</th>
              <th className="w-1/4 py-1 pr-2 font-medium" style={{ color: FOREST }}>forest out of bag</th>
              <th className="py-1 font-medium">difference</th>
            </tr>
          </thead>
          <tbody>
            {answer.results.map((row) => {
              const difference = row.forest_out_of_bag - row.bagging_out_of_bag;
              return (
                <tr key={row.seed} className="border-t border-slate-200 dark:border-slate-800">
                  <td className="py-1.5 pr-2 font-mono">{row.seed}</td>
                  <td className="py-1.5 pr-2 font-mono">{row.bagging_roots_on_height} of {N_MEMBERS}</td>
                  <td className="py-1.5 pr-2 font-mono">{row.forest_roots_on_height} of {N_MEMBERS}</td>
                  <td className="py-1.5 pr-2">{bar(row.bagging_out_of_bag, BAGGING)}</td>
                  <td className="py-1.5 pr-2">{bar(row.forest_out_of_bag, FOREST)}</td>
                  <td className={`py-1.5 font-mono ${difference > 0 ? "text-emerald-600 dark:text-emerald-400" : difference < 0 ? "text-rose-600 dark:text-rose-400" : "text-slate-500"}`}>
                    {difference > 0 ? "+" : ""}{difference.toFixed(2)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
        The forest scored higher on {forestWins} of {N_SEEDS} seeds{ties > 0 ? `, tied on ${ties},` : ""} and the mean difference, forest minus bagging, is {answer.mean_difference > 0 ? "+" : ""}{answer.mean_difference.toFixed(3)}. Bagging roots on height in {Math.min(...baggingRoots)} to {Math.max(...baggingRoots)} of {N_MEMBERS} trees across the seeds, the forest in {Math.min(...forestRoots)} to {Math.max(...forestRoots)}.
      </p>
    </div>
  );
}
