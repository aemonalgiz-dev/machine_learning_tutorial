"use client";

// The twelve people dealt into five folds, plain or stratified, and scored.
//
// Six children and six adults, each drawn by height and weight and numbered
// by the fold that judges them, adults as filled discs and children as rings.
// A tree two questions deep is refitted inside every fold by the API. The
// table under the map is one row per fold: how many people it held out, how
// many of them were adults, how many the tree got right, and the fold's
// accuracy and recall, with recall undefined wherever the fold held no adult
// at all. The readouts put the averaged figures beside the pooled ones, which
// is the whole argument for pooling. The API deals, fits and counts; the
// browser draws.

import { useEffect, useState } from "react";
import { ApiError } from "@/lib/api";
import { ClassifierFolds, foldClassifier } from "@/lib/concepts/held-out-evaluation";
import { OVERLAPPING_CROWD, PAGE_SEED, foldColour } from "./heldOutEvaluationFixtures";

const FOLD_COUNT = 5;
const VIEW = { width: 640, height: 300 };
const PAD = { left: 52, right: 16, top: 16, bottom: 40 };
const DOMAIN = { xMin: 110, xMax: 190, yMin: 15, yMax: 90 };

function pixelX(height: number): number {
  return PAD.left + ((height - DOMAIN.xMin) / (DOMAIN.xMax - DOMAIN.xMin)) * (VIEW.width - PAD.left - PAD.right);
}

function pixelY(weight: number): number {
  return PAD.top + (1 - (weight - DOMAIN.yMin) / (DOMAIN.yMax - DOMAIN.yMin)) * (VIEW.height - PAD.top - PAD.bottom);
}

function rate(value: number | null): string {
  return value === null ? "undefined" : value.toFixed(3);
}

