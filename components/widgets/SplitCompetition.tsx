"use client";

// The root competition held on each bootstrap sample.
//
// Each row is one of the bagged committee's first eight samples of the
// tangled crowd, a different set of rows every time, and the two bars are
// the best gain height can earn and the best gain weight can earn on
// exactly those rows, scored by the library's split search. The winner is
// whichever bar is longer, which is the root an ordinary tree grown on
// that sample would choose. The samples differ, the boards differ, and the
// question is whether the winner keeps being the same feature anyway.

import { useEffect, useState } from "react";
import { ApiError, SplitCompetition as Competition, holdSplitCompetition } from "@/lib/api";
import { TANGLED_CROWD } from "./BootstrapMachine";

const HEIGHT = "#6366f1";
const WEIGHT = "#f59e0b";
const N_SAMPLES = 8;

export function SplitCompetition() {
  const [answer, setAnswer] = useState<Competition | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setAnswer(await holdSplitCompetition(TANGLED_CROWD, N_SAMPLES));
      } catch (error) {
        if (error instanceof ApiError) setMessage(error.message);
        else setMessage("Something went wrong.");
      }
    })();
  }, []);

  if (!answer) {
    return <p className="text-sm text-slate-500 dark:text-slate-400">{message ?? "…"}</p>;
  }

  const largest = Math.max(...answer.samples.flatMap((sample) => sample.board.map((each) => each.gain)));

  return (
    <div>
      <div className="space-y-2">
        {answer.samples.map((sample) => {
          const height = sample.board.find((each) => each.feature === "height");
          const weight = sample.board.find((each) => each.feature === "weight");
          return (
            <div key={sample.position} className="grid grid-cols-[72px_1fr_110px] items-center gap-2 text-xs">
              <div className="text-slate-500 dark:text-slate-400">
                sample {sample.position + 1}
                <div className="text-[10px]">{sample.distinct_rows} distinct</div>
              </div>
              <div className="space-y-0.5">
                {[
                  { name: "height", best: height, colour: HEIGHT },
                  { name: "weight", best: weight, colour: WEIGHT },
                ].map((row) => (
                  <div key={row.name} className="flex items-center gap-2">
                    <span className="w-12 text-[10px]" style={{ color: row.colour }}>{row.name}</span>
                    <div className="h-2.5 rounded-sm" style={{ width: `${row.best ? (row.best.gain / largest) * 100 : 0}%`, backgroundColor: row.colour, opacity: sample.winner === row.name ? 0.95 : 0.35 }} />
                    <span className="font-mono text-[10px] text-slate-600 dark:text-slate-300">{row.best ? `${row.best.gain.toFixed(3)} at ${row.best.threshold}` : "…"}</span>
                  </div>
                ))}
              </div>
              <div className="font-mono font-medium" style={{ color: sample.winner === "height" ? HEIGHT : WEIGHT }}>
                {sample.winner} wins
              </div>
            </div>
          );
        })}
      </div>
      <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
        Height wins the root on {answer.wins.height} of {N_SAMPLES} samples and weight on {answer.wins.weight}. The rows change every time, and the height threshold barely does.
      </p>
    </div>
  );
}
