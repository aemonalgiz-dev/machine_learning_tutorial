"use client";

// What the Gram table sees before and after the lifted mean is subtracted.
//
// The uncentred table of the measured four is dominated by one direction,
// the one that points from the origin to the mean, and the toggle switches
// to the centred table, where that direction has gone and the two real
// spreads are what is left. The cells are shaded by size, the largest
// eigenvalue and its share of the trace are read out, and the direction it
// names is drawn as one bar per person. The API builds and centres the
// tables and takes the eigenvalues; the browser shades cells.

import { useEffect, useState } from "react";
import { ApiError, GramRoute } from "@/lib/concepts/kernel-pca";
import { FIRST, gramRouteFor } from "./kernelPcaFixtures";

function tidy(value: number, digits: number): string {
  const rounded = Number(value.toFixed(digits));
  return (Object.is(rounded, -0) ? 0 : rounded).toFixed(digits);
}

export function LiftedCentring() {
  const [cloud, setCloud] = useState<"four" | "arc">("four");
  const [centred, setCentred] = useState(false);
  const [route, setRoute] = useState<GramRoute | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setRoute(await gramRouteFor(cloud));
      } catch (error) {
        if (error instanceof ApiError) setMessage(error.message);
        else setMessage("Something went wrong.");
      }
    })();
  }, [cloud]);

  if (!route) {
    return <p className="text-sm text-slate-500 dark:text-slate-400">{message ?? "…"}</p>;
  }

  const table = centred ? route.centred_gram : route.uncentred_gram;
  const largest = Math.max(...table.flat().map((value) => Math.abs(value)), 1e-9);
  const people = route.n_rows;
  const cell = Math.min(36, Math.floor(300 / people));
  const topEigenvalue = centred ? route.gram_eigenvalues[0] : route.uncentred_top_eigenvalue;
  const trace = table.reduce((sum, row, index) => sum + row[index], 0);
  const direction = centred ? route.components[0].row_coefficients : route.uncentred_top_eigenvector;
  const directionReach = Math.max(...direction.map((value) => Math.abs(value)), 1e-9);

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
        <span className="flex gap-1 rounded-md border border-slate-300 p-0.5 dark:border-slate-700">
          {(["four", "arc"] as const).map((choice) => (
            <button key={choice} onClick={() => setCloud(choice)} className={"rounded px-2 py-0.5 text-xs font-medium transition " + (cloud === choice ? "bg-indigo-600 text-white" : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800")}>
              {choice === "four" ? "the measured four" : "the arc"}
            </button>
          ))}
        </span>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={centred} onChange={(event) => setCentred(event.target.checked)} className="accent-indigo-600" />
          subtract the lifted mean
        </label>
      </div>

      <div className="mt-3 grid gap-4 sm:grid-cols-[auto_1fr]">
        <svg viewBox={`0 0 ${cell * people + 4} ${cell * people + 4}`} width={cell * people + 4} height={cell * people + 4} className="select-none rounded-lg bg-slate-50 dark:bg-slate-950">
          {table.map((row, rowIndex) =>
            row.map((value, columnIndex) => (
              <rect key={`${rowIndex}-${columnIndex}`} x={2 + columnIndex * cell} y={2 + rowIndex * cell} width={cell - 1} height={cell - 1} fill={value >= 0 ? FIRST : "#f43f5e"} opacity={0.12 + 0.88 * (Math.abs(value) / largest)} />
            )),
          )}
          {people <= 6 &&
            table.map((row, rowIndex) =>
              row.map((value, columnIndex) => (
                <text key={`t${rowIndex}-${columnIndex}`} x={2 + columnIndex * cell + cell / 2} y={2 + rowIndex * cell + cell / 2 + 3} textAnchor="middle" className="fill-white text-[8px] font-medium">
                  {tidy(value, 0)}
                </text>
              )),
            )}
        </svg>
        <div>
          <div className="grid grid-cols-2 gap-2">
            <Stat label="largest eigenvalue" value={tidy(topEigenvalue, 1)} />
            <Stat label="its share of the table's trace" value={tidy(topEigenvalue / trace, 4)} />
            <Stat label="next eigenvalues" value={(centred ? route.gram_eigenvalues : route.uncentred_eigenvalues).slice(1, 3).map((value) => tidy(value, 1)).join(", ")} />
            <Stat label="trace of the table" value={tidy(trace, 1)} />
          </div>
          <p className="mb-1 mt-3 text-xs text-slate-500 dark:text-slate-400">the direction that eigenvalue names, one weight per person</p>
          <svg viewBox={`0 0 300 ${people * 12 + 4}`} className="w-full select-none">
            {direction.map((value, index) => (
              <g key={index}>
                <line x1={150} x2={150 + (value / directionReach) * 140} y1={8 + index * 12} y2={8 + index * 12} stroke={value >= 0 ? FIRST : "#f43f5e"} strokeWidth={8} />
                <text x={4} y={11 + index * 12} className="fill-slate-500 text-[9px] dark:fill-slate-400">{index + 1}</text>
              </g>
            ))}
            <line x1={150} x2={150} y1={0} y2={people * 12 + 4} className="stroke-slate-400" strokeWidth={1} />
          </svg>
        </div>
      </div>
      <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
        Uncentred, the bars all point the same way, because the direction is the one every person shares, from the origin to the mean. Centred, the first direction sets some people against others, which is a spread.
      </p>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-slate-100 px-2 py-1.5 dark:bg-slate-800">
      <div className="text-[11px] text-slate-500 dark:text-slate-400">{label}</div>
      <div className="font-mono text-sm font-semibold text-slate-900 dark:text-slate-100">{value}</div>
    </div>
  );
}
