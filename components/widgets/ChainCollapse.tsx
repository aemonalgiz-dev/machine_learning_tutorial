"use client";

// Two neurons in a chain, and the plane that does or does not fit.
//
// The worked neuron reads standardised height and weight, its output is
// handed to a second neuron with one weight and one bias, and the surface
// is what comes out the far end. With nothing bending between them the
// surface is a plane, and the least-squares plane through it explains it
// exactly, with an R squared of 1.0 and no residual, because the chain is
// one neuron with the collapsed weights. Put a bend between them and the
// plane misses. The chain's outputs, the collapsed weights, the plane fit
// and the worked person's readings are all the library's through the API.
// The browser shades and scales.

import { useEffect, useState } from "react";
import { ApiError } from "@/lib/api";
import {
  ACTIVATION_NAMES,
  ActivationName,
  ChainResponse,
  chainNeurons,
} from "@/lib/concepts/neurons-and-activations";
import {
  ACTIVATION_LABELS,
  BUTTON_CLASS,
  LATTICE,
  NEGATIVE_FILL,
  PARAMETER_RANGE,
  POSITIVE_FILL,
  SELECTED_BUTTON_CLASS,
  TALL_HEAVY,
  WINDOW,
  WORKED_BIAS,
  WORKED_WEIGHTS,
  latticeValue,
  planeX,
  planeY,
  signed,
} from "./neuronFixtures";

const PANEL = { width: 320, height: 320 };
const PAD = { left: 40, right: 12, top: 12, bottom: 34 };
const PLOT = {
  left: PAD.left,
  top: PAD.top,
  width: PANEL.width - PAD.left - PAD.right,
  height: PANEL.height - PAD.top - PAD.bottom,
};

