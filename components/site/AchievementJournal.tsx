"use client";

import { useState } from "react";
import Link from "next/link";
import { useRewards } from "@/lib/rewards/use-rewards";
import { REWARD_POINTS } from "@/lib/rewards/model";
import styles from "./Rewards.module.css";

const number = new Intl.NumberFormat("en-US");
type Filter = "all" | "earned" | "progress";

function AwardMark({ earned }: { earned: boolean }) {
  return <svg className={styles.awardMark} data-earned={earned} viewBox="0 0 40 44" aria-hidden="true">
    <path d="M12 27 9 41l11-6 11 6-3-14" fill="currentColor" fillOpacity=".16" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    <path d="m20 2 5 4 6 1 1 6 4 5-4 5-1 6-6 1-5 4-5-4-6-1-1-6-4-5 4-5 1-6 6-1Z" fill="var(--surface)" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    {earned ? <path d="m13 18 5 5 9-10" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /> : <circle cx="20" cy="18" r="6" fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray="2 3" />}
  </svg>;
}

export function AchievementJournal() {
  const { ready, accountId, sync, syncMessage, rewards } = useRewards();
  const [filter, setFilter] = useState<Filter>("all");
  const [showAll, setShowAll] = useState(false);
  const [showAllWork, setShowAllWork] = useState(false);
  const earned = rewards.achievements.filter(award => award.earned).length;
  const matching = rewards.achievements.filter(award => filter === "all" || (filter === "earned" ? award.earned : !award.earned));
  const visible = showAll ? matching : matching.slice(0, 6);
  const countedWork = showAllWork ? rewards.milestones : rewards.milestones.slice(0, 8);

  return <section id="achievements" aria-labelledby="achievement-journal-title" className={`journal-panel ${styles.journal}`} data-testid="achievement-journal">
    <div className={styles.journalHeading}>
      <div><p className="game-eyebrow">Work you have put in</p><h2 id="achievement-journal-title" className="mt-2 text-xl font-semibold">Your lab journal</h2></div>
      {ready && <span className={styles.awardCount}>{earned} / {rewards.achievements.length} awards</span>}
    </div>
    {!ready ? <p role="status" className="text-sm text-muted">{accountId && sync === "error" ? "Your saved work could not be opened yet. Use Sync now above to try again." : "Opening your lab journal…"}</p> : <>
      <div className={styles.levelSummary}>
        <span className={styles.levelSeal}><span className={styles.smallLabel}>Level</span><strong>{rewards.level}</strong></span>
        <div className={styles.levelDetail}>
          <div className={styles.levelNumbers}><strong>{number.format(rewards.totalXp)} XP</strong><span>{number.format(rewards.xpToNextLevel)} to level {rewards.level + 1}</span></div>
          <progress className={styles.progress} max={100} value={rewards.levelProgress} aria-label={`Progress to level ${rewards.level + 1}`} aria-valuetext={`${number.format(rewards.xpIntoLevel)} of ${number.format(rewards.nextLevelXp - rewards.levelStartXp)} XP towards level ${rewards.level + 1}`} />
        </div>
      </div>
      <p className={styles.journalCopy}>XP is short for experience points. You earn it by working through quizzes and passing coding or workshop checks. Repeating the same activity does not add XP. Botie&apos;s hints give the same credit, and paid extra practice does not change your XP.</p>
      <p className={styles.saveStatus} data-sync-status={sync}>{accountId ? sync === "error" ? syncMessage ?? "Your work has not saved yet. Keep this tab open while syncing retries." : sync === "saving" ? "Saving your work…" : "Your journal follows the work saved to your account." : "This journal lasts for this visit. Sign in before starting work you want to save."}</p>
      <dl className={styles.activityCounts}>
        {([["Quiz sets", rewards.counts.quizzes], ["Coding sets", rewards.counts.practice], ["Workshops built", rewards.counts.builds], ["Changed inputs", rewards.counts.transfers]] as const).map(([label, count]) => <div key={label}><dt>{label}</dt><dd>{number.format(count)}</dd></div>)}
      </dl>
      <details className={styles.countedWork}>
        <summary>How points work</summary>
        <table className={styles.pointsTable}>
          <caption className="sr-only">Points available for course activities</caption>
          <thead><tr><th scope="col">Activity</th><th scope="col">XP</th></tr></thead>
          <tbody>{([
            ["Quiz worked through", REWARD_POINTS.quiz],
            ["Programming practice group passed", REWARD_POINTS.practice],
            ["Workshop checks passed", REWARD_POINTS.build],
            ["Changed-input checks passed", REWARD_POINTS.transfer],
            ["First checked connection in the controls tutorial", REWARD_POINTS.connection],
            ["Lesson exercise completion bonus", REWARD_POINTS.lesson],
            ["Section exercise completion bonus", REWARD_POINTS.section],
            ["Learning area exercise completion bonus", REWARD_POINTS.area],
          ] as const).map(([label, xp]) => <tr key={label}><th scope="row">{label}</th><td>{number.format(xp)}</td></tr>)}</tbody>
        </table>
        <p className={styles.journalCopy}>A quiz counts once you have worked through every question. A programming group counts when every problem in it passes its checks. The lesson bonus requires all of that lesson&apos;s quiz and programming sections. Section and learning area bonuses require the exercises in every lesson they contain. Workshop checks earn their own points. Using hints does not reduce any of these awards.</p>
      </details>
      {rewards.nextAchievement && <Link href={rewards.nextAchievement.href} className={styles.nextAward}>
        <span><span className={styles.smallLabel}>Something to work towards</span><strong>{rewards.nextAchievement.title}</strong><span className={styles.nextDescription}>{rewards.nextAchievement.description}</span></span>
        <span className={styles.awardTarget}>{number.format(rewards.nextAchievement.current)} / {number.format(rewards.nextAchievement.target)} <span aria-hidden="true">→</span></span>
      </Link>}
      <div className={styles.filters} aria-label="Show achievements">
        {([["all", "All awards"], ["earned", "Earned"], ["progress", "In progress"]] as const).map(([value, label]) => <button key={value} type="button" aria-pressed={filter === value} onClick={() => { setFilter(value); setShowAll(false); }}>{label}</button>)}
      </div>
      {matching.length ? <ul className={styles.achievementList}>
        {visible.map(award => <li key={award.id} data-earned={award.earned}>
          <details className={styles.achievement}>
            <summary><AwardMark earned={award.earned} /><span className={styles.awardTitle}>{award.title}<span className={styles.awardState}>{award.earned ? "Earned" : `${number.format(award.current)} / ${number.format(award.target)}`}</span></span><span className={styles.disclosure} aria-hidden="true">+</span></summary>
            <div className={styles.awardRequirements}>
              <p>{award.description}</p>
              {!award.earned && <progress className={styles.progress} max={Math.max(1, award.target)} value={Math.min(award.current, award.target)} aria-label={`${award.title} progress`} aria-valuetext={`${number.format(award.current)} of ${number.format(award.target)}`} />}
              <Link href={award.href} className={styles.journalLink}>{award.earned ? "Revisit the work" : "Continue learning"} <span aria-hidden="true">→</span></Link>
            </div>
          </details>
        </li>)}
      </ul> : <p className={styles.journalCopy}>{filter === "progress" ? "You have earned every award in this journal. You can revisit the work under \"Earned\"." : "Your first award is still ahead. Open an award under \"All awards\" to see what it asks you to do."}</p>}
      {matching.length > 6 && <button type="button" className={styles.showMore} onClick={() => setShowAll(!showAll)}>{showAll ? "Show fewer awards" : `Show all ${matching.length} awards`}</button>}
      {rewards.milestones.length > 0 && <details className={styles.countedWork}>
        <summary>What counted towards your XP</summary>
        <ul>{countedWork.map(work => <li key={work.id}><Link href={work.href}>{work.label}</Link><span>+{number.format(work.xp)} XP</span></li>)}</ul>
        {rewards.milestones.length > 8 && <button type="button" className={styles.showMore} onClick={() => setShowAllWork(!showAllWork)}>{showAllWork ? "Show fewer activities" : `Show all ${number.format(rewards.milestones.length)} activities`}</button>}
      </details>}
    </>}
  </section>;
}
