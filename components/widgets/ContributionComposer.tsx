"use client";

// One prediction, built out of the pieces that add up to it.
//
// The several-inputs model says a prediction is the intercept plus each
// input times its coefficient, and this draws that sentence as a walk along
// a number line. The intercept steps off first, the height contribution
// steps next, the age contribution last, and where the walk ends is the
// prediction. The starting coefficients are the plane the library fitted to
// the page's twenty people, fetched through the API; every slider after that
// is the reader's own, and the blocks grow, shrink or turn negative as they
// move, which is the dot product made visible without a room to rotate.

import { useEffect, useState } from "react";
import { ApiError, Person3d, fitPlane3d } from "@/lib/api";

// The page's twenty people, the plane's fitted coefficients being the
// composer's starting point.
const MEASURED_PEOPLE: Person3d[] = [
  { height: 186, age: 48, weight: 82.5 },
  { height: 186, age: 34, weight: 78.6 },
  { height: 173, age: 64, weight: 67.8 },
  { height: 163, age: 23, weight: 61.0 },
  { height: 152, age: 54, weight: 55.7 },
  { height: 167, age: 64, weight: 70.2 },
  { height: 168, age: 31, weight: 64.9 },
  { height: 152, age: 65, weight: 55.0 },
  { height: 152, age: 64, weight: 60.1 },
  { height: 195, age: 21, weight: 78.9 },
  { height: 179, age: 55, weight: 78.8 },
  { height: 161, age: 20, weight: 54.9 },
  { height: 170, age: 45, weight: 70.7 },
  { height: 194, age: 42, weight: 79.5 },
  { height: 190, age: 30, weight: 77.2 },
  { height: 188, age: 36, weight: 75.5 },
  { height: 168, age: 60, weight: 74.3 },
  { height: 172, age: 36, weight: 69.8 },
  { height: 180, age: 27, weight: 78.8 },
  { height: 153, age: 55, weight: 61.7 },
];

interface Coefficients {
  intercept: number;
  height: number;
  age: number;
}

const VIEW = { width: 640, height: 150 };
const PAD = { left: 24, right: 24 };
const AXIS = { min: -140, max: 220 };
const BAR_Y = 62;
const BAR_HEIGHT = 26;

function toX(value: number): number {
  const clamped = Math.max(AXIS.min, Math.min(AXIS.max, value));
  return PAD.left + ((clamped - AXIS.min) / (AXIS.max - AXIS.min)) * (VIEW.width - PAD.left - PAD.right);
}

function signed(value: number, digits: number): string {
  const text = Math.abs(value).toFixed(digits);
  return value < 0 ? `− ${text}` : `+ ${text}`;
}