export function ClassifierFoldDeck() {
  const [stratified, setStratified] = useState(false);
  const [folds, setFolds] = useState<ClassifierFolds | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setFolds(await foldClassifier(OVERLAPPING_CROWD, FOLD_COUNT, stratified, PAGE_SEED));
        setMessage(null);
      } catch (error) {
        if (error instanceof ApiError) setMessage(error.message);
        else setMessage("Something went wrong.");
      }
    })();
  }, [stratified]);

  const foldOf = new Map<number, number>();
  folds?.folds.forEach((fold, foldIndex) => {
    fold.held_out_indices.forEach((index) => foldOf.set(index, foldIndex));
  });

  const cell = "py-1.5 pr-4 font-mono text-slate-800 last:pr-0 dark:text-slate-200";

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 pb-3 text-sm text-slate-600 dark:text-slate-300">
        <span>Five folds, one seed</span>
        <span className="ml-auto flex gap-1 rounded-md border border-slate-300 p-0.5 dark:border-slate-700">
          {[
            { label: "plain deal", value: false },
            { label: "stratified deal", value: true },
          ].map((choice) => (
            <button
              key={choice.label}
              onClick={() => setStratified(choice.value)}
              className={
                "rounded px-2 py-0.5 text-xs font-medium transition " +
                (stratified === choice.value
                  ? "bg-indigo-600 text-white"
                  : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800")
              }
            >
              {choice.label}
            </button>
          ))}
        </span>
      </div>

      <svg
        viewBox={`0 0 ${VIEW.width} ${VIEW.height}`}
        className="w-full select-none rounded-lg bg-slate-50 dark:bg-slate-950"
      >
        {[120, 140, 160, 180].map((height) => (
          <g key={`gx-${height}`}>
            <line x1={pixelX(height)} y1={PAD.top} x2={pixelX(height)} y2={VIEW.height - PAD.bottom} stroke="currentColor" className="text-slate-200 dark:text-slate-800" />
            <text x={pixelX(height)} y={VIEW.height - PAD.bottom + 16} textAnchor="middle" className="fill-slate-400 text-[11px]">{height}</text>
          </g>
        ))}
        {[20, 40, 60, 80].map((weight) => (
          <g key={`gy-${weight}`}>
            <line x1={PAD.left} y1={pixelY(weight)} x2={VIEW.width - PAD.right} y2={pixelY(weight)} stroke="currentColor" className="text-slate-200 dark:text-slate-800" />
            <text x={PAD.left - 8} y={pixelY(weight) + 4} textAnchor="end" className="fill-slate-400 text-[11px]">{weight}</text>
          </g>
        ))}
        {OVERLAPPING_CROWD.map((person, index) => {
          const fold = foldOf.get(index);
          const colour = fold === undefined ? "#94a3b8" : foldColour(fold, FOLD_COUNT);
          return (
            <g key={`person-${index}`}>
              <circle
                cx={pixelX(person.x)}
                cy={pixelY(person.y)}
                r={10}
                fill={person.label === 1 ? colour : "white"}
                stroke={colour}
                strokeWidth={3}
              />
              <text
                x={pixelX(person.x)}
                y={pixelY(person.y) + 4}
                textAnchor="middle"
                className={person.label === 1 ? "fill-white text-[10px] font-semibold" : "text-[10px] font-semibold"}
                fill={person.label === 1 ? undefined : colour}
              >
                {fold === undefined ? "" : fold + 1}
              </text>
            </g>
          );
        })}
        <text x={PAD.left + (VIEW.width - PAD.left - PAD.right) / 2} y={VIEW.height - 6} textAnchor="middle" className="fill-slate-500 text-xs font-medium dark:fill-slate-400">
          Height (cm), filled discs are adults, rings are children
        </text>
        <text x={14} y={PAD.top + (VIEW.height - PAD.top - PAD.bottom) / 2} textAnchor="middle" transform={`rotate(-90 14 ${PAD.top + (VIEW.height - PAD.top - PAD.bottom) / 2})`} className="fill-slate-500 text-xs font-medium dark:fill-slate-400">
          Weight (kg)
        </text>
      </svg>

      {folds && (
        <div className="mt-3 overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left dark:border-slate-800">
                {["fold", "held out", "adults", "right", "accuracy", "recall"].map((heading) => (
                  <th key={heading} className="py-1.5 pr-4 font-semibold text-slate-600 last:pr-0 dark:text-slate-400">{heading}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {folds.folds.map((fold, foldIndex) => (
                <tr key={`row-${foldIndex}`} className="border-b border-slate-100 last:border-0 dark:border-slate-800/60">
                  <td className={cell}>
                    <span className="inline-block h-3 w-3 rounded-full align-middle" style={{ backgroundColor: foldColour(foldIndex, FOLD_COUNT) }} />{" "}
                    {foldIndex + 1}
                  </td>
                  <td className={cell}>{fold.n_held_out}</td>
                  <td className={cell}>{fold.positives_held_out}</td>
                  <td className={cell}>{fold.correct}</td>
                  <td className={cell}>{fold.accuracy.toFixed(3)}</td>
                  <td className={cell}>{rate(fold.recall)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
        <Stat label="Folds missing a class" value={folds ? String(folds.classes_missing_from_a_fold) : "…"} />
        <Stat label="Accuracy, averaged over folds" value={folds ? folds.mean_fold_accuracy.toFixed(4) : "…"} />
        <Stat label="Accuracy, pooled" value={folds ? folds.pooled_accuracy.toFixed(4) : "…"} />
        <Stat label="Folds where recall exists" value={folds ? `${folds.folds_with_defined_recall} of ${folds.folds.length}` : "…"} />
        <Stat label="Recall, averaged where it exists" value={folds ? rate(folds.mean_defined_recall) : "…"} />
        <Stat label="Recall, pooled" value={folds ? `${rate(folds.pooled_recall)} (${folds.pooled_true_positives} of ${folds.pooled_actual_positives})` : "…"} />
      </div>

      {message && <p className="mt-3 text-sm text-amber-600 dark:text-amber-400">{message}</p>}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-slate-100 px-3 py-2 dark:bg-slate-800">
      <div className="text-xs text-slate-500 dark:text-slate-400">{label}</div>
      <div className="font-mono text-base font-semibold text-slate-900 dark:text-slate-100">{value}</div>
    </div>
  );
}
