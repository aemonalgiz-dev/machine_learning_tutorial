"use client";

// What a cell keeps, and what it throws away, on three small patches.
//
// The API draws a small bright square in three places, describes each, and
// measures how far apart the descriptions come out and how far apart the raw
// brightnesses do. The browser draws the three patches with the cell grid over
// them. The first two moves are the same distance in pixels and the same
// distance diagonally; one of them leaves the answer untouched and the other
// changes everything, and the only difference between them is a cell edge.

import { useEffect, useState } from "react";
import { ApiError } from "@/lib/api";
import {
  InsideOneCellView,
  fetchInsideOneCell,
} from "@/lib/concepts/histogram-of-oriented-gradients";
import { PixelPicture, Stat, tiny } from "./orientedGradientsDrawing";

export function InsideOneCell() {
  const [view, setView] = useState<InsideOneCellView | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let live = true;
    fetchInsideOneCell()
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

  return (
    <div>
      <div className="grid gap-3 sm:grid-cols-3">
        <PixelPicture
          pixels={view.here}
          cellSide={view.cell_side}
          title="where the square starts"
        />
        <PixelPicture
          pixels={view.moved_inside}
          cellSide={view.cell_side}
          title="moved, staying in its cell"
        />
        <PixelPicture
          pixels={view.moved_across}
          cellSide={view.cell_side}
          title="moved into the next cell"
        />
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Stat
          label="brightnesses apart, staying in"
          value={view.pixels_moved_inside.toFixed(4)}
        />
        <Stat
          label="answers apart, staying in"
          value={tiny(view.description_moved_inside)}
        />
        <Stat
          label="brightnesses apart, moving out"
          value={view.pixels_moved_across.toFixed(4)}
        />
        <Stat
          label="answers apart, moving out"
          value={view.description_moved_across.toFixed(4)}
        />
      </div>

      <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
        Both moves change the brightnesses by exactly the same amount. The one
        that stays inside its cell leaves the answer at a distance of{" "}
        {tiny(view.description_moved_inside)} from where it was, and the one
        that crosses a cell edge takes it{" "}
        {view.description_moved_across.toFixed(4)} away, out of an answer whose
        own length is {view.description_length.toFixed(0)}.
      </p>
    </div>
  );
}
