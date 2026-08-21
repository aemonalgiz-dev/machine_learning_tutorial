"use client";

// The softmax ascent on three perfectly separated people, pass by pass.
//
// The API records every pass of the joint ascent and reads back the size of
// the coefficients, the log loss, the accuracy and the probability each
// person's own class received. Accuracy reaches one within the first
// passes and stays there. The coefficients keep growing and the loss keeps
// falling for as long as the budget allows, and the library reports the run
// as not converged, because on separated data the likelihood has no maximum
// to converge to. Beside it, the one-vs-rest route's three binary fits
// report their own verdicts, one converged and two out of passes.

import { useEffect, useState } from "react";
import { ApiError } from "@/lib/api";
import { MulticlassAnswer, SoftmaxPass, SoftmaxWalk, classifyAmongThree, walkSoftmax } from "@/lib/concepts/multiclass-classification";
import { CLASS_COLOURS, CLASS_NAMES, THREE_PEOPLE } from "./RouteComparison";

const PANEL = { width: 320, height: 200 };
const PAD = { left: 46, right: 10, top: 12, bottom: 28 };
const PLOT = { width: PANEL.width - PAD.left - PAD.right, height: PANEL.height - PAD.top - PAD.bottom };
const MAX_EPOCHS = 500;

export function SeparationSweep() {
  const [walk, setWalk] = useState<SoftmaxWalk | null>(null);
  const [oneVsRest, setOneVsRest] = useState<MulticlassAnswer | null>(null);
  const [index, setIndex] = useState(MAX_EPOCHS);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const [recorded, rest] = await Promise.all([
          walkSoftmax(THREE_PEOPLE, MAX_EPOCHS),
          classifyAmongThree(THREE_PEOPLE, "one_vs_rest"),
        ]);
        setWalk(recorded);
        setOneVsRest(rest);
        setIndex(recorded.passes.length);
      } catch (error) {
        if (error instanceof ApiError) setMessage(error.message);
        else setMessage("Something went wrong.");
      }
    })();
  }, []);

  if (!walk) {
    return <p className="text-sm text-slate-500 dark:text-slate-400">{message ?? "…"}</p>;
  }

  const count = walk.passes.length;
  const shown = Math.min(index, count);
  const pass = walk.passes[Math.max(0, shown - 1)];
  const toX = (position: number) => PAD.left + (position / count) * PLOT.width;
  const normTop = Math.max(...walk.passes.map((each) => each.coefficient_norm)) * 1.05;
  const lossTop = Math.max(...walk.passes.map((each) => each.log_loss)) * 1.05;
  const firstPerfect = walk.passes.find((each) => each.accuracy === 1)?.pass_number ?? null;

  const line = (pick: (each: SoftmaxPass) => number, top: number) =>
    walk.passes.map((each, position) => `${position === 0 ? "M" : "L"} ${toX(position + 1).toFixed(1)} ${(PAD.top + (1 - pick(each) / top) * PLOT.height).toFixed(1)}`).join(" ");

  return (
    <div>
      <label className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
        pass
        <input type="range" min={1} max={count} step={1} value={shown} onChange={(event) => setIndex(Number(event.target.value))} className="flex-1 accent-slate-700 dark:accent-slate-300" />
        <span className="w-24 text-right font-mono">{shown} of {count}</span>
      </label>
      <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Stat label="coefficient size" value={pass.coefficient_norm.toFixed(3)} />
        <Stat label="log loss" value={pass.log_loss.toFixed(4)} />
        <Stat label="accuracy" value={pass.accuracy.toFixed(3)} />
        <Stat label="softmax verdict" value={walk.converged ? "converged" : "passes ran out"} />
      </div>
      <div className="mt-3 grid gap-4 sm:grid-cols-2">
        <div className="rounded-lg border border-slate-200 p-3 dark:border-slate-800">
          <p className="mb-2 text-sm font-medium text-slate-700 dark:text-slate-200">Coefficient size and log loss against pass</p>
          <svg viewBox={`0 0 ${PANEL.width} ${PANEL.height}`} className="w-full select-none rounded-md bg-slate-50 dark:bg-slate-950">
            <path d={line((each) => each.coefficient_norm, normTop)} fill="none" stroke="#f59e0b" strokeWidth={2} />
            <path d={line((each) => each.log_loss, lossTop)} fill="none" stroke="#0f172a" strokeWidth={2} className="dark:stroke-slate-100" />
            <path d={line((each) => each.accuracy, 1.05)} fill="none" stroke="#10b981" strokeWidth={2} strokeDasharray="4 3" />
            <line x1={toX(shown)} y1={PAD.top} x2={toX(shown)} y2={PAD.top + PLOT.height} stroke="currentColor" className="text-slate-500" strokeDasharray="4 3" />
            {firstPerfect !== null && <line x1={toX(firstPerfect)} y1={PAD.top} x2={toX(firstPerfect)} y2={PAD.top + PLOT.height} stroke="#10b981" strokeDasharray="2 2" />}
            <text x={PAD.left + 4} y={PAD.top + 12} className="text-[10px] font-medium" fill="#f59e0b">coefficient size, to {normTop.toFixed(1)}</text>
            <text x={PAD.left + 4} y={PAD.top + 24} className="fill-slate-700 text-[10px] font-medium dark:fill-slate-200">log loss, to {lossTop.toFixed(2)}</text>
            <text x={PAD.left + 4} y={PAD.top + 36} className="text-[10px] font-medium" fill="#10b981">accuracy, perfect from pass {firstPerfect ?? "…"}</text>
            {[0, count / 2, count].map((tick) => (
              <text key={tick} x={toX(tick)} y={PAD.top + PLOT.height + 12} textAnchor="middle" className="fill-slate-400 text-[10px]">{tick}</text>
            ))}
            <text x={PAD.left + PLOT.width / 2} y={PANEL.height - 2} textAnchor="middle" className="fill-slate-500 text-[10px] dark:fill-slate-400">pass</text>
          </svg>
        </div>
        <div className="rounded-lg border border-slate-200 p-3 dark:border-slate-800">
          <p className="mb-2 text-sm font-medium text-slate-700 dark:text-slate-200">Probability given to each person&rsquo;s own class</p>
          <div className="space-y-2">
            {pass.correct_class_probabilities.map((probability, person) => (
              <div key={person}>
                <div className="flex justify-between text-[11px]" style={{ color: CLASS_COLOURS[THREE_PEOPLE[person].label] }}>
                  <span>the {CLASS_NAMES[THREE_PEOPLE[person].label]}</span>
                  <span className="font-mono">{probability.toFixed(4)}</span>
                </div>
                <div className="h-3 w-full overflow-hidden rounded bg-slate-200 dark:bg-slate-800">
                  <div style={{ width: `${probability * 100}%`, backgroundColor: CLASS_COLOURS[THREE_PEOPLE[person].label] }} className="h-full" />
                </div>
              </div>
            ))}
          </div>
          <p className="mt-3 text-xs font-medium text-slate-700 dark:text-slate-200">One-vs-rest, the same people, one verdict per binary fit</p>
          <div className="mt-1 space-y-1 font-mono text-[11px] text-slate-700 dark:text-slate-200">
            {oneVsRest?.class_fits.map((fit) => (
              <p key={fit.class_index} style={{ color: CLASS_COLOURS[fit.class_index] }}>
                {CLASS_NAMES[fit.class_index]} versus the rest: {fit.converged ? "converged" : "passes ran out"} after {fit.epochs_run}
              </p>
            ))}
          </div>
        </div>
      </div>
      {message && (
        <p className="mt-3 text-sm text-amber-600 dark:text-amber-400">{message}</p>
      )}
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
