"use client";

// Bagging deep trees beside bagging stumps, on one crowd.
//
// The left committee is twenty-five deep trees, the canonical bagged
// ensemble, whose members disagree with each other in the tangled middle
// and whose vote settles that disagreement. The right committee is
// twenty-five stumps, trees allowed one question each, and every one of
// them makes the same kind of mistake because none of them can ask the
// second question the crowd needs. Averaging cannot supply what no member
// has, so the stump committee stays wrong in the same places however many
// members it gets. Both committees and both size sweeps are the library's.

import { useEffect, useState } from "react";
import { ApiError, BaggingAnatomy, fetchBaggingAnatomy } from "@/lib/api";
import { ADULT, CHILD, TANGLED_CROWD } from "./BootstrapMachine";

const MAP = { width: 300, height: 260 };
const PAD = 24;
const CHART = { width: 300, height: 160 };
const CHART_PAD = { left: 40, right: 10, top: 10, bottom: 26 };

export function BiasVersusVariance() {
  const [deep, setDeep] = useState<BaggingAnatomy | null>(null);
  const [stumps, setStumps] = useState<BaggingAnatomy | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const [first, second] = await Promise.all([
          fetchBaggingAnatomy(TANGLED_CROWD, 25),
          fetchBaggingAnatomy(TANGLED_CROWD, 25, 1),
        ]);
        setDeep(first);
        setStumps(second);
      } catch (error) {
        if (error instanceof ApiError) setMessage(error.message);
        else setMessage("Something went wrong.");
      }
    })();
  }, []);

  if (!deep || !stumps) {
    return <p className="text-sm text-slate-500 dark:text-slate-400">{message ?? "…"}</p>;
  }

  const panel = (anatomy: BaggingAnatomy, title: string) => {
    const committee = anatomy.sizes[anatomy.sizes.length - 1];
    const regions = committee.regions;
    const cell = (MAP.width - 2 * PAD) / regions.cells;
    const mapX = (column: number) => PAD + column * cell;
    const mapY = (row: number) => MAP.height - PAD - (row + 1) * cell;
    const personX = (x: number) => mapX(((x - regions.x_min) / (regions.x_max - regions.x_min)) * (regions.cells - 1)) + cell / 2;
    const personY = (y: number) => mapY(((y - regions.y_min) / (regions.y_max - regions.y_min)) * (regions.cells - 1)) + cell / 2;
    const plot = { width: CHART.width - CHART_PAD.left - CHART_PAD.right, height: CHART.height - CHART_PAD.top - CHART_PAD.bottom };
    const toX = (size: number) => CHART_PAD.left + ((size - 1) / (anatomy.sizes.length - 1)) * plot.width;
    const toY = (accuracy: number) => CHART_PAD.top + (1 - accuracy) * plot.height;
    return (
      <div>
        <p className="mb-1 text-sm font-medium text-slate-700 dark:text-slate-200">{title}</p>
        <svg viewBox={`0 0 ${MAP.width} ${MAP.height}`} className="w-full select-none rounded-lg bg-slate-50 dark:bg-slate-950">
          {regions.labels.map((row, rowIndex) =>
            row.map((label, columnIndex) => (
              <rect key={`${rowIndex}-${columnIndex}`} x={mapX(columnIndex)} y={mapY(rowIndex)} width={cell + 0.5} height={cell + 0.5} fill={label === 0 ? CHILD : ADULT} opacity={0.25} />
            )),
          )}
          {TANGLED_CROWD.map((person, index) => (
            <circle key={index} cx={personX(person.x)} cy={personY(person.y)} r={3.5} fill={person.label === 0 ? CHILD : ADULT} stroke="white" strokeWidth={1} />
          ))}
        </svg>
        <svg viewBox={`0 0 ${CHART.width} ${CHART.height}`} className="mt-2 w-full select-none rounded-lg bg-slate-50 dark:bg-slate-950">
          {[0.5, 0.75, 1].map((tick) => (
            <g key={tick}>
              <line x1={CHART_PAD.left} y1={toY(tick)} x2={CHART_PAD.left + plot.width} y2={toY(tick)} stroke="currentColor" className="text-slate-200 dark:text-slate-800" />
              <text x={CHART_PAD.left - 6} y={toY(tick) + 4} textAnchor="end" className="fill-slate-400 text-[10px]">{tick}</text>
            </g>
          ))}
          <path d={anatomy.sizes.map((size, index) => `${index === 0 ? "M" : "L"} ${toX(size.n_members).toFixed(1)} ${toY(size.train_accuracy).toFixed(1)}`).join(" ")} fill="none" stroke="#6366f1" strokeWidth={2} />
          <path d={anatomy.sizes.filter((size) => size.out_of_bag_accuracy !== null).map((size, index) => `${index === 0 ? "M" : "L"} ${toX(size.n_members).toFixed(1)} ${toY(size.out_of_bag_accuracy!).toFixed(1)}`).join(" ")} fill="none" stroke="#f59e0b" strokeWidth={2} />
          <text x={CHART_PAD.left + 4} y={CHART_PAD.top + 12} className="text-[10px] font-medium" fill="#6366f1">training</text>
          <text x={CHART_PAD.left + 4} y={CHART_PAD.top + 24} className="text-[10px] font-medium" fill="#f59e0b">out of bag</text>
          {[1, 13, 25].map((tick) => (
            <text key={tick} x={toX(tick)} y={CHART_PAD.top + plot.height + 12} textAnchor="middle" className="fill-slate-400 text-[10px]">{tick}</text>
          ))}
          <text x={CHART_PAD.left + plot.width / 2} y={CHART.height - 2} textAnchor="middle" className="fill-slate-500 text-[10px] dark:fill-slate-400">members</text>
        </svg>
        <div className="mt-2 grid grid-cols-2 gap-2">
          <Stat label="training accuracy at 25" value={committee.train_accuracy.toFixed(3)} />
          <Stat label="out-of-bag accuracy at 25" value={committee.out_of_bag_accuracy === null ? "…" : committee.out_of_bag_accuracy.toFixed(3)} />
        </div>
      </div>
    );
  };

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {panel(deep, "Twenty-five deep trees")}
      {panel(stumps, "Twenty-five stumps, one question each")}
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
