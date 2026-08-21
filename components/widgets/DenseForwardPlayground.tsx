"use client";

// Two numbers in, three neurons in the middle, one neuron out, and the pass
// printed on every node.
//
// The left column is the row, the middle column the hidden layer and the
// right column the output neuron. Every edge carries the weight it multiplies
// by, and every neuron prints z, the score it formed, and a, what its bend
// handed on, which is all the next column ever reads. The two tables beneath
// are the weight matrices, one row per neuron with its bias at the end, and
// editing any cell runs the pass again. Every score, output and shape here is
// the library's through the API, and so is the collapsed map in the last
// readout. The browser chooses the numbers, lays the network out and thickens
// an edge by the size of its weight, and that is the whole of what it does.

import { useEffect, useState } from "react";
import {
  ACTIVATION_LABELS,
  ACTIVATION_NAMES,
  ActivationName,
  ApiError,
  ForwardPass,
  ForwardRequest,
  LayerWeights,
  forwardPass,
} from "@/lib/concepts/dense-layers";

const VIEW = { width: 640, height: 352 };
const COLUMN_X = [88, 320, 552];
const CENTRE_Y = 190;
const ROW_GAP = 92;
const NODE_RADIUS = 28;
const CAPTION_Y = 24;
const DEBOUNCE_MS = 150;

const INPUT_WIDTH = 2;
const HIDDEN_WIDTH = 3;
const OUTPUT_WIDTH = 1;

const INPUT_NAMES = ["x₁", "x₂"];
const HIDDEN_NAMES = ["h₁", "h₂", "h₃"];
const OUTPUT_NAMES = ["y"];

type LayerKey = "hidden" | "output";

// The boxes hold text rather than numbers so a reader can type a minus sign
// and then the digit after it without the box snapping back to zero between
// the two keystrokes. A request is built only once every box parses.
interface DraftLayer {
  weights: string[][];
  biases: string[];
  activation: ActivationName;
}

interface Draft {
  inputs: string[];
  hidden: DraftLayer;
  output: DraftLayer;
}

// The row (1, 2) through whole-number weights, the example the page and the
// backpropagation page work by hand. The middle hidden neuron scores minus
// one, which the rectifier turns to zero, so the output weight of minus one
// on it multiplies nothing.
const WORKED_EXAMPLE: Draft = {
  inputs: ["1", "2"],
  hidden: {
    weights: [
      ["1", "1"],
      ["1", "-1"],
      ["-1", "1"],
    ],
    biases: ["0", "0", "0"],
    activation: "rectified_linear",
  },
  output: {
    weights: [["1", "-1", "2"]],
    biases: ["0"],
    activation: "identity",
  },
};

const BUTTON_CLASS =
  "rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700";

const BOX_CLASS =
  "w-14 rounded border border-slate-300 bg-white px-1.5 py-0.5 text-right font-mono text-sm text-slate-800 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100";

const SELECT_CLASS =
  "rounded border border-slate-300 bg-white px-2 py-1 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200";

function wholeNumberBetween(low: number, high: number): string {
  return String(Math.floor(low + Math.random() * (high - low + 1)));
}

function randomDraft(current: Draft): Draft {
  return {
    inputs: Array.from({ length: INPUT_WIDTH }, () =>
      wholeNumberBetween(-3, 3),
    ),
    hidden: {
      weights: Array.from({ length: HIDDEN_WIDTH }, () =>
        Array.from({ length: INPUT_WIDTH }, () => wholeNumberBetween(-3, 3)),
      ),
      biases: Array.from({ length: HIDDEN_WIDTH }, () =>
        wholeNumberBetween(-2, 2),
      ),
      activation: current.hidden.activation,
    },
    output: {
      weights: Array.from({ length: OUTPUT_WIDTH }, () =>
        Array.from({ length: HIDDEN_WIDTH }, () => wholeNumberBetween(-3, 3)),
      ),
      biases: Array.from({ length: OUTPUT_WIDTH }, () =>
        wholeNumberBetween(-2, 2),
      ),
      activation: current.output.activation,
    },
  };
}

function readNumber(text: string): number | null {
  if (text.trim() === "") return null;
  const value = Number(text);
  return Number.isFinite(value) ? value : null;
}

