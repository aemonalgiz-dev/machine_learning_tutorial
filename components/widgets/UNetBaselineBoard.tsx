"use client";

// Every way of answering each pixel that the page measures, on the same 240
// held-out pictures: the average shape of a picture's kind, one brightness
// cut for every picture, a cut chosen for each picture, and the small U
// without and with its skip connections at three weight seeds.
//
// Two readings per method, the mean overlap with the true shape and the share
// of edge pixels right, since the edge is where the skip connections are
// claimed to help. For the networks the bar runs to the best of the three
// seeds and a mark shows the worst. The API computes every figure; the
// browser draws the bars.

import { useEffect, useState } from "react";
import { ApiError } from "@/lib/api";
import {
  BaselinesResponse,
  fetchBaselines,
  fetchUReport,
  SEEDS,
  Scores,
  UReport,
} from "@/lib/concepts/u-net";
import { Loading } from "@/components/widgets/convolutionalNetworksShared";
import { fixed, WITH_SKIP_COLOUR, WITHOUT_SKIP_COLOUR } from "@/components/widgets/uNetShared";

interface Row {
  name: string;
  colour: string;
  scores: Scores[];
}

function Bar({ values, colour }: { values: number[]; colour: string }) {
  const best = Math.max(...values);
  const worst = Math.min(...values);
  return (
    <div className="relative h-3 flex-1 rounded bg-slate-200 dark:bg-slate-800">
      <div className="h-3 rounded" style={{ width: `${best * 100}%`, backgroundColor: colour }} />
      {values.length > 1 && (
        <div
          className="absolute top-0 h-3 w-0.5 bg-slate-900 dark:bg-slate-100"
          style={{ left: `calc(${worst * 100}% - 1px)` }}
        />
      )}
    </div>
  );
}

function spread(values: number[]): string {
  const best = Math.max(...values);
  const worst = Math.min(...values);
  return values.length > 1 ? `${fixed(worst)} to ${fixed(best)}` : fixed(best);
}

export function UNetBaselineBoard() {
  const [baselines, setBaselines] = useState<BaselinesResponse | null>(null);
  const [reports, setReports] = useState<UReport[] | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const failed = (error: unknown) =>
      setMessage(error instanceof ApiError ? error.message : "Something went wrong.");
    fetchBaselines().then(setBaselines).catch(failed);
    Promise.all(
      [true, false].flatMap((skip) => SEEDS.map((seed) => fetchUReport(skip, seed))),
    )
      .then(setReports)
      .catch(failed);
  }, []);

  if (!baselines || !reports) return <Loading message={message} />;

  const rows: Row[] = [
    ...baselines.baselines.map((baseline, index) => ({
      name: baseline.name,
      colour: index < 2 ? "rgb(148, 163, 184)" : "rgb(20, 184, 166)",
      scores: [baseline.scores],
    })),
    {
      name: "the U without skip connections",
      colour: WITHOUT_SKIP_COLOUR,
      scores: reports.filter((report) => !report.skip).map((report) => report.held_out),
    },
    {
      name: "the U with them",
      colour: WITH_SKIP_COLOUR,
      scores: reports.filter((report) => report.skip).map((report) => report.held_out),
    },
  ];

  const readings: { title: string; read: (scores: Scores) => number }[] = [
    { title: "mean overlap with the true shape", read: (scores) => scores.mean_overlap },
    { title: "edge pixels right", read: (scores) => scores.boundary_accuracy },
  ];

  return (
    <div className="space-y-4">
      {readings.map(({ title, read }) => (
        <div key={title}>
          <p className="mb-1.5 text-xs font-medium text-slate-600 dark:text-slate-400">{title}</p>
          <div className="space-y-1">
            {rows.map((row) => {
              const values = row.scores.map(read);
              return (
                <div key={row.name} className="flex items-center gap-2 text-xs">
                  <span className="w-48 shrink-0 text-right text-slate-600 dark:text-slate-400">{row.name}</span>
                  <Bar values={values} colour={row.colour} />
                  <span className="w-28 shrink-0 font-mono text-slate-700 dark:text-slate-300">{spread(values)}</span>
                </div>
              );
            })}
          </div>
        </div>
      ))}
      <p className="text-xs text-slate-500 dark:text-slate-400">
        The fixed cut is {baselines.best_cut.toFixed(2)}, the best of {baselines.cuts_tried} tried on the training half. For the two networks the bar runs to the best of the three weight seeds and the dark mark sits at the worst. Answering ground at every pixel would get {fixed(1 - baselines.mask_share)} of pixels right and an overlap of zero.
      </p>
    </div>
  );
}
