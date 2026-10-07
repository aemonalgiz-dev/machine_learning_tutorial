import { CURRICULUM, type Part, type Topic } from "./curriculum";

function anchorOf(title: string): string {
  return title.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export const courseSectionId = (part: Part) => part.id ?? anchorOf(part.title);
export const courseTopicId = (topic: Topic) => topic.id ?? anchorOf(topic.heading);
export const courseSectionHref = (part: Part) => `/sections/${courseSectionId(part)}`;
export const lessonCount = (part: Part) => part.topics.reduce((sum, topic) => sum + topic.concepts.filter(concept => concept.href).length, 0);
export const standsAlone = (part: Part, topic: Topic) => part.topics.length === 1 && topic.heading === part.title;

export const findCourseSection = (id: string) => CURRICULUM.find(part => courseSectionId(part) === id);

// The lessons of one section, in reading order. Only the paths, which is what
// the progress marks need.
export const lessonHrefs = (part: Part): string[] =>
  part.topics.flatMap(topic => topic.concepts.flatMap(concept => (concept.href ? [concept.href] : [])));

// Every lesson on the site in reading order, which is also the order a reader
// is carried through by the link at the end of each one.
export const lessonOrder: string[] = CURRICULUM.flatMap(lessonHrefs);

// The lesson a reader would sensibly start on: the first one after the
// primers, which are there to be returned to rather than read first.
export const firstLesson: string = lessonHrefs(CURRICULUM[1])[0] ?? lessonOrder[0];

export interface LessonLink {
  title: string;
  href: string;
}

export interface LessonLocation {
  title: string;
  sectionTitle: string;
  sectionHref: string;
  // One-based, as a reader counts.
  sectionNumber: number;
  position: number;
  count: number;
  previous?: LessonLink;
  next?: LessonLink;
}

// Pass only the navigation data into client components, not every lesson blurb.
export const lessonLocations: Record<string, LessonLocation> = (() => {
  const all: { href: string; title: string; part: Part; index: number }[] = CURRICULUM.flatMap((part, index) =>
    part.topics.flatMap(topic => topic.concepts.flatMap(concept =>
      concept.href ? [{ href: concept.href, title: concept.title, part, index }] : []
    ))
  );
  return Object.fromEntries(all.map((lesson, at) => {
    const siblings = lessonHrefs(lesson.part);
    const previous = all[at - 1];
    const next = all[at + 1];
    return [lesson.href, {
      title: lesson.title,
      sectionTitle: lesson.part.title,
      sectionHref: courseSectionHref(lesson.part),
      sectionNumber: lesson.index + 1,
      position: siblings.indexOf(lesson.href) + 1,
      count: siblings.length,
      ...(previous ? { previous: { title: previous.title, href: previous.href } } : {}),
      ...(next ? { next: { title: next.title, href: next.href } } : {}),
    }];
  }));
})();

// Old homepage fragment links now open the same topic on its own section page.
export const legacyCourseDestinations: Record<string, string> = Object.fromEntries(
  CURRICULUM.flatMap(part => [
    [courseSectionId(part), courseSectionHref(part)],
    ...part.topics.filter(topic => !standsAlone(part, topic)).map(topic => [
      courseTopicId(topic), `${courseSectionHref(part)}#${courseTopicId(topic)}`,
    ]),
  ]),
);
