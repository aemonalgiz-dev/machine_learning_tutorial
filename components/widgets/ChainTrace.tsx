"use client";

// One chain, one fit, one predict, followed step by step.
//
// Nine of the twelve people train the chain and three are held out. The
// boxes are the chain's steps in running order, expand height to its square,
// standardize both columns, then ridge, and each box says what it read, what
// it produced and what it learned from the training people alone. Under the
// boxes the three held-out people go through, height to standardized height
// to predicted weight, using the centre and spread the training people
// taught, and the readout beside them is what the library says when one
// person is standardized on their own. The API fits and predicts; the browser
// draws the boxes.

import { useEffect, useState } from "react";
import { ApiError } from "@/lib/api";
import { ChainAnatomy, fetchAnatomy } from "@/lib/concepts/pipelines";
import {
  ACTIVE_CLASS,
  BUTTON_CLASS,
  MIDDLE_THREE,
  PAGE_DEGREE,
  PAGE_FOLDS,
  PAGE_PENALTY,
  PAGE_SEED,
  TALLEST_THREE,
  TWELVE_PEOPLE,
} from "./pipelinesFixtures";

const VIEW = { width: 640, height: 150 };
const BOX = { width: 176, height: 118, top: 16 };
const GAP = (VIEW.width - 3 * BOX.width) / 4;

type HeldOutChoice = "middle" | "tallest";

