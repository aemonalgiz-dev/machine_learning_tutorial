"use client";

// Resting states that nobody stored.
//
// Under three shapes the reliable one is the odd mixture, the sign of the
// three shapes' sum cell by cell, and the widget shows the three shapes,
// the mixture, and the API's verdict on it: its energy, whether any cell
// wants to move, and how many cells it shares with each shape. Under six
// shapes it shows where the playground's first scramble of the T comes to
// rest, beside the Z, whose energy that rest turns out to equal. The API
// scores every state and runs the recall; the browser draws.

import { useEffect, useState } from "react";
import { ApiError, StateScores, UnitWalk, scoreStates, walkByUnit } from "@/lib/concepts/hopfield-network";
import { Caption, Failure, PatternGrid, plain } from "./HopfieldGrid";
import { ODD_MIXTURE, SCRAMBLED_T, SIX_SHAPES, THREE_SHAPES, Z_SHAPE, cellsOf } from "./hopfieldFixtures";

export function UnstoredRests({ variant }: { variant: "mixture" | "sixShapes" }) {
  const [scores, setScores] = useState<StateScores | null>(null);
  const [walk, setWalk] = useState<UnitWalk | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        if (variant === "mixture") {
          setScores(await scoreStates(cellsOf(THREE_SHAPES), [ODD_MIXTURE]));
        } else {
          const settled = await walkByUnit(cellsOf(SIX_SHAPES), SCRAMBLED_T);
          setWalk(settled);
          setScores(await scoreStates(cellsOf(SIX_SHAPES), [settled.settled_state, Z_SHAPE.cells]));
        }
      } catch (error) {
        if (error instanceof ApiError) setMessage(error.message);
        else setMessage("Something went wrong.");
      }
    })();
  }, [variant]);

  if (!scores || (variant === "sixShapes" && !walk)) {
    return <p className="text-sm text-slate-500 dark:text-slate-400">{message ?? "…"}</p>;
  }

  const stored = variant === "mixture" ? THREE_SHAPES : SIX_SHAPES;
  const rest = scores.reports[0];

  return (
    <div className="my-4 rounded-lg bg-slate-50 p-4 dark:bg-slate-950">
      <div className="flex flex-wrap items-end justify-center gap-4">
        {stored.map((entry, index) => (
          <div key={entry.name} className="flex flex-col items-center gap-1">
            <PatternGrid cells={entry.cells} size="small" />
            <span className="text-xs text-slate-500 dark:text-slate-400">{entry.name}</span>
            <span className="font-mono text-xs text-slate-600 dark:text-slate-300">{plain(scores.stored_energies[index], 2)}</span>
          </div>
        ))}
      </div>
      <div className="mt-4 flex flex-wrap items-start justify-center gap-8">
        {variant === "sixShapes" && (
          <div className="flex flex-col items-center gap-1">
            <PatternGrid cells={SCRAMBLED_T} size="medium" />
            <span className="text-xs text-slate-500 dark:text-slate-400">the scrambled T</span>
            <span className="font-mono text-xs text-slate-600 dark:text-slate-300">{plain(walk!.initial_energy, 2)}</span>
          </div>
        )}
        <div className="flex flex-col items-center gap-1">
          <PatternGrid cells={rest.state} size="medium" />
          <span className="text-xs text-slate-500 dark:text-slate-400">{variant === "mixture" ? "sign of T + L + cross" : "where it came to rest"}</span>
          <span className="font-mono text-xs text-slate-600 dark:text-slate-300">{plain(rest.energy, 2)}</span>
        </div>
        <dl className="grid grid-cols-[auto_auto] gap-x-3 gap-y-1 font-mono text-sm text-slate-800 dark:text-slate-200">
          <dt className="text-xs text-slate-500 dark:text-slate-400">a fixed point</dt>
          <dd>{rest.is_fixed_point ? "yes" : "no"}</dd>
          <dt className="text-xs text-slate-500 dark:text-slate-400">cells wanting to move</dt>
          <dd>{rest.units_wanting_to_move}</dd>
          <dt className="text-xs text-slate-500 dark:text-slate-400">equals a stored shape</dt>
          <dd>{rest.equals.pattern_index === null ? "none" : stored[rest.equals.pattern_index].name}</dd>
          <dt className="text-xs text-slate-500 dark:text-slate-400">cells shared with each shape</dt>
          <dd>{rest.agreements.join(", ")}</dd>
          <dt className="text-xs text-slate-500 dark:text-slate-400">smallest sum any cell reads</dt>
          <dd>{Math.min(...rest.weighted_sums.map((sum) => Math.abs(sum))).toFixed(2)}</dd>
          {variant === "sixShapes" && (
            <>
              <dt className="text-xs text-slate-500 dark:text-slate-400">the Z&rsquo;s energy</dt>
              <dd>{plain(scores.reports[1].energy, 2)}</dd>
              <dt className="text-xs text-slate-500 dark:text-slate-400">cells the rest shares with the Z</dt>
              <dd>{rest.agreements[4]}</dd>
            </>
          )}
        </dl>
      </div>
      <Caption>
        {variant === "mixture"
          ? "The number under each shape is its own energy under the three-shape weights. A shape that is a fixed point has no cell wanting to move; that the mixture has none either is what makes it a memory the network was never given."
          : "The number under each shape is its own energy under the six-shape weights, and every one of the six is still a fixed point. The rest is a seventh, as deep as the Z, that no shape was ever drawn for."}
      </Caption>
      <Failure message={message} />
    </div>
  );
}
