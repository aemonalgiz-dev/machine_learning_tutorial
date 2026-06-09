"use client";

// The committee forming one tree at a time, and how firmly it agrees.
//
// The slider sets how many members sit on the committee, and the API has
// refitted the library's committee at every size from one up, so each
// position is a real committee and not a prefix read off a bigger one. The
// left map is the majority class. The right map is the share of members
// voting for the winning class, dark where they agree and pale where a
// vote could go either way, which is a different picture from the winner
// alone. The readouts track the training score, the out-of-bag score and
// how many cells changed their majority since one member fewer. The probe
// reads both maps at one cell. With maxFeatures set the committee is a
// random forest, each split offered that many features. Every committee is
// the library's.

import { useEffect, useState } from "react";
import { ApiError, BaggingAnatomy, fetchBaggingAnatomy } from "@/lib/api";
import { ADULT, CHILD, TANGLED_CROWD } from "./BootstrapMachine";

const MAP = { width: 300, height: 280 };
const PAD = 24;

export function CommitteeScrubber({ memberDepth, maxFeatures }: { memberDepth?: number; maxFeatures?: number }) {
  const [anatomy, setAnatomy] = useState<BaggingAnatomy | null>(null);
  const [size, setSize] = useState(1);
  const [probe, setProbe] = useState({ row: 10, column: 12 });
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setAnatomy(await fetchBaggingAnatomy(TANGLED_CROWD, 25, memberDepth, { maxFeatures }));
      } catch (error) {
        if (error instanceof ApiError) setMessage(error.message);
        else setMessage("Something went wrong.");
      }
    })();
  }, [memberDepth, maxFeatures]);

  if (!anatomy) {
    return <p className="text-sm text-slate-500 dark:text-slate-400">{message ?? "…"}</p>;
  }

  const committee = anatomy.sizes[size - 1];
  const regions = committee.regions;
  const cell = (MAP.width - 2 * PAD) / regions.cells;
  const mapX = (column: number) => PAD + column * cell;
  const mapY = (row: number) => MAP.height - PAD - (row + 1) * cell;
  const personX = (x: number) => mapX(((x - regions.x_min) / (regions.x_max - regions.x_min)) * (regions.cells - 1)) + cell / 2;
  const personY = (y: number) => mapY(((y - regions.y_min) / (regions.y_max - regions.y_min)) * (regions.cells - 1)) + cell / 2;
  const cellX = (column: number) => regions.x_min + ((regions.x_max - regions.x_min) * column) / (regions.cells - 1);
  const cellY = (row: number) => regions.y_min + ((regions.y_max - regions.y_min) * row) / (regions.cells - 1);
  const adultShare = committee.vote_share[probe.row][probe.column];
  const winner = regions.labels[probe.row][probe.column];
  const agreement = winner === 1 ? adultShare : 1 - adultShare;

  return (
    <div>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-600 dark:text-slate-300">
        <label className="flex flex-1 items-center gap-2">
          members
          <input type="range" min={1} max={anatomy.sizes.length} step={1} value={size} onChange={(event) => setSize(Number(event.target.value))} className="flex-1 accent-indigo-600" />
          <span className="w-8 text-right font-mono">{size}</span>
        </label>
        <label className="flex items-center gap-2">
          probe
          <input type="range" min={0} max={regions.cells - 1} step={1} value={probe.column} onChange={(event) => setProbe({ ...probe, column: Number(event.target.value) })} className="w-20 accent-slate-600" />
          <input type="range" min={0} max={regions.cells - 1} step={1} value={probe.row} onChange={(event) => setProbe({ ...probe, row: Number(event.target.value) })} className="w-20 accent-slate-600" />
          <span className="w-20 font-mono text-xs">{cellX(probe.column).toFixed(0)} cm, {cellY(probe.row).toFixed(0)} kg</span>
        </label>
      </div>
      <div className="mt-3 grid gap-4 sm:grid-cols-2">
        <div>
          <p className="mb-1 text-sm font-medium text-slate-700 dark:text-slate-200">The majority at every cell</p>
          <svg viewBox={`0 0 ${MAP.width} ${MAP.height}`} className="w-full select-none rounded-lg bg-slate-50 dark:bg-slate-950">
            {regions.labels.map((row, rowIndex) =>
              row.map((label, columnIndex) => (
                <rect key={`${rowIndex}-${columnIndex}`} x={mapX(columnIndex)} y={mapY(rowIndex)} width={cell + 0.5} height={cell + 0.5} fill={label === 0 ? CHILD : ADULT} opacity={0.25} />
              )),
            )}
            {TANGLED_CROWD.map((person, index) => (
              <circle key={index} cx={personX(person.x)} cy={personY(person.y)} r={3.5} fill={person.label === 0 ? CHILD : ADULT} stroke="white" strokeWidth={1} />
            ))}
            <circle cx={mapX(probe.column) + cell / 2} cy={mapY(probe.row) + cell / 2} r={7} fill="none" stroke="#0f172a" strokeWidth={2.5} className="dark:stroke-slate-100" />
          </svg>
        </div>
        <div>
          <p className="mb-1 text-sm font-medium text-slate-700 dark:text-slate-200">How firmly the members agree</p>
          <svg viewBox={`0 0 ${MAP.width} ${MAP.height}`} className="w-full select-none rounded-lg bg-slate-50 dark:bg-slate-950">
            {committee.vote_share.map((row, rowIndex) =>
              row.map((share, columnIndex) => {
                const label = regions.labels[rowIndex][columnIndex];
                const strength = label === 1 ? share : 1 - share;
                return (
                  <rect key={`${rowIndex}-${columnIndex}`} x={mapX(columnIndex)} y={mapY(rowIndex)} width={cell + 0.5} height={cell + 0.5} fill={label === 0 ? CHILD : ADULT} opacity={0.05 + 0.75 * Math.max(0, (strength - 0.5) * 2)} />
                );
              }),
            )}
            <circle cx={mapX(probe.column) + cell / 2} cy={mapY(probe.row) + cell / 2} r={7} fill="none" stroke="#0f172a" strokeWidth={2.5} className="dark:stroke-slate-100" />
            <text x={MAP.width / 2} y={MAP.height - 6} textAnchor="middle" className="fill-slate-500 text-[10px] dark:fill-slate-400">pale is a near tie, dark is near unanimity</text>
          </svg>
        </div>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-5">
        <Stat label="training accuracy" value={committee.train_accuracy.toFixed(3)} />
        <Stat label="out-of-bag accuracy" value={committee.out_of_bag_accuracy === null ? "no judges" : committee.out_of_bag_accuracy.toFixed(3)} />
        <Stat label="people with a judge" value={`${committee.out_of_bag_covered} of ${anatomy.n_rows}`} />
        <Stat label="cells changed since one fewer" value={size === 1 ? "…" : String(committee.changed_cells)} />
        <Stat label="at the probe" value={`${winner === 1 ? "adult" : "child"}, ${(agreement * 100).toFixed(0)}% agree`} />
      </div>
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
