"use client";

// Switches the whole site between its dark and light themes.
//
// The theme lives on the <html> element as a data attribute, which is what the
// dark: variant in globals.css keys on, so flipping the attribute restyles
// every component at once. The choice is remembered in this browser and put
// back before the next page paints by the script in app/layout.tsx.

import { useSyncExternalStore } from "react";

const KEY = "oop_ml.theme";

type Theme = "dark" | "light";

const listeners = new Set<() => void>();

function current(): Theme {
  return document.documentElement.dataset.theme === "light" ? "light" : "dark";
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function apply(theme: Theme) {
  document.documentElement.dataset.theme = theme;
  try {
    window.localStorage.setItem(KEY, theme);
  } catch {
    // Without storage the choice lasts for this page, which is still a choice.
  }
  listeners.forEach((listener) => listener());
}

// The server renders dark, and so does the first client render, which is what
// keeps hydration quiet; a reader who chose light sees the button catch up a
// moment after the page itself already has.
const serverTheme = (): Theme => "dark";

export function ThemeToggle() {
  const theme = useSyncExternalStore(subscribe, current, serverTheme);
  const next: Theme = theme === "dark" ? "light" : "dark";

  return (
    <button
      type="button"
      onClick={() => apply(next)}
      aria-label={`Switch to the ${next} theme`}
      title={`Switch to the ${next} theme`}
      className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-line bg-surface text-muted transition hover:text-foreground"
    >
      {theme === "dark" ? (
        <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" className="h-4 w-4">
          <path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm0 12a4 4 0 100-8 4 4 0 000 8zm7-4a1 1 0 110 2h-1a1 1 0 110-2h1zM4 10a1 1 0 01-1 1H2a1 1 0 110-2h1a1 1 0 011 1zm11.66-5.66a1 1 0 010 1.42l-.71.7a1 1 0 11-1.41-1.41l.7-.71a1 1 0 011.42 0zM6.46 13.54a1 1 0 010 1.42l-.7.7a1 1 0 11-1.42-1.41l.71-.71a1 1 0 011.41 0zm9.2 2.12a1 1 0 01-1.42 0l-.7-.71a1 1 0 011.41-1.41l.71.7a1 1 0 010 1.42zM6.46 6.46a1 1 0 01-1.41 0l-.71-.7a1 1 0 011.42-1.42l.7.71a1 1 0 010 1.41zM10 15a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1z" />
        </svg>
      ) : (
        <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" className="h-4 w-4">
          <path d="M17.29 13.3A8 8 0 016.7 2.71a8 8 0 1010.59 10.59z" />
        </svg>
      )}
    </button>
  );
}
