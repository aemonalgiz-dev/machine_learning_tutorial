"use client";

// Every word as a direction on a sphere, turning, with alike words adjacent.
//
// Cosine reads a direction and throws a length away, so the sphere is the
// honest shape for what it compares: every word is put on the unit sphere
// before anything is drawn. The API normalises, projects the four coordinates
// down to three with its own principal components, and pushes the result back
// onto the sphere; the browser only rotates and paints.
//
// Two colourings, because the page makes two claims and they need the same
// picture. By subject, the words fall into two caps. By token number, the
// same dots are shuffled, which is what a number carrying no meaning looks
// like.

import { useEffect, useRef, useState } from "react";
import { ApiError } from "@/lib/api";
import { SphereAnswer, SphereWord, fetchSphere } from "@/lib/concepts/a-vector-for-a-word";

const VIEW = { width: 620, height: 430 };
const CENTRE = { x: 300, y: 215 };
const RADIUS = 165;

const TOPIC_COLOUR: Record<SphereWord["topic"], string> = {
  cooking: "#e07b39",
  sailing: "#3b82c4",
  shared: "#94a3b8",
};

type Colouring = "subject" | "number";

/** A point turned about the upright axis, then tipped towards the viewer. */
function turned(word: SphereWord, spin: number, tilt: number) {
  const cosSpin = Math.cos(spin);
  const sinSpin = Math.sin(spin);
  const x = word.x * cosSpin - word.z * sinSpin;
  const z = word.x * sinSpin + word.z * cosSpin;
  const cosTilt = Math.cos(tilt);
  const sinTilt = Math.sin(tilt);
  const y = word.y * cosTilt - z * sinTilt;
  return { x, y, z: word.y * sinTilt + z * cosTilt };
}

/** A ring of the wireframe, as an SVG path, at one latitude or longitude. */
function ring(kind: "latitude" | "longitude", at: number, spin: number, tilt: number) {
  const points: string[] = [];
  for (let step = 0; step <= 64; step += 1) {
    const angle = (step / 64) * Math.PI * 2;
    const raw =
      kind === "latitude"
        ? {
            x: Math.cos(angle) * Math.cos(at),
            y: Math.sin(at),
            z: Math.sin(angle) * Math.cos(at),
          }
        : {
            x: Math.cos(angle) * Math.cos(at),
            y: Math.sin(angle),
            z: Math.cos(angle) * Math.sin(at),
          };
    const spun = turned({ ...raw } as SphereWord, spin, tilt);
    points.push(
      `${CENTRE.x + spun.x * RADIUS},${CENTRE.y - spun.y * RADIUS}`,
    );
  }
  return `M${points.join("L")}`;
}

