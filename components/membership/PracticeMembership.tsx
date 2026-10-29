"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { refreshAccount, useAccount } from "@/lib/accounts";
import { getProgressAccount } from "@/lib/progress";
import { readMembership, type PracticeMembership as Membership } from "@/lib/membership";

type Interval = "monthly" | "annual";
interface Offer { interval: Interval; amount: number; currency: "usd" }
interface Billing {
  account: string;
  configured: boolean;
  membership: Membership;
  offers: Offer[];
  checkoutAvailable: boolean;
  portalAvailable: boolean;
}
const button = "min-h-11 rounded-lg border border-line bg-surface px-4 py-2 text-sm font-semibold hover:bg-raised disabled:opacity-50";

function readBilling(raw: unknown, owner: string): Billing {
  if (!raw || typeof raw !== "object") throw Error("Membership details could not be read.");
  const data = raw as Billing;
  if (data.account !== owner || typeof data.configured !== "boolean" || typeof data.checkoutAvailable !== "boolean" || typeof data.portalAvailable !== "boolean" || !Array.isArray(data.offers))
    throw Error("Membership details could not be read for this account.");
  const offers = data.offers.filter(offer => offer && ["monthly", "annual"].includes(offer.interval) &&
    Number.isSafeInteger(offer.amount) && offer.amount > 0 && offer.currency === "usd");
  if (offers.length !== data.offers.length || new Set(offers.map(offer => offer.interval)).size !== offers.length)
    throw Error("The available prices could not be confirmed.");
  if (data.configured && offers.length !== 2) throw Error("Both billing options could not be confirmed.");
  return { ...data, membership: readMembership(data.membership), offers };
}

function hostedUrl(raw: unknown, action: "checkout" | "portal") {
  if (typeof raw !== "string") throw Error("The payment page could not be opened. Please try again.");
  const url = new URL(raw);
  if (url.protocol !== "https:" || url.hostname !== (action === "checkout" ? "checkout.stripe.com" : "billing.stripe.com") || url.username || url.password || url.port)
    throw Error("The payment page could not be verified. Please try again.");
  return url.href;
}

export function MembershipSummary() {
  const account = useAccount();
  if (!account.user || account.status !== "ready") return null;
  return <section aria-label="Practice membership" className="journal-panel space-y-3 p-6">
    <h2 className="text-xl font-semibold">{account.membership.practiceAccess ? "Practice membership" : "Your free account"}</h2>
    <p className="text-sm leading-6 text-muted">{account.membership.practiceAccess
      ? "Your membership opens the additional practice library. Your course work saves with your free account."
      : "Your course progress, code and workshop drafts save with your free account. A paid membership adds extra practice problems."}</p>
    <Link href="/membership" className="inline-flex min-h-11 items-center text-sm font-semibold text-accent underline underline-offset-4">{account.membership.practiceAccess ? "Manage membership" : "See practice membership"}</Link>
  </section>;
}

export function PracticeMembership({ accessDenied = false, onAccessRetry }: { accessDenied?: boolean; onAccessRetry?: () => void }) {
  const account = useAccount();
  if (account.status === "checking") return <p role="status">Checking your account…</p>;
  if (account.status === "unavailable") return <div role="alert" className="space-y-4">
    <p>Your account could not be checked. You can keep reading the free course while we reconnect.</p>
    <button className={button} onClick={() => { void refreshAccount(); }}>Check account again</button>
  </div>;
  if (!account.user && !account.enabled) return <div className="space-y-4 rounded-xl border border-line bg-surface p-6">
    <p role="status">Accounts are unavailable right now. You can keep using the free course and its exercises.</p>
    <Link href="/#course" className="game-button game-button-primary">Explore the free course →</Link>
  </div>;
  if (!account.user) return <div className="space-y-5 rounded-xl border border-line bg-surface p-6">
    <h2 className="text-2xl font-semibold">Try the same idea on different data</h2>
    <p className="leading-7 text-muted">After a lesson, it helps to work through another example yourself. The additional practice library has more problems for that. Sign in to see the monthly and annual membership options.</p>
    <Link className="game-button game-button-primary" href="/account?returnTo=%2Fmembership">Sign in or create an account</Link>
    <p className="text-sm leading-6 text-muted">The course and its existing exercises are free. A free account also keeps your learning progress and drafts.</p>
  </div>;
  return <AccountMembership key={account.user.id} owner={account.user.id} accessDenied={accessDenied} onAccessRetry={onAccessRetry} />;
}

