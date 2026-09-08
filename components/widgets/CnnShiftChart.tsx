"use client";

// What moving a held-out picture by one, two or three pixels does to each
// arrangement's answer.
//
// Every held-out picture whose shape stays inside the frame is moved that far
// right, left, down and up, and the chart gives the share of those moved
// pictures whose called kind changed. One thin line per weight seed, so the
// spread between starts is on the chart. The switch underneath changes the
// reading to how far the four probabilities moved. Every point is the API's.

import { useEffect, useState } from "react";
import { ApiError } from "@/lib/api";
import {
  fetchNetworkReport,
  SEEDS,
  Variant,
  VariantReport,
} from "@/lib/concepts/convolutional-networks";
import {
  ACTIVE_BUTTON_CLASS,
  BUTTON_CLASS,
} from "@/components/widgets/filtersAndEdgesShared";
import {
  Loading,
  percent,
  VARIANT_COLOURS,
  VARIANT_NAMES,
} from "@/components/widgets/convolutionalNetworksShared";

const CHART = { width: 420, height: 220 };
const PAD = { left: 40, right: 14, top: 14, bottom: 30 };

type Reading = "calls_changed" | "probability_move";

export function CnnShiftChart({ variants }: { variants: Variant[] }) {
  const [reports, setReports] = useState<VariantReport[] | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [reading, setReading] = useState<Reading>("calls_changed");

  useEffect(() => {
    Promise.all(
      variants.flatMap((variant) => SEEDS.map((seed) => fetchNetworkReport(variant, seed))),
    )
      .then(setReports)
      .catch((error) =>
        setMessage(error instanceof ApiError ? error.message : "Something went wrong."),
      );
  }, [variants]);

  if (!reports) return <Loading message={message} />;

  const top = Math.min(1, Math.ceil(Math.max(...reports.flatMap((report) => report.shifts.map((shift) => shift[reading]))) * 10) / 10);
  const x = (distance: number) => PAD.left + ((distance - 1) / 2) * (CHART.width - PAD.left - PAD.right);
  const y = (value: number) => CHART.height - PAD.bottom - (value / top) * (CHART.height - PAD.top - PAD.bottom);
  const ticks = [0, top / 2, top];

  return (
    <div>
      <svg viewBox={`0 0 ${CHART.width} ${CHART.height}`} className="w-full rounded-lg bg-slate-50 dark:bg-slate-950">
        <g className="text-slate-500 dark:text-slate-400" fill="currentColor" fontSize={10}>
          {ticks.map((tick) => (
            <g key={tick}>
              <line x1={PAD.left} x2={CHART.width - PAD.right} y1={y(tick)} y2={y(tick)} stroke="currentColor" strokeOpacity={0.15} />
              <text x={PAD.left - 5} y={y(tick) + 3} textAnchor="end">
                {reading === "calls_changed" ? percent(tick, 0) : tick.toFixed(2)}
              </text>
            </g>
          ))}
          {[1, 2, 3].map((distance) => (
            <text key={distance} x={x(distance)} y={CHART.height - 12} textAnchor="middle">
              {distance} pixel{distance === 1 ? "" : "s"}
            </text>
          ))}
        </g>
        {reports.map((report) => {
          const colour = VARIANT_COLOURS[report.variant];
          const points = report.shifts.map((shift) => `${x(shift.distance).toFixed(1)},${y(shift[reading]).toFixed(1)}`);
          return (
            <g key={`${report.variant}-${report.seed}`}>
              <polyline points={points.join(" ")} fill="none" stroke={colour} strokeWidth={1.6} strokeOpacity={0.8} />
              {report.shifts.map((shift) => (
                <circle key={shift.distance} cx={x(shift.distance)} cy={y(shift[reading])} r={2.8} fill={colour} />
              ))}
            </g>
          );
        })}
      </svg>
      <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-slate-600 dark:text-slate-400">
        {variants.map((variant) => (
          <span key={variant}>
            <span className="mr-1 inline-block h-2.5 w-2.5 rounded-full" style={{ background: VARIANT_COLOURS[variant] }} />
            {VARIANT_NAMES[variant]}
          </span>
        ))}
        <span className="ml-auto flex gap-1.5">
          <button className={reading === "calls_changed" ? ACTIVE_BUTTON_CLASS : BUTTON_CLASS} onClick={() => setReading("calls_changed")}>
            calls changed
          </button>
          <button className={reading === "probability_move" ? ACTIVE_BUTTON_CLASS : BUTTON_CLASS} onClick={() => setReading("probability_move")}>
            probabilities moved
          </button>
        </span>
      </div>
      <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
        {reading === "calls_changed"
          ? "The share of moved pictures whose highest-scoring kind is not the one it was before the move, right or wrong either time."
          : "Half the summed change in the four probabilities, averaged over the moved pictures, so 0 is an answer that did not move and 1 is one that moved all its weight elsewhere."}{" "}
        {reports[0].shifts.map((shift) => `${shift.n_pictures} moved pictures at ${shift.distance}`).join(", ")}.
      </p>
    </div>
  );
}
