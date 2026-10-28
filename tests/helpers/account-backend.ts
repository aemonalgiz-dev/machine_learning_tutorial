import { expect, type Page } from "@playwright/test";
import type { SavedRecord } from "../../lib/learner-state";
import type { Progress } from "../../lib/progress";
import { FREE_MEMBERSHIP, type PracticeMembership } from "../../lib/membership";

interface BackendOptions {
  user?: string;
  records?: { key: string; value: unknown; revision?: number; mutationId?: string }[];
  progress?: Progress;
  membership?: PracticeMembership;
}
const backends = new WeakMap<Page, MockAccountBackend>();

/** A server-owned account snapshot, independent of browser storage and reloads. */
export async function mockAccountBackend(page: Page, options: BackendOptions = {}) {
  const state = {
    user: options.user ?? "workshop-reader",
    membership: structuredClone(options.membership ?? FREE_MEMBERSHIP),
    records: new Map<string, SavedRecord>(),
    progress: structuredClone(options.progress ?? { done: {}, required: {} }),
    uploads: [] as SavedRecord[],
  };
  function seed(key: string, value: unknown, revision = 1) {
    const record = { key, value: structuredClone(value), revision, mutationId: `fixture-${revision}-${key}` };
    state.records.set(key, record);
    return record;
  }
  for (const record of options.records ?? []) {
    seed(record.key, record.value, record.revision);
    if (record.mutationId) state.records.get(record.key)!.mutationId = record.mutationId;
  }
  await page.route("**/account-api/**", async route => {
    const request = route.request(), url = new URL(request.url());
    if (url.pathname.endsWith("/session")) return route.fulfill({ json: {
      enabled: true, registrationEnabled: true, user: { id: state.user, name: state.user, email: null }, membership: state.membership,
    } });
    if (request.headers()["x-fitlab-account"] !== state.user) return route.fulfill({ status: 409, json: {} });
    if (url.pathname.endsWith("/progress")) {
      if (request.method() === "PUT") {
        const sent = request.postDataJSON() as Progress;
        for (const [lesson, done] of Object.entries(sent.done)) state.progress.done[lesson] = [...new Set([...(state.progress.done[lesson] ?? []), ...done])];
        for (const [lesson, count] of Object.entries(sent.required)) state.progress.required[lesson] = Math.max(state.progress.required[lesson] ?? 0, count);
      }
      return route.fulfill({ json: state.progress });
    }
    if (url.pathname.endsWith("/learner-state")) {
      if (request.method() === "GET") {
        const after = url.searchParams.get("after"), limit = Number(url.searchParams.get("limit") ?? 128);
        const records = [...state.records.values()].sort((a, b) => a.key.localeCompare(b.key)).filter(record => !after || record.key.localeCompare(after) > 0);
        return route.fulfill({ json: { records: records.slice(0, limit), nextCursor: records.length > limit ? records[limit - 1].key : null } });
      }
      const sent = request.postDataJSON() as SavedRecord, previous = state.records.get(sent.key);
      if (sent.revision !== (previous?.revision ?? 0)) return route.fulfill({ status: 409, json: { current: previous } });
      const saved = { ...sent, revision: sent.revision + 1 };
      state.records.set(saved.key, structuredClone(saved)); state.uploads.push(structuredClone(saved));
      return route.fulfill({ json: saved });
    }
    return route.fulfill({ status: 404, json: {} });
  });
  const backend = {
    ...state,
    seed,
    value<T = Record<string, unknown>>(key: string) { return state.records.get(key)?.value as T | undefined; },
    find<T = Record<string, unknown>>(matches: (key: string) => boolean) { return [...state.records.values()].find(record => matches(record.key))?.value as T | undefined; },
    async waitForRecord(key: string | ((key: string) => boolean), accepts: (value: unknown) => boolean = () => true) {
      await expect.poll(() => [...state.records.values()].some(record => (typeof key === "string" ? key === record.key : key(record.key)) && accepts(record.value))).toBe(true);
    },
  };
  backends.set(page, backend);
  return backend;
}

export type MockAccountBackend = Awaited<ReturnType<typeof mockAccountBackend>>;

export function hasMockAccountBackend(page: Page): boolean {
  return backends.has(page);
}

export function accountBackendFor(page: Page): MockAccountBackend {
  const backend = backends.get(page);
  if (!backend) throw new Error("Install the mocked account backend before opening the page.");
  return backend;
}

export async function waitForAccountReady(page: Page) {
  await expect(page.getByTestId("account-sync")).toHaveAttribute("data-state-ready", "true");
  await expect(page.getByTestId("learning-restore-guard")).toHaveCount(0);
}

export async function waitForAccountSync(page: Page) {
  const status = page.getByTestId("account-sync");
  await waitForAccountReady(page);
  await expect(status).toHaveAttribute("data-sync-status", "saved");
}
