"use client";

// Which trees are nearest to one tree, asked twice of the same orchard.
//
// The scatter draws all twenty-four trees with girth across and water up, each
// axis scaled to its own column so the picture is the same under both
// readings; what changes is which three trees are ringed. The left reading
// measures the gap in millimetres beside the gap in metres, and the right one
// measures both gaps in the column's own spreads. The table underneath carries
// the three neighbours each reading chose, what share of the squared distance
// the trunk column owned, and the fruit their average predicts against what the
// chosen tree actually bore. The API picks the neighbours and does every sum.

import { useEffect, useState } from "react";
import { ApiError } from "@/lib/api";
import {
  NeighbourAnswer,
  Orchard,
  fetchNeighbours,
  fetchOrchard,
} from "@/lib/concepts/the-standard-score";
import { GIRTH_COLOUR, HIGHLIGHT_COLOUR, WATER_COLOUR } from "./standardScoreFixtures";

const VIEW = { width: 640, height: 250 };
const PAD = { left: 52, right: 16, top: 16, bottom: 34 };

const RING_COLOURS = ["#f43f5e", "#10b981"];

export function OrchardNeighbours({ tree = 16 }: { tree?: number }) {
  const [orchard, setOrchard] = useState<Orchard | null>(null);
  const [answer, setAnswer] = useState<NeighbourAnswer | null>(null);
  const [chosen, setChosen] = useState(tree);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setOrchard(await fetchOrchard());
      } catch (error) {
        setMessage(
          error instanceof ApiError ? error.message : "Something went wrong.",
        );
      }
    })();
  }, []);

  useEffect(() => {
    let current = true;
    (async () => {
      try {
        const next = await fetchNeighbours(chosen, 3);
        if (current) setAnswer(next);
      } catch (error) {
        if (current)
          setMessage(
            error instanceof ApiError ? error.message : "Something went wrong.",
          );
      }
    })();
    return () => {
      current = false;
    };
  }, [chosen]);

  if (!orchard || !answer) {
    return (
      <p className="text-sm text-slate-500 dark:text-slate-400">
        {message ?? "…"}
      </p>
    );
  }

  const innerWidth = VIEW.width - PAD.left - PAD.right;
  const innerHeight = VIEW.height - PAD.top - PAD.bottom;
  const across = (girth: number) =>
    PAD.left +
    ((girth - orchard.girth.smallest) /
      (orchard.girth.largest - orchard.girth.smallest)) *
      innerWidth;
  const up = (water: number) =>
    PAD.top +
    innerHeight -
    ((water - orchard.water.smallest) /
      (orchard.water.largest - orchard.water.smallest)) *
      innerHeight;

  const ringed = answer.readings.map(
    (reading) => new Set(reading.neighbours.map((row) => row.tree)),
  );

  return (
    <div>
      <svg
        viewBox={`0 0 ${VIEW.width} ${VIEW.height}`}
        className="w-full select-none rounded-lg bg-slate-50 dark:bg-slate-950"
      >
        <text
          x={PAD.left}
          y={VIEW.height - 8}
          className="fill-slate-500 text-[10px] dark:fill-slate-400"
        >
          trunk girth, millimetres
        </text>
        <text
          x={12}
          y={PAD.top + innerHeight / 2}
          transform={`rotate(-90 12 ${PAD.top + innerHeight / 2})`}
          textAnchor="middle"
          className="fill-slate-500 text-[10px] dark:fill-slate-400"
        >
          water, metres
        </text>
        {orchard.girth.values.map((girth, index) => {
          const inFirst = ringed[0].has(index);
          const inSecond = ringed[1].has(index);
          return (
            <g key={index}>
              {inFirst && (
                <circle
                  cx={across(girth)}
                  cy={up(orchard.water.values[index])}
                  r={11}
                  fill="none"
                  stroke={RING_COLOURS[0]}
                  strokeWidth={2}
                />
              )}
              {inSecond && (
                <circle
                  cx={across(girth)}
                  cy={up(orchard.water.values[index])}
                  r={15}
                  fill="none"
                  stroke={RING_COLOURS[1]}
                  strokeWidth={2}
                />
              )}
              <circle
                cx={across(girth)}
                cy={up(orchard.water.values[index])}
                r={index === chosen ? 7 : 5}
                fill={index === chosen ? HIGHLIGHT_COLOUR : GIRTH_COLOUR}
                className="cursor-pointer"
                onClick={() => setChosen(index)}
              />
            </g>
          );
        })}
        <g>
          <circle cx={PAD.left + 8} cy={PAD.top + 8} r={6} fill="none" stroke={RING_COLOURS[0]} strokeWidth={2} />
          <text x={PAD.left + 20} y={PAD.top + 12} className="fill-slate-600 text-[10px] dark:fill-slate-300">
            nearest as recorded
          </text>
          <circle cx={PAD.left + 168} cy={PAD.top + 8} r={6} fill="none" stroke={RING_COLOURS[1]} strokeWidth={2} />
          <text x={PAD.left + 180} y={PAD.top + 12} className="fill-slate-600 text-[10px] dark:fill-slate-300">
            nearest in standard scores
          </text>
        </g>
      </svg>

      <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
        Click any tree to ask about it instead. The amber tree bore{" "}
        {answer.borne.toFixed(2)} kg on a trunk of {answer.girth} mm and{" "}
        {answer.water} m of water.
      </p>

      <div className="mt-3 overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left dark:border-slate-800">
              <th className="py-2 pr-4 font-semibold text-slate-600 dark:text-slate-400">
                nearest three, measured
              </th>
              <th className="py-2 pr-4 font-semibold text-slate-600 dark:text-slate-400">
                their water, metres
              </th>
              <th className="py-2 pr-4 font-semibold text-slate-600 dark:text-slate-400">
                trunk&rsquo;s share of the gap
              </th>
              <th className="py-2 pr-4 font-semibold text-slate-600 dark:text-slate-400">
                their average fruit
              </th>
              <th className="py-2 font-semibold text-slate-600 dark:text-slate-400">
                out by
              </th>
            </tr>
          </thead>
          <tbody>
            {answer.readings.map((reading, index) => (
              <tr
                key={reading.reading}
                className="border-b border-slate-100 last:border-0 dark:border-slate-800/60"
              >
                <td className="py-2 pr-4 text-slate-700 dark:text-slate-300">
                  <span
                    className="mr-2 inline-block h-2 w-2 rounded-full"
                    style={{ backgroundColor: RING_COLOURS[index] }}
                  />
                  {reading.reading === "recorded"
                    ? "in millimetres and metres"
                    : "in standard scores"}
                </td>
                <td className="py-2 pr-4 font-mono text-slate-800 dark:text-slate-200">
                  {reading.neighbours.map((row) => row.water.toFixed(2)).join(", ")}
                </td>
                <td className="py-2 pr-4 font-mono text-slate-800 dark:text-slate-200">
                  {reading.neighbours
                    .map((row) => row.girth_share.toFixed(3))
                    .join(", ")}
                </td>
                <td className="py-2 pr-4 font-mono text-slate-800 dark:text-slate-200">
                  {reading.predicted.toFixed(2)} kg
                </td>
                <td className="py-2 font-mono text-slate-800 dark:text-slate-200">
                  {reading.error.toFixed(2)} kg
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-2 text-xs" style={{ color: WATER_COLOUR }}>
        Watch the water column. The recorded reading picks trees of almost the
        same trunk whatever they were given to drink; the standardized reading
        picks trees given almost the same water.
      </p>
    </div>
  );
}
