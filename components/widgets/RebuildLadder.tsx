"use client";

// The damaged T pushed through machines that have learned for different lengths.
//
// Each grid is a separate fit from the same seed, at the number of passes under
// it, with the damaged T pushed up to the hidden units and back down again. The
// number beside each is how many of the twenty-five cells round to the
// undamaged T, and the bar under it is the mean squared gap to that shape. The
// point to watch is the shape of the fall, which is nothing for the first
// hundred and fifty passes and then a collapse. The API fits and rebuilds; the
// browser draws the ladder.

import { useEffect, useState } from "react";
import {
  ApiError,
  BoltzmannEpochSweep,
  sweepBoltzmannEpochs,
} from "@/lib/concepts/restricted-boltzmann-machine";
import {
  ACTIVE_BUTTON_CLASS,
  CELL_COUNT,
  CellGrid,
  DAMAGED_CELLS,
  DAMAGED_T,
  DEFAULT_HIDDEN_UNITS,
  PATTERNS,
  SMALL_BUTTON_CLASS,
  SQUARE_SHAPE,
  Stat,
  T_SHAPE,
  codeOf,
} from "./boltzmannFixtures";

const WALK_LENGTHS = [1, 10, 25, 50, 100, 150, 200, 300, 400, 500];

interface Probe {
  key: string;
  label: string;
  probe: number[];
  target: number[];
  damaged: number[];
  caption: string;
}

const PROBES: Probe[] = [
  {
    key: "damaged",
    label: "the damaged T",
    probe: DAMAGED_T,
    target: T_SHAPE.cells,
    damaged: DAMAGED_CELLS,
    caption:
      "Five cells of the T flipped. The count is how many cells round to the undamaged T.",
  },
  {
    key: "square",
    label: "the square, never shown",
    probe: SQUARE_SHAPE.cells,
    target: SQUARE_SHAPE.cells,
    damaged: [],
    caption:
      "A shape the machine was never given. The count is how many cells round to the square itself.",
  },
];

const cached = new Map<string, Promise<BoltzmannEpochSweep>>();

function sweep(probe: Probe): Promise<BoltzmannEpochSweep> {
  const existing = cached.get(probe.key);
  if (existing) return existing;
  const started = sweepBoltzmannEpochs(
    PATTERNS,
    DEFAULT_HIDDEN_UNITS,
    probe.probe,
    probe.target,
    WALK_LENGTHS,
  );
  cached.set(probe.key, started);
  return started;
}

export function RebuildLadder() {
  const [chosen, setChosen] = useState(PROBES[0]);
  const [swept, setSwept] = useState<BoltzmannEpochSweep | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let live = true;
    (async () => {
      try {
        const answer = await sweep(chosen);
        if (live) setSwept(answer);
      } catch (error) {
        if (error instanceof ApiError) setMessage(error.message);
        else setMessage("Something went wrong.");
      }
    })();
    return () => {
      live = false;
    };
  }, [chosen]);

  const worst = swept
    ? Math.max(...swept.points.map((point) => point.distance_to_target))
    : 1;
  const last = swept ? swept.points[swept.points.length - 1] : null;

  return (
    <div className="rounded-lg bg-slate-50 p-4 dark:bg-slate-950">
      <div className="flex flex-wrap items-start justify-between gap-4 pb-3">
        <div className="flex flex-wrap items-center gap-2">
          {PROBES.map((probe) => (
            <button
              key={probe.key}
              onClick={() => {
                setSwept(null);
                setChosen(probe);
              }}
              className={
                probe.key === chosen.key ? ACTIVE_BUTTON_CLASS : SMALL_BUTTON_CLASS
              }
            >
              {probe.label}
            </button>
          ))}
        </div>
        <div className="flex items-end gap-4">
          <Labelled title="put in">
            <CellGrid values={chosen.probe} outlined={chosen.damaged} />
          </Labelled>
          <Labelled title="what it should be">
            <CellGrid values={chosen.target} />
          </Labelled>
        </div>
      </div>

      {!swept ? (
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {message ?? "…"}
        </p>
      ) : (
        <>
          <div className="flex flex-wrap justify-center gap-3">
            {swept.points.map((point) => (
              <div key={point.max_epochs} className="flex flex-col items-center gap-1">
                <CellGrid values={point.probe_reconstruction} size="small" />
                <svg viewBox="0 0 40 46" className="h-11 w-10">
                  <rect
                    x={12}
                    y={44 - (point.distance_to_target / worst) * 40}
                    width={16}
                    height={(point.distance_to_target / worst) * 40}
                    className="fill-indigo-500/70"
                  />
                </svg>
                <span className="font-mono text-[10px] text-slate-500 dark:text-slate-400">
                  {point.cells_matching_target}/{CELL_COUNT}
                </span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400">
                  {point.max_epochs}
                </span>
              </div>
            ))}
          </div>
          <p className="mt-1 text-center text-xs text-slate-500 dark:text-slate-400">
            Passes of learning along the bottom. The bar is the mean squared gap
            to the shape above, and the count is how many cells land on it.
          </p>

          {last && (
            <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <Stat
                label="Gap after 500 passes"
                value={last.distance_to_target.toFixed(4)}
              />
              <Stat
                label="Cells landing on the shape"
                value={`${last.cells_matching_target} of ${CELL_COUNT}`}
              />
              <Stat
                label="What the hidden units read"
                value={codeOf(last.probe_hidden_probabilities)}
                note={last.probe_hidden_probabilities
                  .map((value) => value.toFixed(2))
                  .join(" ")}
              />
              <Stat
                label="Its score against the shapes"
                value={last.probe_free_energy.toFixed(2)}
                note={`lowest stored ${Math.min(...last.stored_free_energies).toFixed(2)}`}
              />
            </div>
          )}
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            {chosen.caption}
          </p>
        </>
      )}
    </div>
  );
}

function Labelled({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-1">
      {children}
      <span className="text-[10px] text-slate-500 dark:text-slate-400">
        {title}
      </span>
    </div>
  );
}
