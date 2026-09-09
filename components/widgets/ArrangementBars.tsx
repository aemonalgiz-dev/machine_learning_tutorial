"use client";

// The drawn crowd's columns, fitted in one arrangement, read every way.
//
// Two hundred people with height and weight, a raffle ticket that is pure
// chance, and a second reading of height with a little measurement error;
// the rule that assigns adult reads height alone. The API fits a lone tree
// and a forest on whichever columns the chosen arrangement includes, and
// hands back three answers per column: how many splits it won, its share of
// the impurity the splits removed, and its share of the accuracy lost when
// it is scrambled, on the rows the model learned and on as many it never
// saw. Each reading is one row of bars, so a column's answers can be read
// down the page. Amber marks the ticket, teal the second reading of height.
// Every count, share and accuracy is the library's through the API; the
// browser only scales them to pixels.

import { useEffect, useState } from "react";
import {
  ApiError,
  ArrangementModel,
  ArrangementName,
  DrawnCrowd,
  ImportanceShare,
  fetchDrawnCrowd,
} from "@/lib/concepts/feature-importance";
import { ARRANGEMENT_LABELS, fillFor, labelFor } from "./featureImportanceFixtures";

export type Reading = "counts" | "impurity" | "training" | "held_out";

type ModelChoice = "tree" | "forest";

const READING_TITLES: Record<Reading, string> = {
  counts: "Splits won",
  impurity: "Share of impurity removed",
  training: "Share of accuracy lost, scrambled on its rows",
  held_out: "Share of accuracy lost, scrambled held out",
};

const BAR_VIEW = { width: 360 };
const LABEL_WIDTH = 92;
const VALUE_WIDTH = 60;
const BAR_HEIGHT = 18;
const ROW_GAP = 8;
const TOP = 8;
const BAR_SPAN = BAR_VIEW.width - LABEL_WIDTH - VALUE_WIDTH;

function BarRow({
  title,
  entries,
  leading,
  digits,
  refusal,
}: {
  title: string;
  entries: { name: string; value: number; fraction: number }[];
  leading: string | null;
  digits: number;
  refusal: string | null;
}) {
  const height = TOP * 2 + entries.length * (BAR_HEIGHT + ROW_GAP) - ROW_GAP;
  return (
    <div>
      <h3 className="mb-1 text-xs font-semibold text-slate-700 dark:text-slate-200">{title}</h3>
      {refusal ? (
        <p className="rounded-lg bg-slate-50 px-3 py-2 text-xs text-amber-600 dark:bg-slate-950 dark:text-amber-400">
          No column&rsquo;s scramble lowered the score, so there are no shares
          to report, and the refusal reads &ldquo;{refusal}&rdquo;.
        </p>
      ) : (
        <svg
          viewBox={`0 0 ${BAR_VIEW.width} ${height}`}
          className="w-full select-none rounded-lg bg-slate-50 dark:bg-slate-950"
        >
          {entries.map((entry, index) => {
            const y = TOP + index * (BAR_HEIGHT + ROW_GAP);
            const middle = y + BAR_HEIGHT / 2 + 4;
            const leads = leading !== null && entry.name === leading;
            return (
              <g key={entry.name}>
                <text
                  x={LABEL_WIDTH - 8}
                  y={middle}
                  textAnchor="end"
                  className={
                    "text-[11px] " +
                    (leads
                      ? "fill-slate-900 font-semibold dark:fill-slate-100"
                      : "fill-slate-500 font-medium dark:fill-slate-400")
                  }
                >
                  {labelFor(entry.name)}
                </text>
                <rect x={LABEL_WIDTH} y={y} width={BAR_SPAN} height={BAR_HEIGHT} rx={3} className="fill-slate-200 dark:fill-slate-800" />
                {entry.fraction > 0 && (
                  <rect x={LABEL_WIDTH} y={y} width={entry.fraction * BAR_SPAN} height={BAR_HEIGHT} rx={3} className={fillFor(entry.name)} />
                )}
                <text x={LABEL_WIDTH + BAR_SPAN + 8} y={middle} className="fill-slate-700 font-mono text-[11px] dark:fill-slate-200">
                  {entry.value.toFixed(digits)}
                </text>
              </g>
            );
          })}
        </svg>
      )}
    </div>
  );
}

const buttonClass = (active: boolean) =>
  "rounded-md px-2.5 py-1 text-xs font-medium transition " +
  (active
    ? "bg-indigo-600 text-white"
    : "bg-white text-slate-700 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700");

function sharesRow(shares: ImportanceShare[] | null, names: string[]) {
  return names.map((name) => {
    const share = shares?.find((one) => one.name === name)?.share ?? 0;
    return { name, value: share, fraction: share };
  });
}

