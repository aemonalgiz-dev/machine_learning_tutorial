"use client";

// A whole chain of dense layers, checked seam by seam with no row sent.
//
// Each card is one layer stating the width it reads and the width it
// answers with, and between every pair of cards is a seam. The library is
// asked to stack the whole chain at once and either the stack exists, with
// its shape end to end and its parameter count, or the library refuses at
// the first seam that does not hold, naming its position and both widths in
// its own words. That sentence is printed under the seam it names. Layers
// can be added and removed, and every width edited. Nothing here reads a
// weight; the verdict is a comparison of integers.

import { useEffect, useState } from "react";
import {
  ApiError,
  ChainVerdict,
  DenseShape,
  stackChain,
} from "@/lib/concepts/dense-layers";
import {
  ACTIVE_BUTTON_CLASS,
  BOX_CLASS,
  BUTTON_CLASS,
  Stat,
  tupleText,
} from "./denseLayersFixtures";

const MAX_WIDTH = 8;
const MAX_LAYERS = 6;
const DEBOUNCE_MS = 150;

const CARD = { width: 120, height: 74, top: 30, gap: 42 };
const VIEW_HEIGHT = 170;

type Preset = "holds" | "second" | "two";

const PRESETS: Record<Preset, { label: string; layers: DenseShape[] }> = {
  holds: {
    label: "A chain that holds",
    layers: [
      { reads: 2, answers: 3 },
      { reads: 3, answers: 4 },
      { reads: 4, answers: 1 },
    ],
  },
  second: {
    label: "Second seam broken",
    layers: [
      { reads: 2, answers: 3 },
      { reads: 3, answers: 4 },
      { reads: 5, answers: 1 },
    ],
  },
  two: {
    label: "Two seams broken",
    layers: [
      { reads: 2, answers: 3 },
      { reads: 4, answers: 4 },
      { reads: 5, answers: 1 },
    ],
  },
};

function clampWidth(text: string): number {
  const value = Math.round(Number(text));
  if (!Number.isFinite(value)) return 1;
  return Math.min(MAX_WIDTH, Math.max(1, value));
}

// The seam a refusal names, read from the library's own sentence.
function namedSeam(refusal: string): number | null {
  const match = /^layer (\d+) answers with/.exec(refusal);
  return match ? Number(match[1]) : null;
}

