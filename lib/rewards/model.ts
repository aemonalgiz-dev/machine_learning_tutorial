import authoredCatalog from "./catalog.json";
import type { Progress } from "../progress";
import { journeyAttemptHistory, validJourneyProgress, type JourneyProgress } from "../journey-progress";

export interface RewardLesson {
  id: string;
  href: string;
  title: string;
  quizzes: string[];
  practice: string[];
  sectionId?: string;
  sectionTitle?: string;
  areaId?: string;
  areaTitle?: string;
}
export interface RewardsCatalog { version: 1; lessons: RewardLesson[] }
export type RewardKind = "quiz" | "practice" | "build" | "transfer" | "connection" | "lesson" | "section" | "area";
export type AchievementCategory = "workshop" | "quiz" | "code" | "course" | "area";
export interface RewardMilestone { id: string; kind: RewardKind; label: string; xp: number; href: string }
export interface AchievementProgress {
  id: string;
  title: string;
  description: string;
  current: number;
  target: number;
  earned: boolean;
  category: AchievementCategory;
  href: string;
}
export interface RewardSummary {
  totalXp: number;
  level: number;
  levelStartXp: number;
  nextLevelXp: number;
  xpIntoLevel: number;
  xpToNextLevel: number;
  levelProgress: number;
  counts: { quizzes: number; practice: number; builds: number; transfers: number; lessons: number; sections: number; areas: number };
  milestones: RewardMilestone[];
  achievements: AchievementProgress[];
  nextAchievement: AchievementProgress | null;
}
export const REWARD_POINTS = Object.freeze({ quiz: 20, practice: 50, build: 60, transfer: 40, connection: 30, lesson: 30, section: 100, area: 250 });
const slug = /^[a-z0-9][a-z0-9-]{0,159}$/;
const lessonPath = /^\/(concepts|primers)\/([a-z0-9][a-z0-9-]{0,140})$/;
const guide = { id: "workshop-guide", title: "Getting started with Botie", href: "/lab/workshop-guide" };
const uniqueIds = (raw: unknown): string[] => Array.isArray(raw) ? [...new Set(raw.filter((value): value is string => typeof value === "string" && slug.test(value)))] : [];
const labHref = (id: string) => `/lab/${id === "neurons-and-activations" ? "neuron" : id}`;

function canonicalLessons(catalog: RewardsCatalog): RewardLesson[] {
  const seenIds = new Set<string>(), seenPaths = new Set<string>();
  return (Array.isArray(catalog?.lessons) ? catalog.lessons : []).flatMap(lesson => {
    if (!lesson || typeof lesson.id !== "string" || typeof lesson.href !== "string" || !slug.test(lesson.id) ||
      lessonPath.exec(lesson.href)?.[2] !== lesson.id || seenIds.has(lesson.id) || seenPaths.has(lesson.href)) return [];
    seenIds.add(lesson.id); seenPaths.add(lesson.href);
    const quizzes = uniqueIds(lesson.quizzes);
    return [{ ...lesson, quizzes, practice: uniqueIds(lesson.practice).filter(id => !quizzes.includes(id)) }];
  });
}

