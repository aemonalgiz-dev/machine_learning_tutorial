"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { STAGES, STARTER, SOLUTION, TEST_HARNESS, evaluatePart, type Part, type Settings, type Activation } from "@/lib/neuron-lab";
import { usePython } from "@/lib/use-python";
import { PythonCode } from "@/components/concept/PythonCode";
import styles from "./NeuronLab.module.css";
import { BotieSays } from "@/components/site/Botie";
import { FactoryFloor } from "./FactoryFloor";

const PythonEditor = dynamic(() => import("@/components/concept/PythonEditor"), {
  ssr: false, loading: () => <p className="h-[clamp(20rem,52vh,32rem)] p-4 text-muted">Opening the editor...</p>,
});
const format = (value: number) => Number(value.toFixed(3)).toString();
const binName = (value: number) => value === 1 ? "Workshop" : value === 0 ? "Storage" : "No route";
const button = "rounded-lg border border-line bg-raised px-4 py-2.5 text-sm font-semibold text-foreground hover:border-accent-fill disabled:opacity-40";
const primary = "rounded-lg bg-accent-fill px-4 py-2.5 text-sm font-semibold text-accent-ink hover:brightness-110 disabled:opacity-40";
type Scene = { scores: number[]; bins: number[] };
type Run = Scene & { cursor: number; done: boolean; id: number };

export function NeuronLab() {
  const [bench, setBench] = useState<number | null>(null);
  return <>
    <div hidden={bench !== null}><FactoryFloor onOpenBench={(stage = 0) => setBench(stage)} /></div>
    {bench !== null && <><button type="button" className={`${button} mb-5`} onClick={() => setBench(null)}>← Back to the factory floor</button><NeuronBench initialStage={bench} /></>}
  </>;
}

