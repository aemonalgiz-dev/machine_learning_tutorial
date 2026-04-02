"use client";

// The validation curve, with its disagreement drawn in.
//
// Every degree from the API carries two numbers, the mean held-out R squared
// across five folds and the spread between the best and worst fold. The
// indigo dot is the mean and the amber band is the disagreement. Past the
// sweet spot the band explodes downward so violently that the frame has to
// clamp it, and a small downward arrow marks each degree where a value kept
// falling below the bottom edge. Every score comes from the API; only the
// pixel placement happens in the browser.

import { useEffect, useState } from "react";
import {
  ApiError,
  DegreeValidation,
  Point,
  traceValidationCurve,
} from "@/lib/api";

const VIEW_WIDTH = 520;
const VIEW_HEIGHT = 320;
const PLOT_LEFT = 46;
const PLOT_RIGHT = VIEW_WIDTH - 16;
const PLOT_TOP = 16;
const PLOT_BOTTOM = VIEW_HEIGHT - 36;
const SCORE_TOP = 1.05;
const SCORE_BOTTOM = -1;
const GRID_SCORES = [1, 0, -1];

// The fifteen noisy throw points the evaluation pages share.
const NOISY_THROW: Point[] = [
  { x: 0.0, y: 0.7 }, { x: 0.29, y: 5.2 }, { x: 0.57, y: 9.5 }, { x: 0.86, y: 13.0 },
  { x: 1.14, y: 16.9 }, { x: 1.43, y: 18.1 }, { x: 1.71, y: 19.4 }, { x: 2.0, y: 21.0 },
  { x: 2.29, y: 19.6 }, { x: 2.57, y: 19.1 }, { x: 2.86, y: 16.8 }, { x: 3.14, y: 13.6 },
  { x: 3.43, y: 11.1 }, { x: 3.71, y: 6.2 }, { x: 4.0, y: 1.2 },
];

interface DegreeMark {
  degree: number;
  horizontalPixel: number;
  meanPixel: number;
  bandTopPixel: number;
  bandBottomPixel: number;
  clamped: boolean;
}

function pixelForScore(score: number): number {
  return (
    PLOT_TOP +
    ((SCORE_TOP - score) / (SCORE_TOP - SCORE_BOTTOM)) *
      (PLOT_BOTTOM - PLOT_TOP)
  );
}

function clampForDrawing(score: number): number {
  return Math.max(Math.min(score, SCORE_TOP), SCORE_BOTTOM);
}

