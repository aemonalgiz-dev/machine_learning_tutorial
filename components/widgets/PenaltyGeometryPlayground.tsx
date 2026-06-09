"use client";

// The RSS valley over two correlated coefficients, and the two shapes that
// meet it.
//
// The API builds two columns that track one another, the second close to
// twice the first, and samples the residual sum of squares over every pair
// of coefficients. Drawn as a heatmap with contour lines, that is a long
// shallow valley: many pairs fit nearly equally well, and the least-squares
// point sits somewhere along the floor for reasons that are mostly noise.
// The penalised solution is where the valley first meets the penalty's
// shape, a circle for ridge and a diamond for lasso, drawn here through the
// solution the API found at the chosen λ. The perturbed sample is the same
// columns with the target jostled a little, and it is what shows the
// least-squares point sliding along the valley while the penalised point
// stays put. The lattice and every solution come from the API; the contours
// are traced in the browser from the lattice.

import { useEffect, useState } from "react";
import { ApiError, CoefficientPair, PenaltyGeometry, PenaltyModel, fetchPenaltyGeometry } from "@/lib/api";
import { traceContour } from "@/lib/contours";

const VIEW = 420;
const PAD = 36;
const PLOT = VIEW - 2 * PAD;

// Contour levels as multiples of the lowest RSS on the lattice.
const CONTOUR_MULTIPLES = [1.1, 1.5, 2.5, 5, 10, 20, 40];

function formatPenalty(penalty: number): string {
  if (penalty >= 10) return penalty.toFixed(0);
  return penalty.toFixed(penalty >= 1 ? 1 : 2);
}

