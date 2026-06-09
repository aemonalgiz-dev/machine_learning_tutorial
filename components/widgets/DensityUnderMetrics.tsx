"use client";

// The crowd grouped by density, or by single linkage, under all six metrics.
//
// The density clusterer asks only whether one person is within a radius of
// another, so any metric answers it, and the radius is in that metric's
// own units: twenty centimetres-or-kilograms is a wide net under Chebyshev
// and a modest one under Manhattan, and under cosine the same twenty is the
// whole plane. Single linkage cut at two groups asks which pair of groups
// is nearest, which any metric also answers. Each panel is one metric's
// grouping of the same eleven people, with the count of groups it found and
// how many people it left in none. The API fits; the browser draws.

import { useEffect, useState } from "react";
import { ApiError, Point } from "@/lib/api";
import {
  METRIC_NAMES,
  METRIC_TITLES,
  MetricName,
  ModelsAnswer,
  fitModelsUnderMetrics,
} from "@/lib/concepts/distance-metrics";
import { CROWD } from "./distanceMetricsFixtures";

const RADII = [5, 10, 15, 20, 30];
const DOMAIN = { xMin: 110, xMax: 190, yMin: 15, yMax: 90 };
const VIEW = { width: 200, height: 160 };
const PAD = 10;

const GROUP_CLASSES = [
  "fill-indigo-600",
  "fill-amber-500",
  "fill-emerald-500",
  "fill-rose-500",
  "fill-sky-500",
  "fill-violet-500",
];

type Model = "density" | "linkage";

function toPixel(point: Point) {
  return {
    px:
      PAD +
      ((point.x - DOMAIN.xMin) / (DOMAIN.xMax - DOMAIN.xMin)) *
        (VIEW.width - 2 * PAD),
    py:
      PAD +
      (1 - (point.y - DOMAIN.yMin) / (DOMAIN.yMax - DOMAIN.yMin)) *
        (VIEW.height - 2 * PAD),
  };
}

export function DensityUnderMetrics() {
  const [model, setModel] = useState<Model>("density");
  const [radius, setRadius] = useState(20);
  const [answer, setAnswer] = useState<ModelsAnswer | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let stale = false;
    (async () => {
      try {
        const body = await fitModelsUnderMetrics(CROWD, radius, 2);
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
  }, [radius]);

  const labelsFor = (metric: MetricName): number[] | undefined => {
    if (!answer) return undefined;
    const source = model === "density" ? answer.density : answer.single_linkage;
    return source.find((entry) => entry.metric === metric)?.labels;
  };

  const summaryFor = (metric: MetricName): string => {
    if (!answer) return "…";
    if (model === "density") {
      const entry = answer.density.find((each) => each.metric === metric);
      if (!entry) return "…";
      return `${entry.n_clusters} ${entry.n_clusters === 1 ? "group" : "groups"}, ${entry.n_noise} in none`;
    }
    const entry = answer.single_linkage.find((each) => each.metric === metric);
    if (!entry || entry.last_merge === null) return "…";
    return `last merge at ${entry.last_merge.toPrecision(3)}`;
  };

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 pb-3">
        <div className="flex gap-1 rounded-md border border-slate-300 p-0.5 dark:border-slate-700">
          <button
            onClick={() => setModel("density")}
            className={toggleClass(model === "density")}
          >
            Density
          </button>
          <button
            onClick={() => setModel("linkage")}
            className={toggleClass(model === "linkage")}
          >
            Single linkage, two groups
          </button>
        </div>
        {model === "density" && (
          <>
            <span className="ml-auto text-sm text-slate-600 dark:text-slate-300">
              radius
            </span>
            <div className="flex gap-1 rounded-md border border-slate-300 p-0.5 dark:border-slate-700">
              {RADII.map((each) => (
                <button
                  key={each}
                  onClick={() => setRadius(each)}
                  className={toggleClass(radius === each)}
                >
                  {each}
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {METRIC_NAMES.map((metric) => {
          const labels = labelsFor(metric);
          return (
            <div key={metric}>
              <div className="mb-1 text-sm font-medium text-slate-700 dark:text-slate-200">
                {METRIC_TITLES[metric]}
              </div>
              <svg
                viewBox={`0 0 ${VIEW.width} ${VIEW.height}`}
                className="w-full rounded-md bg-slate-50 dark:bg-slate-950"
              >
                {CROWD.map((person, index) => {
                  const { px, py } = toPixel(person);
                  const label = labels?.[index];
                  const isNoise = label === undefined || label < 0;
                  return (
                    <circle
                      key={index}
                      cx={px}
                      cy={py}
                      r={5}
                      className={
                        isNoise
                          ? "fill-none stroke-slate-500 dark:stroke-slate-400"
                          : GROUP_CLASSES[label % GROUP_CLASSES.length]
                      }
                      strokeWidth={1.5}
                    />
                  );
                })}
              </svg>
              <div className="mt-1 font-mono text-xs text-slate-500 dark:text-slate-400">
                {summaryFor(metric)}
              </div>
            </div>
          );
        })}
      </div>
      <p className="mt-2 text-center text-xs text-slate-500 dark:text-slate-500">
        Filled circles share a colour with the people in their group; a hollow
        circle is a person in no group. Colours mean nothing across panels.
      </p>

      {message && (
        <p className="mt-3 text-sm text-amber-600 dark:text-amber-400">
          {message}
        </p>
      )}
    </div>
  );
}

function toggleClass(active: boolean): string {
  return (
    "rounded px-2.5 py-1 text-sm font-medium transition " +
    (active
      ? "bg-indigo-600 text-white"
      : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800")
  );
}
