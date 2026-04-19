"use client";

// The 2-3-1 network with the blame written on it, and a button to act on it.
//
// The diagram is the dense-layers page's network read in both directions.
// Going up, every hidden and output node prints the score it formed and the
// output its bend handed on. Coming back down, every node prints the slope
// that arrived at it from above, the slope of its own bend at its score, and
// their product, the delta, and every edge carries its weight beside the
// slope of the loss with respect to that weight. The reader edits the row,
// the target and every parameter, picks the hidden bend, and sets how far one
// step goes. Pressing the step button replaces the parameters with the
// stepped ones the API returned, so a second press walks on from where the
// first landed, and every press is one call of the library's step. Clicking
// an edge, or choosing it from the list, points the finite-difference check
// at that weight, and the readout prints the chain rule's slope beside the
// nudge-and-remeasure figure. Every number here is the library's through the
// API. The browser lays the network out and nothing more.

import { useEffect, useState } from "react";
import {
  ApiError,
  BackpropagationStep,
  CheckedWeight,
  HIDDEN_ACTIVATION_LABELS,
  HIDDEN_ACTIVATIONS,
  HiddenActivation,
  NeuronParameters,
  StepRequest,
  stepBackpropagation,
} from "@/lib/concepts/backpropagation";

const VIEW = { width: 640, height: 392 };
const COLUMN_X = [90, 320, 550];
const NODE_RADIUS = 28;
const CAPTION_Y = 22;
const INPUT_YS = [150, 270];
const HIDDEN_YS = [100, 210, 320];
const OUTPUT_Y = 210;

const INPUT_WIDTH = 2;
const HIDDEN_WIDTH = 3;

const HIDDEN_LAYER = 0;
const OUTPUT_LAYER = 1;

// The slider's range. The API allows up to one; past a half the worked
// example already overshoots badly enough to make the point.
const MIN_LEARNING_RATE = 0.01;
const MAX_LEARNING_RATE = 0.5;
const LEARNING_RATE_STEP = 0.01;

// The page's worked example, whole numbers throughout, so that every slope
// on the diagram can be checked with pencil arithmetic. The second hidden
// neuron scores minus one, which the rectifier turns to zero, and every
// slope that reaches it comes out exactly zero.
const WORKED_INPUTS = [1, 2];
const WORKED_TARGET = 1;
const WORKED_HIDDEN: NeuronParameters[] = [
  { weights: [1, 1], bias: 0 },
  { weights: [1, -1], bias: 0 },
  { weights: [-1, 1], bias: 0 },
];
const WORKED_OUTPUT: NeuronParameters = { weights: [1, -1, 2], bias: 0 };
const WORKED_LEARNING_RATE = 0.05;
const WORKED_CHECK: CheckedWeight = {
  layer_index: OUTPUT_LAYER,
  neuron_index: 0,
  input_index: 0,
};

const INPUT_NAMES = ["x₁", "x₂"];
const HIDDEN_NAMES = ["h₁", "h₂", "h₃"];
const OUTPUT_NAME = "y";

const BUTTON_CLASS =
  "rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-white dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 dark:disabled:hover:bg-slate-800";

const PRIMARY_BUTTON_CLASS =
  "rounded-md border border-indigo-600 bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-indigo-700 disabled:opacity-40 disabled:hover:bg-indigo-600 dark:border-indigo-500 dark:bg-indigo-500 dark:hover:bg-indigo-400 dark:disabled:hover:bg-indigo-500";

const SELECT_CLASS =
  "rounded border border-slate-300 bg-white px-2 py-1 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200";

const BOX_CLASS =
  "w-16 rounded border border-slate-300 bg-white px-1.5 py-0.5 text-right font-mono text-xs text-slate-800 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100";

// Text with a halo the colour of the panel behind it, so a label sitting on
// top of an edge stays legible.
const HALO_CLASS =
  "stroke-slate-50 font-mono text-[10px] [paint-order:stroke] dark:stroke-slate-950";

