"use client";

// Covariance PCA beside correlation PCA on the same crowd.
//
// Left, the raw cloud and the directions the library finds in it. Right,
// the same people after each feature is divided by its own spread, and
// the directions found there, which are the eigenvectors of the
// correlation matrix. Same people, different question, different answer.
// Every fit is the API's.

import { useEffect, useState } from "react";
import { ApiError } from "@/lib/api";
import { FullAnalysis, analyseFully } from "@/lib/concepts/pca";
import { CROWD, FIRST, SECOND } from "./pcaFixtures";

const VIEW = { width: 310, height: 290 };
const PAD = { left: 46, right: 12, top: 14, bottom: 36 };

export function StandardizedComparison() {
  const [analysis, setAnalysis] = useState<FullAnalysis | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setAnalysis(await analyseFully(CROWD));
      } catch (error) {
        if (error instanceof ApiError) setMessage(error.message);
        else setMessage("Something went wrong.");
      }
    })();
  }, []);

  if (!analysis) {
    return <p className="text-sm text-slate-500 dark:text-slate-400">{message ?? "…"}</p>;
  }

  const raw = {
    title: "Covariance PCA, raw units",
    points: CROWD.map((point) => ({ x: point.x - analysis.mean.x, y: point.y - analysis.mean.y })),
    components: analysis.components,
    xLabel: "centred height, cm",
    yLabel: "centred weight, kg",
    matrix: analysis.covariance,
    matrixName: "covariance",
  };
  const standardised = {
    title: "Standardised PCA, correlation",
    points: CROWD.map((point) => ({ x: (point.x - analysis.mean.x) / analysis.standardized.scale_x, y: (point.y - analysis.mean.y) / analysis.standardized.scale_y })),
    components: analysis.standardized.components,
    xLabel: "height in standard deviations",
    yLabel: "weight in standard deviations",
    matrix: [[1, analysis.standardized.correlation], [analysis.standardized.correlation, 1]],
    matrixName: "correlation",
  };

  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-2">
        {[raw, standardised].map((side) => {
          const span = Math.max(...side.points.map((point) => Math.max(Math.abs(point.x), Math.abs(point.y)))) * 1.25;
          const plotX = (value: number) => PAD.left + ((value + span) / (2 * span)) * (VIEW.width - PAD.left - PAD.right);
          const plotY = (value: number) => PAD.top + (1 - (value + span) / (2 * span)) * (VIEW.height - PAD.top - PAD.bottom);
          const [first, second] = side.components;
          const reach = span * 0.8;
          return (
            <div key={side.title}>
              <p className="mb-1 text-sm font-medium text-slate-700 dark:text-slate-200">{side.title}</p>
              <svg viewBox={`0 0 ${VIEW.width} ${VIEW.height}`} className="w-full select-none rounded-lg bg-slate-50 dark:bg-slate-950">
                <line x1={plotX(-reach * first.dx)} y1={plotY(-reach * first.dy)} x2={plotX(reach * first.dx)} y2={plotY(reach * first.dy)} stroke={FIRST} strokeWidth={3} />
                <line x1={plotX(-reach * 0.35 * second.dx)} y1={plotY(-reach * 0.35 * second.dy)} x2={plotX(reach * 0.35 * second.dx)} y2={plotY(reach * 0.35 * second.dy)} stroke={SECOND} strokeWidth={2} />
                {side.points.map((point, index) => (
                  <circle key={index} cx={plotX(point.x)} cy={plotY(point.y)} r={5} fill="#334155" stroke="white" strokeWidth={1.5} />
                ))}
                <text x={VIEW.width / 2} y={VIEW.height - 8} textAnchor="middle" className="fill-slate-500 text-[10px] dark:fill-slate-400">{side.xLabel}</text>
                <text x={12} y={VIEW.height / 2} textAnchor="middle" transform={`rotate(-90 12 ${VIEW.height / 2})`} className="fill-slate-500 text-[10px] dark:fill-slate-400">{side.yLabel}</text>
              </svg>
              <div className="mt-1 grid grid-cols-2 gap-1 font-mono text-[11px] text-slate-700 dark:text-slate-200">
                <div className="rounded bg-slate-100 px-2 py-1 dark:bg-slate-800">{side.matrixName} [{side.matrix[0][0].toFixed(2)}, {side.matrix[0][1].toFixed(2)}; {side.matrix[1][0].toFixed(2)}, {side.matrix[1][1].toFixed(2)}]</div>
                <div className="rounded bg-slate-100 px-2 py-1 dark:bg-slate-800">u₁ = ({first.dx.toFixed(3)}, {first.dy.toFixed(3)})</div>
                <div className="rounded bg-slate-100 px-2 py-1 dark:bg-slate-800">variances {first.variance.toFixed(2)}, {second.variance.toFixed(2)}</div>
                <div className="rounded bg-slate-100 px-2 py-1 dark:bg-slate-800">shares {first.share.toFixed(4)}, {second.share.toFixed(4)}</div>
              </div>
            </div>
          );
        })}
      </div>
      <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
        Height was divided by {analysis.standardized.scale_x.toFixed(1)} and weight by {analysis.standardized.scale_y.toFixed(1)}, so on the right each feature has variance one and the total is two. On this crowd the two answers are close, because the two spreads happen to be close; the unit toggle above is what happens when they are not.
      </p>
    </div>
  );
}
