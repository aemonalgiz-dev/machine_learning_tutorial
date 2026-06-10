"use client";

// What a pooling layer takes off the bank of maps a convolution hands it.
//
// The picture here is the one the convolution page ends on, twenty-eight by
// twenty-eight read by eight filters of three by three, which answers with
// eight maps of twenty-six by twenty-six. The API builds a pooling layer over
// that arrangement at each window and stride and reads the counts off its
// shape, pooling nothing, so the bars below are arithmetic the layer did at
// construction. The browser draws the bars.

import { useEffect, useState } from "react";
import { ApiError } from "@/lib/api";
import { Arrangement, readArrangement } from "@/lib/concepts/pooling";

const FILTERS = 8;
const MAP_SIDE = 26;
const WINDOWS = [2, 3];
const STRIDES = [1, 2];

const BAR = { width: 420, height: 30 };

export function PoolingReduction() {
  const [arrangement, setArrangement] = useState<Arrangement | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setArrangement(
          await readArrangement({
            channels: FILTERS,
            height: MAP_SIDE,
            width: MAP_SIDE,
            windows: WINDOWS,
            strides: STRIDES,
          }),
        );
      } catch (error) {
        if (error instanceof ApiError) setMessage(error.message);
        else setMessage("Something went wrong.");
      }
    })();
  }, []);

  const rows = arrangement?.rows.filter((row) => !row.refused) ?? [];
  const largest = rows.length > 0 ? (rows[0].n_inputs ?? 1) : 1;
  const halved = rows.find((row) => row.window === 2 && row.stride === 2);

  return (
    <div className="rounded-lg bg-slate-50 p-4 dark:bg-slate-950">
      <p className="pb-3 text-sm text-slate-600 dark:text-slate-300">
        Eight maps of {MAP_SIDE} by {MAP_SIDE}, which is what a bank of eight
        three by three filters answers with over a twenty-eight by twenty-eight
        picture.
      </p>

      <div className="space-y-2">
        <Bar
          label="the maps as they arrive"
          count={largest}
          largest={largest}
          accent="#6366f1"
        />
        {rows.map((row) => (
          <Bar
            key={`${row.window}/${row.stride}`}
            label={`window ${row.window}, stride ${row.stride} → ${row.answers?.join(" × ")}`}
            count={row.n_outputs ?? 0}
            largest={largest}
            accent="#10b981"
          />
        ))}
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
        <Stat
          label="Numbers arriving"
          value={rows.length > 0 ? String(largest) : "…"}
        />
        <Stat
          label="After a window of two at two"
          value={halved ? String(halved.n_outputs) : "…"}
        />
        <Stat
          label="Share carried forward"
          value={halved?.kept_share !== undefined && halved?.kept_share !== null ? halved.kept_share.toFixed(4) : "…"}
        />
      </div>

      <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
        The leading 8 never changes. Pooling shrinks the two spatial extents and
        carries the channel count straight through, so eight detectors go in and
        eight come out.
      </p>

      {message && (
        <p className="mt-3 text-sm text-amber-600 dark:text-amber-400">
          {message}
        </p>
      )}
    </div>
  );
}

function Bar({
  label,
  count,
  largest,
  accent,
}: {
  label: string;
  count: number;
  largest: number;
  accent: string;
}) {
  const width = largest > 0 ? (count / largest) * BAR.width : 0;
  return (
    <div>
      <div className="flex items-baseline justify-between text-xs text-slate-600 dark:text-slate-400">
        <span>{label}</span>
        <span className="font-mono">{count}</span>
      </div>
      <svg
        viewBox={`0 0 ${BAR.width} ${BAR.height}`}
        className="w-full"
        preserveAspectRatio="none"
        style={{ height: BAR.height }}
      >
        <rect
          x={0}
          y={6}
          width={BAR.width}
          height={BAR.height - 12}
          className="fill-slate-200 dark:fill-slate-800"
        />
        <rect
          x={0}
          y={6}
          width={width}
          height={BAR.height - 12}
          fill={accent}
          opacity={0.8}
        />
      </svg>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-slate-100 px-3 py-2 dark:bg-slate-800">
      <div className="text-xs text-slate-500 dark:text-slate-400">{label}</div>
      <div className="break-all font-mono text-lg font-semibold text-slate-900 dark:text-slate-100">
        {value}
      </div>
    </div>
  );
}
