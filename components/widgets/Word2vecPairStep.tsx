"use client";

// One training pair, scored and differentiated, small enough to check by hand.
//
// A word's vector in the plane, the row of the word that really did appear
// beside it, and two rows drawn at random to stand for words that did not. The
// reader turns the word's vector and watches three probabilities, the cost that
// falls out of them, and the arrows saying which way each row is about to be
// pushed. The API scores and differentiates; the browser draws.

import { useEffect, useState } from "react";
import { ApiError, PairStep, scoreOnePair } from "@/lib/concepts/word2vec";
import { FALLING, Legend, MONEY, RISING, Stat, VERB, Waiting } from "./word2vecShared";

const VIEW = { width: 400, height: 320 };
const SPAN = 1.6;

const TRUE_ROW = { x: 1.0, y: 0.0 };
const NEGATIVE_ROWS = [
  { x: -1.0, y: 0.0 },
  { x: 0.0, y: 1.0 },
];

export function Word2vecPairStep() {
  const [angle, setAngle] = useState(0);
  const [length, setLength] = useState(0.5);
  const [step, setStep] = useState<PairStep | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const radians = (angle * Math.PI) / 180;
  const hidden = { x: length * Math.cos(radians), y: length * Math.sin(radians) };

  useEffect(() => {
    const timer = setTimeout(async () => {
      try {
        setStep(await scoreOnePair(hidden, TRUE_ROW, NEGATIVE_ROWS));
        setMessage(null);
      } catch (error) {
        if (error instanceof ApiError) setMessage(error.message);
        else setMessage("Something went wrong.");
      }
    }, 40);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [angle, length]);

  if (!step) return <Waiting message={message} />;

  const plotX = (value: number) => VIEW.width / 2 + (value / SPAN) * (VIEW.width / 2 - 24);
  const plotY = (value: number) => VIEW.height / 2 - (value / SPAN) * (VIEW.height / 2 - 24);
  const rows = [TRUE_ROW, ...NEGATIVE_ROWS];

  return (
    <div className="flex flex-wrap gap-6">
      <div className="min-w-[280px] flex-1">
        <svg
          viewBox={`0 0 ${VIEW.width} ${VIEW.height}`}
          className="w-full select-none rounded-lg bg-slate-50 dark:bg-slate-950"
        >
          <line
            x1={plotX(-SPAN)}
            x2={plotX(SPAN)}
            y1={plotY(0)}
            y2={plotY(0)}
            className="stroke-slate-300 dark:stroke-slate-700"
            strokeWidth={1}
          />
          <line
            x1={plotX(0)}
            x2={plotX(0)}
            y1={plotY(-SPAN)}
            y2={plotY(SPAN)}
            className="stroke-slate-300 dark:stroke-slate-700"
            strokeWidth={1}
          />
          {rows.map((row, index) => {
            const scored = step.rows[index];
            const colour = scored.label === 1 ? FALLING : RISING;
            return (
              <g key={index}>
                <line
                  x1={plotX(0)}
                  y1={plotY(0)}
                  x2={plotX(row.x)}
                  y2={plotY(row.y)}
                  stroke={colour}
                  strokeWidth={2}
                />
                <line
                  x1={plotX(row.x)}
                  y1={plotY(row.y)}
                  x2={plotX(row.x + scored.push_x)}
                  y2={plotY(row.y + scored.push_y)}
                  stroke={colour}
                  strokeWidth={2}
                  strokeDasharray="4 3"
                />
                <circle cx={plotX(row.x)} cy={plotY(row.y)} r={4} fill={colour} />
                <text
                  x={plotX(row.x) + 8}
                  y={plotY(row.y) - 6}
                  className="text-[10px] font-medium"
                  fill={colour}
                >
                  {scored.label === 1 ? "the true neighbour" : "a drawn word"}
                </text>
              </g>
            );
          })}
          <line
            x1={plotX(0)}
            y1={plotY(0)}
            x2={plotX(hidden.x)}
            y2={plotY(hidden.y)}
            stroke={VERB}
            strokeWidth={3}
          />
          <line
            x1={plotX(hidden.x)}
            y1={plotY(hidden.y)}
            x2={plotX(hidden.x + step.hidden_push.x)}
            y2={plotY(hidden.y + step.hidden_push.y)}
            stroke={VERB}
            strokeWidth={2}
            strokeDasharray="4 3"
          />
          <circle cx={plotX(hidden.x)} cy={plotY(hidden.y)} r={5} fill={VERB} />
          <text
            x={plotX(hidden.x) + 8}
            y={plotY(hidden.y) + 14}
            className="text-[10px] font-medium"
            fill={VERB}
          >
            the word&rsquo;s own vector
          </text>
        </svg>
        <Legend>
          Solid lines are the vectors as they stand and dashed lines the step
          each is about to take, before the step size shrinks it. The true
          neighbour is pulled towards the word and both drawn words away.
        </Legend>
      </div>

      <div className="min-w-[240px] flex-1">
        <div className="flex flex-col gap-2 text-sm text-slate-600 dark:text-slate-300">
          <label className="flex items-center gap-2">
            turn
            <input
              type="range"
              min={-180}
              max={180}
              step={5}
              value={angle}
              onChange={(event) => setAngle(Number(event.target.value))}
              className="flex-1 accent-indigo-600"
            />
            <span className="w-12 text-right font-mono">{angle}&deg;</span>
          </label>
          <label className="flex items-center gap-2">
            length
            <input
              type="range"
              min={0.1}
              max={1.5}
              step={0.05}
              value={length}
              onChange={(event) => setLength(Number(event.target.value))}
              className="flex-1 accent-indigo-600"
            />
            <span className="w-12 text-right font-mono">{length.toFixed(2)}</span>
          </label>
        </div>
        <table className="mt-3 w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800">
              <th className="py-1.5 pr-3 font-semibold text-slate-600 dark:text-slate-400">
                row
              </th>
              <th className="py-1.5 pr-3 font-semibold text-slate-600 dark:text-slate-400">
                score
              </th>
              <th className="py-1.5 pr-3 font-semibold text-slate-600 dark:text-slate-400">
                says yes
              </th>
              <th className="py-1.5 font-semibold text-slate-600 dark:text-slate-400">
                cost
              </th>
            </tr>
          </thead>
          <tbody>
            {step.rows.map((row, index) => (
              <tr
                key={index}
                className="border-b border-slate-100 last:border-0 dark:border-slate-800/60"
              >
                <td
                  className="py-1 pr-3 font-mono"
                  style={{ color: row.label === 1 ? FALLING : RISING }}
                >
                  {row.label === 1 ? "true" : "drawn"}
                </td>
                <td className="py-1 pr-3 font-mono text-slate-800 dark:text-slate-200">
                  {row.score.toFixed(4)}
                </td>
                <td className="py-1 pr-3 font-mono text-slate-800 dark:text-slate-200">
                  {row.probability.toFixed(4)}
                </td>
                <td className="py-1 font-mono text-slate-800 dark:text-slate-200">
                  {row.loss.toFixed(4)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <Stat label="cost of this pair" value={step.loss.toFixed(6)} />
          <Stat
            label="step the word takes"
            value={`(${step.hidden_push.x.toFixed(3)}, ${step.hidden_push.y.toFixed(3)})`}
          />
        </div>
        <p className="mt-2 text-xs" style={{ color: MONEY }}>
          Three rows and one word, so the whole pair costs three logarithms
          whatever the vocabulary holds.
        </p>
      </div>
      {message && <p className="mt-2 text-sm text-amber-600 dark:text-amber-400">{message}</p>}
    </div>
  );
}
