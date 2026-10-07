"use client";

import { useState } from "react";

// A coordinate diagram with a manually positioned divider, not a fitted model.
// Every step uses the same observations. Height depends only on coordinates.
const POINTS = [
  { x: 0, y: 0, middle: true },
  { x: 0.45, y: 0.25, middle: true },
  { x: -0.5, y: 0.3, middle: true },
  { x: 0.15, y: -0.55, middle: true },
  { x: -0.35, y: -0.3, middle: true },
  { x: 0.1, y: 0.6, middle: true },
  ...Array.from({ length: 10 }, (_, i) => ({
    x: 1.8 * Math.cos((i * Math.PI * 2) / 10),
    y: 1.8 * Math.sin((i * Math.PI * 2) / 10),
    middle: false,
  })),
];

const STEPS = [
  { label: "Original", title: "The middle group is surrounded", text: "Imagine these points as coloured beads on a tabletop. Blue beads sit in the middle, with amber beads around them. Slide or turn a straight divider across the table: some amber beads will always be on the blue side." },
  { label: "Stretch", title: "Spread out the horizontal positions", text: "Move every point farther from the centre horizontally. The surrounding ring becomes wider, but it still surrounds the blue group. A stretch changes distances without creating a straight divider between these groups." },
  { label: "Compress", title: "Bring the vertical positions closer together", text: "Move every point closer to the horizontal axis. The ring becomes flatter. It may look different, but the blue group is still inside it. Making one direction smaller has not solved the separation problem." },
  { label: "Rotate", title: "Turn every position by the same angle", text: "A rotation changes the direction in which we see the pattern. Follow the marked points A and B as they turn. Their labels stay the same, and the surrounding group still surrounds the middle." },
  { label: "Add height", title: "Farther from the centre becomes higher", text: "Return to the original horizontal positions and add a height to each point. Use its squared distance from the centre as that height. The middle points stay low; the surrounding points rise. The faint lines show where each point started." },
  { label: "Place a plane", title: "A flat divider can now fit between the groups", text: "A plane is a flat surface extending in two directions, like a sheet of glass. Move this plane up and down. When it sits above every blue point and below every amber point, it separates the groups. The rectangle shows a small part of that plane." },
  { label: "Original view", title: "The same decision becomes a circle below", text: "Return to the original two coordinates while keeping the height rule. Points inside the circle would rise less than the plane; points outside would rise more. Moving the plane changes the circle's size. We are expressing the same decision in the original view." },
];

type Position = { x: number; y: number };

