"use client";

// The page's playground: plant a move, find it again, and see what was found.
//
// The reader chooses how the second picture is turned, scaled and shifted,
// which pair of rules describes the keypoints, and the two thresholds the
// method leaves open. The API plants the move, runs the method and answers
// with everything drawn here, including which matches were right, which it
// can say because it planted the move. The method's own verdict on each match
// sits beside the truth, as a two-by-two count, because the gap between them
// is what a reader should know about before trusting an alignment.

import { useEffect, useState } from "react";
import { ApiError } from "@/lib/api";
import {
  alignPictures,
  type Alignment,
  type MethodName,
} from "@/lib/concepts/image-alignment";
import { ACTIVE_BUTTON, BUTTON, Caption, Stat } from "./keypointDrawing";
import { Arrow, INLIER, OUTLIER, degrees, paintedPixels } from "./alignmentDrawing";

const CELL = 5;
const GAP = 36;

function Slider({
  label,
  value,
  min,
  max,
  step,
  shown,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  shown: string;
  onChange: (value: number) => void;
}) {
  return (
    <label className="block text-xs text-slate-600 dark:text-slate-400">
      <span className="flex justify-between">
        <span>{label}</span>
        <span className="font-mono text-slate-900 dark:text-slate-100">{shown}</span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="mt-1 w-full accent-indigo-600"
      />
    </label>
  );
}

function MoveLine({ label, move }: { label: string; move: Alignment["truth"] | null }) {
  return (
    <tr className="border-b border-slate-100 last:border-0 dark:border-slate-800/60">
      <td className="py-1 pr-4 text-slate-600 dark:text-slate-400">{label}</td>
      <td className="py-1 pr-4 font-mono">{move ? degrees(move.angle_degrees) : "none"}</td>
      <td className="py-1 pr-4 font-mono">{move ? move.scale.toFixed(3) : "none"}</td>
      <td className="py-1 font-mono">
        {move ? `(${move.row_shift.toFixed(1)}, ${move.column_shift.toFixed(1)})` : "none"}
      </td>
    </tr>
  );
}

