import { expect, test } from "@playwright/test";
import { deriveRewards, rewardDifference, type RewardsCatalog } from "../lib/rewards/model";
import type { Progress } from "../lib/progress";
import { newJourneyProgress, updateJourneyProgress } from "../lib/journey-progress";
import { reconcileLearnerValue } from "../lib/learner-reconcile";
import { FREE_MEMBERSHIP, readMembership } from "../lib/membership";

const empty = (): Progress => ({ done: {}, required: {} });
const first = "/concepts/alpha", second = "/concepts/beta", third = "/primers/gamma";
const catalog: RewardsCatalog = { version: 1, lessons: [
  { id: "alpha", href: first, title: "Keep a useful estimate", quizzes: ["review-one", "review-two"], practice: ["write-it"], sectionId: "estimates", sectionTitle: "Following an estimate", areaId: "models", areaTitle: "Models" },
  { id: "beta", href: second, title: "Test changed inputs", quizzes: ["review"], practice: ["repair-it"], sectionId: "estimates", sectionTitle: "Following an estimate", areaId: "models", areaTitle: "Models" },
  { id: "gamma", href: third, title: "Read uncertainty", quizzes: ["review"], practice: [], sectionId: "uncertainty", sectionTitle: "Reading uncertainty", areaId: "models", areaTitle: "Models" },
] };
const time = 1_700_000_000_000;
const journey = (id = "alpha") => newJourneyProgress(id, "Saved user title", `/lab/${id}`);
const record = (value: unknown, id = "alpha") => ({ key: `journey-progress:${id}:v1`, value });
const ids = (summary: ReturnType<typeof deriveRewards>) => summary.milestones.map(item => item.id).sort();
const fullFirst: Progress = { done: { [first]: ["review-one", "review-two", "write-it"] }, required: {} };

test("an empty visit starts at zero and does not complete empty groups", () => {
  const summary = deriveRewards(empty(), [], catalog);
  expect(summary.totalXp).toBe(0);
  expect(summary.level).toBe(1);
  expect(summary.levelStartXp).toBe(0);
  expect(summary.nextLevelXp).toBe(100);
  expect(summary.counts).toEqual({ quizzes: 0, practice: 0, builds: 0, transfers: 0, lessons: 0, sections: 0, areas: 0 });
  expect(summary.milestones).toEqual([]);
  expect(deriveRewards(empty(), [], { version: 1, lessons: [] }).totalXp).toBe(0);
});

test("required counts and unknown completion IDs cannot create rewards", () => {
  const input: Progress = { done: { [first]: ["invented", "practice", "quiz"], "/concepts/unknown": ["review-one"], "bank/extra--01--code": ["write-it"] }, required: { [first]: 0, [second]: -1, "/concepts/unknown": 1 } };
  expect(deriveRewards(input, [], catalog).totalXp).toBe(0);
  expect(deriveRewards({ ...fullFirst, required: { [first]: 999999 } }, [], catalog).totalXp).toBe(120);
  expect(deriveRewards({ ...fullFirst, required: { [first]: 1 } }, [], catalog).totalXp).toBe(120);
});

test("invalid catalog lesson identities and non-course routes are not award sources", () => {
  const malformed: RewardsCatalog = { version: 1, lessons: [
    { id: "../alpha", href: first, title: "Bad identity", quizzes: ["review-one"], practice: [] },
    { id: "paid-case", href: "/practice/paid-case", title: "Paid case is not a course lesson", quizzes: ["review"], practice: [] },
    { id: "untrusted", href: "https://outside.example.test/concepts/untrusted", title: "External route", quizzes: ["review"], practice: [] },
  ] };
  const progress: Progress = { done: { [first]: ["review-one"], "/practice/paid-case": ["review"], "https://outside.example.test/concepts/untrusted": ["review"] }, required: {} };
  expect(deriveRewards(progress, [], malformed).totalXp).toBe(0);
});

test("repeated completion IDs and duplicate catalog rows do not inflate XP", () => {
  const repeated: Progress = { done: { [first]: ["review-one", "review-one", "review-two", "write-it", "write-it"] }, required: { [first]: 1 } };
  const duplicateCatalog: RewardsCatalog = { ...catalog, lessons: [...catalog.lessons, catalog.lessons[0]] };
  expect(deriveRewards(repeated, [], duplicateCatalog)).toEqual(deriveRewards(fullFirst, [], catalog));
});

