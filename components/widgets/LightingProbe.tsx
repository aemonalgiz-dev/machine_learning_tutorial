"use client";

// The same scene under two lamps, judged twice: once on brightness and once on
// how fast the brightness changes.
//
// The top row draws the two pictures and what a single brightness threshold
// makes of each, and the reader can drag the threshold to look for one that
// works on both. The bottom row draws the two directions the gradient reports,
// which is where the interesting number is, since the API measures them as
// identical to within a rounding step. Every count and every bound comes from
// the API; the browser only paints.

import { useEffect, useState } from "react";
import {
  GradientMaps,
  Scene,
  messageFor,
  readScene,
  sweepField,
} from "@/lib/concepts/filters-and-edges";
import {
  Failure,
  MapPanel,
  PANEL_CLASS,
  PixelMap,
  Stat,
  largestOf,
  smallestOf,
} from "./filtersAndEdgesShared";

function cut(rows: number[][], threshold: number): number[][] {
  return rows.map((row) => row.map((value) => (value >= threshold ? 1 : 0)));
}

export function LightingProbe() {
  const [scene, setScene] = useState<Scene | null>(null);
  const [here, setHere] = useState<GradientMaps | null>(null);
  const [there, setThere] = useState<GradientMaps | null>(null);
  const [threshold, setThreshold] = useState(0.6);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const [read, first, second] = await Promise.all([
          readScene(),
          sweepField({ scene: "workbench" }),
          sweepField({ scene: "relit" }),
        ]);
        setScene(read);
        setHere(first);
        setThere(second);
        setMessage(null);
      } catch (error) {
        setMessage(messageFor(error));
      }
    })();
  }, []);

  const lighting = scene?.lighting ?? null;
  const shapePixels = lighting?.n_shape_pixels ?? 0;
  const keptHere = scene ? cut(scene.scene, threshold) : null;
  const keptThere = scene ? cut(scene.relit, threshold) : null;
  const countHere = keptHere ? keptHere.flat().filter(Boolean).length : 0;
  const countThere = keptThere ? keptThere.flat().filter(Boolean).length : 0;
  const worksHere =
    lighting !== null &&
    threshold > lighting.brightest_ground &&
    threshold <= lighting.darkest_shape;
  const worksThere =
    lighting !== null &&
    threshold > lighting.relit_brightest_ground &&
    threshold <= lighting.relit_darkest_shape;

  return (
    <div className={PANEL_CLASS}>
      {scene && lighting && here && there ? (
        <>
          <div className="flex flex-wrap justify-center gap-4">
            <MapPanel
              title="the scene"
              scale="brightness"
              low={smallestOf(scene.scene).toFixed(2)}
              high={largestOf(scene.scene).toFixed(2)}
            >
              <PixelMap
                rows={scene.scene}
                scale="brightness"
                largest={largestOf(scene.scene)}
                darkest={smallestOf(scene.scene)}
              />
            </MapPanel>
            <MapPanel
              title={`kept at ${threshold.toFixed(2)}`}
              scale="brightness"
              low="below"
              high="at or above"
              note={
                worksHere
                  ? `all ${countHere} of the shape pixels and nothing else`
                  : `${countHere} pixels, against the ${shapePixels} that are really a shape`
              }
            >
              <PixelMap rows={keptHere ?? []} scale="brightness" largest={1} />
            </MapPanel>
            <MapPanel
              title="under a brighter lamp"
              scale="brightness"
              low={smallestOf(scene.relit).toFixed(2)}
              high={largestOf(scene.relit).toFixed(2)}
            >
              <PixelMap
                rows={scene.relit}
                scale="brightness"
                largest={largestOf(scene.relit)}
                darkest={smallestOf(scene.relit)}
              />
            </MapPanel>
            <MapPanel
              title={`kept at ${threshold.toFixed(2)}`}
              scale="brightness"
              low="below"
              high="at or above"
              note={
                worksThere
                  ? `all ${countThere} of the shape pixels and nothing else`
                  : `${countThere} pixels, against the ${shapePixels} that are really a shape`
              }
            >
              <PixelMap rows={keptThere ?? []} scale="brightness" largest={1} />
            </MapPanel>
          </div>

          <label className="mt-4 flex flex-wrap items-center gap-3 text-xs text-slate-600 dark:text-slate-300">
            brightness threshold
            <input
              type="range"
              min={0.1}
              max={1.9}
              step={0.01}
              value={threshold}
              onChange={(event) => setThreshold(Number(event.target.value))}
              className="w-64 accent-indigo-600"
            />
            <span className="font-mono">{threshold.toFixed(2)}</span>
            <span className="text-slate-500 dark:text-slate-400">
              works on the scene between{" "}
              {lighting.brightest_ground.toFixed(4)} and{" "}
              {lighting.darkest_shape.toFixed(4)}, and on the relit one between{" "}
              {lighting.relit_brightest_ground.toFixed(4)} and{" "}
              {lighting.relit_darkest_shape.toFixed(4)}
            </span>
          </label>

          <div className="mt-5 flex flex-wrap justify-center gap-4">
            <MapPanel
              title="which way the brightness rises"
              scale="magnitude"
              low="0"
              high={here.largest_magnitude.toFixed(2)}
              note="the scene"
            >
              <PixelMap
                rows={here.magnitude}
                scale="magnitude"
                largest={here.largest_magnitude}
                strokes={here.direction}
                strokeAt={here.magnitude}
              />
            </MapPanel>
            <MapPanel
              title="which way the brightness rises"
              scale="magnitude"
              low="0"
              high={there.largest_magnitude.toFixed(2)}
              note="under the brighter lamp, and the strokes lie in the same places at the same angles"
            >
              <PixelMap
                rows={there.magnitude}
                scale="magnitude"
                largest={there.largest_magnitude}
                strokes={there.direction}
                strokeAt={there.magnitude}
              />
            </MapPanel>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Stat
              label="Mean brightness move"
              value={lighting.mean_brightness_move.toFixed(4)}
            />
            <Stat
              label="Pixels relabelled at 0.60"
              value={`${lighting.n_disagreeing} of ${lighting.n_pixels}`}
            />
            <Stat
              label="Every magnitude multiplied by"
              value={lighting.magnitude_ratio_low.toFixed(6)}
            />
            <Stat
              label="Largest angle moved, radians"
              value={lighting.largest_direction_move.toExponential(2)}
            />
          </div>

          <p className="mt-3 text-center text-xs text-slate-500 dark:text-slate-500">
            The lamp multiplied every pixel by {lighting.scale} and added{" "}
            {lighting.shift}. The brightness window that labelled the scene
            perfectly does not overlap the one that labels the relit scene, so
            no single number serves both, while the {lighting.n_sharp_pixels}{" "}
            pixels where the change is sharp report the same angle to within{" "}
            {lighting.largest_direction_move_where_sharp.toExponential(1)}{" "}
            radians.
          </p>
        </>
      ) : (
        <p className="py-12 text-center text-slate-400">…</p>
      )}
      <Failure message={message} />
    </div>
  );
}
