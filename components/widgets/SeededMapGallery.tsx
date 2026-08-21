"use client";

// The same people fitted from several seeds, to say what a seed fixes and what
// nothing fixes.
//
// The seed decides two things, which cells the fit starts on and the order the
// people are presented in each epoch, so a differently seeded fit really is a
// different walk. Each panel is one of them, drawn as the net that walk left
// behind. The rows underneath say whether that fit put the same people
// together as the first, whether it reproduced the first exactly, and which end
// of the chain it read from, because a map is an arrangement and an
// arrangement read backwards is the same arrangement. The API fits from each
// seed and compares the groupings rather than the labels; the browser draws
// them.

import { useEffect, useState } from "react";
import { ApiError, Point } from "@/lib/api";
import {
  SeededMap,
  SeededMaps,
  fitFromSeveralSeeds,
} from "@/lib/concepts/self-organising-map";
import { CROWD, EPOCHS, cellColour } from "./selfOrganisingMapFixtures";

const PANEL = { width: 250, height: 170 };
const PAD = 16;

export function SeededMapGallery({
  points = CROWD,
  gridWidth = 4,
  gridHeight = 1,
  seeds = 6,
}: {
  points?: Point[];
  gridWidth?: number;
  gridHeight?: number;
  seeds?: number;
}) {
  const [answer, setAnswer] = useState<SeededMaps | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setAnswer(
          await fitFromSeveralSeeds(
            points,
            gridWidth,
            gridHeight,
            EPOCHS,
            seeds,
          ),
        );
      } catch (error) {
        if (error instanceof ApiError) setMessage(error.message);
        else setMessage("Something went wrong.");
      }
    })();
  }, [points, gridWidth, gridHeight, seeds]);

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
    xMin: Math.min(...xs) - 10,
    xMax: Math.max(...xs) + 10,
    yMin: Math.min(...ys) - 10,
    yMax: Math.max(...ys) + 10,
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
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {answer.fits.map((fit) => (
          <Panel
            key={fit.seed}
            fit={fit}
            points={points}
            plot={plot}
            gridWidth={gridWidth}
            gridHeight={gridHeight}
          />
        ))}
      </div>
      <div className="mt-3 overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left dark:border-slate-800">
              {[
                "seed",
                "same people together",
                "identical to the first",
                "arranges",
                "describes",
                "reads",
              ].map((heading) => (
                <th
                  key={heading}
                  className="py-2 pr-4 font-semibold text-slate-600 last:pr-0 dark:text-slate-400"
                >
                  {heading}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {answer.fits.map((fit) => (
              <tr
                key={fit.seed}
                className="border-b border-slate-100 last:border-0 dark:border-slate-800/60"
              >
                <td className="py-2 pr-4 font-mono text-slate-800 dark:text-slate-200">
                  {fit.seed}
                </td>
                <td className="py-2 pr-4 font-mono text-slate-800 dark:text-slate-200">
                  {fit.same_partition_as_first ? "yes" : "no"}
                </td>
                <td className="py-2 pr-4 font-mono text-slate-800 dark:text-slate-200">
                  {fit.identical_to_first ? "yes" : "no"}
                </td>
                <td className="py-2 pr-4 font-mono text-slate-800 dark:text-slate-200">
                  {fit.correlation === null
                    ? "n/a"
                    : fit.correlation.toFixed(4)}
                </td>
                <td className="py-2 pr-4 font-mono text-slate-800 dark:text-slate-200">
                  {fit.quantisation_error.toFixed(4)}
                </td>
                <td className="py-2 font-mono text-slate-800 dark:text-slate-200">
                  {fit.reading_order[0] === 0
                    ? "short to tall"
                    : "tall to short"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {message && (
        <p className="mt-2 text-sm text-amber-600 dark:text-amber-400">
          {message}
        </p>
      )}
    </div>
  );
}

function Panel({
  fit,
  points,
  plot,
  gridWidth,
  gridHeight,
}: {
  fit: SeededMap;
  points: Point[];
  plot: (point: { x: number; y: number }) => { px: number; py: number };
  gridWidth: number;
  gridHeight: number;
}) {
  return (
    <div className="rounded-lg border border-slate-200 p-2 dark:border-slate-800">
      <p className="mb-1 text-xs font-semibold text-slate-800 dark:text-slate-200">
        {`seed ${fit.seed}`}
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
        {fit.units.map((cell, index) => {
          const right =
            cell.column + 1 < gridWidth ? fit.units[index + 1] : null;
          const below =
            cell.row + 1 < gridHeight ? fit.units[index + gridWidth] : null;
          const from = plot(cell);
          return (
            <g key={`j${index}`}>
              {right && (
                <line
                  x1={from.px}
                  y1={from.py}
                  x2={plot(right).px}
                  y2={plot(right).py}
                  className="stroke-slate-500 dark:stroke-slate-400"
                  strokeWidth={2}
                />
              )}
              {below && (
                <line
                  x1={from.px}
                  y1={from.py}
                  x2={plot(below).px}
                  y2={plot(below).py}
                  className="stroke-slate-500 dark:stroke-slate-400"
                  strokeWidth={2}
                />
              )}
            </g>
          );
        })}
        {fit.units.map((cell, index) => {
          const at = plot(cell);
          return (
            <rect
              key={index}
              x={at.px - 5}
              y={at.py - 5}
              width={10}
              height={10}
              fill={cellColour(cell.row, cell.column, gridWidth, gridHeight)}
              stroke="currentColor"
              className="text-slate-800 dark:text-slate-100"
              strokeWidth={1.5}
            />
          );
        })}
      </svg>
    </div>
  );
}
