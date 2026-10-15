"use client";

import { useState } from "react";
import { BotieSays } from "@/components/site/Botie";
import { TOOLS } from "@/lib/builds/tools";
import { show, type Construction, type Trace } from "@/lib/builds/engine";
import { runDeliveryMachine, type Delivery } from "@/lib/builds/regression-journey";

const n = (value: number) => Number(value.toFixed(3)).toString();
export function DeliveryDispatch({ graph, rows, metric, scorer, name, onRun }: {
  graph: Construction | null; rows: readonly Delivery[]; metric: "absolute" | "squared";
  scorer?: Construction; name: string; onRun?: () => void;
}) {
  const [ran, setRan] = useState("");
  const [selected, setSelected] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [previous, setPrevious] = useState<{ prediction: number; distance: number } | null>(null);
  const [prediction, setPrediction] = useState("");
  const [feedback, setFeedback] = useState("");
  const revision = JSON.stringify({ graph, rows, metric, scorer });
  const changed = !!previous && ran !== revision;
  let report: ReturnType<typeof runDeliveryMachine> | null = null;
  if (graph && ran === revision) try { report = runDeliveryMachine(graph, rows, metric, scorer); } catch { /* The run handler supplies the error. */ }
  return <section className="min-w-0 rounded-2xl border border-line bg-surface p-4 sm:p-5" aria-label={name}>
    <div className="flex flex-wrap items-center justify-between gap-3"><h3 className="text-lg font-semibold">{name}</h3><button disabled={changed && !prediction} className="min-h-11 rounded-lg bg-accent-fill px-4 py-2 text-sm font-semibold text-accent-ink disabled:opacity-50" onClick={() => {
      try {
        if (!graph) throw new Error("Your dispatch machine needs an input and a connected Result. Build it above, then send these orders through it.");
        const result = runDeliveryMachine(graph, rows, metric, scorer);
        const first = result.rows[0];
        if (changed && previous) {
          const direction = Math.abs(first.prediction - previous.prediction) < .001 ? "Unchanged" : first.prediction < previous.prediction ? "Earlier" : "Later";
          setFeedback(`${prediction === direction ? "Your prediction agrees with the run." : "The result differs from your prediction."} Order 1's promise is ${n(first.prediction)} minutes, previously ${n(previous.prediction)}. Select it to trace which connected values produced the change.`);
        } else setFeedback("");
        setPrevious({ prediction: first.prediction, distance: first.distance }); setPrediction("");
        setRan(revision); setError(""); setSelected(null); onRun?.();
      } catch (cause) { setError(cause instanceof Error ? cause.message : "Check the connections in your machine."); }
    }}>Run dispatch batch</button></div>
    <p className="mt-2 text-sm leading-6 text-muted">All orders start at minute zero. Select a delivery after the run to follow its estimate back through your machine.</p>
    {changed && <fieldset className="mt-4 rounded-lg border border-line p-4"><legend className="px-2 text-sm font-semibold">What will happen to order 1&apos;s promise?</legend><p className="mb-3 text-sm">Its previous promise was {n(previous!.prediction)} minutes for {n(previous!.distance)} km. The new input is {n(rows[0].distance)} km. Predict the effect before running the changed machine.</p><div className="flex flex-wrap gap-4">{["Earlier", "Later", "Unchanged"].map(value => <label key={value} className="flex min-h-11 items-center gap-2 text-sm"><input type="radio" name={`dispatch-prediction-${name}`} checked={prediction === value} onChange={() => setPrediction(value)}/>{value}</label>)}</div></fieldset>}
    {error && <div className="mt-4" role="status"><BotieSays mood="curious">{error}</BotieSays></div>}
    {!report && <p className="mt-4 rounded-lg bg-background p-4 text-sm">{ran ? "Your machine or inputs changed. Run this batch again to see what changed for the customers." : `${rows.length} orders are waiting for an estimate.`}</p>}
    {report && <>
      {feedback && <div className="mt-4" role="status"><BotieSays>{feedback}</BotieSays></div>}
      <div className="mt-4 space-y-3">{report.rows.map((row, index) => {
        const late = row.minutes - row.prediction;
        const scale = Math.max(1, ...report!.rows.flatMap(item => [item.prediction, item.minutes]));
        return <button key={index} aria-pressed={selected === index} onClick={() => setSelected(index)} className={`block w-full rounded-xl border p-4 text-left motion-safe:transition-colors ${selected === index ? "border-accent-fill bg-accent-soft" : "border-line bg-background hover:border-accent-fill"}`}>
          <span className="flex flex-wrap justify-between gap-2"><strong>Order {index + 1} · {n(row.distance)} km</strong><span className="text-sm">{Math.abs(late) < .001 ? "Arrived as promised" : `${n(Math.abs(late))} min ${late > 0 ? "late" : "early"}`}</span></span>
          <span className="mt-3 grid gap-2 text-xs sm:grid-cols-3"><span>Promised: <strong className="font-mono">{n(row.prediction)} min</strong></span><span>Arrived: <strong className="font-mono">{n(row.minutes)} min</strong></span><span>Score contribution: <strong className="font-mono">{n(row.contribution)} {metric === "squared" ? "min²" : "min"}</strong></span></span>
          <span className="mt-3 block space-y-2" aria-hidden="true"><span className="block h-2 rounded bg-raised"><span className="block h-2 rounded bg-accent-fill motion-safe:animate-[pulse_1s_ease-out_1]" style={{width: `${Math.max(0, row.prediction) / scale * 100}%`}}/></span><span className="block h-2 rounded bg-raised"><span className="block h-2 rounded bg-teal-400" style={{width: `${Math.max(0, row.minutes) / scale * 100}%`}}/></span></span>
        </button>;
      })}</div>
      <p className="mt-3 text-xs text-muted">Gold: promised time. Teal: actual arrival. The bars share the same time scale.</p>
      <p className="mt-4 font-mono text-sm" data-testid="dispatch-score">{scorer ? "Your installed checker" : "Batch mean"}: {n(report.score)} {metric === "squared" ? "min²" : "min"}</p>
      {selected !== null && <div className="mt-4 rounded-xl border border-line bg-background p-4" aria-label="Delivery calculation trace"><h4 className="font-semibold">Why did order {selected + 1} get that promise?</h4><p className="mt-2 text-sm text-muted">Start at the result and work backward. These are the values from your connected pieces.</p><TraceBack trace={report.rows[selected].trace} graph={graph!}/><div className="mt-3 overflow-x-auto rounded-lg bg-raised p-3 font-mono text-sm">prediction − arrival = {n(report.rows[selected].prediction)} − {n(report.rows[selected].minutes)} = {n(report.rows[selected].error)} min<br/>{metric === "squared" ? "squared error" : "absolute error"} = {n(report.rows[selected].contribution)} {metric === "squared" ? "min²" : "min"}</div></div>}
    </>}
  </section>;
}

function TraceBack({trace, graph}: {trace: Trace; graph: Construction}) {
  return <ol className="mt-3 space-y-3">{[...trace.steps].reverse().map(step => {
    const piece = graph.pieces.find(item => item.id === step.id)!;
    const label = piece.tool === "output" ? "Promised arrival" : piece.tool === "source:distance" ? "Delivery distance" : TOOLS[piece.tool]?.title ?? piece.tool;
    return <li key={step.id} className="rounded-lg border border-line p-3 text-sm"><strong>{label}</strong><pre className="mt-2 overflow-x-auto whitespace-pre-wrap font-mono text-xs">{step.inputs.length ? `Inputs: ${step.inputs.map(show).join(", ")}\n` : ""}Output: {show(step.output)}</pre></li>;
  })}</ol>;
}
