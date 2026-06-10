"use client";

// The six by six picture taken through one sweep, one position at a time.
//
// Click a cell of the answer and the panel beside it shows the window that
// produced it, the values that window read, the products that were summed and
// the total. The reversing switch flips the weights end over end, which is the
// whole difference between correlation and convolution and shows up as a sign
// on every answer. The API does the arithmetic and hands back every window; the
// browser lays it out.

import { useEffect, useState } from "react";
import {
  EdgeRuleName,
  HandSweep,
  OperatorName,
  messageFor,
  sweepByHand,
} from "@/lib/concepts/filters-and-edges";
import {
  ACTIVE_BUTTON_CLASS,
  BUTTON_CLASS,
  Failure,
  PANEL_CLASS,
  Stat,
  short,
} from "./filtersAndEdgesShared";

const OPERATORS: { name: OperatorName; label: string }[] = [
  { name: "central_difference", label: "Central difference" },
  { name: "prewitt", label: "Prewitt" },
  { name: "sobel", label: "Sobel" },
  { name: "scharr", label: "Scharr" },
];

const EDGE_RULES: { name: EdgeRuleName; label: string }[] = [
  { name: "extend", label: "Repeat the edge" },
  { name: "pad_with_zero", label: "Outside is black" },
  { name: "wrap", label: "Read the far side" },
  { name: "keep_valid", label: "Answer where it fits" },
];

export function SweepByHand() {
  const [operator, setOperator] = useState<OperatorName>("central_difference");
  const [edgeRule, setEdgeRule] = useState<EdgeRuleName>("extend");
  const [vertical, setVertical] = useState(false);
  const [flipped, setFlipped] = useState(false);
  const [chosen, setChosen] = useState<[number, number]>([2, 2]);
  const [sweep, setSweep] = useState<HandSweep | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let live = true;
    (async () => {
      try {
        const answer = await sweepByHand({
          operator,
          edge_rule: edgeRule,
          vertical,
          reversed_weights: flipped,
        });
        if (!live) return;
        setSweep(answer);
        setMessage(null);
      } catch (error) {
        if (live) setMessage(messageFor(error));
      }
    })();
    return () => {
      live = false;
    };
  }, [operator, edgeRule, vertical, flipped]);

  const cell =
    sweep?.cells.find(
      (one) =>
        one.row === Math.min(chosen[0], sweep.answer_height - 1) &&
        one.column === Math.min(chosen[1], sweep.answer_width - 1),
    ) ?? null;

  return (
    <div className={PANEL_CLASS}>
      <div className="flex flex-wrap items-center gap-4 pb-3 text-xs text-slate-600 dark:text-slate-300">
        <span className="flex flex-wrap items-center gap-1">
          weights
          {OPERATORS.map((choice) => (
            <button
              key={choice.name}
              onClick={() => setOperator(choice.name)}
              className={
                operator === choice.name ? ACTIVE_BUTTON_CLASS : BUTTON_CLASS
              }
            >
              {choice.label}
            </button>
          ))}
        </span>
        <span className="flex flex-wrap items-center gap-1">
          outside
          {EDGE_RULES.map((choice) => (
            <button
              key={choice.name}
              onClick={() => setEdgeRule(choice.name)}
              className={
                edgeRule === choice.name ? ACTIVE_BUTTON_CLASS : BUTTON_CLASS
              }
            >
              {choice.label}
            </button>
          ))}
        </span>
        <label className="flex items-center gap-1">
          <input
            type="checkbox"
            checked={vertical}
            onChange={(event) => setVertical(event.target.checked)}
            className="accent-indigo-600"
          />
          ask about downward instead
        </label>
        <label className="flex items-center gap-1">
          <input
            type="checkbox"
            checked={flipped}
            onChange={(event) => setFlipped(event.target.checked)}
            className="accent-indigo-600"
          />
          reverse the weights
        </label>
      </div>

      {sweep ? (
        <div className="flex flex-wrap items-start justify-center gap-6">
          <div className="flex flex-col items-center gap-2">
            <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
              the picture
            </span>
            <NumberGrid
              rows={sweep.picture}
              highlight={
                cell
                  ? {
                      top: cell.top,
                      left: cell.left,
                      height: sweep.weights.length,
                      width: sweep.weights[0].length,
                    }
                  : null
              }
            />
          </div>

          <div className="flex flex-col items-center gap-2">
            <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
              the weights
            </span>
            <NumberGrid rows={sweep.weights} tone="weights" />
            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              they add to {short(sweep.weight_total)}, and the positive ones add
              to {short(sweep.positive_weight_total)}
            </span>
          </div>

          <div className="flex flex-col items-center gap-2">
            <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
              the answer, {sweep.answer_height} by {sweep.answer_width}
            </span>
            <NumberGrid
              rows={sweep.answer}
              onPick={(row, column) => setChosen([row, column])}
              picked={cell ? [cell.row, cell.column] : null}
            />
            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              click a cell to see where it came from
            </span>
          </div>
        </div>
      ) : (
        <p className="py-12 text-center text-slate-400">…</p>
      )}

      {sweep && cell && (
        <div className="mt-5 flex flex-wrap items-center justify-center gap-6">
          <div className="flex flex-col items-center gap-1">
            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              what the window read
            </span>
            <NumberGrid rows={cell.patch} tone="read" />
          </div>
          <span className="text-lg text-slate-400">&times;</span>
          <div className="flex flex-col items-center gap-1">
            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              the weights
            </span>
            <NumberGrid rows={sweep.weights} tone="weights" />
          </div>
          <span className="text-lg text-slate-400">=</span>
          <div className="flex flex-col items-center gap-1">
            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              the products
            </span>
            <NumberGrid rows={cell.products} tone="read" />
          </div>
          <span className="text-lg text-slate-400">&rarr;</span>
          <div className="rounded-lg bg-indigo-600 px-4 py-2 font-mono text-lg font-semibold text-white">
            {short(cell.answer)}
          </div>
        </div>
      )}

      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat
          label="Answer at"
          value={cell ? `row ${cell.row}, column ${cell.column}` : "…"}
        />
        <Stat
          label="Window starts at"
          value={cell ? `row ${cell.top}, column ${cell.left}` : "…"}
        />
        <Stat
          label="Values summed"
          value={
            sweep ? String(sweep.weights.length * sweep.weights[0].length) : "…"
          }
        />
        <Stat label="Answer" value={cell ? short(cell.answer) : "…"} />
      </div>

      <p className="mt-3 text-center text-xs text-slate-500 dark:text-slate-500">
        {sweep
          ? `${sweep.operator_label}, and outside the frame the rule is to ${sweep.edge_rule_label.toLowerCase()}.` +
            (sweep.reversed_weights
              ? " The weights are reversed, so every answer has changed sign and nothing else about the sweep has changed."
              : "") +
            (cell && (cell.top < 0 || cell.left < 0)
              ? " This window begins outside the picture, so part of what it read was invented by the rule above."
              : "")
          : "…"}
      </p>

      <Failure message={message} />
    </div>
  );
}

