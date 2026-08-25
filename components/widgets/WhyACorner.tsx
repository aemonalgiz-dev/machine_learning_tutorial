"use client";

// A corner, the middle of an edge and flat ground, read three ways.
//
// The three cards each draw the nine gradient vectors inside the averaging
// window at that position, which is where the whole argument lives: on an edge
// every arrow points one way, at a corner they point two ways, on flat ground
// there are no arrows at all. Under each drawing are the numbers that summarise
// those arrows, and the two scores read off them. The second view is the same
// picture scored with windows of five widths, which is the setting nobody can
// choose for you. The API computes the gradients, the tensor and both scores;
// the browser draws the arrows.

import { useEffect, useState } from "react";
import { ApiError } from "@/lib/api";
import {
  GradientVector,
  ProbeReport,
  WhyACorner as WhyACornerReport,
  fetchWhyACorner,
} from "@/lib/concepts/keypoints-and-descriptors";
import { CORNER, Caption, MARK, PixelGrid, WINDOW, greyShade } from "./keypointDrawing";

const CELL = 38;

function ArrowGrid({ gradients }: { gradients: GradientVector[][] }) {
  const longest = Math.max(
    1e-9,
    ...gradients.flatMap((row) =>
      row.map((vector) => Math.hypot(vector.across, vector.down)),
    ),
  );
  const anyArrow = gradients.some((row) =>
    row.some((vector) => Math.hypot(vector.across, vector.down) > 0),
  );
  return (
    <svg
      viewBox={`0 0 ${3 * CELL} ${3 * CELL}`}
      className="w-full max-w-[190px] select-none rounded-md bg-slate-100 dark:bg-slate-900"
    >
      {[0, 1, 2].map((row) =>
        [0, 1, 2].map((column) => {
          const vector = gradients[row][column];
          const length = Math.hypot(vector.across, vector.down);
          const centreX = (column + 0.5) * CELL;
          const centreY = (row + 0.5) * CELL;
          const reach = (length / longest) * (CELL * 0.4);
          const tipX = centreX + (length > 0 ? (vector.across / length) * reach : 0);
          const tipY = centreY + (length > 0 ? (vector.down / length) * reach : 0);
          return (
            <g key={`${row},${column}`}>
              <rect
                x={column * CELL + 1}
                y={row * CELL + 1}
                width={CELL - 2}
                height={CELL - 2}
                className="fill-white dark:fill-slate-800"
              />
              {length > 0 ? (
                <>
                  <line
                    x1={centreX}
                    y1={centreY}
                    x2={tipX}
                    y2={tipY}
                    stroke={CORNER}
                    strokeWidth={2.5}
                  />
                  <circle cx={tipX} cy={tipY} r={3} fill={CORNER} />
                </>
              ) : (
                <circle
                  cx={centreX}
                  cy={centreY}
                  r={2}
                  className="fill-slate-400 dark:fill-slate-600"
                />
              )}
            </g>
          );
        }),
      )}
      {!anyArrow && (
        <text
          x={(3 * CELL) / 2}
          y={3 * CELL - 6}
          textAnchor="middle"
          className="fill-slate-500 text-[11px] dark:fill-slate-400"
        >
          nothing changes here
        </text>
      )}
    </svg>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-2 border-b border-slate-100 py-1 last:border-0 dark:border-slate-800">
      <span className="text-[11px] text-slate-500 dark:text-slate-400">
        {label}
      </span>
      <span className="font-mono text-xs text-slate-800 dark:text-slate-200">
        {value}
      </span>
    </div>
  );
}

function ProbeCard({ probe }: { probe: ProbeReport }) {
  return (
    <div className="rounded-lg border border-slate-200 p-3 dark:border-slate-800">
      <p className="mb-2 text-sm font-semibold text-slate-800 dark:text-slate-200">
        {probe.name}
      </p>
      <ArrowGrid gradients={probe.gradients} />
      <div className="mt-2">
        <Row label="across energy" value={probe.horizontal_squared.toFixed(4)} />
        <Row label="down energy" value={probe.vertical_squared.toFixed(4)} />
        <Row label="shared term" value={probe.cross.toFixed(4)} />
        <Row label="total energy" value={probe.trace.toFixed(4)} />
        <Row label="shape term" value={probe.determinant.toFixed(4)} />
        <Row
          label="smaller eigenvalue"
          value={probe.smallest_eigenvalue.toFixed(4)}
        />
        <Row label="Harris score" value={probe.harris.toFixed(4)} />
      </div>
    </div>
  );
}

export function WhyACorner({ show = "probes" }: { show?: "probes" | "window" }) {
  const [report, setReport] = useState<WhyACornerReport | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setReport(await fetchWhyACorner());
      } catch (error) {
        if (error instanceof ApiError) setMessage(error.message);
        else setMessage("Something went wrong.");
      }
    })();
  }, []);

  if (!report) {
    return (
      <p className="text-sm text-slate-500 dark:text-slate-400">
        {message ?? "…"}
      </p>
    );
  }

  if (show === "window") {
    const widest = Math.max(...report.window_sweep.map((step) => step.n_keypoints), 1);
    return (
      <div className="rounded-lg border border-slate-200 p-4 dark:border-slate-800">
        <div className="space-y-2">
          {report.window_sweep.map((step) => (
            <div key={step.window_side} className="flex items-center gap-3">
              <span className="w-24 shrink-0 font-mono text-xs text-slate-600 dark:text-slate-400">
                {step.window_side} by {step.window_side}
              </span>
              <span className="w-28 shrink-0 font-mono text-xs text-slate-800 dark:text-slate-200">
                {step.corner_score.toFixed(4)}
              </span>
              <span className="flex h-4 flex-1 items-center">
                <span
                  className="h-3 rounded-sm"
                  style={{
                    width: `${Math.max(2, (100 * step.n_keypoints) / widest)}%`,
                    backgroundColor: step.n_keypoints === 4 ? WINDOW : MARK,
                  }}
                />
              </span>
              <span className="w-24 shrink-0 text-right font-mono text-xs text-slate-600 dark:text-slate-400">
                {step.n_keypoints} kept
              </span>
            </div>
          ))}
        </div>
        <Caption>
          the width of the averaging window, the score it gives the square&rsquo;s
          top-left corner, and how many places it ends up keeping. The square has
          four corners, so only the second row is answering the question that was
          asked.
        </Caption>
      </div>
    );
  }

  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-[160px_1fr]">
        <div>
          <PixelGrid
            rows={report.picture}
            shade={greyShade(0, 1)}
            cell={7}
            marks={report.probes.map((probe) => ({
              row: probe.row,
              column: probe.column,
            }))}
          />
          <Caption>the three positions read below</Caption>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          {report.probes.map((probe) => (
            <ProbeCard key={probe.name} probe={probe} />
          ))}
        </div>
      </div>
      <Caption>
        each small grid is the nine gradient vectors inside the averaging
        window, drawn from the middle of their own pixel
      </Caption>
    </div>
  );
}