export function ValidationCurveChart() {
  const [validations, setValidations] = useState<DegreeValidation[] | null>(
    null,
  );
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const response = await traceValidationCurve(NOISY_THROW);
        setValidations(response.validations);
      } catch (error) {
        if (error instanceof ApiError) setMessage(error.message);
        else setMessage("Something went wrong.");
      }
    })();
  }, []);

  let marks: DegreeMark[] = [];
  if (validations && validations.length > 0) {
    const lastPosition = Math.max(validations.length - 1, 1);
    marks = validations.map((validation, validationIndex) => {
      const bandTop = validation.mean_r_squared + validation.spread / 2;
      const bandBottom = validation.mean_r_squared - validation.spread / 2;
      return {
        degree: validation.degree,
        horizontalPixel:
          PLOT_LEFT +
          (validationIndex / lastPosition) * (PLOT_RIGHT - PLOT_LEFT),
        meanPixel: pixelForScore(clampForDrawing(validation.mean_r_squared)),
        bandTopPixel: pixelForScore(clampForDrawing(bandTop)),
        bandBottomPixel: pixelForScore(clampForDrawing(bandBottom)),
        clamped: bandBottom < SCORE_BOTTOM,
      };
    });
  }

  const degreeTwo = validations
    ? (validations.find((validation) => validation.degree === 2) ?? null)
    : null;
  const degreeEight = validations
    ? (validations.find((validation) => validation.degree === 8) ?? null)
    : null;

  return (
    <div>
      <svg
        viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}
        className="mx-auto w-full max-w-lg rounded-lg bg-slate-50 dark:bg-slate-950"
      >
        {GRID_SCORES.map((gridScore) => (
          <g key={`grid${gridScore}`}>
            <line
              x1={PLOT_LEFT}
              y1={pixelForScore(gridScore)}
              x2={PLOT_RIGHT}
              y2={pixelForScore(gridScore)}
              stroke="currentColor"
              className="text-slate-200 dark:text-slate-800"
              strokeWidth={1}
            />
            <text
              x={PLOT_LEFT - 8}
              y={pixelForScore(gridScore) + 3}
              textAnchor="end"
              className="fill-slate-500 text-xs font-medium dark:fill-slate-400"
            >
              {gridScore.toFixed(1)}
            </text>
          </g>
        ))}

        <line
          x1={PLOT_LEFT}
          y1={PLOT_BOTTOM}
          x2={PLOT_RIGHT}
          y2={PLOT_BOTTOM}
          stroke="currentColor"
          className="text-slate-300 dark:text-slate-700"
          strokeWidth={1}
        />

        <text
          x={PLOT_LEFT + 6}
          y={PLOT_TOP + 12}
          className="fill-slate-500 text-xs font-medium dark:fill-slate-400"
        >
          Mean held-out R²
        </text>

        {marks.map((mark) => (
          <line
            key={`band${mark.degree}`}
            x1={mark.horizontalPixel}
            y1={mark.bandTopPixel}
            x2={mark.horizontalPixel}
            y2={mark.bandBottomPixel}
            stroke="currentColor"
            className="text-amber-400/70 dark:text-amber-500/60"
            strokeWidth={7}
          />
        ))}

        {marks.length > 1 && (
          <polyline
            points={marks
              .map((mark) => `${mark.horizontalPixel},${mark.meanPixel}`)
              .join(" ")}
            fill="none"
            stroke="currentColor"
            className="text-indigo-500 dark:text-indigo-400"
            strokeWidth={1.5}
          />
        )}

        {marks.map((mark) => (
          <circle
            key={`mean${mark.degree}`}
            cx={mark.horizontalPixel}
            cy={mark.meanPixel}
            r={4}
            className="fill-indigo-500 stroke-white dark:fill-indigo-400 dark:stroke-slate-900"
            strokeWidth={1.5}
          />
        ))}

        {marks
          .filter((mark) => mark.clamped)
          .map((mark) => (
            <path
              key={`arrow${mark.degree}`}
              d={`M ${mark.horizontalPixel - 4} ${PLOT_BOTTOM + 3} L ${mark.horizontalPixel + 4} ${PLOT_BOTTOM + 3} L ${mark.horizontalPixel} ${PLOT_BOTTOM + 10} Z`}
              className="fill-amber-500 dark:fill-amber-400"
            />
          ))}

        {marks.map((mark) => (
          <text
            key={`degree${mark.degree}`}
            x={mark.horizontalPixel}
            y={PLOT_BOTTOM + 24}
            textAnchor="middle"
            className="fill-slate-500 text-xs font-medium dark:fill-slate-400"
          >
            {mark.degree.toFixed(0)}
          </text>
        ))}
      </svg>

      <p className="mt-2 text-center text-xs text-slate-500 dark:text-slate-500">
        The amber band is how far the five folds disagreed at each degree, and
        where it explodes the mean above it stops meaning anything.
      </p>

      <div className="mt-3 grid grid-cols-3 gap-3">
        <Stat
          label="Mean at degree 2"
          value={degreeTwo ? degreeTwo.mean_r_squared.toFixed(3) : "…"}
        />
        <Stat
          label="Spread at degree 2"
          value={degreeTwo ? degreeTwo.spread.toFixed(3) : "…"}
        />
        <Stat
          label="Spread at degree 8"
          value={degreeEight ? degreeEight.spread.toFixed(1) : "…"}
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
