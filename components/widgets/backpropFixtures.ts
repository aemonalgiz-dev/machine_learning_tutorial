"use client";

// The worked example every backpropagation widget shares, and one hook that
// fetches its step once per activation and hands it to whoever asks.
//
// The row is (1, 2) with target 1, the hidden neurons are (1, 1), (1, −1)
// and (−1, 1) with no biases, and the output neuron is (1, −1, 2) with no
// bias, so every number on the page can be checked with pencil arithmetic.
// The API runs the row forward, walks the blame back, takes one step and
// checks one weight by nudging; the widgets only choose which part to show.

import { useEffect, useState } from "react";
import {
  ApiError,
  BackpropagationStep,
  CheckedWeight,
  HiddenActivation,
  StepRequest,
  stepBackpropagation,
} from "@/lib/concepts/backpropagation";

export const INPUT_NAMES = ["x₁", "x₂"];
export const HIDDEN_NAMES = ["h₁", "h₂", "h₃"];
export const WORKED_LEARNING_RATE = 0.05;

export function workedRequest(
  activation: HiddenActivation = "rectified_linear",
  checked: CheckedWeight = { layer_index: 1, neuron_index: 0, input_index: 0 },
  learningRate = WORKED_LEARNING_RATE,
): StepRequest {
  return {
    inputs: [1, 2],
    target: 1,
    hidden_activation: activation,
    hidden_neurons: [
      { weights: [1, 1], bias: 0 },
      { weights: [1, -1], bias: 0 },
      { weights: [-1, 1], bias: 0 },
    ],
    output_neuron: { weights: [1, -1, 2], bias: 0 },
    learning_rate: learningRate,
    checked_weight: checked,
  };
}

const cache = new Map<string, Promise<BackpropagationStep>>();

export function fetchWorkedStep(request: StepRequest): Promise<BackpropagationStep> {
  const key = JSON.stringify(request);
  let pending = cache.get(key);
  if (!pending) {
    pending = stepBackpropagation(request).catch((error) => {
      cache.delete(key);
      throw error;
    });
    cache.set(key, pending);
  }
  return pending;
}

export function useWorkedStep(request: StepRequest): {
  step: BackpropagationStep | null;
  message: string | null;
} {
  const [step, setStep] = useState<BackpropagationStep | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const key = JSON.stringify(request);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const answer = await fetchWorkedStep(JSON.parse(key));
        if (!cancelled) setStep(answer);
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
  return { step, message };
}

// Four decimals at most, whole numbers shown whole, and a proper minus sign.
export function show(value: number | undefined): string {
  if (value === undefined) return "…";
  const rounded = Math.round(value * 10000) / 10000;
  const text = Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(4).replace(/0+$/, "");
  return text.replace("-", "−");
}

export const AMBER = "#d97706";
export const INDIGO = "#6366f1";
export const GREEN = "#10b981";
