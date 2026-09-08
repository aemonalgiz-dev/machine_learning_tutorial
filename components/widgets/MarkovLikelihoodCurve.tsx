"use client";

// The log likelihood of the vowel row, drawn against every value it could take.
//
// The vowel row of the table enters the probability of the counted text once
// for every step that began at a vowel, as p for the steps that went to a vowel
// and as one minus p for the rest. So its contribution to the log likelihood is
// a curve in p alone, and the curve peaks at the count ratio. The API returns
// the curve evaluated on the chain's own counts, which is the definition drawn
// rather than a fit; the browser draws it and marks the peak.

import { useEffect, useState } from "react";
import { VowelsView, fetchVowels, messageFor } from "@/lib/concepts/markov-chains";
import { AMBER, Caption, INDIGO, Loading, Stat } from "./markovParts";

const WIDTH = 640;
const HEIGHT = 250;
const PAD_LEFT = 58;
const PAD_RIGHT = 16;
const PAD_TOP = 14;
const PAD_BOTTOM = 38;
const MARKED = [0.1, 0.2];

export function MarkovLikelihoodCurve() {
  const [view, setView] = useState<VowelsView | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setView(await fetchVowels());
      } catch (error) {
        setMessage(messageFor(error));
      }
    })();
  }, []);

  if (!view) return <Loading message={message} />;

  const points = view.likelihood;
  const best = view.best_log_likelihood;
  const lowest = Math.min(...points.map((point) => point.log_likelihood - best));
  const first = points[0].probability;
  const last = points[points.length - 1].probability;
  const toX = (probability: number) =>
    PAD_LEFT +
    ((probability - first) / (last - first)) * (WIDTH - PAD_LEFT - PAD_RIGHT);
  const toY = (relative: number) =>
    PAD_TOP + (relative / lowest) * (HEIGHT - PAD_TOP - PAD_BOTTOM);
  const stays = view.counted.counts[0][0];
  const began = stays + view.counted.counts[0][1];
  const marked = MARKED.map((value) =>
    points.find((point) => Math.abs(point.probability - value) < 1e-9),
  );
  const ticks = [0, -1000, -2000, -3000].filter((tick) => tick >= lowest);

  return (
    <div>
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="w-full select-none rounded-lg bg-slate-50 dark:bg-slate-950"
      >
        {ticks.map((tick) => (
          <g key={tick}>
            <line
              x1={PAD_LEFT}
              x2={WIDTH - PAD_RIGHT}
              y1={toY(tick)}
              y2={toY(tick)}
              className="stroke-slate-200 dark:stroke-slate-800"
            />
            <text
              x={PAD_LEFT - 6}
              y={toY(tick) + 3}
              textAnchor="end"
              className="fill-slate-500 font-mono text-[10px] dark:fill-slate-400"
            >
              {tick === 0 ? "0" : `−${Math.abs(tick).toLocaleString()}`}
            </text>
          </g>
        ))}
        <path
          d={points
            .map(
              (point, index) =>
                `${index === 0 ? "M" : "L"} ${toX(point.probability).toFixed(1)} ${toY(point.log_likelihood - best).toFixed(1)}`,
            )
            .join(" ")}
          fill="none"
          stroke={INDIGO}
          strokeWidth={2}
        />
        <line
          x1={toX(view.best_probability)}
          x2={toX(view.best_probability)}
          y1={PAD_TOP}
          y2={HEIGHT - PAD_BOTTOM}
          stroke={INDIGO}
          strokeDasharray="4 4"
        />
        {marked.map(
          (point) =>
            point && (
              <circle
                key={point.probability}
                cx={toX(point.probability)}
                cy={toY(point.log_likelihood - best)}
                r={4}
                fill={AMBER}
              />
            ),
        )}
        {[0.1, 0.2, 0.3, 0.4, 0.5, 0.6].map((value) => (
          <text
            key={value}
            x={toX(value)}
            y={HEIGHT - PAD_BOTTOM + 14}
            textAnchor="middle"
            className="fill-slate-500 font-mono text-[10px] dark:fill-slate-400"
          >
            {value.toFixed(1)}
          </text>
        ))}
        <text
          x={(PAD_LEFT + WIDTH - PAD_RIGHT) / 2}
          y={HEIGHT - 6}
          textAnchor="middle"
          className="fill-slate-500 text-[11px] dark:fill-slate-400"
        >
          a candidate chance of a vowel after a vowel
        </text>
      </svg>

      <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Stat
          label={`the count ratio, ${stays} ⁄ ${began.toLocaleString()}`}
          value={view.best_probability.toFixed(4)}
        />
        <Stat label="log likelihood there, nats" value={best.toFixed(2)} />
        {marked.map(
          (point) =>
            point && (
              <Stat
                key={point.probability}
                label={`at ${point.probability.toFixed(2)}, lower by`}
                value={(best - point.log_likelihood).toFixed(1)}
              />
            ),
        )}
      </div>
      <Caption>
        The curve is the vowel row&rsquo;s share of the log likelihood of the
        counted text, measured from its peak. The dashed line is the count
        ratio and the amber points are two nearby tables, each of which makes
        the text less probable by the factor e raised to the number shown.
      </Caption>
    </div>
  );
}
