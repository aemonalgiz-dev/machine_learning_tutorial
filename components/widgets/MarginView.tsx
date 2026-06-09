"use client";

// The widest corridor, drawn where its width can be read off.
//
// Under the linear kernel the boundary is an ordinary line through the
// clinic, so the weight vector can be recovered from the multipliers and the
// margin is a strip either side of it. The fever-only clinic is used because
// a straight line handles it, which is the only case where the corridor is
// a corridor. The ringed patients are the support vectors, the number line
// beneath the plot is every patient's decision value with the margin's
// edges at plus and minus one, and the capacity buttons change the price of
// sitting inside the strip. The API fits and measures; the browser draws.

import { useEffect, useState } from "react";
import { ApiError, MarginFit, fetchMargin } from "@/lib/concepts/kernel-trick";
import { BOUNDARY_COLOUR, FEVER_ONLY, MARGIN_COLOUR } from "./kernelTrickFixtures";

const VIEW = { width: 640, height: 400 };
const PAD = { left: 56, right: 16, top: 16, bottom: 40 };
const PLOT = { width: VIEW.width - PAD.left - PAD.right, height: VIEW.height - PAD.top - PAD.bottom };
const LINE = { width: 640, height: 64 };
const DOMAIN = { xMin: 36, xMax: 41, yMin: 55, yMax: 145 };
const CAPACITIES = [0.1, 1, 10, 100];

const cache = new Map<number, Promise<MarginFit>>();
function marginFor(capacity: number): Promise<MarginFit> {
  const found = cache.get(capacity);
  if (found) return found;
  const pending = fetchMargin(FEVER_ONLY, capacity).catch((error) => {
    cache.delete(capacity);
    throw error;
  });
  cache.set(capacity, pending);
  return pending;
}

function plotX(value: number) {
  return PAD.left + ((value - DOMAIN.xMin) / (DOMAIN.xMax - DOMAIN.xMin)) * PLOT.width;
}
function plotY(value: number) {
  return PAD.top + (1 - (value - DOMAIN.yMin) / (DOMAIN.yMax - DOMAIN.yMin)) * PLOT.height;
}

