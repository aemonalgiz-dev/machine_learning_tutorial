"use client";

// The same people fitted once from each of ten seeds, laid side by side.
//
// Every panel is one start followed until it settles, with the plane shaded
// by nearest centre and the people coloured by the grouping that start
// found. The inertia under each panel is where that start came to rest, and
// the panel outlined in green is the one the library keeps when it is
// allowed all ten. Panels that found the same grouping as the winner say so,
// whatever numbers they gave the groups. Every fit is the library's through
// the API.

import { useEffect, useState } from "react";
import { ApiError, Point } from "@/lib/api";
import { Restarts, compareRestarts } from "@/lib/concepts/k-means";
import { ChoiceButtons, ClusterMap, Stat } from "./ClusterMap";
import { CROWD, TWO_BANDS, UNEQUAL_GROUPS } from "./kMeansFixtures";

type Scenario = "crowd2" | "crowd3" | "bands" | "unequal";

const SCENARIOS: Record<Scenario, { points: Point[]; k: number }> = {
  crowd2: { points: CROWD, k: 2 },
  crowd3: { points: CROWD, k: 3 },
  bands: { points: TWO_BANDS, k: 2 },
  unequal: { points: UNEQUAL_GROUPS, k: 3 },
};

export function SeedGallery() {
  const [scenario, setScenario] = useState<Scenario>("crowd2");
  const [answer, setAnswer] = useState<{ scenario: Scenario; restarts: Restarts } | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const { points, k } = SCENARIOS[scenario];
  // The fits are kept with the scenario they belong to, so a panel never
  // draws one scenario's centres over another's people while the next loads.
  const restarts = answer?.scenario === scenario ? answer.restarts : null;

  useEffect(() => {
    (async () => {
      try {
        const fetched = await compareRestarts(points, k);
        setAnswer({ scenario, restarts: fetched });
        setMessage(null);
      } catch (error) {
        if (error instanceof ApiError) setMessage(error.message);
        else setMessage("Something went wrong.");
      }
    })();
  }, [scenario, points, k]);

  return (
    <div>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-600 dark:text-slate-300">
        <ChoiceButtons
          choices={[
            { label: "the crowd, k = 2", value: "crowd2" },
            { label: "the crowd, k = 3", value: "crowd3" },
            { label: "two bands, k = 2", value: "bands" },
            { label: "unequal sizes, k = 3", value: "unequal" },
          ]}
          value={scenario}
          onChange={setScenario}
        />
      </div>
      {!restarts ? (
        <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">{message ?? "…"}</p>
      ) : (
        <>
          <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-5">
            {restarts.fits.map((fit) => (
              <div key={fit.seed} className={"rounded-lg border p-1 " + (fit.seed === restarts.best_seed ? "border-emerald-500" : fit.same_grouping_as_best ? "border-emerald-200 dark:border-emerald-900" : "border-slate-200 dark:border-slate-800")}>
                <ClusterMap points={points} labels={fit.labels} centres={fit.centres} regions={fit.regions} width={200} height={160} />
                <p className="mt-1 text-center font-mono text-[11px] text-slate-700 dark:text-slate-300">
                  seed {fit.seed}, {fit.inertia.toFixed(1)}
                </p>
                <p className="text-center text-[10px] text-slate-500 dark:text-slate-400">
                  {fit.seed === restarts.best_seed ? "kept" : fit.same_grouping_as_best ? "same grouping" : "a different grouping"}, {fit.iterations_run} passes
                </p>
              </div>
            ))}
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
            <Stat label="distinct resting values" value={String(restarts.distinct_inertias)} />
            <Stat label="lowest, and its seed" value={`${restarts.best_inertia.toFixed(1)}, seed ${restarts.best_seed}`} />
            <Stat label="starts that found the kept grouping" value={`${restarts.fits.filter((fit) => fit.same_grouping_as_best).length} of ${restarts.fits.length}`} />
            <Stat label="one fit allowed all ten starts" value={restarts.with_restarts_inertia.toFixed(1)} />
          </div>
        </>
      )}
      {message && restarts && <p className="mt-2 text-sm text-amber-600 dark:text-amber-400">{message}</p>}
    </div>
  );
}
