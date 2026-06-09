"use client";

// The scrambled T falling back into the T, one cell at a time.
//
// The playground shows recall a pass at a time; this opens a pass into its
// visits. Every visit the library made is one step: the cell it visited is
// ringed in green, what its connections told it is read out, and if it
// moved, the cell is outlined in amber and the energy steps down by exactly
// twice the sum it read. The grid panel is the state; the energy panel is
// the staircase by visit, which is the granularity the settling argument is
// made at. The API replays the library's walk and reports every sum and
// energy; the browser reconstructs each intermediate state from the flips
// and draws it.

import { useEffect, useState } from "react";
import { ApiError, UnitWalk, walkByUnit } from "@/lib/concepts/hopfield-network";
import { Caption, Failure, PatternGrid, Stat, plain, signed } from "./HopfieldGrid";
import { SCRAMBLED_T, SIX_SHAPES, SMALL_BUTTON_CLASS, THREE_SHAPES, cellsOf, settledLabel } from "./hopfieldFixtures";

const CHART = { width: 420, height: 200 };
const PAD = { left: 48, right: 14, top: 14, bottom: 30 };
const PLOT = { width: CHART.width - PAD.left - PAD.right, height: CHART.height - PAD.top - PAD.bottom };

export type StepperPanel = "grid" | "energy";

