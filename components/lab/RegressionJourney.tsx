"use client";

import { useState } from "react";
import Link from "next/link";
import { BotieSays } from "@/components/site/Botie";
import { fingerprint, useLearnerRecord } from "@/lib/learner-state";
import { useJourneyProgress } from "@/lib/journey-progress";
import { evaluate, type Build, type Construction } from "@/lib/builds/engine";
import { TOOLS } from "@/lib/builds/tools";
import { validConstructionForBuild, workshopRecordKey } from "@/lib/builds/workshop-session";
import type { JourneyData } from "@/lib/builds/journey";
import {
  DELIVERY_ERROR_BUILD, DELIVERY_ABSOLUTE_ERROR_BUILD, DELIVERY_PREDICTOR_BUILD, DELIVERY_STAGES,
  TRAIN_DELIVERIES, VALIDATION_DELIVERIES, commitDeliveryModel, deliveryPredictor,
  evaluateCommittedDeliveryModel, fitDeliveryLine, outlierDeliveries, predictLine,
  runDeliveryMachine, runDeliveryScore, captureDeliveryMachine, applyDeliveryLineFit, brokenDeliveryScore,
  type DeliveryCommitment, type DeliveryModel, type ModelChoiceReason,
} from "@/lib/builds/regression-journey";
import { BuildWorkshop } from "./BuildWorkshop";
import { JourneyContinuity, useEarlierWork } from "./JourneyContinuity";
import { DeliveryDispatch } from "./DeliveryDispatch";
import { DeliveryPlot } from "./DeliveryPlot";
import { DeliveryCampaign } from "./DeliveryCampaign";
import { JourneyEvidenceHistory } from "./JourneyEvidenceHistory";
import { JourneyFreshCheck } from "./JourneyFreshCheck";

const button = "min-h-11 rounded-lg border border-line bg-raised px-4 py-2 text-sm font-semibold hover:border-accent-fill disabled:opacity-50";
const primary = "min-h-11 rounded-lg bg-accent-fill px-4 py-2 text-sm font-semibold text-accent-ink disabled:opacity-50";
const panel = "rounded-2xl border border-line bg-surface p-4 sm:p-5";
const number = (value: number) => Number(value.toFixed(3)).toString();
const modelNames: Record<DeliveryModel, string> = { line: "Your dispatch machine", curve: "Polynomial fitted to the training deliveries" };
const predictorId = "regression-delivery-rule";
const errorId = (metric: string) => `regression-delivery-checker-${metric}`;
type Snapshot = ReturnType<typeof captureDeliveryMachine>;
type Draft = { graph: Construction | null; hintsShown: number; example: boolean; results: Record<string, boolean>; attemptId?: string; carriedSupport?: boolean };
function useDraft(build: Build, id: string) {
  return useLearnerRecord<Draft>(workshopRecordKey(build, id), { graph: null, hintsShown: 0, example: false, results: {} }, raw => {
    const value = raw as Draft;
    return !!value && (value.graph === null || validConstructionForBuild(value.graph, build, TOOLS));
  });
}
const initialState = () => ({
  stage: 0, machineName: "My dispatch machine", metric: "absolute" as "absolute" | "squared",
  runs: 0, predictorTested: false, scoreTested: "", outlierGuess: "", lateMinutes: 16,
  outlierRun: false, selection: "" as DeliveryModel | "", selectionReason: "" as ModelChoiceReason | "",
  comparison: null as Snapshot | null, commitment: null as DeliveryCommitment | null,
});
function validDeliveryState(raw: unknown): boolean {
  if (!raw || typeof raw !== "object") return false;
  const state = raw as ReturnType<typeof initialState>;
  const snapshot = (value: Snapshot | null) => {
    if (value === null) return true;
    if (!value || !["absolute", "squared"].includes(value.metric) || !validConstructionForBuild(value.graph, DELIVERY_PREDICTOR_BUILD, TOOLS)) return false;
    if (!value.scorer || !validConstructionForBuild(value.scorer, DELIVERY_ERROR_BUILD, TOOLS)) return false;
    try { captureDeliveryMachine(value.graph, value.metric, value.scorer); return true; } catch { return false; }
  };
  if (!Number.isInteger(state.stage) || state.stage < 0 || state.stage >= DELIVERY_STAGES.length ||
      !["absolute", "squared"].includes(state.metric) || !["", "line", "curve"].includes(state.selection) ||
      !["", "validation", "training", "complexity"].includes(state.selectionReason) || !snapshot(state.comparison)) return false;
  const commitment = state.commitment;
  if (commitment !== null) {
    if (!commitment || !["line", "curve"].includes(commitment.model) || !["validation", "training", "complexity"].includes(commitment.reason) ||
        !commitment.machine || !snapshot(commitment.machine) || !Array.isArray(commitment.curveTraining) || commitment.curveTraining.length < 2) return false;
    try { evaluateCommittedDeliveryModel(commitment); } catch { return false; }
  }
  return Number.isFinite(state.lateMinutes) && state.lateMinutes >= 16 && state.lateMinutes <= 40;
}

