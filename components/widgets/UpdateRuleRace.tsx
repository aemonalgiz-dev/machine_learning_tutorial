"use client";

// One cell at a time against all at once.
//
// Two probes. The two-unit network stores the single pattern (+1, -1) and
// is handed (+1, +1): all at once, both cells read the other's old value and
// both flip, forever, with the energy never falling; one at a time, the
// first cell visited flips and the second is then content, and which stored
// memory results depends on the seed that fixed the visiting order. The
// half-reversed T under three shapes settles under both rules, and not in
// the same place: one at a time reaches the T's negation, all at once takes
// four passes to a rest nobody stored. The API runs both walks and reports
// every pass and, for the one-at-a-time rule, every visit; the browser draws
// the states in a row.

import { useEffect, useState } from "react";
import { ApiError, UnitWalk, UpdateRuleName, walkByUnit } from "@/lib/concepts/hopfield-network";
import { Caption, Failure, PatternGrid, Stat, plain, signed } from "./HopfieldGrid";
import { BUTTON_CLASS, HALF_REVERSED_T, THREE_SHAPES, TWO_UNIT_PATTERN, TWO_UNIT_PROBE, cellsOf, settledLabel } from "./hopfieldFixtures";

const TWO_UNIT_PASSES = 6;
const SEEDS = [0, 1, 2, 3, 4, 5, 6, 7];

export function UpdateRuleRace({ variant }: { variant: "twoUnits" | "halfT" }) {
  const [rule, setRule] = useState<UpdateRuleName>("synchronous");
  const [seed, setSeed] = useState(0);
  const [walk, setWalk] = useState<UnitWalk | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const patterns = variant === "twoUnits" ? [TWO_UNIT_PATTERN] : cellsOf(THREE_SHAPES);
  const probe = variant === "twoUnits" ? TWO_UNIT_PROBE : HALF_REVERSED_T;
  const stored = variant === "twoUnits" ? [{ name: "(+1, −1)", cells: TWO_UNIT_PATTERN }] : THREE_SHAPES;

  useEffect(() => {
    (async () => {
      try {
        setWalk(
          await walkByUnit(patterns, probe, {
            updateRule: rule,
            randomSeed: seed,
            maxPasses: variant === "twoUnits" ? TWO_UNIT_PASSES : undefined,
          }),
        );
        setMessage(null);
      } catch (error) {
        if (error instanceof ApiError) setMessage(error.message);
        else setMessage("Something went wrong.");
      }
    })();
    // The patterns and the probe follow from the variant.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [variant, rule, seed]);

  const states = walk ? [probe, ...walk.passes.map((recallPass) => recallPass.state)] : [];
  const energies = walk ? [walk.initial_energy, ...walk.passes.map((recallPass) => recallPass.energy_after)] : [];

  return (
    <div className="my-4 rounded-lg bg-slate-50 p-4 dark:bg-slate-950">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-600 dark:text-slate-300">
        <div className="flex gap-2">
          <button onClick={() => setRule("synchronous")} className={BUTTON_CLASS + (rule === "synchronous" ? " ring-2 ring-indigo-400" : "")}>
            All cells at once
          </button>
          <button onClick={() => setRule("asynchronous")} className={BUTTON_CLASS + (rule === "asynchronous" ? " ring-2 ring-indigo-400" : "")}>
            One cell at a time
          </button>
        </div>
        {rule === "asynchronous" && (
          <label className="flex items-center gap-2">
            seed for the visiting order
            <select value={seed} onChange={(event) => setSeed(Number(event.target.value))} className="rounded border border-slate-300 bg-white px-2 py-1 font-mono text-sm dark:border-slate-700 dark:bg-slate-800">
              {SEEDS.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </label>
        )}
      </div>

      {walk ? (
        <>
          <div className="mt-3 flex flex-wrap items-end justify-center gap-4">
            {states.map((state, index) => {
              const previous = index > 0 ? states[index - 1] : state;
              const changed = state.map((value, cell) => index > 0 && value !== previous[cell]);
              return (
                <div key={index} className="flex flex-col items-center gap-1">
                  <PatternGrid cells={state} changed={changed} size={variant === "twoUnits" ? "large" : "small"} />
                  <span className="text-xs text-slate-500 dark:text-slate-400">{index === 0 ? "probe" : `pass ${index}`}</span>
                  <span className="font-mono text-xs text-slate-600 dark:text-slate-300">{plain(energies[index], 2)}</span>
                </div>
              );
            })}
          </div>
          {variant === "twoUnits" && rule === "asynchronous" && (
            <p className="mt-3 text-center font-mono text-xs text-slate-600 dark:text-slate-300">
              {walk.visits.slice(0, 2).map((visit) => `cell ${visit.unit + 1} reads ${signed(visit.weighted_sum, 1)}${visit.flipped ? " and moves" : " and stays"}`).join("; ")}
            </p>
          )}
          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Stat label="passes" value={String(walk.passes.length)} />
            <Stat label="cells moved per pass" value={walk.passes.map((recallPass) => recallPass.units_changed).join(", ")} />
            <Stat label="the walk reports" value={walk.stopped_because} />
            <Stat label="rests in" value={walk.settled ? settledLabel(walk.settled_into, stored) : walk.oscillation_period === 2 ? "a two-state loop" : "still moving"} />
          </div>
          <Caption>
            {variant === "twoUnits"
              ? `The stored pattern is (+1, −1) and the probe (+1, +1) starts at an energy of ${plain(walk.initial_energy, 2)}. Each grid is the state after a pass, with the cells that moved outlined and the energy beneath.`
              : "The T with its first fifteen cells reversed, which shares ten cells with the T and fifteen with its negation. Each grid is the state after a pass, with the cells that moved outlined and the energy beneath."}
          </Caption>
        </>
      ) : (
        <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">{message ?? "…"}</p>
      )}
      <Failure message={message} />
    </div>
  );
}
