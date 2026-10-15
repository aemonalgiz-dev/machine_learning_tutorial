"use client";

import Link from "next/link";
import { useAccount } from "@/lib/accounts";
import { journeyStatus, useRecentJourney } from "@/lib/journey-progress";
import { Botie } from "./Botie";

export function JourneyResume({ introWhenNew = false }: { introWhenNew?: boolean }) {
  const recent = useRecentJourney();
  const account = useAccount();
  // Resolve the identity before choosing a card. A new browser can also need
  // its first account sync before its recent workshop becomes available.
  if (account.status === "checking" || (account.user && !recent && !account.learnerStateReady)) return null;
  if (!recent) return introWhenNew ? <aside aria-labelledby="start-workshop" className="mb-8 rounded-2xl border border-accent-fill/40 bg-accent-soft p-5 sm:p-6">
    <h2 id="start-workshop" className="text-xl font-semibold">Start by connecting something</h2>
    <p className="mt-2 max-w-2xl text-sm leading-7 text-muted">The tutorial opens with a machine you can try straight away. Botie explains each control as you use it, then gives you room to build your own solution.</p>
    <Link href="/lab/workshop-guide" className="mt-4 inline-block rounded-lg bg-accent-fill px-4 py-3 text-sm font-semibold text-accent-ink">Build your first machine →</Link>
  </aside> : null;
  const status = journeyStatus(recent.record);
  return <aside aria-labelledby="continue-journey" className="mb-8 flex items-start gap-4 rounded-xl border border-accent-fill/40 bg-accent-soft p-5 sm:items-center">
    <Botie size={64} decorative />
    <div className="min-w-0 flex-1">
      <h2 id="continue-journey" className="text-lg font-semibold">Continue with Botie</h2>
      <p className="mt-1 text-sm leading-6">{recent.title}</p>
      {recent.stage && <p className="mt-1 text-sm text-muted">You were working on: {recent.stage}</p>}
      {status && <p className="mt-2 text-xs text-muted" title={status.detail}>{status.label}</p>}
      <div className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-1"><Link href={recent.href} className="inline-flex min-h-11 items-center text-sm font-semibold text-accent hover:underline">Return to your workshop →</Link><Link href="/lab/workshop-guide" className="inline-flex min-h-11 items-center text-sm text-muted hover:underline">Workshop controls guide</Link></div>
    </div>
  </aside>;
}
