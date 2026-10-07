"use client";

// Every pair of matches as a proposal, and how many matches agreed with each.
//
// Two matches fix a move. On the opening move every pair of the kept matches
// is tried, and the bars count the pairs by how many matches their proposal
// explains. Most explain only themselves. The pairs made of two right matches
// propose nearly the same move and explain nearly every right match, and the
// winner is the tallest bar's best pair, which is why the move is found by
// counting agreement rather than by averaging proposals.

import { useEffect, useState } from "react";
import { ApiError } from "@/lib/api";
import { ransac, type Ransac } from "@/lib/concepts/image-alignment";
import { Caption, Stat } from "./keypointDrawing";
import { ARROW, degrees } from "./alignmentDrawing";

export function RansacGallery() {
  const [report, setReport] = useState<Ransac | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    ransac()
      .then(setReport)
      .catch((error: unknown) => {
        if (error instanceof ApiError) setMessage(error.message);
      });
  }, []);

  if (message) return <p className="text-sm text-rose-700 dark:text-rose-300">{message}</p>;
  if (!report) return <p className="text-sm text-slate-500">Trying every pair.</p>;

  const counts = report.agreement_counts;
  const tallest = Math.max(...counts, 1);
  const winner = report.proposals[report.winner];
  const bar = 14;
  const rightPairs = report.proposals.filter((p) => p.both_right).length;
  const sorted = [...report.proposals].sort((a, b) => b.n_agreeing - a.n_agreeing).slice(0, 6);

  return (
    <div className="space-y-3">
      <svg viewBox={`0 0 ${counts.length * bar} 120`} className="w-full select-none rounded-md bg-slate-100 dark:bg-slate-900">
        {counts.map((count, agreeing) => (
          <g key={agreeing}>
            <rect
              x={agreeing * bar + 1}
              y={100 - (count / tallest) * 90}
              width={bar - 2}
              height={(count / tallest) * 90}
              fill={agreeing === winner.n_agreeing ? ARROW : "#6366f1"}
              fillOpacity={agreeing === winner.n_agreeing ? 1 : 0.6}
            />
            {count > 0 && (
              <text x={agreeing * bar + bar / 2} y={100 - (count / tallest) * 90 - 2} textAnchor="middle" className="fill-slate-600 text-[6px] dark:fill-slate-300">
                {count}
              </text>
            )}
            <text x={agreeing * bar + bar / 2} y={112} textAnchor="middle" className="fill-slate-500 text-[7px]">
              {agreeing}
            </text>
          </g>
        ))}
      </svg>
      <Caption>
        Pairs of matches, counted by how many of the {report.n_matches} matches their
        proposed move explains. The winning count is in amber.
      </Caption>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Stat label="Pairs tried" value={`${report.n_pairs}`} />
        <Stat label="Pairs of two right matches" value={`${rightPairs}`} />
        <Stat label="Winner explains" value={`${winner.n_agreeing} matches`} />
        <Stat label="Winner proposes" value={`${degrees(winner.angle_degrees)}, ×${winner.scale.toFixed(3)}`} />
      </div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-200 text-left dark:border-slate-800">
              <th className="py-1 pr-3 font-semibold text-slate-600 dark:text-slate-400">Pair</th>
              <th className="py-1 pr-3 font-semibold text-slate-600 dark:text-slate-400">Both right</th>
              <th className="py-1 pr-3 font-semibold text-slate-600 dark:text-slate-400">Proposed turn</th>
              <th className="py-1 pr-3 font-semibold text-slate-600 dark:text-slate-400">Proposed scale</th>
              <th className="py-1 font-semibold text-slate-600 dark:text-slate-400">Matches explained</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((proposal) => (
              <tr key={`${proposal.first_match},${proposal.second_match}`} className="border-b border-slate-100 last:border-0 dark:border-slate-800/60">
                <td className="py-1 pr-3 font-mono">{proposal.first_match + 1} and {proposal.second_match + 1}</td>
                <td className="py-1 pr-3">{proposal.both_right ? "yes" : "no"}</td>
                <td className="py-1 pr-3 font-mono">{degrees(proposal.angle_degrees)}</td>
                <td className="py-1 pr-3 font-mono">{proposal.scale.toFixed(3)}</td>
                <td className="py-1 font-mono">{proposal.n_agreeing}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Caption>
        The six proposals that explained the most, and the move refitted on everything the
        winner explained: {degrees(report.estimate.angle_degrees)} and ×
        {report.estimate.scale.toFixed(3)}, against a planted {degrees(report.truth.angle_degrees)}{" "}
        and ×{report.truth.scale.toFixed(3)}.
      </Caption>
    </div>
  );
}
