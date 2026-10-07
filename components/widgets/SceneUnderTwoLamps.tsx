"use client";
import { Equation } from "@/components/concept/Equation";


// The scene, the same scene under a different lamp, and what each reading of
// it says about the difference.
//
// The API sends both pictures and measures three things: how far apart the
// lists of brightnesses are, how far apart the finished descriptions are, and
// how far any edge direction turned between the two. The browser draws the
// pictures and the readouts. Every pixel changed and no direction moved, which
// is the whole argument for describing a patch by its edges.

import { useEffect, useState } from "react";
import { ApiError } from "@/lib/api";
import {
  DescribeView,
  LightingView,
  describePatch,
  fetchLighting,
} from "@/lib/concepts/histogram-of-oriented-gradients";
import { PixelPicture, Stat, tiny } from "./orientedGradientsDrawing";

export function SceneUnderTwoLamps() {
  const [here, setHere] = useState<DescribeView | null>(null);
  const [there, setThere] = useState<DescribeView | null>(null);
  const [lighting, setLighting] = useState<LightingView | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let live = true;
    (async () => {
      try {
        const [first, second, measured] = await Promise.all([
          describePatch({ picture: "scene" }),
          describePatch({ picture: "scene_relit" }),
          fetchLighting(1.6, 0.15),
        ]);
        if (!live) return;
        setHere(first);
        setThere(second);
        setLighting(measured);
      } catch (error) {
        if (!live) return;
        setMessage(
          error instanceof ApiError ? error.message : "Something went wrong.",
        );
      }
    })();
    return () => {
      live = false;
    };
  }, []);

  if (!here || !there || !lighting) {
    return (
      <p className="text-sm text-amber-600 dark:text-amber-400">
        {message ?? "…"}
      </p>
    );
  }

  const unrescaled = lighting.rows.find((row) => row.rule === "none");

  return (
    <div>
      <div className="grid gap-3 sm:grid-cols-2">
        <PixelPicture pixels={here.pixels} title="the scene" />
        <PixelPicture
          pixels={there.pixels}
          title="the scene under a brighter lamp, nothing moved"
        />
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Stat
          label="pixels that changed"
          value={`${lighting.n_pixels_changed} of ${lighting.n_pixels}`}
        />
        <Stat
          label="brightnesses apart by"
          value={`${lighting.pixel_moved.toFixed(2)} of ${lighting.pixel_length.toFixed(2)}`}
        />
        <Stat
          label="every edge sharpened by"
          value={`${lighting.smallest_magnitude_ratio.toFixed(2)} times`}
        />
        <Stat
          label="largest turn of any direction"
          value={`${lighting.largest_direction_difference_degrees.toExponential(1)}°`}
        />
      </div>

      <>
<p className="mt-2 text-xs text-slate-500 dark:text-slate-400">Compare the original scene with the lighting-transformed version. The measurement distinguishes changes to raw brightness, edge direction, edge magnitude, and the final normalized descriptor.</p><Equation>{"Pixels compared: " + lighting.n_pixels + "\nChanged-pixel share: " + (lighting.pixel_share_moved * 100).toFixed(0) + "%\nLargest edge-direction change: " + lighting.largest_direction_difference_degrees.toExponential(1) + " degrees\nEdge-magnitude multiplier: " + lighting.smallest_magnitude_ratio.toFixed(2) + "\nNormalized descriptor distance: " + tiny(there.distance_from_the_scene ?? 0) + "\nUnnormalized descriptor distance: " + (unrescaled?.moved_by_both ?? 0).toFixed(2)}</Equation><p className="mt-2 text-xs text-slate-500 dark:text-slate-400">These results show which stages change under this particular lighting transformation. Near-zero numerical differences should not be interpreted as a guarantee under arbitrary lighting.</p>
</>
    </div>
  );
}
