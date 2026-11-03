"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export function UnsubscribeReminders() {
  const token = useSearchParams().get("token");
  const [status, setStatus] = useState<"checking" | "ready" | "saving" | "done" | "error">("checking");
  const [error, setError] = useState<string | null>(null);
  const valid = !!token && token.length <= 2048;
  const endpoint = valid ? `/account-api/reminders/unsubscribe?token=${encodeURIComponent(token)}` : null;
  useEffect(() => {
    const controller = new AbortController();
    if (!endpoint) return;
    fetch(endpoint, { cache: "no-store", credentials: "omit", referrerPolicy: "no-referrer", signal: controller.signal })
      .then(async response => {
        if (!response.ok || (await response.json()).canUnsubscribe !== true) throw new Error();
        if (!controller.signal.aborted) setStatus("ready");
      }).catch(() => { if (!controller.signal.aborted) { setStatus("error"); setError("This link could not be checked. You can turn reminders off from your account, or try the link again."); } });
    return () => controller.abort();
  }, [endpoint]);
  async function confirm() {
    if (!endpoint || status !== "ready") return;
    setStatus("saving"); setError(null);
    try {
      const response = await fetch(endpoint, { method: "POST", cache: "no-store", credentials: "omit", referrerPolicy: "no-referrer",
        headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: "confirm=unsubscribe", signal: AbortSignal.timeout(15_000) });
      if (!response.ok || (await response.json()).ok !== true) throw new Error();
      setStatus("done");
    } catch { setStatus("ready"); setError("Your request could not be saved. Try again, or turn reminders off from your account."); }
  }
  if (!valid) return <><p>This link is missing its confirmation code. You can turn reminders off from your account.</p><Link className="text-accent underline" href="/account">Open your account</Link></>;
  return <div className="space-y-4">
    {status === "done" ? <p role="status">Reminder emails are off. Your account and saved work are still there whenever you want to return.</p> : <>
      <p>Would you like to stop the learning reminder emails? You do not need to sign in.</p>
      {status === "checking" && <p role="status" className="text-muted">Checking your reminder link…</p>}
      <button type="button" className="game-button game-button-primary" disabled={status !== "ready"} onClick={() => { void confirm(); }}>{status === "saving" ? "Saving…" : "Stop reminder emails"}</button>
    </>}
    {error && <p role="alert">{error}</p>}
    <p><Link className="text-accent underline" href="/account">Open your account</Link></p>
  </div>;
}