test("overlapping quiz and coding section IDs are counted only once", () => {
  const clean: RewardsCatalog = { version: 1, lessons: [{ id: "alpha", href: first, title: "One task", quizzes: ["review"], practice: ["write-it"] }] };
  const repeated: RewardsCatalog = { version: 1, lessons: [{ ...clean.lessons[0], quizzes: ["review", "review"], practice: ["review", "write-it", "write-it"] }] };
  const progress: Progress = { done: { [first]: ["review", "write-it"] }, required: {} };
  expect(deriveRewards(progress, [], repeated)).toEqual(deriveRewards(progress, [], clean));
});

test("opening or exploring a workshop awards no construction XP", () => {
  const touched = updateJourneyProgress(journey(), { type: "touch", stage: "Try the tools" }, time);
  const explored = updateJourneyProgress(touched, { type: "explored" }, time + 1);
  expect(deriveRewards(empty(), [record(explored)], catalog).totalXp).toBe(0);
});

test("guided construction and a fresh transfer both receive their stated milestone", () => {
  const built = updateJourneyProgress(journey(), { type: "built", supported: true, attemptId: "guided-first" }, time);
  const transferred = updateJourneyProgress(built, { type: "transferred", supported: true, attemptId: "changed-inputs" }, time + 1);
  const summary = deriveRewards(empty(), [record(transferred)], catalog);
  expect(summary.totalXp).toBe(100);
  expect(summary.counts.builds).toBe(1);
  expect(summary.counts.transfers).toBe(1);
  expect(ids(summary)).toEqual(["build:alpha", "transfer:alpha"]);
  expect(summary.milestones.every(item => item.href === "/lab/alpha")).toBe(true);
  const independent = { ...transferred, built: { ...transferred.built!, supported: false }, transferred: { ...transferred.transferred!, supported: false }, attempts: transferred.attempts?.map(attempt => ({ ...attempt, supported: false })) };
  expect(deriveRewards(empty(), [record(independent)], catalog).totalXp).toBe(summary.totalXp);
});

test("retries and additional attempts cannot farm construction XP", () => {
  let progress = updateJourneyProgress(journey(), { type: "built", supported: true, attemptId: "first" }, time);
  progress = updateJourneyProgress(progress, { type: "built", supported: false, attemptId: "first" }, time + 1);
  progress = updateJourneyProgress(progress, { type: "built", supported: false, attemptId: "second" }, time + 2);
  const summary = deriveRewards(empty(), [record(progress), record(progress)], catalog);
  expect(summary.totalXp).toBe(60);
  expect(ids(summary)).toEqual(["build:alpha"]);
});

test("past passing evidence survives a fresh draft or a later unsuccessful attempt", () => {
  const built = updateJourneyProgress(journey(), { type: "built", supported: true, attemptId: "old-pass" }, time);
  const reset = { ...built, built: null, transferred: null, stage: "Try another construction" };
  const records = [record(reset), { key: "workshop:alpha:v1", value: { graph: null, results: { 0: false }, hintsShown: 0, example: false } }];
  expect(deriveRewards(fullFirst, records, catalog).totalXp).toBe(180);
  const reconstructed = reconcileLearnerValue("journey-progress:alpha:v1", reset, built);
  expect(deriveRewards(fullFirst, [record(reconstructed)], catalog).totalXp).toBe(180);
});

test("unknown, malformed and mismatched workshop evidence earns nothing", () => {
  const passed = updateJourneyProgress(journey(), { type: "built", supported: true }, time);
  const invalid = [
    { key: "journey-progress:unknown:v1", value: { ...passed, id: "unknown", href: "/lab/unknown" } },
    { key: "journey-progress:alpha:v1", value: { ...passed, id: "beta" } },
    { key: "journey-progress:alpha:v2", value: passed },
    { key: "journey-progress:alpha:v1:copied", value: passed },
    { key: "journey-progress:alpha:v1", value: { ...passed, built: { at: Number.POSITIVE_INFINITY, supported: true } } },
    { key: "journey-progress:alpha:v1", value: { ...passed, built: { at: time, supported: "yes" } } },
    { key: "journey-progress:alpha:v1", value: null },
    { key: "rewards:balance:v1", value: { totalXp: 999999999, level: 99 } },
  ];
  expect(deriveRewards(empty(), invalid, catalog).totalXp).toBe(0);
});

