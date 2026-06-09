"use client";

// The same fit seen twice: a curve over time, and a plane over (t, t²).
//
// On the left the thrown ball's height is plotted against time, and the
// degree-2 fit is a parabola. On the right the same measurements are plotted
// in the space the fit actually worked in, time across, time squared into
// the depth, height upward, and there the fit is a flat plane. The curve on
// the left is that plane read along the bent path t² = t × t, which is drawn
// as the thick line on the wireframe. Both fits come from the API, the
// parabola from the polynomial endpoint and the plane from the several-inputs
// endpoint handed t and t² as two ordinary columns, and the readouts show
// they agree to the last digit, which is the page's whole claim.

import { useEffect, useRef, useState } from "react";
import {
  ApiError,
  PlaneFit3d,
  Point,
  PolynomialFit,
  fitPlane3d,
  fitPolynomial,
} from "@/lib/api";
import { CUBE_EDGES, Orbit, Point3, project, toCube } from "@/lib/threeD";

// Five exact measurements of h = 20t - 4.9t², and fifteen noisy ones.
const IDEAL_THROW: Point[] = [
  { x: 0, y: 0 },
  { x: 1, y: 15.1 },
  { x: 2, y: 20.4 },
  { x: 3, y: 15.9 },
  { x: 4, y: 1.6 },
];

const NOISY_THROW: Point[] = [
  { x: 0.0, y: 0.7 },
  { x: 0.29, y: 5.2 },
  { x: 0.57, y: 9.5 },
  { x: 0.86, y: 13.0 },
  { x: 1.14, y: 16.9 },
  { x: 1.43, y: 18.1 },
  { x: 1.71, y: 19.4 },
  { x: 2.0, y: 21.0 },
  { x: 2.29, y: 19.6 },
  { x: 2.57, y: 19.1 },
  { x: 2.86, y: 16.8 },
  { x: 3.14, y: 13.6 },
  { x: 3.43, y: 11.1 },
  { x: 3.71, y: 6.2 },
  { x: 4.0, y: 1.2 },
];

const FLAT = { width: 360, height: 300 };
const FLAT_PAD = { left: 40, right: 12, top: 12, bottom: 34 };
const FLAT_PLOT = {
  width: FLAT.width - FLAT_PAD.left - FLAT_PAD.right,
  height: FLAT.height - FLAT_PAD.top - FLAT_PAD.bottom,
};
const DOMAIN = { tMin: 0, tMax: 4, hMin: -2, hMax: 26, squaredMax: 16 };

const ROOM = 360;
const ROOM_HALF = ROOM / 2;
const ROOM_SCALE = 128;

function toFlat(point: Point) {
  return {
    px: FLAT_PAD.left + ((point.x - DOMAIN.tMin) / (DOMAIN.tMax - DOMAIN.tMin)) * FLAT_PLOT.width,
    py: FLAT_PAD.top + (1 - (point.y - DOMAIN.hMin) / (DOMAIN.hMax - DOMAIN.hMin)) * FLAT_PLOT.height,
  };
}

function toRoom(time: number, squared: number, height: number): Point3 {
  return {
    x: toCube(time, DOMAIN.tMin, DOMAIN.tMax),
    y: toCube(squared, 0, DOMAIN.squaredMax),
    z: toCube(height, DOMAIN.hMin, DOMAIN.hMax),
  };
}

