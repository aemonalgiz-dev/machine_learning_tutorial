"use client";

// One size against several, on the opening move.
//
// The same scene and the same turn, detected on one level, on three levels
// each half the last, and on six levels each 1.2 times smaller than the last,
// which is ORB's own pyramid. The counts say what the extra sizes bought.

import { useEffect, useState } from "react";
import { ApiError } from "@/lib/api";
import { pyramidReport, type PyramidReport } from "@/lib/concepts/image-alignment";
import { Caption } from "./keypointDrawing";
import { degrees } from "./alignmentDrawing";

export function PyramidLedger() {
  const [report, setReport] = useState<PyramidReport | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    pyramidReport()
      .then(setReport)
      .catch((error: unknown) => {
        if (error instanceof ApiError) setMessage(error.message);
      });
  }, []);

  if (message) return <p className="text-sm text-rose-700 dark:text-rose-300">{message}</p>;
  if (!report) return <p className="text-sm text-slate-500">Building the pyramids.</p>;

  return (
    <div className="space-y-2">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-200 text-left dark:border-slate-800">
              <th className="py-1 pr-3 font-semibold text-slate-600 dark:text-slate-400">Levels</th>
              <th className="py-1 pr-3 font-semibold text-slate-600 dark:text-slate-400">Factor</th>
              <th className="py-1 pr-3 font-semibold text-slate-600 dark:text-slate-400">Keypoints</th>
              <th className="py-1 pr-3 font-semibold text-slate-600 dark:text-slate-400">Matches</th>
              <th className="py-1 pr-3 font-semibold text-slate-600 dark:text-slate-400">Right</th>
              <th className="py-1 pr-3 font-semibold text-slate-600 dark:text-slate-400">Inliers</th>
              <th className="py-1 font-semibold text-slate-600 dark:text-slate-400">Recovered turn</th>
            </tr>
          </thead>
          <tbody>
            {report.rows.map((row) => (
              <tr key={`${row.levels},${row.factor}`} className="border-b border-slate-100 last:border-0 dark:border-slate-800/60">
                <td className="py-1 pr-3 font-mono">{row.levels}</td>
                <td className="py-1 pr-3 font-mono">{row.factor.toFixed(1)}</td>
                <td className="py-1 pr-3 font-mono">{row.n_first_keypoints} / {row.n_second_keypoints}</td>
                <td className="py-1 pr-3 font-mono">{row.n_matches}</td>
                <td className="py-1 pr-3 font-mono">{row.n_right}</td>
                <td className="py-1 pr-3 font-mono">{row.n_inliers}</td>
                <td className="py-1 font-mono">
                  {row.estimate ? degrees(row.estimate.angle_degrees) : "none"}
                  {row.recovered ? "" : ", wrong"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Caption>
        The planted turn is {degrees(report.truth.angle_degrees)}. Keypoints are counted in the
        first and second pictures; a match is right when the planted move carries its first
        position to within 1.5 pixels of its second.
      </Caption>
    </div>
  );
}