function readLayer(layer: DraftLayer): LayerWeights | null {
  const weights: number[][] = [];
  for (const row of layer.weights) {
    const parsed: number[] = [];
    for (const text of row) {
      const value = readNumber(text);
      if (value === null) return null;
      parsed.push(value);
    }
    weights.push(parsed);
  }
  const biases: number[] = [];
  for (const text of layer.biases) {
    const value = readNumber(text);
    if (value === null) return null;
    biases.push(value);
  }
  return { weights, biases, activation: layer.activation };
}

function readDraft(draft: Draft): ForwardRequest | null {
  const inputs: number[] = [];
  for (const text of draft.inputs) {
    const value = readNumber(text);
    if (value === null) return null;
    inputs.push(value);
  }
  const hidden = readLayer(draft.hidden);
  const output = readLayer(draft.output);
  if (hidden === null || output === null) return null;
  return { inputs, hidden, output };
}

// Four decimals at most, whole numbers shown whole, and a proper minus sign.
function formatNumber(value: number): string {
  const rounded = Math.round(value * 10000) / 10000;
  const text = Number.isInteger(rounded)
    ? String(rounded)
    : rounded.toFixed(4).replace(/0+$/, "");
  return text.replace("-", "−");
}

function tupleText(extents: number[]): string {
  return `(${extents.join(", ")}${extents.length === 1 ? "," : ""})`;
}

function rowCentres(count: number): number[] {
  return Array.from(
    { length: count },
    (_, index) => CENTRE_Y + (index - (count - 1) / 2) * ROW_GAP,
  );
}

interface Position {
  x: number;
  y: number;
}

function pointAlong(from: Position, to: Position, share: number): Position {
  return {
    x: from.x + (to.x - from.x) * share,
    y: from.y + (to.y - from.y) * share,
  };
}

interface Edge {
  key: string;
  from: Position;
  to: Position;
  weight: number | null;
  labelShare: number;
  silent: boolean;
}