export function AlignmentPlayground() {
  const [method, setMethod] = useState<MethodName>("orb");
  const [angle, setAngle] = useState(30);
  const [scale, setScale] = useState(1.0);
  const [rowShift, setRowShift] = useState(3);
  const [columnShift, setColumnShift] = useState(-5);
  const [ratio, setRatio] = useState(0.8);
  const [tolerance, setTolerance] = useState(1.5);
  const [found, setFound] = useState<Alignment | null>(null);
  const [selected, setSelected] = useState<number | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [showAligned, setShowAligned] = useState(true);

  useEffect(() => {
    let stale = false;
    alignPictures({
      method,
      angle_degrees: angle,
      scale,
      row_shift: rowShift,
      column_shift: columnShift,
      maximum_ratio: ratio,
      inlier_distance: tolerance,
    })
      .then((report) => {
        if (stale) return;
        setFound(report);
        setMessage(null);
      })
      .catch((error: unknown) => {
        if (stale) return;
        if (error instanceof ApiError) setMessage(error.message);
      });
    return () => {
      stale = true;
    };
  }, [method, angle, scale, rowShift, columnShift, ratio, tolerance]);

  const width = (found?.width ?? 64) * CELL;
  const height = (found?.height ?? 64) * CELL;
  const offset = width + GAP;
  const centre = (index: number) => (index + 0.5) * CELL;

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
          <span>Describe with</span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setMethod("orb")}
              className={method === "orb" ? ACTIVE_BUTTON : BUTTON}
            >
              ORB pair
            </button>
            <button
              type="button"
              onClick={() => setMethod("sift")}
              className={method === "sift" ? ACTIVE_BUTTON : BUTTON}
            >
              SIFT pair
            </button>
          </div>
          <p className="text-[11px] leading-snug">
            {method === "orb"
              ? "Centre of brightness for the direction, pixel pairs for the reading."
              : "Dominant gradient for the direction, a grid of gradient counts for the reading."}
          </p>
        </div>
        <div className="space-y-2">
          <Slider label="Turn" value={angle} min={-180} max={180} step={5} shown={degrees(angle)} onChange={setAngle} />
          <Slider label="Scale" value={scale} min={0.6} max={1.6} step={0.05} shown={scale.toFixed(2)} onChange={setScale} />
        </div>
        <div className="space-y-2">
          <Slider label="Shift down" value={rowShift} min={-16} max={16} step={1} shown={`${rowShift} px`} onChange={setRowShift} />
          <Slider label="Shift right" value={columnShift} min={-16} max={16} step={1} shown={`${columnShift} px`} onChange={setColumnShift} />
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <Slider label="Ratio test threshold" value={ratio} min={0.5} max={1} step={0.05} shown={ratio.toFixed(2)} onChange={setRatio} />
        <Slider label="Inlier distance" value={tolerance} min={0.5} max={4} step={0.5} shown={`${tolerance.toFixed(1)} px`} onChange={setTolerance} />
      </div>

      {message && (
        <p className="rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:bg-rose-950/40 dark:text-rose-200">
          {message}
        </p>
      )}

      {found && (
        <>
          <svg
            viewBox={`0 0 ${2 * width + GAP} ${height + 4}`}
            className="w-full select-none rounded-md bg-slate-100 dark:bg-slate-900"
            shapeRendering="crispEdges"
          >
            {paintedPixels(found.first, CELL, 0)}
            {paintedPixels(found.second, CELL, offset)}
            {found.first_keypoints.map((keypoint, index) => (
              <Arrow key={`a${index}`} keypoint={keypoint} cell={CELL} length={3} faint />
            ))}
            {found.second_keypoints.map((keypoint, index) => (
              <Arrow key={`b${index}`} keypoint={keypoint} cell={CELL} shiftX={offset} length={3} faint />
            ))}
            {found.matches.map((match, index) => {
              const from = found.first_keypoints[match.first];
              const to = found.second_keypoints[match.second];
              const dimmed = selected !== null && selected !== index;
              return (
                <g
                  key={index}
                  onMouseEnter={() => setSelected(index)}
                  onMouseLeave={() => setSelected(null)}
                  className="cursor-pointer"
                >
                  <line
                    x1={centre(from.column)}
                    y1={centre(from.row)}
                    x2={offset + centre(to.column)}
                    y2={centre(to.row)}
                    stroke={match.inlier ? INLIER : OUTLIER}
                    strokeWidth={selected === index ? 3 : 1.6}
                    strokeOpacity={dimmed ? 0.2 : 0.9}
                    strokeDasharray={match.right ? undefined : "4 3"}
                    shapeRendering="geometricPrecision"
                  />
                </g>
              );
            })}
          </svg>
          <Caption>
            Left, the scene. Right, the scene after the planted move. A solid line is a
            match the planted move confirms; a dashed one is wrong. Green, the method
            kept it as an inlier; rose, it refused it as an outlier.
            {selected !== null && found.matches[selected] && (
              <>
                {" "}
                Match {selected + 1}, ratio {found.matches[selected].ratio.toFixed(2)},{" "}
                {found.matches[selected].right ? "right" : "wrong"},{" "}
                {found.matches[selected].inlier ? "kept" : "refused"}.
              </>
            )}
          </Caption>

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <Stat label="Keypoints" value={`${found.first_keypoints.length} / ${found.second_keypoints.length}`} />
            <Stat label="Matches kept by the ratio test" value={`${found.n_matches}`} />
            <Stat label="Of which right" value={`${found.n_right}`} />
            <Stat label="Inliers" value={`${found.n_inliers}`} />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="mb-1 text-xs font-semibold text-slate-600 dark:text-slate-400">
                The method&rsquo;s verdict against the truth
              </p>
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-left dark:border-slate-800">
                    <th className="py-1 pr-4 font-semibold text-slate-600 dark:text-slate-400"></th>
                    <th className="py-1 pr-4 font-semibold text-slate-600 dark:text-slate-400">Right</th>
                    <th className="py-1 font-semibold text-slate-600 dark:text-slate-400">Wrong</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-slate-100 dark:border-slate-800/60">
                    <td className="py-1 pr-4 text-slate-600 dark:text-slate-400">Kept as inlier</td>
                    <td className="py-1 pr-4 font-mono text-emerald-700 dark:text-emerald-300">{found.inliers_right}</td>
                    <td className="py-1 font-mono text-rose-700 dark:text-rose-300">{found.inliers_wrong}</td>
                  </tr>
                  <tr>
                    <td className="py-1 pr-4 text-slate-600 dark:text-slate-400">Refused as outlier</td>
                    <td className="py-1 pr-4 font-mono text-rose-700 dark:text-rose-300">{found.outliers_right}</td>
                    <td className="py-1 font-mono text-emerald-700 dark:text-emerald-300">{found.outliers_wrong}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div>
              <p className="mb-1 text-xs font-semibold text-slate-600 dark:text-slate-400">
                The move, planted and recovered
              </p>
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-left dark:border-slate-800">
                    <th className="py-1 pr-4 font-semibold text-slate-600 dark:text-slate-400"></th>
                    <th className="py-1 pr-4 font-semibold text-slate-600 dark:text-slate-400">Turn</th>
                    <th className="py-1 pr-4 font-semibold text-slate-600 dark:text-slate-400">Scale</th>
                    <th className="py-1 font-semibold text-slate-600 dark:text-slate-400">Shift</th>
                  </tr>
                </thead>
                <tbody>
                  <MoveLine label="Planted" move={found.truth} />
                  <MoveLine label="Recovered" move={found.estimate} />
                </tbody>
              </table>
              {found.estimate && found.angle_gap_degrees !== null && (
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Turn off by {degrees(found.angle_gap_degrees)}, inliers landing{" "}
                  {found.mean_residual?.toFixed(2)} px from where the move sends them.
                </p>
              )}
              {found.refusal && (
                <p className="mt-1 text-xs text-rose-700 dark:text-rose-300">{found.refusal}</p>
              )}
            </div>
          </div>

          {found.aligned.length > 0 && found.difference_after !== null && (
            <div>
              <div className="mb-2 flex flex-wrap items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                <span>Show</span>
                <button type="button" onClick={() => setShowAligned(true)} className={showAligned ? ACTIVE_BUTTON : BUTTON}>
                  the second picture carried back
                </button>
                <button type="button" onClick={() => setShowAligned(false)} className={!showAligned ? ACTIVE_BUTTON : BUTTON}>
                  the first picture
                </button>
              </div>
              <div className="mx-auto max-w-xs">
                <svg
                  viewBox={`0 0 ${width} ${height}`}
                  className="w-full select-none rounded-md bg-slate-100 dark:bg-slate-900"
                  shapeRendering="crispEdges"
                >
                  {paintedPixels(showAligned ? found.aligned : found.first, CELL, 0)}
                </svg>
              </div>
              <Caption>
                Mean pixel difference from the first picture: {found.difference_before.toFixed(4)}{" "}
                before alignment, {found.difference_after.toFixed(4)} after.
              </Caption>
            </div>
          )}
        </>
      )}
    </div>
  );
}
