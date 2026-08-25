"use client";

// The whole method on one screen, on the scene the page works on throughout.
//
// The API divides the picture into cells, counts every pixel's edge direction
// into its own cell's buckets and finishes the answer; the browser draws the
// picture with the cell grid over it and, beside it, one star of strokes per
// cell. Click a cell to see the numbers its star was drawn from. The controls
// are the three stages' settings, so a reader can watch the grid coarsen, the
// buckets narrow, and a direction and its reverse come apart.

import { useEffect, useState } from "react";
import { ApiError } from "@/lib/api";
import {
  AngleRangeName,
  DescribeView,
  PictureName,
  VoteSharingName,
  describePatch,
} from "@/lib/concepts/histogram-of-oriented-gradients";
import {
  BucketBars,
  CellStarGrid,
  PixelPicture,
  Stat,
  tiny,
} from "./orientedGradientsDrawing";

const SCENES: { name: PictureName; short: string }[] = [
  { name: "scene", short: "as it is" },
  { name: "scene_relit", short: "relit" },
  { name: "scene_turned", short: "turned" },
  { name: "scene_inverted", short: "inside out" },
];

const CELL_SIDES = [4, 6, 8, 12, 16];
const BUCKET_COUNTS = [4, 6, 9, 12, 18];

export function OrientedGradientPlayground() {
  const [picture, setPicture] = useState<PictureName>("scene");
  const [cellSide, setCellSide] = useState(8);
  const [nBuckets, setNBuckets] = useState(9);
  const [angleRange, setAngleRange] = useState<AngleRangeName>("unsigned");
  const [voteSharing, setVoteSharing] = useState<VoteSharingName>(
    "split_between_neighbours",
  );
  const [selected, setSelected] = useState({ row: 1, column: 0 });
  const [view, setView] = useState<DescribeView | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let live = true;
    (async () => {
      try {
        const answer = await describePatch({
          picture,
          cell_side: cellSide,
          n_buckets: nBuckets,
          angle_range: angleRange,
          vote_sharing: voteSharing,
        });
        if (!live) return;
        setView(answer);
        setMessage(null);
      } catch (error) {
        if (!live) return;
        setView(null);
        setMessage(
          error instanceof ApiError ? error.message : "Something went wrong.",
        );
      }
    })();
    return () => {
      live = false;
    };
  }, [picture, cellSide, nBuckets, angleRange, voteSharing]);

  const controls = (
    <div className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <span className="flex flex-wrap gap-1 rounded-md border border-slate-300 p-0.5 dark:border-slate-700">
          {SCENES.map((choice) => (
            <button
              key={choice.name}
              onClick={() => setPicture(choice.name)}
              className={
                "rounded px-2 py-0.5 text-xs font-medium transition " +
                (picture === choice.name
                  ? "bg-indigo-600 text-white"
                  : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800")
              }
            >
              {choice.short}
            </button>
          ))}
        </span>
        <label className="flex items-center gap-2">
          pixels to a cell
          <select
            value={cellSide}
            onChange={(event) => {
              setCellSide(Number(event.target.value));
              setSelected({ row: 0, column: 0 });
            }}
            className="rounded border border-slate-300 bg-white px-1.5 py-0.5 text-xs dark:border-slate-700 dark:bg-slate-900"
          >
            {CELL_SIDES.map((side) => (
              <option key={side} value={side}>
                {side}
              </option>
            ))}
          </select>
        </label>
        <label className="flex items-center gap-2">
          buckets
          <select
            value={nBuckets}
            onChange={(event) => setNBuckets(Number(event.target.value))}
            className="rounded border border-slate-300 bg-white px-1.5 py-0.5 text-xs dark:border-slate-700 dark:bg-slate-900"
          >
            {BUCKET_COUNTS.map((count) => (
              <option key={count} value={count}>
                {count}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <span className="flex flex-wrap gap-1 rounded-md border border-slate-300 p-0.5 dark:border-slate-700">
          {(
            [
              ["unsigned", "half a circle"],
              ["signed", "the whole circle"],
            ] as [AngleRangeName, string][]
          ).map(([name, label]) => (
            <button
              key={name}
              onClick={() => setAngleRange(name)}
              className={
                "rounded px-2 py-0.5 text-xs font-medium transition " +
                (angleRange === name
                  ? "bg-indigo-600 text-white"
                  : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800")
              }
            >
              {label}
            </button>
          ))}
        </span>
        <span className="flex flex-wrap gap-1 rounded-md border border-slate-300 p-0.5 dark:border-slate-700">
          {(
            [
              ["split_between_neighbours", "share each vote"],
              ["whole_to_nearest", "whole votes"],
            ] as [VoteSharingName, string][]
          ).map(([name, label]) => (
            <button
              key={name}
              onClick={() => setVoteSharing(name)}
              className={
                "rounded px-2 py-0.5 text-xs font-medium transition " +
                (voteSharing === name
                  ? "bg-indigo-600 text-white"
                  : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800")
              }
            >
              {label}
            </button>
          ))}
        </span>
      </div>
    </div>
  );

  if (!view) {
    return (
      <div>
        {controls}
        <p className="mt-3 text-sm text-amber-600 dark:text-amber-400">
          {message ?? "…"}
        </p>
      </div>
    );
  }

  const row = Math.min(selected.row, view.n_cell_rows - 1);
  const column = Math.min(selected.column, view.n_cell_columns - 1);
  const cell = view.cells[row][column];
  const weight = cell.reduce((total, value) => total + value, 0);
  const fullest = view.fullest_bucket[row][column];
  const fullestShare = weight === 0 ? 0 : cell[fullest] / weight;

  return (
    <div>
      {controls}

      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <PixelPicture
          pixels={view.pixels}
          cellSide={view.cell_side}
          title="the picture, with the cell grid over it"
          highlight={{ row, column }}
        />
        <div>
          <p className="mb-1 text-[11px] text-slate-500 dark:text-slate-400">
            one star of strokes per cell, click one to read it
          </p>
          <CellStarGrid
            cells={view.cells}
            bucketCentreDegrees={view.bucket_centre_degrees}
            signed={view.signed}
            selected={{ row, column }}
            onSelect={setSelected}
          />
        </div>
      </div>

      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-950">
          <p className="mb-1 text-[11px] text-slate-500 dark:text-slate-400">
            the cell at row {row}, column {column}, bucket by bucket, labelled
            by the direction each bucket is centred on
          </p>
          <BucketBars
            weights={cell}
            bucketCentreDegrees={view.bucket_centre_degrees}
            labelEvery={view.n_buckets > 12 ? 2 : 1}
          />
        </div>
        <div className="grid grid-cols-2 gap-2 self-start">
          <Stat
            label="cells"
            value={`${view.n_cell_rows} by ${view.n_cell_columns}`}
          />
          <Stat label="numbers in the answer" value={`${view.n_values}`} />
          <Stat
            label="weight in this cell"
            value={weight.toFixed(2)}
          />
          <Stat
            label="its fullest bucket"
            value={`${Math.round(view.bucket_centre_degrees[fullest])}°, ${(
              fullestShare * 100
            ).toFixed(0)}%`}
          />
          <Stat
            label="one bucket covers"
            value={`${view.bucket_span_degrees.toFixed(0)}°`}
          />
          <Stat
            label="distance from the upright scene"
            value={
              view.distance_from_the_scene === null
                ? "not compared"
                : tiny(view.distance_from_the_scene)
            }
          />
        </div>
      </div>

      <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
        {view.picture_description} Every stroke is drawn along the edge itself,
        which is a quarter circle round from the direction the brightness
        rises. Over half a circle a stroke runs both ways from the middle of
        its cell, since a direction and its reverse are one thing there; over
        the whole circle it runs one way only.
      </p>
    </div>
  );
}
