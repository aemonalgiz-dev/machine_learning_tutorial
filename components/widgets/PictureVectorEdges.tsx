"use client";

// Where a picture's vector stops saying what the page says it says.
//
// Three views of one answer. The first reports what a vector's length is on
// this network, bounded because every coordinate is a hyperbolic tangent. The
// second puts pictures with nothing drawn in them through the network and
// shows that every dark one is given the same vector. The third multiplies
// four pictures through, background and shape alike, and follows how far each
// vector turns from where it started. The API does every calculation; the
// browser only draws.

import { useEffect, useState } from "react";
import { ApiError } from "@/lib/api";
import {
  EdgesAnswer,
  fetchEdges,
} from "@/lib/concepts/a-vector-for-a-picture";
import {
  KIND_COLOUR,
  KindLabel,
  Pending,
  Stat,
  TRAINED_KINDS,
  greyOf,
} from "@/components/widgets/pictureVectorShared";

export function PictureVectorEdges({
  view,
}: {
  view: "lengths" | "blank" | "brightness";
}) {
  const [answer, setAnswer] = useState<EdgesAnswer | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let current = true;
    (async () => {
      try {
        const loaded = await fetchEdges();
        if (current) setAnswer(loaded);
      } catch (error) {
        if (!current) return;
        setMessage(
          error instanceof ApiError ? error.message : "Something went wrong.",
        );
      }
    })();
    return () => {
      current = false;
    };
  }, []);

  if (!answer) return <Pending message={message} />;
  if (view === "lengths") return <Lengths answer={answer} />;
  if (view === "blank") return <Blanks answer={answer} />;
  return <Brightness answer={answer} />;
}

function Lengths({ answer }: { answer: EdgesAnswer }) {
  const lengths = answer.lengths;
  return (
    <div className="grid gap-3 sm:grid-cols-4">
      <Stat label="shortest vector" value={lengths.shortest.toFixed(4)} />
      <Stat label="longest vector" value={lengths.longest.toFixed(4)} />
      <Stat label="mean length" value={lengths.mean.toFixed(4)} />
      <Stat label="longest any vector could be" value={lengths.bound.toFixed(4)} />
      <Stat
        label="coordinates beyond ±0.95"
        value={lengths.saturated_share.toFixed(4)}
      />
      <Stat
        label="length against confidence, correlation"
        value={lengths.confidence_correlation.toFixed(4)}
      />
      <Stat
        label="own kind nearest, by angle"
        value={lengths.nearest_own_kind_by_angle.toFixed(4)}
      />
      <Stat
        label="own kind nearest, by distance"
        value={lengths.nearest_own_kind_by_distance.toFixed(4)}
      />
    </div>
  );
}

