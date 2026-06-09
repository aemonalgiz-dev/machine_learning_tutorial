"use client";

// One column per committee member: the resample it saw, the tree it grew,
// the map it draws.
//
// Pick a member and the plot shows the crowd with each person sized by how
// many times that member drew them, omitted people hollow, and the member's
// own decision map behind them. The readouts give its root question, depth
// and leaf count, and the strip along the bottom lists every member's root
// question so the variety, and the sameness, can be read at a glance. The
// histogram beside it is how many people each member omitted, with the
// expected count marked. Every tree and every draw is the library's.

import { useEffect, useState } from "react";
import { ApiError, BaggingAnatomy, fetchBaggingAnatomy } from "@/lib/api";
import { ADULT, CHILD, TANGLED_CROWD } from "./BootstrapMachine";

const MAP = { width: 320, height: 300 };
const PAD = 26;

export function BootstrapGallery() {
  const [anatomy, setAnatomy] = useState<BaggingAnatomy | null>(null);
  const [member, setMember] = useState(0);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setAnatomy(await fetchBaggingAnatomy(TANGLED_CROWD, 25));
      } catch (error) {
        if (error instanceof ApiError) setMessage(error.message);
        else setMessage("Something went wrong.");
      }
    })();
  }, []);

  if (!anatomy) {
    return <p className="text-sm text-slate-500 dark:text-slate-400">{message ?? "…"}</p>;
  }

  const chosen = anatomy.members[member];
  const regions = chosen.regions;
  const cell = (MAP.width - 2 * PAD) / regions.cells;
  const mapX = (column: number) => PAD + column * cell;
  const mapY = (row: number) => MAP.height - PAD - (row + 1) * cell;
  const personX = (x: number) => mapX(((x - regions.x_min) / (regions.x_max - regions.x_min)) * (regions.cells - 1)) + cell / 2;
  const personY = (y: number) => mapY(((y - regions.y_min) / (regions.y_max - regions.y_min)) * (regions.cells - 1)) + cell / 2;

  const omittedCounts = anatomy.members.map((each) => each.omitted_rows);
  const histogram = new Map<number, number>();
  for (const count of omittedCounts) histogram.set(count, (histogram.get(count) ?? 0) + 1);
  const bins = Array.from({ length: 12 }, (_, index) => index + 4);
  const tallest = Math.max(1, ...Array.from(histogram.values()));

  return (
    <div>
      <label className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
        member
        <input type="range" min={0} max={anatomy.members.length - 1} step={1} value={member} onChange={(event) => setMember(Number(event.target.value))} className="flex-1 accent-indigo-600" />
        <span className="w-16 text-right font-mono">tree {member + 1}</span>
      </label>
      <div className="mt-3 grid gap-4 sm:grid-cols-2">
        <div>
          <svg viewBox={`0 0 ${MAP.width} ${MAP.height}`} className="w-full select-none rounded-lg bg-slate-50 dark:bg-slate-950">
            {regions.labels.map((row, rowIndex) =>
              row.map((label, columnIndex) => (
                <rect key={`${rowIndex}-${columnIndex}`} x={mapX(columnIndex)} y={mapY(rowIndex)} width={cell + 0.5} height={cell + 0.5} fill={label === 0 ? CHILD : ADULT} opacity={0.2} />
              )),
            )}
            {TANGLED_CROWD.map((person, index) => {
              const times = chosen.multiplicities[index];
              return (
                <circle key={index} cx={personX(person.x)} cy={personY(person.y)} r={times === 0 ? 4 : 3 + 2 * times} fill={times === 0 ? "none" : person.label === 0 ? CHILD : ADULT} stroke={person.label === 0 ? CHILD : ADULT} strokeWidth={times === 0 ? 1.5 : 1} opacity={times === 0 ? 0.7 : 0.9} />
              );
            })}
            <text x={MAP.width / 2} y={MAP.height - 6} textAnchor="middle" className="fill-slate-500 text-[10px] dark:fill-slate-400">
              dots sized by how many times tree {member + 1} drew each person, hollow if never
            </text>
          </svg>
          <div className="mt-2 grid grid-cols-2 gap-2">
            <Stat label="root question" value={chosen.root_feature ? `${chosen.root_feature} < ${chosen.root_threshold}` : "none"} />
            <Stat label="depth, leaves" value={`${chosen.depth}, ${chosen.n_leaves}`} />
            <Stat label="distinct people seen" value={String(chosen.distinct_rows)} />
            <Stat label="people never seen" value={String(chosen.omitted_rows)} />
          </div>
        </div>
        <div>
          <p className="mb-1 text-sm font-medium text-slate-700 dark:text-slate-200">How many each member never saw</p>
          <svg viewBox="0 0 320 180" className="w-full select-none rounded-lg bg-slate-50 dark:bg-slate-950">
            {bins.map((bin, index) => {
              const count = histogram.get(bin) ?? 0;
              const x = 24 + index * 23;
              const height = (count / tallest) * 120;
              return (
                <g key={bin}>
                  <rect x={x} y={140 - height} width={18} height={height} className="fill-indigo-500" opacity={0.8} />
                  <text x={x + 9} y={156} textAnchor="middle" className="fill-slate-400 text-[10px]">{bin}</text>
                  {count > 0 && <text x={x + 9} y={136 - height} textAnchor="middle" className="fill-slate-600 text-[10px] dark:fill-slate-300">{count}</text>}
                </g>
              );
            })}
            <line x1={24 + (anatomy.expected_omitted - 4) * 23 + 9} y1={12} x2={24 + (anatomy.expected_omitted - 4) * 23 + 9} y2={144} stroke="#10b981" strokeWidth={2} strokeDasharray="4 3" />
            <text x={24 + (anatomy.expected_omitted - 4) * 23 + 14} y={22} className="fill-emerald-700 text-[10px] dark:fill-emerald-300">expected {anatomy.expected_omitted.toFixed(1)}</text>
            <text x={160} y={174} textAnchor="middle" className="fill-slate-500 text-[10px] dark:fill-slate-400">people omitted, across the {anatomy.members.length} members</text>
          </svg>
          <p className="mt-2 text-xs font-medium text-slate-700 dark:text-slate-200">Every member&rsquo;s root question</p>
          <div className="mt-1 flex flex-wrap gap-1">
            {anatomy.members.map((each) => (
              <button key={each.position} onClick={() => setMember(each.position)} className={`rounded px-1.5 py-0.5 font-mono text-[10px] transition ${each.position === member ? "bg-slate-800 text-white dark:bg-slate-100 dark:text-slate-900" : each.root_feature === "height" ? "bg-indigo-100 text-indigo-800 dark:bg-indigo-950/50 dark:text-indigo-200" : "bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-200"}`}>
                {each.root_feature === "height" ? "h" : "w"} &lt; {each.root_threshold}
              </button>
            ))}
          </div>
          <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">{anatomy.roots_on_height} root on height, {anatomy.roots_on_weight} on weight.</p>
        </div>
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
