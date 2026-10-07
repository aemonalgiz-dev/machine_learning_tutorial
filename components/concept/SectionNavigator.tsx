"use client";

// One section at a time, with arrows and a section list at the top of the page.
//
// The sections used to render as a stack of collapsible details elements, so a
// reader met the whole lesson at once and scrolled past what they did not want.
// Here a single section is on screen and the controls above it move to any
// other, which keeps a long derivation from burying the one part the reader
// came for.
//
// The address bar holds which section is showing, rather than a piece of state
// kept beside it. A pasted link, the arrows, the section list and the browser's
// own back and forward button then all move the reader the same way, through
// one listener, and none of them can disagree with the address bar about where
// the reader is.
//
// Two things the stacked version did for free and this has to do by hand.
//
// A fragment used to point at a heading that existed whether or not it was
// open. Now the fragment selects which section is shown rather than scrolling
// to one.
//
// And the browser's own find could reach every section when they were all
// visible. It reaches only the current one now, which is the cost of this
// layout.
//
// A section is one of three kinds. Most hold prose. A quiz holds questions on
// the parts before it, and a practice section holds problems to work through
// with the library. The two that can be finished report themselves to the
// progress this browser keeps, and the lesson declares how many of them it
// has, which is what lets the course map say a lesson is done.

import {
  ReactNode,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useSyncExternalStore,
} from "react";
import { usePathname } from "next/navigation";
import { QuizDeck, RevisitLink } from "./QuizDeck";
import { PracticeDeck, PracticeSetup } from "./PracticeDeck";
import { declareRequired, markFinished } from "@/lib/progress";
import type { QuizQuestion } from "@/lib/quizzes";
import type { Exercise } from "@/lib/exercises";

export interface NavigableSection {
  title: string;
  id: string;
  content?: ReactNode;
  quiz?: QuizQuestion[];
  practice?: Exercise[];
}

export type SectionKind = "prose" | "quiz" | "practice";

export function kindOf(section: NavigableSection): SectionKind {
  if (section.practice && section.practice.length > 0) return "practice";
  if (section.quiz && section.quiz.length > 0) return "quiz";
  return "prose";
}

function subscribeToHash(onChange: () => void) {
  window.addEventListener("hashchange", onChange);
  window.addEventListener("popstate", onChange);
  return () => {
    window.removeEventListener("hashchange", onChange);
    window.removeEventListener("popstate", onChange);
  };
}

