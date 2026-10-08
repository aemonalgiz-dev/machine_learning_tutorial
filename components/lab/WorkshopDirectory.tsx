"use client";
import Link from "next/link";
import { useState } from "react";

export function WorkshopDirectory({ sections }: { sections: { title: string; lessons: { id: string; title: string; mission: string; href: string }[] }[] }) {
  const [search, setSearch] = useState("");
  const query = search.toLowerCase().trim();
  const visible = sections.map(s => ({ ...s, lessons: s.lessons.filter(l => `${s.title} ${l.title} ${l.mission}`.toLowerCase().includes(query)) })).filter(s => s.lessons.length);
  return <div><label className="mb-6 block text-sm font-semibold">Find a workshop<input type="search" value={search} onChange={e => setSearch(e.target.value)} placeholder="Try attention, tokens, or statistics" className="mt-2 min-h-12 w-full rounded-xl border border-line bg-surface px-4 text-base font-normal text-foreground" /></label>
    {!visible.length && <p className="py-8 text-muted">No workshops match that search. Try a lesson name or a course section.</p>}
    <div className="space-y-5">{visible.map(s => <section key={s.title} className="overflow-hidden rounded-2xl border border-line bg-surface"><h2 className="border-b border-line bg-raised px-5 py-4 text-lg font-semibold">{s.title}</h2><ul className="divide-y divide-line">{s.lessons.map(l => <li key={l.id}><Link href={l.href} className="group flex min-h-20 items-center justify-between gap-4 px-5 py-4 hover:bg-accent-soft"><span className="min-w-0"><span className="block font-semibold group-hover:text-accent">{l.mission}</span><span className="mt-1 block text-sm text-muted">{l.title}</span></span><span aria-hidden="true" className="shrink-0 text-accent">→</span></Link></li>)}</ul></section>)}</div>
  </div>;
}
