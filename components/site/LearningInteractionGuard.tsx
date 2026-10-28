"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode, SyntheticEvent } from "react";
import { refreshAccount, syncProgress, useAccount } from "@/lib/accounts";
import { useLearnerHydrated } from "@/lib/learner-state";
import styles from "./LearningInteractionGuard.module.css";

const controls = 'button, input, textarea, select, [contenteditable="true"], [role="button"]';

export function LearningInteractionGuard({ children }: { children: ReactNode }) {
  const account = useAccount();
  const hydrated = useLearnerHydrated();
  const path = usePathname();
  const learningPage = /^\/(concepts|primers|lab|practice)(\/|$)/.test(path);
  const blocked = learningPage && (account.status === "checking" || Boolean(account.user && !hydrated));
  const failed = blocked && (account.status === "unavailable" || account.sync === "error");
  function stopEdit(event: SyntheticEvent) {
    if (!blocked || !(event.target instanceof Element)) return;
    // Hash/contents navigation remains usable while saved learning controls wait.
    if (event.target.closest('nav[aria-label="Lesson navigation"]')) return;
    if (!event.target.closest(controls)) return;
    event.preventDefault();
    event.stopPropagation();
  }
  return <>
    {blocked && <section data-testid="learning-restore-guard" role={failed ? "alert" : "status"} className="mx-auto my-5 max-w-5xl rounded-xl border border-line bg-surface p-5" aria-live="polite">
      <h2 className="font-semibold">{failed ? "Your saved work could not be loaded" : account.status === "checking" ? "Checking your account" : "Loading your saved work"}</h2>
      <p className="mt-2 text-sm leading-6 text-muted">{failed
        ? "You can keep reading. Learning controls will open after your account work loads, so an empty workspace cannot replace it. Retry the connection before editing."
        : "You can read the lesson while its saved answers and constructions load. Learning controls will open once that work is ready."}</p>
      {failed && <div className="mt-3 flex flex-wrap items-center gap-4">
        <button className="min-h-11 rounded-lg bg-accent-fill px-4 py-2 text-sm font-semibold text-accent-ink" onClick={() => { void refreshAccount().then(() => syncProgress()); }}>Retry loading saved work</button>
        <Link href="/account" className="text-sm text-accent underline">Account options</Link>
      </div>}
    </section>}
    <div className={blocked ? styles.blocked : undefined} onClickCapture={stopEdit} onPointerDownCapture={stopEdit}
      onBeforeInputCapture={stopEdit} onChangeCapture={stopEdit} onPasteCapture={stopEdit} onDropCapture={stopEdit}
      onKeyDownCapture={event => {
        if (event.key === "Tab" || event.key === "Escape" || (event.ctrlKey || event.metaKey) && ["a", "c"].includes(event.key.toLowerCase())) return;
        stopEdit(event);
      }}>{children}</div>
  </>;
}