export function ContributionComposer() {
  const [fitted, setFitted] = useState<Coefficients | null>(null);
  const [coefficients, setCoefficients] = useState<Coefficients>({
    intercept: -49.12,
    height: 0.651,
    age: 0.154,
  });
  const [height, setHeight] = useState(170);
  const [age, setAge] = useState(35);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const fit = await fitPlane3d(MEASURED_PEOPLE);
        const learned = {
          intercept: fit.intercept,
          height: fit.height_coefficient,
          age: fit.age_coefficient,
        };
        setFitted(learned);
        setCoefficients(learned);
      } catch (error) {
        if (error instanceof ApiError) setMessage(error.message);
        else setMessage("Something went wrong.");
      }
    })();
  }, []);

  const heightContribution = coefficients.height * height;
  const ageContribution = coefficients.age * age;
  const prediction = coefficients.intercept + heightContribution + ageContribution;

  // The walk: each block runs from where the previous one ended.
  const afterIntercept = coefficients.intercept;
  const afterHeight = afterIntercept + heightContribution;
  const blocks = [
    { label: "intercept", from: 0, to: afterIntercept, className: "fill-slate-400 dark:fill-slate-500" },
    { label: "height", from: afterIntercept, to: afterHeight, className: "fill-indigo-500 dark:fill-indigo-400" },
    { label: "age", from: afterHeight, to: prediction, className: "fill-amber-400 dark:fill-amber-500" },
  ];

  return (
    <div>
      <svg
        viewBox={`0 0 ${VIEW.width} ${VIEW.height}`}
        className="w-full select-none rounded-lg bg-slate-50 dark:bg-slate-950"
      >
        {[-100, -50, 0, 50, 100, 150, 200].map((tick) => (
          <g key={`tick-${tick}`}>
            <line
              x1={toX(tick)}
              y1={BAR_Y - 14}
              x2={toX(tick)}
              y2={BAR_Y + BAR_HEIGHT + 14}
              stroke="currentColor"
              className={tick === 0 ? "text-slate-400 dark:text-slate-600" : "text-slate-200 dark:text-slate-800"}
              strokeWidth={tick === 0 ? 1.5 : 1}
            />
            <text
              x={toX(tick)}
              y={BAR_Y + BAR_HEIGHT + 28}
              textAnchor="middle"
              className="fill-slate-400 text-[11px]"
            >
              {tick}
            </text>
          </g>
        ))}

        {blocks.map((block, index) => {
          const left = Math.min(toX(block.from), toX(block.to));
          const width = Math.abs(toX(block.to) - toX(block.from));
          return (
            <g key={block.label}>
              <rect
                x={left}
                y={BAR_Y}
                width={Math.max(width, 1)}
                height={BAR_HEIGHT}
                className={block.className}
                opacity={0.85}
              />
              <text
                x={left + width / 2}
                y={BAR_Y - 6 - (index % 2) * 14}
                textAnchor="middle"
                className="fill-slate-600 text-[11px] font-medium dark:fill-slate-300"
              >
                {block.label} {signed(block.to - block.from, 1)}
              </text>
            </g>
          );
        })}

        <line
          x1={toX(prediction)}
          y1={BAR_Y - 16}
          x2={toX(prediction)}
          y2={BAR_Y + BAR_HEIGHT + 8}
          stroke="currentColor"
          className="text-emerald-600 dark:text-emerald-400"
          strokeWidth={2.5}
        />
        <text
          x={toX(prediction)}
          y={VIEW.height - 6}
          textAnchor="middle"
          className="fill-emerald-700 text-xs font-semibold dark:fill-emerald-300"
        >
          prediction {prediction.toFixed(1)} kg
        </text>
      </svg>

      <p className="mt-3 rounded-md bg-slate-100 px-3 py-2 text-center font-mono text-sm text-slate-800 dark:bg-slate-800 dark:text-slate-200">
        {coefficients.intercept.toFixed(2)}{" "}
        <span className="text-indigo-600 dark:text-indigo-300">
          {signed(heightContribution, 2)}
        </span>{" "}
        <span className="text-amber-600 dark:text-amber-300">{signed(ageContribution, 2)}</span> ={" "}
        <span className="text-emerald-700 dark:text-emerald-300">{prediction.toFixed(2)}</span>
      </p>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <Slider label="height (cm)" value={height} min={140} max={200} step={1} onChange={setHeight} />
        <Slider label="age (years)" value={age} min={15} max={75} step={1} onChange={setAge} />
        <Slider
          label="kg per cm of height"
          value={coefficients.height}
          min={-1}
          max={1.5}
          step={0.01}
          onChange={(value) => setCoefficients((current) => ({ ...current, height: value }))}
          accent="indigo"
        />
        <Slider
          label="kg per year of age"
          value={coefficients.age}
          min={-0.6}
          max={0.6}
          step={0.01}
          onChange={(value) => setCoefficients((current) => ({ ...current, age: value }))}
          accent="amber"
        />
        <Slider
          label="intercept (kg)"
          value={coefficients.intercept}
          min={-130}
          max={60}
          step={0.5}
          onChange={(value) => setCoefficients((current) => ({ ...current, intercept: value }))}
        />
        <div className="flex items-end">
          <button
            onClick={() => fitted && setCoefficients(fitted)}
            disabled={!fitted}
            className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
          >
            Back to the fitted plane
          </button>
        </div>
      </div>

      {message && (
        <p className="mt-3 text-sm text-amber-600 dark:text-amber-400">{message}</p>
      )}
    </div>
  );
}

function Slider({
  label,
  value,
  min,
  max,
  step,
  onChange,
  accent,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
  accent?: "indigo" | "amber";
}) {
  const accentClass =
    accent === "amber" ? "accent-amber-500" : accent === "indigo" ? "accent-indigo-600" : "accent-slate-500";
  const digits = step < 1 ? 2 : 0;
  return (
    <label className="flex flex-col gap-1 text-xs text-slate-600 dark:text-slate-300">
      <span className="flex justify-between">
        {label}
        <span className="font-mono">{value.toFixed(digits)}</span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className={accentClass}
      />
    </label>
  );
}
