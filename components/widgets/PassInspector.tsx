"use client";

// One pass of gradient descent, taken one stage at a time.
//
// The reader stands at a line and steps through what a pass does with it:
// predict, take residuals, square and average them into the loss, read the
// two gradient components as sums of per-person shares, scale by the rate,
// update both parameters, and look at the new line beside the old one. A
// button then makes the new line the current one, so the same stages can be
// walked again from where the last pass landed. Every number comes from the
// API's candidate endpoint; the browser reveals them in order.

import { useEffect, useState } from "react";
import { ApiError, Point } from "@/lib/api";
import { Candidate, scoreCandidate } from "@/lib/concepts/gradient-descent-regression";

const WORKED_THREE: Point[] = [
  { x: 165, y: 62 },
  { x: 170, y: 68 },
  { x: 175, y: 68 },
];

const STAGES = [
  "predict",
  "residuals",
  "loss",
  "gradient",
  "update",
  "new line",
] as const;

type Stage = (typeof STAGES)[number];

const LEVEL = "text-indigo-600 dark:text-indigo-300";
const SLOPE = "text-amber-600 dark:text-amber-300";

const VIEW = { width: 640, height: 260 };
const PAD = { left: 44, right: 12, top: 10, bottom: 32 };
const PLOT = { width: VIEW.width - PAD.left - PAD.right, height: VIEW.height - PAD.top - PAD.bottom };
const HEIGHTS = { min: 160, max: 180 };
const WEIGHTS = { min: -10, max: 100 };