export function MarginView({ initialCapacity = 10 }: { initialCapacity?: number }) {
  const [capacity, setCapacity] = useState(initialCapacity);
  const [margin, setMargin] = useState<MarginFit | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const answer = await marginFor(capacity);
        if (!cancelled) {
          setMargin(answer);
          setMessage(null);
        }
      } catch (error) {
        if (cancelled) return;
        if (error instanceof ApiError) setMessage(error.message);
        else setMessage("Something went wrong.");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [capacity]);

  const support = new Set(margin?.fit.support_positions ?? []);
  const decisions = margin?.fit.decision_values ?? [];
  const reach = Math.max(1.5, ...decisions.map((value) => Math.abs(value))) * 1.1;
  const lineX = (value: number) =>
    PAD.left + ((value + reach) / (2 * reach)) * (LINE.width - PAD.left - PAD.right);

  const segment = (line: { x1: number; y1: number; x2: number; y2: number }, colour: string, dashed: boolean) => (
    <line
      x1={plotX(line.x1)}
      y1={plotY(line.y1)}
      x2={plotX(line.x2)}
      y2={plotY(line.y2)}
      stroke={colour}
      strokeWidth={dashed ? 1.5 : 2.5}
      strokeDasharray={dashed ? "6 4" : undefined}
    />
  );

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
        capacity, the price of a violation
        <span className="flex gap-1 rounded-md border border-slate-300 p-0.5 dark:border-slate-700">
          {CAPACITIES.map((option) => (
            <button
              key={option}
              onClick={() => setCapacity(option)}
              className={
                "rounded px-3 py-1 text-sm font-medium transition " +
                (capacity === option
                  ? "bg-indigo-600 text-white"
                  : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800")
              }
            >
              {option}
            </button>
          ))}
        </span>
      </div>

      <svg viewBox={`0 0 ${VIEW.width} ${VIEW.height}`} className="mt-3 w-full select-none rounded-lg bg-slate-50 dark:bg-slate-950">
        <defs>
          <clipPath id="margin-clip">
            <rect x={PAD.left} y={PAD.top} width={PLOT.width} height={PLOT.height} />
          </clipPath>
        </defs>
        <g clipPath="url(#margin-clip)">
          {margin && (
            <>
              {segment(margin.upper_edge, MARGIN_COLOUR, true)}
              {segment(margin.lower_edge, MARGIN_COLOUR, true)}
              {segment(margin.boundary, BOUNDARY_COLOUR, false)}
            </>
          )}
        </g>
        {FEVER_ONLY.map((patient, index) => (
          <g key={index}>
            {support.has(index) && (
              <circle cx={plotX(patient.x)} cy={plotY(patient.y)} r={10} fill="none" stroke={BOUNDARY_COLOUR} strokeWidth={2} />
            )}
            <circle
              cx={plotX(patient.x)}
              cy={plotY(patient.y)}
              r={6}
              className={
                patient.label === 1
                  ? "fill-indigo-600 stroke-white dark:stroke-slate-900"
                  : "fill-amber-500 stroke-white dark:stroke-slate-900"
              }
              strokeWidth={1.5}
            />
          </g>
        ))}
        <text x={PAD.left + PLOT.width / 2} y={VIEW.height - 8} textAnchor="middle" className="fill-slate-500 text-xs dark:fill-slate-400">
          Temperature (°C)
        </text>
        <text x={16} y={VIEW.height / 2} textAnchor="middle" transform={`rotate(-90 16 ${VIEW.height / 2})`} className="fill-slate-500 text-xs dark:fill-slate-400">
          Heart rate (bpm)
        </text>
      </svg>

      <svg viewBox={`0 0 ${LINE.width} ${LINE.height}`} className="mt-1 w-full select-none">
        <line x1={PAD.left} x2={LINE.width - PAD.right} y1={LINE.height / 2} y2={LINE.height / 2} className="stroke-slate-300 dark:stroke-slate-700" strokeWidth={1.5} />
        {[-1, 0, 1].map((tick) => (
          <g key={tick}>
            <line x1={lineX(tick)} x2={lineX(tick)} y1={LINE.height / 2 - 10} y2={LINE.height / 2 + 10} stroke={tick === 0 ? BOUNDARY_COLOUR : MARGIN_COLOUR} strokeWidth={1.5} />
            <text x={lineX(tick)} y={LINE.height / 2 + 24} textAnchor="middle" className="fill-slate-500 text-[10px] dark:fill-slate-400">
              {tick === 0 ? "boundary, 0" : tick > 0 ? "+1" : "−1"}
            </text>
          </g>
        ))}
        {decisions.map((value, index) => (
          <g key={index}>
            {support.has(index) && (
              <circle cx={lineX(value)} cy={LINE.height / 2} r={8} fill="none" stroke={BOUNDARY_COLOUR} strokeWidth={1.5} />
            )}
            <circle
              cx={lineX(value)}
              cy={LINE.height / 2}
              r={4.5}
              fill={FEVER_ONLY[index].label === 1 ? "#6366f1" : "#f59e0b"}
              stroke="white"
              strokeWidth={1}
            />
          </g>
        ))}
        <text x={LINE.width - PAD.right} y={LINE.height / 2 - 14} textAnchor="end" className="fill-slate-500 text-[10px] dark:fill-slate-400">
          decision values, one per patient
        </text>
      </svg>

      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Stat label="corridor width, 2 / ‖w‖" value={margin ? margin.width.toFixed(3) : "…"} />
        <Stat label="support vectors" value={margin ? `${margin.fit.n_support_vectors} of ${FEVER_ONLY.length}` : "…"} />
        <Stat label="of those, at the cap" value={margin ? String(margin.fit.at_the_cap) : "…"} />
        <Stat label="weights w, standardized" value={margin ? `(${margin.weights.map((value) => value.toFixed(3)).join(", ")})` : "…"} />
        <Stat label="offset b" value={margin ? margin.offset.toFixed(3) : "…"} />
        <Stat label="training accuracy" value={margin ? margin.fit.accuracy.toFixed(3) : "…"} />
        <Stat label="ascent steps" value={margin ? String(margin.fit.epochs_run) : "…"} />
        <Stat
          label="decision values at the support vectors"
          value={margin ? margin.fit.support_positions.map((position) => margin.fit.decision_values[position].toFixed(3)).join(", ") : "…"}
        />
      </div>

      <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
        The green line is the boundary, the rose dashes are the margin&rsquo;s
        two edges, and a green ring marks a support vector. A patient on an
        edge has a decision value of exactly plus or minus one.
      </p>

      {message && <p className="mt-2 text-sm text-amber-600 dark:text-amber-400">{message}</p>}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-slate-100 px-2 py-1.5 dark:bg-slate-800">
      <div className="text-[11px] text-slate-500 dark:text-slate-400">{label}</div>
      <div className="break-words font-mono text-sm font-semibold text-slate-900 dark:text-slate-100">{value}</div>
    </div>
  );
}