export function RegressionJourney({ data }: { data: JourneyData }) {
  const firstWork = useEarlierWork(data.connections[0]), secondWork = useEarlierWork(data.connections[1]);
  // Earlier reports used a separate fitted predictor. Keep those saves under v1.
  const saved = useLearnerRecord("delivery-journey:v2", initialState, validDeliveryState);
  const state = saved.value;
  const predictor = useDraft(DELIVERY_PREDICTOR_BUILD, predictorId);
  const historical = useDraft(data.build, data.build.id);
  const absolute = useDraft(DELIVERY_ABSOLUTE_ERROR_BUILD, errorId("absolute"));
  const squared = useDraft(DELIVERY_ERROR_BUILD, errorId("squared"));
  const checker = state.metric === "absolute" ? absolute : squared;
  const errorBuild = state.metric === "absolute" ? DELIVERY_ABSOLUTE_ERROR_BUILD : DELIVERY_ERROR_BUILD;
  const graph = predictor.value.graph, scorer = checker.value.graph;
  const progress = useJourneyProgress(data.build.id, "Predict delivery times with Botie", "/lab/simple-linear-regression");
  const [notice, setNotice] = useState("");
  const [showFit, setShowFit] = useState(false);
  const [showEditor, setShowEditor] = useState(false);
  const [repairSeed] = useState(brokenDeliveryScore);
  const scoreReady = !!scorer && state.scoreTested === fingerprint({ graph: scorer, metric: state.metric });
  const fitted = fitDeliveryLine(TRAIN_DELIVERIES);
  const lateRows = outlierDeliveries(state.lateMinutes), lateFit = fitDeliveryLine(lateRows);
  const finalResult = evaluateCommittedDeliveryModel(state.commitment);
  function go(stage: number) { saved.setters.stage(stage); progress.touch(DELIVERY_STAGES[stage]); setNotice(""); }
  function explore() { progress.markExplored(); }
  function run() { saved.setters.runs(count => count + 1); explore(); }
  function changeGraph(next: Construction, assisted = false) {
    predictor.set(previous => ({ ...previous, graph: next, results: {}, tested: {}, example: previous.example || assisted })); explore();
  }
  function fit(rows = TRAIN_DELIVERIES) {
    try {
      if (!graph) throw new Error("Build a predictor first.");
      changeGraph(applyDeliveryLineFit(graph, rows), true);
      setNotice("The fit changed the constants in your connected machine. Run the deliveries again. This attempt records the fitted comparison as guidance.");
    } catch (cause) { setNotice(cause instanceof Error ? cause.message : "Check your predictor connections."); }
  }
  function compare() {
    try {
      if (!graph) throw new Error("Build a dispatch machine in Estimate a delivery before comparing its predictions.");
      if (!scoreReady || !scorer) throw new Error("Test your error checker in Measure the mistakes before installing it for the comparison.");
      saved.setters.comparison(captureDeliveryMachine(graph, state.metric, scorer)); explore(); setNotice("");
    } catch (cause) { setNotice(cause instanceof Error ? cause.message : "Check your machine first."); }
  }
  function commit() {
    if (!state.selection || !state.selectionReason || !state.comparison || state.commitment) return;
    const commitment = commitDeliveryModel(null, state.selection, state.selectionReason, state.comparison);
    saved.set(previous => ({ ...previous, commitment, stage: 4 })); progress.touch(DELIVERY_STAGES[4]); explore();
  }
  const predictorEditor = <BuildWorkshop build={DELIVERY_PREDICTOR_BUILD} compact embeddedBrief recordId={predictorId}
    onActivity={explore} onFreshAttempt={() => { saved.setters.predictorTested(false); explore(); }}
    onOutcome={outcome => { if (outcome.passed) { saved.setters.predictorTested(true); progress.markBuilt(outcome.usedHints || outcome.usedSolution, outcome.attemptId); } }}/>;

  return <div className="min-w-0" data-testid="regression-journey">
    <details className="mb-3 rounded-xl border border-line px-4" data-testid="delivery-reference">
      <summary className="min-h-11 cursor-pointer content-center text-sm text-muted">Lesson reference and earlier work</summary>
      <div className="space-y-4 border-t border-line py-4">
        <p className="max-w-4xl text-sm leading-7 text-muted">A customer asks when their order will arrive. Build a machine that can give them an estimate, then use the deliveries to find out where it goes wrong. These are invented measurements for the project.</p>
        <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm"><Link href="/lab/workshop-guide" className="min-h-11 content-center text-accent underline underline-offset-4">How to place and connect pieces</Link><a href={data.lesson.href} className="min-h-11 content-center text-accent underline underline-offset-4">Read the full explanation and derivation</a><Link href="/lab" className="min-h-11 content-center text-muted underline underline-offset-4">The journey map</Link></div>
        <JourneyContinuity work={[firstWork, secondWork]} reuseDestination="the historical fitting construction in this reference panel"/>
        <JourneyEvidenceHistory record={progress.record}/>
        <details className={panel}><summary className="cursor-pointer font-semibold">Where this fitting problem came from</summary><h3 className="mt-4 text-lg font-semibold">{data.history.title}</h3><div className="mt-3 space-y-4 text-sm leading-7">{data.history.blocks.map((block, index) => typeof block === "string" ? <p key={index}>{block}</p> : <ol key={index} className="list-decimal space-y-3 pl-5">{block.items.map(item => <li key={item.name}><strong>{item.name}.</strong> {item.explanation}</li>)}</ol>)}</div><ul className="mt-4 space-y-2 text-sm">{data.history.sources.map(source => <li key={source.url}><a href={source.url} target="_blank" rel="noopener noreferrer" className="text-accent underline underline-offset-4">{source.title}</a></li>)}</ul></details>
        <details className={panel}><summary className="cursor-pointer font-semibold">Build the historical fitting calculation</summary><p className="my-4 text-sm leading-7 text-muted">Here you can return to the astronomers&apos; measurement problem and construct the fitting calculation from the lesson. Close this reference panel to return to the delivery missions.</p><BuildWorkshop build={data.build} compact reusable={[firstWork.reusable, secondWork.reusable].filter(item => item !== undefined)}/>{data.fresh && <details className={`${panel} mt-5`}><summary className="cursor-pointer font-semibold">{data.fresh.name}</summary><div className="mt-4"><JourneyFreshCheck build={data.build} fresh={data.fresh} graph={historical.value.graph} supported={historical.value.example || historical.value.hintsShown > 0 || Boolean(historical.value.carriedSupport)} title={data.build.title} href="/lab/simple-linear-regression"/></div></details>}</details>
      </div>
    </details>
    <nav aria-label="Delivery journey stages" className="mb-4 flex gap-1 overflow-x-auto border-b border-line">{DELIVERY_STAGES.map((stage, index) => <button key={stage} type="button" onClick={() => go(index)} aria-current={state.stage === index ? "step" : undefined} className={`min-h-11 shrink-0 border-b-2 px-3 py-2 text-xs font-semibold hover:text-accent ${state.stage === index ? "border-accent-fill text-accent" : "border-transparent text-muted"}`}>{stage}</button>)}</nav>
    {notice && <div role="status" className="mb-4"><BotieSays mood="curious">{notice}</BotieSays></div>}

    {state.stage === 0 && <section aria-labelledby="delivery-estimate-title" className="space-y-5">
      <h2 id="delivery-estimate-title" className="text-2xl font-semibold">How long should we tell the customer?</h2>
      <BotieSays>A rider needs roughly 2 minutes for each kilometre. Preparing the order takes about 6 minutes, even for a customer next door. Where does each amount belong? Choose your pieces and connect the estimate to Result. You can send out these invented deliveries before the construction passes its checks. Their arrival times might help you find what is missing.</BotieSays>
      {predictorEditor}
      <details className="rounded-xl border border-line px-4"><summary className="min-h-11 cursor-pointer content-center text-sm text-muted">Name this dispatch machine</summary><label className="mb-4 block text-sm font-semibold">Name your machine<input className="mt-2 block min-h-11 w-full max-w-md rounded-lg border border-line bg-background px-3" value={state.machineName} maxLength={70} onChange={event => saved.setters.machineName(event.target.value)}/></label></details>
      <DeliveryDispatch graph={graph} rows={[{distance: .25, minutes: 6.5}, ...TRAIN_DELIVERIES]} metric={state.metric} name="The waiting orders" onRun={run}/>
      {state.predictorTested && <p className="text-sm text-accent">You tested the starting rule. This same construction supplies the promises in dispatch and follows you into the next problem.</p>}
    </section>}

    {state.stage === 1 && <section aria-labelledby="delivery-errors-title" className="space-y-5">
      <h2 id="delivery-errors-title" className="text-2xl font-semibold">The checker says zero. Did we keep our promises?</h2>
      <BotieSays>One customer was promised 8 minutes and waited 10. Another was promised 12 minutes and waited 10. Our checker reports zero total error. Look inside it. What has it counted, and what has disappeared?</BotieSays>
      <div className={panel}><pre className="overflow-x-auto rounded-lg bg-background p-4 text-sm">{"promised: [8, 12] min\narrived: [10, 10] min\nsigned differences: [−2, 2] min\ncurrent total: −2 + 2 = 0 min"}</pre><p className="mt-3 text-sm leading-7">Choose what a single delivery should contribute. Both choices count a mistake in either direction. You will build the average for a batch.</p><fieldset className="mt-3 flex flex-wrap gap-3"><legend className="mb-2 text-sm font-semibold">How should we count a miss?</legend>{([ ["absolute", "Count how many minutes it missed by"], ["squared", "Multiply the size of the miss by itself"] ] as const).map(([value, label]) => <label key={value} className="flex min-h-11 cursor-pointer items-center gap-2 rounded-lg border border-line p-3 text-sm"><input type="radio" name="delivery-metric" checked={state.metric === value} onChange={() => { saved.setters.metric(value); explore(); }}/>{label}</label>)}</fieldset></div>
      <BuildWorkshop key={state.metric} build={errorBuild} compact embeddedBrief recordId={errorId(state.metric)} initialGraph={repairSeed} initialCaseIndex={1}
        openingCoach="This checker adds signed differences. Repair it so both missed promises count toward the batch average."
        onActivity={explore} onFreshAttempt={() => { saved.setters.scoreTested(""); explore(); }}
        onOutcome={outcome => { if (outcome.passed) { saved.setters.scoreTested(fingerprint({ graph: outcome.graph, metric: state.metric })); explore(); } }}/>
      {scoreReady && <BotieSays mood="happy">Your error checker is installed in dispatch. {state.metric === "absolute" ? "You built mean absolute error. Its result is the average size of a miss, measured in minutes." : "You built mean squared error. Large misses contribute more strongly because you square their sizes. The result is in minutes squared."} Change your predictor, then send the orders through both machines.</BotieSays>}
      <MachineValues graph={graph} name={state.machineName} change={changeGraph}/>
      <button className={button} onClick={() => setShowEditor(value => !value)}>{showEditor ? "Close the predictor floor" : "Open my predictor to repair its connections"}</button>{showEditor && predictorEditor}
      <DeliveryDispatch graph={graph} rows={TRAIN_DELIVERIES} metric={state.metric} scorer={scoreReady ? scorer! : undefined} name="Promises from your current machine" onRun={run}/>
      {scoreReady && state.runs > 0 && <details className={panel}><summary className="min-h-11 cursor-pointer content-center font-semibold">Send the repaired machine a different shift</summary><p className="mb-4 text-sm leading-7">These orders use different distances from the repair batch. They are practice for your current machine. After you run them, they are familiar examples, so another run is a recheck.</p><DeliveryDispatch graph={graph} rows={[{distance: .75, minutes: 7.5}, {distance: 2.75, minutes: 11.5}, {distance: 4.25, minutes: 14.5}]} metric={state.metric} scorer={scorer!} name="The next practice shift" onRun={run}/></details>}
      {state.runs > 0 && <div className={panel}><button className={button} onClick={() => { setShowFit(true); explore(); }}>Compare with a fitted straight line</button>{showFit && <><p className="mt-3 text-sm leading-7">Least squares chooses the coefficients that minimise squared error among straight lines on these training records. It need not minimise absolute error. Compare it with your attempt before deciding whether to use it.</p><pre className="my-3 overflow-x-auto rounded-lg bg-background p-3 text-sm">fitted minutes = ({number(fitted.slope)} × distance in km) + {number(fitted.intercept)}</pre><button className={button} onClick={() => fit()}>Apply the fit to my connected constants</button></>}</div>}
    </section>}

    {state.stage === 2 && <section aria-labelledby="delivery-outlier-title" className="space-y-5">
      <h2 id="delivery-outlier-title" className="text-2xl font-semibold">One late arrival is changing everyone&apos;s estimate</h2>
      <BotieSays>The 5 km training record says 16 minutes. Suppose its recorded time increases. Your machine stays as you built it. A new least-squares fit will respond to the edited records. What will happen to nearby estimates?</BotieSays>
      <fieldset className={panel}><legend className="px-2 text-sm font-semibold">My prediction before refitting</legend>{[["changes", "Some nearby estimates will change too."], ["same", "Only the 5 km estimate will change."], ["ignore", "The fit will ignore this record."]].map(([value, label]) => <label key={value} className="my-2 flex min-h-11 items-center gap-3 rounded-lg border border-line p-3 text-sm"><input type="radio" name="outlier-guess" checked={state.outlierGuess === value} onChange={() => { saved.setters.outlierGuess(value); saved.setters.outlierRun(false); }}/>{label}</label>)}</fieldset>
      <label className="block text-sm font-semibold">Time recorded for the 5 km order: {state.lateMinutes} min<input aria-label="Time recorded for the 5 km order" type="range" min="16" max="40" value={state.lateMinutes} onChange={event => { saved.setters.lateMinutes(Number(event.target.value)); saved.setters.outlierRun(false); }} className="mt-2 block min-h-11 w-full accent-amber-400"/></label>
      <button className={primary} disabled={!state.outlierGuess || state.lateMinutes === 16} onClick={() => { saved.setters.outlierRun(true); explore(); }}>Run the refitting experiment</button>
      {state.outlierRun && <><DeliveryPlot rows={lateRows} lines={[{label: "Fit to edited records", predict: distance => predictLine(lateFit, distance), color: "#f3b62b"}, {label: "Fit before editing", predict: deliveryPredictor("line"), color: "#7bcfca", dashed: true}]} label="How one changed record affects a fitted line"/><BotieSays mood={state.outlierGuess === "changes" ? "happy" : "curious"}>The fitted rate changed to {number(lateFit.slope)} minutes per kilometre. The effect reaches other customers. A large squared error gives this observation considerable influence. We still need to find out whether the late arrival happened. The service missions include both a real delay and a recording mistake.</BotieSays><LossComparison minutes={state.lateMinutes}/><button className={button} onClick={() => fit(lateRows)}>Try this fit in my dispatch machine</button><DeliveryDispatch graph={graph} rows={TRAIN_DELIVERIES} metric={state.metric} scorer={scoreReady ? scorer! : undefined} name="What happened to the other customers?" onRun={run}/></>}
    </section>}

    {state.stage === 3 && <section aria-labelledby="delivery-selection-title" className="space-y-5">
      <h2 id="delivery-selection-title" className="text-2xl font-semibold">Which machine should handle the next orders?</h2>
      <BotieSays>Keep your machine, or try a polynomial fitted through all five training deliveries. Both must use the same error checker. Make a provisional choice, then send both through a batch they were never fitted to.</BotieSays>
      <TrainingComparison graph={graph} metric={state.metric} scorer={scoreReady ? scorer! : undefined}/>
      <fieldset className={panel} disabled={!!state.commitment}><legend className="px-2 text-sm font-semibold">My provisional model choice</legend>{(["line", "curve"] as const).map(model => <label key={model} className="my-2 flex min-h-11 items-center gap-3 rounded-lg border border-line p-3 text-sm"><input type="radio" name="delivery-model-choice" checked={state.selection === model} onChange={() => saved.setters.selection(model)}/>{modelNames[model]}</label>)}</fieldset>
      {!state.commitment && <button className={primary} disabled={!state.selection} onClick={compare}>Compare on separate validation deliveries</button>}
      {state.comparison && <div className={panel}><h3 className="font-semibold">What happened on the comparison batch?</h3><p className="mt-2 text-sm leading-7 text-muted">These records were kept out of fitting. This run holds a copy of your machine and checker. Run another comparison to use later edits to your floor.</p><ComparisonScores snapshot={state.comparison}/><fieldset className="mt-5" disabled={!!state.commitment}><legend className="text-sm font-semibold">What evidence are you using for your final choice?</legend>{[["training", "The error on the training deliveries."], ["validation", "The error on the separate validation deliveries."], ["complexity", "The number of adjustable coefficients."]].map(([value, label]) => <label key={value} className="my-2 flex min-h-11 items-center gap-3 rounded-lg border border-line p-3 text-sm"><input type="radio" name="selection-reason" checked={state.selectionReason === value} onChange={() => saved.setters.selectionReason(value as ModelChoiceReason)}/>{label}</label>)}</fieldset><p className="my-3 text-sm leading-7">You can revise your model choice above. Commit it before opening the final deliveries. That report keeps this exact machine and checker.</p>{!state.commitment && <button className={primary} disabled={!state.selectionReason} onClick={commit}>Commit my model and open the final deliveries</button>}</div>}
      {state.commitment && <BotieSays>The report uses your saved choice. You can keep experimenting without changing that record.<button className={`${button} mt-3 block`} onClick={() => go(4)}>View the saved final report</button></BotieSays>}
    </section>}

    {state.stage === 4 && <section aria-labelledby="delivery-final-title" className="space-y-5">
      <h2 id="delivery-final-title" className="text-2xl font-semibold">Did the estimates help the next customers?</h2>
      {!finalResult ? <BotieSays>Choose a machine using the training and validation records first. This final batch stays out of that decision.<button className={`${primary} mt-3 block`} onClick={() => go(3)}>Choose a model using validation data</button></BotieSays> : <>
        <div className={panel}><h3 className="text-lg font-semibold">Committed model: {modelNames[finalResult.model]}</h3><p className="mt-3 font-mono" data-testid="final-delivery-score">Final {finalResult.metric === "absolute" ? "absolute" : "squared"} error: {number(finalResult.score)} {finalResult.metric === "squared" ? "min²" : "min"}</p><div className="mt-4 overflow-x-auto"><table className="w-full text-left text-sm"><caption className="mb-3 text-left text-muted">Saved promises and final arrivals</caption><thead><tr>{["Distance (km)", "Promised (min)", "Arrived (min)", "Contribution"].map(title => <th key={title} className="p-2">{title}</th>)}</tr></thead><tbody>{finalResult.rows.map(row => <tr key={row.distance} className="border-t border-line">{[row.distance, row.prediction, row.minutes, row.contribution].map((value, index) => <td key={index} className="p-2 font-mono">{number(value)}</td>)}</tr>)}</tbody></table></div></div>
        <BotieSays mood={finalResult.appliedSelection ? "happy" : "curious"}>{finalResult.appliedSelection ? "You used validation to choose the lower-scoring model. This final batch tells us how it performed on different deliveries." : "Compare this result with the validation evidence and your stated reason for choosing the model."} A perfect training fit can follow quirks of a small sample. A curve can still help when the relationship calls for one. Try that situation in the next missions.</BotieSays>
        <section className={panel} aria-label="Skills demonstrated"><h3 className="font-semibold">What this attempt shows</h3><ul className="mt-3 space-y-2 text-sm"><li>{state.predictorTested ? "You tested a construction for the starting prediction rule." : "The starting rule has not passed its construction checks."}</li><li>You tested an error checker and used it in model comparison.</li><li>{finalResult.appliedSelection ? "You selected the model supported by this validation comparison." : "Your model-selection decision needs another look."}</li><li>The service missions check your decisions in different situations.</li></ul></section>
        <p className="text-sm leading-7 text-muted">These final observations are now familiar. Reusing them to choose another model would make them selection data. This invented batch is practice evidence, not a performance claim about a real delivery service.</p><button className={primary} onClick={() => go(5)}>Keep the service running</button>
      </>}
      <a href={`${data.lesson.href}#practice`} className={`${button} inline-block`}>Work through regression in Python</a>
    </section>}

    {state.stage === 5 && <DeliveryCampaign graph={graph} metric={state.metric} scorer={scoreReady ? scorer! : undefined} onIndependentSuccess={() => { if (state.predictorTested && state.scoreTested) progress.markTransferred(false, `delivery-campaign:${predictor.value.attemptId ?? "legacy"}`); }}/>}
    <div className="mt-7 flex flex-wrap justify-between gap-3 border-t border-line pt-5"><button className={button} disabled={state.stage === 0} onClick={() => go(state.stage - 1)}>← {state.stage > 0 ? DELIVERY_STAGES[state.stage - 1] : "Previous problem"}</button>{state.stage < DELIVERY_STAGES.length - 1 && <button className={primary} onClick={() => go(state.stage + 1)}>{DELIVERY_STAGES[state.stage + 1]} →</button>}</div>
  </div>;
}

