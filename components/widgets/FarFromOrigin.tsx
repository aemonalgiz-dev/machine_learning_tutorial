"use client";

// One Euclidean distance reached three ways, at coordinates near a million.
//
// The definition squares the gaps and roots the sum. The matrix-multiply
// form opens the square into two squared lengths and a dot product, which is
// what makes it fast, and on coordinates as given it recovers a small gap
// as the difference of two enormous numbers and loses it entirely. The
// library uses the same expansion after shifting both rows toward the
// remembered rows' mean, and gets the definition's answer back. Pick a gap
// and read the three. The API computes; the browser draws.

import { useEffect, useState } from "react";
import { ApiError } from "@/lib/api";
import {
  EuclideanRoutes,
  measurePair,
} from "@/lib/concepts/distance-metrics";

const BASE = 999999;
const GAPS = [0.000001, 0.001, 1];

export function FarFromOrigin() {
  const [gap, setGap] = useState(GAPS[0]);
  const [routes, setRoutes] = useState<EuclideanRoutes | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let stale = false;
    (async () => {
      try {
        const body = await measurePair(
          { x: BASE, y: BASE },
          { x: BASE + gap, y: BASE },
        );
        if (stale) return;
        setRoutes(body.euclidean_routes);
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
  }, [gap]);

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 pb-3">
        <span className="text-sm text-slate-600 dark:text-slate-300">
          Two people at ({BASE.toLocaleString()}, {BASE.toLocaleString()}), the
          second a gap of
        </span>
        <div className="flex gap-1 rounded-md border border-slate-300 p-0.5 dark:border-slate-700">
          {GAPS.map((each) => (
            <button
              key={each}
              onClick={() => setGap(each)}
              className={
                "rounded px-2.5 py-1 font-mono text-sm font-medium transition " +
                (gap === each
                  ? "bg-indigo-600 text-white"
                  : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800")
              }
            >
              {each}
            </button>
          ))}
        </div>
        <span className="text-sm text-slate-600 dark:text-slate-300">
          further along.
        </span>
      </div>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        <Stat
          label="the definition, root of the summed squares"
          value={routes ? routes.direct.toExponential(4) : "…"}
        />
        <Stat
          label="the expansion on the raw coordinates"
          value={routes ? routes.expanded_raw.toExponential(4) : "…"}
          highlighted={routes !== null && routes.expanded_raw !== routes.direct}
        />
        <Stat
          label="the expansion after shifting to the mean"
          value={routes ? routes.library.toExponential(4) : "…"}
        />
      </div>
      {message && (
        <p className="mt-3 text-sm text-amber-600 dark:text-amber-400">
          {message}
        </p>
      )}
    </div>
  );
}

function Stat({
  label,
  value,
  highlighted = false,
}: {
  label: string;
  value: string;
  highlighted?: boolean;
}) {
  return (
    <div
      className={
        "rounded-lg px-3 py-2 " +
        (highlighted
          ? "bg-amber-100 ring-1 ring-amber-400 dark:bg-amber-950 dark:ring-amber-500"
          : "bg-slate-100 dark:bg-slate-800")
      }
    >
      <div className="text-xs text-slate-500 dark:text-slate-400">{label}</div>
      <div className="font-mono text-lg font-semibold text-slate-900 dark:text-slate-100">
        {value}
      </div>
    </div>
  );
}