export function KernelTransformationStory() {
  const [step, setStep] = useState(0);
  const [plane, setPlane] = useState(1);
  const current = STEPS[step];
  const raised = step === 4 || step === 5;
  const hasDivider = step >= 5;
  const height = (point: Position) => point.x ** 2 + point.y ** 2;
  const project = (x: number, y: number, z = 0): Position => raised
    ? { x: 240 + 65 * x + 26 * y, y: 266 + 15 * x - 23 * y - 46 * z }
    : { x: 240 + 72 * x, y: 166 - 72 * y };
  const position = (point: Position) => {
    if (step === 1) return project(point.x * 1.4, point.y);
    if (step === 2) return project(point.x, point.y * 0.4);
    if (step === 3) {
      const angle = Math.PI / 3;
      return project(point.x * Math.cos(angle) - point.y * Math.sin(angle), point.x * Math.sin(angle) + point.y * Math.cos(angle));
    }
    return project(point.x, point.y, raised ? height(point) : 0);
  };
  const corners = (z: number) => [[-2.1, -2.1], [2.1, -2.1], [2.1, 2.1], [-2.1, 2.1]]
    .map(([x, y]) => { const p = project(x, y, z); return `${p.x},${p.y}`; }).join(" ");
  const misplaced = POINTS.filter(point => (height(point) < plane) !== point.middle).length;
  const pointMark = (point: typeof POINTS[number], index: number) => {
    const p = position(point);
    const name = index === 1 ? "A" : index === 6 ? "B" : null;
    return <g key={index} transform={`translate(${p.x} ${p.y})`}>
      {point.middle
        ? <circle r={6.5} className="fill-indigo-600 stroke-white dark:fill-indigo-400 dark:stroke-slate-950" strokeWidth={1.5} />
        : <path d="M 0 -8 L 8 0 L 0 8 L -8 0 Z" className="fill-amber-500 stroke-white dark:stroke-slate-950" strokeWidth={1.5} />}
      {name && <text x={10} y={-9} className="fill-slate-700 text-lg font-bold dark:fill-slate-200">{name}</text>}
    </g>;
  };

  return <div className="space-y-4">
    <div role="group" aria-label="Transformation steps" className="grid grid-cols-2 gap-2 sm:grid-cols-4">
      {STEPS.map((item, index) => <button key={item.label} type="button" aria-pressed={index === step} onClick={() => setStep(index)} className={`rounded-md border px-2 py-2 text-left text-sm ${index === step ? "border-indigo-600 bg-indigo-50 font-semibold text-indigo-800 dark:bg-indigo-950 dark:text-indigo-200" : "border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"}`}>
        {index + 1}. {item.label}
      </button>)}
    </div>
    <div aria-live="polite" aria-atomic="true">
      <h3 className="font-semibold text-slate-900 dark:text-slate-100">{current.title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">{current.text}</p>
    </div>
    <svg viewBox="0 0 480 350" role="img" aria-label={`${current.title}. ${current.text}`} className="w-full rounded-lg bg-slate-50 dark:bg-slate-950">
      <polygon points={corners(0)} fill="none" className="stroke-slate-300 dark:stroke-slate-700" />
      {[-2, -1, 0, 1, 2].map(tick => {
        const a = project(-2.1, tick), b = project(2.1, tick);
        const c = project(tick, -2.1), d = project(tick, 2.1);
        return <g key={tick} className="stroke-slate-200 dark:stroke-slate-800" strokeWidth={1}>
          <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} />
          <line x1={c.x} y1={c.y} x2={d.x} y2={d.y} />
        </g>;
      })}
      {raised && POINTS.map((point, index) => {
        const base = project(point.x, point.y), top = position(point);
        return <g key={index} className="stroke-slate-400 dark:stroke-slate-600">
          <circle cx={base.x} cy={base.y} r={3} fill="none" />
          <line x1={base.x} y1={base.y} x2={top.x} y2={top.y} strokeDasharray="3 4" />
        </g>;
      })}
      {step === 6 && <circle cx={240} cy={166} r={72 * Math.sqrt(plane)} className="fill-emerald-500/10 stroke-emerald-600 dark:stroke-emerald-400" strokeWidth={2} />}
      {POINTS.map((point, index) => step !== 5 || height(point) < plane ? pointMark(point, index) : null)}
      {step === 5 && <polygon points={corners(plane)} className="fill-emerald-500/20 stroke-emerald-600 dark:stroke-emerald-400" strokeWidth={2} />}
      {step === 5 && POINTS.map((point, index) => height(point) >= plane ? pointMark(point, index) : null)}
    </svg>
    <p className="text-sm text-slate-600 dark:text-slate-400">Blue circles: the middle group. Amber diamonds: the surrounding group. A and B mark the same two observations in every view.</p>
    {hasDivider && <div className="rounded-md border border-emerald-200 p-3 dark:border-emerald-900">
      <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
        Move the separating plane
        <input aria-label="Separating plane height" type="range" min={0} max={4} step={0.05} value={plane} onChange={event => setPlane(Number(event.target.value))} className="mt-3 block w-full accent-emerald-600" />
      </label>
      <p aria-live="polite" className="mt-2 text-sm text-slate-600 dark:text-slate-300">{misplaced === 0 ? "The divider separates these groups: blue below, amber above." : `${misplaced} observations are on the wrong side. Try moving the plane into the gap between the groups.`}</p>
      <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">You are choosing this divider by hand. A fitted classifier would use the training labels and its learning objective to choose a boundary.</p>
    </div>}
    <div className="flex items-center justify-between gap-3">
      <button type="button" disabled={step === 0} onClick={() => setStep(step - 1)} className="rounded-md border border-slate-300 px-3 py-2 text-sm disabled:opacity-40 dark:border-slate-700">Previous step</button>
      <span className="text-xs text-slate-500">{step + 1} of {STEPS.length}</span>
      <button type="button" disabled={step === STEPS.length - 1} onClick={() => setStep(step + 1)} className="rounded-md bg-indigo-600 px-3 py-2 text-sm text-white disabled:opacity-40">Next step</button>
    </div>
    <p className="text-xs text-slate-500 dark:text-slate-400">A deliberately simple arrangement to make the geometry visible. Every height comes from the same coordinate rule; the rule does not read a point&apos;s label.</p>
  </div>;
}
