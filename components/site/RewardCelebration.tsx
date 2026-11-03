"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRewardCelebration } from "@/lib/rewards/use-rewards";
import { Botie } from "./Botie";
import styles from "./Rewards.module.css";

const number = new Intl.NumberFormat("en-US");
type CelebrationId = NonNullable<ReturnType<typeof useRewardCelebration>["celebration"]>["id"];

export function RewardCelebration() {
  const { celebration, dismiss } = useRewardCelebration();
  const [hoveredId, setHoveredId] = useState<CelebrationId | null>(null);
  const [focusedId, setFocusedId] = useState<CelebrationId | null>(null);
  const celebrationId = celebration?.id ?? null;
  const paused = celebrationId !== null && (hoveredId === celebrationId || focusedId === celebrationId);

  useEffect(() => {
    if (!celebrationId || paused) return;
    const timer = setTimeout(dismiss, 8_000);
    return () => clearTimeout(timer);
  }, [celebrationId, dismiss, paused]);

  if (!celebration) return null;
  const award = celebration.achievements[0];
  const detail = award?.title ?? celebration.milestones[0]?.label;

  return <aside className={styles.toast} aria-label="Learning reward" data-testid="reward-celebration" onMouseEnter={() => setHoveredId(celebration.id)} onMouseLeave={() => setHoveredId(null)} onFocus={() => setFocusedId(celebration.id)} onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) setFocusedId(null); }}>
    <Botie mood="happy" size={52} decorative />
    <div className={styles.toastContent}>
      <div role="status" aria-live="polite" aria-atomic="true">
        <p className={styles.toastHeading}>{celebration.xp > 0 ? `+${number.format(celebration.xp)} XP` : "Award earned"}{celebration.levelUp !== null && <span>Level {celebration.levelUp}</span>}</p>
        {detail && <p className={styles.toastDetail}>{detail}</p>}
        {celebration.achievements.length > 1 && <p className={styles.toastExtra}>{celebration.achievements.length - 1} more {celebration.achievements.length === 2 ? "award" : "awards"} earned</p>}
      </div>
      <Link href="/account#achievements" onClick={dismiss} className={styles.toastLink}>Open your journal <span aria-hidden="true">→</span></Link>
    </div>
    <button type="button" aria-label="Dismiss reward" className={styles.dismiss} onClick={dismiss}><span aria-hidden="true">×</span></button>
  </aside>;
}
