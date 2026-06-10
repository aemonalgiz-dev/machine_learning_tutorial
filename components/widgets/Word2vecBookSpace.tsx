"use client";

// The book's words as directions, turning, described two ways.
//
// A flat picture of a square counting table shows how much of it is empty and
// nothing else, and emptiness is only half the argument. What the page is
// really claiming is that a word's description is a position, so the honest
// picture is the positions.
//
// Cosine reads a direction and throws a length away, so the API puts every
// word on the unit sphere before projecting, reduces to three dimensions with
// the library's own principal components fitted over all 364 words, and
// pushes the result back onto the sphere. The browser rotates and paints.
//
// The toggle is the page's whole argument in one control. The same words are
// drawn from a row of 364 counts and from a learned vector of 24 numbers, and
// the share of the spread that three directions can hold says which of the
// two was low-dimensional all along.

import { useEffect, useRef, useState } from "react";
import { ApiError } from "@/lib/api";
import { BookSpace, PlacedWord, fetchBookSpace } from "@/lib/concepts/word2vec";

const VIEW = { width: 640, height: 460 };
const CENTRE = { x: 320, y: 225 };
const RADIUS = 175;
const TILT = 0.4;

type Which = "counted" | "learned";

/** A point turned about the upright axis, then tipped towards the viewer. */
function turned(point: PlacedWord, spin: number) {
  const cosSpin = Math.cos(spin);
  const sinSpin = Math.sin(spin);
  const x = point.x * cosSpin - point.z * sinSpin;
  const depth = point.x * sinSpin + point.z * cosSpin;
  const cosTilt = Math.cos(TILT);
  const sinTilt = Math.sin(TILT);
  return {
    x,
    y: point.y * cosTilt - depth * sinTilt,
    z: point.y * sinTilt + depth * cosTilt,
  };
}

/** One ring of the wireframe, so the sphere reads as a sphere. */
function ring(at: number, spin: number) {
  const points: string[] = [];
  for (let step = 0; step <= 60; step += 1) {
    const angle = (step / 60) * Math.PI * 2;
    const raw = {
      word: "",
      count: 0,
      x: Math.cos(angle) * Math.cos(at),
      y: Math.sin(at),
      z: Math.sin(angle) * Math.cos(at),
    };
    const spun = turned(raw, spin);
    points.push(`${CENTRE.x + spun.x * RADIUS},${CENTRE.y - spun.y * RADIUS}`);
  }
  return `M${points.join("L")}`;
}

