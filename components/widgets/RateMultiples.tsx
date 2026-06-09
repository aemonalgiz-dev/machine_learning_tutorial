"use client";

// Four learning rates, the same start, the same data, the same sixty passes.
//
// Each panel is the loss over level and slope with one walk drawn across
// it, and the four rates are chosen to show the four behaviours: a rate so
// small the walk is still far from home when the passes run out, a
// productive rate that arrives directly, a rate that overshoots the slope on
// every pass and still shrinks, and a rate past the threshold whose
// crossings grow until the record has to stop. Under each contour is the
// slope's own cross-section, dots hopping along its parabola for the first
// passes, which is easier to read than the two-dimensional path. Every walk
// is the library's through the API.

import { useEffect, useState } from "react";
import { ApiError, Point } from "@/lib/api";
import { LossSurface, sampleLossSurface } from "@/lib/concepts/gradient-descent-regression";
import { ContourMap } from "./ContourMap";

const WORKED_THREE: Point[] = [
  { x: 165, y: 62 },
  { x: 170, y: 68 },
  { x: 175, y: 68 },
];

const RATES = [
  { rate: 0.005, label: "small, still walking" },
  { rate: 0.02, label: "productive, direct" },
  { rate: 0.055, label: "overshoots, still shrinks" },
  { rate: 0.07, label: "past the threshold" },
];
const PASSES = 60;
const HOPS = 8;

const HOP = { width: 300, height: 120 };
const HOP_PAD = { left: 10, right: 10, top: 10, bottom: 22 };

export function RateMultiples() {
  const [surfaces, setSurfaces] = useState<(LossSurface | null)[]>(RATES.map(() => null));
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setSurfaces(await Promise.all(RATES.map((each) => sampleLossSurface(WORKED_THREE, "centred", each.rate, PASSES))));
      } catch (error) {
        if (error instanceof ApiError) setMessage(error.message);
        else setMessage("Something went wrong.");
      }
    })();
  }, []);

  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-2">
        {RATES.map((each, index) => {
          const surface = surfaces[index];
          return (
            <div key={each.rate} className="rounded-lg border border-slate-200 p-3 dark:border-slate-800">
              <p className="mb-2 text-sm font-medium text-slate-700 dark:text-slate-200">
                rate {each.rate}, {each.label}
              </p>
              {surface ? (
                <>
                  <ContourMap firstAxis={surface.first_axis} secondAxis={surface.second_axis} values={surface.losses} width={300} height={220} firstLabel="level" secondLabel="slope">
                    {({ toX, toY, clampX, clampY }) => (
                      <>
                        <path d={surface.walk.map((step, position) => `${position === 0 ? "M" : "L"} ${clampX(toX(step.first)).toFixed(1)} ${clampY(toY(step.second)).toFixed(1)}`).join(" ")} fill="none" stroke="#0f172a" strokeWidth={1.5} opacity={0.85} />
                        <circle cx={toX(surface.optimum.first)} cy={toY(surface.optimum.second)} r={5} fill="#10b981" stroke="white" strokeWidth={1.5} />
                        <circle cx={clampX(toX(surface.walk[surface.walk.length - 1].first))} cy={clampY(toY(surface.walk[surface.walk.length - 1].second))} r={4} fill="#0f172a" stroke="white" strokeWidth={1.5} />
                      </>
                    )}
                  </ContourMap>
                  <Hops surface={surface} />
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    <Stat label="passes recorded" value={String(surface.walk.length - 1)} />
                    <Stat label="outcome" value={surface.outcome.replace(/_/g, " ")} />
                    <Stat label="loss at the end" value={formatLoss(surface.walk[surface.walk.length - 1].loss)} />
                    <Stat label="slope factor per pass" value={(1 - each.rate * surface.largest_curvature).toFixed(3)} />
                  </div>
                </>
              ) : (
                <p className="text-sm text-slate-500">…</p>
              )}
            </div>
          );
        })}
      </div>
      <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
        The green dot is the closed form, the black dot where the walk stood when the record ended. A run past the threshold is recorded only until its numbers could overflow.
      </p>
      {message && (
        <p className="mt-3 text-sm text-amber-600 dark:text-amber-400">{message}</p>
      )}
    </div>
  );
}

function formatLoss(value: number): string {
  if (value >= 1e6) return value.toExponential(1);
  return value.toFixed(2);
}

// The slope direction on its own: the loss along the slope with the level
// fixed at its optimum is a parabola, and each pass hops along it.
function Hops({ surface }: { surface: LossSurface }) {
  const optimum = surface.optimum.second;
  const curvature = surface.largest_curvature;
  const hops = surface.walk.slice(0, HOPS + 1).map((step) => step.second);
  const reach = Math.max(1, ...hops.map((slope) => Math.abs(slope - optimum))) * 1.15;
  const plot = { width: HOP.width - HOP_PAD.left - HOP_PAD.right, height: HOP.height - HOP_PAD.top - HOP_PAD.bottom };
  const toX = (slope: number) => HOP_PAD.left + ((slope - optimum + reach) / (2 * reach)) * plot.width;
  const top = 0.5 * curvature * reach * reach;
  const toY = (slope: number) => HOP_PAD.top + (1 - (0.5 * curvature * (slope - optimum) ** 2) / top) * plot.height;
  const parabola = Array.from({ length: 61 }, (_, index) => {
    const slope = optimum - reach + (2 * reach * index) / 60;
    return `${index === 0 ? "M" : "L"} ${toX(slope).toFixed(1)} ${toY(slope).toFixed(1)}`;
  }).join(" ");
  return (
    <svg viewBox={`0 0 ${HOP.width} ${HOP.height}`} className="mt-2 w-full select-none rounded-md bg-slate-50 dark:bg-slate-950">
      <path d={parabola} fill="none" stroke="#f59e0b" strokeWidth={2} />
      {hops.slice(1).map((slope, index) => (
        <line key={`hop-${index}`} x1={toX(hops[index])} y1={toY(hops[index])} x2={toX(slope)} y2={toY(slope)} stroke="#0f172a" strokeWidth={1} opacity={0.5} />
      ))}
      {hops.map((slope, index) => (
        <circle key={index} cx={toX(slope)} cy={toY(slope)} r={3.5} fill="#0f172a" stroke="white" strokeWidth={1} />
      ))}
      <text x={HOP.width / 2} y={HOP.height - 6} textAnchor="middle" className="fill-slate-500 text-[10px] dark:fill-slate-400">
        the slope direction on its own, first {HOPS} passes
      </text>
    </svg>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-slate-100 px-2 py-1.5 dark:bg-slate-800">
      <div className="text-[11px] text-slate-500 dark:text-slate-400">{label}</div>
      <div className="font-mono text-sm font-semibold text-slate-900 dark:text-slate-100">{value}</div>
    </div>
  );
}
