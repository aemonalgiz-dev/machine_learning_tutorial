"use client";

import { useCallback } from "react";
import { useLearnerRecord } from "./learner-state";

export interface JourneyEvidence { at: number; supported: boolean; attemptId?: string }
export interface JourneyAttemptEvidence extends JourneyEvidence { kind: "built" | "transferred"; attemptId: string }
export interface JourneyProgress {
  id: string;
  title: string;
  href: string;
  exploredAt: number | null;
  built: JourneyEvidence | null;
  transferred: JourneyEvidence | null;
  lastVisitedAt: number | null;
  stage: string;
  /** Optional so records written before per-attempt evidence still restore. */
  attempts?: JourneyAttemptEvidence[];
}
type JourneyEvent = { type: "touch"; stage?: string } | { type: "explored" } |
  { type: "built" | "transferred"; supported: boolean; attemptId?: string };
interface RecentJourney { id: string; title: string; href: string; stage: string; lastVisitedAt: number | null }

const timestamp = (value: unknown) => typeof value === "number" && value > 0 && Number.isFinite(new Date(value).getTime());
const identity = (value: unknown) => typeof value === "string" && /^[a-z0-9][a-z0-9-]{0,140}$/.test(value);
const route = (value: unknown) => typeof value === "string" && /^\/lab\/[a-z0-9][a-z0-9-]{0,140}$/.test(value);
const attemptIdentity = (value: unknown) => typeof value === "string" && value.length > 0 && value.length <= 512;
const evidence = (value: unknown) => value === null || (!!value && typeof value === "object" &&
  timestamp((value as JourneyEvidence).at) && typeof (value as JourneyEvidence).supported === "boolean" &&
  ((value as JourneyEvidence).attemptId === undefined || attemptIdentity((value as JourneyEvidence).attemptId)));

export function newJourneyProgress(id: string, title: string, href: string): JourneyProgress {
  return { id, title, href, exploredAt: null, built: null, transferred: null, lastVisitedAt: null, stage: "" };
}

export function validJourneyProgress(value: unknown): value is JourneyProgress {
  if (!value || typeof value !== "object") return false;
  const row = value as JourneyProgress;
  return identity(row.id) && typeof row.title === "string" && row.title.length > 0 && row.title.length <= 300 &&
    route(row.href) && (row.exploredAt === null || timestamp(row.exploredAt)) && evidence(row.built) && evidence(row.transferred) &&
    (row.lastVisitedAt === null || timestamp(row.lastVisitedAt)) && typeof row.stage === "string" && row.stage.length <= 160 &&
    (row.attempts === undefined || Array.isArray(row.attempts) && row.attempts.every(attempt => attempt && evidence(attempt) &&
      attemptIdentity(attempt.attemptId) && (attempt.kind === "built" || attempt.kind === "transferred")));
}

/** Old successes remain evidence of their original attempt when a fresh one begins. */
export function journeyAttemptHistory(record: JourneyProgress): JourneyAttemptEvidence[] {
  const attempts = [...(record.attempts ?? [])];
  for (const kind of ["built", "transferred"] as const) {
    const saved = record[kind];
    if (!saved) continue;
    const attemptId = saved.attemptId ?? `legacy:${kind}`;
    if (!attempts.some(attempt => attempt.kind === kind && attempt.attemptId === attemptId)) {
      attempts.push({ ...saved, kind, attemptId });
    }
  }
  return attempts.sort((a, b) => a.at - b.at);
}

/** A visit is not a successful build. Call the success events only after testing. */
export function updateJourneyProgress(current: JourneyProgress, event: JourneyEvent, now: number): JourneyProgress {
  const next = { ...current, lastVisitedAt: now };
  if (event.type === "touch") return { ...next, stage: event.stage?.slice(0, 160) ?? next.stage };
  if (event.type === "explored") return { ...next, exploredAt: next.exploredAt ?? now };
  const field: JourneyAttemptEvidence["kind"] = event.type === "built" ? "built" : "transferred";
  const attempts = journeyAttemptHistory(current);
  // Callers without an attempt identity keep their legacy attempt. Merely
  // repeating a test cannot turn its guided construction into independent work.
  const attemptId = event.attemptId ?? `legacy:${field}`;
  const previous = attempts.find(attempt => attempt.kind === field && attempt.attemptId === attemptId);
  const result = { at: now, supported: event.supported || Boolean(previous?.supported), attemptId };
  const attempt: JourneyAttemptEvidence = { ...result, kind: field };
  return { ...next, [field]: result, attempts: previous
    ? attempts.map(saved => saved === previous ? attempt : saved)
    : [...attempts, attempt] };
}

