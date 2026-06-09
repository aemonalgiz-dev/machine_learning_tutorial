"use client";

// The arc under the radial kernel, which folds it rather than unrolling it.
//
// Left, the twelve people along the bend, shaded from indigo at the short
// end to amber at the tall end. Right, the same people placed by their first
// two kernel directions, where the bend comes back as a bend. Beneath, two
// number lines: ordinary PCA's first axis, which reads the people in height
// order with no reversal, and the kernel's first axis, which sends both ends
// of the arc to the same side and the middle to the other. The readouts
// count how often each axis turns back when the people are read by height.
// The API fits both and counts; the browser shades and places.

import { useEffect, useState } from "react";
import { ApiError, Lifted, fetchLifted } from "@/lib/concepts/kernel-pca";
import { ARC, ARC_GAMMA, GAMMA_STOPS, gammaIndex, heightShade } from "./kernelPcaFixtures";

const PANEL = { width: 300, height: 240 };
const PAD = { left: 34, right: 10, top: 10, bottom: 28 };
const LINE = { width: 640, height: 44 };
const DOMAIN = { xMin: 112, xMax: 208, yMin: 24, yMax: 90 };

function tidy(value: number, digits: number): string {
  const rounded = Number(value.toFixed(digits));
  return (Object.is(rounded, -0) ? 0 : rounded).toFixed(digits);
}

