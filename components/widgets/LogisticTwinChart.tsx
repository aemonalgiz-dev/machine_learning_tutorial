"use client";

// The logistic model fitted to the crowd, and the neuron that is the same
// calculation.
//
// The crowd's height and weight are standardised, a logistic model is
// fitted to the two standardised columns, and its two coefficients and its
// intercept are handed to one neuron as its two weights and its bias, under
// a sigmoid bend. The map is that neuron's output over the plane, with the
// line where its score is zero, which is where the model's probability is
// one half, and the crowd drawn on top. The table reads a few people both
// ways, through the model and through the neuron, and the largest gap
// between the two over the whole crowd is the claim. The fit, both routes'
// probabilities and the surface are the library's through the API. The
// browser shades and draws.

import { useEffect, useState } from "react";
import { ApiError } from "@/lib/api";
import {
  LogisticTwin,
  NeuronResponse,
  fetchLogisticTwin,
  respondNeuron,
} from "@/lib/concepts/neurons-and-activations";
import {
  ADULT,
  CHILD,
  LATTICE,
  NEGATIVE_FILL,
  POSITIVE_FILL,
  TALL_HEAVY,
  WINDOW,
  latticeValue,
  planeX,
  planeY,
  signed,
} from "./neuronFixtures";

const PANEL = { width: 360, height: 320 };
const PAD = { left: 40, right: 12, top: 12, bottom: 34 };
const PLOT = {
  left: PAD.left,
  top: PAD.top,
  width: PANEL.width - PAD.left - PAD.right,
  height: PANEL.height - PAD.top - PAD.bottom,
};

// How many people the table reads out; the rest are in the largest gap.
const TABLE_ROWS = 6;

