"use client";

import { useEffect, useRef, useState } from "react";
import { missionById, labLessonById, passed, format, type Values, type Control, type Result, type Scene } from "@/lib/labs";
import { Botie, BotieSays } from "@/components/site/Botie";
import styles from "./MissionLab.module.css";

const button = "min-h-11 rounded-lg border border-line bg-raised px-4 py-2 text-sm font-semibold text-foreground transition hover:border-accent-fill focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:opacity-40";
const primary = "min-h-11 rounded-lg bg-accent-fill px-5 py-2 text-sm font-semibold text-accent-ink hover:brightness-110 disabled:opacity-40";
const clone = (values: Values): Values => Object.fromEntries(Object.entries(values).map(([k, v]) => [k, Array.isArray(v) ? [...v] : v]));
type Trial = { result: Result; cursor: number; done: boolean };

export function MissionLab({ id }: { id: string }) {
  const mission = missionById[id];
  const [values, setValues] = useState<Values>(() => clone(mission.initial));
  const [batch, setBatch] = useState(0);
  const [trial, setTrial] = useState<Trial | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [hint, setHint] = useState(false);
  const [solution, setSolution] = useState(false);
  const [inspected, setInspected] = useState(0);
  const [motion, setMotion] = useState(true);
  const controlsRef = useRef<HTMLDivElement>(null);
  const result = mission.run(values, batch);
  const readings = (trial?.result ?? result).readings;
  const running = trial !== null && !trial.done;
  const total = Math.max(readings.length, result.scene?.kind === "path" ? result.scene.path.length : 0);
  const checked = trial?.done ? readings.length : trial ? Math.min(trial.cursor, readings.length) : 0;
  const pass = readings.slice(0, checked).filter(passed).length;
  const complete = Boolean(trial?.done && pass === readings.length);
  const failed = checked - pass;
  const hasAnotherBatch = JSON.stringify(mission.run(mission.solution, 0)) !== JSON.stringify(mission.run(mission.solution, 1));
  const mood = running ? "thinking" : complete ? "happy" : trial?.done ? "curious" : "ready";
  const lesson = labLessonById[id];

  useEffect(() => {
    if (!trial || trial.done) return;
    const timer = setTimeout(() => setTrial(t => t ? { ...t, cursor: t.cursor + 1, done: t.cursor + 1 >= total } : null), motion && !window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 280 : 25);
    return () => clearTimeout(timer);
  }, [trial, total, motion]);

  function change(key: string, value: Values[string]) { setValues(v => ({ ...v, [key]: value })); setTrial(null); }
  function reset() { setValues(clone(mission.initial)); setTrial(null); setInspected(0); }
  function test() { setAttempts(a => a + 1); setTrial({ result: mission.run(values, batch), cursor: 0, done: false }); }

  return <div className={`${styles.lab} ${!motion ? styles.still : ""}`} data-testid="mission-lab" data-mission={id}>
    <div className="mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-line pb-4">
      <p className="font-mono text-xs uppercase tracking-wider text-accent">Botie&apos;s workshop · {hasAnotherBatch ? `Batch ${batch + 1} of 2` : "One small experiment"}</p>
      <label className="flex min-h-11 cursor-pointer items-center gap-2 text-xs text-muted"><input type="checkbox" checked={motion} onChange={e => setMotion(e.target.checked)} className="accent-amber-500" />Animate the experiment</label>
    </div>
    <div className="grid items-start gap-6 xl:grid-cols-[20rem_minmax(0,1fr)]">
      <aside className="min-w-0 space-y-5">
        <div className="rounded-2xl border border-line bg-surface p-5 sm:p-6">
          <p className="mb-2 font-mono text-xs text-muted">THE PROBLEM</p>
          <h3 className="text-2xl font-semibold leading-tight tracking-tight">{mission.title}</h3>
          <p className="mt-4 text-sm leading-7 text-muted">{mission.story}</p>
          <p className="mb-2 mt-6 font-mono text-xs text-accent">YOUR CHALLENGE</p>
          <p className="text-sm font-semibold leading-6">{mission.task}</p>
          <button type="button" aria-expanded={hint} onClick={() => setHint(!hint)} className="mt-4 min-h-11 text-sm font-semibold text-accent underline underline-offset-4">{hint ? "Hide Botie's hint" : "Ask Botie for a hint"}</button>
          {hint && <p className="mt-2 border-l-2 border-accent-fill pl-3 text-sm leading-6">{mission.hint}</p>}
        </div>
        <div aria-live="polite" aria-atomic="true">
          <BotieSays mood={mood}>{running ? "Let’s follow your settings through the examples." : complete ? "That works for this batch. Now let’s look at why." : trial?.done ? `${failed} ${failed === 1 ? "check needs" : "checks need"} another look. Select a result to compare what happened with what we needed.` : attempts ? "You changed the experiment. Run the checks again to test these settings." : "Try the starting settings first. Seeing what goes wrong gives us something to work with."}</BotieSays>
        </div>
        <div className="flex flex-wrap gap-x-5 gap-y-3 text-sm">
          <a href={lesson.href} className="text-accent underline underline-offset-4">Read the explanation</a>
          <a href={`${lesson.href}#practice`} className="text-accent underline underline-offset-4">Write it in Python →</a>
        </div>
      </aside>
      <div className="min-w-0 space-y-4">
        <div className="overflow-hidden rounded-2xl border border-line bg-surface">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line px-5 py-3 text-xs text-muted"><span className="font-mono uppercase tracking-wider">The experiment</span><span>{running ? "Following the results" : "Change a setting to see its effect"}</span></div>
          <div className={`${styles.scene} p-4 sm:p-6`}>
            {result.scene ? <ExperimentScene scene={result.scene} cursor={trial?.cursor ?? 0} running={running} done={trial?.done ?? false} /> : <SignalBench result={result} running={running} cursor={trial?.cursor ?? -1} />}
          </div>
          <div ref={controlsRef} className="space-y-5 border-t border-line p-4 sm:p-5">
            <div className="grid min-w-0 gap-5 sm:grid-cols-2">
              {mission.controls.map(control => <ControlInput key={control.key} control={control} value={values[control.key]} disabled={running} onChange={value => change(control.key, value)} />)}
            </div>
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={test} disabled={running} className={primary}>{running ? "Testing…" : "Run the checks"}</button>
              {running ? <button type="button" className={button} onClick={() => setTrial(null)}>Stop experiment</button> : <button type="button" className={button} onClick={reset}>Reset settings</button>}
              {hasAnotherBatch && <button type="button" disabled={running} className={button} onClick={() => { setBatch(b => 1 - b); setTrial(null); setInspected(0); }}>Try batch {batch ? 1 : 2}</button>}
            </div>
            <p className="text-xs leading-5 text-muted">Use the controls to work through the example. When you are ready to calculate it yourself, the Python challenge provides an editor and tests.</p>
          </div>
        </div>
        <div className="rounded-xl border border-line bg-surface p-4 sm:p-5">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2"><h4 className="text-sm font-semibold">What happened?</h4><p role="status" className="font-mono text-xs" data-testid="mission-counter">{pass} passed · {failed} failed · {readings.length - checked} not run</p></div>
          <div className="flex flex-wrap gap-2" aria-label="Inspect the results">
            {readings.map((r, i) => <button type="button" key={`${r.label}-${i}`} aria-pressed={inspected === i} onClick={() => setInspected(i)} className={`${button} !px-3 ${inspected === i ? "!border-accent-fill !bg-accent-soft" : ""}`}><span aria-hidden="true">{i < checked ? passed(r) ? "✓ " : "× " : "· "}</span>{r.label}<span className="sr-only">{i < checked ? passed(r) ? ", passed" : ", failed" : ", not run"}</span></button>)}
          </div>
          {readings[inspected] && <div className="mt-4 space-y-3 text-sm">
            <p className="break-words leading-6 text-muted">{readings[inspected].input}</p>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="min-w-0 rounded-lg border border-line bg-raised p-3"><p className="mb-2 text-xs text-muted">Your output</p><pre className="max-h-40 overflow-auto whitespace-pre-wrap break-words font-mono text-sm" data-testid="actual-output">{format(readings[inspected].actual)}</pre></div>
              <div className="min-w-0 rounded-lg border border-line bg-raised p-3"><p className="mb-2 text-xs text-muted">Required output</p><pre className="max-h-40 overflow-auto whitespace-pre-wrap break-words font-mono text-sm">{format(readings[inspected].expected)}</pre></div>
            </div>
            {readings[inspected].work && <pre className="overflow-auto whitespace-pre-wrap break-words rounded-lg bg-raised p-3 font-mono text-xs leading-6">{readings[inspected].work}</pre>}
          </div>}
          {result.note && <p className="mt-3 text-xs leading-6 text-muted">{result.note}</p>}
          <p className="mt-3 text-xs text-muted">Numerical checks allow an absolute difference of 0.001. Labels and token pieces must match exactly.</p>
        </div>
        <details className="rounded-xl border border-line bg-surface p-4 sm:p-5" open={complete || undefined}>
          <summary className="cursor-pointer text-sm font-semibold">Why this works</summary>
          <p className="mt-3 text-sm leading-7 text-muted">{mission.success}</p>
          <pre className="mt-4 max-h-64 overflow-auto whitespace-pre-wrap break-words rounded-lg bg-raised p-4 font-mono text-sm leading-7">{mission.rule}</pre>
        </details>
        <div className="rounded-xl border border-line p-4 sm:p-5">
          <button type="button" onClick={() => setSolution(!solution)} aria-expanded={solution} className="min-h-11 text-sm font-semibold text-accent underline underline-offset-4">{solution ? "Hide a working setup" : "Show a working setup"}</button>
          {solution && <div className="mt-3 space-y-3"><dl className="space-y-2 text-sm">{mission.controls.map(c => <div key={c.key}><dt className="text-muted">{c.label}</dt><dd className="break-words font-mono">{format(mission.solution[c.key]) || "No boundaries selected"}</dd></div>)}</dl><button type="button" disabled={running} className={button} onClick={() => { setValues(clone(mission.solution)); setTrial(null); controlsRef.current?.scrollIntoView({ block: "center", behavior: "instant" }); }}>Use these settings</button><p className="text-xs text-muted">Run the checks to verify them. Looking at the setup does not pass the experiment.</p></div>}
        </div>
      </div>
    </div>
  </div>;
}

