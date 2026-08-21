"use client";

// The energy along a straight walk from the T to somewhere else.
//
// The landscape has 33 million states on twenty-five cells and cannot be
// drawn, so this draws one path through it: start at the T and flip, one at
// a time in cell order, every cell that differs from the destination, which
// is the T's negation, the L or the cross. The API scores every state on the
// path, its energy and whether it is a fixed point, and reports the stored
// shapes' own energies for scale. The browser builds the path and draws the
// curve, with the fixed points marked and the stored energies as dashed
// lines. What to look at is the shape of the curve: a climb and a return to
// the same depth for the negation, and a ridge between two wells for the L.

import { useEffect, useState } from "react";
import { ApiError, StateScores, scoreStates } from "@/lib/concepts/hopfield-network";
import { Caption, Failure, Stat, plain } from "./HopfieldGrid";
import { BUTTON_CLASS, CROSS_SHAPE, L_SHAPE, THREE_SHAPES, T_SHAPE, cellsOf, flippedAt, settledLabel } from "./hopfieldFixtures";

const CHART = { width: 520, height: 240 };
const PAD = { left: 52, right: 16, top: 16, bottom: 34 };
const PLOT = { width: CHART.width - PAD.left - PAD.right, height: CHART.height - PAD.top - PAD.bottom };

type Destination = "negation" | "L" | "cross";

const DESTINATIONS: { key: Destination; label: string; cells: number[] }[] = [
  { key: "negation", label: "the T's negation", cells: T_SHAPE.cells.map((value) => -value) },
  { key: "L", label: "the L", cells: L_SHAPE.cells },
  { key: "cross", label: "the cross", cells: CROSS_SHAPE.cells },
];

function pathTo(destination: number[]): { cells: number[]; states: number[][] } {
  const differing = T_SHAPE.cells.map((value, index) => (value !== destination[index] ? index : -1)).filter((index) => index >= 0);
  const states = Array.from({ length: differing.length + 1 }, (_, count) => flippedAt(T_SHAPE.cells, differing.slice(0, count)));
  return { cells: differing, states };
}

