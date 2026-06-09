"use client";

// Several people through the two layers at once, drawn as blocks.
//
// The rows go in as one block with a row per person, and each layer turns it
// into a block with the same number of rows and its own number of columns,
// so the pass reads (3, 2) then (3, 3) then (3, 1). The shapes are printed
// over every block and the numbers inside them are the API's. The third
// button sends a row three numbers wide, which the first layer refuses in
// the library's words, because the row is wider than the layer reads.

import { useEffect, useState } from "react";
import { ApiError, BlockResponse, pushBlock } from "@/lib/concepts/dense-layers";
import {
  ACTIVE_BUTTON_CLASS,
  BUTTON_CLASS,
  Stat,
  WORKED_HIDDEN,
  WORKED_OUTPUT,
  show,
  tupleText,
} from "./denseLayersFixtures";

const CELL = { width: 46, height: 26 };
const STAGE_GAP = 60;
const TOP = 44;

type Preset = "three" | "one" | "wide";

// The tall heavy person, someone exactly average, and someone short and a
// little heavy; then the first alone; then a row with a third measurement.
const PRESETS: Record<Preset, { label: string; rows: number[][] }> = {
  three: {
    label: "Three people",
    rows: [
      [1, 2],
      [0, 0],
      [-1, 0.5],
    ],
  },
  one: { label: "One person", rows: [[1, 2]] },
  wide: { label: "A row of width three", rows: [[1, 2, 3]] },
};

