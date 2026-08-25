"use client";

// Two pictures, their keypoints, and every match drawn as a line between them.
//
// Both pictures are painted into one drawing so the lines can cross the gap. A
// green line is a match the ratio test kept and a red one a match it refused,
// and the table underneath is why: the distance to the winner, the distance to
// the runner-up, and the ratio of the two. The three arrangements are a genuine
// repeat of one scene, the same scene holding two identical squares, and that
// second one with a faint ripple over it so the two equally good answers stop
// being exactly equal. The API detects, describes, matches and applies the
// threshold; the browser draws the lines.

import { useEffect, useState } from "react";
import { ApiError } from "@/lib/api";
import {
  MatchScene,
  Matching,
  fetchMatching,
} from "@/lib/concepts/keypoints-and-descriptors";
import {
  ACTIVE_BUTTON,
  AGREES,
  BUTTON,
  Caption,
  MARK,
  greyShade,
} from "./keypointDrawing";

const CELL = 7;
const GAP = 40;

function Board({
  scene,
  selected,
  onSelect,
}: {
  scene: MatchScene;
  selected: number | null;
  onSelect: (index: number | null) => void;
}) {
  const shade = greyShade(0, 1);
  const width = scene.width * CELL;
  const height = scene.height * CELL;
  const offset = width + GAP;
  const centre = (index: number) => (index + 0.5) * CELL;

  const painted = (rows: number[][], shiftX: number) =>
    rows.map((row, rowIndex) =>
      row.map((value, columnIndex) => (
        <rect
          key={`${shiftX},${rowIndex},${columnIndex}`}
          x={shiftX + columnIndex * CELL}
          y={rowIndex * CELL}
          width={CELL}
          height={CELL}
          fill={shade(value).fill}
        />
      )),
    );

  return (
    <svg
      viewBox={`0 0 ${2 * width + GAP} ${height + 4}`}
      className="w-full select-none"
      shapeRendering="crispEdges"
    >
      {painted(scene.first_picture, 0)}
      {painted(scene.second_picture, offset)}
      {scene.matches.map((match, index) => {
        const dimmed = selected !== null && selected !== index;
        return (
          <g
            key={index}
            onMouseEnter={() => onSelect(index)}
            onMouseLeave={() => onSelect(null)}
            className="cursor-pointer"
          >
            <line
              x1={centre(match.from_column)}
              y1={centre(match.from_row)}
              x2={offset + centre(match.to_column)}
              y2={centre(match.to_row)}
              stroke={match.kept ? AGREES : MARK}
              strokeWidth={selected === index ? 3 : 1.8}
              strokeOpacity={dimmed ? 0.25 : 0.95}
              shapeRendering="geometricPrecision"
            />
            <circle
              cx={centre(match.from_column)}
              cy={centre(match.from_row)}
              r={4}
              fill="none"
              stroke={match.kept ? AGREES : MARK}
              strokeWidth={2}
              strokeOpacity={dimmed ? 0.3 : 1}
              shapeRendering="geometricPrecision"
            />
            <circle
              cx={offset + centre(match.to_column)}
              cy={centre(match.to_row)}
              r={4}
              fill="none"
              stroke={match.kept ? AGREES : MARK}
              strokeWidth={2}
              strokeOpacity={dimmed ? 0.3 : 1}
              shapeRendering="geometricPrecision"
            />
          </g>
        );
      })}
    </svg>
  );
}

export function MatchBoard() {
  const [report, setReport] = useState<Matching | null>(null);
  const [chosen, setChosen] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setReport(await fetchMatching());
      } catch (error) {
        if (error instanceof ApiError) setMessage(error.message);
        else setMessage("Something went wrong.");
      }
    })();
  }, []);

  if (!report) {
    return (
      <p className="text-sm text-slate-500 dark:text-slate-400">
        {message ?? "…"}
      </p>
    );
  }

  const scene = report.scenes[chosen];

  return (
    <div>
      <div className="flex flex-wrap gap-1">
        {report.scenes.map((choice, index) => (
          <button
            key={choice.name}
            onClick={() => {
              setChosen(index);
              setSelected(null);
            }}
            className={chosen === index ? ACTIVE_BUTTON : BUTTON}
          >
            {choice.name}
          </button>
        ))}
      </div>

      <div className="mt-3 rounded-md bg-slate-100 p-3 dark:bg-slate-900">
        <Board scene={scene} selected={selected} onSelect={setSelected} />
      </div>
      <Caption>
        {scene.label}. Green lines are matches kept at a ratio of{" "}
        {report.maximum_ratio}, red lines are matches refused.
      </Caption>

      <div className="mt-3 overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left dark:border-slate-800">
              {["from", "to", "winner", "runner-up", "ratio", "kept"].map(
                (heading) => (
                  <th
                    key={heading}
                    className="py-1.5 pr-4 text-xs font-semibold text-slate-600 last:pr-0 dark:text-slate-400"
                  >
                    {heading}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody>
            {scene.matches.map((match, index) => (
              <tr
                key={index}
                onMouseEnter={() => setSelected(index)}
                onMouseLeave={() => setSelected(null)}
                className={
                  "border-b border-slate-100 last:border-0 dark:border-slate-800/60 " +
                  (selected === index ? "bg-slate-100 dark:bg-slate-800" : "")
                }
              >
                <td className="py-1.5 pr-4 font-mono text-xs text-slate-800 dark:text-slate-200">
                  {match.from_row}, {match.from_column}
                </td>
                <td className="py-1.5 pr-4 font-mono text-xs text-slate-800 dark:text-slate-200">
                  {match.to_row}, {match.to_column}
                </td>
                <td className="py-1.5 pr-4 font-mono text-xs text-slate-800 dark:text-slate-200">
                  {match.distance.toFixed(6)}
                </td>
                <td className="py-1.5 pr-4 font-mono text-xs text-slate-800 dark:text-slate-200">
                  {match.runner_up_distance.toFixed(6)}
                </td>
                <td className="py-1.5 pr-4 font-mono text-xs text-slate-800 dark:text-slate-200">
                  {match.ratio.toFixed(6)}
                </td>
                <td
                  className="py-1.5 pr-4 text-xs font-medium"
                  style={{ color: match.kept ? AGREES : MARK }}
                >
                  {match.kept ? "kept" : "refused"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
        {scene.n_kept} of {scene.matches.length} kept.
      </p>
    </div>
  );
}
