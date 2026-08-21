"use client";

// Bagging and the forest under controlled conditions, measured three ways.
//
// Same crowd, same seed, same twenty-five members, same tree settings. The
// only difference is that the forest offers each split one feature of the
// two. For each committee the dashboard gives the root census, which is
// structural diversity; the pairwise prediction agreement and the error
// correlation, which are predictive diversity, measured on rows both
// members of a pair omitted; each member's own out-of-bag strength; and the
// committee's out-of-bag score, which is the only one of these that says
// whether the trade paid. Every number is the library's.

import { useEffect, useState } from "react";
import { ApiError, BaggingAnatomy, fetchBaggingAnatomy } from "@/lib/api";
import { ADULT, CHILD, TANGLED_CROWD } from "./BootstrapMachine";

const MAP = { width: 300, height: 260 };
const PAD = 22;

export function DiversityDashboard() {
  const [bagging, setBagging] = useState<BaggingAnatomy | null>(null);
  const [forest, setForest] = useState<BaggingAnatomy | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const [first, second] = await Promise.all([
          fetchBaggingAnatomy(TANGLED_CROWD, 25),
          fetchBaggingAnatomy(TANGLED_CROWD, 25, undefined, { maxFeatures: 1 }),
        ]);
        setBagging(first);
        setForest(second);
      } catch (error) {
        if (error instanceof ApiError) setMessage(error.message);
        else setMessage("Something went wrong.");
      }
    })();
  }, []);

  if (!bagging || !forest) {
    return <p className="text-sm text-slate-500 dark:text-slate-400">{message ?? "…"}</p>;
  }

  const number = (value: number | null, digits = 3) => (value === null ? "…" : value.toFixed(digits));
  const disagreeingCells = bagging.sizes[24].regions.labels.flat().filter((label, index) => label !== forest.sizes[24].regions.labels.flat()[index]).length;

  const column = (anatomy: BaggingAnatomy, title: string, accent: string) => {
    const committee = anatomy.sizes[anatomy.sizes.length - 1];
    const regions = committee.regions;
    const cell = (MAP.width - 2 * PAD) / regions.cells;
    const mapX = (column: number) => PAD + column * cell;
    const mapY = (row: number) => MAP.height - PAD - (row + 1) * cell;
    const personX = (x: number) => mapX(((x - regions.x_min) / (regions.x_max - regions.x_min)) * (regions.cells - 1)) + cell / 2;
    const personY = (y: number) => mapY(((y - regions.y_min) / (regions.y_max - regions.y_min)) * (regions.cells - 1)) + cell / 2;
    const strengths = anatomy.member_strengths.filter((value): value is number => value !== null);
    return (
      <div className="rounded-lg border p-3" style={{ borderColor: `${accent}66` }}>
        <p className="mb-2 text-sm font-medium" style={{ color: accent }}>{title}</p>
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
        <div className="mt-2 grid grid-cols-2 gap-1.5">
          <Stat label="roots on height, on weight" value={`${anatomy.roots_on_height}, ${anatomy.roots_on_weight}`} />
          <Stat label="pairwise prediction agreement" value={number(anatomy.pairwise_agreement)} />
          <Stat label="pairwise error correlation" value={number(anatomy.error_correlation)} />
          <Stat label="mean member strength, out of bag" value={number(anatomy.mean_strength)} />
          <Stat label="weakest and strongest member" value={strengths.length ? `${Math.min(...strengths).toFixed(2)}, ${Math.max(...strengths).toFixed(2)}` : "…"} />
          <Stat label="committee out-of-bag score" value={number(committee.out_of_bag_accuracy)} />
        </div>
      </div>
    );
  };

  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-2">
        {column(bagging, "Bagging, both features at every split", "#6366f1")}
        {column(forest, "Random forest, one feature at every split", "#10b981")}
      </div>
      <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
        The two maps disagree on {disagreeingCells} of {bagging.sizes[24].regions.cells ** 2} cells. Agreement and error correlation are averaged over every pair of members on the rows both omitted, so nobody is judged on a row they memorised.
      </p>
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
