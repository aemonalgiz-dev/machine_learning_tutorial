"use client";

// The balance point the statistics primer keeps talking about, made draggable.
//
// Five people stand on a number line of heights in centimetres. The slate
// triangle beneath the line marks their mean, and each thin bar above the line
// is one person's signed deviation from it, rose reaching left for a person
// below the mean and emerald reaching right for a person above. Drag any dot
// and the triangle chases it, while the signed deviations keep cancelling to
// exactly zero, which is why the mean is called the balance point. Every
// number shown comes from the API, not the browser.

import { useCallback, useEffect, useRef, useState } from "react";
import { ApiError, ValueDescription, describeValues } from "@/lib/api";

const VIEW_WIDTH = 520;
const VIEW_HEIGHT = 180;
const PADDING = 30;
const LOW = 140; // the number line runs 140..200 cm
const HIGH = 200;
const SCALE = (VIEW_WIDTH - 2 * PADDING) / (HIGH - LOW);
const BASELINE = 130;

const STARTING_HEIGHTS = [160, 165, 170, 175, 180];

function pixelForValue(value: number): number {
  return PADDING + (value - LOW) * SCALE;
}

export function MeanBalancePlayground() {
  const [values, setValues] = useState<number[]>(STARTING_HEIGHTS);
  const [description, setDescription] = useState<ValueDescription | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const draggingIndex = useRef<number | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    const timer = setTimeout(async () => {
      try {
        setDescription(await describeValues(values));
        setMessage(null);
      } catch (error) {
        if (error instanceof ApiError) setMessage(error.message);
        else setMessage("Something went wrong.");
      }
    }, 60);
    return () => clearTimeout(timer);
  }, [values]);

  const valueForClientX = useCallback((clientX: number): number => {
    const svg = svgRef.current!;
    const bounds = svg.getBoundingClientRect();
    const viewX = ((clientX - bounds.left) / bounds.width) * VIEW_WIDTH;
    const unsnapped = LOW + (viewX - PADDING) / SCALE;
    return Math.max(LOW, Math.min(HIGH, Math.round(unsnapped)));
  }, []);

  const onDotPointerDown =
    (personIndex: number) => (event: React.PointerEvent) => {
      event.stopPropagation();
      draggingIndex.current = personIndex;
      svgRef.current?.setPointerCapture(event.pointerId);
    };

  const onPointerMove = (event: React.PointerEvent) => {
    if (draggingIndex.current === null) return;
    const personIndex = draggingIndex.current;
    const centimetres = valueForClientX(event.clientX);
    setValues((current) =>
      current.map((value, index) =>
        index === personIndex ? centimetres : value,
      ),
    );
  };

  const onPointerUp = () => {
    draggingIndex.current = null;
  };

  const tickMarks = [];
  for (let tickValue = LOW; tickValue <= HIGH; tickValue += 10) {
    const tickPixel = pixelForValue(tickValue);
    tickMarks.push(
      <line
        key={`tick${tickValue}`}
        x1={tickPixel}
        y1={BASELINE - 5}
        x2={tickPixel}
        y2={BASELINE + 5}
        stroke="currentColor"
        className="text-slate-300 dark:text-slate-700"
        strokeWidth={1}
      />,
      <text
        key={`label${tickValue}`}
        x={tickPixel}
        y={BASELINE + 38}
        textAnchor="middle"
        className="fill-slate-500 text-xs font-medium dark:fill-slate-400"
      >
        {tickValue}
      </text>,
    );
  }

  const meanPixel = description ? pixelForValue(description.mean) : null;

  return (
    <div>
      <svg
        ref={svgRef}
        viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}
        className="mx-auto w-full max-w-lg touch-none select-none rounded-lg bg-slate-50 dark:bg-slate-950"
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
      >
        <line
          x1={PADDING}
          y1={BASELINE}
          x2={VIEW_WIDTH - PADDING}
          y2={BASELINE}
          stroke="currentColor"
          className="text-slate-300 dark:text-slate-700"
          strokeWidth={1.5}
        />
        {tickMarks}

        {meanPixel !== null && (
          <line
            x1={meanPixel}
            y1={36}
            x2={meanPixel}
            y2={BASELINE}
            stroke="currentColor"
            className="text-slate-300 dark:text-slate-700"
            strokeWidth={1}
            strokeDasharray="3 3"
          />
        )}

        {description &&
          meanPixel !== null &&
          values.map((value, personIndex) => (
            <line
              key={`deviation${personIndex}`}
              x1={meanPixel}
              y1={BASELINE - 22 - personIndex * 16}
              x2={pixelForValue(value)}
              y2={BASELINE - 22 - personIndex * 16}
              stroke="currentColor"
              className={
                description.deviations[personIndex] < 0
                  ? "text-rose-500"
                  : "text-emerald-500"
              }
              strokeWidth={3}
            />
          ))}

        {meanPixel !== null && (
          <polygon
            points={`${meanPixel},${BASELINE + 6} ${meanPixel - 7},${BASELINE + 20} ${meanPixel + 7},${BASELINE + 20}`}
            className="fill-slate-500 dark:fill-slate-400"
          />
        )}

        {values.map((value, personIndex) => (
          <circle
            key={`person${personIndex}`}
            cx={pixelForValue(value)}
            cy={BASELINE}
            r={9}
            className="cursor-grab fill-indigo-600 stroke-white dark:stroke-slate-900"
            strokeWidth={2}
            onPointerDown={onDotPointerDown(personIndex)}
          />
        ))}
      </svg>

      <p className="mt-2 text-center text-xs text-slate-500 dark:text-slate-500">
        Drag a person and watch the mean chase them while the deviations go on
        cancelling to zero.
      </p>

      <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat
          label="Mean"
          value={description ? description.mean.toFixed(1) : "…"}
        />
        <Stat
          label="Deviation total"
          value={description ? description.deviation_total.toFixed(1) : "…"}
        />
        <Stat
          label="Variance"
          value={description ? description.variance.toFixed(1) : "…"}
        />
        <Stat
          label="Standard deviation"
          value={description ? description.standard_deviation.toFixed(2) : "…"}
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

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-slate-100 px-3 py-2 dark:bg-slate-800">
      <div className="text-xs text-slate-500 dark:text-slate-400">{label}</div>
      <div className="font-mono text-base font-semibold text-slate-900 dark:text-slate-100">
        {value}
      </div>
    </div>
  );
}
