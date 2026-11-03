import type { Metadata } from "next";
import { Suspense } from "react";
import { UnsubscribeReminders } from "@/components/site/UnsubscribeReminders";

export const metadata: Metadata = {
  title: "Stop reminder emails · Perceptron Lab",
  robots: { index: false, follow: false },
  referrer: "no-referrer",
};

export default function UnsubscribePage() {
  return <article className="mx-auto w-full max-w-xl space-y-5 px-6 py-12">
    <h1 className="text-3xl font-bold">Reminder emails</h1>
    <Suspense fallback={<p className="text-muted">Checking your reminder link…</p>}><UnsubscribeReminders /></Suspense>
  </article>;
}