export function ArrangementBars({
  arrangements = ["measurements", "with_ticket", "with_twin", "all_four", "weight_only", "ticket_only"],
  initialArrangement = "measurements",
  initialModel = "forest",
  readings = ["counts", "impurity", "training", "held_out"],
  showModelToggle = true,
}: {
  arrangements?: ArrangementName[];
  initialArrangement?: ArrangementName;
  initialModel?: ModelChoice;
  readings?: Reading[];
  showModelToggle?: boolean;
}) {
  const [crowd, setCrowd] = useState<DrawnCrowd | null>(null);
  const [chosen, setChosen] = useState<ArrangementName>(initialArrangement);
  const [model, setModel] = useState<ModelChoice>(initialModel);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setCrowd(await fetchDrawnCrowd());
      } catch (error) {
        if (error instanceof ApiError) setMessage(error.message);
        else setMessage("Something went wrong.");
      }
    })();
  }, []);

  if (!crowd) {
    return <p className="text-sm text-slate-500 dark:text-slate-400">{message ?? "…"}</p>;
  }

  const arrangement = crowd.arrangements.find((one) => one.name === chosen) ?? crowd.arrangements[0];
  const fitted: ArrangementModel = arrangement[model];
  const names = arrangement.feature_names;
  const totalSplits = fitted.split_counts.reduce((total, one) => total + one.count, 0);

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 pb-3">
        {arrangements.length > 1 && (
          <div className="flex flex-wrap gap-1 rounded-md border border-slate-300 p-0.5 dark:border-slate-700">
            {arrangements.map((name) => (
              <button key={name} onClick={() => setChosen(name)} className={buttonClass(chosen === name)}>
                {ARRANGEMENT_LABELS[name]}
              </button>
            ))}
          </div>
        )}
        {showModelToggle && (
          <div className="ml-auto flex gap-1 rounded-md border border-slate-300 p-0.5 dark:border-slate-700">
            <button onClick={() => setModel("tree")} className={buttonClass(model === "tree")}>
              Lone tree
            </button>
            <button onClick={() => setModel("forest")} className={buttonClass(model === "forest")}>
              Forest
            </button>
          </div>
        )}
      </div>

      <div className={"grid gap-4 " + (readings.length > 1 ? "sm:grid-cols-2" : "")}>
        {readings.includes("counts") && (
          <BarRow
            title={`${READING_TITLES.counts}, of ${totalSplits}`}
            entries={fitted.split_counts.map((one) => ({
              name: one.name,
              value: one.count,
              fraction: totalSplits > 0 ? one.count / totalSplits : 0,
            }))}
            leading={
              fitted.split_counts.reduce((best, one) => (one.count > best.count ? one : best), fitted.split_counts[0]).name
            }
            digits={0}
            refusal={null}
          />
        )}
        {readings.includes("impurity") && (
          <BarRow
            title={READING_TITLES.impurity}
            entries={sharesRow(fitted.impurity, names)}
            leading={fitted.leading_by_impurity}
            digits={3}
            refusal={null}
          />
        )}
        {readings.includes("training") && (
          <BarRow
            title={READING_TITLES.training}
            entries={sharesRow(fitted.training.shares, names)}
            leading={fitted.training.leading}
            digits={3}
            refusal={fitted.training.refusal}
          />
        )}
        {readings.includes("held_out") && (
          <BarRow
            title={READING_TITLES.held_out}
            entries={sharesRow(fitted.held_out.shares, names)}
            leading={fitted.held_out.leading}
            digits={3}
            refusal={fitted.held_out.refusal}
          />
        )}
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Stat label="Accuracy on its rows" value={fitted.training_accuracy.toFixed(3)} />
        <Stat label="Accuracy held out" value={fitted.held_out_accuracy.toFixed(3)} />
        <Stat
          label={model === "forest" ? "Out-of-bag accuracy" : "Depth reached"}
          value={model === "forest" ? (fitted.out_of_bag_accuracy ?? 0).toFixed(3) : String(fitted.depth)}
        />
        <Stat
          label={model === "forest" ? "Columns offered per split" : "Splits grown"}
          value={model === "forest" ? String(arrangement.max_features) : String(fitted.n_splits)}
        />
      </div>

      <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
        {crowd.n_rows} people fitted and {crowd.n_held_out} held out. The rule
        that assigns adult reads height alone. The correlation of weight with
        height is{" "}
        {crowd.correlations_with_height.find((one) => one.name === "weight")?.credit.toFixed(3)},
        of the second reading of height{" "}
        {crowd.correlations_with_height.find((one) => one.name === "height_again")?.credit.toFixed(3)},
        and of the ticket{" "}
        {crowd.correlations_with_height.find((one) => one.name === "ticket")?.credit.toFixed(3)}.
      </p>

      {message && <p className="mt-3 text-sm text-amber-600 dark:text-amber-400">{message}</p>}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-slate-100 px-2 py-1.5 dark:bg-slate-800">
      <div className="text-[11px] text-slate-500 dark:text-slate-400">{label}</div>
      <div className="font-mono text-sm font-semibold text-slate-900 dark:text-slate-100">{value}</div>
    </div>
  );
}
