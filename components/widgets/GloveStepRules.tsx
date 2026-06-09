"use client";

// The same walk under the two step rules, drawn on one pair of axes.
//
// Everything about the two runs is identical, the counts, the weights, the
// start, the order the pairs are visited in and the arithmetic of one pair's
// slopes, and they differ only in where each parameter's running sum of squared
// slopes begins and on which side of the step it is added to. The readouts
// underneath give the mechanism: how far a slope was ever divided by, which is
// the whole of what the released rule fails to do. The API walks and scores;
// the browser draws.

import { useEffect, useState } from "react";
import {
  ApiError,
  STEP_RULE_LABELS,
  StepRules,
  fetchStepRules,
} from "@/lib/concepts/glove";
import { Choice, FALLING, HELD, Legend, Stat, Waiting } from "./gloveShared";

const PANEL = { width: 640, height: 200 };
const PAD = { left: 56, right: 16, top: 16, bottom: 36 };

type Settings = "page" | "published";

export function GloveStepRules() {
  const [settings, setSettings] = useState<Settings>("page");
  const [rules, setRules] = useState<StepRules | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setRules(await fetchStepRules());
      } catch (error) {
        if (error instanceof ApiError) setMessage(error.message);
        else setMessage("Something went wrong.");
      }
    })();
  }, []);

  if (!rules) return <Waiting message={message} />;

  const reports =
    settings === "page" ? rules.reports : rules.published_reports;
  const accumulating = reports.find((report) => report.step_rule === "accumulating")!;
  const released = reports.find((report) => report.step_rule === "released")!;
  const top = Math.max(...reports.flatMap((report) => report.totals)) * 1.05;
  const innerWidth = PANEL.width - PAD.left - PAD.right;
  const innerHeight = PANEL.height - PAD.top - PAD.bottom;
  const length = accumulating.totals.length;
  const positionX = (index: number) =>
    PAD.left + (index / (length - 1)) * innerWidth;
  const positionY = (total: number) => PAD.top + (1 - total / top) * innerHeight;
  const pathOf = (totals: number[]) =>
    totals
      .map(
        (total, index) =>
          `${index === 0 ? "M" : "L"}${positionX(index)},${positionY(total)}`,
      )
      .join(" ");

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
        <Choice
          options={[
            { label: `reach ${rules.window}, width ${rules.dimension}`, value: "page" as Settings },
            {
              label: `reach ${rules.published_window}, width ${rules.published_dimension}`,
              value: "published" as Settings,
            },
          ]}
          value={settings}
          onChange={setSettings}
        />
      </div>

      <svg
        viewBox={`0 0 ${PANEL.width} ${PANEL.height}`}
        className="w-full select-none rounded-lg bg-slate-50 dark:bg-slate-950"
      >
        <path d={pathOf(accumulating.totals)} fill="none" stroke={FALLING} strokeWidth={2} />
        <path d={pathOf(released.totals)} fill="none" stroke={HELD} strokeWidth={2} />
        <text
          x={positionX(length - 1) - 6}
          y={positionY(released.final_total) - 8}
          textAnchor="end"
          className="text-[10px]"
          fill={HELD}
        >
          {STEP_RULE_LABELS.released}
        </text>
        <text
          x={positionX(length - 1) - 6}
          y={positionY(accumulating.final_total) - 8}
          textAnchor="end"
          className="text-[10px]"
          fill={FALLING}
        >
          {STEP_RULE_LABELS.accumulating}
        </text>
        <text
          x={PAD.left - 6}
          y={PAD.top + 4}
          textAnchor="end"
          className="fill-slate-500 text-[10px] dark:fill-slate-400"
        >
          {top.toFixed(1)}
        </text>
        <text
          x={PAD.left - 6}
          y={PAD.top + innerHeight + 4}
          textAnchor="end"
          className="fill-slate-500 text-[10px] dark:fill-slate-400"
        >
          0
        </text>
        <text
          x={PAD.left + innerWidth / 2}
          y={PANEL.height - 8}
          textAnchor="middle"
          className="fill-slate-500 text-[10px] dark:fill-slate-400"
        >
          the summed pair terms of each pass, over {length} passes
        </text>
      </svg>

      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Stat
          label="at rest, accumulating"
          value={accumulating.objective_at_rest.toFixed(4)}
        />
        <Stat label="at rest, as released" value={released.objective_at_rest.toFixed(4)} />
        <Stat
          label="a slope divided by, accumulating"
          value={`${accumulating.smallest_divisor.toFixed(4)} to ${accumulating.largest_divisor.toFixed(4)}`}
        />
        <Stat
          label="a slope divided by, as released"
          value={`${released.smallest_divisor.toFixed(4)} to ${released.largest_divisor.toFixed(4)}`}
        />
      </div>

      <Legend>
        The last two readouts are the mechanism. Under the accumulating rule a
        parameter that has moved a lot is divided by far more than one that has
        barely moved, which is what makes the step adapt; under the released rule
        every slope is divided by something within a few per cent of one, so the
        step stays at the base rate times the slope from the first pass to the
        last.
      </Legend>
      {message && (
        <p className="mt-2 text-sm text-amber-600 dark:text-amber-400">{message}</p>
      )}
    </div>
  );
}
