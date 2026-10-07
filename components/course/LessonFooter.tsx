"use client";

// The way on from a lesson, under it.
//
// A reader who has reached the end of a lesson should not have to climb back
// to the course map to find the next one. The two links here follow the
// curriculum's reading order, across section boundaries, so the whole course
// can be read by pressing the same link a hundred times.

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { LessonLocation } from "@/lib/course-navigation";

export function LessonFooter({ locations }: { locations: Record<string, LessonLocation> }) {
  const pathname = usePathname();
  const lesson = pathname ? locations[pathname.replace(/\/$/, "")] : undefined;
  if (!lesson) return null;

  return (
    <nav
      aria-label="Adjacent lessons"
      className="mx-auto grid max-w-3xl gap-4 border-t border-line px-6 py-8 sm:grid-cols-2"
    >
      {lesson.previous ? (
        <Link
          href={lesson.previous.href}
          className="group rounded-xl border border-line bg-surface p-4 transition hover:border-accent-fill/60 hover:bg-raised"
        >
          <span className="mb-1 block font-mono text-xs text-muted">← Previous lesson</span>
          <span className="font-semibold text-foreground group-hover:text-accent">
            {lesson.previous.title}
          </span>
        </Link>
      ) : (
        <span />
      )}
      {lesson.next ? (
        <Link
          href={lesson.next.href}
          className="group rounded-xl border border-line bg-surface p-4 transition hover:border-accent-fill/60 hover:bg-raised sm:text-right"
        >
          <span className="mb-1 block font-mono text-xs text-muted">Next lesson →</span>
          <span className="font-semibold text-foreground group-hover:text-accent">
            {lesson.next.title}
          </span>
        </Link>
      ) : (
        <Link
          href="/"
          className="group rounded-xl border border-line bg-surface p-4 transition hover:border-accent-fill/60 hover:bg-raised sm:text-right"
        >
          <span className="mb-1 block font-mono text-xs text-muted">That is the last lesson</span>
          <span className="font-semibold text-foreground group-hover:text-accent">
            Back to the course
          </span>
        </Link>
      )}
    </nav>
  );
}
