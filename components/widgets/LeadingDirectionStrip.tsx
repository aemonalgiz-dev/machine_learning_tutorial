"use client";

// Where every document falls on one direction, as a strip with the two halves
// coloured.
//
// The first strip is the leading direction of the table as it was counted, and
// every document is on the same side of nothing; the second is the direction
// after it, where the two halves part completely; the third is what the leading
// direction becomes when each word's mean across the documents is subtracted
// first, which is a different method and is here for the contrast. The API
// decomposes; the browser draws.

import { useEffect, useState } from "react";
import {
  ApiError,
  Directions,
  fetchDirections,
} from "@/lib/concepts/latent-semantic-analysis";
import {
  Choice,
  Legend,
  SHARED,
  Stat,
  Waiting,
  colourFor,
} from "./latentSemanticShared";

type Reading = "leading" | "next" | "shifted";

const READINGS: { label: string; value: Reading }[] = [
  { label: "direction 1, as counted", value: "leading" },
  { label: "direction 2, as counted", value: "next" },
  { label: "direction 1, after shifting", value: "shifted" },
];

const WIDTH = 560;
const HEIGHT = 130;
const PADDING = 30;

export function LeadingDirectionStrip() {
  const [reading, setReading] = useState<Reading>("leading");
  const [directions, setDirections] = useState<Directions | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const next = await fetchDirections();
        if (!cancelled) {
          setDirections(next);
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

  if (!directions) return <Waiting message={message} />;

  const values =
    reading === "leading"
      ? directions.as_counted_first
      : reading === "next"
        ? directions.as_counted_second
        : directions.after_shifting_first;
  const means =
    reading === "leading"
      ? directions.as_counted_first_means
      : reading === "next"
        ? directions.as_counted_second_means
        : directions.after_shifting_means;
  const difference =
    reading === "leading"
      ? directions.as_counted_first_difference
      : reading === "next"
        ? directions.as_counted_second_difference
        : directions.after_shifting_difference;

  const reach = Math.max(...values.map(Math.abs), 0.001) * 1.12;
  const across = (value: number) =>
    PADDING + ((value + reach) / (2 * reach)) * (WIDTH - 2 * PADDING);

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
        <Choice options={READINGS} value={reading} onChange={setReading} />
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        <Stat
          label="mean of the first half"
          value={means[0].toFixed(4)}
        />
        <Stat
          label="mean of the second half"
          value={means[1].toFixed(4)}
        />
        <Stat
          label="one mean minus the other"
          value={
            Math.abs(difference) < 1e-6
              ? difference.toExponential(1)
              : difference.toFixed(4)
          }
        />
      </div>

      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="mt-3 w-full rounded-lg bg-slate-50 dark:bg-slate-900/60"
        role="img"
        aria-label="Every document's coordinate on one direction"
      >
        <line
          x1={PADDING}
          y1={HEIGHT / 2}
          x2={WIDTH - PADDING}
          y2={HEIGHT / 2}
          stroke="#cbd5e1"
          strokeWidth={1.5}
        />
        <line
          x1={across(0)}
          y1={26}
          x2={across(0)}
          y2={HEIGHT - 26}
          stroke="#94a3b8"
          strokeWidth={1}
          strokeDasharray="3 3"
        />
        <text
          x={across(0)}
          y={HEIGHT - 10}
          fontSize={10}
          textAnchor="middle"
          fill={SHARED}
        >
          nothing
        </text>
        {values.map((value, position) => (
          <circle
            key={position}
            cx={across(value)}
            cy={HEIGHT / 2 + (position % 2 === 0 ? -9 : 9)}
            r={5.5}
            fill={colourFor(directions.document_groups[position])}
            fillOpacity={0.55}
            stroke={colourFor(directions.document_groups[position])}
          />
        ))}
        {means.map((mean, half) => (
          <line
            key={`mean-${half}`}
            x1={across(mean)}
            y1={30}
            x2={across(mean)}
            y2={HEIGHT - 30}
            stroke={colourFor(half === 0 ? "cooking" : "sailing")}
            strokeWidth={2}
          />
        ))}
      </svg>

      <Legend>
        One dot per document, amber for the twelve about cooking and indigo for
        the twelve about sailing, jittered up and down only so that dots on top
        of one another can be counted. The tall bars are the two halves&rsquo;
        means. On the leading direction as counted the two bars land on top of
        each other, and every dot is to the right of the dashed line.
      </Legend>
      {message && (
        <p className="mt-2 text-sm text-amber-600 dark:text-amber-400">
          {message}
        </p>
      )}
    </div>
  );
}
