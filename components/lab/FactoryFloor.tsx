"use client";

import { useEffect, useRef, useState, type PointerEvent } from "react";
import { Botie, BotieSays } from "@/components/site/Botie";
import { FACTORY_JOBS, FLOOR_HEIGHT, FLOOR_WIDTH, GRID, MACHINE_HEIGHT, MACHINE_WIDTH, connect, inputsFor, inletY, machineHelp, machineNames, outletY, placement, traceCircuit, type Circuit, type Machine, type MachineKind, type Trace, type Wire } from "@/lib/factory";
import styles from "./FactoryFloor.module.css";

type Socket = { id: string; side: "out" | "in"; port: number };
type Delivery = { part: string; expected: number; actual: number | null };
type Playback = { traces: Trace[]; index: number; step: number; playing: boolean; done: boolean };
const clone = (c: Circuit): Circuit => ({ machines: c.machines.map(m => ({ ...m })), wires: c.wires.map(w => ({ ...w })) });
const button = "min-h-11 rounded-lg border border-line bg-raised px-4 py-2 text-sm font-semibold text-foreground hover:border-accent-fill disabled:opacity-40";
const primary = "min-h-11 rounded-lg bg-accent-fill px-5 py-2 text-sm font-semibold text-accent-ink hover:brightness-110 disabled:opacity-40";
const number = (n: number) => Number(n.toFixed(3)).toString();
const destination = (n: number | null) => n === 1 ? "Workshop" : n === 0 ? "Storage" : "Waiting at the gate";
const keyOf = (wire: Wire) => `${wire.from}:${wire.to}:${wire.port}`;