function MachineValues({ graph, name, change }: { graph: Construction | null; name: string; change: (graph: Construction) => void }) {
  const constants = graph?.pieces.filter(piece => piece.tool === "constant") ?? [];
  return <section className="rounded-xl border border-line p-4"><div className="flex flex-wrap items-center justify-between gap-3"><h3 className="text-sm font-semibold">Values inside {name || "your machine"}</h3>{!constants.length ? <p className="text-sm">Place your predictor&apos;s pieces first.</p> : <div className="flex flex-wrap gap-4">{constants.map((piece, index) => <label key={piece.id} className="text-sm">Constant {index + 1}<input aria-label={`Dispatch constant ${index + 1}`} type="number" step="any" value={piece.settings.value} onChange={event => { if (event.target.value.trim() && Number.isFinite(Number(event.target.value))) change({ ...graph!, pieces: graph!.pieces.map(item => item.id === piece.id ? {...item, settings: {...item.settings, value: Number(event.target.value)}} : item) }); }} className="ml-2 min-h-11 w-24 rounded-lg border border-line bg-background px-3"/></label>)}</div>}</div><details className="mt-2"><summary className="cursor-pointer text-xs leading-6 text-muted">How these constants affect dispatch</summary><p className="mt-2 text-sm leading-7 text-muted">These edit the constant pieces on your floor. Connections determine what each value does. A disconnected piece cannot affect predictions.</p></details></section>;
}

