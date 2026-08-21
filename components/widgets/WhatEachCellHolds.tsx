"use client";

// The finished map with every cell's contents shown, so that neighbouring
// cells holding similar people can be seen rather than taken on trust.
//
// The left panel is the grid drawn as a grid, in the arrangement the fit never
// changed, with each cell's people listed inside it by the heights and weights
// they were measured at. The right panel is the same fit drawn where the cells
// actually came to rest among the people. Reading the left panel left to right
// and the right panel along the net is reading the same order twice, which is
// the whole claim of the method. The switch refits the same people with the
// reach taken away, and the left panel then stops making sense while the right
// panel still quantises the people perfectly well. Hover a cell to pick its
// people out of the scatter. The API fits both maps and reports what each cell
// won; the browser draws them.

import { useEffect, useState } from "react";
import { ApiError, Point } from "@/lib/api";
import {
  MapReport,
  WithAndWithoutReach,
  fitWithAndWithoutReach,
} from "@/lib/concepts/self-organising-map";
import {
  CROWD,
  EPOCHS,
  STAT_CLASS,
  cellColour,
} from "./selfOrganisingMapFixtures";

const SCATTER = { width: 330, height: 300 };
const PAD = 22;

export function WhatEachCellHolds({
  points = CROWD,
  gridWidth = 4,
  gridHeight = 1,
}: {
  points?: Point[];
  gridWidth?: number;
  gridHeight?: number;
}) {
  const [answer, setAnswer] = useState<WithAndWithoutReach | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [withReach, setWithReach] = useState(true);
  const [hovered, setHovered] = useState<number | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setAnswer(
          await fitWithAndWithoutReach(points, gridWidth, gridHeight, EPOCHS),
        );
      } catch (error) {
        if (error instanceof ApiError) setMessage(error.message);
        else setMessage("Something went wrong.");
      }
    })();
  }, [points, gridWidth, gridHeight]);

  if (!answer) {
    return (
      <p className="text-sm text-slate-500 dark:text-slate-400">
        {message ?? "…"}
      </p>
    );
  }

  const report: MapReport = withReach
    ? answer.organised
    : answer.without_neighbourhood;

  const xs = points.map((point) => point.x);
  const ys = points.map((point) => point.y);
  const domain = {
    xMin: Math.min(...xs) - 10,
    xMax: Math.max(...xs) + 10,
    yMin: Math.min(...ys) - 10,
    yMax: Math.max(...ys) + 10,
  };
  const plot = (point: { x: number; y: number }) => ({
    px:
      PAD +
      ((point.x - domain.xMin) / (domain.xMax - domain.xMin)) *
        (SCATTER.width - 2 * PAD),
    py:
      PAD +
      (1 - (point.y - domain.yMin) / (domain.yMax - domain.yMin)) *
        (SCATTER.height - 2 * PAD),
  });
  const held = hovered === null ? [] : report.cells[hovered].people;

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 pb-3 text-sm text-slate-600 dark:text-slate-300">
        <span className="flex gap-1 rounded-md border border-slate-300 p-0.5 dark:border-slate-700">
          {[
            { label: "with the reach", value: true },
            { label: "with the reach taken away", value: false },
          ].map((choice) => (
            <button
              key={choice.label}
              onClick={() => setWithReach(choice.value)}
              className={
                "rounded px-2 py-0.5 text-xs font-medium transition " +
                (withReach === choice.value
                  ? "bg-indigo-600 text-white"
                  : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800")
              }
            >
              {choice.label}
            </button>
          ))}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <p className="mb-1 text-sm font-semibold text-slate-800 dark:text-slate-200">
            the grid, and what each cell won
          </p>
          <div
            className="grid gap-1"
            style={{
              gridTemplateColumns: `repeat(${report.grid_width}, minmax(0, 1fr))`,
            }}
          >
            {report.cells.map((cell, index) => (
              <div
                key={index}
                onMouseEnter={() => setHovered(index)}
                onMouseLeave={() => setHovered(null)}
                className="min-h-[74px] rounded border-2 p-1.5 text-[10px] leading-tight"
                style={{
                  borderColor: cellColour(
                    cell.row,
                    cell.column,
                    report.grid_width,
                    report.grid_height,
                  ),
                }}
              >
                <div className="font-mono text-[10px] text-slate-500 dark:text-slate-400">
                  {`(${cell.row}, ${cell.column})`}
                </div>
                {cell.n_people === 0 ? (
                  <div className="mt-1 italic text-slate-400 dark:text-slate-500">
                    won nobody
                  </div>
                ) : (
                  cell.people.map((person) => (
                    <div
                      key={person}
                      className="font-mono text-slate-700 dark:text-slate-300"
                    >
                      {`${points[person].x}, ${points[person].y}`}
                    </div>
                  ))
                )}
              </div>
            ))}
          </div>
        </div>

        <div>
          <p className="mb-1 text-sm font-semibold text-slate-800 dark:text-slate-200">
            where those cells came to rest
          </p>
          <svg
            viewBox={`0 0 ${SCATTER.width} ${SCATTER.height}`}
            className="w-full select-none rounded-lg bg-slate-50 dark:bg-slate-950"
          >
            {report.units.map((cell, index) => {
              const right =
                cell.column + 1 < report.grid_width
                  ? report.units[index + 1]
                  : null;
              const below =
                cell.row + 1 < report.grid_height
                  ? report.units[index + report.grid_width]
                  : null;
              const from = plot(cell);
              return (
                <g key={`join${index}`}>
                  {right && (
                    <line
                      x1={from.px}
                      y1={from.py}
                      x2={plot(right).px}
                      y2={plot(right).py}
                      className="stroke-slate-400 dark:stroke-slate-500"
                      strokeWidth={2}
                    />
                  )}
                  {below && (
                    <line
                      x1={from.px}
                      y1={from.py}
                      x2={plot(below).px}
                      y2={plot(below).py}
                      className="stroke-slate-400 dark:stroke-slate-500"
                      strokeWidth={2}
                    />
                  )}
                </g>
              );
            })}
            {points.map((person, index) => {
              const at = plot(person);
              const lit = held.includes(index);
              return (
                <circle
                  key={index}
                  cx={at.px}
                  cy={at.py}
                  r={lit ? 7 : 4.5}
                  className={
                    lit
                      ? "fill-slate-900 dark:fill-slate-100"
                      : "fill-slate-400 dark:fill-slate-600"
                  }
                />
              );
            })}
            {report.cells.map((cell, index) => {
              const at = plot(cell);
              return (
                <rect
                  key={index}
                  x={at.px - 6}
                  y={at.py - 6}
                  width={12}
                  height={12}
                  fill={cellColour(
                    cell.row,
                    cell.column,
                    report.grid_width,
                    report.grid_height,
                  )}
                  stroke="currentColor"
                  className={
                    hovered === index
                      ? "text-slate-900 dark:text-slate-100"
                      : "text-slate-500 dark:text-slate-400"
                  }
                  strokeWidth={hovered === index ? 3 : 1.5}
                />
              );
            })}
          </svg>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
        <Stat
          label="arranges"
          value={
            report.correlation === null ? "n/a" : report.correlation.toFixed(4)
          }
        />
        <Stat label="describes" value={report.quantisation_error.toFixed(4)} />
        <Stat
          label="moved last epoch"
          value={report.final_movement.toFixed(4)}
        />
      </div>
      {message && (
        <p className="mt-2 text-sm text-amber-600 dark:text-amber-400">
          {message}
        </p>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className={STAT_CLASS}>
      <div className="text-[11px] text-slate-500 dark:text-slate-400">
        {label}
      </div>
      <div className="font-mono text-sm font-semibold text-slate-900 dark:text-slate-100">
        {value}
      </div>
    </div>
  );
}
