"use client";

// Three neurons reading the same two numbers, each doing its own arithmetic.
//
// One row per hidden neuron: its two weights, the two products they form
// with the row every neuron was handed, the bias, the score, and what the
// bend made of it. The point of the table is the column that never changes,
// the row itself, against the columns that do. The bend can be switched so
// the scores stay put while the outputs move. Every product, score and
// output is the API's, from the library's neuron-by-neuron route; the
// browser only lays the ledger out.

import { useState } from "react";
import {
  ACTIVATION_LABELS,
  ACTIVATION_NAMES,
  ActivationName,
} from "@/lib/concepts/dense-layers";
import {
  HIDDEN_NAMES,
  INPUT_NAMES,
  SELECT_CLASS,
  Stat,
  show,
  tupleText,
  useForward,
  workedRequest,
} from "./denseLayersFixtures";

export function SharedRowLedger() {
  const [activation, setActivation] =
    useState<ActivationName>("rectified_linear");
  const { pass, message } = useForward(workedRequest(activation));

  if (!pass) {
    return (
      <p className="text-sm text-slate-500 dark:text-slate-400">
        {message ?? "…"}
      </p>
    );
  }

  const hidden = pass.layers[0];
  const route = hidden.neuron_route;

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3 pb-3 text-sm text-slate-600 dark:text-slate-300">
        <span>
          The row every neuron reads is{" "}
          <span className="font-mono">
            ({hidden.inputs.map(show).join(", ")})
          </span>
          .
        </span>
        <label className="flex items-center gap-2">
          bend
          <select
            value={activation}
            onChange={(event) =>
              setActivation(event.target.value as ActivationName)
            }
            className={SELECT_CLASS}
          >
            {ACTIVATION_NAMES.map((name) => (
              <option key={name} value={name}>
                {ACTIVATION_LABELS[name]}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left dark:border-slate-800">
              {[
                "neuron",
                "weights",
                `w₁·${INPUT_NAMES[0]} + w₂·${INPUT_NAMES[1]}`,
                "bias",
                "score z",
                `${hidden.formula}`,
              ].map((heading) => (
                <th
                  key={heading}
                  className="py-2 pr-4 font-semibold text-slate-600 dark:text-slate-400"
                >
                  {heading}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {HIDDEN_NAMES.map((name, neuron) => (
              <tr
                key={name}
                className="border-b border-slate-100 last:border-0 dark:border-slate-800/60"
              >
                <td className="py-2 pr-4 font-mono text-slate-800 dark:text-slate-200">
                  {name}
                </td>
                <td className="py-2 pr-4 font-mono text-slate-800 dark:text-slate-200">
                  ({hidden.weight_matrix[neuron].map(show).join(", ")})
                </td>
                <td className="py-2 pr-4 font-mono text-slate-800 dark:text-slate-200">
                  {route.products[neuron]
                    .map((product) => show(product))
                    .join(" + ")
                    .replace(/\+ −/g, "− ")}
                </td>
                <td className="py-2 pr-4 font-mono text-slate-800 dark:text-slate-200">
                  {show(hidden.bias_vector[neuron])}
                </td>
                <td className="py-2 pr-4 font-mono font-semibold text-slate-900 dark:text-slate-100">
                  {show(route.scores[neuron])}
                </td>
                <td
                  className={`py-2 pr-4 font-mono font-semibold ${
                    route.outputs[neuron] === 0
                      ? "text-slate-400 dark:text-slate-500"
                      : "text-indigo-700 dark:text-indigo-300"
                  }`}
                >
                  {show(route.outputs[neuron])}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat
          label="The layer reads"
          value={tupleText(hidden.reads)}
        />
        <Stat
          label="The layer answers"
          value={tupleText(hidden.answers)}
        />
        <Stat
          label="What the next layer sees"
          value={`(${hidden.outputs.map(show).join(", ")})`}
        />
        <Stat
          label="Parameters in this layer"
          value={String(hidden.n_parameters)}
        />
      </div>
    </div>
  );
}