export function BlockPass() {
  const [preset, setPreset] = useState<Preset>("three");
  const [answer, setAnswer] = useState<BlockResponse | null>(null);
  const [refusal, setRefusal] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const body = await pushBlock({
          rows: PRESETS[preset].rows,
          hidden: WORKED_HIDDEN,
          output: WORKED_OUTPUT,
        });
        if (cancelled) return;
        setAnswer(body);
        setRefusal(null);
        setMessage(null);
      } catch (error) {
        if (cancelled) return;
        setAnswer(null);
        if (error instanceof ApiError && error.kind === "refused") {
          setRefusal(error.message);
          setMessage(null);
        } else if (error instanceof ApiError) {
          setMessage(error.message);
        } else {
          setMessage("Something went wrong.");
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [preset]);

  const rows = PRESETS[preset].rows;
  const stages: { title: string; values: number[][]; shape: number[] }[] =
    answer
      ? [
          {
            title: "the block read",
            values: answer.layers[0].inputs,
            shape: answer.layers[0].inputs_shape,
          },
          {
            title: "hidden outputs",
            values: answer.layers[0].outputs,
            shape: answer.layers[0].scores_shape,
          },
          {
            title: "output layer",
            values: answer.layers[1].outputs,
            shape: answer.layers[1].scores_shape,
          },
        ]
      : [
          {
            title: "the block read",
            values: rows,
            shape: [rows.length, rows[0].length],
          },
        ];

  let cursor = 24;
  const placed = stages.map((stage) => {
    const left = cursor;
    cursor += stage.shape[1] * CELL.width + STAGE_GAP;
    return { ...stage, left };
  });
  const width = cursor - STAGE_GAP + 24;
  const height = TOP + rows.length * CELL.height + 40;

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 pb-3">
        {(Object.keys(PRESETS) as Preset[]).map((key) => (
          <button
            key={key}
            onClick={() => setPreset(key)}
            className={key === preset ? ACTIVE_BUTTON_CLASS : BUTTON_CLASS}
          >
            {PRESETS[key].label}
          </button>
        ))}
      </div>

      <svg
        viewBox={`0 0 ${Math.max(width, 420)} ${height}`}
        className="w-full max-w-xl select-none rounded-lg bg-slate-50 dark:bg-slate-950"
      >
        {placed.map((stage, stageIndex) => (
          <g key={stage.title}>
            <text
              x={stage.left + (stage.shape[1] * CELL.width) / 2}
              y={TOP - 24}
              textAnchor="middle"
              className="fill-slate-500 text-[11px] font-medium dark:fill-slate-400"
            >
              {stage.title}
            </text>
            <text
              x={stage.left + (stage.shape[1] * CELL.width) / 2}
              y={TOP - 9}
              textAnchor="middle"
              className={`font-mono text-[12px] font-semibold ${
                refusal && stageIndex === 0
                  ? "fill-rose-600 dark:fill-rose-400"
                  : "fill-indigo-700 dark:fill-indigo-300"
              }`}
            >
              {`(${stage.shape.join(", ")})`}
            </text>
            <rect
              x={stage.left - 3}
              y={TOP - 3}
              width={stage.shape[1] * CELL.width + 6}
              height={stage.shape[0] * CELL.height + 6}
              rx={6}
              className={`fill-white ${
                refusal && stageIndex === 0
                  ? "stroke-rose-500"
                  : "stroke-slate-300 dark:stroke-slate-700"
              } dark:fill-slate-900`}
              strokeWidth={1.5}
            />
            {stage.values.map((cells, rowIndex) =>
              cells.map((value, columnIndex) => (
                <text
                  key={`${rowIndex}-${columnIndex}`}
                  x={stage.left + columnIndex * CELL.width + CELL.width / 2}
                  y={TOP + rowIndex * CELL.height + CELL.height / 2 + 4}
                  textAnchor="middle"
                  className={`font-mono text-[12px] ${
                    value === 0 && stageIndex > 0
                      ? "fill-slate-400 dark:fill-slate-500"
                      : "fill-slate-800 dark:fill-slate-200"
                  }`}
                >
                  {show(value)}
                </text>
              )),
            )}
            {stageIndex < placed.length - 1 && (
              <g className="stroke-slate-400 fill-slate-400">
                <line
                  x1={stage.left + stage.shape[1] * CELL.width + 10}
                  y1={TOP + (rows.length * CELL.height) / 2}
                  x2={placed[stageIndex + 1].left - 16}
                  y2={TOP + (rows.length * CELL.height) / 2}
                  strokeWidth={2}
                />
                <polygon
                  points={`${placed[stageIndex + 1].left - 18},${TOP + (rows.length * CELL.height) / 2 - 5} ${placed[stageIndex + 1].left - 8},${TOP + (rows.length * CELL.height) / 2} ${placed[stageIndex + 1].left - 18},${TOP + (rows.length * CELL.height) / 2 + 5}`}
                  strokeWidth={0}
                />
                <text
                  x={(stage.left + stage.shape[1] * CELL.width + placed[stageIndex + 1].left) / 2}
                  y={TOP + (rows.length * CELL.height) / 2 - 9}
                  textAnchor="middle"
                  className="fill-slate-500 stroke-none text-[10px] dark:fill-slate-400"
                >
                  {stageIndex === 0 ? "W₁, bend" : "W₂"}
                </text>
              </g>
            )}
          </g>
        ))}
      </svg>

      {refusal ? (
        <p className="mt-2 font-mono text-sm text-rose-700 dark:text-rose-400">
          {refusal}
        </p>
      ) : (
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat label="Rows in the block" value={answer ? String(answer.n_rows) : "…"} />
          <Stat
            label="Stack reads → answers"
            value={
              answer
                ? `${tupleText(answer.shape.reads)} → ${tupleText(answer.shape.answers)}`
                : "…"
            }
          />
          <Stat
            label="Multiplies per layer"
            value={answer ? "1" : "…"}
          />
          <Stat
            label="The answers"
            value={answer ? `(${answer.outputs.map(show).join(", ")})` : "…"}
          />
        </div>
      )}
      <p className="mt-2 text-xs text-slate-500 dark:text-slate-500">
        A block&rsquo;s first axis is always the people. Each layer keeps
        that axis and replaces the other with its own width, so three people
        stay three rows all the way up.
      </p>

      {message && (
        <p className="mt-3 text-sm text-amber-600 dark:text-amber-400">
          {message}
        </p>
      )}
    </div>
  );
}