function NumberGrid({
  rows,
  tone = "picture",
  onPick,
  picked,
  highlight,
}: {
  rows: number[][];
  tone?: "picture" | "weights" | "read";
  onPick?: (row: number, column: number) => void;
  picked?: [number, number] | null;
  highlight?: {
    top: number;
    left: number;
    height: number;
    width: number;
  } | null;
}) {
  const width = rows[0]?.length ?? 0;
  const base =
    tone === "weights"
      ? "bg-white text-slate-700 dark:bg-slate-900 dark:text-slate-200"
      : tone === "read"
        ? "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200"
        : "bg-white text-slate-700 dark:bg-slate-900 dark:text-slate-200";
  return (
    <div
      className="grid gap-0.5"
      style={{ gridTemplateColumns: `repeat(${width}, minmax(0, 1fr))` }}
    >
      {rows.map((row, rowIndex) =>
        row.map((value, columnIndex) => {
          const inWindow =
            highlight !== null &&
            highlight !== undefined &&
            rowIndex >= highlight.top &&
            rowIndex < highlight.top + highlight.height &&
            columnIndex >= highlight.left &&
            columnIndex < highlight.left + highlight.width;
          const isPicked =
            picked !== null &&
            picked !== undefined &&
            picked[0] === rowIndex &&
            picked[1] === columnIndex;
          return (
            <button
              key={`${rowIndex},${columnIndex}`}
              onClick={
                onPick ? () => onPick(rowIndex, columnIndex) : undefined
              }
              disabled={!onPick}
              className={
                "flex h-7 w-9 items-center justify-center rounded-sm border font-mono text-[10px] " +
                base +
                " " +
                (isPicked
                  ? "border-indigo-600 ring-2 ring-indigo-500"
                  : inWindow
                    ? "border-amber-500 ring-2 ring-amber-400"
                    : "border-slate-200 dark:border-slate-800") +
                (onPick ? " cursor-pointer hover:border-indigo-400" : "")
              }
            >
              {short(value)}
            </button>
          );
        }),
      )}
    </div>
  );
}