export function ArcFold() {
  const [gammaStop, setGammaStop] = useState(gammaIndex(ARC_GAMMA));
  const [lifted, setLifted] = useState<Lifted | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const gamma = GAMMA_STOPS[gammaStop];

  useEffect(() => {
    const timer = setTimeout(async () => {
      try {
        setLifted(await fetchLifted(ARC, "rbf", gamma));
        setMessage(null);
      } catch (error) {
        if (error instanceof ApiError) setMessage(error.message);
        else setMessage("Something went wrong.");
      }
    }, 60);
    return () => clearTimeout(timer);
  }, [gamma]);

  if (!lifted) {
    return <p className="text-sm text-slate-500 dark:text-slate-400">{message ?? "…"}</p>;
  }

  const plotX = (value: number) => PAD.left + ((value - DOMAIN.xMin) / (DOMAIN.xMax - DOMAIN.xMin)) * (PANEL.width - PAD.left - PAD.right);
  const plotY = (value: number) => PAD.top + (1 - (value - DOMAIN.yMin) / (DOMAIN.yMax - DOMAIN.yMin)) * (PANEL.height - PAD.top - PAD.bottom);
  const firstReach = Math.max(...lifted.coordinates.map((row) => Math.abs(row[0])), 1e-9) * 1.15;
  const secondReach = Math.max(...lifted.coordinates.map((row) => Math.abs(row[1])), 1e-9) * 1.15;
  const placeX = (value: number) => PAD.left + (value / (2 * firstReach) + 0.5) * (PANEL.width - PAD.left - PAD.right);
  const placeY = (value: number) => PAD.top + (0.5 - value / (2 * secondReach)) * (PANEL.height - PAD.top - PAD.bottom);
  const ordinaryFirst = lifted.ordinary_coordinates.map((entry) => entry.first);
  const kernelFirst = lifted.coordinates.map((row) => row[0]);

  const numberLine = (values: number[], title: string) => {
    const reach = Math.max(...values.map((value) => Math.abs(value)), 1e-9) * 1.1;
    const lineX = (value: number) => 40 + ((value + reach) / (2 * reach)) * (LINE.width - 52);
    return (
      <svg viewBox={`0 0 ${LINE.width} ${LINE.height}`} className="w-full select-none">
        <line x1={40} x2={LINE.width - 12} y1={LINE.height / 2} y2={LINE.height / 2} className="stroke-slate-400" strokeWidth={1.5} />
        <line x1={lineX(0)} x2={lineX(0)} y1={LINE.height / 2 - 7} y2={LINE.height / 2 + 7} className="stroke-slate-400" strokeWidth={1} />
        {values.map((value, index) => (
          <circle key={index} cx={lineX(value)} cy={LINE.height / 2} r={5.5} fill={heightShade(ARC[index].x)} stroke="white" strokeWidth={1.5} />
        ))}
        <text x={40} y={LINE.height - 4} className="fill-slate-500 text-[10px] dark:fill-slate-400">{title}</text>
      </svg>
    );
  };

  return (
    <div>
      <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
        gamma
        <input type="range" min={0} max={GAMMA_STOPS.length - 1} step={1} value={gammaStop} onChange={(event) => setGammaStop(Number(event.target.value))} className="flex-1 accent-indigo-600" />
        <span className="w-14 text-right font-mono">{gamma}</span>
        <span className="text-xs text-slate-500 dark:text-slate-400">reach {tidy(lifted.reach, 1)}</span>
      </label>
      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <svg viewBox={`0 0 ${PANEL.width} ${PANEL.height}`} className="w-full select-none rounded-lg bg-slate-50 dark:bg-slate-950">
          {ARC.map((point, index) => (
            <circle key={index} cx={plotX(point.x)} cy={plotY(point.y)} r={5.5} fill={heightShade(point.x)} stroke="white" strokeWidth={1.5} />
          ))}
          <text x={PAD.left + (PANEL.width - PAD.left - PAD.right) / 2} y={PANEL.height - 8} textAnchor="middle" className="fill-slate-500 text-xs dark:fill-slate-400">height, cm</text>
          <text x={12} y={PANEL.height / 2} textAnchor="middle" transform={`rotate(-90 12 ${PANEL.height / 2})`} className="fill-slate-500 text-xs dark:fill-slate-400">weight, kg</text>
        </svg>
        <svg viewBox={`0 0 ${PANEL.width} ${PANEL.height}`} className="w-full select-none rounded-lg bg-slate-50 dark:bg-slate-950">
          <line x1={PAD.left} x2={PANEL.width - PAD.right} y1={placeY(0)} y2={placeY(0)} className="stroke-slate-200 dark:stroke-slate-800" strokeWidth={1} />
          <line x1={placeX(0)} x2={placeX(0)} y1={PAD.top} y2={PANEL.height - PAD.bottom} className="stroke-slate-200 dark:stroke-slate-800" strokeWidth={1} />
          {lifted.coordinates.map((row, index) => (
            <circle key={index} cx={placeX(row[0])} cy={placeY(row[1])} r={5.5} fill={heightShade(ARC[index].x)} stroke="white" strokeWidth={1.5} />
          ))}
          <text x={PAD.left + (PANEL.width - PAD.left - PAD.right) / 2} y={PANEL.height - 8} textAnchor="middle" className="fill-slate-500 text-xs dark:fill-slate-400">kernel component 1</text>
          <text x={12} y={PANEL.height / 2} textAnchor="middle" transform={`rotate(-90 12 ${PANEL.height / 2})`} className="fill-slate-500 text-xs dark:fill-slate-400">kernel component 2</text>
        </svg>
      </div>
      {numberLine(ordinaryFirst, "ordinary PCA, first axis")}
      {numberLine(kernelFirst, "radial kernel, first axis")}
      <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Stat label="reversals along height, ordinary first axis" value={String(lifted.ordinary_order_reversals_along_x)} />
        <Stat label="reversals along height, kernel first axis" value={String(lifted.order_reversals_along_x)} />
        <Stat label="shares, first two kernel directions" value={`${tidy(lifted.components[0].share, 3)}, ${tidy(lifted.components[1].share, 3)}`} />
        <Stat label="directions with any spread, of n" value={`${lifted.rank} of ${lifted.n_rows}`} />
      </div>
      {message && <p className="mt-2 text-sm text-amber-600 dark:text-amber-400">{message}</p>}
    </div>
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
