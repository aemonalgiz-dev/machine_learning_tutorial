"use client";

// One layer asked the same row two ways, and how far apart the answers are.
//
// The matrix route is one multiply for the whole layer; the neuron route
// asks each neuron for its own dot product in turn. On the page's own
// two-wide and three-wide layers the two agree to the last bit, so the
// sliders build a wider layer from a seed, with weights and a row drawn as
// standard normals, and the readouts give the largest gap between the two
// routes' scores and between their outputs, along with the first few scores
// at full precision so the last digits can be compared by eye. The library
// computes both routes; the browser chooses the width.

import { useEffect, useState } from "react";
import {
  ApiError,
  RoutesComparison,
  compareRoutes,
} from "@/lib/concepts/dense-layers";
import {
  ACTIVE_BUTTON_CLASS,
  BUTTON_CLASS,
  Stat,
  showTiny,
  useForward,
  workedRequest,
} from "./denseLayersFixtures";

const DEBOUNCE_MS = 120;

const PRESETS = [
  { label: "2 → 3", inputs: 2, neurons: 3 },
  { label: "8 → 8", inputs: 8, neurons: 8 },
  { label: "16 → 16", inputs: 16, neurons: 16 },
  { label: "64 → 64", inputs: 64, neurons: 64 },
];

export function RouteAgreement() {
  const [inputs, setInputs] = useState(64);
  const [neurons, setNeurons] = useState(64);
  const [seed, setSeed] = useState(0);
  const [comparison, setComparison] = useState<RoutesComparison | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const worked = useForward(workedRequest());

  useEffect(() => {
    const timer = setTimeout(async () => {
      try {
        setComparison(
          await compareRoutes({ n_inputs: inputs, n_neurons: neurons, seed }),
        );
        setMessage(null);
      } catch (error) {
        if (error instanceof ApiError) setMessage(error.message);
        else setMessage("Something went wrong.");
      }
    }, DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [inputs, neurons, seed]);

  const workedGap = worked.pass
    ? Math.max(...worked.pass.layers.map((layer) => layer.route_gap))
    : undefined;

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 pb-3">
        {PRESETS.map((preset) => (
          <button
            key={preset.label}
            onClick={() => {
              setInputs(preset.inputs);
              setNeurons(preset.neurons);
            }}
            className={
              inputs === preset.inputs && neurons === preset.neurons
                ? ACTIVE_BUTTON_CLASS
                : BUTTON_CLASS
            }
          >
            {preset.label}
          </button>
        ))}
        <button onClick={() => setSeed((seed + 1) % 10000)} className={BUTTON_CLASS}>
          New draw
        </button>
      </div>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-600 dark:text-slate-300">
        <label className="flex flex-1 items-center gap-2">
          inputs read
          <input
            type="range"
            min={1}
            max={64}
            step={1}
            value={inputs}
            onChange={(event) => setInputs(Number(event.target.value))}
            className="flex-1 accent-indigo-600"
          />
          <span className="w-8 text-right font-mono">{inputs}</span>
        </label>
        <label className="flex flex-1 items-center gap-2">
          neurons
          <input
            type="range"
            min={1}
            max={64}
            step={1}
            value={neurons}
            onChange={(event) => setNeurons(Number(event.target.value))}
            className="flex-1 accent-indigo-600"
          />
          <span className="w-8 text-right font-mono">{neurons}</span>
        </label>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat
          label="Worked network, largest gap"
          value={showTiny(workedGap)}
        />
        <Stat
          label="Seeded layer, parameters"
          value={comparison ? String(comparison.n_parameters) : "…"}
        />
        <Stat
          label="Largest gap in the scores"
          value={showTiny(comparison?.score_gap)}
        />
        <Stat
          label="Largest gap in the outputs"
          value={showTiny(comparison?.output_gap)}
        />
      </div>

      {comparison && (
        <div className="mt-3 overflow-x-auto">
          <table className="text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left dark:border-slate-800">
                <th className="py-1 pr-4 font-semibold text-slate-600 dark:text-slate-400">
                  neuron
                </th>
                <th className="py-1 pr-4 font-semibold text-slate-600 dark:text-slate-400">
                  score by the matrix
                </th>
                <th className="py-1 font-semibold text-slate-600 dark:text-slate-400">
                  score by the neuron
                </th>
              </tr>
            </thead>
            <tbody>
              {comparison.first_scores_matrix.map((score, index) => (
                <tr
                  key={index}
                  className="border-b border-slate-100 last:border-0 dark:border-slate-800/60"
                >
                  <td className="py-1 pr-4 font-mono text-slate-700 dark:text-slate-300">
                    {index + 1}
                  </td>
                  <td className="py-1 pr-4 font-mono text-slate-800 dark:text-slate-200">
                    {String(score).replace("-", "−")}
                  </td>
                  <td
                    className={`py-1 font-mono ${
                      score === comparison.first_scores_loop[index]
                        ? "text-slate-800 dark:text-slate-200"
                        : "text-amber-700 dark:text-amber-400"
                    }`}
                  >
                    {String(comparison.first_scores_loop[index]).replace("-", "−")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <p className="mt-2 text-xs text-slate-500 dark:text-slate-500">
        A score printed in amber differs from its neighbour in the last digit
        or two. The gap is the order the products were summed in and nothing
        else.
      </p>

      {message && (
        <p className="mt-3 text-sm text-amber-600 dark:text-amber-400">
          {message}
        </p>
      )}
    </div>
  );
}
