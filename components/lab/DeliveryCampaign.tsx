"use client";

import { useId, useState } from "react";
import { BotieSays } from "@/components/site/Botie";
import { useLearnerRecord } from "@/lib/learner-state";
import { evaluate, show, type Construction } from "@/lib/builds/engine";
import { TOOLS } from "@/lib/builds/tools";
import { type DeliveryMetric } from "@/lib/builds/regression-journey";
import {
  CAMPAIGN_MISSIONS, activeCampaignAttempt, campaignCorrection, campaignMachineValue,
  campaignReducer, campaignScenario, formatCampaignNumber as number, initialCampaignState,
  runCampaign, validCampaignState, type CampaignAction, type CampaignAttempt,
  type CampaignRow,
} from "@/lib/builds/delivery-campaign";

const button = "min-h-11 rounded-lg border border-line bg-raised px-4 py-2 text-sm font-semibold hover:border-accent-fill disabled:opacity-50";
const primary = "min-h-11 rounded-lg bg-accent-fill px-4 py-2 text-sm font-semibold text-accent-ink disabled:opacity-50";
const panel = "rounded-2xl border border-line bg-surface p-4 sm:p-5";

export function DeliveryCampaign({ graph, metric = "squared", scorer, onIndependentSuccess }: { graph: Construction | null; metric?: DeliveryMetric; scorer?: Construction; onIndependentSuccess: () => void }) {
  const saved = useLearnerRecord("delivery-campaign:v2", initialCampaignState, validCampaignState);
  const state = saved.value, attempt = activeCampaignAttempt(state);
  function dispatch(action: CampaignAction) {
    const next = campaignReducer(state, action), result = activeCampaignAttempt(next);
    saved.set(next);
    if (action.type === "run" && result.report?.supportedDecision && result.hints === 0 && !result.resultsAlreadySeen) onIndependentSuccess();
  }
  const finished = state.attempts.filter(item => item.report);
  return <section className="space-y-5" aria-label="Keep the delivery service running" data-testid="delivery-campaign">
    <div>
      <p className="font-mono text-xs text-accent">Your delivery service</p>
      <h2 className="mt-2 text-2xl font-semibold">What happens when the job changes?</h2>
      <p className="mt-3 max-w-4xl text-sm leading-7 text-muted">Your distance machine stays installed. Each mission tries a fitted correction to its actual output. You choose which information that correction may use, then make promises to a new batch of customers. These records are invented. You can visit the missions in any order.</p>
    </div>
    <nav className="flex flex-wrap gap-2" aria-label="Delivery missions">
      {CAMPAIGN_MISSIONS.map(mission => <button key={mission} type="button" className={`${button} ${state.mission === mission ? "!border-accent-fill !bg-accent-soft text-accent" : "text-muted"}`} aria-current={state.mission === mission ? "step" : undefined} onClick={() => dispatch({ type: "mission", mission })}>{campaignScenario(mission).title}</button>)}
    </nav>
    <DeliveryMission key={attempt.id} attempt={attempt} graph={graph} metric={metric} scorer={scorer} dispatch={dispatch}/>
    {finished.length > 0 && <details className={panel}>
      <summary className="cursor-pointer font-semibold">Your dispatch notes</summary>
      <p className="mt-3 text-sm leading-6 text-muted">These notes describe individual attempts. Asking Botie for help stays with that attempt. A fresh batch gives you another chance to work through the decision yourself.</p>
      <ol className="mt-3 space-y-3">
        {[...finished].reverse().slice(0, 12).map(item => <li key={item.id} className="border-t border-line pt-3 text-sm">
          <p className="font-semibold">{campaignScenario(item.mission).title} <span className="font-normal text-muted">· Batch {item.seed + 1}</span></p>
          {item.blockName && <p className="mt-1 font-mono text-xs text-accent">{item.blockName}</p>}
          <p className="mt-1 leading-6">{item.report!.supportedDecision ? item.report!.skill : "Ran the experiment; the decision still needs work"}.
            {item.resultsAlreadySeen ? " Retried after seeing this batch's results." : item.hints ? " Worked through with Botie's hints." : " No hints requested for this attempt."}</p>
        </li>)}
      </ol>
    </details>}
  </section>;
}

