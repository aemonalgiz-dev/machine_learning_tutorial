"use client";

import { useRef, useState } from "react";
import type { LessonIntuition, Scene } from "@/lib/intuition/types";

const COLOURS = ["#6366f1", "#f59e0b", "#10b981", "#f43f5e"];

function SceneView({ scene }: { scene: Scene }) {
  if (scene.kind === "strips") return <div className="space-y-3">
    {scene.rows.map((row, index) => <div key={index}>
      {index > 0 && scene.connected && <div aria-hidden="true" className="mb-2 text-center text-xl text-indigo-500">↓</div>}
      <p className="mb-2 text-sm font-medium text-slate-600 dark:text-slate-300">{row.label}</p>
      <ol className="flex flex-wrap gap-2" aria-label={row.label}>
        {row.items.map((item, itemIndex) => <li key={itemIndex} className={`min-w-0 max-w-full break-words rounded-lg border px-3 py-2 text-sm ${row.active?.includes(itemIndex) ? "border-indigo-500 bg-indigo-100 font-semibold text-indigo-950 dark:bg-indigo-950 dark:text-indigo-100" : "border-slate-300 bg-white text-slate-700 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200"}`}>
          {row.active?.includes(itemIndex) && <span className="sr-only">Highlighted: </span>}{item}
        </li>)}
      </ol>
    </div>)}
  </div>;

  if (scene.kind === "bars") {
    const maximum = Math.max(1, ...scene.items.map(item => Math.abs(item.value)));
    return <div className="space-y-4">{scene.items.map((item, index) => <div key={index}>
      <div className="mb-1 flex flex-wrap justify-between gap-2 text-sm"><span>{item.label}</span><span className="font-mono">{item.display ?? item.value}</span></div>
      <div className="h-5 overflow-hidden rounded bg-slate-200 dark:bg-slate-800"><div className="h-full rounded" style={{ width: `${Math.abs(item.value) / maximum * 100}%`, background: item.value < 0 ? COLOURS[1] : COLOURS[0] }} /></div>
    </div>)}</div>;
  }

  if (scene.kind === "tiles") return <div className="grid gap-5 sm:grid-cols-2">{scene.panels.map((panel, index) => {
    const columns = panel.cells[0].length;
    return <div key={index} className="min-w-0">
      <p className="mb-2 text-sm font-medium">{panel.label}</p>
      <svg role="img" aria-label={panel.label} viewBox={`0 0 ${columns * 25} ${panel.cells.length * 25}`} className="mx-auto w-full max-w-52 rounded">
        {panel.cells.flatMap((row, y) => row.map((value, x) => <rect key={`${x}-${y}`} x={x * 25 + 1} y={y * 25 + 1} width={23} height={23} rx={2} fill={value === 0 ? "#e2e8f0" : value === 2 ? "#f59e0b" : value === 3 ? "#10b981" : "#6366f1"} stroke={panel.selected?.includes(y * columns + x) ? "#e11d48" : "none"} strokeWidth={2.5}><title>{`Row ${y + 1}, column ${x + 1}: ${value === 0 ? "background" : value === 2 ? "changed cell" : value === 3 ? "selected result" : "foreground"}`}</title></rect>))}
      </svg>
    </div>;
  })}</div>;

  const all = [...scene.points, ...(scene.paths ?? []).flat(), ...(scene.guides ?? []).flatMap(line => [[line[0], line[1]], [line[2], line[3]]])];
  const xs = all.map(p => p[0]), ys = all.map(p => p[1]);
  const [lowX, highX, lowY, highY] = scene.bounds ?? [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)];
  const scaleX = 390 / (highX - lowX || 1), scaleY = 205 / (highY - lowY || 1);
  const unitScale = Math.min(scaleX, scaleY);
  const equalScale = scene.equalScale ?? (
    scene.xLabel.toLowerCase().includes("coordinate") ||
    scene.xLabel === "East-west position" ||
    scene.xLabel === "First measurement"
  );
  const width = equalScale ? (highX - lowX) * unitScale : 390;
  const height = equalScale ? (highY - lowY) * unitScale : 205;
  const x = (value: number) => 35 + (390 - width) / 2 + (value - lowX) * (equalScale ? unitScale : scaleX);
  const y = (value: number) => 245 - (205 - height) / 2 - (value - lowY) * (equalScale ? unitScale : scaleY);
  const tickLabel = (value: number) => Number(value.toPrecision(4)).toString();
  return <div>
    <p className="mb-1 text-xs text-slate-500 dark:text-slate-400">Vertical: {scene.yLabel}</p>
    <svg viewBox="0 0 460 275" role="img" aria-label={scene.caption} className="w-full">
      <path d="M 25 15 V 255 H 445" fill="none" className="stroke-slate-400 dark:stroke-slate-500" />
      {[lowX, (lowX + highX) / 2, highX].map((value, index) => <text key={index} x={x(value)} y={270} textAnchor="middle" className="fill-slate-500 text-[10px] dark:fill-slate-400">{tickLabel(value)}</text>)}
      {[lowY, (lowY + highY) / 2, highY].map((value, index) => <text key={index} x={25} y={y(value) + 3} textAnchor="end" className="fill-slate-500 text-[10px] dark:fill-slate-400">{tickLabel(value)}</text>)}
      {scene.guides?.map((line, index) => <line key={index} x1={x(line[0])} y1={y(line[1])} x2={x(line[2])} y2={y(line[3])} stroke="#f59e0b" strokeWidth={2} strokeDasharray="4 4" />)}
      {scene.paths?.map((path, index) => <polyline key={index} points={path.map(p => `${x(p[0])},${y(p[1])}`).join(" ")} fill="none" stroke={index === 0 ? "#10b981" : "#f43f5e"} strokeWidth={3} />)}
      {scene.points.map((point, index) => <g key={index}>
        <circle cx={x(point[0])} cy={y(point[1])} r={6} fill={COLOURS[point[2] ?? 0]} stroke="white" strokeWidth={1.5} />
        {scene.labels?.[index] && <text x={x(point[0]) + (x(point[0]) > 350 ? -9 : 9)} y={y(point[1]) - 9} textAnchor={x(point[0]) > 350 ? "end" : "start"} className="fill-slate-600 text-sm dark:fill-slate-300">{scene.labels[index]}</text>}
      </g>)}
    </svg>
    <p className="mt-1 text-right text-xs text-slate-500 dark:text-slate-400">Horizontal: {scene.xLabel}</p>
  </div>;
}

