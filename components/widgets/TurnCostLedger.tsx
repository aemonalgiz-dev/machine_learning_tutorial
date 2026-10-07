"use client";

// What a quarter turn costs each kind of description, on the bent bar.
//
// Three descriptors read the same six corners before and after an exact
// quarter turn. The patch descriptor from the keypoints page reads the
// picture's frame and pays the keypoints page's own 1.443376; the two read in
// the keypoint's frame pay nothing. The nearest other corner is shown beside
// each, because a description that does not move is only useful if it also
// does not coincide with the wrong corner, and for three of these corners the
// binary reading does.

import { useEffect, useState } from "react";
import { ApiError } from "@/lib/api";
import { turnCost, type TurnCost } from "@/lib/concepts/image-alignment";
import { Caption, MARK, PixelGrid, greyShade } from "./keypointDrawing";

export function TurnCostLedger() {
  const [report, setReport] = useState<TurnCost | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    turnCost()
      .then(setReport)
      .catch((error: unknown) => {
        if (error instanceof ApiError) setMessage(error.message);
      });
  }, []);

  if (message) return <p className="text-sm text-rose-700 dark:text-rose-300">{message}</p>;
  if (!report) return <p className="text-sm text-slate-500">Reading the six corners twice.</p>;

  const shade = greyShade(0, 1);
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <PixelGrid
            rows={report.bar}
            shade={shade}
            cell={4}
            marks={report.rows.map((row) => ({ row: row.row, column: row.column, colour: MARK, radius: 1.4 }))}
          />
          <Caption>The bar, six corners ringed.</Caption>
        </div>
        <div>
          <PixelGrid
            rows={report.turned}
            shade={shade}
            cell={4}
            marks={report.rows.map((row) => ({ row: row.turned_row, column: row.turned_column, colour: MARK, radius: 1.4 }))}
          />
          <Caption>The same bar turned a quarter circle.</Caption>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-200 text-left dark:border-slate-800">
              <th className="py-1 pr-3 font-semibold text-slate-600 dark:text-slate-400">Corner</th>
              <th className="py-1 pr-3 font-semibold text-slate-600 dark:text-slate-400">Lands at</th>
              <th className="py-1 pr-3 font-semibold text-slate-600 dark:text-slate-400">Patch, to itself</th>
              <th className="py-1 pr-3 font-semibold text-slate-600 dark:text-slate-400">Bits, to itself</th>
              <th className="py-1 pr-3 font-semibold text-slate-600 dark:text-slate-400">Bits, nearest other</th>
              <th className="py-1 pr-3 font-semibold text-slate-600 dark:text-slate-400">Histogram, to itself</th>
              <th className="py-1 font-semibold text-slate-600 dark:text-slate-400">Histogram, nearest other</th>
            </tr>
          </thead>
          <tbody>
            {report.rows.map((row) => (
              <tr key={`${row.row},${row.column}`} className="border-b border-slate-100 last:border-0 dark:border-slate-800/60">
                <td className="py-1 pr-3 font-mono">({row.row}, {row.column})</td>
                <td className="py-1 pr-3 font-mono">({row.turned_row}, {row.turned_column})</td>
                <td className="py-1 pr-3 font-mono">{row.patch_distance.toFixed(6)}</td>
                <td className="py-1 pr-3 font-mono">{row.binary_bits.toFixed(0)} of {report.pair_count}</td>
                <td className={"py-1 pr-3 font-mono " + (row.binary_nearest_other === 0 ? "text-rose-700 dark:text-rose-300" : "")}>
                  {row.binary_nearest_other.toFixed(0)}
                </td>
                <td className="py-1 pr-3 font-mono">{row.histogram_distance.toFixed(4)}</td>
                <td className="py-1 font-mono">{row.histogram_nearest_other.toFixed(4)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Caption>
        Distances to the corner&rsquo;s own turned self, and to whichever other corner comes
        nearest. A zero in the nearest-other column, in rose, is a corner the binary reading
        cannot tell from another.
      </Caption>
    </div>
  );
}
