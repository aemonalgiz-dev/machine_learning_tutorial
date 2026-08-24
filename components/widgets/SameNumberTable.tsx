"use client";

// Where one number stands for more than one piece.
//
// The API searches, at each of four table sizes, for the two furthest-apart
// pieces of the photograph that still came back with the same number, and
// separately puts the photograph's table of sixteen entries to a picture it was
// never chosen from and reports the piece it matched best and the piece it
// matched worst. The browser lays both out as tables. Nothing is computed here.

import { useEffect, useState } from "react";
import { ApiError } from "@/lib/api";
import {
  SameNumberView,
  fetchSameNumber,
} from "@/lib/concepts/codebook-quantisation";
import { ENTRY_COLOUR } from "./codebookQuantisationFixtures";

export function SameNumberTable({
  panel = "collisions",
}: {
  panel?: "collisions" | "elsewhere";
}) {
  const [view, setView] = useState<SameNumberView | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setView(await fetchSameNumber());
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
    `(${pair[0].toFixed(2)}, ${pair[1].toFixed(2)})`;

  if (panel === "collisions") {
    return (
      <div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left dark:border-slate-800">
                <th className="py-1.5 pr-4 font-semibold text-slate-600 dark:text-slate-400">
                  entries
                </th>
                <th className="py-1.5 pr-4 font-semibold text-slate-600 dark:text-slate-400">
                  one piece
                </th>
                <th className="py-1.5 pr-4 font-semibold text-slate-600 dark:text-slate-400">
                  another piece
                </th>
                <th className="py-1.5 pr-4 font-semibold text-slate-600 dark:text-slate-400">
                  apart by
                </th>
                <th className="py-1.5 pr-4 font-semibold text-slate-600 dark:text-slate-400">
                  both come back as
                </th>
                <th className="py-1.5 font-semibold text-slate-600 dark:text-slate-400">
                  sharing that number
                </th>
              </tr>
            </thead>
            <tbody>
              {view.collisions.map((collision) => (
                <tr
                  key={collision.n_codes}
                  className="border-b border-slate-100 last:border-0 dark:border-slate-800/60"
                >
                  <td className="py-1.5 pr-4 font-mono text-slate-800 dark:text-slate-200">
                    {collision.n_codes}
                  </td>
                  <td className="py-1.5 pr-4 font-mono text-slate-800 dark:text-slate-200">
                    {asPoint(collision.first)}
                  </td>
                  <td className="py-1.5 pr-4 font-mono text-slate-800 dark:text-slate-200">
                    {asPoint(collision.second)}
                  </td>
                  <td className="py-1.5 pr-4 font-mono text-slate-800 dark:text-slate-200">
                    {collision.separation.toFixed(4)}
                  </td>
                  <td
                    className="py-1.5 pr-4 font-mono"
                    style={{ color: ENTRY_COLOUR }}
                  >
                    {asPoint(collision.reconstruction)}
                  </td>
                  <td className="py-1.5 font-mono text-slate-800 dark:text-slate-200">
                    {collision.n_pieces_sharing} pieces,{" "}
                    {collision.n_distinct_sharing} different
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
          Each row is the widest pair of pieces of {view.home_label} that still
          received one number, at that table size.
        </p>
      </div>
    );
  }

  const probes = [
    { label: "matched best", probe: view.elsewhere_best },
    { label: "matched worst", probe: view.elsewhere_worst },
  ];

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left dark:border-slate-800">
              <th className="py-1.5 pr-4 font-semibold text-slate-600 dark:text-slate-400">
                piece of {view.elsewhere_label}
              </th>
              <th className="py-1.5 pr-4 font-semibold text-slate-600 dark:text-slate-400">
                number it gets
              </th>
              <th className="py-1.5 pr-4 font-semibold text-slate-600 dark:text-slate-400">
                what that number means
              </th>
              <th className="py-1.5 font-semibold text-slate-600 dark:text-slate-400">
                squared gap
              </th>
            </tr>
          </thead>
          <tbody>
            {probes.map((row) => (
              <tr
                key={row.label}
                className="border-b border-slate-100 last:border-0 dark:border-slate-800/60"
              >
                <td className="py-1.5 pr-4 font-mono text-slate-800 dark:text-slate-200">
                  {asPoint(row.probe.piece)}, {row.label}
                </td>
                <td
                  className="py-1.5 pr-4 font-mono font-semibold"
                  style={{ color: ENTRY_COLOUR }}
                >
                  {row.probe.code_id}
                </td>
                <td className="py-1.5 pr-4 font-mono text-slate-800 dark:text-slate-200">
                  {asPoint(row.probe.reconstruction)}
                </td>
                <td className="py-1.5 font-mono text-slate-800 dark:text-slate-200">
                  {row.probe.squared_gap.toFixed(6)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
        A table of {view.elsewhere_n_codes} entries chosen from {view.home_label}
        , put to {view.elsewhere_label}. The rounding error rises from{" "}
        {view.home_distortion.toExponential(3)} to{" "}
        {view.elsewhere_distortion.toExponential(3)},{" "}
        {view.elsewhere_ratio.toFixed(1)} times worse, and both rows above are
        one whole number with nothing attached to say which is which.
      </p>
    </div>
  );
}
