"use client";

// Every three-word question the documents allow, asked without exclusion.
//
// The sweep runs all ordered triples of the words that have a direction, adds
// the first and third unit vectors, subtracts the second, and records whether
// the top answer is one of the three words already named. The bar splits that
// count between the words that were added and the word that was subtracted, and
// three questions are shown in full underneath, asked both ways. The API runs
// the sweep once and caches it; the browser draws the split.

import { useEffect, useState } from "react";
import { ApiError } from "@/lib/api";
import { ExclusionSweep, fetchExclusionSweep } from "@/lib/concepts/a-vector-for-a-word";
import { ACCENT, CONTRAST, SHARED_COLOUR } from "./wordPositionFixtures";

const BAR = { width: 520, height: 46 };

export function ExclusionSweepPanel() {
  const [sweep, setSweep] = useState<ExclusionSweep | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setSweep(await fetchExclusionSweep());
      } catch (error) {
        setMessage(error instanceof ApiError ? error.message : "Something went wrong.");
      }
    })();
  }, []);

  if (!sweep) {
    return <p className="text-sm text-slate-500 dark:text-slate-400">{message ?? "…"}</p>;
  }

  const scale = (count: number) => (count / sweep.n_questions) * BAR.width;
  const addedWidth = scale(sweep.n_added_word);
  const subtractedWidth = scale(sweep.n_subtracted_word);

  return (
    <div>
      <svg viewBox={`0 0 ${BAR.width} ${BAR.height}`} className="w-full select-none">
        <rect x={0} y={6} width={BAR.width} height={18} rx={3} fill={SHARED_COLOUR} opacity={0.35} />
        <rect x={0} y={6} width={Math.max(1, addedWidth)} height={18} rx={3} fill={ACCENT} />
        <rect
          x={addedWidth}
          y={6}
          width={Math.max(1, subtractedWidth)}
          height={18}
          rx={3}
          fill={CONTRAST}
        />
        <text x={0} y={40} className="fill-slate-500 text-[10px] dark:fill-slate-400">
          one of the two added words
        </text>
        <text
          x={BAR.width}
          y={40}
          textAnchor="end"
          className="fill-slate-500 text-[10px] dark:fill-slate-400"
        >
          a word not in the question
        </text>
      </svg>

      <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Stat label="questions asked" value={sweep.n_questions.toLocaleString("en-GB")} />
        <Stat
          label="answered with a question word"
          value={sweep.n_returning_a_question_word.toLocaleString("en-GB")}
        />
        <Stat label="share of all questions" value={sweep.share.toFixed(4)} />
        <Stat
          label="of those, the subtracted word"
          value={sweep.n_subtracted_word.toLocaleString("en-GB")}
        />
      </div>

      <table className="mt-3 w-full text-xs">
        <thead>
          <tr className="text-slate-400 dark:text-slate-500">
            <th className="text-left font-normal">the question</th>
            <th className="text-left font-normal">with the three kept out</th>
            <th className="text-left font-normal">with them left in</th>
          </tr>
        </thead>
        <tbody className="font-mono text-slate-700 dark:text-slate-300">
          {sweep.examples.map((example) => (
            <tr key={example.positive_first + example.negative + example.positive_second}>
              <td className="py-0.5">
                {example.positive_first} − {example.negative} + {example.positive_second}
              </td>
              <td className="py-0.5">{example.with_exclusion}</td>
              <td className="py-0.5" style={{ color: CONTRAST }}>
                {example.without_exclusion}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

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
