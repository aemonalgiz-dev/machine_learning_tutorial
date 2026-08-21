"use client";

// One bootstrap sample, several feature lotteries, several trees.
//
// The sample is fixed, the committee's first resample of the tangled
// crowd, and each tree below is grown on exactly those rows with a
// different seed for its feature lottery and one feature offered per
// split. Their root questions differ, their maps differ, and the only
// thing that changed between them is which features each node was allowed
// to consider. That isolates feature randomness from bootstrap randomness,
// which the bagging page already spent. Every tree is the library's.

import { useEffect, useState } from "react";
import { ApiError, SameSample, growOnSameSample } from "@/lib/api";
import { ADULT, CHILD, TANGLED_CROWD } from "./BootstrapMachine";

const MAP = { width: 220, height: 200 };
const PAD = 18;
const SEEDS = [1, 2, 3, 4];

export function SameSampleTrees() {
  const [answer, setAnswer] = useState<SameSample | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setAnswer(await growOnSameSample(TANGLED_CROWD, SEEDS));
      } catch (error) {
        if (error instanceof ApiError) setMessage(error.message);
        else setMessage("Something went wrong.");
      }
    })();
  }, []);

  if (!answer) {
    return <p className="text-sm text-slate-500 dark:text-slate-400">{message ?? "…"}</p>;
  }

  return (
    <div>
      <p className="text-xs text-slate-600 dark:text-slate-300">
        The shared sample drew {answer.multiplicities.filter((count) => count > 0).length} distinct people and omitted {answer.multiplicities.filter((count) => count === 0).length}. Offered both features, a tree on this sample roots on {answer.unrestricted_root}. Offered one at random, it roots wherever the lottery lets it.
      </p>
      <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {answer.trees.map((tree) => {
          const regions = tree.regions;
          const cell = (MAP.width - 2 * PAD) / regions.cells;
          const mapX = (column: number) => PAD + column * cell;
          const mapY = (row: number) => MAP.height - PAD - (row + 1) * cell;
          const personX = (x: number) => mapX(((x - regions.x_min) / (regions.x_max - regions.x_min)) * (regions.cells - 1)) + cell / 2;
          const personY = (y: number) => mapY(((y - regions.y_min) / (regions.y_max - regions.y_min)) * (regions.cells - 1)) + cell / 2;
          return (
            <div key={tree.seed}>
              <svg viewBox={`0 0 ${MAP.width} ${MAP.height}`} className="w-full select-none rounded-lg bg-slate-50 dark:bg-slate-950">
                {regions.labels.map((row, rowIndex) =>
                  row.map((label, columnIndex) => (
                    <rect key={`${rowIndex}-${columnIndex}`} x={mapX(columnIndex)} y={mapY(rowIndex)} width={cell + 0.5} height={cell + 0.5} fill={label === 0 ? CHILD : ADULT} opacity={0.22} />
                  )),
                )}
                {TANGLED_CROWD.map((person, index) => {
                  const times = answer.multiplicities[index];
                  return <circle key={index} cx={personX(person.x)} cy={personY(person.y)} r={times === 0 ? 2.5 : 2 + times} fill={times === 0 ? "none" : person.label === 0 ? CHILD : ADULT} stroke={person.label === 0 ? CHILD : ADULT} strokeWidth={1} />;
                })}
              </svg>
              <div className="mt-1 font-mono text-[11px] text-slate-700 dark:text-slate-200">
                <p>lottery seed {tree.seed}</p>
                <p>root {tree.root_feature} &lt; {tree.root_threshold}</p>
                <p>depth {tree.depth}, {tree.n_leaves} leaves</p>
              </div>
            </div>
          );
        })}
      </div>
      <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
        The first two trees agree on {(answer.agreement * 100).toFixed(0)} percent of the crowd. Same people, same multiplicities, different permissions.
      </p>
    </div>
  );
}
