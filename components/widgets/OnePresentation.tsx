"use client";

// One person shown once to three cells placed by hand.
//
// The three cells sit at round numbers so every figure below can be checked
// with a calculator. The hollow squares are where the cells were before the
// person arrived, the filled squares are where they ended, and the arrow
// between them is the move. Sliding the reach down to zero leaves only the
// winner moving, which is the whole difference between this method and a plain
// grouping, and sliding the step up to one lands the winner exactly on the
// person and throws away everything it had learned. Drag the person anywhere
// in the window to change who wins. The API runs the library's own
// competition, cooperation and adaptation once and reports every cell's share;
// the browser draws them.

import { useCallback, useEffect, useRef, useState } from "react";
import { ApiError, Point } from "@/lib/api";
import {
  Presentation,
  presentOnePerson,
} from "@/lib/concepts/self-organising-map";
import {
  DOMAIN,
  HAND_PLACED_CHAIN,
  PRESENTED_PERSON,
  SLIDER_LABEL_CLASS,
  cellColour,
} from "./selfOrganisingMapFixtures";

const VIEW = { width: 640, height: 380 };
const PAD = { left: 52, right: 16, top: 16, bottom: 42 };
const PLOT = {
  width: VIEW.width - PAD.left - PAD.right,
  height: VIEW.height - PAD.top - PAD.bottom,
};

const CELL_SIZE = 13;

function toPixel(point: { x: number; y: number }) {
  return {
    px:
      PAD.left +
      ((point.x - DOMAIN.xMin) / (DOMAIN.xMax - DOMAIN.xMin)) * PLOT.width,
    py:
      PAD.top +
      (1 - (point.y - DOMAIN.yMin) / (DOMAIN.yMax - DOMAIN.yMin)) * PLOT.height,
  };
}

function toData(px: number, py: number): Point {
  const clamp = (value: number, low: number, high: number) =>
    Math.min(high, Math.max(low, Math.round(value)));
  return {
    x: clamp(
      DOMAIN.xMin +
        ((px - PAD.left) / PLOT.width) * (DOMAIN.xMax - DOMAIN.xMin),
      DOMAIN.xMin,
      DOMAIN.xMax,
    ),
    y: clamp(
      DOMAIN.yMin +
        (1 - (py - PAD.top) / PLOT.height) * (DOMAIN.yMax - DOMAIN.yMin),
      DOMAIN.yMin,
      DOMAIN.yMax,
    ),
  };
}

