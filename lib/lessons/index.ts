import records from "./published.json";
import type { ExpandedLesson } from "./types";

// JSON imports widen discriminants and tuple entries. The authoring checks and
// curriculum integration tests validate these generated records before builds.
export const expandedLessons = records as unknown as ExpandedLesson[];
export const expandedLessonById: Record<string, ExpandedLesson> = Object.fromEntries(expandedLessons.map(lesson => [lesson.id, lesson]));