export function FactoryFloor({ onOpenBench }: { onOpenBench: (stage?: number) => void }) {
  const [jobIndex, setJobIndex] = useState(0);
  const [circuit, setCircuit] = useState<Circuit>(() => clone(FACTORY_JOBS[0].starter));
  const [undo, setUndo] = useState<Circuit[]>([]);
  const [tool, setTool] = useState<MachineKind | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [selectedPart, setSelectedPart] = useState(0);
  const [playback, setPlayback] = useState<Playback | null>(null);
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [hint, setHint] = useState(false);
  const [showExample, setShowExample] = useState(false);
  const [notice, setNotice] = useState("");
  const [zoom, setZoom] = useState(1);
  const [speed, setSpeed] = useState(1);
  const [animate, setAnimate] = useState(true);
  const [expanded, setExpanded] = useState(false);
  const [dragging, setDragging] = useState<{ id: string; x: number; y: number } | null>(null);
  const [wireCursor, setWireCursor] = useState<{ x: number; y: number } | null>(null);
  const [solved, setSolved] = useState<number[]>([]);
  const floor = useRef<HTMLDivElement>(null);
  const viewport = useRef<HTMLDivElement>(null);
  const nextId = useRef(0);
  const drag = useRef<{ id: string; offsetX: number; offsetY: number; original: Machine } | null>(null);
  const portDrag = useRef<{ from: Socket; x: number; y: number } | null>(null);
  const lastWireDrag = useRef(-Infinity);
  const drafts = useRef(new Map<number, Circuit>());
  const job = FACTORY_JOBS[jobIndex];
  const activeTrace = playback?.traces[playback.index];
  const activeStep = activeTrace?.steps[playback?.step ?? -1];
  const part = activeTrace?.part ?? job.batch[selectedPart];
  const busy = Boolean(playback?.playing);
  const visibleSignals = new Map(activeTrace?.steps.slice(0, (playback?.step ?? -1) + 1).map(s => [s.id, s]) ?? []);
  const currentNode = circuit.machines.find(m => m.id === selected);
  const problem = activeTrace?.problem;
  const correct = deliveries.filter(d => d.actual === d.expected).length;
  const incorrect = deliveries.length - correct;
  const complete = deliveries.length === job.batch.length && incorrect === 0;
  const arrived = Boolean(playback && activeTrace && playback.step >= activeTrace.steps.length);
  const shownOutput = arrived ? activeTrace?.output ?? null : null;

  useEffect(() => {
    if (!expanded || !viewport.current) return;
    const observer = new ResizeObserver(([entry]) => {
      setZoom(Math.min(1, entry.contentRect.width / FLOOR_WIDTH, entry.contentRect.height / FLOOR_HEIGHT));
    });
    observer.observe(viewport.current);
    return () => observer.disconnect();
  }, [expanded]);

  function edit(next: Circuit, message = "") {
    if (busy) return;
    setUndo(u => [...u.slice(-29), clone(circuit)]);
    setCircuit(next);
    setPlayback(null);
    setDeliveries([]);
    setSolved(s => s.filter(i => i !== jobIndex));
    setNotice(message);
  }
  function changeJob(index: number) {
    if (index === jobIndex) return;
    drafts.current.set(jobIndex, clone(circuit));
    setJobIndex(index); setCircuit(clone(drafts.current.get(index) ?? FACTORY_JOBS[index].starter)); setUndo([]); setTool(null); setSocket(null); setSelected(null); setSelectedPart(0); setPlayback(null); setDeliveries([]); setHint(false); setShowExample(false); setNotice(""); setDragging(null); drag.current = null;
    viewport.current?.scrollTo({ left: 0, top: 0 });
  }
  function point(event: { clientX: number; clientY: number }) {
    const rect = floor.current!.getBoundingClientRect();
    return { x: (event.clientX - rect.left) / zoom, y: (event.clientY - rect.top) / zoom };
  }
  function place(kind: MachineKind, x: number, y: number) {
    if (busy || !job.tools.includes(kind as "weight" | "sum" | "bias")) return;
    if (circuit.machines.filter(m => !m.fixed).length >= 6) { setNotice("There is room for six movable machines. Remove one or reuse an existing output."); return; }
    const location = placement(circuit, x, y);
    if (!location) { setNotice("That space is occupied. Choose an empty grid square between the sensors and the gate."); return; }
    const machine: Machine = { id: `placed-${++nextId.current}`, kind, ...location, value: kind === "weight" ? 1 : 0 };
    edit({ ...circuit, machines: [...circuit.machines, machine] }, `${machineNames[kind]} placed. Connect its square input and round output.`);
    setTool(null); setSocket(null); setSelected(machine.id);
  }

  function placeWithKeyboard(kind: MachineKind) {
    for (const x of [456, 264, 648, 840]) {
      for (const y of [216, 384, 96]) {
        const location = placement(circuit, x, y);
        if (location) { place(kind, location.x, location.y); return; }
      }
    }
    setNotice("These spaces are occupied. Move or remove a machine to make room.");
  }
  function wirePorts(first: Socket, second: Socket) {
    const out = first.side === "out" ? first : second;
    const input = first.side === "in" ? first : second;
    if (first.side === second.side) { setSocket(second); setNotice("A wire needs one round output and one square input."); return; }
    const next = connect(circuit, { from: out.id, to: input.id, port: input.port });
    if (next === circuit) { setNotice("Connect two different machines, from a round output to a square input."); setSocket(null); return; }
    edit(next, "Wire connected. Send a part to see the number travel through it."); setSocket(null); setWireCursor(null); setSelected(input.id);
  }
  function clickSocket(next: Socket, timeStamp: number) {
    if (busy || timeStamp - lastWireDrag.current < 200) return;
    setTool(null);
    if (socket && socket.id === next.id && socket.side === next.side && socket.port === next.port) { setSocket(null); setNotice(""); return; }
    if (socket) wirePorts(socket, next);
    else { setSocket(next); setSelected(next.id); setNotice(next.side === "out" ? "Now select the square input on the machine that should receive this number." : "Now select the round output that should supply this input."); }
  }
  function startMove(event: PointerEvent<HTMLButtonElement>, machine: Machine) {
    if (busy || machine.fixed || event.button !== 0) return;
    event.preventDefault(); const p = point(event); drag.current = { id: machine.id, offsetX: p.x - machine.x, offsetY: p.y - machine.y, original: machine };
    setSelected(machine.id); setTool(null); setSocket(null); event.currentTarget.setPointerCapture(event.pointerId);
  }
  function movePointer(event: PointerEvent) {
    const p = point(event);
    if (socket) setWireCursor(p);
    if (portDrag.current && Math.hypot(event.clientX - portDrag.current.x, event.clientY - portDrag.current.y) > 8) {
      setSocket(portDrag.current.from); setWireCursor(p);
    }
    if (drag.current) setDragging({ id: drag.current.id, x: p.x - drag.current.offsetX, y: p.y - drag.current.offsetY });
  }
  function finishMove(event: PointerEvent) {
    if (drag.current) {
      const moving = drag.current, p = point(event), location = placement(circuit, p.x - moving.offsetX, p.y - moving.offsetY, moving.id);
      if (location && (location.x !== moving.original.x || location.y !== moving.original.y)) edit({ ...circuit, machines: circuit.machines.map(m => m.id === moving.id ? { ...m, ...location } : m) }, "Machine moved. Its wires stay connected.");
      else if (!location) setNotice("That space is occupied. The machine stayed in its previous position.");
      drag.current = null; setDragging(null);
    }
    if (portDrag.current) {
      const origin = portDrag.current; portDrag.current = null;
      if (Math.hypot(event.clientX - origin.x, event.clientY - origin.y) > 8) {
        const element = document.elementFromPoint(event.clientX, event.clientY)?.closest<HTMLElement>("[data-socket]");
        if (element) { wirePorts(origin.from, { id: element.dataset.node!, side: element.dataset.side as "in" | "out", port: Number(element.dataset.port) }); lastWireDrag.current = event.timeStamp; event.preventDefault(); }
      }
    }
  }
  function advance() {
    if (!playback || playback.done) return;
    const trace = playback.traces[playback.index];
    if (playback.step < trace.steps.length) {
      const nextStep = playback.step + 1;
      if (nextStep === trace.steps.length) {
        const results = [...deliveries.filter(d => d.part !== trace.part.id), { part: trace.part.id, expected: trace.part.bin, actual: trace.output }];
        setDeliveries(results);
        if (results.length === job.batch.length && results.every(d => d.expected === d.actual)) setSolved(s => s.includes(jobIndex) ? s : [...s, jobIndex]);
      }
      setPlayback({ ...playback, step: nextStep });
    } else if (playback.index + 1 < playback.traces.length) setPlayback({ ...playback, index: playback.index + 1, step: -1 });
    else setPlayback({ ...playback, done: true, playing: false });
  }
  useEffect(() => {
    if (!playback?.playing || playback.done) return;
    const timer = setTimeout(advance, animate && !window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 650 / speed : 20);
    return () => clearTimeout(timer);
    // advance uses the same playback snapshot and delivery list as this timer.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playback, deliveries, animate, speed]);

  function start(all: boolean, playing: boolean) {
    const batch = all ? job.batch : [job.batch[selectedPart]];
    const traces = batch.map(p => traceCircuit(circuit, p));
    setSocket(null); setTool(null); setNotice("");
    if (all) setDeliveries([]);
    if (traces[0].problem) {
      setSelected(traces[0].problem.node);
      setPlayback({ traces, index: 0, step: traces[0].steps.length - 1, playing: false, done: true });
      setNotice(traces[0].problem.message);
      return;
    }
    setPlayback({ traces, index: 0, step: playing ? -1 : 0, playing, done: false });
  }

  function openBench(stage = 0) {
    setPlayback(p => p && ({ ...p, playing: false }));
    onOpenBench(stage);
  }

  function fitFloor() {
    setZoom(Math.min(1, (viewport.current?.clientWidth ?? FLOOR_WIDTH) / FLOOR_WIDTH));
    viewport.current?.scrollTo({ left: 0, top: 0 });
  }

  const coach = notice || (busy ? `${activeStep ? machineNames[circuit.machines.find(m => m.id === activeStep.id)!.kind] : "The sensors"} is reading part ${part.id}. You can pause and follow one operation at a time.` : complete ? "The whole delivery reached its labelled destinations. You can see why each part went where it did by selecting it and stepping through the signals." : arrived ? `Part ${part.id} reached ${destination(shownOutput).toLowerCase()}. Its label says ${destination(part.bin).toLowerCase()}. ${shownOutput === part.bin ? "That one matches." : "Follow its numbers through the machines to find what needs changing."}` : socket ? "Connect the selected socket to a socket on another machine." : tool ? `Choose an empty place on the grid for the ${machineNames[tool]}.` : jobIndex === 0 && !circuit.wires.length ? "Start with one wire. Click the round output on the height sensor, then the square input on the sorting gate." : "Send one part first. We can watch what your machine does before sending the whole delivery.");

  return <div className={`${styles.factory} ${animate ? "" : styles.still}`} data-factory="true" onKeyDown={e => { if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(e.key)) e.stopPropagation(); if (e.key === "Escape") { setTool(null); setSocket(null); setDragging(null); drag.current = null; setExpanded(false); } }}>
    <nav aria-label="Factory jobs" className="mb-5 flex gap-2 overflow-x-auto pb-2">{FACTORY_JOBS.map((item, i) => <button type="button" key={item.title} onClick={() => changeJob(i)} aria-current={i === jobIndex ? "step" : undefined} className={`min-h-12 shrink-0 rounded-xl border px-4 py-3 text-left text-sm font-semibold ${i === jobIndex ? "border-accent-fill bg-accent-soft text-accent" : "border-line bg-surface text-muted"}`}><span className="mr-2 font-mono text-xs">{solved.includes(i) ? "✓" : `0${i + 1}`}</span>{item.title}</button>)}</nav>
    <div className="mb-5 grid gap-4 lg:grid-cols-[1.1fr_1fr]">
      <div><p className="mb-2 font-mono text-xs uppercase tracking-wider text-accent">The job · {jobIndex + 1} of {FACTORY_JOBS.length}</p><h2 className="text-2xl font-semibold">{job.title}</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-muted">{job.brief}</p><p className="mt-3 text-sm font-semibold">{job.goal}</p></div>
      <div aria-live="polite" aria-atomic="true"><BotieSays mood={busy ? "thinking" : complete ? "happy" : problem || incorrect ? "curious" : "ready"}>{coach}</BotieSays></div>
    </div>

    <div className={`overflow-hidden rounded-2xl border border-line bg-surface ${expanded ? styles.expanded : ""}`}>
      {expanded && <p className="border-b border-line px-4 py-2 text-sm text-muted">{job.goal}</p>}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-4 py-3">
        <div className="flex flex-wrap gap-2">
          {busy ? <button type="button" className={primary} onClick={() => setPlayback(p => p && ({ ...p, playing: false }))}>Pause belt</button> : <button type="button" className={primary} onClick={() => playback && !playback.done && !problem ? setPlayback({ ...playback, playing: true }) : start(false, true)}>{playback && !playback.done && !problem ? "Resume belt" : "Send one part"}</button>}
          <button type="button" className={button} disabled={busy} onClick={() => playback && !playback.done && !problem ? advance() : start(false, false)}>Step a signal</button>
          <button type="button" className={button} disabled={busy} onClick={() => start(true, true)}>Run delivery</button>
          {playback && <button type="button" className={button} onClick={() => { setPlayback(null); setNotice("The belt is stopped. Your machines are ready to edit."); }}>Stop</button>}
        </div>
        <p role="status" aria-label="Factory test counts" className="font-mono text-xs">{correct} passed · {incorrect} failed · {job.batch.length - deliveries.length} not run</p>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-4 py-2 text-xs text-muted">
        <span>Round socket: output · Square socket: input · Click two sockets to connect</span>
        <div className="flex flex-wrap items-center gap-3"><label className="flex min-h-11 items-center gap-2"><input type="checkbox" checked={animate} onChange={e => setAnimate(e.target.checked)} className="accent-amber-500" />Animate</label><label>Speed <select aria-label="Factory speed" value={speed} onChange={e => setSpeed(Number(e.target.value))} className="min-h-11 rounded border border-line bg-raised px-2"><option value={1}>1×</option><option value={2}>2×</option><option value={4}>4×</option></select></label><button type="button" className="min-h-11 px-2 text-accent" onClick={fitFloor}>Fit floor</button><button type="button" className="min-h-11 px-2 text-accent" onClick={() => setZoom(1)}>100%</button><button type="button" className="min-h-11 px-2 font-semibold text-accent" aria-pressed={expanded} onClick={() => { setExpanded(!expanded); if (expanded) setZoom(1); }}>{expanded ? "Return to lesson view" : "Expand workshop"}</button></div>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line bg-raised px-4 py-2"><div className="flex flex-wrap items-center gap-3"><span className="text-xs font-semibold text-muted">Machine shelf</span>{job.tools.length ? <div className="flex flex-wrap gap-2">{job.tools.map(kind => <button key={kind} type="button" draggable={!busy} disabled={busy} onDragStart={() => { setTool(kind); setSocket(null); }} title="Drag onto the floor, or press Enter to place in an open space" onClick={e => { if (e.detail === 0) { placeWithKeyboard(kind); return; } setTool(t => t === kind ? null : kind); setSocket(null); setNotice(`Place the ${machineNames[kind]} on an empty part of the grid. You can also drag it from the shelf.`); }} aria-pressed={tool === kind} className={`${button} ${tool === kind ? "!border-accent-fill !bg-accent-soft" : ""}`}><span className="mr-2 text-accent" aria-hidden="true">{kind === "weight" ? "×" : "+"}</span>Place {machineNames[kind]}</button>)}</div> : <p className="text-sm leading-6 text-muted">Start with the two machines on the floor.</p>}</div><div className="flex flex-wrap gap-2"><button type="button" className={button} disabled={busy || !undo.length} onClick={() => { setCircuit(clone(undo[undo.length - 1])); setUndo(u => u.slice(0, -1)); setPlayback(null); setDeliveries([]); setSocket(null); setNotice("Last edit undone."); setSolved(s => s.filter(i => i !== jobIndex)); }}>Undo edit</button><button type="button" className={button} disabled={busy} onClick={() => { edit(clone(job.starter), "The floor is back to this job's starting layout. Undo can bring your machine back."); setSelected(null); setSocket(null); }}>Reset floor</button></div></div>
      {activeStep && <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-b border-line px-4 py-3 text-sm"><span className="text-muted">Part {part.id} · {machineNames[circuit.machines.find(m => m.id === activeStep.id)!.kind]}</span><pre className="whitespace-pre-wrap font-mono text-accent">{activeStep.calculation}</pre></div>}
      <div ref={viewport} className={styles.viewport} aria-label="Scrollable factory floor" tabIndex={0}>
        <div style={{ width: FLOOR_WIDTH * zoom, height: FLOOR_HEIGHT * zoom, overflow: "hidden" }}>
          <div ref={floor} data-testid="factory-floor" className={styles.floor} style={{ width: FLOOR_WIDTH, height: FLOOR_HEIGHT, transform: `scale(${zoom})`, transformOrigin: "top left" }} onPointerMove={movePointer} onPointerUp={finishMove} onPointerCancel={() => { drag.current = null; portDrag.current = null; setDragging(null); }} onClick={e => { if (tool && !(e.target as HTMLElement).closest("button,[data-machine]")) { const p = point(e); place(tool, p.x - MACHINE_WIDTH / 2, p.y - MACHINE_HEIGHT / 2); } }} onDragOver={e => { if (tool) e.preventDefault(); }} onDrop={e => { e.preventDefault(); if (tool) { const p = point(e); place(tool, p.x - MACHINE_WIDTH / 2, p.y - MACHINE_HEIGHT / 2); } }}>
            <div className={styles.floorLabel} style={{ left: 28, top: 28 }}>SENSORS<span>Read a measurement</span></div><div className={styles.floorLabel} style={{ left: 424, top: 28 }}>YOUR MACHINES<span>Transform the numbers</span></div>
            <div className={`${styles.bin} ${styles.workshop}`} style={{ left: 968, top: 24 }}><span>WORKSHOP</span><strong>{deliveries.filter(d => d.actual === 1).length} parts</strong><small>Gate output: 1</small></div>
            <div className={`${styles.bin} ${styles.storage}`} style={{ left: 968, top: 510 }}><span>STORAGE</span><strong>{deliveries.filter(d => d.actual === 0).length} parts</strong><small>Gate output: 0</small></div>
            <svg className={styles.wires} viewBox={`0 0 ${FLOOR_WIDTH} ${FLOOR_HEIGHT}`} aria-label="Wires carry the numbers between machines">
              <path className={styles.beltEdge} d="M40 594H886Q910 594 910 568V314Q910 288 960 288M1040 216V160Q1040 142 1040 142M1040 358V510" />
              <path className={styles.belt} d="M40 594H886Q910 594 910 568V314Q910 288 960 288M1040 216V142M1040 358V510" />
              <path className={`${styles.treads} ${busy ? styles.moving : ""}`} d="M40 594H886Q910 594 910 568V314Q910 288 960 288M1040 216V142M1040 358V510" />
              {circuit.wires.map(w => { const from = circuit.machines.find(m => m.id === w.from)!, to = circuit.machines.find(m => m.id === w.to)!; const a = dragging?.id === from.id ? dragging : from, b = dragging?.id === to.id ? dragging : to; const path = cable(a.x + MACHINE_WIDTH, a.y + outletY, b.x, b.y + inletY(to.kind, w.port)); const lit = visibleSignals.has(w.from); const flowing = activeStep?.id === w.to; return <g key={keyOf(w)}><path d={path} className={styles.wireShadow} /><path d={path} className={`${styles.wire} ${lit ? styles.live : ""} ${flowing ? styles.signal : ""}`} /><path d={path} role="button" tabIndex={busy ? -1 : 0} aria-label={`Remove wire from ${machineNames[from.kind]} to ${machineNames[to.kind]} input ${w.port + 1}`} className={styles.wireHit} onClick={e => { e.stopPropagation(); if (!busy) edit({ ...circuit, wires: circuit.wires.filter(existing => existing !== w) }, "Wire removed. You can connect a different output to that socket."); }} onKeyDown={e => { if (!busy && ["Enter", " ", "Delete", "Backspace"].includes(e.key)) { e.preventDefault(); edit({ ...circuit, wires: circuit.wires.filter(existing => existing !== w) }, "Wire removed."); } }} />{flowing && <circle r="6" fill="var(--accent-fill)" className={styles.pulse}><animateMotion dur={`${650 / speed}ms`} path={path} repeatCount="1" /></circle>}</g>; })}
              {socket && wireCursor && (() => { const node = circuit.machines.find(m => m.id === socket.id)!; const x = node.x + (socket.side === "out" ? MACHINE_WIDTH : 0), y = node.y + (socket.side === "out" ? outletY : inletY(node.kind, socket.port)); return <path d={cable(x, y, wireCursor.x, wireCursor.y)} className={styles.draftWire} />; })()}
            </svg>
            {circuit.machines.map(machine => {
              const position = dragging?.id === machine.id ? dragging : machine;
              const active = activeStep?.id === machine.id;
              const signal = visibleSignals.get(machine.id);
              const needsInput = problem?.node === machine.id;
              return <div key={machine.id} data-machine={machine.id} role="group" aria-label={`${machineNames[machine.kind]} machine`} className={`${styles.machine} ${styles[machine.kind]} ${selected === machine.id ? styles.selected : ""} ${active ? styles.processing : ""} ${needsInput ? styles.blocked : ""}`} style={{ left: position.x, top: position.y, width: MACHINE_WIDTH, height: MACHINE_HEIGHT }} onClick={e => { e.stopPropagation(); setSelected(machine.id); }}>
                <button type="button" aria-label={`${machine.fixed ? "Inspect" : "Move or inspect"} ${machineNames[machine.kind]}`} className={styles.machineHeader} onClick={() => setSelected(machine.id)} onPointerDown={e => startMove(e, machine)} onKeyDown={e => { if (machine.fixed || busy) return; const delta = ({ ArrowLeft: [-GRID, 0], ArrowRight: [GRID, 0], ArrowUp: [0, -GRID], ArrowDown: [0, GRID] } as Record<string, number[]>)[e.key]; if (delta) { e.preventDefault(); const p = placement(circuit, machine.x + delta[0], machine.y + delta[1], machine.id); if (p) edit({ ...circuit, machines: circuit.machines.map(m => m.id === machine.id ? { ...m, ...p } : m) }); } }}><span aria-hidden="true">{machine.kind === "weight" ? "×" : machine.kind === "sum" || machine.kind === "bias" ? "+" : machine.kind === "gate" ? "⑂" : machine.kind === "height" ? "↕" : "▣"}</span>{machineNames[machine.kind]}{!machine.fixed && <small aria-hidden="true">⠿</small>}</button>
                <div className={styles.machineBody}>
                  {machine.kind === "height" || machine.kind === "mass" ? <><div className={styles.sensorGraphic} aria-hidden="true">{machine.kind === "height" ? <div style={{ height: 12 + part.height * 6 }} /> : <span>{"●".repeat(Math.min(part.mass, 4))}</span>}</div><span className={styles.machineCaption}>{machine.kind === "height" ? "How tall?" : "How heavy?"}</span></> : machine.kind === "weight" || machine.kind === "bias" ? <><div className={styles.adjust}><button type="button" disabled={busy || machine.value <= -4} aria-label={`Decrease ${machineNames[machine.kind]} setting`} onClick={() => edit({ ...circuit, machines: circuit.machines.map(m => m.id === machine.id ? { ...m, value: m.value - .5 } : m) })}>−</button><output aria-label={`${machineNames[machine.kind]} setting`}>{machine.kind === "weight" ? "× " : "+ "}{number(machine.value)}</output><button type="button" disabled={busy || machine.value >= 4} aria-label={`Increase ${machineNames[machine.kind]} setting`} onClick={() => edit({ ...circuit, machines: circuit.machines.map(m => m.id === machine.id ? { ...m, value: m.value + .5 } : m) })}>+</button></div><span className={styles.machineCaption}>{machine.kind === "weight" ? "Multiply the input" : "Adjust the score"}</span></> : machine.kind === "sum" ? <><div className={styles.combineGraphic} aria-hidden="true"><span>1</span> + <span>2</span></div><span className={styles.machineCaption}>Add both inputs</span></> : <><div className={styles.gateGraphic}>≥ {number(machine.value)}</div><span className={styles.machineCaption}>opens the workshop</span></>}
                  <div className={`${styles.readout} ${signal ? styles.readoutLit : ""}`} aria-label={`${machineNames[machine.kind]} signal`}>{signal ? `${number(signal.output)}${machine.kind === "gate" ? ` · ${destination(signal.output)}` : ""}` : "No signal yet"}</div>
                </div>
                {Array.from({ length: inputsFor(machine.kind) }, (_, port) => <SocketButton key={port} node={machine} side="in" port={port} disabled={busy} selected={socket?.id === machine.id && socket.side === "in" && socket.port === port} needsInput={problem?.node === machine.id && problem.port === port} onSelect={clickSocket} onDragStart={(e, s) => { portDrag.current = { from: s, x: e.clientX, y: e.clientY }; }} />)}
                {machine.kind !== "gate" && <SocketButton node={machine} side="out" port={0} disabled={busy} selected={socket?.id === machine.id && socket.side === "out"} onSelect={clickSocket} onDragStart={(e, s) => { portDrag.current = { from: s, x: e.clientX, y: e.clientY }; }} />}
              </div>;
            })}
            <div className={styles.parcel} style={{ left: arrived && shownOutput !== null ? 1054 : busy && activeStep?.id === "gate" ? 874 : 198, top: arrived && shownOutput !== null ? shownOutput === 1 ? 62 : 550 : 566 }} aria-label={`Part ${part.id}, height ${part.height}, mass ${part.mass}, labelled for ${destination(part.bin)}`}><div className={styles.crate} style={{ height: 24 + part.height * 5 }}><span>{part.id}</span><small>{part.height} h{jobIndex >= 2 ? ` · ${part.mass} m` : ""}</small></div></div>
            <div className={styles.botieOnFloor}><Botie size={62} mood={complete ? "happy" : busy ? "thinking" : "ready"} /></div>
            <span className={styles.beltLabel}>PARTS TRAVEL ON THE BELT · NUMBERS TRAVEL THROUGH WIRES</span>
            {tool && <div className={styles.placementPrompt}>Click an empty grid square to place {machineNames[tool]}. Escape cancels.</div>}
          </div>
        </div>
      </div>
      <p className="border-t border-line bg-raised px-4 py-2 text-xs leading-5 text-muted">On a small screen, swipe across the floor or use Fit floor. Drag a machine by its name to move it. With its name focused, the arrow keys move it between free grid positions.</p>
      <div className="border-t border-line p-4">
        <div className="min-w-0 rounded-xl border border-line bg-raised p-4" aria-label="Machine inspector"><h3 className="text-sm font-semibold">{currentNode ? machineNames[currentNode.kind] : "Select a machine to look inside"}</h3><p className="mt-2 text-sm leading-6 text-muted">{currentNode ? machineHelp[currentNode.kind] : "Click a machine's name. During a delivery, its calculation appears here after a signal reaches it."}</p>{currentNode && visibleSignals.get(currentNode.id) && <pre className="mt-3 overflow-auto whitespace-pre-wrap rounded-lg bg-background p-3 font-mono text-sm leading-6">{visibleSignals.get(currentNode.id)!.calculation}</pre>}{currentNode && !currentNode.fixed && <button type="button" disabled={busy} className="mt-3 min-h-11 text-sm font-semibold text-accent underline underline-offset-4" onClick={() => { edit({ machines: circuit.machines.filter(m => m.id !== currentNode.id), wires: circuit.wires.filter(w => w.from !== currentNode.id && w.to !== currentNode.id) }, "Machine and its wires removed."); setSelected(null); setSocket(null); }}>Remove this machine</button>}</div>
      </div>
    </div>

    <section aria-label="Delivery labels and results" className="mt-5 rounded-2xl border border-line bg-surface p-4 sm:p-5"><div className="mb-4 flex flex-wrap items-start justify-between gap-3"><div><h3 className="font-semibold">The delivery</h3><p className="mt-1 text-xs leading-5 text-muted">These labels are the order we need to fulfil. Select a part to send it on its own.</p></div><button type="button" className="min-h-11 text-sm font-semibold text-accent underline underline-offset-4" onClick={() => setHint(!hint)} aria-expanded={hint}>{hint ? "Hide the wiring hint" : "Ask Botie where to start"}</button></div><div className="grid grid-cols-2 gap-2 sm:grid-cols-4">{job.batch.map((p, i) => { const d = deliveries.find(d => d.part === p.id); return <button type="button" key={p.id} disabled={busy} onClick={() => { setSelectedPart(i); setPlayback(null); setNotice(`Part ${p.id} is waiting at the sensors. Its label asks for ${destination(p.bin).toLowerCase()}.`); }} aria-pressed={part.id === p.id} className={`rounded-xl border p-3 text-left text-sm ${part.id === p.id ? "border-accent-fill bg-accent-soft" : "border-line bg-raised"}`}><span className="flex flex-wrap justify-between gap-2 font-semibold"><span>Part {p.id}</span><span className="text-xs">{d ? d.actual === d.expected ? "✓ Passed" : "× Failed" : "Not sent"}</span></span><span className="mt-2 block text-xs text-muted">Height {p.height}{jobIndex >= 2 ? ` · Mass ${p.mass}` : ""}</span><span className="mt-2 block text-xs">Label: <span className={p.bin ? "text-accent" : "text-sky-600 dark:text-sky-300"}>{destination(p.bin)}</span></span>{d && <span className="mt-1 block text-xs">Arrived: {destination(d.actual)}</span>}</button>; })}</div>{hint && <p className="mt-4 border-l-2 border-accent-fill pl-4 text-sm leading-7">{job.hint}</p>}</section>

    {complete && <div className="mt-5 rounded-2xl border border-accent-fill/50 bg-accent-soft p-5"><h3 className="font-semibold">The delivery is sorted. What made it work?</h3><p className="mt-2 max-w-3xl text-sm leading-7">{job.insight}</p><button type="button" className={`${primary} mt-4`} onClick={() => jobIndex < FACTORY_JOBS.length - 1 ? changeJob(jobIndex + 1) : openBench(3)}>{jobIndex < FACTORY_JOBS.length - 1 ? `Next job: ${FACTORY_JOBS[jobIndex + 1].title} →` : "Write the machine in NumPy →"}</button></div>}
    <div className="mt-5 flex flex-wrap items-start justify-between gap-4"><div><button type="button" className="min-h-11 text-sm text-accent underline underline-offset-4" aria-expanded={showExample} onClick={() => setShowExample(!showExample)}>{showExample ? "Hide example setup" : "Show an example setup"}</button>{showExample && <div className="mt-2 max-w-2xl rounded-xl border border-line bg-surface p-4"><p className="text-sm leading-6 text-muted">{job.hint}</p><button type="button" className={`${button} mt-3`} disabled={busy} onClick={() => { edit(clone(job.example), "The example is assembled. Send the delivery to check it, or step through a part to see how it works."); setSelected(null); setSocket(null); }}>Assemble this example</button><p className="mt-2 text-xs text-muted">The delivery still needs to be tested. Undo restores your previous machine.</p></div>}</div><button type="button" onClick={() => openBench()} className={button}>Open calculation and Python bench</button></div>
    <p className="mt-4 text-xs leading-6 text-muted">You are building and adjusting this machine by hand. A learning algorithm is not changing its weights. The lesson explains how training can make those adjustments from examples.</p>
  </div>;
}

function SocketButton({ node, side, port, disabled, selected, needsInput, onSelect, onDragStart }: { node: Machine; side: "in" | "out"; port: number; disabled: boolean; selected?: boolean; needsInput?: boolean; onSelect: (s: Socket, timeStamp: number) => void; onDragStart: (e: PointerEvent<HTMLButtonElement>, s: Socket) => void }) {
  const socket: Socket = { id: node.id, side, port };
  return <button type="button" data-socket="true" data-node={node.id} data-side={side} data-port={port} disabled={disabled} aria-label={`${machineNames[node.kind]} ${side === "out" ? "output" : `input ${port + 1}`}`} aria-pressed={selected || false} title={`${side === "out" ? "Output" : `Input ${port + 1}`}: click or drag to connect`} className={`${styles.socket} ${side === "out" ? styles.output : styles.input} ${selected ? styles.socketSelected : ""} ${needsInput ? styles.emptySocket : ""}`} style={{ [side === "out" ? "right" : "left"]: -23, top: (side === "out" ? outletY : inletY(node.kind, port)) - 22 }} onPointerDown={e => { e.stopPropagation(); if (!disabled) onDragStart(e, socket); }} onClick={e => { e.stopPropagation(); onSelect(socket, e.timeStamp); }}><span aria-hidden="true">{side === "in" && node.kind === "sum" ? port + 1 : side === "out" ? "→" : ""}</span></button>;
}
function cable(x1: number, y1: number, x2: number, y2: number) { const reach = Math.max(60, Math.abs(x2 - x1) * .45); return `M${x1} ${y1} C${x1 + reach} ${y1}, ${x2 - reach} ${y2}, ${x2} ${y2}`; }