export function WordSphere() {
  const [answer, setAnswer] = useState<SphereAnswer | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [colouring, setColouring] = useState<Colouring>("subject");
  const [spin, setSpin] = useState(0.6);
  const [turning, setTurning] = useState(true);
  const dragging = useRef<number | null>(null);

  useEffect(() => {
    let current = true;
    (async () => {
      try {
        const loaded = await fetchSphere();
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

  useEffect(() => {
    if (!turning) return;
    let frame = 0;
    const step = () => {
      setSpin((previous) => previous + 0.004);
      frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [turning]);

  if (!answer) {
    return (
      <p className="text-sm text-slate-500 dark:text-slate-400">
        {message ?? "Fitting the table…"}
      </p>
    );
  }

  const tilt = 0.42;
  const ids = answer.words.map((word) => word.token_id);
  const highestId = Math.max(...ids);

  const placed = answer.words
    .map((word) => ({ word, at: turned(word, spin, tilt) }))
    .sort((first, second) => first.at.z - second.at.z);

  const colourFor = (word: SphereWord) => {
    if (colouring === "subject") return TOPIC_COLOUR[word.topic];
    const share = word.token_id / highestId;
    return `hsl(${Math.round(260 - share * 210)}, 70%, 52%)`;
  };

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center gap-3">
        <div className="inline-flex overflow-hidden rounded-md border border-slate-300 dark:border-slate-700">
          {(["subject", "number"] as const).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setColouring(option)}
              className={`px-3 py-1 text-xs ${
                colouring === option
                  ? "bg-indigo-600 text-white"
                  : "bg-white text-slate-700 dark:bg-slate-900 dark:text-slate-300"
              }`}
            >
              {option === "subject" ? "colour by subject" : "colour by token number"}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setTurning((previous) => !previous)}
          className="rounded-md border border-slate-300 px-3 py-1 text-xs text-slate-700 dark:border-slate-700 dark:text-slate-300"
        >
          {turning ? "stop turning" : "start turning"}
        </button>
        <span className="text-xs text-slate-500 dark:text-slate-400">
          or drag the sphere
        </span>
      </div>

      <svg
        viewBox={`0 0 ${VIEW.width} ${VIEW.height}`}
        className="w-full cursor-grab touch-none select-none active:cursor-grabbing"
        role="img"
        aria-label="The words of the table placed as directions on a turning sphere"
        onPointerDown={(event) => {
          dragging.current = event.clientX;
          setTurning(false);
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
        {[-0.9, -0.45, 0, 0.45, 0.9].map((at) => (
          <path
            key={`lat-${at}`}
            d={ring("latitude", at, spin, tilt)}
            fill="none"
            className="stroke-slate-200 dark:stroke-slate-800"
            strokeWidth={0.7}
          />
        ))}
        {[0, 0.52, 1.05, 1.57, 2.09, 2.62].map((at) => (
          <path
            key={`lon-${at}`}
            d={ring("longitude", at, spin, tilt)}
            fill="none"
            className="stroke-slate-200 dark:stroke-slate-800"
            strokeWidth={0.7}
          />
        ))}

        {placed.map(({ word, at }) => {
          const front = at.z > 0;
          const screenX = CENTRE.x + at.x * RADIUS;
          const screenY = CENTRE.y - at.y * RADIUS;
          const depth = (at.z + 1) / 2;
          return (
            <g key={word.word} opacity={front ? 1 : 0.28}>
              <circle
                cx={screenX}
                cy={screenY}
                r={3.5 + depth * 3}
                fill={colourFor(word)}
                stroke="white"
                strokeWidth={front ? 1 : 0}
              />
              {front && (
                <text
                  x={screenX + 8 + depth * 2}
                  y={screenY + 4}
                  className="fill-slate-700 dark:fill-slate-300"
                  fontSize={11}
                  fontFamily="ui-monospace, monospace"
                >
                  {word.word}
                </text>
              )}
            </g>
          );
        })}
      </svg>

      <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-slate-600 dark:text-slate-400">
        {colouring === "subject" ? (
          <>
            {(["cooking", "sailing", "shared"] as const).map((topic) => (
              <span key={topic} className="inline-flex items-center gap-1.5">
                <span
                  className="inline-block h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: TOPIC_COLOUR[topic] }}
                />
                {topic === "shared" ? "used by both" : topic}
              </span>
            ))}
          </>
        ) : (
          <span>
            Dark to light is token number 0 upward, and the colours are scattered
            over the sphere rather than gathered anywhere.
          </span>
        )}
      </div>

      <div className="mt-3 grid gap-3 sm:grid-cols-3">
        <Figure
          label="mean cosine, same subject"
          value={answer.within_topic.toFixed(4)}
        />
        <Figure
          label="mean cosine, across subjects"
          value={answer.across_topic.toFixed(4)}
        />
        <Figure
          label="of the spread drawn"
          value={`${(answer.kept_share * 100).toFixed(1)}%`}
        />
      </div>
      <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
        The table has {answer.dimension} coordinates per word and the drawing has
        three, so the two figures above are measured in the full space rather
        than in the picture. The picture keeps{" "}
        {(answer.kept_share * 100).toFixed(1)}% of the spread, which is why the
        caps it shows are the caps that are really there.
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
