"use client";

import Link from "next/link";
import type { ReactNode } from "react";

export interface LessonDestination {
  title: string;
  href: string;
  kind: "page" | "lesson" | "area";
}

export function LessonFooter({ previous, next, current, total, onGo, contents }: {
  previous?: LessonDestination;
  next?: LessonDestination;
  current: number;
  total: number;
  onGo: (index: number) => void;
  contents: ReactNode;
}) {
  return (
    <nav aria-label="Lesson navigation" className="mx-auto max-w-[45rem] border-t border-line py-6">
      <div className="mb-4 flex items-start justify-between gap-4">
        <p className="shrink-0 pt-2 font-mono text-xs tabular-nums text-muted">Page {current + 1} of {total}</p>
        <details className="min-w-0 max-w-sm flex-1">
          <summary className="cursor-pointer py-2 text-right text-sm text-muted hover:text-foreground">Lesson contents</summary>
          {contents}
        </details>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        <Destination direction="previous" destination={previous} onGo={() => onGo(current - 1)} />
        <Destination direction="next" destination={next} onGo={() => onGo(current + 1)} />
      </div>
    </nav>
  );
}

function Destination({ direction, destination, onGo }: {
  direction: "previous" | "next";
  destination?: LessonDestination;
  onGo: () => void;
}) {
  if (!destination) return <span />;
  const backwards = direction === "previous";
  const label = destination.kind === "area" ? "Back to learning area" : `${backwards ? "Previous" : "Next"} ${destination.kind}`;
  const className = "group min-w-0 rounded-xl border border-line bg-surface p-4 transition hover:border-accent-fill/60 hover:bg-raised focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent " + (backwards ? "text-left" : "text-right");
  const content = <>
    <span className={"mb-1 flex items-center gap-2 font-mono text-xs text-muted " + (backwards ? "" : "justify-end")}>
      {backwards && <span aria-hidden="true" className="shrink-0">←</span>}
      {label}
      {!backwards && <span aria-hidden="true" className="shrink-0">→</span>}
    </span>
    <span className="block break-words text-sm font-semibold text-foreground group-hover:text-accent sm:text-base">{destination.title}</span>
  </>;

  // Links preserve opening a page in a new tab. Ordinary clicks use the
  // navigator so the next heading receives focus and is scrolled into view.
  return <Link href={destination.href} className={className} onClick={event => {
    if (destination.kind !== "page" || event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    onGo();
  }}>{content}</Link>;
}
