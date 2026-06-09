"use client";

// Inertia against the number of groups asked for, on a chosen set of people.
//
// Each dot is the library's usual best-of-ten fit at that k, and the curve
// can only fall, since more centres can only sit closer to people, so the
// picture cannot choose k on its own. What it can show is where the fall
// flattens, and how sharply, which differs between the sets on offer. The
// grey line is the total scatter about the grand mean, which is the inertia
// one centre must pay. Every fit is the API's.

import { useEffect, useState } from "react";
import { ApiError, Point } from "@/lib/api";
import { Elbow, sweepElbow } from "@/lib/concepts/k-means";
import { ChoiceButtons, Stat } from "./ClusterMap";
import { CROWD, IDEAL_CASE, TWO_BANDS, WORKED_PEOPLE } from "./kMeansFixtures";

type Scenario = "clumps" | "crowd" | "ideal" | "bands";

const SCENARIOS: Record<Scenario, Point[]> = {
  clumps: WORKED_PEOPLE,
  crowd: CROWD,
  ideal: IDEAL_CASE,
  bands: TWO_BANDS,
};

const VIEW = { width: 640, height: 320 };
const PAD = { left: 72, right: 24, top: 20, bottom: 48 };
const PLOT = { width: VIEW.width - PAD.left - PAD.right, height: VIEW.height - PAD.top - PAD.bottom };
const MAX_K = 8;

function dropAt(elbow: Elbow, k: number): string {
  const drop = elbow.points.find((each) => each.k === k)?.drop_from_previous;
  return drop === undefined || drop === null ? "…" : drop.toFixed(1);
}

export function ElbowChart() {
  const [scenario, setScenario] = useState<Scenario>("clumps");
  const [answer, setAnswer] = useState<{ scenario: Scenario; elbow: Elbow } | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const points = SCENARIOS[scenario];
  // The answer is kept with the scenario it belongs to, so a panel never
  // draws one scenario's fit over another's people while the next loads.
  const elbow = answer?.scenario === scenario ? answer.elbow : null;

  useEffect(() => {
    (async () => {
      try {
        const fetched = await sweepElbow(points, MAX_K);
        setAnswer({ scenario, elbow: fetched });
        setMessage(null);
      } catch (error) {
        if (error instanceof ApiError) setMessage(error.message);
        else setMessage("Something went wrong.");
      }
    })();
  }, [scenario, points]);

  const kX = (k: number) => PAD.left + ((k - 1) / (MAX_K - 1)) * PLOT.width;
  const inertiaY = (value: number, top: number) => PAD.top + (1 - value / top) * PLOT.height;

  return (
    <div>
      <ChoiceButtons
        choices={[
          { label: "two small clumps", value: "clumps" },
          { label: "the crowd", value: "crowd" },
          { label: "an ideal case", value: "ideal" },
          { label: "two bands", value: "bands" },
        ]}
        value={scenario}
        onChange={setScenario}
      />
      {!elbow ? (
        <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">{message ?? "…"}</p>
      ) : (
        <>
          <svg viewBox={`0 0 ${VIEW.width} ${VIEW.height}`} className="mt-3 w-full select-none rounded-lg bg-slate-50 dark:bg-slate-950">
            <line x1={PAD.left} y1={PAD.top} x2={PAD.left} y2={PAD.top + PLOT.height} className="stroke-slate-300 dark:stroke-slate-700" strokeWidth={1} />
            <line x1={PAD.left} y1={PAD.top + PLOT.height} x2={PAD.left + PLOT.width} y2={PAD.top + PLOT.height} className="stroke-slate-300 dark:stroke-slate-700" strokeWidth={1} />
            <line x1={PAD.left} x2={PAD.left + PLOT.width} y1={inertiaY(elbow.total_scatter, elbow.total_scatter)} y2={inertiaY(elbow.total_scatter, elbow.total_scatter)} className="stroke-slate-400 dark:stroke-slate-600" strokeWidth={1} strokeDasharray="4 3" />
            <path
              d={elbow.points.map((each, index) => `${index === 0 ? "M" : "L"} ${kX(each.k)} ${inertiaY(each.inertia, elbow.total_scatter)}`).join(" ")}
              fill="none"
              stroke="#6366f1"
              strokeWidth={2}
            />
            {elbow.points.map((each) => (
              <g key={each.k}>
                <circle cx={kX(each.k)} cy={inertiaY(each.inertia, elbow.total_scatter)} r={5} fill="#6366f1" stroke="white" strokeWidth={1.5} />
                <text x={kX(each.k)} y={inertiaY(each.inertia, elbow.total_scatter) - 10} textAnchor="middle" className="fill-slate-600 text-[10px] dark:fill-slate-300">
                  {each.inertia.toFixed(each.inertia < 100 ? 1 : 0)}
                </text>
                <text x={kX(each.k)} y={PAD.top + PLOT.height + 16} textAnchor="middle" className="fill-slate-500 text-[10px] dark:fill-slate-400">
                  {each.k}
                </text>
              </g>
            ))}
            <text x={PAD.left - 8} y={PAD.top + 4} textAnchor="end" className="fill-slate-500 text-[10px] dark:fill-slate-400">
              {elbow.total_scatter.toFixed(0)}
            </text>
            <text x={PAD.left - 8} y={PAD.top + PLOT.height + 4} textAnchor="end" className="fill-slate-500 text-[10px] dark:fill-slate-400">
              0
            </text>
            <text x={PAD.left + PLOT.width / 2} y={VIEW.height - 8} textAnchor="middle" className="fill-slate-500 text-xs font-medium dark:fill-slate-400">
              groups asked for, k
            </text>
            <text x={16} y={PAD.top + PLOT.height / 2} textAnchor="middle" transform={`rotate(-90 16 ${PAD.top + PLOT.height / 2})`} className="fill-slate-500 text-xs font-medium dark:fill-slate-400">
              inertia, best of ten starts
            </text>
          </svg>
          <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
            <Stat label="total scatter, k = 1" value={elbow.total_scatter.toFixed(1)} />
            <Stat label="drop from 1 to 2 groups" value={dropAt(elbow, 2)} />
            <Stat label="drop from 2 to 3 groups" value={dropAt(elbow, 3)} />
            <Stat label="share of the total left at k = 3" value={elbow.points[2] ? (100 * elbow.points[2].share_of_total).toFixed(1) + "%" : "…"} />
          </div>
        </>
      )}
      {message && elbow && <p className="mt-2 text-sm text-amber-600 dark:text-amber-400">{message}</p>}
    </div>
  );
}
