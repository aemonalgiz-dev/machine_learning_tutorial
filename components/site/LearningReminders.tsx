"use client";

import { useId, useState, type FormEvent } from "react";
import { useLearningHabits } from "@/lib/learning-habits";
import styles from "./LearningHabits.module.css";

type Habits = ReturnType<typeof useLearningHabits>;
type Preferences = NonNullable<Habits["preferences"]>;
type PreferenceInput = Parameters<Habits["savePreferences"]>[0];

function browserTimezone(fallback: string) {
  if (typeof window === "undefined") return fallback;
  try { return Intl.DateTimeFormat().resolvedOptions().timeZone || fallback; } catch { return fallback; }
}

function ReminderForm({ preferences, saving, onSave, onEdit }: { preferences: Preferences; saving: boolean; onSave: (input: PreferenceInput) => Promise<void>; onEdit: () => void }) {
  const id = useId();
  const [enabled, setEnabled] = useState(preferences.remindersEnabled);
  const [timezone, setTimezone] = useState(() => preferences.timezoneSet ? preferences.timezone : browserTimezone(preferences.timezone));
  const [hour, setHour] = useState(preferences.reminderHour);
  const canEnable = preferences.emailVerified && preferences.deliveryAvailable;
  const dirty = !preferences.timezoneSet || enabled !== preferences.remindersEnabled || timezone.trim() !== preferences.timezone || hour !== preferences.reminderHour;

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving || !dirty || (enabled && !canEnable)) return;
    await onSave({ remindersEnabled: enabled, timezone: timezone.trim(), reminderHour: hour });
  }

  return <form onSubmit={event => { void submit(event); }} className={styles.form}>
    <fieldset disabled={saving}>
      <legend className="sr-only">Learning reminder preferences</legend>
      <label className={styles.optIn} htmlFor={`${id}-enabled`}><input id={`${id}-enabled`} name="remindersEnabled" type="checkbox" checked={enabled} disabled={!canEnable && !enabled} onChange={event => { setEnabled(event.target.checked); onEdit(); }} /><span>Send me a learning reminder by email</span></label>
      {!preferences.deliveryAvailable && <p className={styles.note} role="status">Email reminders are not available yet. You can still choose your time zone or turn an existing reminder off.</p>}
      {!preferences.emailVerified && <p className={styles.note}>A verified account email is required to turn reminders on.</p>}
      <div className={styles.formFields}>
        <div><label htmlFor={`${id}-hour`}>Reminder hour <span className={styles.fieldAside}>(24-hour)</span></label><select id={`${id}-hour`} name="reminderHour" value={hour} onChange={event => { setHour(Number(event.target.value)); onEdit(); }}>{Array.from({ length: 24 }, (_, value) => <option key={value} value={value}>{String(value).padStart(2, "0")}:00</option>)}</select></div>
        <div className={styles.zoneField}><label htmlFor={`${id}-zone`}>Time zone</label><input id={`${id}-zone`} name="timezone" type="text" value={timezone} onChange={event => { setTimezone(event.target.value); onEdit(); }} required maxLength={64} autoComplete="off" spellCheck={false} list={`${id}-zones`} aria-describedby={`${id}-zone-help`} /><datalist id={`${id}-zones`}>{["UTC", "America/New_York", "America/Chicago", "America/Denver", "America/Los_Angeles", "Europe/London", "Europe/Berlin", "Asia/Kolkata", "Asia/Tokyo", "Australia/Sydney"].map(zone => <option key={zone} value={zone} />)}</datalist></div>
      </div>
      <p id={`${id}-zone-help`} className={styles.note}>Use a name such as America/Chicago or Europe/London.{!preferences.timezoneSet && " Your browser's time zone is filled in here. Save your preferences to apply this choice."} Your learning days and reminders both use this time zone.</p>
      <button type="submit" className={styles.primary} disabled={saving || !dirty || (enabled && !canEnable)}>{saving ? "Saving preferences…" : "Save preferences"}</button>
    </fieldset>
  </form>;
}

export function LearningReminders() {
  const { ready, accountId, status, error, preferences, saving, savePreferences, refresh } = useLearningHabits();
  const [notice, setNotice] = useState<{ owner: string; message: string; failed: boolean } | null>(null);
  const currentNotice = notice?.owner === accountId ? notice : null;

  async function save(input: PreferenceInput) {
    if (!accountId) return;
    const owner = accountId;
    try {
      const success = await savePreferences(input);
      setNotice({ owner, failed: !success, message: success ? "Your reminder preferences are saved." : "Your preferences could not be saved. Please try again." });
    } catch { setNotice({ owner, failed: true, message: "Your preferences could not be saved. Please try again." }); }
  }

  return <section id="learning-reminders" aria-labelledby="learning-reminders-title" className={`journal-panel ${styles.card}`} data-testid="learning-reminders">
    <div className={styles.heading}><h2 id="learning-reminders-title">Email reminders</h2></div>
    {!accountId ? <p className={styles.copy}>Sign in to choose optional learning reminders.</p>
      : (!ready || !preferences) && (status === "error" || status === "unavailable") ? <div className={styles.unavailable}><p role="status">{error ?? "Reminder preferences could not be loaded just now."}</p><button type="button" className={styles.secondary} onClick={() => { void refresh(); }}>Try again</button></div>
        : !ready || !preferences ? <p role="status" className={styles.copy}>Opening your reminder preferences…</p>
          : <>
            <p className={styles.copy}>{preferences.remindersEnabled ? preferences.emailVerified && preferences.deliveryAvailable ? "Email reminders are on. You can change the time or turn them off below." : "Your reminder setting is on, but email delivery is currently unavailable. You can turn the setting off below." : "Email reminders are off. If you want one, choose a time that suits you, turn reminders on and save."}</p>
            <p className={styles.note}>Reminders go out around your chosen hour, and only on days with no saved learning activity.</p>
            {(status === "error" || status === "unavailable") && <p className={styles.note} role="status">{error ?? "Your saved preferences could not be refreshed just now."}</p>}
            <ReminderForm key={JSON.stringify([accountId, preferences.remindersEnabled, preferences.timezone, preferences.reminderHour, preferences.emailVerified, preferences.timezoneSet, preferences.deliveryAvailable])} preferences={preferences} saving={saving} onSave={save} onEdit={() => setNotice(null)} />
            {currentNotice && <p className={styles.feedback} role={currentNotice.failed ? "alert" : "status"}>{currentNotice.failed ? error ?? currentNotice.message : currentNotice.message}</p>}
            <p className={styles.note}>Every reminder includes an unsubscribe link. You can also turn reminders off here.</p>
          </>}
  </section>;
}