export function EnergyPath({ initialDestination = "negation" }: { initialDestination?: Destination }) {
  const [destination, setDestination] = useState<Destination>(initialDestination);
  const [scores, setScores] = useState<StateScores | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const target = DESTINATIONS.find((entry) => entry.key === destination)!;
  const path = pathTo(target.cells);

  useEffect(() => {
    (async () => {
      try {
        setScores(await scoreStates(cellsOf(THREE_SHAPES), pathTo(DESTINATIONS.find((entry) => entry.key === destination)!.cells).states));
        setMessage(null);
      } catch (error) {
        if (error instanceof ApiError) setMessage(error.message);
        else setMessage("Something went wrong.");
      }
    })();
  }, [destination]);

  if (!scores) {
    return <p className="text-sm text-slate-500 dark:text-slate-400">{message ?? "…"}</p>;
  }

  const energies = scores.reports.map((report) => report.energy);
  const highest = Math.max(...energies, ...scores.stored_energies);
  const lowest = Math.min(...energies, ...scores.stored_energies);
  const span = highest - lowest || 1;
  const last = energies.length - 1;
  const flipsToX = (flips: number) => PAD.left + (flips / Math.max(1, last)) * PLOT.width;
  const energyToY = (energy: number) => PAD.top + ((highest - energy) / span) * PLOT.height;
  const linePath = energies.map((energy, flips) => `${flips === 0 ? "M" : "L"} ${flipsToX(flips)} ${energyToY(energy)}`).join(" ");
  const peak = energies.indexOf(Math.max(...energies));
  const labelClass = "fill-slate-500 text-[10px] font-medium dark:fill-slate-400";
  const end = scores.reports[last];

  return (
    <div className="my-4 rounded-lg bg-slate-50 p-4 dark:bg-slate-950">
      <div className="flex flex-wrap items-center gap-2 pb-3 text-sm text-slate-600 dark:text-slate-300">
        <span>from the T to</span>
        {DESTINATIONS.map((entry) => (
          <button key={entry.key} onClick={() => setDestination(entry.key)} className={BUTTON_CLASS + (entry.key === destination ? " ring-2 ring-indigo-400" : "")}>
            {entry.label}
          </button>
        ))}
      </div>
      <svg viewBox={`0 0 ${CHART.width} ${CHART.height}`} className="w-full select-none">
        <line x1={PAD.left} y1={PAD.top} x2={PAD.left} y2={PAD.top + PLOT.height} stroke="currentColor" className="text-slate-300 dark:text-slate-700" />
        <line x1={PAD.left} y1={PAD.top + PLOT.height} x2={PAD.left + PLOT.width} y2={PAD.top + PLOT.height} stroke="currentColor" className="text-slate-300 dark:text-slate-700" />
        {scores.stored_energies.map((energy, index) => (
          <g key={index}>
            <line x1={PAD.left} y1={energyToY(energy)} x2={PAD.left + PLOT.width} y2={energyToY(energy)} stroke="currentColor" strokeDasharray="4 4" className="text-emerald-500/60" />
            <text x={PAD.left + PLOT.width - 2} y={energyToY(energy) - 3} textAnchor="end" className="fill-emerald-600 text-[10px] dark:fill-emerald-400">
              {THREE_SHAPES[index].name} {plain(energy, 2)}
            </text>
          </g>
        ))}
        <path d={linePath} fill="none" stroke="currentColor" className="text-indigo-600 dark:text-indigo-400" strokeWidth={2} />
        {scores.reports.map((report, flips) => (
          <circle
            key={flips}
            cx={flipsToX(flips)}
            cy={energyToY(report.energy)}
            r={report.is_fixed_point ? 5 : 2.5}
            className={(report.is_fixed_point ? "fill-amber-500" : "fill-indigo-600 dark:fill-indigo-400") + " stroke-white dark:stroke-slate-900"}
            strokeWidth={1}
          />
        ))}
        <text x={PAD.left - 6} y={PAD.top + 4} textAnchor="end" className={labelClass}>
          {plain(highest, 2)}
        </text>
        <text x={PAD.left - 6} y={PAD.top + PLOT.height + 4} textAnchor="end" className={labelClass}>
          {plain(lowest, 2)}
        </text>
        {[0, peak, last].map((flips) => (
          <text key={flips} x={flipsToX(flips)} y={PAD.top + PLOT.height + 14} textAnchor="middle" className={labelClass}>
            {flips}
          </text>
        ))}
        <text x={PAD.left + PLOT.width / 2} y={CHART.height - 4} textAnchor="middle" className={labelClass}>
          Cells flipped away from the T
        </text>
        <text x={12} y={PAD.top + PLOT.height / 2} textAnchor="middle" transform={`rotate(-90 12 ${PAD.top + PLOT.height / 2})`} className={labelClass}>
          Energy
        </text>
      </svg>
      <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="cells that differ" value={String(path.cells.length)} />
        <Stat label="energy at the start, at the end" value={`${plain(energies[0], 2)}, ${plain(energies[last], 2)}`} />
        <Stat label="highest energy on the path, after how many flips" value={`${plain(energies[peak], 2)}, ${peak}`} />
        <Stat label="the end equals" value={settledLabel(end.equals, THREE_SHAPES)} />
      </div>
      <Caption>
        Amber points are fixed points, states no single cell wants to leave, and {scores.reports.filter((report) => report.is_fixed_point).length} of the{" "}
        {scores.reports.length} states on this path are. The dashed lines are the
        three stored shapes&rsquo; own energies. Between the ends the path is one straight route of many, so the curve is a
        cross-section of the landscape rather than the whole of it.
      </Caption>
      <Failure message={message} />
    </div>
  );
}
