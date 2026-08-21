"use client";

// A tree's rectangles beside a logistic line, on the same crowd.
//
// Both models are fitted to the same people and drawn on the same axes. The
// logistic boundary is one straight line at whatever angle the data asks
// for. The tree's boundary is vertical and horizontal cuts, which draw a
// staircase where a slanted line would do. Switch the crowd to see the
// staircase grow more steps as the true boundary tilts. Both fits and both
// maps are the API's.

import { useEffect, useState } from "react";
import { ApiError, LabelledPoint, VersusLogistic, compareTreeWithLogistic } from "@/lib/api";
import { CLEAN_CROWD } from "./SplitInspector";
import { MUDDLED_CROWD } from "./TreeGrowthPlayground";

const CHILD = "#f59e0b";
const ADULT = "#6366f1";
const MAP = { width: 300, height: 260 };
const PAD = 24;

// A crowd whose classes are split by a slanted line, so the tree has to
// build a staircase where the logistic model draws one cut.
const SLANTED_CROWD: LabelledPoint[] = [
  { x: 120, y: 60, label: 0 }, { x: 130, y: 70, label: 0 }, { x: 140, y: 78, label: 0 }, { x: 150, y: 86, label: 0 },
  { x: 125, y: 50, label: 0 }, { x: 135, y: 58, label: 0 }, { x: 145, y: 66, label: 0 }, { x: 155, y: 74, label: 0 },
  { x: 160, y: 84, label: 0 }, { x: 118, y: 42, label: 0 }, { x: 128, y: 38, label: 0 }, { x: 138, y: 46, label: 0 },
  { x: 140, y: 30, label: 1 }, { x: 150, y: 40, label: 1 }, { x: 160, y: 48, label: 1 }, { x: 170, y: 56, label: 1 },
  { x: 180, y: 64, label: 1 }, { x: 155, y: 30, label: 1 }, { x: 165, y: 38, label: 1 }, { x: 175, y: 46, label: 1 },
  { x: 185, y: 54, label: 1 }, { x: 148, y: 24, label: 1 }, { x: 170, y: 72, label: 1 }, { x: 182, y: 80, label: 1 },
];

const CROWDS = [
  { key: "clean", label: "the clean crowd", points: CLEAN_CROWD },
  { key: "slanted", label: "a slanted boundary", points: SLANTED_CROWD },
  { key: "muddled", label: "the muddled crowd", points: MUDDLED_CROWD },
];

export function BoundaryComparison() {
  const [crowd, setCrowd] = useState("slanted");
  const [answer, setAnswer] = useState<VersusLogistic | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const points = CROWDS.find((each) => each.key === crowd)!.points;

  useEffect(() => {
    (async () => {
      try {
        setAnswer(await compareTreeWithLogistic(points, 6));
        setMessage(null);
      } catch (error) {
        if (error instanceof ApiError) setMessage(error.message);
        else setMessage("Something went wrong.");
      }
    })();
  }, [points]);

  const drawMap = (regions: VersusLogistic["tree_regions"], title: string, accuracy: number) => {
    const cell = (MAP.width - 2 * PAD) / regions.cells;
    const mapX = (column: number) => PAD + column * cell;
    const mapY = (row: number) => MAP.height - PAD - (row + 1) * cell;
    const personX = (x: number) => mapX(((x - regions.x_min) / (regions.x_max - regions.x_min)) * (regions.cells - 1)) + cell / 2;
    const personY = (y: number) => mapY(((y - regions.y_min) / (regions.y_max - regions.y_min)) * (regions.cells - 1)) + cell / 2;
    return (
      <div>
        <p className="mb-1 text-sm font-medium text-slate-700 dark:text-slate-200">{title}</p>
        <svg viewBox={`0 0 ${MAP.width} ${MAP.height}`} className="w-full select-none rounded-lg bg-slate-50 dark:bg-slate-950">
          {regions.labels.map((row, rowIndex) =>
            row.map((label, columnIndex) => (
              <rect key={`${rowIndex}-${columnIndex}`} x={mapX(columnIndex)} y={mapY(rowIndex)} width={cell + 0.5} height={cell + 0.5} fill={label === 0 ? CHILD : ADULT} opacity={0.2} />
            )),
          )}
          {points.map((person, index) => (
            <circle key={index} cx={personX(person.x)} cy={personY(person.y)} r={3.5} fill={person.label === 0 ? CHILD : ADULT} stroke="white" strokeWidth={1} />
          ))}
          <text x={MAP.width / 2} y={MAP.height - 6} textAnchor="middle" className="fill-slate-500 text-[10px] dark:fill-slate-400">training accuracy {accuracy.toFixed(3)}</text>
        </svg>
      </div>
    );
  };

  return (
    <div>
      <div className="flex flex-wrap gap-1 pb-3">
        {CROWDS.map((each) => (
          <button key={each.key} onClick={() => setCrowd(each.key)} className={`rounded-md border px-3 py-1 text-sm font-medium transition ${crowd === each.key ? "border-indigo-500 bg-indigo-50 text-indigo-700 dark:border-indigo-400 dark:bg-indigo-950/40 dark:text-indigo-200" : "border-slate-300 bg-white text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"}`}>
            {each.label}
          </button>
        ))}
      </div>
      {answer ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {drawMap(answer.logistic_regions, "Logistic regression, one line at any angle", answer.logistic_accuracy)}
          {drawMap(answer.tree_regions, `A tree, ${answer.tree_leaves} rectangles`, answer.tree_accuracy)}
        </div>
      ) : (
        <p className="text-sm text-slate-500">{message ?? "…"}</p>
      )}
      {message && answer && (
        <p className="mt-3 text-sm text-amber-600 dark:text-amber-400">{message}</p>
      )}
    </div>
  );
}
