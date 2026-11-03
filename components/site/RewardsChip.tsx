"use client";

import { useRewards } from "@/lib/rewards/use-rewards";
import styles from "./Rewards.module.css";

const compactNumber = new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 });
const number = new Intl.NumberFormat("en-US");

/** The account link owns navigation; this is its compact progress label. */
export function RewardsChip({ fallback }: { fallback: string }) {
  const { ready, accountId, sync, syncMessage, rewards } = useRewards();
  if (!ready) return <span>{fallback}</span>;

  const saving = accountId && sync === "saving";
  const unsaved = accountId && sync === "error";
  const saveStatus = accountId
    ? unsaved ? "Your work has not saved yet." : saving ? "Saving your work." : sync === "saved" ? "All work saved." : "Your account progress."
    : "Progress for this visit. Open your account to sign in.";

  return <span className={styles.chip} data-testid="rewards-chip" title={syncMessage ?? saveStatus}>
    <span className={styles.chipLevel} aria-hidden="true">Lv {rewards.level}</span>
    <span className={styles.chipXp} aria-hidden="true">{compactNumber.format(rewards.totalXp)} XP</span>
    {unsaved && <span className={styles.syncWarning} aria-hidden="true">!</span>}
    {saving && <span className={styles.savingDot} aria-hidden="true" />}
    <span className="sr-only">Your account, level {rewards.level}, {number.format(rewards.totalXp)} XP. {saveStatus}</span>
  </span>;
}