export function DenseForwardPlayground() {
  const [draft, setDraft] = useState<Draft>(WORKED_EXAMPLE);
  const [answer, setAnswer] = useState<ForwardPass | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const request = readDraft(draft);
    // Both branches wait for the debounce. Complaining about a half-typed box
    // the instant it is emptied would flash a message at every keystroke, and
    // setting state synchronously here would cascade a render besides.
    const timer = setTimeout(async () => {
      if (request === null) {
        setMessage("Every box needs a number before the pass can run.");
        return;
      }
      try {
        setAnswer(await forwardPass(request));
        setMessage(null);
      } catch (error) {
        if (error instanceof ApiError) setMessage(error.message);
        else setMessage("Something went wrong.");
      }
    }, DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [draft]);

  const setInput = (index: number, text: string) =>
    setDraft((current) => ({
      ...current,
      inputs: current.inputs.map((value, position) =>
        position === index ? text : value,
      ),
    }));

  const updateLayer = (
    layer: LayerKey,
    change: (current: DraftLayer) => DraftLayer,
  ) =>
    setDraft((current) =>
      layer === "hidden"
        ? { ...current, hidden: change(current.hidden) }
        : { ...current, output: change(current.output) },
    );

  const setWeight = (
    layer: LayerKey,
    neuron: number,
    input: number,
    text: string,
  ) =>
    updateLayer(layer, (current) => ({
      ...current,
      weights: current.weights.map((row, rowIndex) =>
        rowIndex === neuron
          ? row.map((value, columnIndex) =>
              columnIndex === input ? text : value,
            )
          : row,
      ),
    }));

  const setBias = (layer: LayerKey, neuron: number, text: string) =>
    updateLayer(layer, (current) => ({
      ...current,
      biases: current.biases.map((value, position) =>
        position === neuron ? text : value,
      ),
    }));

  const setActivation = (layer: LayerKey, activation: ActivationName) =>
    updateLayer(layer, (current) => ({ ...current, activation }));

  const inputCentres = rowCentres(INPUT_WIDTH);
  const hiddenCentres = rowCentres(HIDDEN_WIDTH);
  const outputCentres = rowCentres(OUTPUT_WIDTH);

  const hiddenPass = answer?.layers[0];
  const outputPass = answer?.layers[1];

  const edges: Edge[] = [];
  for (let neuron = 0; neuron < HIDDEN_WIDTH; neuron++) {
    for (let input = 0; input < INPUT_WIDTH; input++) {
      edges.push({
        key: `h${neuron}-x${input}`,
        from: { x: COLUMN_X[0] + NODE_RADIUS, y: inputCentres[input] },
        to: { x: COLUMN_X[1] - NODE_RADIUS, y: hiddenCentres[neuron] },
        weight: readNumber(draft.hidden.weights[neuron][input]),
        labelShare: 0.3,
        silent: false,
      });
    }
  }
  for (let neuron = 0; neuron < OUTPUT_WIDTH; neuron++) {
    for (let input = 0; input < HIDDEN_WIDTH; input++) {
      edges.push({
        key: `y${neuron}-h${input}`,
        from: { x: COLUMN_X[1] + NODE_RADIUS, y: hiddenCentres[input] },
        to: { x: COLUMN_X[2] - NODE_RADIUS, y: outputCentres[neuron] },
        weight: readNumber(draft.output.weights[neuron][input]),
        labelShare: 0.42,
        // An edge leaving a neuron whose output is exactly zero multiplies
        // nothing, whatever its weight, and is drawn faint to say so.
        silent: hiddenPass !== undefined && hiddenPass.outputs[input] === 0,
      });
    }
  }

  const hiddenCaption = hiddenPass
    ? `hidden layer, ${hiddenPass.formula}`
    : `hidden layer, ${ACTIVATION_LABELS[draft.hidden.activation]}`;
  const outputCaption = outputPass
    ? `output layer, ${outputPass.formula}`
    : `output layer, ${ACTIVATION_LABELS[draft.output.activation]}`;

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 pb-3">
        <button
          onClick={() => setDraft(WORKED_EXAMPLE)}
          className={BUTTON_CLASS}
        >
          The tall heavy person
        </button>
        <button
          onClick={() => setDraft((current) => randomDraft(current))}
          className={BUTTON_CLASS}
        >
          Random whole numbers
        </button>
      </div>

      <svg
        viewBox={`0 0 ${VIEW.width} ${VIEW.height}`}
        className="w-full select-none rounded-lg bg-slate-50 dark:bg-slate-950"
      >
        {[
          { x: COLUMN_X[0], text: "the row" },
          { x: COLUMN_X[1], text: hiddenCaption },
          { x: COLUMN_X[2], text: outputCaption },
        ].map((caption) => (
          <text
            key={caption.x}
            x={caption.x}
            y={CAPTION_Y}
            textAnchor="middle"
            className="fill-slate-500 text-xs font-medium dark:fill-slate-400"
          >
            {caption.text}
          </text>
        ))}

        {edges.map((edge) => {
          const weight = edge.weight ?? 0;
          const label = pointAlong(edge.from, edge.to, edge.labelShare);
          return (
            <g
              key={edge.key}
              className={
                weight < 0
                  ? "stroke-rose-500 text-rose-600 dark:text-rose-400"
                  : "stroke-indigo-500 text-indigo-700 dark:text-indigo-300"
              }
              opacity={edge.silent || weight === 0 ? 0.3 : 1}
            >
              <line
                x1={edge.from.x}
                y1={edge.from.y}
                x2={edge.to.x}
                y2={edge.to.y}
                strokeWidth={1 + Math.min(Math.abs(weight), 4) * 0.7}
              />
              <text
                x={label.x}
                y={label.y + 4}
                textAnchor="middle"
                paintOrder="stroke"
                strokeWidth={4}
                strokeLinejoin="round"
                className="fill-current stroke-slate-50 font-mono text-[11px] font-semibold dark:stroke-slate-950"
              >
                {edge.weight === null ? "?" : formatNumber(edge.weight)}
              </text>
            </g>
          );
        })}

        {inputCentres.map((y, index) => {
          const value = readNumber(draft.inputs[index]);
          return (
            <g key={`x${index}`}>
              <circle
                cx={COLUMN_X[0]}
                cy={y}
                r={NODE_RADIUS}
                className="fill-white stroke-slate-400 dark:fill-slate-900 dark:stroke-slate-600"
                strokeWidth={1.5}
              />
              <text
                x={COLUMN_X[0]}
                y={y - 6}
                textAnchor="middle"
                className="fill-slate-500 text-[11px] dark:fill-slate-400"
              >
                {INPUT_NAMES[index]}
              </text>
              <text
                x={COLUMN_X[0]}
                y={y + 12}
                textAnchor="middle"
                className="fill-slate-900 font-mono text-sm font-semibold dark:fill-slate-100"
              >
                {value === null ? "?" : formatNumber(value)}
              </text>
            </g>
          );
        })}

        {hiddenCentres.map((y, index) => (
          <NeuronNode
            key={`h${index}`}
            x={COLUMN_X[1]}
            y={y}
            name={HIDDEN_NAMES[index]}
            score={hiddenPass?.scores[index]}
            output={hiddenPass?.outputs[index]}
            bias={readNumber(draft.hidden.biases[index])}
          />
        ))}

        {outputCentres.map((y, index) => (
          <NeuronNode
            key={`y${index}`}
            x={COLUMN_X[2]}
            y={y}
            name={OUTPUT_NAMES[index]}
            score={outputPass?.scores[index]}
            output={outputPass?.outputs[index]}
            bias={readNumber(draft.output.biases[index])}
          />
        ))}
      </svg>

      <p className="mt-2 text-center text-xs text-slate-500 dark:text-slate-500">
        Each neuron prints z, its weighted sum plus bias, and a, that score
        after its bend. The next column reads the a values and nothing else.
        {answer ? ` The pass ran for ${answer.purpose}.` : ""}
      </p>

      <div className="mt-3 grid gap-3 sm:grid-cols-[auto_1fr_1fr]">
        <div className="rounded-lg bg-slate-100 px-3 py-2 dark:bg-slate-800">
          <div className="pb-1 text-xs text-slate-500 dark:text-slate-400">
            The row
          </div>
          <div className="flex flex-col gap-1">
            {draft.inputs.map((text, index) => (
              <label
                key={INPUT_NAMES[index]}
                className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300"
              >
                <span className="w-5 font-mono">{INPUT_NAMES[index]}</span>
                <input
                  type="text"
                  inputMode="decimal"
                  value={text}
                  onChange={(event) => setInput(index, event.target.value)}
                  className={BOX_CLASS}
                />
              </label>
            ))}
          </div>
        </div>

        <WeightTable
          title="Hidden layer, W₁ and b₁"
          neuronNames={HIDDEN_NAMES}
          inputNames={INPUT_NAMES}
          layer={draft.hidden}
          onWeight={(neuron, input, text) =>
            setWeight("hidden", neuron, input, text)
          }
          onBias={(neuron, text) => setBias("hidden", neuron, text)}
          onActivation={(activation) => setActivation("hidden", activation)}
        />

        <WeightTable
          title="Output layer, W₂ and b₂"
          neuronNames={OUTPUT_NAMES}
          inputNames={HIDDEN_NAMES}
          layer={draft.output}
          onWeight={(neuron, input, text) =>
            setWeight("output", neuron, input, text)
          }
          onBias={(neuron, text) => setBias("output", neuron, text)}
          onActivation={(activation) => setActivation("output", activation)}
        />
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-5">
        <Stat
          label="Hidden scores"
          value={
            hiddenPass ? hiddenPass.scores.map(formatNumber).join(", ") : "…"
          }
        />
        <Stat
          label="Output"
          value={answer ? formatNumber(answer.output) : "…"}
        />
        <Stat
          label="Stack reads → answers"
          value={
            answer
              ? `${tupleText(answer.shape.reads)} → ${tupleText(answer.shape.answers)}`
              : "…"
          }
        />
        <Stat
          label="Parameters, by layer"
          value={
            answer
              ? `${answer.layers.map((layer) => layer.n_parameters).join(" + ")} = ${answer.n_parameters}`
              : "…"
          }
        />
        <Stat
          label="Without the bends"
          value={
            answer
              ? `(${answer.without_bends.weights.map(formatNumber).join(", ")})·x + ${formatNumber(answer.without_bends.bias)} = ${formatNumber(answer.without_bends.output)}`
              : "…"
          }
        />
      </div>

      {message && (
        <p className="mt-3 text-sm text-amber-600 dark:text-amber-400">
          {message}
        </p>
      )}
    </div>
  );
}