function ControlInput({ control: c, value, disabled, onChange }: { control: Control; value: Values[string]; disabled: boolean; onChange: (v: Values[string]) => void }) {
  if (c.kind === "number") return <label className="block min-w-0 text-sm font-semibold"><span className="flex items-start justify-between gap-3"><span>{c.label}</span><span aria-hidden="true" className="shrink-0 rounded bg-accent-soft px-2 font-mono text-accent">{format(Number(value))}</span></span><input type="range" aria-label={c.label} className="mt-3 h-7 w-full accent-amber-500" min={c.min} max={c.max} step={c.step} value={Number(value)} disabled={disabled} onChange={e => onChange(Number(e.target.value))} /><span className="flex justify-between font-mono text-xs font-normal text-muted"><span>{c.min}</span><span>{c.max}</span></span>{c.help && <span className="mt-2 block text-xs font-normal leading-5 text-muted">{c.help}</span>}</label>;
  if (c.kind === "choice") return <label className="block min-w-0 text-sm font-semibold">{c.label}<select aria-label={c.label} disabled={disabled} value={String(value)} onChange={e => onChange(e.target.value)} className="mt-2 min-h-11 w-full min-w-0 rounded-lg border border-line bg-raised p-2 text-sm text-foreground">{c.options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}</select>{c.help && <span className="mt-2 block text-xs font-normal text-muted">{c.help}</span>}</label>;
  const items = value as string[];
  if (c.kind === "select") return <fieldset className="min-w-0 sm:col-span-2"><legend className="mb-3 text-sm font-semibold">{c.label}</legend><div className="flex flex-wrap gap-2">{c.items.map(item => <label key={item} className={`flex min-h-11 max-w-full cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm ${items.includes(item) ? "border-accent-fill bg-accent-soft" : "border-line bg-raised"}`}><input type="checkbox" disabled={disabled} checked={items.includes(item)} onChange={() => onChange(items.includes(item) ? items.filter(x => x !== item) : [...items, item])} className="shrink-0 accent-amber-500" /><span className="min-w-0 break-words">{item}</span></label>)}</div></fieldset>;
  function move(i: number, delta: number) { const next = [...items]; [next[i], next[i + delta]] = [next[i + delta], next[i]]; onChange(next); }
  return <fieldset className="min-w-0 sm:col-span-2"><legend className="mb-3 text-sm font-semibold">{c.label}</legend><ol className="space-y-2">{items.map((item, i) => <li key={item} className="flex items-center gap-2 rounded-xl border border-line bg-raised p-2 text-sm"><span className="w-6 shrink-0 text-center font-mono text-accent">{i + 1}</span><span className="min-w-0 flex-1 leading-6">{item}</span><div className="flex shrink-0 gap-1"><button type="button" disabled={disabled || i === 0} onClick={() => move(i, -1)} aria-label={`Move ${item} earlier`} className="size-11 rounded border border-line hover:border-accent-fill disabled:opacity-30">↑</button><button type="button" disabled={disabled || i === items.length - 1} onClick={() => move(i, 1)} aria-label={`Move ${item} later`} className="size-11 rounded border border-line hover:border-accent-fill disabled:opacity-30">↓</button></div></li>)}</ol></fieldset>;
}

