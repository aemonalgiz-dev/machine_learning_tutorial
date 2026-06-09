"use client";

// Six fits over one orchard, each run on the recorded columns and again on the
// standard scores, and which of them the unit moved.
//
// One request carries everything and the panel prop chooses what to show: the
// leave-one-out scores of the six families, with a bar for each pair; the
// weights a line puts on the two columns under both readings and the same
// weights translated back; the question a tree roots on under both readings;
// and the difference between learning the two numbers inside each fold and
// learning them once over the whole orchard, which is the leak. Every number is
// the API's; the browser lays them out.

import { useEffect, useState } from "react";
import { ApiError } from "@/lib/api";
import { ModelComparison, fetchModels } from "@/lib/concepts/the-standard-score";

export type NoticedPanel = "scores" | "coefficients" | "tree" | "leak";

const BAR = { width: 640, height: 190 };
const BAR_PAD = { left: 150, right: 56, top: 22, bottom: 26 };

const RECORDED_COLOUR = "#f43f5e";
const STANDARD_COLOUR = "#6366f1";

function readingLabel(reading: string): string {
  return reading === "recorded" ? "as recorded" : "in standard scores";
}

export function WhoNoticed({ panel }: { panel: NoticedPanel }) {
  const [models, setModels] = useState<ModelComparison | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setModels(await fetchModels());
      } catch (error) {
        setMessage(
          error instanceof ApiError ? error.message : "Something went wrong.",
        );
      }
    })();
  }, []);

  if (!models) {
    return (
      <p className="text-sm text-slate-500 dark:text-slate-400">
        {message ?? "…"}
      </p>
    );
  }

  if (panel === "scores") {
    return (
      <div>
        <ScoreBars models={models} />
        <Table
          headings={["fitted", "as recorded", "in standard scores", "moved by"]}
          rows={models.scores.map((row) => [
            row.family,
            row.recorded.toFixed(4),
            row.inside.toFixed(4),
            row.moved ? (row.inside - row.recorded).toFixed(4) : "nothing at all",
          ])}
        />
        <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
          A score below zero is worse than answering the orchard&rsquo;s average
          to every tree. Reading only the water column, with no standardizing at
          all, scores {models.water_alone_three.toFixed(4)}; reading only the
          trunk column scores {models.girth_alone_three.toFixed(4)}.
        </p>
      </div>
    );
  }

  if (panel === "coefficients") {
    const translated = new Map(
      models.translated_back.map((row) => [row.name, row.value]),
    );
    return (
      <div>
        <Table
          headings={["fitted", "on trunk girth", "on water", "level", "R²"]}
          rows={[
            ...models.least_squares.map((reading) => [
              `least squares, ${readingLabel(reading.reading)}`,
              reading.coefficients[0].value.toPrecision(5),
              reading.coefficients[1].value.toPrecision(5),
              reading.intercept.toFixed(4),
              reading.fitted_score.toFixed(7),
            ]),
            [
              "the standardized weights divided by each spread",
              (translated.get("girth") ?? 0).toPrecision(5),
              (translated.get("water") ?? 0).toPrecision(5),
              "",
              "",
            ],
            ...models.ridge_penalty_one.map((reading) => [
              `penalised, ${readingLabel(reading.reading)}`,
              reading.coefficients[0].value.toPrecision(5),
              reading.coefficients[1].value.toPrecision(5),
              reading.intercept.toFixed(4),
              reading.fitted_score.toFixed(7),
            ]),
          ]}
        />
        <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
          The two least-squares rows describe one line in two coordinate
          systems, and their R² agree to{" "}
          {models.least_squares_score_gap === 0
            ? "the last bit"
            : models.least_squares_score_gap.toExponential(1)}
          . The two penalised rows are two different fits.
        </p>
      </div>
    );
  }

  if (panel === "tree") {
    return (
      <div>
        <Table
          headings={["asked of", "root question", "depth", "leaves", "R²"]}
          rows={models.trees.map((tree) => [
            readingLabel(tree.reading),
            `${tree.root_column === "girth" ? "trunk girth" : "water"} below ${tree.root_threshold.toPrecision(4)}`,
            String(tree.depth),
            String(tree.leaves),
            tree.fitted_score.toFixed(7),
          ])}
        />
        <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
          The standardized threshold multiplied by the spread and put back
          about the average comes to{" "}
          {models.tree_threshold_translated.toPrecision(4)}, which is the
          recorded one, and the largest gap between the two sets of predictions
          over all twenty-four trees is{" "}
          {models.tree_largest_prediction_gap === 0
            ? "exactly zero"
            : models.tree_largest_prediction_gap.toExponential(1)}
          .
        </p>
      </div>
    );
  }

  return (
    <div>
      <Table
        headings={[
          "fitted",
          "two numbers from the training rows",
          "two numbers from all twenty-four",
          "difference",
        ]}
        rows={models.scores.map((row) => [
          row.family,
          row.inside.toFixed(6),
          row.outside.toFixed(6),
          row.leak === 0 ? "exactly zero" : row.leak.toExponential(2),
        ])}
      />
      <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
        A positive difference would mean the second column was flattered by
        having seen the held-out tree. Not one row here is positive.
      </p>
    </div>
  );
}

