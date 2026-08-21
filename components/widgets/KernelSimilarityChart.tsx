"use client";

// Four kernels asked the same question, drawn as four curves.
//
// Fix a reference point at 1.5 and slide a second point from -4 to 4. Each
// curve is one kernel's answer to how similar the pair looks. The linear and
// squared kernels grow without bound, so their lines leave the window almost
// immediately, which is the point of showing them. The two radial curves peak
// at the reference and fade toward zero on either side, one wider and one
// narrower. Every similarity value comes from the library through the API;
// the browser only scales pixels and clamps lines to the window edges.

import { useEffect, useState } from "react";
import { ApiError, KernelSimilarity, traceSimilarity } from "@/lib/concepts/kernel-trick";

const VIEW_WIDTH = 560;
const VIEW_HEIGHT = 300;
const PADDING = 14;
const POSITION_MINIMUM = -4;
const POSITION_MAXIMUM = 4;
const VALUE_MINIMUM = -0.2;
const VALUE_MAXIMUM = 1.6;

// Colours in the curves' order, linear, squared, wider radial, narrower radial.
const CURVE_CLASSES = [
  "text-slate-500 dark:text-slate-400",
  "text-violet-500 dark:text-violet-400",
  "text-indigo-500 dark:text-indigo-400",
  "text-amber-500 dark:text-amber-400",
];

function horizontalPixel(position: number): number {
  return (
    PADDING +
    ((position - POSITION_MINIMUM) / (POSITION_MAXIMUM - POSITION_MINIMUM)) *
      (VIEW_WIDTH - 2 * PADDING)
  );
}

function verticalPixel(value: number): number {
  const clampedValue = Math.min(VALUE_MAXIMUM, Math.max(VALUE_MINIMUM, value));
  return (
    VIEW_HEIGHT -
    PADDING -
    ((clampedValue - VALUE_MINIMUM) / (VALUE_MAXIMUM - VALUE_MINIMUM)) *
      (VIEW_HEIGHT - 2 * PADDING)
  );
}

function pathForCurve(positions: number[], values: number[]): string {
  return positions
    .map((position, pointIndex) => {
      const command = pointIndex === 0 ? "M" : "L";
      const across = horizontalPixel(position).toFixed(1);
      const down = verticalPixel(values[pointIndex]).toFixed(1);
      return `${command}${across},${down}`;
    })
    .join(" ");
}

let pending: Promise<KernelSimilarity> | null = null;
function traceOnce(): Promise<KernelSimilarity> {
  if (!pending) pending = traceSimilarity();
  return pending;
}

export function KernelSimilarityChart() {
  const [similarity, setSimilarity] = useState<KernelSimilarity | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setSimilarity(await traceOnce());
      } catch (error) {
        pending = null;
        if (error instanceof ApiError) setMessage(error.message);
        else setMessage("Something went wrong.");
      }
    })();
  }, []);

  let radialAtReference = "…";
  let radialTwoAway = "…";
  let linearTwoAway = "…";

  if (similarity) {
    const linearCurve = similarity.curves[0];
    const widerRadialCurve = similarity.curves[2];
    const targetPosition = similarity.reference - 2;
    let nearestIndex = 0;
    for (
      let positionIndex = 1;
      positionIndex < similarity.positions.length;
      positionIndex++
    ) {
      const candidateGap = Math.abs(
        similarity.positions[positionIndex] - targetPosition,
      );
      const nearestGap = Math.abs(
        similarity.positions[nearestIndex] - targetPosition,
      );
      if (candidateGap < nearestGap) nearestIndex = positionIndex;
    }
    radialAtReference = Math.max(...widerRadialCurve.values).toFixed(2);
    radialTwoAway = widerRadialCurve.values[nearestIndex].toFixed(3);
    linearTwoAway = linearCurve.values[nearestIndex].toFixed(1);
  }

  return (
    <div>
      <svg
        viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}
        className="mx-auto w-full max-w-lg rounded-lg bg-slate-50 dark:bg-slate-950"
      >
        <line
          x1={PADDING}
          y1={verticalPixel(0)}
          x2={VIEW_WIDTH - PADDING}
          y2={verticalPixel(0)}
          stroke="currentColor"
          className="text-slate-200 dark:text-slate-800"
          strokeWidth={1}
        />
        <line
          x1={PADDING}
          y1={verticalPixel(1)}
          x2={VIEW_WIDTH - PADDING}
          y2={verticalPixel(1)}
          stroke="currentColor"
          className="text-slate-200 dark:text-slate-800"
          strokeWidth={1}
        />

        {similarity && (
          <line
            x1={horizontalPixel(similarity.reference)}
            y1={PADDING}
            x2={horizontalPixel(similarity.reference)}
            y2={VIEW_HEIGHT - PADDING}
            stroke="currentColor"
            strokeDasharray="5 4"
            className="text-emerald-500 dark:text-emerald-400"
            strokeWidth={1.5}
          />
        )}

        {similarity &&
          similarity.curves.map((curve, curveIndex) => (
            <path
              key={curve.label}
              d={pathForCurve(similarity.positions, curve.values)}
              fill="none"
              stroke="currentColor"
              className={CURVE_CLASSES[curveIndex]}
              strokeWidth={2}
            />
          ))}
      </svg>

      <div className="mt-3 flex flex-wrap justify-center gap-x-4 gap-y-1">
        {similarity?.curves.map((curve, curveIndex) => (
          <span
            key={curve.label}
            className="flex items-center gap-1.5 font-mono text-xs text-slate-600 dark:text-slate-300"
          >
            <span
              aria-hidden
              className={`inline-block h-0.5 w-4 rounded bg-current ${CURVE_CLASSES[curveIndex]}`}
            />
            {curve.label}
          </span>
        ))}
      </div>

      <p className="mt-2 text-center text-xs text-slate-500 dark:text-slate-500">
        The radial curves are the only ones that fade to zero with distance, so
        under that kernel a far-away point simply stops mattering.
      </p>

      <div className="mt-3 grid grid-cols-3 gap-3">
        <Stat label="Radial, right at the reference" value={radialAtReference} />
        <Stat label="Radial, two units away" value={radialTwoAway} />
        <Stat label="Linear, two units away" value={linearTwoAway} />
      </div>

      {message && (
        <p className="mt-3 text-sm text-amber-600 dark:text-amber-400">
          {message}
        </p>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-slate-100 px-3 py-2 dark:bg-slate-800">
      <div className="text-xs text-slate-500 dark:text-slate-400">{label}</div>
      <div className="font-mono text-base font-semibold text-slate-900 dark:text-slate-100">
        {value}
      </div>
    </div>
  );
}