export function RecallStepper({
  panels = ["grid"],
  shapes = "three",
}: {
  panels?: StepperPanel[];
  shapes?: "three" | "six";
}) {
  const stored = shapes === "three" ? THREE_SHAPES : SIX_SHAPES;
  const [walk, setWalk] = useState<UnitWalk | null>(null);
  const [visitIndex, setVisitIndex] = useState(0);
  const [message, setMessage] = useState<string | null>(null);
  const has = (panel: StepperPanel) => panels.includes(panel);

  useEffect(() => {
    (async () => {
      try {
        setWalk(await walkByUnit(cellsOf(stored), SCRAMBLED_T));
        setVisitIndex(0);
      } catch (error) {
        if (error instanceof ApiError) setMessage(error.message);
        else setMessage("Something went wrong.");
      }
    })();
  }, [stored]);

  if (!walk) {
    return <p className="text-sm text-slate-500 dark:text-slate-400">{message ?? "…"}</p>;
  }

  const visits = walk.visits;
  const count = visits.length;
  // The state after the first visitIndex visits, rebuilt from the flips.
  const state = SCRAMBLED_T.slice();
  const flippedSoFar = SCRAMBLED_T.map(() => false);
  for (const visit of visits.slice(0, visitIndex)) {
    if (visit.flipped) {
      state[visit.unit] = visit.value_after;
      flippedSoFar[visit.unit] = true;
    }
  }
  const current = visitIndex > 0 ? visits[visitIndex - 1] : null;
  const energyNow = current ? current.energy_after : walk.initial_energy;
  const nextFlip = visits.findIndex((visit, index) => index >= visitIndex && visit.flipped);
  const remaining = state.filter((value, index) => value !== stored[0].cells[index]).length;

  const energies = [walk.initial_energy, ...visits.map((visit) => visit.energy_after)];
  const highest = Math.max(...energies);
  const lowest = Math.min(...energies);
  const span = highest - lowest || 1;
  const visitToX = (index: number) => PAD.left + (index / Math.max(1, count)) * PLOT.width;
  const energyToY = (energy: number) => PAD.top + ((highest - energy) / span) * PLOT.height;
  const stepPath = energies
    .map((energy, index) => (index === 0 ? `M ${visitToX(0)} ${energyToY(energy)}` : `H ${visitToX(index)} V ${energyToY(energy)}`))
    .join(" ");
  const labelClass = "fill-slate-500 text-[10px] font-medium dark:fill-slate-400";

  return (
    <div className="my-4 rounded-lg bg-slate-50 p-4 dark:bg-slate-950">
      <div className="flex flex-wrap items-center justify-center gap-2 pb-3">
        <button onClick={() => setVisitIndex(0)} disabled={visitIndex === 0} className={SMALL_BUTTON_CLASS}>
          reset
        </button>
        <button onClick={() => setVisitIndex((index) => Math.max(0, index - 1))} disabled={visitIndex === 0} className={SMALL_BUTTON_CLASS}>
          ◀
        </button>
        <span className="w-36 text-center font-mono text-xs text-slate-600 dark:text-slate-300">
          {visitIndex === 0 ? "the probe" : `visit ${visitIndex} of ${count}`}
        </span>
        <button onClick={() => setVisitIndex((index) => Math.min(count, index + 1))} disabled={visitIndex >= count} className={SMALL_BUTTON_CLASS}>
          ▶
        </button>
        <button onClick={() => setVisitIndex(nextFlip + 1)} disabled={nextFlip < 0} className={SMALL_BUTTON_CLASS}>
          next flip
        </button>
      </div>

      <div className="flex flex-wrap items-start justify-center gap-6">
        {has("grid") && (
          <div className="flex flex-col items-center gap-2">
            <PatternGrid cells={state} changed={flippedSoFar} visiting={current ? current.unit : null} />
            <span className="text-xs text-slate-500 dark:text-slate-400">green ring, the cell being visited; amber, cells that have moved</span>
          </div>
        )}
        {has("energy") && (
          <svg viewBox={`0 0 ${CHART.width} ${CHART.height}`} className="w-full max-w-md select-none">
            <line x1={PAD.left} y1={PAD.top} x2={PAD.left} y2={PAD.top + PLOT.height} stroke="currentColor" className="text-slate-300 dark:text-slate-700" />
            <line x1={PAD.left} y1={PAD.top + PLOT.height} x2={PAD.left + PLOT.width} y2={PAD.top + PLOT.height} stroke="currentColor" className="text-slate-300 dark:text-slate-700" />
            <text x={PAD.left - 6} y={PAD.top + 4} textAnchor="end" className={labelClass}>
              {plain(highest, 2)}
            </text>
            <text x={PAD.left - 6} y={PAD.top + PLOT.height + 4} textAnchor="end" className={labelClass}>
              {plain(lowest, 2)}
            </text>
            <path d={stepPath} fill="none" stroke="currentColor" className="text-slate-400 dark:text-slate-500" strokeWidth={1.5} />
            {visits.map((visit, index) =>
              visit.flipped ? (
                <circle
                  key={index}
                  cx={visitToX(index + 1)}
                  cy={energyToY(visit.energy_after)}
                  r={index + 1 === visitIndex ? 6 : 4}
                  className={(index + 1 <= visitIndex ? "fill-indigo-600" : "fill-slate-300 dark:fill-slate-600") + " stroke-white dark:stroke-slate-900"}
                  strokeWidth={1.5}
                />
              ) : null,
            )}
            <circle cx={visitToX(visitIndex)} cy={energyToY(energyNow)} r={6} className="fill-amber-500 stroke-white dark:stroke-slate-900" strokeWidth={1.5} />
            {walk.passes.map((recallPass, index) => {
              const boundary = visits.filter((visit) => visit.pass_number <= recallPass.pass_number).length;
              return (
                <text key={index} x={visitToX(boundary)} y={PAD.top + PLOT.height + 14} textAnchor="end" className={labelClass}>
                  pass {recallPass.pass_number} ends
                </text>
              );
            })}
            <text x={PAD.left + PLOT.width / 2} y={CHART.height - 4} textAnchor="middle" className={labelClass}>
              Visit
            </text>
            <text x={12} y={PAD.top + PLOT.height / 2} textAnchor="middle" transform={`rotate(-90 12 ${PAD.top + PLOT.height / 2})`} className={labelClass}>
              Energy
            </text>
          </svg>
        )}
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="cell visited" value={current ? String(current.unit + 1) : "…"} />
        <Stat label="what it read" value={current ? signed(current.weighted_sum, 2) : "…"} />
        <Stat label="held, becomes" value={current ? `${current.value_before > 0 ? "+1" : "−1"}, ${current.value_after > 0 ? "+1" : "−1"}${current.flipped ? " moved" : ""}` : "…"} />
        <Stat label="energy" value={plain(energyNow, 2)} />
      </div>
      <Caption>
        {count} visits over {walk.passes.length} passes, {visits.filter((visit) => visit.flipped).length} of them moving a cell; {remaining}{" "}
        {remaining === 1 ? "cell differs" : "cells differ"} from the T at this step. The walk reports {walk.stopped_because} and rests in{" "}
        {settledLabel(walk.settled_into, stored)} at {plain(walk.passes[walk.passes.length - 1].energy_after, 2)}.
      </Caption>
      <Failure message={message} />
    </div>
  );
}
