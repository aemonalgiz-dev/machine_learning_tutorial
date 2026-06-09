"use client";

// The weight vector turning as the people are presented one at a time.
//
// One unit, or two, reads the people in the order the seeded walk presents
// them, and after each one its weight vector is redrawn from the mean, at the
// length the rule left it rather than scaled to one, so the length is visible
// as well as the angle. The faint line is the eigensolver's direction, the
// bold arrow the unit's, the highlighted person the one just presented, and
// the readouts are that step's arithmetic, the output, the bracket, the
// update and where the weights landed. Every step is the library's rule
// through the API; the browser only draws and pages through them.

import { useEffect, useState } from "react";
import { ApiError, Point } from "@/lib/api";
import { Rule, Start, Walk, WalkStep, WeightState, walkHebbian } from "@/lib/concepts/hebbian-pca";
import { FIRST, PEOPLE, PeopleKey, SECOND } from "./hebbianPcaFixtures";

const VIEW = { width: 640, height: 400 };
const PAD = { left: 56, right: 16, top: 16, bottom: 40 };

// How far a weight vector of length one reaches, as a share of the cloud's
// wider span, so that a vector twice as long as it should be is visibly so.
const REACH_SHARE = 0.4;
const HEAD = 8;

const BUTTON =
  "rounded-md border border-slate-300 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 transition hover:bg-slate-100 disabled:opacity-40 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700";