function AccountMembership({ owner, accessDenied, onAccessRetry }: { owner: string; accessDenied: boolean; onAccessRetry?: () => void }) {
  const account = useAccount();
  const [billing, setBilling] = useState<Billing | null>(null);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);
  const [busy, setBusy] = useState<Interval | "portal" | null>(null);
  const [checking, setChecking] = useState(false);
  const active = useRef(true);
  useEffect(() => { active.current = true; return () => { active.current = false; }; }, []);
  useEffect(() => {
    const abort = new AbortController();
    const timeout = setTimeout(() => { abort.abort(); if (getProgressAccount() === owner) setError("Loading membership details timed out. Please try again."); }, 15000);
    void fetch("/account-api/billing", { headers: { "X-FitLab-Account": owner }, credentials: "same-origin", cache: "no-store", signal: abort.signal })
      .then(async response => {
        if (response.status === 401 || response.status === 409) void refreshAccount();
        if (!response.ok) throw Error("Membership details could not be loaded. Please try again.");
        const value = readBilling(await response.json(), owner);
        if (!abort.signal.aborted && getProgressAccount() === owner) { setBilling(value); setError(""); }
      }).catch(reason => { if (!abort.signal.aborted) setError(reason instanceof Error ? reason.message : "Membership details could not be loaded."); }).finally(() => clearTimeout(timeout));
    return () => { clearTimeout(timeout); abort.abort(); };
  }, [owner, attempt, account.membership.practiceAccess, account.membership.validUntil, accessDenied]);

  async function openPayment(action: "checkout" | "portal", interval?: Interval) {
    if (busy || checking || getProgressAccount() !== owner || account.status !== "ready") return;
    if (action === "checkout" && (!billing?.configured || !billing.checkoutAvailable || alreadySubscribed || !billing.offers.some(offer => offer.interval === interval))) return;
    if (action === "portal" && !billing?.portalAvailable) return;
    setBusy(interval ?? "portal"); setError("");
    try {
      const response = await fetch(`/account-api/billing/${action}`, {
        method: "POST", credentials: "same-origin", cache: "no-store", headers: { "Content-Type": "application/json", "X-FitLab-Account": owner },
        body: JSON.stringify(interval ? { interval } : {}), signal: AbortSignal.timeout(15000),
      });
      if (!response.ok) throw Error(action === "checkout" ? "Checkout could not be opened. Please try again." : "Billing management could not be opened. Please try again.");
      const result = await response.json(), destination = hostedUrl(result.url, action);
      if (active.current && getProgressAccount() === owner) window.location.assign(destination);
    } catch (reason) {
      if (active.current && getProgressAccount() === owner) setError(reason instanceof Error ? reason.message : "The payment page could not be opened.");
    } finally { if (active.current) setBusy(null); }
  }

  const hasAccess = account.membership.practiceAccess;
  const alreadySubscribed = hasAccess || billing?.membership.practiceAccess;
  const offers = billing?.configured ? billing.offers : [];
  async function checkMembership() {
    if (checking || busy) return;
    setChecking(true);
    try {
      await refreshAccount();
      if (active.current && getProgressAccount() === owner) {
        setBilling(null); setError(""); setAttempt(value => value + 1); onAccessRetry?.();
      }
    } finally { if (active.current) setChecking(false); }
  }
  return <section aria-label="Practice membership" className="space-y-5 rounded-xl border border-line bg-surface p-6 sm:p-8">
    <div className="space-y-3">
      <h2 className="text-2xl font-semibold">{alreadySubscribed ? "Your extra practice membership" : "Extra practice"}</h2>
      <p className="leading-7 text-muted">Once you&apos;ve worked through a lesson, try its method on different data. These extra problems give you more cases to work through, with tests and feedback as you go.</p>
    </div>
    {error && <div role="alert" className="space-y-3"><p>{error}</p><button className={button} onClick={() => { setBilling(null); setError(""); setAttempt(value => value + 1); }} disabled={Boolean(busy)}>Try membership details again</button></div>}
    {!billing && !error && <p role="status" className="text-sm text-muted">Loading membership options…</p>}
    {alreadySubscribed ? <div className="space-y-4">
      <p className="font-semibold">{hasAccess && !accessDenied ? "Your practice membership is active." : "Checking your current practice access."}</p>
      {billing?.membership.validUntil && <p className="text-sm text-muted">Current paid period ends {new Intl.DateTimeFormat("en-US", { dateStyle: "long", timeStyle: "short", timeZone: "UTC" }).format(billing.membership.validUntil * 1000)} UTC.</p>}
      {hasAccess && !accessDenied && <Link href="/practice" className="game-button game-button-primary">Open extra practice →</Link>}
    </div> : billing?.checkoutAvailable && offers.length ? <div className="space-y-4">
      <h3 className="font-semibold">Pay monthly or yearly</h3>
      <div className="grid gap-4 sm:grid-cols-2">{(["monthly", "annual"] as const).map(interval => {
        const offer = offers.find(item => item.interval === interval);
        if (!offer) return null;
        return <div key={interval} className="space-y-4 rounded-xl border border-line bg-background p-5">
          <h4 className="font-semibold">{interval === "monthly" ? "Monthly" : "Annual"}</h4>
          <p className="text-2xl font-semibold">{new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(offer.amount / 100)} <span className="text-sm font-normal text-muted">USD / {interval === "monthly" ? "month" : "year"}</span></p>
          <button className="game-button game-button-primary w-full disabled:opacity-50" disabled={Boolean(busy) || checking} onClick={() => { void openPayment("checkout", interval); }}>{busy === interval ? "Opening checkout…" : `Continue with ${interval} billing`}</button>
        </div>;
      })}</div>
      <p className="text-sm leading-6 text-muted">Membership renews at the interval you choose. You can review the total in Stripe before subscribing, and manage or cancel your subscription there.</p>
    </div> : billing && <p role="status" className="leading-7 text-muted">{billing.portalAvailable
      ? "Your subscription needs attention before extra practice can open. Review its billing details in Stripe."
      : "Practice membership cannot be purchased right now. You can still use the free course and save your progress with your account."}</p>}
    {billing?.portalAvailable && <div className="space-y-3">
      {!alreadySubscribed && <p className="text-sm leading-6 text-muted">You can update payment details or review an earlier subscription in Stripe.</p>}
      <button className={button} disabled={Boolean(busy) || checking} onClick={() => { void openPayment("portal"); }}>{busy === "portal" ? "Opening billing…" : "Manage or cancel membership"}</button>
    </div>}
    <button className={button} disabled={Boolean(busy) || checking} onClick={() => { void checkMembership(); }}>{checking ? "Checking membership…" : "Check membership status"}</button>
    <p className="border-t border-line pt-4 text-sm leading-6 text-muted">The main course and its existing exercises stay free. Your saved course work remains with your free account if you cancel a practice membership.</p>
    <Link href="/#course" className="inline-flex min-h-11 items-center text-sm font-semibold text-accent underline underline-offset-4">Continue the free course →</Link>
  </section>;
}
