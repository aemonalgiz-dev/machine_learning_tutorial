"use client";

// The six by six patch taken all the way through, small enough to check.
//
// The API sweeps the patch, counts every pixel's vote into one of four cells
// and finishes the answer; the browser draws the patch with its gradient
// arrows, the four cells' stars, and the thirty-six numbers that come out. The
// whole point of the size is that a reader can add the numbers up themselves.

import { useEffect, useState } from "react";
import { ApiError } from "@/lib/api";
import {
  HandWorkedView,
  fetchHandWorked,
} from "@/lib/concepts/histogram-of-oriented-gradients";
import {
  BucketBars,
  CellStarGrid,
  Stat,
  greyScale,
} from "./orientedGradientsDrawing";

export function EdgeToBucket({
  initialSharing = "whole",
}: {
  initialSharing?: "whole" | "shared";
}) {
  const [sharing, setSharing] = useState<"whole" | "shared">(initialSharing);
  const [view, setView] = useState<HandWorkedView | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let live = true;
    fetchHandWorked()
      .then((answer) => live && setView(answer))
      .catch((error) => {
        if (!live) return;
        setMessage(
          error instanceof ApiError ? error.message : "Something went wrong.",
        );
      });
    return () => {
      live = false;
    };
  }, []);

  if (!view) {
    return (
      <p className="text-sm text-amber-600 dark:text-amber-400">
        {message ?? "…"}
      </p>
    );
  }

  const counted = sharing === "whole" ? view.cells_whole_vote : view.cells;
  const grey = greyScale(view.pixels);
  const side = view.pixels.length;
  const arrows = view.readings.filter((reading) => reading.magnitude > 0);
  const longest = Math.max(...arrows.map((reading) => reading.magnitude), 1);

  return (
    <div>
      <span className="mb-3 flex w-fit flex-wrap gap-1 rounded-md border border-slate-300 p-0.5 dark:border-slate-700">
        {(
          [
            ["whole", "the whole vote to one bucket"],
            ["shared", "the vote shared between two"],
          ] as ["whole" | "shared", string][]
        ).map(([name, label]) => (
          <button
            key={name}
            onClick={() => setSharing(name)}
            className={
              "rounded px-2 py-0.5 text-xs font-medium transition " +
              (sharing === name
                ? "bg-indigo-600 text-white"
                : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800")
            }
          >
            {label}
          </button>
        ))}
      </span>

      <div className="grid gap-3 sm:grid-cols-3">
        <div>
          <p className="mb-1 text-[11px] text-slate-500 dark:text-slate-400">
            the patch, and where the brightness is rising
          </p>
          <svg
            viewBox={`0 0 ${side} ${side}`}
            className="w-full rounded border border-slate-200 dark:border-slate-800"
          >
            {view.pixels.map((row, down) =>
              row.map((brightness, across) => (
                <rect
                  key={`${down}-${across}`}
                  x={across}
                  y={down}
                  width={1}
                  height={1}
                  fill={grey(brightness)}
                  shapeRendering="crispEdges"
                />
              )),
            )}
            {[3].map((line) => (
              <g key={`grid-${line}`}>
                <line
                  x1={line}
                  y1={0}
                  x2={line}
                  y2={side}
                  className="stroke-amber-400"
                  strokeWidth={0.08}
                />
                <line
                  x1={0}
                  y1={line}
                  x2={side}
                  y2={line}
                  className="stroke-amber-400"
                  strokeWidth={0.08}
                />
              </g>
            ))}
            {arrows.map((reading) => {
              const reach = 0.42 * (reading.magnitude / longest);
              const angle = (reading.direction_degrees * Math.PI) / 180;
              const centreX = reading.column + 0.5;
              const centreY = reading.row + 0.5;
              return (
                <line
                  key={`arrow-${reading.row}-${reading.column}`}
                  x1={centreX - Math.cos(angle) * reach}
                  y1={centreY - Math.sin(angle) * reach}
                  x2={centreX + Math.cos(angle) * reach}
                  y2={centreY + Math.sin(angle) * reach}
                  className="stroke-rose-500"
                  strokeWidth={0.14}
                  strokeLinecap="round"
                />
              );
            })}
          </svg>
        </div>
        <div>
          <p className="mb-1 text-[11px] text-slate-500 dark:text-slate-400">
            four cells, four identical stars
          </p>
          <CellStarGrid
            cells={counted}
            bucketCentreDegrees={view.bucket_centre_degrees}
            signed={false}
          />
        </div>
        <div className="rounded-lg bg-slate-50 p-2 dark:bg-slate-950">
          <p className="mb-1 text-[11px] text-slate-500 dark:text-slate-400">
            any one of the four cells, bucket by bucket
          </p>
          <BucketBars
            weights={counted[0][0]}
            bucketCentreDegrees={view.bucket_centre_degrees}
          />
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Stat label="weight in all" value={view.total_weight.toFixed(0)} />
        <Stat label="weight per cell" value={view.weight_per_cell.toFixed(0)} />
        <Stat label="numbers in the answer" value={`${view.n_values}`} />
        <Stat
          label="buckets holding anything"
          value={`${counted[0][0].filter((weight) => weight > 0).length} of 9`}
        />
      </div>

      <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
        Each red mark shows which way the brightness is rising at that pixel,
        which is straight across the edge. The two columns beside the edge
        answer {arrows[0].magnitude.toFixed(0)} and every other pixel answers
        nothing, so each three by three cell collects{" "}
        {view.weight_per_cell.toFixed(0)} of weight and the four cells collect{" "}
        {view.total_weight.toFixed(0)} between them.
      </p>
    </div>
  );
}