// Four decimals at most, whole numbers shown whole, and a proper minus sign.
function show(value: number | undefined): string {
  if (value === undefined) return "…";
  const rounded = Math.round(value * 10000) / 10000;
  const text = Number.isInteger(rounded)
    ? String(rounded)
    : rounded.toFixed(4).replace(/0+$/, "");
  return text.replace("-", "−");
}

function showFixed(value: number | undefined, places: number): string {
  return value === undefined ? "…" : value.toFixed(places).replace("-", "−");
}

// What a box shows for a number it was handed. Six decimals at most and an
// ordinary hyphen, so the text parses back into the number it came from.
function boxText(value: number): string {
  const rounded = Math.round(value * 1000000) / 1000000;
  return Number.isInteger(rounded)
    ? String(rounded)
    : rounded.toFixed(6).replace(/0+$/, "");
}

function parseBox(text: string): number | null {
  const trimmed = text.trim().replace("−", "-");
  if (trimmed === "") return null;
  const value = Number(trimmed);
  return Number.isFinite(value) ? value : null;
}

function randomWhole(low: number, high: number): number {
  return Math.floor(low + Math.random() * (high - low + 1));
}

function sameWeight(first: CheckedWeight, second: CheckedWeight): boolean {
  return (
    first.layer_index === second.layer_index &&
    first.neuron_index === second.neuron_index &&
    first.input_index === second.input_index
  );
}

function weightKey(check: CheckedWeight): string {
  return `${check.layer_index}-${check.neuron_index}-${check.input_index}`;
}

function weightName(check: CheckedWeight): string {
  if (check.layer_index === OUTPUT_LAYER) {
    return `${OUTPUT_NAME} from ${HIDDEN_NAMES[check.input_index]}`;
  }
  return `${HIDDEN_NAMES[check.neuron_index]} from ${INPUT_NAMES[check.input_index]}`;
}

// Every weight in the network, in the order the tables beneath list them.
const EVERY_WEIGHT: CheckedWeight[] = [
  ...Array.from({ length: HIDDEN_WIDTH }, (_, neuron) =>
    Array.from({ length: INPUT_WIDTH }, (_, input) => ({
      layer_index: HIDDEN_LAYER,
      neuron_index: neuron,
      input_index: input,
    })),
  ).flat(),
  ...Array.from({ length: HIDDEN_WIDTH }, (_, input) => ({
    layer_index: OUTPUT_LAYER,
    neuron_index: 0,
    input_index: input,
  })),
];

function along(
  from: { x: number; y: number },
  to: { x: number; y: number },
  share: number,
) {
  return {
    x: from.x + (to.x - from.x) * share,
    y: from.y + (to.y - from.y) * share,
  };
}

interface Edge {
  check: CheckedWeight;
  from: { x: number; y: number };
  to: { x: number; y: number };
  labelShare: number;
  weight: number;
  gradient: number | undefined;
}

// The answer is kept beside the request that produced it, so the step button
// can tell a fresh answer from one that belongs to parameters since edited.
interface Answered {
  request: string;
  step: BackpropagationStep;
}

