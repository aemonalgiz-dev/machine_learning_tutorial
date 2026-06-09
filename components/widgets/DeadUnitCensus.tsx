"use client";

// The crowd under one neuron, each person drawn by how much gradient the
// bend would pass back at their score.
//
// The neuron starts as the one the logistic model fitted to the crowd, and
// the slider scales its three numbers together, which turns the zero line
// not at all and steepens the score everywhere else. Under a sigmoid or a
// tangent the people far from the line go flat as the scale rises; under
// the rectifier everyone on the negative side is dead at any scale. A
// person's dot is filled in proportion to the slope at their score, so a
// dead or saturated person fades to a hollow ring. The counts are the
// library's through the API, as are every score and slope. The browser
// draws the rings.

import { useEffect, useState } from "react";
import { ApiError } from "@/lib/api";
import {
  ACTIVATION_NAMES,
  ActivationName,
  CrowdCensus,
  LogisticTwin,
  censusCrowd,
  fetchLogisticTwin,
} from "@/lib/concepts/neurons-and-activations";
import {
  ACTIVATION_LABELS,
  ADULT,
  BUTTON_CLASS,
  CHILD,
  SELECTED_BUTTON_CLASS,
  WINDOW,
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

const SCALE_RANGE = { min: 0.25, max: 20, step: 0.25 };

export function DeadUnitCensus() {
  const [twin, setTwin] = useState<LogisticTwin | null>(null);
  const [activation, setActivation] = useState<ActivationName>("sigmoid");
  const [scale, setScale] = useState(1);
  const [census, setCensus] = useState<CrowdCensus | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setTwin(await fetchLogisticTwin());
      } catch (error) {
        if (error instanceof ApiError) setMessage(error.message);
        else setMessage("Something went wrong.");
      }
    })();
  }, []);

  useEffect(() => {
    if (!twin) return;
    const timer = setTimeout(async () => {
      try {
        setCensus(
          await censusCrowd({
            weights: [
              scale * twin.fitted_weights[0],
              scale * twin.fitted_weights[1],
            ],
            bias: scale * twin.fitted_bias,
            activation,
          }),
        );
        setMessage(null);
      } catch (error) {
        if (error instanceof ApiError) setMessage(error.message);
        else setMessage("Something went wrong.");
      }
    }, 60);
    return () => clearTimeout(timer);
  }, [twin, activation, scale]);

  if (!twin) {
    return (
      <p className="text-sm text-slate-500 dark:text-slate-400">
        {message ?? "…"}
      </p>
    );
  }

  const peak = census?.peak_slope ?? 1;

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
      <label className="flex items-center gap-2 pb-3 text-sm text-slate-600 dark:text-slate-300">
        <span className="w-44 shrink-0">scale the fitted neuron by</span>
        <input
          type="range"
          min={SCALE_RANGE.min}
          max={SCALE_RANGE.max}
          step={SCALE_RANGE.step}
          value={scale}
          onChange={(event) => setScale(Number(event.target.value))}
          className="w-full accent-indigo-600"
        />
        <span className="w-12 text-right font-mono text-sm">
          {scale.toFixed(2)}
        </span>
      </label>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <svg
          viewBox={`0 0 ${PANEL.width} ${PANEL.height}`}
          className="w-full select-none rounded-lg bg-slate-50 dark:bg-slate-950"
        >
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
          {(census?.people ?? []).map((person, index) => {
            const share = Math.min(1, person.slope / peak);
            const colour = person.is_adult === 1 ? ADULT : CHILD;
            return (
              <circle
                key={index}
                cx={planeX(person.standardised_height, PLOT)}
                cy={planeY(person.standardised_weight, PLOT)}
                r={person.slope === 0 ? 4 : 5}
                fill={colour}
                fillOpacity={0.1 + 0.9 * share}
                stroke={colour}
                strokeWidth={1.5}
                strokeDasharray={person.slope === 0 ? "2 2" : undefined}
              />
            );
          })}
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
            label="dead, slope exactly zero"
            value={census ? `${census.n_dead} of ${census.n_people}` : "…"}
          />
          <Stat
            label="saturated, under a hundredth of the peak"
            value={census ? `${census.n_saturated} of ${census.n_people}` : "…"}
          />
          <Stat
            label="smallest slope in the crowd"
            value={census ? census.smallest_slope.toExponential(2) : "…"}
          />
          <Stat
            label="largest slope in the crowd"
            value={census ? census.largest_slope.toFixed(4) : "…"}
          />
          <Stat
            label="peak slope, threshold"
            value={
              census
                ? `${census.peak_slope.toFixed(2)}, ${census.saturation_threshold.toFixed(4)}`
                : "…"
            }
          />
          <Stat
            label="weights, bias in use"
            value={`${signed(scale * twin.fitted_weights[0], 2)}, ${signed(scale * twin.fitted_weights[1], 2)}, ${signed(scale * twin.fitted_bias, 2)}`}
          />
        </div>
      </div>

      <p className="mt-2 text-center text-xs text-slate-500 dark:text-slate-500">
        Each person filled in proportion to the bend&rsquo;s slope at their
        score, amber for a child and indigo for an adult, with the dead drawn
        as a dotted ring. The dashed line is where the score is zero, and
        scaling does not move it.
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
