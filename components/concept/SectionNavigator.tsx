"use client";

// One page at a time. The footer moves within the lesson, then to neighbouring
// lessons at either end. Its contents menu still allows readers to jump ahead.
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
  useMemo,
  useRef,
  useSyncExternalStore,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import { QuizDeck, RevisitLink } from "./QuizDeck";
import { PracticeDeck } from "./PracticeDeck";
import { declareRequired, markFinished, useProgressAccount } from "@/lib/progress";
import type { QuizQuestion } from "@/lib/quizzes";
import type { Exercise } from "@/lib/exercises";
import { LessonGame } from "@/components/lab/LessonGame";
import type { JourneyData } from "@/lib/builds/journey";
import { lessonLocations } from "@/lib/course-navigation";
import { LessonFooter, type LessonDestination } from "@/components/course/LessonFooter";

export interface NavigableSection {
  title: string;
  id: string;
  content?: ReactNode;
  quiz?: QuizQuestion[];
  practice?: Exercise[];
  game?: string;
  journey?: JourneyData;
}

export type SectionKind = "prose" | "quiz" | "practice" | "game";

export function kindOf(section: NavigableSection): SectionKind {
  if (section.game) return "game";
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

// Move to the new heading before painting so a footer click does not leave the
// reader at the bottom of the next page.
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
  const shownPage = useRef<number | null>(null);
  const lesson = usePathname() ?? "";
  const router = useRouter();
  const location = lessonLocations[lesson.replace(/\/$/, "")];
  const accountId = useProgressAccount();

  const rawHash = useSyncExternalStore(subscribeToHash, readHash, noHash);

  let hash = "";
  try {
    hash = decodeURIComponent(rawHash);
  } catch {
    hash = rawHash;
  }

  // A fragment naming a section selects it. Anything else, including the empty
  // fragment of the bare lesson URL, falls back to the section it starts on.
  const named = hash === "last-page" ? sections.length - 1 : hash === "practice" ? sections.findIndex(section => kindOf(section) === "practice") : sections.findIndex((section) => section.id === hash);
  const current = named >= 0 ? named : Math.min(Math.max(initial, 0), sections.length - 1);

  const previous = useMemo<LessonDestination | undefined>(() => current > 0
    ? { title: sections[current - 1].title, href: `#${sections[current - 1].id}`, kind: "page" }
    : location?.previous
      ? { ...location.previous, href: `${location.previous.href}#last-page`, kind: "lesson" }
      : location ? { title: location.areaTitle, href: location.areaHref, kind: "area" } : undefined, [current, sections, location]);
  const next = useMemo<LessonDestination | undefined>(() => current < sections.length - 1
    ? { title: sections[current + 1].title, href: `#${sections[current + 1].id}`, kind: "page" }
    : location?.next
      ? { ...location.next, kind: "lesson" }
      : location ? { title: location.areaTitle, href: location.areaHref, kind: "area" } : undefined, [current, sections, location]);

  const goTo = useCallback(
    (index: number) => {
      const clamped = Math.min(Math.max(index, 0), sections.length - 1);
      if (clamped === current) return;
      // pushState gives back a section rather than the page before the lesson,
      // and raises popstate itself because pushState alone notifies nobody.
      window.history.pushState(window.history.state, "", `#${sections[clamped].id}`);
      window.dispatchEvent(new PopStateEvent("popstate"));
    },
    [current, sections],
  );

  // A previous-lesson link opens its last page without having to ship every
  // lesson's page list. Replace the alias with that page's permanent bookmark.
  useBeforePaint(() => {
    if (hash !== "last-page" || !sections.length) return;
    window.history.replaceState(window.history.state, "", `#${sections[sections.length - 1].id}`);
    window.dispatchEvent(new PopStateEvent("popstate"));
  }, [hash, sections]);

  useBeforePaint(() => {
    const before = shownPage.current;
    shownPage.current = current;
    if (before === null || before === current) return;
    headingRef.current?.focus({ preventScroll: true });
    headingRef.current?.scrollIntoView({ block: "start", behavior: "instant" });
  }, [current]);

  // Arrow keys, but not while the reader is inside a widget's own controls,
  // where left and right mean something to the control rather than the page.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.defaultPrevented || event.ctrlKey || event.metaKey || event.altKey || event.shiftKey) return;
      const target = event.target as HTMLElement | null;
      if (target?.closest("input, select, textarea, button, a, summary, [contenteditable], [role='slider'], [role='tablist'], [role='grid'], svg")) return;
      const direction = event.key === "ArrowLeft" ? -1 : event.key === "ArrowRight" ? 1 : 0;
      if (!direction) return;
      const destination = direction < 0 ? previous : next;
      if (!destination) return;
      event.preventDefault();
      if (destination.kind === "page") goTo(current + direction);
      else router.push(destination.href);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [current, goTo, previous, next, router]);

  // How much of this lesson there is to finish, told to the record once the
  // page is open. A store write rather than React state, which is why it can
  // live in an effect.
  const finishable = sections.filter((section) => kindOf(section) === "quiz" || kindOf(section) === "practice").length;
  useEffect(() => {
    if (lesson) declareRequired(lesson, finishable);
  }, [lesson, finishable, accountId]);

  if (sections.length === 0) return null;

  return (
    <div className="min-w-0">
      {/* Keep each page mounted so navigating back preserves its widget state. */}
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
            className={"mx-auto min-w-0 py-6" + (kind === "practice" || kind === "game" ? " w-full" : " max-w-[45rem]")}
            style={index === current ? undefined : { display: "none" }}
            aria-hidden={index === current ? undefined : true}
          >
            {kind !== "prose" && (
              <p className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-accent-soft px-2.5 py-0.5 font-mono text-xs text-accent">
                {kind === "quiz" ? "Check yourself" : kind === "game" ? "Try it with Botie" : entry.practice?.every(problem => problem.language === "sql") ? "Write and run SQL" : "Write and run Python"}
              </p>
            )}
            <h2
              ref={index === current ? headingRef : undefined}
              tabIndex={-1}
              className="mb-4 scroll-mt-36 text-2xl font-semibold tracking-tight text-foreground outline-none sm:scroll-mt-24"
            >
              {entry.title}
            </h2>
            {entry.content && (
              <div className="space-y-4 leading-7 text-slate-700 dark:text-slate-300">
                {entry.content}
              </div>
            )}
            {kind === "game" && entry.journey && <LessonGame data={entry.journey} active={index === current} />}
            {kind === "quiz" && (
              <QuizDeck
                key={accountId ?? "guest"}
                questions={entry.quiz as QuizQuestion[]}
                lesson={lesson}
                section={entry.id}
                revisit={revisit}
                onFinished={() => lesson && markFinished(lesson, entry.id, accountId)}
              />
            )}
            {kind === "practice" && (
              <PracticeDeck
                key={accountId ?? "guest"}
                exercises={entry.practice as Exercise[]}
                lesson={lesson}
                active={index === current}
                onFinished={() => lesson && markFinished(lesson, entry.id, accountId)}
              />
            )}
          </section>
        );
      })}
      <LessonFooter previous={previous} next={next} current={current} total={sections.length} onGo={goTo}
        contents={<PageMenu sections={sections} current={current} onGo={goTo} />} />
    </div>
  );
}

