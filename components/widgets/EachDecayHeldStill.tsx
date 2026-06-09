"use client";

// The same people fitted four times, one of the two decays held still at a
// time, which is the only way to say what each of them does on its own.
//
// Every panel is one fit of the same eighteen people on the same chain of six
// cells from the same seed, and the only thing that differs is whether the step
// shrinks, whether the reach shrinks, both or neither. The three readouts under
// each panel answer three separate questions. The movement says whether the map
// settled, the quantisation error says whether it describes anybody, and the
// arrangement says whether cells next to each other on the chain came to rest
// next to each other among the people. A map can score well on any one of them
// and badly on the others, which is why all three are shown. The API refits
// four times and reports all three; the browser draws them.

import { useEffect, useState } from "react";
import { ApiError, Point } from "@/lib/api";
import {
  Ablation,
  AblationRun,
  holdEachDecayStill,
} from "@/lib/concepts/self-organising-map";
import {
  ARCH,
  EPOCHS,
  STAT_CLASS,
  cellColour,
} from "./selfOrganisingMapFixtures";

const PANEL = { width: 300, height: 210 };
const PAD = 16;

export function EachDecayHeldStill({
  points = ARCH,
  cells = 6,
}: {
  points?: Point[];
  cells?: number;
}) {
  const [answer, setAnswer] = useState<Ablation | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setAnswer(await holdEachDecayStill(points, cells, 1, EPOCHS));
      } catch (error) {
        if (error instanceof ApiError) setMessage(error.message);
        else setMessage("Something went wrong.");
      }
    })();
  }, [points, cells]);

  if (!answer) {
    return (
      <p className="text-sm text-slate-500 dark:text-slate-400">
        {message ?? "…"}
      </p>
    );
  }

  const xs = points.map((point) => point.x);
  const ys = points.map((point) => point.y);
  const domain = {
    xMin: Math.min(...xs) - 8,
    xMax: Math.max(...xs) + 8,
    yMin: Math.min(...ys) - 8,
    yMax: Math.max(...ys) + 8,
  };
  const plot = (point: { x: number; y: number }) => ({
    px:
      PAD +
      ((point.x - domain.xMin) / (domain.xMax - domain.xMin)) *
        (PANEL.width - 2 * PAD),
    py:
      PAD +
      (1 - (point.y - domain.yMin) / (domain.yMax - domain.yMin)) *
        (PANEL.height - 2 * PAD),
  });

  return (
    <div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {answer.runs.map((run) => (
          <Panel
            key={run.name}
            run={run}
            points={points}
            plot={plot}
            cells={cells}
          />
        ))}
      </div>
      <p className="mt-2 text-xs text-slate-500 dark:text-slate-500">
        The same eighteen people, the same chain of six cells, the same seed,
        the same hundred epochs. Only the two decays differ.
      </p>
      {message && (
        <p className="mt-2 text-sm text-amber-600 dark:text-amber-400">
          {message}
        </p>
      )}
    </div>
  );
}

function Panel({
  run,
  points,
  plot,
  cells,
}: {
  run: AblationRun;
  points: Point[];
  plot: (point: { x: number; y: number }) => { px: number; py: number };
  cells: number;
}) {
  return (
    <div className="rounded-lg border border-slate-200 p-2 dark:border-slate-800">
      <p className="mb-1 text-sm font-semibold text-slate-800 dark:text-slate-200">
        {run.name}
      </p>
      <svg
        viewBox={`0 0 ${PANEL.width} ${PANEL.height}`}
        className="w-full select-none rounded bg-slate-50 dark:bg-slate-950"
      >
        {points.map((person, index) => {
          const at = plot(person);
          return (
            <circle
              key={index}
              cx={at.px}
              cy={at.py}
              r={3.5}
              className="fill-slate-400 dark:fill-slate-600"
            />
          );
        })}
        {run.units.slice(0, -1).map((cell, index) => {
          const from = plot(cell);
          const to = plot(run.units[index + 1]);
          return (
            <line
              key={`j${index}`}
              x1={from.px}
              y1={from.py}
              x2={to.px}
              y2={to.py}
              className="stroke-slate-500 dark:stroke-slate-400"
              strokeWidth={2}
            />
          );
        })}
        {run.units.map((cell, index) => {
          const at = plot(cell);
          return (
            <rect
              key={index}
              x={at.px - 5}
              y={at.py - 5}
              width={10}
              height={10}
              fill={cellColour(cell.row, cell.column, cells, 1)}
              stroke="currentColor"
              className="text-slate-800 dark:text-slate-100"
              strokeWidth={1.5}
            />
          );
        })}
      </svg>
      <div className="mt-2 grid grid-cols-3 gap-1">
        <Stat label="moved last" value={run.final_movement.toFixed(3)} />
        <Stat label="describes" value={run.quantisation_error.toFixed(2)} />
        <Stat
          label="arranges"
          value={run.correlation === null ? "n/a" : run.correlation.toFixed(4)}
        />
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className={STAT_CLASS}>
      <div className="text-[10px] text-slate-500 dark:text-slate-400">
        {label}
      </div>
      <div className="font-mono text-sm font-semibold text-slate-900 dark:text-slate-100">
        {value}
      </div>
    </div>
  );
}
