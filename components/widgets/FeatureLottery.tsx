"use client";

// The feature lottery at one node, drawn beside the full candidate board.
//
// The board is what an ordinary tree sees at the root of the tangled
// crowd: every feature, its best threshold and the gain that threshold
// earns, scored by the library's split search. The lottery is the rule a
// forest applies before looking: draw max_features names without
// replacement and search only those. Each draw shows which features were
// offered, which were withheld, and which won among the offered, and a
// draw that withheld the strongest feature is marked, because that is
// where the restriction costs something. The library does not keep the
// draws made inside a grown tree, so these replay the rule from a seeded
// generator rather than recount a particular tree.

import { useEffect, useState } from "react";
import { ApiError, Lottery, drawForestLottery } from "@/lib/api";
import { TANGLED_CROWD } from "./BootstrapMachine";

const FEATURE_COLOURS: Record<string, string> = { height: "#6366f1", weight: "#f59e0b" };

export function FeatureLottery() {
  const [maxFeatures, setMaxFeatures] = useState(1);
  const [lottery, setLottery] = useState<Lottery | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setLottery(await drawForestLottery(TANGLED_CROWD, maxFeatures, 12));
        setMessage(null);
      } catch (error) {
        if (error instanceof ApiError) setMessage(error.message);
        else setMessage("Something went wrong.");
      }
    })();
  }, [maxFeatures]);

  if (!lottery) {
    return <p className="text-sm text-slate-500 dark:text-slate-400">{message ?? "…"}</p>;
  }

  const strongest = lottery.board.reduce((best, each) => (each.gain > best.gain ? each : best), lottery.board[0]);
  const denied = lottery.draws.filter((draw) => draw.best_denied).length;

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 pb-3 text-sm text-slate-600 dark:text-slate-300">
        features offered per split, m
        <span className="flex gap-1 rounded-md border border-slate-300 p-0.5 dark:border-slate-700">
          {[1, 2].map((option) => (
            <button key={option} onClick={() => setMaxFeatures(option)} className={"rounded px-3 py-1 text-sm font-medium transition " + (maxFeatures === option ? "bg-indigo-600 text-white" : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800")}>
              {option}
            </button>
          ))}
        </span>
        <span className="text-xs text-slate-500">of 2</span>
      </div>

      <div className="grid gap-4 sm:grid-cols-[240px_1fr]">
        <div className="rounded-lg border border-slate-200 p-3 dark:border-slate-800">
          <p className="mb-2 text-sm font-medium text-slate-700 dark:text-slate-200">The full board at the root</p>
          {lottery.board.map((each) => (
            <div key={each.feature} className="mb-2 rounded-md px-2 py-1.5" style={{ backgroundColor: `${FEATURE_COLOURS[each.feature]}22` }}>
              <div className="text-xs font-medium" style={{ color: FEATURE_COLOURS[each.feature] }}>{each.feature} &lt; {each.threshold}</div>
              <div className="font-mono text-sm text-slate-800 dark:text-slate-200">gain {each.gain.toFixed(4)}{each.feature === strongest.feature ? ", the strongest" : ""}</div>
            </div>
          ))}
          <p className="text-[11px] text-slate-500 dark:text-slate-400">An ordinary tree sees both and picks {strongest.feature}.</p>
        </div>
        <div className="rounded-lg border border-slate-200 p-3 dark:border-slate-800">
          <p className="mb-2 text-sm font-medium text-slate-700 dark:text-slate-200">Twelve draws of the lottery, m = {maxFeatures}</p>
          <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3">
            {lottery.draws.map((draw, index) => (
              <div key={index} className={`rounded-md border px-2 py-1 text-[11px] ${draw.best_denied ? "border-rose-300 bg-rose-50 dark:border-rose-800 dark:bg-rose-950/30" : "border-slate-200 dark:border-slate-800"}`}>
                <div className="text-slate-500 dark:text-slate-400">draw {index + 1}</div>
                <div>
                  offered{" "}
                  {draw.offered.map((name) => (
                    <span key={name} className="font-medium" style={{ color: FEATURE_COLOURS[name] }}>{name} </span>
                  ))}
                </div>
                {draw.withheld.length > 0 && <div className="text-slate-400 line-through">{draw.withheld.join(", ")}</div>}
                <div className="font-mono text-slate-800 dark:text-slate-200">wins {draw.winner}, {draw.winner_gain.toFixed(3)}</div>
              </div>
            ))}
          </div>
          <p className="mt-2 text-[11px] text-slate-500 dark:text-slate-400">
            {maxFeatures === 1
              ? `The strongest feature was withheld in ${denied} of 12 draws, the ones outlined in rose, and those nodes settled for the weaker question.`
              : "With both features offered every draw sees the whole board and the strongest always wins, which is plain bagging."}
          </p>
        </div>
      </div>
      {message && (
        <p className="mt-3 text-sm text-amber-600 dark:text-amber-400">{message}</p>
      )}
    </div>
  );
}
