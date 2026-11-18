import { CURRICULUM } from "./curriculum";
import { courseSectionHref, lessonHrefs } from "./course-navigation";
import { LEARNING_AREAS, learningAreaHref, learningAreaSections } from "./learning-areas";
import { labHref, labLessonById } from "./labs";
import { buildById } from "./builds/catalog";

/** Public content only. Private account and paid-case URLs are not discovery targets. */
export function publicSitePaths(): string[] {
  return [...new Set([
    "/", "/about", "/privacy", "/membership", "/practice", "/lab", "/lab/workshop-guide",
    ...LEARNING_AREAS.filter(area => learningAreaSections(area).length > 0).map(learningAreaHref),
    ...CURRICULUM.map(courseSectionHref),
    ...CURRICULUM.flatMap(lessonHrefs),
    ...Object.keys(buildById).filter(id => Object.hasOwn(labLessonById, id)).map(labHref),
  ])].sort();
}
