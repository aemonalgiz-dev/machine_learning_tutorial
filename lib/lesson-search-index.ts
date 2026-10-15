import { LEARNING_AREAS, learningAreaSections } from "./learning-areas";
import { courseSectionHref } from "./course-navigation";
import type { SearchEntry } from "./lesson-search";

// Only the search page sends this index to the browser.
export const searchEntries: SearchEntry[] = LEARNING_AREAS.flatMap(area => learningAreaSections(area).flatMap(section => [
  { title: section.title, description: section.intro, href: courseSectionHref(section), areaId: area.id, areaTitle: area.title, sectionTitle: section.title, kind: "Section" as const, terms: section.topics.map(topic => topic.heading).join(" ") },
  ...section.topics.flatMap(topic => topic.concepts.flatMap(lesson => lesson.href ? [{ title: lesson.title, description: lesson.blurb, href: lesson.href, areaId: area.id, areaTitle: area.title, sectionTitle: section.title, kind: "Lesson" as const, terms: `${topic.heading} ${lesson.href.split("/").pop()?.replaceAll("-", " ")}` }] : [])),
]));
