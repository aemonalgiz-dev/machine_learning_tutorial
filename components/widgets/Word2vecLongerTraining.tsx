"use client";

// The same corpus fitted for one pass and for twenty, scored twice.
//
// One line is what the fit was asked to lower, the mean cost of a training
// pair, and it goes down at every length. The other is what anyone actually
// wanted, how far apart the two lists ended up, and it rises, turns and comes
// back down. The API runs every fit; the browser draws the two curves on one
// axis of passes.

import { useEffect, useState } from "react";
import { ApiError, LongerTraining, fetchLongerTraining } from "@/lib/concepts/word2vec";
import { FALLING, Legend, RISING, Waiting } from "./word2vecShared";

const VIEW = { width: 640, height: 240 };
const PAD = { left: 56, right: 56, top: 20, bottom: 40 };

export function Word2vecLongerTraining() {
  const [training, setTraining] = useState<LongerTraining | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setTraining(await fetchLongerTraining());
      } catch (error) {
        if (error instanceof ApiError) setMessage(error.message);
        else setMessage("Something went wrong.");
      }
    })();
  }, []);

  if (!training) return <Waiting message={message} />;

  const points = training.points;
  const innerWidth = VIEW.width - PAD.left - PAD.right;
  const innerHeight = VIEW.height - PAD.top - PAD.bottom;
  const plotX = (index: number) => PAD.left + (index / (points.length - 1)) * innerWidth;

  const losses = points.map((point) => point.final_loss);
  const lossTop = Math.max(...losses) * 1.02;
  const lossBottom = Math.min(...losses) * 0.98;
  const lossY = (value: number) =>
    PAD.top + (1 - (value - lossBottom) / (lossTop - lossBottom)) * innerHeight;

  const gaps = points.map((point) => point.gap);
  const gapTop = Math.max(...gaps) * 1.05;
  const gapY = (value: number) => PAD.top + (1 - value / gapTop) * innerHeight;

  const line = (values: number[], scale: (value: number) => number) =>
    values.map((value, index) => `${index === 0 ? "M" : "L"}${plotX(index)},${scale(value)}`).join(" ");

  const best = points.reduce((first, second) => (second.gap > first.gap ? second : first));

  return (
    <div>
      <svg
        viewBox={`0 0 ${VIEW.width} ${VIEW.height}`}
        className="w-full select-none rounded-lg bg-slate-50 dark:bg-slate-950"
      >
        <path d={line(losses, lossY)} fill="none" stroke={RISING} strokeWidth={2} />
        <path d={line(gaps, gapY)} fill="none" stroke={FALLING} strokeWidth={2} />
        {points.map((point, index) => (
          <g key={point.epochs}>
            <circle cx={plotX(index)} cy={lossY(point.final_loss)} r={4} fill={RISING} />
            <circle cx={plotX(index)} cy={gapY(point.gap)} r={4} fill={FALLING} />
            <text
              x={plotX(index)}
              y={VIEW.height - PAD.bottom + 16}
              textAnchor="middle"
              className="fill-slate-500 text-[10px] dark:fill-slate-400"
            >
              {point.epochs}
            </text>
          </g>
        ))}
        <line
          x1={plotX(points.indexOf(best))}
          x2={plotX(points.indexOf(best))}
          y1={PAD.top}
          y2={VIEW.height - PAD.bottom}
          stroke={FALLING}
          strokeWidth={1}
          strokeDasharray="4 3"
        />
        <text
          x={PAD.left - 6}
          y={PAD.top + 4}
          textAnchor="end"
          className="text-[10px]"
          fill={RISING}
        >
          {lossTop.toFixed(3)}
        </text>
        <text
          x={PAD.left - 6}
          y={VIEW.height - PAD.bottom + 4}
          textAnchor="end"
          className="text-[10px]"
          fill={RISING}
        >
          {lossBottom.toFixed(3)}
        </text>
        <text
          x={VIEW.width - PAD.right + 6}
          y={PAD.top + 4}
          className="text-[10px]"
          fill={FALLING}
        >
          {gapTop.toFixed(2)}
        </text>
        <text
          x={VIEW.width - PAD.right + 6}
          y={VIEW.height - PAD.bottom + 4}
          className="text-[10px]"
          fill={FALLING}
        >
          0
        </text>
        <text
          x={PAD.left + innerWidth / 2}
          y={VIEW.height - 6}
          textAnchor="middle"
          className="fill-slate-500 text-[10px] dark:fill-slate-400"
        >
          passes over the corpus
        </text>
      </svg>

      <div className="mt-3 overflow-x-auto">
        <table className="w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800">
              <th className="py-2 pr-4 font-semibold text-slate-600 dark:text-slate-400">passes</th>
              <th className="py-2 pr-4 font-semibold text-slate-600 dark:text-slate-400">cost per pair</th>
              <th className="py-2 pr-4 font-semibold text-slate-600 dark:text-slate-400">same list</th>
              <th className="py-2 pr-4 font-semibold text-slate-600 dark:text-slate-400">across lists</th>
              <th className="py-2 font-semibold text-slate-600 dark:text-slate-400">apart by</th>
            </tr>
          </thead>
          <tbody>
            {points.map((point) => (
              <tr
                key={point.epochs}
                className="border-b border-slate-100 last:border-0 dark:border-slate-800/60"
              >
                <td className="py-1.5 pr-4 font-mono text-slate-800 dark:text-slate-200">{point.epochs}</td>
                <td className="py-1.5 pr-4 font-mono" style={{ color: RISING }}>
                  {point.final_loss.toFixed(4)}
                </td>
                <td className="py-1.5 pr-4 font-mono text-slate-800 dark:text-slate-200">
                  {point.within_topic.toFixed(4)}
                </td>
                <td className="py-1.5 pr-4 font-mono text-slate-800 dark:text-slate-200">
                  {point.across_topic.toFixed(4)}
                </td>
                <td className="py-1.5 font-mono" style={{ color: FALLING }}>
                  {point.gap.toFixed(4)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Legend>
        <span style={{ color: RISING }}>Red</span> is what the fit lowers, read
        on the left; <span style={{ color: FALLING }}>green</span> is how far
        the two lists ended up apart, read on the right. The dashed line marks
        the best separation, at {best.epochs} passes, after which the red line
        keeps falling and the green one does not.
      </Legend>
      {message && <p className="mt-2 text-sm text-amber-600 dark:text-amber-400">{message}</p>}
    </div>
  );
}
