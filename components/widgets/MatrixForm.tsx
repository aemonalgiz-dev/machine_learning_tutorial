"use client";

// The hidden layer's three dot products written as one matrix multiply.
//
// The weight rows stacked into a matrix W, the row x standing beside it as a
// column, the biases b, and the scores z they produce. Choosing a neuron
// lights its row of W, the whole of x, and the entry of z it accounts for,
// and the caption underneath writes that one row's arithmetic out term by
// term. The toggle switches to the output layer, whose matrix has one row of
// three and reads the hidden layer's outputs. Every entry is the API's; the
// browser draws the brackets and the highlight.

import { useState } from "react";
import {
  HIDDEN_NAMES,
  INPUT_NAMES,
  OUTPUT_NAMES,
  ACTIVE_BUTTON_CLASS,
  BUTTON_CLASS,
  Stat,
  show,
  useForward,
  workedRequest,
} from "./denseLayersFixtures";

const CELL = { width: 44, height: 30 };
const GAP = 22;
const TOP = 34;

type Which = "hidden" | "output";

export function MatrixForm() {
  const [which, setWhich] = useState<Which>("hidden");
  const [selected, setSelected] = useState(0);
  const { pass, message } = useForward(workedRequest());

  if (!pass) {
    return (
      <p className="text-sm text-slate-500 dark:text-slate-400">
        {message ?? "…"}
      </p>
    );
  }

  const layer = pass.layers[which === "hidden" ? 0 : 1];
  const neuronNames = which === "hidden" ? HIDDEN_NAMES : OUTPUT_NAMES;
  const inputNames = which === "hidden" ? INPUT_NAMES : HIDDEN_NAMES;
  const row = Math.min(selected, layer.weight_matrix.length - 1);
  const nNeurons = layer.weight_matrix.length;
  const nInputs = layer.inputs.length;
  const tallest = Math.max(nNeurons, nInputs);
  const height = TOP + tallest * CELL.height + 30;

  // Five blocks left to right: W, x, +, b, = z. Each block's left edge.
  const wLeft = 30;
  const xLeft = wLeft + nInputs * CELL.width + GAP + 16;
  const bLeft = xLeft + CELL.width + GAP + 28;
  const zLeft = bLeft + CELL.width + GAP + 28;
  const width = zLeft + CELL.width + 30;

  const block = (
    left: string,
    values: number[][],
    label: string,
    lit: (rowIndex: number, columnIndex: number) => boolean,
  ) => {
    const leftPx = Number(left);
    const rows = values.length;
    const top = TOP + ((tallest - rows) * CELL.height) / 2;
    return (
      <g>
        <text
          x={leftPx + (values[0].length * CELL.width) / 2}
          y={TOP - 12}
          textAnchor="middle"
          className="fill-slate-500 text-[11px] font-medium dark:fill-slate-400"
        >
          {label}
        </text>
        <rect
          x={leftPx - 4}
          y={top - 4}
          width={values[0].length * CELL.width + 8}
          height={rows * CELL.height + 8}
          rx={6}
          className="fill-none stroke-slate-300 dark:stroke-slate-700"
          strokeWidth={1.5}
        />
        {values.map((cells, rowIndex) =>
          cells.map((value, columnIndex) => (
            <g key={`${rowIndex}-${columnIndex}`}>
              <rect
                x={leftPx + columnIndex * CELL.width}
                y={top + rowIndex * CELL.height}
                width={CELL.width}
                height={CELL.height}
                className={
                  lit(rowIndex, columnIndex)
                    ? "fill-indigo-100 dark:fill-indigo-900/50"
                    : "fill-transparent"
                }
              />
              <text
                x={leftPx + columnIndex * CELL.width + CELL.width / 2}
                y={top + rowIndex * CELL.height + CELL.height / 2 + 4}
                textAnchor="middle"
                className={`font-mono text-[12px] ${
                  lit(rowIndex, columnIndex)
                    ? "fill-indigo-800 font-semibold dark:fill-indigo-200"
                    : "fill-slate-700 dark:fill-slate-300"
                }`}
              >
                {show(value)}
              </text>
            </g>
          )),
        )}
      </g>
    );
  };

  const operator = (x: number, text: string) => (
    <text
      x={x}
      y={TOP + (tallest * CELL.height) / 2 + 5}
      textAnchor="middle"
      className="fill-slate-500 text-base dark:fill-slate-400"
    >
      {text}
    </text>
  );

  const terms = layer.neuron_route.products[row]
    .map((product, index) => `${show(layer.weight_matrix[row][index])}·${show(layer.inputs[index])}`)
    .join(" + ")
    .replace(/\+ −/g, "− ");
  const products = layer.neuron_route.products[row]
    .map(show)
    .join(" + ")
    .replace(/\+ −/g, "− ");

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 pb-3">
        <button
          onClick={() => {
            setWhich("hidden");
            setSelected(0);
          }}
          className={which === "hidden" ? ACTIVE_BUTTON_CLASS : BUTTON_CLASS}
        >
          Hidden layer, 3 by 2
        </button>
        <button
          onClick={() => {
            setWhich("output");
            setSelected(0);
          }}
          className={which === "output" ? ACTIVE_BUTTON_CLASS : BUTTON_CLASS}
        >
          Output layer, 1 by 3
        </button>
        <span className="text-sm text-slate-600 dark:text-slate-300">
          neuron
        </span>
        {neuronNames.map((name, index) => (
          <button
            key={name}
            onClick={() => setSelected(index)}
            className={index === row ? ACTIVE_BUTTON_CLASS : BUTTON_CLASS}
          >
            {name}
          </button>
        ))}
      </div>

      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full max-w-xl select-none rounded-lg bg-slate-50 dark:bg-slate-950"
      >
        {block(String(wLeft), layer.weight_matrix, "W, one row per neuron", (r) => r === row)}
        {block(
          String(xLeft),
          layer.inputs.map((value) => [value]),
          "x, the row read",
          () => true,
        )}
        {operator(bLeft - GAP / 2 - 8, "+")}
        {block(
          String(bLeft),
          layer.bias_vector.map((value) => [value]),
          "b",
          (r) => r === row,
        )}
        {operator(zLeft - GAP / 2 - 8, "=")}
        {block(
          String(zLeft),
          layer.scores.map((value) => [value]),
          "z, the scores",
          (r) => r === row,
        )}
      </svg>

      <p className="mt-2 font-mono text-sm text-slate-700 dark:text-slate-300">
        {`z for ${neuronNames[row]} = ${terms} + ${show(layer.bias_vector[row])} = ${products} + ${show(layer.bias_vector[row])} = ${show(layer.scores[row])}`}
      </p>

      <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat
          label="Shape of W"
          value={`(${nNeurons}, ${nInputs})`}
        />
        <Stat label="Column names read" value={inputNames.join(", ")} />
        <Stat
          label="Outputs after the bend"
          value={`(${layer.outputs.map(show).join(", ")})`}
        />
        <Stat
          label="Parameters, W plus b"
          value={`${nNeurons * nInputs} + ${nNeurons} = ${layer.n_parameters}`}
        />
      </div>
    </div>
  );
}