const readHash = () => window.location.hash.replace(/^#/, "");

// The server has no address bar, and an empty fragment is what a lesson opened
// from its own link has, so the two agree and hydration finds what it rendered.
const noHash = () => "";

// Restoring the scroll position has to happen before the browser paints, or the
// reader sees the page jump and come back. There is no layout to measure on the
// server, and the effect only ever matters after a click, so the server gets the
// ordinary effect and never warns about the layout one.
const useBeforePaint = typeof window === "undefined" ? useEffect : useLayoutEffect;

// The parts a quiz says it covers, read off its title. "Parts 3 to 5" names a
// range, "Parts 1 and 2" a list, "Part 4" one part, and the primers say
// "Sections" where the lessons say "Parts".
function partsNamed(title: string): number[] {
  const numbers = (title.match(/\d+/g) ?? []).map(Number);
  if (numbers.length === 2 && /\d+\s+to\s+\d+/.test(title) && numbers[1] > numbers[0]) {
    return Array.from({ length: numbers[1] - numbers[0] + 1 }, (_, at) => numbers[0] + at);
  }
  return numbers;
}

// The prose sections a quiz draws on: the ones its title names, or failing
// that, everything since the previous quiz or practice section.
function sourcesOf(sections: NavigableSection[], index: number): number[] {
  const named = partsNamed(sections[index].title);
  const matches = sections.flatMap((section, at) => {
    const numbered = section.title.match(/^(?:Part\s+)?(\d+)\./);
    return numbered && named.includes(Number(numbered[1])) && at !== index ? [at] : [];
  });
  if (matches.length > 0) return matches;

  let start = index - 1;
  while (start >= 0 && kindOf(sections[start]) === "prose") start--;
  return Array.from({ length: index - start - 1 }, (_, at) => start + 1 + at);
}

export function SectionNavigator({
  sections,
  initial = 0,
}: {
  sections: NavigableSection[];
  initial?: number;
}) {
  const headingRef = useRef<HTMLHeadingElement>(null);
  const settled = useRef(false);
  const keepScroll = useRef<number | null>(null);
  const lesson = usePathname() ?? "";

  const rawHash = useSyncExternalStore(subscribeToHash, readHash, noHash);

  let hash = "";
  try {
    hash = decodeURIComponent(rawHash);
  } catch {
    hash = rawHash;
  }

  // A fragment naming a section selects it. Anything else, including the empty
  // fragment of the bare lesson URL, falls back to the section it starts on.
  const named = sections.findIndex((section) => section.id === hash);
  const current = named >= 0 ? named : Math.min(Math.max(initial, 0), sections.length - 1);

  const goTo = useCallback(
    (index: number) => {
      const clamped = Math.min(Math.max(index, 0), sections.length - 1);
      if (clamped === current) return;
      keepScroll.current = window.scrollY;
      // pushState gives back a section rather than the page before the lesson,
      // and raises popstate itself because pushState alone notifies nobody.
      window.history.pushState(null, "", `#${sections[clamped].id}`);
      window.dispatchEvent(new PopStateEvent("popstate"));
    },
    [current, sections],
  );

  // Sections differ in height, so a move can leave the page shorter than the
  // reader's scroll position, which a browser answers by clamping that position
  // to the new bottom. Putting it back before anything is painted is what keeps
  // the page still.
  useBeforePaint(() => {
    if (keepScroll.current === null) return;
    const previous = keepScroll.current;
    keepScroll.current = null;
    window.scrollTo(0, previous);
  }, [current]);

  // Moving between sections deliberately does not scroll. Focus moves to the
  // new heading, with scrolling suppressed, so a reader on a keyboard or a
  // screen reader is told the content changed without the page moving
  // underneath anyone else. The first render is skipped so that opening a
  // lesson does not take focus away from the document.
  useEffect(() => {
    if (!settled.current) {
      settled.current = true;
      return;
    }
    headingRef.current?.focus({ preventScroll: true });
  }, [current]);

  // Arrow keys, but not while the reader is inside a widget's own controls,
  // where left and right mean something to the control rather than the page.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.ctrlKey || event.metaKey || event.altKey) return;
      const target = event.target as HTMLElement | null;
      if (target?.closest("input, select, textarea, [contenteditable], svg")) return;
      if (event.key === "ArrowLeft") goTo(current - 1);
      if (event.key === "ArrowRight") goTo(current + 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [current, goTo]);

  // How much of this lesson there is to finish, told to the record once the
  // page is open. A store write rather than React state, which is why it can
  // live in an effect.
  const finishable = sections.filter((section) => kindOf(section) !== "prose").length;
  useEffect(() => {
    if (lesson) declareRequired(lesson, finishable);
  }, [lesson, finishable]);

  if (sections.length === 0) return null;

  return (
    <div className="border-t border-line">
      <Controls sections={sections} current={current} onGo={goTo} />

      {/*
        Every section stays rendered and only one is displayed. Unmounting the
        others saved their widgets from fitting models that were not on screen,
        but it also meant the section being moved to had no height yet, because
        those widgets produce their content after mounting. The document was
        therefore briefly shorter than the reader's scroll position, the browser
        clamped that position to the new bottom, and the page jumped to the top
        on the way to a section that a moment later was tall enough to have held
        it. Keeping them rendered makes a move instant and the height known,
        which is what lets the page stay still.
      */}
      {sections.map((entry, index) => {
        const kind = kindOf(entry);
        const revisit: RevisitLink[] =
          kind === "quiz"
            ? sourcesOf(sections, index).map((at) => ({
                title: sections[at].title,
                go: () => goTo(at),
              }))
            : [];
        return (
          <section
            key={entry.id}
            id={entry.id}
            className="py-6"
            style={index === current ? undefined : { display: "none" }}
            aria-hidden={index === current ? undefined : true}
          >
            {kind !== "prose" && (
              <p className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-accent-soft px-2.5 py-0.5 font-mono text-xs text-accent">
                {kind === "quiz" ? "Check yourself" : "Practice with the library"}
              </p>
            )}
            <h2
              ref={index === current ? headingRef : undefined}
              tabIndex={-1}
              className="mb-4 scroll-mt-6 text-2xl font-semibold tracking-tight text-foreground outline-none"
            >
              {entry.title}
            </h2>
            {entry.content && (
              <div className="space-y-4 leading-7 text-slate-700 dark:text-slate-300">
                {entry.content}
              </div>
            )}
            {kind === "quiz" && (
              <QuizDeck
                questions={entry.quiz as QuizQuestion[]}
                revisit={revisit}
                onFinished={() => lesson && markFinished(lesson, entry.id)}
              />
            )}
            {kind === "practice" && (
              <>
                <PracticeSetup />
                <PracticeDeck
                  exercises={entry.practice as Exercise[]}
                  onFinished={() => lesson && markFinished(lesson, entry.id)}
                />
              </>
            )}
          </section>
        );
      })}
    </div>
  );
}

function Controls({
  sections,
  current,
  onGo,
}: {
  sections: NavigableSection[];
  current: number;
  onGo: (index: number) => void;
}) {
  const first = current === 0;
  const last = current === sections.length - 1;

  return (
    <div className="py-4">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <ArrowButton
          direction="back"
          disabled={first}
          label={first ? "No earlier section" : `Previous section, ${sections[current - 1].title}`}
          onClick={() => onGo(current - 1)}
        />

        <label className="flex min-w-0 flex-1 items-center gap-2 text-sm text-muted">
          <span className="sr-only">Choose a section</span>
          <select
            value={current}
            onChange={(event) => onGo(Number(event.target.value))}
            className="min-w-0 flex-1 truncate rounded-md border border-line bg-surface px-3 py-2 text-sm font-medium text-foreground"
          >
            {sections.map((entry, index) => {
              const kind = kindOf(entry);
              // A practice section is titled "Practice. ..." already, and a
              // quiz "Questions on ...", so the prefix is only added where the
              // title does not already say what the section is.
              const word = kind === "quiz" ? "Quiz" : kind === "practice" ? "Practice" : "";
              const prefix =
                word && !entry.title.toLowerCase().startsWith(word.toLowerCase())
                  ? `${word} · `
                  : "";
              return (
                <option key={entry.id} value={index}>
                  {prefix}
                  {entry.title}
                </option>
              );
            })}
          </select>
        </label>

        <span className="shrink-0 font-mono text-xs tabular-nums text-muted">
          {current + 1} / {sections.length}
        </span>

        <ArrowButton
          direction="forward"
          disabled={last}
          label={last ? "No later section" : `Next section, ${sections[current + 1].title}`}
          onClick={() => onGo(current + 1)}
        />
      </div>

      {/* One segment a section, filled as far as the reader has come. */}
      <ol className="mt-3 flex gap-1" aria-hidden="true">
        {sections.map((entry, index) => (
          <li
            key={entry.id}
            className={
              "h-1 flex-1 rounded-full transition-colors " +
              (index === current
                ? "bg-accent-fill"
                : index < current
                  ? "bg-accent-fill/50"
                  : "bg-line")
            }
          />
        ))}
      </ol>
      <p className="mt-2 hidden font-mono text-xs text-muted sm:block">
        The arrow keys move between sections too.
      </p>
    </div>
  );
}

function ArrowButton({
  direction,
  disabled,
  label,
  onClick,
}: {
  direction: "back" | "forward";
  disabled: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className="shrink-0 rounded-md border border-line bg-surface px-3 py-2 text-foreground transition hover:bg-raised disabled:opacity-40 disabled:hover:bg-surface"
    >
      <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" className="h-5 w-5">
        {direction === "back" ? (
          <path
            fillRule="evenodd"
            d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z"
            clipRule="evenodd"
          />
        ) : (
          <path
            fillRule="evenodd"
            d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
            clipRule="evenodd"
          />
        )}
      </svg>
    </button>
  );
}
