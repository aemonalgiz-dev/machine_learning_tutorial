"use client";

// Four models fitted to the crowd with the heights in three units and then
// standardized, and which of them noticed.
//
// One request fits everything and the panel prop chooses what to show: the
// gradient walk's condition number and how many passes it took at its own
// safe rate; the ridge coefficient and score at one penalty; the least-squares
// slope, which follows the unit exactly, and the standardized line translated
// back; the decision tree's depth, leaves and root question; and the five
// scalers' round trips through their inverse. Every number is the library's
// through the API; the browser lays them out.

import { useEffect, useState } from "react";
import { ApiError } from "@/lib/api";
import {
  DescentByUnit,
  HeightUnit,
  UnitModels,
  fetchModelsByUnit,
} from "@/lib/concepts/feature-scaling";
import { CROWD } from "./featureScalingFixtures";

export type ModelPanel = "descent" | "ridge" | "least_squares" | "tree" | "inverse";

const UNIT_LABELS: Record<HeightUnit, string> = {
  millimetres: "millimetres",
  centimetres: "centimetres",
  metres: "metres",
  standardized: "standardized",
};

const METHOD_LABELS: Record<string, string> = {
  standardize: "standardize",
  min_max: "min-max",
  max_abs: "max-abs",
  robust: "robust",
  root_mean_square: "root mean square",
};

const BAR = { width: 640, height: 130 };
const BAR_PAD = { left: 110, right: 70, top: 8, bottom: 22 };

function compact(value: number, digits = 4): string {
  if (value === 0) return "0";
  const magnitude = Math.abs(value);
  if (magnitude < 1e-3 || magnitude >= 1e6) return value.toExponential(2);
  return value.toFixed(digits);
}

export function ModelsByUnit({ panel }: { panel: ModelPanel }) {
  const [models, setModels] = useState<UnitModels | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setModels(await fetchModelsByUnit(CROWD));
      } catch (error) {
        if (error instanceof ApiError) setMessage(error.message);
        else setMessage("Something went wrong.");
      }
    })();
  }, []);

  if (!models) {
    return <p className="text-sm text-slate-500 dark:text-slate-400">{message ?? "…"}</p>;
  }

  if (panel === "descent") {
    return (
      <div>
        <PassesChart descents={models.descents} />
        <Table
          headings={["height in", "condition number", "safe rate", "passes", "finished", "level reached"]}
          rows={models.descents.map((descent) => [
            UNIT_LABELS[descent.unit],
            compact(descent.condition_number, 1),
            compact(descent.learning_rate),
            String(descent.epochs_run),
            descent.converged ? "yes" : "no, stopped at the cap",
            descent.level.toFixed(2),
          ])}
        />
      </div>
    );
  }

  if (panel === "ridge") {
    return (
      <Table
        headings={["height in", "coefficient", "intercept", "R²"]}
        rows={models.ridges.map((ridge) => [
          UNIT_LABELS[ridge.unit],
          compact(ridge.coefficient),
          ridge.intercept.toFixed(3),
          ridge.r_squared.toFixed(4),
        ])}
      />
    );
  }

  if (panel === "least_squares") {
    return (
      <Table
        headings={["height in", "slope", "intercept", "R²", "slope back in cm", "intercept back in cm"]}
        rows={models.least_squares.map((line) => [
          UNIT_LABELS[line.unit],
          compact(line.slope),
          line.intercept.toFixed(3),
          line.r_squared.toFixed(7),
          line.slope_in_centimetres.toFixed(6),
          line.intercept_in_centimetres.toFixed(4),
        ])}
      />
    );
  }

  if (panel === "tree") {
    return (
      <div>
        <Table
          headings={["height in", "depth", "leaves", "root question", "predictions"]}
          rows={models.trees.map((tree) => [
            UNIT_LABELS[tree.unit],
            String(tree.depth),
            String(tree.n_leaves),
            tree.root_feature === null || tree.root_threshold === null
              ? "no split"
              : `${tree.root_feature} < ${compact(tree.root_threshold, 3)}`,
            tree.predictions.join(""),
          ])}
        />
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          {models.trees_agree
            ? "Every row predicts the same class for every one of the eleven people; the predictions column is identical down the table."
            : "The trees disagree somewhere, which this crowd was not expected to produce."}
        </p>
      </div>
    );
  }

  return (
    <Table
      headings={["method", "largest gap after scaling and restoring, cm"]}
      rows={models.round_trips.map((trip) => [
        METHOD_LABELS[trip.method] ?? trip.method,
        trip.max_gap === 0 ? "0, exactly" : trip.max_gap.toExponential(2),
      ])}
    />
  );
}

function PassesChart({ descents }: { descents: DescentByUnit[] }) {
  const innerWidth = BAR.width - BAR_PAD.left - BAR_PAD.right;
  const rowHeight = (BAR.height - BAR_PAD.top - BAR_PAD.bottom) / descents.length;
  const top = Math.log10(Math.max(...descents.map((descent) => descent.epochs_run)));
  const length = (passes: number) => (Math.log10(Math.max(passes, 1)) / top) * innerWidth;
  return (
    <svg viewBox={`0 0 ${BAR.width} ${BAR.height}`} className="mb-3 w-full select-none rounded-lg bg-slate-50 dark:bg-slate-950">
      {descents.map((descent, index) => {
        const y = BAR_PAD.top + index * rowHeight;
        return (
          <g key={descent.unit}>
            <text x={BAR_PAD.left - 8} y={y + rowHeight / 2 + 4} textAnchor="end" className="fill-slate-600 text-[11px] dark:fill-slate-300">{UNIT_LABELS[descent.unit]}</text>
            <rect x={BAR_PAD.left} y={y + 4} width={length(descent.epochs_run)} height={rowHeight - 8} fill={descent.converged ? "#6366f1" : "#f43f5e"} rx={2} />
            <text x={BAR_PAD.left + length(descent.epochs_run) + 6} y={y + rowHeight / 2 + 4} className="fill-slate-600 text-[11px] font-medium dark:fill-slate-300">
              {descent.epochs_run}{descent.converged ? "" : "+"}
            </text>
          </g>
        );
      })}
      <text x={BAR_PAD.left + innerWidth / 2} y={BAR.height - 6} textAnchor="middle" className="fill-slate-500 text-[10px] dark:fill-slate-400">passes to converge, log scale; rose did not finish inside the cap</text>
    </svg>
  );
}

function Table({ headings, rows }: { headings: string[]; rows: string[][] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-slate-200 text-left dark:border-slate-800">
            {headings.map((heading) => (
              <th key={heading} className="py-2 pr-4 font-semibold text-slate-600 last:pr-0 dark:text-slate-400">{heading}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.join("|")} className="border-b border-slate-100 last:border-0 dark:border-slate-800/60">
              {row.map((cell, column) => (
                <td key={`${column}-${cell}`} className="py-2 pr-4 font-mono text-slate-800 last:pr-0 dark:text-slate-200">{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
