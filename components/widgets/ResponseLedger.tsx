"use client";

// What each layer kept from the pass, and what it handed on.
//
// Two cards, one per layer, each holding the three blocks the library's
// response carries: the row the layer read, the scores it formed, and the
// outputs it answered with. The arrow between them is the whole of the
// chain, the first layer's outputs becoming the second layer's inputs, and
// the readout beneath is the stack's answer, which is nothing more than the
// last card's outputs. Switching the hidden bend moves the outputs and
// leaves the scores where they were, which is why both are kept. Every
// number is the API's.

import { useState } from "react";
import {
  ACTIVATION_LABELS,
  ACTIVATION_NAMES,
  ActivationName,
} from "@/lib/concepts/dense-layers";
import {
  SELECT_CLASS,
  Stat,
  show,
  tupleText,
  useForward,
  workedRequest,
} from "./denseLayersFixtures";

export function ResponseLedger() {
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

  const vector = (values: number[]) => `(${values.map(show).join(", ")})`;

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3 pb-3 text-sm text-slate-600 dark:text-slate-300">
        <label className="flex items-center gap-2">
          hidden bend
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
        <span>The pass ran for {pass.purpose}.</span>
      </div>

      <div className="grid gap-3 sm:grid-cols-[1fr_auto_1fr]">
        {pass.layers.map((layer, index) => (
          <div
            key={index}
            className={`rounded-lg border p-3 ${
              index === 0
                ? "border-indigo-300 dark:border-indigo-700"
                : "border-emerald-300 dark:border-emerald-700"
            }`}
          >
            <p className="mb-2 text-sm font-medium text-slate-700 dark:text-slate-200">
              {`layer ${index}, ${index === 0 ? "hidden" : "output"}, ${layer.formula}, reads ${tupleText(layer.reads)} answers ${tupleText(layer.answers)}`}
            </p>
            <table className="w-full text-sm">
              <tbody>
                {[
                  ["inputs", layer.inputs],
                  ["scores", layer.scores],
                  ["outputs", layer.outputs],
                ].map(([label, values]) => (
                  <tr key={label as string}>
                    <td className="py-1 pr-3 text-slate-500 dark:text-slate-400">
                      {label as string}
                    </td>
                    <td
                      className={`py-1 font-mono ${
                        label === "outputs"
                          ? "font-semibold text-slate-900 dark:text-slate-100"
                          : "text-slate-700 dark:text-slate-300"
                      }`}
                    >
                      {vector(values as number[])}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )).flatMap((card, index) =>
          index === 0
            ? [
                card,
                <div
                  key="arrow"
                  className="flex items-center justify-center text-slate-400"
                  aria-hidden="true"
                >
                  <span className="font-mono text-xs">outputs → inputs</span>
                </div>,
              ]
            : [card],
        )}
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Responses kept" value={String(pass.n_layers)} />
        <Stat
          label="The stack's answer"
          value={show(pass.output)}
        />
        <Stat
          label="Hidden scores, unchanged by the bend"
          value={vector(pass.layers[0].scores)}
        />
        <Stat
          label="Hidden outputs, the bend's work"
          value={vector(pass.layers[0].outputs)}
        />
      </div>
    </div>
  );
}
