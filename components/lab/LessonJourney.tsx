"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { fingerprint, useLearnerRecord } from "@/lib/learner-state";
import { useJourneyProgress } from "@/lib/journey-progress";
import { BotieSays } from "@/components/site/Botie";
import { BuildWorkshop, type WorkshopOutcome } from "./BuildWorkshop";
import { WorkshopValue } from "./WorkshopValue";
import { same, type Construction } from "@/lib/builds/engine";
import { readPrediction } from "@/lib/builds/challenges";
import type { JourneyData } from "@/lib/builds/journey";
import { JourneyHistory, JourneyTools } from "./JourneyReference";
import { constructionVersion, JourneyContinuity, journeyDraftId, journeyPathKey, useEarlierWork } from "./JourneyContinuity";
import { earlierJourneyBuilds } from "@/lib/builds/journey-legacy";
import { freshStageAttempt, recordStageAssistance, stageAssistance, type JourneyAssistance } from "@/lib/builds/journey-attempts";
import { JourneyEvidenceHistory } from "./JourneyEvidenceHistory";
import { JourneyDiagnostic } from "./JourneyDiagnostic";
import { JourneyFreshCheck } from "./JourneyFreshCheck";
import { validConstructionForBuild, workshopRecordKey } from "@/lib/builds/workshop-session";
import { TOOLS } from "@/lib/builds/tools";

const button = "inline-flex min-h-11 items-center justify-center rounded-lg border border-line bg-raised px-4 py-2 text-sm font-semibold hover:border-accent-fill disabled:opacity-50";
const primary = `${button} !border-accent-fill !bg-accent-fill text-accent-ink`;
type Stage = "preparation" | "construction" | "investigation";
interface JourneyState extends JourneyAssistance {
  stage: Stage;
  preparationGraph: Construction | null;
  graph: Construction | null;
  prepared: boolean;
  built: boolean;
  varied: boolean;
  explanation: string;
  diagnosticAttempt?: string;
}
interface CurrentDraft { graph: Construction | null; example?: boolean; hintsShown?: number; carriedSupport?: boolean }
function draftSupport(draft: CurrentDraft, inherited: boolean, ownAttempt?: boolean) {
  return Boolean(draft.example || draft.hintsShown || draft.carriedSupport || ownAttempt) ||
    (draft.carriedSupport === undefined && inherited);
}

