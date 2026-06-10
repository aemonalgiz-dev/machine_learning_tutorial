"use client";

// Which way the gradient points, drawn as strokes over a patch of the scene
// large enough to read.
//
// A colour ramp cannot carry an angle, since an angle wraps round and a ramp
// has two ends, so the direction is drawn as a short line inside each pixel. The
// switch turns every stroke by a right angle, which is the difference between
// the way the brightness rises and the way the edge itself runs, and putting the
// two beside each other is the point of the widget: on the square the gradient
// strokes cross its sides and the edge strokes lie along them. The API sweeps
// the picture and answers both angles; the browser draws the lines.

import { useEffect, useState } from "react";
import {
  GradientMaps,
  messageFor,
  sweepField,
} from "@/lib/concepts/filters-and-edges";
import {
  ACTIVE_BUTTON_CLASS,
  BUTTON_CLASS,
  Failure,
  MapPanel,
  PANEL_CLASS,
  PixelMap,
  Stat,
} from "./filtersAndEdgesShared";

// Each patch is a corner of the shared scene, named by what sits in it.
const PATCHES: {
  name: string;
  top: number;
  left: number;
  side: number;
  note: string;
}[] = [
  {
    name: "the square",
    top: 3,
    left: 2,
    side: 18,
    note: "four straight sides, two of them upright and two flat",
  },
  {
    name: "the disc",
    top: 4,
    left: 26,
    side: 18,
    note: "an edge that points in every direction in turn",
  },
  {
    name: "the bar",
    top: 16,
    left: 4,
    side: 18,
    note: "a diagonal, drawn as a staircase of whole pixels",
  },
];

function patchOf(rows: number[][], top: number, left: number, side: number) {
  return rows.slice(top, top + side).map((row) => row.slice(left, left + side));
}

export function GradientArrows() {
  const [maps, setMaps] = useState<GradientMaps | null>(null);
  const [patchName, setPatchName] = useState(PATCHES[0].name);
  const [showEdge, setShowEdge] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setMaps(await sweepField({ scene: "workbench" }));
        setMessage(null);
      } catch (error) {
        setMessage(messageFor(error));
      }
    })();
  }, []);

  const patch = PATCHES.find((one) => one.name === patchName) ?? PATCHES[0];
  const angles = maps
    ? patchOf(
        showEdge ? maps.edge_direction : maps.direction,
        patch.top,
        patch.left,
        patch.side,
      )
    : null;
  const sharpness = maps
    ? patchOf(maps.magnitude, patch.top, patch.left, patch.side)
    : null;
  const brightness = maps
    ? patchOf(maps.picture, patch.top, patch.left, patch.side)
    : null;

  return (
    <div className={PANEL_CLASS}>
      <div className="flex flex-wrap items-center gap-4 pb-3 text-xs text-slate-600 dark:text-slate-300">
        <span className="flex flex-wrap items-center gap-1">
          look at
          {PATCHES.map((one) => (
            <button
              key={one.name}
              onClick={() => setPatchName(one.name)}
              className={
                one.name === patchName ? ACTIVE_BUTTON_CLASS : BUTTON_CLASS
              }
            >
              {one.name}
            </button>
          ))}
        </span>
        <span className="flex flex-wrap items-center gap-1">
          the strokes show
          <button
            onClick={() => setShowEdge(false)}
            className={!showEdge ? ACTIVE_BUTTON_CLASS : BUTTON_CLASS}
          >
            which way the brightness rises
          </button>
          <button
            onClick={() => setShowEdge(true)}
            className={showEdge ? ACTIVE_BUTTON_CLASS : BUTTON_CLASS}
          >
            which way the edge runs
          </button>
        </span>
      </div>

      {maps && angles && sharpness && brightness ? (
        <>
          <div className="flex flex-wrap justify-center gap-5">
            <MapPanel
              title={patch.name}
              scale="brightness"
              low="dark"
              high="light"
              note={patch.note}
              width="w-52"
            >
              <PixelMap rows={brightness} scale="brightness" largest={1.05} />
            </MapPanel>
            <MapPanel
              title={
                showEdge ? "the way the edge runs" : "the way brightness rises"
              }
              scale="magnitude"
              low="0"
              high={maps.largest_magnitude.toFixed(2)}
              note={
                showEdge
                  ? "each stroke lies along the boundary it sits on"
                  : "each stroke crosses the boundary it sits on, at a right angle to it"
              }
              width="w-52"
            >
              <PixelMap
                rows={sharpness}
                scale="magnitude"
                largest={maps.largest_magnitude}
                strokes={angles}
                strokeAt={sharpness}
              />
            </MapPanel>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Stat label="Patch" value={`${patch.side} by ${patch.side}`} />
            <Stat
              label="Taken from"
              value={`row ${patch.top}, column ${patch.left}`}
            />
            <Stat
              label="Sharpest change here"
              value={Math.max(...sharpness.flat()).toFixed(4)}
            />
            <Stat
              label="Strokes drawn"
              value={String(
                sharpness
                  .flat()
                  .filter(
                    (value) =>
                      value > 0.12 * Math.max(...sharpness.flat()),
                  ).length,
              )}
            />
          </div>

          <p className="mt-3 text-center text-xs text-slate-500 dark:text-slate-500">
            A stroke is drawn only where the change is sharp enough for its
            angle to mean something, since a flat patch has no direction at all
            and any number reported there is a convention rather than a
            measurement.
          </p>
        </>
      ) : (
        <p className="py-12 text-center text-slate-400">…</p>
      )}

      <Failure message={message} />
    </div>
  );
}
