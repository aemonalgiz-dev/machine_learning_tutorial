"use client";

import Link from "next/link";
import { useState } from "react";
import { useLearnerField, useLearnerRecord } from "@/lib/learner-state";
import { useProgressAccount } from "@/lib/progress";
import { useJourneyProgress } from "@/lib/journey-progress";
import type { Build, Construction } from "@/lib/builds/engine";
import { connectionIntroduction, firstConnectionGraph, independentIntroduction } from "@/lib/builds/onboarding";
import { BuildWorkshop } from "./BuildWorkshop";
import { CalibrationShift } from "./CalibrationShift";

const stages = ["Connect a wire", "Build from an empty floor", "Repair a changed sensor"];

export function WorkshopOnboarding({ originalBuild }: { originalBuild: Build }) {
  const account = useProgressAccount();
  return <Onboarding key={account ?? "guest"} originalBuild={originalBuild}/>;
}

function Onboarding({ originalBuild }: { originalBuild: Build }) {
  const account = useProgressAccount();
  const [earlier, setEarlier] = useState(false);
  const record = useLearnerRecord("workshop-onboarding:v2", {
    stage: 0,
    connected: false,
    constructed: false,
  }, raw => {
    const value = raw as { stage?: number };
    return value.stage === 0 || value.stage === 1 || value.stage === 2;
  });
  const machine = useLearnerRecord<{graph: Construction | null}>("workshop:guide:independent-build:v1", {graph: null}).value.graph;
  const [stage, setStage] = useLearnerField(record, "stage");
  const [connected, setConnected] = useLearnerField(record, "connected");
  const [constructed, setConstructed] = useLearnerField(record, "constructed");
  const completed = stage === 0 ? connected : constructed;
  const progress = useJourneyProgress("workshop-guide", "Getting started with Botie", "/lab/workshop-guide");
  function go(index: number) {
    setStage(index);
    setEarlier(false);
    progress.touch(stages[index]);
  }

  return <div>
    <nav aria-label="Workshop introduction" className="mb-5 flex flex-wrap gap-x-4 border-b border-line">
      {stages.map((label, index) => <button key={label} aria-current={!earlier && stage === index ? "step" : undefined} onClick={() => go(index)}
        className={`min-h-11 max-w-full border-b-2 px-1 py-3 text-left text-sm ${!earlier && stage === index ? "border-accent-fill font-semibold text-accent" : "border-transparent text-muted hover:text-foreground"}`}>
        {index + 1}. {label}{(index === 0 ? connected : index === 1 && constructed) && <span className="ml-2 text-accent" aria-label="Tested successfully">✓</span>}
      </button>)}
    </nav>
    {earlier ? <section aria-label="Earlier workshop draft" data-testid="earlier-workshop-draft">
      <p className="mb-5 text-sm leading-7 text-muted">This is the original tutorial workspace, with its original examples. A construction you saved here before the new introduction remains available. The two introduction steps above keep separate drafts.</p>
      <BuildWorkshop build={originalBuild} guide
        onActivity={() => progress.touch("Earlier workshop draft")}
        onOutcome={outcome => { progress.touch("Earlier workshop draft"); if (outcome.passed) progress.markBuilt(true); }}
      />
    </section> : stage === 2 ? <CalibrationShift graph={machine}/> : <BuildWorkshop
      build={stage === 0 ? connectionIntroduction : independentIntroduction}
      compact guide
      recordId={stage === 0 ? "guide:first-connection" : "guide:independent-build"}
      initialGraph={stage === 0 ? firstConnectionGraph() : undefined}
      onOutcome={outcome => {
        (stage === 0 ? setConnected : setConstructed)(outcome.passed);
        progress.touch(stages[stage]);
        if (outcome.passed) {
          if (stage === 0) progress.markExplored();
          else progress.markBuilt(true);
        }
      }}
      onActivity={() => {
        (stage === 0 ? setConnected : setConstructed)(false);
        progress.touch(stages[stage]);
      }}
    />}
    {!earlier&&<section className="my-6 rounded-xl border border-line bg-surface p-5" aria-label="Continue from the workshop introduction">
      <h2 className="text-lg font-semibold">{stage === 0 ? "Ready to choose the pieces?" : "What would you like to build next?"}</h2>
      <p role="status" className="mt-2 text-sm leading-7 text-muted">{completed
        ? stage === 0 ? "That connection carries each new reading into the same calculation. Now try making the whole construction yourself." : "Your rule handled positive and negative readings. The next workshops use these controls to work through problems from the lessons."
        : account ? "You can keep experimenting here or continue whenever you want. Once your account finishes saving, the construction can be opened on your next visit."
          : "You can keep experimenting here or continue whenever you want. Guest constructions last for this visit and reset on reload; sign in to save across visits."}</p>
      <div className="mt-4 flex flex-wrap gap-3">
        {stage === 0 ? <button onClick={() => go(1)} className="min-h-11 rounded-lg bg-accent-fill px-4 py-2 text-sm font-semibold text-accent-ink">Build from an empty floor</button>
          : stage === 1 ? <button onClick={() => go(2)} className="min-h-11 rounded-lg bg-accent-fill px-4 py-2 text-sm font-semibold text-accent-ink">Try the replacement sensor</button>
          : <><Link href="/lab/statistics" className="min-h-11 rounded-lg bg-accent-fill px-4 py-3 text-sm font-semibold text-accent-ink">Start with city records</Link><Link href="/lab/simple-linear-regression" className="min-h-11 rounded-lg border border-line px-4 py-3 text-sm font-semibold">Try a prediction problem</Link></>}
        <Link href="/lab" className="min-h-11 rounded-lg border border-line px-4 py-3 text-sm font-semibold">Browse the workshops</Link>
      </div>
    </section>}
    <button className="my-5 min-h-11 text-left text-sm text-accent underline underline-offset-4" aria-expanded={earlier} onClick={() => { setEarlier(!earlier); progress.touch(earlier ? stages[stage] : "Earlier workshop draft"); }}>
      {earlier ? "Return to the introduction" : "Full workspace and earlier draft"}
    </button>
    <details className="rounded-xl border border-line p-5">
      <summary className="cursor-pointer font-semibold">A reminder of the workshop controls</summary>
      <dl className="mt-4 space-y-4 text-sm leading-7">
        <div><dt className="font-semibold">Choosing and moving pieces</dt><dd className="text-muted">Click a tool on the shelf to add it, or drag it to the spot you want. Move a piece by dragging its name. Pieces can overlap; Arrange pieces in workspace controls spreads them out when you want more room. Selecting a piece lets you inspect its calculation below the floor.</dd></div>
        <div><dt className="font-semibold">Settings and connections</dt><dd className="text-muted">A setting belongs to the piece, such as the Number on Set a constant. An input comes from another piece. Start at a round output arrow and click or drag to a square input. Its label tells you what the operation needs.</dd></div>
        <div><dt className="font-semibold">Trying an idea</dt><dd className="text-muted">Values update as you connect the pieces. Run this example follows the selected data through your machine. Test all examples checks whether the same construction also handles the other supplied readings.</dd></div>
        <div><dt className="font-semibold">Changing your mind</dt><dd className="text-muted">Select a piece or wire and press Delete to remove it. Undo brings it back. The workspace controls include an arrangement tool and zoom, as well as a place to experiment with your own inputs.</dd></div>
      </dl>
    </details>
  </div>;
}
