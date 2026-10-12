"use client";

import { useId, useRef, useState } from "react";
import type { IntuitionStep, LessonIntuition, Scene } from "@/lib/intuition/types";
import { ReadingScene } from "./ReadingScene";

const COLOURS = ["#6366f1", "#f59e0b", "#10b981", "#f43f5e"];

function SceneView({ scene }: { scene: Scene }) {
  if (scene.kind === "strips") return <ReadingScene scene={{ ...scene, kind: scene.connected ? "flow" : "notes" }} />;
  if (scene.kind !== "bars" && scene.kind !== "tiles" && scene.kind !== "plot") return <ReadingScene scene={scene} />;

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
        {panel.cells.flatMap((row, y) => row.map((value, x) => {
          const level = panel.maximum === undefined ? undefined : Math.round(255 * Math.max(0, Math.min(1, value / panel.maximum)));
          const fill = level === undefined ? value === 0 ? "#e2e8f0" : value === 2 ? "#f59e0b" : value === 3 ? "#10b981" : "#6366f1" : `rgb(${level}, ${level}, ${level})`;
          return <g key={`${x}-${y}`}><rect x={x * 25 + 1} y={y * 25 + 1} width={23} height={23} rx={2} fill={fill} stroke={panel.selected?.includes(y * columns + x) ? "#e11d48" : "none"} strokeWidth={2.5}><title>{scene.showValues ? `Row ${y}, column ${x}: ${value}` : `Row ${y + 1}, column ${x + 1}: ${value === 0 ? "background" : value === 2 ? "changed cell" : value === 3 ? "selected result" : "foreground"}`}</title></rect>{scene.showValues && <text x={x * 25 + 12.5} y={y * 25 + 15} textAnchor="middle" fontSize="7" fill={level === undefined ? value === 1 ? "#ffffff" : "#0b1220" : level >= 150 ? "#0b1220" : "#ffffff"}>{Number(value.toFixed(2))}</text>}</g>;
        }))}
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

function WalkthroughStep({ step, index, total }: { step: IntuitionStep; index: number; total: number }) {
  const titleId = useId();
  const [alternative, setAlternative] = useState(false);
  const selected = alternative && step.alternative ? step.alternative : step;
  return <section aria-labelledby={titleId} data-walkthrough-step={index} className="min-w-0 border-t border-line pt-7 first:border-0 first:pt-0">
    <p className="mb-2 font-mono text-xs text-accent">Step {index + 1} of {total}</p>
    <h3 id={titleId} tabIndex={-1} className="mb-3 scroll-mt-6 text-lg font-semibold text-foreground">{step.title}</h3>
    <p className="mb-5 max-w-prose leading-relaxed text-foreground">{selected.explanation}</p>
    <figure data-demonstration={selected.scene.kind} className="min-w-0 rounded-lg border border-line bg-background p-4 sm:p-5">
      <SceneView scene={selected.scene} />
      {selected.scene.caption !== "An invented example for this lesson." && <figcaption className="mt-5 border-t border-line pt-3 text-sm leading-relaxed text-muted">{selected.scene.caption}</figcaption>}
    </figure>
    {step.alternative && <button type="button" aria-pressed={alternative} onClick={() => setAlternative(!alternative)} className="mt-4 rounded-md border border-accent px-3 py-2 text-sm font-medium text-accent">{alternative ? "Return to the first case" : step.alternative.label}</button>}
  </section>;
}

export function GuidedIntuition({ lesson }: { lesson: LessonIntuition }) {
  const [index, setIndex] = useState(0);
  const [singleStep, setSingleStep] = useState(false);
  const stepContent = useRef<HTMLDivElement>(null);
  const selectId = useId();
  const go = (next: number) => {
    setIndex(next);
    requestAnimationFrame(() => {
      const heading = stepContent.current?.querySelector("h3");
      if (!heading) return;
      heading.focus({ preventScroll: true });
      const top = heading.getBoundingClientRect().top;
      if (top < 0 || top > window.innerHeight - 120) heading.scrollIntoView({ block: "start" });
    });
  };
  return <div data-guided-intuition className="min-w-0">
    {lesson.exampleNote && <p className="mb-4 text-sm text-muted">{lesson.exampleNote}</p>}
    <div className="mb-7 flex flex-wrap items-center gap-2 border-b border-line pb-4" role="group" aria-label="How to read this example">
      <button type="button" aria-pressed={!singleStep} onClick={() => setSingleStep(false)} className={`rounded-md border px-3 py-2 text-sm ${!singleStep ? "border-accent bg-accent/10 font-semibold text-foreground" : "border-line text-muted"}`}>Read through</button>
      <button type="button" aria-pressed={singleStep} onClick={() => setSingleStep(true)} className={`rounded-md border px-3 py-2 text-sm ${singleStep ? "border-accent bg-accent/10 font-semibold text-foreground" : "border-line text-muted"}`}>One step at a time</button>
    </div>
    {singleStep && <div className="mb-6">
      <label htmlFor={selectId} className="mb-2 block text-sm font-medium text-muted">Follow the example</label>
      <select id={selectId} value={index} onChange={event => go(Number(event.target.value))} className="w-full min-w-0 rounded-md border border-line bg-surface p-3 text-sm text-foreground">
        {lesson.steps.map((item, i) => <option value={i} key={i}>{i + 1}. {item.title}</option>)}
      </select>
    </div>}
    <div ref={stepContent} className="space-y-9">
      {lesson.steps.map((item, i) => (!singleStep || i === index) && <WalkthroughStep key={i} step={item} index={i} total={lesson.steps.length} />)}
    </div>
    {singleStep && <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
      <button type="button" disabled={index === 0} onClick={() => go(index - 1)} className="rounded-md border border-line px-3 py-2 text-sm disabled:opacity-40">Previous step</button>
      <p className="sr-only" role="status">Step {index + 1} of {lesson.steps.length}: {lesson.steps[index].title}</p>
      <button type="button" disabled={index === lesson.steps.length - 1} onClick={() => go(index + 1)} className="rounded-md bg-accent px-3 py-2 text-sm font-semibold text-slate-950 disabled:opacity-40">Next step</button>
    </div>}
  </div>;
}

export function IntuitionConnection({ lesson }: { lesson: LessonIntuition }) {
  return <section className="my-8 space-y-4">
    <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">{lesson.connectionTitle}</h2>
    {lesson.connection.map(paragraph => <p key={paragraph} className="leading-relaxed text-slate-700 dark:text-slate-300">{paragraph}</p>)}
  </section>;
}
