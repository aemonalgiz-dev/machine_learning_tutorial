"use client";

// The whole method on one picture, with every setting it leaves open.
//
// The left drawing is the scene with a ring around each place the method chose
// to describe; the right drawing is the score it chose them by, one number per
// pixel, washed amber where the score is positive and blue where it is
// negative. Moving the window, the threshold, the separation or the border
// changes both at once, which is the point: none of these is a detail, and
// each of them changes what counts as a corner. The API computes every score
// and every keypoint; the browser paints them.

import { useEffect, useState } from "react";
import { ApiError } from "@/lib/api";
import {
  Detection,
  MeasureName,
  SceneName,
  detectKeypoints,
} from "@/lib/concepts/keypoints-and-descriptors";
import {
  ACTIVE_BUTTON,
  BUTTON,
  Caption,
  PixelGrid,
  Stat,
  greyShade,
  scoreShade,
} from "./keypointDrawing";

const SCENES: { name: SceneName; label: string }[] = [
  { name: "workbench", label: "the workbench" },
  { name: "relit", label: "relit" },
  { name: "turned", label: "turned" },
  { name: "square", label: "one square" },
  { name: "floor", label: "a block and a shadow" },
  { name: "horizon", label: "a horizon" },
];

const MEASURES: { name: MeasureName; label: string }[] = [
  { name: "smallest_eigenvalue", label: "the smaller eigenvalue" },
  { name: "harris", label: "the Harris score" },
];

const WINDOW_SIDES = [1, 3, 5, 7, 9];

export function KeypointWorkbench() {
  const [scene, setScene] = useState<SceneName>("workbench");
  const [measure, setMeasure] = useState<MeasureName>("smallest_eigenvalue");
  const [windowSide, setWindowSide] = useState(3);
  const [threshold, setThreshold] = useState(0.05);
  const [separation, setSeparation] = useState(3);
  const [border, setBorder] = useState(2);
  const [found, setFound] = useState<Detection | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(async () => {
      try {
        setFound(
          await detectKeypoints({
            scene,
            measure,
            window_side: windowSide,
            minimum_strength: threshold,
            separation,
            border,
          }),
        );
        setMessage(null);
      } catch (error) {
        if (error instanceof ApiError) setMessage(error.message);
        else setMessage("Something went wrong.");
      }
    }, 120);
    return () => clearTimeout(timer);
  }, [scene, measure, windowSide, threshold, separation, border]);

  if (!found) {
    return (
      <p className="text-sm text-slate-500 dark:text-slate-400">
        {message ?? "…"}
      </p>
    );
  }

  const marks = found.keypoints.map((point) => ({
    row: point.row,
    column: point.column,
  }));
  const cell = found.width > 40 ? 8 : 12;

  return (
    <div>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-600 dark:text-slate-300">
        <span className="flex flex-wrap gap-1">
          {SCENES.map((choice) => (
            <button
              key={choice.name}
              onClick={() => setScene(choice.name)}
              className={scene === choice.name ? ACTIVE_BUTTON : BUTTON}
            >
              {choice.label}
            </button>
          ))}
        </span>
        <span className="flex flex-wrap gap-1">
          {MEASURES.map((choice) => (
            <button
              key={choice.name}
              onClick={() => setMeasure(choice.name)}
              className={measure === choice.name ? ACTIVE_BUTTON : BUTTON}
            >
              {choice.label}
            </button>
          ))}
        </span>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-slate-600 dark:text-slate-300">
        <span className="flex items-center gap-1">
          window
          {WINDOW_SIDES.map((side) => (
            <button
              key={side}
              onClick={() => setWindowSide(side)}
              className={windowSide === side ? ACTIVE_BUTTON : BUTTON}
            >
              {side}
            </button>
          ))}
        </span>
        <label className="flex flex-1 items-center gap-2">
          keep above
          <input
            type="range"
            min={0}
            max={6}
            step={0.01}
            value={threshold}
            onChange={(event) => setThreshold(Number(event.target.value))}
            className="flex-1 accent-amber-500"
          />
          <span className="w-12 text-right font-mono">
            {threshold.toFixed(2)}
          </span>
        </label>
        <label className="flex items-center gap-2">
          separation
          <input
            type="range"
            min={1}
            max={8}
            step={1}
            value={separation}
            onChange={(event) => setSeparation(Number(event.target.value))}
            className="w-24 accent-indigo-600"
          />
          <span className="w-5 text-right font-mono">{separation}</span>
        </label>
        <label className="flex items-center gap-2">
          border
          <input
            type="range"
            min={0}
            max={6}
            step={1}
            value={border}
            onChange={(event) => setBorder(Number(event.target.value))}
            className="w-24 accent-indigo-600"
          />
          <span className="w-5 text-right font-mono">{border}</span>
        </label>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div>
          <PixelGrid
            rows={found.picture}
            shade={greyShade(found.picture_low, found.picture_high)}
            marks={marks}
            cell={cell}
          />
          <Caption>
            the scene, with a ring where the method chose to look
          </Caption>
        </div>
        <div>
          <PixelGrid
            rows={found.scores}
            shade={scoreShade(found.score_high, found.score_low)}
            marks={marks}
            cell={cell}
          />
          <Caption>
            the score at every pixel, amber above zero and blue below it
          </Caption>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Stat
          label="pixels in the picture"
          value={`${found.height * found.width}`}
        />
        <Stat label="scoring above the line" value={`${found.n_candidates}`} />
        <Stat label="places kept" value={`${found.n_keypoints}`} />
        <Stat
          label="strongest score"
          value={found.score_high.toFixed(found.score_high >= 10 ? 2 : 4)}
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
