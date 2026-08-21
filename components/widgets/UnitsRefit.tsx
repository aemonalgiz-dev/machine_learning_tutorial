"use client";

// The same crowd refitted three ways: as measured, with the weight column
// rescaled, and standardised.
//
// A distance adds gaps across columns, so the column with the larger
// numbers does most of the adding. The factor puts weight into grams at a
// thousand and into tonnes at a thousandth, and for each treatment the
// library refits the neighbour model and ranks the crowd, while the share
// of the squared-gap arithmetic that height is doing says which column the
// distance is actually reading. Standardising is the treatment the feature
// scaling page argues for. The API refits; the browser draws.

import { useEffect, useState } from "react";
import { ApiError } from "@/lib/api";
import {
  METRIC_NAMES,
  METRIC_TITLES,
  MetricName,
  Treatment,
  UnitsAnswer,
  refitUnderUnits,
} from "@/lib/concepts/distance-metrics";
import {
  WORKED_PEOPLE,
  WORKED_QUERY,
  formatDistance,
} from "./distanceMetricsFixtures";

const FACTORS: { label: string; value: number }[] = [
  { label: "tonnes", value: 0.001 },
  { label: "kilograms", value: 1 },
  { label: "grams", value: 1000 },
];

const TREATMENT_TITLES: Record<Treatment["name"], string> = {
  raw: "as measured",
  weight_rescaled: "weight rescaled",
  standardised: "standardised",
};

export function UnitsRefit() {
  const [metric, setMetric] = useState<MetricName>("euclidean");
  const [factor, setFactor] = useState(1000);
  const [answer, setAnswer] = useState<UnitsAnswer | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let stale = false;
    (async () => {
      try {
        const body = await refitUnderUnits(
          WORKED_PEOPLE,
          WORKED_QUERY,
          metric,
          3,
          factor,
        );
        if (stale) return;
        setAnswer(body);
        setMessage(null);
      } catch (error) {
        if (stale) return;
        if (error instanceof ApiError) setMessage(error.message);
        else setMessage("Something went wrong.");
      }
    })();
    return () => {
      stale = true;
    };
  }, [metric, factor]);

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 pb-3">
        <div className="flex flex-wrap gap-1 rounded-md border border-slate-300 p-0.5 dark:border-slate-700">
          {METRIC_NAMES.map((name) => (
            <button
              key={name}
              onClick={() => setMetric(name)}
              className={toggleClass(metric === name)}
            >
              {METRIC_TITLES[name]}
            </button>
          ))}
        </div>
        <span className="ml-auto text-sm text-slate-600 dark:text-slate-300">
          weight in
        </span>
        <div className="flex gap-1 rounded-md border border-slate-300 p-0.5 dark:border-slate-700">
          {FACTORS.map((each) => (
            <button
              key={each.value}
              onClick={() => setFactor(each.value)}
              className={toggleClass(factor === each.value)}
            >
              {each.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {answer
          ? answer.treatments.map((treatment) => (
              <TreatmentPanel key={treatment.name} treatment={treatment} />
            ))
          : ["raw", "weight_rescaled", "standardised"].map((name) => (
              <div
                key={name}
                className="rounded-lg bg-slate-100 px-3 py-2 text-sm text-slate-500 dark:bg-slate-800 dark:text-slate-400"
              >
                …
              </div>
            ))}
      </div>
      <p className="mt-2 text-center text-xs text-slate-500 dark:text-slate-500">
        The three people the query at (150, 45) consults under{" "}
        {METRIC_TITLES[metric]} distance, with the share of the squared-gap
        arithmetic the height column is doing. The middle panel is the crowd
        with its weights multiplied by {factor}.
      </p>

      {message && (
        <p className="mt-3 text-sm text-amber-600 dark:text-amber-400">
          {message}
        </p>
      )}
    </div>
  );
}

function TreatmentPanel({ treatment }: { treatment: Treatment }) {
  return (
    <div className="rounded-lg border border-slate-200 px-3 py-2 dark:border-slate-800">
      <div className="text-sm font-medium text-slate-700 dark:text-slate-200">
        {TREATMENT_TITLES[treatment.name]}
      </div>
      <div className="mt-1 font-mono text-xs text-slate-500 dark:text-slate-400">
        query at ({compact(treatment.query.x)}, {compact(treatment.query.y)})
      </div>
      <ol className="mt-2 space-y-1 text-sm text-slate-700 dark:text-slate-300">
        {treatment.neighbours.map((neighbour, rank) => {
          const person = WORKED_PEOPLE[neighbour.index];
          return (
            <li key={neighbour.index} className="flex justify-between gap-2">
              <span>
                {rank + 1}. ({person.x}, {person.y}){" "}
                <span
                  className={
                    neighbour.label === 1
                      ? "text-indigo-600 dark:text-indigo-400"
                      : "text-amber-600 dark:text-amber-400"
                  }
                >
                  {neighbour.label === 1 ? "adult" : "child"}
                </span>
              </span>
              <span className="font-mono">
                {formatDistance(neighbour.distance)}
              </span>
            </li>
          );
        })}
      </ol>
      <div className="mt-2 grid grid-cols-2 gap-2">
        <Stat
          label="answer"
          value={treatment.prediction === 1 ? "adult" : "child"}
        />
        <Stat
          label="height's share"
          value={shareText(treatment.height_share_of_squared_gaps)}
        />
      </div>
    </div>
  );
}

// A share near one or near zero is more readable as a power of ten than as
// a run of nines or noughts.
function shareText(share: number): string {
  if (share > 0.001 && share < 0.999) return share.toFixed(3);
  return share.toExponential(2);
}

function compact(value: number): string {
  if (Number.isInteger(value)) return value.toLocaleString();
  return value.toFixed(3);
}

function toggleClass(active: boolean): string {
  return (
    "rounded px-2.5 py-1 text-sm font-medium transition " +
    (active
      ? "bg-indigo-600 text-white"
      : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800")
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-slate-100 px-3 py-2 dark:bg-slate-800">
      <div className="text-xs text-slate-500 dark:text-slate-400">{label}</div>
      <div className="font-mono text-base font-semibold text-slate-900 dark:text-slate-100">
        {value}
      </div>
    </div>
  );
}
