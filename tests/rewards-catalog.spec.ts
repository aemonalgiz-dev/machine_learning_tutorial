import { test, expect } from "@playwright/test";
import { readFile, stat } from "node:fs/promises";
import { execFileSync } from "node:child_process";
import path from "node:path";
import { pathToFileURL } from "node:url";
import catalog from "../lib/rewards/catalog.json";
import { lessonOrder, lessonLocations } from "../lib/course-navigation";
import { expandedLessons } from "../lib/lessons";
import { sectionId } from "../components/concept/sectionId";
type RewardsModule = typeof import("../scripts/build-rewards-catalog.mjs");
type CollectorModule = typeof import("../scripts/collect-exercises.mjs");
const loadRuntime = new Function("filename", "return import(filename)") as (filename: string) => Promise<RewardsModule | CollectorModule>;
let rewards: RewardsModule;
let collector: CollectorModule;
const websiteRoot = process.cwd();
test.beforeAll(async () => {
  rewards = await loadRuntime(pathToFileURL(path.join(websiteRoot, "scripts/build-rewards-catalog.mjs")).href) as RewardsModule;
  collector = await loadRuntime(pathToFileURL(path.join(websiteRoot, "scripts/collect-exercises.mjs")).href) as CollectorModule;
});

test("every published lesson has exact canonical reward metadata and nonempty graded groups", () => {
  expect(catalog.version).toBe(1);
  expect(catalog.lessons).toHaveLength(384);
  expect(catalog.lessons.map(lesson => lesson.href)).toEqual(lessonOrder);
  expect(new Set(catalog.lessons.map(lesson => lesson.id)).size).toBe(384);
  for (const lesson of catalog.lessons) {
    const location = lessonLocations[lesson.href];
    expect(lesson.id).toBe(lesson.href.split("/").at(-1));
    expect(lesson.title).toBe(location.title);
    expect(lesson.sectionId).toBe(location.sectionHref.split("/").at(-1));
    expect(lesson.sectionTitle).toBe(location.sectionTitle);
    expect(lesson.areaId).toBe(location.areaHref.split("/").at(-1));
    expect(lesson.areaTitle).toBe(location.areaTitle);
    expect(lesson.quizzes.length, lesson.id).toBeGreaterThan(0);
    expect(lesson.practice.length, lesson.id).toBeGreaterThan(0);
    const groups = [...lesson.quizzes, ...lesson.practice];
    expect(new Set(groups).size, lesson.id).toBe(groups.length);
    expect(groups.every(id => /^[a-z0-9][a-z0-9-]{0,159}$/.test(id)), lesson.id).toBe(true);
    expect(Object.keys(lesson).sort()).toEqual([
      "id", "href", "title", "sectionId", "sectionTitle", "areaId", "areaTitle", "quizzes", "practice",
    ].sort());
  }
  expect(new Set(catalog.lessons.map(lesson => lesson.areaId)).size).toBe(11);
  expect(catalog.lessons.some(lesson => lesson.id === "workshop-guide" || lesson.href.startsWith("/practice/"))).toBe(false);
});

test("the catalog is reproducible from all 108 native and 276 expanded render declarations", async () => {
  const { catalog: current, facts } = await rewards.buildRewardsCatalog();
  expect(current).toEqual(catalog);
  expect(facts.filter(lesson => lesson.native)).toHaveLength(108);
  expect(facts.filter(lesson => !lesson.native)).toHaveLength(276);
  expect(facts.reduce((sum, lesson) => sum + lesson.quizSections, 0)).toBe(776);
  expect(facts.reduce((sum, lesson) => sum + lesson.practiceSections, 0)).toBe(384);
  expect(facts.every(lesson => lesson.questions > 0 && lesson.challenges > 0)).toBe(true);
  // Independently compare the real exercise collector, including supplements,
  // rather than inferring programming credit from the presence of a heading.
  const exercises = await collector.collectExercises();
  for (const fact of facts) {
    const route = catalog.lessons.find(lesson => lesson.id === fact.id)!.href;
    const actual = exercises.find(lesson => lesson.path === route);
    expect(actual, route).toBeDefined();
    expect(fact.challenges, route).toBe(actual!.exercises.length);
  }
});

test("expanded milestones follow rendered checkpoint placement and SQL versus Python bookmarks", () => {
  for (const lesson of expandedLessons) {
    const reward = catalog.lessons.find(entry => entry.id === lesson.id)!;
    const checkpoints = lesson.parts.flatMap(part => (lesson.checkpoints ?? [])
      .filter(checkpoint => checkpoint.after === part.title && checkpoint.questions.length)
      .map(checkpoint => checkpoint.id ?? sectionId(checkpoint.title)));
    const final = lesson.quizId ?? sectionId(`Questions on Parts 1 to ${lesson.parts.length}`);
    expect(reward.quizzes, lesson.id).toEqual([...checkpoints, ...(lesson.quiz.length ? [final] : [])]);
    const practice = lesson.section === "SQL" ? "practice-write-the-query"
      : ["NoSQL", "Graph Databases"].includes(lesson.section) ? "practice" : "practice-work-through-the-problem-with-numpy";
    expect(reward.practice, lesson.id).toEqual([practice]);
  }
});