export function PassInspector() {
  const [level, setLevel] = useState(0);
  const [slope, setSlope] = useState(0);
  const [rate, setRate] = useState(0.02);
  const [passNumber, setPassNumber] = useState(0);
  const [stageIndex, setStageIndex] = useState(0);
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setCandidate(await scoreCandidate(WORKED_THREE, level, slope, rate));
        setMessage(null);
      } catch (error) {
        if (error instanceof ApiError) setMessage(error.message);
        else setMessage("Something went wrong.");
      }
    })();
  }, [level, slope, rate]);

  const stage: Stage = STAGES[stageIndex];
  const reached = (name: Stage) => STAGES.indexOf(name) <= stageIndex;
  const meanHeight = candidate ? candidate.mean_height : 170;

  const toX = (height: number) => PAD.left + ((height - HEIGHTS.min) / (HEIGHTS.max - HEIGHTS.min)) * PLOT.width;
  const toY = (weight: number) => Math.min(PAD.top + PLOT.height, Math.max(PAD.top, PAD.top + (1 - (weight - WEIGHTS.min) / (WEIGHTS.max - WEIGHTS.min)) * PLOT.height));
  const oldAt = (height: number) => level + slope * (height - meanHeight);
  const newAt = (height: number) => (candidate ? candidate.next_position.level + candidate.next_position.slope * (height - meanHeight) : oldAt(height));

  const takePass = () => {
    if (!candidate) return;
    setLevel(candidate.next_position.level);
    setSlope(candidate.next_position.slope);
    setPassNumber((current) => current + 1);
    setStageIndex(0);
  };
  const reset = () => {
    setLevel(0);
    setSlope(0);
    setPassNumber(0);
    setStageIndex(0);
  };

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 pb-3 text-sm text-slate-600 dark:text-slate-300">
        <span>
          pass {passNumber + 1}, standing at <span className={`font-mono ${LEVEL}`}>level {level.toFixed(4)}</span>, <span className={`font-mono ${SLOPE}`}>slope {slope.toFixed(4)}</span>
        </span>
        <label className="ml-auto flex items-center gap-2">
          rate
          <select value={rate} onChange={(event) => setRate(Number(event.target.value))} className="rounded-md border border-slate-300 bg-white px-2 py-1 text-xs dark:border-slate-700 dark:bg-slate-800">
            {[0.005, 0.02, 0.05, 0.07].map((choice) => (
              <option key={choice} value={choice}>{choice}</option>
            ))}
          </select>
        </label>
      </div>

      <div className="flex flex-wrap gap-1 pb-3">
        {STAGES.map((name, index) => (
          <button
            key={name}
            onClick={() => setStageIndex(index)}
            className={`rounded-md border px-2.5 py-1 text-xs font-medium transition ${
              index === stageIndex
                ? "border-indigo-500 bg-indigo-50 text-indigo-700 dark:border-indigo-400 dark:bg-indigo-950/40 dark:text-indigo-200"
                : index < stageIndex
                  ? "border-slate-300 bg-slate-100 text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                  : "border-slate-300 bg-white text-slate-500 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400"
            }`}
          >
            {index + 1}. {name}
          </button>
        ))}
        <button onClick={() => setStageIndex((current) => Math.min(STAGES.length - 1, current + 1))} className="ml-auto rounded-md border border-slate-300 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
          next stage
        </button>
      </div>

      <svg viewBox={`0 0 ${VIEW.width} ${VIEW.height}`} className="w-full select-none rounded-lg bg-slate-50 dark:bg-slate-950">
        {[0, 25, 50, 75, 100].map((tick) => (
          <g key={tick}>
            <line x1={PAD.left} y1={toY(tick)} x2={PAD.left + PLOT.width} y2={toY(tick)} stroke="currentColor" className="text-slate-200 dark:text-slate-800" />
            <text x={PAD.left - 5} y={toY(tick) + 3} textAnchor="end" className="fill-slate-400 text-[10px]">{tick}</text>
          </g>
        ))}
        <line x1={toX(HEIGHTS.min)} y1={toY(oldAt(HEIGHTS.min))} x2={toX(HEIGHTS.max)} y2={toY(oldAt(HEIGHTS.max))} stroke="currentColor" className="text-indigo-600 dark:text-indigo-400" strokeWidth={2.5} />
        {reached("new line") && candidate && (
          <line x1={toX(HEIGHTS.min)} y1={toY(newAt(HEIGHTS.min))} x2={toX(HEIGHTS.max)} y2={toY(newAt(HEIGHTS.max))} stroke="currentColor" className="text-emerald-500" strokeWidth={2.5} strokeDasharray="6 4" />
        )}
        {WORKED_THREE.map((point) => (
          <g key={point.x}>
            {reached("predict") && <circle cx={toX(point.x)} cy={toY(oldAt(point.x))} r={4} fill="none" stroke="#6366f1" strokeWidth={2} />}
            {reached("residuals") && <line x1={toX(point.x)} y1={toY(point.y)} x2={toX(point.x)} y2={toY(oldAt(point.x))} stroke="#ef4444" strokeWidth={1.5} />}
            <circle cx={toX(point.x)} cy={toY(point.y)} r={5} className="fill-slate-800 stroke-white dark:fill-slate-100 dark:stroke-slate-900" strokeWidth={1.5} />
          </g>
        ))}
        {[160, 165, 170, 175, 180].map((tick) => (
          <text key={tick} x={toX(tick)} y={PAD.top + PLOT.height + 14} textAnchor="middle" className="fill-slate-400 text-[10px]">{tick}</text>
        ))}
        <text x={PAD.left + PLOT.width / 2} y={VIEW.height - 4} textAnchor="middle" className="fill-slate-500 text-[10px] font-medium dark:fill-slate-400">
          the current line in indigo{reached("new line") ? ", the line after this pass dashed in green" : ""}
        </text>
      </svg>

      <div className="mt-3 overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left dark:border-slate-800">
              <th className="py-1.5 pr-3 font-semibold text-slate-600 dark:text-slate-400">centred height x′</th>
              <th className="py-1.5 pr-3 font-semibold text-slate-600 dark:text-slate-400">weight y</th>
              {reached("predict") && <th className="py-1.5 pr-3 font-semibold text-slate-600 dark:text-slate-400">prediction ŷ</th>}
              {reached("residuals") && <th className="py-1.5 pr-3 font-semibold text-rose-600 dark:text-rose-400">residual e</th>}
              {reached("loss") && <th className="py-1.5 pr-3 font-semibold text-slate-600 dark:text-slate-400">e²</th>}
              {reached("gradient") && <th className={`py-1.5 pr-3 font-semibold ${LEVEL}`}>level share −(2/n)e</th>}
              {reached("gradient") && <th className={`py-1.5 font-semibold ${SLOPE}`}>slope share −(2/n)e·x′</th>}
            </tr>
          </thead>
          <tbody className="font-mono text-slate-800 dark:text-slate-200">
            {candidate?.observations.map((each) => (
              <tr key={each.centred_height} className="border-b border-slate-100 last:border-0 dark:border-slate-800/60">
                <td className="py-1.5 pr-3">{each.centred_height}</td>
                <td className="py-1.5 pr-3">{each.weight}</td>
                {reached("predict") && <td className="py-1.5 pr-3">{each.prediction.toFixed(2)}</td>}
                {reached("residuals") && <td className="py-1.5 pr-3 text-rose-600 dark:text-rose-400">{each.residual.toFixed(2)}</td>}
                {reached("loss") && <td className="py-1.5 pr-3">{each.squared_residual.toFixed(2)}</td>}
                {reached("gradient") && <td className={`py-1.5 pr-3 ${LEVEL}`}>{each.level_share.toFixed(3)}</td>}
                {reached("gradient") && <td className={`py-1.5 ${SLOPE}`}>{each.slope_share.toFixed(3)}</td>}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {candidate && (
        <div className="mt-3 space-y-2 rounded-md bg-slate-100 px-4 py-3 font-mono text-sm text-slate-800 dark:bg-slate-800 dark:text-slate-200">
          {stage === "predict" && <p>ŷ = level + slope × x′, so ŷ = {level.toFixed(2)} + {slope.toFixed(3)} × x′ for each person.</p>}
          {stage === "residuals" && <p>e = y − ŷ, the vertical miss at each person, red in the picture.</p>}
          {reached("loss") && (
            <p>
              loss = mean of e² = ({candidate.observations.map((each) => each.squared_residual.toFixed(1)).join(" + ")}) / {candidate.observations.length} = <span className="font-semibold">{candidate.standing.loss.toFixed(4)}</span>
            </p>
          )}
          {reached("gradient") && (
            <p>
              <span className={LEVEL}>∂loss/∂level = sum of the level shares = {candidate.gradient_level.toFixed(3)}</span>
              <br />
              <span className={SLOPE}>∂loss/∂slope = sum of the slope shares = {candidate.gradient_slope.toFixed(3)}</span>
            </p>
          )}
          {reached("update") && (
            <p>
              <span className={LEVEL}>level ← {level.toFixed(4)} − {rate} × ({candidate.gradient_level.toFixed(3)}) = {candidate.next_position.level.toFixed(4)}</span>
              <br />
              <span className={SLOPE}>slope ← {slope.toFixed(4)} − {rate} × ({candidate.gradient_slope.toFixed(3)}) = {candidate.next_position.slope.toFixed(4)}</span>
            </p>
          )}
          {reached("new line") && (
            <p>
              loss before {candidate.standing.loss.toFixed(4)}, loss after <span className="font-semibold">{candidate.next_position.loss.toFixed(4)}</span>
              {candidate.next_position.loss < candidate.standing.loss ? ", lower" : ", higher, which a rate that is too large can do"}.
            </p>
          )}
        </div>
      )}

      <div className="mt-3 flex flex-wrap gap-2">
        <button onClick={takePass} disabled={!candidate || !reached("new line")} className="rounded-md border border-emerald-400 bg-emerald-50 px-3 py-1.5 text-sm font-medium text-emerald-800 transition hover:bg-emerald-100 disabled:opacity-40 dark:border-emerald-500/70 dark:bg-emerald-950/30 dark:text-emerald-200">
          Make the new line current and go again
        </button>
        <button onClick={reset} className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
          Back to the flat line at zero
        </button>
      </div>

      {message && (
        <p className="mt-3 text-sm text-amber-600 dark:text-amber-400">{message}</p>
      )}
    </div>
  );
}