function SignalBench({ result, running, cursor }: { result: Result; running: boolean; cursor: number }) {
  const allNumbers = result.readings.every(r => typeof r.actual === "number" && typeof r.expected === "number");
  if (!allNumbers) return <div><p className="mb-4 text-xs text-muted">Botie&apos;s output tray · updates as you change the controls</p><div className="flex flex-wrap gap-3">{result.readings.map((r, i) => <div key={`${r.label}-${i}`} className={`${styles.parcel} min-w-0 max-w-full flex-1 basis-36 rounded-xl border border-line bg-surface p-4 ${running && cursor === i ? styles.active : ""}`}><p className="mb-2 text-xs text-accent">{r.label}</p><p className="break-words font-mono text-sm leading-6">{format(r.actual)}</p></div>)}</div></div>;
  const values = result.readings.flatMap(r => [Number(r.actual), Number(r.expected)]).filter(Number.isFinite), min = Math.min(0, ...values), max = Math.max(1, ...values), span = max - min;
  const percent = (n: number) => Math.max(0, Math.min(100, 100 * ((Number.isFinite(n) ? n : 0) - min) / span));
  return <div className="space-y-5"><p className="text-xs text-muted">Gold: your output · dashed marker: required output</p>{result.readings.map((r, i) => <div key={`${r.label}-${i}`}><div className="mb-2 flex flex-wrap justify-between gap-2 text-xs"><span>{r.label}</span><span className="font-mono text-accent">{format(r.actual)}</span></div><div className="relative h-6 rounded bg-line"><div className={`${styles.bar} absolute inset-y-1 rounded bg-accent-fill ${running && cursor === i ? styles.active : ""}`} style={{ left: `${Math.min(percent(0), percent(Number(r.actual)))}%`, width: `${Math.abs(percent(Number(r.actual)) - percent(0))}%` }} /><span className="absolute -top-1 h-8 border-l-2 border-dashed border-foreground" style={{ left: `${percent(Number(r.expected))}%` }} /><span className="absolute inset-y-0 border-l border-muted/50" style={{ left: `${percent(0)}%` }} /></div></div>)}<div className="flex justify-between font-mono text-xs text-muted"><span>{format(min)}</span><span>{format(max)}</span></div></div>;
}

