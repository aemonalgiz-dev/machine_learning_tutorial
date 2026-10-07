"use client";

// Each corner of the bar given a direction, two ways, with the arithmetic shown.
//
// The disc of brightness around the chosen corner is drawn with the direction
// each rule reads off it: an arrow from the corner to the centre of
// brightness, and the histogram of gradient directions with its fullest bin
// marked. The two rules read different things and here they agree about where
// the bright side is to within a bin, which is the point of showing both.

import { useEffect, useState } from "react";
import { ApiError } from "@/lib/api";
import { orientation, type Orientation } from "@/lib/concepts/image-alignment";
import { ACTIVE_BUTTON, BUTTON, Caption, Stat, greyShade } from "./keypointDrawing";
import { ARROW, degrees } from "./alignmentDrawing";

const CELL = 18;

export function OrientationBoard() {
  const [report, setReport] = useState<Orientation | null>(null);
  const [chosen, setChosen] = useState(0);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    orientation()
      .then(setReport)
      .catch((error: unknown) => {
        if (error instanceof ApiError) setMessage(error.message);
      });
  }, []);

  if (message) return <p className="text-sm text-rose-700 dark:text-rose-300">{message}</p>;
  if (!report) return <p className="text-sm text-slate-500">Reading the discs.</p>;

  const corner = report.corners[chosen];
  const side = corner.patch.length;
  const shade = greyShade(0, 1);
  const centre = (side / 2) * CELL;
  const radians = (corner.centroid_angle_degrees * Math.PI) / 180;
  const reach = report.radius * CELL * 0.9;
  const tallest = Math.max(...corner.votes, 1e-9);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {report.corners.map((entry, index) => (
          <button
            key={`${entry.row},${entry.column}`}
            type="button"
            onClick={() => setChosen(index)}
            className={index === chosen ? ACTIVE_BUTTON : BUTTON}
          >
            ({entry.row}, {entry.column})
          </button>
        ))}
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <svg viewBox={`0 0 ${side * CELL} ${side * CELL}`} className="w-full select-none rounded-md bg-slate-100 dark:bg-slate-900">
            {corner.patch.map((row, rowIndex) =>
              row.map((value, columnIndex) => {
                const inside =
                  (rowIndex - report.radius) ** 2 + (columnIndex - report.radius) ** 2 <= report.radius ** 2;
                return (
                  <rect
                    key={`${rowIndex},${columnIndex}`}
                    x={columnIndex * CELL}
                    y={rowIndex * CELL}
                    width={CELL}
                    height={CELL}
                    fill={shade(value).fill}
                    fillOpacity={inside ? 1 : 0.25}
                    shapeRendering="crispEdges"
                  />
                );
              }),
            )}
            <circle cx={centre} cy={centre} r={report.radius * CELL + CELL / 2} fill="none" stroke="#6366f1" strokeWidth={1.5} strokeDasharray="4 3" />
            <line
              x1={centre}
              y1={centre}
              x2={centre + Math.cos(radians) * reach}
              y2={centre + Math.sin(radians) * reach}
              stroke={ARROW}
              strokeWidth={3}
            />
            <circle cx={centre} cy={centre} r={4} fill={ARROW} />
          </svg>
          <Caption>
            The disc of radius {report.radius} around the corner, and the arrow to its centre of
            brightness.
          </Caption>
        </div>
        <div>
          <svg viewBox={`0 0 ${report.bins * 6} 110`} className="w-full select-none rounded-md bg-slate-100 dark:bg-slate-900">
            {corner.votes.map((vote, index) => (
              <rect
                key={index}
                x={index * 6 + 0.5}
                y={100 - (vote / tallest) * 95}
                width={5}
                height={(vote / tallest) * 95}
                fill={index === corner.fullest_bin ? ARROW : "#6366f1"}
                fillOpacity={index === corner.fullest_bin ? 1 : 0.6}
              />
            ))}
            <text x={0} y={108} className="fill-slate-500 text-[7px]">-180°</text>
            <text x={report.bins * 3} y={108} textAnchor="middle" className="fill-slate-500 text-[7px]">0°</text>
            <text x={report.bins * 6} y={108} textAnchor="end" className="fill-slate-500 text-[7px]">180°</text>
          </svg>
          <Caption>
            Which way the brightness rises in the disc, in {report.bins} bins of ten degrees,
            weighted by how sharply. The fullest bin is in amber.
          </Caption>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Stat label="Moment, rightward" value={corner.moment_right.toFixed(2)} />
        <Stat label="Moment, downward" value={corner.moment_down.toFixed(2)} />
        <Stat label="Centroid direction" value={degrees(corner.centroid_angle_degrees)} />
        <Stat label="Gradient direction" value={degrees(corner.gradient_angle_degrees)} />
      </div>
    </div>
  );
}