export function LessonJourney({ data }: { data: JourneyData }) {
  const { build, challenges } = data;
  const plan = data.plan!;
  const { preparation, construction, variation } = challenges;
  const building: Stage[] = preparation ? ["preparation", "construction"] : ["construction"];
  const stages: Stage[] = plan.order === "investigate-first" ? ["investigation", ...building] : [...building, "investigation"];
  const titles: Record<Stage, string> = { preparation: preparation?.build.title ?? "", construction: plan.construction.title, investigation: plan.investigation.title };
  const saved = useLearnerRecord<JourneyState>(journeyPathKey(build), {
    stage: stages[0], preparationGraph: null as Construction | null, graph: null as Construction | null,
    prepared: false, built: false, varied: false, supported: false, explanation: "",
  }, raw => !!raw && stages.includes((raw as { stage: Stage }).stage));
  const decision = useLearnerRecord(`journey-question:${build.id}:${fingerprint(plan.investigation)}`, {
    prediction: "", committedPrediction: "", choice: -1, committedChoice: -1, revealed: false, explored: false,
  }, raw => {
    const value = raw as { choice: number; committedChoice: number };
    return !!value && [value.choice, value.committedChoice].every(choice => Number.isInteger(choice) && choice >= -1 && choice < (plan.investigation.options?.length ?? 1));
  });
  const state = saved.value, answer = decision.value;
  const currentConstruction = useLearnerRecord<CurrentDraft>(workshopRecordKey(construction, journeyDraftId(build, "construction", plan.investigation.caseIndex)),
    { graph: null as Construction | null }, raw => {
      const value = raw as { graph?: Construction | null };
      return !!value && (value.graph === null || validConstructionForBuild(value.graph, build, TOOLS));
    }).value;
  const currentVariation = useLearnerRecord<CurrentDraft>(workshopRecordKey(variation.build, journeyDraftId(build, "variation", plan.investigation.caseIndex)),
    { graph: null }, raw => {
      const value = raw as CurrentDraft;
      return !!value && (value.graph === null || validConstructionForBuild(value.graph, build, TOOLS));
    }).value;
  const saveJourney = saved.set;
  const markAssisted = useCallback((part: Stage) => saveJourney(previous => recordStageAssistance(previous, part, true)), [saveJourney]);
  const legacy = useLearnerRecord(`journey-flow:${build.id}:${constructionVersion(build)}`, { graph: null as Construction | null, supported: false, explanation: "" }).value;
  const progress = useJourneyProgress(build.id, plan.construction.title, build.id === "neurons-and-activations" ? "/lab/neuron" : `/lab/${build.id}`);
  const firstWork = useEarlierWork(data.connections[0]), secondWork = useEarlierWork(data.connections[1]);
  const reusable = [firstWork.reusable, secondWork.reusable].filter(item => item !== undefined);
  const [reference, setReference] = useState<"history" | "tools" | "previous" | null>(null);
  const [notesOpen, setNotesOpen] = useState(false);
  const [predictionError, setPredictionError] = useState("");
  function go(stage: Stage) {
    saved.set(previous => ({ ...previous, stage }));
    progress.touch(titles[stage]);
    setReference(null);
  }
  function recordOutcome(outcome: WorkshopOutcome, part: Stage) {
    const draft = part === "investigation" ? currentVariation : part === "construction" ? currentConstruction : { graph: state.preparationGraph };
    const supported = draftSupport(draft, stageAssistance(state, part, legacy.supported), state.attemptSupport?.[part]?.supported) || outcome.usedSolution || outcome.usedHints;
    saved.set(previous => ({ ...recordStageAssistance(previous, part, supported, outcome.attemptId),
      ...(part === "preparation" ? { prepared: outcome.passed, preparationGraph: outcome.graph }
        : part === "construction" ? { built: outcome.passed, graph: outcome.graph } : { varied: outcome.passed }),
    }));
    if (part === "preparation") progress.markExplored();
    if (!outcome.passed) return;
    if (part === "construction") progress.markBuilt(supported, outcome.attemptId);
    if (part === "investigation") progress.markTransferred(supported || answer.explored, outcome.attemptId);
  }
  function freshAttempt(part: Stage, attemptId: string) {
    saved.set(previous => ({ ...freshStageAttempt(previous, part, attemptId),
      ...(part === "preparation" ? { prepared: false, preparationGraph: null }
        : part === "construction" ? { built: false, graph: null } : { varied: false, diagnosticAttempt: attemptId }),
    }));
    if (part === "investigation") decision.set({ prediction: "", committedPrediction: "", choice: -1, committedChoice: -1, revealed: false, explored: false });
    progress.touch(titles[part]);
  }
  function activity(part: "prepared" | "built" | "varied") {
    saved.set(previous => ({ ...previous, [part]: false }));
    progress.touch(titles[state.stage]);
  }
  function reveal(explored = false) {
    if (!explored && plan.investigation.kind === "predict") {
      const prediction = readPrediction(answer.prediction, variation.build.cases[0].expected);
      if (prediction.error) { setPredictionError(prediction.error); return; }
    } else if (!explored && answer.choice < 0) { setPredictionError("Choose the explanation you want to investigate first."); return; }
    decision.set(previous => ({ ...previous, revealed: true, committedChoice: previous.choice, committedPrediction: previous.prediction, explored }));
    if (explored) markAssisted("investigation");
    progress.touch(titles.investigation);
    setPredictionError("");
  }
  const recordId = (part: string) => journeyDraftId(build, part, plan.investigation.caseIndex);
  const selected = plan.investigation.options?.[answer.committedChoice];
  const orderedOptions = (plan.investigation.options ?? []).map((option, index) => ({ option, index,
    position: parseInt(fingerprint({ lesson: build.id, option: option.label }), 16),
  })).sort((a, b) => a.position - b.position);
  const next = stages[stages.indexOf(state.stage) + 1];
  const freshPart = state.stage === "investigation" && currentVariation.graph ? "investigation" : "construction";
  const freshDraft = freshPart === "investigation" ? currentVariation : currentConstruction;
  const freshSupported = draftSupport(freshDraft, stageAssistance(state, freshPart, legacy.supported), state.attemptSupport?.[freshPart]?.supported);
  const constructionSupported = draftSupport(currentConstruction, stageAssistance(state, "construction", legacy.supported), state.attemptSupport?.construction?.supported);
  return <div data-testid="workshop-journey" className="min-w-0">
    <div className="mb-5 flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-b border-line">
      <nav aria-label="Journey stages" className="flex min-w-0 flex-1 flex-wrap gap-x-4">
        {stages.map(stage => <button key={stage} className={`min-h-11 max-w-full border-b-2 px-1 py-3 text-left text-sm ${state.stage === stage ? "border-accent-fill font-semibold text-accent" : "border-transparent text-muted hover:text-foreground"}`} aria-current={state.stage === stage ? "step" : undefined} onClick={() => go(stage)}>{titles[stage]}</button>)}
      </nav>
      <button className="min-h-11 py-2 text-sm text-muted hover:text-foreground" aria-expanded={notesOpen} onClick={() => setNotesOpen(!notesOpen)}>Lesson notes and saved work {notesOpen ? "−" : "+"}</button>
    </div>
    <aside hidden={!notesOpen} aria-label="Lesson notes and saved work" className="mb-5 rounded-xl border border-line bg-surface p-4">
    <div className="mb-3 flex flex-wrap gap-x-5 gap-y-2 text-sm">
      <button className="min-h-11 text-accent underline underline-offset-4" aria-expanded={reference === "history"} onClick={() => { setReference(reference === "history" ? null : "history"); progress.markExplored(); }}>{data.history.title}</button>
      <button className="min-h-11 text-accent underline underline-offset-4" aria-expanded={reference === "tools"} onClick={() => { setReference(reference === "tools" ? null : "tools"); progress.markExplored(); }}>Look inside the tools</button>
      <a href={data.lesson.href} className="min-h-11 content-center text-muted underline underline-offset-4">Full lesson and mathematics</a>
      <Link href="/lab/workshop-guide" className="min-h-11 content-center text-muted underline underline-offset-4">Learn the workshop controls</Link>
    </div>
    {reference === "history" && <JourneyHistory data={data} />}
    {reference === "tools" && <JourneyTools data={data} />}
    <JourneyContinuity work={[firstWork, secondWork]} />
    <JourneyEvidenceHistory record={progress.record} />
    {legacy.graph && <p className="text-sm leading-7 text-muted">Your earlier construction can start a new draft. Any newer draft keeps its own pieces.</p>}
    </aside>

    {reference !== "previous" && <>
    {preparation && state.stage === "preparation" && <>
      <BuildWorkshop compact build={preparation.build} onAssistance={() => markAssisted("preparation")} onFreshAttempt={id => freshAttempt("preparation", id)} recordId={recordId(`preparation-${fingerprint(preparation.build.recipe)}`)} openingCoach={preparation.build.challenge} onOutcome={outcome => recordOutcome(outcome, "preparation")} onActivity={() => activity("prepared")} briefing={<details className="mt-3 rounded-xl border border-line bg-surface p-3"><summary className="cursor-pointer text-sm font-semibold">Inspect the component calculation</summary><pre className="mt-3 max-h-48 overflow-auto whitespace-pre-wrap break-words rounded-lg bg-background p-3 font-mono text-sm leading-6">{preparation.calculation}</pre></details>} />
      <p className="mt-5 text-sm leading-7 text-muted">Your last tested pieces can start the full construction. An existing draft there keeps its own pieces.</p>
    </>}

    {state.stage === "construction" && <>
      <BuildWorkshop compact build={construction} onAssistance={() => markAssisted("construction")} onFreshAttempt={id => freshAttempt("construction", id)} recordId={recordId("construction")} openingCoach={plan.construction.start} initialGraph={state.preparationGraph ?? legacy.graph ?? undefined} initialSupported={state.preparationGraph ? stageAssistance(state, "preparation", legacy.supported) : legacy.supported} reusable={reusable} onReuse={supported => { if (supported) markAssisted("construction"); }} onOutcome={outcome => recordOutcome(outcome, "construction")} onActivity={() => activity("built")} />
    </>}

    {state.stage === "investigation" && <section aria-labelledby={`investigation-${build.id}`} data-investigation-kind={plan.investigation.kind}>
      <h3 id={`investigation-${build.id}`} className="text-xl font-semibold">{plan.investigation.title}</h3>
      {plan.order === "investigate-first" && <p className="mt-3 max-w-3xl text-sm leading-7 text-muted">{plan.premise}</p>}
      <div className="my-5"><BotieSays>{plan.investigation.question}</BotieSays></div>
      <details className="mb-5 space-y-4 rounded-xl border border-line bg-surface p-4" aria-label="Data for the investigation" open={!answer.revealed}>
        <summary className="cursor-pointer text-sm font-semibold">The inputs we are comparing</summary>
        {Object.keys(build.sources).map(key => <div key={key}><h4 className="mb-2 text-sm font-semibold">{build.sources[key]}</h4>{variation.changedSources.includes(key) ? <div className="grid min-w-0 gap-3 sm:grid-cols-2"><div className="min-w-0"><p className="mb-2 text-xs text-muted">{variation.previous.name}</p><WorkshopValue value={variation.previous.data[key]} /></div><div className="min-w-0"><p className="mb-2 text-xs text-accent">{variation.build.cases[0].name}</p><WorkshopValue value={variation.build.cases[0].data[key]} /></div></div> : <><p className="mb-2 text-xs text-muted">Same in both cases</p><WorkshopValue value={variation.build.cases[0].data[key]} /></>}</div>)}
        <details><summary className="cursor-pointer text-sm">Result for {variation.previous.name.toLowerCase()}</summary><div className="mt-3"><WorkshopValue value={variation.previous.expected} /></div></details>
      </details>
      {!answer.revealed ? <div className="mb-6 rounded-xl border border-line p-5">
        {plan.investigation.kind === "predict" ? <>
          <label className="block text-sm font-semibold" htmlFor={`prediction-${build.id}`}>{plan.investigation.predictionLabel ?? plan.investigation.question}</label>
          <textarea id={`prediction-${build.id}`} className="mt-3 min-h-24 w-full rounded-lg border border-line bg-background p-3 font-mono text-sm" value={answer.prediction} onChange={event => decision.set(previous => ({ ...previous, prediction: event.target.value }))} />
          <p className="mt-2 text-xs leading-6 text-muted">For a list use brackets, such as [2, 4]. For a matrix put each row in brackets. Text answers can stay as text.</p>
        </> : <fieldset><legend className="mb-3 text-sm font-semibold">Choose an explanation to test</legend><div className="space-y-3">{orderedOptions.map(({ option, index }) => <label key={option.label} className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 text-sm leading-7 ${answer.choice === index ? "border-accent-fill bg-accent-soft" : "border-line bg-surface"}`}><input className="mt-2 shrink-0" type="radio" name={`investigation-${build.id}`} checked={answer.choice === index} onChange={() => decision.set(previous => ({ ...previous, choice: index }))} />{option.label}</label>)}</div></fieldset>}
        {predictionError && <p role="alert" className="mt-2 text-sm text-accent">{predictionError}</p>}
        <div className="mt-3 flex flex-wrap gap-3"><button className={primary} onClick={() => reveal()}>{plan.investigation.kind === "predict" ? "Save my prediction and try it" : "Investigate my choice"}</button><button className={button} onClick={() => reveal(true)}>Explore with Botie</button></div>
      </div> : <>
        <details className="mb-5 rounded-xl border border-line bg-surface p-4"><summary className="cursor-pointer text-sm">Your starting explanation</summary>
          <p className="mt-3 text-xs text-muted">{plan.investigation.kind === "predict" ? "Your prediction before opening this case" : "Your starting explanation"}</p>
          <p className="whitespace-pre-wrap break-words text-sm">{answer.explored ? "You chose to explore this case with Botie." : selected?.label ?? answer.committedPrediction}</p>
          <button className="min-h-11 text-sm text-accent underline" onClick={() => decision.set(previous => ({ ...previous, revealed: false }))}>Reconsider my explanation</button>
        </details>
        {plan.order === "investigate-first" && !state.built && <p className="mb-4 text-sm leading-7 text-muted">You can test that reasoning by building here, or start with <button className="text-accent underline" onClick={() => go(building[0])}>{titles[building[0]]}</button>. Your two drafts are saved separately.</p>}
        <JourneyDiagnostic data={data} graph={currentConstruction.graph ?? state.graph ?? legacy.graph} recordKey={`journey-diagnosis:${build.id}:${fingerprint(plan.investigation)}:${state.diagnosticAttempt ?? "first"}`} onAssistance={() => markAssisted("investigation")}>
        <BuildWorkshop compact embeddedBrief continuation withholdExpectedUntilTest build={variation.build} onAssistance={() => markAssisted("investigation")} onFreshAttempt={id => freshAttempt("investigation", id)} recordId={recordId("variation")} openingCoach={plan.investigation.question} initialGraph={currentConstruction.graph ?? state.graph ?? undefined} initialSupported={constructionSupported} reusable={reusable} onReuse={supported => { if (supported) markAssisted("investigation"); }} onOutcome={outcome => recordOutcome(outcome, "investigation")} onActivity={() => activity("varied")} />
        {state.varied && <div className="mt-5"><BotieSays mood="happy">{selected&&!answer.explored&&`${selected.feedback} `}{plan.investigation.kind === "predict" && !answer.explored && (same(readPrediction(answer.committedPrediction, variation.build.cases[0].expected).value, variation.build.cases[0].expected) ? "Your prediction agrees with the tested result. " : "Compare your prediction with the tested result, then inspect where they first differ. ")}{plan.investigation.outcome}</BotieSays></div>}
        </JourneyDiagnostic>
      </>}
    </section>}
    {next && <button className={`${primary} mt-6`} onClick={() => go(next)}>{titles[next]} →</button>}

    {data.fresh && <details className="mt-7 rounded-xl border border-line bg-surface p-5" open={state.varied}>
      <summary className="cursor-pointer font-semibold">{data.fresh.name}</summary>
      <div className="mt-5"><p className="mb-4 text-sm text-muted">This check uses the pieces from “{titles[freshPart]}”.</p><JourneyFreshCheck build={build} fresh={data.fresh} graph={freshDraft.graph ?? state.graph ?? legacy.graph} supported={freshSupported} title={plan.construction.title} href={build.id === "neurons-and-activations" ? "/lab/neuron" : `/lab/${build.id}`} /></div>
    </details>}

    <details className="mt-7 rounded-xl border border-line bg-surface p-5">
      <summary className="cursor-pointer font-semibold">{plan.reflection.prompt}</summary>
      <label htmlFor={`explanation-${build.id}`} className="mt-4 block text-sm text-muted">Your notes for later. These stay with this journey.</label>
      <textarea id={`explanation-${build.id}`} className="mt-3 min-h-32 w-full rounded-lg border border-line bg-background p-4 text-sm leading-7" value={state.explanation} onChange={event => saved.set(previous => ({ ...previous, explanation: event.target.value }))} />
      <p className="mt-4 text-sm leading-7">{plan.reflection.carryForward}</p>
      <p className="mt-3 text-sm leading-7 text-muted">{build.limitation}</p>
      <a href={`${data.lesson.href}#practice`} className={`${primary} mt-5`}>Work through the {data.lesson.section === "SQL" ? "SQL" : "Python"} challenges →</a>
    </details>
    {data.next && <a href={data.next.href} className="mt-6 block rounded-xl border border-line bg-surface p-5 hover:border-accent-fill"><span className="text-xs text-muted">Continue the course</span><span className="mt-2 block font-semibold text-accent">{data.next.title} →</span></a>}
    </>}
    <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-line pt-5 text-xs">
      <Link href={data.previous?.href ?? "/lab"} className="min-h-11 content-center text-muted hover:text-foreground">← {data.previous?.title ?? "The journey map"}</Link>
      <button className="min-h-11 text-accent underline underline-offset-4" aria-expanded={reference === "previous"} onClick={() => setReference(reference === "previous" ? null : "previous")}>Full workspace and earlier draft</button>
    </div>
    {reference === "previous" && <div className="mt-5"><p className="mb-5 text-sm leading-7 text-muted">This is the original workshop with all its examples. Your earlier saved construction remains here.</p>{legacy.explanation && <blockquote className="mb-5 border-l-2 border-accent-fill pl-4 text-sm leading-7"><span className="block text-xs text-muted">Your note from the earlier journey</span>{legacy.explanation}</blockquote>}<BuildWorkshop build={build} onFreshAttempt={() => progress.touch("Full workspace")} onOutcome={outcome => { if (outcome.passed) progress.markBuilt(outcome.usedHints || outcome.usedSolution, outcome.attemptId); }} /><EarlierStagedDraft data={data} /></div>}
  </div>;
}

function EarlierStagedDraft({ data }: { data: JourneyData }) {
  const [open, setOpen] = useState(false);
  const [part, setPart] = useState<Stage>("construction");
  const earlier = earlierJourneyBuilds(data.build);
  const shown = part === "investigation" ? earlier.variation : part === "preparation" ? earlier.preparation! : earlier.construction;
  return <div className="mt-6 rounded-xl border border-line p-4"><button className={button} onClick={() => setOpen(!open)} aria-expanded={open}>Staged drafts from the earlier journey</button>{open && <><p className="my-4 text-sm text-muted">These drafts use the earlier sequence and examples. Their saved pieces remain separate.</p><div className="mb-4 flex flex-wrap gap-3">{([...(earlier.preparation ? ["preparation"] : []), "construction", "investigation"] as Stage[]).map(stage => <button key={stage} className={button} aria-pressed={part === stage} onClick={() => setPart(stage)}>{stage === "preparation" ? "Earlier component" : stage === "construction" ? "Earlier full construction" : "Earlier changed case"}</button>)}</div><BuildWorkshop compact build={shown} recordId={`journey-${data.build.id}-${constructionVersion(data.build)}-${part === "investigation" ? "variation" : part}`} /></>}</div>;
}
