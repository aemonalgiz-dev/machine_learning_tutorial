"use client";

// Every edge the last part of the page lists, asked on this load.
//
// One request, one row per edge, and each row says whether the edge was
// accepted or refused and what came back. The refusals are the machine's own
// wording with the names of columns, classes and settings taken out of it on
// the way through the API, since a reader here has no use for either. The table
// above this in the page is the same list written down; this is the list
// checked. The API asks; the browser lays out the answers.

import { useEffect, useState } from "react";
import {
  ApiError,
  BoltzmannContracts as Contracts,
  fetchBoltzmannContracts,
} from "@/lib/concepts/restricted-boltzmann-machine";

let cached: Promise<Contracts> | null = null;

function contracts(): Promise<Contracts> {
  cached ??= fetchBoltzmannContracts();
  return cached;
}

export function BoltzmannContracts() {
  const [answer, setAnswer] = useState<Contracts | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setAnswer(await contracts());
      } catch (error) {
        if (error instanceof ApiError) setMessage(error.message);
        else setMessage("Something went wrong.");
      }
    })();
  }, []);

  if (!answer) {
    return (
      <p className="text-sm text-slate-500 dark:text-slate-400">
        {message ?? "…"}
      </p>
    );
  }

  const refused = answer.probes.filter(
    (probe) => probe.outcome === "refused",
  ).length;

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left dark:border-slate-800">
              {["the edge", "what came back"].map((heading) => (
                <th
                  key={heading}
                  className="py-2 pr-4 font-semibold text-slate-600 last:pr-0 dark:text-slate-400"
                >
                  {heading}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {answer.probes.map((probe) => (
              <tr
                key={probe.edge}
                className="border-b border-slate-100 last:border-0 dark:border-slate-800/60"
              >
                <td className="py-1.5 pr-4 align-top text-slate-800 dark:text-slate-200">
                  {probe.edge}
                </td>
                <td className="py-1.5 align-top text-slate-800 dark:text-slate-200">
                  <span
                    className={
                      "font-medium " +
                      (probe.outcome === "accepted"
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-rose-600 dark:text-rose-400")
                    }
                  >
                    {probe.outcome}
                  </span>
                  <span className="block text-xs text-slate-500 dark:text-slate-400">
                    {probe.detail}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
        {answer.probes.length} edges asked on this load, {refused} refused and{" "}
        {answer.probes.length - refused} accepted. Every refusal here is a
        deliberate one, in words rather than a crash.
      </p>
    </div>
  );
}
