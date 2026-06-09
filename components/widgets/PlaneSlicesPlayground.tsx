"use client";

// The fitted plane, and the two straight lines hiding inside it.
//
// Twenty people float in a room, height across, age into the depth, weight
// upward, and the wireframe is the plane the several-inputs fit chose. Below
// the room are two flat cuts through that plane. Fix an age and the plane
// seen against height is a line whose slope is the height coefficient; fix a
// height and the plane seen against age is a line whose slope is the age
// coefficient. Sliding either cut moves a highlighted line across the
// wireframe, so "holding the other input fixed" is something you can watch
// rather than a phrase. The fit, the lattice and every fitted weight come
// from the API; the browser rotates and draws.

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

// The same twenty with weights sitting almost exactly on one plane.
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
      Math.round(
        (0.62 * height + 0.18 * age - 45 + (Math.random() - 0.5) * 18) * 10,
      ) / 10;
    return { height, age, weight };
  });
}

// How far from the fixed value a person may sit and still be highlighted in a
// slice. The plane is exact at the fixed value; the people never are.
const SLICE_TOLERANCE = { age: 6, height: 6 };

const PRESET_VIEWS: { label: string; orbit: Orbit }[] = [
  { label: "Turn the room", orbit: { yaw: -2.2, pitch: 0.5 } },
  { label: "Face the height axis", orbit: { yaw: 0, pitch: 0.05 } },
  { label: "Face the age axis", orbit: { yaw: -Math.PI / 2, pitch: 0.05 } },
];

function cubePoint(height: number, age: number, weight: number): Point3 {
  return {
    x: toCube(height, RANGE.height[0], RANGE.height[1]),
    y: toCube(age, RANGE.age[0], RANGE.age[1]),
    z: toCube(weight, RANGE.weight[0], RANGE.weight[1]),
  };
}

function predictedWeight(fit: PlaneFit3d, height: number, age: number): number {
  return fit.intercept + fit.height_coefficient * height + fit.age_coefficient * age;
}

