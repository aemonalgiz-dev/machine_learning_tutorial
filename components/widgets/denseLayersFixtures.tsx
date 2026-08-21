"use client";

// What every dense-layers widget on the page shares.
//
// The running example is the backpropagation page's network: the row (1, 2),
// which is a person one deviation taller and two deviations heavier than the
// crowd's average, three hidden neurons (1, 1), (1, −1) and (−1, 1) with no
// biases under the rectifier, and one output neuron (1, −1, 2) with no bias
// under the identity. The hidden scores are 3, −1 and 1, the rectifier turns
// the middle one to 0, and the output is 5. The API runs every pass; the
// widgets only choose which part of it to draw, and this module hands them
// one shared answer per request rather than one per widget.

import { useEffect, useState } from "react";
import {
  ActivationName,
  ApiError,
  ForwardPass,
  ForwardRequest,
  LayerWeights,
  forwardPass,
} from "@/lib/concepts/dense-layers";

export const INPUT_NAMES = ["x₁", "x₂"];
export const HIDDEN_NAMES = ["h₁", "h₂", "h₃"];
export const OUTPUT_NAMES = ["y"];

export const WORKED_ROW = [1, 2];

export const WORKED_HIDDEN: LayerWeights = {
  weights: [
    [1, 1],
    [1, -1],
    [-1, 1],
  ],
  biases: [0, 0, 0],
  activation: "rectified_linear",
};

export const WORKED_OUTPUT: LayerWeights = {
  weights: [[1, -1, 2]],
  biases: [0],
  activation: "identity",
};

export function workedRequest(
  hiddenActivation: ActivationName = "rectified_linear",
  outputActivation: ActivationName = "identity",
): ForwardRequest {
  return {
    inputs: WORKED_ROW,
    hidden: { ...WORKED_HIDDEN, activation: hiddenActivation },
    output: { ...WORKED_OUTPUT, activation: outputActivation },
  };
}

const cache = new Map<string, Promise<ForwardPass>>();

export function fetchForward(request: ForwardRequest): Promise<ForwardPass> {
  const key = JSON.stringify(request);
  let pending = cache.get(key);
  if (!pending) {
    pending = forwardPass(request).catch((error) => {
      cache.delete(key);
      throw error;
    });
    cache.set(key, pending);
  }
  return pending;
}

export function useForward(request: ForwardRequest): {
  pass: ForwardPass | null;
  message: string | null;
} {
  const [pass, setPass] = useState<ForwardPass | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const key = JSON.stringify(request);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const answer = await fetchForward(JSON.parse(key));
        if (!cancelled) setPass(answer);
      } catch (error) {
        if (cancelled) return;
        if (error instanceof ApiError) setMessage(error.message);
        else setMessage("Something went wrong.");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [key]);
  return { pass, message };
}

// Four decimals at most, whole numbers shown whole, and a proper minus sign.
export function show(value: number | undefined | null): string {
  if (value === undefined || value === null) return "…";
  const rounded = Math.round(value * 10000) / 10000;
  const text = Number.isInteger(rounded)
    ? String(rounded)
    : rounded.toFixed(4).replace(/0+$/, "");
  return text.replace("-", "−");
}

// A gap of a few machine epsilons, shown as it is rather than rounded away.
export function showTiny(value: number | undefined | null): string {
  if (value === undefined || value === null) return "…";
  if (value === 0) return "0";
  return value.toExponential(2).replace("-", "−");
}

// The library's tuple, with the trailing comma a one-entry tuple carries.
export function tupleText(extents: number[]): string {
  return `(${extents.join(", ")}${extents.length === 1 ? "," : ""})`;
}

export const BUTTON_CLASS =
  "rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700";

export const ACTIVE_BUTTON_CLASS =
  "rounded-md border border-indigo-500 bg-indigo-50 px-3 py-1.5 text-sm font-medium text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300";

export const SELECT_CLASS =
  "rounded border border-slate-300 bg-white px-2 py-1 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200";

export const BOX_CLASS =
  "w-14 rounded border border-slate-300 bg-white px-1.5 py-0.5 text-right font-mono text-sm text-slate-800 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100";

export function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-slate-100 px-3 py-2 dark:bg-slate-800">
      <div className="text-xs text-slate-500 dark:text-slate-400">{label}</div>
      <div className="font-mono text-base font-semibold text-slate-900 dark:text-slate-100">
        {value}
      </div>
    </div>
  );
}
