"use client";

// Twelve searches on one number line.
//
// Six textures with the shape drawn into them and the same six without, each
// contributing one point: how far the winner of that search stood clear of the
// best position that did not overlap it. The two groups fall in ranges that do
// not touch, which is the whole reason a ratio is worth reading, and the
// threshold sits in the gap.
//
// The second panel is the finding that cost something. The same experiment at
// three template sizes, and at the smallest the two groups run together, because
// nine pixels are matched by chance almost anywhere and no threshold repairs
// that. The API measures; the browser draws.

import { useEffect, useState } from "react";
import { ApiError } from "@/lib/api";
import {
  BelievabilityResponse,
  fetchBelievability,
} from "@/lib/concepts/template-matching";
import { MARK_COLOURS, Stat } from "./templateMatchingPictures";

const VIEW = { width: 640, height: 130 };
const PAD = { left: 90, right: 24, top: 26, bottom: 34 };

export function BelievabilityStrip({ showSizes = true }: { showSizes?: boolean }) {
  const [body, setBody] = useState<BelievabilityResponse | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setBody(await fetchBelievability());
        setMessage(null);
      } catch (error) {
        if (error instanceof ApiError) setMessage(error.message);
        else setMessage("Something went wrong.");
      }
    })();
  }, []);

  if (!body) {
    return (
      <p className="text-sm text-slate-500 dark:text-slate-400">
        {message ?? "…"}
      </p>
    );
  }

  const lowest = 1.0;
  const highest = Math.max(body.present_high, body.threshold) * 1.05;
  const place = (ratio: number) =>
    PAD.left +
    ((ratio - lowest) / (highest - lowest)) * (VIEW.width - PAD.left - PAD.right);
  const absentRow = PAD.top + 14;
  const presentRow = PAD.top + 52;

  const ticks = [1.0, 1.5, 2.0, 2.5];

  return (
    <div>
      <svg
        viewBox={`0 0 ${VIEW.width} ${VIEW.height}`}
        className="w-full"
        role="img"
        aria-label="How far the winner stood clear, with the shape present and absent"
      >
        <line
          x1={place(body.threshold)}
          x2={place(body.threshold)}
          y1={PAD.top - 8}
          y2={VIEW.height - PAD.bottom + 6}
          stroke={MARK_COLOURS.indigo}
          strokeWidth={1.5}
          strokeDasharray="4 3"
        />
        <text
          x={place(body.threshold)}
          y={PAD.top - 12}
          textAnchor="middle"
          className="fill-indigo-600 text-[10px] dark:fill-indigo-400"
        >
          believed above {body.threshold}
        </text>

        <text
          x={PAD.left - 10}
          y={absentRow + 4}
          textAnchor="end"
          className="fill-slate-600 text-[11px] dark:fill-slate-400"
        >
          not there
        </text>
        <text
          x={PAD.left - 10}
          y={presentRow + 4}
          textAnchor="end"
          className="fill-slate-600 text-[11px] dark:fill-slate-400"
        >
          there
        </text>

        {body.seeds.map((seed) => (
          <circle
            key={`absent-${seed.seed}`}
            cx={place(seed.absent_ratio)}
            cy={absentRow}
            r={5}
            fill={MARK_COLOURS.rose}
            fillOpacity={0.8}
          />
        ))}
        {body.seeds.map((seed) => (
          <circle
            key={`present-${seed.seed}`}
            cx={place(seed.present_ratio)}
            cy={presentRow}
            r={5}
            fill={MARK_COLOURS.emerald}
            fillOpacity={0.8}
          />
        ))}

        <line
          x1={PAD.left}
          x2={VIEW.width - PAD.right}
          y1={VIEW.height - PAD.bottom + 6}
          y2={VIEW.height - PAD.bottom + 6}
          className="stroke-slate-300 dark:stroke-slate-700"
        />
        {ticks.map((tick) => (
          <g key={tick}>
            <line
              x1={place(tick)}
              x2={place(tick)}
              y1={VIEW.height - PAD.bottom + 6}
              y2={VIEW.height - PAD.bottom + 11}
              className="stroke-slate-300 dark:stroke-slate-700"
            />
            <text
              x={place(tick)}
              y={VIEW.height - PAD.bottom + 24}
              textAnchor="middle"
              className="fill-slate-600 text-[11px] dark:fill-slate-400"
            >
              {tick.toFixed(1)}
            </text>
          </g>
        ))}
      </svg>

      <div className="mt-3 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Stat
          label="Absent, range"
          value={`${body.absent_low.toFixed(4)} to ${body.absent_high.toFixed(4)}`}
          tone="bad"
        />
        <Stat
          label="Present, range"
          value={`${body.present_low.toFixed(4)} to ${body.present_high.toFixed(4)}`}
          tone="good"
        />
        <Stat
          label="Best score with nothing there"
          value={`up to ${body.absent_score_high.toFixed(4)}`}
        />
        <Stat
          label="Template"
          value={`${body.template_side} by ${body.template_side}, in ${body.texture_side} by ${body.texture_side}`}
        />
      </div>

      {showSizes && (
        <div className="mt-6 overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left dark:border-slate-800">
                <th className="py-2 pr-6 font-semibold text-slate-600 dark:text-slate-400">
                  Template
                </th>
                <th className="py-2 pr-6 font-semibold text-slate-600 dark:text-slate-400">
                  Best chance agreement
                </th>
                <th className="py-2 pr-6 font-semibold text-slate-600 dark:text-slate-400">
                  Absent
                </th>
                <th className="py-2 pr-6 font-semibold text-slate-600 dark:text-slate-400">
                  Present
                </th>
                <th className="py-2 font-semibold text-slate-600 dark:text-slate-400">
                  Present but not believed
                </th>
              </tr>
            </thead>
            <tbody>
              {body.sizes.map((row) => (
                <tr
                  key={row.side}
                  className="border-b border-slate-100 last:border-0 dark:border-slate-800/60"
                >
                  <td className="py-2 pr-6 font-mono text-slate-800 dark:text-slate-200">
                    {row.side} by {row.side}
                  </td>
                  <td className="py-2 pr-6 font-mono text-slate-800 dark:text-slate-200">
                    {row.mean_chance_agreement.toFixed(4)} on average, up to{" "}
                    {row.highest_chance_agreement.toFixed(4)}
                  </td>
                  <td className="py-2 pr-6 font-mono text-slate-800 dark:text-slate-200">
                    {row.has_a_second_candidate
                      ? `${row.absent_low?.toFixed(4)} to ${row.absent_high?.toFixed(4)}`
                      : "no runner-up exists"}
                  </td>
                  <td className="py-2 pr-6 font-mono text-slate-800 dark:text-slate-200">
                    {row.has_a_second_candidate
                      ? `${row.present_low?.toFixed(4)} to ${row.present_high?.toFixed(4)}`
                      : "no runner-up exists"}
                  </td>
                  <td
                    className={`py-2 font-mono ${
                      row.present_below_threshold
                        ? "text-rose-600 dark:text-rose-400"
                        : "text-slate-800 dark:text-slate-200"
                    }`}
                  >
                    {row.has_a_second_candidate
                      ? `${row.present_below_threshold} of ${row.n_seeds}`
                      : "cannot be asked"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            Chance agreement is the best score a template of that size reaches in{" "}
            {body.n_chance_seeds} pictures that do not contain it. The seven by
            seven row leaves no position far enough from the winner to count as a
            different candidate, so the question cannot be put to it at all.
          </p>
        </div>
      )}
    </div>
  );
}
