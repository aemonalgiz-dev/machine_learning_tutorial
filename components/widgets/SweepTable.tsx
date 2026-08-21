"use client";

// The library's fit repeated, one setting varied, the rest held.
//
// Four tables from one request. The epoch table varies the budget under the
// falling rate and the constant table the same budgets under a rate that
// never falls; the rate table varies a multiplier on the starting rate at a
// fixed budget and marks the fits the library refused as diverged; the seed
// table varies the seed and reports where each walk's first direction landed
// against the eigensolver's and against the page's own seed. Every row is one
// fit of the library through the API, and the browser only lays them out.

import { useEffect, useState } from "react";
import { ApiError } from "@/lib/api";
import { Sweeps, sweepHebbian } from "@/lib/concepts/hebbian-pca";
import { PEOPLE, PeopleKey } from "./hebbianPcaFixtures";

export type SweepSection = "epochs" | "constant" | "rates" | "seeds";

export function SweepTable({ people = "four", section = "epochs" }: { people?: PeopleKey; section?: SweepSection }) {
  const points = PEOPLE[people];
  const [sweeps, setSweeps] = useState<Sweeps | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let live = true;
    (async () => {
      try {
        const answer = await sweepHebbian(points);
        if (!live) return;
        setSweeps(answer);
        setMessage(null);
      } catch (error) {
        if (!live) return;
        if (error instanceof ApiError) setMessage(error.message);
        else setMessage("Something went wrong.");
      }
    })();
    return () => {
      live = false;
    };
  }, [points]);

  if (!sweeps) {
    return <p className="text-sm text-slate-500 dark:text-slate-400">{message ?? "…"}</p>;
  }

  const degrees = (value: number) => (value < 0.001 ? value.toExponential(1) : value.toFixed(3)) + "°";
  let headings: string[];
  let rows: string[][];

  if (section === "epochs" || section === "constant") {
    headings = ["budget", "epochs run", "settled", "first angle", "second angle", "first length", "second length", "shares"];
    rows = sweeps[section].map((fit) => [
      String(fit.max_epochs),
      String(fit.epochs_run),
      fit.converged ? "yes" : "no",
      degrees(fit.angles_degrees[0]),
      degrees(fit.angles_degrees[1]),
      fit.lengths[0].toFixed(4),
      fit.lengths[1].toFixed(4),
      fit.shares.map((share) => share.toFixed(3)).join(" / "),
    ]);
  } else if (section === "rates") {
    headings = ["multiplier", "starting rate", "outcome", "first angle", "second angle", "second length"];
    rows = sweeps.rates.map((fit) => [
      `${fit.rate_multiplier}×`,
      fit.starting_rate.toPrecision(3),
      fit.diverged ? "refused, diverged" : fit.epochs_run === 200 ? "ran the full 200" : `settled at ${fit.epochs_run}`,
      fit.angles_degrees ? degrees(fit.angles_degrees[0]) : "…",
      fit.angles_degrees ? degrees(fit.angles_degrees[1]) : "…",
      fit.lengths ? fit.lengths[1].toFixed(4) : "…",
    ]);
  } else {
    headings = ["seed", "first direction", "length", "angle to the eigen direction", "angle to seed 11", "epochs run"];
    rows = sweeps.seeds.map((fit) => [
      String(fit.seed),
      `(${fit.dx.toFixed(3)}, ${fit.dy.toFixed(3)})`,
      fit.length.toFixed(4),
      degrees(fit.angle_degrees),
      degrees(fit.angle_to_first_seed_degrees),
      String(fit.epochs_run),
    ]);
  }

  return (
    <div className="my-3 overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-slate-200 text-left dark:border-slate-800">
            {headings.map((heading) => (
              <th key={heading} className="py-2 pr-4 font-semibold text-slate-600 last:pr-0 dark:text-slate-400">{heading}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.join("|")} className="border-b border-slate-100 last:border-0 dark:border-slate-800/60">
              {row.map((cell, column) => (
                <td key={`${column}-${cell}`} className="py-2 pr-4 font-mono text-slate-800 last:pr-0 dark:text-slate-200">{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
        Starting rate {sweeps.starting_rate.toPrecision(3)}; eigen shares {sweeps.eigen.map((component) => component.share.toFixed(4)).join(" and ")}.
      </p>
      {message && <p className="mt-2 text-sm text-amber-600 dark:text-amber-400">{message}</p>}
    </div>
  );
}