test("native legacy IDs and supplement checkpoints stay attached to the existing progress keys", () => {
  const byId = Object.fromEntries(catalog.lessons.map(lesson => [lesson.id, lesson]));
  expect(byId.statistics.practice).toEqual(["practice-summarising-the-five-people-with-the-library"]);
  expect(byId["neurons-and-activations"].practice).toEqual(["practice-building-the-neuron-with-the-library"]);
  expect(byId.attention.quizzes).toContain("questions-on-masked-attention");
  expect(byId["diffusion-models"].quizzes).toContain("questions-on-training-and-reverse-sampling");
  expect(byId["supervised-fine-tuning"].quizzes).toContain("questions-on-the-first-response-target");
  // The current title describes seven parts, but its preserved bookmark is five.
  expect(byId["databricks-lazy-dataframes"].quizzes).toEqual(["questions-on-parts-1-to-3", "questions-on-parts-1-to-5"]);
});

test("metadata extraction retains explicit IDs and never evaluates quiz bodies or example code", () => {
  const source = `<ConceptPage lessonId="fixture" sections={[
    {title: "Botie's checks & repairs", id: "old-checks", quiz: [dangerousCall()]},
    {title: "Still empty", practice: []},
    {title: "Code", id: "old-python", practice: [exerciseThatMustNotRun()]}
  ]}/>`;
  const parsed = rewards.extractNativeSections(source);
  expect(parsed.sections.map(entry => ({ id: entry.id, quiz: entry.quizCount, code: entry.practiceCount }))).toEqual([
    { id: "old-checks", quiz: 1, code: 0 }, { id: "still-empty", quiz: 0, code: 0 }, { id: "old-python", quiz: 0, code: 1 },
  ]);
  expect(rewards.rewardSectionId("Botie's checks & repairs")).toBe(sectionId("Botie's checks & repairs"));
  expect(() => rewards.extractNativeSections(`<ConceptPage lessonId="fixture" sections={sharedSections}/>`)).toThrow("explicit array");
  expect(() => rewards.extractNativeSections(`<ConceptPage lessonId="fixture" sections={[...sharedSections]}/>`)).toThrow("explicit array");
  expect(() => rewards.extractNativeSections(`<ConceptPage {...overrides} lessonId="fixture" sections={[]}/>`)).toThrow("Spread attributes");
  expect(() => rewards.extractNativeSections(`<ConceptPage lessonId="fixture" sections={[{title:"Questions",quiz}]}/>`)).toThrow("shorthand");
  expect(() => rewards.extractNativeSections(`<ConceptPage lessonId="fixture" sections={[{title:"Questions",[quizKey]:[]}]}/>`)).toThrow("declare its metadata explicitly");
});

test("primer metadata counts only direct children and preserves explicit quiz and practice IDs", () => {
  const source = `<PrimerPage lessonId="fixture">
    <PrimerSection title="Reading"><PrimerQuiz title="Nested example" questions={[neverCount()]}/></PrimerSection>
    <PrimerQuiz title="Questions & answers" id="original-quiz" questions={[question()]}/>
    <PrimerPractice title="Renamed exercise" id="original-practice" exercises={[exercise()]}/>
  </PrimerPage>`;
  const parsed = rewards.extractNativeSections(source);
  expect(parsed.kind).toBe("PrimerPage");
  expect(parsed.sections.filter(entry => entry.quizCount).map(entry => entry.id)).toEqual(["original-quiz"]);
  expect(parsed.sections.filter(entry => entry.practiceCount).map(entry => entry.id)).toEqual(["original-practice"]);
});

test("supplement insertion preserves explicit bookmarks and extends the existing programming group", () => {
  const original = [
    { title: "Reading", id: "reading", quizCount: 0, practiceCount: 0, hasPractice: false },
    { title: "Final questions", id: "original-quiz", quizCount: 2, practiceCount: 0, hasPractice: false },
    { title: "Programming", id: "original-python", quizCount: 0, practiceCount: 2, hasPractice: true },
  ];
  const added = rewards.applyRewardSupplement(original, {
    parts: [{ title: "Changed sensor", id: "original-sensor" }], practice: [{ title: "Another challenge" }],
    checkpoint: { after: "Changed sensor", title: "Questions on Botie's sensor", id: "original-sensor-questions", questions: [{}] },
  });
  expect(added.map(entry => entry.id)).toEqual(["reading", "original-sensor", "original-sensor-questions", "original-quiz", "original-python"]);
  expect(added.filter(entry => entry.practiceCount > 0).map(entry => [entry.id, entry.practiceCount])).toEqual([["original-python", 3]]);
  expect(original.at(-1)!.practiceCount).toBe(2);
  expect(() => rewards.applyRewardSupplement(original, { parts: [], practice: [], checkpoint: { after: "Missing part", title: "Never rendered", questions: [{}] } })).toThrow("does not follow a rendered part");
});

test("expanded extraction fails safely instead of awarding an orphaned checkpoint", () => {
  const lesson = { ...expandedLessons[0], checkpoints: [{ after: "No such part", title: "Unused", questions: [{}] }] };
  expect(() => rewards.expandedRewardSections(lesson)).toThrow("does not follow a rendered part");
});

test("check mode validates exact bytes without rewriting the client-safe manifest", async () => {
  const filename = path.join(websiteRoot, "lib/rewards/catalog.json");
  const before = await readFile(filename, "utf8"), beforeStat = await stat(filename);
  const output = execFileSync(process.execPath, ["scripts/build-rewards-catalog.mjs", "--check"], { cwd: websiteRoot, encoding: "utf8" });
  expect(JSON.parse(output)).toMatchObject({ checked: true, lessons: 384, native: 108, expanded: 276 });
  expect(await readFile(filename, "utf8")).toBe(before);
  expect((await stat(filename)).mtimeMs).toBe(beforeStat.mtimeMs);
  expect(Buffer.byteLength(before)).toBeLessThan(256 * 1024);
});
