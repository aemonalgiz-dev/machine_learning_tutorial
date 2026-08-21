"use client";

// The radial kernel's reach, swept from too wide to memorising.
//
// Twelve values of gamma, each a full fit of the classifier on the clinic,
// scored on the clinic and on a second clinic drawn from the same recipe
// that the fit never saw. The curves are the two accuracies against gamma
// on a log axis, the bars beneath are the share of patients kept as support
// vectors, and the three small maps show the boundary at a wide, a middling
// and a narrow reach. The sweep, the held-out clinic and every score come
// from the API; the browser draws.

import { useEffect, useState } from "react";
import { ApiError, Sweep, sweepGamma } from "@/lib/concepts/kernel-trick";
import { CLINIC, HEALTHY_COLOUR, UNWELL_COLOUR } from "./kernelTrickFixtures";

const CURVE = { width: 640, height: 240 };
const PAD = { left: 56, right: 16, top: 18, bottom: 40 };
const MAP = { size: 180, pad: 12 };
const SHOWN_GAMMAS = [0.03, 1, 100];

let pending: Promise<Sweep> | null = null;
function sweepOnce(): Promise<Sweep> {
  if (!pending) pending = sweepGamma(CLINIC);
  return pending;
}

export function GammaSweepChart() {
  const [sweep, setSweep] = useState<Sweep | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setSweep(await sweepOnce());
      } catch (error) {
        pending = null;
        if (error instanceof ApiError) setMessage(error.message);
        else setMessage("Something went wrong.");
      }
    })();
  }, []);

  if (!sweep) {
    return <p className="text-sm text-slate-500 dark:text-slate-400">{message ?? "…"}</p>;
  }

  const entries = sweep.entries;
  const logs = entries.map((entry) => Math.log10(entry.value));
  const logMin = Math.min(...logs);
  const logMax = Math.max(...logs);
  const innerWidth = CURVE.width - PAD.left - PAD.right;
  const innerHeight = CURVE.height - PAD.top - PAD.bottom;
  const curveX = (gamma: number) => PAD.left + ((Math.log10(gamma) - logMin) / (logMax - logMin)) * innerWidth;
  const curveY = (share: number) => PAD.top + (1 - (share - 0.5) / 0.5) * innerHeight;
  const path = (pick: (entry: Sweep["entries"][number]) => number) =>
    entries.map((entry, index) => `${index === 0 ? "M" : "L"}${curveX(entry.value)},${curveY(pick(entry))}`).join(" ");

  const bestScore = Math.max(...entries.map((entry) => entry.held_out_accuracy));
  const winners = entries.filter((entry) => entry.held_out_accuracy === bestScore);
  const best = winners[Math.floor(winners.length / 2)];
  const widest = entries[0];
  const narrowest = entries[entries.length - 1];

  const map = (entry: Sweep["entries"][number]) => {
    const regions = entry.regions;
    const cell = (MAP.size - 2 * MAP.pad) / regions.cells;
    const mapX = (column: number) => MAP.pad + column * cell;
    const mapY = (row: number) => MAP.size - MAP.pad - (row + 1) * cell;
    const personX = (x: number) => mapX(((x - regions.x_min) / (regions.x_max - regions.x_min)) * (regions.cells - 1)) + cell / 2;
    const personY = (y: number) => mapY(((y - regions.y_min) / (regions.y_max - regions.y_min)) * (regions.cells - 1)) + cell / 2;
    return (
      <div key={entry.value} className="rounded-lg border border-slate-200 p-2 dark:border-slate-800">
        <svg viewBox={`0 0 ${MAP.size} ${MAP.size}`} className="w-full select-none rounded bg-slate-50 dark:bg-slate-950">
          {regions.labels.map((row, rowIndex) =>
            row.map((label, columnIndex) => (
              <rect key={`${rowIndex}-${columnIndex}`} x={mapX(columnIndex)} y={mapY(rowIndex)} width={cell + 0.5} height={cell + 0.5} fill={label === 1 ? HEALTHY_COLOUR : UNWELL_COLOUR} opacity={0.22} />
            )),
          )}
          {CLINIC.map((patient, index) => (
            <circle key={index} cx={personX(patient.x)} cy={personY(patient.y)} r={3} fill={patient.label === 1 ? HEALTHY_COLOUR : UNWELL_COLOUR} stroke="white" strokeWidth={0.8} />
          ))}
        </svg>
        <p className="mt-1 text-center font-mono text-xs text-slate-600 dark:text-slate-300">
          gamma {entry.value}, held out {entry.held_out_accuracy.toFixed(3)}, {entry.fit.n_support_vectors} of {CLINIC.length} kept
        </p>
      </div>
    );
  };

  return (
    <div>
      <svg viewBox={`0 0 ${CURVE.width} ${CURVE.height}`} className="w-full select-none rounded-lg bg-slate-50 dark:bg-slate-950">
        {[0.5, 0.75, 1].map((tick) => (
          <g key={tick}>
            <line x1={PAD.left} x2={CURVE.width - PAD.right} y1={curveY(tick)} y2={curveY(tick)} className="stroke-slate-200 dark:stroke-slate-800" strokeWidth={1} />
            <text x={PAD.left - 6} y={curveY(tick) + 4} textAnchor="end" className="fill-slate-500 text-[10px] dark:fill-slate-400">{tick.toFixed(2)}</text>
          </g>
        ))}
        {entries.map((entry) => (
          <g key={entry.value}>
            <rect x={curveX(entry.value) - 6} y={curveY(0.5 + entry.fit.support_share * 0.5)} width={12} height={curveY(0.5) - curveY(0.5 + entry.fit.support_share * 0.5)} fill="#94a3b8" opacity={0.35} />
            <text x={curveX(entry.value)} y={CURVE.height - PAD.bottom + 14} textAnchor="middle" className="fill-slate-500 text-[10px] dark:fill-slate-400">{entry.value}</text>
          </g>
        ))}
        <path d={path((entry) => entry.fit.accuracy)} fill="none" stroke={HEALTHY_COLOUR} strokeWidth={2} strokeDasharray="6 4" />
        <path d={path((entry) => entry.held_out_accuracy)} fill="none" stroke="#10b981" strokeWidth={2.5} />
        {entries.map((entry) => (
          <circle key={entry.value} cx={curveX(entry.value)} cy={curveY(entry.held_out_accuracy)} r={4} fill="#10b981" stroke="white" strokeWidth={1.2} />
        ))}
        <line x1={curveX(best.value)} x2={curveX(best.value)} y1={PAD.top} y2={CURVE.height - PAD.bottom} stroke="#10b981" strokeWidth={1} strokeDasharray="3 3" />
        <text x={PAD.left + innerWidth / 2} y={CURVE.height - 6} textAnchor="middle" className="fill-slate-500 text-[10px] dark:fill-slate-400">gamma, log axis</text>
      </svg>

      <div className="mt-2 flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs text-slate-600 dark:text-slate-300">
        <span className="flex items-center gap-1.5"><span className="inline-block h-0.5 w-4 border-t-2 border-dashed" style={{ borderColor: HEALTHY_COLOUR }} />training accuracy</span>
        <span className="flex items-center gap-1.5"><span className="inline-block h-0.5 w-4 bg-emerald-500" />held-out accuracy</span>
        <span className="flex items-center gap-1.5"><span className="inline-block h-3 w-3 bg-slate-400/40" />share kept as support vectors</span>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2">
        {SHOWN_GAMMAS.map((gamma) => entries.find((entry) => entry.value === gamma)).filter((entry): entry is Sweep["entries"][number] => Boolean(entry)).map(map)}
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Stat label={`widest reach, gamma ${widest.value}`} value={`${widest.fit.accuracy.toFixed(3)} train, ${widest.held_out_accuracy.toFixed(3)} held out`} />
        <Stat label={`best held out, gamma ${winners.map((entry) => entry.value).join(", ")}`} value={`${bestScore.toFixed(3)}, ${winners.map((entry) => entry.fit.n_support_vectors).join(", ")} of ${CLINIC.length} kept`} />
        <Stat label={`narrowest reach, gamma ${narrowest.value}`} value={`${narrowest.fit.accuracy.toFixed(3)} train, ${narrowest.held_out_accuracy.toFixed(3)} held out`} />
        <Stat label="second clinic, never fitted" value={`${sweep.held_out.length} patients, ${sweep.held_out.filter((patient) => patient.label === 0).length} unwell`} />
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
