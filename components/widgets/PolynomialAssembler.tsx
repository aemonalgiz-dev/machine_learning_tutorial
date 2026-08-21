"use client";

// A polynomial assembled by hand out of the shapes it is made of.
//
// The five basic shapes, 1, t, t², t³ and t⁴, are drawn along the top,
// unscaled. Each slider below scales one of them, the scaled shapes are
// drawn faintly in their own colours, and the bold line is their sum. The
// sliders start on the coefficients the library recovered from the ideal
// throw through the API, 0, 20, −4.9, 0, 0, so the starting sum is the ball's
// arc with nothing on the cubic or the quartic. Every position after that is
// the reader's, and the point is that the curve only ever moves by having one
// of these shapes added to it in a different amount. The fitted coefficients
// enter as multiply-and-add, which is what makes this a linear model however
// bent the result.

import { useEffect, useState } from "react";
import { ApiError, Point, fitPolynomial } from "@/lib/api";

const IDEAL_THROW: Point[] = [
  { x: 0, y: 0 },
  { x: 1, y: 15.1 },
  { x: 2, y: 20.4 },
  { x: 3, y: 15.9 },
  { x: 4, y: 1.6 },
];

const VIEW = { width: 640, height: 380 };
const PAD = { left: 48, right: 16, top: 16, bottom: 44 };
const PLOT = {
  width: VIEW.width - PAD.left - PAD.right,
  height: VIEW.height - PAD.top - PAD.bottom,
};
const DOMAIN = { tMin: 0, tMax: 4, hMin: -12, hMax: 30 };
const SAMPLES = 81;

interface Shape {
  label: string;
  power: number;
  min: number;
  max: number;
  step: number;
  stroke: string;
  accent: string;
}

// Slider ranges shrink with the power, since t⁴ reaches 256 at the far end.
const SHAPES: Shape[] = [
  { label: "1", power: 0, min: -10, max: 10, step: 0.1, stroke: "text-slate-400", accent: "accent-slate-500" },
  { label: "t", power: 1, min: -30, max: 30, step: 0.1, stroke: "text-indigo-500", accent: "accent-indigo-600" },
  { label: "t²", power: 2, min: -10, max: 10, step: 0.05, stroke: "text-amber-500", accent: "accent-amber-500" },
  { label: "t³", power: 3, min: -2, max: 2, step: 0.01, stroke: "text-emerald-500", accent: "accent-emerald-600" },
  { label: "t⁴", power: 4, min: -0.5, max: 0.5, step: 0.005, stroke: "text-rose-500", accent: "accent-rose-500" },
];

const TIMES = Array.from({ length: SAMPLES }, (_, index) => DOMAIN.tMin + ((DOMAIN.tMax - DOMAIN.tMin) * index) / (SAMPLES - 1));

function toPixel(time: number, height: number) {
  const px = PAD.left + ((time - DOMAIN.tMin) / (DOMAIN.tMax - DOMAIN.tMin)) * PLOT.width;
  const raw = PAD.top + (1 - (height - DOMAIN.hMin) / (DOMAIN.hMax - DOMAIN.hMin)) * PLOT.height;
  return { px, py: Math.min(PAD.top + PLOT.height, Math.max(PAD.top, raw)) };
}

function pathOf(heights: number[]): string {
  return heights
    .map((height, index) => {
      const { px, py } = toPixel(TIMES[index], height);
      return `${index === 0 ? "M" : "L"} ${px.toFixed(1)} ${py.toFixed(1)}`;
    })
    .join(" ");
}

