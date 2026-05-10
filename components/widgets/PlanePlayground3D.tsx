"use client";

// The plane the several-inputs regression fits, finally seen.
//
// Twenty people float in three dimensions, height across, age into the
// depth, weight upward, and the wireframe is the fitted plane, tilting one
// way per centimetre and another way per year. Drag to orbit. The fit and
// every lattice height of the surface come from the library through the API;
// only the rotation happens in the browser, and the rotation is itself the
// linear algebra primer's matrices at work.

import { useEffect, useRef, useState } from "react";
import { ApiError, Person3d, PlaneFit3d, fitPlane3d } from "@/lib/api";
import { CUBE_EDGES, Orbit, Point3, project, toCube } from "@/lib/threeD";

const VIEW = 520;
const HALF = VIEW / 2;
const SCALE = 190;

const RANGE = {
  height: [148, 197] as const,
  age: [18, 68] as const,
  weight: [50, 88] as const,
};

// Twenty people, frozen so the page can quote the fitted numbers.
const MEASURED_PEOPLE: Person3d[] = [
  { height: 186, age: 48, weight: 82.5 },
  { height: 186, age: 34, weight: 78.6 },
  { height: 173, age: 64, weight: 67.8 },
  { height: 163, age: 23, weight: 61.0 },
  { height: 152, age: 54, weight: 55.7 },
  { height: 167, age: 64, weight: 70.2 },
  { height: 168, age: 31, weight: 64.9 },
  { height: 152, age: 65, weight: 55.0 },
  { height: 152, age: 64, weight: 60.1 },
  { height: 195, age: 21, weight: 78.9 },
  { height: 179, age: 55, weight: 78.8 },
  { height: 161, age: 20, weight: 54.9 },
  { height: 170, age: 45, weight: 70.7 },
  { height: 194, age: 42, weight: 79.5 },
  { height: 190, age: 30, weight: 77.2 },
  { height: 188, age: 36, weight: 75.5 },
  { height: 168, age: 60, weight: 74.3 },
  { height: 172, age: 36, weight: 69.8 },
  { height: 180, age: 27, weight: 78.8 },
  { height: 153, age: 55, weight: 61.7 },
];

// The same twenty people with weights sitting almost exactly on one plane,
// the ideal case, a very strong fit.
const IDEAL_PEOPLE: Person3d[] = [
  { height: 186, age: 48, weight: 79.4 },
  { height: 186, age: 34, weight: 76.0 },
  { height: 173, age: 64, weight: 74.2 },
  { height: 163, age: 23, weight: 59.8 },
  { height: 152, age: 54, weight: 59.4 },
  { height: 167, age: 64, weight: 69.7 },
  { height: 168, age: 31, weight: 65.1 },
  { height: 152, age: 65, weight: 60.5 },
  { height: 152, age: 64, weight: 61.2 },
  { height: 195, age: 21, weight: 79.3 },
  { height: 179, age: 55, weight: 76.3 },
  { height: 161, age: 20, weight: 58.0 },
  { height: 170, age: 45, weight: 68.9 },
  { height: 194, age: 42, weight: 82.4 },
  { height: 190, age: 30, weight: 78.6 },
  { height: 188, age: 36, weight: 77.6 },
  { height: 168, age: 60, weight: 70.4 },
  { height: 172, age: 36, weight: 67.7 },
  { height: 180, age: 27, weight: 71.9 },
  { height: 153, age: 55, weight: 59.4 },
];

function randomPeople(): Person3d[] {
  return Array.from({ length: 20 }, () => {
    const height = Math.round(150 + Math.random() * 45);
    const age = Math.round(20 + Math.random() * 48);
    const weight =
      Math.round((0.62 * height + 0.18 * age - 45 + (Math.random() - 0.5) * 8) * 10) / 10;
    return { height, age, weight };
  });
}

function cubePoint(height: number, age: number, weight: number): Point3 {
  return {
    x: toCube(height, RANGE.height[0], RANGE.height[1]),
    y: toCube(age, RANGE.age[0], RANGE.age[1]),
    z: toCube(weight, RANGE.weight[0], RANGE.weight[1]),
  };
}

