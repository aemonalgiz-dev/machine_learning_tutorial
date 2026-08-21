"use client";

// One row of three class scores, squashed across the row and scored.
//
// Three sliders are a network's raw scores for child, teenager and adult,
// the bars are what the softmax makes of them, and the arrows beneath are
// the pull on each score, the probability minus the truth. The true class is
// the reader's to choose, and the switch adds a hundred to every score at
// once, which the softmax ignores entirely. Every probability, cost and pull
// is the library's through the API; the browser draws the bars.

import { useEffect, useState } from "react";
import { ApiError } from "@/lib/api";
import { SoftmaxRow as SoftmaxRowDocument, scoreSoftmaxRow } from "@/lib/concepts/loss-functions";
import { AMBER, GREEN, INDIGO, show } from "./lossFixtures";

const CLASSES = ["child", "teenager", "adult"];
const COLOURS = [AMBER, GREEN, INDIGO];
const VIEW = { width: 640, height: 200 };
const PAD = { left: 56, right: 16, top: 20, bottom: 28 };
const PLOT = {
  width: VIEW.width - PAD.left - PAD.right,
  height: VIEW.height - PAD.top - PAD.bottom,
};
const SHIFT = 100;
const DEBOUNCE_MS = 120;

// The page's worked row, scores of one, two and three with adult true.
const WORKED_SCORES = [1, 2, 3];
const WORKED_TRUE = 2;

export function SoftmaxRow() {
  const [scores, setScores] = useState<number[]>(WORKED_SCORES);
  const [trueClass, setTrueClass] = useState(WORKED_TRUE);
  const [shifted, setShifted] = useState(false);
  const [row, setRow] = useState<SoftmaxRowDocument | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const sent = scores.map((score) => (shifted ? score + SHIFT : score));

  useEffect(() => {
    let cancelled = false;
    const handle = window.setTimeout(async () => {
      try {
        const scored = await scoreSoftmaxRow(
          scores.map((score) => (shifted ? score + SHIFT : score)),
          trueClass,
        );
        if (!cancelled) {
          setRow(scored);
          setMessage(null);
        }
      } catch (error) {
        if (cancelled) return;
        if (error instanceof ApiError) setMessage(error.message);
        else setMessage("Something went wrong.");
      }
    }, DEBOUNCE_MS);
    return () => {
      cancelled = true;
      window.clearTimeout(handle);
    };
  }, [scores, trueClass, shifted]);

  const column = PLOT.width / CLASSES.length;
  const barWidth = column * 0.5;

  return (
    <div>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-600 dark:text-slate-300">
        {CLASSES.map((name, index) => (
          <label key={name} className="flex items-center gap-2">
            <span style={{ color: COLOURS[index] }}>{name}</span>
            <input
              type="range"
              min={-5}
              max={5}
              step={0.5}
              value={scores[index]}
              onChange={(event) =>
                setScores((current) => current.map((score, position) => (position === index ? Number(event.target.value) : score)))
              }
              className="w-24 accent-indigo-600"
            />
            <span className="w-10 font-mono">{show(sent[index], 1)}</span>
          </label>
        ))}
        <label className="flex items-center gap-2">
          true class
          <select value={trueClass} onChange={(event) => setTrueClass(Number(event.target.value))} className="rounded-md border border-slate-300 bg-white px-2 py-1 text-sm dark:border-slate-700 dark:bg-slate-900">
            {CLASSES.map((name, index) => (
              <option key={name} value={index}>{name}</option>
            ))}
          </select>
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={shifted} onChange={(event) => setShifted(event.target.checked)} className="accent-indigo-600" />
          add {SHIFT} to every score
        </label>
      </div>

      <svg viewBox={`0 0 ${VIEW.width} ${VIEW.height}`} className="mt-3 w-full select-none rounded-lg bg-slate-50 dark:bg-slate-950">
        <text x={PAD.left} y={PAD.top - 6} className="fill-slate-500 text-[10px] dark:fill-slate-400">probability of each class after the softmax, and the pull on its score</text>
        {[0, 0.5, 1].map((tick) => (
          <g key={tick}>
            <line x1={PAD.left} x2={VIEW.width - PAD.right} y1={PAD.top + (1 - tick) * PLOT.height} y2={PAD.top + (1 - tick) * PLOT.height} className="stroke-slate-200 dark:stroke-slate-800" strokeWidth={1} />
            <text x={PAD.left - 8} y={PAD.top + (1 - tick) * PLOT.height + 4} textAnchor="end" className="fill-slate-500 text-[10px] dark:fill-slate-400">{tick.toFixed(1)}</text>
          </g>
        ))}
        {CLASSES.map((name, index) => {
          const probability = row ? row.probabilities[index] : 0;
          const pull = row ? row.gradient[index] : 0;
          const centre = PAD.left + column * index + column / 2;
          const top = PAD.top + (1 - probability) * PLOT.height;
          const arrowLength = pull * PLOT.height * 0.5;
          return (
            <g key={name}>
              <rect x={centre - barWidth / 2} y={top} width={barWidth} height={PAD.top + PLOT.height - top} fill={COLOURS[index]} opacity={index === trueClass ? 0.9 : 0.4} />
              {index === trueClass && (
                <text x={centre} y={top - 4} textAnchor="middle" className="fill-slate-600 text-[10px] font-medium dark:fill-slate-300">true class</text>
              )}
              <line x1={centre + barWidth / 2 + 10} x2={centre + barWidth / 2 + 10} y1={top} y2={top + arrowLength} stroke={COLOURS[index]} strokeWidth={2} />
              <circle cx={centre + barWidth / 2 + 10} cy={top + arrowLength} r={3} fill={COLOURS[index]} />
              <text x={centre} y={VIEW.height - 8} textAnchor="middle" className="fill-slate-500 text-[10px] dark:fill-slate-400">{name}, score {show(sent[index], 1)}</text>
            </g>
          );
        })}
      </svg>

      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-5">
        {CLASSES.map((name, index) => (
          <Stat key={name} label={`${name}, probability and pull`} value={row ? `${show(row.probabilities[index])}, ${show(row.gradient[index])}` : "…"} />
        ))}
        <Stat label="cost, minus the log of the true class's probability" value={show(row?.value)} />
        <Stat label="the three pulls added together" value={row ? row.gradient_sum.toExponential(1) : "…"} />
      </div>
      {message && <p className="mt-2 text-sm text-amber-600 dark:text-amber-400">{message}</p>}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-slate-100 px-2 py-1.5 dark:bg-slate-800">
      <div className="text-[11px] text-slate-500 dark:text-slate-400">{label}</div>
      <div className="font-mono text-sm font-semibold text-slate-900 dark:text-slate-100">{value}</div>
    </div>
  );
}
