"use client";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useLearnerRecord, fingerprint } from "@/lib/learner-state";
import { TOOLS } from "@/lib/builds/tools";
import { show, type Data, type Settings } from "@/lib/builds/engine";
import type { JourneyData } from "@/lib/builds/journey";
const MatrixBookkeeping = dynamic(() => import("./MatrixBookkeeping").then(module => module.MatrixBookkeeping));
export function JourneyHistory({ data }: { data: JourneyData }) {
  return <section className="mb-7 rounded-xl border border-line bg-surface p-5 sm:p-7" aria-label="The problem and its history">
    <h3 className="text-xl font-semibold">{data.history.title}</h3>
    <div className="mt-4 space-y-5 text-sm leading-8">{data.history.blocks.map((block, index) => typeof block === "string" ? <p key={index}>{block}</p> : <ol key={index} className="list-decimal space-y-4 pl-5">{block.items.map(item => <li key={item.name}><strong>{item.name}.</strong> {item.explanation}</li>)}</ol>)}</div>
    {data.history.sources.length > 0 && <details className="mt-5"><summary className="min-h-11 cursor-pointer content-center text-sm font-semibold">Read the historical sources</summary><ul className="mt-2 space-y-3 text-xs leading-6">{data.history.sources.map(source => <li key={source.url}><a href={source.url} target="_blank" rel="noopener noreferrer" className="text-accent underline underline-offset-4">{source.title}</a></li>)}</ul></details>}
  </section>;
}

export function JourneyTools({ data }: { data: JourneyData }) {
  return <section className="mb-7 space-y-4" aria-label="Get to know the tools">
    {data.build.id === "linear-algebra" && <MatrixBookkeeping build={data.build} />}
    {data.tools.map(item => <details key={item.key} className="rounded-xl border border-line bg-surface p-5"><summary className="min-h-11 cursor-pointer content-center font-semibold">{TOOLS[item.key].title}</summary><p className="mt-3 text-sm leading-7 text-muted">{TOOLS[item.key].why}</p>{item.earlier && <p className="mt-2 text-xs leading-6">This operation also appears in <Link href={item.earlier.href} className="text-accent underline">{item.earlier.title}</Link>.</p>}{item.example && <ToolExample journey={data.build.id} toolKey={item.key} example={item.example} />}</details>)}
  </section>;
}

function ToolExample({ journey, toolKey, example }: { journey: string; toolKey: string; example: { inputs: Data[]; settings: Settings; output: Data } }) {
  const tool = TOOLS[toolKey];
  const saved = useLearnerRecord(`tool:${journey}:${toolKey}:${fingerprint(example)}`, () => ({ input: example.inputs.map(value => typeof value === "string" ? value : show(value)), settings: example.settings }));
  const { input, settings } = saved.value;
  let output: string;
  try {
    const values = input.map((value, index) => typeof example.inputs[index] === "string" ? value : JSON.parse(value));
    const result = tool.run(values, settings);
    const check = (value: Data): void => { if (typeof value === "number" && !Number.isFinite(value)) throw Error("This result is not a finite number. Check the inputs, including any divisor."); if (Array.isArray(value)) value.forEach(check); else if (value && typeof value === "object") Object.values(value).forEach(check); };
    check(result); output = show(result);
  } catch (error) { output = error instanceof Error ? error.message : "These inputs cannot be used by this tool."; }
  return <div className="mt-4 rounded-xl border border-line bg-raised p-4"><p className="mb-3 text-xs font-semibold">Try this piece on its own</p>{tool.inputs.map((name, index) => <label key={name} className="mb-3 block text-xs text-muted">{name}<textarea value={input[index]} onChange={event => saved.set(previous => ({ ...previous, input: previous.input.map((value, position) => index === position ? event.target.value : value) }))} rows={Array.isArray(example.inputs[index]) ? 2 : 1} spellCheck={false} className="mt-2 w-full rounded-lg border border-line bg-background p-3 font-mono text-sm text-foreground" aria-label={`${tool.title} example: ${name}`} /></label>)}{tool.settings?.map(setting => <label key={setting.key} className="mt-3 flex flex-wrap items-center gap-3 text-xs">{setting.label}<input className="min-h-11 min-w-0 max-w-full rounded border border-line bg-background px-3 text-foreground" type={typeof setting.initial === "number" ? "number" : "text"} step={setting.step} value={settings[setting.key]} onChange={event => saved.set(previous => ({ ...previous, settings: { ...previous.settings, [setting.key]: typeof setting.initial === "number" ? Number(event.target.value) : event.target.value } }))} /></label>)}<p className="mb-2 mt-3 text-xs text-muted">Output</p><pre className="max-h-40 overflow-auto whitespace-pre-wrap break-words rounded-lg bg-background p-3 font-mono text-sm text-accent" aria-live="polite">{output}</pre></div>;
}