export function PlanePlayground3D() {
  const [people, setPeople] = useState<Person3d[]>(MEASURED_PEOPLE);
  const [fit, setFit] = useState<PlaneFit3d | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [orbit, setOrbit] = useState<Orbit>({ yaw: -2.2, pitch: 0.5 });
  const dragging = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setFit(await fitPlane3d(people));
      } catch (error) {
        if (error instanceof ApiError) setMessage(error.message);
        else setMessage("Something went wrong.");
      }
    })();
  }, [people]);

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

  // The plane as wireframe segments over the lattice the API sampled.
  const surfaceSegments: { a: Point3; b: Point3 }[] = [];
  if (fit) {
    const corner = (row: number, column: number): Point3 =>
      cubePoint(
        fit.heights_axis[column],
        fit.ages_axis[row],
        fit.surface[row][column],
      );
    for (let row = 0; row < fit.ages_axis.length; row++) {
      for (let column = 0; column < fit.heights_axis.length; column++) {
        if (column + 1 < fit.heights_axis.length) {
          surfaceSegments.push({ a: corner(row, column), b: corner(row, column + 1) });
        }
        if (row + 1 < fit.ages_axis.length) {
          surfaceSegments.push({ a: corner(row, column), b: corner(row + 1, column) });
        }
      }
    }
  }

  const projectedSegments = surfaceSegments
    .map((segment) => {
      const a = project(segment.a, orbit, HALF, SCALE);
      const b = project(segment.b, orbit, HALF, SCALE);
      return { a, b, depth: (a.depth + b.depth) / 2 };
    })
    .sort((first, second) => second.depth - first.depth);

  const projectedPeople = people.map((person) => ({
    ...project(cubePoint(person.height, person.age, person.weight), orbit, HALF, SCALE),
  })).sort((first, second) => second.depth - first.depth);

  const frame = CUBE_EDGES.map(([a, b]) => ({
    a: project(a, orbit, HALF, SCALE),
    b: project(b, orbit, HALF, SCALE),
  }));

  const heightLabel = project({ x: 0, y: -1.15, z: -1.1 }, orbit, HALF, SCALE);
  const ageLabel = project({ x: 1.25, y: 0, z: -1.1 }, orbit, HALF, SCALE);
  const weightLabel = project({ x: -1.2, y: -1.15, z: 0 }, orbit, HALF, SCALE);

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 pb-3">
        <button
          onClick={() => setPeople(IDEAL_PEOPLE)}
          className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
        >
          An Ideal Case
        </button>
        <button
          onClick={() => setPeople(MEASURED_PEOPLE)}
          className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
        >
          The measured twenty
        </button>
        <button
          onClick={() => setPeople(randomPeople())}
          className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
        >
          Random people
        </button>
      </div>
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

        {projectedPeople.map((person, index) => (
          <circle
            key={`p${index}`}
            cx={person.px}
            cy={person.py}
            r={5}
            className="fill-slate-700 stroke-white dark:fill-slate-200 dark:stroke-slate-900"
            strokeWidth={1.5}
          />
        ))}

        <text x={heightLabel.px} y={heightLabel.py} textAnchor="middle" className="fill-slate-500 text-xs font-medium dark:fill-slate-400">
          Height (cm)
        </text>
        <text x={ageLabel.px} y={ageLabel.py} textAnchor="middle" className="fill-slate-500 text-xs font-medium dark:fill-slate-400">
          Age (years)
        </text>
        <text x={weightLabel.px} y={weightLabel.py} textAnchor="middle" className="fill-slate-500 text-xs font-medium dark:fill-slate-400">
          Weight (kg)
        </text>
      </svg>

      <p className="mt-2 text-center text-xs text-slate-500 dark:text-slate-500">
        Drag to turn the room. The wireframe is the fitted plane.
      </p>

      <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat
          label="kg per cm of height"
          value={fit ? fit.height_coefficient.toFixed(3) : "…"}
        />
        <Stat
          label="kg per year of age"
          value={fit ? fit.age_coefficient.toFixed(3) : "…"}
        />
        <Stat label="Intercept" value={fit ? fit.intercept.toFixed(2) : "…"} />
        <Stat label="R²" value={fit ? fit.r_squared.toFixed(3) : "…"} />
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