function LossComparison({ minutes }: { minutes: number }) {
  const error = minutes - 16;
  return <div className={panel}><h3 className="font-semibold">How much does this miss count?</h3><p className="mt-2 text-sm leading-7">For the original 16-minute promise, both measures count the late arrival. Squaring makes a large miss grow faster. The results have different units, so a lower number does not make one measure better.</p><pre className="mt-3 overflow-x-auto rounded-lg bg-background p-3 text-sm">{`miss: ${minutes} − 16 = ${error} min\nabsolute contribution: |${error}| = ${error} min\nsquared contribution: ${error} × ${error} = ${error * error} min²`}</pre></div>;
}

function TrainingComparison({ graph, metric, scorer }: { graph: Construction | null; metric: "absolute" | "squared"; scorer?: Construction }) {
  if (!graph) return <p className="text-sm">Your predictor floor is empty. You can visit every stage, but these orders need a connected machine before we can compare predictions.</p>;
  let result: ReturnType<typeof runDeliveryMachine> | null = null;
  let error = "";
  let curveScore = 0;
  try {
    result = runDeliveryMachine(graph, TRAIN_DELIVERIES, metric, scorer);
    if (scorer) curveScore = runDeliveryScore(scorer, TRAIN_DELIVERIES.map(row => deliveryPredictor("curve")(row.distance)), TRAIN_DELIVERIES.map(row => row.minutes));
  } catch (cause) { error = cause instanceof Error ? cause.message : "Check your predictor before comparing it."; }
  if (!result) return <BotieSays mood="curious">{error}</BotieSays>;
  return <div className={panel}><DeliveryPlot rows={TRAIN_DELIVERIES} lines={[{label: "Your connected machine", predict: distance => Number(evaluate(graph, {distance}, TOOLS).output), color: "#f3b62b"}, {label: "Polynomial fitted to training records", predict: deliveryPredictor("curve"), color: "#9c96ff", dashed: true}]} label="Your machine and a polynomial on the training deliveries"/><p className="font-mono text-sm">Your training score: {number(result.score)} {metric === "squared" ? "min²" : "min"}<br/>Polynomial training score: {number(curveScore)} {metric === "squared" ? "min²" : "min"}</p><p className="mt-3 text-sm leading-7 text-muted">The polynomial interpolates the five original training records. Your machine uses your own pieces and settings. The next batch has not been used to fit either candidate.</p></div>;
}

