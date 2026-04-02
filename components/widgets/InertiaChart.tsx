"use client";

// The number k-means watches while it walks, drawn pass by pass.
//
// Each dot is the inertia after one full pass of assigning every person to
// their nearest centre and re-centring, on the classification pages' crowd
// with its labels stripped, grouped into two. The line is a staircase because
// the total only ever steps down or holds level, never up, which is the
// convergence argument in a single picture. Indigo dots are passes that were
// still lowering the total; emerald dots have already reached the resting
// value. Every inertia on the chart comes from the API, not the browser.

import { useEffect, useState } from "react";
import { ApiError, InertiaCurve, Point, traceInertia } from "@/lib/api";

const VIEW = { width: 640, height: 360 };
const PAD = { left: 64, right: 20, top: 20, bottom: 48 };
const PLOT = {
  width: VIEW.width - PAD.left - PAD.right,
  height: VIEW.height - PAD.top - PAD.bottom,
};

const FIRST_PASS = 1;
const LAST_PASS = 12;
const CLUSTER_COUNT = 2;

// The classification pages' crowd with its labels stripped away.
const CROWD: Point[] = [
  { x: 147, y: 41 },
  { x: 156, y: 53 },
  { x: 145, y: 57 },
  { x: 159, y: 57 },
  { x: 162, y: 61 },
  { x: 120, y: 25 },
  { x: 122, y: 28 },
  { x: 118, y: 24 },
  { x: 180, y: 80 },
  { x: 183, y: 83 },
  { x: 178, y: 78 },
];

const PASS_TICKS: number[] = [];
for (let passNumber = FIRST_PASS; passNumber <= LAST_PASS; passNumber++) {
  PASS_TICKS.push(passNumber);
}

function passNumberToX(passNumber: number): number {
  return (
    PAD.left +
    ((passNumber - FIRST_PASS) / (LAST_PASS - FIRST_PASS)) * PLOT.width
  );
}

function inertiaToY(
  inertiaValue: number,
  highestInertia: number,
  inertiaSpan: number,
): number {
  return PAD.top + ((highestInertia - inertiaValue) / inertiaSpan) * PLOT.height;
}

interface PassDot {
  passNumber: number;
  x: number;
  y: number;
  resting: boolean;
}

export function InertiaChart() {
  const [curve, setCurve] = useState<InertiaCurve | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setCurve(await traceInertia(CROWD, CLUSTER_COUNT));
      } catch (error) {
        if (error instanceof ApiError) setMessage(error.message);
        else setMessage("Something went wrong.");
      }
    })();
  }, []);

  let passDots: PassDot[] = [];
  let stepPath = "";
  let highestLabel = "";
  let lowestLabel = "";
  let firstPassReadout = "…";
  let restingReadout = "…";
  let passesToRestReadout = "…";

  if (curve && curve.inertias.length > 0) {
    const finalInertia = curve.inertias[curve.inertias.length - 1];
    const restingIndex = curve.inertias.findIndex(
      (inertiaValue) => inertiaValue === finalInertia,
    );
    const highestInertia = Math.max(...curve.inertias);
    const lowestInertia = Math.min(...curve.inertias);
    const inertiaSpan = highestInertia - lowestInertia || 1;

    passDots = curve.iterations
      .map((passNumber, passIndex) => ({
        passNumber,
        x: passNumberToX(passNumber),
        y: inertiaToY(curve.inertias[passIndex], highestInertia, inertiaSpan),
        resting: passIndex >= restingIndex,
      }))
      .filter(
        (dot) => dot.passNumber >= FIRST_PASS && dot.passNumber <= LAST_PASS,
      );

    stepPath = passDots
      .map((dot, dotIndex) =>
        dotIndex === 0
          ? `M ${dot.x} ${dot.y}`
          : `H ${dot.x} V ${dot.y}`,
      )
      .join(" ");

    highestLabel = highestInertia.toFixed(0);
    lowestLabel = lowestInertia.toFixed(0);
    firstPassReadout = curve.inertias[0].toFixed(0);
    restingReadout = finalInertia.toFixed(0);
    passesToRestReadout = String(curve.iterations[restingIndex]);
  }

  return (
    <div>
      <svg
        viewBox={`0 0 ${VIEW.width} ${VIEW.height}`}
        className="w-full select-none rounded-lg bg-slate-50 dark:bg-slate-950"
      >
        <line
          x1={PAD.left}
          y1={PAD.top}
          x2={PAD.left}
          y2={PAD.top + PLOT.height}
          stroke="currentColor"
          className="text-slate-300 dark:text-slate-700"
          strokeWidth={1}
        />
        <line
          x1={PAD.left}
          y1={PAD.top + PLOT.height}
          x2={PAD.left + PLOT.width}
          y2={PAD.top + PLOT.height}
          stroke="currentColor"
          className="text-slate-300 dark:text-slate-700"
          strokeWidth={1}
        />

        {PASS_TICKS.map((passNumber) => (
          <text
            key={`t${passNumber}`}
            x={passNumberToX(passNumber)}
            y={PAD.top + PLOT.height + 18}
            textAnchor="middle"
            className="fill-slate-500 text-xs font-medium dark:fill-slate-400"
          >
            {passNumber}
          </text>
        ))}

        {highestLabel && (
          <text
            x={PAD.left - 8}
            y={PAD.top + 4}
            textAnchor="end"
            className="fill-slate-500 text-xs font-medium dark:fill-slate-400"
          >
            {highestLabel}
          </text>
        )}
        {lowestLabel && (
          <text
            x={PAD.left - 8}
            y={PAD.top + PLOT.height + 4}
            textAnchor="end"
            className="fill-slate-500 text-xs font-medium dark:fill-slate-400"
          >
            {lowestLabel}
          </text>
        )}

        {stepPath && (
          <path
            d={stepPath}
            fill="none"
            stroke="currentColor"
            className="text-slate-400 dark:text-slate-500"
            strokeWidth={1.5}
          />
        )}

        {passDots.map((dot) => (
          <circle
            key={`p${dot.passNumber}`}
            cx={dot.x}
            cy={dot.y}
            r={5}
            className={
              (dot.resting ? "fill-emerald-500" : "fill-indigo-600") +
              " stroke-white dark:stroke-slate-900"
            }
            strokeWidth={1.5}
          />
        ))}

        <text
          x={PAD.left + PLOT.width / 2}
          y={VIEW.height - 6}
          textAnchor="middle"
          className="fill-slate-500 text-xs font-medium dark:fill-slate-400"
        >
          Pass
        </text>
        <text
          x={16}
          y={PAD.top + PLOT.height / 2}
          textAnchor="middle"
          transform={`rotate(-90 16 ${PAD.top + PLOT.height / 2})`}
          className="fill-slate-500 text-xs font-medium dark:fill-slate-400"
        >
          Inertia
        </text>
      </svg>

      <p className="mt-2 text-center text-xs text-slate-500 dark:text-slate-500">
        The total only ever falls or holds still, and where it holds still the
        walk has come to rest.
      </p>

      <div className="mt-3 grid grid-cols-3 gap-3">
        <Stat label="Inertia after one pass" value={firstPassReadout} />
        <Stat label="Resting inertia" value={restingReadout} />
        <Stat label="Passes to rest" value={passesToRestReadout} />
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
      <div className="font-mono text-lg font-semibold text-slate-900 dark:text-slate-100">
        {value}
      </div>
    </div>
  );
}
