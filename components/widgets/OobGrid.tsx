"use client";

// Which trees may judge which people, and the two verdicts that follow.
//
// Rows are the twenty-five people, columns the twenty-five trees, and a
// cell is filled when that tree's bootstrap sample drew that person and
// empty when it did not. Click a row and the empty cells light up: those
// are the person's out-of-bag judges, the only members that never trained
// on them. The panel then shows the whole committee's vote on that person
// beside the judges' vote alone, with the true class, and the score across
// everyone is the out-of-bag score. Every draw and every vote comes from
// the library's fitted committee.

import { useEffect, useState } from "react";
import { ApiError, BaggingAnatomy, fetchBaggingAnatomy } from "@/lib/api";
import { ADULT, CHILD, TANGLED_CROWD } from "./BootstrapMachine";

const CELL = 12;

export function OobGrid() {
  const [anatomy, setAnatomy] = useState<BaggingAnatomy | null>(null);
  const [selected, setSelected] = useState(12);
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

  const members = anatomy.members;
  const verdict = anatomy.out_of_bag[selected];
  const eligible = new Set(verdict.eligible);
  const width = 40 + members.length * CELL;
  const height = 24 + anatomy.n_rows * CELL;
  const judged = anatomy.out_of_bag.filter((row) => row.out_of_bag_prediction !== null);
  const oobCorrect = judged.filter((row) => row.out_of_bag_prediction === row.label).length;
  const fullCorrect = anatomy.out_of_bag.filter((row) => row.full_prediction === row.label).length;
  const disagreements = anatomy.out_of_bag.filter((row) => row.out_of_bag_prediction !== null && row.out_of_bag_prediction !== row.full_prediction).length;

  return (
    <div className="grid gap-4 sm:grid-cols-[1fr_260px]">
      <div>
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full select-none rounded-lg bg-slate-50 dark:bg-slate-950">
          {members.map((member) => (
            <text key={member.position} x={40 + member.position * CELL + CELL / 2} y={14} textAnchor="middle" className="fill-slate-400 text-[7px]">{member.position + 1}</text>
          ))}
          {anatomy.out_of_bag.map((row, rowIndex) => (
            <g key={rowIndex} onClick={() => setSelected(rowIndex)} className="cursor-pointer">
              <rect x={0} y={20 + rowIndex * CELL} width={width} height={CELL} fill={rowIndex === selected ? "#0f172a" : "transparent"} opacity={rowIndex === selected ? 0.08 : 0} />
              <circle cx={10} cy={20 + rowIndex * CELL + CELL / 2} r={3.5} fill={TANGLED_CROWD[rowIndex].label === 0 ? CHILD : ADULT} />
              <text x={18} y={20 + rowIndex * CELL + CELL / 2 + 3} className="fill-slate-500 text-[7px]">{rowIndex + 1}</text>
              {members.map((member) => {
                const drew = member.multiplicities[rowIndex] > 0;
                const judge = rowIndex === selected && !drew;
                return (
                  <rect
                    key={member.position}
                    x={40 + member.position * CELL + 1}
                    y={20 + rowIndex * CELL + 1}
                    width={CELL - 2}
                    height={CELL - 2}
                    rx={2}
                    fill={judge ? "#10b981" : drew ? "#64748b" : "none"}
                    stroke={drew ? "none" : "#cbd5e1"}
                    opacity={drew ? 0.3 + 0.2 * Math.min(3, member.multiplicities[rowIndex]) : 1}
                  />
                );
              })}
            </g>
          ))}
        </svg>
        <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
          Rows are people, columns are trees. A filled cell is a tree that drew that person, darker the more times. Click a row; its empty cells turn green, and those trees are its judges.
        </p>
      </div>
      <div className="space-y-2 self-start">
        <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
          Person {selected + 1}, {TANGLED_CROWD[selected].x} cm and {TANGLED_CROWD[selected].y} kg, actually a {verdict.label === 0 ? "child" : "adult"}
        </p>
        <Stat label="whole committee" value={`${verdict.full_adult_votes} of ${members.length} say adult, calls ${verdict.full_prediction === 1 ? "adult" : "child"}`} tone={verdict.full_prediction === verdict.label ? "good" : "bad"} />
        <Stat label={`judges only, the ${eligible.size} trees that never saw them`} value={verdict.out_of_bag_prediction === null ? "no judges" : `${verdict.out_of_bag_adult_votes} of ${eligible.size} say adult, calls ${verdict.out_of_bag_prediction === 1 ? "adult" : "child"}`} tone={verdict.out_of_bag_prediction === verdict.label ? "good" : "bad"} />
        <div className="rounded-lg border border-slate-200 p-2 text-xs text-slate-600 dark:border-slate-800 dark:text-slate-300">
          <p>whole-committee accuracy {(fullCorrect / anatomy.n_rows).toFixed(3)}</p>
          <p>out-of-bag accuracy {(oobCorrect / judged.length).toFixed(3)}, over {judged.length} judged people</p>
          <p>{disagreements} people where the two verdicts differ</p>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, tone }: { label: string; value: string; tone: "good" | "bad" }) {
  return (
    <div className={`rounded-lg px-3 py-2 ${tone === "good" ? "bg-emerald-50 dark:bg-emerald-950/30" : "bg-rose-50 dark:bg-rose-950/30"}`}>
      <div className="text-[11px] text-slate-500 dark:text-slate-400">{label}</div>
      <div className="font-mono text-xs font-semibold text-slate-900 dark:text-slate-100">{value}</div>
    </div>
  );
}