export function Word2vecBookSpace() {
  const [space, setSpace] = useState<BookSpace | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [which, setWhich] = useState<Which>("counted");
  const [spin, setSpin] = useState(0.4);
  const [turningOn, setTurningOn] = useState(true);
  const dragging = useRef<number | null>(null);

  useEffect(() => {
    let current = true;
    (async () => {
      try {
        const loaded = await fetchBookSpace();
        if (current) setSpace(loaded);
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

  useEffect(() => {
    if (!turningOn) return;
    let frame = 0;
    const step = () => {
      setSpin((previous) => previous + 0.0035);
      frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [turningOn]);

  if (!space) {
    return (
      <p className="text-sm text-slate-500 dark:text-slate-400">
        {message ?? "Counting the book and fitting it…"}
      </p>
    );
  }

  const projection = which === "counted" ? space.counted : space.learned;
  const commonest = Math.max(...projection.words.map((word) => word.count));
  const placed = projection.words
    .map((word) => ({ word, at: turned(word, spin) }))
    .sort((first, second) => first.at.z - second.at.z);

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center gap-3">
        <div className="inline-flex overflow-hidden rounded-md border border-slate-300 dark:border-slate-700">
          {(["counted", "learned"] as const).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setWhich(option)}
              className={`px-3 py-1 text-xs ${
                which === option
                  ? "bg-indigo-600 text-white"
                  : "bg-white text-slate-700 dark:bg-slate-900 dark:text-slate-300"
              }`}
            >
              {option === "counted"
                ? `a row of ${space.counted.width} counts`
                : `a learned vector of ${space.learned.width}`}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setTurningOn((previous) => !previous)}
          className="rounded-md border border-slate-300 px-3 py-1 text-xs text-slate-700 dark:border-slate-700 dark:text-slate-300"
        >
          {turningOn ? "stop turning" : "start turning"}
        </button>
        <span className="text-xs text-slate-500 dark:text-slate-400">
          or drag it
        </span>
      </div>

      <svg
        viewBox={`0 0 ${VIEW.width} ${VIEW.height}`}
        className="w-full cursor-grab touch-none select-none active:cursor-grabbing"
        role="img"
        aria-label="The book's commonest words placed as directions on a turning sphere"
        onPointerDown={(event) => {
          dragging.current = event.clientX;
          setTurningOn(false);
          event.currentTarget.setPointerCapture(event.pointerId);
        }}
        onPointerMove={(event) => {
          if (dragging.current === null) return;
          const moved = event.clientX - dragging.current;
          dragging.current = event.clientX;
          setSpin((previous) => previous + moved * 0.01);
        }}
        onPointerUp={() => {
          dragging.current = null;
        }}
      >
        <circle
          cx={CENTRE.x}
          cy={CENTRE.y}
          r={RADIUS}
          className="fill-slate-50 stroke-slate-200 dark:fill-slate-900/40 dark:stroke-slate-800"
        />
        {[-0.85, -0.4, 0, 0.4, 0.85].map((at) => (
          <path
            key={at}
            d={ring(at, spin)}
            fill="none"
            className="stroke-slate-200 dark:stroke-slate-800"
            strokeWidth={0.7}
          />
        ))}

        {placed.map(({ word, at }) => {
          const front = at.z > 0;
          const screenX = CENTRE.x + at.x * RADIUS;
          const screenY = CENTRE.y - at.y * RADIUS;
          const weight = Math.sqrt(word.count / commonest);
          return (
            <g key={word.word} opacity={front ? 1 : 0.22}>
              <circle
                cx={screenX}
                cy={screenY}
                r={2 + weight * 4}
                className="fill-indigo-500 dark:fill-indigo-400"
              />
              {front && (
                <text
                  x={screenX + 6 + weight * 3}
                  y={screenY + 4}
                  className="fill-slate-700 dark:fill-slate-300"
                  fontSize={10 + weight * 3}
                  fontFamily="ui-monospace, monospace"
                >
                  {word.word}
                </text>
              )}
            </g>
          );
        })}
      </svg>

      <div className="mt-3 grid gap-3 sm:grid-cols-4">
        <Figure label="words in the book" value={space.n_words.toLocaleString()} />
        <Figure label="cells in its table" value={space.n_cells.toLocaleString()} />
        <Figure
          label="of those cells empty"
          value={`${(space.zero_share * 100).toFixed(2)}%`}
        />
        <Figure
          label="of the spread drawn"
          value={`${(projection.kept_share * 100).toFixed(1)}%`}
        />
      </div>

      <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
        {space.corpus}, at a minimum count of {space.minimum_count} and the same
        reach of {space.window} the small corpus uses. The{" "}
        {projection.words.length} commonest words are drawn and all{" "}
        {space.n_words} are used to work out the directions, so the picture is a
        subset and the space is not. Three directions hold{" "}
        {(space.counted.kept_share * 100).toFixed(1)}% of the spread of the
        counted rows and {(space.learned.kept_share * 100).toFixed(1)}% of the
        learned vectors, which is the difference between a description that
        happens to be wide and one that is genuinely small.
      </p>
    </div>
  );
}

function Figure({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-800 dark:bg-slate-900/50">
      <div className="text-xs text-slate-500 dark:text-slate-400">{label}</div>
      <div className="font-mono text-lg text-slate-900 dark:text-slate-100">
        {value}
      </div>
    </div>
  );
}
