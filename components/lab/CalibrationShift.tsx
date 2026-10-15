"use client";

import { useState } from "react";
import { BotieSays } from "@/components/site/Botie";
import { useLearnerRecord } from "@/lib/learner-state";
import { evaluate, show, type Construction } from "@/lib/builds/engine";
import { TOOLS } from "@/lib/builds/tools";
import { calibrationRepair, calibrationShift } from "@/lib/builds/onboarding";
import { BuildWorkshop } from "./BuildWorkshop";

const button = "min-h-11 rounded-lg border border-line bg-raised px-4 py-2 text-sm font-semibold disabled:opacity-50";
export function CalibrationShift({ graph }: { graph: Construction | null }) {
  const saved = useLearnerRecord("onboarding-calibration:v1", { inspected: false, prediction: "", repaired: null as Construction | null, shiftPrediction: "", shiftOpen: false });
  const state = saved.value;
  const [trace, setTrace] = useState<ReturnType<typeof evaluate> | null>(null);
  return <section className="space-y-5" aria-label="Replacement sensor challenge">
    <h2 className="text-2xl font-semibold">The replacement sensor disagrees with your machine</h2>
    <BotieSays>We replaced the sensor. Its readings still need doubling, but its zero point is different. With a reading of zero, the reference instrument reads 4. Send that zero through the machine you already built. What does it produce?</BotieSays>
    <button className={button} onClick={() => { if (graph) { setTrace(evaluate(graph, {reading: 0}, TOOLS)); saved.setters.inspected(true); } }}>Try my machine on the replacement</button>
    {!graph && <p className="text-sm text-muted">Build your sensor machine in the previous step first. That construction supplies this experiment.</p>}
    {(trace || state.inspected) && <>
      {trace && <div role="status" className="rounded-xl border border-line bg-surface p-4"><p>Your machine produced:</p><pre className="mt-2 overflow-x-auto">{trace.error?.message ?? show(trace.output)}</pre><p className="mt-2 text-sm">Reference measurement: 4</p></div>}
      <label className="block text-sm font-semibold">Which change would you try, and what should it do to the result?<textarea className="mt-2 block min-h-24 w-full rounded-lg border border-line bg-background p-3 font-normal" value={state.prediction} onChange={event => saved.setters.prediction(event.target.value)}/></label>
      <p className="text-sm text-muted">Keep a note before changing the machine. It is for comparing your reasoning with the result, not an automatically marked answer.</p>
      <BuildWorkshop build={calibrationRepair} compact recordId="guide:calibration-repair" initialGraph={graph ?? undefined} withholdExpectedUntilTest
        onOutcome={outcome => { if (outcome.passed) saved.setters.repaired(outcome.graph); }} onActivity={() => saved.setters.repaired(null)}/>
    </>}
    {state.repaired && <div className="rounded-xl border border-line bg-surface p-5"><BotieSays mood="happy">The repair agrees with both reference measurements. A new reading is 7. Before running it, what do you expect the repaired machine to return?</BotieSays><label className="mt-4 block text-sm">Prediction for the next reading<input type="number" className="ml-3 min-h-11 w-28 rounded-lg border border-line bg-background px-3" value={state.shiftPrediction} onChange={event => saved.setters.shiftPrediction(event.target.value)}/></label><button className={`${button} mt-3`} disabled={!state.shiftPrediction.trim() || !Number.isFinite(Number(state.shiftPrediction))} onClick={() => saved.setters.shiftOpen(true)}>Try the next readings</button></div>}
    {state.shiftOpen && state.repaired && <BuildWorkshop compact build={calibrationShift} recordId="guide:calibration-shift" initialGraph={state.repaired} withholdExpectedUntilTest
      briefing={<p className="mt-3 text-sm">Your prediction for a reading of 7: {state.shiftPrediction}. This machine starts from your repair. Once tested, these readings become familiar rechecks.</p>}/>}
  </section>;
}
