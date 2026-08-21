"use client";

// Every edge the last part of the page quotes, asked of the library live.
//
// The API attempts each one as this page loads and reports what came back, so a
// row saying refused was refused a moment ago rather than in a sentence written
// once. Underneath sit three chains offered to a stack, of which the first and
// the third put a layer that reads a row directly on top of a convolution; the
// refusal names both arrangements and says outright that the two hold the same
// count of numbers, which is the case a check on counts alone would wave
// through. The browser lays the rows out.

import { useEffect, useState } from "react";
import { ApiError } from "@/lib/api";
import { EdgeCases, readEdgeCases } from "@/lib/concepts/convolution";

export function ConvolutionEdgeCases() {
  const [probed, setProbed] = useState<EdgeCases | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setProbed(await readEdgeCases());
      } catch (error) {
        if (error instanceof ApiError) setMessage(error.message);
        else setMessage("Something went wrong.");
      }
    })();
  }, []);

  return (
    <div className="rounded-lg bg-slate-50 p-4 dark:bg-slate-950">
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="text-left text-slate-500 dark:text-slate-400">
              <th className="py-1 pr-3 font-medium">What was asked</th>
              <th className="py-1 pr-3 font-medium">Refused</th>
              <th className="py-1 font-medium">What came back</th>
            </tr>
          </thead>
          <tbody className="text-slate-700 dark:text-slate-300">
            {!probed && (
              <tr>
                <td className="py-1 font-mono">…</td>
              </tr>
            )}
            {(probed?.cases ?? []).map((entry) => (
              <tr
                key={entry.name}
                className="border-t border-slate-200 dark:border-slate-800"
              >
                <td className="py-1.5 pr-3 align-top">
                  <span className="font-medium">{entry.name}</span>
                  <br />
                  <span className="text-slate-500 dark:text-slate-400">
                    {entry.attempt}
                  </span>
                </td>
                <td className="py-1.5 pr-3 align-top">
                  <span
                    className={
                      "rounded px-1.5 py-0.5 font-mono text-[11px] " +
                      (entry.raised
                        ? "bg-amber-200 text-amber-900 dark:bg-amber-900 dark:text-amber-100"
                        : "bg-emerald-200 text-emerald-900 dark:bg-emerald-900 dark:text-emerald-100")
                    }
                  >
                    {entry.raised ? (entry.error ?? "refused") : "accepted"}
                  </span>
                </td>
                <td className="py-1.5 align-top font-mono text-[11px]">
                  {entry.detail ?? entry.outcome}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-3">
        <Stat
          label="Refused"
          value={probed ? `${probed.n_refused} of ${probed.cases.length}` : "…"}
        />
        <Stat
          label="Accepted"
          value={probed ? `${probed.n_accepted} of ${probed.cases.length}` : "…"}
        />
        <Stat
          label="Refusals in the library’s own words"
          value={
            probed
              ? `${probed.n_in_the_library_words} of ${probed.n_refused}`
              : "…"
          }
        />
      </div>

      <div className="mt-5 border-t border-slate-200 pt-4 dark:border-slate-800">
        <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
          Three chains offered to a stack
        </p>
        <div className="mt-2 space-y-3">
          {(probed?.joins ?? []).map((join) => (
            <div
              key={join.name}
              className="rounded-md border border-slate-200 bg-white px-3 py-2 dark:border-slate-800 dark:bg-slate-900"
            >
              <p className="text-xs font-medium text-slate-700 dark:text-slate-300">
                {join.name}
              </p>
              <p className="mt-1 font-mono text-[11px] text-slate-500 dark:text-slate-400">
                beneath answers ({join.beneath.join(", ")}), above reads (
                {join.above.join(", ")}), both hold {join.both_hold} numbers
              </p>
              <p
                className={
                  "mt-1 font-mono text-[11px] " +
                  (join.refused
                    ? "text-amber-700 dark:text-amber-400"
                    : "text-emerald-700 dark:text-emerald-400")
                }
              >
                {join.refused
                  ? `${join.error}: ${join.detail}`
                  : `accepted, ${join.n_layers} layers reading (${join.stack_reads?.join(", ")}) and answering (${join.stack_answers?.join(", ")})`}
              </p>
            </div>
          ))}
          {!probed && (
            <p className="text-xs text-slate-400">…</p>
          )}
        </div>
      </div>

      {message && (
        <p className="mt-3 text-sm text-amber-600 dark:text-amber-400">
          {message}
        </p>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-slate-100 px-3 py-2 dark:bg-slate-800">
      <div className="text-xs text-slate-500 dark:text-slate-400">{label}</div>
      <div className="break-all font-mono text-sm font-semibold text-slate-900 dark:text-slate-100">
        {value}
      </div>
    </div>
  );
}
