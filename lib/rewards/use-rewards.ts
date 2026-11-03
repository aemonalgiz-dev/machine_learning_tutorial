"use client";

import { useEffect, useSyncExternalStore } from "react";
import { onAccountUpdate, readAccount, useAccount } from "../accounts";
import { getProgressAccount, onProgressUpdate, readProgress, useProgress, type Progress } from "../progress";
import { learnerHydrated, onLearnerUpdate, readLearnerRecords, useLearnerHydrated, useLearnerRecords, type SavedRecord } from "../learner-state";
import { validJourneyProgress, journeyAttemptHistory } from "../journey-progress";
import { deriveRewards, rewardDifference, type RewardCelebrationData, type RewardSummary } from "./model";

const empty = deriveRewards({ done: {}, required: {} }, []);
interface CachedRewards { done: Progress["done"]; evidence: string; rewards: RewardSummary }
const cache = new Map<string | null, CachedRewards>();

// Moving a piece, typing code or opening an explanation changes saved work but
// does not change a reward. Keep those updates out of the full course calculation.
function evidenceSignature(records: readonly SavedRecord[]) {
  return records.flatMap(record => {
    if (!validJourneyProgress(record.value)) return [];
    const value = record.value;
    const attempts = journeyAttemptHistory(value);
    return [JSON.stringify([record.key, value.id, value.href, Boolean(value.connected),
      attempts.some(attempt => attempt.kind === "built"), attempts.some(attempt => attempt.kind === "transferred")])];
  }).sort().join("|");
}

function currentRewards(progress = readProgress(), records = readLearnerRecords("journey-progress:")) {
  const scope = getProgressAccount();
  const evidence = evidenceSignature(records);
  const previous = cache.get(scope);
  if (previous?.done === progress.done && previous.evidence === evidence) return previous.rewards;
  const rewards = deriveRewards(progress, records);
  cache.set(scope, { done: progress.done, evidence, rewards });
  if (cache.size > 8) cache.delete(cache.keys().next().value ?? null);
  return rewards;
}

function restored() {
  const account = readAccount(), scope = getProgressAccount();
  if (!account.user && scope === null) return account.status !== "checking";
  return account.status === "ready" && scope === (account.user?.id ?? null) &&
    (!scope || account.learnerStateReady && learnerHydrated(scope));
}

export function useRewards() {
  const account = useAccount();
  const progress = useProgress();
  const records = useLearnerRecords("journey-progress:");
  const hydrated = useLearnerHydrated();
  const ready = !account.user && getProgressAccount() === null
    ? account.status !== "checking"
    : account.status === "ready" && getProgressAccount() === account.user?.id && account.learnerStateReady && hydrated;
  return { ready, accountId: account.user?.id ?? null, sync: account.sync, syncMessage: account.syncMessage,
    rewards: ready ? currentRewards(progress, records) : empty };
}

let celebration: RewardCelebrationData | null = null;
let sequence = 0;
let shownAt = 0;
let users = 0;
const listeners = new Set<() => void>();
let baseline: { scope: string | null; ready: boolean; rewards: RewardSummary } | null = null;
let stop: (() => void) | null = null;
const publish = (value: RewardCelebrationData | null) => { celebration = value; listeners.forEach(listener => listener()); };

function observe(local: boolean) {
  const scope = getProgressAccount(), ready = restored();
  const rewards = currentRewards();
  const previous = baseline;
  baseline = { scope, ready, rewards };
  if (!ready || !previous?.ready || previous.scope !== scope) {
    if (celebration) publish(null);
    return;
  }
  const earned = local ? rewardDifference(previous.rewards, rewards) : null;
  if (!earned) return;
  const now = Date.now();
  // One action can record a passed quiz and its lesson bonus in separate writes.
  // Present one combined receipt rather than a burst of overlapping messages.
  const combine = celebration && now - shownAt < 750;
  const milestones = new Map([...(combine ? celebration!.milestones : []), ...earned.milestones].map(item => [item.id, item]));
  const achievements = new Map([...(combine ? celebration!.achievements : []), ...earned.achievements].map(item => [item.id, item]));
  shownAt = now;
  publish({ id: ++sequence, xp: [...milestones.values()].reduce((sum, item) => sum + item.xp, 0),
    levelUp: earned.levelUp ?? (combine ? celebration!.levelUp : null),
    milestones: [...milestones.values()], achievements: [...achievements.values()] });
}

function start() {
  users++;
  if (users === 1) {
    baseline = { scope: getProgressAccount(), ready: restored(), rewards: currentRewards() };
    const progress = onProgressUpdate(observe);
    const work = onLearnerUpdate(observe);
    const account = onAccountUpdate(() => observe(false));
    stop = () => { progress(); work(); account(); };
  }
  return () => {
    users--;
    if (!users) { stop?.(); stop = null; baseline = null; publish(null); }
  };
}

const subscribe = (listener: () => void) => { listeners.add(listener); return () => { listeners.delete(listener); }; };
const noCelebration = () => null;
const dismiss = () => publish(null);

/** Restoration is silent; only a new local completion produces a receipt. */
export function useRewardCelebration() {
  useEffect(start, []);
  const notice = useSyncExternalStore(subscribe, () => celebration, noCelebration);
  return { celebration: notice, dismiss };
}
