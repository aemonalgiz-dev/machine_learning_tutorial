"use client";

// Where a lesson sits in the course, above its title.
//
// The section and the lesson's position in it are the two things a reader
// wants before the title: which part of the course they are in, and how far
// through it they are. Both come from the curriculum rather than the page, so
// moving a lesson in the curriculum moves the figures with it.

import Link from "next/link";
import { usePathname } from "next/navigation";
import { lessonLocations } from "@/lib/course-navigation";

export function CourseBreadcrumbs() {
  const pathname = usePathname();
  const lesson = pathname ? lessonLocations[pathname.replace(/\/$/, "")] : undefined;
  if (!lesson) return null;
  return (
    <nav
      aria-label="Course location"
      className="mx-auto flex max-w-3xl flex-wrap items-center gap-x-3 gap-y-1 px-6 pt-8 font-mono text-xs text-muted"
    >
      <Link href="/" className="transition hover:text-foreground">
        All sections
      </Link>
      <span aria-hidden="true">/</span>
      <Link href={lesson.sectionHref} className="transition hover:text-foreground">
        Section {lesson.sectionNumber} · {lesson.sectionTitle}
      </Link>
      <span aria-hidden="true">/</span>
      <span aria-current="page" className="text-accent">
        Lesson {lesson.position} of {lesson.count}
      </span>
    </nav>
  );
}