export function journeyStatus(record: JourneyProgress): { label: string; detail: string } | null {
  const attempts = journeyAttemptHistory(record);
  const strongest = (kind: JourneyAttemptEvidence["kind"]) => attempts.find(attempt => attempt.kind === kind && !attempt.supported)
    ?? attempts.findLast(attempt => attempt.kind === kind);
  const transferred = strongest("transferred"), built = strongest("built");
  const earlierHelp = (kind: JourneyAttemptEvidence["kind"]) => attempts.some(attempt => attempt.kind === kind && attempt.supported)
    ? " Your earlier work with Botie's help is saved too." : "";
  if (transferred) return {
    label: transferred.supported ? "Variation solved with guidance" : "Variation solved independently",
    detail: transferred.supported
      ? "A changed example passed its checks after you opened guidance or a worked construction."
      : `A changed example passed its checks without hints or a worked construction in that attempt. This records practice on that example, not mastery of the topic.${earlierHelp("transferred")}`,
  };
  if (built) return {
    label: built.supported ? "Built with guidance" : "Built independently",
    detail: built.supported
      ? "A construction you tested passed the required checks after you opened guidance or a worked construction."
      : `A construction you tested passed the required checks without hints or a worked construction in that attempt.${earlierHelp("built")}`,
  };
  if (record.exploredAt) return { label: "Explored", detail: "You have opened an explanation or tried an example. The construction has not yet passed its checks." };
  return record.lastVisitedAt ? { label: "In progress", detail: "Your place in this journey is saved." } : null;
}

function useJourneyRecord(id: string, title: string, href: string) {
  return useLearnerRecord(`journey-progress:${id}:v1`, () => newJourneyProgress(id, title, href),
    value => validJourneyProgress(value) && value.id === id);
}

/** Read-only subscriptions do not create records or make a visit count as progress. */
export function useJourneySnapshot(id: string, title: string, href: string) {
  return useJourneyRecord(id, title, href).value;
}

function useRecentRecord() {
  return useLearnerRecord<RecentJourney>("journey-recent:v1", { id: "", title: "", href: "", stage: "", lastVisitedAt: null }, value => {
    if (!value || typeof value !== "object") return false;
    const row = value as RecentJourney;
    return identity(row.id) && route(row.href) && typeof row.title === "string" && row.title.length <= 300 &&
      typeof row.stage === "string" && row.stage.length <= 160 && timestamp(row.lastVisitedAt);
  });
}

export function useJourneyProgress(id: string, title: string, href: string) {
  const { value: record, set } = useJourneyRecord(id, title, href);
  const { set: setRecent } = useRecentRecord();
  const save = useCallback((event: JourneyEvent) => {
    const now = Date.now();
    set(previous => updateJourneyProgress({ ...previous, title, href }, event, now));
    setRecent(previous => ({ id, title, href, lastVisitedAt: now,
      stage: event.type === "touch" && event.stage !== undefined ? event.stage.slice(0, 160) : previous.id === id ? previous.stage : "" }));
  }, [id, title, href, set, setRecent]);
  const touch = useCallback((stage?: string) => save({ type: "touch", stage }), [save]);
  const markExplored = useCallback(() => save({ type: "explored" }), [save]);
  const markBuilt = useCallback((supported: boolean, attemptId?: string) => save({ type: "built", supported, attemptId }), [save]);
  const markTransferred = useCallback((supported: boolean, attemptId?: string) => save({ type: "transferred", supported, attemptId }), [save]);
  return { record, touch, markExplored, markBuilt, markTransferred };
}

export function useRecentJourney() {
  const { value: recent } = useRecentRecord();
  const record = useJourneySnapshot(recent.id || "unstarted", recent.title, recent.href);
  return recent.lastVisitedAt ? { ...recent, record } : null;
}

export interface SavedWorkshopSummary {
  graph: { pieces: { tool: string }[] } | null;
  results: Record<string, boolean>;
  hintsShown: number;
  example: boolean;
  carriedSupport?: boolean;
}

/** Older saves establish only what their tests checked, never a fresh variation. */
export function savedWorkshopStatus(saved: SavedWorkshopSummary, cases: number) {
  const passed = cases > 0 && Array.from({ length: cases }, (_, index) => saved.results[index] === true).every(Boolean);
  if (passed) return saved.example || saved.hintsShown > 0 || saved.carriedSupport ? "Examples passed with guidance" : "Examples passed";
  return saved.graph?.pieces.some(piece => piece.tool !== "output") ? "Construction saved" : null;
}

export function useSavedWorkshopSummary(id: string, draftVersion = 1) {
  return useLearnerRecord<SavedWorkshopSummary>(`workshop:${id}:v${draftVersion}`, {
    graph: null, results: {}, hintsShown: 0, example: false,
  }, value => {
    if (!value || typeof value !== "object") return false;
    const row = value as SavedWorkshopSummary;
    return !!row.results && typeof row.results === "object" && Object.values(row.results).every(result => typeof result === "boolean") &&
      (row.graph === null || (Array.isArray(row.graph?.pieces) && row.graph.pieces.every(piece => typeof piece?.tool === "string")));
  }).value;
}
