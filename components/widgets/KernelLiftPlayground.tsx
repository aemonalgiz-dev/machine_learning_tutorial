"use client";

// The lift the kernel implies, drawn as the room it happens in.
//
// Every patient from the clinic is carried through the worked mapping, their
// standardized vitals squared and crossed into three coordinates, and up here
// the two classes come apart. The wireframe is a genuinely flat plane, the
// boundary the same classifier drew on the three lifted columns under the
// plain inner product, and it slides between the healthy and the unwell that
// no straight line could separate below. The readouts compare that route
// with the kernel's route on the raw columns, which never built the room.
// Drag to orbit. The lift, both fits and the gaps come from the API; only
// the rotation happens in the browser.

import { useEffect, useRef, useState } from "react";
import { ApiError, ClinicLift, liftClinic } from "@/lib/concepts/kernel-trick";
import { CUBE_EDGES, Orbit, Point3, project } from "@/lib/threeD";
import { CLINIC } from "./kernelTrickFixtures";

const VIEW = 520;
const HALF = VIEW / 2;
const SCALE = 190;
const PLANE_STEPS = 6;

let pending: Promise<ClinicLift> | null = null;
function liftOnce(): Promise<ClinicLift> {
  if (!pending) pending = liftClinic(CLINIC);
  return pending;
}

export function KernelLiftPlayground() {
  const [lift, setLift] = useState<ClinicLift | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [orbit, setOrbit] = useState<Orbit>({ yaw: -0.9, pitch: 0.3 });
  const dragging = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setLift(await liftOnce());
      } catch (error) {
        pending = null;
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

  let projectedPlane: { a: ReturnType<typeof project>; b: ReturnType<typeof project> }[] = [];
  let projectedPatients: { point: ReturnType<typeof project>; label: number; support: boolean }[] = [];

  if (lift) {
    const us = lift.points.map((point) => point.u);
    const vs = lift.points.map((point) => point.v);
    const ws = lift.points.map((point) => point.w);
    const low = { u: Math.min(...us), v: Math.min(...vs), w: Math.min(...ws) };
    const high = { u: Math.max(...us), v: Math.max(...vs), w: Math.max(...ws) };
    const support = new Set(lift.lifted.support_positions);

    const cubePoint = (u: number, v: number, w: number): Point3 => ({
      x: ((u - low.u) / (high.u - low.u)) * 2 - 1,
      y: ((v - low.v) / (high.v - low.v)) * 2 - 1,
      z: ((w - low.w) / (high.w - low.w)) * 2 - 1,
    });

    projectedPatients = lift.points
      .map((point, index) => ({
        point: project(cubePoint(point.u, point.v, point.w), orbit, HALF, SCALE),
        label: point.label,
        support: support.has(index),
      }))
      .sort((first, second) => second.point.depth - first.point.depth);

    // The plane a·u + b·v + c·w = d, sampled over (u, v) and solved for w,
    // keeping only the patches that stay inside the drawn room.
    const { a, b, c, d } = lift.plane;
    if (Math.abs(c) > 1e-6) {
      const planeCorner = (uStep: number, vStep: number): Point3 | null => {
        const u = low.u + ((high.u - low.u) * uStep) / PLANE_STEPS;
        const v = low.v + ((high.v - low.v) * vStep) / PLANE_STEPS;
        const w = (d - a * u - b * v) / c;
        if (w < low.w - 0.1 * (high.w - low.w)) return null;
        if (w > high.w + 0.1 * (high.w - low.w)) return null;
        return cubePoint(u, v, w);
      };
      const segments: { a: Point3; b: Point3 }[] = [];
      for (let uStep = 0; uStep <= PLANE_STEPS; uStep++) {
        for (let vStep = 0; vStep <= PLANE_STEPS; vStep++) {
          const here = planeCorner(uStep, vStep);
          if (!here) continue;
          const right = uStep + 1 <= PLANE_STEPS ? planeCorner(uStep + 1, vStep) : null;
          const forward = vStep + 1 <= PLANE_STEPS ? planeCorner(uStep, vStep + 1) : null;
          if (right) segments.push({ a: here, b: right });
          if (forward) segments.push({ a: here, b: forward });
        }
      }
      projectedPlane = segments.map((segment) => ({
        a: project(segment.a, orbit, HALF, SCALE),
        b: project(segment.b, orbit, HALF, SCALE),
      }));
    }
  }

  const frame = CUBE_EDGES.map(([a, b]) => ({
    a: project(a, orbit, HALF, SCALE),
    b: project(b, orbit, HALF, SCALE),
  }));

  const uLabel = project({ x: 0, y: -1.15, z: -1.1 }, orbit, HALF, SCALE);
  const vLabel = project({ x: 1.3, y: 0, z: -1.1 }, orbit, HALF, SCALE);
  const wLabel = project({ x: -1.2, y: -1.15, z: 0 }, orbit, HALF, SCALE);

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

        {projectedPlane.map((segment, index) => (
          <line
            key={`s${index}`}
            x1={segment.a.px}
            y1={segment.a.py}
            x2={segment.b.px}
            y2={segment.b.py}
            stroke="currentColor"
            className="text-emerald-500/70"
            strokeWidth={1.2}
          />
        ))}

        {projectedPatients.map((patient, index) => (
          <g key={`p${index}`}>
            {patient.support && (
              <circle
                cx={patient.point.px}
                cy={patient.point.py}
                r={9}
                fill="none"
                className="stroke-emerald-500"
                strokeWidth={1.5}
              />
            )}
            <circle
              cx={patient.point.px}
              cy={patient.point.py}
              r={5.5}
              className={
                patient.label === 1
                  ? "fill-indigo-600 stroke-white dark:stroke-slate-900"
                  : "fill-amber-500 stroke-white dark:stroke-slate-900"
              }
              strokeWidth={1.5}
            />
          </g>
        ))}

        <text x={uLabel.px} y={uLabel.py} textAnchor="middle" className="fill-slate-500 font-mono text-xs dark:fill-slate-400">
          u = x²
        </text>
        <text x={vLabel.px} y={vLabel.py} textAnchor="middle" className="fill-slate-500 font-mono text-xs dark:fill-slate-400">
          v = √2·xy
        </text>
        <text x={wLabel.px} y={wLabel.py} textAnchor="middle" className="fill-slate-500 font-mono text-xs dark:fill-slate-400">
          w = y²
        </text>
      </svg>

      <p className="mt-2 text-center text-xs text-slate-500 dark:text-slate-500">
        Drag to turn the room. Indigo is healthy, amber is unwell, the green
        wireframe is a flat plane, and a green ring marks a support vector.
      </p>

      <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat
          label="Accuracy of the flat plane"
          value={lift ? lift.lifted.accuracy.toFixed(3) : "…"}
        />
        <Stat
          label="Support vectors, either route"
          value={lift ? `${lift.lifted.n_support_vectors} and ${lift.kernel.n_support_vectors}` : "…"}
        />
        <Stat
          label="Largest multiplier gap"
          value={lift ? lift.multiplier_gap.toExponential(1) : "…"}
        />
        <Stat
          label="Largest decision gap"
          value={lift ? lift.decision_gap.toExponential(1) : "…"}
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