function DeliveryMission({ attempt, graph, metric, scorer, dispatch }: { attempt: CampaignAttempt; graph: Construction | null; metric: DeliveryMetric; scorer?: Construction; dispatch: (action: CampaignAction) => void }) {
  const scenario = campaignScenario(attempt.mission, attempt.seed), report = attempt.report;
  const [runError, setRunError] = useState("");
  const [distance, setDistance] = useState(3);
  const [neighborhood, setNeighborhood] = useState<"Riverside" | "Hilltop">("Riverside");
  const [selectedOrder, setSelectedOrder] = useState(0);
  const [compare, setCompare] = useState(false);
  const id = useId();
  const installed = report ? attempt.machine : graph;
  let machineError = "", currentPromise: number | null = null, newPromise: number | null = null;
  try {
    if (!installed) throw new Error("Build and connect your distance machine in the first stage to dispatch these deliveries.");
    currentPromise = campaignMachineValue(installed, distance);
    if (attempt.decision) newPromise = currentPromise + campaignCorrection(scenario, attempt.decision, installed).correction({ id: "Preview", distance, minutes: 0, neighborhood });
  } catch (error) { machineError = error instanceof Error ? error.message : "The installed machine needs a repair."; }
  const usedMetric = report?.metric ?? metric, units = usedMetric === "squared" ? "min²" : "min";
  const scoreName = usedMetric === "squared" ? "Mean squared error" : "Mean absolute error";
  const correctExpectation = report ? report.score < report.baselineScore - .01 ? "lower" : report.score > report.baselineScore + .01 ? "higher" : "similar" : null;
  const inspected = report?.rows[selectedOrder];
  const trace = inspected && attempt.machine ? evaluate(attempt.machine, { distance: inspected.distance }, TOOLS) : null;

  function run() {
    if (!graph) return;
    try { dispatch({ type: "run", graph, metric, scorer }); setRunError(""); }
    catch (error) { setRunError(error instanceof Error ? error.message : "This machine could not dispatch the batch."); }
  }

  return <div className="space-y-5" data-testid="delivery-mission">
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div><p className="font-mono text-xs text-muted">Batch {attempt.seed + 1}</p><h3 className="mt-1 text-xl font-semibold">{scenario.title}</h3></div>
      <button type="button" className={button} onClick={() => dispatch({ type: "retry", fresh: true })}>Fresh deliveries</button>
    </div>
    <BotieSays>{scenario.problem}<p className="mt-3">{scenario.objective}</p></BotieSays>
    <div className="grid min-w-0 gap-4 lg:grid-cols-2">
      <div className={panel}>
        <RecordTable rows={scenario.training} caption={scenario.recent ? "Last month's completed trips" : "Completed trips available for fitting"}/>
        {scenario.recent && <div className="mt-5 border-t border-line pt-4"><RecordTable rows={scenario.recent} caption="This week's completed trips"/></div>}
        {scenario.evidence.length > 0 && <div className="mt-4 border-t border-line pt-4">
          <button className={button} type="button" aria-expanded={attempt.evidenceOpened} aria-controls={`${id}-evidence`} onClick={() => dispatch({ type: "evidence" })}>{attempt.evidenceOpened ? "Dispatch evidence is open" : "Inspect the dispatch evidence"}</button>
          {attempt.evidenceOpened && <div id={`${id}-evidence`} className="mt-3 space-y-3 text-sm leading-6" data-testid="dispatch-evidence">{scenario.evidence.map(evidence => <p key={evidence}>{evidence}</p>)}</div>}
        </div>}
      </div>
      <div className={panel}>
        <h4 className="font-semibold">What should we fit?</h4>
        <p className="mt-2 text-sm leading-6 text-muted">Fitting estimates an adjustment from the completed records. It adds that adjustment to your existing machine. These fits use least squares; your chosen error measure checks their predictions on the waiting orders.</p>
        <fieldset className="mt-4 space-y-3" disabled={!!report}>
          <legend className="sr-only">Choose a correction or record treatment</legend>
          {scenario.choices.map(choice => <label key={choice.id} className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 ${attempt.decision === choice.id ? "border-accent-fill bg-accent-soft" : "border-line"}`}>
            <input type="radio" className="mt-1 size-4 shrink-0 accent-[var(--accent-fill)]" name={`${id}-decision`} value={choice.id} checked={attempt.decision === choice.id} onChange={() => dispatch({ type: "decision", decision: choice.id })}/>
            <span><span className="block text-sm font-semibold">{choice.label}</span><span className="mt-1 block text-sm leading-6 text-muted">{choice.explanation}</span></span>
          </label>)}
        </fieldset>
        <button type="button" className={`${button} mt-4`} disabled={!!report || attempt.hints >= scenario.hints.length} onClick={() => dispatch({ type: "hint" })}>Ask Botie for a hint</button>
        {scenario.hints.slice(0, attempt.hints).map((hint, index) => <BotieSays className="mt-3" mood="thinking" key={hint}><span className="font-semibold">Hint {index + 1}. </span>{hint}</BotieSays>)}
      </div>
    </div>

    <div className={panel}>
      <h4 className="font-semibold">Try an address before promising a time</h4>
      <p className="mt-2 text-sm leading-6 text-muted">Move the address to see what your installed machine would promise. Choose a fit above to inspect its proposed adjustment. No arrival outcome is used in this preview.</p>
      <div className="mt-4 flex flex-wrap items-center gap-5">
        <label className="min-w-48 flex-1 text-sm" htmlFor={`${id}-distance`}>Distance: <strong>{number(distance)} km</strong><input id={`${id}-distance`} className="mt-3 block w-full accent-[var(--accent-fill)]" type="range" min="0" max="6" step=".25" value={distance} onChange={event => setDistance(Number(event.target.value))}/></label>
        {scenario.id === "neighborhoods" && <label className="text-sm" htmlFor={`${id}-neighborhood`}>Address neighborhood<select id={`${id}-neighborhood`} className="mt-2 block min-h-11 rounded-lg border border-line bg-background px-3" value={neighborhood} onChange={event => setNeighborhood(event.target.value as "Riverside" | "Hilltop")}><option>Riverside</option><option>Hilltop</option></select></label>}
      </div>
      <div className="mt-4 rounded-xl border border-line bg-background p-4">
        <div className="flex justify-between text-xs text-muted"><span>Dispatch kitchen</span><span>Customer at {number(distance)} km</span></div>
        <div className="relative my-3 h-2 rounded-full bg-raised" aria-hidden="true"><div className="h-full rounded-full bg-accent-fill" style={{ width: `${distance / 6 * 100}%` }}/><span className="absolute top-1/2 size-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-background bg-accent-fill" style={{ left: `${distance / 6 * 100}%` }}/></div>
        {machineError ? <p className="text-sm leading-6 text-muted">{machineError}</p> : <dl className="flex flex-wrap gap-x-8 gap-y-3 text-sm">
          <div><dt className="text-muted">Your installed machine</dt><dd className="mt-1 font-mono text-lg" data-testid="campaign-installed-promise">{number(currentPromise!)} min</dd></div>
          {newPromise !== null && <><div><dt className="text-muted">Fitted adjustment</dt><dd className="mt-1 font-mono text-lg">{number(newPromise - currentPromise!)} min</dd></div><div><dt className="text-muted">Proposed promise</dt><dd className="mt-1 font-mono text-lg text-accent">{number(newPromise)} min</dd></div></>}
        </dl>}
      </div>
    </div>

    {!report && <div className={panel}>
      <h4 className="font-semibold">The next orders are waiting</h4>
      <p className="mt-2 text-sm leading-6 text-muted">These addresses are available now. Arrival times appear after dispatch. A promise earlier than the actual arrival leaves the customer waiting beyond the estimate.</p>
      <ul className="mt-3 flex flex-wrap gap-2 text-sm">{scenario.validation.map(record => <li key={record.id} className="rounded-lg border border-line p-3">{record.id}: {number(record.distance)} km{record.neighborhood ? `, ${record.neighborhood}` : ""}</li>)}</ul>
      <fieldset className="mt-5">
        <legend className="text-sm font-semibold">Compared with your installed machine, what do you expect the {usedMetric === "squared" ? "mean squared" : "mean absolute"} error to do?</legend>
        <div className="mt-3 flex flex-wrap gap-2">{(["lower", "higher", "similar"] as const).map(value => <label key={value} className={`flex min-h-11 cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm ${attempt.expectation === value ? "border-accent-fill bg-accent-soft" : "border-line"}`}><input type="radio" name={`${id}-expectation`} checked={attempt.expectation === value} onChange={() => dispatch({ type: "expectation", expectation: value })}/>{value === "lower" ? "Decrease" : value === "higher" ? "Increase" : "Stay about the same"}</label>)}</div>
      </fieldset>
      <p className="mt-3 text-sm leading-6 text-muted">{scorer ? `Your tested error checker will calculate the batch scores in ${units}.` : `The built-in ${usedMetric === "squared" ? "squared" : "absolute"}-error calculation is in use. Test your own checker in Measure the mistakes to install it here.`}</p>
      <button type="button" className={`${primary} mt-5`} disabled={!attempt.decision || !attempt.expectation || !!machineError} onClick={run}>Fit and dispatch this batch</button>
      {runError && <p role="alert" className="mt-3 text-sm">{runError}</p>}
    </div>}

    {report && <div className="space-y-5" data-testid="campaign-report">
      <p className="sr-only" role="status">Batch dispatched. {scoreName}: {number(report.score)} {units}.</p>
      <div className={panel}>
        <h4 className="font-semibold">What happened to the promises?</h4>
        <p className="mt-2 text-sm leading-6 text-muted">Select an order to follow it back through your saved machine. These results use the connections and settings present when you dispatched this batch.</p>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[580px] text-left text-sm">
            <caption className="sr-only">Reserved delivery outcomes</caption>
            <thead><tr className="border-b border-line text-muted"><th scope="col" className="p-2">Order</th><th scope="col" className="p-2">Promise</th><th scope="col" className="p-2">Arrival</th><th scope="col" className="p-2">Customer experience</th><th scope="col" className="p-2">{usedMetric === "squared" ? "Squared" : "Absolute"} error</th></tr></thead>
            <tbody>{report.rows.map((record, index) => <tr key={record.id} className={`border-b border-line ${selectedOrder === index ? "bg-accent-soft" : ""}`}>
              <th scope="row" className="p-2 font-normal"><button className="min-h-11 text-left underline decoration-dotted underline-offset-4" type="button" aria-pressed={selectedOrder === index} onClick={() => setSelectedOrder(index)}>{record.id}<span className="block text-xs text-muted">{number(record.distance)} km{record.neighborhood ? ` · ${record.neighborhood}` : ""}</span></button></th>
              <td className="p-2 font-mono">{number(record.prediction)} min</td><td className="p-2 font-mono">{number(record.minutes)} min</td>
              <td className="p-2">{Math.abs(record.error) < .005 ? "Arrived as promised" : record.error < 0 ? `${number(-record.error)} min after the promise` : `${number(record.error)} min before the promise`}</td>
              <td className="p-2 font-mono">{number(record.contribution)} {units}</td>
            </tr>)}</tbody>
          </table>
        </div>
        <p className="mt-4 text-sm text-muted">{report.usedScorer ? "Your saved error checker calculated these scores." : "These scores use the built-in error calculation."} {scoreName}, measured in {units}.</p>
        <dl className="mt-3 flex flex-wrap gap-x-8 gap-y-3 text-sm"><div><dt className="text-muted">Installed machine, reserved batch</dt><dd className="mt-1 font-mono text-lg">{number(report.baselineScore)} {units}</dd></div><div><dt className="text-muted">Chosen correction, reserved batch</dt><dd className="mt-1 font-mono text-lg" data-testid="campaign-score">{number(report.score)} {units}</dd></div><div><dt className="text-muted">Chosen correction, fitting records</dt><dd className="mt-1 font-mono text-lg">{number(report.trainingScore)} {units}</dd></div></dl>
        {inspected && <details open className="mt-5 rounded-xl border border-line bg-background p-4">
          <summary className="cursor-pointer text-sm font-semibold">Follow {inspected.id} through the installed machine</summary>
          <ol className="mt-3 space-y-2 font-mono text-xs leading-6">{trace?.steps.map(step => <li key={step.id}>{step.id === "output" ? "Installed promise" : attempt.machine?.pieces.find(piece => piece.id === step.id)?.tool.startsWith("source:") ? "Distance input" : TOOLS[attempt.machine!.pieces.find(piece => piece.id === step.id)!.tool]?.title ?? step.id}: {step.inputs.length > 0 ? `${step.inputs.map(show).join(", ")} → ` : ""}{show(step.output)}</li>)}</ol>
          <div className="mt-3 overflow-x-auto border-t border-line pt-3 font-mono text-sm leading-7">installed promise: {number(inspected.baseline)} min<br/>fitted adjustment: {number(inspected.prediction - inspected.baseline)} min<br/>new promise: {number(inspected.baseline)} + ({number(inspected.prediction - inspected.baseline)}) ≈ {number(inspected.prediction)} min<br/>error: {number(inspected.prediction)} − {number(inspected.minutes)} ≈ {number(inspected.error)} min<br/>{usedMetric === "squared" ? <>squared error: ({number(inspected.error)})²</> : <>absolute error: |{number(inspected.error)}|</>} ≈ {number(inspected.contribution)} {units}</div>
          <p className="mt-2 text-xs leading-6 text-muted">Displayed values are rounded. The fit and scores use full precision.</p>
        </details>}
      </div>
      <BotieSays mood={report.supportedDecision ? "happy" : "curious"}>
        <p>{report.explanation}</p>
        <p className="mt-3">{correctExpectation === attempt.expectation ? "Your prediction about the score agrees with this batch." : `The ${scoreName.toLowerCase()} ${correctExpectation === "lower" ? "decreased" : correctExpectation === "higher" ? "increased" : "stayed about the same"} compared with your installed machine. Follow the individual orders to see where that difference came from.`}</p>
        <p className="mt-3 font-semibold">{report.supportedDecision ? report.skill : "This decision needs another look"}.{attempt.hints > 0 ? " You used Botie's hints on this attempt." : attempt.resultsAlreadySeen ? " You had already seen these records' outcomes." : " You made this attempt without hints."}</p>
      </BotieSays>
      <details className={panel}>
        <summary className="cursor-pointer font-semibold">{attempt.blockName || "Your fitted correction"}: inspect the block</summary>
        <label className="mt-4 block text-sm" htmlFor={`${id}-block-name`}>Name this correction<input id={`${id}-block-name`} className="mt-2 block min-h-11 w-full max-w-md rounded-lg border border-line bg-background px-3" maxLength={80} value={attempt.blockName} onChange={event => dispatch({ type: "name-block", name: event.target.value })}/></label>
        <p className="mt-3 text-sm leading-6 text-muted">This saved block describes the adjustment fitted for this batch. Its input meanings matter: a neighborhood adjustment needs a neighborhood, and a fit from before the diversion describes the earlier roads. Other missions fit their own corrections to your distance machine.</p>
        <pre className="mt-3 overflow-x-auto rounded-lg bg-background p-3 text-sm leading-7">{report.correction ? `adjustment ≈ ${number(report.correction[0])}\n           + (${number(report.correction[1])} × distance)${report.correction.length > 2 ? `\n           + (${number(report.correction[2])} × ${attempt.decision === "neighborhood" ? "is_Hilltop" : "distance²"})` : ""}\nnew promise = installed promise + adjustment` : "A polynomial interpolates the fitting residual at each completed distance.\nnew promise = installed promise + interpolated residual"}</pre>
        {attempt.decision === "neighborhood" && <p className="mt-2 text-sm text-muted">is_Hilltop is 1 for Hilltop and 0 for Riverside.</p>}
        {attempt.scorer && <details className="mt-4 border-t border-line pt-3"><summary className="cursor-pointer text-sm font-semibold">Follow the batch through your saved error checker</summary><ol className="mt-3 space-y-2 font-mono text-xs leading-6">{evaluate(attempt.scorer, { predicted: report.rows.map(record => record.prediction), actual: report.rows.map(record => record.minutes) }, TOOLS).steps.map(step => {
          const tool = attempt.scorer!.pieces.find(piece => piece.id === step.id)!.tool;
          const name = tool === "output" ? "Batch score" : tool === "source:predicted" ? "Promised times" : tool === "source:actual" ? "Actual arrivals" : TOOLS[tool]?.title ?? "Calculation";
          return <li className="overflow-x-auto" key={step.id}>{name}: {step.inputs.length ? `${step.inputs.map(show).join(", ")} → ` : ""}{show(step.output)}</li>;
        })}</ol></details>}
      </details>
      <div className="flex flex-wrap gap-3"><button className={button} type="button" onClick={() => setCompare(value => !value)}>{compare ? "Hide alternative fits" : "Compare the other choices now"}</button><button className={button} type="button" onClick={() => dispatch({ type: "retry", fresh: false })}>Try another decision on these records</button><button className={primary} type="button" onClick={() => dispatch({ type: "retry", fresh: true })}>Try a fresh batch without the earlier answers</button></div>
      {compare && attempt.machine && <div className={panel}>
        <h4 className="font-semibold">Each choice checked against the same reserved orders</h4>
        <p className="mt-2 text-sm leading-6 text-muted">These outcomes are now visible, so another decision on this batch is exploration. For the record investigations, compare the source evidence too. A lower error does not establish that a measurement was false.</p>
        <ul className="mt-3 space-y-3">{scenario.choices.map(choice => {
          const result = runCampaign(scenario, choice.id, attempt.machine!, attempt.evidenceOpened, report.metric, attempt.scorer ?? undefined);
          return <li className="flex flex-wrap justify-between gap-3 border-t border-line pt-3 text-sm" key={choice.id}><span>{choice.label}</span><span className="font-mono">{number(result.score)} {units}</span></li>;
        })}</ul>
      </div>}
    </div>}
  </div>;
}

function RecordTable({ rows, caption }: { rows: CampaignRow[]; caption: string }) {
  const hasNeighborhood = rows.some(record => record.neighborhood);
  return <div className="overflow-x-auto"><table className="w-full text-left text-sm">
    <caption className="mb-3 text-left font-semibold">{caption}</caption>
    <thead><tr className="border-b border-line text-muted"><th className="py-2 pr-3" scope="col">Trip</th><th className="p-2" scope="col">Distance</th>{hasNeighborhood && <th className="p-2" scope="col">Neighborhood</th>}<th className="py-2 pl-3" scope="col">Duration</th></tr></thead>
    <tbody>{rows.map(record => <tr className="border-b border-line" key={record.id}><th className="py-2 pr-3 font-normal" scope="row">{record.id}</th><td className="p-2 font-mono whitespace-nowrap">{number(record.distance)} km</td>{hasNeighborhood && <td className="p-2">{record.neighborhood}</td>}<td className="py-2 pl-3 font-mono whitespace-nowrap">{number(record.minutes)} min</td></tr>)}</tbody>
  </table></div>;
}
