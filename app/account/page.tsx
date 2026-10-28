"use client";

import Link from "next/link";
import { PracticeReturn } from "@/components/practice/PracticeReturn";
import { MembershipSummary } from "@/components/membership/PracticeMembership";
import { JourneyResume } from "@/components/site/JourneyResume";
import { useState, useSyncExternalStore } from "react";
import { refreshAccount, signOut, syncProgress, useAccount } from "@/lib/accounts";
import { finishedCount, lessonFinished, useProgress } from "@/lib/progress";
import { useLearningMap, workshopHref } from "@/lib/learning-map";
import { lessonLocations, lessonOrder } from "@/lib/course-navigation";
import { exportLearnerWork } from "@/lib/learner-state";

const button = "rounded-lg border border-line bg-surface px-4 py-2 text-sm font-semibold hover:bg-raised disabled:opacity-50";
const subscribeToHydration = () => () => {};
const authErrors: Record<string, string> = {
  registration: "We could not finish creating your account. If you already verified your email, try signing in. Otherwise, try creating your account again.",
  "sign-in": "We could not finish signing you in. Please try again.",
  "registration-unavailable": "Account registration could not be reached. Please try again in a moment.",
  "sign-in-unavailable": "Sign-in could not be reached. Please try again in a moment.",
};

export default function AccountPage() {
  const account = useAccount();
  const progress = useProgress();
  const { milestones } = useLearningMap();
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const hydrated = useSyncExternalStore(subscribeToHydration, () => true, () => false);
  const authErrorCode = hydrated ? new URLSearchParams(window.location.search).get("error") ?? "" : "";
  const authError = Object.hasOwn(authErrors, authErrorCode) ? authErrors[authErrorCode] : undefined;
  const billingReturn = hydrated ? new URLSearchParams(window.location.search).get("billing") : null;
  const done = finishedCount(progress, lessonOrder);
  const started = lessonOrder.filter(lesson => milestones(lesson).started);
  const syncLabel = { idle: "Opening your progress…", saving: "Saving your work…", saved: "All work synced", error: "Your changes have not saved yet. Keep this tab open. Sync will retry when the connection returns; reloading would discard unsaved changes." }[account.sync];

  return <div className="mx-auto max-w-3xl space-y-8 px-6 py-12">
    <PracticeReturn />
    <div className="space-y-3">
      <p className="game-eyebrow">Your place in the lab</p>
      <h1 className="text-3xl font-semibold">Your learning journal</h1>
      <p className="text-muted">Sign in to keep your answers, code and constructions with your account. Guest work lasts for this visit.</p>
    </div>
    <JourneyResume />
    {account.user && billingReturn === "success" && <aside role="status" className="journal-panel space-y-3 p-5">
      <p>Returned from checkout. Practice access opens after payment is confirmed.</p>
      <Link href="/membership" className="text-sm font-semibold text-accent underline underline-offset-4">Check membership status</Link>
    </aside>}
    <section aria-label="Account" className="journal-panel space-y-4 p-6">
      {account.status === "checking" && <p role="status">Checking your account…</p>}
      {account.user ? <>
        <p>{account.status === "ready" ? "Signed in as" : "Reconnecting account for"} <strong>{account.user.name}</strong>{account.user.email && <span className="block break-words text-sm text-muted">{account.user.email}</span>}</p>
        <p role="status" className="text-sm text-muted">{account.syncMessage ?? syncLabel}</p>
        <p className="text-sm text-muted">Your current work saves to your account automatically while connected. Saved work opens when you sign in again. Learning results and drafts are not stored in this browser.</p>
        <div className="flex flex-wrap gap-3">
          {account.sync === "error" && <button className={button} onClick={() => { void syncProgress(); }} disabled={busy}>Sync now</button>}
          {account.membership.practiceAccess && <Link href="/practice" className="game-button game-button-primary">Extra practice →</Link>}
          <button className={button} disabled={busy} onClick={async () => {
            setBusy(true);
            const success = await signOut();
            setMessage(success ? "You are signed out. Guest progress is shown below." : "Sign-out could not be completed. Please try again.");
            setBusy(false);
          }}>{busy ? "Signing out…" : "Sign out"}</button>
        </div>
      </> : account.status === "ready" && account.enabled ? <>
        <p>{account.registrationEnabled ? "Create an account or sign in to keep your work across devices." : "Sign in to keep your work across devices."}</p>
        <p className="text-sm text-muted">You will continue to our account provider, then return here. Sign in before starting work you want to keep. Guest answers and drafts reset when the page reloads or you leave for sign-in.</p>
        <div className="flex flex-wrap gap-3">
          {account.registrationEnabled && <form action="/account-api/auth/register" method="get"><button className="rounded-lg bg-accent-fill px-4 py-2 text-sm font-semibold text-accent-ink hover:opacity-90" type="submit">Create account</button></form>}
          <form action="/account-api/auth/login" method="get"><button className={button} type="submit">Sign in</button></form>
        </div>
      </> : account.status !== "checking" && <>
        <p>{account.status === "unavailable" ? "Accounts are temporarily unavailable." : "Accounts are not available yet."} You can keep learning during this visit. Guest answers and drafts reset on reload.</p>
        {account.status === "unavailable" && <button className={button} onClick={() => { void refreshAccount(); }}>Try again</button>}
      </>}
      {message && <p role="status" className="text-sm text-muted">{message}</p>}
      {authError && !account.user && <p role="alert">{authError} Guest work is not saved across the sign-in redirect.</p>}
    </section>
    <MembershipSummary />
    <section aria-label="Course progress" className="space-y-4">
      <h2 className="text-xl font-semibold">{done} of {lessonOrder.length} lessons finished</h2>
      <p className="text-sm text-muted">{account.user ? "Answers, code drafts, workshop constructions, and experiment settings save with your account progress." : "This progress lasts for the current visit and resets on reload."}</p>
      {started.length ? <ul className="divide-y divide-line rounded-xl border border-line">
        {started.map(lesson => <li key={lesson} className="flex flex-wrap items-center justify-between gap-2 p-4">
          <Link href={lesson} className="font-medium text-accent hover:underline">{lessonLocations[lesson]?.title ?? lesson}</Link>
          <span className="text-sm text-muted">{lessonFinished(progress, lesson) ? "Exercises completed" : milestones(lesson).built ? "Workshop tested" : "In progress"}</span>
          <Link href={workshopHref(lesson)} className="text-xs text-accent hover:underline">Continue building →</Link>
        </li>)}
      </ul> : <p className="text-muted">Your completed quizzes and challenges will appear here. <Link href="/#course" className="text-accent hover:underline">Explore the course</Link>.</p>}
    </section>
    {account.user && <details className="border-t border-line pt-5 text-sm text-muted">
      <summary className="cursor-pointer">Your data</summary>
      <p className="mt-3 leading-6">If two devices edit the same activity, unsynced changes from this visit become the current work after revision checks. A recovery copy of the previous version remains in memory for this visit and is included in your download.</p>
      <button className={`${button} mt-4`} onClick={() => {
        const url = URL.createObjectURL(new Blob([JSON.stringify({ exportedAt: new Date().toISOString(), progress, work: exportLearnerWork() }, null, 2)], { type: "application/json" }));
        const link = document.createElement("a"); link.href = url; link.download = "perceptron-lab-learning-data.json"; link.click();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
      }}>Download my data</button>
    </details>}
  </div>;
}
