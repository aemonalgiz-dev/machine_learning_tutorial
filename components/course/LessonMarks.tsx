"use client";

// The marks the course map carries, read from the progress this browser keeps.
//
// A lesson has one of three states. Untouched shows nothing, which is most of
// the course for most readers and should not look like a wall of empty boxes.
// Started shows a hollow ring, finished a filled tick. A section shows how
// many of its lessons are finished, as a bar, because a bar can be read from
// across the room.

import { lessonFinished, lessonStarted, useProgress } from "@/lib/progress";

export function LessonMark({ lesson }: { lesson: string }) {
  const progress = useProgress();
  const finished = lessonFinished(progress, lesson);
  const started = lessonStarted(progress, lesson);

  if (finished) {
    return (
      <span
        role="img"
        aria-label="Finished"
        title="Finished"
        className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent-fill text-accent-ink"
      >
        <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" className="h-3.5 w-3.5">
          <path
            fillRule="evenodd"
            d="M16.7 5.3a1 1 0 010 1.4l-8 8a1 1 0 01-1.4 0l-4-4a1 1 0 111.4-1.4L8 12.6l7.3-7.3a1 1 0 011.4 0z"
            clipRule="evenodd"
          />
        </svg>
      </span>
    );
  }

  if (started) {
    return (
      <span
        role="img"
        aria-label="Started"
        title="Started"
        className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 border-accent-fill"
      >
        <span className="h-2 w-2 rounded-full bg-accent-fill" />
      </span>
    );
  }

  return <span aria-hidden="true" className="inline-block h-6 w-6 shrink-0 rounded-full border border-line" />;
}

export function SectionProgress({ lessons }: { lessons: string[] }) {
  const progress = useProgress();
  const done = lessons.filter((lesson) => lessonFinished(progress, lesson)).length;
  const share = lessons.length === 0 ? 0 : (100 * done) / lessons.length;

  return (
    <div className="flex items-center gap-3">
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-raised" aria-hidden="true">
        <div className="h-full rounded-full bg-accent-fill transition-[width]" style={{ width: `${share}%` }} />
      </div>
      <span className="shrink-0 font-mono text-xs tabular-nums text-muted">
        {done} of {lessons.length} finished
      </span>
    </div>
  );
}
