"use client";

// Where the robust scaler's three cuts fall on a sorted column.
//
// The values are laid out by rank, one slot each, and the first quartile,
// median and third quartile are drawn at the fractional positions the
// library reads them at, a quarter, a half and three quarters of the way
// along the last index. A whole position lands on one value; a half lands on
// the midpoint of two, which is why eleven heights read their quartiles
// between the third and fourth and between the eighth and ninth. The API
// sorts and places; the browser draws.

import { useEffect, useState } from "react";
import { ApiError } from "@/lib/api";
import { Quartiles, placeQuartiles } from "@/lib/concepts/feature-scaling";
import { CROWD_HEIGHTS, FIVE_READINGS } from "./featureScalingFixtures";

const VIEW = { width: 640, height: 120 };
const PAD = { left: 30, right: 30 };
const BASELINE = 70;

const COLUMNS = [
  { key: "five", label: "five readings", values: FIVE_READINGS },
  { key: "crowd", label: "the crowd's heights", values: CROWD_HEIGHTS },
];

export function QuartilePositions() {
  const [column, setColumn] = useState("crowd");
  const [answer, setAnswer] = useState<Quartiles | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const values = COLUMNS.find((choice) => choice.key === column)!.values;
    (async () => {
      try {
        setAnswer(await placeQuartiles(values));
        setMessage(null);
      } catch (error) {
        if (error instanceof ApiError) setMessage(error.message);
        else setMessage("Something went wrong.");
      }
    })();
  }, [column]);

  if (!answer) {
    return <p className="text-sm text-slate-500 dark:text-slate-400">{message ?? "…"}</p>;
  }

  const last = answer.sorted_values.length - 1;
  const slotX = (position: number) => PAD.left + (position / last) * (VIEW.width - PAD.left - PAD.right);
  const cuts = [
    { label: "first quartile", cut: answer.first_quartile, colour: "#10b981" },
    { label: "median", cut: answer.median, colour: "#f59e0b" },
    { label: "third quartile", cut: answer.third_quartile, colour: "#10b981" },
  ];

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 pb-2">
        {COLUMNS.map((choice) => (
          <button
            key={choice.key}
            onClick={() => setColumn(choice.key)}
            className={
              "rounded-md px-3 py-1.5 text-sm font-medium transition " +
              (column === choice.key
                ? "bg-indigo-600 text-white"
                : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700")
            }
          >
            {choice.label}
          </button>
        ))}
      </div>
      <svg viewBox={`0 0 ${VIEW.width} ${VIEW.height}`} className="w-full select-none rounded-lg bg-slate-50 dark:bg-slate-950">
        <line x1={PAD.left} x2={VIEW.width - PAD.right} y1={BASELINE} y2={BASELINE} className="stroke-slate-300 dark:stroke-slate-700" strokeWidth={1} />
        {cuts.map(({ label, cut, colour }) => (
          <g key={label}>
            <line x1={slotX(cut.position)} x2={slotX(cut.position)} y1={BASELINE - 34} y2={BASELINE + 8} stroke={colour} strokeWidth={1.5} strokeDasharray="4 3" />
            <text x={slotX(cut.position)} y={BASELINE - 38} textAnchor="middle" className="text-[10px] font-medium" fill={colour}>{label} at {cut.position}</text>
          </g>
        ))}
        {answer.sorted_values.map((value, index) => (
          <g key={index}>
            <circle cx={slotX(index)} cy={BASELINE} r={6} fill="#6366f1" stroke="white" strokeWidth={1.5} />
            <text x={slotX(index)} y={BASELINE + 22} textAnchor="middle" className="fill-slate-600 text-[10px] font-medium dark:fill-slate-300">{value}</text>
            <text x={slotX(index)} y={BASELINE + 36} textAnchor="middle" className="fill-slate-400 text-[9px] dark:fill-slate-500">{index}</text>
          </g>
        ))}
      </svg>
      <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Stat label="first quartile" value={answer.first_quartile.value.toFixed(1)} />
        <Stat label="median, the robust centre" value={answer.robust_centre.toFixed(1)} />
        <Stat label="third quartile" value={answer.third_quartile.value.toFixed(1)} />
        <Stat label="interquartile range, the robust spread" value={answer.robust_spread.toFixed(1)} />
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