function ComparisonScores({ snapshot }: { snapshot: Snapshot }) {
  const own = runDeliveryMachine(snapshot.graph, VALIDATION_DELIVERIES, snapshot.metric, snapshot.scorer);
  const predictions = VALIDATION_DELIVERIES.map(row => deliveryPredictor("curve")(row.distance));
  const actual = VALIDATION_DELIVERIES.map(row => row.minutes);
  const score = snapshot.scorer ? runDeliveryScore(snapshot.scorer, predictions, actual) : predictions.reduce((sum, value, i) => sum + (snapshot.metric === "squared" ? (value - actual[i]) ** 2 : Math.abs(value - actual[i])), 0) / predictions.length;
  return <><div className="mt-4 overflow-x-auto"><table className="w-full text-left text-sm"><caption className="mb-3 text-left text-muted">Validation arrivals and promises</caption><thead><tr>{["Distance (km)", "Actual (min)", "Your machine (min)", "Polynomial (min)"].map(title => <th key={title} className="p-2">{title}</th>)}</tr></thead><tbody>{own.rows.map((row, index) => <tr key={row.distance} className="border-t border-line">{[row.distance, row.minutes, row.prediction, predictions[index]].map((value, cell) => <td key={cell} className="p-2 font-mono">{number(value)}</td>)}</tr>)}</tbody></table></div><p className="mt-4 font-mono text-sm">Your checker&apos;s score for your machine: {number(own.score)} {snapshot.metric === "squared" ? "min²" : "min"}<br/>Your checker&apos;s score for the polynomial: {number(score)} {snapshot.metric === "squared" ? "min²" : "min"}</p></>;
}
