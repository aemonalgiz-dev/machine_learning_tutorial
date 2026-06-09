"use client";

// Where bagging and the forest disagree, and only there.
//
// Both committees are fitted on the tangled crowd, twenty-five members,
// the same seed and the same tree settings, the forest offered one
// feature per split. The map colours only the cells where the two majority
// classes differ, in the colour of the forest's verdict, and leaves the
// rest blank. The probe reads one cell and reports each committee's vote
// as a count of members, which is the vote margin. Every committee is the
// library's.

import { useEffect, useState } from "react";
import { ApiError, BaggingAnatomy, fetchBaggingAnatomy } from "@/lib/api";
import { ADULT, CHILD, TANGLED_CROWD } from "./BootstrapMachine";

const MAP = { width: 360, height: 320 };
const PAD = 24;
const N_MEMBERS = 25;

export function BoundaryDisagreement() {
  const [bagging, setBagging] = useState<BaggingAnatomy | null>(null);
  const [forest, setForest] = useState<BaggingAnatomy | null>(null);
  const [probe, setProbe] = useState({ row: 12, column: 12 });
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const [first, second] = await Promise.all([
          fetchBaggingAnatomy(TANGLED_CROWD, N_MEMBERS),
          fetchBaggingAnatomy(TANGLED_CROWD, N_MEMBERS, undefined, { maxFeatures: 1 }),
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

  const baggingCommittee = bagging.sizes[N_MEMBERS - 1];
  const forestCommittee = forest.sizes[N_MEMBERS - 1];
  const regions = baggingCommittee.regions;
  const cell = (MAP.width - 2 * PAD) / regions.cells;
  const mapX = (column: number) => PAD + column * cell;
  const mapY = (row: number) => MAP.height - PAD - (row + 1) * cell;
  const personX = (x: number) => mapX(((x - regions.x_min) / (regions.x_max - regions.x_min)) * (regions.cells - 1)) + cell / 2;
  const personY = (y: number) => mapY(((y - regions.y_min) / (regions.y_max - regions.y_min)) * (regions.cells - 1)) + cell / 2;
  const cellX = (column: number) => regions.x_min + ((regions.x_max - regions.x_min) * column) / (regions.cells - 1);
  const cellY = (row: number) => regions.y_min + ((regions.y_max - regions.y_min) * row) / (regions.cells - 1);
  const disagreeing = regions.labels.flatMap((row, rowIndex) => row.map((label, columnIndex) => label !== forestCommittee.regions.labels[rowIndex][columnIndex])).filter(Boolean).length;
  const baggingAdults = Math.round(baggingCommittee.vote_share[probe.row][probe.column] * N_MEMBERS);
  const forestAdults = Math.round(forestCommittee.vote_share[probe.row][probe.column] * N_MEMBERS);
  const verdict = (adults: number) => (adults * 2 > N_MEMBERS ? "adult" : adults * 2 < N_MEMBERS ? "child" : "tie");

  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-[1fr_220px]">
        <svg viewBox={`0 0 ${MAP.width} ${MAP.height}`} className="w-full select-none rounded-lg bg-slate-50 dark:bg-slate-950">
          {regions.labels.map((row, rowIndex) =>
            row.map((label, columnIndex) => {
              const forestLabel = forestCommittee.regions.labels[rowIndex][columnIndex];
              if (label === forestLabel) return null;
              return <rect key={`${rowIndex}-${columnIndex}`} x={mapX(columnIndex)} y={mapY(rowIndex)} width={cell + 0.5} height={cell + 0.5} fill={forestLabel === 0 ? CHILD : ADULT} opacity={0.45} />;
            }),
          )}
          {TANGLED_CROWD.map((person, index) => (
            <circle key={index} cx={personX(person.x)} cy={personY(person.y)} r={3.5} fill={person.label === 0 ? CHILD : ADULT} stroke="white" strokeWidth={1} />
          ))}
          <circle cx={mapX(probe.column) + cell / 2} cy={mapY(probe.row) + cell / 2} r={7} fill="none" stroke="#0f172a" strokeWidth={2.5} className="dark:stroke-slate-100" />
          <text x={MAP.width / 2} y={MAP.height - 6} textAnchor="middle" className="fill-slate-500 text-[10px] dark:fill-slate-400">coloured only where the two committees disagree, in the forest&rsquo;s colour</text>
        </svg>
        <div className="text-sm text-slate-600 dark:text-slate-300">
          <label className="flex items-center gap-2 text-xs">
            height
            <input type="range" min={0} max={regions.cells - 1} step={1} value={probe.column} onChange={(event) => setProbe({ ...probe, column: Number(event.target.value) })} className="flex-1 accent-slate-600" />
          </label>
          <label className="mt-1 flex items-center gap-2 text-xs">
            weight
            <input type="range" min={0} max={regions.cells - 1} step={1} value={probe.row} onChange={(event) => setProbe({ ...probe, row: Number(event.target.value) })} className="flex-1 accent-slate-600" />
          </label>
          <div className="mt-3 rounded-md bg-slate-100 px-3 py-2 font-mono text-xs text-slate-800 dark:bg-slate-800 dark:text-slate-200">
            <p>probe {cellX(probe.column).toFixed(0)} cm, {cellY(probe.row).toFixed(0)} kg</p>
            <p className="mt-1" style={{ color: "#6366f1" }}>bagging {baggingAdults} adult, {N_MEMBERS - baggingAdults} child, says {verdict(baggingAdults)}</p>
            <p style={{ color: "#10b981" }}>forest {forestAdults} adult, {N_MEMBERS - forestAdults} child, says {verdict(forestAdults)}</p>
            <p className="mt-1 text-slate-500 dark:text-slate-400">{verdict(baggingAdults) === verdict(forestAdults) ? "the committees agree here" : "the committees disagree here"}</p>
          </div>
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            The two majorities differ on {disagreeing} of {regions.cells * regions.cells} cells.
          </p>
        </div>
      </div>
    </div>
  );
}
