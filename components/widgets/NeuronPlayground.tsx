"use client";

// One neuron with two inputs, drawn three ways at once.
//
// The diagram is the model, a person's standardised height and weight
// weighed and summed with a bias, the total bent by whichever activation is
// chosen. The shaded square is that neuron's output at every cell of a
// lattice over the plane its inputs span, with the line where the score is
// zero drawn dashed, and the dot is a probe the reader drags to read the
// score, the output and the bend's slope at any person. The curve beside it
// is the chosen bend across a range of scores, with its slope drawn under it
// and a marker at the probe's score. The sliders set the two weights and
// the bias, which are the whole of what a neuron learns, and one button
// loads the three numbers the logistic model fitted to the crowd, with the
// crowd drawn over the surface it produces. Every score, output, slope,
// lattice cell and fitted number is the library's through the API. The
// browser scales them to pixels and to shades.

import { useCallback, useEffect, useRef, useState } from "react";
import { ApiError } from "@/lib/api";
import {
  ACTIVATION_NAMES,
  ActivationName,
  LogisticTwin,
  NeuronResponse,
  PlanePoint,
  fetchLogisticTwin,
  respondNeuron,
} from "@/lib/concepts/neurons-and-activations";
import {
  ACTIVATION_LABELS,
  ADULT,
  BUTTON_CLASS,
  CHILD,
  CURVE_RANGE,
  LATTICE,
  NEGATIVE_FILL,
  PARAMETER_RANGE,
  POSITIVE_FILL,
  SELECTED_BUTTON_CLASS,
  SHORT_HEAVY,
  TALL_HEAVY,
  WINDOW,
  WORKED_BIAS,
  WORKED_WEIGHTS,
  latticeValue,
  planeX,
  planeY,
  signed,
} from "./neuronFixtures";

const DIAGRAM = { width: 640, height: 200 };
const INPUT_NODES = [
  { x: 80, y: 60 },
  { x: 80, y: 140 },
];
const BIAS_NODE = { x: 330, y: 26 };
const SUM_NODE = { x: 330, y: 104 };
const BEND_BOX = { x: 420, y: 76, width: 110, height: 56 };
const OUTPUT_NODE = { x: 590, y: 104 };

const PANEL = { width: 320, height: 320 };
const PANEL_PAD = { left: 40, right: 12, top: 12, bottom: 34 };
const PANEL_PLOT = {
  left: PANEL_PAD.left,
  top: PANEL_PAD.top,
  width: PANEL.width - PANEL_PAD.left - PANEL_PAD.right,
  height: PANEL.height - PANEL_PAD.top - PANEL_PAD.bottom,
};

function curveX(score: number): number {
  return (
    PANEL_PAD.left +
    ((score - CURVE_RANGE.low) / (CURVE_RANGE.high - CURVE_RANGE.low)) *
      PANEL_PLOT.width
  );
}

function curveY(value: number, low: number, high: number): number {
  return PANEL_PAD.top + ((high - value) / (high - low)) * PANEL_PLOT.height;
}

function roundToTenth(value: number): number {
  return Math.round(value * 10) / 10;
}

function clampToWindow(value: number): number {
  return Math.min(WINDOW.high, Math.max(WINDOW.low, value));
}