export function PlaneSlicesPlayground() {
  const [people, setPeople] = useState<Person3d[]>(MEASURED_PEOPLE);
  const [fit, setFit] = useState<PlaneFit3d | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [orbit, setOrbit] = useState<Orbit>(PRESET_VIEWS[0].orbit);
  const [fixedAge, setFixedAge] = useState(44);
  const [fixedHeight, setFixedHeight] = useState(172);
  const [showPeople, setShowPeople] = useState(true);
  const [showPlane, setShowPlane] = useState(true);
  const [showResiduals, setShowResiduals] = useState(false);
  const dragging = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setFit(await fitPlane3d(people));
        setMessage(null);
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
  if (fit && showPlane) {
    const corner = (row: number, column: number): Point3 =>
      cubePoint(fit.heights_axis[column], fit.ages_axis[row], fit.surface[row][column]);
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

  const projectedPeople = showPeople
    ? people
        .map((person, index) => ({
          ...project(cubePoint(person.height, person.age, person.weight), orbit, HALF, SCALE),
          index,
        }))
        .sort((first, second) => second.depth - first.depth)
    : [];

  // A residual is the vertical drop from the person to the plane beneath them.
  const residualLines =
    fit && showResiduals
      ? people.map((person, index) => {
          const top = project(cubePoint(person.height, person.age, person.weight), orbit, HALF, SCALE);
          const bottom = project(cubePoint(person.height, person.age, fit.fitted[index]), orbit, HALF, SCALE);
          return { top, bottom, above: person.weight >= fit.fitted[index] };
        })
      : [];

  // The two cuts, drawn onto the wireframe as thick lines.
  const heightCut = fit
    ? {
        a: project(cubePoint(RANGE.height[0], fixedAge, predictedWeight(fit, RANGE.height[0], fixedAge)), orbit, HALF, SCALE),
        b: project(cubePoint(RANGE.height[1], fixedAge, predictedWeight(fit, RANGE.height[1], fixedAge)), orbit, HALF, SCALE),
      }
    : null;
  const ageCut = fit
    ? {
        a: project(cubePoint(fixedHeight, RANGE.age[0], predictedWeight(fit, fixedHeight, RANGE.age[0])), orbit, HALF, SCALE),
        b: project(cubePoint(fixedHeight, RANGE.age[1], predictedWeight(fit, fixedHeight, RANGE.age[1])), orbit, HALF, SCALE),
      }
    : null;

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
        <Button onClick={() => setPeople(IDEAL_PEOPLE)}>An Ideal Case</Button>
        <Button onClick={() => setPeople(MEASURED_PEOPLE)}>The measured twenty</Button>
        <Button onClick={() => setPeople(randomPeople())}>Random people</Button>
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 pb-3 text-sm text-slate-600 dark:text-slate-300">
        <Toggle label="people" checked={showPeople} onChange={setShowPeople} />
        <Toggle label="plane" checked={showPlane} onChange={setShowPlane} />
        <Toggle label="residual drops" checked={showResiduals} onChange={setShowResiduals} />
        <span className="ml-auto flex flex-wrap gap-2">
          {PRESET_VIEWS.map((view) => (
            <button
              key={view.label}
              onClick={() => setOrbit(view.orbit)}
              className="rounded-md border border-slate-300 bg-white px-2 py-1 text-xs font-medium text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
            >
              {view.label}
            </button>
          ))}
        </span>
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
            className="text-indigo-400/60"
            strokeWidth={1.2}
          />
        ))}

        {heightCut && (
          <line
            x1={heightCut.a.px}
            y1={heightCut.a.py}
            x2={heightCut.b.px}
            y2={heightCut.b.py}
            stroke="currentColor"
            className="text-indigo-600 dark:text-indigo-300"
            strokeWidth={3}
          />
        )}
        {ageCut && (
          <line
            x1={ageCut.a.px}
            y1={ageCut.a.py}
            x2={ageCut.b.px}
            y2={ageCut.b.py}
            stroke="currentColor"
            className="text-amber-500 dark:text-amber-400"
            strokeWidth={3}
          />
        )}

        {residualLines.map((residual, index) => (
          <line
            key={`r${index}`}
            x1={residual.top.px}
            y1={residual.top.py}
            x2={residual.bottom.px}
            y2={residual.bottom.py}
            stroke="currentColor"
            className={residual.above ? "text-emerald-500" : "text-rose-500"}
            strokeWidth={1.5}
          />
        ))}

        {projectedPeople.map((person) => (
          <circle
            key={`p${person.index}`}
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
        Drag to turn the room. The indigo line is the cut at the fixed age, the
        amber line the cut at the fixed height.
      </p>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <SlicePanel
          title="Weight against height"
          accent="indigo"
          fixedLabel="age fixed at"
          fixedValue={fixedAge}
          fixedUnit="years"
          fixedRange={RANGE.age}
          onFixedChange={setFixedAge}
          horizontalLabel="Height (cm)"
          horizontalRange={RANGE.height}
          people={people.map((person) => ({
            horizontal: person.height,
            weight: person.weight,
            near: Math.abs(person.age - fixedAge) <= SLICE_TOLERANCE.age,
          }))}
          line={
            fit
              ? {
                  start: predictedWeight(fit, RANGE.height[0], fixedAge),
                  end: predictedWeight(fit, RANGE.height[1], fixedAge),
                }
              : null
          }
          slope={fit ? fit.height_coefficient : null}
          slopeUnit="kg per cm"
        />
        <SlicePanel
          title="Weight against age"
          accent="amber"
          fixedLabel="height fixed at"
          fixedValue={fixedHeight}
          fixedUnit="cm"
          fixedRange={RANGE.height}
          onFixedChange={setFixedHeight}
          horizontalLabel="Age (years)"
          horizontalRange={RANGE.age}
          people={people.map((person) => ({
            horizontal: person.age,
            weight: person.weight,
            near: Math.abs(person.height - fixedHeight) <= SLICE_TOLERANCE.height,
          }))}
          line={
            fit
              ? {
                  start: predictedWeight(fit, fixedHeight, RANGE.age[0]),
                  end: predictedWeight(fit, fixedHeight, RANGE.age[1]),
                }
              : null
          }
          slope={fit ? fit.age_coefficient : null}
          slopeUnit="kg per year"
        />
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="kg per cm of height" value={fit ? fit.height_coefficient.toFixed(3) : "…"} />
        <Stat label="kg per year of age" value={fit ? fit.age_coefficient.toFixed(3) : "…"} />
        <Stat label="Intercept" value={fit ? fit.intercept.toFixed(2) : "…"} />
        <Stat label="R²" value={fit ? fit.r_squared.toFixed(3) : "…"} />
      </div>

      {message && (
        <p className="mt-3 text-sm text-amber-600 dark:text-amber-400">{message}</p>
      )}
    </div>
  );
}

const SLICE_VIEW = { width: 320, height: 240 };
const SLICE_PAD = { left: 40, right: 12, top: 12, bottom: 34 };
const SLICE_PLOT = {
  width: SLICE_VIEW.width - SLICE_PAD.left - SLICE_PAD.right,
  height: SLICE_VIEW.height - SLICE_PAD.top - SLICE_PAD.bottom,
};

function SlicePanel({
  title,
  accent,
  fixedLabel,
  fixedValue,
  fixedUnit,
  fixedRange,
  onFixedChange,
  horizontalLabel,
  horizontalRange,
  people,
  line,
  slope,
  slopeUnit,
}: {
  title: string;
  accent: "indigo" | "amber";
  fixedLabel: string;
  fixedValue: number;
  fixedUnit: string;
  fixedRange: readonly [number, number];
  onFixedChange: (value: number) => void;
  horizontalLabel: string;
  horizontalRange: readonly [number, number];
  people: { horizontal: number; weight: number; near: boolean }[];
  line: { start: number; end: number } | null;
  slope: number | null;
  slopeUnit: string;
}) {
  const toX = (value: number) =>
    SLICE_PAD.left +
    ((value - horizontalRange[0]) / (horizontalRange[1] - horizontalRange[0])) *
      SLICE_PLOT.width;
  const toY = (weight: number) =>
    SLICE_PAD.top +
    (1 - (weight - RANGE.weight[0]) / (RANGE.weight[1] - RANGE.weight[0])) *
      SLICE_PLOT.height;
  const clampY = (value: number) =>
    Math.min(SLICE_PAD.top + SLICE_PLOT.height, Math.max(SLICE_PAD.top, value));

  const lineClass =
    accent === "indigo"
      ? "text-indigo-600 dark:text-indigo-300"
      : "text-amber-500 dark:text-amber-400";
  const nearClass =
    accent === "indigo"
      ? "fill-indigo-600 dark:fill-indigo-300"
      : "fill-amber-500 dark:fill-amber-400";
  const sliderClass = accent === "indigo" ? "accent-indigo-600" : "accent-amber-500";

  return (
    <div className="rounded-lg border border-slate-200 p-3 dark:border-slate-800">
      <p className="mb-2 text-sm font-medium text-slate-700 dark:text-slate-200">{title}</p>
      <svg
        viewBox={`0 0 ${SLICE_VIEW.width} ${SLICE_VIEW.height}`}
        className="w-full select-none rounded-md bg-slate-50 dark:bg-slate-950"
      >
        {[50, 60, 70, 80].map((tick) => (
          <g key={`tick-${tick}`}>
            <line
              x1={SLICE_PAD.left}
              y1={toY(tick)}
              x2={SLICE_PAD.left + SLICE_PLOT.width}
              y2={toY(tick)}
              stroke="currentColor"
              className="text-slate-200 dark:text-slate-800"
            />
            <text x={SLICE_PAD.left - 6} y={toY(tick) + 4} textAnchor="end" className="fill-slate-400 text-[10px]">
              {tick}
            </text>
          </g>
        ))}
        {people.map((person, index) => (
          <circle
            key={`slice-${index}`}
            cx={toX(person.horizontal)}
            cy={clampY(toY(person.weight))}
            r={person.near ? 4.5 : 3}
            className={person.near ? nearClass : "fill-slate-300 dark:fill-slate-700"}
          />
        ))}
        {line && (
          <line
            x1={toX(horizontalRange[0])}
            y1={clampY(toY(line.start))}
            x2={toX(horizontalRange[1])}
            y2={clampY(toY(line.end))}
            stroke="currentColor"
            className={lineClass}
            strokeWidth={3}
          />
        )}
        <text
          x={SLICE_PAD.left + SLICE_PLOT.width / 2}
          y={SLICE_VIEW.height - 6}
          textAnchor="middle"
          className="fill-slate-500 text-[11px] font-medium dark:fill-slate-400"
        >
          {horizontalLabel}
        </text>
      </svg>
      <label className="mt-2 flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
        {fixedLabel}
        <input
          type="range"
          min={fixedRange[0]}
          max={fixedRange[1]}
          step={1}
          value={fixedValue}
          onChange={(event) => onFixedChange(Number(event.target.value))}
          className={`flex-1 ${sliderClass}`}
        />
        <span className="w-16 font-mono">
          {fixedValue} {fixedUnit}
        </span>
      </label>
      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
        Slope of the cut: {slope === null ? "…" : slope.toFixed(3)} {slopeUnit}. The
        larger dots are people within {accent === "indigo" ? SLICE_TOLERANCE.age : SLICE_TOLERANCE.height}{" "}
        {fixedUnit} of the fixed value.
      </p>
    </div>
  );
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-1.5">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="accent-indigo-600"
      />
      {label}
    </label>
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
