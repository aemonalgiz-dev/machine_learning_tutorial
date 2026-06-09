"use client";

// How far from a right angle two random directions actually are.
//
// Two hundred directions are drawn at each width and every one of the 19,900
// pairs is measured; the green curve is what came out and the purple one is
// what the simple rule predicts. The bars underneath are the share of pairs
// that came out at exactly a right angle. The API draws and measures; the
// browser plots.

import { useEffect, useState } from "react";
import {
  ApiError,
  Perpendicularity,
  fetchPerpendicularity,
} from "@/lib/concepts/random-indexing";
import {
  Choice,
  Legend,
  MEASURED,
  PREDICTED,
  SHARED,
  Stat,
  Waiting,
} from "./randomIndexingShared";

const WIDTH = 560;
const HEIGHT = 250;
const LEFT = 42;
const RIGHT = 14;
const TOP = 18;
const BOTTOM = 34;

type Series = "widths" | "fullness";

export function PerpendicularityCurve() {
  const [series, setSeries] = useState<Series>("widths");
  const [measured, setMeasured] = useState<Perpendicularity | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const next = await fetchPerpendicularity();
        if (!cancelled) {
          setMeasured(next);
          setMessage(null);
        }
      } catch (error) {
        if (cancelled) return;
        if (error instanceof ApiError) setMessage(error.message);
        else setMessage("Something went wrong.");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (!measured) return <Waiting message={message} />;

  const rows = series === "widths" ? measured.widths : measured.fullness;
  const tallest = Math.max(...rows.map((one) => Math.max(one.predicted, one.measured)));
  const step = (WIDTH - LEFT - RIGHT) / rows.length;
  const bottom = HEIGHT - BOTTOM;
  const up = (value: number) => bottom - (value / tallest) * (bottom - TOP);
  const at = (position: number) => LEFT + step * (position + 0.5);

  const line = (pick: (one: (typeof rows)[number]) => number) =>
    rows
      .map(
        (one, position) =>
          `${position === 0 ? "M" : "L"} ${at(position).toFixed(1)} ${up(pick(one)).toFixed(1)}`,
      )
      .join(" ");

  const label = (one: (typeof rows)[number]) =>
    series === "widths" ? String(one.dimension) : String(one.n_nonzero);
  const narrowest = rows[0];
  const widest = rows[rows.length - 1];

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
        <Choice
          options={[
            { label: "as the width grows", value: "widths" as Series },
            { label: "as a direction fills up", value: "fullness" as Series },
          ]}
          value={series}
          onChange={setSeries}
        />
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Stat label="directions drawn" value={String(measured.n_vectors)} />
        <Stat label="pairs measured" value={measured.n_pairs.toLocaleString()} />
        <Stat
          label={`at ${label(narrowest)}, measured over predicted`}
          value={narrowest.ratio.toFixed(4)}
        />
        <Stat
          label={`at ${label(widest)}, measured over predicted`}
          value={widest.ratio.toFixed(4)}
        />
      </div>

      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="mt-3 w-full rounded-lg bg-slate-50 dark:bg-slate-900/60"
        role="img"
        aria-label="Measured and predicted closeness between random directions"
      >
        <line x1={LEFT} y1={bottom} x2={WIDTH - RIGHT} y2={bottom} stroke="#cbd5e1" />
        <line x1={LEFT} y1={TOP} x2={LEFT} y2={bottom} stroke="#cbd5e1" />
        <path d={line((one) => one.predicted)} fill="none" stroke={PREDICTED} strokeWidth={1.6} strokeDasharray="4 3" />
        <path d={line((one) => one.measured)} fill="none" stroke={MEASURED} strokeWidth={2} />
        {rows.map((one, position) => (
          <g key={label(one)}>
            <circle cx={at(position)} cy={up(one.measured)} r={3} fill={MEASURED} />
            <circle cx={at(position)} cy={up(one.predicted)} r={2.4} fill={PREDICTED} />
            <rect
              x={at(position) - step * 0.22}
              y={bottom + 4}
              width={step * 0.44}
              height={Math.max(0.8, one.exactly_perpendicular * 18)}
              fill={SHARED}
              fillOpacity={0.55}
            />
            <text
              x={at(position)}
              y={HEIGHT - 4}
              fontSize={8}
              textAnchor="middle"
              fill={SHARED}
            >
              {label(one)}
            </text>
          </g>
        ))}
        <text x={LEFT + 4} y={TOP + 2} fontSize={9} fill={MEASURED}>
          measured
        </text>
        <text x={LEFT + 4} y={TOP + 13} fontSize={9} fill={PREDICTED}>
          predicted
        </text>
        <text x={4} y={up(tallest) + 4} fontSize={8} fill={SHARED}>
          {tallest.toFixed(2)}
        </text>
        <text x={4} y={bottom + 3} fontSize={8} fill={SHARED}>
          0
        </text>
      </svg>

      <Legend>
        The grey stubs under the axis are the share of pairs that came out at
        exactly a right angle, which at four non-zero entries in a thousand
        positions is{" "}
        {`${(measured.widths[measured.widths.length - 1].exactly_perpendicular * 100).toFixed(1)}%`}{" "}
        of them. Switch to the second view and the rule stops predicting
        anything at all, since a direction with every position filled is supposed to
        line up perfectly with its neighbour and comes out at{" "}
        {measured.fullness[measured.fullness.length - 1].measured.toFixed(4)}.
      </Legend>
      {message && (
        <p className="mt-2 text-sm text-amber-600 dark:text-amber-400">
          {message}
        </p>
      )}
    </div>
  );
}