export function GuidedIntuition({ lesson }: { lesson: LessonIntuition }) {
  const [index, setIndex] = useState(0);
  const [alternative, setAlternative] = useState(false);
  const stepContent = useRef<HTMLDivElement>(null);
  const current = lesson.steps[index];
  const selected = alternative && current.alternative ? current.alternative : current;
  const revealExplanation = () => requestAnimationFrame(() => {
    const content = stepContent.current;
    if (!content) return;
    const top = content.getBoundingClientRect().top;
    if (top < 0 || top > window.innerHeight - 80) content.scrollIntoView({ block: "start" });
  });
  const go = (next: number) => { setIndex(next); setAlternative(false); revealExplanation(); };
  return <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
    <div role="group" aria-label="Walkthrough steps" className="mb-5 flex flex-wrap gap-2">
      {lesson.steps.map((item, i) => <button type="button" key={item.title} aria-label={`Step ${i + 1}: ${item.title}`} aria-pressed={index === i} onClick={() => go(i)} className={`h-9 w-9 rounded-full border text-sm ${index === i ? "border-indigo-600 bg-indigo-600 font-semibold text-white" : "border-slate-300 text-slate-600 dark:border-slate-600 dark:text-slate-300"}`}>{i + 1}</button>)}
    </div>
    <div ref={stepContent} aria-live="polite" aria-atomic="true" className="scroll-mt-6">
      <h3 className="mb-2 text-lg font-semibold text-slate-900 dark:text-slate-100">{current.title}</h3>
      <p className="mb-5 leading-relaxed text-slate-700 dark:text-slate-300">{selected.explanation}</p>
      <figure className="min-w-0 rounded-lg bg-slate-50 p-4 dark:bg-slate-950">
        <SceneView scene={selected.scene} />
        <figcaption className="mt-4 text-sm leading-relaxed text-slate-600 dark:text-slate-400">{selected.scene.caption}</figcaption>
      </figure>
    </div>
    {current.alternative && <button type="button" aria-pressed={alternative} onClick={() => { setAlternative(!alternative); revealExplanation(); }} className="mt-4 rounded-md border border-indigo-400 px-3 py-2 text-sm font-medium text-indigo-700 dark:text-indigo-300">{alternative ? "Return to the first case" : current.alternative.label}</button>}
    <div className="mt-5 flex items-center justify-between gap-2">
      <button type="button" disabled={index === 0} onClick={() => go(index - 1)} className="rounded-md border border-slate-300 px-3 py-2 text-sm disabled:opacity-40 dark:border-slate-700">Previous step</button>
      <span className="text-xs text-slate-500">{index + 1} of {lesson.steps.length}</span>
      <button type="button" disabled={index === lesson.steps.length - 1} onClick={() => go(index + 1)} className="rounded-md bg-indigo-600 px-3 py-2 text-sm text-white disabled:opacity-40">Next step</button>
    </div>
  </div>;
}

export function IntuitionConnection({ lesson }: { lesson: LessonIntuition }) {
  return <section className="my-8 space-y-4">
    <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">{lesson.connectionTitle}</h2>
    {lesson.connection.map(paragraph => <p key={paragraph} className="leading-relaxed text-slate-700 dark:text-slate-300">{paragraph}</p>)}
  </section>;
}
