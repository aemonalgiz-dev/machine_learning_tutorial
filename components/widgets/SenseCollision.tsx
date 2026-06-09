"use client";

// One spelling made to stand for two different things, and where it lands.
//
// The same twenty-four documents are refitted with a single spelling put in
// place of a cooking word in the cooking texts and a sailing word in the
// sailing texts. The bars show what that spelling is now nearest, the two stats
// beneath compare its pull towards each topic against an ordinary word of one
// topic, and the last row recalls what the two words it replaced were nearest
// when they were separate. The API refits and measures; the browser draws bars.

import { useEffect, useState } from "react";
import { ApiError } from "@/lib/api";
import { SensesView, fetchSenses } from "@/lib/concepts/a-vector-for-a-word";
import { colourOf } from "./wordPositionFixtures";

const BAR = { width: 360 };

export function SenseCollision() {
  const [view, setView] = useState<SensesView | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setView(await fetchSenses());
      } catch (error) {
        setMessage(error instanceof ApiError ? error.message : "Something went wrong.");
      }
    })();
  }, []);

  if (!view) {
    return <p className="text-sm text-slate-500 dark:text-slate-400">{message ?? "…"}</p>;
  }

  return (
    <div>
      <p className="text-xs text-slate-500 dark:text-slate-400">
        Every use of {view.replaced[0]} in the cooking texts and of{" "}
        {view.replaced[1]} in the sailing texts is respelled {view.merged_word},
        so one word now stands for two things. Two of the refitted documents read{" "}
        <span className="font-mono">
          {view.merged_documents
            .map((text) =>
              text.replace(view.replaced[0], view.merged_word).replace(view.replaced[1], view.merged_word),
            )
            .join("  |  ")}
        </span>
        .
      </p>

      <svg
        viewBox={`0 0 ${BAR.width} ${view.neighbours.length * 22 + 6}`}
        className="mt-3 w-full select-none"
      >
        {view.neighbours.map((row, index) => (
          <g key={row.word} transform={`translate(0 ${index * 22})`}>
            <rect
              x={84}
              y={4}
              width={Math.max(1, Math.max(0, row.cosine) * (BAR.width - 140))}
              height={14}
              rx={2}
              fill={colourOf(row.word)}
              opacity={0.85}
            />
            <text
              x={80}
              y={15}
              textAnchor="end"
              className="fill-slate-700 font-mono text-[11px] dark:fill-slate-300"
            >
              {row.word}
            </text>
            <text
              x={BAR.width - 4}
              y={15}
              textAnchor="end"
              className="fill-slate-500 font-mono text-[11px] dark:fill-slate-400"
            >
              {row.cosine.toFixed(4)}
            </text>
          </g>
        ))}
      </svg>

      <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Stat
          label={`${view.merged_word}, mean to cooking`}
          value={view.mean_to_cooking.toFixed(4)}
        />
        <Stat
          label={`${view.merged_word}, mean to sailing`}
          value={view.mean_to_sailing.toFixed(4)}
        />
        <Stat
          label={`${view.comparison_word}, mean to cooking`}
          value={view.comparison_to_cooking.toFixed(4)}
        />
        <Stat
          label={`${view.comparison_word}, mean to sailing`}
          value={view.comparison_to_sailing.toFixed(4)}
        />
      </div>

      <div className="mt-2 rounded-lg border border-slate-200 p-2 text-xs dark:border-slate-800">
        <span className="text-slate-500 dark:text-slate-400">
          Before the two spellings were merged, each was nearest something much
          closer.{" "}
        </span>
        <span className="font-mono text-slate-700 dark:text-slate-300">
          {view.separate
            .map((row) => `${row.word} to ${row.nearest} ${row.cosine.toFixed(4)}`)
            .join("; ")}
          ; {view.merged_word} to {view.neighbours[0].word}{" "}
          {view.best_cosine.toFixed(4)}
        </span>
      </div>

      {message && <p className="mt-2 text-sm text-rose-600">{message}</p>}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-slate-100 px-2 py-1.5 dark:bg-slate-800">
      <div className="text-[11px] text-slate-500 dark:text-slate-400">{label}</div>
      <div className="font-mono text-sm font-semibold text-slate-900 dark:text-slate-100">
        {value}
      </div>
    </div>
  );
}