export function ChainTrace() {
  const [choice, setChoice] = useState<HeldOutChoice>("middle");
  const [answer, setAnswer] = useState<{
    choice: HeldOutChoice;
    anatomy: ChainAnatomy;
  } | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const anatomy = await fetchAnatomy(
          TWELVE_PEOPLE,
          choice === "middle" ? MIDDLE_THREE : TALLEST_THREE,
          PAGE_DEGREE,
          PAGE_PENALTY,
          PAGE_FOLDS,
          PAGE_SEED,
        );
        if (cancelled) return;
        setAnswer({ choice, anatomy });
        setMessage(null);
      } catch (error) {
        if (cancelled) return;
        if (error instanceof ApiError) setMessage(error.message);
        else setMessage("Something went wrong.");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [choice]);

  const anatomy = answer && answer.choice === choice ? answer.anatomy : null;
  const scaler = anatomy?.steps.find((step) => step.name === "scaler") ?? null;
  const terms = anatomy?.steps.find((step) => step.name === "terms") ?? null;

  const boxes = [
    {
      title: `expand to degree ${PAGE_DEGREE}`,
      lines: terms
        ? [
            `reads ${terms.reads.join(", ")}`,
            `produces ${terms.produces.join(", ")}`,
            "learns which columns to make",
          ]
        : ["…"],
    },
    {
      title: "standardize",
      lines: scaler
        ? scaler.learned.map(
            (scaling) =>
              `${scaling.name}: ${scaling.mean.toFixed(1)} ± ${scaling.standard_deviation.toFixed(1)}`,
          )
        : ["…"],
    },
    {
      title: `ridge, penalty ${PAGE_PENALTY}`,
      lines: anatomy
        ? [
            ...anatomy.coefficients.map(
              (coefficient) =>
                `${coefficient.name}: ${coefficient.value.toFixed(3)}`,
            ),
            `intercept: ${anatomy.intercept.toFixed(2)}`,
          ]
        : ["…"],
    },
  ];

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 pb-3">
        <button
          onClick={() => setChoice("middle")}
          className={choice === "middle" ? ACTIVE_CLASS : BUTTON_CLASS}
        >
          Hold out three from the middle
        </button>
        <button
          onClick={() => setChoice("tallest")}
          className={choice === "tallest" ? ACTIVE_CLASS : BUTTON_CLASS}
        >
          Hold out the three tallest
        </button>
      </div>

      <svg
        viewBox={`0 0 ${VIEW.width} ${VIEW.height}`}
        className="w-full select-none rounded-lg bg-slate-50 dark:bg-slate-950"
      >
        {boxes.map((box, position) => {
          const left = GAP + position * (BOX.width + GAP);
          return (
            <g key={box.title}>
              {position > 0 && (
                <path
                  d={`M ${left - GAP + 6} ${BOX.top + BOX.height / 2} L ${left - 6} ${BOX.top + BOX.height / 2}`}
                  stroke="currentColor"
                  className="text-slate-400 dark:text-slate-600"
                  strokeWidth={1.5}
                  markerEnd="url(#chain-arrow)"
                />
              )}
              <rect
                x={left}
                y={BOX.top}
                width={BOX.width}
                height={BOX.height}
                rx={8}
                className="fill-white stroke-indigo-400 dark:fill-slate-900 dark:stroke-indigo-500"
                strokeWidth={1.5}
              />
              <text
                x={left + 10}
                y={BOX.top + 22}
                className="fill-indigo-700 text-[13px] font-semibold dark:fill-indigo-300"
              >
                {box.title}
              </text>
              {box.lines.map((line, row) => (
                <text
                  key={`${box.title}${row}`}
                  x={left + 10}
                  y={BOX.top + 46 + row * 20}
                  className="fill-slate-700 font-mono text-[11px] dark:fill-slate-300"
                >
                  {line}
                </text>
              ))}
            </g>
          );
        })}
        <defs>
          <marker
            id="chain-arrow"
            viewBox="0 0 10 10"
            refX="9"
            refY="5"
            markerWidth="7"
            markerHeight="7"
            orient="auto"
          >
            <path d="M 0 0 L 10 5 L 0 10 z" className="fill-slate-400 dark:fill-slate-600" />
          </marker>
        </defs>
      </svg>

      <div className="mt-3 overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left dark:border-slate-800">
              {["held-out person", "height", "standardized by the training nine", "predicted weight", "true weight"].map((heading) => (
                <th key={heading} className="py-2 pr-4 font-semibold text-slate-600 last:pr-0 dark:text-slate-400">
                  {heading}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(anatomy?.held_out ?? []).map((person) => (
              <tr key={person.index} className="border-b border-slate-100 last:border-0 dark:border-slate-800/60">
                <td className="py-1.5 pr-4 text-slate-800 dark:text-slate-200">person {person.index + 1}</td>
                <td className="py-1.5 pr-4 font-mono text-slate-800 dark:text-slate-200">{person.height.toFixed(0)} cm</td>
                <td className="py-1.5 pr-4 font-mono text-slate-800 dark:text-slate-200">{person.standardized_height.toFixed(3)}</td>
                <td className="py-1.5 pr-4 font-mono text-slate-800 dark:text-slate-200">{person.predicted_weight.toFixed(2)} kg</td>
                <td className="py-1.5 font-mono text-slate-800 dark:text-slate-200">{person.weight.toFixed(0)} kg</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat
          label="Training centre for height"
          value={scaler ? `${scaler.learned[0].mean.toFixed(2)} cm` : "…"}
        />
        <Stat
          label="Training spread for height"
          value={scaler ? `${scaler.learned[0].standard_deviation.toFixed(2)} cm` : "…"}
        />
        <Stat label="Held-out R²" value={anatomy ? anatomy.held_out_r2.toFixed(4) : "…"} />
        <Stat label="Training R²" value={anatomy ? anatomy.training_r2.toFixed(4) : "…"} />
      </div>

      {anatomy && (
        <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
          Standardizing the first held-out person on their own is refused,{" "}
          <span className="font-mono">{anatomy.alone.error}</span>, {anatomy.alone.detail}.
          One height has no spread to divide by, which is why the training
          people&rsquo;s centre and spread are reused on them instead.
        </p>
      )}

      {message && (
        <p className="mt-3 text-sm text-amber-600 dark:text-amber-400">{message}</p>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-slate-100 px-3 py-2 dark:bg-slate-800">
      <div className="text-xs text-slate-500 dark:text-slate-400">{label}</div>
      <div className="font-mono text-base font-semibold text-slate-900 dark:text-slate-100">
        {value}
      </div>
    </div>
  );
}
