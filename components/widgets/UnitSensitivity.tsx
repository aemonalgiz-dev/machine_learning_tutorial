"use client";

// The crowd grouped with its heights written in three units, and standardised.
//
// Same people, same k. Height in metres makes every horizontal gap a
// hundredth of what it is in centimetres, so weight decides the groups;
// height in millimetres makes it ten times larger, so height decides. Each
// panel is drawn back on the centimetre axes so the groupings can be compared
// by eye, and each says whether it grouped the people the way the centimetre
// fit did. The fourth panel divides each feature by its own spread first.
// Every fit is the library's through the API.

import { useEffect, useState } from "react";
import { ApiError } from "@/lib/api";
import { UnitGrouping, UnitGroupings, refitInUnits } from "@/lib/concepts/k-means";
import { ChoiceButtons, ClusterMap, Stat } from "./ClusterMap";
import { CROWD } from "./kMeansFixtures";

export function UnitSensitivity() {
  const [k, setK] = useState<"2" | "3">("2");
  const [fetched, setFetched] = useState<{ k: string; answer: UnitGroupings } | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  // The fits are kept with the k they were asked for, so the panels never
  // show one k's grouping under the other's heading while the next loads.
  const answer = fetched?.k === k ? fetched.answer : null;

  useEffect(() => {
    (async () => {
      try {
        const refitted = await refitInUnits(CROWD, Number(k));
        setFetched({ k, answer: refitted });
        setMessage(null);
      } catch (error) {
        if (error instanceof ApiError) setMessage(error.message);
        else setMessage("Something went wrong.");
      }
    })();
  }, [k]);

  const panel = (grouping: UnitGrouping, title: string) => (
    <div key={grouping.unit} className={"rounded-lg border p-1 " + (grouping.same_grouping_as_centimetres ? "border-slate-200 dark:border-slate-800" : "border-rose-400")}>
      <ClusterMap points={CROWD} labels={grouping.labels} centres={grouping.centres.map((centre) => ({ x: centre.x / grouping.factor, y: centre.y }))} width={220} height={180} />
      <p className="mt-1 text-center text-[11px] text-slate-600 dark:text-slate-300">{title}</p>
      <p className="text-center font-mono text-[10px] text-slate-500 dark:text-slate-400">
        sizes {grouping.sizes.join(", ")}, {grouping.same_grouping_as_centimetres ? "same grouping" : "a different grouping"}
      </p>
    </div>
  );

  return (
    <div>
      <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
        groups asked for
        <ChoiceButtons
          choices={[
            { label: "2", value: "2" },
            { label: "3", value: "3" },
          ]}
          value={k}
          onChange={setK}
        />
      </div>
      {!answer ? (
        <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">{message ?? "…"}</p>
      ) : (
        <>
          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {answer.variants.map((grouping) => panel(grouping, `height in ${grouping.unit}`))}
            {panel(answer.standardised, "both features standardised")}
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {answer.variants.map((grouping) => (
              <Stat key={grouping.unit} label={`inertia, ${grouping.unit}`} value={grouping.inertia.toFixed(1)} />
            ))}
            <Stat label="inertia, standardised" value={answer.standardised.inertia.toFixed(3)} />
          </div>
        </>
      )}
      {message && answer && <p className="mt-2 text-sm text-amber-600 dark:text-amber-400">{message}</p>}
    </div>
  );
}
