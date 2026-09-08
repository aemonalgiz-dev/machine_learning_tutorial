"use client";

// How far one unit can see at each depth, drawn as nested windows on one
// picture of a cross.
//
// The four units are the ones stacked over the middle of the picture, one at
// each depth. The API works out each unit's window from the windows and
// strides beneath it and checks it by brightening every pixel in turn, and
// the table beside the drawing gives the same growth for the network with its
// pooling taken away, read off that network's own layers. The browser only
// draws the rectangles.

import { useEffect, useState } from "react";
import { ApiError } from "@/lib/api";
import {
  Depth,
  fetchNetworkReport,
  fetchReach,
  ReachResponse,
  VariantReport,
} from "@/lib/concepts/convolutional-networks";
import { CellMap, Loading } from "@/components/widgets/convolutionalNetworksShared";

const UNITS: { depth: Depth; row: number; column: number; colour: string }[] = [
  { depth: "first_convolution", row: 8, column: 8, colour: "#f59e0b" },
  { depth: "first_pooling", row: 4, column: 4, colour: "#10b981" },
  { depth: "second_convolution", row: 4, column: 4, colour: "#0ea5e9" },
  { depth: "second_pooling", row: 2, column: 2, colour: "#a855f7" },
];

export function CnnFieldGrowth() {
  const [reaches, setReaches] = useState<ReachResponse[] | null>(null);
  const [reports, setReports] = useState<VariantReport[] | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      Promise.all(UNITS.map((unit) => fetchReach("cross", unit.depth, unit.row, unit.column))),
      Promise.all([fetchNetworkReport("reference", 0), fetchNetworkReport("without_pooling", 0)]),
    ])
      .then(([found, pair]) => {
        setReaches(found);
        setReports(pair);
      })
      .catch((error) =>
        setMessage(error instanceof ApiError ? error.message : "Something went wrong."),
      );
  }, []);

  if (!reaches || !reports) return <Loading message={message} />;

  const side = reaches[0].picture.length;
  const spatial = (report: VariantReport) =>
    report.layers.filter((layer) => !layer.reads_whole_picture && layer.label !== "flattening");

  return (
    <div className="flex flex-wrap items-start gap-5">
      <div className="w-56">
        <div className="relative overflow-hidden rounded-sm ring-1 ring-slate-300 dark:ring-slate-700">
          <CellMap rows={reaches[0].picture} scale="brightness" largest={1} label="a held-out cross" />
          <svg viewBox={`0 0 ${side} ${side}`} className="absolute inset-0 h-full w-full" pointerEvents="none">
            {reaches.map((reach, index) => (
              <rect
                key={reach.depth}
                x={Math.max(0, reach.left) + 0.08}
                y={Math.max(0, reach.top) + 0.08}
                width={Math.min(side - 1, reach.right) - Math.max(0, reach.left) + 0.84}
                height={Math.min(side - 1, reach.bottom) - Math.max(0, reach.top) + 0.84}
                fill="none"
                stroke={UNITS[index].colour}
                strokeWidth={0.18}
              />
            ))}
          </svg>
        </div>
        <div className="mt-2 space-y-0.5 text-xs text-slate-600 dark:text-slate-400">
          {reaches.map((reach, index) => (
            <p key={reach.depth}>
              <span className="mr-1 inline-block h-2 w-3" style={{ background: UNITS[index].colour }} />
              {reach.label}: {reach.field} by {reach.field}, {reach.n_moved} of {reach.n_in_window} pixels moved it
            </p>
          ))}
        </div>
      </div>
      <div className="min-w-[16rem] flex-1 overflow-x-auto">
        {reports.map((report) => (
          <table key={report.variant} className="mb-3 w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-xs text-slate-600 dark:border-slate-800 dark:text-slate-400">
                <th className="py-1.5 pr-3 font-semibold">{report.variant === "reference" ? "the network" : "pooling taken away"}</th>
                <th className="py-1.5 pr-3 font-semibold">window, pixels a side</th>
                <th className="py-1.5 font-semibold">neighbours sit apart by</th>
              </tr>
            </thead>
            <tbody>
              {spatial(report).map((layer, index) => (
                <tr key={index} className="border-b border-slate-100 last:border-0 dark:border-slate-800/60">
                  <td className="py-1.5 pr-3 text-slate-700 dark:text-slate-300">{layer.label}</td>
                  <td className="py-1.5 pr-3 font-mono text-slate-800 dark:text-slate-200">{layer.field}</td>
                  <td className="py-1.5 font-mono text-slate-800 dark:text-slate-200">{layer.step}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ))}
      </div>
    </div>
  );
}
