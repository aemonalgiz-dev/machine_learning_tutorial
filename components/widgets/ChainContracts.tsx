"use client";

// Every edge the page tabulates, asked of the chain on this load.
//
// One request, one row per probe: the edge and either the answer the library
// gave, the refusal by name in its own words, or, in one case, a bare failure
// that is neither, which the page reports as documented rather than
// defended. The table in the page above this is the same list written down;
// this is the list checked. The API asks; the browser lays out the answers.

import { useEffect, useState } from "react";
import { ApiError } from "@/lib/api";
import { ChainContracts as Contracts, fetchChainContracts } from "@/lib/concepts/pipelines";

export function ChainContracts() {
  const [contracts, setContracts] = useState<Contracts | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setContracts(await fetchChainContracts());
      } catch (error) {
        if (error instanceof ApiError) setMessage(error.message);
        else setMessage("Something went wrong.");
      }
    })();
  }, []);

  if (!contracts) {
    return <p className="text-sm text-slate-500 dark:text-slate-400">{message ?? "…"}</p>;
  }

  const refused = contracts.probes.filter((probe) => probe.outcome === "refused").length;
  const escaped = contracts.probes.filter((probe) => probe.outcome === "escaped").length;

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left dark:border-slate-800">
              {["the edge", "what came back"].map((heading) => (
                <th key={heading} className="py-2 pr-4 font-semibold text-slate-600 last:pr-0 dark:text-slate-400">{heading}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {contracts.probes.map((probe) => (
              <tr key={probe.edge} className="border-b border-slate-100 last:border-0 dark:border-slate-800/60">
                <td className="py-1.5 pr-4 text-slate-800 dark:text-slate-200">{probe.edge}</td>
                <td className="py-1.5 text-slate-800 dark:text-slate-200">
                  {probe.outcome === "accepted" && (
                    <span>
                      <span className="font-medium text-emerald-600 dark:text-emerald-400">accepted</span>
                      {probe.result !== null && <span className="font-mono">, {probe.result}</span>}
                    </span>
                  )}
                  {probe.outcome === "refused" && (
                    <span>
                      <span className="font-medium text-rose-600 dark:text-rose-400">refused</span>
                      <span className="font-mono">, {probe.error}</span>
                      <span className="block text-xs text-slate-500 dark:text-slate-400">{probe.detail}</span>
                    </span>
                  )}
                  {probe.outcome === "escaped" && (
                    <span>
                      <span className="font-medium text-amber-600 dark:text-amber-400">escaped as a bare failure</span>
                      <span className="font-mono">, {probe.error}</span>
                      <span className="block text-xs text-slate-500 dark:text-slate-400">{probe.detail}</span>
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
        {contracts.probes.length} edges asked on this load, {refused} refused by name,{" "}
        {contracts.probes.length - refused - escaped} accepted and {escaped} escaped as a
        failure the library did not name.
      </p>
    </div>
  );
}
