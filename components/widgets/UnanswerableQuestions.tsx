"use client";

// The edges of the definition, each one asked and the answer reported.
//
// Some of these questions have an answer and some have none, and the point of
// putting them side by side is that the difference is a fact about the
// arithmetic rather than a matter of taste: an angle to a vector of no length
// does not exist, and a word the table never met has no row to read. The API
// asks each question and rewrites what comes back in plain words; the browser
// only lays the rows out.

import { useEffect, useState } from "react";
import { ApiError } from "@/lib/api";
import { ContractProbe, fetchContracts } from "@/lib/concepts/a-vector-for-a-word";

export function UnanswerableQuestions() {
  const [probes, setProbes] = useState<ContractProbe[] | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setProbes(await fetchContracts());
      } catch (error) {
        setMessage(error instanceof ApiError ? error.message : "Something went wrong.");
      }
    })();
  }, []);

  if (!probes) {
    return <p className="text-sm text-slate-500 dark:text-slate-400">{message ?? "…"}</p>;
  }

  return (
    <table className="w-full text-xs">
      <thead>
        <tr className="text-slate-400 dark:text-slate-500">
          <th className="w-2/5 text-left font-normal">the question</th>
          <th className="text-left font-normal">what comes back</th>
        </tr>
      </thead>
      <tbody>
        {probes.map((probe) => (
          <tr
            key={probe.edge}
            className="border-t border-slate-100 align-top dark:border-slate-800"
          >
            <td className="py-1.5 pr-3 text-slate-700 dark:text-slate-300">
              {probe.edge}
            </td>
            <td className="py-1.5">
              <span
                className={
                  "mr-2 rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase " +
                  (probe.outcome === "refused"
                    ? "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300"
                    : "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300")
                }
              >
                {probe.outcome === "refused" ? "no answer" : "answered"}
              </span>
              <span className="text-slate-600 dark:text-slate-400">
                {probe.reason ?? probe.result}
              </span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