test("legacy graph result flags alone do not claim a current workshop or transfer pass", () => {
  const old = { key: "workshop:alpha:v1", value: { graph: { pieces: [{ tool: "mean" }] }, results: { 0: true, 1: true, 2: true }, hintsShown: 0, example: false } };
  const summary = deriveRewards(empty(), [old], catalog);
  expect(summary.counts.builds).toBe(0);
  expect(summary.counts.transfers).toBe(0);
  expect(summary.totalXp).toBe(0);
});

test("lesson bonuses require every authored exercise, followed by actual section and area completion", () => {
  const partial: Progress = { done: { [first]: ["review-one", "write-it"] }, required: { [first]: 1 } };
  expect(deriveRewards(partial, [], catalog).totalXp).toBe(70);
  const two: Progress = { done: { ...fullFirst.done, [second]: ["review", "repair-it"] }, required: {} };
  const section = deriveRewards(two, [], catalog);
  expect(section.totalXp).toBe(320);
  expect(section.counts).toEqual({ quizzes: 3, practice: 2, builds: 0, transfers: 0, lessons: 2, sections: 1, areas: 0 });
  expect(ids(section)).toContain("section:estimates");
  expect(ids(section)).not.toContain("area:models");
  const area = deriveRewards({ done: { ...two.done, [third]: ["review"] }, required: {} }, [], catalog);
  expect(area.totalXp).toBe(720);
  expect(area.counts.areas).toBe(1);
  expect(ids(area)).toContain("area:models");
});

test("level boundaries use accumulated milestones rather than saved level fields", () => {
  const simplified: RewardsCatalog = { ...catalog, lessons: catalog.lessons.map(item => item.id === "alpha" ? { ...item, quizzes: ["review-one"] } : item) };
  const atBoundary = deriveRewards({ done: { [first]: ["review-one", "write-it"] }, required: {} }, [], simplified);
  expect(atBoundary.totalXp).toBe(100);
  expect(atBoundary.level).toBe(2);
  expect(atBoundary.levelStartXp).toBe(100);
  expect(atBoundary.nextLevelXp).toBe(400);
  expect(atBoundary.xpIntoLevel).toBe(0);
  expect(atBoundary.xpToNextLevel).toBe(300);
  const below = deriveRewards({ done: { [first]: ["review-one"] }, required: {} }, [], simplified);
  expect(below.level).toBe(1);
  expect(below.xpToNextLevel).toBe(80);
});

test("reward derivation does not mutate account records and is independent of record order", () => {
  const passed = updateJourneyProgress(journey(), { type: "built", supported: false, attemptId: "a" }, time);
  const records = [record(passed), { key: "preferences:theme", value: "light" }];
  const snapshot = structuredClone({ progress: fullFirst, records, catalog });
  const summary = deriveRewards(fullFirst, records, catalog);
  expect(deriveRewards(fullFirst, [...records].reverse(), catalog)).toEqual(summary);
  expect({ progress: fullFirst, records, catalog }).toEqual(snapshot);
});

test("rewards cannot grant the paid practice entitlement", () => {
  const savedMembership = { ...FREE_MEMBERSHIP };
  const summary = deriveRewards(fullFirst, [{ key: "membership", value: { practiceAccess: true, plan: "practice", status: "active" } }], catalog);
  expect(summary.totalXp).toBe(120);
  expect(readMembership(summary)).toEqual(FREE_MEMBERSHIP);
  expect(savedMembership).toEqual(FREE_MEMBERSHIP);
  expect(summary).not.toHaveProperty("practiceAccess");
});

