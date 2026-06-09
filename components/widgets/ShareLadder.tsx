"use client";

// How much of each person's lifted deviation the kept directions carry.
//
// There is no way back to height and weight from a kernel coordinate, so
// what a fit can say about a person is how much of their distance from the
// lifted mean the kept directions hold. Every direction is kept, and the
// slider chooses how many count. The top row is the running share of the
// total, one bar per direction; the bottom row is each person's kept share
// at that count, indigo for the inner twelve and amber for the outer. The
// library fits and reports every coordinate and every lifted deviation; the
// browser sums the first k squared coordinates, which is the definition of
// what k directions keep.

import { useEffect, useState } from "react";
import { ApiError, Lifted, fetchLifted } from "@/lib/concepts/kernel-pca";
import { ARC, ARC_GAMMA, FIRST, INNER, INNER_COUNT, OUTER, RING, RING_GAMMA, heightShade } from "./kernelPcaFixtures";

const VIEW = { width: 640, height: 120 };
const PAD = { left: 36, right: 12, top: 10, bottom: 18 };

const ladders = new Map<"ring" | "arc", Promise<Lifted>>();

function ladderFor(cloud: "ring" | "arc"): Promise<Lifted> {
  const cached = ladders.get(cloud);
  if (cached) return cached;
  const request =
    cloud === "ring"
      ? fetchLifted(RING, "rbf", RING_GAMMA, { nComponents: RING.length, innerCount: INNER_COUNT })
      : fetchLifted(ARC, "rbf", ARC_GAMMA, { nComponents: ARC.length });
  ladders.set(cloud, request);
  return request;
}

function tidy(value: number, digits: number): string {
  const rounded = Number(value.toFixed(digits));
  return (Object.is(rounded, -0) ? 0 : rounded).toFixed(digits);
}

export function ShareLadder() {
  const [cloud, setCloud] = useState<"ring" | "arc">("ring");
  const [kept, setKept] = useState(2);
  const [lifted, setLifted] = useState<Lifted | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setLifted(await ladderFor(cloud));
        setMessage(null);
      } catch (error) {
        if (error instanceof ApiError) setMessage(error.message);
        else setMessage("Something went wrong.");
      }
    })();
  }, [cloud]);

  if (!lifted) {
    return <p className="text-sm text-slate-500 dark:text-slate-400">{message ?? "…"}</p>;
  }

  const count = Math.min(kept, lifted.components.length);
  const people = lifted.n_rows;
  const keptTotal = lifted.components[count - 1].cumulative_share;
  const perPerson = lifted.coordinates.map((row, index) => row.slice(0, count).reduce((sum, value) => sum + value * value, 0) / lifted.lifted_squared_deviations[index]);
  const toHalf = lifted.components.findIndex((component) => component.cumulative_share >= 0.5) + 1;
  const toNine = lifted.components.findIndex((component) => component.cumulative_share >= 0.9) + 1;
  const fill = (index: number) => (cloud === "ring" ? (index < INNER_COUNT ? INNER : OUTER) : heightShade(ARC[index].x));
  const innerHeight = VIEW.height - PAD.top - PAD.bottom;

  const bars = (values: number[], fillFor: (index: number) => string, highlight: number, title: string) => {
    const slot = (VIEW.width - PAD.left - PAD.right) / values.length;
    return (
      <div>
        <p className="mb-1 text-xs text-slate-500 dark:text-slate-400">{title}</p>
        <svg viewBox={`0 0 ${VIEW.width} ${VIEW.height}`} className="w-full select-none rounded-lg bg-slate-50 dark:bg-slate-950">
          {values.map((value, index) => (
            <rect key={index} x={PAD.left + index * slot + slot * 0.15} y={PAD.top + (1 - value) * innerHeight} width={slot * 0.7} height={value * innerHeight} fill={fillFor(index)} opacity={index < highlight ? 0.95 : 0.3} />
          ))}
          <text x={PAD.left - 4} y={PAD.top + 8} textAnchor="end" className="fill-slate-500 text-[9px] dark:fill-slate-400">1.0</text>
          <text x={PAD.left - 4} y={VIEW.height - PAD.bottom + 3} textAnchor="end" className="fill-slate-500 text-[9px] dark:fill-slate-400">0.0</text>
        </svg>
      </div>
    );
  };

  return (
    <div>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-600 dark:text-slate-300">
        <span className="flex gap-1 rounded-md border border-slate-300 p-0.5 dark:border-slate-700">
          {(["ring", "arc"] as const).map((choice) => (
            <button key={choice} onClick={() => { setCloud(choice); setKept(2); }} className={"rounded px-2 py-0.5 text-xs font-medium transition " + (cloud === choice ? "bg-indigo-600 text-white" : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800")}>
              {choice === "ring" ? "the ring" : "the arc"}
            </button>
          ))}
        </span>
        <label className="flex flex-1 items-center gap-2">
          directions kept
          <input type="range" min={1} max={lifted.components.length} step={1} value={count} onChange={(event) => setKept(Number(event.target.value))} className="flex-1 accent-indigo-600" />
          <span className="w-8 text-right font-mono">{count}</span>
        </label>
      </div>
      <div className="mt-3 space-y-3">
        {bars(lifted.components.map((component) => component.cumulative_share), () => FIRST, count, `running share of the total, one bar per direction, ${lifted.components.length} directions from ${people} people`)}
        {bars(perPerson, fill, people, `each person's kept share of their lifted deviation with ${count} kept`)}
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Stat label={`share of the total kept by ${count}`} value={tidy(keptTotal, 3)} />
        <Stat label="directions for half the total" value={String(toHalf)} />
        <Stat label="directions for nine tenths" value={String(toNine)} />
        <Stat label="least and most kept, per person" value={`${tidy(Math.min(...perPerson), 3)}, ${tidy(Math.max(...perPerson), 3)}`} />
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
