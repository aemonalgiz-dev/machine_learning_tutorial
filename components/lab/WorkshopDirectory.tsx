"use client";
import Link from "next/link";
import { useState } from "react";
import { journeyStatus, savedWorkshopStatus, useJourneySnapshot, useSavedWorkshopSummary } from "@/lib/journey-progress";

interface WorkshopLink { id: string; title: string; mission: string; href: string; draftVersion?: number; cases: number }

function WorkshopEntry({ lesson }: { lesson: WorkshopLink }) {
  const progress = useJourneySnapshot(lesson.id, lesson.mission, lesson.href);
  const saved = useSavedWorkshopSummary(lesson.id, lesson.draftVersion);
  const status = journeyStatus(progress);
  const existing = savedWorkshopStatus(saved, lesson.cases);
  const useCurrent = Boolean(progress.built || progress.transferred || !existing);
  const label = useCurrent ? status?.label : existing;
  return <li><Link href={lesson.href} className="group flex min-h-20 items-center justify-between gap-4 px-5 py-4 hover:bg-accent-soft">
    <span className="min-w-0">
      <span className="block font-semibold group-hover:text-accent">{lesson.mission}</span>
      <span className="mt-1 block text-sm text-muted">{lesson.title}</span>
      {label && <span className="mt-2 inline-block rounded-md border border-line bg-raised px-2 py-1 text-xs text-muted" title={useCurrent ? status?.detail : undefined}>{label}</span>}
    </span>
    <span aria-hidden="true" className="shrink-0 text-accent">→</span>
  </Link></li>;
}

export function WorkshopDirectory({ sections }: { sections: { title: string; lessons: WorkshopLink[] }[] }) {
  const [search, setSearch] = useState("");
  const query = search.toLowerCase().trim();
  const visible = sections.map(s => ({ ...s, lessons: s.lessons.filter(l => `${s.title} ${l.title} ${l.mission}`.toLowerCase().includes(query)) })).filter(s => s.lessons.length);
  return <div><label className="mb-6 block text-sm font-semibold">Find a workshop<input type="search" value={search} onChange={e => setSearch(e.target.value)} placeholder="Try attention, tokens, or statistics" className="mt-2 min-h-12 w-full rounded-xl border border-line bg-surface px-4 text-base font-normal text-foreground" /></label>
    <p className="mb-5 text-xs leading-6 text-muted">The labels below record what you have tried and tested. Changing a construction keeps those earlier results in your history.</p>
    {!visible.length && <p className="py-8 text-muted">No workshops match that search. Try a lesson name or a course section.</p>}
    <div className="space-y-5">{visible.map(s => <section key={s.title} className="overflow-hidden rounded-2xl border border-line bg-surface"><h2 className="border-b border-line bg-raised px-5 py-4 text-lg font-semibold">{s.title}</h2><ul className="divide-y divide-line">{s.lessons.map(l => <WorkshopEntry key={l.id} lesson={l} />)}</ul></section>)}</div>
  </div>;
}
