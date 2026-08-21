"use client";

// Every pair of cells twice over, once measured on the grid and once measured
// among the people, which is where the arrangement claim is either true or is
// not.
//
// Each dot is one pair of cells. Its position across says how many steps apart
// they sit on the grid, which the fit never changed, and its position up says
// how far apart they came to rest in height and weight, which is all the fit
// produced. If the map arranged itself, the dots climb together, and the one
// number under the chart is how tightly. Switching the reach away leaves a
// cloud with no shape, which is the control, and the same reading at the same
// grid distance spread over a wide band is the honest qualification: cells that
// are neighbours hold similar people, and the distance between two cells on the
// grid is still not the distance between the people they hold. Hover a dot for
// which two cells it is. The API fits both maps and pairs up both distances;
// the browser draws them.

import { useEffect, useState } from "react";
import { ApiError, Point } from "@/lib/api";
import {
  CellPair,
  MapReport,
  WithAndWithoutReach,
  fitWithAndWithoutReach,
} from "@/lib/concepts/self-organising-map";
import { CROWD, EPOCHS, STAT_CLASS } from "./selfOrganisingMapFixtures";

const VIEW = { width: 640, height: 300 };
const PAD = { left: 58, right: 20, top: 18, bottom: 40 };

const WITH_REACH = "#4f46e5";
const WITHOUT_REACH = "#f43f5e";

export function GridDistanceAgainstDataDistance({
  points = CROWD,
  gridWidth = 4,
  gridHeight = 1,
  showControl = true,
}: {
  points?: Point[];
  gridWidth?: number;
  gridHeight?: number;
  showControl?: boolean;
}) {
  const [answer, setAnswer] = useState<WithAndWithoutReach | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [hovered, setHovered] = useState<CellPair | null>(null);

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

  const shown: { report: MapReport; colour: string; label: string }[] = [
    { report: answer.organised, colour: WITH_REACH, label: "with the reach" },
  ];
  if (showControl) {
    shown.push({
      report: answer.without_neighbourhood,
      colour: WITHOUT_REACH,
      label: "with the reach taken away",
    });
  }

  const everyPair = shown.flatMap((each) => each.report.pairs);
  const widestGrid = Math.max(...everyPair.map((pair) => pair.grid_distance));
  const widestData = Math.max(...everyPair.map((pair) => pair.weight_distance));
  const innerWidth = VIEW.width - PAD.left - PAD.right;
  const innerHeight = VIEW.height - PAD.top - PAD.bottom;
  const across = (value: number) =>
    PAD.left + (value / (widestGrid * 1.08)) * innerWidth;
  const up = (value: number) =>
    PAD.top + (1 - value / (widestData * 1.08)) * innerHeight;

  return (
    <div>
      <svg
        viewBox={`0 0 ${VIEW.width} ${VIEW.height}`}
        className="w-full select-none rounded-lg bg-slate-50 dark:bg-slate-950"
      >
        <line
          x1={PAD.left}
          y1={VIEW.height - PAD.bottom}
          x2={VIEW.width - PAD.right}
          y2={VIEW.height - PAD.bottom}
          className="stroke-slate-300 dark:stroke-slate-700"
          strokeWidth={1}
        />
        <line
          x1={PAD.left}
          y1={PAD.top}
          x2={PAD.left}
          y2={VIEW.height - PAD.bottom}
          className="stroke-slate-300 dark:stroke-slate-700"
          strokeWidth={1}
        />
        {shown.map((each) =>
          each.report.pairs.map((pair, index) => (
            <circle
              key={`${each.label}${index}`}
              cx={across(pair.grid_distance)}
              cy={up(pair.weight_distance)}
              r={hovered === pair ? 7 : 5}
              fill={each.colour}
              opacity={0.75}
              className="cursor-pointer"
              onMouseEnter={() => setHovered(pair)}
              onMouseLeave={() => setHovered(null)}
            />
          )),
        )}
        {shown.map((each, index) => (
          <text
            key={each.label}
            x={VIEW.width - PAD.right}
            y={PAD.top + 14 + index * 16}
            textAnchor="end"
            className="text-[11px] font-semibold"
            fill={each.colour}
          >
            {each.label}
          </text>
        ))}
        <text
          x={PAD.left + innerWidth / 2}
          y={VIEW.height - 8}
          textAnchor="middle"
          className="fill-slate-500 text-xs dark:fill-slate-400"
        >
          steps apart on the grid
        </text>
        <text
          x={16}
          y={PAD.top + innerHeight / 2}
          textAnchor="middle"
          transform={`rotate(-90 16 ${PAD.top + innerHeight / 2})`}
          className="fill-slate-500 text-xs dark:fill-slate-400"
        >
          apart in height and weight
        </text>
        <text
          x={PAD.left - 6}
          y={VIEW.height - PAD.bottom + 4}
          textAnchor="end"
          className="fill-slate-500 text-[10px] dark:fill-slate-400"
        >
          0
        </text>
        <text
          x={PAD.left - 6}
          y={PAD.top + 10}
          textAnchor="end"
          className="fill-slate-500 text-[10px] dark:fill-slate-400"
        >
          {(widestData * 1.08).toFixed(0)}
        </text>
      </svg>

      <p className="mt-2 h-5 text-xs text-slate-600 dark:text-slate-400">
        {hovered
          ? `cell (${hovered.first_row}, ${hovered.first_column}) and cell (${hovered.second_row}, ${hovered.second_column}): ${hovered.grid_distance.toFixed(3)} steps apart on the grid, ${hovered.weight_distance.toFixed(3)} apart in height and weight`
          : "Hover a dot for the two cells it pairs."}
      </p>

      <div className="mt-2 grid grid-cols-2 gap-3">
        <Stat
          label="arranges, with the reach"
          value={
            answer.organised.correlation === null
              ? "n/a"
              : answer.organised.correlation.toFixed(4)
          }
        />
        <Stat
          label="arranges, with it taken away"
          value={
            answer.without_neighbourhood.correlation === null
              ? "n/a"
              : answer.without_neighbourhood.correlation.toFixed(4)
          }
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