test("achievement progress is finite and an earned badge meets its stated target", () => {
  const progress: Progress = { done: { ...fullFirst.done, [second]: ["review", "repair-it"], [third]: ["review"] }, required: {} };
  const built = updateJourneyProgress(journey(), { type: "built", supported: true, attemptId: "a" }, time);
  const transferred = updateJourneyProgress(built, { type: "transferred", supported: false, attemptId: "b" }, time + 1);
  const summary = deriveRewards(progress, [record(transferred)], catalog);
  expect(new Set(summary.achievements.map(item => item.id)).size).toBe(summary.achievements.length);
  for (const achievement of summary.achievements) {
    expect(Number.isFinite(achievement.current)).toBe(true);
    expect(achievement.current).toBeGreaterThanOrEqual(0);
    expect(achievement.target).toBeGreaterThan(0);
    expect(achievement.earned).toBe(achievement.current >= achievement.target);
    expect(achievement.href).toMatch(/^\//);
  }
});

test("the controls tutorial awards its tested connection once without claiming a full build", () => {
  const guide = newJourneyProgress("workshop-guide", "Getting started with Botie", "/lab/workshop-guide");
  const connected = updateJourneyProgress(guide, { type: "connected" }, time);
  const retested = updateJourneyProgress(connected, { type: "connected" }, time + 100);
  expect(retested.connected).toEqual(connected.connected);
  const summary = deriveRewards(empty(), [record(retested, "workshop-guide"), record(connected, "workshop-guide")], catalog);
  expect(summary.totalXp).toBe(30);
  expect(summary.counts.builds).toBe(0);
  expect(ids(summary)).toEqual(["connection:workshop-guide"]);
  expect(summary.achievements.find(item => item.id === "first-connection")?.earned).toBe(true);
  expect(summary.achievements.find(item => item.id === "first-build")?.earned).toBe(false);
  expect(deriveRewards(empty(), [record(updateJourneyProgress(journey(), { type: "connected" }, time))], catalog).totalXp).toBe(0);
});

test("tutorial connection evidence survives a later reset and a second device's draft", () => {
  const guide = newJourneyProgress("workshop-guide", "Getting started with Botie", "/lab/workshop-guide");
  const server = updateJourneyProgress(guide, { type: "connected" }, time);
  const local = updateJourneyProgress(guide, { type: "touch", stage: "Build another machine" }, time + 1);
  const merged = reconcileLearnerValue("journey-progress:workshop-guide:v1", local, server) as typeof guide;
  expect(merged.stage).toBe("Build another machine");
  expect(merged.connected).toEqual(server.connected);
  expect(deriveRewards(empty(), [record(merged, "workshop-guide")], catalog).totalXp).toBe(30);
});

test("reward differences contain only new stable milestones and actual rank changes", () => {
  const before = deriveRewards({ done: { [first]: ["review-one"] }, required: {} }, [], catalog);
  const after = deriveRewards(fullFirst, [], catalog);
  expect(rewardDifference(before, before)).toBeNull();
  expect(rewardDifference(after, deriveRewards(fullFirst, [], catalog))).toBeNull();
  const difference = rewardDifference(before, after)!;
  expect(difference.xp).toBe(100);
  expect(difference.levelUp).toBe(2);
  expect(difference.milestones.map(item => item.id).sort()).toEqual([
    "lesson:/concepts/alpha", "practice:/concepts/alpha:write-it", "quiz:/concepts/alpha:review-two",
  ]);
  expect(difference.achievements.some(item => item.id === "first-code")).toBe(true);
  expect(difference.achievements.some(item => item.id === "first-quiz")).toBe(false);
});

test("earned first-activity awards return to the lesson that actually supplied the evidence", () => {
  const built = updateJourneyProgress(journey("beta"), { type: "built", supported: true, attemptId: "beta-build" }, time);
  const transferred = updateJourneyProgress(built, { type: "transferred", supported: false, attemptId: "beta-transfer" }, time + 1);
  const summary = deriveRewards({ done: { [second]: ["review", "repair-it"] }, required: {} }, [record(transferred, "beta")], catalog);
  const expected: Record<string, string> = {
    "first-quiz": `${second}#review`,
    "first-code": `${second}#repair-it`,
    "first-build": "/lab/beta",
    "changed-inputs": "/lab/beta",
  };
  for (const [id, href] of Object.entries(expected)) {
    const achievement = summary.achievements.find(item => item.id === id)!;
    expect(achievement.earned).toBe(true);
    expect(achievement.href).toBe(href);
  }
});
