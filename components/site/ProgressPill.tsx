"use client";

// How much of the course this browser has finished, in the header of every
// page. The count is lessons, because that is the unit a reader plans in.

import { finishedCount, useProgress } from "@/lib/progress";
import { lessonOrder } from "@/lib/course-navigation";

export function ProgressPill() {
  const lessons = lessonOrder;
  const progress = useProgress();
  const done = finishedCount(progress, lessons);
  const share = lessons.length === 0 ? 0 : Math.round((100 * done) / lessons.length);

  return (
    <span
      title={`${done} of ${lessons.length} lessons finished in this browser`}
      className="hidden items-center gap-2 rounded-full border border-line bg-surface px-3 py-1 font-mono text-xs text-muted sm:inline-flex"
    >
      <span className="h-1.5 w-16 overflow-hidden rounded-full bg-raised" aria-hidden="true">
        <span className="block h-full rounded-full bg-accent-fill" style={{ width: `${share}%` }} />
      </span>
      <span className="tabular-nums">
        {done} / {lessons.length}
      </span>
    </span>
  );
}
