"use client";

// Four vectors against three entries, small enough to check with a pencil.
//
// The API measures every squared distance, picks the smallest for each vector
// and averages the four winning distances; the browser lays them out as a table
// with the winner in each row marked, and then lists the same four vectors
// against the same three entries written down in a different order, which moves
// only the vector that was exactly between two of them.

import { useEffect, useState } from "react";
import { ApiError } from "@/lib/api";
import { HandView, fetchNearestCode } from "@/lib/concepts/codebook-quantisation";
import { ENTRY_COLOUR } from "./codebookQuantisationFixtures";

export function NearestEntryTable({ showTie = true }: { showTie?: boolean }) {
  const [view, setView] = useState<HandView | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setView(await fetchNearestCode());
      } catch (error) {
        setMessage(
          error instanceof ApiError ? error.message : "Something went wrong.",
        );
      }
    })();
  }, []);

  if (!view) {
    return (
      <p className="text-sm text-slate-500 dark:text-slate-400">
        {message ?? "…"}
      </p>
    );
  }

  const asPoint = (pair: number[]) => `(${pair[0]}, ${pair[1]})`;

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left dark:border-slate-800">
              <th className="py-1.5 pr-4 font-semibold text-slate-600 dark:text-slate-400">
                vector
              </th>
              {view.codes.map((code, index) => (
                <th
                  key={index}
                  className="py-1.5 pr-4 font-semibold text-slate-600 dark:text-slate-400"
                >
                  to {index} at {asPoint(code)}
                </th>
              ))}
              <th className="py-1.5 pr-4 font-semibold text-slate-600 dark:text-slate-400">
                number
              </th>
              <th className="py-1.5 font-semibold text-slate-600 dark:text-slate-400">
                squared gap
              </th>
            </tr>
          </thead>
          <tbody>
            {view.rows.map((row, index) => (
              <tr
                key={index}
                className="border-b border-slate-100 last:border-0 dark:border-slate-800/60"
              >
                <td className="py-1.5 pr-4 font-mono text-slate-800 dark:text-slate-200">
                  {asPoint(row.vector)}
                </td>
                {row.squared_distances.map((distance, position) => (
                  <td
                    key={position}
                    className="py-1.5 pr-4 font-mono"
                    style={
                      position === row.code_id
                        ? { color: ENTRY_COLOUR, fontWeight: 600 }
                        : undefined
                    }
                  >
                    {distance}
                  </td>
                ))}
                <td
                  className="py-1.5 pr-4 font-mono font-semibold"
                  style={{ color: ENTRY_COLOUR }}
                >
                  {row.code_id}
                  {row.tied ? " (tied)" : ""}
                </td>
                <td className="py-1.5 font-mono text-slate-800 dark:text-slate-200">
                  {row.squared_gap}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
        The four squared gaps average to {view.distortion}, which is the whole
        cost of saying these four vectors in three words.
      </p>

      {showTie && (
        <div className="mt-3 rounded-md bg-slate-100 px-3 py-2 font-mono text-xs text-slate-800 dark:bg-slate-800 dark:text-slate-200">
          <p>
            listed as {view.codes.map(asPoint).join(", ")} &rarr; numbers{" "}
            {view.rows.map((row) => row.code_id).join(", ")}
          </p>
          <p>
            listed as {view.reordered_codes.map(asPoint).join(", ")} &rarr;
            numbers {view.reordered_ids.join(", ")}
          </p>
          <p className="font-semibold">
            same three entries, same rounding error{" "}
            {view.reordered_distortion}, one vector renumbered
          </p>
        </div>
      )}
    </div>
  );
}