function ExperimentScene({ scene, cursor, running, done }: { scene: Scene; cursor: number; running: boolean; done: boolean }) {
  if (scene.kind === "tokens") return <div><p className="mb-2 text-xs text-muted">Input</p><pre className="mb-6 overflow-auto whitespace-pre-wrap break-words rounded-lg border border-line bg-background p-3 font-mono text-base">{scene.input.replace(/ /g, "·")}</pre><p className="mb-3 text-xs text-muted">Your pieces or operations · visible dots represent spaces</p><div className="flex flex-wrap gap-2">{scene.pieces.map((p, i) => <span key={i} className={`${styles.parcel} max-w-full break-words rounded-xl border border-accent-fill/50 bg-accent-soft px-3 py-2 font-mono text-sm leading-6 ${running && cursor === i ? styles.active : ""}`}>{p ? p.replace(/ /g, "·") : "(empty)"}</span>)}</div></div>;
  if (scene.kind === "pixels") { const values = scene.panels.flatMap(p => p.cells.flat()), max = Math.max(...values.map(Math.abs), 1); return <div className="flex flex-wrap items-start justify-center gap-6">{scene.panels.map(p => <figure key={p.label} className="min-w-0"><figcaption className="mb-3 text-center text-xs text-muted">{p.label}</figcaption><div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${p.cells[0].length}, minmax(0, 1fr))` }}>{p.cells.flat().map((x, i) => <div key={i} className="flex size-9 items-center justify-center rounded border border-line font-mono text-[10px] sm:size-11" style={{ backgroundColor: x < 0 ? `rgba(85, 150, 230, ${Math.max(.08, Math.abs(x) / max)})` : `rgba(245, 183, 35, ${Math.max(.04, x / max)})`, color: Math.abs(x) / max > .55 ? "#101d2b" : "var(--foreground)" }}>{format(x)}</div>)}</div></figure>)}</div>; }
  if (scene.kind === "path") { const position = done ? scene.path.at(-1) : scene.path[Math.min(cursor, scene.path.length - 1)]; return <div><p className="mb-4 text-xs text-muted">Preview of your route. Run the checks to watch Botie follow it.</p><div className="mx-auto grid max-w-md gap-2" style={{ gridTemplateColumns: `repeat(${scene.width}, minmax(0,1fr))` }}>{scene.cells.map((cell, i) => <div key={i} className={`relative flex aspect-square items-center justify-center rounded-xl border text-xs ${cell === "Blocked" ? "border-line bg-muted/20" : cell === "Dock" ? "border-accent-fill bg-accent-soft" : "border-line bg-surface"}`}><span className="absolute bottom-1 text-[10px] text-muted">{cell}</span>{position === i ? <Botie size={48} mood={done && cell === "Dock" ? "happy" : running ? "thinking" : "ready"} /> : scene.path.includes(i) && cell !== "Blocked" ? <span className="size-2 rounded-full bg-accent-fill" /> : cell === "Blocked" ? <span className="text-2xl text-muted">×</span> : null}</div>)}</div></div>; }
  const points = [...scene.points, ...(scene.line ?? [])], xs = points.map(p => p[0]), ys = points.map(p => p[1]);
  const minX = Math.min(...xs) - .5, maxX = Math.max(...xs) + .5, minY = Math.min(...ys) - .5, maxY = Math.max(...ys) + .5;
  const x = (n: number) => 45 + (n - minX) / (maxX - minX) * 450, y = (n: number) => 240 - (n - minY) / (maxY - minY) * 215;
  return <figure><svg role="img" aria-label={`Experiment plot: ${scene.x} and ${scene.y}. Exact values are available in the results below.`} viewBox="0 0 540 285" className="mx-auto w-full max-w-xl overflow-visible"><path d="M45 20V240H510" fill="none" stroke="var(--muted)" /><text x="280" y="278" textAnchor="middle" fill="var(--muted)" fontSize="12">{scene.x}</text><text x="14" y="130" textAnchor="middle" transform="rotate(-90 14 130)" fill="var(--muted)" fontSize="12">{scene.y}</text>{Array.from({ length: 5 }, (_, i) => { const xx = minX + (maxX - minX) * i / 4, yy = minY + (maxY - minY) * i / 4; return <g key={i} fill="var(--muted)" fontSize="10"><path d={`M${x(xx)} 25V240 M45 ${y(yy)}H495`} stroke="var(--line)" /><text x={x(xx)} y="256" textAnchor="middle">{format(xx)}</text><text x="38" y={y(yy) + 3} textAnchor="end">{format(yy)}</text></g>; })}{scene.line && <polyline points={scene.line.map(p => `${x(p[0])},${y(p[1])}`).join(" ")} fill="none" stroke="var(--accent-fill)" strokeWidth="3" />}{scene.points.map((p, i) => <circle key={i} cx={x(p[0])} cy={y(p[1])} r="6" fill={p[2] ? "var(--accent-fill)" : "#70a8e8"} stroke="var(--background)" strokeWidth="2"><title>{`[${p[0]}, ${p[1]}]`}</title></circle>)}</svg><figcaption className="mt-2 text-center text-xs text-muted">Points show the examples. A gold line, when present, shows your current rule or measuring direction.</figcaption></figure>;
}