export function LiftedFeaturePlayground() {
  const [points, setPoints] = useState<Point[]>(IDEAL_THROW);
  const [curve, setCurve] = useState<PolynomialFit | null>(null);
  const [plane, setPlane] = useState<PlaneFit3d | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [orbit, setOrbit] = useState<Orbit>({ yaw: -0.9, pitch: 0.35 });
  const dragging = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const [fittedCurve, fittedPlane] = await Promise.all([
          fitPolynomial(points, 2),
          fitPlane3d(
            points.map((point) => ({ height: point.x, age: point.x * point.x, weight: point.y })),
          ),
        ]);
        setCurve(fittedCurve);
        setPlane(fittedPlane);
        setMessage(null);
      } catch (error) {
        if (error instanceof ApiError) setMessage(error.message);
        else setMessage("Something went wrong.");
      }
    })();
  }, [points]);

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

  const curvePath = curve
    ? curve.curve
        .map((point, index) => {
          const { px, py } = toFlat(point);
          return `${index === 0 ? "M" : "L"} ${px.toFixed(1)} ${py.toFixed(1)}`;
        })
        .join(" ")
    : "";

  const wire: { a: Point3; b: Point3 }[] = [];
  if (plane) {
    const corner = (row: number, column: number): Point3 =>
      toRoom(plane.heights_axis[column], plane.ages_axis[row], plane.surface[row][column]);
    for (let row = 0; row < plane.ages_axis.length; row++) {
      for (let column = 0; column < plane.heights_axis.length; column++) {
        if (column + 1 < plane.heights_axis.length) {
          wire.push({ a: corner(row, column), b: corner(row, column + 1) });
        }
        if (row + 1 < plane.ages_axis.length) {
          wire.push({ a: corner(row, column), b: corner(row + 1, column) });
        }
      }
    }
  }
  const projectedWire = wire
    .map((segment) => {
      const a = project(segment.a, orbit, ROOM_HALF, ROOM_SCALE);
      const b = project(segment.b, orbit, ROOM_HALF, ROOM_SCALE);
      return { a, b, depth: (a.depth + b.depth) / 2 };
    })
    .sort((first, second) => second.depth - first.depth);

  // The parabola lives on the plane: at every sampled time the curve's
  // height is the plane's height over (t, t²).
  const liftedPath = curve
    ? curve.curve
        .map((point, index) => {
          const { px, py } = project(toRoom(point.x, point.x * point.x, point.y), orbit, ROOM_HALF, ROOM_SCALE);
          return `${index === 0 ? "M" : "L"} ${px.toFixed(1)} ${py.toFixed(1)}`;
        })
        .join(" ")
    : "";

  const roomPoints = points
    .map((point) => project(toRoom(point.x, point.x * point.x, point.y), orbit, ROOM_HALF, ROOM_SCALE))
    .sort((first, second) => second.depth - first.depth);

  const frame = CUBE_EDGES.map(([a, b]) => ({
    a: project(a, orbit, ROOM_HALF, ROOM_SCALE),
    b: project(b, orbit, ROOM_HALF, ROOM_SCALE),
  }));
  const timeLabel = project({ x: 0, y: -1.2, z: -1.15 }, orbit, ROOM_HALF, ROOM_SCALE);
  const squaredLabel = project({ x: 1.3, y: 0, z: -1.15 }, orbit, ROOM_HALF, ROOM_SCALE);
  const heightLabel = project({ x: -1.25, y: -1.2, z: 0 }, orbit, ROOM_HALF, ROOM_SCALE);

  const curveNamed = curve
    ? Object.fromEntries(curve.coefficients.map((each) => [each.name, each.value]))
    : null;

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 pb-3">
        <Button onClick={() => setPoints(IDEAL_THROW)}>The ideal throw</Button>
        <Button onClick={() => setPoints(NOISY_THROW)}>The noisy throw</Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <p className="mb-2 text-sm font-medium text-slate-700 dark:text-slate-200">
            In the original input, a curve
          </p>
          <svg viewBox={`0 0 ${FLAT.width} ${FLAT.height}`} className="w-full select-none rounded-lg bg-slate-50 dark:bg-slate-950">
            {[0, 5, 10, 15, 20, 25].map((tick) => {
              const { py } = toFlat({ x: 0, y: tick });
              return (
                <g key={`h-${tick}`}>
                  <line x1={FLAT_PAD.left} y1={py} x2={FLAT_PAD.left + FLAT_PLOT.width} y2={py} stroke="currentColor" className="text-slate-200 dark:text-slate-800" />
                  <text x={FLAT_PAD.left - 6} y={py + 4} textAnchor="end" className="fill-slate-400 text-[10px]">{tick}</text>
                </g>
              );
            })}
            {[0, 1, 2, 3, 4].map((tick) => {
              const { px } = toFlat({ x: tick, y: 0 });
              return (
                <text key={`t-${tick}`} x={px} y={FLAT_PAD.top + FLAT_PLOT.height + 14} textAnchor="middle" className="fill-slate-400 text-[10px]">{tick}</text>
              );
            })}
            {curve && <path d={curvePath} fill="none" stroke="currentColor" className="text-indigo-500" strokeWidth={2.5} />}
            {points.map((point, index) => {
              const { px, py } = toFlat(point);
              return <circle key={`flat-${index}`} cx={px} cy={py} r={5} className="fill-slate-700 stroke-white dark:fill-slate-200 dark:stroke-slate-900" strokeWidth={1.5} />;
            })}
            <text x={FLAT_PAD.left + FLAT_PLOT.width / 2} y={FLAT.height - 6} textAnchor="middle" className="fill-slate-500 text-[11px] font-medium dark:fill-slate-400">Time (s)</text>
          </svg>
        </div>

        <div>
          <p className="mb-2 text-sm font-medium text-slate-700 dark:text-slate-200">
            In the constructed features, a plane
          </p>
          <svg
            viewBox={`0 0 ${ROOM} ${ROOM}`}
            className="w-full cursor-grab touch-none select-none rounded-lg bg-slate-50 active:cursor-grabbing dark:bg-slate-950"
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerLeave={onPointerUp}
          >
            {frame.map((edge, index) => (
              <line key={`f${index}`} x1={edge.a.px} y1={edge.a.py} x2={edge.b.px} y2={edge.b.py} stroke="currentColor" className="text-slate-200 dark:text-slate-800" strokeWidth={1} />
            ))}
            {projectedWire.map((segment, index) => (
              <line key={`w${index}`} x1={segment.a.px} y1={segment.a.py} x2={segment.b.px} y2={segment.b.py} stroke="currentColor" className="text-indigo-400/50" strokeWidth={1} />
            ))}
            {curve && <path d={liftedPath} fill="none" stroke="currentColor" className="text-indigo-600 dark:text-indigo-300" strokeWidth={3} />}
            {roomPoints.map((point, index) => (
              <circle key={`r${index}`} cx={point.px} cy={point.py} r={4.5} className="fill-slate-700 stroke-white dark:fill-slate-200 dark:stroke-slate-900" strokeWidth={1.5} />
            ))}
            <text x={timeLabel.px} y={timeLabel.py} textAnchor="middle" className="fill-slate-500 text-[11px] font-medium dark:fill-slate-400">t</text>
            <text x={squaredLabel.px} y={squaredLabel.py} textAnchor="middle" className="fill-slate-500 text-[11px] font-medium dark:fill-slate-400">t²</text>
            <text x={heightLabel.px} y={heightLabel.py} textAnchor="middle" className="fill-slate-500 text-[11px] font-medium dark:fill-slate-400">height</text>
          </svg>
          <p className="mt-1 text-center text-xs text-slate-500 dark:text-slate-500">
            Drag to turn. The thick line is the left-hand curve, lying on the plane.
          </p>
        </div>
      </div>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left dark:border-slate-800">
              <th className="py-1.5 pr-4 font-semibold text-slate-600 dark:text-slate-400">Fitted as</th>
              <th className="py-1.5 pr-4 font-semibold text-slate-600 dark:text-slate-400">intercept</th>
              <th className="py-1.5 pr-4 font-semibold text-slate-600 dark:text-slate-400">on t</th>
              <th className="py-1.5 font-semibold text-slate-600 dark:text-slate-400">on t²</th>
            </tr>
          </thead>
          <tbody className="font-mono text-slate-800 dark:text-slate-200">
            <tr className="border-b border-slate-100 dark:border-slate-800/60">
              <td className="py-1.5 pr-4 font-sans text-slate-600 dark:text-slate-400">a degree-2 curve in t</td>
              <td className="py-1.5 pr-4">{curve ? curve.intercept.toFixed(4) : "…"}</td>
              <td className="py-1.5 pr-4">{curveNamed ? curveNamed["t"].toFixed(4) : "…"}</td>
              <td className="py-1.5">{curveNamed ? curveNamed["t^2"].toFixed(4) : "…"}</td>
            </tr>
            <tr>
              <td className="py-1.5 pr-4 font-sans text-slate-600 dark:text-slate-400">a plane over two inputs</td>
              <td className="py-1.5 pr-4">{plane ? plane.intercept.toFixed(4) : "…"}</td>
              <td className="py-1.5 pr-4">{plane ? plane.height_coefficient.toFixed(4) : "…"}</td>
              <td className="py-1.5">{plane ? plane.age_coefficient.toFixed(4) : "…"}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {message && (
        <p className="mt-3 text-sm text-amber-600 dark:text-amber-400">{message}</p>
      )}
    </div>
  );
}

function Button({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
    >
      {children}
    </button>
  );
}
