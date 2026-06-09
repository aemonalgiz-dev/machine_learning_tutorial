"use client";

// Three shapes remembered as a web of weights, and a damaged copy falling back.
//
// The small grids are the shapes the network stored, a T, an L and a cross on
// twenty-five cells, and the network keeps no copy of any of them. What it
// keeps is one weight per pair of cells, saying whether the two agreed or
// disagreed across the shapes it was shown. The large grid is the probe. Click
// a cell to flip it, or scramble five at once, then press recall and watch the
// walk one pass at a time, with the energy stepping down beside it until
// nothing moves. A toggle stores three more shapes, which is how the reader
// gets to see a probe fall somewhere no shape lives. Every weight, every state
// along the walk and every energy is the library's through the API. The
// browser flips cells, picks which five to scramble from a fixed sequence, and
// lays the answer out.

import { useEffect, useRef, useState } from "react";
import { ApiError, Recall, recallPattern } from "@/lib/concepts/hopfield-network";
import { Failure, PatternGrid, Stat } from "./HopfieldGrid";
import {
  BUTTON_CLASS,
  CELL_COUNT,
  PRIMARY_BUTTON_CLASS,
  SMALL_BUTTON_CLASS,
  StoredShape,
  THREE_MORE_SHAPES,
  THREE_SHAPES,
  cellsOf,
  settledLabel,
} from "./hopfieldFixtures";

// Which five cells a scramble flips comes from a fixed sequence rather than
// from Math.random, so the first press flips the same five for every reader
// and the page can quote what happens next. Starting the probe from a shape
// restarts the sequence, so a fresh shape always meets the same first
// scramble, and pressing again on the same probe draws the next five. Park
// and Miller's minimal standard generator, started from 1. The product stays
// well inside the range a double holds exactly, so the sequence is the same
// in every browser.
const SCRAMBLE_SEED = 1;
const SCRAMBLE_SIZE = 5;
const MULTIPLIER = 16807;
const MODULUS = 2147483647;

interface Scramble {
  cells: number[];
  state: number;
}

function drawScramble(state: number): Scramble {
  const cells: number[] = [];
  let next = state;
  while (cells.length < SCRAMBLE_SIZE) {
    next = (next * MULTIPLIER) % MODULUS;
    const cell = next % CELL_COUNT;
    if (!cells.includes(cell)) cells.push(cell);
  }
  return { cells, state: next };
}

const PASS_INTERVAL_MS = 700;

const CHART = { width: 320, height: 200 };
const CHART_PAD = { left: 48, right: 14, top: 14, bottom: 30 };
const CHART_PLOT = {
  width: CHART.width - CHART_PAD.left - CHART_PAD.right,
  height: CHART.height - CHART_PAD.top - CHART_PAD.bottom,
};

function restLabel(answer: Recall, stored: StoredShape[]): string {
  if (!answer.settled) return "still moving at the pass limit";
  return settledLabel(answer.settled_into, stored);
}

