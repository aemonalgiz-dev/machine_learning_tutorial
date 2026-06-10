"use client";

// The figures that depend on training, under three sets of starting weights.
//
// The network behind every picture's position learns from a random start, and
// a different start gives different positions. So the page's two headline
// numbers, how often a neighbour shares the query's kind and how much of the
// true answer two cells of the inverted file recover, are measured again with
// the network trained from two other weight seeds. Each row is its own request
// because each is a network trained from scratch; they arrive one at a time.

import { useEffect, useState } from "react";
import { ApiError } from "@/lib/api";
import {
  SeedResponse,
  fetchSeed,
} from "@/lib/concepts/searching-a-collection-of-pictures";

const SEEDS = [0, 1, 2] as const;

export function SearchSeedTable() {
  const [rows, setRows] = useState<(SeedResponse | null)[]>([null, null, null]);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let current = true;
    SEEDS.forEach((seed, position) => {
      fetchSeed(seed)
        .then((loaded) => {
          if (!current) return;
          setRows((previous) => previous.map((row, index) => (index === position ? loaded : row)));
        })
        .catch((error) => {
          if (current) setMessage(error instanceof ApiError ? error.message : "Something went wrong.");
        });
    });
    return () => {
      current = false;
    };
  }, []);

  const cell = (value: number | undefined, digits = 4) => (value === undefined ? "…" : value.toFixed(digits));

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left dark:border-slate-800">
              {["weight seed", "network’s own accuracy", "nearest shares kind", "ten nearest share kind", "two of 32 cells recover", "share read"].map((heading) => (
                <th key={heading} className="py-2 pr-4 font-semibold text-slate-600 dark:text-slate-400">{heading}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {SEEDS.map((seed, position) => {
              const row = rows[position];
              return (
                <tr key={seed} className="border-b border-slate-100 last:border-0 dark:border-slate-800/60">
                  <td className="py-2 pr-4 font-mono text-slate-800 dark:text-slate-200">{seed === 0 ? "0, the widgets’" : seed}</td>
                  <td className="py-2 pr-4 font-mono text-slate-800 dark:text-slate-200">{cell(row?.network_held_out_accuracy)}</td>
                  <td className="py-2 pr-4 font-mono text-slate-800 dark:text-slate-200">{cell(row?.precision_at_one)}</td>
                  <td className="py-2 pr-4 font-mono text-slate-800 dark:text-slate-200">{cell(row?.precision_at_k)}</td>
                  <td className="py-2 pr-4 font-mono text-slate-800 dark:text-slate-200">{cell(row?.index_recall)}</td>
                  <td className="py-2 pr-4 font-mono text-slate-800 dark:text-slate-200">{row ? `${(row.index_touched_share * 100).toFixed(1)}%` : "…"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
        {message ??
          "Each row trains the network afresh from its own starting weights, draws the same 4000 pictures and asks the same 240 questions. The accuracy is the network naming each held-out picture itself; the rest are the search on its sixteen numbers."}
      </p>
    </div>
  );
}
