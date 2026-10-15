"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { searchLessons, type SearchEntry } from "@/lib/lesson-search";

type Props = { entries: SearchEntry[]; areas: { id: string; title: string }[] };

export function LessonSearch(props: Props) {
  const params = useSearchParams();
  const query = params.get("q") ?? "";
  const area = params.get("area") ?? "";
  return <SearchResults key={`${query}:${area}`} {...props} initialQuery={query} initialArea={area} />;
}

function SearchResults({ entries, areas, initialQuery, initialArea }: Props & { initialQuery: string; initialArea: string }) {
  const [query, setQuery] = useState(initialQuery);
  const [area, setArea] = useState(areas.some(area => area.id === initialArea) ? initialArea : "");
  const [limit, setLimit] = useState(20);
  const matches = searchLessons(entries, query, area);
  const visible = matches.slice(0, limit);
  return <>
    <form action="/search" role="search" className="mb-7 space-y-4">
      <label className="block text-sm font-semibold">Search lessons and sections
        <input name="q" type="search" value={query} onChange={event => { setQuery(event.target.value); setLimit(20); }} placeholder="Try attention, matrices, or Python" className="mt-2 min-h-12 w-full rounded-lg border border-line bg-surface px-4 text-base font-normal" />
      </label>
      <div className="flex flex-wrap items-end gap-3">
        <div className="min-w-0 flex-1 text-sm">
          <label htmlFor="learning-area-filter">Learning area</label>
          <select id="learning-area-filter" name="area" value={area} onChange={event => { setArea(event.target.value); setLimit(20); }} className="mt-2 min-h-11 w-full rounded-lg border border-line bg-surface px-3 text-base">
            <option value="">All learning areas</option>
            {areas.map(area => <option key={area.id} value={area.id}>{area.title}</option>)}
          </select>
        </div>
        <button className="min-h-11 rounded-lg bg-accent-fill px-5 text-sm font-semibold text-accent-ink" type="submit">Search</button>
      </div>
    </form>
    <p role="status" className="mb-4 text-sm text-muted">{matches.length} {matches.length === 1 ? "result" : "results"}{query.trim() ? ` for “${query.trim()}”` : ""}{matches.length > visible.length ? `. Showing ${visible.length}.` : "."}</p>
    {!matches.length && <div className="rounded-xl border border-line bg-surface p-6"><p>No lessons or sections match this search. Try a broader term or another learning area.</p><Link href="/#course" className="mt-3 inline-flex min-h-11 items-center text-sm text-accent hover:underline">Browse the learning areas →</Link></div>}
    <ul className="space-y-3">{visible.map(entry => <li key={entry.href}>
      <Link href={entry.href} className="group block rounded-xl border border-line bg-surface p-5 hover:border-accent-fill/60 hover:bg-raised">
        <p className="text-xs leading-5 text-muted">{entry.areaTitle} · {entry.kind}{entry.kind === "Lesson" ? ` · ${entry.sectionTitle}` : ""}</p>
        <h2 className="mt-2 text-lg font-semibold group-hover:text-accent">{entry.title}</h2>
        <p className="mt-2 text-sm leading-6 text-muted">{entry.description}</p>
      </Link>
    </li>)}</ul>
    {visible.length < matches.length && <button type="button" onClick={() => setLimit(limit + 20)} className="mt-6 min-h-11 rounded-lg border border-line bg-surface px-5 text-sm font-semibold hover:bg-raised">Show more results</button>}
  </>;
}
