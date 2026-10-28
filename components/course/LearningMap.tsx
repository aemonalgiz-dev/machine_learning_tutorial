"use client";

import Link from "next/link";
import { LEARNING_AREAS, learningAreaHref, learningAreaSections } from "@/lib/learning-areas";
import { lessonHrefs } from "@/lib/course-navigation";
import { useLearningMap, workshopHref } from "@/lib/learning-map";
import { useRecentJourney } from "@/lib/journey-progress";

const emblems = ["∑", "▤", "⌁", "◇", "{ }", "⇄", "✧", "▦", "⌾", "⬡", "∿"];

export function LearningAreas() {
  const { milestones } = useLearningMap();
  const recent = useRecentJourney();
  return <nav aria-label="Learning areas"><ol className="learning-areas">
    {LEARNING_AREAS.map((area, index) => {
      const sections = learningAreaSections(area);
      const lessons = sections.flatMap(lessonHrefs);
      const built = lessons.filter(lesson => milestones(lesson).built).length;
      const active = lessons.some(lesson => workshopHref(lesson) === recent?.href);
      return <li key={area.id}><Link href={learningAreaHref(area)} aria-label={area.title} className={`area-card ${active ? "is-current" : ""}`}>
        <span className="area-emblem" aria-hidden="true">{emblems[index] ?? "◇"}</span>
        <span className="min-w-0 flex-1">
          <span className="mb-2 flex flex-wrap items-center gap-3 font-mono text-[11px] uppercase tracking-widest text-muted">
            <span>{sections.length} {sections.length === 1 ? "section" : "sections"} · {lessons.length} {lessons.length === 1 ? "lesson" : "lessons"}</span>
            {active && <span className="current-label">Your current path</span>}
          </span>
          <span className="block text-lg font-semibold">{area.title}</span>
          <span className="mt-2 block max-w-3xl text-sm leading-6 text-muted">{area.description}</span>
          {built > 0 && <span className="mt-3 block text-xs text-[var(--success)]">✓ {built} {built === 1 ? "workshop tested" : "workshops tested"}</span>}
        </span>
        <span className="area-arrow" aria-hidden="true">↗</span>
      </Link></li>;
    })}
  </ol></nav>;
}

export function PathProgress({ lessons, compact = false, variant = "panel" }: { lessons: string[]; compact?: boolean; variant?: "panel" | "header" }) {
  const { milestones } = useLearningMap();
  const built = lessons.filter(lesson => milestones(lesson).built).length;
  const exercises = lessons.filter(lesson => milestones(lesson).exercises).length;
  if (compact && variant !== "header" && !built && !exercises) return null;
  return <div className={variant === "header" ? "mb-6 w-full" : compact ? "mx-5 mb-5" : "path-progress"}>
    <div className="flex flex-wrap justify-between gap-2 text-xs"><span>Workshop checks passed</span><span className="font-mono text-accent">{built} / {lessons.length}</span></div>
    <div role="progressbar" aria-label="Workshops tested" aria-valuemin={0} aria-valuemax={lessons.length || 1} aria-valuenow={built} className="path-track"><span style={{ width: `${lessons.length ? built / lessons.length * 100 : 0}%` }} /></div>
    {variant !== "header" && (exercises > 0 || !compact) && <p className="mt-2 text-xs text-muted">{exercises ? `${exercises} ${exercises === 1 ? "lesson's exercises completed" : "lessons' exercises completed"}.` : "Your tested constructions will mark the path as you go."}</p>}
  </div>;
}

export function LessonTrailCard({ href, title, description, number }: { href: string; title: string; description: string; number: number }) {
  const { milestones } = useLearningMap();
  const recent = useRecentJourney();
  const state = milestones(href);
  const active = recent?.href === workshopHref(href);
  const complete = state.built && state.varied && state.exercises;
  return <div className={`trail-card ${active ? "is-current" : ""} ${complete ? "is-earned" : ""}`}>
    <span className="trail-node" aria-label={`Lesson ${number}${complete ? ", milestones completed" : ""}`}>{complete ? "✓" : String(number).padStart(2, "0")}</span>
    <div className="min-w-0">
      <div className="mb-2 flex flex-wrap gap-3 text-xs text-muted">{active ? <span className="current-label">You are here</span> : <span>{complete ? "Milestones completed" : state.started ? "In progress" : "Ready to explore"}</span>}</div>
      <Link href={href} className="text-lg font-semibold hover:text-accent">{title}</Link>
      <p className="mt-2 text-sm leading-6 text-muted">{description}</p>
      <ul className="milestone-tags" aria-label={`${title} milestones`}>
        {([["built", "Built"], ["varied", "Changed inputs"], ["exercises", "Exercises"]] as const).map(([key, label]) => <li key={key} data-earned={state[key]}><span aria-hidden="true">{state[key] ? "✓" : "○"}</span> {label}<span className="sr-only">{state[key] ? ": completed" : ": not completed"}</span></li>)}
      </ul>
      {active && <div className="mt-4"><Link href={workshopHref(href)} className="game-button">Continue building →</Link></div>}
    </div>
  </div>;
}