/** Points describe saved learning activity. They never grant account permissions. */
export function deriveRewards(progress: Progress, records: readonly { key: string; value: unknown }[], catalog: RewardsCatalog = authoredCatalog as RewardsCatalog): RewardSummary {
  const lessons = canonicalLessons(catalog);
  const milestones = new Map<string, RewardMilestone>();
  const counts: RewardSummary["counts"] = { quizzes: 0, practice: 0, builds: 0, transfers: 0, lessons: 0, sections: 0, areas: 0 };
  const add = (id: string, kind: RewardKind, label: string, href: string) => {
    if (!milestones.has(id)) milestones.set(id, { id, kind, label, href, xp: REWARD_POINTS[kind] });
  };
  const done = progress?.done && typeof progress.done === "object" && !Array.isArray(progress.done) ? progress.done : {};
  const completed = new Set<string>(), programmed = new Set<string>(), built = new Set<string>(), transferred = new Set<string>();
  for (const lesson of lessons) {
    const finished = new Set(Object.hasOwn(done, lesson.href) ? uniqueIds(done[lesson.href]) : []);
    for (const id of lesson.quizzes) if (finished.has(id)) {
      counts.quizzes++;
      add(`quiz:${lesson.href}:${id}`, "quiz", `Quiz worked through: ${lesson.title}`, `${lesson.href}#${id}`);
    }
    for (const id of lesson.practice) if (finished.has(id)) {
      counts.practice++;
      add(`practice:${lesson.href}:${id}`, "practice", `Programming checks passed: ${lesson.title}`, `${lesson.href}#${id}`);
    }
    if (lesson.practice.length && lesson.practice.every(id => finished.has(id))) programmed.add(lesson.id);
    const all = [...lesson.quizzes, ...lesson.practice];
    if (all.length && all.every(id => finished.has(id))) {
      completed.add(lesson.id); counts.lessons++;
      add(`lesson:${lesson.href}`, "lesson", `Lesson exercises completed: ${lesson.title}`, lesson.href);
    }
  }

  const known = new Map(lessons.map(lesson => [lesson.id, { ...lesson, href: labHref(lesson.id) }]));
  known.set(guide.id, { ...guide, quizzes: [], practice: [] });
  let connected = false;
  for (const record of Array.isArray(records) ? records : []) {
    if (!record || !validJourneyProgress(record.value)) continue;
    const journey: JourneyProgress = record.value;
    const lesson = known.get(journey.id);
    if (!lesson || record.key !== `journey-progress:${journey.id}:v1` || journey.href !== lesson.href) continue;
    const attempts = journeyAttemptHistory(journey);
    if (attempts.some(attempt => attempt.kind === "built")) built.add(journey.id);
    if (attempts.some(attempt => attempt.kind === "transferred")) transferred.add(journey.id);
    if (journey.id === guide.id && journey.connected) connected = true;
  }
  // Stable catalog order keeps sync order and repeated records out of the result.
  for (const [id, lesson] of known) {
    if (built.has(id)) {
      counts.builds++;
      add(`build:${id}`, "build", `Workshop checks passed: ${lesson.title}`, lesson.href);
    }
    if (transferred.has(id)) {
      counts.transfers++;
      add(`transfer:${id}`, "transfer", `Changed inputs checked: ${lesson.title}`, lesson.href);
    }
  }
  if (connected) add("connection:workshop-guide", "connection", "Your first connection passed its checks", guide.href);

  const groups = (key: "sectionId" | "areaId") => {
    const result = new Map<string, RewardLesson[]>();
    for (const lesson of lessons) {
      const id = lesson[key];
      if (typeof id === "string" && slug.test(id)) result.set(id, [...result.get(id) ?? [], lesson]);
    }
    return result;
  };
  const sections = groups("sectionId"), areas = groups("areaId");
  for (const [id, group] of sections) if (group.every(lesson => completed.has(lesson.id))) {
    counts.sections++;
    add(`section:${id}`, "section", `Section exercises completed: ${group[0].sectionTitle ?? id}`, `/sections/${id}`);
  }
  for (const [id, group] of areas) if (group.every(lesson => completed.has(lesson.id))) {
    counts.areas++;
    add(`area:${id}`, "area", `Learning area exercises completed: ${group[0].areaTitle ?? id}`, `/learn/${id}`);
  }

  const achievements: AchievementProgress[] = [];
  const badge = (id: string, title: string, description: string, current: number, target: number, category: AchievementCategory, href: string) => {
    const bounded = Math.max(0, Math.min(current, target));
    achievements.push({ id, title, description, current: bounded, target, earned: bounded >= target, category, href });
  };
  const first = lessons[0];
  const firstQuiz = lessons.find(lesson => lesson.quizzes.length);
  const firstPractice = lessons.find(lesson => lesson.practice.length);
  const earnedQuiz = [...milestones.values()].find(item => item.kind === "quiz");
  const earnedPractice = [...milestones.values()].find(item => item.kind === "practice");
  const builtLesson = [...known.values()].find(lesson => built.has(lesson.id));
  const changedLesson = [...known.values()].find(lesson => transferred.has(lesson.id));
  badge("first-connection", "First connection", "Pass a workshop's checks, or test the first connection in the controls tutorial.", connected || built.size ? 1 : 0, 1, "workshop", connected ? guide.href : builtLesson?.href ?? guide.href);
  badge("first-build", "Built and tested", "Make a workshop construction pass its checks. Botie's hints count too.", counts.builds, 1, "workshop", builtLesson?.href ?? guide.href);
  if (firstQuiz) badge("first-quiz", "Show your working", "Work through every question in one quiz. Read the feedback and keep going.", counts.quizzes, 1, "quiz", earnedQuiz?.href ?? `${firstQuiz.href}#${firstQuiz.quizzes[0]}`);
  if (firstPractice) badge("first-code", "It runs!", "Pass all the programming problems in one lesson's practice section.", counts.practice, 1, "code", earnedPractice?.href ?? `${firstPractice.href}#${firstPractice.practice[0]}`);
  badge("changed-inputs", "New inputs, same rule", "Pass the changed-input checks in one of Botie's workshop journeys.", counts.transfers, 1, "workshop", changedLesson?.href ?? builtLesson?.href ?? guide.href);

  const pairs = lessons.map(lesson => ({ lesson, steps: Number(built.has(lesson.id)) + Number(programmed.has(lesson.id)) }));
  const pair = pairs.reduce<(typeof pairs)[number] | undefined>((best, candidate) => !best || candidate.steps > best.steps ? candidate : best, undefined);
  if (pair) badge("pieces-to-python", "From pieces to Python", "Pass the workshop and programming checks for the same lesson.", pair.steps, 2, "code", programmed.has(pair.lesson.id) ? labHref(pair.lesson.id) : `${pair.lesson.href}#${pair.lesson.practice[0] ?? "workshop"}`);
  badge("workshop-regular", "Workshop regular", "Test working constructions in five different workshops.", counts.builds, 5, "workshop", "/lab");
  const nextQuizLesson = lessons.find(lesson => lesson.quizzes.some(id => !milestones.has(`quiz:${lesson.href}:${id}`)));
  const nextQuizId = nextQuizLesson?.quizzes.find(id => !milestones.has(`quiz:${nextQuizLesson.href}:${id}`));
  if (firstQuiz) badge("quiz-regular", "Keep asking questions", "Work through five different quiz sections.", counts.quizzes, 5, "quiz", counts.quizzes >= 5 ? "/account#course-progress" : nextQuizLesson ? `${nextQuizLesson.href}#${nextQuizId}` : firstQuiz.href);
  if (first) {
    const completedLesson = lessons.find(lesson => completed.has(lesson.id));
    const nextLesson = lessons.find(lesson => !completed.has(lesson.id));
    badge("first-lesson", "One lesson down", "Complete the quizzes and programming problems in one lesson.", counts.lessons, 1, "course", completedLesson?.href ?? first.href);
    badge("five-lessons", "Five lessons in", "Complete the exercises in five different lessons.", counts.lessons, 5, "course", counts.lessons >= 5 ? "/account#course-progress" : nextLesson?.href ?? first.href);
    badge("ten-lessons", "Getting into it", "Complete the exercises in ten different lessons.", counts.lessons, 10, "course", counts.lessons >= 10 ? "/account#course-progress" : nextLesson?.href ?? first.href);
  }
  if (sections.size) {
    const closest = [...sections].sort(([, left], [, right]) =>
      right.filter(lesson => completed.has(lesson.id)).length / right.length - left.filter(lesson => completed.has(lesson.id)).length / left.length)[0];
    badge("first-section", "Section cleared", "Complete the quizzes and programming problems in every lesson of one course section.", counts.sections, 1, "course", `/sections/${closest[0]}`);
  }
  const topicBadge = (id: string, title: string, description: string, required: string[]) => {
    const targets = required.map(id => lessons.find(lesson => lesson.id === id));
    if (targets.some(target => !target?.practice.length)) return;
    const remaining = targets.find(target => !programmed.has(target!.id)) ?? targets[0]!;
    badge(id, title, description, required.filter(id => programmed.has(id)).length, required.length, "code", `${remaining!.href}#${remaining!.practice[0]}`);
  };
  topicBadge("rows-together", "Keep the rows together", "Pass the programming checks for NumPy arrays and axes.", ["numpy-arrays", "numpy-axes"]);
  topicBadge("no-peeking", "No peek at tomorrow", "Pass the programming checks for held-out evaluation and rolling forecast validation.", ["held-out-evaluation", "rolling-forecast-validation"]);
  topicBadge("check-the-checker", "Check the checker", "Pass the model behavior tests and agent framework testing exercises.", ["model-behaviour-tests", "agent-framework-tests"]);
  topicBadge("reproducible-run", "Keep the run reproducible", "Pass the table snapshot and MLflow experiment-record exercises.", ["databricks-delta-snapshots", "databricks-mlflow-lineage"]);
  for (const [id, group] of areas) {
    const remaining = group.find(lesson => !completed.has(lesson.id));
    badge(`area-${id}`, group[0].areaTitle ?? id, "Complete the quizzes and programming problems in every lesson of this learning area.", group.filter(lesson => completed.has(lesson.id)).length, group.length, "area", remaining?.href ?? `/learn/${id}`);
  }

  const totalXp = [...milestones.values()].reduce((sum, milestone) => sum + milestone.xp, 0);
  const level = Math.floor(Math.sqrt(totalXp / 100)) + 1;
  const levelStartXp = 100 * (level - 1) ** 2;
  const nextLevelXp = 100 * level ** 2;
  const nextAchievement = achievements.filter(achievement => !achievement.earned)
    .sort((left, right) => right.current / right.target - left.current / left.target)[0] ?? null;
  return {
    totalXp, level, levelStartXp, nextLevelXp, xpIntoLevel: totalXp - levelStartXp,
    xpToNextLevel: nextLevelXp - totalXp, levelProgress: (totalXp - levelStartXp) / (nextLevelXp - levelStartXp) * 100,
    counts, milestones: [...milestones.values()], achievements, nextAchievement,
  };
}

export interface RewardCelebrationData { id: number; xp: number; levelUp: number | null; achievements: AchievementProgress[]; milestones: RewardMilestone[] }
export function rewardDifference(before: RewardSummary, after: RewardSummary): Omit<RewardCelebrationData, "id"> | null {
  const previous = new Set(before.milestones.map(item => item.id));
  const milestones = after.milestones.filter(item => !previous.has(item.id));
  if (!milestones.length) return null;
  const earned = new Set(before.achievements.filter(item => item.earned).map(item => item.id));
  return {
    xp: milestones.reduce((sum, item) => sum + item.xp, 0), milestones,
    levelUp: after.level > before.level ? after.level : null,
    achievements: after.achievements.filter(item => item.earned && !earned.has(item.id)),
  };
}