export function LogisticTwinChart() {
  const [twin, setTwin] = useState<LogisticTwin | null>(null);
  const [surface, setSurface] = useState<NeuronResponse | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const fitted = await fetchLogisticTwin();
        setTwin(fitted);
        setSurface(
          await respondNeuron({
            weights: [fitted.fitted_weights[0], fitted.fitted_weights[1]],
            bias: fitted.fitted_bias,
            activation: "sigmoid",
            probe: TALL_HEAVY,
            lattice: LATTICE,
          }),
        );
      } catch (error) {
        if (error instanceof ApiError) setMessage(error.message);
        else setMessage("Something went wrong.");
      }
    })();
  }, []);

  if (!twin) {
    return (
      <p className="text-sm text-slate-500 dark:text-slate-400">
        {message ?? "…"}
      </p>
    );
  }

  // The sigmoid's output is between zero and one, so the shading is read
  // against one half, the probability at the zero line.
  const cellSpan = surface ? PLOT.width / (surface.surface.cells - 1) : 0;

  return (
    <div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <svg
          viewBox={`0 0 ${PANEL.width} ${PANEL.height}`}
          className="w-full select-none rounded-lg bg-slate-50 dark:bg-slate-950"
        >
          {surface?.surface.outputs.map((row, rowIndex) =>
            row.map((output, columnIndex) => {
              const px = planeX(
                latticeValue(columnIndex, surface.surface.cells),
                PLOT,
              );
              const py = planeY(
                latticeValue(rowIndex, surface.surface.cells),
                PLOT,
              );
              const left = Math.max(PAD.left, px - cellSpan / 2);
              const right = Math.min(PAD.left + PLOT.width, px + cellSpan / 2);
              const top = Math.max(PAD.top, py - cellSpan / 2);
              const bottom = Math.min(PAD.top + PLOT.height, py + cellSpan / 2);
              const lean = 2 * Math.abs(output - 0.5);
              return (
                <rect
                  key={`${rowIndex}-${columnIndex}`}
                  x={left}
                  y={top}
                  width={right - left + 0.5}
                  height={bottom - top + 0.5}
                  fill={output >= 0.5 ? POSITIVE_FILL : NEGATIVE_FILL}
                  fillOpacity={0.5 * lean}
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
          {twin.zero_line && (
            <line
              x1={planeX(twin.zero_line.start.first_input, PLOT)}
              y1={planeY(twin.zero_line.start.second_input, PLOT)}
              x2={planeX(twin.zero_line.end.first_input, PLOT)}
              y2={planeY(twin.zero_line.end.second_input, PLOT)}
              stroke="currentColor"
              className="text-slate-700 dark:text-slate-200"
              strokeWidth={1.5}
              strokeDasharray="6 4"
            />
          )}
          {twin.people.map((person, index) => (
            <circle
              key={index}
              cx={planeX(person.standardised_height, PLOT)}
              cy={planeY(person.standardised_weight, PLOT)}
              r={4.5}
              fill={person.is_adult === 1 ? ADULT : CHILD}
              stroke={person.predicted_adult === person.is_adult ? "white" : "#0f172a"}
              strokeWidth={person.predicted_adult === person.is_adult ? 1 : 2}
            />
          ))}
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
            height in standard units
          </text>
          <text
            x={12}
            y={PAD.top + PLOT.height / 2}
            textAnchor="middle"
            transform={`rotate(-90 12 ${PAD.top + PLOT.height / 2})`}
            className="fill-slate-500 text-xs font-medium dark:fill-slate-400"
          >
            weight in standard units
          </text>
        </svg>

        <div className="grid grid-cols-2 gap-2 content-start">
          <Stat
            label="fitted weight on height, on weight"
            value={`${signed(twin.fitted_weights[0], 4)}, ${signed(twin.fitted_weights[1], 4)}`}
          />
          <Stat label="fitted bias" value={signed(twin.fitted_bias, 4)} />
          <Stat
            label="passes to converge"
            value={`${twin.epochs_run}${twin.converged ? "" : ", not converged"}`}
          />
          <Stat
            label="people called correctly"
            value={`${twin.n_correct} of ${twin.n_people}, accuracy ${twin.accuracy.toFixed(2)}`}
          />
          <Stat
            label="largest gap, model against neuron"
            value={twin.largest_gap.toExponential(1)}
          />
          <Stat
            label="height, weight standardised about"
            value={`${twin.mean_height.toFixed(2)} ± ${twin.deviation_height.toFixed(2)}, ${twin.mean_weight.toFixed(2)} ± ${twin.deviation_weight.toFixed(2)}`}
          />
        </div>
      </div>

      <div className="mt-3 overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left dark:border-slate-800">
              {[
                "person",
                "standardised height, weight",
                "score",
                "model probability",
                "neuron output",
              ].map((heading) => (
                <th
                  key={heading}
                  className="py-1.5 pr-4 font-semibold text-slate-600 last:pr-0 dark:text-slate-400"
                >
                  {heading}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {twin.people.slice(0, TABLE_ROWS).map((person, index) => (
              <tr
                key={index}
                className="border-b border-slate-100 last:border-0 dark:border-slate-800/60"
              >
                <td className="py-1.5 pr-4 text-slate-700 dark:text-slate-300">
                  {person.height} cm, {person.weight} kg,{" "}
                  {person.is_adult === 1 ? "adult" : "child"}
                </td>
                <td className="py-1.5 pr-4 font-mono text-slate-800 dark:text-slate-200">
                  {signed(person.standardised_height, 3)},{" "}
                  {signed(person.standardised_weight, 3)}
                </td>
                <td className="py-1.5 pr-4 font-mono text-slate-800 dark:text-slate-200">
                  {signed(person.score, 4)}
                </td>
                <td className="py-1.5 pr-4 font-mono text-slate-800 dark:text-slate-200">
                  {person.model_probability.toFixed(6)}
                </td>
                <td className="py-1.5 font-mono text-slate-800 dark:text-slate-200">
                  {person.neuron_output.toFixed(6)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-2 text-center text-xs text-slate-500 dark:text-slate-500">
        The fitted neuron&rsquo;s output over the plane, indigo above one half
        and amber below, with the dashed line where the probability is exactly
        one half. Amber dots are children and indigo dots adults; a dark ring
        marks a person the line calls wrongly.
      </p>

      {message && (
        <p className="mt-3 text-sm text-amber-600 dark:text-amber-400">
          {message}
        </p>
      )}
    </div>
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