export function HebbianStepper({
  people = "four",
  rule = "sanger",
  nComponents = 1,
  maxEpochs = 3,
  start = "seeded",
  decay = true,
  centre = true,
  rateMultiplier,
}: {
  people?: PeopleKey;
  rule?: Rule;
  nComponents?: 1 | 2;
  maxEpochs?: number;
  start?: Start;
  decay?: boolean;
  centre?: boolean;
  rateMultiplier?: number;
}) {
  const points = PEOPLE[people];
  const [walk, setWalk] = useState<Walk | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [position, setPosition] = useState(0);

  useEffect(() => {
    let live = true;
    (async () => {
      try {
        const answer = await walkHebbian(points, { rule, nComponents, maxEpochs, start, decay, centre, rateMultiplier });
        if (!live) return;
        setWalk(answer);
        setPosition(0);
        setMessage(null);
      } catch (error) {
        if (!live) return;
        if (error instanceof ApiError) setMessage(error.message);
        else setMessage("Something went wrong.");
      }
    })();
    return () => {
      live = false;
    };
  }, [points, rule, nComponents, maxEpochs, start, decay, centre, rateMultiplier]);

  if (!walk) {
    return <p className="text-sm text-slate-500 dark:text-slate-400">{message ?? "…"}</p>;
  }

  const total = walk.steps.length;
  const step: WalkStep | null = position === 0 ? null : walk.steps[position - 1];
  const states: WeightState[] = step ? step.weights : walk.initial;
  const pivot: Point = centre ? walk.mean : { x: 0, y: 0 };
  const rowsPerEpoch = points.length;

  // The window follows the cloud, and when the rows are positions rather
  // than deviations the origin has to be in it, since the arrow now starts
  // there.
  const xs = points.map((point) => point.x).concat(centre ? [] : [0]);
  const ys = points.map((point) => point.y).concat(centre ? [] : [0]);
  const xSpan = Math.max(...xs) - Math.min(...xs) || 1;
  const ySpan = Math.max(...ys) - Math.min(...ys) || 1;
  const domain = {
    xMin: Math.min(...xs) - 0.15 * xSpan,
    xMax: Math.max(...xs) + 0.15 * xSpan,
    yMin: Math.min(...ys) - 0.15 * ySpan,
    yMax: Math.max(...ys) + 0.15 * ySpan,
  };
  const plotX = (value: number) => PAD.left + ((value - domain.xMin) / (domain.xMax - domain.xMin)) * (VIEW.width - PAD.left - PAD.right);
  const plotY = (value: number) => PAD.top + (1 - (value - domain.yMin) / (domain.yMax - domain.yMin)) * (VIEW.height - PAD.top - PAD.bottom);
  const reach = REACH_SHARE * Math.max(xSpan, ySpan);
  const lineReach = Math.max(xSpan, ySpan) * 0.6;

  const arrow = (state: WeightState, colour: string, width: number) => {
    const shown = Math.min(state.length, 3);
    const tip = { x: pivot.x + reach * shown * (state.dx / state.length), y: pivot.y + reach * shown * (state.dy / state.length) };
    const tail = { px: plotX(pivot.x), py: plotY(pivot.y) };
    const head = { px: plotX(tip.x), py: plotY(tip.y) };
    const dx = head.px - tail.px;
    const dy = head.py - tail.py;
    const length = Math.hypot(dx, dy) || 1;
    const ux = dx / length;
    const uy = dy / length;
    const base = { px: head.px - ux * HEAD, py: head.py - uy * HEAD };
    return (
      <g key={colour} stroke={colour} fill={colour}>
        <line x1={tail.px} y1={tail.py} x2={head.px} y2={head.py} strokeWidth={width} />
        <polygon points={`${head.px},${head.py} ${base.px - uy * HEAD * 0.5},${base.py + ux * HEAD * 0.5} ${base.px + uy * HEAD * 0.5},${base.py - ux * HEAD * 0.5}`} strokeWidth={0} />
      </g>
    );
  };

  const eigenLine = (index: number, colour: string) => {
    const twin = walk.eigen[index];
    if (!twin) return null;
    return (
      <line
        key={`eigen-${index}`}
        x1={plotX(pivot.x - lineReach * twin.dx)}
        y1={plotY(pivot.y - lineReach * twin.dy)}
        x2={plotX(pivot.x + lineReach * twin.dx)}
        y2={plotY(pivot.y + lineReach * twin.dy)}
        stroke={colour}
        strokeWidth={1.5}
        strokeDasharray="6 4"
        opacity={0.5}
      />
    );
  };

  const format = (value: number, digits = 3) => (Math.abs(value) >= 1e5 ? value.toExponential(2) : value.toFixed(digits));
  const vector = (value: { x: number; y: number }) => `(${format(value.x)}, ${format(value.y)})`;
  const colours = [FIRST, SECOND];

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
        <button className={BUTTON} onClick={() => setPosition(0)} disabled={position === 0}>start</button>
        <button className={BUTTON} onClick={() => setPosition((current) => Math.max(0, current - 1))} disabled={position === 0}>back one person</button>
        <button className={BUTTON} onClick={() => setPosition((current) => Math.min(total, current + 1))} disabled={position === total}>next person</button>
        <button className={BUTTON} onClick={() => setPosition((current) => Math.min(total, (Math.floor(current / rowsPerEpoch) + 1) * rowsPerEpoch))} disabled={position === total}>end of epoch</button>
        <label className="ml-auto flex items-center gap-2">
          <input type="range" min={0} max={total} step={1} value={position} onChange={(event) => setPosition(Number(event.target.value))} className="w-36 accent-indigo-600" />
          <span className="w-24 text-right font-mono text-xs">{position} of {total}</span>
        </label>
      </div>

      <svg viewBox={`0 0 ${VIEW.width} ${VIEW.height}`} className="mt-3 w-full select-none rounded-lg bg-slate-50 dark:bg-slate-950">
        {!centre && (
          <>
            <line x1={plotX(0)} x2={plotX(0)} y1={PAD.top} y2={VIEW.height - PAD.bottom} className="stroke-slate-300 dark:stroke-slate-700" strokeWidth={1} />
            <line x1={PAD.left} x2={VIEW.width - PAD.right} y1={plotY(0)} y2={plotY(0)} className="stroke-slate-300 dark:stroke-slate-700" strokeWidth={1} />
          </>
        )}
        {eigenLine(0, FIRST)}
        {nComponents === 2 && eigenLine(1, SECOND)}
        {step && (
          <line x1={plotX(pivot.x)} y1={plotY(pivot.y)} x2={plotX(points[step.row].x)} y2={plotY(points[step.row].y)} className="stroke-slate-400 dark:stroke-slate-600" strokeWidth={1} strokeDasharray="2 3" />
        )}
        {points.map((person, index) => (
          <circle key={index} cx={plotX(person.x)} cy={plotY(person.y)} r={step && step.row === index ? 8 : 5.5} fill={step && step.row === index ? FIRST : "#334155"} stroke="white" strokeWidth={1.5} />
        ))}
        <circle cx={plotX(pivot.x)} cy={plotY(pivot.y)} r={4} fill="white" stroke={FIRST} strokeWidth={2} />
        {states.map((state, index) => arrow(state, colours[index], index === 0 ? 3.5 : 2.5))}
        <text x={PAD.left + (VIEW.width - PAD.left - PAD.right) / 2} y={VIEW.height - 8} textAnchor="middle" className="fill-slate-500 text-xs dark:fill-slate-400">height, cm</text>
        <text x={16} y={VIEW.height / 2} textAnchor="middle" transform={`rotate(-90 16 ${VIEW.height / 2})`} className="fill-slate-500 text-xs dark:fill-slate-400">weight, kg</text>
      </svg>

      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Stat label="presented" value={step ? `person ${step.row + 1}, epoch ${step.epoch}` : "nobody yet"} />
        <Stat label="rate this epoch" value={step ? step.rate.toPrecision(3) : walk.starting_rate.toPrecision(3)} />
        <Stat label={centre ? "deviation read" : "position read"} value={step ? vector(step.presented) : "…"} />
        <Stat label="output y = w · x" value={step ? format(step.outputs[0]) : "…"} />
        <Stat label={rule === "hebb" ? "bracket, the row itself" : "bracket x − y·w"} value={step ? vector(step.residuals[0]) : "…"} />
        <Stat label="update rate · y · bracket" value={step ? vector(step.updates[0]) : "…"} />
        <Stat label="weights w" value={vector({ x: states[0].dx, y: states[0].dy })} />
        <Stat label="length of w" value={format(states[0].length, 4)} />
        <Stat label="angle to the eigen direction" value={`${states[0].angle_degrees.toFixed(2)}°`} />
        {!centre && <Stat label="angle to the direction of the mean" value={`${states[0].angle_to_mean_degrees.toFixed(2)}°`} />}
        {nComponents === 2 && states[1] && (
          <>
            <Stat label="second unit, length" value={format(states[1].length, 4)} />
            <Stat label="second unit, angle to its twin" value={`${states[1].angle_degrees.toFixed(2)}°`} />
            <Stat label="angle between the two units" value={`${angleBetween(states[0], states[1]).toFixed(2)}°`} />
          </>
        )}
      </div>
      {walk.diverged_at_epoch !== null && (
        <p className="mt-2 text-sm text-amber-600 dark:text-amber-400">
          The weights stopped being finite on epoch {walk.diverged_at_epoch}, and nothing after that is recorded.
        </p>
      )}
      {message && <p className="mt-2 text-sm text-amber-600 dark:text-amber-400">{message}</p>}
    </div>
  );
}

function angleBetween(first: WeightState, second: WeightState): number {
  const alignment = Math.abs(first.dx * second.dx + first.dy * second.dy) / (first.length * second.length);
  return (Math.acos(Math.min(1, alignment)) * 180) / Math.PI;
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-slate-100 px-2 py-1.5 dark:bg-slate-800">
      <div className="text-[11px] text-slate-500 dark:text-slate-400">{label}</div>
      <div className="font-mono text-sm font-semibold text-slate-900 dark:text-slate-100">{value}</div>
    </div>
  );
}