export function NeuronPlayground() {
  const [weights, setWeights] = useState<[number, number]>(WORKED_WEIGHTS);
  const [bias, setBias] = useState(WORKED_BIAS);
  const [activation, setActivation] = useState<ActivationName>("sigmoid");
  const [probe, setProbe] = useState<PlanePoint>(TALL_HEAVY);
  const [showCrowd, setShowCrowd] = useState(false);
  const [twin, setTwin] = useState<LogisticTwin | null>(null);
  const [answer, setAnswer] = useState<NeuronResponse | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const surfaceRef = useRef<SVGSVGElement | null>(null);
  const dragging = useRef(false);

  useEffect(() => {
    const timer = setTimeout(async () => {
      try {
        setAnswer(
          await respondNeuron({
            weights,
            bias,
            activation,
            probe,
            lattice: LATTICE,
          }),
        );
        setMessage(null);
      } catch (error) {
        if (error instanceof ApiError) setMessage(error.message);
        else setMessage("Something went wrong.");
      }
    }, 60);
    return () => clearTimeout(timer);
  }, [weights, bias, activation, probe]);

  useEffect(() => {
    (async () => {
      try {
        setTwin(await fetchLogisticTwin());
      } catch (error) {
        if (error instanceof ApiError) setMessage(error.message);
      }
    })();
  }, []);

  const eventToProbe = useCallback(
    (clientX: number, clientY: number): PlanePoint => {
      const svg = surfaceRef.current!;
      const rect = svg.getBoundingClientRect();
      const px = ((clientX - rect.left) / rect.width) * PANEL.width;
      const py = ((clientY - rect.top) / rect.height) * PANEL.height;
      const firstInput =
        WINDOW.low +
        ((px - PANEL_PAD.left) / PANEL_PLOT.width) * (WINDOW.high - WINDOW.low);
      const secondInput =
        WINDOW.low +
        (1 - (py - PANEL_PAD.top) / PANEL_PLOT.height) *
          (WINDOW.high - WINDOW.low);
      return {
        first_input: clampToWindow(roundToTenth(firstInput)),
        second_input: clampToWindow(roundToTenth(secondInput)),
      };
    },
    [],
  );

  const onSurfacePointerDown = (event: React.PointerEvent) => {
    dragging.current = true;
    surfaceRef.current?.setPointerCapture(event.pointerId);
    setProbe(eventToProbe(event.clientX, event.clientY));
  };
  const onSurfacePointerMove = (event: React.PointerEvent) => {
    if (!dragging.current) return;
    setProbe(eventToProbe(event.clientX, event.clientY));
  };
  const onSurfacePointerUp = () => {
    dragging.current = false;
  };

  const loadWorked = (person: PlanePoint) => {
    setWeights(WORKED_WEIGHTS);
    setBias(WORKED_BIAS);
    setProbe(person);
  };

  const loadFitted = () => {
    if (!twin) return;
    setWeights([twin.fitted_weights[0], twin.fitted_weights[1]]);
    setBias(twin.fitted_bias);
    setActivation("sigmoid");
    setShowCrowd(true);
  };

  const setWeight = (index: 0 | 1) => (value: number) => {
    setWeights((current) =>
      index === 0 ? [value, current[1]] : [current[0], value],
    );
  };

  const surface = answer?.surface;
  const curve = answer?.curve;
  const reading = answer?.reading;

  // The strongest output on the surface sets the full shade, which is
  // scaling to a colour, the browser's job.
  const strongest = surface
    ? Math.max(...surface.outputs.flat().map((output) => Math.abs(output)))
    : 0;
  const cellSpan = surface ? PANEL_PLOT.width / (surface.cells - 1) : 0;

  // The curve panel's vertical range holds the bend and its slope together,
  // with zero always on it so the two are read against the same floor.
  let curveLow = 0;
  let curveHigh = 1;
  if (curve) {
    const everything = [...curve.outputs, ...curve.slopes, 0];
    curveLow = Math.min(...everything);
    curveHigh = Math.max(...everything);
    if (curveHigh === curveLow) curveHigh = curveLow + 1;
    const padding = 0.06 * (curveHigh - curveLow);
    curveLow -= padding;
    curveHigh += padding;
  }

  const pathOf = (values: number[]): string =>
    curve
      ? curve.scores
          .map(
            (score, index) =>
              `${index === 0 ? "M" : "L"} ${curveX(score).toFixed(2)} ${curveY(values[index], curveLow, curveHigh).toFixed(2)}`,
          )
          .join(" ")
      : "";

  const outputPath = curve ? pathOf(curve.outputs) : "";
  const slopePath = curve ? pathOf(curve.slopes) : "";

  const markerOnCurve =
    reading !== undefined &&
    reading.score >= CURVE_RANGE.low &&
    reading.score <= CURVE_RANGE.high;

  const edgeStroke = (weight: number) =>
    weight >= 0 ? "text-indigo-600 dark:text-indigo-400" : "text-amber-500";
  const edgeWidth = (weight: number) =>
    1 + (2.5 * Math.abs(weight)) / PARAMETER_RANGE.max;

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 pb-3">
        {ACTIVATION_NAMES.map((name) => (
          <button
            key={name}
            onClick={() => setActivation(name)}
            className={name === activation ? SELECTED_BUTTON_CLASS : BUTTON_CLASS}
          >
            {ACTIVATION_LABELS[name]}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-2 pb-3">
        <button onClick={() => loadWorked(TALL_HEAVY)} className={BUTTON_CLASS}>
          A tall heavy person
        </button>
        <button onClick={() => loadWorked(SHORT_HEAVY)} className={BUTTON_CLASS}>
          A short heavy person
        </button>
        <button onClick={loadFitted} className={BUTTON_CLASS} disabled={!twin}>
          The fitted neuron
        </button>
        <label className="ml-auto flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
          <input
            type="checkbox"
            checked={showCrowd}
            onChange={(event) => setShowCrowd(event.target.checked)}
            className="accent-indigo-600"
          />
          Show the crowd
        </label>
      </div>

      <div className="grid grid-cols-1 gap-3 pb-3 sm:grid-cols-3">
        <Slider label="w₁" value={weights[0]} onChange={setWeight(0)} />
        <Slider label="w₂" value={weights[1]} onChange={setWeight(1)} />
        <Slider label="b" value={bias} onChange={setBias} />
      </div>

      {/* the model itself, read left to right */}
      <svg
        viewBox={`0 0 ${DIAGRAM.width} ${DIAGRAM.height}`}
        className="w-full select-none rounded-lg bg-slate-50 dark:bg-slate-950"
      >
        {INPUT_NODES.map((node, index) => (
          <g key={`edge${index}`}>
            <line
              x1={node.x + 22}
              y1={node.y}
              x2={SUM_NODE.x - 26}
              y2={SUM_NODE.y}
              stroke="currentColor"
              className={edgeStroke(weights[index])}
              strokeWidth={edgeWidth(weights[index])}
            />
            <text
              x={(node.x + SUM_NODE.x) / 2 - 10}
              y={index === 0 ? node.y - 2 : node.y + 14}
              textAnchor="middle"
              className="fill-slate-600 font-mono text-xs dark:fill-slate-300"
            >
              {index === 0 ? "w₁" : "w₂"} = {signed(weights[index], 2)}
            </text>
          </g>
        ))}

        <line
          x1={BIAS_NODE.x}
          y1={BIAS_NODE.y + 14}
          x2={SUM_NODE.x}
          y2={SUM_NODE.y - 26}
          stroke="currentColor"
          className={edgeStroke(bias)}
          strokeWidth={edgeWidth(bias)}
        />
        <text
          x={BIAS_NODE.x + 20}
          y={(BIAS_NODE.y + SUM_NODE.y) / 2 + 2}
          className="fill-slate-600 font-mono text-xs dark:fill-slate-300"
        >
          b = {signed(bias, 2)}
        </text>

        <line
          x1={SUM_NODE.x + 26}
          y1={SUM_NODE.y}
          x2={BEND_BOX.x}
          y2={SUM_NODE.y}
          stroke="currentColor"
          className="text-slate-400 dark:text-slate-500"
          strokeWidth={1.5}
        />
        <line
          x1={BEND_BOX.x + BEND_BOX.width}
          y1={SUM_NODE.y}
          x2={OUTPUT_NODE.x - 24}
          y2={SUM_NODE.y}
          stroke="currentColor"
          className="text-slate-400 dark:text-slate-500"
          strokeWidth={1.5}
        />

        {INPUT_NODES.map((node, index) => (
          <g key={`input${index}`}>
            <text
              x={node.x - 34}
              y={node.y + 4}
              textAnchor="middle"
              className="fill-slate-500 text-xs font-medium dark:fill-slate-400"
            >
              {index === 0 ? "x₁" : "x₂"}
            </text>
            <text
              x={node.x - 34}
              y={node.y + 16}
              textAnchor="middle"
              className="fill-slate-400 text-[9px] dark:fill-slate-500"
            >
              {index === 0 ? "height" : "weight"}
            </text>
            <circle
              cx={node.x}
              cy={node.y}
              r={22}
              className="fill-white stroke-slate-400 dark:fill-slate-900 dark:stroke-slate-500"
              strokeWidth={1.5}
            />
            <text
              x={node.x}
              y={node.y + 4}
              textAnchor="middle"
              className="fill-slate-800 font-mono text-xs dark:fill-slate-100"
            >
              {signed(
                index === 0 ? probe.first_input : probe.second_input,
                1,
              )}
            </text>
          </g>
        ))}

        <circle
          cx={BIAS_NODE.x}
          cy={BIAS_NODE.y}
          r={14}
          className="fill-white stroke-slate-400 dark:fill-slate-900 dark:stroke-slate-500"
          strokeWidth={1.5}
        />
        <text
          x={BIAS_NODE.x}
          y={BIAS_NODE.y + 4}
          textAnchor="middle"
          className="fill-slate-800 text-xs font-medium dark:fill-slate-100"
        >
          1
        </text>

        <circle
          cx={SUM_NODE.x}
          cy={SUM_NODE.y}
          r={26}
          className="fill-white stroke-slate-500 dark:fill-slate-900 dark:stroke-slate-400"
          strokeWidth={2}
        />
        <text
          x={SUM_NODE.x}
          y={SUM_NODE.y + 6}
          textAnchor="middle"
          className="fill-slate-800 text-lg font-semibold dark:fill-slate-100"
        >
          Σ
        </text>
        <text
          x={SUM_NODE.x}
          y={SUM_NODE.y + 44}
          textAnchor="middle"
          className="fill-slate-600 font-mono text-xs dark:fill-slate-300"
        >
          z = {reading ? signed(reading.score, 2) : "…"}
        </text>

        <rect
          x={BEND_BOX.x}
          y={BEND_BOX.y}
          width={BEND_BOX.width}
          height={BEND_BOX.height}
          rx={8}
          className="fill-indigo-50 stroke-indigo-500 dark:fill-indigo-950 dark:stroke-indigo-400"
          strokeWidth={2}
        />
        <text
          x={BEND_BOX.x + BEND_BOX.width / 2}
          y={BEND_BOX.y + BEND_BOX.height / 2 + 5}
          textAnchor="middle"
          className="fill-indigo-700 text-sm font-semibold dark:fill-indigo-200"
        >
          {ACTIVATION_LABELS[activation]}
        </text>
        <text
          x={BEND_BOX.x + BEND_BOX.width / 2}
          y={BEND_BOX.y + BEND_BOX.height + 20}
          textAnchor="middle"
          className="fill-slate-600 font-mono text-xs dark:fill-slate-300"
        >
          {answer ? answer.formula : "…"}
        </text>

        <circle
          cx={OUTPUT_NODE.x}
          cy={OUTPUT_NODE.y}
          r={24}
          className="fill-white stroke-slate-500 dark:fill-slate-900 dark:stroke-slate-400"
          strokeWidth={2}
        />
        <text
          x={OUTPUT_NODE.x}
          y={OUTPUT_NODE.y + 4}
          textAnchor="middle"
          className="fill-slate-800 font-mono text-xs dark:fill-slate-100"
        >
          {reading ? signed(reading.output, 2) : "…"}
        </text>
        <text
          x={OUTPUT_NODE.x}
          y={OUTPUT_NODE.y + 44}
          textAnchor="middle"
          className="fill-slate-500 text-xs font-medium dark:fill-slate-400"
        >
          output
        </text>
      </svg>

      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {/* the neuron's output over the plane of its two inputs */}
        <svg
          ref={surfaceRef}
          viewBox={`0 0 ${PANEL.width} ${PANEL.height}`}
          className="w-full cursor-crosshair touch-none select-none rounded-lg bg-slate-50 dark:bg-slate-950"
          onPointerDown={onSurfacePointerDown}
          onPointerMove={onSurfacePointerMove}
          onPointerUp={onSurfacePointerUp}
          onPointerLeave={onSurfacePointerUp}
        >
          {surface?.outputs.map((row, rowIndex) =>
            row.map((output, columnIndex) => {
              const px = planeX(
                latticeValue(columnIndex, surface.cells),
                PANEL_PLOT,
              );
              const py = planeY(latticeValue(rowIndex, surface.cells), PANEL_PLOT);
              const left = Math.max(PANEL_PAD.left, px - cellSpan / 2);
              const right = Math.min(
                PANEL_PAD.left + PANEL_PLOT.width,
                px + cellSpan / 2,
              );
              const top = Math.max(PANEL_PAD.top, py - cellSpan / 2);
              const bottom = Math.min(
                PANEL_PAD.top + PANEL_PLOT.height,
                py + cellSpan / 2,
              );
              const strength =
                strongest > 0 ? Math.min(1, Math.abs(output) / strongest) : 0;
              return (
                <rect
                  key={`${rowIndex}-${columnIndex}`}
                  x={left}
                  y={top}
                  width={right - left + 0.5}
                  height={bottom - top + 0.5}
                  fill={output >= 0 ? POSITIVE_FILL : NEGATIVE_FILL}
                  fillOpacity={0.9 * strength}
                />
              );
            }),
          )}

          <rect
            x={PANEL_PAD.left}
            y={PANEL_PAD.top}
            width={PANEL_PLOT.width}
            height={PANEL_PLOT.height}
            fill="none"
            stroke="currentColor"
            className="text-slate-300 dark:text-slate-700"
            strokeWidth={1}
          />

          {/* where the score is exactly zero */}
          {answer?.zero_line && (
            <line
              x1={planeX(answer.zero_line.start.first_input, PANEL_PLOT)}
              y1={planeY(answer.zero_line.start.second_input, PANEL_PLOT)}
              x2={planeX(answer.zero_line.end.first_input, PANEL_PLOT)}
              y2={planeY(answer.zero_line.end.second_input, PANEL_PLOT)}
              stroke="currentColor"
              className="text-slate-700 dark:text-slate-200"
              strokeWidth={1.5}
              strokeDasharray="6 4"
            />
          )}

          {/* the crowd, in standard units, amber for a child, indigo for an adult */}
          {showCrowd &&
            twin?.people.map((person, index) => (
              <circle
                key={`person${index}`}
                cx={planeX(person.standardised_height, PANEL_PLOT)}
                cy={planeY(person.standardised_weight, PANEL_PLOT)}
                r={4}
                fill={person.is_adult === 1 ? ADULT : CHILD}
                stroke="white"
                strokeWidth={1}
              />
            ))}

          <circle
            cx={planeX(probe.first_input, PANEL_PLOT)}
            cy={planeY(probe.second_input, PANEL_PLOT)}
            r={7}
            className="cursor-grab fill-slate-900 stroke-white dark:fill-slate-100 dark:stroke-slate-900"
            strokeWidth={2}
          />

          {[WINDOW.low, 0, WINDOW.high].map((tick) => (
            <text
              key={`sx${tick}`}
              x={planeX(tick, PANEL_PLOT)}
              y={PANEL_PAD.top + PANEL_PLOT.height + 14}
              textAnchor="middle"
              className="fill-slate-500 text-[10px] font-medium dark:fill-slate-400"
            >
              {tick}
            </text>
          ))}
          {[WINDOW.low, 0, WINDOW.high].map((tick) => (
            <text
              key={`sy${tick}`}
              x={PANEL_PAD.left - 6}
              y={planeY(tick, PANEL_PLOT) + 3}
              textAnchor="end"
              className="fill-slate-500 text-[10px] font-medium dark:fill-slate-400"
            >
              {tick}
            </text>
          ))}
          <text
            x={PANEL_PAD.left + PANEL_PLOT.width / 2}
            y={PANEL.height - 6}
            textAnchor="middle"
            className="fill-slate-500 text-xs font-medium dark:fill-slate-400"
          >
            x₁, height in standard units
          </text>
          <text
            x={12}
            y={PANEL_PAD.top + PANEL_PLOT.height / 2}
            textAnchor="middle"
            transform={`rotate(-90 12 ${PANEL_PAD.top + PANEL_PLOT.height / 2})`}
            className="fill-slate-500 text-xs font-medium dark:fill-slate-400"
          >
            x₂, weight in standard units
          </text>
        </svg>

        {/* the bend and its slope across a range of scores */}
        <svg
          viewBox={`0 0 ${PANEL.width} ${PANEL.height}`}
          className="w-full select-none rounded-lg bg-slate-50 dark:bg-slate-950"
        >
          <rect
            x={PANEL_PAD.left}
            y={PANEL_PAD.top}
            width={PANEL_PLOT.width}
            height={PANEL_PLOT.height}
            fill="none"
            stroke="currentColor"
            className="text-slate-300 dark:text-slate-700"
            strokeWidth={1}
          />
          {curve && (
            <>
              <line
                x1={PANEL_PAD.left}
                y1={curveY(0, curveLow, curveHigh)}
                x2={PANEL_PAD.left + PANEL_PLOT.width}
                y2={curveY(0, curveLow, curveHigh)}
                stroke="currentColor"
                className="text-slate-300 dark:text-slate-700"
                strokeWidth={1}
              />
              <line
                x1={curveX(0)}
                y1={PANEL_PAD.top}
                x2={curveX(0)}
                y2={PANEL_PAD.top + PANEL_PLOT.height}
                stroke="currentColor"
                className="text-slate-300 dark:text-slate-700"
                strokeWidth={1}
              />
              <path
                d={slopePath}
                fill="none"
                stroke="currentColor"
                className="text-amber-500"
                strokeWidth={2}
                strokeDasharray="5 3"
              />
              <path
                d={outputPath}
                fill="none"
                stroke="currentColor"
                className="text-indigo-600 dark:text-indigo-400"
                strokeWidth={2.5}
              />
              {reading && markerOnCurve && (
                <>
                  <line
                    x1={curveX(reading.score)}
                    y1={PANEL_PAD.top}
                    x2={curveX(reading.score)}
                    y2={PANEL_PAD.top + PANEL_PLOT.height}
                    stroke="currentColor"
                    className="text-slate-500 dark:text-slate-400"
                    strokeWidth={1}
                    strokeDasharray="2 3"
                  />
                  <circle
                    cx={curveX(reading.score)}
                    cy={curveY(reading.slope, curveLow, curveHigh)}
                    r={5}
                    className="fill-amber-500 stroke-white dark:stroke-slate-900"
                    strokeWidth={1.5}
                  />
                  <circle
                    cx={curveX(reading.score)}
                    cy={curveY(reading.output, curveLow, curveHigh)}
                    r={5}
                    className="fill-indigo-600 stroke-white dark:fill-indigo-400 dark:stroke-slate-900"
                    strokeWidth={1.5}
                  />
                </>
              )}
              <text
                x={PANEL_PAD.left - 6}
                y={PANEL_PAD.top + 4}
                textAnchor="end"
                className="fill-slate-500 text-[10px] font-medium dark:fill-slate-400"
              >
                {curveHigh.toFixed(1)}
              </text>
              <text
                x={PANEL_PAD.left - 6}
                y={PANEL_PAD.top + PANEL_PLOT.height}
                textAnchor="end"
                className="fill-slate-500 text-[10px] font-medium dark:fill-slate-400"
              >
                {curveLow.toFixed(1)}
              </text>
            </>
          )}
          {[CURVE_RANGE.low, 0, CURVE_RANGE.high].map((tick) => (
            <text
              key={`cx${tick}`}
              x={curveX(tick)}
              y={PANEL_PAD.top + PANEL_PLOT.height + 14}
              textAnchor="middle"
              className="fill-slate-500 text-[10px] font-medium dark:fill-slate-400"
            >
              {tick}
            </text>
          ))}
          <text
            x={PANEL_PAD.left + PANEL_PLOT.width / 2}
            y={PANEL.height - 6}
            textAnchor="middle"
            className="fill-slate-500 text-xs font-medium dark:fill-slate-400"
          >
            z, the score
          </text>
          <text
            x={12}
            y={PANEL_PAD.top + PANEL_PLOT.height / 2}
            textAnchor="middle"
            transform={`rotate(-90 12 ${PANEL_PAD.top + PANEL_PLOT.height / 2})`}
            className="fill-slate-500 text-xs font-medium dark:fill-slate-400"
          >
            f(z) solid, f′(z) dashed
          </text>
        </svg>
      </div>

      <p className="mt-2 text-center text-xs text-slate-500 dark:text-slate-500">
        Left, the neuron&rsquo;s output over the plane of standardised height
        and weight, the dashed line where its score is zero, and the probe you
        can drag. Right, the chosen bend in indigo and its slope in amber,
        marked at the probe&rsquo;s score.
      </p>

      <div className="mt-3 grid grid-cols-3 gap-3">
        <Stat
          label="Score z at the probe"
          value={reading ? signed(reading.score, 2) : "…"}
        />
        <Stat
          label="Output f(z)"
          value={reading ? signed(reading.output, 4) : "…"}
        />
        <Stat
          label="Slope f′(z)"
          value={reading ? signed(reading.slope, 4) : "…"}
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

function Slider({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
      <span className="w-6 font-mono">{label}</span>
      <input
        type="range"
        min={PARAMETER_RANGE.min}
        max={PARAMETER_RANGE.max}
        step={PARAMETER_RANGE.step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="w-full accent-indigo-600"
      />
      <span className="w-12 text-right font-mono text-sm">
        {signed(value, 2)}
      </span>
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
