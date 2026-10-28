"use client";

import Link from "next/link";
import { useAccount } from "@/lib/accounts";
import { useRecentJourney, journeyStatus } from "@/lib/journey-progress";
import { lessonLocations } from "@/lib/course-navigation";
import { useLearningMap, workshopHref } from "@/lib/learning-map";
import { Botie } from "./Botie";

export function LearningDashboard() {
  const savedJourney = useRecentJourney();
  const account = useAccount();
  const { milestones } = useLearningMap();
  const waiting = account.status === "checking" || (account.user && !account.learnerStateReady && !savedJourney);
  const recent = waiting ? null : savedJourney;
  const lesson = recent && Object.keys(lessonLocations).find(href => workshopHref(href) === recent.href);
  const state = lesson ? milestones(lesson) : recent ? { explored: Boolean(recent.record.exploredAt), built: Boolean(recent.record.built), varied: Boolean(recent.record.transferred), exercises: false } : null;
  const next = lesson && state?.built && state.varied && state.exercises ? lessonLocations[lesson].next : null;
  const status = recent && journeyStatus(recent.record);
  return <section className="learning-dashboard" aria-label="Your journey with Botie">
    <div className="dashboard-art" aria-hidden="true">
      <span className="orbit orbit-one" /><span className="orbit orbit-two" />
      <span className="diagram-label">BOTIE / THE WORKBENCH</span>
      <Botie size={150} decorative mood={state?.built ? "happy" : "ready"} />
      <span className="botie-platform" />
      <div className="workbench-pieces"><span>data</span><i>→</i><span>model</span><i>→</i><span>test</span></div>
    </div>
    <div className="dashboard-content">
      <p className="game-eyebrow">{recent ? "Your workbench" : "Machine learning, built by you"}</p>
      <h2 className="mt-3 text-3xl font-bold leading-tight tracking-tight sm:text-4xl">{waiting ? "Opening your workbench…" : recent ? "Continue with Botie" : "What can you build with a few pieces?"}</h2>
      {!waiting && <>
        <p className="mt-4 max-w-xl leading-7 text-muted">{recent ? recent.title : "Connect them, run some data through, and see what happens. Botie will help you work out why it works, and what to change when it doesn't."}</p>
        {recent?.stage && recent.stage !== recent.title && <p className="mt-2 text-sm text-foreground">{recent.stage}</p>}
        <div className="mt-6 flex flex-wrap items-center gap-4">
          <Link className="game-button game-button-primary" href={next ? workshopHref(next.href) : recent?.href ?? "/lab/workshop-guide"}>{next ? "Next workshop" : recent ? "Return to your workshop" : "Build your first machine"} <span aria-hidden="true">→</span></Link>
          <Link href={recent ? "/lab/workshop-guide" : "#course"} className="text-sm text-muted hover:text-foreground hover:underline">{recent ? "Workshop controls guide" : "Choose a learning path"}</Link>
        </div>
        {next && <p className="mt-3 text-sm text-accent">Up next: {next.title}</p>}
      </>}
    </div>
    <div className="dashboard-milestones">
      {state ? <>
        <ol aria-label="Current lesson milestones" className="milestone-road">
          {([["explored", "Idea explored"], ["built", "Machine tested"], ["varied", "Changed inputs"], ["exercises", "Exercises completed"]] as const).map(([key, label], index) => <li key={key} data-earned={state[key]}><span className="milestone-seal" aria-hidden="true">{state[key] ? "✓" : index + 1}</span><span>{label}<span className="sr-only">{state[key] ? ": completed" : ": not completed"}</span></span></li>)}
        </ol>
        {status && <p className="mt-4 text-xs text-muted">{status.label}. Each mark records work you have tested or explored.</p>}
      </> : <p className="text-sm leading-6 text-muted"><span className="text-accent">Your first stop:</span> connect a working machine. Then change its inputs and work out what the result tells you. All lessons and workshops are free.</p>}
    </div>
  </section>;
}
