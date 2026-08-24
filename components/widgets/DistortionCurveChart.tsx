"use client";

// What a bigger table buys, on four pictures at once.
//
// The API walks the table size from one entry to thirty-two on each picture,
// measures the rounding error every time and divides each error into the one
// before it; the browser draws those errors on a logarithmic scale, where a
// constant factor per doubling is a straight line, and lists the factors beside
// the curve. A picture whose table cannot be made that large has no point drawn
// and its reason is printed underneath.

import { useEffect, useState } from "react";
import { ApiError } from "@/lib/api";
import { SweepView, fetchTableSizeSweep } from "@/lib/concepts/codebook-quantisation";
import {
  PICTURE_COLOURS,
  PictureChoice,
  PICTURES,
} from "./codebookQuantisationFixtures";

const CHART = { width: 480, height: 260 };
const PAD = { left: 46, right: 12, top: 14, bottom: 34 };

export function DistortionCurveChart({
  show = ["photograph", "poster", "chart", "speckle"],
  withFactors = true,
}: {
  show?: PictureChoice["name"][];
  withFactors?: boolean;
}) {
  const [view, setView] = useState<SweepView | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setView(await fetchTableSizeSweep());
      } catch (error) {
        setMessage(
          error instanceof ApiError ? error.message : "Something went wrong.",
        );
      }
    })();
  }, []);

  if (!view) {
    return (
      <p className="text-sm text-slate-500 dark:text-slate-400">
        {message ?? "…"}
      </p>
    );
  }

  const drawn = view.pictures.filter((picture) => show.includes(picture.picture));
  const plotted = drawn.flatMap((picture) =>
    picture.steps
      .filter((step) => step.distortion !== null && !step.exact)
      .map((step) => step.distortion as number),
  );
  const top = Math.log10(Math.max(...plotted));
  const bottom = Math.log10(Math.min(...plotted));
  const innerWidth = CHART.width - PAD.left - PAD.right;
  const innerHeight = CHART.height - PAD.top - PAD.bottom;

  const positionX = (bits: number) =>
    PAD.left + (bits / Math.max(...view.sizes.map((size) => Math.log2(size)))) * innerWidth;
  const positionY = (distortion: number) =>
    PAD.top +
    (1 - (Math.log10(distortion) - bottom) / (top - bottom || 1)) * innerHeight;

  const decades: number[] = [];
  for (let power = Math.floor(bottom); power <= Math.ceil(top); power += 1) {
    decades.push(power);
  }

  return (
    <div>
      <svg
        viewBox={`0 0 ${CHART.width} ${CHART.height}`}
        className="w-full select-none rounded-lg bg-slate-50 dark:bg-slate-950"
      >
        {decades.map((power) => (
          <g key={power}>
            <line
              x1={PAD.left}
              x2={CHART.width - PAD.right}
              y1={positionY(Math.pow(10, power))}
              y2={positionY(Math.pow(10, power))}
              stroke="currentColor"
              strokeWidth={0.5}
              className="text-slate-300 dark:text-slate-700"
            />
            <text
              x={PAD.left - 6}
              y={positionY(Math.pow(10, power)) + 3.5}
              textAnchor="end"
              className="fill-slate-500 text-[9px] dark:fill-slate-400"
            >
              1e{power}
            </text>
          </g>
        ))}

        {drawn.map((picture) => {
          const points = picture.steps
            .filter((step) => step.distortion !== null && !step.exact)
            .map((step) => ({
              x: positionX(step.bits_per_piece),
              y: positionY(step.distortion as number),
            }));
          const path = points
            .map(
              (point, index) =>
                `${index === 0 ? "M" : "L"} ${point.x.toFixed(1)} ${point.y.toFixed(1)}`,
            )
            .join(" ");
          return (
            <g key={picture.picture}>
              <path
                d={path}
                fill="none"
                stroke={PICTURE_COLOURS[picture.picture]}
                strokeWidth={2}
              />
              {points.map((point, index) => (
                <circle
                  key={index}
                  cx={point.x}
                  cy={point.y}
                  r={3}
                  fill={PICTURE_COLOURS[picture.picture]}
                />
              ))}
            </g>
          );
        })}

        {view.sizes.map((size) => (
          <text
            key={size}
            x={positionX(Math.log2(size))}
            y={CHART.height - PAD.bottom + 14}
            textAnchor="middle"
            className="fill-slate-500 text-[9px] dark:fill-slate-400"
          >
            {size}
          </text>
        ))}
        <text
          x={PAD.left + innerWidth / 2}
          y={CHART.height - 6}
          textAnchor="middle"
          className="fill-slate-500 text-[10px] dark:fill-slate-400"
        >
          entries in the table
        </text>
      </svg>

      <div className="mt-2 flex flex-wrap gap-4 text-xs">
        {drawn.map((picture) => (
          <span
            key={picture.picture}
            className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400"
          >
            <span
              className="inline-block h-2 w-4 rounded-sm"
              style={{ backgroundColor: PICTURE_COLOURS[picture.picture] }}
            />
            {picture.label}
          </span>
        ))}
      </div>

      {withFactors && (
        <div className="mt-3 overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left dark:border-slate-800">
                <th className="py-1.5 pr-4 font-semibold text-slate-600 dark:text-slate-400">
                  picture
                </th>
                <th className="py-1.5 pr-4 font-semibold text-slate-600 dark:text-slate-400">
                  different pieces
                </th>
                <th className="py-1.5 pr-4 font-semibold text-slate-600 dark:text-slate-400">
                  along over across
                </th>
                <th className="py-1.5 font-semibold text-slate-600 dark:text-slate-400">
                  error cut by, at each doubling
                </th>
              </tr>
            </thead>
            <tbody>
              {drawn.map((picture) => (
                <tr
                  key={picture.picture}
                  className="border-b border-slate-100 last:border-0 dark:border-slate-800/60"
                >
                  <td
                    className="py-1.5 pr-4 font-mono"
                    style={{ color: PICTURE_COLOURS[picture.picture] }}
                  >
                    {PICTURES.find((each) => each.name === picture.picture)?.short}
                  </td>
                  <td className="py-1.5 pr-4 font-mono text-slate-800 dark:text-slate-200">
                    {picture.n_distinct_pieces}
                  </td>
                  <td className="py-1.5 pr-4 font-mono text-slate-800 dark:text-slate-200">
                    {picture.spread_ratio === null
                      ? "flat"
                      : picture.spread_ratio.toFixed(1)}
                  </td>
                  <td className="py-1.5 font-mono text-slate-800 dark:text-slate-200">
                    {picture.steps
                      .filter((step) => step.cut_by !== null)
                      .map((step) => (step.cut_by as number).toFixed(2))
                      .join(", ") || "none"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {drawn.flatMap((picture) =>
        picture.steps
          .filter((step) => step.refused || step.exact)
          .map((step) => (
            <p
              key={`${picture.picture}-${step.n_codes}`}
              className="mt-2 text-xs text-slate-500 dark:text-slate-400"
            >
              {picture.label} at {step.n_codes} entries:{" "}
              {step.refused
                ? step.refused
                : `every piece comes back exactly as it went in, and ${step.n_unused} entries win nothing.`}
            </p>
          )),
      )}
    </div>
  );
}
