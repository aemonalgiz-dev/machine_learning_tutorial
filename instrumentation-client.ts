// Reading activity for the site's own dashboard. app/privacy/page.tsx tells
// readers what this records, and that page must change if this file does.
//
// Each page sends a view once the reader is on it and, while they read and as
// they leave, the time they spent reading it. A finished quiz or challenge
// sends one more event. The reports go to /site-activity on this site and
// nowhere else. Nothing is stored in the browser for this: no cookie, no
// localStorage entry, no identifier that outlives the tab. The one exception is
// the opt-out on the privacy page, which is stored only when a reader asks.
//
// Reading time is time the page was visible while the reader was doing
// something with it. Ninety seconds without a scroll, key or pointer stops the
// clock until they come back, so a tab left open overnight does not count as a
// night of study. Long stretches of reading without touching anything are
// undercounted by the same rule, which is the safer side to err on.
//
// Readers who send Global Privacy Control or Do Not Track are not counted, and
// neither are automated browsers, development servers or preview hosts.

import { ACTIVITY_OPT_OUT_KEY } from "./lib/activity";

const ENDPOINT = "/site-activity";
const IDLE_AFTER_MS = 90_000;
const TICK_MS = 15_000;
const REPORT_EVERY_MS = 5 * 60_000;
const LONGEST_REPORT_MS = 30 * 60_000;

type Activity =
  | { kind: "view"; path: string; referrer: string; width: number; touch: boolean }
  | { kind: "time"; path: string; ms: number }
  | { kind: "finish"; path: string; section: string };

function optedOut(): boolean {
  try {
    return window.localStorage.getItem(ACTIVITY_OPT_OUT_KEY) === "1";
  } catch {
    return false;
  }
}

function shouldCount(): boolean {
  try {
    const browser = navigator as Navigator & { globalPrivacyControl?: boolean };
    if (browser.globalPrivacyControl === true || browser.doNotTrack === "1") return false;
    if (browser.webdriver) return false;
    if (typeof globalThis.crypto?.randomUUID !== "function") return false;
    if (location.protocol !== "https:") return false;
    return location.hostname === "perceptronlab.dev" || location.hostname === "www.perceptronlab.dev";
  } catch {
    return false;
  }
}

const counting = typeof window !== "undefined" && shouldCount();
// One visit is this page load and every in-app navigation after it. It lives
// only in memory, and the server keys it to the day before writing it down.
const visit = counting ? crypto.randomUUID() : "";

let currentPath = counting ? location.pathname : "";
let pendingMs = 0;
let lastTick = Date.now();
let lastInput = Date.now();
// Tracked here rather than read from document.visibilityState, which already
// says "hidden" when the hide event arrives, so the seconds just before a
// reader switches away would otherwise be lost.
let shown = counting && document.visibilityState === "visible";

function send(activity: Activity) {
  if (!counting || optedOut()) return;
  try {
    const body = JSON.stringify({ ...activity, visit });
    if (!navigator.sendBeacon?.(ENDPOINT, body)) {
      void fetch(ENDPOINT, { method: "POST", body, keepalive: true }).catch(() => undefined);
    }
  } catch {
    // Reporting must never break a lesson.
  }
}

// Adds the time since the last tick if the reader was there for it.
function tick() {
  const now = Date.now();
  if (shown && now - lastInput < IDLE_AFTER_MS) pendingMs += now - lastTick;
  lastTick = now;
}

function flushTime() {
  tick();
  const ms = Math.min(Math.round(pendingMs), LONGEST_REPORT_MS);
  pendingMs = 0;
  if (ms >= 1000) send({ kind: "time", path: currentPath, ms });
}

function view(referrer: string) {
  send({ kind: "view", path: currentPath, referrer, width: window.innerWidth, touch: navigator.maxTouchPoints > 0 });
}

function externalReferrer(): string {
  try {
    if (!document.referrer) return "";
    const host = new URL(document.referrer).hostname;
    return host === location.hostname ? "" : host;
  } catch {
    return "";
  }
}

// Called once the browser's address has actually changed, so a navigation
// that is abandoned, or that falls back to a full page load, is not counted
// here as well as by the page that loads.
function arrived() {
  const path = location.pathname;
  if (path === currentPath) return;
  flushTime();
  currentPath = path;
  lastInput = Date.now();
  view("");
}

if (counting) {
  view(externalReferrer());

  const noticeInput = () => {
    if (Date.now() - lastInput >= IDLE_AFTER_MS) lastTick = Date.now();
    lastInput = Date.now();
  };
  for (const name of ["pointerdown", "pointermove", "keydown", "scroll", "wheel", "touchstart"]) {
    window.addEventListener(name, noticeInput, { passive: true, capture: true });
  }

  window.setInterval(() => {
    tick();
    if (pendingMs >= REPORT_EVERY_MS) flushTime();
  }, TICK_MS);

  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") {
      flushTime();
      shown = false;
    } else {
      shown = true;
      lastTick = Date.now();
      lastInput = Date.now();
    }
  });
  window.addEventListener("pagehide", () => {
    flushTime();
    shown = false;
  });
  // A page restored from the back-forward cache is a new view of it.
  window.addEventListener("pageshow", (event) => {
    if (!event.persisted) return;
    shown = document.visibilityState === "visible";
    lastTick = Date.now();
    lastInput = Date.now();
    view("");
  });

  // The App Router changes the address with pushState and replaceState once a
  // navigation lands, and the back and forward buttons fire popstate.
  for (const method of ["pushState", "replaceState"] as const) {
    const original = history[method].bind(history);
    history[method] = (...parts: Parameters<History["pushState"]>) => {
      original(...parts);
      try {
        arrived();
      } catch {
        // A navigation we cannot read is simply not counted.
      }
    };
  }
  window.addEventListener("popstate", () => arrived());

  // lib/progress.ts announces a section the reader has just finished.
  window.addEventListener("fitlab:finished", (event) => {
    const section = (event as CustomEvent<{ section?: unknown }>).detail?.section;
    send({ kind: "finish", path: currentPath, section: typeof section === "string" ? section : "" });
  });
}