export function PolynomialAssembler() {
  const [weights, setWeights] = useState<number[]>([0, 20, -4.9, 0, 0]);
  const [fitted, setFitted] = useState<number[] | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const fit = await fitPolynomial(IDEAL_THROW, 2);
        const named = Object.fromEntries(fit.coefficients.map((each) => [each.name, each.value]));
        const recovered = [fit.intercept, named["t"], named["t^2"], 0, 0];
        setFitted(recovered);
        setWeights(recovered);
      } catch (error) {
        if (error instanceof ApiError) setMessage(error.message);
        else setMessage("Something went wrong.");
      }
    })();
  }, []);

  const scaledShapes = SHAPES.map((shape, index) =>
    TIMES.map((time) => weights[index] * Math.pow(time, shape.power)),
  );
  const sum = TIMES.map((_, sample) =>
    scaledShapes.reduce((total, shape) => total + shape[sample], 0),
  );

  return (
    <div>
      <div className="grid grid-cols-5 gap-2 pb-3">
        {SHAPES.map((shape) => (
          <Gallery key={shape.label} shape={shape} />
        ))}
      </div>

      <svg viewBox={`0 0 ${VIEW.width} ${VIEW.height}`} className="w-full select-none rounded-lg bg-slate-50 dark:bg-slate-950">
        {[-10, 0, 10, 20, 30].map((tick) => {
          const { py } = toPixel(0, tick);
          return (
            <g key={`h-${tick}`}>
              <line x1={PAD.left} y1={py} x2={PAD.left + PLOT.width} y2={py} stroke="currentColor" className={tick === 0 ? "text-slate-300 dark:text-slate-700" : "text-slate-200 dark:text-slate-800"} />
              <text x={PAD.left - 8} y={py + 4} textAnchor="end" className="fill-slate-400 text-[11px]">{tick}</text>
            </g>
          );
        })}
        {[0, 1, 2, 3, 4].map((tick) => {
          const { px } = toPixel(tick, 0);
          return (
            <text key={`t-${tick}`} x={px} y={PAD.top + PLOT.height + 18} textAnchor="middle" className="fill-slate-400 text-[11px]">{tick}</text>
          );
        })}

        {IDEAL_THROW.map((point, index) => {
          const { px, py } = toPixel(point.x, point.y);
          return <circle key={`pt-${index}`} cx={px} cy={py} r={5} className="fill-slate-300 dark:fill-slate-700" />;
        })}

        {scaledShapes.map((heights, index) => (
          <path key={SHAPES[index].label} d={pathOf(heights)} fill="none" stroke="currentColor" className={SHAPES[index].stroke} strokeWidth={1.5} strokeDasharray="4 3" opacity={0.8} />
        ))}
        <path d={pathOf(sum)} fill="none" stroke="currentColor" className="text-slate-900 dark:text-slate-100" strokeWidth={3} />

        <text x={PAD.left + PLOT.width / 2} y={VIEW.height - 6} textAnchor="middle" className="fill-slate-500 text-xs font-medium dark:fill-slate-400">Time (s)</text>
      </svg>

      <p className="mt-2 text-center text-xs text-slate-500 dark:text-slate-500">
        Dashed lines are the scaled shapes, and a shape that leaves the frame
        runs along its edge. The solid line is their sum, and the grey dots are
        the ideal throw.
      </p>

      <div className="mt-3 grid gap-x-4 gap-y-2 sm:grid-cols-2">
        {SHAPES.map((shape, index) => (
          <label key={shape.label} className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
            <span className="w-14 font-mono">× {shape.label}</span>
            <input
              type="range"
              min={shape.min}
              max={shape.max}
              step={shape.step}
              value={weights[index]}
              onChange={(event) =>
                setWeights((current) => current.map((weight, position) => (position === index ? Number(event.target.value) : weight)))
              }
              className={`flex-1 ${shape.accent}`}
            />
            <span className="w-14 text-right font-mono">{weights[index].toFixed(shape.step < 0.05 ? 3 : 2)}</span>
          </label>
        ))}
        <div className="flex items-center">
          <button
            onClick={() => fitted && setWeights(fitted)}
            disabled={!fitted}
            className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-100 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
          >
            Back to the fitted throw
          </button>
        </div>
      </div>

      {message && (
        <p className="mt-3 text-sm text-amber-600 dark:text-amber-400">{message}</p>
      )}
    </div>
  );
}

const GALLERY = { width: 100, height: 60 };

// One basic shape, drawn unscaled over its own vertical range so that t⁴
// and 1 are both legible in a box the same size.
function Gallery({ shape }: { shape: Shape }) {
  const heights = TIMES.map((time) => Math.pow(time, shape.power));
  const top = Math.max(...heights);
  const path = heights
    .map((height, index) => {
      const px = 6 + (index / (SAMPLES - 1)) * (GALLERY.width - 12);
      const py = GALLERY.height - 8 - (height / (top || 1)) * (GALLERY.height - 20);
      return `${index === 0 ? "M" : "L"} ${px.toFixed(1)} ${py.toFixed(1)}`;
    })
    .join(" ");
  return (
    <div className="rounded-md border border-slate-200 bg-white p-1 dark:border-slate-800 dark:bg-slate-900">
      <svg viewBox={`0 0 ${GALLERY.width} ${GALLERY.height}`} className="w-full">
        <path d={path} fill="none" stroke="currentColor" className={shape.stroke} strokeWidth={2} />
        <text x={GALLERY.width / 2} y={GALLERY.height - 1} textAnchor="middle" className="fill-slate-500 text-[10px] dark:fill-slate-400">
          {shape.label}
        </text>
      </svg>
    </div>
  );
}
