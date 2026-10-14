"use client";

// The switch on the privacy page. Turning counting off stores one flag in this
// browser, which instrumentation-client.ts reads before every report; turning
// it back on removes the flag, so nothing is stored unless the reader asks.

import { useSyncExternalStore } from "react";
import { ACTIVITY_OPT_OUT_KEY } from "@/lib/activity";

type Choice = "counted" | "off" | "browser" | "unknown";

const listeners = new Set<() => void>();

function read(): Choice {
  try {
    const browser = navigator as Navigator & { globalPrivacyControl?: boolean };
    if (browser.globalPrivacyControl === true || browser.doNotTrack === "1") return "browser";
    return window.localStorage.getItem(ACTIVITY_OPT_OUT_KEY) === "1" ? "off" : "counted";
  } catch {
    return "unknown";
  }
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  window.addEventListener("storage", listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", listener);
  };
}

function choose(off: boolean) {
  try {
    if (off) window.localStorage.setItem(ACTIVITY_OPT_OUT_KEY, "1");
    else window.localStorage.removeItem(ACTIVITY_OPT_OUT_KEY);
  } catch {
    // Blocked storage leaves the choice unchanged, and the label says so.
  }
  listeners.forEach((listener) => listener());
}

export function ActivityOptOut() {
  const choice = useSyncExternalStore(subscribe, read, () => "unknown" as Choice);

  if (choice === "browser") {
    return (
      <p className="rounded-lg border border-line bg-surface px-5 py-4">
        Your browser asks sites not to track it, so nothing from this browser is counted.
      </p>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-4 rounded-lg border border-line bg-surface px-5 py-4">
      <p className="m-0">
        {choice === "off"
          ? "Counting is switched off in this browser."
          : choice === "counted"
            ? "Reading in this browser is counted."
            : "This browser’s storage is unavailable, so the switch cannot be saved here."}
      </p>
      {choice !== "unknown" && (
        <button
          type="button"
          onClick={() => choose(choice !== "off")}
          className="rounded-md border border-line px-3 py-1.5 font-medium text-foreground hover:bg-raised"
        >
          {choice === "off" ? "Switch counting back on" : "Switch counting off"}
        </button>
      )}
    </div>
  );
}
