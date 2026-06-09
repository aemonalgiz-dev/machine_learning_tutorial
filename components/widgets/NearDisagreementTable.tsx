"use client";

// The one piece two notions of near send to two different entries.
//
// The API takes the photograph's table of eight entries and asks, for every
// piece, which entry is nearest by the straight line and which is nearest by
// adding the two coordinate gaps. The browser lists the pieces where those two
// answers differ, with both columns of distances so a reader can see the
// crossing happen. Nothing is computed here.

import { useEffect, useState } from "react";
import { ApiError } from "@/lib/api";
import {
  ChoosingView,
  fetchChoosingTheTable,
} from "@/lib/concepts/codebook-quantisation";
import { ENTRY_COLOUR } from "./codebookQuantisationFixtures";

export function NearDisagreementTable() {
  const [view, setView] = useState<ChoosingView | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setView(await fetchChoosingTheTable());
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

  const asPoint = (pair: number[]) =>
    `(${pair[0].toFixed(4)}, ${pair[1].toFixed(4)})`;

  return (
    <div>
      {view.disagreements.map((row) => (
        <div key={row.piece.join(",")} className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left dark:border-slate-800">
                <th className="py-1.5 pr-4 font-semibold text-slate-600 dark:text-slate-400">
                  entry
                </th>
                <th className="py-1.5 pr-4 font-semibold text-slate-600 dark:text-slate-400">
                  where it sits
                </th>
                <th className="py-1.5 pr-4 font-semibold text-slate-600 dark:text-slate-400">
                  straight line from ({row.piece[0]}, {row.piece[1]})
                </th>
                <th className="py-1.5 font-semibold text-slate-600 dark:text-slate-400">
                  the two gaps added
                </th>
              </tr>
            </thead>
            <tbody>
              {row.straight_line_distances.map((straight, index) => {
                const winner =
                  index === row.straight_line_id ||
                  index === row.coordinate_sum_id;
                return (
                  <tr
                    key={index}
                    className="border-b border-slate-100 last:border-0 dark:border-slate-800/60"
                  >
                    <td
                      className="py-1.5 pr-4 font-mono"
                      style={winner ? { color: ENTRY_COLOUR } : undefined}
                    >
                      {index}
                    </td>
                    <td className="py-1.5 pr-4 font-mono text-slate-800 dark:text-slate-200">
                      {index === row.straight_line_id
                        ? asPoint(row.straight_line_code)
                        : index === row.coordinate_sum_id
                          ? asPoint(row.coordinate_sum_code)
                          : ""}
                    </td>
                    <td
                      className="py-1.5 pr-4 font-mono"
                      style={
                        index === row.straight_line_id
                          ? { color: ENTRY_COLOUR, fontWeight: 600 }
                          : undefined
                      }
                    >
                      {straight.toFixed(4)}
                    </td>
                    <td
                      className="py-1.5 font-mono"
                      style={
                        index === row.coordinate_sum_id
                          ? { color: ENTRY_COLOUR, fontWeight: 600 }
                          : undefined
                      }
                    >
                      {row.coordinate_sum_distances[index].toFixed(4)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ))}
      <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
        Of the {view.n_pieces} pieces of the photograph put to a table of{" "}
        {view.disagreement_size} entries, {view.n_disagreements} goes to a
        different entry depending on which of the two rules is used to measure
        near. The marked figures are the smallest in each column.
      </p>
    </div>
  );
}