function NeuronNode({
  x,
  y,
  name,
  score,
  output,
  bias,
}: {
  x: number;
  y: number;
  name: string;
  score: number | undefined;
  output: number | undefined;
  bias: number | null;
}) {
  const silent = output === 0;
  return (
    <g>
      <circle
        cx={x}
        cy={y}
        r={NODE_RADIUS}
        className={
          silent
            ? "fill-slate-100 stroke-slate-400 dark:fill-slate-800 dark:stroke-slate-600"
            : "fill-white stroke-indigo-500 dark:fill-slate-900"
        }
        strokeWidth={1.5}
      />
      <text
        x={x}
        y={y - NODE_RADIUS - 6}
        textAnchor="middle"
        className="fill-slate-500 text-[11px] dark:fill-slate-400"
      >
        {name}
      </text>
      <text
        x={x}
        y={y - 3}
        textAnchor="middle"
        className="fill-slate-600 font-mono text-[11px] dark:fill-slate-300"
      >
        {`z ${score === undefined ? "…" : formatNumber(score)}`}
      </text>
      <text
        x={x}
        y={y + 13}
        textAnchor="middle"
        className="fill-slate-900 font-mono text-[12px] font-semibold dark:fill-slate-100"
      >
        {`a ${output === undefined ? "…" : formatNumber(output)}`}
      </text>
      <text
        x={x}
        y={y + NODE_RADIUS + 14}
        textAnchor="middle"
        className="fill-slate-500 font-mono text-[10px] dark:fill-slate-400"
      >
        {`b ${bias === null ? "?" : formatNumber(bias)}`}
      </text>
    </g>
  );
}

