"use client";

// The bowl the derivation talks about, drawn.
//
// Every point of the wireframe is a possible line, a slope paired with an
// intercept, at a height given by how badly that line misses the five worked
// people. The floor of the bowl is the least squares fit, marked in green,
// and its height is the RSS of 16 the regression page summed by hand. Drag to
// orbit and notice the bowl is really a valley running diagonally, since a
// larger slope can be partly repaid by a smaller intercept. The surface comes
// from the API; only the rotation happens in the browser.

import { useEffect, useRef, useState } from "react";
import { ApiError, LossSurface, Point, lossSurface } from "@/lib/api";
import { CUBE_EDGES, Orbit, Point3, project } from "@/lib/threeD";

const VIEW = 520;
const HALF = VIEW / 2;
const SCALE = 190;

// The regression page's five worked people.
const FIVE_PEOPLE: Point[] = [
  { x: 160, y: 58 },
  { x: 165, y: 66 },
  { x: 170, y: 68 },
  { x: 175, y: 74 },
  { x: 180, y: 74 },
];

const STRIDE = 2;

export function LossBowlPlayground() {
  const [surface, setSurface] = useState<LossSurface | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [orbit, setOrbit] = useState<Orbit>({ yaw: -0.8, pitch: 0.35 });
  const dragging = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setSurface(await lossSurface(FIVE_PEOPLE));
      } catch (error) {
        if (error instanceof ApiError) setMessage(error.message);
        else setMessage("Something went wrong.");
      }
    })();
  }, []);

  const onPointerDown = (event: React.PointerEvent) => {
    dragging.current = { x: event.clientX, y: event.clientY };
    event.currentTarget.setPointerCapture(event.pointerId);
  };
  const onPointerMove = (event: React.PointerEvent) => {
    if (!dragging.current) return;
    const dx = event.clientX - dragging.current.x;
    const dy = event.clientY - dragging.current.y;
    dragging.current = { x: event.clientX, y: event.clientY };
    setOrbit((current) => ({
      yaw: current.yaw + dx * 0.008,
      pitch: Math.min(1.3, Math.max(-0.2, current.pitch + dy * 0.008)),
    }));
  };
  const onPointerUp = () => {
    dragging.current = null;
  };

  let projectedSegments: { a: ReturnType<typeof project>; b: ReturnType<typeof project>; depth: number }[] = [];
  let minimumMark: ReturnType<typeof project> | null = null;

  if (surface) {
    const slopeLow = surface.slopes[0];
    const slopeHigh = surface.slopes[surface.slopes.length - 1];
    const interceptLow = surface.intercepts[0];
    const interceptHigh = surface.intercepts[surface.intercepts.length - 1];
    const rssHigh = Math.max(...surface.rss.map((row) => Math.max(...row)));
    const rssLow = surface.minimum.rss;

    const cubePoint = (row: number, column: number): Point3 => ({
      x: ((surface.slopes[column] - slopeLow) / (slopeHigh - slopeLow)) * 2 - 1,
      y:
        ((surface.intercepts[row] - interceptLow) /
          (interceptHigh - interceptLow)) *
          2 -
        1,
      z: ((surface.rss[row][column] - rssLow) / (rssHigh - rssLow)) * 2 - 1,
    });

    const segments: { a: Point3; b: Point3 }[] = [];
    const size = surface.slopes.length;
    for (let row = 0; row < size; row += STRIDE) {
      for (let column = 0; column + 1 < size; column++) {
        segments.push({ a: cubePoint(row, column), b: cubePoint(row, column + 1) });
      }
    }
    for (let column = 0; column < size; column += STRIDE) {
      for (let row = 0; row + 1 < size; row++) {
        segments.push({ a: cubePoint(row, column), b: cubePoint(row + 1, column) });
      }
    }

    projectedSegments = segments
      .map((segment) => {
        const a = project(segment.a, orbit, HALF, SCALE);
        const b = project(segment.b, orbit, HALF, SCALE);
        return { a, b, depth: (a.depth + b.depth) / 2 };
      })
      .sort((first, second) => second.depth - first.depth);

    minimumMark = project(
      {
        x:
          ((surface.minimum.slope - slopeLow) / (slopeHigh - slopeLow)) * 2 - 1,
        y:
          ((surface.minimum.intercept - interceptLow) /
            (interceptHigh - interceptLow)) *
            2 -
          1,
        z: -1,
      },
      orbit,
      HALF,
      SCALE,
    );
  }

  const frame = CUBE_EDGES.map(([a, b]) => ({
    a: project(a, orbit, HALF, SCALE),
    b: project(b, orbit, HALF, SCALE),
  }));

  const slopeLabel = project({ x: 0, y: -1.15, z: -1.1 }, orbit, HALF, SCALE);
  const interceptLabel = project({ x: 1.3, y: 0, z: -1.1 }, orbit, HALF, SCALE);
  const rssLabel = project({ x: -1.2, y: -1.15, z: 0 }, orbit, HALF, SCALE);

  return (
    <div>
      <svg
        viewBox={`0 0 ${VIEW} ${VIEW}`}
        className="mx-auto w-full max-w-lg cursor-grab touch-none select-none rounded-lg bg-slate-50 active:cursor-grabbing dark:bg-slate-950"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
      >
        {frame.map((edge, index) => (
          <line
            key={`f${index}`}
            x1={edge.a.px}
            y1={edge.a.py}
            x2={edge.b.px}
            y2={edge.b.py}
            stroke="currentColor"
            className="text-slate-200 dark:text-slate-800"
            strokeWidth={1}
          />
        ))}

        {projectedSegments.map((segment, index) => (
          <line
            key={`s${index}`}
            x1={segment.a.px}
            y1={segment.a.py}
            x2={segment.b.px}
            y2={segment.b.py}
            stroke="currentColor"
            className="text-indigo-400/70"
            strokeWidth={1.2}
          />
        ))}

        {minimumMark && (
          <circle
            cx={minimumMark.px}
            cy={minimumMark.py}
            r={7}
            className="fill-emerald-500 stroke-white dark:stroke-slate-900"
            strokeWidth={2}
          />
        )}

        <text x={slopeLabel.px} y={slopeLabel.py} textAnchor="middle" className="fill-slate-500 text-xs font-medium dark:fill-slate-400">
          Slope β
        </text>
        <text x={interceptLabel.px} y={interceptLabel.py} textAnchor="middle" className="fill-slate-500 text-xs font-medium dark:fill-slate-400">
          Intercept α
        </text>
        <text x={rssLabel.px} y={rssLabel.py} textAnchor="middle" className="fill-slate-500 text-xs font-medium dark:fill-slate-400">
          RSS
        </text>
      </svg>

      <p className="mt-2 text-center text-xs text-slate-500 dark:text-slate-500">
        Drag to turn the room. The green dot marks the floor, the least squares
        fit.
      </p>

      <div className="mt-3 grid grid-cols-3 gap-3">
        <Stat
          label="Slope at the floor"
          value={surface ? surface.minimum.slope.toFixed(3) : "…"}
        />
        <Stat
          label="Intercept at the floor"
          value={surface ? surface.minimum.intercept.toFixed(2) : "…"}
        />
        <Stat
          label="RSS at the floor"
          value={surface ? surface.minimum.rss.toFixed(1) : "…"}
        />
      </div>

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
