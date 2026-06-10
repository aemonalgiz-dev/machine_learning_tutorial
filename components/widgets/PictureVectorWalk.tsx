"use client";

// The shared picture network taken apart, and four pictures read through it.
//
// Two views of one answer. The first lists the layers, what shape each hands
// on and how many numbers it learned, so a reader can see the vector is one
// layer among seven. The second puts the first held-out picture of each kind
// through the network and draws the sixteen numbers of its vector as bars,
// with the cosines between the four vectors beside the straight-line
// distances between their pixels. The API does every calculation; the
// browser only draws.

import { useEffect, useState } from "react";
import { ApiError } from "@/lib/api";
import { WalkAnswer, fetchWalk } from "@/lib/concepts/a-vector-for-a-picture";
import {
  KIND_COLOUR,
  KindLabel,
  Pending,
  PictureCells,
  Stat,
} from "@/components/widgets/pictureVectorShared";

export function PictureVectorWalk({ view }: { view: "layers" | "four" }) {
  const [answer, setAnswer] = useState<WalkAnswer | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let current = true;
    (async () => {
      try {
        const loaded = await fetchWalk();
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
  return view === "layers" ? <Layers answer={answer} /> : <Four answer={answer} />;
}

function Layers({ answer }: { answer: WalkAnswer }) {
  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left dark:border-slate-800">
              <th className="py-2 pr-4 font-semibold text-slate-600 dark:text-slate-400">
                step
              </th>
              <th className="py-2 pr-4 font-semibold text-slate-600 dark:text-slate-400">
                hands on
              </th>
              <th className="py-2 pr-4 font-semibold text-slate-600 dark:text-slate-400">
                numbers
              </th>
              <th className="py-2 font-semibold text-slate-600 dark:text-slate-400">
                learned
              </th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-slate-100 dark:border-slate-800/60">
              <td className="py-2 pr-4 text-slate-700 dark:text-slate-300">
                the picture
              </td>
              <td className="py-2 pr-4 font-mono text-slate-800 dark:text-slate-200">
                1 × 16 × 16
              </td>
              <td className="py-2 pr-4 font-mono text-slate-800 dark:text-slate-200">
                256
              </td>
              <td className="py-2 font-mono text-slate-800 dark:text-slate-200">
                0
              </td>
            </tr>
            {answer.layers.map((layer) => {
              const isVector = layer.position === answer.layers.length - 2;
              return (
                <tr
                  key={layer.position}
                  className={`border-b border-slate-100 last:border-0 dark:border-slate-800/60 ${
                    isVector ? "bg-indigo-50/70 dark:bg-indigo-950/30" : ""
                  }`}
                >
                  <td className="py-2 pr-4 text-slate-700 dark:text-slate-300">
                    {layer.name}
                  </td>
                  <td className="py-2 pr-4 font-mono text-slate-800 dark:text-slate-200">
                    {layer.answer_shape.join(" × ")}
                  </td>
                  <td className="py-2 pr-4 font-mono text-slate-800 dark:text-slate-200">
                    {layer.n_numbers}
                  </td>
                  <td className="py-2 font-mono text-slate-800 dark:text-slate-200">
                    {layer.n_parameters}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-4">
        <Stat label="numbers learned in all" value={String(answer.n_parameters)} />
        <Stat
          label="pictures it learned from"
          value={String(answer.n_training)}
        />
        <Stat
          label="named right, training half"
          value={answer.training_accuracy.toFixed(4)}
        />
        <Stat
          label="named right, held-out half"
          value={answer.held_out_accuracy.toFixed(4)}
        />
      </div>
    </div>
  );
}

function VectorBars({ vector, colour }: { vector: number[]; colour: string }) {
  const width = vector.length * 9;
  const middle = 32;
  return (
    <svg
      viewBox={`0 0 ${width} 64`}
      className="w-full max-w-[9rem]"
      role="img"
      aria-label="The sixteen numbers of the vector, each a bar above or below zero"
    >
      <line
        x1={0}
        x2={width}
        y1={middle}
        y2={middle}
        className="stroke-slate-300 dark:stroke-slate-700"
        strokeWidth={0.8}
      />
      {vector.map((value, index) => (
        <rect
          key={index}
          x={index * 9 + 1}
          width={7}
          y={value >= 0 ? middle - value * 30 : middle}
          height={Math.abs(value) * 30}
          fill={colour}
          opacity={0.85}
        />
      ))}
    </svg>
  );
}

function Four({ answer }: { answer: WalkAnswer }) {
  const { pictures, worked } = answer;
  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-4">
        {pictures.map((picture) => (
          <div key={picture.position} className="flex flex-col items-start gap-2">
            <PictureCells rows={picture.rows} cell={6} kind={picture.kind} />
            <div className="text-sm text-slate-700 dark:text-slate-300">
              <KindLabel kind={picture.kind} />
            </div>
            <VectorBars vector={picture.vector} colour={KIND_COLOUR[picture.kind]} />
            <div className="font-mono text-xs text-slate-500 dark:text-slate-400">
              length {picture.length.toFixed(4)}
              <br />
              called {picture.called} at{" "}
              {Math.max(...picture.probabilities).toFixed(4)}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-5 grid gap-5 sm:grid-cols-2">
        <Grid
          title="cosine between vectors, higher is nearer"
          kinds={pictures.map((picture) => picture.kind)}
          values={answer.cosines}
        />
        <Grid
          title="distance between pixels, lower is nearer"
          kinds={pictures.map((picture) => picture.kind)}
          values={answer.pixel_gaps}
        />
      </div>

      <p className="mt-4 font-mono text-xs text-slate-600 dark:text-slate-400">
        {worked.first} · {worked.second} = {worked.dot.toFixed(4)}, lengths{" "}
        {worked.first_length.toFixed(4)} and {worked.second_length.toFixed(4)}, so
        the cosine is {worked.dot.toFixed(4)} / ({worked.first_length.toFixed(4)}{" "}
        × {worked.second_length.toFixed(4)}) = {worked.cosine.toFixed(4)}
      </p>
    </div>
  );
}

function Grid({
  title,
  kinds,
  values,
}: {
  title: string;
  kinds: string[];
  values: number[][];
}) {
  return (
    <div className="overflow-x-auto">
      <p className="mb-1 text-xs font-medium text-slate-600 dark:text-slate-400">
        {title}
      </p>
      <table className="border-collapse text-xs">
        <thead>
          <tr>
            <th />
            {kinds.map((kind) => (
              <th
                key={kind}
                className="px-2 py-1 text-left font-semibold text-slate-600 dark:text-slate-400"
              >
                {kind}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {values.map((row, rowIndex) => (
            <tr key={kinds[rowIndex]}>
              <th className="px-2 py-1 text-left font-semibold text-slate-600 dark:text-slate-400">
                {kinds[rowIndex]}
              </th>
              {row.map((value, columnIndex) => (
                <td
                  key={kinds[columnIndex]}
                  className={`px-2 py-1 font-mono ${
                    rowIndex === columnIndex
                      ? "text-slate-400 dark:text-slate-600"
                      : "text-slate-800 dark:text-slate-200"
                  }`}
                >
                  {value.toFixed(4)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