function Blanks({ answer }: { answer: EdgesAnswer }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {answer.blanks.map((blank) => {
        const top = Math.max(...blank.probabilities);
        return (
          <div
            key={blank.name}
            className="flex gap-3 rounded-lg border border-slate-200 p-3 dark:border-slate-800"
          >
            <div
              className="h-16 w-16 shrink-0 rounded-sm ring-1 ring-slate-300 dark:ring-slate-700"
              style={{ backgroundColor: greyOf(blank.level) }}
              aria-hidden="true"
            />
            <div className="min-w-0 flex-1 text-xs text-slate-600 dark:text-slate-400">
              <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                {blank.name}
              </p>
              <p>
                called <span className="font-mono">{blank.called}</span> at{" "}
                <span className="font-mono">{top.toFixed(4)}</span>
              </p>
              <p>
                first convolution lit{" "}
                <span className="font-mono">{blank.lit_after_first_convolution}</span>{" "}
                of 1024, flattened lit{" "}
                <span className="font-mono">{blank.lit_after_convolutions}</span> of
                128
              </p>
              <p>
                cosine to the all-black picture{" "}
                <span className="font-mono">
                  {blank.cosine_to_all_black.toFixed(4)}
                </span>
              </p>
              <div className="mt-1.5 space-y-0.5">
                {TRAINED_KINDS.map((kind, index) => {
                  const value = blank.cosine_to_kind[index];
                  return (
                    <div key={kind} className="flex items-center gap-2">
                      <span className="w-14">
                        <KindLabel kind={kind} />
                      </span>
                      <span className="relative h-2 flex-1 rounded-sm bg-slate-100 dark:bg-slate-800">
                        <span className="absolute inset-y-0 left-1/2 w-px bg-slate-300 dark:bg-slate-600" />
                        <span
                          className="absolute inset-y-0 rounded-sm"
                          style={{
                            backgroundColor: KIND_COLOUR[kind],
                            left: value >= 0 ? "50%" : `${50 + value * 50}%`,
                            width: `${Math.abs(value) * 50}%`,
                          }}
                        />
                      </span>
                      <span className="w-14 text-right font-mono">
                        {value.toFixed(4)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        );
      })}
      <p className="text-sm text-slate-500 dark:text-slate-400 sm:col-span-2">
        The bars are the mean cosine from the blank picture&rsquo;s vector to the
        60 held-out pictures of each kind, running from &minus;1 on the left to 1
        on the right.
      </p>
    </div>
  );
}

function Brightness({ answer }: { answer: EdgesAnswer }) {
  const factors = answer.brightness[0].steps.map((step) => step.factor);
  const width = 560;
  const height = 250;
  const left = 46;
  const right = 20;
  const top = 16;
  const bottom = 34;
  const xOf = (index: number) =>
    left + (index / (factors.length - 1)) * (width - left - right);
  const yOf = (value: number) => top + ((1 - value) / 2) * (height - top - bottom);

  return (
    <div>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full"
        role="img"
        aria-label="How far each picture's vector turns as the whole picture is made dimmer or brighter"
      >
        {[-1, -0.5, 0, 0.5, 1].map((value) => (
          <g key={value}>
            <line
              x1={left}
              x2={width - right}
              y1={yOf(value)}
              y2={yOf(value)}
              className="stroke-slate-200 dark:stroke-slate-800"
              strokeWidth={0.8}
            />
            <text
              x={left - 6}
              y={yOf(value) + 4}
              textAnchor="end"
              fontSize={10}
              className="fill-slate-500 dark:fill-slate-400"
            >
              {value.toFixed(1)}
            </text>
          </g>
        ))}
        {factors.map((factor, index) => (
          <text
            key={factor}
            x={xOf(index)}
            y={height - bottom + 16}
            textAnchor="middle"
            fontSize={10}
            className="fill-slate-500 dark:fill-slate-400"
          >
            ×{factor}
          </text>
        ))}
        <line
          x1={xOf(factors.indexOf(1))}
          x2={xOf(factors.indexOf(1))}
          y1={top}
          y2={height - bottom}
          className="stroke-slate-300 dark:stroke-slate-600"
          strokeDasharray="3 3"
        />
        {answer.brightness.map((sweep) => (
          <g key={sweep.kind}>
            <path
              d={sweep.steps
                .map(
                  (step, index) =>
                    `${index === 0 ? "M" : "L"}${xOf(index)},${yOf(step.cosine_to_original)}`,
                )
                .join("")}
              fill="none"
              stroke={KIND_COLOUR[sweep.kind]}
              strokeWidth={2}
            />
            {sweep.steps.map((step, index) => (
              <circle
                key={step.factor}
                cx={xOf(index)}
                cy={yOf(step.cosine_to_original)}
                r={3.5}
                fill={step.called === sweep.kind ? KIND_COLOUR[sweep.kind] : "white"}
                stroke={KIND_COLOUR[sweep.kind]}
                strokeWidth={1.5}
              >
                <title>
                  {`${sweep.kind} at ×${step.factor}, cosine ${step.cosine_to_original.toFixed(4)}, called ${step.called}`}
                </title>
              </circle>
            ))}
          </g>
        ))}
      </svg>
      <div className="mt-1 flex flex-wrap gap-4 text-xs text-slate-600 dark:text-slate-400">
        {answer.brightness.map((sweep) => (
          <KindLabel key={sweep.kind} kind={sweep.kind} />
        ))}
        <span>
          a hollow dot is a brightness at which the network names the picture
          something else
        </span>
      </div>
      <div className="mt-3 overflow-x-auto">
        <table className="w-full border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800">
              <th className="py-1.5 pr-3 text-left font-semibold text-slate-600 dark:text-slate-400">
                named at
              </th>
              {factors.map((factor) => (
                <th
                  key={factor}
                  className="py-1.5 pr-3 text-left font-semibold text-slate-600 dark:text-slate-400"
                >
                  ×{factor}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {answer.brightness.map((sweep) => (
              <tr
                key={sweep.kind}
                className="border-b border-slate-100 last:border-0 dark:border-slate-800/60"
              >
                <td className="py-1.5 pr-3">
                  <KindLabel kind={sweep.kind} />
                </td>
                {sweep.steps.map((step) => (
                  <td
                    key={step.factor}
                    className={`py-1.5 pr-3 font-mono ${
                      step.called === sweep.kind
                        ? "text-slate-700 dark:text-slate-300"
                        : "text-rose-600 dark:text-rose-400"
                    }`}
                  >
                    {step.called}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
        Training drew every background between {answer.training_background[0]}{" "}
        and {answer.training_background[1]} and lifted every shape between{" "}
        {answer.training_lift[0]} and {answer.training_lift[1]} above it, so a
        factor well away from one takes a picture outside anything the network
        was shown.
      </p>
    </div>
  );
}
