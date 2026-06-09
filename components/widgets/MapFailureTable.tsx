"use client";

// Every row of the page's contract table, run against the library rather than
// remembered.
//
// Each row here is one request that was actually made while this page was
// served, and the sentence beside it is either the refusal's own words or a
// description of what the fit answered. That matters more than it sounds: a
// table of edges written by hand goes stale the first time a behaviour changes
// and nothing says so. The API runs each case and reports what came back; the
// browser only lays it out.

import { useEffect, useState } from "react";
import { ApiError } from "@/lib/api";
import { Edges, readEdges } from "@/lib/concepts/self-organising-map";

export function MapFailureTable() {
  const [answer, setAnswer] = useState<Edges | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setAnswer(await readEdges());
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

  return (
    <div className="my-5 overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-slate-200 text-left dark:border-slate-800">
            <th className="py-2 pr-4 font-semibold text-slate-600 dark:text-slate-400">
              the edge
            </th>
            <th className="py-2 pr-4 font-semibold text-slate-600 dark:text-slate-400">
              refused
            </th>
            <th className="py-2 font-semibold text-slate-600 dark:text-slate-400">
              what came back
            </th>
          </tr>
        </thead>
        <tbody>
          {answer.outcomes.map((outcome) => (
            <tr
              key={outcome.edge}
              className="border-b border-slate-100 align-top last:border-0 dark:border-slate-800/60"
            >
              <td className="py-2 pr-4 text-slate-800 dark:text-slate-200">
                {outcome.edge}
              </td>
              <td className="py-2 pr-4">
                <span
                  className={
                    "rounded px-1.5 py-0.5 text-xs font-semibold " +
                    (outcome.accepted
                      ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300"
                      : "bg-rose-100 text-rose-800 dark:bg-rose-950/50 dark:text-rose-300")
                  }
                >
                  {outcome.accepted ? "no" : "yes"}
                </span>
              </td>
              <td className="py-2 text-slate-600 dark:text-slate-400">
                {outcome.detail}
                {outcome.figure !== null && (
                  <span className="ml-2 font-mono text-slate-800 dark:text-slate-200">
                    {outcome.figure.toFixed(4)}
                  </span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {message && (
        <p className="mt-2 text-sm text-amber-600 dark:text-amber-400">
          {message}
        </p>
      )}
    </div>
  );
}
