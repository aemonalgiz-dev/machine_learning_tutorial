"use client";

// Accuracy on a crowd where adults are rare, against the answer that finds
// nobody.
//
// Thirty people, four of them adults. Three columns are judged on the same
// crowd through the same table: calling everybody a child, which is what a
// classifier that learned nothing would do, the fitted boundary at the
// halfway threshold, and the same boundary at a threshold of 0.7. The
// accuracies are close and the recalls are not, which is the whole reason
// the page reads the table rather than the one number. The API fits, sweeps
// and counts; the browser draws.

import { useEffect, useState } from "react";
import { ApiError } from "@/lib/api";
import {
  ClassifierEvaluation,
  evaluateAtThreshold,
} from "@/lib/concepts/judging-a-classifier";
import {
  CELL_COLOUR,
  DOMAIN,
  RARE_CROWD,
  cellOf,
  rate,
} from "./judgingAClassifierFixtures";

const VIEW = { width: 640, height: 260 };
const PAD = { left: 40, right: 16, top: 12, bottom: 34 };
const STRICT_THRESHOLD = 0.7;

function pixelX(height: number): number {
  return PAD.left + ((height - DOMAIN.xMin) / (DOMAIN.xMax - DOMAIN.xMin)) * (VIEW.width - PAD.left - PAD.right);
}

function pixelY(weight: number): number {
  return PAD.top + (1 - (weight - DOMAIN.yMin) / (DOMAIN.yMax - DOMAIN.yMin)) * (VIEW.height - PAD.top - PAD.bottom);
}

export function AccuracyBaseline() {
  const [answer, setAnswer] = useState<ClassifierEvaluation | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setAnswer(await evaluateAtThreshold(RARE_CROWD, 0.5));
      } catch (error) {
        if (error instanceof ApiError) setMessage(error.message);
        else setMessage("Something went wrong.");
      }
    })();
  }, []);

  if (!answer) {
    return <p className="text-sm text-slate-500 dark:text-slate-400">{message ?? "…"}</p>;
  }

  const strict = answer.curve.find((reading) => Math.abs(reading.threshold - STRICT_THRESHOLD) < 1e-9);
  const adults = RARE_CROWD.filter((person) => person.label === 1).length;

  const columns = [
    {
      title: "everybody a child",
      accuracy: answer.baseline.accuracy,
      precision: answer.baseline.precision,
      recall: answer.baseline.recall,
      found: 0,
      wrongly: 0,
    },
    {
      title: "the boundary at 0.5",
      accuracy: answer.rates.accuracy,
      precision: answer.rates.precision,
      recall: answer.rates.recall,
      found: answer.counts.true_positives,
      wrongly: answer.counts.false_positives,
    },
    ...(strict
      ? [
          {
            title: `the boundary at ${STRICT_THRESHOLD}`,
            accuracy: strict.accuracy,
            precision: strict.precision,
            recall: strict.recall,
            found: strict.true_positives,
            wrongly: strict.false_positives,
          },
        ]
      : []),
  ];

  return (
    <div className="my-4">
      <svg viewBox={`0 0 ${VIEW.width} ${VIEW.height}`} className="w-full select-none rounded-lg bg-slate-50 dark:bg-slate-950">
        {RARE_CROWD.map((person, index) => {
          const cell = cellOf(person.label, answer.predictions[index]);
          const isAdult = person.label === 1;
          return (
            <g key={index}>
              <circle cx={pixelX(person.x)} cy={pixelY(person.y)} r={isAdult ? 7 : 4.5} fill={CELL_COLOUR[cell]} stroke="white" strokeWidth={1.5} />
              {isAdult && (
                <text x={pixelX(person.x)} y={pixelY(person.y) - 11} textAnchor="middle" className="fill-slate-500 font-mono text-[9px] dark:fill-slate-400">
                  {answer.probabilities[index].toFixed(2)}
                </text>
              )}
            </g>
          );
        })}
        <text x={PAD.left + (VIEW.width - PAD.left - PAD.right) / 2} y={VIEW.height - 8} textAnchor="middle" className="fill-slate-500 text-xs font-medium dark:fill-slate-400">
          Thirty people, the four adults drawn larger and labelled with their chance, coloured by the call at 0.5
        </text>
      </svg>

      <div className="mt-3 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-slate-500 dark:text-slate-400">
              <th className="py-1 pr-3 font-medium">the classifier</th>
              <th className="py-1 pr-3 font-medium">accuracy</th>
              <th className="py-1 pr-3 font-medium">adults found, of {adults}</th>
              <th className="py-1 pr-3 font-medium">children wrongly called</th>
              <th className="py-1 pr-3 font-medium">recall</th>
              <th className="py-1 font-medium">precision</th>
            </tr>
          </thead>
          <tbody className="font-mono">
            {columns.map((column) => (
              <tr key={column.title} className="border-t border-slate-200 dark:border-slate-800">
                <td className="py-1 pr-3 font-sans">{column.title}</td>
                <td className="py-1 pr-3 font-semibold text-indigo-600 dark:text-indigo-400">{column.accuracy.toFixed(4)}</td>
                <td className="py-1 pr-3">{column.found}</td>
                <td className="py-1 pr-3">{column.wrongly}</td>
                <td className="py-1 pr-3">{column.recall.toFixed(4)}</td>
                <td className="py-1">{column.precision === null ? "nobody called" : rate(column.precision)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
        Prevalence {answer.prevalence.toFixed(4)}, so the first row scores exactly one minus that. The last two rows share an accuracy and find different numbers of adults.
      </p>
      {message && <p className="mt-2 text-sm text-rose-600 dark:text-rose-400">{message}</p>}
    </div>
  );
}
