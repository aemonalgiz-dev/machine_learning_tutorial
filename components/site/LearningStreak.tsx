"use client";

import Link from "next/link";
import { useLearningHabits } from "@/lib/learning-habits";
import styles from "./LearningHabits.module.css";

const number = new Intl.NumberFormat("en-US");
const fullDate = new Intl.DateTimeFormat("en-US", { year: "numeric", month: "long", day: "numeric", timeZone: "UTC" });
const shortDate = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", timeZone: "UTC" });
const weekday = new Intl.DateTimeFormat("en-US", { weekday: "short", timeZone: "UTC" });

/** A server civil date keeps its date when the browser uses another time zone. */
function calendarDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const date = new Date(`${value}T12:00:00.000Z`);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value ? date : null;
}

function CalendarMark() {
  return <svg viewBox="0 0 24 24" width="22" height="22" fill="none" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="3" stroke="currentColor" strokeWidth="1.5" /><path d="M7 3v4m10-4v4M3 10h18m-14 5 3 3 6-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

export function LearningStreak({ compact = false }: { compact?: boolean }) {
  const { ready, accountId, status, error, streak, refresh } = useLearningHabits();
  if (compact) {
    if (!accountId) return null;
    if (status === "error" || status === "unavailable") return <Link href="/account#learning-streak" className={styles.compact}>Learning days unavailable</Link>;
    if (!ready || !streak) return <Link href="/account#learning-streak" className={styles.compact}>Learning days…</Link>;
    const todayStatus = streak.activeToday ? "Activity recorded today." : "No activity recorded today.";
    return <Link href="/account#learning-streak" className={styles.compact} data-testid="learning-streak-compact" aria-label={`${number.format(streak.currentDays)} ${streak.currentDays === 1 ? "day" : "days"} in a row. ${todayStatus} Open your learning days.`} title={todayStatus}><CalendarMark /><span><strong>{number.format(streak.currentDays)}</strong> {streak.currentDays === 1 ? "day" : "days"} in a row</span></Link>;
  }

  const days = streak?.recentDays.slice(-14) ?? [];
  const firstDate = days.length ? calendarDate(days[0].date) : null;
  const lastDate = days.length ? calendarDate(days[days.length - 1].date) : null;
  const lastActiveDate = streak?.lastActiveDate ? calendarDate(streak.lastActiveDate) : null;

  return <section id="learning-streak" aria-labelledby="learning-streak-title" className={`journal-panel ${styles.card}`} data-testid="learning-streak">
    <div className={styles.heading}><CalendarMark /><h2 id="learning-streak-title">Your learning streak</h2></div>
    {!accountId ? <p className={styles.copy}>Sign in to keep a record of your learning days. Days are recorded as you work through activities.</p>
      : status === "error" || status === "unavailable" ? <div className={styles.unavailable}><p role="status">{error ?? "Your learning days could not be loaded just now."}</p><button type="button" className={styles.secondary} onClick={() => { void refresh(); }}>Try again</button></div>
        : !ready || !streak ? <p role="status" className={styles.copy}>Opening your learning days…</p>
          : <>
            <dl className={styles.streakCounts}><div><dt>Current streak</dt><dd><strong>{number.format(streak.currentDays)}</strong> {streak.currentDays === 1 ? "day" : "days"}</dd></div><div><dt>Best streak</dt><dd><strong>{number.format(streak.longestDays)}</strong> {streak.longestDays === 1 ? "day" : "days"}</dd></div></dl>
            <p className={styles.todayState}>{streak.activeToday ? <><span aria-hidden="true">✓ </span>Activity recorded today.</> : "No activity recorded today."}</p>
            {error && <p className={styles.note} role="status">{error}</p>}
            {days.length > 0 && <div className={styles.calendar}>
              <p className={styles.calendarCaption}>{firstDate && lastDate ? `${shortDate.format(firstDate)} to ${shortDate.format(lastDate)}` : "Recent learning days"}</p>
              <ol aria-label="Recent learning days" className={styles.days}>{days.map(day => {
                const date = calendarDate(day.date);
                const today = day.date === streak.today;
                const label = `${date ? fullDate.format(date) : day.date}: ${day.active ? "activity recorded" : "no activity recorded"}${today ? ", today" : ""}`;
                return <li key={day.date} data-active={day.active} data-today={today}><time dateTime={day.date} aria-current={today ? "date" : undefined} aria-label={label} title={label}><span className={styles.weekday} aria-hidden="true">{date ? weekday.format(date) : ""}</span><span className={styles.dayNumber} aria-hidden="true">{date ? date.getUTCDate() : day.date}<span className={styles.dayMark}>{day.active ? "✓" : "·"}</span></span></time></li>;
              })}</ol>
              <p className={styles.legend}><span><span aria-hidden="true">✓ </span>Activity recorded</span><span><span aria-hidden="true">· </span>No recorded activity</span></p>
            </div>}
            <p className={styles.copy}>{lastActiveDate ? `Last recorded day: ${fullDate.format(lastActiveDate)}.` : "Your first recorded day will appear here."} <span className={styles.zone}>Time zone: {streak.timezone}.</span></p>
            <p className={styles.note}>Learning days are recorded as you go. Earlier saved progress does not add past dates.</p>
          </>}
  </section>;
}
