"use client";

// From the centred table to the covariance matrix, one cell at a time.
//
// The measured four, their deviations from the mean, and the three sums
// those deviations make: squared heights, squared weights, and their
// products. Selecting a matrix cell lights up the column of the table that
// feeds it; selecting a table row lights up that person in the small
// plot. The scatter matrix is the sums as they stand; the covariance
// divides by four, the sample covariance by three. Every number is from
// the API's analysis of the same four people.

import { useEffect, useState } from "react";
import { ApiError } from "@/lib/api";
import { FullAnalysis, analyseFully } from "@/lib/concepts/pca";
import { FIRST, SECOND, WORKED_PEOPLE } from "./pcaFixtures";

const PLOT = { width: 240, height: 220 };
const PAD = 26;

type Cell = "var_h" | "cov" | "var_w";

export function CovarianceBuilder() {
  const [analysis, setAnalysis] = useState<FullAnalysis | null>(null);
  const [cell, setCell] = useState<Cell>("var_h");
  const [row, setRow] = useState<number | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setAnalysis(await analyseFully(WORKED_PEOPLE));
      } catch (error) {
        if (error instanceof ApiError) setMessage(error.message);
        else setMessage("Something went wrong.");
      }
    })();
  }, []);

  if (!analysis) {
    return <p className="text-sm text-slate-500 dark:text-slate-400">{message ?? "…"}</p>;
  }

  const deviations = analysis.deviations;
  const products = deviations.map((deviation) => ({ hh: deviation.x * deviation.x, hw: deviation.x * deviation.y, ww: deviation.y * deviation.y }));
  const sums = products.reduce((total, each) => ({ hh: total.hh + each.hh, hw: total.hw + each.hw, ww: total.ww + each.ww }), { hh: 0, hw: 0, ww: 0 });
  const plotX = (value: number) => PAD + ((value + 15) / 30) * (PLOT.width - 2 * PAD);
  const plotY = (value: number) => PAD + (1 - (value + 15) / 30) * (PLOT.height - 2 * PAD);
  const columnFor: Record<Cell, "hh" | "hw" | "ww"> = { var_h: "hh", cov: "hw", var_w: "ww" };
  const lit = columnFor[cell];
  const cellClass = (which: Cell) => "cursor-pointer rounded px-2 py-1 font-mono text-center transition " + (cell === which ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-800 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200");

  return (
    <div className="grid gap-4 sm:grid-cols-[1fr_240px]">
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="text-slate-500 dark:text-slate-400">
              <th className="py-1 pr-2 text-left font-medium">person</th>
              <th className="py-1 pr-2 text-right font-medium">d height</th>
              <th className="py-1 pr-2 text-right font-medium">d weight</th>
              <th className={`py-1 pr-2 text-right font-medium ${lit === "hh" ? "text-indigo-600 dark:text-indigo-400" : ""}`}>d height²</th>
              <th className={`py-1 pr-2 text-right font-medium ${lit === "hw" ? "text-indigo-600 dark:text-indigo-400" : ""}`}>d height × d weight</th>
              <th className={`py-1 text-right font-medium ${lit === "ww" ? "text-indigo-600 dark:text-indigo-400" : ""}`}>d weight²</th>
            </tr>
          </thead>
          <tbody className="font-mono">
            {deviations.map((deviation, index) => (
              <tr key={index} onClick={() => setRow(row === index ? null : index)} className={`cursor-pointer border-t border-slate-200 dark:border-slate-800 ${row === index ? "bg-indigo-50 dark:bg-indigo-950/40" : ""}`}>
                <td className="py-1 pr-2">{index + 1}</td>
                <td className="py-1 pr-2 text-right">{deviation.x > 0 ? "+" : ""}{deviation.x.toFixed(0)}</td>
                <td className="py-1 pr-2 text-right">{deviation.y > 0 ? "+" : ""}{deviation.y.toFixed(0)}</td>
                <td className={`py-1 pr-2 text-right ${lit === "hh" ? "font-semibold text-indigo-600 dark:text-indigo-400" : ""}`}>{products[index].hh.toFixed(0)}</td>
                <td className={`py-1 pr-2 text-right ${lit === "hw" ? "font-semibold text-indigo-600 dark:text-indigo-400" : ""}`}>{products[index].hw > 0 ? "+" : ""}{products[index].hw.toFixed(0)}</td>
                <td className={`py-1 text-right ${lit === "ww" ? "font-semibold text-indigo-600 dark:text-indigo-400" : ""}`}>{products[index].ww.toFixed(0)}</td>
              </tr>
            ))}
            <tr className="border-t-2 border-slate-300 dark:border-slate-700">
              <td className="py-1 pr-2" colSpan={3}>sums</td>
              <td className={`py-1 pr-2 text-right ${lit === "hh" ? "font-semibold text-indigo-600 dark:text-indigo-400" : ""}`}>{sums.hh.toFixed(0)}</td>
              <td className={`py-1 pr-2 text-right ${lit === "hw" ? "font-semibold text-indigo-600 dark:text-indigo-400" : ""}`}>{sums.hw.toFixed(0)}</td>
              <td className={`py-1 text-right ${lit === "ww" ? "font-semibold text-indigo-600 dark:text-indigo-400" : ""}`}>{sums.ww.toFixed(0)}</td>
            </tr>
          </tbody>
        </table>
        <div className="mt-3 grid grid-cols-3 gap-3 text-xs">
          {[
            { title: "scatter matrix S, the sums", matrix: analysis.scatter },
            { title: "covariance C, divided by 4", matrix: analysis.covariance },
            { title: "sample covariance, divided by 3", matrix: analysis.sample_covariance },
          ].map((block) => (
            <div key={block.title}>
              <p className="mb-1 text-slate-500 dark:text-slate-400">{block.title}</p>
              <div className="grid grid-cols-2 gap-1">
                <div className={cellClass("var_h")} onClick={() => setCell("var_h")}>{block.matrix[0][0].toFixed(block.matrix === analysis.scatter ? 0 : 2)}</div>
                <div className={cellClass("cov")} onClick={() => setCell("cov")}>{block.matrix[0][1].toFixed(block.matrix === analysis.scatter ? 0 : 2)}</div>
                <div className={cellClass("cov")} onClick={() => setCell("cov")}>{block.matrix[1][0].toFixed(block.matrix === analysis.scatter ? 0 : 2)}</div>
                <div className={cellClass("var_w")} onClick={() => setCell("var_w")}>{block.matrix[1][1].toFixed(block.matrix === analysis.scatter ? 0 : 2)}</div>
              </div>
            </div>
          ))}
        </div>
        <p className="mt-2 text-[11px] text-slate-500 dark:text-slate-400">Click a matrix cell to see which column feeds it, and a table row to find that person in the plot. The off-diagonal cell appears twice because the matrix is symmetric.</p>
      </div>
      <svg viewBox={`0 0 ${PLOT.width} ${PLOT.height}`} className="w-full select-none rounded-lg bg-slate-50 dark:bg-slate-950">
        <line x1={plotX(0)} x2={plotX(0)} y1={PAD} y2={PLOT.height - PAD} className="stroke-slate-300 dark:stroke-slate-700" strokeWidth={1} />
        <line x1={PAD} x2={PLOT.width - PAD} y1={plotY(0)} y2={plotY(0)} className="stroke-slate-300 dark:stroke-slate-700" strokeWidth={1} />
        {deviations.map((deviation, index) => (
          <g key={index}>
            {row === index && (
              <>
                <line x1={plotX(0)} y1={plotY(0)} x2={plotX(deviation.x)} y2={plotY(0)} stroke={FIRST} strokeWidth={2} />
                <line x1={plotX(deviation.x)} y1={plotY(0)} x2={plotX(deviation.x)} y2={plotY(deviation.y)} stroke={SECOND} strokeWidth={2} />
              </>
            )}
            <circle cx={plotX(deviation.x)} cy={plotY(deviation.y)} r={row === index ? 7 : 5} fill={row === index ? FIRST : "#334155"} stroke="white" strokeWidth={1.5} className="cursor-pointer" onClick={() => setRow(row === index ? null : index)} />
            <text x={plotX(deviation.x) + 8} y={plotY(deviation.y) - 6} className="fill-slate-600 text-[9px] dark:fill-slate-300">{index + 1}</text>
          </g>
        ))}
        <text x={PLOT.width / 2} y={PLOT.height - 6} textAnchor="middle" className="fill-slate-500 text-[10px] dark:fill-slate-400">centred height</text>
        <text x={10} y={PLOT.height / 2} textAnchor="middle" transform={`rotate(-90 10 ${PLOT.height / 2})`} className="fill-slate-500 text-[10px] dark:fill-slate-400">centred weight</text>
      </svg>
    </div>
  );
}
