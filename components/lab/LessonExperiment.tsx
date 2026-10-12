"use client";

import { useMemo, useState } from "react";
import { BotieSays } from "../site/Botie";
import { assemble, evaluate, type Build, type Data } from "@/lib/builds/engine";
import { TOOLS } from "@/lib/builds/tools";
import { WorkshopValue } from "./WorkshopValue";
import { PixelGrid } from "./PixelGrid";
import { ActionSequence, ForecastSequence } from "./SequentialExperiment";

function ValueEditor({ value, label, change }: { value: Data; label: string; change: (value: Data) => void }) {
  if (Array.isArray(value)) return <div className="flex max-w-full flex-wrap gap-2">{value.map((item, i) => <div key={i} className="min-w-0 rounded border border-line p-2"><span className="mb-1 block text-xs text-muted">{i + 1}</span><ValueEditor value={item} label={`${label}, entry ${i + 1}`} change={next => change(value.map((old, at) => at === i ? next : old))} /></div>)}</div>;
  if (typeof value === "number" || value === null) return <input aria-label={label} type="number" step="any" value={value ?? ""} placeholder="Missing" className="min-h-11 w-24 max-w-full rounded border border-line bg-background px-2 font-mono text-sm" onChange={event => change(event.target.value === "" ? null : Number(event.target.value))} />;
  if (typeof value === "string") return <input aria-label={label} value={value} className="min-h-11 w-32 max-w-full rounded border border-line bg-background px-2 text-sm" onChange={event => change(event.target.value)} />;
  return <WorkshopValue value={value} />;
}

export function LessonExperiment({ build }: { build: Build }) {
  const [caseIndex, setCaseIndex] = useState(0);
  const [data, setData] = useState(build.cases[0].data);
  const graph = useMemo(() => assemble(build.recipe, TOOLS), [build.recipe]);
  const trace = evaluate(graph, data, TOOLS);
  const imageView = build.imageView;
  const outputImage = imageView?.outputIndex !== undefined && Array.isArray(trace.output) ? trace.output[imageView.outputIndex] : trace.output;
  return <section className="space-y-5" aria-label="Explore the lesson calculation">
    {["forecasting-baselines", "exponential-smoothing", "project-demand-forecast"].includes(build.id) && <ForecastSequence />}
    {build.id === "q-learning" && <ActionSequence />}
    <BotieSays>{build.problem}</BotieSays>
    <label className="block text-sm font-semibold">Choose an example<select value={caseIndex} onChange={event => { const index = Number(event.target.value); setCaseIndex(index); setData(build.cases[index].data); }} className="mt-2 block min-h-11 w-full rounded-lg border border-line bg-surface p-3">{build.cases.map((sample, i) => <option key={sample.name} value={i}>{sample.name}</option>)}</select></label>
    <div className="space-y-4">{Object.entries(data).map(([key, value]) => {
      const range = imageView?.inputs[key];
      const maximum = typeof range === "string" ? Number(data[range]) : range;
      const change = (next: Data) => setData(previous => ({ ...previous, [key]: next }));
      return <fieldset key={key} className="min-w-0 rounded-xl border border-line bg-surface p-4"><legend className="px-2 text-sm font-semibold">{build.sources[key]}</legend>{maximum !== undefined ? <PixelGrid value={value} maximum={maximum} label={build.sources[key]} change={change} /> : <ValueEditor value={value} label={build.sources[key]} change={change} />}</fieldset>;
    })}</div>
    <button type="button" className="min-h-11 rounded-lg border border-line px-4 text-sm font-semibold" onClick={() => setData(build.cases[caseIndex].data)}>Reset this example</button>
    <div className="space-y-3 rounded-xl border border-line bg-surface p-4" aria-live="polite"><h3 className="mb-3 font-semibold">Result from these values</h3>{trace.error ? <p role="status">{trace.error.message}</p> : <>
      {imageView?.output !== undefined && outputImage !== undefined && <PixelGrid value={outputImage} maximum={imageView.output} label="Output pixels" />}
      {imageView?.pairedOutput !== undefined && Array.isArray(trace.output) && <PixelGrid value={trace.output[imageView.pairedOutput]} maximum={1} label="Transformed label mask" />}
      {imageView?.output === undefined && <WorkshopValue value={trace.output!} />}
      {imageView?.outputIndex !== undefined && Array.isArray(trace.output) && trace.output.map((item, i) => i !== imageView.outputIndex && i !== imageView.pairedOutput ? <div key={i}><p className="mb-2 text-sm font-semibold">{imageView.remainderLabel ?? "Additional result"}</p><WorkshopValue value={item} /></div> : null)}
    </>}</div>
    <details className="rounded-xl border border-line p-4"><summary className="cursor-pointer font-semibold">Follow the operations</summary><ol className="mt-4 space-y-4">{trace.steps.map((item, i) => {
      const piece = graph.pieces.find(piece => piece.id === item.id)!;
      const name = piece.tool === "output" ? "Result" : piece.tool.startsWith("source:") ? build.sources[piece.tool.slice(7)] : TOOLS[piece.tool].title;
      return <li key={item.id} className="min-w-0 rounded-lg bg-raised p-3"><p className="mb-2 text-sm font-semibold">{i + 1}. {name}</p><WorkshopValue value={item.output} /></li>;
    })}</ol></details>
    <p className="text-xs leading-6 text-muted">{build.limitation} Editing this example does not change the workshop tests.</p>
  </section>;
}