export function BackpropagationPlayground() {
  const [inputs, setInputs] = useState<number[]>(WORKED_INPUTS);
  const [target, setTarget] = useState<number>(WORKED_TARGET);
  const [activation, setActivation] =
    useState<HiddenActivation>("rectified_linear");
  const [hiddenNeurons, setHiddenNeurons] =
    useState<NeuronParameters[]>(WORKED_HIDDEN);
  const [outputNeuron, setOutputNeuron] =
    useState<NeuronParameters>(WORKED_OUTPUT);
  const [learningRate, setLearningRate] = useState(WORKED_LEARNING_RATE);
  const [check, setCheck] = useState<CheckedWeight>(WORKED_CHECK);
  const [answered, setAnswered] = useState<Answered | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [stepsTaken, setStepsTaken] = useState(0);
  const [lossTrail, setLossTrail] = useState<number[]>([]);
  // Bumped whenever the parameters are set by the widget rather than typed,
  // so every box remounts and shows the number it was handed.
  const [generation, setGeneration] = useState(0);

  const request: StepRequest = {
    inputs,
    target,
    hidden_activation: activation,
    hidden_neurons: hiddenNeurons,
    output_neuron: outputNeuron,
    learning_rate: learningRate,
    checked_weight: check,
  };
  const requestText = JSON.stringify(request);

  useEffect(() => {
    const timer = setTimeout(async () => {
      try {
        const step = await stepBackpropagation(JSON.parse(requestText));
        setAnswered({ request: requestText, step });
        setMessage(null);
      } catch (error) {
        if (error instanceof ApiError) setMessage(error.message);
        else setMessage("Something went wrong.");
      }
    }, 150);
    return () => clearTimeout(timer);
  }, [requestText]);

  const answer = answered?.step;
  const fresh = answered !== null && answered.request === requestText;

  // A hand edit is a fresh starting point, so the walk so far is forgotten.
  const startAfresh = () => {
    setStepsTaken(0);
    setLossTrail([]);
  };

  const resetWorkedExample = () => {
    setInputs(WORKED_INPUTS);
    setTarget(WORKED_TARGET);
    setActivation("rectified_linear");
    setHiddenNeurons(WORKED_HIDDEN);
    setOutputNeuron(WORKED_OUTPUT);
    setLearningRate(WORKED_LEARNING_RATE);
    setCheck(WORKED_CHECK);
    setGeneration((current) => current + 1);
    startAfresh();
  };

  const randomise = () => {
    setInputs(Array.from({ length: INPUT_WIDTH }, () => randomWhole(-3, 3)));
    setTarget(randomWhole(-3, 3));
    setHiddenNeurons(
      Array.from({ length: HIDDEN_WIDTH }, () => ({
        weights: Array.from({ length: INPUT_WIDTH }, () => randomWhole(-3, 3)),
        bias: randomWhole(-2, 2),
      })),
    );
    setOutputNeuron({
      weights: Array.from({ length: HIDDEN_WIDTH }, () => randomWhole(-3, 3)),
      bias: randomWhole(-2, 2),
    });
    setGeneration((current) => current + 1);
    startAfresh();
  };

  const takeOneStep = () => {
    if (!answer || !fresh) return;
    const [hidden, output] = answer.layers;
    setLossTrail((trail) => [...trail, answer.loss_before]);
    setStepsTaken((count) => count + 1);
    setHiddenNeurons(
      hidden.weights_after.map((weights, index) => ({
        weights,
        bias: hidden.biases_after[index],
      })),
    );
    setOutputNeuron({
      weights: output.weights_after[0],
      bias: output.biases_after[0],
    });
    setGeneration((current) => current + 1);
  };

  const editInput = (index: number, value: number) => {
    setInputs((current) =>
      current.map((entry, position) => (position === index ? value : entry)),
    );
    startAfresh();
  };

  const editTarget = (value: number) => {
    setTarget(value);
    startAfresh();
  };

  const editHiddenWeight = (neuron: number, input: number, value: number) => {
    setHiddenNeurons((current) =>
      current.map((entry, position) =>
        position === neuron
          ? {
              ...entry,
              weights: entry.weights.map((weight, slot) =>
                slot === input ? value : weight,
              ),
            }
          : entry,
      ),
    );
    startAfresh();
  };

  const editHiddenBias = (neuron: number, value: number) => {
    setHiddenNeurons((current) =>
      current.map((entry, position) =>
        position === neuron ? { ...entry, bias: value } : entry,
      ),
    );
    startAfresh();
  };

  const editOutputWeight = (input: number, value: number) => {
    setOutputNeuron((current) => ({
      ...current,
      weights: current.weights.map((weight, slot) =>
        slot === input ? value : weight,
      ),
    }));
    startAfresh();
  };

  const editOutputBias = (value: number) => {
    setOutputNeuron((current) => ({ ...current, bias: value }));
    startAfresh();
  };

  const hidden = answer?.layers[HIDDEN_LAYER];
  const output = answer?.layers[OUTPUT_LAYER];
  const finite = answer?.finite_difference;

  const edges: Edge[] = [];
  hiddenNeurons.forEach((neuron, neuronIndex) => {
    neuron.weights.forEach((weight, inputIndex) => {
      edges.push({
        check: {
          layer_index: HIDDEN_LAYER,
          neuron_index: neuronIndex,
          input_index: inputIndex,
        },
        from: { x: COLUMN_X[0] + NODE_RADIUS, y: INPUT_YS[inputIndex] },
        to: { x: COLUMN_X[1] - NODE_RADIUS, y: HIDDEN_YS[neuronIndex] },
        // Labels for edges from the first input sit near it and labels for
        // edges from the second sit near the hidden layer, so the six
        // crossing edges do not pile their labels onto one spot.
        labelShare: inputIndex === 0 ? 0.25 : 0.75,
        weight,
        gradient: hidden?.weight_gradient[neuronIndex][inputIndex],
      });
    });
  });
  outputNeuron.weights.forEach((weight, inputIndex) => {
    edges.push({
      check: {
        layer_index: OUTPUT_LAYER,
        neuron_index: 0,
        input_index: inputIndex,
      },
      from: { x: COLUMN_X[1] + NODE_RADIUS, y: HIDDEN_YS[inputIndex] },
      to: { x: COLUMN_X[2] - NODE_RADIUS, y: OUTPUT_Y },
      labelShare: 0.5,
      weight,
      gradient: output?.weight_gradient[0][inputIndex],
    });
  });

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 pb-3">
        <button onClick={resetWorkedExample} className={BUTTON_CLASS}>
          The worked example
        </button>
        <button onClick={randomise} className={BUTTON_CLASS}>
          Random whole numbers
        </button>
        <button
          onClick={takeOneStep}
          disabled={!answer || !fresh}
          className={PRIMARY_BUTTON_CLASS}
        >
          Take one step
        </button>
        <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
          hidden bend
          <select
            value={activation}
            onChange={(event) => {
              setActivation(event.target.value as HiddenActivation);
              startAfresh();
            }}
            className={SELECT_CLASS}
          >
            {HIDDEN_ACTIVATIONS.map((name) => (
              <option key={name} value={name}>
                {HIDDEN_ACTIVATION_LABELS[name]}
              </option>
            ))}
          </select>
        </label>
        <label className="ml-auto flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
          learning rate
          <input
            type="range"
            min={MIN_LEARNING_RATE}
            max={MAX_LEARNING_RATE}
            step={LEARNING_RATE_STEP}
            value={learningRate}
            onChange={(event) => setLearningRate(Number(event.target.value))}
            className="w-32 accent-indigo-600"
          />
          <span className="w-10 font-mono text-sm">
            {learningRate.toFixed(2)}
          </span>
        </label>
      </div>

      <svg
        viewBox={`0 0 ${VIEW.width} ${VIEW.height}`}
        className="w-full select-none rounded-lg bg-slate-50 dark:bg-slate-950"
      >
        {[
          { x: COLUMN_X[0], text: "the row" },
          {
            x: COLUMN_X[1],
            text: `hidden layer, ${HIDDEN_ACTIVATION_LABELS[activation]}`,
          },
          { x: COLUMN_X[2], text: "output layer, identity" },
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
          const selected = sameWeight(edge.check, check);
          const dead = edge.gradient === 0;
          const label = along(edge.from, edge.to, edge.labelShare);
          return (
            <g
              key={weightKey(edge.check)}
              className="cursor-pointer"
              onClick={() => setCheck(edge.check)}
            >
              <line
                x1={edge.from.x}
                y1={edge.from.y}
                x2={edge.to.x}
                y2={edge.to.y}
                className={
                  selected
                    ? "stroke-indigo-500"
                    : "stroke-slate-300 dark:stroke-slate-700"
                }
                strokeWidth={selected ? 3 : 1.5}
                opacity={dead && !selected ? 0.45 : 1}
              />
              <line
                x1={edge.from.x}
                y1={edge.from.y}
                x2={edge.to.x}
                y2={edge.to.y}
                stroke="transparent"
                strokeWidth={16}
              />
              <text
                x={label.x}
                y={label.y + 4}
                textAnchor="middle"
                strokeWidth={4}
                strokeLinejoin="round"
                className={HALO_CLASS}
              >
                <tspan
                  className={
                    selected
                      ? "fill-indigo-600 font-semibold dark:fill-indigo-400"
                      : "fill-slate-600 dark:fill-slate-300"
                  }
                >
                  w {show(edge.weight)}
                </tspan>
                <tspan dx={6} className="fill-amber-600 dark:fill-amber-400">
                  ∂ {show(edge.gradient)}
                </tspan>
              </text>
            </g>
          );
        })}

        {INPUT_YS.map((y, index) => (
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
              {show(inputs[index])}
            </text>
            <text
              x={COLUMN_X[0]}
              y={y + NODE_RADIUS + 14}
              textAnchor="middle"
              className="fill-amber-600 font-mono text-[10px] dark:fill-amber-400"
            >
              ∂L/∂{INPUT_NAMES[index]} {show(hidden?.passed_down[index])}
            </text>
          </g>
        ))}

        {HIDDEN_YS.map((y, index) => (
          <NeuronNode
            key={`h${index}`}
            x={COLUMN_X[1]}
            y={y}
            name={HIDDEN_NAMES[index]}
            score={hidden?.scores[index]}
            output={hidden?.outputs[index]}
            arriving={hidden?.arriving[index]}
            slope={hidden?.slopes[index]}
            delta={hidden?.bias_gradient[index]}
          />
        ))}

        <NeuronNode
          x={COLUMN_X[2]}
          y={OUTPUT_Y}
          name={OUTPUT_NAME}
          score={output?.scores[0]}
          output={output?.outputs[0]}
          arriving={output?.arriving[0]}
          slope={output?.slopes[0]}
          delta={output?.bias_gradient[0]}
        />

        <text
          x={COLUMN_X[2]}
          y={OUTPUT_Y + NODE_RADIUS + 34}
          textAnchor="middle"
          className="fill-slate-500 font-mono text-[10px] dark:fill-slate-400"
        >
          target {show(target)}
        </text>
        <text
          x={COLUMN_X[2]}
          y={OUTPUT_Y + NODE_RADIUS + 48}
          textAnchor="middle"
          className="fill-slate-700 font-mono text-[11px] font-semibold dark:fill-slate-200"
        >
          loss {showFixed(answer?.loss_before, 4)}
        </text>
      </svg>

      <p className="mt-2 text-center text-xs text-slate-500 dark:text-slate-500">
        Inside each neuron, z is its score and a its output. Above it, the
        slope that arrived and the bend&rsquo;s slope g′ at the score; beneath
        it, their product δ. On each edge, w is the weight and ∂ the slope of
        the loss with respect to it. Click an edge to check that slope by
        nudging.
      </p>

      <div className="mt-3 grid gap-3 sm:grid-cols-[auto_1fr_1fr]">
        <div className="rounded-lg bg-slate-100 px-3 py-2 dark:bg-slate-800">
          <div className="pb-1 text-xs text-slate-500 dark:text-slate-400">
            The row and its target
          </div>
          <div className="flex flex-col gap-1">
            {inputs.map((value, index) => (
              <NumberBox
                key={`x${index}-${generation}`}
                label={INPUT_NAMES[index]}
                value={value}
                onCommit={(next) => editInput(index, next)}
              />
            ))}
            <NumberBox
              key={`target-${generation}`}
              label="target"
              value={target}
              onCommit={editTarget}
            />
          </div>
        </div>

        <ParameterTable
          title="Hidden layer, W₁ and b₁"
          neuronNames={HIDDEN_NAMES}
          inputNames={INPUT_NAMES}
          neurons={hiddenNeurons}
          generation={generation}
          onWeight={editHiddenWeight}
          onBias={editHiddenBias}
        />

        <ParameterTable
          title="Output layer, W₂ and b₂"
          neuronNames={[OUTPUT_NAME]}
          inputNames={HIDDEN_NAMES}
          neurons={[outputNeuron]}
          generation={generation}
          onWeight={(_neuron, input, value) => editOutputWeight(input, value)}
          onBias={(_neuron, value) => editOutputBias(value)}
        />
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Loss now" value={showFixed(answer?.loss_before, 4)} />
        <Stat
          label="Loss after one step"
          value={showFixed(answer?.loss_after, 4)}
        />
        <Stat label="Prediction" value={show(answer?.prediction)} />
        <Stat
          label="Largest slope anywhere"
          value={show(answer?.largest_movement)}
        />
      </div>

      <div className="mt-3 rounded-lg bg-slate-100 px-3 py-2 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-300">
        <label className="flex flex-wrap items-center gap-2">
          <span>Check the slope of the weight into</span>
          <select
            value={weightKey(check)}
            onChange={(event) => {
              const chosen = EVERY_WEIGHT.find(
                (candidate) => weightKey(candidate) === event.target.value,
              );
              if (chosen) setCheck(chosen);
            }}
            className={SELECT_CLASS}
          >
            {EVERY_WEIGHT.map((candidate) => (
              <option key={weightKey(candidate)} value={weightKey(candidate)}>
                {weightName(candidate)}
              </option>
            ))}
          </select>
        </label>
        <p className="mt-2">
          The chain rule says its slope is{" "}
          <span className="font-mono">{showFixed(finite?.analytic, 6)}</span>.
          Nudging the weight up by a millionth and down by a millionth,
          remeasuring the loss each time and dividing the difference by the
          width of the nudge says{" "}
          <span className="font-mono">{showFixed(finite?.numerical, 6)}</span>,
          a disagreement of{" "}
          <span className="font-mono">
            {finite ? finite.disagreement.toExponential(1) : "…"}
          </span>
          .
        </p>
        {lossTrail.length > 0 && answer && (
          <p className="mt-2">
            Steps taken {stepsTaken}. The loss so far, one entry per press,{" "}
            <span className="font-mono">
              {[...lossTrail, answer.loss_before]
                .map((loss) => loss.toFixed(4))
                .join(" → ")}
            </span>
            .
          </p>
        )}
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
  arriving,
  slope,
  delta,
}: {
  x: number;
  y: number;
  name: string;
  score: number | undefined;
  output: number | undefined;
  arriving: number | undefined;
  slope: number | undefined;
  delta: number | undefined;
}) {
  const dark = output === 0;
  return (
    <g>
      <text
        x={x}
        y={y - NODE_RADIUS - 8}
        textAnchor="middle"
        className="fill-slate-500 font-mono text-[10px] dark:fill-slate-400"
      >
        arrives {show(arriving)} · g′ {show(slope)}
      </text>
      <circle
        cx={x}
        cy={y}
        r={NODE_RADIUS}
        className={
          dark
            ? "fill-slate-100 stroke-slate-400 dark:fill-slate-800 dark:stroke-slate-600"
            : "fill-white stroke-indigo-500 dark:fill-slate-900 dark:stroke-indigo-400"
        }
        strokeWidth={1.5}
      />
      <text
        x={x}
        y={y - 12}
        textAnchor="middle"
        className="fill-slate-500 text-[11px] dark:fill-slate-400"
      >
        {name}
      </text>
      <text
        x={x}
        y={y + 1}
        textAnchor="middle"
        className="fill-slate-600 font-mono text-[10px] dark:fill-slate-300"
      >
        z {show(score)}
      </text>
      <text
        x={x}
        y={y + 14}
        textAnchor="middle"
        className="fill-slate-900 font-mono text-[11px] font-semibold dark:fill-slate-100"
      >
        a {show(output)}
      </text>
      <text
        x={x}
        y={y + NODE_RADIUS + 14}
        textAnchor="middle"
        className="fill-amber-600 font-mono text-[11px] font-semibold dark:fill-amber-400"
      >
        δ {show(delta)}
      </text>
    </g>
  );
}