function ScoreBars({ models }: { models: ModelComparison }) {
  const innerWidth = BAR.width - BAR_PAD.left - BAR_PAD.right;
  const rowHeight = (BAR.height - BAR_PAD.top - BAR_PAD.bottom) / models.scores.length;
  const lowest = Math.min(-1, ...models.scores.map((row) => row.recorded));
  const at = (score: number) =>
    BAR_PAD.left + ((score - lowest) / (1 - lowest)) * innerWidth;
  return (
    <svg
      viewBox={`0 0 ${BAR.width} ${BAR.height}`}
      className="mb-3 w-full select-none rounded-lg bg-slate-50 dark:bg-slate-950"
    >
      <line
        x1={at(0)}
        y1={BAR_PAD.top - 6}
        x2={at(0)}
        y2={BAR.height - BAR_PAD.bottom}
        className="stroke-slate-300 dark:stroke-slate-700"
      />
      <text
        x={at(0)}
        y={BAR_PAD.top - 10}
        textAnchor="middle"
        className="fill-slate-500 text-[10px] dark:fill-slate-400"
      >
        no better than the average
      </text>
      {models.scores.map((row, index) => {
        const y = BAR_PAD.top + index * rowHeight;
        return (
          <g key={row.family}>
            <text
              x={BAR_PAD.left - 8}
              y={y + rowHeight / 2 + 4}
              textAnchor="end"
              className="fill-slate-600 text-[10px] dark:fill-slate-300"
            >
              {row.family}
            </text>
            <rect
              x={Math.min(at(row.recorded), at(0))}
              y={y + 3}
              width={Math.abs(at(row.recorded) - at(0))}
              height={rowHeight / 2 - 4}
              fill={RECORDED_COLOUR}
              rx={2}
            />
            <rect
              x={Math.min(at(row.inside), at(0))}
              y={y + rowHeight / 2 + 1}
              width={Math.abs(at(row.inside) - at(0))}
              height={rowHeight / 2 - 4}
              fill={STANDARD_COLOUR}
              rx={2}
            />
          </g>
        );
      })}
      <text
        x={BAR.width - BAR_PAD.right}
        y={BAR.height - 8}
        textAnchor="end"
        className="fill-slate-500 text-[10px] dark:fill-slate-400"
      >
        rose as recorded, indigo in standard scores
      </text>
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
              <th
                key={heading}
                className="py-2 pr-4 font-semibold text-slate-600 last:pr-0 dark:text-slate-400"
              >
                {heading}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={row.join("|")}
              className="border-b border-slate-100 last:border-0 dark:border-slate-800/60"
            >
              {row.map((cell, column) => (
                <td
                  key={`${column}-${cell}`}
                  className="py-2 pr-4 font-mono text-slate-800 last:pr-0 dark:text-slate-200"
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
