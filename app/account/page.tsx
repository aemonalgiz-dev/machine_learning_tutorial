"use client";

import Link from "next/link";
import { useState, useSyncExternalStore } from "react";
import { refreshAccount, signOut, syncProgress, useAccount } from "@/lib/accounts";
import { finishedCount, guestProgress, importGuestProgress, lessonFinished, lessonStarted, useProgress } from "@/lib/progress";
import { lessonLocations, lessonOrder } from "@/lib/course-navigation";
import { exportLearnerWork, hasGuestWork, importGuestWork, resolveLearnerConflict, useLearnerStorageStatus } from "@/lib/learner-state";

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
  const { conflicts, storageFailed } = useLearnerStorageStatus();
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [importedFor, setImportedFor] = useState<string | null>(null);
  const hydrated = useSyncExternalStore(subscribeToHydration, () => true, () => false);
  const hasGuest = hydrated && importedFor !== account.user?.id && (hasGuestWork() || Object.values(guestProgress().done).some(sections => sections.length > 0));
  const authErrorCode = hydrated ? new URLSearchParams(window.location.search).get("error") ?? "" : "";
  const authError = Object.hasOwn(authErrors, authErrorCode) ? authErrors[authErrorCode] : undefined;
  const done = finishedCount(progress, lessonOrder);
  const started = lessonOrder.filter(lesson => lessonStarted(progress, lesson));
  const syncLabel = conflicts.length ? "Some work has changes on another device. Choose which version to keep below." : { idle: "Ready to sync", saving: "Saving your work…", saved: "All work synced", error: "Your work has not synced yet. Keep this tab open. Sync will retry when the connection returns." }[account.sync];

  return <div className="mx-auto max-w-3xl space-y-8 px-6 py-12">
    <div className="space-y-3">
      <h1 className="text-3xl font-semibold">Your learning progress</h1>
      <p className="text-muted">Keep your quiz answers, Python drafts, Botie workshops, experiments, and course progress together across devices.</p>
    </div>
    <section aria-label="Account" className="space-y-4 rounded-xl border border-line bg-surface p-6">
      {account.status === "checking" && <p role="status">Checking your account…</p>}
      {account.user ? <>
        <p>{account.status === "ready" ? "Signed in as" : "Local work for"} <strong>{account.user.name}</strong>{account.user.email && <span className="block break-words text-sm text-muted">{account.user.email}</span>}</p>
        <p role="status" className="text-sm text-muted">{account.syncMessage ?? syncLabel}</p>
        <div className="flex flex-wrap gap-3">
          <button className={button} onClick={() => { void syncProgress(); }} disabled={account.sync === "saving" || busy}>Sync now</button>
          <button className={button} onClick={() => {
            const url = URL.createObjectURL(new Blob([JSON.stringify({ exportedAt: new Date().toISOString(), progress, work: exportLearnerWork() }, null, 2)], { type: "application/json" }));
            const link = document.createElement("a"); link.href = url; link.download = "fitlab-saved-work.json"; link.click();
            setTimeout(() => URL.revokeObjectURL(url), 1000);
          }}>Download saved work</button>
          <button className={button} disabled={busy} onClick={async () => {
            setBusy(true);
            const success = await signOut();
            setMessage(success ? "You are signed out. Guest progress is shown below." : "Sign-out could not be completed. Please try again.");
            setBusy(false);
          }}>{busy ? "Signing out…" : "Sign out"}</button>
        </div>
        {hasGuest && <div className="space-y-3 border-t border-line pt-4">
          <p className="text-sm text-muted">There is also guest work in this browser. Add it if it is yours. Your existing account work will be kept.</p>
          <button className={button} disabled={account.sync !== "saved" || conflicts.length > 0} onClick={() => {
            importGuestProgress(); importGuestWork(); setImportedFor(account.user?.id ?? null); setMessage("Guest work added. It will sync with your account.");
          }}>Add my guest progress</button>
        </div>}
      </> : account.status === "ready" && account.enabled ? <>
        <p>{account.registrationEnabled ? "Create an account or sign in to keep your work across devices." : "Sign in to keep your work across devices."}</p>
        <p className="text-sm text-muted">You will continue to our account provider, then return here. Your guest work stays in this browser until you choose to add it to your account.</p>
        <div className="flex flex-wrap gap-3">
          {account.registrationEnabled && <form action="/account-api/auth/register" method="get"><button className="rounded-lg bg-accent-fill px-4 py-2 text-sm font-semibold text-accent-ink hover:opacity-90" type="submit">Create account</button></form>}
          <form action="/account-api/auth/login" method="get"><button className={button} type="submit">Sign in</button></form>
        </div>
      </> : account.status !== "checking" && <>
        <p>{account.status === "unavailable" ? "Accounts are temporarily unavailable." : "Accounts are not available yet."} You can keep learning; your guest progress stays in this browser.</p>
        {account.status === "unavailable" && <button className={button} onClick={() => { void refreshAccount(); }}>Try again</button>}
      </>}
      {message && <p role="status" className="text-sm text-muted">{message}</p>}
      {authError && !account.user && <p role="alert">{authError} Your guest work is still saved in this browser.</p>}
      {storageFailed && <p role="alert">This browser could not save a local copy. Keep this tab open until your account finishes syncing, or download your saved work.</p>}
    </section>
    {conflicts.length > 0 && <section aria-label="Changes on another device" className="space-y-4">
      <h2 className="text-xl font-semibold">Choose the work to keep</h2>
      <p className="text-sm text-muted">Both versions are available below and in your download. The version you choose will replace the other one for this activity.</p>
      {conflicts.map(entry => <article key={entry.key} className="space-y-3 rounded-xl border border-line p-4">
        <h3 className="break-all font-mono text-sm">{entry.key}</h3>
        <details><summary className="cursor-pointer text-sm">Compare saved versions</summary><div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div><p className="text-sm font-semibold">This device</p><pre className="max-h-64 overflow-auto whitespace-pre-wrap break-all text-xs">{JSON.stringify(entry.value, null, 2)}</pre></div>
          <div><p className="text-sm font-semibold">Other device</p><pre className="max-h-64 overflow-auto whitespace-pre-wrap break-all text-xs">{JSON.stringify(entry.conflict?.value, null, 2)}</pre></div>
        </div></details>
        <div className="flex flex-wrap gap-3"><button className={button} onClick={() => resolveLearnerConflict(entry.key, "local")}>Keep this device’s version</button><button className={button} onClick={() => resolveLearnerConflict(entry.key, "remote")}>Use the other device’s version</button></div>
      </article>)}
    </section>}
    <section aria-label="Course progress" className="space-y-4">
      <h2 className="text-xl font-semibold">{done} of {lessonOrder.length} lessons finished</h2>
      <p className="text-sm text-muted">{account.user ? "Answers, code drafts, workshop constructions, and experiment settings sync with your progress." : "This progress is stored in this browser."}</p>
      {started.length ? <ul className="divide-y divide-line rounded-xl border border-line">
        {started.map(lesson => <li key={lesson} className="flex flex-wrap items-center justify-between gap-2 p-4">
          <Link href={lesson} className="font-medium text-accent hover:underline">{lessonLocations[lesson]?.title ?? lesson}</Link>
          <span className="text-sm text-muted">{lessonFinished(progress, lesson) ? "Finished" : "In progress"}</span>
        </li>)}
      </ul> : <p className="text-muted">Your completed quizzes and challenges will appear here. <Link href="/#course" className="text-accent hover:underline">Explore the course</Link>.</p>}
    </section>
  </div>;
}