export function PenaltyGeometryPlayground() {
  const [geometry, setGeometry] = useState<PenaltyGeometry | null>(null);
  const [model, setModel] = useState<PenaltyModel>("ridge");
  const [index, setIndex] = useState(4);
  const [showPerturbed, setShowPerturbed] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setGeometry(await fetchPenaltyGeometry());
      } catch (error) {
        if (error instanceof ApiError) setMessage(error.message);
        else setMessage("Something went wrong.");
      }
    })();
  }, []);

  if (!geometry) {
    return <p className="text-sm text-slate-500 dark:text-slate-400">{message ?? "…"}</p>;
  }

  const size = geometry.first_axis.length;
  const reach = geometry.first_axis[size - 1];
  const toX = (first: number) => PAD + ((first + reach) / (2 * reach)) * PLOT;
  const toY = (second: number) => PAD + (1 - (second + reach) / (2 * reach)) * PLOT;
  const cell = PLOT / (size - 1);
  const lowest = Math.min(...geometry.rss.flat());
  const highest = Math.max(...geometry.rss.flat());
  const shade = (value: number) => {
    const scaled = Math.log(value / lowest) / Math.log(highest / lowest);
    return 0.05 + 0.75 * scaled;
  };

  const penalty = geometry.penalties[index];
  const solutionOf = (solutions: typeof geometry.original) =>
    model === "ridge" ? solutions.ridge[index] : solutions.lasso[index];
  const solution = solutionOf(geometry.original);
  const perturbedSolution = solutionOf(geometry.perturbed);

  const radius = model === "ridge"
    ? Math.hypot(solution.first, solution.second)
    : Math.abs(solution.first) + Math.abs(solution.second);
  const shapePath = model === "ridge"
    ? `M ${toX(radius)} ${toY(0)} A ${(radius / (2 * reach)) * PLOT} ${(radius / (2 * reach)) * PLOT} 0 1 0 ${toX(-radius)} ${toY(0)} A ${(radius / (2 * reach)) * PLOT} ${(radius / (2 * reach)) * PLOT} 0 1 0 ${toX(radius)} ${toY(0)}`
    : `M ${toX(radius)} ${toY(0)} L ${toX(0)} ${toY(radius)} L ${toX(-radius)} ${toY(0)} L ${toX(0)} ${toY(-radius)} Z`;

  const contours = CONTOUR_MULTIPLES.map((multiple) => traceContour(geometry.rss, lowest * multiple));
  const pairText = (pair: CoefficientPair) => `(${pair.first.toFixed(2)}, ${pair.second.toFixed(2)})`;

  return (
    <div>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 pb-3 text-sm text-slate-600 dark:text-slate-300">
        <div className="flex gap-1 rounded-md border border-slate-300 p-0.5 dark:border-slate-700">
          {(["ridge", "lasso"] as PenaltyModel[]).map((option) => (
            <button
              key={option}
              onClick={() => setModel(option)}
              className={
                "rounded px-3 py-1 text-sm font-medium capitalize transition " +
                (model === option ? "bg-indigo-600 text-white" : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800")
              }
            >
              {option}
            </button>
          ))}
        </div>
        <label className="flex items-center gap-1.5">
          <input type="checkbox" checked={showPerturbed} onChange={(event) => setShowPerturbed(event.target.checked)} className="accent-indigo-600" />
          jostle the sample
        </label>
        <label className="ml-auto flex items-center gap-2">
          λ
          <input type="range" min={0} max={geometry.penalties.length - 1} step={1} value={index} onChange={(event) => setIndex(Number(event.target.value))} className="w-36 accent-indigo-600" />
          <span className="w-12 font-mono">{formatPenalty(penalty)}</span>
        </label>
      </div>

      <svg viewBox={`0 0 ${VIEW} ${VIEW}`} className="mx-auto w-full max-w-md select-none rounded-lg bg-slate-50 dark:bg-slate-950">
        {geometry.rss.map((row, rowIndex) =>
          row.map((value, columnIndex) => (
            <rect
              key={`${rowIndex}-${columnIndex}`}
              x={toX(geometry.first_axis[columnIndex]) - cell / 2}
              y={toY(geometry.second_axis[rowIndex]) - cell / 2}
              width={cell + 0.5}
              height={cell + 0.5}
              fill="#6366f1"
              opacity={shade(value)}
            />
          )),
        )}
        {contours.map((segments, level) => (
          <g key={level}>
            {segments.map((segment, position) => (
              <line
                key={position}
                x1={toX(geometry.first_axis[0] + segment[0] * (2 * reach) / (size - 1))}
                y1={toY(geometry.second_axis[0] + segment[1] * (2 * reach) / (size - 1))}
                x2={toX(geometry.first_axis[0] + segment[2] * (2 * reach) / (size - 1))}
                y2={toY(geometry.second_axis[0] + segment[3] * (2 * reach) / (size - 1))}
                stroke="white"
                strokeWidth={0.8}
                opacity={0.7}
              />
            ))}
          </g>
        ))}
        <line x1={PAD} y1={toY(0)} x2={PAD + PLOT} y2={toY(0)} stroke="currentColor" className="text-slate-400 dark:text-slate-500" strokeWidth={1} />
        <line x1={toX(0)} y1={PAD} x2={toX(0)} y2={PAD + PLOT} stroke="currentColor" className="text-slate-400 dark:text-slate-500" strokeWidth={1} />

        <path d={shapePath} fill={model === "ridge" ? "#f59e0b" : "#10b981"} fillOpacity={0.12} stroke={model === "ridge" ? "#f59e0b" : "#10b981"} strokeWidth={2} />

        <circle cx={toX(geometry.original.least_squares.first)} cy={toY(geometry.original.least_squares.second)} r={6} fill="#0f172a" stroke="white" strokeWidth={1.5} />
        <circle cx={toX(solution.first)} cy={toY(solution.second)} r={6} fill={model === "ridge" ? "#f59e0b" : "#10b981"} stroke="white" strokeWidth={1.5} />
        {showPerturbed && (
          <>
            <circle cx={toX(geometry.perturbed.least_squares.first)} cy={toY(geometry.perturbed.least_squares.second)} r={6} fill="none" stroke="#0f172a" strokeWidth={2} />
            <circle cx={toX(perturbedSolution.first)} cy={toY(perturbedSolution.second)} r={6} fill="none" stroke={model === "ridge" ? "#f59e0b" : "#10b981"} strokeWidth={2} />
          </>
        )}
        <text x={PAD + PLOT / 2} y={VIEW - 8} textAnchor="middle" className="fill-slate-500 text-[11px] font-medium dark:fill-slate-400">coefficient on the first column</text>
        <text x={12} y={PAD + PLOT / 2} textAnchor="middle" transform={`rotate(-90 12 ${PAD + PLOT / 2})`} className="fill-slate-500 text-[11px] font-medium dark:fill-slate-400">coefficient on the second column</text>
      </svg>

      <p className="mt-2 text-center text-xs text-slate-500 dark:text-slate-500">
        Darker is a larger RSS, the white lines are contours of equal RSS. The black dot is least squares, the coloured dot the {model} solution, and the shape is the {model === "ridge" ? "circle" : "diamond"} the penalty draws through it. Hollow markers are the jostled sample.
      </p>

      <div className="mt-3 grid grid-cols-2 gap-3">
        <Stat label="least squares" value={pairText(geometry.original.least_squares)} />
        <Stat label={`${model} at λ = ${formatPenalty(penalty)}`} value={pairText(solution)} />
        {showPerturbed && (
          <>
            <Stat label="least squares, jostled" value={pairText(geometry.perturbed.least_squares)} />
            <Stat label={`${model}, jostled`} value={pairText(perturbedSolution)} />
          </>
        )}
      </div>
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
