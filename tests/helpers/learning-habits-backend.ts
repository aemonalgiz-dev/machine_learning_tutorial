import type { Page } from "@playwright/test";
import type { LearningPreferences, LearningStreakSnapshot } from "../../lib/learning-habits";
import { FREE_MEMBERSHIP } from "../../lib/membership";
import { mockAccountBackend, type MockAccountBackend } from "./account-backend";

type AccountOptions = NonNullable<Parameters<typeof mockAccountBackend>[1]>;
type Activity = { eventId: string; kind: "quiz" | "code" | "workshop"; activityId: string; timezone?: string };
type PreferenceInput = Pick<LearningPreferences, "remindersEnabled" | "timezone" | "reminderHour">;
export interface HabitsOptions {
  account?: AccountOptions;
  preferences?: Partial<LearningPreferences>;
  today?: string;
  activeDates?: string[];
}

function offsetDay(day: string, offset: number) {
  const date = new Date(`${day}T12:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() + offset);
  return date.toISOString().slice(0, 10);
}

function accountState(options: HabitsOptions) {
  return {
    owner: options.account?.user ?? "habits-reader",
    today: options.today ?? "2026-10-30",
    activeDates: new Set(options.activeDates ?? []),
    preferences: { remindersEnabled: false, timezone: "UTC", timezoneSet: true, reminderHour: 18, emailVerified: true, deliveryAvailable: true, ...options.preferences } as LearningPreferences,
    activities: [] as Activity[],
    activityRequests: [] as Activity[],
    preferenceRequests: [] as PreferenceInput[],
    preferenceWrites: [] as PreferenceInput[],
    eventIds: new Set<string>(),
    getFailure: false,
    putFailure: false,
    activityFailure: false,
    delayStreak: null as Promise<void> | null,
    delayPut: null as Promise<void> | null,
  };
}

type AccountState = ReturnType<typeof accountState>;
function snapshot(state: AccountState): LearningStreakSnapshot {
  let current = 0;
  let cursor = state.activeDates.has(state.today) ? state.today : offsetDay(state.today, -1);
  while (state.activeDates.has(cursor)) { current++; cursor = offsetDay(cursor, -1); }
  let longest = 0, run = 0, previous: string | null = null;
  const dates = [...state.activeDates].sort();
  for (const date of dates) { run = previous && offsetDay(previous, 1) === date ? run + 1 : 1; longest = Math.max(longest, run); previous = date; }
  return { currentDays: current, longestDays: longest, activeToday: state.activeDates.has(state.today), today: state.today, lastActiveDate: dates.at(-1) ?? null, timezone: state.preferences.timezone, recentDays: Array.from({ length: 14 }, (_, index) => { const date = offsetDay(state.today, index - 13); return { date, active: state.activeDates.has(date) }; }) };
}

/** Account-owned test service. It never derives a learning day from seeded course progress. */
export async function mockLearningHabits(page: Page, options: HabitsOptions = {}) {
  let current = accountState(options);
  const allStates = [current];
  let accountBackend: MockAccountBackend | null = null;

  async function install(account: AccountOptions = {}) {
    const owner = current;
    accountBackend = await mockAccountBackend(page, { ...account, user: owner.owner });
    await page.route("**/account-api/session", route => route.fulfill({ json: { enabled: true, registrationEnabled: true, user: { id: owner.owner, name: owner.owner, email: `${owner.owner}@example.invalid` }, membership: account.membership ?? FREE_MEMBERSHIP } }));
    await page.route(/\/account-api\/(?:streak|activity|learning-preferences)(?:\?.*)?$/, async route => {
      const state = current;
      const request = route.request(), url = new URL(request.url());
      if (request.headers()["x-fitlab-account"] !== state.owner) return route.fulfill({ status: 409, json: { detail: "Account changed." } });
      if (request.method() === "GET") {
        if (url.pathname.endsWith("/streak") && state.delayStreak) await state.delayStreak;
        if (state.getFailure) return route.fulfill({ status: 503, json: { detail: "Your learning days could not be loaded right now." } });
        return route.fulfill({ json: url.pathname.endsWith("/streak") ? { account: state.owner, streak: snapshot(state) } : { account: state.owner, preferences: state.preferences } });
      }
      if (url.pathname.endsWith("/activity") && request.method() === "POST") {
        const body = request.postDataJSON() as Activity;
        state.activityRequests.push(structuredClone(body));
        if (state.activityFailure) return route.fulfill({ status: 503, json: { detail: "Activity could not be saved yet." } });
        if (!body.eventId || !["quiz", "code", "workshop"].includes(body.kind) || !body.activityId) return route.fulfill({ status: 400, json: { detail: "Invalid learning activity." } });
        if (!state.eventIds.has(body.eventId)) {
          state.eventIds.add(body.eventId);
          state.activities.push(structuredClone(body));
          state.activeDates.add(state.today);
          if (!state.preferences.timezoneSet && body.timezone) state.preferences = { ...state.preferences, timezone: body.timezone, timezoneSet: true };
        }
        return route.fulfill({ json: { account: state.owner, streak: snapshot(state) } });
      }
      if (url.pathname.endsWith("/learning-preferences") && request.method() === "PUT") {
        const body = request.postDataJSON() as PreferenceInput;
        state.preferenceRequests.push(structuredClone(body));
        if (state.delayPut) await state.delayPut;
        if (state.putFailure) return route.fulfill({ status: 503, json: { detail: "Your preferences could not be saved right now." } });
        try { new Intl.DateTimeFormat("en", { timeZone: body.timezone }); } catch { return route.fulfill({ status: 400, json: { detail: "Choose a recognised time zone." } }); }
        if (typeof body.remindersEnabled !== "boolean" || !Number.isInteger(body.reminderHour) || body.reminderHour < 0 || body.reminderHour > 23) return route.fulfill({ status: 400, json: { detail: "Invalid reminder settings." } });
        if (body.remindersEnabled && (!state.preferences.emailVerified || !state.preferences.deliveryAvailable)) return route.fulfill({ status: 503, json: { detail: "Email reminders are unavailable." } });
        state.preferenceWrites.push(structuredClone(body));
        state.preferences = { ...state.preferences, ...body, timezoneSet: true };
        return route.fulfill({ json: { account: state.owner, preferences: state.preferences } });
      }
      return route.fulfill({ status: 405, json: {} });
    });
  }

  await install(options.account);
  return {
    get state() { return current; },
    get account() { if (!accountBackend) throw Error("Install the account fixture first."); return accountBackend; },
    allStates,
    snapshot: () => snapshot(current),
    async switchAccount(next: HabitsOptions) {
      current = accountState(next); allStates.push(current);
      await install(next.account);
      return current;
    },
  };
}
