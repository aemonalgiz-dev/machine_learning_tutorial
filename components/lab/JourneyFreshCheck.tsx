"use client";

import { useState } from "react";
import { BotieSays } from "@/components/site/Botie";
import { fingerprint, useLearnerRecord } from "@/lib/learner-state";
import { useJourneyProgress } from "@/lib/journey-progress";
import { same, type Build, type Construction, type Trace } from "@/lib/builds/engine";
import { freshJourneyBuild, type FreshJourneyCase } from "@/lib/builds/journey-fresh";
import { readPrediction } from "@/lib/builds/challenges";
import { testConstruction } from "@/lib/builds/workshop-session";
import { TOOLS } from "@/lib/builds/tools";
import { diagnosticPieceName } from "@/lib/builds/journey-diagnostics";
import { BuildWorkshop } from "./BuildWorkshop";
import { WorkshopValue } from "./WorkshopValue";

const button = "min-h-11 rounded-lg border border-line bg-raised px-4 py-2 text-sm font-semibold disabled:opacity-50";
export function JourneyFreshCheck({ build, fresh, graph, supported, title, href }: {
  build: Build; fresh: FreshJourneyCase; graph: Construction | null; supported: boolean; title: string; href: string;
}) {
  const version = fingerprint(fresh);
  const saved = useLearnerRecord(`journey-fresh:${build.id}:${version}`, {
    prediction: "", committedPrediction: "", opened: false, firstPassed: false,
    firstPredictionCorrect: false, latestPassed: false, firstSupported: false, seed: null as Construction | null,
    firstRun: null as { trace: Trace; outcomes: boolean[] } | null,
  });
  const state = saved.value;
  const [error, setError] = useState("");
  const progress = useJourneyProgress(build.id, title, href);
  const checkBuild = freshJourneyBuild(build, fresh);
  return <section className="space-y-4" data-testid="journey-fresh-case" aria-label={fresh.name}>
    {!state.opened ? <>
      <BotieSays>{fresh.prompt}</BotieSays>
      <dl className="space-y-4 rounded-xl border border-line bg-background p-4">{Object.entries(fresh.data).map(([key, value]) => <div key={key} className="min-w-0"><dt className="mb-2 text-sm font-semibold">{build.sources[key]}</dt><dd><WorkshopValue value={value}/></dd></div>)}</dl>
      <label className="block text-sm font-semibold">What result should your machine produce for this case?<textarea className="mt-2 block min-h-24 w-full rounded-lg border border-line bg-background p-3 font-mono text-sm" value={state.prediction} onChange={event => saved.setters.prediction(event.target.value)}/></label>
      <p className="text-xs leading-6 text-muted">Use a number, text, or an array matching the requested result. For a matrix, put each row in brackets. Saving your prediction runs your current construction on these inputs and checks the earlier examples too.</p>
      {!graph && <p className="text-sm text-muted">Build a construction in the workspace above first. This case will test those pieces.</p>}
      {error && <p role="alert" className="text-sm text-accent">{error}</p>}
      <button className={button} disabled={!graph} onClick={() => {
        const parsed = readPrediction(state.prediction, fresh.expected);
        if (parsed.error) { setError(parsed.error); return; }
        if (!graph) return;
        const checked = testConstruction(checkBuild, graph, TOOLS, { usedHints: supported, usedSolution: false });
        const predictionCorrect = same(parsed.value, fresh.expected);
        saved.set(previous => ({ ...previous, committedPrediction: previous.prediction, opened: true,
          seed: structuredClone(graph), firstPassed: checked.outcome.passed, latestPassed: checked.outcome.passed,
          firstPredictionCorrect: predictionCorrect, firstSupported: supported,
          firstRun: { trace: structuredClone(checked.traces[0]), outcomes: [...checked.outcomes] } }));
        if (checked.outcome.passed && predictionCorrect) progress.markTransferred(supported, `fresh:${build.id}:${version}`);
        else progress.markExplored();
        setError("");
      }}>Save my prediction and test the next case</button>
    </> : <>
      <BotieSays mood={state.latestPassed ? "happy" : "curious"}>
        {!state.firstPassed && state.latestPassed ? "The repair passes this case and the earlier checks. Your first run is saved below."
          : state.latestPassed ? "Your construction handled the new inputs and still passed the earlier checks."
          : "Follow the values through your pieces, make the change you want to try, then test the examples again."}
        {state.firstPassed && (state.firstPredictionCorrect ? " Your prediction also agreed with the required result." : " Your first prediction differed from the result. You can compare them below.")}
      </BotieSays>
      <details className="rounded-xl border border-line p-4" open={!state.firstPassed}><summary className="cursor-pointer font-semibold">Inspect or repair this construction</summary><div className="mt-4">
        <BuildWorkshop compact continuation embeddedBrief build={checkBuild} recordId={`fresh-${build.id}-${version}`} initialGraph={state.seed ?? undefined} initialSupported={state.firstSupported}
          openingCoach="The floor keeps the pieces we just tested. Inspect or repair them, then check the examples together."
          onActivity={() => saved.setters.latestPassed(false)}
          onOutcome={outcome => {
            saved.setters.latestPassed(outcome.passed);
            progress.markExplored();
          }}/>
      </div></details>
      <details className="rounded-xl border border-line p-4" data-testid="journey-fresh-evidence">
        <summary className="cursor-pointer text-sm font-semibold">First prediction, inputs and run</summary>
        <div className="mt-4 space-y-4" data-testid="journey-fresh-first-result">
        <p className="text-sm leading-7">{fresh.prompt}</p>
        <details className="rounded-lg border border-line p-3"><summary className="cursor-pointer text-sm font-semibold">Inputs for this case</summary><dl className="mt-4 space-y-4">{Object.entries(fresh.data).map(([key, value]) => <div key={key} className="min-w-0"><dt className="mb-2 text-sm font-semibold">{build.sources[key]}</dt><dd><WorkshopValue value={value}/></dd></div>)}</dl></details>
        <div><p className="text-xs text-muted">Your prediction before testing</p><pre className="mt-2 overflow-x-auto whitespace-pre-wrap text-sm">{state.committedPrediction}</pre></div>
        <div><p className="mb-2 text-xs text-muted">Your construction produced</p>{state.firstRun?.trace.error ? <p className="text-sm">{state.firstRun.trace.error.message}</p> : state.firstRun ? <WorkshopValue value={state.firstRun.trace.output!}/> : <p className="text-sm text-muted">This older attempt did not save its calculation trace.</p>}</div>
        <div><p className="mb-2 text-xs text-muted">Required result</p><WorkshopValue value={fresh.expected}/></div>
        {state.firstRun && <p className="text-sm">{state.firstRun.outcomes.filter(Boolean).length} of {state.firstRun.outcomes.length} checks passed on that first run.</p>}
        <p className="text-sm leading-7 text-muted">{state.firstPredictionCorrect ? "Your first prediction agreed with the required result." : "Your first prediction differed from the required result. Compare your reasoning with the saved calculation."} {state.firstSupported && "Earlier guidance is recorded with this attempt."}</p>
        <p className="text-sm leading-7 text-muted">{fresh.why}</p>
        <p className="text-xs leading-6 text-muted">These results are now known. Later tests record practice on this case and leave your original prediction and first run unchanged.</p>
        {state.firstRun && state.seed && <details><summary className="cursor-pointer text-sm font-semibold">Trace from the first run</summary><ol className="mt-3 max-h-80 space-y-3 overflow-auto">{state.firstRun.trace.steps.map(step => <li key={step.id} className="rounded-lg border border-line p-3"><p className="mb-2 text-sm font-semibold">{diagnosticPieceName(state.seed!, step.id, build)}</p><WorkshopValue value={step.output}/></li>)}</ol></details>}
        </div>
      </details>
    </>}
  </section>;
}