function PageMenu({ sections, current, onGo }: {
  sections: NavigableSection[];
  current: number;
  onGo: (index: number) => void;
}) {
  const coding = sections.findIndex(entry => kindOf(entry) === "practice");
  const workshop = sections.findIndex(entry => kindOf(entry) === "game");
  return <div className="space-y-3 pb-3 pt-2">
    <label className="block text-sm text-muted">
      Jump to a page
      <select value={current} onChange={event => onGo(Number(event.target.value))}
        className="mt-2 h-11 w-full min-w-0 truncate rounded-md border border-line bg-surface px-3 text-sm text-foreground">
        {sections.map((entry, index) => {
          const kind = kindOf(entry);
          const word = kind === "quiz" ? "Quiz" : kind === "practice" ? "Practice" : "";
          const prefix = word && !entry.title.toLowerCase().startsWith(word.toLowerCase()) ? `${word} · ` : "";
          return <option key={entry.id} value={index}>{prefix}{entry.title}</option>;
        })}
      </select>
    </label>
    <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm">
      {workshop >= 0 && workshop !== current && <button type="button" onClick={() => onGo(workshop)} className="text-accent underline underline-offset-4">Botie&apos;s workshop</button>}
      {coding >= 0 && coding !== current && <button type="button" onClick={() => onGo(coding)} className="text-accent underline underline-offset-4">Coding challenges</button>}
    </div>
  </div>;
}
