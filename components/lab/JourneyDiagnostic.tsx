"use client";

import { useEffect, type ReactNode } from "react";
import { useLearnerRecord } from "@/lib/learner-state";
import { inspectJourneyChange, diagnosticPieceName } from "@/lib/builds/journey-diagnostics";
import { validConstructionForBuild } from "@/lib/builds/workshop-session";
import { TOOLS } from "@/lib/builds/tools";
import type { Construction } from "@/lib/builds/engine";
import type { JourneyData } from "@/lib/builds/journey";
import { BotieSays } from "@/components/site/Botie";
import { WorkshopValue } from "./WorkshopValue";
import { caseLabel } from "@/lib/builds/case-labels";

const button = "min-h-11 rounded-lg border border-line bg-raised px-4 py-2 text-sm font-semibold hover:border-accent-fill";
const primary = `${button} !border-accent-fill !bg-accent-fill text-accent-ink`;

export function JourneyDiagnostic({ data, graph, recordKey, onAssistance, children }: {
  data: JourneyData;
  graph: Construction | null;
  recordKey: string;
  onAssistance: () => void;
  children: ReactNode;
}) {
  const { build, plan, challenges } = data;
  const changed = challenges.variation.build.cases[0];
  const saved = useLearnerRecord(recordKey, {
    observed: false, graph: null as Construction | null, piece: "", reason: "", prediction: "",
    committedPiece: "", committedReason: "", committedPrediction: "", committed: false, assisted: false,
  }, raw => {
    const value = raw as { graph?: Construction | null };
    return !!value && (value.graph === null || validConstructionForBuild(value.graph, build, TOOLS));
  });
  const state = saved.value;
  useEffect(() => { if (state.assisted) onAssistance(); }, [state.assisted, onAssistance]);
  const result = state.graph ? inspectJourneyChange(state.graph, changed, challenges.variation.previous, build) : null;
  const sourceChanges = challenges.variation.changedSources.map(key => build.sources[key]).join(", ");
  function run() {
    saved.set(previous => ({ ...previous, observed: true, graph: graph ? structuredClone(graph) : null, committed: false,
      piece: "", reason: "", prediction: "", committedPiece: "", committedReason: "", committedPrediction: "" }));
  }
  function commit(assisted = false) {
    saved.set(previous => ({ ...previous, committed: true, assisted: previous.assisted || assisted,
      committedPiece: previous.piece, committedReason: previous.reason, committedPrediction: previous.prediction }));
  }
  return <div data-testid="journey-diagnostic" className="space-y-5">
    {state.committed && <>
      <BotieSays mood={result?.result === "works" ? "happy" : "curious"}>
        {result?.result === "works" ? "The first run handled this change. Check that any edits still work on this case and the earlier examples."
          : "Your decision is saved. Try it on the floor, then test this case and the earlier examples."}
      </BotieSays>
      {children}
    </>}
    <details className="rounded-xl border border-line bg-surface p-4" open={!state.committed} data-testid="journey-diagnostic-evidence">
      <summary className="cursor-pointer text-sm font-semibold">{state.committed ? "Your decision and first run" : `Send ${caseLabel(build, changed).toLowerCase()} through your construction`}</summary>
      <p className="mt-3 text-sm leading-7 text-muted">The inputs that changed are {sourceChanges}. This runs the pieces currently saved in your construction, including edits you have not tested.</p>
      {!state.observed && <div className="mt-4">
        {graph ? <button className={primary} onClick={run}>Run my construction on this case</button> : <>
          <p className="mb-3 text-sm leading-7">There is no construction saved for this problem yet. You can return to {plan!.construction.title.toLowerCase()}, or make your first construction here.</p>
          <button className={button} onClick={run}>Plan a first construction for this case</button>
        </>}
      </div>}
      {state.observed && <>
        {result && <div className="mt-4 space-y-4" data-testid="journey-diagnostic-result">
          {!state.committed && <BotieSays mood={result.result === "works" ? "happy" : "curious"}>
            {result.result === "works" ? "Your construction already handles this change. Keep the parts that still do the right job, and use the trace to explain why they work."
              : result.result === "blocked" ? "This construction could not finish on the changed inputs. The trace shows where it stopped."
              : "Your construction runs, but its result does not meet this case's objective. Follow the changed inputs through the pieces before deciding what to adjust."}
          </BotieSays>}
          <div className="grid min-w-0 gap-4 sm:grid-cols-2">
            <div className="min-w-0"><p className="mb-2 text-xs text-muted">Same construction on {caseLabel(build, challenges.variation.previous).toLowerCase()}</p>{result.earlierResult?.error ? <p className="text-sm">{result.earlierResult.error.message}</p> : <WorkshopValue value={result.earlierResult?.output ?? null} />}</div>
            <div className="min-w-0"><p className="mb-2 text-xs text-accent">Your result for {caseLabel(build, changed).toLowerCase()}</p><div data-testid="journey-diagnostic-output">{result.trace.error ? <p className="text-sm">{diagnosticPieceName(result.graph, result.trace.error.id, build)}: {result.trace.error.message}</p> : <WorkshopValue value={result.trace.output ?? null} />}</div></div>
          </div>
          <details className="rounded-lg border border-line p-3"><summary className="cursor-pointer text-sm font-semibold">Follow the values through my pieces</summary><ol className="mt-4 max-h-96 space-y-4 overflow-auto">
            {result.trace.steps.map((step, index) => <li key={step.id} className="min-w-0 rounded-lg bg-background p-3">
              <p className="mb-2 text-sm font-semibold">{index + 1}. {diagnosticPieceName(result.graph, step.id, build)}</p>
              <div className="grid min-w-0 gap-3 sm:grid-cols-2"><div className="min-w-0"><p className="mb-2 text-xs text-muted">Output with earlier inputs</p><WorkshopValue value={result.earlierResult?.steps.find(previous => previous.id === step.id)?.output ?? null} /></div><div className="min-w-0"><p className="mb-2 text-xs text-accent">Output with changed inputs</p><WorkshopValue value={step.output} /></div></div>
            </li>)}
            {result.trace.error && <li className="rounded-lg border border-line p-3 text-sm">Stopped at {diagnosticPieceName(result.graph, result.trace.error.id, build)}: {result.trace.error.message}</li>}
          </ol></details>
        </div>}
        {!state.committed ? <form className="mt-5 space-y-4" onSubmit={event => { event.preventDefault(); commit(); }}>
          <p className="text-sm leading-7">{plan!.reflection.prompt}</p>
          <label className="block text-sm font-semibold">{result ? "Which part will you change, or keep?" : "Where will you start?"}
            <select required className="mt-2 block min-h-11 w-full rounded-lg border border-line bg-background px-3" value={state.piece} onChange={event => saved.set(previous => ({ ...previous, piece: event.target.value }))}>
              <option value="">Choose a part to investigate</option>
              {result?.result === "works" && <option value="keep">Keep this calculation and check why it still works</option>}
              {(result?.graph.pieces ?? []).filter(piece => piece.tool !== "output").map(piece => <option key={piece.id} value={piece.id}>{diagnosticPieceName(result!.graph, piece.id, build)}</option>)}
              <option value="connections">Change the connections or add a missing operation</option>
              <option value="rebuild">Work out a different arrangement</option>
            </select>
          </label>
          <label className="block text-sm font-semibold">Your reasoning, if you want to keep a note
            <textarea className="mt-2 block min-h-20 w-full rounded-lg border border-line bg-background p-3 text-sm font-normal" value={state.reason} onChange={event => saved.set(previous => ({ ...previous, reason: event.target.value }))} />
          </label>
          <label className="block text-sm font-semibold">What do you expect your next construction to do with {caseLabel(build, changed).toLowerCase()}?
            <textarea required className="mt-2 block min-h-20 w-full rounded-lg border border-line bg-background p-3 text-sm font-normal" value={state.prediction} onChange={event => saved.set(previous => ({ ...previous, prediction: event.target.value }))} />
          </label>
          <p className="text-xs leading-6 text-muted">A value, a change in the output, or a description of the operation is enough. These notes are for comparing your reasoning with what the machine does; they are not graded.</p>
          <div className="flex flex-wrap gap-3"><button className={primary} type="submit">Try this decision in the workshop</button><button className={button} type="button" onClick={() => commit(true)}>Work through this with Botie</button></div>
        </form> : <div className="mt-5 space-y-3 rounded-lg bg-background p-4">
          <p className="text-xs text-muted">Your decision before testing</p>
          {state.committedPiece && <p className="text-sm font-semibold">{state.committedPiece === "keep" ? "Keep the calculation" : state.committedPiece === "connections" ? "Change the connections or add a missing operation" : state.committedPiece === "rebuild" ? "Try a different arrangement" : state.graph ? diagnosticPieceName(state.graph, state.committedPiece, build) : "Build a first construction"}</p>}
          {state.committedReason && <p className="whitespace-pre-wrap text-sm leading-7">{state.committedReason}</p>}
          <p className="whitespace-pre-wrap text-sm leading-7">{state.committedPrediction || "You chose to work through the next construction with Botie."}</p>
          <p className="text-xs leading-6 text-muted">These are now known examples. Passing them checks the repair against this data; it does not establish success on an unseen situation.</p>
          <button className="min-h-11 text-sm text-accent underline" onClick={() => saved.set(previous => ({ ...previous, committed: false }))}>Reconsider this decision</button>
        </div>}
        <button className="mt-4 min-h-11 text-sm text-accent underline" onClick={run}>{graph ? "Rerun the current saved construction" : "Start the investigation again"}</button>
      </>}
    </details>
  </div>;
}
