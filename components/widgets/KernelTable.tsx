"use client";

// The kernel table, which is the whole of what the fit reads.
//
// One cell per pair of people, shaded by the radial kernel's value, near
// one for two people close together and near zero for two far apart, with
// the arc's people ordered by height so the band down the diagonal is the
// bend read one neighbour at a time. The slider sets the reach, the toggle
// shows the table after centring, and clicking a row reads that person's
// kernel values out. The API builds, centres and decomposes the table; the
// browser shades cells.

import { useEffect, useState } from "react";
import { ApiError, Lifted, fetchLifted } from "@/lib/concepts/kernel-pca";
import { ARC, ARC_GAMMA, FIRST, GAMMA_STOPS, INNER_COUNT, RING, RING_GAMMA, gammaIndex } from "./kernelPcaFixtures";

function tidy(value: number, digits: number): string {
  const rounded = Number(value.toFixed(digits));
  return (Object.is(rounded, -0) ? 0 : rounded).toFixed(digits);
}

export function KernelTable() {
  const [cloud, setCloud] = useState<"arc" | "ring">("arc");
  const [gammaStop, setGammaStop] = useState(gammaIndex(ARC_GAMMA));
  const [centred, setCentred] = useState(false);
  const [selected, setSelected] = useState(0);
  const [lifted, setLifted] = useState<Lifted | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const gamma = GAMMA_STOPS[gammaStop];
  const points = cloud === "arc" ? ARC : RING;

  useEffect(() => {
    const timer = setTimeout(async () => {
      try {
        setLifted(await fetchLifted(points, "rbf", gamma, cloud === "ring" ? { innerCount: INNER_COUNT } : {}));
        setMessage(null);
      } catch (error) {
        if (error instanceof ApiError) setMessage(error.message);
        else setMessage("Something went wrong.");
      }
    }, 60);
    return () => clearTimeout(timer);
  }, [points, gamma, cloud]);

  if (!lifted) {
    return <p className="text-sm text-slate-500 dark:text-slate-400">{message ?? "…"}</p>;
  }

  // The arc is read by height so neighbours along the bend sit beside each
  // other; the ring is read as sent, the inner twelve first.
  const order = cloud === "arc" ? [...points.keys()].sort((left, right) => points[left].x - points[right].x) : [...points.keys()];
  const table = centred ? lifted.centred_kernel : lifted.uncentred_kernel;
  const people = lifted.n_rows;
  const cell = Math.floor(320 / people);
  const largest = Math.max(...table.flat().map((value) => Math.abs(value)), 1e-9);
  const chosen = order[Math.min(selected, people - 1)];
  const row = table[chosen];
  const smallest = Math.min(...lifted.uncentred_kernel.flat());

  return (
    <div>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-600 dark:text-slate-300">
        <span className="flex gap-1 rounded-md border border-slate-300 p-0.5 dark:border-slate-700">
          {(["arc", "ring"] as const).map((choice) => (
            <button key={choice} onClick={() => { setCloud(choice); setSelected(0); setGammaStop(gammaIndex(choice === "arc" ? ARC_GAMMA : RING_GAMMA)); }} className={"rounded px-2 py-0.5 text-xs font-medium transition " + (cloud === choice ? "bg-indigo-600 text-white" : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800")}>
              {choice === "arc" ? "the arc" : "the ring"}
            </button>
          ))}
        </span>
        <label className="flex flex-1 items-center gap-2">
          gamma
          <input type="range" min={0} max={GAMMA_STOPS.length - 1} step={1} value={gammaStop} onChange={(event) => setGammaStop(Number(event.target.value))} className="flex-1 accent-indigo-600" />
          <span className="w-14 text-right font-mono">{gamma}</span>
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={centred} onChange={(event) => setCentred(event.target.checked)} className="accent-indigo-600" />
          centred
        </label>
      </div>

      <div className="mt-3 grid gap-4 sm:grid-cols-[auto_1fr]">
        <svg viewBox={`0 0 ${cell * people + 4} ${cell * people + 4}`} width={cell * people + 4} height={cell * people + 4} className="select-none rounded-lg bg-slate-50 dark:bg-slate-950">
          {order.map((rowPerson, rowIndex) =>
            order.map((columnPerson, columnIndex) => {
              const value = table[rowPerson][columnPerson];
              return (
                <rect key={`${rowIndex}-${columnIndex}`} x={2 + columnIndex * cell} y={2 + rowIndex * cell} width={cell - 1} height={cell - 1} fill={value >= 0 ? FIRST : "#f43f5e"} opacity={0.08 + 0.92 * (Math.abs(value) / largest)} className="cursor-pointer" onClick={() => setSelected(rowIndex)} />
              );
            }),
          )}
          <rect x={2} y={2 + selected * cell} width={cell * people - 1} height={cell - 1} fill="none" stroke="#f59e0b" strokeWidth={1.5} />
        </svg>
        <div>
          <div className="grid grid-cols-2 gap-2">
            <Stat label="reach, one over the square root of gamma" value={tidy(lifted.reach, 1)} />
            <Stat label="smallest value in the table" value={smallest.toExponential(2)} />
            <Stat label="directions with any spread, of n" value={`${lifted.rank} of ${people}`} />
            <Stat label="total lifted variance" value={tidy(lifted.total_variance, 4)} />
          </div>
          <p className="mb-1 mt-3 text-xs text-slate-500 dark:text-slate-400">
            person at ({points[chosen].x}, {points[chosen].y}), {centred ? "centred" : "raw"} kernel value against each person in the same order
          </p>
          <div className="rounded-md bg-slate-100 px-3 py-2 font-mono text-xs text-slate-800 dark:bg-slate-800 dark:text-slate-200">
            {order.slice(0, 12).map((person) => tidy(row[person], 4)).join("  ")}{people > 12 ? "  …" : ""}
          </div>
        </div>
      </div>
      {message && <p className="mt-2 text-sm text-amber-600 dark:text-amber-400">{message}</p>}
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