export function ChainCollapse() {
  const [between, setBetween] = useState<ActivationName>("identity");
  const [secondWeight, setSecondWeight] = useState(1.5);
  const [secondBias, setSecondBias] = useState(-0.25);
  const [answer, setAnswer] = useState<ChainResponse | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(async () => {
      try {
        setAnswer(
          await chainNeurons({
            first_weights: WORKED_WEIGHTS,
            first_bias: WORKED_BIAS,
            between,
            second_weight: secondWeight,
            second_bias: secondBias,
            probe: TALL_HEAVY,
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
  }, [between, secondWeight, secondBias]);

  const strongest = answer
    ? Math.max(...answer.outputs.flat().map((output) => Math.abs(output)))
    : 0;
  const cellSpan = answer ? PLOT.width / (answer.cells - 1) : 0;
  const plane = answer?.plane;
  const reading = answer?.reading;

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 pb-3">
        <span className="text-sm text-slate-600 dark:text-slate-300">
          Bend between the two
        </span>
        {ACTIVATION_NAMES.map((name) => (
          <button
            key={name}
            onClick={() => setBetween(name)}
            className={name === between ? SELECTED_BUTTON_CLASS : BUTTON_CLASS}
          >
            {ACTIVATION_LABELS[name]}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-1 gap-3 pb-3 sm:grid-cols-2">
        <Slider
          label="second neuron’s weight"
          value={secondWeight}
          onChange={setSecondWeight}
        />
        <Slider
          label="second neuron’s bias"
          value={secondBias}
          onChange={setSecondBias}
        />
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <svg
          viewBox={`0 0 ${PANEL.width} ${PANEL.height}`}
          className="w-full select-none rounded-lg bg-slate-50 dark:bg-slate-950"
        >
          {answer?.outputs.map((row, rowIndex) =>
            row.map((output, columnIndex) => {
              const px = planeX(latticeValue(columnIndex, answer.cells), PLOT);
              const py = planeY(latticeValue(rowIndex, answer.cells), PLOT);
              const left = Math.max(PAD.left, px - cellSpan / 2);
              const right = Math.min(PAD.left + PLOT.width, px + cellSpan / 2);
              const top = Math.max(PAD.top, py - cellSpan / 2);
              const bottom = Math.min(PAD.top + PLOT.height, py + cellSpan / 2);
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
            x={PAD.left}
            y={PAD.top}
            width={PLOT.width}
            height={PLOT.height}
            fill="none"
            stroke="currentColor"
            className="text-slate-300 dark:text-slate-700"
            strokeWidth={1}
          />
          <circle
            cx={planeX(TALL_HEAVY.first_input, PLOT)}
            cy={planeY(TALL_HEAVY.second_input, PLOT)}
            r={6}
            className="fill-slate-900 stroke-white dark:fill-slate-100 dark:stroke-slate-900"
            strokeWidth={2}
          />
          {[WINDOW.low, 0, WINDOW.high].map((tick) => (
            <text
              key={`sx${tick}`}
              x={planeX(tick, PLOT)}
              y={PAD.top + PLOT.height + 14}
              textAnchor="middle"
              className="fill-slate-500 text-[10px] font-medium dark:fill-slate-400"
            >
              {tick}
            </text>
          ))}
          {[WINDOW.low, 0, WINDOW.high].map((tick) => (
            <text
              key={`sy${tick}`}
              x={PAD.left - 6}
              y={planeY(tick, PLOT) + 3}
              textAnchor="end"
              className="fill-slate-500 text-[10px] font-medium dark:fill-slate-400"
            >
              {tick}
            </text>
          ))}
          <text
            x={PAD.left + PLOT.width / 2}
            y={PANEL.height - 6}
            textAnchor="middle"
            className="fill-slate-500 text-xs font-medium dark:fill-slate-400"
          >
            x₁, height in standard units
          </text>
          <text
            x={12}
            y={PAD.top + PLOT.height / 2}
            textAnchor="middle"
            transform={`rotate(-90 12 ${PAD.top + PLOT.height / 2})`}
            className="fill-slate-500 text-xs font-medium dark:fill-slate-400"
          >
            x₂, weight in standard units
          </text>
        </svg>

        <div className="grid grid-cols-2 gap-2 content-start">
          <Stat
            label="collapsed weights, bias"
            value={
              answer
                ? `${signed(answer.collapsed_weights[0], 2)}, ${signed(answer.collapsed_weights[1], 2)}, ${signed(answer.collapsed_bias, 2)}`
                : "…"
            }
          />
          <Stat
            label="plane fit weights, intercept"
            value={
              plane
                ? `${signed(plane.height_weight, 2)}, ${signed(plane.weight_weight, 2)}, ${signed(plane.intercept, 2)}`
                : "…"
            }
          />
          <Stat
            label="plane fit R²"
            value={
              plane
                ? plane.r_squared === null
                  ? "undefined, flat"
                  : plane.r_squared.toFixed(4)
                : "…"
            }
          />
          <Stat
            label="largest residual from the plane"
            value={plane ? plane.largest_residual.toFixed(4) : "…"}
          />
          <Stat
            label="tall heavy, first neuron score, output"
            value={
              reading
                ? `${signed(reading.first_score, 2)}, ${signed(reading.first_output, 4)}`
                : "…"
            }
          />
          <Stat
            label="tall heavy, chain output, collapsed output"
            value={
              reading
                ? `${signed(reading.output, 4)}, ${signed(reading.collapsed_output, 4)}`
                : "…"
            }
          />
        </div>
      </div>

      <p className="mt-2 text-center text-xs text-slate-500 dark:text-slate-500">
        The chain&rsquo;s output over the plane, with the tall heavy person
        marked. The collapsed neuron is the second weight times the first
        neuron&rsquo;s three numbers, plus the second bias; the plane fit is
        the least-squares plane through every cell.
      </p>

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
      <span className="w-40 shrink-0">{label}</span>
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
    <div className="rounded-lg bg-slate-100 px-2 py-1.5 dark:bg-slate-800">
      <div className="text-[11px] text-slate-500 dark:text-slate-400">
        {label}
      </div>
      <div className="font-mono text-sm font-semibold text-slate-900 dark:text-slate-100">
        {value}
      </div>
    </div>
  );
}
