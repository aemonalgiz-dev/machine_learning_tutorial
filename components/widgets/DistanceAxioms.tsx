"use client";

// Three people put through the checks a distance has to pass, six times.
//
// A distance must put a person at zero from themselves, answer the same
// both ways, and never make the direct route longer than going by way of a
// third person. The API measures all four numbers under every metric and
// the table marks which checks hold. Three people of one height are the
// case that matters: every p-norm makes the two legs sum to the direct
// route exactly, and cosine makes them sum to half of it. The API computes
// and the browser draws.

import { useEffect, useState } from "react";
import { ApiError, Point } from "@/lib/api";
import {
  AxiomsAnswer,
  METRIC_TITLES,
  checkAxioms,
} from "@/lib/concepts/distance-metrics";
import {
  OFF_LINE_TRIPLE,
  SAME_HEIGHT_TRIPLE,
  formatDistance,
} from "./distanceMetricsFixtures";

type TripleName = "same_height" | "off_line";

const TRIPLES: Record<TripleName, [Point, Point, Point]> = {
  same_height: SAME_HEIGHT_TRIPLE,
  off_line: OFF_LINE_TRIPLE,
};

const VIEW = { width: 320, height: 200 };
const PAD = 28;

export function DistanceAxioms() {
  const [triple, setTriple] = useState<TripleName>("same_height");
  const [answer, setAnswer] = useState<AxiomsAnswer | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let stale = false;
    const [first, second, third] = TRIPLES[triple];
    (async () => {
      try {
        const body = await checkAxioms(first, second, third);
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
  }, [triple]);

  const people = TRIPLES[triple];
  const xs = people.map((point) => point.x);
  const ys = people.map((point) => point.y);
  const xMin = Math.min(...xs) - 5;
  const xMax = Math.max(...xs) + 5;
  const yMin = Math.min(...ys) - 5;
  const yMax = Math.max(...ys) + 5;
  const toPixel = (point: Point) => ({
    px: PAD + ((point.x - xMin) / (xMax - xMin)) * (VIEW.width - 2 * PAD),
    py:
      PAD + (1 - (point.y - yMin) / (yMax - yMin)) * (VIEW.height - 2 * PAD),
  });
  const [first, second, third] = people.map(toPixel);

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 pb-3">
        <button
          onClick={() => setTriple("same_height")}
          className={buttonClass(triple === "same_height")}
        >
          Three of one height
        </button>
        <button
          onClick={() => setTriple("off_line")}
          className={buttonClass(triple === "off_line")}
        >
          By way of the nearest person
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-[320px_1fr]">
        <svg
          viewBox={`0 0 ${VIEW.width} ${VIEW.height}`}
          className="w-full rounded-lg bg-slate-50 dark:bg-slate-950"
        >
          <line
            x1={first.px}
            y1={first.py}
            x2={second.px}
            y2={second.py}
            stroke="currentColor"
            className="text-indigo-500"
            strokeWidth={2}
          />
          <line
            x1={first.px}
            y1={first.py}
            x2={third.px}
            y2={third.py}
            stroke="currentColor"
            className="text-amber-500"
            strokeWidth={1.5}
            strokeDasharray="4 3"
          />
          <line
            x1={third.px}
            y1={third.py}
            x2={second.px}
            y2={second.py}
            stroke="currentColor"
            className="text-amber-500"
            strokeWidth={1.5}
            strokeDasharray="4 3"
          />
          {[first, second, third].map((pixel, index) => (
            <g key={index}>
              <circle
                cx={pixel.px}
                cy={pixel.py}
                r={6}
                className="fill-slate-700 stroke-white dark:fill-slate-200 dark:stroke-slate-900"
                strokeWidth={1.5}
              />
              <text
                x={pixel.px + 9}
                y={pixel.py - 8}
                className="fill-slate-600 text-[11px] dark:fill-slate-300"
              >
                ({people[index].x}, {people[index].y})
              </text>
            </g>
          ))}
        </svg>
        <p className="text-sm text-slate-600 dark:text-slate-300">
          The solid line is the direct route between the first two people; the
          dashed pair is the route by way of the third. A distance may never
          make the solid line longer than the dashed pair together.
        </p>
      </div>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-sm text-slate-700 dark:text-slate-300">
          <thead>
            <tr className="text-left text-xs text-slate-500 dark:text-slate-400">
              <th className="py-1 pr-3 font-medium">Metric</th>
              <th className="py-1 pr-3 font-medium">Self</th>
              <th className="py-1 pr-3 font-medium">Direct</th>
              <th className="py-1 pr-3 font-medium">Back</th>
              <th className="py-1 pr-3 font-medium">Two legs</th>
              <th className="py-1 pr-3 font-medium">Triangle</th>
              <th className="py-1 font-medium">Origin to itself</th>
            </tr>
          </thead>
          <tbody>
            {answer
              ? answer.metrics.map((entry) => (
                  <tr
                    key={entry.metric}
                    className={
                      entry.triangle_holds
                        ? "border-t border-slate-100 dark:border-slate-800"
                        : "bg-amber-500/10"
                    }
                  >
                    <td className="py-1 pr-3">{METRIC_TITLES[entry.metric]}</td>
                    <td className="py-1 pr-3 font-mono">
                      {formatDistance(entry.self_distance)}
                    </td>
                    <td className="py-1 pr-3 font-mono">
                      {formatDistance(entry.forward)}
                    </td>
                    <td className="py-1 pr-3 font-mono">
                      {formatDistance(entry.backward)}
                    </td>
                    <td className="py-1 pr-3 font-mono">
                      {formatDistance(entry.leg_one)} +{" "}
                      {formatDistance(entry.leg_two)} ={" "}
                      {formatDistance(entry.via)}
                    </td>
                    <td className="py-1 pr-3">
                      {entry.triangle_holds ? "holds" : "fails"}
                    </td>
                    <td className="py-1 font-mono">
                      {formatDistance(entry.origin_self_distance)}
                    </td>
                  </tr>
                ))
              : null}
          </tbody>
        </table>
        {!answer && !message && (
          <p className="text-sm text-slate-500 dark:text-slate-400">…</p>
        )}
      </div>

      {message && (
        <p className="mt-3 text-sm text-amber-600 dark:text-amber-400">
          {message}
        </p>
      )}
    </div>
  );
}

function buttonClass(active: boolean): string {
  return (
    "rounded-md border px-3 py-1.5 text-sm font-medium transition " +
    (active
      ? "border-indigo-600 bg-indigo-600 text-white"
      : "border-slate-300 bg-white text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700")
  );
}
