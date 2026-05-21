"use client";

// The two sums that R squared compares, drawn as literal squares.
//
// Both panels scatter the same five worked people, heights across and weights
// up, on one shared pixel scale so a square really is square. On the left the
// model is a flat line at the mean weight, and each rose square has a side
// equal to the vertical miss, which makes its area that miss squared. On the
// right the model is the least squares line and the indigo squares are built
// the same way. The rose areas total 176, the indigo areas total 16, and
// R squared is one minus their ratio. The fit comes from the API; only the
// drawing happens in the browser.

import { useEffect, useState } from "react";
import {
  ApiError,
  FittedLine,
  LineFit,
  Point,
  fitSimpleLinearRegression,
} from "@/lib/api";

// The regression page's five worked people.
const FIVE_PEOPLE: Point[] = [
  { x: 160, y: 58 },
  { x: 165, y: 66 },
  { x: 170, y: 68 },
  { x: 175, y: 74 },
  { x: 180, y: 74 },
];

const PIXELS_PER_UNIT = 8;
const HEIGHT_LOW = 160;
const HEIGHT_HIGH = 180;
const WEIGHT_LOW = 55;
const WEIGHT_HIGH = 80;
const HEIGHT_MIDDLE = (HEIGHT_LOW + HEIGHT_HIGH) / 2;

const PLOT_WIDTH = (HEIGHT_HIGH - HEIGHT_LOW) * PIXELS_PER_UNIT;
const PLOT_HEIGHT = (WEIGHT_HIGH - WEIGHT_LOW) * PIXELS_PER_UNIT;
const PLOT_TOP = 30;
const LEFT_PANEL_PLOT_LEFT = 40;
const RIGHT_PANEL_PLOT_LEFT = LEFT_PANEL_PLOT_LEFT + PLOT_WIDTH + 46;
const VIEW_WIDTH = RIGHT_PANEL_PLOT_LEFT + PLOT_WIDTH + 8;
const VIEW_HEIGHT = PLOT_TOP + PLOT_HEIGHT + 36;

const HEIGHT_TICKS = [160, 170, 180];
const WEIGHT_TICKS = [55, 65, 75];

function pixelForHeight(height: number, plotLeft: number): number {
  return plotLeft + (height - HEIGHT_LOW) * PIXELS_PER_UNIT;
}

function pixelForWeight(weight: number): number {
  return PLOT_TOP + (WEIGHT_HIGH - weight) * PIXELS_PER_UNIT;
}

function weightOnLine(line: FittedLine, height: number): number {
  if (line.x_end === line.x_start) return line.y_start;
  return (
    line.y_start +
    ((height - line.x_start) * (line.y_end - line.y_start)) /
      (line.x_end - line.x_start)
  );
}

interface SquareGeometry {
  leftPixel: number;
  topPixel: number;
  sidePixels: number;
}

// The square whose side is the vertical gap between a person and the model at
// that height. It hangs off the point toward the model line, and it grows
// sideways toward the middle of the panel so it stays inside the frame.
function squareTowardModel(
  person: Point,
  modelWeight: number,
  plotLeft: number,
): SquareGeometry | null {
  const side = Math.abs(person.y - modelWeight);
  if (side === 0) return null;
  const leftHeight = person.x < HEIGHT_MIDDLE ? person.x : person.x - side;
  const topWeight = Math.max(person.y, modelWeight);
  return {
    leftPixel: pixelForHeight(leftHeight, plotLeft),
    topPixel: pixelForWeight(topWeight),
    sidePixels: side * PIXELS_PER_UNIT,
  };
}