export function HopfieldPlayground() {
  const [storeMore, setStoreMore] = useState(false);
  const [probe, setProbe] = useState<number[]>(THREE_SHAPES[0].cells);
  const [answer, setAnswer] = useState<Recall | null>(null);
  const [passIndex, setPassIndex] = useState(0);
  const [recalling, setRecalling] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const scrambleState = useRef(SCRAMBLE_SEED);

  const stored = storeMore ? [...THREE_SHAPES, ...THREE_MORE_SHAPES] : THREE_SHAPES;

  // A fresh answer plays itself through, one pass every seven tenths of a
  // second, and the step control takes over from wherever it stops.
  useEffect(() => {
    if (!answer) return;
    const passCount = answer.passes.length;
    const timer = setInterval(() => {
      setPassIndex((current) => {
        if (current >= passCount) {
          clearInterval(timer);
          return current;
        }
        return current + 1;
      });
    }, PASS_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [answer]);

  const flipCell = (index: number) => {
    setProbe((current) => current.map((value, position) => (position === index ? -value : value)));
    setAnswer(null);
  };

  const startFrom = (cells: number[]) => {
    setProbe(cells);
    setAnswer(null);
    scrambleState.current = SCRAMBLE_SEED;
  };

  const scramble = () => {
    const drawn = drawScramble(scrambleState.current);
    scrambleState.current = drawn.state;
    setProbe((current) => current.map((value, position) => (drawn.cells.includes(position) ? -value : value)));
    setAnswer(null);
  };

  const toggleStoreMore = () => {
    setStoreMore((current) => !current);
    setAnswer(null);
  };

  const recall = async () => {
    setRecalling(true);
    try {
      const result = await recallPattern(cellsOf(stored), probe);
      setPassIndex(0);
      setAnswer(result);
      setMessage(null);
    } catch (error) {
      if (error instanceof ApiError) setMessage(error.message);
      else setMessage("Something went wrong.");
    } finally {
      setRecalling(false);
    }
  };

  const passCount = answer ? answer.passes.length : 0;
  const shownState = answer && passIndex > 0 ? answer.passes[passIndex - 1].state : probe;
  const previousState = answer && passIndex > 1 ? answer.passes[passIndex - 2].state : probe;
  const changedCells =
    answer && passIndex > 0 ? shownState.map((value, position) => value !== previousState[position]) : shownState.map(() => false);
  const energyNow = answer ? (passIndex > 0 ? answer.passes[passIndex - 1].energy_after : answer.initial_energy) : null;

  return (
    <div>
      <div className="flex flex-wrap items-end gap-4 pb-3">
        {stored.map((entry) => (
          <button
            key={entry.name}
            onClick={() => startFrom(entry.cells)}
            title={`Start the probe from ${entry.name}`}
            className="group flex flex-col items-center gap-1"
          >
            <PatternGrid cells={entry.cells} size="small" />
            <span className="text-xs text-slate-500 group-hover:text-indigo-600 dark:text-slate-400 dark:group-hover:text-indigo-400">
              {entry.name}
            </span>
          </button>
        ))}
        <label className="ml-auto flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
          <input type="checkbox" checked={storeMore} onChange={toggleStoreMore} className="accent-indigo-600" />
          Store three more shapes
        </label>
      </div>

      <div className="flex flex-wrap items-center gap-2 pb-3">
        <button onClick={scramble} className={BUTTON_CLASS}>
          Scramble five cells
        </button>
        <button onClick={recall} disabled={recalling} className={PRIMARY_BUTTON_CLASS}>
          Recall
        </button>
      </div>

      <div className="flex flex-wrap items-start justify-center gap-6 rounded-lg bg-slate-50 p-4 dark:bg-slate-950">
        <div className="flex flex-col items-center gap-2">
          <PatternGrid cells={probe} onFlip={flipCell} />
          <span className="text-xs text-slate-500 dark:text-slate-400">The probe. Click a cell to flip it.</span>
        </div>

        <div className="flex flex-col items-center gap-2">
          <PatternGrid cells={shownState} changed={changedCells} />
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPassIndex((current) => Math.max(0, current - 1))}
              disabled={!answer || passIndex === 0}
              className={SMALL_BUTTON_CLASS}
            >
              ◀
            </button>
            <span className="w-28 text-center font-mono text-xs text-slate-600 dark:text-slate-300">
              {answer ? (passIndex === 0 ? "the probe" : `pass ${passIndex} of ${passCount}`) : "not yet recalled"}
            </span>
            <button
              onClick={() => setPassIndex((current) => Math.min(passCount, current + 1))}
              disabled={!answer || passIndex >= passCount}
              className={SMALL_BUTTON_CLASS}
            >
              ▶
            </button>
          </div>
        </div>

        <EnergyStaircase answer={answer} passIndex={passIndex} />
      </div>

      <p className="mt-2 text-center text-xs text-slate-500 dark:text-slate-500">
        The right-hand grid is the network&rsquo;s state after each pass, with the cells that moved outlined, and the
        staircase is its energy, which only ever steps down.
      </p>

      <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Settled into" value={answer ? restLabel(answer, stored) : "…"} />
        <Stat label="Load, patterns per cell" value={answer ? answer.load.toFixed(2) : "…"} />
        <Stat label="Passes to rest" value={answer ? String(passCount) : "…"} />
        <Stat label="Energy" value={energyNow === null ? "…" : energyNow.toFixed(2)} />
      </div>

      <Failure message={message} />
    </div>
  );
}

function EnergyStaircase({ answer, passIndex }: { answer: Recall | null; passIndex: number }) {
  const energies = answer ? [answer.initial_energy, ...answer.passes.map((recallPass) => recallPass.energy_after)] : [];
  const lastPass = Math.max(1, energies.length - 1);
  const highest = energies.length ? Math.max(...energies) : 0;
  const lowest = energies.length ? Math.min(...energies) : 0;
  const span = highest - lowest || 1;

  const passToX = (passNumber: number) => CHART_PAD.left + (passNumber / lastPass) * CHART_PLOT.width;
  const energyToY = (energy: number) => CHART_PAD.top + ((highest - energy) / span) * CHART_PLOT.height;

  const stepPath = energies
    .map((energy, passNumber) =>
      passNumber === 0 ? `M ${passToX(0)} ${energyToY(energy)}` : `H ${passToX(passNumber)} V ${energyToY(energy)}`,
    )
    .join(" ");

  const axisClass = "text-slate-300 dark:text-slate-700";
  const labelClass = "fill-slate-500 text-[10px] font-medium dark:fill-slate-400";

  return (
    <div className="flex flex-col items-center gap-2">
      <svg viewBox={`0 0 ${CHART.width} ${CHART.height}`} className="w-72 select-none">
        <line
          x1={CHART_PAD.left}
          y1={CHART_PAD.top}
          x2={CHART_PAD.left}
          y2={CHART_PAD.top + CHART_PLOT.height}
          stroke="currentColor"
          className={axisClass}
          strokeWidth={1}
        />
        <line
          x1={CHART_PAD.left}
          y1={CHART_PAD.top + CHART_PLOT.height}
          x2={CHART_PAD.left + CHART_PLOT.width}
          y2={CHART_PAD.top + CHART_PLOT.height}
          stroke="currentColor"
          className={axisClass}
          strokeWidth={1}
        />

        {energies.length > 0 && (
          <>
            <text x={CHART_PAD.left - 6} y={CHART_PAD.top + 4} textAnchor="end" className={labelClass}>
              {highest.toFixed(2)}
            </text>
            <text x={CHART_PAD.left - 6} y={CHART_PAD.top + CHART_PLOT.height + 4} textAnchor="end" className={labelClass}>
              {lowest.toFixed(2)}
            </text>
            <path d={stepPath} fill="none" stroke="currentColor" className="text-slate-400 dark:text-slate-500" strokeWidth={1.5} />
            {energies.map((energy, passNumber) => (
              <circle
                key={passNumber}
                cx={passToX(passNumber)}
                cy={energyToY(energy)}
                r={passNumber === passIndex ? 6 : 4}
                className={
                  (passNumber === passIndex ? "fill-amber-500" : passNumber <= passIndex ? "fill-indigo-600" : "fill-slate-300 dark:fill-slate-600") +
                  " stroke-white dark:stroke-slate-900"
                }
                strokeWidth={1.5}
              />
            ))}
            {energies.map((_, passNumber) => (
              <text key={`t${passNumber}`} x={passToX(passNumber)} y={CHART_PAD.top + CHART_PLOT.height + 14} textAnchor="middle" className={labelClass}>
                {passNumber}
              </text>
            ))}
          </>
        )}

        <text x={CHART_PAD.left + CHART_PLOT.width / 2} y={CHART.height - 4} textAnchor="middle" className={labelClass}>
          Pass
        </text>
        <text
          x={12}
          y={CHART_PAD.top + CHART_PLOT.height / 2}
          textAnchor="middle"
          transform={`rotate(-90 12 ${CHART_PAD.top + CHART_PLOT.height / 2})`}
          className={labelClass}
        >
          Energy
        </text>
      </svg>
      <span className="text-xs text-slate-500 dark:text-slate-400">The energy after each pass.</span>
    </div>
  );
}
