"use client";

// Every held-out picture as a direction on a sphere, turning, coloured by kind.
//
// Cosine reads a direction and throws a length away, so the sphere is the
// honest shape for what it compares. The API puts every picture's sixteen
// numbers on the unit sphere, projects them down to three with principal
// components fitted on the four trained kinds, and pushes the result back
// onto the sphere; the rings, which no training named, are placed with that
// same projection. The browser only turns the sphere and paints the dots.
//
// Two networks share the one drawing. The trained network is the shared
// picture network; the untrained one is the same design with its starting
// weights, never shown a picture, which is the control for the claim that
// training is what gathered the kinds.

import { useEffect, useRef, useState } from "react";
import { ApiError } from "@/lib/api";
import {
  KindName,
  SphereAnswer,
  SpherePoint,
  fetchSphere,
} from "@/lib/concepts/a-vector-for-a-picture";
import {
  KIND_COLOUR,
  KindLabel,
  Pending,
  Stat,
  Toggle,
} from "@/components/widgets/pictureVectorShared";

const VIEW = { width: 620, height: 430 };
const CENTRE = { x: 310, y: 215 };
const RADIUS = 170;
const TILT = 0.42;

type Network = "trained" | "untrained";

function turned(point: { x: number; y: number; z: number }, spin: number) {
  const cosSpin = Math.cos(spin);
  const sinSpin = Math.sin(spin);
  const x = point.x * cosSpin - point.z * sinSpin;
  const z = point.x * sinSpin + point.z * cosSpin;
  const cosTilt = Math.cos(TILT);
  const sinTilt = Math.sin(TILT);
  return {
    x,
    y: point.y * cosTilt - z * sinTilt,
    z: point.y * sinTilt + z * cosTilt,
  };
}

function ring(kind: "latitude" | "longitude", at: number, spin: number) {
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
    const spun = turned(raw, spin);
    points.push(`${CENTRE.x + spun.x * RADIUS},${CENTRE.y - spun.y * RADIUS}`);
  }
  return `M${points.join("L")}`;
}

export function PictureVectorSphere({
  initialNetwork = "trained",
  initialRings = false,
}: {
  initialNetwork?: Network;
  initialRings?: boolean;
}) {
  const [answer, setAnswer] = useState<SphereAnswer | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [network, setNetwork] = useState<Network>(initialNetwork);
  const [showRings, setShowRings] = useState(initialRings);
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

  if (!answer) return <Pending message={message} />;

  const view = answer.views.find((candidate) => candidate.network === network);
  if (!view) return <Pending message="This arrangement is missing." />;

  const shown: SpherePoint[] = view.points.filter(
    (point) => showRings || point.kind !== "ring",
  );
  const placed = shown
    .map((point) => ({ point, at: turned(point, spin) }))
    .sort((first, second) => first.at.z - second.at.z);
  const legend: KindName[] = showRings
    ? ["cross", "square", "disc", "bar", "ring"]
    : ["cross", "square", "disc", "bar"];

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center gap-3">
        <Toggle
          options={[
            { value: "trained", label: "trained network" },
            { value: "untrained", label: "untrained network" },
          ]}
          value={network}
          onChange={setNetwork}
        />
        <label className="inline-flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400">
          <input
            type="checkbox"
            checked={showRings}
            onChange={(event) => setShowRings(event.target.checked)}
          />
          show the {answer.n_rings} rings
        </label>
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
        aria-label="Every held-out picture placed as a direction on a turning sphere"
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
            d={ring("latitude", at, spin)}
            fill="none"
            className="stroke-slate-200 dark:stroke-slate-800"
            strokeWidth={0.7}
          />
        ))}
        {[0, 0.52, 1.05, 1.57, 2.09, 2.62].map((at) => (
          <path
            key={`lon-${at}`}
            d={ring("longitude", at, spin)}
            fill="none"
            className="stroke-slate-200 dark:stroke-slate-800"
            strokeWidth={0.7}
          />
        ))}
        {placed.map(({ point, at }) => {
          const front = at.z > 0;
          const depth = (at.z + 1) / 2;
          const isRing = point.kind === "ring";
          return (
            <circle
              key={`${point.kind}-${point.position}`}
              cx={CENTRE.x + at.x * RADIUS}
              cy={CENTRE.y - at.y * RADIUS}
              r={(isRing ? 3.2 : 2.6) + depth * 2.2}
              fill={isRing ? "white" : KIND_COLOUR[point.kind]}
              stroke={isRing ? KIND_COLOUR.ring : "white"}
              strokeWidth={isRing ? 1.6 : front ? 0.6 : 0}
              opacity={front ? 0.95 : 0.25}
            >
              <title>
                {isRing
                  ? `ring ${point.position}`
                  : `${point.kind}, held-out picture ${point.position}`}
              </title>
            </circle>
          );
        })}
      </svg>

      <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-slate-600 dark:text-slate-400">
        {legend.map((kind) => (
          <KindLabel key={kind} kind={kind} />
        ))}
      </div>

      <div className="mt-3 grid gap-3 sm:grid-cols-4">
        <Stat label="mean cosine, same kind" value={view.within.toFixed(4)} />
        <Stat label="mean cosine, two kinds" value={view.across.toFixed(4)} />
        <Stat
          label="nearest picture is its own kind"
          value={view.nearest_own_kind.toFixed(4)}
        />
        <Stat
          label="of the spread drawn"
          value={`${(view.kept_share * 100).toFixed(1)}%`}
        />
      </div>
      <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
        The vector has {answer.dimension} numbers and the drawing has three, so
        the first three figures are measured on all {answer.dimension} rather
        than on the picture, over the {answer.n_pictures} held-out pictures. The
        drawing keeps {(view.kept_share * 100).toFixed(1)}% of the spread of
        this network&rsquo;s directions.
      </p>
    </div>
  );
}