export function ChainChecker() {
  const [layers, setLayers] = useState<DenseShape[]>(PRESETS.holds.layers);
  const [preset, setPreset] = useState<Preset | null>("holds");
  const [verdict, setVerdict] = useState<ChainVerdict | null>(null);
  const [refusal, setRefusal] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(async () => {
      try {
        setVerdict(await stackChain(layers));
        setRefusal(null);
        setMessage(null);
      } catch (error) {
        setVerdict(null);
        if (error instanceof ApiError && error.kind === "refused") {
          setRefusal(error.message);
          setMessage(null);
        } else if (error instanceof ApiError) {
          setRefusal(null);
          setMessage(error.message);
        } else {
          setRefusal(null);
          setMessage("Something went wrong.");
        }
      }
    }, DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [layers]);

  const choose = (key: Preset) => {
    setPreset(key);
    setLayers(PRESETS[key].layers);
  };

  const setWidth = (index: number, side: keyof DenseShape, text: string) => {
    setPreset(null);
    setLayers((current) =>
      current.map((layer, position) =>
        position === index ? { ...layer, [side]: clampWidth(text) } : layer,
      ),
    );
  };

  const brokenSeam = refusal ? namedSeam(refusal) : null;
  const viewWidth = 24 + layers.length * CARD.width + (layers.length - 1) * CARD.gap + 24;

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 pb-3">
        {(Object.keys(PRESETS) as Preset[]).map((key) => (
          <button
            key={key}
            onClick={() => choose(key)}
            className={key === preset ? ACTIVE_BUTTON_CLASS : BUTTON_CLASS}
          >
            {PRESETS[key].label}
          </button>
        ))}
        <button
          onClick={() => {
            setPreset(null);
            setLayers((current) =>
              current.length < MAX_LAYERS
                ? [...current, { reads: current[current.length - 1].answers, answers: 1 }]
                : current,
            );
          }}
          className={BUTTON_CLASS}
          disabled={layers.length >= MAX_LAYERS}
        >
          Add a layer
        </button>
        <button
          onClick={() => {
            setPreset(null);
            setLayers((current) => (current.length > 1 ? current.slice(0, -1) : current));
          }}
          className={BUTTON_CLASS}
          disabled={layers.length <= 1}
        >
          Remove the last
        </button>
      </div>

      <svg
        viewBox={`0 0 ${viewWidth} ${VIEW_HEIGHT}`}
        className="w-full select-none rounded-lg bg-slate-50 dark:bg-slate-950"
      >
        {layers.map((layer, index) => {
          const left = 24 + index * (CARD.width + CARD.gap);
          const seamY = CARD.top + CARD.height / 2;
          const seamHolds =
            index < layers.length - 1 && layer.answers === layers[index + 1].reads;
          const seamNamed = brokenSeam === index;
          return (
            <g key={index}>
              <rect
                x={left}
                y={CARD.top}
                width={CARD.width}
                height={CARD.height}
                rx={8}
                className="fill-white stroke-indigo-500 dark:fill-slate-900"
                strokeWidth={1.5}
              />
              <text
                x={left + CARD.width / 2}
                y={CARD.top - 9}
                textAnchor="middle"
                className="fill-slate-500 text-[11px] font-medium dark:fill-slate-400"
              >
                {`layer ${index}`}
              </text>
              <text
                x={left + CARD.width / 2}
                y={CARD.top + 30}
                textAnchor="middle"
                className="fill-slate-900 font-mono text-[12px] dark:fill-slate-100"
              >
                {`reads ${tupleText([layer.reads])}`}
              </text>
              <text
                x={left + CARD.width / 2}
                y={CARD.top + 54}
                textAnchor="middle"
                className="fill-slate-900 font-mono text-[12px] dark:fill-slate-100"
              >
                {`answers ${tupleText([layer.answers])}`}
              </text>
              {index < layers.length - 1 && (
                <g
                  className={
                    seamNamed
                      ? "stroke-rose-500 fill-rose-500"
                      : verdict
                        ? "stroke-emerald-500 fill-emerald-500"
                        : seamHolds
                          ? "stroke-slate-400 fill-slate-400"
                          : "stroke-amber-500 fill-amber-500"
                  }
                >
                  <line
                    x1={left + CARD.width}
                    y1={seamY}
                    x2={left + CARD.width + CARD.gap - 10}
                    y2={seamY}
                    strokeWidth={3}
                  />
                  <polygon
                    points={`${left + CARD.width + CARD.gap - 12},${seamY - 6} ${left + CARD.width + CARD.gap - 2},${seamY} ${left + CARD.width + CARD.gap - 12},${seamY + 6}`}
                    strokeWidth={0}
                  />
                  <text
                    x={left + CARD.width + CARD.gap / 2}
                    y={CARD.top + CARD.height + 18}
                    textAnchor="middle"
                    className="stroke-none fill-slate-500 text-[10px] dark:fill-slate-400"
                  >
                    {`seam ${index}`}
                  </text>
                </g>
              )}
            </g>
          );
        })}
        <text
          x={viewWidth / 2}
          y={VIEW_HEIGHT - 16}
          textAnchor="middle"
          className={`font-mono text-[12px] font-medium ${
            verdict
              ? "fill-emerald-700 dark:fill-emerald-400"
              : refusal
                ? "fill-rose-700 dark:fill-rose-400"
                : "fill-slate-500 dark:fill-slate-400"
          }`}
        >
          {verdict
            ? `The stack exists. It reads ${tupleText(verdict.stack.reads)} and answers ${tupleText(verdict.stack.answers)}.`
            : (refusal ?? "…")}
        </text>
      </svg>

      <div className="mt-3 grid gap-2 sm:grid-cols-3">
        {layers.map((layer, index) => (
          <div
            key={index}
            className="flex flex-wrap items-center gap-3 rounded-lg bg-slate-100 px-3 py-2 text-sm text-slate-600 dark:bg-slate-800 dark:text-slate-300"
          >
            <span className="text-xs text-slate-500 dark:text-slate-400">{`layer ${index}`}</span>
            <label className="flex items-center gap-2">
              reads
              <input
                type="number"
                min={1}
                max={MAX_WIDTH}
                step={1}
                value={layer.reads}
                onChange={(event) => setWidth(index, "reads", event.target.value)}
                className={BOX_CLASS}
              />
            </label>
            <label className="flex items-center gap-2">
              answers
              <input
                type="number"
                min={1}
                max={MAX_WIDTH}
                step={1}
                value={layer.answers}
                onChange={(event) => setWidth(index, "answers", event.target.value)}
                className={BOX_CLASS}
              />
            </label>
          </div>
        ))}
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Layers" value={String(layers.length)} />
        <Stat label="Seams checked" value={verdict ? String(verdict.n_seams) : refusal ? `stopped at seam ${brokenSeam ?? "…"}` : "…"} />
        <Stat label="Parameters, if it exists" value={verdict ? String(verdict.n_parameters) : "none"} />
        <Stat label="Rows sent" value="0" />
      </div>

      {message && (
        <p className="mt-3 text-sm text-amber-600 dark:text-amber-400">
          {message}
        </p>
      )}
    </div>
  );
}
