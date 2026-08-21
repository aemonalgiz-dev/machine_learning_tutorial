"use client";

// The same people grouped under four definitions of what a group is.
//
// The first panel is the nearest-centre grouping this page is about, with
// its centres and its shaded regions. The other three ask a different
// question of the same people: density asks whether a person sits in a crowd
// joined to another crowd and needs no k, single linkage merges whichever
// two groups have the closest pair of members until k remain, and the
// mixture fits k bell-shaped components by expectation-maximisation from a
// nearest-centre start. A grey dot in the density panel is a person in no
// group at all. Every grouping is the library's through the API.

import { useEffect, useState } from "react";
import { ApiError, Point } from "@/lib/api";
import { OtherDefinitions, groupOtherWays } from "@/lib/concepts/k-means";
import { ChoiceButtons, ClusterMap, Stat } from "./ClusterMap";
import { TWO_BANDS, TWO_CRESCENTS, UNEQUAL_GROUPS, WITH_A_STRAY } from "./kMeansFixtures";

type Scenario = "bands" | "crescents" | "unequal" | "stray";

const SCENARIOS: Record<Scenario, { points: Point[]; k: number; radius: number }> = {
  bands: { points: TWO_BANDS, k: 2, radius: 10 },
  crescents: { points: TWO_CRESCENTS, k: 2, radius: 10 },
  unequal: { points: UNEQUAL_GROUPS, k: 2, radius: 10 },
  stray: { points: WITH_A_STRAY, k: 2, radius: 6 },
};

export function ShapeGallery({ initial = "bands" }: { initial?: Scenario }) {
  const [scenario, setScenario] = useState<Scenario>(initial);
  const [fetched, setFetched] = useState<{ scenario: Scenario; answer: OtherDefinitions } | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const { points, k, radius } = SCENARIOS[scenario];
  // The groupings are kept with the scenario they belong to, so a panel never
  // draws one scenario's labels over another's people while the next loads.
  const answer = fetched?.scenario === scenario ? fetched.answer : null;

  useEffect(() => {
    (async () => {
      try {
        const grouped = await groupOtherWays(points, k, radius);
        setFetched({ scenario, answer: grouped });
        setMessage(null);
      } catch (error) {
        if (error instanceof ApiError) setMessage(error.message);
        else setMessage("Something went wrong.");
      }
    })();
  }, [scenario, points, k, radius]);

  const sizesOf = (labels: number[]) => {
    const counts = new Map<number, number>();
    for (const label of labels) if (label >= 0) counts.set(label, (counts.get(label) ?? 0) + 1);
    return [...counts.values()].join(", ");
  };

  return (
    <div>
      <ChoiceButtons
        choices={[
          { label: "two bands", value: "bands" },
          { label: "two crescents", value: "crescents" },
          { label: "unequal sizes", value: "unequal" },
          { label: "one stray person", value: "stray" },
        ]}
        value={scenario}
        onChange={setScenario}
      />
      {!answer ? (
        <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">{message ?? "…"}</p>
      ) : (
        <>
          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div>
              <ClusterMap points={points} labels={answer.k_means.labels} centres={answer.k_means.centres} regions={answer.k_means.regions} width={220} height={180} />
              <p className="mt-1 text-center text-[11px] text-slate-600 dark:text-slate-300">nearest centre, k = {k}</p>
              <p className="text-center font-mono text-[10px] text-slate-500 dark:text-slate-400">sizes {answer.k_means.sizes.join(", ")}</p>
            </div>
            <div>
              <ClusterMap points={points} labels={answer.density.labels} width={220} height={180} />
              <p className="mt-1 text-center text-[11px] text-slate-600 dark:text-slate-300">density, radius {radius}</p>
              <p className="text-center font-mono text-[10px] text-slate-500 dark:text-slate-400">
                {answer.density.n_clusters} groups, {answer.density.n_noise} in none
              </p>
            </div>
            <div>
              <ClusterMap points={points} labels={answer.single_linkage.labels} width={220} height={180} />
              <p className="mt-1 text-center text-[11px] text-slate-600 dark:text-slate-300">single linkage, {k} groups</p>
              <p className="text-center font-mono text-[10px] text-slate-500 dark:text-slate-400">sizes {sizesOf(answer.single_linkage.labels)}</p>
            </div>
            <div>
              <ClusterMap points={points} labels={answer.mixture.labels} width={220} height={180} />
              <p className="mt-1 text-center text-[11px] text-slate-600 dark:text-slate-300">mixture of {k}</p>
              <p className="text-center font-mono text-[10px] text-slate-500 dark:text-slate-400">sizes {sizesOf(answer.mixture.labels)}</p>
            </div>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
            <Stat label="nearest-centre inertia" value={answer.k_means.inertia.toFixed(1)} />
            <Stat label="nearest-centre passes to rest" value={String(answer.k_means.iterations_run)} />
            <Stat label="people the density rule leaves in no group" value={String(answer.density.n_noise)} />
          </div>
        </>
      )}
      {message && answer && <p className="mt-2 text-sm text-amber-600 dark:text-amber-400">{message}</p>}
    </div>
  );
}