function WeightTable({
  title,
  neuronNames,
  inputNames,
  layer,
  onWeight,
  onBias,
  onActivation,
}: {
  title: string;
  neuronNames: string[];
  inputNames: string[];
  layer: DraftLayer;
  onWeight: (neuron: number, input: number, text: string) => void;
  onBias: (neuron: number, text: string) => void;
  onActivation: (activation: ActivationName) => void;
}) {
  return (
    <div className="rounded-lg bg-slate-100 px-3 py-2 dark:bg-slate-800">
      <div className="flex flex-wrap items-center justify-between gap-2 pb-1">
        <span className="text-xs text-slate-500 dark:text-slate-400">
          {title}
        </span>
        <select
          value={layer.activation}
          onChange={(event) =>
            onActivation(event.target.value as ActivationName)
          }
          className={SELECT_CLASS}
          aria-label={`${title} bend`}
        >
          {ACTIVATION_NAMES.map((name) => (
            <option key={name} value={name}>
              {ACTIVATION_LABELS[name]}
            </option>
          ))}
        </select>
      </div>
      <div className="overflow-x-auto">
        <table className="text-sm text-slate-600 dark:text-slate-300">
          <thead>
            <tr>
              <th className="pr-2 text-left font-normal" />
              {inputNames.map((name) => (
                <th
                  key={name}
                  className="px-1 text-center font-mono font-normal"
                >
                  {name}
                </th>
              ))}
              <th className="px-1 text-center font-normal">bias</th>
            </tr>
          </thead>
          <tbody>
            {layer.weights.map((row, neuron) => (
              <tr key={neuronNames[neuron]}>
                <td className="pr-2 font-mono">{neuronNames[neuron]}</td>
                {row.map((text, input) => (
                  <td key={inputNames[input]} className="px-1 py-0.5">
                    <input
                      type="text"
                      inputMode="decimal"
                      value={text}
                      onChange={(event) =>
                        onWeight(neuron, input, event.target.value)
                      }
                      className={BOX_CLASS}
                      aria-label={`weight from ${inputNames[input]} to ${neuronNames[neuron]}`}
                    />
                  </td>
                ))}
                <td className="px-1 py-0.5">
                  <input
                    type="text"
                    inputMode="decimal"
                    value={layer.biases[neuron]}
                    onChange={(event) => onBias(neuron, event.target.value)}
                    className={BOX_CLASS}
                    aria-label={`bias of ${neuronNames[neuron]}`}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-slate-100 px-3 py-2 dark:bg-slate-800">
      <div className="text-xs text-slate-500 dark:text-slate-400">{label}</div>
      <div className="font-mono text-lg font-semibold text-slate-900 dark:text-slate-100">
        {value}
      </div>
    </div>
  );
}
