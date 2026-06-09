"use client";

// One seeded start on the crowd, stepped half a pass at a time.
//
// The loop is two steps, assign everyone to the nearest centre and move
// every centre to the mean of its group, and the stepper shows each half
// separately so the reader can see which of the two did the work on each
// pass. The X marks are the centres, the shading is which centre is nearest,
// the dots are coloured by the current assignment, and on an update step a
// dashed stub shows where each centre came from. The API reruns the same
// seeded fit with its pass budget raised one at a time and reads the
// inertia after each half; the browser only draws.

import { useEffect, useState } from "react";
import { ApiError, Point } from "@/lib/api";
import { Walk, walkKMeans } from "@/lib/concepts/k-means";
import { ChoiceButtons, ClusterMap, Stat } from "./ClusterMap";
import { CROWD, WORKED_PEOPLE } from "./kMeansFixtures";

type Scenario = "crowd" | "clumps";
type Seed = "3" | "1" | "6" | "0";

interface Stage {
  title: string;
  centres: Point[];
  labels: number[];
  inertia: number;
  regions: Walk["start"]["regions"];
  arrows: { from: Point; to: Point }[];
  switched: number | null;
  shift: number | null;
}

function stagesOf(walk: Walk): Stage[] {
  const stages: Stage[] = [
    {
      title: "the seeded start, before any pass",
      centres: walk.start.centres,
      labels: walk.start.labels,
      inertia: walk.start.inertia,
      regions: walk.start.regions,
      arrows: [],
      switched: null,
      shift: null,
    },
  ];
  let previous = walk.start.centres;
  for (const pass of walk.passes) {
    stages.push({
      title: `pass ${pass.pass_number}, after the update step`,
      centres: pass.centres,
      labels: pass.labels_used,
      inertia: pass.inertia_after_update,
      regions: pass.regions,
      arrows: previous.map((from, index) => ({ from, to: pass.centres[index] })),
      switched: null,
      shift: pass.largest_shift,
    });
    stages.push({
      title: `pass ${pass.pass_number}, after the assignment step`,
      centres: pass.centres,
      labels: pass.labels_after_assign,
      inertia: pass.inertia_after_assign,
      regions: pass.regions,
      arrows: [],
      switched: pass.labels_used.filter((label, index) => label !== pass.labels_after_assign[index]).length,
      shift: null,
    });
    previous = pass.centres;
  }
  return stages;
}

export function LloydStepper() {
  const [scenario, setScenario] = useState<Scenario>("crowd");
  const [seed, setSeed] = useState<Seed>("3");
  const [answer, setAnswer] = useState<{ key: string; walk: Walk } | null>(null);
  const [stage, setStage] = useState(0);
  const [message, setMessage] = useState<string | null>(null);
  const points = scenario === "crowd" ? CROWD : WORKED_PEOPLE;
  // The walk is kept with the scenario and seed it was asked for, so the map
  // never draws one walk's centres over another's people while the next loads.
  const key = `${scenario}-${seed}`;
  const walk = answer?.key === key ? answer.walk : null;

  useEffect(() => {
    (async () => {
      try {
        const fetched = await walkKMeans(points, 2, Number(seed));
        setAnswer({ key, walk: fetched });
        setMessage(null);
      } catch (error) {
        if (error instanceof ApiError) setMessage(error.message);
        else setMessage("Something went wrong.");
      }
    })();
  }, [key, points, seed]);

  const chooseScenario = (value: Scenario) => {
    setScenario(value);
    setStage(0);
  };
  const chooseSeed = (value: Seed) => {
    setSeed(value);
    setStage(0);
  };

  const stages = walk ? stagesOf(walk) : [];
  const current = stages[Math.min(stage, Math.max(stages.length - 1, 0))];

  return (
    <div>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-600 dark:text-slate-300">
        <ChoiceButtons
          choices={[
            { label: "the crowd", value: "crowd" },
            { label: "two small clumps", value: "clumps" },
          ]}
          value={scenario}
          onChange={chooseScenario}
        />
        <span className="flex items-center gap-2">
          seed
          <ChoiceButtons
            choices={[
              { label: "3", value: "3" },
              { label: "1", value: "1" },
              { label: "6", value: "6" },
              { label: "0", value: "0" },
            ]}
            value={seed}
            onChange={chooseSeed}
          />
        </span>
        <span className="ml-auto flex items-center gap-1">
          <button onClick={() => setStage((value) => Math.max(0, value - 1))} disabled={!walk || stage === 0} className="rounded-md border border-slate-300 px-2 py-0.5 text-xs font-medium disabled:opacity-40 dark:border-slate-700">
            back
          </button>
          <button onClick={() => setStage((value) => Math.min(stages.length - 1, value + 1))} disabled={!walk || stage >= stages.length - 1} className="rounded-md border border-slate-300 px-2 py-0.5 text-xs font-medium disabled:opacity-40 dark:border-slate-700">
            next half-step
          </button>
        </span>
      </div>

      {!walk || !current ? (
        <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">{message ?? "…"}</p>
      ) : (
        <>
          <div className="mt-3">
            <ClusterMap points={points} labels={current.labels} centres={current.centres} regions={current.regions} arrows={current.arrows} width={640} height={400} />
          </div>
          <p className="mt-2 text-center text-xs text-slate-500 dark:text-slate-400">
            {current.title}. Stage {stage + 1} of {stages.length}; the walk settled on pass {walk.settled_pass}.
          </p>
          <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
            <Stat label="inertia at this stage" value={current.inertia.toFixed(1)} />
            <Stat label={current.shift !== null ? "largest centre move, squared" : "people who switched group"} value={current.shift !== null ? current.shift.toFixed(1) : current.switched !== null ? String(current.switched) : "none yet"} />
            <Stat label="resting inertia of this start" value={walk.resting_inertia.toFixed(1)} />
            <Stat label="best of ten starts, same seed" value={walk.best_of_ten_inertia.toFixed(1)} />
          </div>
        </>
      )}
      {message && walk && <p className="mt-2 text-sm text-amber-600 dark:text-amber-400">{message}</p>}
    </div>
  );
}