export function SquaresChart() {
  const [fit, setFit] = useState<LineFit | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setFit(await fitSimpleLinearRegression(FIVE_PEOPLE));
      } catch (error) {
        if (error instanceof ApiError) setMessage(error.message);
        else setMessage("Something went wrong.");
      }
    })();
  }, []);

  let meanSquares: SquareGeometry[] = [];
  let lineSquares: SquareGeometry[] = [];

  if (fit) {
    meanSquares = FIVE_PEOPLE.map((person) =>
      squareTowardModel(person, fit.mean_target, LEFT_PANEL_PLOT_LEFT),
    ).filter((square): square is SquareGeometry => square !== null);
    lineSquares = FIVE_PEOPLE.map((person) =>
      squareTowardModel(
        person,
        weightOnLine(fit.line, person.x),
        RIGHT_PANEL_PLOT_LEFT,
      ),
    ).filter((square): square is SquareGeometry => square !== null);
  }

  return (
    <div>
      <svg
        viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}
        className="mx-auto w-full max-w-xl select-none rounded-lg bg-slate-50 dark:bg-slate-950"
      >
        <PanelFrame title="Squares from the mean" plotLeft={LEFT_PANEL_PLOT_LEFT} />
        <PanelFrame title="Squares from the line" plotLeft={RIGHT_PANEL_PLOT_LEFT} />

        <text
          transform={`rotate(-90 14 ${PLOT_TOP + PLOT_HEIGHT / 2})`}
          x={14}
          y={PLOT_TOP + PLOT_HEIGHT / 2}
          textAnchor="middle"
          className="fill-slate-500 text-xs font-medium dark:fill-slate-400"
        >
          weight (kg)
        </text>

        {meanSquares.map((square, index) => (
          <rect
            key={`mean${index}`}
            x={square.leftPixel}
            y={square.topPixel}
            width={square.sidePixels}
            height={square.sidePixels}
            className="fill-rose-500/25 stroke-rose-500 dark:fill-rose-400/25 dark:stroke-rose-400"
            strokeWidth={1}
          />
        ))}
        {fit && (
          <line
            x1={LEFT_PANEL_PLOT_LEFT}
            y1={pixelForWeight(fit.mean_target)}
            x2={LEFT_PANEL_PLOT_LEFT + PLOT_WIDTH}
            y2={pixelForWeight(fit.mean_target)}
            stroke="currentColor"
            className="text-rose-500 dark:text-rose-400"
            strokeWidth={1.5}
          />
        )}

        {lineSquares.map((square, index) => (
          <rect
            key={`line${index}`}
            x={square.leftPixel}
            y={square.topPixel}
            width={square.sidePixels}
            height={square.sidePixels}
            className="fill-indigo-500/25 stroke-indigo-500 dark:fill-indigo-400/25 dark:stroke-indigo-400"
            strokeWidth={1}
          />
        ))}
        {fit && (
          <line
            x1={pixelForHeight(fit.line.x_start, RIGHT_PANEL_PLOT_LEFT)}
            y1={pixelForWeight(fit.line.y_start)}
            x2={pixelForHeight(fit.line.x_end, RIGHT_PANEL_PLOT_LEFT)}
            y2={pixelForWeight(fit.line.y_end)}
            stroke="currentColor"
            className="text-indigo-500 dark:text-indigo-400"
            strokeWidth={1.5}
          />
        )}

        <PeopleDots plotLeft={LEFT_PANEL_PLOT_LEFT} />
        <PeopleDots plotLeft={RIGHT_PANEL_PLOT_LEFT} />
      </svg>

      <p className="mt-2 text-center text-xs text-slate-500 dark:text-slate-500">
        The rose boxes on the left add up to 176, the indigo boxes on the right
        add up to 16, and the score is one minus their ratio.
      </p>

      <div className="mt-3 grid grid-cols-3 gap-3">
        <Stat
          label="TSS from the mean"
          value={fit ? fit.tss.toFixed(0) : "…"}
        />
        <Stat
          label="RSS from the line"
          value={fit ? fit.rss.toFixed(0) : "…"}
        />
        <Stat
          label="R squared"
          value={fit ? fit.r_squared.toFixed(3) : "…"}
        />
      </div>

      {message && (
        <p className="mt-3 text-sm text-amber-600 dark:text-amber-400">{message}</p>
      )}
    </div>
  );
}

function PanelFrame({ title, plotLeft }: { title: string; plotLeft: number }) {
  return (
    <g>
      <text
        x={plotLeft + PLOT_WIDTH / 2}
        y={16}
        textAnchor="middle"
        className="fill-slate-600 text-xs font-semibold dark:fill-slate-300"
      >
        {title}
      </text>

      {HEIGHT_TICKS.map((tick) => (
        <g key={`height${tick}`}>
          <line
            x1={pixelForHeight(tick, plotLeft)}
            y1={PLOT_TOP}
            x2={pixelForHeight(tick, plotLeft)}
            y2={PLOT_TOP + PLOT_HEIGHT}
            stroke="currentColor"
            className="text-slate-200 dark:text-slate-800"
            strokeWidth={1}
          />
          <text
            x={pixelForHeight(tick, plotLeft)}
            y={PLOT_TOP + PLOT_HEIGHT + 14}
            textAnchor="middle"
            className="fill-slate-400 text-[10px] dark:fill-slate-500"
          >
            {tick}
          </text>
        </g>
      ))}

      {WEIGHT_TICKS.map((tick) => (
        <g key={`weight${tick}`}>
          <line
            x1={plotLeft}
            y1={pixelForWeight(tick)}
            x2={plotLeft + PLOT_WIDTH}
            y2={pixelForWeight(tick)}
            stroke="currentColor"
            className="text-slate-200 dark:text-slate-800"
            strokeWidth={1}
          />
          <text
            x={plotLeft - 6}
            y={pixelForWeight(tick) + 3}
            textAnchor="end"
            className="fill-slate-400 text-[10px] dark:fill-slate-500"
          >
            {tick}
          </text>
        </g>
      ))}

      <rect
        x={plotLeft}
        y={PLOT_TOP}
        width={PLOT_WIDTH}
        height={PLOT_HEIGHT}
        fill="none"
        stroke="currentColor"
        className="text-slate-200 dark:text-slate-800"
        strokeWidth={1}
      />

      <text
        x={plotLeft + PLOT_WIDTH / 2}
        y={PLOT_TOP + PLOT_HEIGHT + 30}
        textAnchor="middle"
        className="fill-slate-500 text-xs font-medium dark:fill-slate-400"
      >
        height (cm)
      </text>
    </g>
  );
}

function PeopleDots({ plotLeft }: { plotLeft: number }) {
  return (
    <g>
      {FIVE_PEOPLE.map((person) => (
        <circle
          key={`person${person.x}`}
          cx={pixelForHeight(person.x, plotLeft)}
          cy={pixelForWeight(person.y)}
          r={3.5}
          className="fill-slate-700 stroke-white dark:fill-slate-200 dark:stroke-slate-900"
          strokeWidth={1}
        />
      ))}
    </g>
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