function ParameterTable({
  title,
  neuronNames,
  inputNames,
  neurons,
  generation,
  onWeight,
  onBias,
}: {
  title: string;
  neuronNames: string[];
  inputNames: string[];
  neurons: NeuronParameters[];
  generation: number;
  onWeight: (neuron: number, input: number, value: number) => void;
  onBias: (neuron: number, value: number) => void;
}) {
  return (
    <div className="rounded-lg bg-slate-100 px-3 py-2 dark:bg-slate-800">
      <div className="pb-1 text-xs text-slate-500 dark:text-slate-400">
        {title}
      </div>
      <div className="overflow-x-auto">
        <table className="text-xs text-slate-600 dark:text-slate-300">
          <thead>
            <tr>
              <th className="pr-2 text-left font-normal" />
              {inputNames.map((name) => (
                <th key={name} className="px-1 text-center font-mono font-normal">
                  {name}
                </th>
              ))}
              <th className="px-1 text-center font-normal">bias</th>
            </tr>
          </thead>
          <tbody>
            {neurons.map((neuron, neuronIndex) => (
              <tr key={neuronIndex}>
                <td className="pr-2 font-mono">{neuronNames[neuronIndex]}</td>
                {neuron.weights.map((weight, inputIndex) => (
                  <td key={inputIndex} className="px-1 py-0.5">
                    <NumberBox
                      key={`${neuronIndex}-${inputIndex}-${generation}`}
                      value={weight}
                      onCommit={(next) => onWeight(neuronIndex, inputIndex, next)}
                      ariaLabel={`weight from ${inputNames[inputIndex]} to ${neuronNames[neuronIndex]}`}
                    />
                  </td>
                ))}
                <td className="px-1 py-0.5">
                  <NumberBox
                    key={`${neuronIndex}-bias-${generation}`}
                    value={neuron.bias}
                    onCommit={(next) => onBias(neuronIndex, next)}
                    ariaLabel={`bias of ${neuronNames[neuronIndex]}`}
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

// A box holds text rather than a number so a reader can type a minus sign
// and then the digit after it without the box snapping back between the two
// keystrokes. It commits upward whenever the text parses, and it is remounted
// by its key whenever the widget, rather than the reader, sets the number.
function NumberBox({
  label,
  value,
  onCommit,
  ariaLabel,
}: {
  label?: string;
  value: number;
  onCommit: (value: number) => void;
  ariaLabel?: string;
}) {
  const [text, setText] = useState(() => boxText(value));
  const box = (
    <input
      type="text"
      inputMode="decimal"
      value={text}
      onChange={(event) => {
        const next = event.target.value;
        setText(next);
        const parsed = parseBox(next);
        if (parsed !== null) onCommit(parsed);
      }}
      className={BOX_CLASS}
      aria-label={ariaLabel ?? label}
    />
  );
  if (label === undefined) return box;
  return (
    <label className="flex items-center gap-2 whitespace-nowrap">
      <span className="w-10 font-mono text-slate-500 dark:text-slate-400">
        {label}
      </span>
      {box}
    </label>
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
