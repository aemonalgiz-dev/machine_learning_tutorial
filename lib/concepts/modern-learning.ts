import { postJson } from "@/lib/api";

export interface ModernView {
  notice: string;
  tables: { title: string; columns: string[]; rows: (string | number)[][] }[];
  notes: string[];
}

type Control =
  | { key: string; label: string; kind: "range"; initial: number; min: number; max: number; step: number }
  | { key: string; label: string; kind: "checkbox"; initial: boolean }
  | { key: string; label: string; kind: "select"; initial: string; options: string[] }
  | { key: string; label: string; kind: "text"; initial: string };

export const modernControls = {
  "transformer-blocks": [
    { key: "animal", label: "Last token", kind: "select", initial: "cat", options: ["cat", "dog"] },
  ],
  "next-token-prediction": [
    { key: "confidence", label: "Assigned target logit", kind: "range", initial: 1, min: 0, max: 4, step: 0.1 },
  ],
  "autoregressive-generation": [
    { key: "max_new_tokens", label: "Maximum new tokens", kind: "range", initial: 5, min: 1, max: 12, step: 1 },
    { key: "temperature", label: "Temperature", kind: "range", initial: 1, min: 0.1, max: 3, step: 0.1 },
    { key: "seed", label: "Sampling seed", kind: "range", initial: 0, min: 0, max: 100, step: 1 },
    { key: "greedy", label: "Always choose the most probable token", kind: "checkbox", initial: false },
  ],
  "sampling-and-temperature": [
    { key: "temperature", label: "Temperature", kind: "range", initial: 1, min: 0.1, max: 3, step: 0.1 },
    { key: "top_p", label: "Top-p threshold", kind: "range", initial: 1, min: 0.05, max: 1, step: 0.05 },
  ],
  "autoencoders": [
    { key: "difference", label: "Offset from the shared average", kind: "range", initial: 0, min: -2, max: 2, step: 0.1 },
  ],
  "variational-autoencoders": [
    { key: "mean", label: "Latent mean", kind: "range", initial: 0, min: -2, max: 2, step: 0.1 },
    { key: "deviation", label: "Latent standard deviation", kind: "range", initial: 1, min: 0.1, max: 2, step: 0.1 },
    { key: "noise", label: "Chosen noise draw", kind: "range", initial: 0.5, min: -2, max: 2, step: 0.1 },
  ],
  "generative-adversarial-networks": [
    { key: "steps", label: "Alternating training steps", kind: "range", initial: 30, min: 0, max: 150, step: 1 },
    { key: "learning_rate", label: "Learning rate", kind: "range", initial: 0.1, min: 0.01, max: 0.3, step: 0.01 },
  ],
  "diffusion-models": [
    { key: "step", label: "Forward noise step", kind: "range", initial: 5, min: 0, max: 20, step: 1 },
    { key: "estimate_fraction", label: "Fraction of true noise supplied by the oracle", kind: "range", initial: 0, min: 0, max: 1, step: 0.1 },
  ],
  "supervised-fine-tuning": [
    { key: "confidence", label: "Assigned target logit", kind: "range", initial: 1, min: 0, max: 4, step: 0.1 },
    { key: "response_only", label: "Score only the response targets", kind: "checkbox", initial: true },
  ],
  "low-rank-adaptation": [
    { key: "rank", label: "Adapter rank", kind: "range", initial: 1, min: 1, max: 3, step: 1 },
    { key: "alpha", label: "Adapter alpha", kind: "range", initial: 1, min: 0.1, max: 4, step: 0.1 },
  ],
  "reinforcement-learning": [
    { key: "episodes", label: "Training episodes", kind: "range", initial: 60, min: 0, max: 200, step: 1 },
    { key: "learning_rate", label: "Learning rate", kind: "range", initial: 0.1, min: 0.01, max: 0.5, step: 0.01 },
    { key: "seed", label: "Sampling seed", kind: "range", initial: 0, min: 0, max: 100, step: 1 },
  ],
  "retrieval-augmented-generation": [
    { key: "query", label: "Words to search for", kind: "text", initial: "library Saturday" },
    { key: "limit", label: "Maximum passages", kind: "range", initial: 2, min: 1, max: 3, step: 1 },
  ],
  "evaluating-generative-models": [
    { key: "confidence", label: "Boost applied to one candidate logit", kind: "range", initial: 1, min: 0, max: 4, step: 0.1 },
    { key: "wrong", label: "Boost the wrong token", kind: "checkbox", initial: false },
  ],
} satisfies Record<string, Control[]>;

export type ModernTopic = keyof typeof modernControls;
export type ExampleInputs = Record<string, string | number | boolean>;
export const calculateModern = (topic: ModernTopic, inputs: ExampleInputs) =>
  postJson<ModernView>(`/concepts/modern/${topic}`, inputs);

export function controlsFor(topic: ModernTopic): Control[] {
  return modernControls[topic];
}