function NeuronBench({ initialStage }: { initialStage: number }) {
  const [stage, setStage] = useState(initialStage);
  const [settings, setSettings] = useState<Settings>({ ...STAGES[initialStage].settings });
  const [selected, setSelected] = useState(0);
  const [hint, setHint] = useState(false);
  const [completed, setCompleted] = useState<number[]>([]);
  const [run, setRun] = useState<Run | null>(null);
  const [answer, setAnswer] = useState<string | null>(null);
  const sequence = useRef(0);
  const floor = useRef<HTMLDivElement>(null);
  const chapter = STAGES[stage];
  const batch = chapter.batch;
  const running = Boolean(run && !run.done);
  const inspecting = running && run ? run.cursor : selected;
  const part = batch[inspecting];
  const preview = evaluatePart(part, settings);
  const score = run ? run.scores[inspecting] : preview.score;
  const output = run ? run.bins[inspecting] : stage === 3 ? NaN : preview.output;
  const passed = run?.done ? batch.filter((p, i) => p.bin === run.bins[i]).length : 0;

  useEffect(() => {
    if (!run || run.done) return;
    const timer = setTimeout(() => {
      if (run.cursor + 1 < batch.length) setRun({ ...run, cursor: run.cursor + 1 });
      else {
        setRun({ ...run, done: true });
        if (stage < 3 && batch.every((p, i) => p.bin === run.bins[i])) {
          setCompleted(previous => previous.includes(stage) ? previous : [...previous, stage]);
        }
      }
    }, 550);
    return () => clearTimeout(timer);
  }, [run, batch, stage]);

  function changeStage(next: number) {
    setStage(next);
    setSettings({ ...STAGES[next].settings });
    setRun(null);
    setSelected(0);
    setHint(false);
    setAnswer(null);
  }
  function updateSettings(next: Partial<Settings>) {
    setSettings(previous => ({ ...previous, ...next }));
    setRun(null);
  }
  function startBatch(scene?: Scene) {
    const values = batch.map(p => evaluatePart(p, settings));
    setRun({ scores: scene?.scores ?? values.map(v => v.score), bins: scene?.bins ?? values.map(v => v.output), cursor: 0, done: false, id: ++sequence.current });
    const top = floor.current?.getBoundingClientRect().top;
    if (top !== undefined && (top < 80 || top > window.innerHeight - 250)) {
      floor.current?.scrollIntoView({ block: "start", behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" });
    }
  }

  return (
    <div>
      <div className="mb-5" aria-live="polite"><BotieSays mood={running ? "thinking" : run?.done ? passed === batch.length ? "happy" : "curious" : "ready"}>{running ? "Let’s watch where these settings send the parcels." : run?.done ? passed === batch.length ? "Every parcel reached the right place. Let’s look at what made that work." : "Some parcels reached the wrong shelf. Inspect one and follow its calculation through the neuron." : stage === 4 ? "This order has a different pattern. Can one straight boundary separate the two destinations?" : "I’m Botie. Help me sort these parts, starting with the problem one neuron can solve."}</BotieSays></div>
      <ol className="mb-6 grid gap-3 text-sm sm:grid-cols-3">
        {[["Weights", "How much each input contributes"], ["Bias", "An adjustment to the combined score"], ["Activation", "A function that turns the score into an output"]].map(([name, description], i) => (
          <li key={name} className="rounded-xl border border-line bg-surface p-3 sm:p-4">
            <p className="font-semibold"><span className="mr-2 font-mono text-accent">0{i + 1}</span>{name}</p>
            <p className="mt-1 text-xs leading-5 text-muted sm:text-sm">{description}</p>
          </li>
        ))}
      </ol>

      <nav aria-label="Workshop experiments" className="mb-6 grid grid-cols-2 gap-2 sm:grid-cols-5">
        {STAGES.map((item, i) => <button key={item.label} type="button" onClick={() => changeStage(i)} aria-current={stage === i ? "step" : undefined}
          className={`flex items-center gap-2 rounded-lg border px-3 py-3 text-left text-sm font-semibold ${stage === i ? "border-accent-fill bg-accent-soft text-accent" : "border-line bg-surface text-muted hover:text-foreground"}`}>
          <span className="flex size-6 shrink-0 items-center justify-center rounded-full border border-current font-mono text-xs" aria-hidden="true">{completed.includes(i) ? "✓" : i + 1}</span>{item.label}
          {completed.includes(i) && <span className="sr-only">, solved</span>}
        </button>)}
      </nav>

      <div className="grid items-start gap-6 xl:grid-cols-[21rem_minmax(0,1fr)]">
        <aside className="min-w-0 rounded-2xl border border-line bg-surface p-5 sm:p-6">
          <p className="mb-3 font-mono text-xs uppercase tracking-wider text-accent">Experiment {stage + 1} · {chapter.label}</p>
          <h2 className="text-2xl font-semibold leading-snug">{chapter.title}</h2>
          <div className="mt-4 space-y-4 text-sm leading-6 text-muted">{chapter.paragraphs.map(p => <p key={p}>{p}</p>)}</div>
          <p className="mt-5 border-l-2 border-accent-fill pl-3 text-sm font-semibold leading-6">{chapter.goal}</p>

          <button type="button" aria-expanded={hint} onClick={() => setHint(!hint)} className="mt-5 text-sm text-accent underline underline-offset-4">{hint ? "Hide Botie's hint" : "Ask Botie for a hint"}</button>
          <div className="mt-3" aria-live="polite">{hint && <BotieSays mood="thinking" className="flex-col !items-start">{chapter.hint}</BotieSays>}</div>
        </aside>

        <div className="min-w-0 space-y-4">
          <div ref={floor} className="scroll-mt-28 overflow-hidden rounded-2xl border border-line bg-surface">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line px-5 py-3">
              <p className="font-mono text-xs uppercase tracking-wider text-muted">Sorting floor</p>
              <p className="text-xs text-muted">{stage === 3 ? "Driven by your Python output" : "Driven by the controls"} · fictional workshop</p>
            </div>
            <Conveyor part={part} output={output} run={run} />
          {stage !== 3 && <div className="space-y-4 border-t border-line p-4 sm:p-5">
            {stage !== 2 ? <>
              <div className="grid gap-5 sm:grid-cols-3">
              <Dial label="Height weight" value={settings.height} disabled={running || stage === 1} onChange={height => updateSettings({ height })} />
              <Dial label="Mass weight" value={settings.mass} disabled={running || stage === 1} onChange={mass => updateSettings({ mass })} />
              <Dial label="Bias" value={settings.bias} disabled={running || stage === 0} onChange={bias => updateSettings({ bias })} />
              </div>
              <p className="text-xs leading-5 text-muted">{stage === 0 ? "The bias stays at zero for this first experiment. The gate already uses the step activation." : stage === 1 ? "The two weights stay fixed here so you can see what the bias changes on its own." : "The step activation sends scores at or above zero to the workshop."}</p>
            </> : <label className="block text-sm font-semibold">Activation function
              <select aria-label="Activation function" disabled={running} value={settings.activation} onChange={e => updateSettings({ activation: e.target.value as Activation })} className="mt-2 block w-full rounded-lg border border-line bg-raised p-3 text-foreground">
                <option value="identity">Identity: keep the score</option><option value="sigmoid">Sigmoid: a value between 0 and 1</option><option value="step">Step: either 0 or 1</option>
              </select>
              <span className="mt-3 block text-xs font-normal leading-5 text-muted">Weights: height 1, mass −1. Bias: −1.5. These stay fixed while you compare the functions.</span>
            </label>}
            <div className="flex flex-wrap gap-2">
              <button type="button" className={primary} disabled={running} onClick={() => startBatch()}>{running ? "Routing the batch…" : "Send the batch"}</button>
              {running && <button type="button" className={button} onClick={() => setRun(null)}>Stop belt</button>}
              {!running && <button type="button" className={button} onClick={() => updateSettings({ ...chapter.settings })}>Reset controls</button>}
            </div>
          </div>}
            <div className="border-t border-line p-4 sm:p-5">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-semibold">{stage === 4 ? "The new order" : "This delivery"}</p>
                <p className="text-xs text-muted">Select a part to inspect it. Measurements use toy units.</p>
              </div>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {batch.map((p, i) => {
                  const tested = run && (run.done || i < run.cursor);
                  const correct = tested && run.bins[i] === p.bin;
                  return <button type="button" key={p.id} disabled={running} onClick={() => setSelected(i)} aria-label={`Inspect part ${p.id}`} aria-pressed={inspecting === i}
                    className={`min-w-0 rounded-lg border p-2.5 text-left text-xs ${inspecting === i ? "border-accent-fill bg-accent-soft" : "border-line bg-raised"}`}>
                    <span className="flex justify-between font-semibold"><span>Part {p.id}</span>{tested && <span className={correct ? "text-emerald-600 dark:text-emerald-300" : "text-rose-600 dark:text-rose-300"}>{correct ? "✓ Correct" : "× Retry"}</span>}</span>
                    <span className="mt-1 block text-muted">Height {p.height} · Mass {p.mass}</span>
                    <span className="mt-1 block">Label: {binName(p.bin)}</span>
                  </button>;
                })}
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-line bg-surface p-4 sm:p-5">
            <div className="flex flex-wrap justify-between gap-2"><h3 className="text-sm font-semibold">Follow part {part.id} through the neuron</h3><span className="text-xs text-muted">Labelled for {binName(part.bin).toLowerCase()}</span></div>
            {stage === 3 && !run ? <p className="mt-3 text-sm leading-6 text-muted">Run your code below to see its scores and gate instructions here. The conveyor is waiting for your function.</p> : <>
              <div className="mt-3 grid gap-2 sm:grid-cols-3">
                <Calculation title="1. Weighted inputs" lines={[`${part.height} × (${format(settings.height)}) = ${format(part.height * settings.height)}`, `${part.mass} × (${format(settings.mass)}) = ${format(part.mass * settings.mass)}`]} />
                <Calculation title={stage === 3 ? "2. Your returned score" : "2. Add the bias"} lines={stage === 3 ? [format(score)] : [`${format(part.height * settings.height)} + (${format(part.mass * settings.mass)})`, `+ (${format(settings.bias)}) = ${format(score)}`]} />
                <Calculation title={stage === 3 ? "3. Your gate instruction" : `3. ${settings.activation} output`} lines={[format(output), `→ ${binName(output)}`]} />
              </div>
              <p className="mt-3 text-xs leading-5 text-muted">{output !== 0 && output !== 1 ? "This gate accepts only 0 or 1. A continuous output leaves the part waiting for a route." : `The gate sends this part to ${binName(output).toLowerCase()}. ${output === part.bin ? "That matches its label." : "Its label calls for the other bin. Inspect the score to see what needs to change."}`}</p>
            </>}
          </div>

          {stage === 3 && <CodePanel onResult={(scene, allPassed) => {
            if (allPassed) setCompleted(previous => previous.includes(3) ? previous : [...previous, 3]);
            if (scene) startBatch(scene);
            else setRun(null);
          }} onEdit={() => setRun(null)} />}

          <div aria-live="polite" className="rounded-xl border border-line bg-surface p-4 sm:p-5">
            {run?.done ? <>
              <p className={`text-lg font-semibold ${passed === batch.length ? "text-emerald-600 dark:text-emerald-300" : "text-foreground"}`}>{passed === batch.length ? "The delivery is sorted." : "Some parts need another look."}</p>
              <p className="mt-1 font-mono text-sm" aria-label="Routing results">{passed} correct · {batch.length - passed} incorrect</p>
              <p className="mt-3 text-sm leading-6 text-muted">{stage === 4 ? "Inspect the four corners below. Each adjustment moves or rotates a single line. Can that line put the two workshop parts on one side?" : passed === batch.length && stage !== 3 ? chapter.takeaway : stage === 3 ? "The test results check both the scores and the routes, including additional batches." : output !== 0 && output !== 1 ? "The gate could not interpret the output. It needs exactly 0 or 1." : "Select a part marked Retry to follow its measurements through the calculation. Adjust the controls and try the delivery again."}</p>
            </> : <p className="text-sm leading-6 text-muted">{running ? `Routing part ${part.id}. The controls stay fixed while the batch runs.` : stage === 3 ? "The tests will call your function on five batches. The first batch also drives the sorting floor." : "Try a setting, send the batch, and inspect where each part goes. You can retry as often as you need."}</p>}
          </div>

          {stage === 4 && <div className="rounded-xl border border-line bg-surface p-5">
            <h3 className="font-semibold">What can one straight boundary separate?</h3>
            <BoundaryMap batch={batch} settings={settings} />
            <p className="mb-3 text-sm leading-6 text-muted">What would you try next?</p>
            <div className="flex flex-wrap gap-2">
              <button type="button" className={button} onClick={() => setAnswer("adjust")}>Keep adjusting the same neuron</button>
              <button type="button" className={button} onClick={() => { setAnswer("combine"); setCompleted(previous => previous.includes(4) ? previous : [...previous, 4]); }}>Combine more than one neuron</button>
            </div>
            {answer && <p className="mt-4 text-sm leading-6" role="status">{answer === "combine" ? chapter.takeaway : "Any settings still give this step neuron one straight boundary. Both workshop corners cannot be separated from both storage corners by that line. The representation or the model needs to change."}</p>}
            {answer === "combine" && <Link href="/concepts/dense-layers" className="mt-3 inline-block text-sm font-semibold text-accent underline underline-offset-4">See how neurons work together →</Link>}
          </div>}

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <button type="button" disabled={stage === 0} className={button} onClick={() => changeStage(stage - 1)}>← Previous experiment</button>
            {stage < STAGES.length - 1 && <button type="button" className={primary} onClick={() => changeStage(stage + 1)}>Next: {STAGES[stage + 1].label} →</button>}
          </div>
          <p className="text-xs leading-5 text-muted">Every experiment is available from the tabs above. The knobs set this neuron by hand; no training algorithm is running.</p>
        </div>
      </div>
    </div>
  );
}

function Dial({ label, value, disabled, onChange }: { label: string; value: number; disabled: boolean; onChange: (n: number) => void }) {
  return <label className={`flex items-center gap-3 ${disabled ? "opacity-60" : ""}`}>
    <span aria-hidden="true" className={`${styles.knob} relative block size-12 shrink-0 rounded-full`}>
      <span className="absolute inset-2 rounded-full bg-raised" style={{ transform: `rotate(${value * 33.75}deg)` }}><span className="absolute left-1/2 top-0.5 h-3 w-0.5 -translate-x-1/2 rounded bg-accent-fill" /></span>
    </span>
    <span className="min-w-0 flex-1"><span className="mb-2 flex justify-between gap-2 text-sm"><span>{label}</span><output className="font-mono text-accent">{format(value)}</output></span>
      <input type="range" aria-label={label} min={-4} max={4} step={0.25} value={value} disabled={disabled} onChange={e => onChange(Number(e.target.value))} className="block w-full accent-[var(--accent-fill)]" />
    </span>
  </label>;
}

function Calculation({ title, lines }: { title: string; lines: string[] }) {
  return <div className="min-w-0 rounded-lg bg-raised p-3"><p className="mb-2 text-xs text-muted">{title}</p><pre className="overflow-x-auto font-mono text-sm leading-6">{lines.join("\n")}</pre></div>;
}

function Conveyor({ part, output, run }: { part: Part; output: number; run: Run | null }) {
  const valid = output === 0 || output === 1;
  const travelling = run && !run.done;
  const processed = run ? run.bins.slice(0, run.done ? run.bins.length : run.cursor) : [];
  return <div className={`${styles.machine} px-1 py-3 sm:px-4`}>
    <svg viewBox="0 0 360 230" role="img" aria-label={`Sorting conveyor. Part ${part.id}: ${binName(output)} output.`} className="block w-full sm:hidden">
      <path d="M12 80H190V112H12Z" fill="var(--raised)" stroke="var(--line)" />
      {Array.from({ length: 9 }, (_, i) => <path key={i} d={`M${20 + i * 20} 85v22`} stroke="var(--muted)" opacity=".25" />)}
      <path d="M185 96H210L240 56H255" fill="none" stroke="var(--accent-fill)" strokeWidth="3" opacity={output === 1 ? 1 : .25} />
      <path d="M185 96H210L240 166H255" fill="none" stroke="#38bdf8" strokeWidth="3" opacity={output === 0 ? 1 : .25} />
      {[55, 112].map((x, i) => <g key={x}><path d={`M${x - 13} 112V70H${x + 13}V112`} fill="none" stroke="var(--muted)" /><text x={x} y="58" textAnchor="middle" fill="var(--muted)" fontSize="9">{i === 0 ? "HEIGHT" : "MASS"}</text></g>)}
      <path d="M185 84L197 96L185 108L173 96Z" fill="var(--surface)" stroke="var(--accent-fill)" />
      <text x="185" y="130" textAnchor="middle" fill="var(--muted)" fontSize="9">GATE</text>
      {[1, 0].map(bin => <g key={bin}>
        <rect x="246" y={bin ? 18 : 136} width="104" height="66" rx="9" fill="var(--surface)" stroke={bin ? "var(--accent-fill)" : "#38bdf8"} />
        <text x="298" y={bin ? 38 : 156} textAnchor="middle" fill={bin ? "var(--accent)" : "#38bdf8"} fontSize="11" fontWeight="600">{binName(bin)} · {bin}</text>
        <text x="322" y={bin ? 71 : 189} textAnchor="middle" fill="var(--muted)" fontSize="10">{processed.filter(n => n === bin).length} parts</text>
      </g>)}
      <Parcel part={part} output={output} run={run} compact />
      <text x="12" y="211" fill="var(--muted)" fontSize="10">{!valid ? "Waiting for a 0 or 1 instruction" : `${travelling ? "Routing" : "Inspecting"} part ${part.id}`}</text>
    </svg>
    <svg viewBox="0 0 860 330" role="img" aria-label={`Sorting conveyor. Part ${part.id}: height ${part.height}, mass ${part.mass}. ${binName(output)} output.`} className="hidden w-full sm:block">
      <path d="M40 145H505V187H40Z" fill="var(--raised)" stroke="var(--line)" strokeWidth="2" />
      {Array.from({ length: 17 }, (_, i) => <path key={i} d={`M${52 + i * 26} 149v34`} stroke="var(--muted)" opacity=".22" />)}
      <path d="M510 166H560L658 91H683" fill="none" stroke="var(--accent-fill)" strokeWidth="5" opacity={output === 1 ? 1 : .25} />
      <path d="M510 166H560L658 255H683" fill="none" stroke="#38bdf8" strokeWidth="5" opacity={output === 0 ? 1 : .25} />
      <path d="M486 142L510 166L486 190L462 166Z" fill="var(--surface)" stroke="var(--accent-fill)" strokeWidth="2" />
      {[180, 325].map((x, i) => <g key={x}>
        <path d={`M${x - 25} 188V114H${x + 25}V188`} fill="none" stroke="var(--muted)" strokeWidth="2" />
        <path d={`M${x} 122V181`} stroke="#38bdf8" strokeDasharray="3 4" opacity=".6" />
        <text x={x} y="91" textAnchor="middle" fill="var(--muted)" fontSize="12" fontFamily="monospace">{i === 0 ? "HEIGHT" : "MASS"}</text>
      </g>)}
      <text x="486" y="222" textAnchor="middle" fill="var(--muted)" fontSize="12" fontFamily="monospace">GATE</text>
      <rect x="670" y="47" width="164" height="89" rx="12" fill="var(--surface)" stroke="var(--accent-fill)" strokeWidth="2" />
      <text x="752" y="73" textAnchor="middle" fill="var(--accent)" fontSize="15" fontWeight="600">Workshop · 1</text>
      <text x="791" y="118" textAnchor="middle" fill="var(--muted)" fontSize="12">{processed.filter(n => n === 1).length} parts</text>
      <rect x="670" y="214" width="164" height="89" rx="12" fill="var(--surface)" stroke="#38bdf8" strokeWidth="2" />
      <text x="752" y="240" textAnchor="middle" fill="#38bdf8" fontSize="15" fontWeight="600">Storage · 0</text>
      <text x="791" y="285" textAnchor="middle" fill="var(--muted)" fontSize="12">{processed.filter(n => n === 0).length} parts</text>
      <Parcel part={part} output={output} run={run} />
      {!valid && <text x="440" y="265" textAnchor="middle" fill="var(--accent)" fontSize="14">Waiting for a 0 or 1 instruction</text>}
      <text x="40" y="283" fill="var(--muted)" fontSize="13">{travelling ? `Part ${part.id} on the belt` : `Inspecting part ${part.id}`}</text>
    </svg>
  </div>;
}

function Parcel({ part, output, run, compact = false }: { part: Part; output: number; run: Run | null; compact?: boolean }) {
  const travelling = run && !run.done;
  const variables = compact
    ? { "--inspect-x": "155px", "--belt-y": "96px", "--start-x": "20px", "--gate-x": "185px", "--destination-x": "267px", "--destination-y": `${output === 1 ? 65 : 183}px` }
    : { "--destination-y": `${output === 1 ? 104 : 271}px` };
  return <g key={travelling ? `${run.id}-${run.cursor}` : "inspect"} className={`${styles.part} ${travelling && (output === 0 || output === 1) ? styles.travelling : ""}`} style={variables as CSSProperties}>
    <rect x={compact ? -10 : -15} y={-15 - part.height * (compact ? 1 : 3)} width={compact ? 20 : 30} height={30 + part.height * (compact ? 1 : 3)} rx="4" fill="var(--accent-fill)" stroke="var(--accent-ink)" strokeWidth="1.5" />
    <text y="4" textAnchor="middle" fill="var(--accent-ink)" fontWeight="700" fontSize={compact ? 11 : 14}>{part.id}</text>
  </g>;
}

function BoundaryMap({ batch, settings }: { batch: Part[]; settings: Settings }) {
  const x = (h: number) => 50 + h * 64;
  const y = (m: number) => 290 - m * 64;
  const intersections: [number, number][] = [];
  if (settings.mass !== 0) for (const h of [0, 4]) {
    const m = -(settings.height * h + settings.bias) / settings.mass;
    if (m >= 0 && m <= 4) intersections.push([h, m]);
  }
  if (settings.height !== 0) for (const m of [0, 4]) {
    const h = -(settings.mass * m + settings.bias) / settings.height;
    if (h >= 0 && h <= 4 && !intersections.some(p => p[0] === h && p[1] === m)) intersections.push([h, m]);
  }
  return <figure className="my-4 flex flex-wrap items-center gap-4">
    <svg viewBox="0 0 345 330" className="w-full max-w-80" role="img" aria-label="Height and mass map. Workshop parts occupy opposite corners, with storage parts in the other corners.">
      {[0, 1, 2, 3, 4].map(n => <g key={n}><path d={`M${x(n)} 34V290M50 ${y(n)}H306`} stroke="var(--line)" /><text x={x(n)} y="307" textAnchor="middle" fontSize="11" fill="var(--muted)">{n}</text><text x="35" y={y(n) + 4} fontSize="11" fill="var(--muted)">{n}</text></g>)}
      {intersections.length >= 2 && <path d={`M${x(intersections[0][0])} ${y(intersections[0][1])}L${x(intersections[1][0])} ${y(intersections[1][1])}`} stroke="var(--foreground)" strokeWidth="2" strokeDasharray="6 4" />}
      {batch.map(p => <g key={p.id}><circle cx={x(p.height)} cy={y(p.mass)} r="17" fill={p.bin ? "var(--accent-fill)" : "#38bdf8"} /><text x={x(p.height)} y={y(p.mass) + 5} textAnchor="middle" fontSize="14" fontWeight="600" fill="#10172a">{p.id}</text></g>)}
      <text x="185" y="327" textAnchor="middle" fill="var(--muted)" fontSize="12">Height</text><text x="50" y="18" fill="var(--muted)" fontSize="12">Mass</text>
    </svg>
    <figcaption className="max-w-60 text-sm leading-6 text-muted">Amber points belong in the workshop. Blue points belong in storage. The dashed line marks a score of zero.{intersections.length < 2 && " Your current settings have no separating line crossing this view."}</figcaption>
  </figure>;
}

type Test = { name: string; passed: boolean; detail: string; expected: Scene; actual: Scene | null };
type CodeResult = { tests: Test[]; scene: Scene | null; error?: string; stdout: string; source: string };
const DRAFT_KEY = "fitlab.neuron-lab.code.v1";

function CodePanel({ onResult, onEdit }: { onResult: (scene: Scene | null, passed: boolean) => void; onEdit: () => void }) {
  const [code, setCode] = useState(() => { try { return localStorage.getItem(DRAFT_KEY) ?? STARTER; } catch { return STARTER; } });
  const [result, setResult] = useState<CodeResult | null>(null);
  const [solution, setSolution] = useState(false);
  const alive = useRef(true);
  const currentCode = useRef(code);
  const { run, stop, busy, status } = usePython(true);
  useEffect(() => { alive.current = true; return () => { alive.current = false; }; }, []);
  const edit = (value: string) => {
    currentCode.current = value;
    setCode(value);
    onEdit();
    try { localStorage.setItem(DRAFT_KEY, value); } catch { /* The editor still works without storage. */ }
  };
  const execute = async () => {
    if (busy) return;
    const source = code;
    setResult(null);
    onEdit();
    const execution = await run(`${source}\n${TEST_HARNESS}`);
    if (!alive.current) return;
    const marker = "__FITLAB_SORTER_RESULT__";
    const at = execution.stdout.lastIndexOf(marker);
    if (execution.error || at < 0) {
      setResult({ tests: [], scene: null, source, stdout: execution.stdout, error: execution.error ?? "The program ended before the tests returned their results. Check for an early exit." });
      return;
    }
    try {
      const payload = JSON.parse(execution.stdout.slice(at + marker.length));
      if (!Array.isArray(payload.tests) || payload.tests.length !== 5 || !payload.tests.every((t: Test) => typeof t.passed === "boolean" && typeof t.name === "string" && typeof t.detail === "string")) throw new Error("Unexpected test output.");
      const scene = payload.scene as Scene | null;
      if (scene && (!Array.isArray(scene.scores) || !Array.isArray(scene.bins) || scene.scores.length !== 8 || scene.bins.length !== 8 || ![...scene.scores, ...scene.bins].every(Number.isFinite))) throw new Error("The function returned invalid conveyor data.");
      setResult({ ...payload, source, stdout: execution.stdout.slice(0, at) });
      if (source === currentCode.current) onResult(scene, payload.tests.every((t: Test) => t.passed));
    } catch {
      setResult({ tests: [], scene: null, source, stdout: execution.stdout, error: "The test output could not be read. Check the function and run it again." });
    }
  };
  const passed = result?.tests.filter(t => t.passed).length ?? 0;
  return <div className="overflow-hidden rounded-xl border border-line bg-surface">
    <div className="flex items-center justify-between border-b border-line bg-raised px-4 py-3 font-mono text-xs"><span>sorter.py</span><span className="text-muted">Python + NumPy</span></div>
    <PythonEditor label="Python sorter solution" value={code} onChange={edit} onRun={() => void execute()} onCheck={() => void execute()} />
    <div className="flex flex-wrap items-center gap-3 border-t border-line bg-raised p-3">
      <button type="button" className={primary} disabled={busy || !code.trim()} onClick={() => void execute()}>Run code &amp; test</button>
      {busy && <button type="button" className={button} onClick={() => stop()}>Stop Python</button>}
      <button type="button" className={button} disabled={busy} onClick={() => { edit(STARTER); setResult(null); }}>Reset code</button>
    </div>
    <div className="space-y-3 p-4 text-sm" aria-live="polite" aria-busy={busy}>
      {busy && <p className="text-muted">{status}</p>}
      {!result && !busy && <p className="leading-6 text-muted">Tests check the returned arrays, not printed text. You can use print to inspect your values. Python loads on the first run.</p>}
      {result && <>
        <p className="font-mono" aria-label="Code test counts">{passed} passed · {result.tests.length - passed + (result.error ? 1 : 0)} failed{result.error ? " · 5 not run" : ""}</p>
        {result.source !== code && <p className="text-muted">You have changed the code. Run it again to test the new version.</p>}
        {result.error && <pre className="max-h-60 overflow-auto whitespace-pre-wrap text-xs text-rose-600 dark:text-rose-300">{result.error}</pre>}
        {result.tests.map(t => <details key={t.name} className="rounded-lg border border-line p-3">
          <summary className="cursor-pointer"><span className={t.passed ? "text-emerald-600 dark:text-emerald-300" : "text-rose-600 dark:text-rose-300"}>{t.passed ? "✓ Passed" : "× Failed"}</span> · {t.name}</summary>
          <p className="mt-2 leading-6 text-muted">{t.detail}</p>
          <pre className="mt-2 max-h-48 overflow-auto whitespace-pre-wrap text-xs leading-6">{`Expected:\n${JSON.stringify(t.expected, null, 2)}\nReceived:\n${JSON.stringify(t.actual, null, 2)}`}</pre>
        </details>)}
        {passed === 5 && <p className="leading-6 text-emerald-600 dark:text-emerald-300">{STAGES[3].takeaway}</p>}
        {result.stdout && <pre className="max-h-48 overflow-auto whitespace-pre-wrap font-mono text-xs">{result.stdout}</pre>}
      </>}
      <button type="button" onClick={() => setSolution(!solution)} className="text-accent underline underline-offset-4">{solution ? "Hide the worked solution" : "Show the worked solution"}</button>
      {solution && <><PythonCode source={SOLUTION} label="One way to build the neuron" /><button type="button" disabled={busy} className={button} onClick={() => edit(SOLUTION)}>Use this solution</button></>}
      <p className="text-xs leading-5 text-muted">Your code is saved in this browser when storage is available. Viewing the solution does not pass the tests.</p>
    </div>
  </div>;
}