export function OnePresentation({
  initialRate = 0.5,
  initialRadius = 1,
}: {
  initialRate?: number;
  initialRadius?: number;
}) {
  const [person, setPerson] = useState<Point>(PRESENTED_PERSON);
  const [rate, setRate] = useState(initialRate);
  const [radius, setRadius] = useState(initialRadius);
  const [answer, setAnswer] = useState<Presentation | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const dragging = useRef(false);

  useEffect(() => {
    const timer = setTimeout(async () => {
      try {
        setAnswer(
          await presentOnePerson(
            HAND_PLACED_CHAIN,
            HAND_PLACED_CHAIN.length,
            1,
            person,
            rate,
            radius,
          ),
        );
        setMessage(null);
      } catch (error) {
        if (error instanceof ApiError) setMessage(error.message);
        else setMessage("Something went wrong.");
      }
    }, 40);
    return () => clearTimeout(timer);
  }, [person, rate, radius]);

  const eventToData = useCallback((clientX: number, clientY: number) => {
    const rect = svgRef.current!.getBoundingClientRect();
    return toData(
      ((clientX - rect.left) / rect.width) * VIEW.width,
      ((clientY - rect.top) / rect.height) * VIEW.height,
    );
  }, []);

  if (!answer) {
    return (
      <p className="text-sm text-slate-500 dark:text-slate-400">
        {message ?? "…"}
      </p>
    );
  }

  const personAt = toPixel(person);

  return (
    <div>
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pb-2">
        <label className={SLIDER_LABEL_CLASS}>
          Step
          <input
            type="range"
            min={0.05}
            max={1}
            step={0.05}
            value={rate}
            onChange={(event) => setRate(Number(event.target.value))}
            className="w-28 accent-indigo-600"
          />
          <span className="w-10 font-mono text-sm">{rate.toFixed(2)}</span>
        </label>
        <label className={SLIDER_LABEL_CLASS}>
          Reach, in cells
          <input
            type="range"
            min={0}
            max={3}
            step={0.1}
            value={radius}
            onChange={(event) => setRadius(Number(event.target.value))}
            className="w-28 accent-amber-500"
          />
          <span className="w-10 font-mono text-sm">{radius.toFixed(1)}</span>
        </label>
        <button
          onClick={() => setPerson(PRESENTED_PERSON)}
          className="text-sm text-indigo-600 underline-offset-4 hover:underline dark:text-indigo-400"
        >
          put the person back
        </button>
      </div>

      <svg
        ref={svgRef}
        viewBox={`0 0 ${VIEW.width} ${VIEW.height}`}
        className="w-full touch-none select-none rounded-lg bg-slate-50 dark:bg-slate-950"
        onPointerMove={(event) => {
          if (!dragging.current) return;
          setPerson(eventToData(event.clientX, event.clientY));
        }}
        onPointerUp={() => {
          dragging.current = false;
        }}
        onPointerLeave={() => {
          dragging.current = false;
        }}
      >
        {answer.units.map((cell, index) => {
          const before = toPixel({ x: cell.before_x, y: cell.before_y });
          const next = answer.units[index + 1];
          if (!next) return null;
          const beside = toPixel({ x: next.before_x, y: next.before_y });
          return (
            <line
              key={`join${index}`}
              x1={before.px}
              y1={before.py}
              x2={beside.px}
              y2={beside.py}
              className="stroke-slate-300 dark:stroke-slate-700"
              strokeWidth={2}
              strokeDasharray="5 4"
            />
          );
        })}

        {answer.units.map((cell, index) => {
          const before = toPixel({ x: cell.before_x, y: cell.before_y });
          const after = toPixel({ x: cell.after_x, y: cell.after_y });
          const colour = cellColour(cell.row, cell.column, 3, 1);
          return (
            <g key={`cell${index}`}>
              <line
                x1={before.px}
                y1={before.py}
                x2={personAt.px}
                y2={personAt.py}
                stroke={colour}
                strokeWidth={1}
                strokeDasharray="2 4"
                opacity={0.55}
              />
              <line
                x1={before.px}
                y1={before.py}
                x2={after.px}
                y2={after.py}
                stroke={colour}
                strokeWidth={3}
              />
              <rect
                x={before.px - CELL_SIZE / 2}
                y={before.py - CELL_SIZE / 2}
                width={CELL_SIZE}
                height={CELL_SIZE}
                fill="none"
                stroke={colour}
                strokeWidth={2}
                opacity={0.5}
              />
              <rect
                x={after.px - CELL_SIZE / 2}
                y={after.py - CELL_SIZE / 2}
                width={CELL_SIZE}
                height={CELL_SIZE}
                fill={colour}
                stroke="currentColor"
                className={
                  cell.is_winner
                    ? "text-slate-900 dark:text-slate-100"
                    : "text-slate-400 dark:text-slate-600"
                }
                strokeWidth={cell.is_winner ? 3 : 1.5}
              />
              <text
                x={after.px}
                y={after.py - 12}
                textAnchor="middle"
                className="fill-slate-500 text-[10px] font-medium dark:fill-slate-400"
              >
                {cell.is_winner ? "winner" : `${cell.score.toFixed(3)}`}
              </text>
            </g>
          );
        })}

        <circle
          cx={personAt.px}
          cy={personAt.py}
          r={7}
          className="cursor-grab fill-slate-800 stroke-white dark:fill-slate-100 dark:stroke-slate-900"
          strokeWidth={2}
          onPointerDown={(event) => {
            dragging.current = true;
            svgRef.current?.setPointerCapture(event.pointerId);
          }}
        />
        <text
          x={personAt.px}
          y={personAt.py + 22}
          textAnchor="middle"
          className="fill-slate-600 text-[11px] font-medium dark:fill-slate-300"
        >
          {`the person (${person.x}, ${person.y})`}
        </text>

        <text
          x={PAD.left + PLOT.width / 2}
          y={VIEW.height - 6}
          textAnchor="middle"
          className="fill-slate-500 text-xs font-medium dark:fill-slate-400"
        >
          Height (cm)
        </text>
        <text
          x={14}
          y={PAD.top + PLOT.height / 2}
          textAnchor="middle"
          transform={`rotate(-90 14 ${PAD.top + PLOT.height / 2})`}
          className="fill-slate-500 text-xs font-medium dark:fill-slate-400"
        >
          Weight (kg)
        </text>
      </svg>

      <div className="mt-3 overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left dark:border-slate-800">
              {[
                "cell",
                "steps from the winner",
                "share of the step",
                "was at",
                "ended at",
                "distance before",
                "distance after",
              ].map((heading) => (
                <th
                  key={heading}
                  className="py-2 pr-4 font-semibold text-slate-600 last:pr-0 dark:text-slate-400"
                >
                  {heading}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {answer.units.map((cell, index) => (
              <tr
                key={index}
                className="border-b border-slate-100 last:border-0 dark:border-slate-800/60"
              >
                <td className="py-2 pr-4 font-mono text-slate-800 dark:text-slate-200">
                  {`(${cell.row}, ${cell.column})`}
                  {cell.is_winner && (
                    <span className="ml-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                      winner
                    </span>
                  )}
                </td>
                <td className="py-2 pr-4 font-mono text-slate-800 dark:text-slate-200">
                  {cell.grid_distance.toFixed(2)}
                </td>
                <td className="py-2 pr-4 font-mono text-slate-800 dark:text-slate-200">
                  {cell.score.toFixed(4)}
                </td>
                <td className="py-2 pr-4 font-mono text-slate-800 dark:text-slate-200">
                  {`(${cell.before_x.toFixed(1)}, ${cell.before_y.toFixed(1)})`}
                </td>
                <td className="py-2 pr-4 font-mono text-slate-800 dark:text-slate-200">
                  {`(${cell.after_x.toFixed(2)}, ${cell.after_y.toFixed(2)})`}
                </td>
                <td className="py-2 pr-4 font-mono text-slate-800 dark:text-slate-200">
                  {cell.distance_before.toFixed(3)}
                </td>
                <td
                  className={
                    "py-2 font-mono " +
                    (cell.distance_after < cell.distance_before
                      ? "text-emerald-700 dark:text-emerald-400"
                      : "text-slate-800 dark:text-slate-200")
                  }
                >
                  {cell.distance_after.toFixed(3)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-2 text-xs text-slate-500 dark:text-slate-500">
        {`${answer.moving_units} of the 3 cells took at least a thousandth of the winner's step.`}
      </p>
      {message && (
        <p className="mt-2 text-sm text-amber-600 dark:text-amber-400">
          {message}
        </p>
      )}
    </div>
  );
}
